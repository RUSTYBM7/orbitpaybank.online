/**
 * ResetPasswordPage — set a new password after the reset link from email.
 * Strength meter, confirm field, success state.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, ShieldCheck } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';

function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: 'Too weak', color: 'bg-rose-500' },
    { label: 'Weak', color: 'bg-rose-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-emerald-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
    { label: 'Excellent', color: 'bg-emerald-600' },
  ];
  return { score: s, label: map[s].label, color: map[s].color };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const s = strength(pw);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 12 || pw !== confirm) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 600);
  };

  if (done) {
    return (
      <AuthShell
        eyebrow="Password updated"
        title="You’re back in"
        subtitle="Your password has been changed. For your security, we signed you out of all other devices."
        variant="dark"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-sm text-neutral-300">
            Sign in with your new password to continue.
          </p>
          <AuthButton onClick={() => navigate('/auth/sign-in')}>
            Sign in
          </AuthButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Set a new password"
      title="Almost done"
      subtitle="Choose a strong password you have not used before. We will sign you out of every other device for safety."
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          label="New password"
          name="pw"
          type="password"
          value={pw}
          onChange={setPw}
          required
          showPasswordToggle
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          hint="12+ characters, 1 number, 1 symbol"
        />

        {/* Strength meter */}
        {pw && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Strength</span>
              <span className="font-semibold text-neutral-700">{s.label}</span>
            </div>
            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-neutral-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 ${s.score >= i ? s.color : 'bg-neutral-200'} transition`}
                />
              ))}
            </div>
          </div>
        )}

        <AuthField
          label="Confirm new password"
          name="confirm"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
          showPasswordToggle
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={confirm && pw !== confirm ? 'Passwords do not match' : undefined}
        />

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-neutral-900">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
            Tips for a strong password
          </div>
          <ul className="ml-5 list-disc space-y-0.5 text-xs">
            <li>12 or more characters</li>
            <li>At least one number and one symbol</li>
            <li>Do not reuse a password from another site</li>
          </ul>
        </div>

        <AuthButton type="submit" loading={loading} disabled={pw.length < 12 || pw !== confirm}>
          Update password
        </AuthButton>
      </form>
    </AuthShell>
  );
}
