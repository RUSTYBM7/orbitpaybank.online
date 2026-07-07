# OrbitPay MyOnlineBank — Coverage Matrix

Repo: https://github.com/RUSTYBM7/MyOnlineBank
Local path: /workspace/myonlinebank
Audit date: 2026-07-05

This matrix is the contract for the four parallel audit tracks. Every README claim has a
stable ID so tracks can reference it. The Reality Inventory records what the code
actually contains.

---

## 1. README Claim Inventory

### Member Portal features (C-MP-)

| ID | Claim (verbatim from README) |
|------|--------------------------------|
| C-MP-01 | Multi-Currency Accounts - USD, EUR, GBP, and BTC support |
| C-MP-02 | Instant Transfers - Internal, external, wire, and crypto transfers |
| C-MP-03 | Virtual & Physical Cards - Manageable debit cards with spending controls |
| C-MP-04 | Bill Pay - Pay bills with automatic scheduling |
| C-MP-05 | Loan Management - Apply and track personal, home, auto, and business loans |
| C-MP-06 | AI Financial Assistant - Smart insights and recommendations |
| C-MP-07 | KYC Verification - Secure identity verification process |
| C-MP-08 | Real-time Notifications - Stay updated on all account activity |
| C-MP-09 | PWA Support - Installable on mobile devices |
| C-MP-10 | Dark/Light Mode - Premium green glass design system |
| C-MP-11 | Authentication: Email/Password with MFA support (TOTP) |
| C-MP-12 | Session Management: Auto-refresh tokens, Session timeout |

### Admin Portal features (C-AP-)

| ID | Claim |
|------|-------|
| C-AP-01 | Executive Dashboard - KPIs, Charts, Activity feeds |
| C-AP-02 | Member Management - Full CRUD, Suspend/Reactivate, Notes |
| C-AP-03 | Account Operations - Freeze, Unfreeze, Close, Configure fees |
| C-AP-04 | KYC Review Center - Document verification, Risk scoring, Approve/Reject |
| C-AP-05 | Loan Management - Applications, Underwriting, Repayment tracking |
| C-AP-06 | Card Operations - Issue, Block, Replace, PIN reset, Limits |
| C-AP-07 | Transaction Center - Reconciliation, Chargebacks, Disputes |
| C-AP-08 | Fraud & Risk Monitoring - Alerts, AML, Velocity monitoring |
| C-AP-09 | Branch Management - Multi-branch support with performance tracking |
| C-AP-10 | Employee Management - Staff accounts, Roles, Permissions, Activity logs |
| C-AP-11 | Financial Oversight - Revenue, Expenses, Profit & Loss |
| C-AP-12 | Compliance Center - AML reviews, Audit preparation, Policy management |
| C-AP-13 | Audit Logging - Complete action tracking, Immutable logs |
| C-AP-14 | System Settings - Branding, Security policies, Notifications |
| C-AP-15 | Help Desk - Ticket management, Escalation workflows |
| C-AP-16 | AI Operations Assistant |
| C-AP-17 | Marketing module |
| C-AP-18 | CMS module |
| C-AP-19 | Reports module |
| C-AP-20 | Notifications center |
| C-AP-21 | Documents module |
| C-AP-22 | Communications module |
| C-AP-23 | Verification module |
| C-AP-24 | Statements module |
| C-AP-25 | Investments module |
| C-AP-26 | Impersonation module |
| C-AP-27 | Automation module |

### Security claims (C-SEC-)

| ID | Claim |
|------|-------|
| C-SEC-01 | Authentication: Email/Password with MFA support (TOTP) |
| C-SEC-02 | Session Management: Auto-refresh tokens, Session timeout |
| C-SEC-03 | Audit Logging: All admin actions logged |
| C-SEC-04 | Role-Based Access: Granular permissions per module |
| C-SEC-05 | Row Level Security: Supabase RLS policies |
| C-SEC-06 | Security Headers: X-Frame-Options, CSP, etc. |
| C-SEC-07 | Input Validation: Zod schemas |
| C-SEC-08 | Supabase Auth (email/password) |
| C-SEC-09 | Demo MFA accepts "any 6-digit code" (demo mode) |

### Quality / CI claims (C-QA-)

| ID | Claim |
|------|-------|
| C-QA-01 | Built with React 19 + TypeScript 5.9 |
| C-QA-02 | Vite 7.3 build tool |
| C-QA-03 | TailwindCSS 4 |
| C-QA-04 | Framer Motion 12 |
| C-QA-05 | Zustand 5 |
| C-QA-06 | React Router 7 |
| C-QA-07 | Supabase PostgreSQL DB |
| C-QA-08 | TOTP MFA library |
| C-QA-09 | Recharts |
| C-QA-10 | Lint CI step |
| C-QA-11 | Build CI step |
| C-QA-12 | Test CI step |
| C-QA-13 | Deploy CI step (Vercel) |
| C-QA-14 | Node.js 18+ required |
| C-QA-15 | pnpm 8+ or npm 9+ required |

