// =============================================================================
// fraud-sweep Supabase Edge Function
//
// Scans recent transactions for fraud signals and writes fraud_alerts rows
// for every rule match. Also writes an audit_logs entry summarizing the run.
//
// HTTP contract:
//
//   POST /functions/v1/fraud-sweep
//   body: {}                            // default lookback 60 min
//   body: { lookbackMinutes: 120 }      // custom lookback
//   body: { lookbackMinutes: 30, threshold: 0.85 }   // unused for now
//
// Response:
//   { scanned, matches, alertsCreated, ruleHits: Record<reason, count> }
//
// Required env:
//   SUPABASE_URL          — project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role JWT (used to insert + read RLS-
//                              protected rows; never expose this to the client)
//
// Deploy:
//   supabase functions deploy fraud-sweep --project-ref <ref>
// Invoke:
//   curl -X POST https://<ref>.supabase.co/functions/v1/fraud-sweep \
//     -H "Authorization: Bearer <service_role_key>" \
//     -H "Content-Type: application/json" \
//     -d '{}'
// =============================================================================

// Deno-resolved @supabase/supabase-js v2 client (declared in deno.json).
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  evaluateTransactions,
  RuleMatch,
  TransactionLite,
} from "./rules.ts";

// -----------------------------------------------------------------------------
// Supabase client
// -----------------------------------------------------------------------------

function getClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url) throw new Error("SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// -----------------------------------------------------------------------------
// DB → TransactionLite adapter
// -----------------------------------------------------------------------------

interface TxnRow {
  id: string;
  initiated_by: string | null;
  amount: number | string;
  currency: string;
  created_at: string;
  status: string;
  metadata: Record<string, unknown> | null;
}

interface MemberRow {
  id: string;
  user_id: string;
}

/**
 * Convert a raw transactions row + the cached members table into the
 * normalized shape consumed by the pure rule engine.
 *
 * Note: the existing transactions table has no `from_account_id` /
 * `to_account_id` column; counterparty is read from `metadata.cp_id`
 * when present (we never fail the sweep if it's absent).
 */
async function loadRecentTransactions(
  client: SupabaseClient,
  lookbackMinutes: number,
): Promise<TransactionLite[]> {
  const cutoff = new Date(Date.now() - lookbackMinutes * 60_000).toISOString();

  const [{ data: txns, error: txnErr }, { data: members, error: memErr }] =
    await Promise.all([
      client
        .from("transactions")
        .select("id,initiated_by,amount,currency,status,created_at,metadata")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: true })
        .limit(5000),
      client.from("members").select("id,user_id").limit(10000),
    ]);

  if (txnErr) throw new Error(`txn query failed: ${txnErr.message}`);
  if (memErr) throw new Error(`members query failed: ${memErr.message}`);

  // Map user_id → member_id so the rule engine can group per-member.
  const memberIndex = new Map<string, string>();
  for (const m of (members ?? []) as MemberRow[]) {
    memberIndex.set(m.user_id, m.id);
  }

  const out: TransactionLite[] = [];
  for (const r of (txns ?? []) as TxnRow[]) {
    if (!r.initiated_by) continue;
    const member_id = memberIndex.get(r.initiated_by);
    if (!member_id) continue; // tx from a non-member (e.g. admin seeded)
    out.push({
      id: r.id,
      member_id,
      amount: typeof r.amount === "string" ? Number(r.amount) : r.amount,
      currency: r.currency,
      created_at: r.created_at,
      status: r.status,
      counterparty_account_id: extractCp(r.metadata),
    });
  }
  return out;
}

function extractCp(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;
  const v = (meta as Record<string, unknown>).cp_id ??
    (meta as Record<string, unknown>).counterparty_account_id ?? null;
  return typeof v === "string" ? v : null;
}

// -----------------------------------------------------------------------------
// persistence
// -----------------------------------------------------------------------------

async function insertAlerts(
  client: SupabaseClient,
  matches: readonly RuleMatch[],
): Promise<number> {
  if (matches.length === 0) return 0;
  const rows = matches.map((m) => ({
    transaction_id: m.transaction_id,
    member_id: m.member_id,
    risk_score: m.risk_score,
    reason: m.reason,
    status: "open",
  }));
  // Upsert against the unique (transaction_id, reason) pair is not in the
  // schema today; we therefore ignore duplicate-key errors to make the function
  // idempotent across re-runs within a single lookback window.
  const { error, data } = await client
    .from("fraud_alerts")
    .insert(rows, { count: "exact" })
    .select("id");
  if (error) {
    if (/duplicate key/i.test(error.message)) return data?.length ?? 0;
    throw new Error(`fraud_alerts insert failed: ${error.message}`);
  }
  return data?.length ?? 0;
}

async function writeAuditLog(
  client: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await client.from("audit_logs").insert({
    actor_role: "system:fraud-sweep",
    action: "fraud_sweep.run",
    resource_type: "fraud_alerts",
    after: payload,
    user_agent: "supabase-edge-function/fraud-sweep",
  });
  if (error) throw new Error(`audit_logs insert failed: ${error.message}`);
}

// -----------------------------------------------------------------------------
// HTTP handler
// -----------------------------------------------------------------------------

interface RequestBody {
  lookbackMinutes?: number;
  threshold?: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

async function readBody(req: Request): Promise<RequestBody> {
  if (req.method !== "POST") return {};
  const text = await req.text();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed as RequestBody;
  } catch (_) {
    // ignore — defaults will apply
  }
  return {};
}

Deno.serve(async (req) => {
  // CORS preflight support — useful for manual browser invocation.
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const body = await readBody(req);
  const lookbackMinutes = isFiniteNumber(body.lookbackMinutes)
    ? Math.min(Math.max(1, Math.floor(body.lookbackMinutes)), 24 * 60)
    : 60;

  try {
    const client = getClient();
    const txs = await loadRecentTransactions(client, lookbackMinutes);
    const matches = evaluateTransactions(txs);

    const alertsCreated = await insertAlerts(client, matches);

    // Count hits per reason for observability.
    const ruleHits: Record<string, number> = {
      high_velocity: 0,
      large_amount: 0,
      off_hours: 0,
      structuring: 0,
    };
    for (const m of matches) ruleHits[m.reason]++;

    await writeAuditLog(client, {
      lookbackMinutes,
      scanned: txs.length,
      matches: matches.length,
      alertsCreated,
      ruleHits,
    });

    return new Response(
      JSON.stringify({
        scanned: txs.length,
        matches: matches.length,
        alertsCreated,
        ruleHits,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders() },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders() },
      },
    );
  }
});

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };
}
