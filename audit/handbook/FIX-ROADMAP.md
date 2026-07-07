# OrbitPay — Fix Roadmap (machine-readable)

This is the actionable checklist. Each item has ID, title, target paths, severity,
effort (S/M/L), acceptance criteria, dependencies, and status.

**Status legend:** `PENDING` · `IN_PROGRESS` · `DONE` · `BLOCKED`

---

## Phase 1 — Make it build (priority 1, ~1–2 days)

### FIX-01 — Create `src/lib/utils.ts`
- **Severity:** CRITICAL
- **Effort:** S (10 min)
- **Status:** PENDING
- **Targets:** `src/lib/utils.ts` (new)
- **Acceptance:** `npm run build` in member portal no longer errors on `@/lib/utils`. ~15 component files resolve.
- **Content:**
  ```ts
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- **Depends on:** none

### FIX-02 — Create stub `src/lib/supabase.ts`
- **Severity:** CRITICAL
- **Effort:** S (30 min)
- **Status:** PENDING
- **Targets:** `src/lib/supabase.ts` (new)
- **Acceptance:** LoginModal/SignIn/SignUp compile. If env not set, `supabase = null` and `isSupabaseConfigured = false`.
- **Content sketch:**
  ```ts
  import { createClient, SupabaseClient } from '@supabase/supabase-js';
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  export const isSupabaseConfigured = Boolean(url && key);
  export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(url!, key!)
    : null;
  ```
- **Depends on:** none

### FIX-03 — Create stub `admin-portal/src/lib/api-live.ts`
- **Severity:** CRITICAL
- **Effort:** S (1 hr)
- **Status:** PENDING
- **Targets:** `admin-portal/src/lib/api-live.ts` (new)
- **Acceptance:** All 14 admin pages compile; each returns `{data: []}` for now.
- **Content sketch:**
  ```ts
  // Stub — replace with real Supabase queries in FIX-11
  const stub = async () => ({ data: [] });
  export const membersApi = { getAll: stub };
  export const dashboardApi = { getStats: stub };
  // ... one export per admin page that imports it
  ```
- **Depends on:** none

### FIX-04 — Create `admin-portal/src/lib/api.ts` and `mfa.ts`
- **Severity:** CRITICAL
- **Effort:** M (3 hrs)
- **Status:** PENDING
- **Targets:** `admin-portal/src/lib/api.ts`, `admin-portal/src/lib/mfa.ts` (new)
- **Acceptance:** adminStore and authStore compile. mfa.ts exports `verifyToken`, `getBackupCodes`, `verifyBackupCode`, `generateToken`, `generateSecret` using installed `otplib`.
- **Content sketch for mfa.ts:**
  ```ts
  import { authenticator } from 'otplib';
  import qrcode from 'qrcode';
  export function generateSecret() { return authenticator.generateSecret(); }
  export async function generateToken(secret: string, label: string) {
    const otpauth = authenticator.keyuri(label, 'OrbitPay', secret);
    const qr = await qrcode.toDataURL(otpauth);
    return { secret, otpauth, qr };
  }
  export function verifyToken(token: string, secret: string) {
    return authenticator.verify({ token, secret });
  }
  export function getBackupCodes() {
    // 10 single-use codes
    return Array.from({length:10}, () => Math.random().toString(36).slice(-8));
  }
  export function verifyBackupCode() { /* TODO */ return false; }
  ```
- **Depends on:** none

### FIX-05 — Fix duplicate `transactions:` key in store
- **Severity:** HIGH
- **Effort:** S (30 min)
- **Status:** PENDING
- **Targets:** `src/store/index.ts:146, 202`; `src/services/mockData.ts`
- **Acceptance:** `tsc --noEmit` clean; store has single `transactions` declaration; seed moved into action.
- **Approach:** Remove inline seed array; have `seedData()` action call `setTransactions([...])`.
- **Depends on:** FIX-04

---

## Phase 2 — Make it secure (priority 2, ~2–3 days)

### FIX-06 — Add `<RequireAuth>` wrapper + RBAC checks
- **Severity:** CRITICAL
- **Effort:** M (4 hrs)
- **Status:** PENDING
- **Targets:** `admin-portal/src/App.tsx` (wrap routes); new `admin-portal/src/components/RequireAuth.tsx`
- **Acceptance:** Unauthenticated user navigating to `/fraud` etc. is redirected to `/login`. Permission check on per-route basis.
- **Depends on:** FIX-04

### FIX-07 — Remove service role key from `.env.example`
- **Severity:** CRITICAL
- **Effort:** S (15 min)
- **Status:** PENDING
- **Targets:** `.env.example`
- **Acceptance:** No `SUPABASE_SERVICE_ROLE_KEY` line. Add a comment block explaining "service role is server-side only — never use in a browser SPA".
- **Depends on:** none

### FIX-08 — Add RLS policies for `fraud_alerts` and `ledger_entries`
- **Severity:** CRITICAL
- **Effort:** M (2 hrs)
- **Status:** PENDING
- **Targets:** `supabase/schema.sql`
- **Acceptance:** Both tables have at least one SELECT policy restricting to owning member + compliance employees.
- **Depends on:** none

### FIX-09 — Add `BEFORE UPDATE OR DELETE` trigger on `audit_logs`
- **Severity:** CRITICAL
- **Effort:** S (1 hr)
- **Status:** PENDING
- **Targets:** `supabase/schema.sql`
- **Acceptance:** Any UPDATE or DELETE on `audit_logs` raises an exception.
- **Depends on:** none

### FIX-10 — Move admin token from localStorage to in-memory + httpOnly cookie
- **Severity:** HIGH
- **Effort:** L (1 day, needs backend stub)
- **Status:** PENDING
- **Targets:** `src/services/api/admin.ts:30`, `admin-portal/src/store/authStore.ts`
- **Acceptance:** No `localStorage.setItem('orbitpay_admin_token', ...)`. Admin session is in-memory; refresh path uses httpOnly cookie.
- **Depends on:** FIX-02, FIX-04, plus a tiny backend stub

---

## Phase 3 — Make it real (priority 3, ~3–5 days)

### FIX-11 — Wire member portal to real Supabase Auth
- **Severity:** HIGH
- **Effort:** M (1 day)
- **Status:** PENDING
- **Targets:** `src/lib/supabase.ts` (replace stub); `LoginModal.tsx`, `SignIn.tsx`, `SignUp.tsx`
- **Acceptance:** Sign-up creates `auth.users` row + `members` row in Supabase. Sign-in returns session.
- **Depends on:** FIX-02

### FIX-12 — Add 18+ missing schema tables
- **Severity:** HIGH
- **Effort:** L (2 days)
- **Status:** PENDING
- **Targets:** `supabase/schema.sql`
- **Acceptance:** Tables exist for: branches, transfers (internal/external/wire), crypto_balances, billers, bill_payments, notifications, support_tickets, marketing_campaigns, cms_pages, documents, statements, investments, automation_rules, loan_payments, branch_performance, employee_permissions, aml_alerts, policies.
- **Depends on:** none

### FIX-13 — Add service worker + register in main.tsx (PWA install)
- **Severity:** MEDIUM
- **Effort:** M (4 hrs)
- **Status:** PENDING
- **Targets:** `public/service-worker.js` (new); `src/main.tsx`, `admin-portal/src/main.tsx`
- **Acceptance:** Chrome DevTools shows service worker; "Install" prompt available.
- **Depends on:** none

### FIX-14 — Implement MFA in admin-portal login
- **Severity:** HIGH
- **Effort:** M (1 day)
- **Status:** PENDING
- **Targets:** `admin-portal/src/pages/Login.tsx`, `admin-portal/src/lib/mfa.ts`
- **Acceptance:** After password login, user prompted for TOTP code. QR enrollment on first login.
- **Depends on:** FIX-04

### FIX-15 — AI Assistant: real LLM or rename
- **Severity:** MEDIUM
- **Effort:** M (4 hrs)
- **Status:** PENDING
- **Targets:** `admin-portal/src/pages/AIAssistant.tsx`
- **Acceptance:** Either streams a real LLM response (with `VITE_OPENAI_API_KEY` etc.), or UI is renamed to "Quick Search" + docs updated.
- **Depends on:** none

---

## Phase 4 — Tests & polish (priority 4, ~3–5 days)

### FIX-16 — Add Vitest + smoke tests
- **Severity:** HIGH
- **Effort:** M (1 day)
- **Status:** PENDING
- **Targets:** `package.json` devDeps (`vitest`, `@testing-library/react`); new `src/__tests__/` and `admin-portal/src/__tests__/`
- **Acceptance:** `npm test` exits 0. CI workflow gains a `test` job.
- **Depends on:** FIX-05

### FIX-17 — Update README to match reality
- **Severity:** MEDIUM
- **Effort:** S (1 hr)
- **Status:** PENDING
- **Targets:** `README.md`
- **Acceptance:** Remove "Tailwind 4" claim (it's 3.4), remove "any 6-digit code" MFA demo claim, remove "Test: Unit and integration tests" CI badge.
- **Depends on:** none

### FIX-18 — Add CSP meta tag
- **Severity:** MEDIUM
- **Effort:** S (15 min)
- **Status:** PENDING
- **Targets:** `vite.config.ts:transformIndexHtml`
- **Acceptance:** Meta tag `Content-Security-Policy` injected with at minimum `default-src 'self'`.
- **Depends on:** none

### FIX-19 — Extract shared types into shared package
- **Severity:** MEDIUM
- **Effort:** L (2 days)
- **Status:** PENDING
- **Targets:** new `packages/shared-types/` workspace
- **Acceptance:** Member portal + admin portal both import from `@orbitpay/types`. Duplicate declarations removed.
- **Depends on:** FIX-05

### FIX-20 — Decide Tailwind v3 vs v4
- **Severity:** MEDIUM
- **Effort:** L (1 day)
- **Status:** PENDING
- **Targets:** `package.json`, `src/components/ui` (dynamic class generation)
- **Acceptance:** Project committed to one Tailwind version. README matches.
- **Depends on:** none

---

## Summary table

| Phase | Items | Severity mix | Total effort |
|-------|-------|--------------|--------------|
| Phase 1 — Make it build | FIX-01..05 | 4 CRITICAL + 1 HIGH | 1–2 days |
| Phase 2 — Make it secure | FIX-06..10 | 4 CRITICAL + 1 HIGH | 2–3 days |
| Phase 3 — Make it real | FIX-11..15 | 2 HIGH + 3 MEDIUM | 3–5 days |
| Phase 4 — Tests & polish | FIX-16..20 | 1 HIGH + 4 MEDIUM | 3–5 days |

**Total estimated effort: 9–15 days** to go from "demo over mock data" to
"production-ready banking platform" — assuming a real backend is built or wired.

## What this roadmap does NOT cover

- Real backend implementation (Node/Express, Supabase Edge Functions, etc.)
- Production Supabase project setup (RLS roles, auth providers, email templates)
- Banking partner integrations (Plaid, Visa API, Mastercard API, ACH, wire gateways)
- Regulatory licensing and BSA/AML program documentation
- Mobile native builds (iOS, Android)
- Performance/load testing
- Disaster recovery / backup strategy