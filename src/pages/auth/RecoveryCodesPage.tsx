/**
 * RecoveryCodesPage — view, copy, and regenerate the one-time backup
 * codes used when the member loses their second factor.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, RefreshCw, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const SEED_CODES = [
  '8XQ2-9K7P', 'M4T1-RT6H', 'L7N2-4F8V', 'J9W5-2D3K',
  'B6P3-7N1M', 'R4T8-9H2L', 'V3F7-5K6P', 'X8D2-4M9T',
  'N2K6-7H4R', 'P5T9-3F2D', 'L8M4-6K1V', 'H7R3-9T5N',
];

export default function RecoveryCodesPage() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codes, setCodes] = useState(SEED_CODES);

  const copy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob(
      [`OrbitPay Credit Union — Backup Recovery Codes\nGenerated: ${new Date().toISOString()}\n\n` + codes.join('\n') + '\n'],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orbitpay-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const regen = () => {
    setCodes(
      Array.from({ length: 12 }, () =>
        `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      )
    );
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            Backup Recovery Codes
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            One-time backup codes.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            Use these one-time codes if you lose access to your second factor.
            Each code can be used once.
          </p>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-semibold">Treat these like a password</div>
              <p className="mt-0.5 text-xs text-rose-800/80">
                Anyone with these codes can sign in to your account. Save
                them somewhere only you can access.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Your codes</h2>
            <button
              onClick={() => setVisible((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {codes.map((c) => (
              <div
                key={c}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-sm font-semibold tracking-wider text-neutral-800"
              >
                {visible ? c : '••••-••••'}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy all'}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:border-neutral-400"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={regen}
            className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" /> Regenerate
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Need a different way in?{' '}
          <Link to="/auth/mfa-setup" className="font-semibold text-rose-600">
            Reset your second factor
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
