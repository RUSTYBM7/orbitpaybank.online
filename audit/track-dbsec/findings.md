# Track C — Database, Auth & Security Review

## C.1 — Schema Coverage Matrix

| README claim | Table name | Schema status |
|--------------|-----------|---------------|
| Member accounts | `members` | ✅ present, has RLS |
| Multi-currency accounts | `accounts` | ✅ present, has RLS |
| Transactions / transfers | `transactions` + `ledger_entries` | ✅ present, only `transactions` has RLS |
| Cards | `cards` | ✅ present, has RLS |
| Loans | `loans` | ✅ present, has RLS |
| KYC documents | `kyc_documents` | ✅ present, has RLS |
| Fraud alerts | `fraud_alerts` | ✅ present, **NO RLS policies** |
| Employees / RBAC | `employees` | ✅ present, has RLS |
| Audit logs | `audit_logs` | ✅ present, has RLS |
| Branches | — | ❌ **MISSING** |
| Transfers (wire, internal, crypto) | — | ❌ **MISSING** (uses `transactions` for everything) |
| Crypto / BTC balances | — | ❌ **MISSING** |
| Billers / bill payments | — | ❌ **MISSING** |
| Notifications | — | ❌ **MISSING** (stored only in Zustand mockData) |
| Physical cards / PIN resets | — | ❌ **MISSING** |
| Loan repayment schedule | — | ❌ **MISSING** (repayments live only in `mockData`) |
| AML alerts / velocity rules | — | ❌ **MISSING** (single `fraud_alerts` table, no rule engine) |
| Compliance policies | — | ❌ **MISSING** |
| Support tickets | — | ❌ **MISSING** |
| Marketing campaigns | — | ❌ **MISSING** |
| CMS pages | — | ❌ **MISSING** |
| Reports (saved reports) | — | ❌ **MISSING** |
| Documents | — | ❌ **MISSING** (KYC has kyc_documents, but no general docs) |
| Communications (messaging) | — | ❌ **MISSING** |
| Statements (generated PDFs) | — | ❌ **MISSING** |
| Investments / positions | — | ❌ **MISSING** |
| Automation rules | — | ❌ **MISSING** |
| Branches / branch performance | — | ❌ **MISSING** |
| Sessions / refresh tokens | `auth.users` (Supabase native) | ✅ implicit |

**Bottom line:** schema covers ~30% of what the README promises. The remaining 18
tables either don't exist or are crammed into the wrong tables.

## C.2 — RLS Verdict

**Overall risk: HIGH** for a banking platform.

- 9 RLS policies for 10 tables — `fraud_alerts` and `ledger_entries` have no policies.
- All policies are **read-restrictive** (SELECT only). There are no INSERT/UPDATE/DELETE policies for member-owned tables — meaning members cannot write their own data, but neither can any other role, **creating a write dead-zone**.
- The `audit_logs` table has a `SELECT` policy but **no policy preventing anyone from inserting fake entries**. The "immutable audit" claim relies on triggers not yet written.

Sample policy (good):
```sql
create policy "members_self_read" on members
  for select using (user_id = auth.uid());
```

Sample problem area:
```sql
-- fraud_alerts has NO policies
-- Anyone with the anon key can SELECT/INSERT/UPDATE/DELETE
```

## C.3 — Auth Verdict

### Member portal

- `src/components/auth/LoginModal.tsx:21` imports from `@/lib/supabase` (missing)
- Falls back to a local Zustand user store via `useStore().setUser(user)` in demo mode
- **No MFA challenge** in this flow
- `src/pages/SignIn.tsx` imports `@/lib/supabase` (missing) — same dead path
- `src/pages/SignUp.tsx` same
- `src/services/api/admin.ts:30`: `localStorage.setItem('orbitpay_admin_token', token)` — **XSS-prone**, persists across sessions, no expiry

### Admin portal

- `admin-portal/src/store/authStore.ts:2` imports from `@/lib/mfa` (missing)
- Uses `zustand/middleware persist` — **persists admin session to localStorage** automatically
- 60+ permission strings defined (`members.view`, `kyc.approve`, etc.) but **no route-guard wrapper** in `App.tsx` enforces them
- **MFA reality check:** `otplib@^13.4.1` + `qrcode@^1.5.4` are in `package.json` but the lib file using them is missing → build broken

