# OrbitPay MyOnlineBank — Engineering Audit Handbook

**Repo:** https://github.com/RUSTYBM7/MyOnlineBank
**Local:** /workspace/myonlinebank
**Audit date:** 2026-07-05
**Depth:** deep-engineering-handbook

---

## 1. Executive Summary

**Overall verdict: NOT-PRODUCTION-READY.** The project is a polished-looking demo over
mock data, not a working banking platform. **The production build fails on both
apps** because five key files (`src/lib/utils.ts`, `src/lib/supabase.ts`,
`admin-portal/src/lib/api.ts`, `admin-portal/src/lib/api-live.ts`,
`admin-portal/src/lib/mfa.ts`) are imported by tens of files but do not exist in the
repository. The README fabricates at least four claims (Tailwind v4, version 2.0.0,
test CI step, demo MFA "any 6-digit code"). 28 admin pages are empty shells
importing a missing `api-live` module. The Supabase schema has 10 real tables
where 25+ are claimed. MFA, PWA service worker, realtime notifications, real
backend, and tests are all missing.

### Top 5 blockers

1. **Build is broken on both apps.** `npm run build` fails at Rollup stage. Until the
   five missing lib files are created (even as stubs), nothing ships.
2. **No real backend.** The member portal API service targets
   `http://localhost:3001/api` — a service that doesn't exist. All "live" data
   flows through `src/services/mockData.ts` (1018 lines of hard-coded arrays).
3. **Admin portal has no route guards.** Anyone navigating to `/fraud`, `/audit`,
   `/members` sees the page even without logging in. Banking context: critical.
4. **Schema is ~30% of what the README claims.** 10 real tables; 18+ claimed
   modules have no backing tables (branches, transfers, crypto, billers, etc.).
5. **Audit logging is decorative.** `audit_logs` table exists, but no insert-only
   triggers and no app-level middleware enforce writes. The "immutable" claim is
   aspirational.

---

## 2. Scope, Methodology, Depth Contract

### What was audited

- 155 TS/TSX files in `src/` (member portal)
- 36 TS/TSX files in `admin-portal/src/` (admin portal)
- `supabase/schema.sql` (432 lines, 10 real tables)
- `package.json`, `admin-portal/package.json`, `vite.config.ts`, `.env.example`
- `.github/workflows/ci-cd.yml`, `public/manifest.json`, `scripts/apply-supabase-schema.mjs`
- Actual `npm install` + `npm run build` runs for both apps
- `npm run dev` smoke test

### Depth per area

- **README claims** — every claim ID walked, verdict given with file:line evidence
- **Build & runtime** — actual install + build attempted, errors captured verbatim
- **Schema & security** — every table + RLS policy quoted; antipatterns grepped
- **Admin portal** — every page inspected for import path and data source

### Out of scope

- Live infra (Vercel, DNS, Supabase hosted project `oyghbtzxurjtlwpraqpo`)
- Regulatory licensing (BSA/AML, state money transmitter)
- Visual design / UX
- Mobile native builds
- Performance profiling beyond "did the build finish"

---

## 3. Coverage Matrix — README claim → audit verdict