### Deployment claims (C-DEP-)

| ID | Claim |
|------|-------|
| C-DEP-01 | Vercel-recommended deployment |
| C-DEP-02 | Member Portal root directory `/` |
| C-DEP-03 | Admin Portal root directory `admin-portal` |
| C-DEP-04 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars |
| C-DEP-05 | `SUPABASE_SERVICE_ROLE_KEY` for admin |
| C-DEP-06 | Demo credentials: john.smith@email.com / demo123 |
| C-DEP-07 | Demo admin: admin@orbitpay.com / admin123 |
| C-DEP-08 | Admin subdomain: admin.myonlinebank.vercel.app |

---

## 2. Reality Inventory

### File / structure counts (verified via find)

- Member portal source: `/workspace/myonlinebank/src/` — **155 TS/TSX files**
- Admin portal source: `/workspace/myonlinebank/admin-portal/src/` — **36 TS/TSX files**
- Member pages: `src/pages/` — 9 entries (8 top-level + admin/ subdir)
- Admin pages: `admin-portal/src/pages/` — **27 pages**
- Supabase schema: `supabase/schema.sql` — **432 lines, 12 CREATE TABLEs (incl. 1 stub), 10 RLS enables, 9 policies, 8 ENUMs**
- Test files (`*.test.*`, `*.spec.*`): **0**
- Test runner config (`vitest.config.*`, `jest.config.*`, `playwright.config.*`): **0**
- PWA artifacts (`public/manifest.json`): **1 (present)**, but `service-worker.js` / `sw.js`: **0**

### Entrypoints

- `src/main.tsx` — React 19 + BrowserRouter + global error handlers. **No service worker registration.**
- `src/App.tsx` — Routes: `/`, `/login`, `/signup`, `/forgot-password`, `/app/*`, `/admin/*`. Calls `seedData()` from `@/services/mockData` on mount.
- `admin-portal/src/main.tsx` — Same shape, no service worker.
- `admin-portal/src/App.tsx` — Routes: `/login`, plus 26 lazy-loaded admin pages under `/`.

### Stores

- `src/store/index.ts` — **Single Zustand store, no `persist` middleware.** All data is in-memory. Seeded by `src/services/mockData.ts` (1018 lines).
- `admin-portal/src/store/adminStore.ts` — 839 lines. Imports from `@/lib/api` (**missing file**).
- `admin-portal/src/store/authStore.ts` — 780 lines. Imports from `@/lib/mfa` (**missing file**). Uses `zustand/middleware persist`.

### Supabase client

- `src/lib/supabase.ts` — **DOES NOT EXIST**, but imported by:
  - `src/components/auth/LoginModal.tsx:21`
  - `src/pages/SignIn.tsx`
  - `src/pages/SignUp.tsx`
- `admin-portal/src/lib/api-live.ts` — **DOES NOT EXIST**, but imported by 14 admin pages
- `admin-portal/src/lib/api.ts` — **DOES NOT EXIST**, but imported by `adminStore.ts`
- `admin-portal/src/lib/mfa.ts` — **DOES NOT EXIST**, but imported by `authStore.ts`
- **Member portal will not compile**: missing module.
- **Admin portal will not compile**: missing module.

### Supabase schema tables (in `supabase/schema.sql`)

Real tables: `members`, `accounts`, `cards`, `transactions`, `ledger_entries`, `loans`,
`kyc_documents`, `fraud_alerts`, `employees`, `audit_logs`. Stub: `auth.users`.

**Missing tables** (claimed by README but not in schema):
- `branches` — README claims multi-branch support
- `transfers` / `wire_transfers` — README claims internal/external/wire transfers
- `crypto_balances` / `crypto_transactions` — README claims BTC support
- `billers` / `bill_payments` — README claims Bill Pay
- `notifications` — README claims Real-time Notifications
- `cards_physical` / `card_pin_resets` — physical card / PIN reset
- `loan_payments` — repayment schedule
- `aml_alerts` — fraud module AML
- `policies` — compliance policy management
- `support_tickets` — help desk
- `marketing_campaigns` — marketing module
- `cms_pages` — CMS module
- `reports` — reports
- `documents` — documents
- `communications` — comms
- `statements` — statements
- `investments` / `investment_positions` — investments
- `automation_rules` — automation
- `branches`, `branch_performance` — branch management
- `employee_roles` / `employee_permissions` — employee RBAC
- `audit_logs` exists but is shallow (no triggers or insert-only enforcement visible)

### Schema quality

- **RLS policies**: 9, all permissive-leaning. Examples:
  - `members_self_read` — read own row
  - `employees_admin_write` — admin write
  - `accounts_member_read`, `cards_member_read`, `loans_member_read`, `txn_member_read` — member read
  - `kyc_owner_or_compliance` — owner or compliance
  - `audit_employee_read` — employee read
