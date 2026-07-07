/**
 * Smoke tests for the realtime notification wiring
 * (src/hooks/useNotifications.ts).
 *
 * The hook itself is React-only, so we test the two pieces of pure logic
 * it composes:
 *
 *   1. `notificationApi.subscribe` is the integration point with Supabase
 *      realtime. We mock it to capture the callback the hook would pass.
 *      Firing that callback with a row is exactly what the Supabase
 *      `postgres_changes` listener would do on each INSERT.
 *   2. `handleRealtimeNotification` is the function the hook passes to
 *      `subscribe`. Invoking it must:
 *        - normalise the row shape (snake_case Supabase → camelCase store)
 *        - grow `useStore.getState().notifications` by exactly one
 *        - de-duplicate by id if the same row arrives more than once
 *
 * No real Supabase connection is attempted.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useNotifications handler logic', () => {
  beforeEach(async () => {
    vi.resetModules();
    // Reset the store's notifications between tests so they don't bleed.
    const { useStore } = await import('@/store');
    useStore.setState({ notifications: [] });
  });

  it('captures the callback passed to notificationApi.subscribe and grows the store when fired', async () => {
    // 1) Mock the data-layer so `notificationApi.subscribe` is a no-op that
    //    captures whatever callback the hook would pass to it.
    let captured: ((row: unknown) => void) | null = null;
    const subscribe = vi.fn((onMessage: (row: unknown) => void) => {
      captured = onMessage;
      return () => {
        captured = null;
      };
    });
    vi.doMock('@/services/data-layer', () => ({
      notificationApi: { subscribe },
    }));

    // 2) Import the hook. The hook is React-only — we don't render it here
    //    (vitest is in `node` env, no React renderer is installed). What we
    //    DO do is mirror the hook's wiring exactly: import its standalone
    //    `handleRealtimeNotification` and pass it as the subscribe callback.
    const { useStore } = await import('@/store');
    const { notificationApi } = await import('@/services/data-layer');
    const { handleRealtimeNotification } = await import('@/hooks/useNotifications');

    const unsubscribe = notificationApi.subscribe(handleRealtimeNotification);
    expect(typeof unsubscribe).toBe('function');
    expect(typeof captured).toBe('function');

    // 3) Fire the captured callback with a snake_case Supabase row.
    const before = useStore.getState().notifications.length;
    const sampleRow = {
      id: 'rt_row_1',
      user_id: 'demo-user',
      title: 'Transfer received',
      message: 'You got $42 from Aisha',
      type: 'transaction',
      created_at: '2026-07-12T12:00:00Z',
    };
    captured!(sampleRow);

    // 4) The store should have grown by exactly one, with the normalised shape.
    const after = useStore.getState().notifications;
    expect(after.length).toBe(before + 1);
    expect(after[0].id).toBe('rt_row_1');
    expect(after[0].title).toBe('Transfer received');
    expect(after[0].message).toBe('You got $42 from Aisha');
    expect(after[0].type).toBe('transaction');
    expect(after[0].userId).toBe('demo-user');
    expect(after[0].read).toBe(false);
    expect(after[0].createdAt).toBe('2026-07-12T12:00:00Z');

    // 5) The unsubscribe returned by subscribe should be safe to call.
    expect(() => unsubscribe()).not.toThrow();
    expect(captured).toBeNull();
  });

  it('falls back gracefully when subscribe is a no-op (Supabase env unset)', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const { isSupabaseConfigured } = await import('@/lib/supabase');
    expect(isSupabaseConfigured).toBe(false);

    // The data-layer's notificationApi.subscribe returns `() => {}` when env
    // is unset. Mirror that here and confirm nothing crashes.
    const subscribe = vi.fn(() => () => {});
    vi.doMock('@/services/data-layer', () => ({
      notificationApi: { subscribe },
    }));

    const { notificationApi } = await import('@/services/data-layer');
    const { handleRealtimeNotification } = await import('@/hooks/useNotifications');

    const unsubscribe = notificationApi.subscribe(handleRealtimeNotification);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe(); // no-op, must not throw

    // The handler still works as a standalone function (e.g. if called
    // directly by a unit test or future debug surface).
    expect(() => handleRealtimeNotification({ id: 'a', title: 't', message: 'm', type: 'system' })).not.toThrow();
  });

  it('de-duplicates notifications by id', async () => {
    const { useStore } = await import('@/store');
    const { handleRealtimeNotification } = await import('@/hooks/useNotifications');
    useStore.setState({ notifications: [] });

    const row = {
      id: 'dup_1',
      title: 'Hello',
      message: 'world',
      type: 'system' as const,
      createdAt: '2026-07-12T00:00:00Z',
    };
    handleRealtimeNotification(row);
    handleRealtimeNotification(row);
    handleRealtimeNotification(row);

    const list = useStore.getState().notifications;
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('dup_1');
  });

  it('normaliseNotification converts snake_case Supabase rows to camelCase', async () => {
    const { normaliseNotification } = await import('@/hooks/useNotifications');
    const n = normaliseNotification({
      id: 'snake_1',
      user_id: 'u_42',
      title: 'Security alert',
      body: 'New login from Lagos',
      type: 'security',
      created_at: '2026-07-12T00:00:00Z',
      read_at: null,
    });
    expect(n).not.toBeNull();
    expect(n!.userId).toBe('u_42');
    expect(n!.message).toBe('New login from Lagos');
    expect(n!.createdAt).toBe('2026-07-12T00:00:00Z');
    expect(n!.read).toBe(false);
    expect(n!.type).toBe('security');
  });

  it('normaliseNotification falls back to safe defaults when fields are missing', async () => {
    const { normaliseNotification } = await import('@/hooks/useNotifications');
    const n = normaliseNotification({});
    expect(n).not.toBeNull();
    expect(n!.title).toBe('New notification');
    expect(n!.type).toBe('system');
    expect(n!.message).toBe('');
    expect(n!.id).toMatch(/^notif_/);
    expect(new Date(n!.createdAt).toString()).not.toBe('Invalid Date');
  });
});