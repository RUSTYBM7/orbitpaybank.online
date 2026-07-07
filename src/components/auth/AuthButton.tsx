/**
 * AuthButton — primary action button used across every auth page.
 * Supports loading, disabled, and gradient variants.
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export default function AuthButton({
  variant = 'primary',
  loading,
  fullWidth = true,
  icon,
  children,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  const base =
    'group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary:
      'bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/30',
    secondary:
      'border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400',
    ghost: 'text-rose-600 hover:bg-rose-50',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        base,
        styles[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}