- No INSERT triggers enforcing immutable audit_logs (table just has columns; immutable claim depends on triggers not yet written).
- `auth.uid()` is a stub returning the `orbitpay.test_uid` GUC or zero UUID. Real Supabase provides this; the stub is for local testing only.

### TOTP / MFA

- `admin-portal/package.json` lists `@otplib/core@^13.4.1`, `otplib@^13.4.1`, `qrcode@^1.5.4`. **TOTP library IS in deps.**
- `admin-portal/src/store/authStore.ts` imports `verifyToken`, `getBackupCodes`, `verifyBackupCode`, `generateToken`, `generateSecret` from `@/lib/mfa` (missing).
- `src/components/auth/LoginModal.tsx` does NOT reference MFA — MFA appears to be admin-portal-only.
- README MFA claim (C-SEC-01) covers member portal too — **but member portal has no MFA code path.**

### PWA

- `public/manifest.json` — **present and valid** (name, icons, theme_color, etc.)
- **No service worker registration** in `src/main.tsx` or `admin-portal/src/main.tsx`.
- C-MP-09 (PWA Support) is **PARTIAL**: manifest exists but no service worker → not installable as PWA.

### Tests

- **0 test files** anywhere in the repo (excluding `node_modules`).
- No `vitest.config.*`, `jest.config.*`, `playwright.config.*`.
- `.github/workflows/ci-cd.yml` defines lint, build-member, build-admin, deploy-member, deploy-admin jobs — **no test job**.
- C-QA-12 (Test CI step) is **FABRICATED**.

### Tooling version mismatches

- README says TailwindCSS 4 (`README.md:48`); `package.json` and `admin-portal/package.json` show `tailwindcss@^3.4.19`. **FABRICATED.**
- README says Vite 7.3 (`README.md:48`); actual is `vite@^7.2.4`. Minor.
- README says "version 2.0.0" badge; `package.json` shows `"version": "1.0.0"`. **FABRICATED.**

### Security headers

- `vite.config.ts` injects `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` via `transformIndexHtml`. **Positive.**
- **No CSP header** (README claims CSP — partial).

### `apply-supabase-schema.mjs`

- Reads `supabase/schema.sql`, opens a `pg` connection, runs SQL.
- Resolves DB host via IPv4 DNS (for Vercel build env).
- Requires `SUPABASE_DB_PASSWORD` or `SUPABASE_DB_URL` env var. **Will fail without env.** Used as `prebuild` hook.

---

## 3. Module Tracks for Cycle 1

| Track | Agent | Charter | Owned Claim IDs |
|-------|-------|---------|-----------------|
| **Track A** — README Claims Audit | general | Walk every claim ID, mark PRESENT/PARTIAL/MISSING/FABRICATED with file:line evidence | C-MP-* (all), C-AP-01..15, C-QA-* |
| **Track B** — Build & Runtime Smoke Test | coder | Run `npm install` and `npm run build` for both apps, attempt `npm run dev`, capture every error/warning, **fix nothing**, just report | C-QA-01..06, C-DEP-01..05 |
| **Track C** — Database, Auth & Security Review | general | Review schema, RLS, env, MFA, antipatterns, Zod usage | C-SEC-*, C-MP-11, C-MP-12, C-AP-13, C-QA-08 |
| **Track D** — Admin Portal Integration Audit | coder | Per-page wiring audit for 28 admin pages, store reality check, auth gating, service_role key usage | C-AP-* (all), C-DEP-05 |

---

## 4. Out-of-Scope

- Live infrastructure (Vercel, DNS, Supabase hosted project `oyghbtzxurjtlwpraqpo`).
- Third-party vendor contracts (real KYC provider, payment processor).
- Regulatory licensing (money transmitter, BSA/AML officer appointment, state-by-state compliance).
- Production incident response / on-call setup.
- Visual design review (we report what is missing, not what looks pretty).
- Mobile native builds (iOS, Android) — pure web project.

---

## 5. Acceptance Contract

The editor's job is to produce a deep engineering handbook at
`/workspace/myonlinebank/audit/handbook/HANDBOOK.md` that includes:

- **Executive Summary** — overall verdict (SHIPPABLE / NEEDS-WORK / NOT-PRODUCTION-READY) + top 5 blockers
- **Scope, Methodology, Depth Contract**
- **Coverage Matrix** — every claim ID mapped to track + verdict
- **Architecture Overview**
- **Per-Module Findings** — preserve evidence from each track
- **Risk Register** — CRITICAL/HIGH/MEDIUM/LOW with evidence chains
- **Prioritized Fix Roadmap** — ≤15 items, first 5 are the highest-leverage blockers
- **Open Questions**
- **Appendices** — evidence inventory, build logs, raw notes

Plus `FIX-ROADMAP.md` — machine-readable checklist the next coder can pick up:
each item has ID, title, target paths, severity, effort (S/M/L), acceptance
criteria, status.