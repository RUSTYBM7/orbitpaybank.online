/**
 * MFASetupPage — choose a second factor. Three options: authenticator app,
 * SMS backup, hardware key (FIDO2 / WebAuthn). Each option gets its own
 * sub-flow with QR code / phone entry / device pairing.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Smartphone,
  Hash,
  KeyRound,
  Check,
  AlertCircle,
  Copy,
  Download,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { OtpInput } from '@/components/auth/AuthField';

const METHODS = [
  {
    id: 'authenticator',
    icon: Hash,
    name: 'Authenticator app',
    blurb: 'Most secure. Codes refresh every 30 seconds. Works offline.',
    recommended: true,
  },
  {
    id: 'sms',
    icon: Smartphone,
    name: 'SMS code',
    blurb: 'A 6-digit code by text message. Use as a backup method.',
    recommended: false,
  },
  {
    id: 'hardware',
    icon: KeyRound,
    name: 'Hardware security key',
    blurb: 'FIDO2 / WebAuthn. Plug in or tap to sign in. Most phishing-resistant.',
    recommended: false,
  },
];

export default function MfaSetupPage() {
  const [step, setStep] = useState<'choose' | 'setup' | 'verify' | 'codes' | 'done'>('choose');
  const [method, setMethod] = useState<string>('authenticator');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.join('').length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setStep('codes');
  };

  if (step === 'done') {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            You&rsquo;re{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
            >
              protected.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
            Multi-factor authentication is active. Save your backup codes
            somewhere safe in case you lose access to your second factor.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth/trusted-devices"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:border-neutral-400"
            >
              Manage trusted devices
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {/* Stepper */}
        <Stepper step={step} />

        {step === 'choose' && (
          <div>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
                <span className="text-rose-500">★</span>
                Multi-factor Authentication
              </div>
              <h1 className="font-serif text-3xl font-medium sm:text-4xl">
                Add a second factor.
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
                A second factor stops 99.9% of automated sign-in attacks.
                Pick the method that fits how you use your phone.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setStep('setup');
                  }}
                  className="group flex w-full items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {m.name}
                      </h3>
                      {m.recommended && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-600">{m.blurb}</p>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'setup' && method === 'authenticator' && (
          <div>
            <h1 className="text-center font-serif text-3xl font-medium sm:text-4xl">
              Scan this QR code
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-600">
              Open Google Authenticator, 1Password, Authy, or any TOTP app and scan
              the code below.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="grid h-48 w-48 grid-cols-12 gap-px">
                  {Array.from({ length: 144 }).map((_, i) => {
                    // Pseudo-QR pattern (deterministic)
                    const isBlack = ((i * 7 + 3) % 11) < 5;
                    return (
                      <div
                        key={i}
                        className={isBlack ? 'bg-neutral-900' : 'bg-white'}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 text-center text-[10px] uppercase tracking-wider text-neutral-500">
                  Manual: JBSWY3DPEHPK3PXP
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setStep('verify')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white"
              >
                I’ve scanned it — continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900">
                <Copy className="h-4 w-4" />
                Copy the key
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && method === 'sms' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('verify');
            }}
            className="space-y-4"
          >
            <h1 className="text-center font-serif text-3xl font-medium sm:text-4xl">
              Add your phone number
            </h1>
            <p className="mx-auto max-w-md text-center text-sm text-neutral-600">
              We will send a 6-digit code by SMS. We use this as a backup, not
              your primary factor.
            </p>
            <AuthField
              label="Mobile number"
              name="phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              required
              autoComplete="tel"
              placeholder="+1 555 010 0000"
            />
            <AuthButton type="submit">Send code</AuthButton>
          </form>
        )}

        {step === 'setup' && method === 'hardware' && (
          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium sm:text-4xl">
              Insert or tap your security key
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              Plug in a USB key, tap an NFC key, or open your passkey provider.
              Your browser will prompt you to register.
            </p>
            <button
              onClick={() => setStep('verify')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Begin pairing
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={verify} className="space-y-5">
            <h1 className="text-center font-serif text-3xl font-medium sm:text-4xl">
              Enter the 6-digit code
            </h1>
            <p className="mx-auto max-w-md text-center text-sm text-neutral-600">
              Open your authenticator or check your SMS for the code.
            </p>
            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <OtpInput value={code} onChange={setCode} autoFocus />
            <AuthButton type="submit">Verify and continue</AuthButton>
            <button
              type="button"
              onClick={() => setStep('setup')}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
            >
              ← Back
            </button>
          </form>
        )}

        {step === 'codes' && (
          <div>
            <h1 className="text-center font-serif text-3xl font-medium sm:text-4xl">
              Save your backup codes
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-600">
              If you lose access to your second factor, these one-time codes
              are the only way back in. Treat them like a password.
            </p>
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  '8XQ2-9K7P', 'M4T1-RT6H', 'L7N2-4F8V', 'J9W5-2D3K',
                  'B6P3-7N1M', 'R4T8-9H2L', 'V3F7-5K6P', 'X8D2-4M9T',
                  'N2K6-7H4R', 'P5T9-3F2D', 'L8M4-6K1V', 'H7R3-9T5N',
                ].map((c) => (
                  <div
                    key={c}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-sm font-semibold tracking-wider text-neutral-800"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900">
                <Download className="h-4 w-4" />
                Download as .txt
              </button>
              <button
                onClick={() => setStep('done')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white"
              >
                I’ve saved my codes
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => setStep('done')}
              className="mt-3 w-full text-center text-xs text-neutral-500 hover:text-neutral-900"
            >
              Skip — I will save them later
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

function Stepper({ step }: { step: string }) {
  const steps = ['choose', 'setup', 'verify', 'codes'];
  const idx = steps.indexOf(step);
  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 w-12 rounded-full transition ${
            i <= idx ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-neutral-200'
          }`}
        />
      ))}
    </div>
  );
}
