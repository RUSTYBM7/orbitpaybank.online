/**
 * One-shot auth pages that share the same shell + simple form pattern.
 * Used for: forgot-username, recover-membership, recover-online-id,
 * unlock-account, verify-email, verify-phone, verify-authenticator.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Lock,
  KeyRound,
  Hash,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { OtpInput } from '@/components/auth/AuthField';

export interface SimpleAuthPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  field: 'email' | 'phone' | 'member' | 'username' | 'ssoid' | 'code';
  fieldLabel: string;
  fieldPlaceholder?: string;
  fieldLeftIcon?: LucideIcon;
  primaryAction: string;
  doneTitle: string;
  doneBody: string;
  successIcon?: LucideIcon;
  variant?: 'light' | 'dark';
  destination?: string;
  skipField?: boolean;
  otp?: boolean;
}

const fieldType: Record<string, 'text' | 'email' | 'tel' | 'password'> = {
  email: 'email',
  phone: 'tel',
  member: 'text',
  username: 'text',
  ssoid: 'text',
  code: 'text',
};

const fieldAutoComplete: Record<string, string> = {
  email: 'email',
  phone: 'tel',
  member: 'username',
  username: 'username',
  ssoid: 'username',
  code: 'one-time-code',
};

export default function SimpleAuthPage({
  eyebrow,
  title,
  subtitle,
  field,
  fieldLabel,
  fieldPlaceholder,
  fieldLeftIcon: FieldIcon,
  primaryAction,
  doneTitle,
  doneBody,
  successIcon: SuccessIcon = CheckCircle,
  variant = 'light',
  destination = '/auth/sign-in',
  skipField,
  otp,
}: SimpleAuthPageProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!skipField && !value) {
      setError(`${fieldLabel} is required.`);
      return;
    }
    if (otp && code.join('').length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 600);
  };

  if (done) {
    return (
      <AuthShell
        eyebrow={eyebrow}
        title={doneTitle}
        subtitle={doneBody}
        variant={variant}
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <SuccessIcon className="h-8 w-8" />
          </div>
          <AuthButton onClick={() => navigate(destination)}>
            Continue
          </AuthButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow={eyebrow} title={title} subtitle={subtitle} variant={variant}>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!skipField && (
          <AuthField
            label={fieldLabel}
            name={field}
            type={fieldType[field]}
            value={value}
            onChange={setValue}
            placeholder={fieldPlaceholder}
            required
            autoComplete={fieldAutoComplete[field]}
            leftIcon={FieldIcon ? <FieldIcon className="h-4 w-4" /> : undefined}
          />
        )}
        {otp && <OtpInput value={code} onChange={setCode} autoFocus />}
        <AuthButton type="submit" loading={loading}>
          {primaryAction}
        </AuthButton>
        <p className="text-center text-xs text-neutral-500">
          <Link to="/auth" className="font-semibold text-rose-600 hover:text-rose-700">
            ← All access options
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
