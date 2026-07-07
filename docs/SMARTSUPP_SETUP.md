# Smartsupp + Vercel deploy setup

> Two pieces. Each needs a credential you plug in **on your own**
> (Vercel project env vars, GitHub repo secrets). The build reads
> from those secrets at deploy time — no tokens ever pass through
> chat, AI assistants, or source code.

---

## 1. Smartsupp live-chat widget

### What we built
- `src/services/smartsupp.ts` — reads `VITE_SMARTSUPP_WIDGET_KEY`,
  injects Smartsupp's loader script on the public site **only when
  the env var is set**. Idempotent. SSR-safe.
- `src/components/public/SupportButton.tsx` — when the widget key
  is configured and a visitor clicks **"Chat with a human"**, the
  in-portal button shows a handoff message ("we've connected you
  with a live agent — look for the chat bubble in the corner") and
  Smartsupp's own UI takes over.
- `src/hooks/useAgentSupport.ts` — for the **member portal**
  (`/app`) flow. Uses Supabase Realtime with RLS so a member's
  support thread is scoped to their own auth.uid, and the agent
  sees incoming messages in their dashboard in real time. **No
  Smartsupp secret key is involved.**

### What you need to do
1. Log into https://www.smartsupp.com → Settings → **Channels** →
   **Chat widget**. Copy the **Widget key** (looks like a 36-char
   alphanumeric token, e.g. `abc123def456...`).
2. **Do not paste** the **Secret API key** (40 hex chars) anywhere
   it could leak. If you've already pasted one into chat, **rotate
   it** in the Smartsupp dashboard now — it's compromised.
3. In your Vercel project dashboard → Settings → Environment
   Variables, add:
   - `VITE_SMARTSUPP_WIDGET_KEY` = (the widget key from step 1)
   - `VITE_SMARTSUPP_LABEL` = `OrbitPay Support` (optional)
4. Redeploy. The build picks up the env var automatically.

### For local development
Create `.env.local` in the repo root (this file is git-ignored):

```
VITE_SMARTSUPP_WIDGET_KEY=your_widget_key_here
```

`npm run dev` will load the widget.

### Verification checklist
- [ ] Visit any public page → no Smartsupp UI in dev (env var unset)
- [ ] Set `VITE_SMARTSUPP_WIDGET_KEY` in Vercel → redeploy → visit a
      page → Smartsupp bubble appears bottom-right
- [ ] Click the in-app support button → "Chat with a human" → message
      says "we've connected you with a live agent — look for the
      chat bubble in the corner"
- [ ] Sign in to your Smartsupp agent dashboard → the visitor
      conversation appears in real time

---

## 2. Deploy to Vercel (orbitpaybank.online)

### What's already wired
- `.github/workflows/ci-cd.yml` — push to `main` →
  - lint + type-check
  - run unit tests (member + admin)
  - build member portal + admin portal
  - deploy member to `${{ secrets.VERCEL_PROJECT_ID_MEMBER }}`
  - deploy admin to `${{ secrets.VERCEL_PROJECT_ID_ADMIN }}`

All Vercel credentials come from **GitHub repo secrets**. They are
**never** stored in code or sent through any AI assistant.

### One-time setup (you do this, in your browser)
1. Create two Vercel projects (or use existing):
   - `orbitpay-member` (root: this repo)
   - `orbitpay-admin` (root: `admin-portal/`)
2. Add the custom domain `orbitpaybank.online` to `orbitpay-member`.
3. In each project's Settings → General, copy:
   - **Project ID** (24-char string)
4. Get the rest of the values:
   - **VERCEL_TOKEN** — Vercel → Settings → Tokens → Create Token
     (scope: the two projects above, no broader). Name it
     "GitHub Actions deploy".
   - **VERCEL_ORG_ID** — Vercel → Settings → General → "Your
     Teams" → click your team → URL contains `team_xxx`. Copy the
     `team_xxx` value.
5. In GitHub → your repo → Settings → Secrets and variables →
   Actions → **New repository secret**, add:
   - `VERCEL_TOKEN` = the token
   - `VERCEL_ORG_ID` = the team id
   - `VERCEL_PROJECT_ID_MEMBER` = the member project id
   - `VERCEL_PROJECT_ID_ADMIN` = the admin project id
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. `git push origin main` — the workflow deploys both portals.

### Verification checklist
- [ ] GitHub repo → Actions tab shows the latest run as green
- [ ] Vercel dashboard shows the latest deployment for both
      projects
- [ ] `https://orbitpaybank.online/` loads the member portal
- [ ] `https://orbitpaybank.online/admin` loads the admin portal
- [ ] `/admin` returns 200 with no console errors
- [ ] Smartsupp bubble appears on every public page (only if
      `VITE_SMARTSUPP_WIDGET_KEY` is set in Vercel env)

---

## 3. Why this design

- **Tokens stay scoped.** Vercel PAT is scoped to two projects;
  GitHub secret is scoped to one repo; Smartsupp widget key is
  public-by-design.
- **No man-in-the-middle.** Member → Supabase Realtime → Agent
  (scoped JWT, RLS-enforced). No AI in the loop reading customer
  conversations.
- **Public widget, private server.** Smartsupp widget key only goes
  in client bundles where Smartsupp expects it. Secret key never
  leaves your Smartsupp account.
- **Cache-busted deploy.** Each Vercel deploy gets a unique SHA in
  the build, so the CDN always serves fresh assets.