| Claim ID | README text | Track | Verdict |
|----------|-------------|-------|---------|
| C-MP-01 | Multi-currency USD/EUR/GBP/BTC | A | PARTIAL — types + mock balances, no math/chain |
| C-MP-02 | Instant transfers (internal/external/wire/crypto) | A | PARTIAL — UI only, no transfer pipeline |
| C-MP-03 | Virtual & physical cards | A | PARTIAL — types + mock, no card-network API |
| C-MP-04 | Bill Pay scheduling | A | PARTIAL — types, no scheduler |
| C-MP-05 | Loan management | A | PARTIAL — types + mock, no underwriting |
| C-MP-06 | AI Financial Assistant (member) | A | MISSING — no member-side AI page |
| C-MP-07 | KYC verification | A | PARTIAL — stub API, no vendor |
| C-MP-08 | Real-time notifications | A | PARTIAL — types + mock, no realtime channel |
| C-MP-09 | PWA support | A | PARTIAL — manifest OK, no service worker |
| C-MP-10 | Dark/Light mode | A | PRESENT |
| C-MP-11 | Member MFA / TOTP | A | MISSING — no MFA code path |
| C-MP-12 | Session auto-refresh / timeout | A | PARTIAL — localStorage token, no refresh |
| C-AP-01..15 | Admin features (dashboard, members, fraud, …) | A, D | MOSTLY SHELL — missing `api-live.ts` |
| C-AP-16 | AI Operations Assistant | A, D | PARTIAL — keyword matcher, not LLM |
| C-AP-17..27 | Marketing, CMS, Reports, Notifications, … | A, D | SHELL — missing module |
| C-SEC-01 | MFA / TOTP | C | PARTIAL (admin only, broken) |
| C-SEC-02 | Session auto-refresh | C | MISSING |
| C-SEC-03 | All admin actions logged | C | PARTIAL — table exists, no triggers |
| C-SEC-04 | RBAC | C | PARTIAL — permissions defined, not enforced |
| C-SEC-05 | Supabase RLS | C | PARTIAL — 9 policies, 2 tables unprotected |
| C-SEC-06 | Security headers | C | PARTIAL — 5 headers, no CSP |
| C-SEC-07 | Zod validation | C | PARTIAL — dep present, no usage |
| C-SEC-09 | Demo MFA "any 6-digit code" | C | FABRICATED |
| C-QA-01 | React 19 + TS 5.9 | A | PRESENT |
| C-QA-02 | Vite 7.3 | A | PRESENT (7.3.6 installed) |
| C-QA-03 | TailwindCSS 4 | A | FABRICATED — actual is 3.4 |
| C-QA-04 | Framer Motion 12 | A | PRESENT |
| C-QA-05 | Zustand 5 | A | PRESENT |
| C-QA-06 | React Router 7 | A | PRESENT |
| C-QA-07 | Supabase PostgreSQL | C | PARTIAL — schema only |
| C-QA-08 | TOTP library | C | PRESENT in admin deps |
| C-QA-09 | Recharts | A | PRESENT |
| C-QA-10 | Lint CI step | A | PRESENT |
| C-QA-11 | Build CI step | A | PRESENT |
| C-QA-12 | Test CI step | A | FABRICATED — no test job, no test files |
| C-QA-13 | Deploy CI step | A | PRESENT |
| C-QA-14 | Node 18+ | A | PRESENT |
| C-QA-15 | pnpm 8+ or npm 9+ | A | PRESENT (uses npm 10) |

---

## 4. Architecture Overview

```
/workspace/myonlinebank/
├── src/                       (Member Portal — 155 TS files)
│   ├── App.tsx                Routes: / /login /signup /app/* /admin/*
│   ├── main.tsx               React 19 entry; NO service worker registration
│   ├── components/            9 subdirs incl. ui (shadcn), admin, glass, landing
│   ├── pages/                 9 pages incl. UserApp, AdminApp, LandingPage
│   ├── services/
│   │   ├── mockData.ts        1018 lines of in-memory seed data
│   │   └── api/               Talks to http://localhost:3001/api (DOES NOT EXIST)
│   ├── store/index.ts         Zustand store, NO persist
│   ├── lib/
│   │   └── onboarding-api.ts  Stub for KYC; imports from missing supabase.ts
│   ├── hooks/ utils/ types/   Per usual React project
│   └── lib/supabase.ts        *** IMPORTED BUT MISSING ***
│
├── admin-portal/              (Admin Portal — 36 TS files)
│   ├── src/App.tsx            Routes: /login + 26 lazy-loaded admin pages
│   ├── src/pages/             27 admin pages
│   ├── src/store/
│   │   ├── adminStore.ts      839 lines, imports missing @/lib/api
│   │   └── authStore.ts       780 lines, uses persist + imports missing @/lib/mfa
│   └── src/lib/               *** DIRECTORY DOES NOT EXIST ***
│       (api.ts, api-live.ts, mfa.ts all imported but missing)
│
├── supabase/schema.sql        432 lines, 10 real tables, 9 RLS policies
├── scripts/apply-supabase-schema.mjs  pg client for schema sync (prebuild hook)
├── public/manifest.json       Valid PWA manifest, but no SW to make it installable
├── vite.config.ts             React plugin + 5 security headers (no CSP)
├── package.json               React 19, Vite 7, Tailwind 3.4 (mismatch), Zustand 5
└── .github/workflows/ci-cd.yml   Lint, build-member, build-admin, deploy-*
```

