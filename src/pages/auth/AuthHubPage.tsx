/**
 * AuthHubPage — the landing hub for every authentication and account-access
 * entry point. The user lands here and picks what they need.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  LogIn,
  UserPlus,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  AlertTriangle,
  History,
  HelpCircle,
  Sparkles,
  Check,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const ENTRIES = [
  {
    icon: LogIn,
    title: 'Sign In',
    description: 'Use your username and password, biometrics, or a passkey.',
    href: '/auth/sign-in',
    primary: true,
    badge: 'Most common',
  },
  {
    icon: UserPlus,
    title: 'Create Online ID',
    description: 'First time signing in? Enroll in online banking here.',
    href: '/auth/sign-up',
  },
  {
    icon: KeyRound,
    title: 'Forgot Username',
    description: 'Recover by verified email or phone number.',
    href: '/auth/forgot-username',
  },
  {
    icon: Lock,
    title: 'Forgot Password',
    description: 'Reset via email, SMS, or one-time recovery code.',
    href: '/auth/forgot-password',
  },
  {
    icon: ShieldCheck,
    title: 'Unlock Account',
    description: 'Too many failed attempts? Unlock your account here.',
    href: '/auth/unlock-account',
  },
  {
    icon: Smartphone,
    title: 'Setup MFA',
    description: 'Add an authenticator app, hardware key, or SMS backup.',
    href: '/auth/mfa-setup',
  },
  {
    icon: Fingerprint,
    title: 'Biometrics & Passkeys',
    description: 'Enable Face ID, Touch ID, or a passkey for sign-in.',
    href: '/auth/passkey-setup',
  },
  {
    icon: History,
    title: 'Login History',
    description: 'See every successful sign-in and failed attempt.',
    href: '/auth/login-history',
  },
  {
    icon: AlertTriangle,
    title: 'Security Alerts',
    description: 'Review and resolve suspicious sign-in attempts.',
    href: '/auth/security-alerts',
  },
];

const RECOVERY_OPTIONS = [
  {
    title: 'Recover Membership Number',
    description: 'Forgotten your member number? Verify your identity to recover.',
    href: '/auth/recover-membership',
  },
  {
    title: 'Recover Online Banking ID',
    description: 'Lost access to your username? Use email or phone to recover.',
    href: '/auth/recover-online-id',
  },
  {
    title: 'Backup Recovery Codes',
    description: 'Generate or recover the one-time codes you saved at signup.',
    href: '/auth/recovery-codes',
  },
];

export default function AuthHubPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            <Sparkles className="h-3 w-3" />
            Member Access
          </div>
          <h1 className="font-serif text-4xl font-medium sm:text-5xl">
            Sign in, recover, or{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
            >
              set up access.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Pick the option that matches what you need. We have a real human
            on the other end if you get stuck — phone, chat, or in-app.
          </p>
        </motion.div>

        {/* Quick action — primary sign-in */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-8 grid gap-4 md:grid-cols-2"
        >
          <Link
            to="/auth/sign-in"
            className="group flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-pink-500 p-6 text-white shadow-xl shadow-rose-500/20 transition hover:shadow-2xl"
          >
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                <Check className="h-3 w-3" /> Most common
              </div>
              <h2 className="text-2xl font-semibold">Sign in to OrbitPay</h2>
              <p className="mt-1 text-sm text-white/85">
                Username, password, biometrics, or passkey.
              </p>
            </div>
            <LogIn className="h-10 w-10 flex-shrink-0 transition group-hover:scale-110" />
          </Link>
          <Link
            to="/auth/sign-up"
            className="group flex items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-rose-300 hover:shadow-md"
          >
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                New here
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                Create an Online ID
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                First time signing in for online banking. Takes 2 minutes.
              </p>
            </div>
            <UserPlus className="h-10 w-10 flex-shrink-0 text-rose-500 transition group-hover:scale-110" />
          </Link>
        </motion.div>

        {/* All entries */}
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">
              All access options
            </h2>
            <span className="text-xs text-neutral-500">
              {ENTRIES.length} entry points
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ENTRIES.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  to={e.href}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-rose-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <e.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {e.title}
                      </h3>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      {e.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recovery */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
            Recovery & account lookup
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {RECOVERY_OPTIONS.map((r) => (
              <Link
                key={r.title}
                to={r.href}
                className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-[#F5F5F7] p-5 transition hover:border-rose-300 hover:bg-white"
              >
                <h3 className="text-sm font-semibold text-neutral-900">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-neutral-600">{r.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                  Continue
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Help */}
        <section className="mt-12 rounded-3xl border border-neutral-200 bg-white p-6 text-center sm:p-8">
          <HelpCircle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
          <h2 className="text-lg font-semibold sm:text-xl">
            Can&rsquo;t find what you need?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600">
            Call our member services line 7am&ndash;11pm ET, 7 days a week.
            Real people, no menus, no bots.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <a
              href="tel:13238927090"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              Call (323) 892-7090
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
            >
              Other ways to reach us
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
