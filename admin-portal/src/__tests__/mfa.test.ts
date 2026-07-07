/**
 * Smoke tests for admin-portal/src/lib/mfa.ts (FIX-16 + FIX-04b).
 *
 * Verifies:
 *   - generateSecret() produces base32 secrets
 *   - generateToken() returns a usable enrollment payload
 *   - verifyToken() accepts valid tokens, rejects invalid ones
 *   - getBackupCodes() produces well-formed codes
 *   - verifyBackupCode() rejects bad formats
 */

import { describe, it, expect } from 'vitest';
import {
  generateSecret,
  generateToken,
  verifyToken,
  generateCurrentCode,
  getBackupCodes,
  verifyBackupCode,
} from '@/lib/mfa';

describe('mfa.generateSecret', () => {
  it('returns a non-empty base32 string', () => {
    const s = generateSecret();
    expect(s.length).toBeGreaterThan(10);
    expect(/^[A-Z2-7]+=*$/.test(s)).toBe(true);
  });

  it('returns a different secret each call', () => {
    expect(generateSecret()).not.toBe(generateSecret());
  });
});

describe('mfa.verifyToken', () => {
  it('accepts the current valid TOTP for a known secret', async () => {
    const secret = generateSecret();
    const code = await generateCurrentCode(secret);
    expect(await verifyToken(code, secret)).toBe(true);
  });

  it('rejects an invalid token', async () => {
    const secret = generateSecret();
    expect(await verifyToken('000000', secret)).toBe(false);
    expect(await verifyToken('abcdef', secret)).toBe(false);
  });

  it('rejects empty inputs safely', async () => {
    expect(await verifyToken('', '')).toBe(false);
    expect(await verifyToken('123456', '')).toBe(false);
    expect(await verifyToken('', generateSecret())).toBe(false);
  });
});

describe('mfa.generateToken', () => {
  it('returns secret + otpauth + qrDataUrl', async () => {
    const payload = await generateToken('test-admin@example.com');
    expect(payload.secret).toBeTruthy();
    expect(payload.otpauth).toMatch(/^otpauth:\/\/totp\//);
    expect(payload.qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});

describe('mfa.getBackupCodes', () => {
  it('returns the requested number of codes', () => {
    expect(getBackupCodes().length).toBe(10);
    expect(getBackupCodes(5).length).toBe(5);
  });

  it('each code matches the XXXX-XXXX format', () => {
    for (const code of getBackupCodes()) {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });
});

describe('mfa.verifyBackupCode', () => {
  it('accepts a well-formed backup code', () => {
    const codes = getBackupCodes();
    expect(verifyBackupCode(codes[0], codes)).toBe(true);
  });

  it('rejects empty / malformed input', () => {
    expect(verifyBackupCode('', [])).toBe(false);
    expect(verifyBackupCode('not-a-code', [])).toBe(false);  // has lowercase letters
    expect(verifyBackupCode('abcd', [])).toBe(false);         // missing dash + second segment
    expect(verifyBackupCode('!!!!!-!!!!', [])).toBe(false);   // not in [A-Z0-9]
    expect(verifyBackupCode('ABCDE-FGHI', [])).toBe(false);   // too long
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// generateCurrentCode is imported from '@/lib/mfa' above.