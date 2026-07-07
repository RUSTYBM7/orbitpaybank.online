/**
 * Smoke tests for admin-portal/src/lib/data-layer.ts (FIX-16).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('admin data-layer.runQuery (env unset)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns ok with fallback when Supabase is not configured (factory NOT called)', async () => {
    const { runQuery, isSupabaseConfigured } = await import('@/lib/data-layer');
    expect(isSupabaseConfigured).toBe(false);
    let factoryCalled = false;
    const result = await runQuery(async () => {
      factoryCalled = true;
      return { data: null, error: null };
    }, []);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(factoryCalled).toBe(false);
  });
});

describe('admin data-layer.runQuery (env set)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'fake-anon-key-for-test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('runs the query factory and returns its data on success', async () => {
    const { runQuery } = await import('@/lib/data-layer');
    const fakeRows = [{ id: '1' }, { id: '2' }];
    const result = await runQuery(async () => ({ data: fakeRows, error: null }), []);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(fakeRows);
  });

  it('returns error envelope when query factory throws', async () => {
    const { runQuery } = await import('@/lib/data-layer');
    const result = await runQuery(async () => { throw new Error('boom'); }, []);
    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
    expect(result.data).toEqual([]); // fallback still returned
  });
});

describe('admin data-layer ok/fail helpers', () => {
  it('ok returns success envelope', async () => {
    const { ok } = await import('@/lib/data-layer');
    expect(ok({ x: 1 })).toEqual({ data: { x: 1 }, success: true, error: null });
  });
  it('fail returns failure envelope', async () => {
    const { fail } = await import('@/lib/data-layer');
    expect(fail('err')).toEqual({ data: null, success: false, error: 'err' });
  });
});