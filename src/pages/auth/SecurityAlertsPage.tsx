/**
 * SecurityAlertsPage — list of suspicious sign-in attempts and other
 * security events. Each alert has a status, severity, and an action
 * (mark safe / lock account / review).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, MapPin, Eye, Lock, Bell } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const ALERTS = [
  {
    id: 'a1',
    severity: 'high' as const,
    title: 'Sign-in attempt from a new country',
    body: 'Someone tried to sign in from Lagos, Nigeria. The attempt was blocked because you do not have any trusted devices in that region.',
    when: '3 days ago',
    status: 'open' as const,
    location: 'Lagos, Nigeria',
  },
  {
    id: 'a2',
    severity: 'medium' as const,
    title: 'New device signed in',
    body: 'A new device signed in to your account from Frankfurt, Germany. The attempt failed because the password was incorrect.',
    when: '2 weeks ago',
    status: 'reviewed' as const,
    location: 'Frankfurt, Germany',
  },
  {
    id: 'a3',
    severity: 'low' as const,
    title: 'Password changed',
    body: 'You changed your password 5 days ago. If this was not you, secure your account immediately.',
    when: '5 days ago',
    status: 'safe' as const,
    location: 'Sacramento, CA',
  },
];

const severityColor = (s: 'high' | 'medium' | 'low') =>
  s === 'high'
    ? 'border-rose-200 bg-rose-50/40'
    : s === 'medium'
    ? 'border-amber-200 bg-amber-50/40'
    : 'border-emerald-200 bg-emerald-50/40';

const severityLabel = (s: 'high' | 'medium' | 'low') =>
  s === 'high' ? 'High' : s === 'medium' ? 'Medium' : 'Low';

export default function SecurityAlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);

  const markSafe = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'safe' as const } : a))
    );

  const review = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'reviewed' as const } : a))
    );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            <Bell className="h-3 w-3" /> Security Alerts
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            Unusual activity on your account.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            We monitor every sign-in for patterns that don&rsquo;t match your
            usual behavior. Review anything you don&rsquo;t recognize.
          </p>
        </div>

        <div className="space-y-3">
          {alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 ${severityColor(a.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                    a.severity === 'high'
                      ? 'bg-rose-500 text-white'
                      : a.severity === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {a.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        a.severity === 'high'
                          ? 'bg-rose-500 text-white'
                          : a.severity === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {severityLabel(a.severity)}
                    </span>
                    <span className="rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">{a.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {a.location}
                    </span>
                    <span>{a.when}</span>
                  </div>
                  {a.status === 'open' && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => markSafe(a.id)}
                        className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-600"
                      >
                        <ShieldCheck className="mr-1 inline h-3 w-3" />
                        Mark as safe
                      </button>
                      <Link
                        to="/auth/locked-account"
                        className="rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-600"
                      >
                        <Lock className="mr-1 inline h-3 w-3" />
                        Lock my account
                      </Link>
                      <Link
                        to="/auth/login-history"
                        className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
                      >
                        <Eye className="mr-1 inline h-3 w-3" />
                        Review sign-ins
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
