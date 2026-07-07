# Track A — README Claims Audit

Companion to: `audit/scope/coverage-matrix.md`
Files inspected: 155 in `src/`, 36 in `admin-portal/src/`, `supabase/schema.sql`, `package.json`, `vite.config.ts`, `.github/workflows/ci-cd.yml`, `public/manifest.json`

Verdict legend: **PRESENT** = fully implemented & reachable · **PARTIAL** = scaffolding only · **MISSING** = no code references the feature · **FABRICATED** = README claim contradicts the code.

---

## A.1 — Per-claim verdict (Member Portal)

| ID | Claim | Verdict | Evidence |
|----|-------|---------|----------|
| C-MP-01 | Multi-Currency Accounts (USD/EUR/GBP/BTC) | **PARTIAL** | `src/types/index.ts:9` defines `Currency = 'USD'\|'EUR'\|'GBP'\|'BTC'`. `src/services/mockData.ts:1-100` seeds mock balances for all four. **No exchange-rate engine, no BTC chain integration, no conversion math** — values are hard-coded numbers. |
| C-MP-02 | Instant Transfers (internal/external/wire/crypto) | **PARTIAL** | UI pages exist (`src/pages/UserApp.tsx` wraps `pages/user/Transfers*`). `mockData.ts` has `ScheduledTransfer` type. **No real transfer pipeline, no wire gateway, no crypto signing.** |
| C-MP-03 | Virtual & Physical Cards with spending controls | **PARTIAL** | `src/types/index.ts:11-12` defines `CardType`, `CardStatus`. `src/components/user/CardsSection.tsx` and `admin-portal/src/pages/Cards.tsx` render mock cards. **No card-network integration (Visa/Mastercard API), no PIN reset, no issuance.** |
| C-MP-04 | Bill Pay with automatic scheduling | **PARTIAL** | `src/types/index.ts:18` defines `OnboardingStep` and `BillPayment` types in `src/store/index.ts`. **No actual scheduler, no biller integration, no recurring cron.** |
| C-MP-05 | Loan Management (personal/home/auto/business) | **PARTIAL** | `src/types/index.ts:15-16` defines `LoanStatus`, `LoanType`. Mock loan data in `mockData.ts`. **No underwriting, no repayment schedule, no amortization calc.** |
| C-MP-06 | AI Financial Assistant | **MISSING for member portal** | `src/components/admin/AdminChat.tsx` exists but uses **hardcoded suggestion chips**, not an LLM call. **No OpenAI/Anthropic key in `.env.example`, no chat API.** Member portal has no AI assistant page at all. |
| C-MP-07 | KYC Verification | **PARTIAL** | `src/lib/onboarding-api.ts:1-60` defines KYC types and STUB function that "returns local validation results. In production, wire each function to Supabase or a backend microservice" (file comment). **`src/components/user/AccountCreationWizard.tsx` calls these stubs.** No real ID vendor integration. |
| C-MP-08 | Real-time Notifications | **PARTIAL** | `src/types/index.ts` defines `Notification`. `mockData.ts` seeds notifications. `admin-portal/src/pages/Notifications.tsx` renders them. **No realtime channel (WebSocket/SSE), no push notifications, no email/SMS gateway.** |
| C-MP-09 | PWA Support | **PARTIAL** | `public/manifest.json:1-50` is valid (name, icons, theme, scope). **No service worker registered** in `src/main.tsx:1-25`. Browser will not offer "Install" prompt without a SW. |
| C-MP-10 | Dark/Light Mode | **PRESENT** | `src/store/index.ts` has `darkMode` flag. Multiple components reference it (e.g. `useStore` selector). |
| C-MP-11 | Member MFA (TOTP) | **MISSING** | `src/components/auth/LoginModal.tsx` imports from missing `@/lib/supabase`. **No TOTP enrollment, no MFA challenge, no otplib usage in member portal.** Admin portal has otplib but the lib file is missing. |
| C-MP-12 | Session Management (auto-refresh, timeout) | **PARTIAL** | LoginModal calls `supabase.auth.signInWithPassword` (broken import). `src/services/api/admin.ts:30` stores `orbitpay_admin_token` in `localStorage` (XSS-prone). No session timeout, no refresh token rotation. |

## A.2 — Per-claim verdict (Admin Portal)

