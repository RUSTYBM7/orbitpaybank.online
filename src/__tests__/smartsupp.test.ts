/**
 * Tests for the Smartsupp loader's environmental decisions. The actual
 * script-injection runs only in browser environments; we just verify
 * the read-side logic doesn't blow up in node (where this test runs).
 *
 * Safety property: when `VITE_SMARTSUPP_WIDGET_KEY` is not set, the
 * helper reports `enabled=false` and `loadSmartsuppWidget` returns
 * `false` without trying to touch `document` (the typeof guard
 * catches the SSR / test case).
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('smartsupp loader (read-side)', () => {
  beforeEach(() => {
    // Reset module cache so each test sees fresh env reads.
    vi.resetModules();
  });

  it('is disabled by default (no env var set)', async () => {
    const { isSmartsuppEnabled } = await import('@/services/smartsupp');
    expect(isSmartsuppEnabled()).toBe(false);
  });

  it('returns false from loadSmartsuppWidget when disabled', async () => {
    const { loadSmartsuppWidget } = await import('@/services/smartsupp');
    // Returns false without throwing, even in node where document is undefined.
    const result = loadSmartsuppWidget();
    expect(result).toBe(false);
  });

  it('does not throw in node (no document / no window)', async () => {
    const { loadSmartsuppWidget, isSmartsuppEnabled } = await import('@/services/smartsupp');
    expect(() => loadSmartsuppWidget()).not.toThrow();
    expect(() => isSmartsuppEnabled()).not.toThrow();
  });
});

import { vi } from 'vitest';