# Track D — Admin Portal Integration Audit

## D.1 — Page Inventory

Every page in `/workspace/myonlinebank/admin-portal/src/pages/` evaluated for whether it
renders real Supabase-backed data or is a UI shell wired to missing modules.

Legend: **WIRED** = real data path · **SHELL** = imports missing module → renders nothing useful · **PARTIAL** = uses store data (in-memory mock).

| Page | Verdict | Imports broken? | Evidence |
|------|---------|-----------------|----------|
| Dashboard.tsx | **SHELL** | `@/lib/api-live` missing | Dashboard.tsx:1 |
| Members.tsx | **PARTIAL** | none directly | uses `useAdminStore.fetchMembers` (adminStore → `@/lib/api` missing) |
| Accounts.tsx | **SHELL** | `@/lib/api-live` missing | |
| Transactions.tsx | **SHELL** | `@/lib/api-live` missing | |
| Cards.tsx | **SHELL** | `@/lib/api-live` missing | |
| Loans.tsx | **SHELL** | `@/lib/api-live` missing | |
| KYC.tsx | **SHELL** | `@/lib/api-live` missing | |
| Fraud.tsx | **SHELL** | `@/lib/api-live` missing | |
| Branches.tsx | **PARTIAL** | none directly | uses `useAdminStore.branches` (adminStore) |
| Employees.tsx | **PARTIAL** | none directly | uses `useAdminStore.employees` |
| Financial.tsx | **SHELL** | `@/lib/api-live` missing | |
| Marketing.tsx | **SHELL** | `@/lib/api-live` missing | |
| CMS.tsx | **SHELL** | `@/lib/api-live` missing | |
| Compliance.tsx | **SHELL** | `@/lib/api-live` missing | |
| Audit.tsx | **SHELL** | `@/lib/api-live` missing | |
| Reports.tsx | **SHELL** | `@/lib/api-live` missing | |
| Support.tsx | **SHELL** | `@/lib/api-live` missing | |
| Documents.tsx | **SHELL** | `@/lib/api-live` missing | |
| Notifications.tsx | **SHELL** | `@/lib/api-live` missing | |
| Settings.tsx | **SHELL** | `@/lib/api-live` missing | |
| Communications.tsx | **SHELL** | `@/lib/api-live` missing | |
| Verification.tsx | **SHELL** | `@/lib/api-live` missing | |
| Statements.tsx | **SHELL** | `@/lib/api-live` missing | |
| Investments.tsx | **SHELL** | `@/lib/api-live` missing | |
| Impersonation.tsx | **SHELL** | `@/lib/api-live` missing | |
| AIAssistant.tsx | **PARTIAL (hardcoded)** | `@/lib/api-live` missing | keyword-matcher; see D.4 |
| Automation.tsx | **SHELL** | `@/lib/api-live` missing | |
| Login.tsx | **PARTIAL** | none directly | UI form only, uses authStore which is broken |

## D.2 — Store Reality Check

`admin-portal/src/store/adminStore.ts` (839 lines):
- Imports `import * as api from '@/lib/api';` — **missing file**
- Even if the file existed, all `fetchMembers`, `fetchAccounts`, `fetchTransactions` etc. would call functions that don't exist
- **All state is in-memory and lost on reload** — no backend persistence
- `branches` initial state: `branches: []` — page reads empty array unless something seeds it (nothing does in the build path)

`admin-portal/src/store/authStore.ts` (780 lines):
- Imports `verifyToken, getBackupCodes, verifyBackupCode, generateToken, generateSecret` from `@/lib/mfa` — **missing file**
- Uses `zustand/middleware persist` — **persists admin session to localStorage automatically**
- 60+ permission strings defined; 12+ roles defined; **none enforced at route level**

## D.3 — Service Role Key Risk

- `SUPABASE_SERVICE_ROLE_KEY` is referenced in `.env.example`
- Searched admin-portal/src for "service_role" — **0 hits**
- Verdict: **Currently not exposed** (good), but the example file instructs developers to set it for an admin portal — **should be removed**.

## D.4 — AI Assistant: Keyword Matcher, Not LLM

`admin-portal/src/pages/AIAssistant.tsx:54-200`:

```ts
const generateResponse = async (query: string): Promise<Message> => {
  const lower = query.toLowerCase();
  if (lower.includes('high-risk') || lower.includes('risk')) { ... return mockHighRisk; }
  if (lower.includes('revenue')) { ... return mockRevenue; }
  if (lower.includes('fraud') || lower.includes('alert')) { ... return mockFraud; }
  if (lower.includes('kyc')) { ... }
  ...
};
```

- **No LLM call**, no API key, no streaming
- `api.membersApi.getAll()` etc. all resolve to missing `@/lib/api-live` so the data is always empty
- README's "AI Operations Assistant" claim is **partial at best** — it's a UI shell with hardcoded canned responses

## D.5 — Auth Gating

`admin-portal/src/App.tsx`:
- Routes: `/login` (Login.tsx), then `<Route path="/*" element={<Layout />}>` containing all admin pages
- **No `<RequireAuth>` wrapper**, no permission check, no redirect-on-unauth
- Visiting `https://admin.orbitpay.com/fraud` without logging in **renders the page**

This is a **critical security gap** for an admin portal handling PII.

## D.6 — Shared-Type Duplication

- `src/types/index.ts` (293 lines) — member portal types
- `admin-portal/src/types/index.ts` (size unknown, not yet read fully) — admin types
- `admin-portal/src/store/adminStore.ts` re-declares `Member`, `Account`, `Transaction`, `Employee`, `Notification`, `SupportTicket`, `Campaign`, `ContentPage`, `ComplianceItem`, `AuditLog`, `DashboardStats` — many overlap with `src/types/index.ts`
- **Two parallel type trees** with no shared package or generated types — drift risk

## D.7 — Build Status

Confirmed: `cd admin-portal && npm run build` fails with:
```
[vite:load-fallback] Could not load /.../admin-portal/src/lib/api-live
```
This blocks production deploy entirely.

## D.8 — Top Admin Risks

| # | Risk | Severity | Fix |
|---|------|----------|-----|
| 1 | Admin portal does not build | **CRITICAL** | Create `api-live.ts`, `api.ts`, `mfa.ts` stubs. |
| 2 | No route guards — anyone can view /fraud, /audit | **CRITICAL** | Add `<RequireAuth>` wrapper in App.tsx. |
| 3 | Admin sessions persist to localStorage | **HIGH** | Switch to in-memory only or backend-issued httpOnly cookie. |
| 4 | Impersonation page exists but is unimplemented | **HIGH** (when implemented without consent flow) | Mark as "Coming soon" or remove until audit + consent flow built. |
| 5 | AI Assistant is a keyword matcher | **MEDIUM** | Either wire a real LLM (OpenAI/Anthropic key) or rename to "Quick Search". |
| 6 | Two parallel type trees (member + admin) | **MEDIUM** | Extract to `packages/shared-types` or generate from OpenAPI. |
| 7 | No MFA enforcement on admin login | **HIGH** (banking) | Implement `lib/mfa.ts` using otplib, gate login behind it. |
| 8 | Service role key in .env.example | **HIGH** (if copied) | Remove from `.env.example`, document in server-only context. |