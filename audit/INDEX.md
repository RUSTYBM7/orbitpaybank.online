# OrbitPay MyOnlineBank — Audit Index

This directory contains the full audit deliverables.

## Reading order

1. **[`handbook/HANDBOOK.md`](handbook/HANDBOOK.md)** — start here. Executive summary + per-module findings + risk register + prioritized fix roadmap.
2. **[`handbook/FIX-ROADMAP.md`](handbook/FIX-ROADMAP.md)** — machine-readable checklist, ready to hand to a developer.
3. **`scope/coverage-matrix.md`** — every README claim has a stable ID + reality check.
4. **`track-readme/findings.md`** — Track A: README claims audit.
5. **`track-build/findings.md`** — Track B: build & runtime smoke test, plus raw build logs.
6. **`track-dbsec/findings.md`** — Track C: database, auth, security.
7. **`track-admin/findings.md`** — Track D: admin portal integration.

## Top-line verdict

**NOT-PRODUCTION-READY.** Both apps fail to build. 28 admin pages are empty shells.
The README fabricates at least 4 claims. The schema is 30% of what the README
promises. MFA, PWA service worker, tests, and a real backend are all missing.

## Top 5 blockers (in order)

1. Production build fails — 5 missing lib files (`src/lib/utils.ts`, `src/lib/supabase.ts`, `admin-portal/src/lib/api.ts`, `admin-portal/src/lib/api-live.ts`, `admin-portal/src/lib/mfa.ts`).
2. No real backend — API client points at `http://localhost:3001/api`.
3. Admin portal has no route guards.
4. Schema covers only ~30% of claimed modules.
5. Audit logging is decorative — no insert-only triggers.

## Next step

The fix roadmap in `handbook/FIX-ROADMAP.md` is organized into 4 phases totaling
9–15 days of work. Phase 1 (make it build) is 1–2 days and is the highest-leverage
starting point.