// =============================================================================
// fraud-sweep rules engine — PURE / NO I/O.
//
// This module is intentionally dependency-free (no Deno, no Supabase, no fetch)
// so it can be unit-tested with plain `node --test` (run by `node --test`)
// AND re-used inside the Supabase Edge Function runtime via Deno.
//
// The engine consumes a normalized `TransactionLite` shape and returns zero or
// more `RuleMatch` objects. Each match becomes one `fraud_alerts` row.
//
// Rules (hard-coded, USD-equivalent for v1; per-currency thresholds can be
// added later by accepting a per-currency rule set):
//
//   - high_velocity:  > $10,000 in *amount total* across a single member in
//                     1 hour. Fires once per *window* with the latest tx in
//                     the window as the triggering txn_id.   risk_score = 80
//
//   - large_amount:   a single transaction > $25,000.        risk_score = 90
//
//   - off_hours:      tx between 02:00–05:00 UTC and > $5,000. risk_score = 60
//
//   - structuring:    5+ transactions in 1 hour each UNDER $1,000
//                     to 5+ DIFFERENT counterparties.         risk_score = 50
//
// amount is a JS number; numeric(20,4) from Postgres is representable up
// to ~2^53 cents with 4-decimal precision — sufficient for these thresholds.
// Swap to a decimal library if you wire this up to a different precision model.
// =============================================================================

/**
 * @typedef {Object} TransactionLite
 * @property {string}  id
 * @property {string}  member_id            member id (resolved at the adapter layer)
 * @property {number}  amount
 * @property {string}  currency
 * @property {string}  created_at           ISO-8601 UTC timestamp
 * @property {string}  status
 * @property {string|null} [counterparty_account_id]
 */

/**
 * @typedef {"high_velocity" | "large_amount" | "off_hours" | "structuring"} RuleReason
 */

/**
 * @typedef {Object} RuleMatch
 * @property {string}     transaction_id
 * @property {string}     member_id
 * @property {number}     risk_score
 * @property {RuleReason} reason
 */

/**
 * @typedef {Object} RuleThresholds
 * @property {number} velocityTotalUsd
 * @property {number} largeAmountUsd
 * @property {number} offHoursAmountUsd
 * @property {number} structuringCount
 * @property {number} structuringMaxUsd
 * @property {number} offHoursStartUtc
 * @property {number} offHoursEndUtc
 */

/** @type {RuleThresholds} */
export const DEFAULT_THRESHOLDS = Object.freeze({
  velocityTotalUsd: 10_000,
  largeAmountUsd: 25_000,
  offHoursAmountUsd: 5_000,
  structuringCount: 5,
  structuringMaxUsd: 1_000,
  offHoursStartUtc: 2, // 02:00 UTC inclusive
  offHoursEndUtc: 5, // 05:00 UTC exclusive
});

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

/** @param {string} iso */
function toMillis(iso) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/**
 * @param {TransactionLite} t
 * @returns {boolean}
 */
function isUsdLike(t) {
  const c = (t.currency || "USD").toUpperCase();
  return c === "USD" || c === "" || c === "US$";
}

/** @param {string} iso */
function utcHourOfDay(iso) {
  return new Date(iso).getUTCHours();
}

/** @param {string} status */
function isInactiveOrReversed(status) {
  const s = (status || "").toLowerCase();
  return s === "reversed" || s === "failed" || s === "cancelled";
}

// -----------------------------------------------------------------------------
// rule evaluators (each one is pure)
// -----------------------------------------------------------------------------

/**
 * Rule: a single transaction is over the "large amount" threshold.
 * @param {TransactionLite} tx
 * @param {RuleThresholds} [thresholds]
 * @returns {RuleMatch | null}
 */
export function rule_largeAmount(tx, thresholds = DEFAULT_THRESHOLDS) {
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
 * @param {TransactionLite} tx
 * @param {RuleThresholds} [thresholds]
 * @returns {RuleMatch | null}
 */
export function rule_offHours(tx, thresholds = DEFAULT_THRESHOLDS) {
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
 * `windowMs` defaults to 1 hour; tests can override.
 *
 * @param {TransactionLite} tx
 * @param {readonly TransactionLite[]} allTx
 * @param {RuleThresholds} [thresholds]
 * @param {number} [windowMs]
 * @returns {RuleMatch | null}
 */
export function rule_highVelocity(
  tx,
  allTx,
  thresholds = DEFAULT_THRESHOLDS,
  windowMs = 60 * 60 * 1000,
) {
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
 * DIFFERENT counterparty.
 *
 * @param {TransactionLite} tx
 * @param {readonly TransactionLite[]} allTx
 * @param {RuleThresholds} [thresholds]
 * @param {number} [windowMs]
 * @returns {RuleMatch | null}
 */
export function rule_structuring(
  tx,
  allTx,
  thresholds = DEFAULT_THRESHOLDS,
  windowMs = 60 * 60 * 1000,
) {
  if (!isUsdLike(tx)) return null;
  if (isInactiveOrReversed(tx.status)) return null;
  if (!tx.counterparty_account_id) return null;
  const txMs = toMillis(tx.created_at);
  if (txMs === 0) return null;
  const lower = txMs - windowMs;
  const counterparties = new Set();
  for (const other of allTx) {
    if (other.member_id !== tx.member_id) continue;
    if (isInactiveOrReversed(other.status)) continue;
    if (!isUsdLike(other)) continue;
    if (!other.counterparty_account_id) continue;
    if ((other.amount || 0) >= thresholds.structuringMaxUsd) continue;
    const otherMs = toMillis(other.created_at);
    if (otherMs === 0) continue;
    if (otherMs < lower || otherMs > txMs) continue;
    counterparties.add(other.counterparty_account_id);
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
 * `RuleMatch` per unique (transaction_id, reason) tuple — duplicates
 * collapsed deterministically. Dedup keeps the fraud_alerts table from
 * blowing up when a transaction trips multiple thresholds simultaneously.
 *
 * @param {readonly TransactionLite[]} txs
 * @param {RuleThresholds} [thresholds]
 * @param {Date} [now]
 * @returns {RuleMatch[]}
 */
export function evaluateTransactions(
  txs,
  thresholds = DEFAULT_THRESHOLDS,
  now = new Date(),
) {
  const out = [];
  const seen = new Set();
  const sorted = [...txs].sort(
    (a, b) => toMillis(a.created_at) - toMillis(b.created_at),
  );
  for (const tx of sorted) {
    const r1 = rule_largeAmount(tx, thresholds);
    if (r1) pushUnique(out, seen, r1);
    const r2 = rule_offHours(tx, thresholds);
    if (r2) pushUnique(out, seen, r2);
    const r3 = rule_highVelocity(tx, sorted, thresholds);
    if (r3) pushUnique(out, seen, r3);
    const r4 = rule_structuring(tx, sorted, thresholds);
    if (r4) pushUnique(out, seen, r4);
  }
  // `now` is referenced so future rules can use it without touching the signature.
  void now;
  return out;
}

/**
 * @param {RuleMatch[]} out
 * @param {Set<string>} seen
 * @param {RuleMatch} m
 */
function pushUnique(out, seen, m) {
  const key = `${m.transaction_id}|${m.reason}`;
  if (seen.has(key)) return;
  seen.add(key);
  out.push(m);
}
