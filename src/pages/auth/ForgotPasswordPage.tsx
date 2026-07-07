/**
 * ForgotPasswordPage — three-step flow: enter email/phone → choose delivery
 * method → show confirmation. Reusable for forgot-username.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageSquare, KeyRound, Check, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';

type Mode = 'choose' | 'method' | 'sent' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [contact, setContact] = useState('');
  const [method, setMethod] = useState<'email' | 'sms' | 'call'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!contact) {
      setError('Please enter your email or phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode('method');
    }, 400);
  };

  const sendCode = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode('sent');
    }, 500);
  };

  if (mode === 'done') {
    return (
      <AuthShell eyebrow="Password reset" title="Done" subtitle="">
        <p className="text-sm text-neutral-600">Redirecting to sign in…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset Password"
      title={
        mode === 'choose' ? 'Forgot your password?' :
        mode === 'method' ? 'How should we reach you?' :
        mode === 'sent' ? 'Check your inbox' : 'Done'
      }
      subtitle={
        mode === 'choose' ? 'No problem. Tell us your email or phone and we will help you get back in.' :
        mode === 'method' ? `Choose how to receive your reset link. We have it on file for ${contact}.` :
        mode === 'sent' ? `We sent a reset link to ${method === 'email' ? contact : 'your phone on file'}. It expires in 15 minutes.`
        : ''
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === 'choose' && (
        <form onSubmit={submit} className="space-y-4">
          <AuthField
            label="Email or phone number"
            name="contact"
            value={contact}
            onChange={setContact}
            placeholder="you@example.com or +1 555 010 0000"
            required
            autoComplete="username"
          />
          <AuthButton type="submit" loading={loading}>
            Continue
          </AuthButton>
          <p className="text-center text-xs text-neutral-600">
            Remembered it?{' '}
            <Link to="/auth/sign-in" className="font-semibold text-rose-600">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {mode === 'method' && (
        <div className="space-y-3">
          {([
            { key: 'email', icon: Mail, title: 'Email me a link', body: 'We will email a one-time link.' },
            { key: 'sms', icon: MessageSquare, title: 'Text me a code', body: 'A 6-digit code via SMS.' },
            { key: 'call', icon: Phone, title: 'Call me with a code', body: 'An automated call reads you a 6-digit code.' },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMethod(opt.key)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                method === opt.key
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-neutral-200 bg-white hover:border-rose-300'
              }`}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                method === opt.key ? 'bg-rose-500 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                <opt.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{opt.title}</div>
                <div className="text-xs text-neutral-600">{opt.body}</div>
              </div>
            </button>
          ))}
          <AuthButton onClick={sendCode} loading={loading}>
            Send reset link
          </AuthButton>
          <button
            onClick={() => setMode('choose')}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
          >
            ← Use a different contact
          </button>
        </div>
      )}

      {mode === 'sent' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <Check className="h-8 w-8" />
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-900">
            <p className="font-semibold">Didn’t get the email?</p>
            <p className="mt-1 text-xs text-rose-800/80">
              Check your spam folder, then wait 30 seconds and resend.
            </p>
          </div>
          <AuthButton variant="secondary" onClick={sendCode}>
            Resend the link
          </AuthButton>
          <button
            onClick={() => navigate('/auth/sign-in')}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
          >
            ← Back to sign in
          </button>
        </div>
      )}
    </AuthShell>
  );
}