---

## 5. Per-Module Findings

### 5.1 Member Portal — `src/`

**Status: WILL NOT BUILD** (missing `src/lib/utils.ts`, `src/lib/supabase.ts`).

The app boots in dev mode because Vite resolves modules lazily; a user navigating to
`/login` will hit a runtime error and see a broken page. Production build halts at
Rollup stage.

- `src/App.tsx:14` — calls `seedData()` from `@/services/mockData` on mount → fills
  Zustand with hard-coded users, accounts, transactions.
- `src/services/api/index.ts:1` — API client points at
  `http://localhost:3001/api`. No backend exists.
- `src/store/index.ts:146, 202` — duplicate `transactions` key (second overrides first
  silently).
- `src/components/auth/LoginModal.tsx:21` — imports `supabase, isSupabaseConfigured`
  from `@/lib/supabase` (file missing).
- `src/components/admin/AdminOverview.tsx:1-20` — hard-coded chart data
  (`revenueData`, `txnVolData`).
- `src/components/admin/AuditLogs.tsx:1-40` — reads `adminActions` from Zustand store
  (in-memory, lost on reload). "8 action types" hard-coded.

### 5.2 Admin Portal — `admin-portal/src/`

**Status: WILL NOT BUILD** (missing `admin-portal/src/lib/api.ts`,
`api-live.ts`, `mfa.ts`).

- 14 of 27 pages import `import * as api from '@/lib/api-live'` and immediately fail
  to resolve. Each page tries to call `api.transactionsApi.getAll()` etc. on first
  render.
- `admin-portal/src/store/adminStore.ts` — 839 lines, imports `import * as api from
  '@/lib/api'` (missing). Even if `api.ts` existed, no backend exists to serve.
- `admin-portal/src/store/authStore.ts` — uses `zustand/middleware persist` with no
  name override → persists entire admin auth state to localStorage on every change.
- `admin-portal/src/App.tsx` — 26 lazy-loaded routes, **NO `<RequireAuth>` wrapper**.
  Anyone can navigate to `/fraud` etc.
- `admin-portal/src/pages/AIAssistant.tsx:54-200` — keyword matcher, not LLM.
- `admin-portal/src/pages/Login.tsx` — uses `useAuthStore` which is broken.

### 5.3 Supabase Schema — `supabase/schema.sql`

- 12 `create table` statements, but one is `create table if not exists auth.users`
  (stub for local testing). 10 real application tables:
  - `members`, `accounts`, `cards`, `transactions`, `ledger_entries`, `loans`,
    `kyc_documents`, `fraud_alerts`, `employees`, `audit_logs`
- 8 ENUMs: `kyc_status`, `account_type`, `account_status`, `txn_type`, `txn_status`,
  `loan_status`, `employee_role`, `employee_status`
- 9 RLS policies — all SELECT, all reasonably narrow (`auth.uid() = user_id`).
  **No INSERT/UPDATE/DELETE policies on member-owned tables** — write dead-zone.
- 2 tables have **zero policies**: `fraud_alerts`, `ledger_entries`. Anyone with the
  anon key can read/write.
- `audit_logs` has SELECT policy but no insert-only trigger enforcing immutability.
- `auth.uid()` is stubbed: reads `orbitpay.test_uid` GUC or returns zero UUID.

### 5.4 Build & Tooling

- `vite.config.ts` injects 5 security headers (X-Content-Type-Options, X-Frame-Options,
  X-XSS-Protection, Referrer-Policy, Permissions-Policy). **No CSP.**
- `.env.example` lists `SUPABASE_SERVICE_ROLE_KEY` for a client-side React app —
  dangerous footgun.
- `scripts/apply-supabase-schema.mjs` hardcodes project ref `oyghbtzxurjtlwpraqpo`.
- Recharts is at v2.15.4 (deprecated, should bump to v3).
- `@supabase/supabase-js` and `otplib` listed in deps but never imported
  (imports are broken).

### 5.5 CI/CD — `.github/workflows/ci-cd.yml`

- Lint, build-member, build-admin, deploy-member, deploy-admin, notify jobs.
- **No test job** (CI claim C-QA-12 is fabricated).
- Builds will fail because the project doesn't compile.

---

## 6. Risk Register

