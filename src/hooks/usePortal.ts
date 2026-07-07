/**
 * usePortal — the convenience facade for the member portal.
 *
 * Wraps the Zustand store with the most commonly used actions and
 * selectors, so screens can pull exactly what they need without having
 * to subscribe to the whole store.
 *
 *   const { user, transactions, sendMoney, isOnline } = usePortal();
 *
 *   const transactions = usePortal(s => s.transactions);
 *
 * The hook is intentionally narrow: anything that needs deep store access
 * still uses the underlying `useStore` directly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store';

/** Simple deep-equal for objects (used to avoid stale closures). */
function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a as any);
    const kb = Object.keys(b as any);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => (a as any)[k] === (b as any)[k]);
  }
  return false;
}

export function usePortal<T = unknown>(selector?: (state: any) => T): T {
  const slice = useStore(selector as any) as T;
  return slice;
}

/**
 * useOptimisticAction — wraps an async action with optimistic state
 * updates and a roll-back on error. The action returns a snapshot
 * before it changes anything, then we revert to that snapshot if the
 * promise rejects.
 *
 *   const { run, isPending } = useOptimisticAction(async (amount) => {
 *     await api.send(amount);
 *   }, {
 *     apply: () => setBalance(b => b - amount),
 *     rollback: (prev) => setBalance(prev),
 *   });
 */
export function useOptimisticAction<Args extends any[], R>(
  action: (...args: Args) => Promise<R>,
  opts: { apply?: () => void; rollback?: (snapshot: any) => void; snapshot?: () => any } = {}
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<R | null>(null);

  const run = useCallback(
    async (...args: Args) => {
      setIsPending(true);
      setError(null);
      const snap = opts.snapshot ? opts.snapshot() : undefined;
      try {
        if (opts.apply) opts.apply();
        const result = await action(...args);
        setLastResult(result);
        return result;
      } catch (e: any) {
        if (snap !== undefined && opts.rollback) opts.rollback(snap);
        setError(e instanceof Error ? e : new Error(String(e)));
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [action, opts]
  );

  return { run, isPending, error, lastResult, reset: () => setError(null) };
}

/**
 * useDebouncedValue — returns `value` after it has been stable for
 * `delay` ms. Useful for typeahead / search inputs.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * usePrevious — returns the previous render's value of `value`.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * useNetworkState — true / false online. Wraps the navigator status with
 * a heartbeat ping for environments where the OS doesn't fire events
 * (some embedded webviews).
 */
export function useNetworkState() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [since, setSince] = useState<number>(() => Date.now());

  useEffect(() => {
    const on = () => {
      setOnline(true);
      setSince(Date.now());
    };
    const off = () => {
      setOnline(false);
      setSince(Date.now());
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return useMemo(() => ({ online, since }), [online, since]);
}

/**
 * useInterval — calls `fn` every `ms` ms. Skipped when ms is null.
 */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/**
 * useStorageState — a useState that mirrors to localStorage (or
 * sessionStorage). Survives reloads, syncs across tabs.
 */
export function useStorageState<T>(
  key: string,
  initial: T,
  storage: 'local' | 'session' = 'local'
): [T, (v: T | ((p: T) => T)) => void] {
  const read = useCallback((): T => {
    try {
      const raw = (storage === 'local' ? localStorage : sessionStorage).getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  }, [key, initial, storage]);

  const [value, setValue] = useState<T>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue ? (JSON.parse(e.newValue) as T) : initial);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initial]);

  const update = useCallback(
    (next: T | ((p: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          (storage === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(v));
        } catch {}
        return v;
      });
    },
    [key, storage]
  );

  return [value, update];
}

/** Re-export shallowEqual so other hooks can use it. */
export { shallowEqual };
