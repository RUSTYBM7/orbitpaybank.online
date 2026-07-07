/**
 * SignUpPage — first-time online banking enrollment. Collects identity, sets
 * up MFA, and creates the user an online ID linked to their membership.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { useNotifications, notify } from '@/state/notifications';

export default function SignUpPage() {
  const navigate = useNavigate();
  const notif = useNotifications();
  const [step, setStep] = useState<'form' | 'verify' | 'done'>('form');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirm: '',
    accept: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.accept) {
      setError('You must accept the terms to continue.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
      notify(notif, 'verify-email');
    }, 600);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 500);
  };

  if (step === 'done') {
    return (
      <AuthShell
        eyebrow="Welcome to OrbitPay"
        title="You’re in."
        subtitle="Your Online ID is active. We sent a confirmation to your email and a verification code by SMS."
        variant="dark"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-sm text-neutral-300">
            Recommended next step: set up MFA and biometrics to keep your account
            safe.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AuthButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/auth/mfa-setup')}
            >
              Setup MFA
            </AuthButton>
            <AuthButton
              type="button"
              onClick={() => navigate('/app')}
            >
              Go to member portal
            </AuthButton>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (step === 'verify') {
    return (
      <AuthShell
        eyebrow="Verify your email"
        title="One more step"
        subtitle={`We sent a 6-digit code to ${form.email}. Enter it below to confirm your address.`}
      >
        <form onSubmit={verify} className="space-y-5">
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            Didn’t get the code? Check spam, then{' '}
            <button type="button" className="font-semibold underline">
              resend
            </button>{' '}
            in 30 seconds.
          </p>
          <AuthButton type="submit" loading={loading}>
            Verify email & continue
          </AuthButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create Online ID"
      title="Start with the basics"
      subtitle="We use this to verify your identity and link your account. Takes about 2 minutes."
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <AuthField
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={(v) => update('firstName', v)}
            required
            autoComplete="given-name"
          />
          <AuthField
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={(v) => update('lastName', v)}
            required
            autoComplete="family-name"
          />
        </div>

        <AuthField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(v) => update('email', v)}
          required
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com"
        />

        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          required
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          placeholder="+1 555 010 0000"
        />

        <AuthField
          label="Choose a username"
          name="username"
          value={form.username}
          onChange={(v) => update('username', v)}
          required
          autoComplete="username"
          leftIcon={<User className="h-4 w-4" />}
          hint="6+ characters"
        />

        <AuthField
          label="Create a password"
          name="password"
          type="password"
          value={form.password}
          onChange={(v) => update('password', v)}
          required
          autoComplete="new-password"
          showPasswordToggle
          leftIcon={<Lock className="h-4 w-4" />}
          hint="12+ characters, 1 number, 1 symbol"
        />

        <AuthField
          label="Confirm password"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={(v) => update('confirm', v)}
          required
          autoComplete="new-password"
          showPasswordToggle
          leftIcon={<Lock className="h-4 w-4" />}
        />

        <label className="flex items-start gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={form.accept}
            onChange={(e) => update('accept', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-400"
          />
          <span>
            I agree to the{' '}
            <Link to="/terms" className="font-semibold text-rose-600 underline">
              Terms of Use
            </Link>
            ,{' '}
            <Link to="/privacy" className="font-semibold text-rose-600 underline">
              Privacy Policy
            </Link>
            , and{' '}
            <Link to="/cookies" className="font-semibold text-rose-600 underline">
              Cookie Policy
            </Link>
            .
          </span>
        </label>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-neutral-900">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
            Your data is safe with us
          </div>
          We never sell member data. 256-bit encryption in transit and at rest.
          You can request deletion at any time.
        </div>

        <AuthButton type="submit" loading={loading}>
          Continue
        </AuthButton>

        <p className="text-center text-xs text-neutral-600">
          Already a member?{' '}
          <Link
            to="/auth/sign-in"
            className="font-semibold text-rose-600 hover:text-rose-700"
          >
            Sign in instead
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