| ID | Claim | Verdict | Evidence |
|----|-------|---------|----------|
| C-AP-01 | Executive Dashboard (KPIs, charts) | **SHELL** | `admin-portal/src/pages/Dashboard.tsx` exists (imports `api.dashboardApi.getStats` from missing `@/lib/api-live`). |
| C-AP-02 | Member Management (CRUD, suspend) | **SHELL** | `Members.tsx` uses `useAdminStore` — store imports missing `@/lib/api`. |
| C-AP-03 | Account Operations (freeze, unfreeze, close) | **SHELL** | `Accounts.tsx` imports missing `@/lib/api-live`. |
| C-AP-04 | KYC Review Center | **SHELL** | `KYC.tsx` imports missing `@/lib/api-live`. |
| C-AP-05 | Loan Management | **SHELL** | `Loans.tsx` imports missing `@/lib/api-live`. |
| C-AP-06 | Card Operations | **SHELL** | `Cards.tsx` imports missing `@/lib/api-live`. |
| C-AP-07 | Transaction Center | **SHELL** | `Transactions.tsx` imports missing `@/lib/api-live`. |
| C-AP-08 | Fraud & Risk Monitoring | **SHELL** | `Fraud.tsx` imports missing `@/lib/api-live`. |
| C-AP-09 | Branch Management | **PARTIAL** | `Branches.tsx` reads `branches` from `useAdminStore`. Store has `branches: []` initial state. **No real branch CRUD wired to DB.** |
| C-AP-10 | Employee Management (RBAC) | **PARTIAL** | `authStore.ts:1-30` defines `Permission` and `Role` enums. **No enforcement in route guards** (admin-portal/src/App.tsx has no auth-check wrapper). |
| C-AP-11 | Financial Oversight | **SHELL** | `Financial.tsx` imports missing `@/lib/api-live`. |
| C-AP-12 | Compliance Center | **SHELL** | `Compliance.tsx` imports missing `@/lib/api-live`. |
| C-AP-13 | Audit Logging | **PARTIAL** | `supabase/schema.sql` defines `audit_logs` table with 9 RLS policies. Admin store defines `AuditLog` interface. **No INSERT trigger enforcing immutability; no admin-action middleware that writes logs automatically.** |
| C-AP-14 | System Settings | **SHELL** | `Settings.tsx` imports missing `@/lib/api-live`. |
| C-AP-15 | Help Desk | **SHELL** | `Support.tsx` imports missing `@/lib/api-live`. |
| C-AP-16 | AI Operations Assistant | **PARTIAL (not LLM)** | `admin-portal/src/pages/AIAssistant.tsx:54-200` is a **hardcoded keyword matcher** — branches on `lower.includes('high-risk')`, `'revenue'`, `'fraud'`, `'kyc'` etc. **No LLM call, no API key, no streaming.** |
| C-AP-17 | Marketing | **SHELL** | `Marketing.tsx` imports missing `@/lib/api-live`. |
| C-AP-18 | CMS | **SHELL** | `CMS.tsx` imports missing `@/lib/api-live`. |
| C-AP-19 | Reports | **SHELL** | `Reports.tsx` imports missing `@/lib/api-live`. |
| C-AP-20 | Notifications | **SHELL** | `Notifications.tsx` imports missing `@/lib/api-live`. |
| C-AP-21 | Documents | **SHELL** | `Documents.tsx` imports missing `@/lib/api-live`. |
| C-AP-22 | Communications | **SHELL** | `Communications.tsx` imports missing `@/lib/api-live`. |
| C-AP-23 | Verification | **SHELL** | `Verification.tsx` imports missing `@/lib/api-live`. |
| C-AP-24 | Statements | **SHELL** | `Statements.tsx` imports missing `@/lib/api-live`. |
| C-AP-25 | Investments | **SHELL** | `Investments.tsx` imports missing `@/lib/api-live`. |
| C-AP-26 | Impersonation | **SHELL** | `Impersonation.tsx` imports missing `@/lib/api-live`. **Also a security risk if implemented: requires very strong audit + consent flow.** |
| C-AP-27 | Automation | **SHELL** | `Automation.tsx` imports missing `@/lib/api-live`. |

## A.3 — Per-claim verdict (Security & Quality)

