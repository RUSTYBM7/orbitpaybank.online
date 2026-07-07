/**
 * LockedAccountPage — when too many failed sign-ins have triggered a lock.
 * Provides a path to verify identity and unlock.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Phone, Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';

export default function LockedAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'verify' | 'done'>('info');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!contact) {
      setError('Enter the email or phone on file.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
    }, 600);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 600);
  };

  if (step === 'done') {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            Account unlocked.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
            For your safety, we signed you out of every device. Sign in again
            with your new password to continue.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              to="/auth/login-history"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
            >
              Review sign-in history
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {step === 'info' && (
          <>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Lock className="h-8 w-8" />
              </div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-3 w-3" /> Account locked
              </div>
              <h1 className="font-serif text-3xl font-medium sm:text-4xl">
                Your account is temporarily locked.
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
                We lock accounts after several failed sign-in attempts to keep
                your money safe. Verify your identity to unlock now.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { Icon: Mail, label: 'Email me', desc: 'We send a secure unlock link' },
                { Icon: Phone, label: 'Text me', desc: 'A 6-digit code by SMS' },
                { Icon: Phone, label: 'Call me', desc: 'An automated call reads you a code' },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
                  <m.Icon className="mx-auto mb-2 h-6 w-6 text-rose-500" />
                  <div className="text-sm font-semibold text-neutral-900">{m.label}</div>
                  <div className="text-[11px] text-neutral-500">{m.desc}</div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <AuthField
                label="Email or phone on file"
                name="contact"
                value={contact}
                onChange={setContact}
                placeholder="you@example.com"
                required
              />
              <AuthButton type="submit" loading={loading}>
                Send unlock link
              </AuthButton>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified through your account&rsquo;s recovery method
              </div>
            </form>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={verify} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h1 className="text-center font-serif text-2xl font-medium sm:text-3xl">
              Check your inbox
            </h1>
            <p className="text-center text-sm text-neutral-600">
              We sent a one-time unlock link to {contact}. Open the link on this
              device to unlock your account.
            </p>
            <AuthButton type="submit" loading={loading}>
              I’ve opened the link
            </AuthButton>
            <button
              type="button"
              onClick={() => setStep('info')}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
            >
              ← Use a different contact
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
