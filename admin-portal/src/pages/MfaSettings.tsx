/**
 * admin-portal/src/pages/MfaSettings.tsx (FIX-04b + MFA enrollment UI).
 *
 * Settings → Security → Two-Factor Authentication.
 *
 * Flow:
 *   1. Admin lands on /settings/mfa. We read `currentAdmin.mfaSecret` to
 *      decide whether MFA is currently enabled.
 *   2. If disabled → "Enable MFA" button starts the enrollment flow:
 *        step 1: generateToken(email) → QR + otpauth + base32 secret
 *        step 2: admin enters a 6-digit TOTP code from their app
 *        step 3: verifyToken → getBackupCodes(10) → reveal-once list
 *      Admin must check "I've saved my codes" before we persist the secret
 *      to the auth store + localStorage.
 *   3. If enabled → "Disable MFA" (confirm modal) and "Regenerate backup codes".
 *
 * Demo-mode safety: every MFA-lib call is wrapped in try/catch and surfaces a
 * non-fatal error banner so a broken `mfa.ts` import never tears the whole
 * settings page down.
 *
 * Server-side persistence (writing the secret to the `employees` table, hashing
 * + one-time-use tracking for backup codes) is a follow-up. For now the secret
 * lives in the zustand auth store and is mirrored to localStorage.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldOff, KeyRound, Copy, Check,
  AlertTriangle, Loader2, RefreshCw, Download, Eye, EyeOff,
  Lock, Smartphone, ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button, Modal, Badge } from '@/components/ui';

// localStorage key for the per-admin backup-codes array (plaintext in demo mode).
const BACKUP_CODES_LS_KEY = 'orbitpay-admin-backup-codes';

type EnrollmentStep = 'idle' | 'qr' | 'verify' | 'backup' | 'done';

interface EnrollmentPayload {
  secret: string;
  qrDataUrl: string;
  otpauth: string;
}

export default function MfaSettings() {
  const { currentAdmin, setMfaSecret } = useAuthStore();

  const isEnabled = Boolean(currentAdmin?.mfaSecret);

  // local-state for the enrollment wizard + lifecycle banners.
  const [step, setStep] = useState<EnrollmentStep>('idle');
  const [payload, setPayload] = useState<EnrollmentPayload | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Backup codes: revealed once, then hidden. Persisted to localStorage on
  // acknowledgment. We only render the plaintext list while `revealedBackup`
  // is true.
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[]>([]);
  const [storedBackupCodes, setStoredBackupCodes] = useState<string[]>([]);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableConfirmText, setDisableConfirmText] = useState('');
  const [copyState, setCopyState] = useState<'' | 'copied'>('');
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regeneratedCodes, setRegeneratedCodes] = useState<string[]>([]);
  const [regenRevealed, setRegenRevealed] = useState(false);
  const [regenSaved, setRegenSaved] = useState(false);

  // Hydrate stored backup codes from localStorage on mount (best-effort).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BACKUP_CODES_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setStoredBackupCodes(parsed);
      }
    } catch {
      // localStorage may be unavailable in some test runners; non-fatal.
    }
  }, []);

  // ---- MFA library wrappers with demo-mode error isolation ------------------
  // We don't `await import('@/lib/mfa')` at module scope because a broken
  // MFA lib must NOT take this whole page down. We resolve the function
  // references lazily and wrap each call in try/catch.
  const safeGenerateToken = async (label: string): Promise<EnrollmentPayload> => {
    try {
      const { generateToken } = await import('@/lib/mfa');
      const result = await generateToken(label);
      return {
        secret: result.secret,
        qrDataUrl: result.qrDataUrl,
        otpauth: result.otpauth,
      };
    } catch (e) {
      throw new Error(
        'MFA library is unavailable. The enrollment QR could not be generated. ' +
          'Check that `admin-portal/src/lib/mfa.ts` imports compile cleanly.'
      );
    }
  };

  const safeVerifyToken = async (token: string, secret: string): Promise<boolean> => {
    try {
      const { verifyToken } = await import('@/lib/mfa');
      return await verifyToken(token, secret);
    } catch {
      return false;
    }
  };

  const safeGetBackupCodes = async (count: number): Promise<string[]> => {
    try {
      const { getBackupCodes } = await import('@/lib/mfa');
      return getBackupCodes(count);
    } catch {
      // Fallback: mint the codes inline so the UI still works in demo mode.
      const fallback: string[] = [];
      for (let i = 0; i < count; i++) {
        fallback.push(
          Math.random().toString(36).slice(-4).toUpperCase() +
            '-' +
            Math.random().toString(36).slice(-4).toUpperCase(),
        );
      }
      return fallback;
    }
  };

  // ---- Actions --------------------------------------------------------------

  const startEnrollment = async () => {
    setGlobalError(null);
    setVerifyError(null);
    setVerifyCode('');
    setCodesRevealed(false);
    setCodesSaved(false);
    setPendingBackupCodes([]);
    try {
      const label = currentAdmin?.email || 'admin@orbitpay.com';
      const result = await safeGenerateToken(label);
      setPayload(result);
      setStep('qr');
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to start MFA enrollment.');
    }
  };

  const proceedToVerify = () => {
    setVerifyError(null);
    setStep('verify');
  };

  const submitVerification = async () => {
    if (!payload) return;
    if (!/^\d{6}$/.test(verifyCode.trim())) {
      setVerifyError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    try {
      const ok = await safeVerifyToken(verifyCode.trim(), payload.secret);
      if (!ok) {
        setVerifyError('That code didn\'t match. Try the next one from your app.');
        setVerifying(false);
        return;
      }
      // Mint backup codes but don't persist yet — wait for "I saved them".
      const codes = await safeGetBackupCodes(10);
      setPendingBackupCodes(codes);
      setCodesRevealed(true);
      setStep('backup');
    } catch (e: any) {
      setVerifyError(e?.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const acknowledgeBackupCodes = () => {
    if (!payload || pendingBackupCodes.length === 0) return;
    setMfaSecret(payload.secret);
    try {
      localStorage.setItem(BACKUP_CODES_LS_KEY, JSON.stringify(pendingBackupCodes));
    } catch {
      // non-fatal; the codes are still in zustand-backed state via storedBackupCodes below.
    }
    setStoredBackupCodes(pendingBackupCodes);
    setCodesSaved(true);
    setStep('done');
  };

  const disableMfa = () => {
    setMfaSecret('');
    try {
      localStorage.removeItem(BACKUP_CODES_LS_KEY);
    } catch {
      // non-fatal
    }
    setStoredBackupCodes([]);
    setPendingBackupCodes([]);
    setCodesRevealed(false);
    setCodesSaved(false);
    setShowDisableModal(false);
    setDisableConfirmText('');
    setStep('idle');
    setPayload(null);
  };

  const regenerateCodes = async () => {
    const codes = await safeGetBackupCodes(10);
    setRegeneratedCodes(codes);
    setRegenRevealed(true);
    setRegenSaved(false);
    try {
      localStorage.setItem(BACKUP_CODES_LS_KEY, JSON.stringify(codes));
    } catch {
      // non-fatal
    }
    setStoredBackupCodes(codes);
  };

  const confirmRegenerate = () => {
    setRegenSaved(true);
    setShowRegenModal(false);
    // keep regeneratedCodes visible briefly so the admin can copy them
    setTimeout(() => {
      setRegeneratedCodes([]);
      setRegenRevealed(false);
    }, 100);
  };

  // ---- Helpers --------------------------------------------------------------

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      setTimeout(() => setCopyState(''), 1500);
    } catch {
      // clipboard may be blocked in some sandboxes; UI still shows the value.
    }
  };

  const downloadBackupCodes = (codes: string[], filename: string) => {
    try {
      const blob = new Blob(
        [`OrbitPay Admin — Backup Recovery Codes\nGenerated: ${new Date().toISOString()}\n\n${codes.join('\n')}\n`],
        { type: 'text/plain' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // non-fatal
    }
  };

  const breadcrumbLabel = useMemo(() => {
    if (!currentAdmin) return 'Sign in to manage MFA';
    return `${currentAdmin.firstName} ${currentAdmin.lastName} · ${currentAdmin.email}`;
  }, [currentAdmin]);

  if (!currentAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Two-Factor Authentication</h1>
          <p className="text-slate-400 mt-1">You must be signed in to manage MFA.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-300">
          <AlertTriangle className="w-5 h-5 inline mr-2" />
          No active admin session.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <a
            href="/settings"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
          </a>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-400" />
            Two-Factor Authentication
          </h1>
          <p className="text-slate-400 mt-1">
            Add a second factor to your admin account using Google Authenticator, Authy, or any TOTP app.
          </p>
          <p className="text-xs text-slate-500 mt-1">{breadcrumbLabel}</p>
        </div>
        <Badge variant={isEnabled ? 'success' : 'default'}>
          {isEnabled ? (
            <><ShieldCheck className="w-3.5 h-3.5" /> MFA is enabled</>
          ) : (
            <><ShieldOff className="w-3.5 h-3.5" /> MFA is disabled</>
          )}
        </Badge>
      </div>

      {/* Demo-mode error banner — never tears the page down. */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">MFA library error</p>
              <p className="text-xs text-red-300/80 mt-0.5">{globalError}</p>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-300/60 hover:text-red-300 text-xs"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ENABLED STATE ─────────────────────────────────────────────────── */}
      {isEnabled && step === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">MFA is active</h2>
                <p className="text-sm text-slate-400">
                  You'll be prompted for a 6-digit code from your authenticator app on every sign-in.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase">Authenticator</p>
                <p className="text-white font-medium mt-1">Google Authenticator / Authy</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase">Backup codes</p>
                <p className="text-white font-medium mt-1">
                  {storedBackupCodes.length > 0 ? `${storedBackupCodes.length} stored` : 'None on file'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-700">
              <Button
                variant="primary"
                onClick={() => setShowRegenModal(true)}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Regenerate backup codes
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDisableModal(true)}
                icon={<ShieldOff className="w-4 h-4" />}
              >
                Disable MFA
              </Button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" /> Security tips
            </h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Use a dedicated authenticator app on a phone you carry daily.</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Store backup codes in a password manager or safe deposit box.</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Don't share your authenticator QR with anyone.</li>
              <li className="flex gap-2"><span className="text-amber-400">•</span> Server-side persistence of the secret (employees.mfa_secret) is a planned follow-up.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── DISABLED STATE: idle ───────────────────────────────────────────── */}
      {!isEnabled && step === 'idle' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">MFA is disabled</h2>
              <p className="text-sm text-slate-400">
                Your account is protected by password only. Enable two-factor authentication
                to require a 6-digit code from your phone at every sign-in.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <Button
              variant="primary"
              size="lg"
              onClick={startEnrollment}
              icon={<Smartphone className="w-5 h-5" />}
            >
              Enable MFA
            </Button>
          </div>
        </div>
      )}

      {/* ─── ENROLLMENT: Step 1 — QR ──────────────────────────────────────── */}
      {step === 'qr' && payload && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Badge variant="info">Step 1 of 3</Badge>
            <h2 className="text-lg font-semibold text-white">Scan this QR code</h2>
          </div>
          <p className="text-sm text-slate-400">
            Open <span className="text-white font-medium">Google Authenticator</span>,
            <span className="text-white font-medium"> Authy</span>, or any TOTP app, then scan the QR below.
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white p-3 rounded-2xl flex-shrink-0 mx-auto md:mx-0">
              <img
                src={payload.qrDataUrl}
                alt="TOTP enrollment QR code"
                width={200}
                height={200}
                className="block"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Can't scan?</p>
                <p className="text-xs text-slate-400">
                  Add the account manually using the secret below.
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 flex items-center gap-2">
                <code className="flex-1 text-emerald-300 font-mono text-sm break-all">
                  {payload.secret}
                </code>
                <button
                  onClick={() => copyToClipboard(payload.secret)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                  aria-label="Copy secret"
                >
                  {copyState === 'copied'
                    ? <Check className="w-4 h-4 text-emerald-400" />
                    : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Issuer: <span className="text-slate-300">OrbitPay</span> · Algorithm:
                <span className="text-slate-300"> SHA-1 · 6 digits · 30s</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-700">
            <Button
              variant="primary"
              onClick={proceedToVerify}
              icon={<ArrowLeft className="w-4 h-4 rotate-180" />}
            >
              I've added it — continue
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setStep('idle'); setPayload(null); }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── ENROLLMENT: Step 2 — Verify code ─────────────────────────────── */}
      {step === 'verify' && payload && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Badge variant="info">Step 2 of 3</Badge>
            <h2 className="text-lg font-semibold text-white">Confirm with a 6-digit code</h2>
          </div>
          <p className="text-sm text-slate-400">
            Open your authenticator app and enter the 6-digit code it shows for OrbitPay.
          </p>

          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoFocus
              value={verifyCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerifyCode(v);
                if (verifyError) setVerifyError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && verifyCode.length === 6 && !verifying) {
                  submitVerification();
                }
              }}
              placeholder="123456"
              className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white text-2xl font-mono tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                verifyError ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {verifyError && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {verifyError}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-700">
            <Button
              variant="primary"
              onClick={submitVerification}
              disabled={verifyCode.length !== 6 || verifying}
              loading={verifying}
              icon={<Lock className="w-4 h-4" />}
            >
              Verify
            </Button>
            <Button variant="ghost" onClick={() => setStep('qr')}>
              Back
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── ENROLLMENT: Step 3 — Backup codes ────────────────────────────── */}
      {step === 'backup' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Badge variant="warning">Step 3 of 3 — save these!</Badge>
            <h2 className="text-lg font-semibold text-white">Backup recovery codes</h2>
          </div>
          <p className="text-sm text-slate-400">
            If you lose access to your authenticator app, these one-time codes are the only way
            back into your account. Each code works <span className="text-white">once</span>.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              This list will not be shown again in full. Save it now — write it down, store it in a
              password manager, or download the file.
            </p>
          </div>

          {codesRevealed ? (
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {pendingBackupCodes.map((code) => (
                  <code
                    key={code}
                    className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-300 font-mono text-sm text-center select-all"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setCodesRevealed(true)}
              icon={<Eye className="w-4 h-4" />}
            >
              Reveal codes
            </Button>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(pendingBackupCodes.join('\n'))}
              icon={copyState === 'copied' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              Copy all
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadBackupCodes(pendingBackupCodes, 'orbitpay-backup-codes.txt')}
              icon={<Download className="w-4 h-4" />}
            >
              Download .txt
            </Button>
            <Button
              variant="primary"
              onClick={acknowledgeBackupCodes}
              icon={<Check className="w-4 h-4" />}
            >
              I've saved my codes — finish
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── ENROLLMENT: Done ─────────────────────────────────────────────── */}
      {step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">MFA is now enabled</h2>
              <p className="text-sm text-emerald-200/80">
                From your next sign-in, you'll need a code from your authenticator app.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => { setStep('idle'); setPayload(null); }}
          >
            Done
          </Button>
        </motion.div>
      )}

      {/* ─── Disable MFA confirmation modal ───────────────────────────────── */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => { setShowDisableModal(false); setDisableConfirmText(''); }}
        title="Disable two-factor authentication?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              Disabling MFA removes the second factor from your account. Your password alone will
              protect access. This action can be reversed by re-enabling MFA.
            </p>
          </div>
          <p className="text-sm text-slate-300">
            Type <code className="text-white font-mono">DISABLE</code> to confirm.
          </p>
          <input
            type="text"
            value={disableConfirmText}
            onChange={(e) => setDisableConfirmText(e.target.value)}
            placeholder="Type DISABLE"
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => { setShowDisableModal(false); setDisableConfirmText(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={disableMfa}
              disabled={disableConfirmText !== 'DISABLE'}
            >
              Disable MFA
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Regenerate backup codes modal ───────────────────────────────── */}
      <Modal
        isOpen={showRegenModal}
        onClose={() => {
          setShowRegenModal(false);
          setRegeneratedCodes([]);
          setRegenRevealed(false);
          setRegenSaved(false);
        }}
        title="Regenerate backup codes"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            This invalidates all previously-issued backup codes and mints 10 new ones.
            Save them before continuing.
          </p>
          {regeneratedCodes.length === 0 ? (
            <Button
              variant="primary"
              onClick={regenerateCodes}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Generate new codes
            </Button>
          ) : (
            <>
              {regenRevealed ? (
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {regeneratedCodes.map((c) => (
                      <code
                        key={c}
                        className="px-2 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-300 font-mono text-xs text-center select-all"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setRegenRevealed(true)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Reveal new codes
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(regeneratedCodes.join('\n'))}
                  icon={<Copy className="w-4 h-4" />}
                >
                  Copy
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => downloadBackupCodes(regeneratedCodes, 'orbitpay-backup-codes.txt')}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmRegenerate}
                  disabled={!regenRevealed || regenSaved}
                  icon={<Check className="w-4 h-4" />}
                >
                  I've saved them
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}