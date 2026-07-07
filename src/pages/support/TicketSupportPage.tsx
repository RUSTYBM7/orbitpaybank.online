/**
 * TicketSupportPage — formal support ticket form. Multi-step: choose
 * category, describe the issue, attach evidence, contact preferences,
 * review, and submit.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  FileText,
  User,
  Building,
  AlertCircle,
  Upload,
  Paperclip,
  Send,
  ChevronRight,
} from 'lucide-react';
import SupportLayout from './SupportLayout';

const CATEGORIES = [
  { id: 'card', Icon: CreditCard, label: 'Card issue', body: 'Lost, stolen, replacement, dispute' },
  { id: 'account', Icon: User, label: 'Account', body: 'Login, profile, account closure' },
  { id: 'transaction', Icon: FileText, label: 'Transaction dispute', body: 'Unrecognized charge, missing transfer' },
  { id: 'security', Icon: Lock, label: 'Security concern', body: 'Fraud, suspicious sign-in, locked account' },
  { id: 'business', Icon: Building, label: 'Business banking', body: 'Multi-user, treasury, merchant' },
  { id: 'other', Icon: AlertCircle, label: 'Something else', body: 'Tell us what is going on' },
];

const SEVERITIES = [
  { id: 'low', label: 'Low', body: 'Question, no rush', color: 'bg-emerald-500' },
  { id: 'medium', label: 'Medium', body: 'Affecting one feature', color: 'bg-amber-500' },
  { id: 'high', label: 'High', body: 'Blocking me from banking', color: 'bg-rose-500' },
  { id: 'urgent', label: 'Urgent', body: 'Suspected fraud — call us', color: 'bg-red-600' },
];

export default function TicketSupportPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const submit = () => {
    const id = `OP-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(id);
    setStep(4);
  };

  return (
    <SupportLayout channel="ticket">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="cat" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="p-5">
            <h3 className="text-sm font-semibold text-neutral-900">What do you need help with?</h3>
            <p className="mt-1 text-xs text-neutral-500">Pick the closest match — you can add more detail on the next step.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setStep(1);
                  }}
                  className={`group flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                    category === c.id ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <c.Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{c.label}</div>
                    <div className="text-[11px] text-neutral-500">{c.body}</div>
                  </div>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="sev" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="p-5">
            <h3 className="text-sm font-semibold text-neutral-900">How urgent is it?</h3>
            <p className="mt-1 text-xs text-neutral-500">We use this to triage. For suspected fraud, also call us at 1-800-ORBIT.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSeverity(s.id);
                    setStep(2);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    severity === s.id ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className={`h-3 w-3 rounded-full ${s.color}`} />
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{s.label}</div>
                    <div className="text-[11px] text-neutral-500">{s.body}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              className="mt-3 text-xs text-neutral-500 hover:text-neutral-900"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="body" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="p-5">
            <h3 className="text-sm font-semibold text-neutral-900">Tell us what&rsquo;s going on</h3>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (1 line summary)"
              className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue in detail. Include dates, amounts, and what you expected to happen."
              rows={5}
              className="mt-3 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-[#F5F5F7] p-4 text-center">
              <Upload className="mx-auto mb-1 h-5 w-5 text-neutral-400" />
              <div className="text-xs font-semibold text-neutral-900">Attach screenshots or documents</div>
              <div className="mt-0.5 text-[11px] text-neutral-500">PDF, JPG, PNG · up to 10MB each</div>
              <button
                onClick={() => setFiles((f) => [...f, `evidence-${f.length + 1}.pdf`])}
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900 hover:border-neutral-400"
              >
                <Paperclip className="h-3 w-3" /> Add file
              </button>
            </div>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1">
                {files.map((f) => (
                  <li key={f} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs">
                    <Paperclip className="h-3 w-3 text-neutral-400" /> {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-xs text-neutral-500 hover:text-neutral-900">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!subject || !body}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="contact" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="p-5">
            <h3 className="text-sm font-semibold text-neutral-900">How should we reach you?</h3>
            <p className="mt-1 text-xs text-neutral-500">We&rsquo;ll send updates to whichever you prefer.</p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              type="tel"
              className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-[#F5F5F7] p-3 text-xs text-neutral-600">
              <div className="font-semibold text-neutral-900">Review</div>
              <div className="mt-1 text-[11px]">Category: {category} · Severity: {severity}</div>
              <div className="mt-1 text-[11px]">Subject: {subject}</div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="text-xs text-neutral-500 hover:text-neutral-900">
                ← Back
              </button>
              <button
                onClick={submit}
                disabled={!email}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Submit ticket
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && ticketId && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.div>
            <h3 className="font-serif text-2xl font-medium">Ticket opened</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
              We&rsquo;ve received your case. A confirmation went to{' '}
              <span className="font-semibold text-neutral-900">{email}</span>.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              Tracking ID: {ticketId}
            </div>
            <div className="mt-6 text-xs text-neutral-500">
              Average first response: <span className="font-semibold text-neutral-900">2 hours</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SupportLayout>
  );
}
