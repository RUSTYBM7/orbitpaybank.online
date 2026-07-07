// =============================================================================
// daily-compliance-report Supabase Edge Function
//
// Runs nightly to produce a one-row summary of yesterday's activity and
// stores it in `compliance_reports`. Returns the persisted row so callers
// (including the cron scheduler) can verify success.
//
// HTTP contract:
//
//   POST /functions/v1/daily-compliance-report
//   body: {}                                // defaults to "today UTC"
//   body: { report_date: "2025-01-15" }    // explicit UTC date
//
// Response: full ComplianceReport JSON (same shape as the persisted row).
//
// Required env:
//   SUPABASE_URL          — project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role JWT
//
// Deploy:
//   supabase functions deploy daily-compliance-report --project-ref <ref>
// Schedule:
//   supabase functions schedule create daily-compliance-report "0 2 * * *"
// Invoke once:
//   curl -X POST https://<ref>.supabase.co/functions/v1/daily-compliance-report \
//     -H "Authorization: Bearer <service_role_key>" \
//     -H "Content-Type: application/json" \
//     -d '{}'
// =============================================================================

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildComplianceReport,
  ComplianceReport,
  isoDateUtc,
} from "./aggregator.ts";

function getClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url) throw new Error("SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function loadRowsForDate(
  client: SupabaseClient,
  report_date: string,
): Promise<Parameters<typeof buildComplianceReport>[0]> {
  // Compose UTC bounds for the report day.
  const start = `${report_date}T00:00:00.000Z`;
  // Next-day midnight minus 1 ms — inclusive of every timestamp in the day.
  const next = new Date(Date.parse(start) + 24 * 60 * 60 * 1000 - 1).toISOString();

  const [
    membersRes,
    accountsRes,
    txnsRes,
    alertsRes,
  ] = await Promise.all([
    client.from("members").select("id,kyc_status,kyc_submitted_at,created_at")
      .is("deleted_at", null),
    client.from("accounts").select("id,opened_at")
      .gte("opened_at", start)
      .lte("opened_at", next)
      .is("deleted_at", null),
    client.from("transactions").select("id,txn_type,status,amount,posted_at,created_at")
      .gte("posted_at", start)
      .lte("posted_at", next),
    client.from("aml_alerts").select(
      "id,member_id,rule_name,severity,status,triggered_at",
    )
      .gte("triggered_at", start)
      .lte("triggered_at", next),
  ]);

  if (membersRes.error) throw new Error(`members: ${membersRes.error.message}`);
  if (accountsRes.error) throw new Error(`accounts: ${accountsRes.error.message}`);
  if (txnsRes.error) throw new Error(`txns: ${txnsRes.error.message}`);
  if (alertsRes.error) throw new Error(`aml_alerts: ${alertsRes.error.message}`);

  return {
    members: membersRes.data ?? [],
    accounts: accountsRes.data ?? [],
    transactions: txnsRes.data ?? [],
    aml_alerts: alertsRes.data ?? [],
    report_date,
  };
}

async function persistReport(
  client: SupabaseClient,
  report: ComplianceReport,
): Promise<ComplianceReport> {
  const row = {
    report_date: report.report_date,
    kyc_pending: report.kyc_pending,
    kyc_approved: report.kyc_approved,
    kyc_rejected: report.kyc_rejected,
    new_accounts: report.new_accounts,
    deposit_total: report.deposit_total,
    withdrawal_total: report.withdrawal_total,
    aml_alerts: report.aml_alerts,
  };

  // Upsert so re-running the cron for the same day updates rather than
  // appends duplicate rows. The `report_date` column is unique.
  const { error } = await client
    .from("compliance_reports")
    .upsert(row, { onConflict: "report_date" });
  if (error) throw new Error(`compliance_reports upsert failed: ${error.message}`);
  return report;
}

async function writeAuditLog(
  client: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await client.from("audit_logs").insert({
    actor_role: "system:daily-compliance-report",
    action: "compliance_report.run",
    resource_type: "compliance_reports",
    after: payload,
    user_agent: "supabase-edge-function/daily-compliance-report",
  });
  if (error) throw new Error(`audit_logs insert failed: ${error.message}`);
}

interface RequestBody {
  report_date?: string;
}

async function readBody(req: Request): Promise<RequestBody> {
  if (req.method !== "POST") return {};
  const text = await req.text();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed as RequestBody;
  } catch (_) { /* ignore */ }
  return {};
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const body = await readBody(req);
  const report_date = typeof body.report_date === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(body.report_date)
    ? body.report_date
    : isoDateUtc(new Date());

  try {
    const client = getClient();
    const rows = await loadRowsForDate(client, report_date);
    const report = buildComplianceReport(rows, /* report_date */ report_date);
    const persisted = await persistReport(client, report);
    await writeAuditLog(client, persisted);

    return new Response(
      JSON.stringify(persisted),
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
