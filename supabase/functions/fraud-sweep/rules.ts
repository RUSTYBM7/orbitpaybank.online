// =============================================================================
// fraud-sweep rules engine — PURE / NO I/O.
//
// This module is intentionally dependency-free (no Deno, no Supabase, no fetch)
// so it can be unit-tested with plain `node:test` (run by `node --test`) AND
// re-used inside the Supabase Edge Function runtime via Deno's TS compiler.
//
// The engine consumes a normalized `TransactionLite` shape and returns zero or
// more `RuleMatch` objects. Each match becomes one `fraud_alerts` row.
//
// Rules (hard-coded, all USD-denominated for v1; per-currency thresholds can
// be added later by accepting a per-currency rule set):
//
//   - high_velocity:  > $10,000 in *amount total* across a single member in
//                     1 hour. Fires once per *window* with the latest tx in the
//                     window as the triggering txn_id.        risk_score = 80
//
//   - large_amount:   a single transaction > $25,000.         risk_score = 90
//
//   - off_hours:      tx between 02:00–05:00 UTC and > $5,000. risk_score = 60
//
//   - structuring:    5+ transactions in 1 hour each UNDER $1,000
//                     to 5+ DIFFERENT counterparties.         risk_score = 50
//
// amount is a JS number for simplicity; the Supabase source numeric(20,4)
// is representable as a floating-point Number up to ~2^53 with 4-decimal
// precision — sufficient for these thresholds. If you wire this up to a
// different precision model, swap `toAmount` to a decimal library.
// =============================================================================

/** Normalized transaction shape consumed by the rule engine. */
export interface TransactionLite {
  id: string;
  /** member id (NOT auth user id) — we resolve this in the adapter layer. */
  member_id: string;
  amount: number;
  currency: string;
  created_at: string; // ISO-8601 UTC, e.g. 2025-01-15T03:21:00.000Z
  status: string;
  /** Counterparty account id, if known. Null on deposits / withdrawals. */
  counterparty_account_id?: string | null;
}

/** A single rule hit, ready to be INSERTed into fraud_alerts. */
export interface RuleMatch {
  transaction_id: string;
  member_id: string;
  risk_score: number;
  reason:
    | "high_velocity"
    | "large_amount"
    | "off_hours"
    | "structuring";
}

/** Rule thresholds. Exported so tests can override them. */
export interface RuleThresholds {
  /** USD-equivalent threshold for high_velocity rule (sum over a 1h window). */
  velocityTotalUsd: number;
  /** USD-equivalent threshold for large_amount rule. */
  largeAmountUsd: number;
  /** USD-equivalent threshold for off_hours rule (single tx). */
  offHoursAmountUsd: number;
  /** Number of small txns in a 1h window to different counterparties. */
  structuringCount: number;
  /** Each individual tx in the structuring rule must be below this. */
  structuringMaxUsd: number;
  /** Off-hours begin UTC (inclusive). */
  offHoursStartUtc: number;
  /** Off-hours end UTC (exclusive). */
  offHoursEndUtc: number;
}

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  velocityTotalUsd: 10_000,
  largeAmountUsd: 25_000,
  offHoursAmountUsd: 5_000,
  structuringCount: 5,
  structuringMaxUsd: 1_000,
  offHoursStartUtc: 2, // 02:00 UTC inclusive
  offHoursEndUtc: 5, // 05:00 UTC exclusive
};

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

