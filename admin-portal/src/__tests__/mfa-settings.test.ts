/**
 * admin-portal/src/__tests__/mfa-settings.test.ts
 *
 * Tests for the MFA enrollment UI (FIX-04b + admin portal MFA enrollment).
 *
 * Coverage:
 *   1. ROUTE_WIRING — verifies the /settings/mfa route is mounted in App.tsx
 *      and gated by `settings.edit` permission. Read from the source file so
 *      the test doesn't require a full React render tree.
 *   2. PAGE_IMPORT — confirms MfaSettings.tsx compiles & exports a default
 *      React component. This catches accidental syntax errors that would
 *      otherwise only surface at `vite build` time.
 *   3. STORE_ACTION — confirms the authStore exposes `setMfaSecret` and that
 *      calling it updates `currentAdmin.mfaSecret` to the supplied value.
 *   4. LIB_ROUNDTRIP — generateToken → generateCurrentCode → verifyToken
 *      round-trip using the live MFA library. (Covered more thoroughly in
 *      mfa.test.ts, but mirrored here so the enrollment-specific path is
 *      explicitly validated.)
 *
 * The UI itself is tested through the route wiring + import + store-level
 * assertions rather than a full RTL render, because the page depends on
 * `useAuthStore` (zustand), framer-motion, and many lucide-react icons —
 * all of which require the jsdom environment. Routing an end-to-end render
 * would also need `MemoryRouter` + `RequireAuth` mocked. We deliberately
 * keep this smoke test lightweight to stay under the 1-second budget and
 * match the existing test style (see api-stub.test.ts).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// 1. ROUTE_WIRING — the page must be reachable at /settings/mfa with the
//    correct permission gate.
// ---------------------------------------------------------------------------
describe('MfaSettings route wiring', () => {
  const appTsx = fs.readFileSync(
    path.resolve(__dirname, '../App.tsx'),
    'utf8',
  );

  it('declares a lazy import for the MfaSettings page', () => {
    expect(appTsx).toMatch(
      /const\s+MfaSettings\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(['"]\.\/pages\/MfaSettings['"]\)\s*\)/,
    );
  });

  it('mounts the page at /settings/mfa inside the routes array', () => {
    expect(appTsx).toMatch(/path:\s*'settings\/mfa',\s*el:\s*<MfaSettings\s*\/>/);
  });

  it('gates the route with the settings.edit permission', () => {
    expect(appTsx).toMatch(/'settings\/mfa':\s*'settings\.edit'/);
  });
});

// ---------------------------------------------------------------------------
// 2. PAGE_IMPORT — the page module must be importable + export a component.
// ---------------------------------------------------------------------------
describe('MfaSettings page module', () => {
  it('exports a default React component without throwing on import', async () => {
    const mod = await import('../pages/MfaSettings');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 3. STORE_ACTION — setMfaSecret must exist and update currentAdmin.mfaSecret.
// ---------------------------------------------------------------------------
describe('authStore.setMfaSecret', () => {
  beforeEach(() => {
    vi.resetModules();
    // Use a clean zustand store between tests so we don't bleed state.
    // The store is created with `storage: undefined` (no persistence) which
    // means each module reset starts from scratch.
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is exposed on the store interface and writes mfaSecret + mfaEnabled=true', async () => {
    const { useAuthStore } = await import('../store/authStore');

    // 1. Seed an admin directly in the store (avoids the 500ms login delay
    //    and the navigator.userAgent access which isn't reliable in node).
    useAuthStore.setState({
      currentAdmin: {
        id: 'admin-test-1',
        email: 'admin@orbitpay.com',
        fullName: 'Test Admin',
        role: 'super_admin',
        permissions: ['*'],
        mfaEnabled: false,
        mfaSecret: undefined,
      } as any,
    });

    const admin = useAuthStore.getState().currentAdmin;
    expect(admin).not.toBeNull();

    // 2. Call setMfaSecret with a known secret.
    const NEW_SECRET = 'JBSWY3DPEHPK3PXP';
    useAuthStore.getState().setMfaSecret(NEW_SECRET);

    // 3. Verify the store was updated.
    const after = useAuthStore.getState().currentAdmin;
    expect(after?.mfaSecret).toBe(NEW_SECRET);
    expect(after?.mfaEnabled).toBe(true);

    // 5. Calling with an empty string should clear the secret (used by
    //    the "Disable MFA" flow).
    useAuthStore.getState().setMfaSecret('');
    const cleared = useAuthStore.getState().currentAdmin;
    expect(cleared?.mfaSecret).toBe('');
    expect(cleared?.mfaEnabled).toBe(true);
  });

  it('is a no-op when no admin is logged in', async () => {
    const { useAuthStore } = await import('../store/authStore');
    // Force a logged-out state.
    useAuthStore.setState({ currentAdmin: null });
    expect(() => useAuthStore.getState().setMfaSecret('whatever')).not.toThrow();
    expect(useAuthStore.getState().currentAdmin).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. LIB_ROUNDTRIP — exercise the full generateToken → verifyToken path the
//    enrollment UI relies on. (The deeper edge cases live in mfa.test.ts.)
// ---------------------------------------------------------------------------
describe('MFA enrollment round-trip (used by the enrollment UI)', () => {
  it('generates a token whose current code verifies successfully', async () => {
    const { generateToken, generateCurrentCode, verifyToken } = await import('@/lib/mfa');
    const payload = await generateToken('admin@orbitpay.demo');
    expect(payload.secret).toBeTruthy();
    const code = await generateCurrentCode(payload.secret);
    expect(await verifyToken(code, payload.secret)).toBe(true);
  });

  it('produces backup codes with the format the UI shows', async () => {
    const { getBackupCodes } = await import('@/lib/mfa');
    const codes = getBackupCodes(10);
    expect(codes).toHaveLength(10);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });
});