| # | Risk | Severity | Evidence | Trigger | Impact | Confidence | Verification | Remediation |
|---|------|----------|----------|---------|--------|------------|--------------|-------------|
| R-01 | Production build fails (both apps) | CRITICAL | Track B: actual `npm run build` error | CI runs build on PR | Deploy never happens | HIGH | Reproduced: build-member.log, build-admin.log | Create 5 missing lib files (stubs OK) |
| R-02 | No real backend (API service targets dead URL) | CRITICAL | src/services/api/index.ts:6 | Any feature flow that hits API | All "live" data is mock | HIGH | grep + read | Build a backend OR rewire to mock-only |
| R-03 | Admin portal has no route guards | CRITICAL | admin-portal/src/App.tsx | Visit /fraud unauth | Anyone sees PII | HIGH | Manual code review | Add `<RequireAuth>` wrapper |
| R-04 | Service role key in `.env.example` for client app | CRITICAL | .env.example:3 | Dev copies .env.example to .env.local | Key exposed in browser, RLS bypassed | HIGH | Read | Remove from .env.example; document as server-only |
| R-05 | Schema has unprotected tables (fraud_alerts, ledger_entries) | CRITICAL | schema.sql grep | anon key leak | All fraud data + ledger exposed | HIGH | grep | Add RLS policies |
| R-06 | Audit log not enforced as immutable | CRITICAL | schema.sql no triggers | Any write to audit_logs | Audit trail can be tampered with | HIGH | Read | Add BEFORE UPDATE OR DELETE trigger |
| R-07 | No MFA enforcement anywhere functional | HIGH | Track A: no MFA code path | Login flow | Banking app without MFA = regulatory risk | HIGH | grep + read | Implement lib/mfa.ts + login gate |
| R-08 | Admin token in localStorage | HIGH | src/services/api/admin.ts:30, authStore.ts persist | XSS attack | Admin session hijack | HIGH | grep | Move to in-memory + httpOnly cookie |
| R-09 | README MFA claim for member portal is fabricated | HIGH (regulatory) | No MFA code in src/ | Demo / production deploy | Misleading users; possible FTC/SEC issue | HIGH | grep | Implement OR remove README claim |
| R-10 | Schema 30% of claims — many modules lack tables | HIGH | Track C | Real production use | Cannot persist branches, transfers, billers, etc. | HIGH | Read schema.sql | Add 18+ missing tables |
| R-11 | No CSP header | MEDIUM | vite.config.ts has 5 others but no CSP | XSS payload injection | Cookie theft, UI redress | HIGH | Read | Add Content-Security-Policy meta |
| R-12 | AI Assistant is keyword matcher, not LLM | MEDIUM | AIAssistant.tsx:54-200 | Admin asks anything nuanced | Misleading "AI" branding | HIGH | Read | Either wire real LLM (env-key) or rename |
| R-13 | Two parallel type trees | MEDIUM | src/types vs admin-portal/src/types | Type drift | Build/runtime type errors | MEDIUM | grep | Extract to shared package |
| R-14 | PWA not installable (no service worker) | MEDIUM | src/main.tsx has no SW registration | Mobile install attempt | Bad mobile UX | HIGH | Read | Add service-worker.js + register |
| R-15 | No realtime channel for notifications | MEDIUM | mockData.ts seeded once | New transaction | No push to user | HIGH | Read | Add SSE or Supabase realtime |
| R-16 | Impersonation page unimplemented | MEDIUM (HIGH when wired) | admin-portal/src/pages/Impersonation.tsx | Future implementation without consent flow | Privilege escalation risk | MEDIUM | Read | Mark "Coming soon" or remove until audit + consent built |
| R-17 | `recharts@2.15.4` deprecated | LOW | npm warn | Next upgrade | Security / bug fixes missing | HIGH | npm warn | Bump to v3 |
| R-18 | No `.npmrc` / engines field | LOW | package.json | Wrong Node version | Build breaks silently | MEDIUM | Read | Add `"engines": {"node": ">=20"}` |
| R-19 | Schema project ref hardcoded in script | LOW | apply-supabase-schema.mjs:21 | Migrate to new Supabase project | Manual edit required | HIGH | Read | Read from env |
| R-20 | Recharts + dynamic Tailwind classes | LOW | tailwind 3.4 vs 4 mismatch claim | Style changes | Some utilities may break | MEDIUM | Read | Decide Tailwind v3 vs v4; document |

