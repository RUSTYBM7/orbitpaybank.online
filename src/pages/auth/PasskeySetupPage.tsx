/**
 * PasskeySetupPage — set up biometric sign-in (Face ID, Touch ID, Windows
 * Hello, fingerprint, hardware passkey). Single step with one big CTA.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Fingerprint,
  Check,
  ArrowRight,
  KeyRound,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import AuthButton from '@/components/auth/AuthButton';

export default function PasskeySetupPage() {
  const [step, setStep] = useState<'choose' | 'register' | 'done'>('choose');
  const [type, setType] = useState<'face' | 'touch' | 'key'>('face');
  const [loading, setLoading] = useState(false);

  const register = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 1200);
  };

  if (step === 'done') {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg"
          >
            <Check className="h-10 w-10" />
          </motion.div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            Biometric sign-in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
            >
              enabled.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
            Next time you sign in, your browser or device will prompt you to
            use your biometric or passkey instead of typing a password.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth/trusted-devices"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:border-neutral-400"
            >
              Manage devices
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Go to member portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {step === 'choose' && (
          <div>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
                <Fingerprint className="h-3 w-3" /> Biometric sign-in
              </div>
              <h1 className="font-serif text-3xl font-medium sm:text-4xl">
                Sign in with your face, fingerprint, or a passkey.
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
                Passkeys replace passwords. They can&rsquo;t be phished, can&rsquo;t
                be guessed, and you don&rsquo;t have to remember them.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { id: 'face', icon: Fingerprint, name: 'Face ID', body: 'Apple devices' },
                { id: 'touch', icon: Fingerprint, name: 'Touch ID / Fingerprint', body: 'Most phones & laptops' },
                { id: 'key', icon: KeyRound, name: 'Passkey / hardware key', body: 'YubiKey, 1Password, etc.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setType(opt.id as any);
                    setStep('register');
                  }}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
                >
                  <opt.icon className="mb-2 h-6 w-6 text-rose-500" />
                  <div className="text-sm font-semibold text-neutral-900">{opt.name}</div>
                  <div className="text-[11px] text-neutral-500">{opt.body}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Before you continue</div>
                  <p className="mt-0.5 text-xs text-amber-800">
                    Make sure you have at least one backup method set up. We
                    recommend an authenticator app and saved backup codes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'register' && (
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-2xl shadow-rose-500/30"
            >
              <Fingerprint className="h-16 w-16" />
            </motion.div>
            <h1 className="font-serif text-2xl font-medium sm:text-3xl">
              {type === 'face' && 'Look at your device'}
              {type === 'touch' && 'Touch your sensor'}
              {type === 'key' && 'Tap or insert your key'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              Your device is asking for biometric confirmation. Follow the
              on-screen prompt to complete registration.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <AuthButton onClick={register} loading={loading}>
                I’ve completed it on my device
              </AuthButton>
              <button
                onClick={() => setStep('choose')}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                Try a different method
              </button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