| ID | Claim | Verdict | Evidence |
|----|-------|---------|----------|
| C-SEC-01 | MFA / TOTP | **PARTIAL** (admin only, broken) | `admin-portal/package.json:13-14` has `otplib@^13.4.1`, `@otplib/core@^13.4.1`, `qrcode@^1.5.4`. **But `admin-portal/src/lib/mfa.ts` does not exist**, so admin authStore import fails. Member portal: NO MFA. |
| C-SEC-02 | Session auto-refresh / timeout | **MISSING** | No refresh-token rotation logic. Admin tokens in `localStorage` (XSS-prone). |
| C-SEC-03 | All admin actions logged | **PARTIAL** | `audit_logs` table + RLS policy exists. **No trigger or middleware enforces writes from every admin action.** |
| C-SEC-04 | Role-based access | **PARTIAL** | `authStore.ts:6-30` defines 60+ permission strings. **No route-guard wrapper in `App.tsx`.** Anyone can navigate to `/fraud`, `/audit`, `/members`. |
| C-SEC-05 | Supabase RLS | **PARTIAL** | 9 policies for 10 tables (members, accounts, cards, transactions, loans, kyc_documents, employees, audit_logs). `ledger_entries`, `fraud_alerts` have NO policies (anyone with anon key can read/write). |
| C-SEC-06 | Security headers (X-Frame-Options, CSP) | **PARTIAL** | `vite.config.ts:11-37` injects X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy via `transformIndexHtml`. **No CSP, no HSTS, no Permissions-Policy granular controls.** |
| C-SEC-07 | Zod validation | **PARTIAL** | `zod@^4.3.5` in deps. **Not used at any API boundary** (no backend exists to validate). May be used in form components — verify in fix cycle. |
| C-SEC-09 | Demo MFA "any 6-digit code" | **FABRICATED** | No MFA challenge UI in member portal. Admin MFA lib is missing entirely. |
| C-QA-01 | React 19 + TypeScript 5.9 | **PRESENT** | `package.json:22` has `react@^19.2.0`. `tsconfig.json` strict. |
| C-QA-02 | Vite 7.3 | **PRESENT** (close) | `package.json:34` has `vite@^7.2.4`. Actual installed is 7.3.6. |
| C-QA-03 | TailwindCSS 4 | **FABRICATED** | `package.json:31` and `admin-portal/package.json:24` both have `tailwindcss@^3.4.19`. |
| C-QA-04 | Framer Motion 12 | **PRESENT** | `package.json:23`. |
| C-QA-05 | Zustand 5 | **PRESENT** | `package.json:27`. |
| C-QA-06 | React Router 7 | **PRESENT** | `package.json:24`. |
| C-QA-07 | Supabase PostgreSQL | **PARTIAL** | Schema exists, no client wired. |
| C-QA-08 | TOTP library | **PRESENT (admin only)** | otplib in admin deps. |
| C-QA-09 | Recharts | **PRESENT** | `package.json:25`. |
| C-QA-10 | Lint CI step | **PRESENT** | `.github/workflows/ci-cd.yml:25-35`. |
| C-QA-11 | Build CI step | **PRESENT** | ci-cd.yml:38-72. |
| C-QA-12 | **Test** CI step | **FABRICATED** | **No test job in ci-cd.yml. No test files anywhere in repo.** |
| C-QA-13 | Deploy CI step | **PRESENT** | ci-cd.yml:88-117. |
| C-QA-14 | Node.js 18+ required | **PRESENT** | ci-cd.yml uses Node 20. |
| C-QA-15 | pnpm 8+ or npm 9+ | **PRESENT** | `npm 10.9.2` works; no pnpm lockfile. README allows both. |

## A.4 — Critical Gaps (FABRICATED or MISSING, ordered by blast radius)

1. **The project does not compile.** Both `npm run build` runs fail. Member portal: missing `@/lib/supabase` and `@/lib/utils`. Admin portal: missing `@/lib/api`, `@/lib/api-live`, `@/lib/mfa`. Demo "works" because `npm run dev` uses lazy module resolution that skips broken paths until route hits.

2. **No real backend.** Member portal API service layer (`src/services/api/index.ts`) points at `http://localhost:3001/api` — a backend that does not exist. All "live" data flows through mockData.ts.

3. **Tailwind v4 claim is fabricated.** README says 4, actual is 3.4. This affects component class usage (some v4-only utilities may not work).

4. **No MFA on member portal.** README claims MFA for everyone. Only the admin portal has otplib in deps, and even there the lib file is missing.

5. **No tests.** Zero test files. CI has no test job. The README badge "Test: Unit and integration tests" is fabricated.

6. **PWA is half-built.** Manifest exists but no service worker. App is not installable on mobile.

7. **No realtime notifications.** No WebSocket, no SSE, no Supabase realtime channel.

8. **AI Assistant is a keyword matcher.** `admin-portal/src/pages/AIAssistant.tsx:54-200` branches on `query.toLowerCase().includes(...)` — not an LLM call.

9. **Schema is shallow.** 10 real tables for a banking platform claiming 25+ modules. Tables missing: branches, transfers, crypto_balances, billers, notifications, support_tickets, marketing_campaigns, cms_pages, reports, documents, statements, investments, automation_rules, etc.

10. **Impersonation page exists but is unimplemented.** `Impersonation.tsx` is one of the most security-sensitive admin features — should not ship without strong audit + consent + scope-limited auth.

## A.5 — Quick-Win Fixes (PARTIAL → PRESENT, ≤30 min each)

- **QW-1**: Create `src/lib/utils.ts` with the standard `cn` helper from shadcn. Restores ~15 components.
- **QW-2**: Fix duplicate `transactions:` key in `src/store/index.ts:146 vs 202` — move seed data into `seedData()` action instead of inline.
- **QW-3**: Add a `service-worker.js` to `public/` with basic cache-first strategy. Register in `main.tsx`. Activates PWA install prompt.
- **QW-4**: Add CSP meta tag in `vite.config.ts:transformIndexHtml`.
- **QW-5**: Bump `package.json` version to `2.0.0` to match the README badge.
- **QW-6**: Remove `localStorage.setItem('orbitpay_admin_token', ...)` from `src/services/api/admin.ts:30` — replace with in-memory variable only.
- **QW-7**: Add a top-level `src/lib/supabase.ts` that exports a stubbed `supabase` client (just to satisfy imports) — even if not wired to real Supabase, it unblocks builds.
- **QW-8**: Add the same stub `admin-portal/src/lib/api-live.ts`, `api.ts`, `mfa.ts` to unblock admin builds.