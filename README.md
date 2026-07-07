# OrbitPay Credit Union

Enterprise digital banking platform — member portal + admin operations, end-to-end.

| | |
|---|---|
| **Live** | https://orbitpaybank.online |
| **Stack** | React 19 · TypeScript · Vite 7 · Zustand · Supabase · framer-motion |
| **Tests** | 56 member + 28 admin = 84 passing |
| **Bundle** | 1.15 MB main, 22 lazy-loaded route chunks (avg 12 KB each) |
| **License** | MIT |

---

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in your Supabase + Smartsupp keys
npm run dev                       # http://localhost:5173
npm run test                      # vitest
npm run build                     # production build → dist/

# Admin portal (separate Vite app, on port 5174)
cd admin-portal
npm install
npm run dev
```

---

## Layout

```
/
├── src/                      # Member portal + public pages
│   ├── pages/
│   │   ├── public/           # 19 marketing/info pages (lazy)
│   │   ├── auth/             # 22 auth flow pages (lazy)
│   │   ├── enroll/           # Product enrollment hub (lazy)
│   │   ├── applicant/        # Applicant dashboard (lazy)
│   │   ├── support/          # Chat / AI / ticket pages (lazy)
│   │   └── UserApp.tsx       # Authenticated member portal (37 routes)
│   ├── components/
│   │   ├── user/             # Member-portal screens (HomeScreen, etc.)
│   │   ├── auth/             # AuthShell, AuthField, AuthButton
│   │   ├── public/           # PublicNav, PublicFooter, SupportButton, brandLogos
│   │   ├── onboard/          # OnboardWizard (10-step enrollment)
│   │   ├── bright/           # BrightCard, currency pills, phone mockup
│   │   ├── glass/            # GlassCard, GlassBadge, GlassButton, etc.
│   │   └── ui/               # shadcn/ui primitives (button, dialog, …)
│   ├── hooks/                # useNotifications, useAgentSupport, usePortal, …
│   ├── services/             # supabase client, smartsupp loader, data-layer
│   ├── state/                # notifications reducer
│   ├── store/                # Zustand store
│   ├── i18n/                 # 4 languages, 8 namespaces
│   ├── __tests__/            # Vitest suite + full-repair-audit
│   ├── App.tsx               # Top-level router (lazy routes)
│   └── main.tsx              # Entry
│
├── admin-portal/             # Separate Vite app, /admin/*
│   └── src/
│       ├── pages/            # AdminDashboard, AdminOverview, etc.
│       └── store/            # Admin Zustand store
│
├── public/                   # Static assets (logo, images, videos)
├── supabase/                 # Schema + edge functions
│   ├── schema.sql            # RLS policies + tables
│   └── functions/            # request-otp, send-payout-sms, fraud-sweep
├── audit/                    # Initial security + build audit
├── docs/                     # Handbooks + setup guides
├── scripts/                  # Deploy scripts
├── .github/workflows/        # CI/CD (lint + test + build + deploy)
└── vercel.json               # Vercel config (output: dist, SPA rewrites)
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server with HMR |
| `npm run test` | Run member-portal test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint (non-blocking) |

For the admin portal, run the same commands inside `admin-portal/`.

---

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push to `main`:

1. Lint + type-check
2. Test member + admin portals (84 tests total)
3. Build both
4. Deploy via Vercel Action (requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_*` repo secrets)

The workflow uses **scoped secrets** — never paste Vercel or Smartsupp tokens into chat or source code.

---

## Build-time safety net

`src/__tests__/full-repair-audit.test.ts` runs every CI build and asserts:

1. **Every `<Foo />` JSX reference has a matching import or local declaration** — catches the `ArrowUpRight`, `Dashboard3D`, `LineChart` class of bug that crashes at render time.
2. **Every `import.meta.env.VITE_*` read has a canonical definition** in `.env*` files — catches silently-undefined env vars.
3. **Every dynamic `import('...')` resolves to an installed package** — catches typos that would fail at chunk-load time.

Together with `no-missing-imports.test.ts`, these tests cover every class of "Can't find variable" crash that's been hit in development.

---

## Environment variables

See `.env.example` for the canonical reference. All `VITE_*` vars ship to client bundles.

| Var | Purpose | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon JWT (safe to ship) | yes |
| `VITE_SMARTSUPP_WIDGET_KEY` | Smartsupp widget key (public, ~36 char) | optional |
| `VITE_SMARTSUPP_LABEL` | Label shown above the chat | optional |
| `VITE_BUILD_SHA` | Git SHA injected into footer | optional |
| `VITE_API_URL` | Base URL for admin/portal REST | optional |

⚠️ **The Smartsupp SECRET API key (40 hex chars) is server-side only.** Never put it in a `VITE_*` var, never ship it in client bundles. If you've accidentally pasted it anywhere, rotate it in the Smartsupp dashboard.

---

## Deployment

### One-time setup

1. Create two Vercel projects (`user-portal`, `admin-portal`) or use existing.
2. Add `orbitpaybank.online` as custom domain on `user-portal`.
3. Create a GitHub PAT with `repo:contents:write` scope and add as `VERCEL_TOKEN` repo secret (or use a Vercel-deploy-hook URL).
4. Add the env vars above to each Vercel project.

### One-command deploy from your laptop

```bash
bash scripts/deploy.sh
```

This script does `vercel link` + `vercel deploy --prod` against the project configured in `.vercel/project.json`.

---

## Documentation

- `docs/SMARTSUPP_SETUP.md` — How to wire Smartsupp correctly (without leaking the secret key).
- `audit/` — Initial security + build audit (4 tracks: README claims, runtime, DB, admin).
- `docs/FIX-ROADMAP.md` — Phased plan for the production-readiness work.
- `supabase/schema.sql` — Database schema with RLS policies.

---

## License

MIT © OrbitPay Credit Union