function toMillis(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function isUsdLike(t: TransactionLite): boolean {
  // Treat USD and unspecified as "USD-equivalent". If you add multi-currency
  // support, replace this with an FX conversion table.
  const c = (t.currency || "USD").toUpperCase();
  return c === "USD" || c === "" || c === "US$";
}

function utcHourOfDay(iso: string): number {
  return new Date(iso).getUTCHours();
}

function isInactiveOrReversed(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "reversed" || s === "failed" || s === "cancelled";
}

// -----------------------------------------------------------------------------
// rule evaluators (each one is pure)
// -----------------------------------------------------------------------------

/**
 * Rule: a single transaction is over the "large amount" threshold.
 */
export function rule_largeAmount(
  tx: TransactionLite,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
): RuleMatch | null {
  if (!isUsdLike(tx)) return null;
  if (isInactiveOrReversed(tx.status)) return null;
  if (tx.amount > thresholds.largeAmountUsd) {
    return {
      transaction_id: tx.id,
      member_id: tx.member_id,
      risk_score: 90,
      reason: "large_amount",
    };
  }
  return null;
}

/**
 * Rule: a transaction occurred during off-hours (02:00–05:00 UTC) and is
 * over the off-hours amount threshold.
 */
export function rule_offHours(
  tx: TransactionLite,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
): RuleMatch | null {
  if (!isUsdLike(tx)) return null;
  if (isInactiveOrReversed(tx.status)) return null;
  if (tx.amount <= thresholds.offHoursAmountUsd) return null;
  const h = utcHourOfDay(tx.created_at);
  if (h >= thresholds.offHoursStartUtc && h < thresholds.offHoursEndUtc) {
    return {
      transaction_id: tx.id,
      member_id: tx.member_id,
      risk_score: 60,
      reason: "off_hours",
    };
  }
  return null;
}

/**
 * Rule: the rolling 60-minute spend total for a single member (ending at `tx`)
 * is over the velocity threshold. Returns ONE match per transaction that
 * closes a violating window.
 *
 * For deterministic test behaviour we expose `windowMs` (default 60 min).
 */
export function rule_highVelocity(
  tx: TransactionLite,
  allTx: readonly TransactionLite[],
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  windowMs: number = 60 * 60 * 1000,
): RuleMatch | null {
  if (!isUsdLike(tx)) return null;
  if (isInactiveOrReversed(tx.status)) return null;
  const txMs = toMillis(tx.created_at);
  if (txMs === 0) return null;
  const lower = txMs - windowMs;
  let total = 0;
  for (const other of allTx) {
    if (other.member_id !== tx.member_id) continue;
    if (isInactiveOrReversed(other.status)) continue;
    if (!isUsdLike(other)) continue;
    const otherMs = toMillis(other.created_at);
    if (otherMs === 0) continue;
    if (otherMs < lower || otherMs > txMs) continue;
    total += Number(other.amount) || 0;
  }
  if (total > thresholds.velocityTotalUsd) {
    return {
      transaction_id: tx.id,
      member_id: tx.member_id,
      risk_score: 80,
      reason: "high_velocity",
    };
  }
  return null;
}

/**
 * Rule: structuring. The newest `tx` closes a 1h window containing
 * `count` small (under structuringMaxUsd) transactions, each sent to a
 * different counterparty.
 */
export function rule_structuring(
  tx: TransactionLite,
  allTx: readonly TransactionLite[],
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  windowMs: number = 60 * 60 * 1000,
): RuleMatch | null {
  if (!isUsdLike(tx)) return null;
  if (isInactiveOrReversed(tx.status)) return null;
  if ((tx.counterparty_account_id ?? "") === "") return null;
  const txMs = toMillis(tx.created_at);
  if (txMs === 0) return null;
  const lower = txMs - windowMs;
  const counterparties = new Set<string>();
  for (const other of allTx) {
    if (other.member_id !== tx.member_id) continue;
    if (isInactiveOrReversed(other.status)) continue;
    if (!isUsdLike(other)) continue;
    if ((other.counterparty_account_id ?? "") === "") continue;
    if ((other.amount || 0) >= thresholds.structuringMaxUsd) continue;
    const otherMs = toMillis(other.created_at);
    if (otherMs === 0) continue;
    if (otherMs < lower || otherMs > txMs) continue;
    counterparties.add(other.counterparty_account_id as string);
  }
  if (counterparties.size >= thresholds.structuringCount) {
    return {
      transaction_id: tx.id,
      member_id: tx.member_id,
      risk_score: 50,
      reason: "structuring",
    };
  }
  return null;
}

// -----------------------------------------------------------------------------
// public entry point
// -----------------------------------------------------------------------------

/**
 * Evaluate all enabled rules over the supplied transactions and return one
 * `RuleMatch` per unique (transaction_id, reason) tuple — duplicates collapsed
 * deterministically. Dedup keeps the fraud_alerts table from blowing up when a
 * transaction trips multiple thresholds simultaneously.
 *
 * @param txs the recent transactions (typically the lookback window).
 * @param thresholds optional override; defaults to `DEFAULT_THRESHOLDS`.
 */
export function evaluateTransactions(
  txs: readonly TransactionLite[],
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS,
  now: Date = new Date(),
): RuleMatch[] {
  const out: RuleMatch[] = [];
  const seen = new Set<string>();
  const sorted = [...txs].sort(
    (a, b) => toMillis(a.created_at) - toMillis(b.created_at),
  );
  for (const tx of sorted) {
    // 1) per-tx rules
    for (const r of [
      rule_largeAmount(tx, thresholds),
      rule_offHours(tx, thresholds),
    ]) {
      if (r) pushUnique(out, seen, r);
    }
    // 2) windowed rules
    for (const r of [
      rule_highVelocity(tx, sorted, thresholds),
      rule_structuring(tx, sorted, thresholds),
    ]) {
      if (r) pushUnique(out, seen, r);
    }
  }
  // Reference `now` so the rules can be extended to time-based decay later
  // without re-touching this signature.
  void now;
  return out;
}

function pushUnique(out: RuleMatch[], seen: Set<string>, m: RuleMatch): void {
  const key = `${m.transaction_id}|${m.reason}`;
  if (seen.has(key)) return;
  seen.add(key);
  out.push(m);
}
