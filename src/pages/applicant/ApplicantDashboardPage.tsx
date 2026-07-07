/**
 * ApplicantDashboardPage — authenticated dashboard where applicants can
 * resume/edit drafts, track status, view timeline, send secure messages,
 * download docs, and cancel applications.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Eye,
  Upload,
  MessageCircle,
  Download,
  XCircle,
  ChevronRight,
  Sparkles,
  Calendar,
  Bell,
  Shield,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { useNotifications, notify } from '@/state/notifications';

const APPLICATIONS = [
  {
    id: 'app-001',
    product: 'Personal Checking',
    status: 'approved',
    submittedAt: '2026-07-02',
    updatedAt: '2026-07-04',
    nextStep: 'Card ships in 5–7 business days',
    color: 'emerald',
  },
  {
    id: 'app-002',
    product: 'Mortgage',
    status: 'in-review',
    submittedAt: '2026-06-28',
    updatedAt: '2026-07-05',
    nextStep: 'Awaiting appraisal',
    color: 'amber',
  },
  {
    id: 'app-003',
    product: 'Rewards Credit Card',
    status: 'draft',
    submittedAt: null,
    updatedAt: '2026-07-06',
    nextStep: 'Resume — 7 minutes to finish',
    color: 'rose',
  },
];

const TIMELINE = [
  { date: '2026-07-06', title: 'You added a draft Rewards Card application', icon: Edit3, color: 'rose' },
  { date: '2026-07-05', title: 'Mortgage moved to appraisal review', icon: Clock, color: 'amber' },
  { date: '2026-07-04', title: 'Personal Checking approved', icon: CheckCircle2, color: 'emerald' },
  { date: '2026-07-02', title: 'You submitted Personal Checking application', icon: FileText, color: 'neutral' },
  { date: '2026-06-28', title: 'You submitted Mortgage application', icon: FileText, color: 'neutral' },
];

const MESSAGES = [
  {
    id: 'm1',
    from: 'OrbitPay Mortgage Team',
    subject: 'Appraisal scheduled',
    body: 'Your appraisal is scheduled for July 12 at 10:00 AM. Please ensure access to the property.',
    when: '2 hours ago',
  },
  {
    id: 'm2',
    from: 'OrbitPay Card Services',
    subject: 'Card shipped',
    body: 'Your OrbitPay Personal Checking card has shipped. Expect delivery in 5–7 business days.',
    when: 'yesterday',
  },
];

const DOCUMENTS = [
  { name: 'Mortgage application — submitted.pdf', size: '824 KB', type: 'application' },
  { name: 'Pay stub — June 2026.pdf', size: '212 KB', type: 'supporting' },
  { name: 'Bank statement — May 2026.pdf', size: '436 KB', type: 'supporting' },
  { name: 'Drivers-license-front.jpg', size: '1.2 MB', type: 'identity' },
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; Icon: any }> = {
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: CheckCircle2 },
  'in-review': { label: 'In review', bg: 'bg-amber-50', text: 'text-amber-700', Icon: Clock },
  draft: { label: 'Draft', bg: 'bg-rose-50', text: 'text-rose-700', Icon: Edit3 },
  declined: { label: 'Declined', bg: 'bg-neutral-100', text: 'text-neutral-600', Icon: XCircle },
};

export default function ApplicantDashboardPage() {
  const [tab, setTab] = useState<'apps' | 'messages' | 'docs'>('apps');
  const notif = useNotifications();

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <Sparkles className="h-3 w-3" /> Applicant dashboard
            </div>
            <h1 className="font-serif text-3xl font-medium sm:text-4xl">
              Welcome back, Mavis.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              Track every application, upload missing documents, and message
              your team — all in one place.
            </p>
          </div>
          <Link
            to="/enroll"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Start a new application
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Notification demo bar */}
        <div className="mb-6 rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Notifications</h2>
              <p className="text-[11px] text-neutral-600">
                The bell on top right mirrors every notification across devices.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['welcome', 'verify-email', 'identity-approved', 'docs-requested', 'approved', 'card-issued', 'new-device', 'security-alert'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => notify(notif, k)}
                  className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700 hover:bg-rose-50"
                >
                  {k.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Total applications', value: '3', Icon: FileText, color: 'rose' },
            { label: 'Approved', value: '1', Icon: CheckCircle2, color: 'emerald' },
            { label: 'In review', value: '1', Icon: Clock, color: 'amber' },
            { label: 'Drafts', value: '1', Icon: Edit3, color: 'rose' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <s.Icon className={`mb-2 h-4 w-4 ${s.color === 'emerald' ? 'text-emerald-500' : s.color === 'amber' ? 'text-amber-500' : 'text-rose-500'}`} />
              <div className="text-2xl font-semibold text-neutral-900">{s.value}</div>
              <div className="text-xs text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-neutral-200">
          {[
            { id: 'apps', label: 'Applications', count: 3 },
            { id: 'messages', label: 'Secure messages', count: 2 },
            { id: 'docs', label: 'Documents', count: 4 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`relative rounded-t-2xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'text-rose-600' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-700">{t.count}</span>
              {tab === t.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-t bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {tab === 'apps' && (
              <div className="space-y-3">
                {APPLICATIONS.map((a) => {
                  const Badge = STATUS_BADGE[a.status];
                  return (
                    <div key={a.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                          a.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                          a.color === 'amber' ? 'from-amber-500 to-orange-500' :
                          'from-rose-500 to-pink-500'
                        } text-white`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-neutral-900">{a.product}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full ${Badge.bg} px-2 py-0.5 text-[10px] font-semibold ${Badge.text}`}>
                              <Badge.Icon className="h-3 w-3" /> {Badge.label}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                            {a.submittedAt && <span><Calendar className="mr-0.5 inline h-3 w-3" /> Submitted {a.submittedAt}</span>}
                            <span>Updated {a.updatedAt}</span>
                          </div>
                          <div className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                            <strong>Next:</strong> {a.nextStep}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {a.status === 'draft' ? (
                              <Link to="/onboard" className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-600">
                                <Edit3 className="h-3 w-3" /> Resume
                              </Link>
                            ) : (
                              <button className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-neutral-800">
                                <Eye className="h-3 w-3" /> View
                              </button>
                            )}
                            {a.status === 'in-review' && (
                              <button className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 hover:border-neutral-400">
                                <Upload className="h-3 w-3" /> Upload document
                              </button>
                            )}
                            {a.status === 'draft' && (
                              <button className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">
                                <XCircle className="h-3 w-3" /> Cancel draft
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'messages' && (
              <div className="space-y-3">
                {MESSAGES.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-neutral-900">{m.subject}</h3>
                          <span className="text-[11px] text-neutral-500">{m.when}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">{m.from}</div>
                        <p className="mt-2 text-sm text-neutral-700">{m.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:border-neutral-400">
                  <MessageCircle className="h-4 w-4" /> New message
                </button>
              </div>
            )}

            {tab === 'docs' && (
              <div className="space-y-2">
                {DOCUMENTS.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-900">{d.name}</div>
                      <div className="text-[11px] text-neutral-500">{d.size} · {d.type}</div>
                    </div>
                    <button className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:border-neutral-400">
                  <Upload className="h-4 w-4" /> Upload document
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold text-neutral-500">Timeline</h3>
              <ol className="space-y-3">
                {TIMELINE.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        t.color === 'emerald' ? 'bg-emerald-500 text-white' :
                        t.color === 'amber' ? 'bg-amber-500 text-white' :
                        t.color === 'rose' ? 'bg-rose-500 text-white' :
                        'bg-neutral-300 text-neutral-600'
                      }`}>
                        <t.icon className="h-3.5 w-3.5" />
                      </div>
                      {i < TIMELINE.length - 1 && <div className="my-1 h-6 w-px bg-neutral-200" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="text-xs text-neutral-500">{t.date}</div>
                      <div className="text-sm text-neutral-900">{t.title}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                <div>
                  <div className="text-xs font-semibold text-rose-700">Security tip</div>
                  <p className="mt-1 text-[11px] text-rose-800/80">
                    OrbitPay will never call you to ask for your password or
                    one-time codes. When in doubt, hang up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}