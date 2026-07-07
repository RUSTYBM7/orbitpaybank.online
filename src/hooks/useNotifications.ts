/**
 * src/hooks/useNotifications.ts
 *
 * Member-portal hook that wires the realtime Supabase notification stream
 * (`notificationApi.subscribe`, channel `member-notifications`) into the
 * Zustand store + a transient on-screen toast.
 *
 * Mount this ONCE per session (e.g. in `UserApp.tsx`) so that opening and
 * closing the bell dropdown doesn't churn the realtime channel.
 *
 * If Supabase is not configured, `notificationApi.subscribe` is a no-op and
 * the hook simply returns the in-memory notifications from the store.
 */

import { useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { notificationApi } from '@/services/data-layer';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Notification } from '@/types';

/** Event name fired on `window` whenever a realtime notification arrives.
 *  Consumed by `<NotificationToaster />`. */
export const NOTIFICATION_TOAST_EVENT = 'orbitpay:notification-toast';

export interface UseNotifications {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * Coerce an arbitrary realtime row into the store's `Notification` shape.
 * Supabase returns snake_case columns (`user_id`, `created_at`) while the
 * store/UI uses camelCase, so we normalise defensively.
 */
export function normaliseNotification(row: unknown): Notification | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;

  const id =
    (r.id as string | undefined) ??
    `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const userId =
    (r.userId as string | undefined) ??
    (r.user_id as string | undefined) ??
    '';
  const title = (r.title as string | undefined) ?? 'New notification';
  const message =
    (r.message as string | undefined) ??
    (r.body as string | undefined) ??
    '';
  const rawType = (r.type as string | undefined) ?? 'system';
  const allowedTypes = new Set(['transaction', 'security', 'chat', 'kyc', 'system']);
  const type = (allowedTypes.has(rawType) ? rawType : 'system') as Notification['type'];
  const read =
    ((r.read as boolean | undefined) ?? !!(r.read_at as string | undefined)) ||
    false;
  const createdAt =
    (r.createdAt as string | undefined) ??
    (r.created_at as string | undefined) ??
    new Date().toISOString();

  return { id, userId, title, message, type, read, createdAt };
}

/**
 * Side-effects to run on every realtime INSERT. Extracted from the hook so
 * it can be unit-tested without mounting React. Side effects:
 *   1. Push the normalised row into the Zustand store (de-duped by id).
 *   2. Dispatch a window event so <NotificationToaster /> can flash a toast.
 *
 * Safe to call outside a browser (window undefined) — it just skips the
 * toast event in that case.
 */
export function handleRealtimeNotification(rawRow: unknown): void {
  const n = normaliseNotification(rawRow);
  if (!n) return;
  useStore.getState().addNotification(n);
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_TOAST_EVENT, { detail: n }),
      );
    }
  } catch {
    // Older runtimes without CustomEvent — ignore.
  }
}

export function useNotifications(): UseNotifications {
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);

  // Open the realtime channel exactly once per mount, close on unmount.
  // When Supabase isn't configured `subscribe` returns `() => {}` so this is
  // safe to call unconditionally — it will simply be a no-op.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsubscribe = notificationApi.subscribe(handleRealtimeNotification);
    return unsubscribe;
    // handleRealtimeNotification is a stable module-level reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markRead = (id: string) => markNotificationRead(id);

  const markAllRead = () => {
    const unread = notifications.filter((n) => !n.read);
    unread.forEach((n) => markNotificationRead(n.id));
  };

  return { notifications, unreadCount, markRead, markAllRead };
}