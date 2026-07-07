/**
 * NotificationSystem — global toast + bell + notification center.
 *
 * A `NotificationProvider` mounts once at the app root, exposes a
 * `useNotifications()` hook returning `{ toasts, center, push, dismiss }`,
 * and renders the floating Bell + slide-out Center panel + toast shelf.
 *
 * Each toast has a template (12 built-ins), a title, an optional CTA,
 * a duration, and one of 4 severities. The bell badge reads the unread
 * count from the same store and opens the center popover on click.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Shield,
  Lock,
  CreditCard,
  Mail,
  Smartphone,
  KeyRound,
  Send,
  ChevronRight,
  X,
  FileCheck2,
  Hourglass,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type NotificationIcon =
  | 'welcome'
  | 'verify'
  | 'identity'
  | 'docs'
  | 'submitted'
  | 'approved'
  | 'declined'
  | 'account-opened'
  | 'card-issued'
  | 'card-shipped'
  | 'loan-update'
  | 'banking-activated'
  | 'password-changed'
  | 'new-device'
  | 'security-alert';

type Severity = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  id: string;
  icon: NotificationIcon;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
  severity: Severity;
  durationMs?: number;
  createdAt: number;
  read: boolean;
}

const iconMap: Record<NotificationIcon, any> = {
  welcome: Sparkles,
  verify: Mail,
  identity: Shield,
  docs: FileCheck2,
  submitted: Hourglass,
  approved: CheckCircle2,
  declined: XCircle,
  'account-opened': Sparkles,
  'card-issued': CreditCard,
  'card-shipped': Send,
  'loan-update': Info,
  'banking-activated': KeyRound,
  'password-changed': Lock,
  'new-device': Smartphone,
  'security-alert': Shield,
};

const severityClass = (s: Severity) =>
  s === 'success'
    ? 'bg-emerald-500 text-white'
    : s === 'warning'
    ? 'bg-amber-500 text-white'
    : s === 'danger'
    ? 'bg-rose-500 text-white'
    : 'bg-gradient-to-br from-rose-500 to-pink-500 text-white';

const severityRing = (s: Severity) =>
  s === 'success'
    ? 'ring-emerald-500/30'
    : s === 'warning'
    ? 'ring-amber-500/30'
    : s === 'danger'
    ? 'ring-rose-500/30'
    : 'ring-rose-500/30';

interface NotificationApi {
  notifications: AppNotification[];
  unread: number;
  push: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => string;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  popToast: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => string;
}

const Ctx = createContext<NotificationApi | null>(null);

let nextId = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const push = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const id = `n_${Date.now()}_${++nextId}`;
    const note: AppNotification = { ...n, id, createdAt: Date.now(), read: false };
    setNotifications((prev) => [note, ...prev]);
    return id;
  }, []);

  const popToast = useCallback(
    (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const id = push(n);
      const ms = n.durationMs ?? 5000;
      if (ms > 0) setTimeout(() => dismiss(id), ms);
      return id;
    },
    [push, dismiss]
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const clear = useCallback(() => setNotifications([]), []);

  const api = useMemo<NotificationApi>(
    () => ({
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      push,
      dismiss,
      markRead,
      markAllRead,
      clear,
      popToast,
    }),
    [notifications, push, dismiss, markRead, markAllRead, clear, popToast]
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <ToastShelf />
    </Ctx.Provider>
  );
}

export function useNotifications(): NotificationApi {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback when provider isn't mounted yet — show toasts/no-ops.
    return {
      notifications: [],
      unread: 0,
      push: () => '',
      dismiss: () => {},
      markRead: () => {},
      markAllRead: () => {},
      clear: () => {},
      popToast: () => '',
    };
  }
  return v;
}

const TEMPLATES: Record<string, Omit<AppNotification, 'id' | 'createdAt' | 'read'>> = {
  welcome: { icon: 'welcome', severity: 'success', title: 'Welcome to OrbitPay!', body: 'Your membership is active. Let’s get your online banking set up.', cta: { label: 'Set up online banking', href: '/auth/mfa-setup' } },
  'verify-email': { icon: 'verify', severity: 'info', title: 'Verify your email', body: 'We sent a 6-digit code to your inbox. It expires in 10 minutes.', cta: { label: 'Enter code', href: '/auth/verify-email' } },
  'verify-phone': { icon: 'verify', severity: 'info', title: 'Verify your phone', body: 'We sent a 6-digit code by SMS.', cta: { label: 'Enter code', href: '/auth/verify-phone' } },
  'identity-approved': { icon: 'identity', severity: 'success', title: 'Identity approved', body: 'KYC matched your records. No further action needed.' },
  'docs-requested': { icon: 'docs', severity: 'warning', title: 'Additional documents requested', body: 'We need a recent pay stub before we can finish your review.', cta: { label: 'Upload now', href: '/applicant/dashboard' } },
  submitted: { icon: 'submitted', severity: 'info', title: 'Application submitted', body: 'Our team is reviewing your application. Most reviews finish within 1–3 business days.' },
  approved: { icon: 'approved', severity: 'success', title: 'You’re approved!', body: 'Your application is approved. We’ll email your membership number shortly.', cta: { label: 'View status', href: '/applicant/dashboard' } },
  declined: { icon: 'declined', severity: 'danger', title: 'Application declined', body: 'Unfortunately we couldn’t approve this application. See your dashboard for next steps.', cta: { label: 'Open dashboard', href: '/applicant/dashboard' } },
  'account-opened': { icon: 'account-opened', severity: 'success', title: 'Account opened', body: 'Your new account is live in the dashboard.' },
  'card-issued': { icon: 'card-issued', severity: 'success', title: 'Card issued', body: 'Your card is on its way. Expect delivery in 5–7 business days.' },
  'card-shipped': { icon: 'card-shipped', severity: 'info', title: 'Card shipped', body: 'Your card left our facility. Tracking is on the way to your email.' },
  'loan-update': { icon: 'loan-update', severity: 'info', title: 'Loan update', body: 'Your loan application moved to the next stage.' },
  'banking-activated': { icon: 'banking-activated', severity: 'success', title: 'Online banking activated', body: 'Your username and MFA are ready. Sign in any time.' },
  'password-changed': { icon: 'password-changed', severity: 'info', title: 'Password changed', body: 'If this wasn’t you, secure your account immediately.', cta: { label: 'Review sign-in history', href: '/auth/login-history' } },
  'new-device': { icon: 'new-device', severity: 'warning', title: 'New device signed in', body: 'A new device just signed in from a location you haven’t used before.', cta: { label: 'Review', href: '/auth/security-alerts' } },
  'security-alert': { icon: 'security-alert', severity: 'danger', title: 'Suspicious activity', body: 'We blocked a sign-in attempt that didn’t match your usual pattern.', cta: { label: 'Review alerts', href: '/auth/security-alerts' } },
};

export function notify(api: NotificationApi, templateKey: keyof typeof TEMPLATES, overrides?: Partial<AppNotification>) {
  const t = TEMPLATES[templateKey];
  if (!t) return '';
  return api.popToast({ ...t, ...overrides });
}

/** Internal surface — toast shelf only. Bell + center panel live in <SupportButton />. */
function ToastShelf() {
  const api = useContext(Ctx);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  // Track toasts separately so they fade away from shelf but stay in the history store.
  useEffect(() => {
    if (!api) return;
    const live = api.notifications.filter((n) => (n.durationMs ?? 0) > 0);
    setToasts(live.slice(0, 4));
  }, [api]);

  if (!api) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[58] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} n={t} onDismiss={api.dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ n, onDismiss }: { n: AppNotification; onDismiss: (id: string) => void }) {
  const Icon = iconMap[n.icon] ?? Info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 220 }}
      className="pointer-events-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-xl"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl ${severityClass(n.severity)}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900">{n.title}</h3>
          {n.body && <p className="mt-0.5 text-xs text-neutral-600">{n.body}</p>}
          {n.cta && (
            <Link
              to={n.cta.href}
              onClick={() => onDismiss(n.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              {n.cta.label}
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <button
          onClick={() => onDismiss(n.id)}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// Convenience severity icon exports
export const SeverityIcon = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};
