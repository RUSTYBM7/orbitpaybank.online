/**
 * LogoutConfirmPage — confirmation modal-style page for signing out.
 */

import { Link, useNavigate } from 'react-router-dom';
import { LogOut, X, Lock, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

export default function LogoutConfirmPage() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <LogOut className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-medium">Sign out?</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
          You will need your password (or biometrics) to sign back in. We will
          keep your account secure while you&rsquo;re away.
        </p>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              try {
                localStorage.removeItem('orbitpay-onboarded');
                localStorage.removeItem('orbitpay-onboarded-profile');
              } catch {}
              navigate('/auth/sign-in');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg"
          >
            <LogOut className="h-4 w-4" /> Yes, sign me out
          </button>
          <Link
            to="/app"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-400"
          >
            <X className="h-4 w-4" /> Stay signed in
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck className="h-3 w-3" />
          Your session will be cleared from this device
        </div>
      </div>
    </PublicLayout>
  );
}
