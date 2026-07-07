// =============================================================================
// daily-compliance-report aggregator — PURE / NO I/O.
//
// Same testing strategy as the fraud-sweep rules engine: this module has zero
// Deno / Supabase / fetch dependencies, so it can be exercised by `node --test`
// in CI without a Deno install.
//
// Aggregate shape:
//
//   ComplianceReport {
//     report_date:   'YYYY-MM-DD'              (UTC day the report covers)
//     kyc_pending:   number                    (members in kyc_status='pending')
//     kyc_approved:  number                    (members in kyc_status='approved')
//     kyc_rejected:  number                    (members in kyc_status='rejected')
//     new_accounts:  number                    (accounts opened on report_date)
//     deposit_total: number                    (sum of posted txns, txn_type='deposit')
//     withdrawal_total: number                 (sum of posted txns, txn_type='withdrawal')
//     aml_alerts:    AmlAlertSummary[]         (every aml_alert whose triggered_at is on report_date)
//   }
//
// All amounts are numeric strings (since numeric(20,4) can exceed Number's
// safe integer range) — the Edge Function caller passes them through as
// JSON strings and Postgres `numeric` columns accept strings natively.
// =============================================================================

/** Inputs are normalized row shapes that the Edge Function adapter produces. */
export interface MemberRow {
  id: string;
  kyc_status: string; // 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired'
  kyc_submitted_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
}

export interface AccountRow {
  id: string;
  opened_at: string; // ISO timestamp
}

export interface TxnRow {
  id: string;
  txn_type: string; // 'deposit' | 'withdrawal' | ...
  status: string; // 'pending' | 'posted' | ...
  amount: string | number;
  posted_at: string | null;
  created_at: string;
}

export interface AmlAlertRow {
  id: string;
  member_id: string;
  rule_name: string;
  severity: string;
  status: string;
  triggered_at: string;
}

export interface AmlAlertSummary {
  id: string;
  member_id: string;
  rule_name: string;
  severity: string;
  status: string;
  triggered_at: string;
}

export interface ComplianceReport {
  report_date: string;
  kyc_pending: number;
  kyc_approved: number;
  kyc_rejected: number;
  new_accounts: number;
  deposit_total: string;
  withdrawal_total: string;
  aml_alerts: AmlAlertSummary[];
}

/** Normalize a Date to its UTC midnight ISO date string (YYYY-MM-DD). */
export function isoDateUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns the ISO date string a timestamp falls on (UTC midnight epoch). */
export function dateOfIso(iso: string, anchor: string | null = null): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return anchor ?? "";
  return isoDateUtc(new Date(t));
}

/**
 * Parse a numeric value that may already be a number, a string, or null.
 * Returns 0 for unparseable / null inputs. Output is a string so the caller
 * can preserve precision when sending to JSON / Postgres `numeric`.
 */
export function n(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  const s = typeof value === "string" ? value : String(value);
  // numeric(20,4) gives up to 4 decimal places; truncate extras safely.
  if (!/^-?\d+(\.\d+)?$/.test(s.trim())) return "0";
  return s.trim();
}

/** Adds two numeric strings without losing precision (works for any scale). */
export function nadd(a: string, b: string): string {
  // string-based addition: align on decimal, pad, and add columnwise.
  const parse = (s: string) => {
    const [int = "0", frac = ""] = s.split(".");
    return { sign: int.startsWith("-") ? -1 : 1, int: int.replace(/^-/, ""), frac };
  };
  const A = parse(a);
  const B = parse(b);
  const fracLen = Math.max(A.frac.length, B.frac.length);
  const ai = A.int.padStart(1, "0");
  const bi = B.int.padStart(1, "0");
  const af = A.frac.padEnd(fracLen, "0");
  const bf = B.frac.padEnd(fracLen, "0");
  const aDigits = (ai + af).split("").map((d) => parseInt(d, 10));
  const bDigits = (bi + bf).split("").map((d) => parseInt(d, 10));
  let carry = 0;
  const result: number[] = [];
  for (let i = aDigits.length - 1; i >= 0; i--) {
    const s = aDigits[i] + bDigits[i] + carry;
    result.unshift(s % 10);
    carry = Math.floor(s / 10);
  }
  if (carry) result.unshift(carry);
  const sign = A.sign * B.sign;
  // Implementation note: simple approach — both operands are positive numeric
  // strings (which is true for deposit/withdrawal totals in this project).
  if (sign < 0) throw new Error("nadd does not yet support negative values");
  let out = result.join("").replace(/^0+(?=\d)/, "");
  if (fracLen > 0) {
    out = out.slice(0, out.length - fracLen) + "." +
      out.slice(out.length - fracLen).replace(/0+$/, "");
    if (out.endsWith(".")) out = out.slice(0, -1);
  }
  return out || "0";
}

/**
 * Build the compliance report from already-loaded DB rows for the given UTC
 * report date. The `report_date` argument is a YYYY-MM-DD string. If omitted,
 * defaults to today's UTC date.
 */
export function buildComplianceReport(
  input: {
    members: readonly MemberRow[];
    accounts: readonly AccountRow[];
    transactions: readonly TxnRow[];
    aml_alerts: readonly AmlAlertRow[];
    report_date?: string;
    /** Override for "today UTC"; useful in tests. */
    now?: Date;
  },
): ComplianceReport {
  const now = input.now ?? new Date();
  const report_date = input.report_date ?? isoDateUtc(now);

  let kyc_pending = 0;
  let kyc_approved = 0;
  let kyc_rejected = 0;
  for (const m of input.members) {
    switch ((m.kyc_status || "").toLowerCase()) {
      case "pending":
        kyc_pending++;
        break;
      case "approved":
        kyc_approved++;
        break;
      case "rejected":
        kyc_rejected++;
        break;
      default:
        // 'in_review', 'expired' are not bucketed here — see audit spec.
        break;
    }
  }

  let new_accounts = 0;
  for (const a of input.accounts) {
    if (dateOfIso(a.opened_at) === report_date) new_accounts++;
  }

  let deposit_total = "0";
  let withdrawal_total = "0";
  for (const t of input.transactions) {
    const posted = t.posted_at ?? t.created_at;
    if (dateOfIso(posted) !== report_date) continue;
    const status = (t.status || "").toLowerCase();
    if (status !== "posted") continue;
    const type = (t.txn_type || "").toLowerCase();
    if (type === "deposit") deposit_total = nadd(deposit_total, n(t.amount));
    else if (type === "withdrawal") withdrawal_total = nadd(withdrawal_total, n(t.amount));
  }

  const aml_alerts: AmlAlertSummary[] = [];
  for (const a of input.aml_alerts) {
    if (dateOfIso(a.triggered_at) !== report_date) continue;
    aml_alerts.push({
      id: a.id,
      member_id: a.member_id,
      rule_name: a.rule_name,
      severity: a.severity,
      status: a.status,
      triggered_at: a.triggered_at,
    });
  }

  return {
    report_date,
    kyc_pending,
    kyc_approved,
    kyc_rejected,
    new_accounts,
    deposit_total,
    withdrawal_total,
    aml_alerts,
  };
}
