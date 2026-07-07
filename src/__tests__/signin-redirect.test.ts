/**
 * Tests for the sign-in redirect target.
 *
 * The auth flow used to send users to /applicant/dashboard (an
 * applicant-only page). The internal member portal at /app is the
 * canonical home for signed-in members, so the redirect now lands
 * there unless explicitly overridden by `?redirect=` or
 * `location.state.from`.
 *
 * This test verifies the source no longer contains any reference to
 * the legacy `/applicant/dashboard` redirect after sign-in, and that
 * the new target defaults to `/app`.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';

const SIGNIN_PATH = 'src/pages/auth/SignInPage.tsx';
const MFA_PATH = 'src/pages/auth/MfaSetupPage.tsx';
const PASSKEY_PATH = 'src/pages/auth/PasskeySetupPage.tsx';
const LOGOUT_PATH = 'src/pages/auth/LogoutConfirmPage.tsx';
const SIGNUP_PATH = 'src/pages/auth/SignUpPage.tsx';

describe('sign-in redirects to /app', () => {
  it('SignInPage does not navigate to /applicant/dashboard anymore', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).not.toMatch(/navigate\(['"]\/applicant\/dashboard/);
  });

  it('SignInPage default redirect target is /app', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).toMatch(/'\/app'/);
  });

  it('SignInPage respects ?redirect= query param', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).toMatch(/params\.get\(['"]redirect['"]\)/);
  });

  it('SignInPage respects location.state.from', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).toMatch(/location\.state|fromState/);
  });

  it('SignInPage seeds Zustand on success', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).toMatch(/setUser\(memberUser\)/);
    expect(src).toMatch(/login\(memberUser\)/);
  });

  it('SignInPage persists profile to localStorage so /app hydrates after refresh', () => {
    const src = fs.readFileSync(SIGNIN_PATH, 'utf-8');
    expect(src).toMatch(/orbitpay-onboarded-profile/);
  });

  it('MfaSetupPage post-setup link points to /app', () => {
    const src = fs.readFileSync(MFA_PATH, 'utf-8');
    expect(src).not.toMatch(/to=['"]\/applicant\/dashboard/);
    expect(src).toMatch(/to=['"]\/app/);
  });

  it('PasskeySetupPage post-setup link points to /app', () => {
    const src = fs.readFileSync(PASSKEY_PATH, 'utf-8');
    expect(src).not.toMatch(/to=['"]\/applicant\/dashboard/);
    expect(src).toMatch(/to=['"]\/app/);
  });

  it('LogoutConfirmPage "Stay signed in" link points to /app', () => {
    const src = fs.readFileSync(LOGOUT_PATH, 'utf-8');
    expect(src).not.toMatch(/to=['"]\/applicant\/dashboard/);
    expect(src).toMatch(/to=['"]\/app/);
  });

  it('LogoutConfirmPage "Yes, sign me out" clears localStorage', () => {
    const src = fs.readFileSync(LOGOUT_PATH, 'utf-8');
    expect(src).toMatch(/orbitpay-onboarded-profile/);
    expect(src).toMatch(/removeItem/);
  });

  it('SignUpPage "Go to member portal" button navigates to /app', () => {
    const src = fs.readFileSync(SIGNUP_PATH, 'utf-8');
    expect(src).not.toMatch(/applicant\/dashboard/);
    expect(src).toMatch(/navigate\(['"]\/app['"]\)/);
  });
});