---

## 7. Prioritized Fix Roadmap

The first 5 are the highest-leverage production blockers; the rest can be batched
into a hardening cycle.

### Phase 1 — Make it build (FIX-01..05) — Estimated: 1–2 days

| ID | Title | Target paths | Severity | Effort | Acceptance criteria | Depends on |
|----|-------|--------------|----------|--------|---------------------|------------|
| FIX-01 | Create `src/lib/utils.ts` with `cn` helper | src/lib/utils.ts (new) | CRITICAL | S (10 min) | `npm run build` no longer errors on `@/lib/utils`; all 15 importing files resolve | none |
| FIX-02 | Create stub `src/lib/supabase.ts` exporting `supabase` and `isSupabaseConfigured` | src/lib/supabase.ts (new) | CRITICAL | S (30 min) | LoginModal/SignIn/SignUp compile; if env not set, `supabase` is `null` and `isSupabaseConfigured` is `false` | none |
| FIX-03 | Create stub `admin-portal/src/lib/api-live.ts` returning empty `{data: []}` | admin-portal/src/lib/api-live.ts (new) | CRITICAL | S (1 hr) | All 14 admin pages compile | none |
| FIX-04 | Create stub `admin-portal/src/lib/api.ts` and `mfa.ts` (using installed otplib) | admin-portal/src/lib/api.ts, mfa.ts (new) | CRITICAL | M (3 hrs) | adminStore and authStore compile; mfa.ts has working TOTP verify + QR generation | none |
| FIX-05 | Fix duplicate `transactions:` key in src/store/index.ts; move seed into action | src/store/index.ts:146, 202; src/services/mockData.ts | HIGH | S (30 min) | `tsc --noEmit` clean; store has single `transactions` declaration | FIX-04 |

### Phase 2 — Make it secure (FIX-06..10) — Estimated: 2–3 days

| ID | Title | Target paths | Severity | Effort | Why | Depends on |
|----|-------|--------------|----------|--------|-----|------------|
| FIX-06 | Add `<RequireAuth>` wrapper + RBAC checks to admin-portal App.tsx | admin-portal/src/App.tsx, new RequireAuth.tsx | CRITICAL | M (4 hrs) | Anyone visiting /fraud sees PII right now | FIX-04 |
| FIX-07 | Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.example`; document as server-only | .env.example, docs | CRITICAL | S (15 min) | Footgun that bypasses RLS in browser | none |
| FIX-08 | Add RLS policies for `fraud_alerts` and `ledger_entries` | supabase/schema.sql | CRITICAL | M (2 hrs) | Currently unprotected, anon key can read | none |
| FIX-09 | Add `BEFORE UPDATE OR DELETE` trigger on `audit_logs` raising exception | supabase/schema.sql | CRITICAL | S (1 hr) | Claim of immutability is currently false | none |
| FIX-10 | Move admin token from localStorage to in-memory + httpOnly cookie (requires backend) | src/services/api/admin.ts, admin-portal authStore | HIGH | L (1 day, needs backend stub) | XSS exposure | FIX-02, FIX-04 |

### Phase 3 — Make it real (FIX-11..15) — Estimated: 3–5 days

| ID | Title | Target paths | Severity | Effort | Why | Depends on |
|----|-------|--------------|----------|--------|-----|------------|
| FIX-11 | Wire member portal to real Supabase Auth (replace stub lib/supabase.ts) | src/lib/supabase.ts, LoginModal, SignIn, SignUp | HIGH | M (1 day) | Currently no real auth | FIX-02 |
| FIX-12 | Add missing schema tables: branches, transfers, billers, notifications, support_tickets, etc. (18+ tables) | supabase/schema.sql | HIGH | L (2 days) | Schema is 30% of claims | none |
| FIX-13 | Add service worker + register in main.tsx (PWA install) | public/service-worker.js, src/main.tsx, admin-portal/src/main.tsx | MEDIUM | M (4 hrs) | PWA install prompt needs SW | none |
| FIX-14 | Implement MFA in admin-portal login flow (use otplib) | admin-portal/src/pages/Login.tsx, lib/mfa.ts | HIGH | M (1 day) | Banking context, regulatory | FIX-04 |
| FIX-15 | Either wire real LLM in AIAssistant or rename to "Quick Search" | admin-portal/src/pages/AIAssistant.tsx | MEDIUM | M (4 hrs) | Currently misleading | none |

### Phase 4 — Tests & polish (FIX-16..20) — Estimated: 3–5 days

| ID | Title | Target paths | Severity | Effort | Why | Depends on |
|----|-------|--------------|----------|--------|-----|------------|
| FIX-16 | Add Vitest + write smoke tests for stores + lib helpers | package.json devDeps, src/__tests__/ | HIGH | M (1 day) | CI has no test job | FIX-05 |
| FIX-17 | Update README: Tailwind v3.4 not v4; remove "MFA any 6-digit" claim; remove "Test" CI badge | README.md | MEDIUM | S (1 hr) | Document reality | none |
| FIX-18 | Add CSP meta tag | vite.config.ts | MEDIUM | S (15 min) | Missing security header | none |
| FIX-19 | Extract shared types into packages/shared-types | new package | MEDIUM | L (2 days) | Drift between member + admin types | FIX-05 |
| FIX-20 | Bump Tailwind to v4 OR commit to v3 (rewrite dynamic class generation) | package.json, src/components/ui | MEDIUM | L (1 day) | Tailwind version claim ambiguous | none |

---

## 8. Open Questions / Unknowns

- Is the Supabase project at `oyghbtzxurjtlwpraqpo` real and populated, or is the
  schema aspirational? (Cannot tell from the repo.)
- Does the team have a real backend planned? `http://localhost:3001/api` suggests
  yes — but it's not in the repo.
