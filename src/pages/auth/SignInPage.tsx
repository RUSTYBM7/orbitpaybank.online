/**
 * SignInPage — username + password with biometric / passkey / MFA options.
 * Live validation, "remember device" toggle, social-proof trust line.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, KeyRound, Fingerprint, Smartphone, AlertCircle, Check } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { OtpInput } from '@/components/auth/AuthField';
import { useStore } from '@/store';

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore((s) => s.setUser);
  const login = useStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState<string[]>(['', '', '', '', '', '']);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMfaStep(true);
    }, 700);
  };

  const verifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.join('').length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Seed Zustand so the member portal renders with the user's
      // identity on the very first paint — no flash of empty home.
      const now = new Date().toISOString();
      const fullName = username || 'OrbitPay Member';
      const memberId = 'OP-' + Math.floor(100000 + Math.random() * 900000);
      const email = username.includes('@') ? username : `${username}@orbitpaybank.online`;
      const memberUser = {
        id: memberId,
        email,
        phone: '',
        fullName,
        kycStatus: 'approved' as any,
        accountStatus: 'active' as any,
        tier: 'premium' as any,
        dailyLimit: 50000,
        weeklyLimit: 250000,
        monthlyLimit: 1000000,
        balanceUsd: 2500,
        balanceEur: 2300,
        balanceGbp: 1950,
        balanceBtc: 0.012,
        btcPrice: 67000,
        createdAt: now,
        updatedAt: now,
        lastActive: now,
        isOnline: true,
      };
      setUser(memberUser);
      login(memberUser);
      // Persist so a refresh keeps the session.
      try {
        localStorage.setItem('orbitpay-onboarded', '1');
        localStorage.setItem(
          'orbitpay-onboarded-profile',
          JSON.stringify({
            memberId,
            name: fullName,
            email,
            createdAt: now,
          })
        );
      } catch {}

      // Respect `?redirect=` query param, location.state.from, and
      // default to the internal member portal.
      const params = new URLSearchParams(location.search);
      const fromState = (location.state as any)?.from as string | undefined;
      const target = fromState || params.get('redirect') || '/app';
      navigate(target, { replace: true });
    }, 500);
  };

  return (
    <AuthShell
      eyebrow="Member Sign In"
      title={mfaStep ? 'Verify it’s you' : 'Welcome back'}
      subtitle={
        mfaStep
          ? 'Enter the 6-digit code from your authenticator app. We use this in addition to your password for extra security.'
          : 'Sign in to manage accounts, cards, loans, and investments.'
      }
      badge={mfaStep ? 'Two-step verification' : undefined}
    >
      {mfaStep ? (
        <form onSubmit={verifyMfa} className="space-y-5">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-900">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Smartphone className="h-4 w-4" />
              Open your authenticator app
            </div>
            <p className="text-xs text-rose-800/80">
              Use the 6-digit code for <strong>OrbitPay Credit Union</strong>.
              Codes refresh every 30 seconds.
            </p>
          </div>
          <OtpInput value={mfaCode} onChange={setMfaCode} autoFocus />
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => navigate('/auth/mfa-setup')}
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              Use a different method
            </button>
            <button
              type="button"
              className="font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Resend code
            </button>
          </div>
          <AuthButton type="submit" loading={loading}>
            Verify and continue
          </AuthButton>
          <button
            type="button"
            onClick={() => setMfaStep(false)}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AuthField
            label="Username or member number"
            name="username"
            value={username}
            onChange={setUsername}
            placeholder="your.name or 1234567"
            required
            autoComplete="username"
            leftIcon={<User className="h-4 w-4" />}
          />

          <AuthField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            showPasswordToggle
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-400"
              />
              <span>Trust this device for 30 days</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" loading={loading}>
            Sign in
          </AuthButton>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/auth/passkey-setup')}
              className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <Fingerprint className="h-5 w-5 text-rose-500" />
              Use passkey
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <Smartphone className="h-5 w-5 text-rose-500" />
              Text me a code
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <KeyRound className="h-5 w-5 text-rose-500" />
              Recovery code
            </button>
          </div>

          <p className="pt-3 text-center text-xs text-neutral-600">
            New to OrbitPay?{' '}
            <Link
              to="/auth/sign-up"
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              Create an Online ID
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