### MFA reality check (the smoking gun)

| Where claimed | Code path | Verdict |
|---------------|-----------|---------|
| Member portal MFA | LoginModal → no MFA challenge | **MISSING** |
| Admin portal MFA | authStore.ts → `@/lib/mfa` → file missing | **BROKEN** |
| `public/manifest.json` PWA install | no service worker | **PARTIAL** |
| Demo "any 6-digit code" | no MFA UI | **FABRICATED** |

## C.4 — Secrets & Env Handling

`/workspace/myonlinebank/.env.example`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

Plus a `supabase/` config.toml (real config committed but no secrets).

Findings:
- ✅ No real keys committed.
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` in `.env.example` for a **client-side** React app is a **serious footgun** — service role bypasses RLS. If anyone copies `.env.example` to `.env.local` and ships, the key is exposed to every browser. **Should not be in any frontend env file.**
- ⚠️ `apply-supabase-schema.mjs` hardcodes project ref `oyghbtzxurjtlwpraqpo` — leaks infra detail.

## C.5 — Antipattern Hits

| Grep | Hits | Severity |
|------|------|----------|
| `localStorage.setItem.*token` | 1 (admin.ts:30) | HIGH — XSS vector |
| `localStorage.setItem` (any) | 4 (admin token + zustand persist) | MEDIUM |
| `dangerouslySetInnerHTML` | 0 | OK |
| `eval(` | 0 | OK |
| Hardcoded `sk-` (OpenAI) | 0 | OK |
| Hardcoded `AIza` (Google) | 0 | OK |
| `console.log` in production code | many (debug residue) | LOW |
| Direct DOM manipulation | 0 (React only) | OK |
| `Math.random` for security | otplib handles this; authStore path is broken | N/A |

## C.6 — Zod Validation

- `zod@^4.3.5` in both `package.json` files.
- **No zod schemas found in code** — used? Probably not. Likely dead dep.

## C.7 — Audit Logging Reality

- `audit_logs` table: exists, has 1 SELECT RLS policy.
- **No INSERT triggers** to enforce "immutable insert-only" — anyone with write access could UPDATE/DELETE.
- **No application-level middleware** that writes an audit row on every admin action. Pages just `setAdminActions([...])` in the Zustand store (in-memory, lost on reload).

## C.8 — Top Security Risks

| # | Risk | Severity | Evidence | Fix |
|---|------|----------|----------|-----|
| 1 | Service role key in client `.env.example` | **CRITICAL** | `.env.example:3` | Remove. Service role is server-only. |
| 2 | `fraud_alerts` + `ledger_entries` have no RLS | **CRITICAL** | schema.sql grep | Add policies: members can read their own, employees write. |
| 3 | No immutable audit-log enforcement | **CRITICAL** | schema.sql has no triggers | Add `BEFORE UPDATE OR DELETE` trigger that raises exception. |
| 4 | Admin tokens in localStorage + persist middleware | **HIGH** | admin.ts:30, authStore.ts:473 | Move to httpOnly cookie (requires backend) or in-memory only. |
| 5 | No route guards in admin App.tsx | **HIGH** | admin-portal/src/App.tsx | Add `<RequireAuth permission="...">` wrapper. |
| 6 | No CSP header | **MEDIUM** | vite.config.ts has 5 other headers but not CSP | Add `Content-Security-Policy` meta. |
| 7 | README MFA claim for member portal is fabricated | **MEDIUM** (regulatory) | no MFA code | Either implement or remove README claim. |
| 8 | No MFA enforcement on admin login | **HIGH** (banking context) | otplib deps but no lib file | Implement `admin-portal/src/lib/mfa.ts` and gate login. |
| 9 | No HTTPS enforcement | **MEDIUM** | no Vercel config for redirect | Add `vercel.json` `redirects` to force HTTPS. |
| 10 | Schema project ref hardcoded in script | **LOW** | apply-supabase-schema.mjs:21 | Read from env. |