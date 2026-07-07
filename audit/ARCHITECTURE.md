# OrbitPay — Data Layer Architecture (FIX-11+)

**Date:** 2026-07-05

This document captures the data-layer architecture after wiring the frontend
to real Supabase queries. Read this before adding new APIs.

---

## The shape of the problem

The original codebase had two completely separate ways data flowed:

1. **Member portal** (`src/services/api/`) — `fetch()` calls to
   `http://localhost:3001/api`, a backend that doesn't exist. Every page
   that hit the API got a network error.
2. **Admin portal** (`admin-portal/src/store/adminStore.ts`) — called
   `api.X.Y()` against a missing module, so the admin portal didn't
   even build (Phase 1 fix).

The fix is the same in both apps: **query Supabase directly from the
browser**, with the schema's RLS policies enforcing access control.

## The pattern

```
Browser
  ├─ Member Portal  ────► src/services/data-layer.ts ────► Supabase (anon key + RLS)
  └─ Admin Portal   ────► admin-portal/src/lib/data-layer.ts ► Supabase (anon key + RLS)
                                │
                                └─► if env unset: in-memory store (demo mode)
```

Every public API method follows the same shape:

```ts
async list(filters) {
  if (!isSupabaseConfigured || !supabase) {
    return ok(useStore.getState().accounts); // demo fallback
  }
  return runQuery(async () => {
    let q = supabase!.from('accounts').select('*')...
    return q;
  }, []);
}
```

`runQuery()` wraps the Supabase result in a uniform `ApiEnvelope<T>`:

```ts
{ data: T, success: boolean, error: string | null }
```

So the consumer (adminStore, page component) doesn't have to branch on
"is this real or stub?" — both paths return the same shape.

## Why direct-from-browser queries (not a backend)?

Supabase's design assumes the browser is the data client. The RLS policies
do the access-control work that an Express middleware would otherwise do.
This avoids needing a Node/Express backend for a CRUD-heavy app.

**Pros:**
- No custom backend to deploy.
- RLS gives per-row access control automatically.
- Real-time subscriptions (Supabase channels) work for free.
- Storage (file uploads) works the same way.

**Trade-offs:**
- Complex joins and aggregations happen in the browser (fine for ≤10k
  rows, bad at scale).
- Anything that needs service-role privileges (e.g. impersonation) must
  go through an Edge Function, not the browser.
- Server-side validation (e.g. transaction limits) needs Edge Functions.

## When to add a Supabase Edge Function

Use a Deno Edge Function (deployed via `supabase functions deploy`) when:

- You need to bypass RLS (e.g. fraud sweep, system-wide reports).
- You need to call external APIs (Plaid, Stripe, Twilio) with their
  secret keys.
- You need server-side validation of mutations (e.g. "balance cannot
  go below $0").
- You need to schedule jobs (cron-like, e.g. monthly statements).
- You need to send email/SMS/push notifications.

The current implementation does NOT include Edge Functions. To add one:

```bash
supabase functions new my-function
# write Deno/TypeScript handler in supabase/functions/my-function/index.ts
supabase functions deploy my-function --project-ref <ref>
```

Then call it from the frontend:
```ts
const { data, error } = await supabase.functions.invoke('my-function', { body: {...} });
```

## Files added / changed in this round

### Member portal
- `src/services/data-layer.ts` — NEW — 600+ lines, all member-facing APIs.
- `src/services/api/index.ts` — REWRITTEN — re-exports from data-layer.ts.
- `src/__tests__/data-layer.test.ts` — NEW — 5 tests.
- `src/lib/supabase.ts` — already exists (FIX-02).
- `src/lib/onboarding-api.ts` — already wired correctly (pre-existing).

### Admin portal
- `admin-portal/src/lib/supabase.ts` — NEW — env-gated client (mirrors member).
- `admin-portal/src/lib/data-layer.ts` — NEW — 600+ lines, all admin APIs.
- `admin-portal/src/lib/api.ts` — REWRITTEN — re-exports.
- `admin-portal/src/lib/api-live.ts` — REWRITTEN — re-exports + long-tail.
- `admin-portal/src/lib/api-stub.ts` — KEPT — still useful for tests.
- `admin-portal/src/__tests__/data-layer.test.ts` — NEW — 5 tests.

### Shared
- `supabase/schema.sql` — already had 32 tables, 48 RLS policies.
  The data-layer.ts queries match these tables 1-to-1.

## How to add a new API method

Suppose you need `membersApi.search(query)`:

1. **Add the table query** in `admin-portal/src/lib/data-layer.ts`:
   ```ts
   export const membersApi = {
     // ...existing methods...
     async search(query: string) {
       return runQuery(async () =>
         supabase!.from('members').select('*')
           .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
           .limit(20),
       []);
     },
   };
   ```

2. **No changes needed** in `api.ts` / `api-live.ts` (they re-export).

3. **Use it** in a page or store:
   ```ts
   const result = await membersApi.search('smith');
   if (result.success) setMembers(result.data);
   ```

4. **Test it** (mock-friendly because of the env-gated pattern):
   ```ts
   // Stub test: without env, returns empty array
   const result = await membersApi.search('smith');
   expect(result.data).toEqual([]);
   ```

## Open items / future work

1. **Edge Functions** — when the team is ready to add real server-side
   logic (fraud sweeps, scheduled jobs, external API calls).
2. **Realtime subscriptions** — `notificationApi.subscribe` is wired
   but unused. Pages can subscribe in a `useEffect`.
3. **Aggregations** — dashboard stats currently do 5 queries in parallel;
   for large datasets, materialize a daily rollup view.
4. **Error UX** — the data layer returns errors in the envelope, but
   components currently `console.error` and move on. A proper error
   toast layer is the next polish item.

---

## Local dev vs production: side-by-side

### Local dev (no env)
- App boots, runs `seedData()` from `src/services/mockData.ts`.
- Zustand store has demo users, accounts, transactions.
- Admin pages render `[]` for everything.
- Useful for design review, Storybook, screenshots.

### Local dev with env (.env.local pointing at a dev Supabase project)
- `isSupabaseConfigured = true`.
- Each `runQuery()` calls Supabase.
- RLS policies gate rows: members see own, employees see all.
- The mockData seed becomes irrelevant (no `seedData()` call needed).

### Production
- Same as local-with-env but pointing at prod Supabase.
- Add an Edge Function for any operation that needs to bypass RLS.
- Set up scheduled Edge Functions for: monthly statements, fraud sweeps,
  daily dashboard rollup.

---

## Test totals after this round

```
member portal:  12 tests pass (utils, supabase, data-layer)
admin portal:   20 tests pass (mfa, api-stub, data-layer)
```

Both apps build green. CI runs both test suites.