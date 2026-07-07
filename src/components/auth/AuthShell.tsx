/**
 * AuthShell — shared layout for every auth page (sign in, sign up, MFA,
 * recovery, etc.). Wraps content in a split layout: brand panel on the
 * left, form panel on the right, with a responsive stack on mobile.
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  sideArt?: ReactNode;
  badge?: string;
  trustLine?: string;
  variant?: 'light' | 'dark';
}

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  sideArt,
  badge,
  trustLine = 'Federally insured by NCUA · 256-bit encryption · Trusted by 2.4M+ members',
  variant = 'light',
}: AuthShellProps) {
  const dark = variant === 'dark';

  return (
    <div
      className={cn(
        'min-h-screen w-full',
        dark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F7] text-neutral-900'
      )}
    >
      {/* Top bar */}
      <div
        className={cn(
          'flex items-center justify-between border-b px-6 py-4 backdrop-blur',
          dark
            ? 'border-white/10 bg-[#0A0A0A]/80'
            : 'border-neutral-200 bg-white/80'
        )}
      >
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 text-sm font-semibold transition',
            dark ? 'text-white hover:text-rose-300' : 'text-[#0F1E4A] hover:text-rose-600'
          )}
        >
          <span>Orbitpay Finance</span>
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <Link
            to="/"
            className={cn(
              'inline-flex items-center gap-1 transition',
              dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-2">
        {/* Left: form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <Sparkles className="h-3 w-3" />
              {eyebrow}
            </div>
            <h1 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
              {title}
            </h1>
            <p
              className={cn(
                'mt-3 text-sm leading-relaxed sm:text-base',
                dark ? 'text-neutral-300' : 'text-neutral-600'
              )}
            >
              {subtitle}
            </p>
            {badge && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                {badge}
              </div>
            )}
            <div className="mt-8">{children}</div>
            <div
              className={cn(
                'mt-10 flex items-center gap-2 border-t pt-6 text-[11px]',
                dark ? 'border-white/10 text-neutral-400' : 'border-neutral-200 text-neutral-500'
              )}
            >
              <Lock className="h-3 w-3" />
              {trustLine}
            </div>
          </div>
        </motion.div>

        {/* Right: brand art */}
        <div className="relative hidden overflow-hidden bg-[#0A0A0A] lg:block">
          {sideArt ?? <DefaultSideArt />}
        </div>
      </div>
    </div>
  );
}

function DefaultSideArt() {
  return (
    <div className="relative h-full w-full">
      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-rose-500/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/20 blur-[100px]" />
      </div>

      {/* Brand big */}
      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center text-white">
        <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
          Banking that{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
          >
            moves at your orbit.
          </span>
        </h2>
        <p className="mt-3 max-w-md text-sm text-neutral-300">
          Multi-currency accounts, instant global transfers, AI-powered money
          management — all in a premium 2030-grade experience.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { v: '2.4M+', l: 'Members' },
            { v: '$15B', l: 'Assets' },
            { v: '4.9 ★', l: 'App rating' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
              <div className="text-lg font-bold text-white">{s.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-400">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500">
            <ShieldCheck className="h-3 w-3" />
            NCUA Insured · SOC 2 · ISO 27001
          </div>
        </div>
      </div>
    </div>
  );
}