- Is the project a portfolio demo or a real product launch? Affects how aggressively
  to fix things vs. acknowledge "demo only".
- Why are 5 lib files missing? gitignore is `**/lib/` which would have excluded
  `src/lib/onboarding-api.ts` (which IS committed) — so the pattern is inconsistent
  or these files were deleted pre-commit.
- Does the team intend MFA on member portal or only admin? README implies both.
- Is the AI Assistant meant to ship as "AI" or is "keyword matcher" acceptable?

---

## 9. Appendices

### 9.1 Evidence inventory

- `audit/scope/coverage-matrix.md` — claim IDs + reality inventory
- `audit/track-readme/findings.md` — Track A
- `audit/track-build/findings.md` — Track B
- `audit/track-dbsec/findings.md` — Track C
- `audit/track-admin/findings.md` — Track D
- `audit/track-build/install.log` — member portal `npm install` output
- `audit/track-build/install-admin.log` — admin portal `npm install` output
- `audit/track-build/build-member.log` — member portal build error
- `audit/track-build/build-admin.log` — admin portal build error
- `audit/track-build/dev-server.log` — member portal dev server start

### 9.2 Build log excerpts

**Member portal build (failing):**
```
vite v7.3.6 building client environment for production...
transforming...
[plugin vite:esbuild] src/store/index.ts: Duplicate key "transactions" in object literal
✓ 1092 modules transformed.
✗ Build failed in 9.33s
error during build:
[vite:load-fallback] Could not load /.../src/lib/utils
```

**Admin portal build (failing):**
```
vite v7.3.6 building client environment for production...
transforming...
✓ 1064 modules transformed.
✗ Build failed in 6.87s
error during build:
[vite:load-fallback] Could not load /.../admin-portal/src/lib/api-live
```

### 9.3 Quick command inventory for future audits

```bash
# Counts
find src admin-portal/src -name "*.ts" -o -name "*.tsx" | wc -l
find . -name "*.test.*" -o -name "*.spec.*" -not -path "*/node_modules/*" | wc -l

# Supabase
grep -c "create table" supabase/schema.sql
grep -c "create policy" supabase/schema.sql
grep -c "enable row level security" supabase/schema.sql

# PWA / SW
find . -name "manifest*.json" -not -path "*/node_modules/*"
grep "serviceWorker" src/main.tsx

# MFA / TOTP
grep -rE "otplib|speakeasy" src admin-portal/src --include="*.ts" --include="*.tsx"

# Build
npm install && npm run build
cd admin-portal && npm install && npm run build
```

---

*End of handbook. See FIX-ROADMAP.md for the machine-readable checklist.*