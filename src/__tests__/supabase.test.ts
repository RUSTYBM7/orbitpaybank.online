/**
 * Smoke tests for src/lib/supabase.ts (FIX-16).
 * Verifies the stub behavior when env is missing or set.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function loadSupabase() {
  // Each call resets the module cache so supabase.ts re-runs its top-level
  // createClient() against the current vi.stubEnv() values.
  vi.resetModules();
  return import('@/lib/supabase');
}

describe('supabase stub (env unset)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null and isSupabaseConfigured=false when env is missing', async () => {
    const mod = await loadSupabase();
    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.supabase).toBeNull();
    expect(mod.getSupabase()).toBeNull();
  });
});

describe('supabase client (env set)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'fake-anon-key-for-test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isSupabaseConfigured=true and supabase is a client instance', async () => {
    const mod = await loadSupabase();
    expect(mod.isSupabaseConfigured).toBe(true);
    expect(mod.supabase).not.toBeNull();
  });
});