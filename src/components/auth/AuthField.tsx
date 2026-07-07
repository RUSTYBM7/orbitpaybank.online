/**
 * AuthField — accessible input with label, hint, and error states.
 * Reusable across every auth page.
 */

import { ReactNode, useState, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  showPasswordToggle?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

export default function AuthField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  hint,
  error,
  leftIcon,
  showPasswordToggle,
  inputMode,
  maxLength,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPasswordToggle && showPw ? 'text' : type;
  const id = `field-${name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-700"
      >
        <span>
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
        {hint && (
          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-neutral-500">
            <Info className="h-3 w-3" />
            {hint}
          </span>
        )}
      </label>
      <div
        className={cn(
          'relative flex items-center rounded-2xl border bg-white transition',
          error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : focused
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-neutral-200'
        )}
      >
        {leftIcon && (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className="w-full bg-transparent px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
          <Info className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (v: string[]) => void;
  autoFocus?: boolean;
}

export function OtpInput({ length = 6, value, onChange, autoFocus }: OtpInputProps) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 1);
            const next = [...value];
            next[i] = v;
            onChange(next);
            // Auto-advance
            if (v && e.target.nextElementSibling) {
              (e.target.nextElementSibling as HTMLInputElement).focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              const prev = (e.target.previousElementSibling as HTMLInputElement);
              prev?.focus();
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            if (pasted) {
              const next = pasted.split('');
              while (next.length < length) next.push('');
              onChange(next);
            }
          }}
          className="h-14 w-12 rounded-2xl border border-neutral-200 bg-white text-center text-2xl font-semibold text-neutral-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 sm:h-16 sm:w-14"
        />
      ))}
    </div>
  );
}
