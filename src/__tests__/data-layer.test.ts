/**
 * Smoke tests for src/services/data-layer.ts (FIX-16).
 *
 * Verifies the smart-fallback behavior:
 *   - When Supabase env isn't set, returns ok(data) with the fallback (empty array)
 *   - When Supabase env IS set, would query the DB (we mock this via env stubbing)
 *
 * Auth flows in the data-layer are exercised separately in onboarding-api.test.ts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('data-layer.runQuery (env unset)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns ok with the fallback when Supabase is not configured', async () => {
    const { runQuery, isSupabaseConfigured } = await import('@/services/data-layer');
    expect(isSupabaseConfigured).toBe(false);
    const result = await runQuery(async () => {
      throw new Error('should never be called');
    }, []);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('returns ok with the fallback data when provided', async () => {
    const { runQuery } = await import('@/services/data-layer');
    const result = await runQuery(async () => ({ data: null, error: null }), { foo: 'bar' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ foo: 'bar' });
  });
});

describe('data-layer.ok / fail helpers', () => {
  it('ok() returns a success envelope', async () => {
    const { ok } = await import('@/services/data-layer');
    const env = ok([1, 2, 3]);
    expect(env).toEqual({ data: [1, 2, 3], success: true, error: null });
  });

  it('fail() returns a failure envelope', async () => {
    const { fail } = await import('@/services/data-layer');
    const env = fail('something broke');
    expect(env.success).toBe(false);
    expect(env.error).toBe('something broke');
    expect(env.data).toBeNull();
  });
});

describe('data-layer with Supabase env set', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'fake-anon-key-for-test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isSupabaseConfigured is true', async () => {
    const { isSupabaseConfigured } = await import('@/services/data-layer');
    expect(isSupabaseConfigured).toBe(true);
  });
});