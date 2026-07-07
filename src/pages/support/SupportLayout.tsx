/**
 * SupportLayout — shared shell for the three support surfaces (chat with
 * human, AI chat, create ticket). The header is Intercom-inspired: a
 * member photo, name, role, and online status dot.
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, MessageCircle, PlusCircle, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

interface SupportLayoutProps {
  children: ReactNode;
  channel: 'human' | 'ai' | 'ticket';
}

const CHANNEL_META: Record<SupportLayoutProps['channel'], {
  eyebrow: string;
  name: string;
  role: string;
  blurb: string;
  Icon: any;
  accent: string;
}> = {
  human: {
    eyebrow: 'Live chat',
    name: 'OrbitPay Support',
    role: 'Real humans · avg reply 90s',
    blurb: 'A real person from our member support team. No bots, no call centers, no scripts.',
    Icon: MessageCircle,
    accent: 'from-rose-500 to-pink-500',
  },
  ai: {
    eyebrow: 'AI assistant',
    name: 'Orbit AI',
    role: 'Powered by your account data',
    blurb: 'Ask anything about your accounts, fees, features, or recent transactions.',
    Icon: Sparkles,
    accent: 'from-sky-500 to-indigo-500',
  },
  ticket: {
    eyebrow: 'Support ticket',
    name: 'Create a ticket',
    role: 'Formal case with tracking ID',
    blurb: 'Open a formal support case. We respond by email and in your dashboard.',
    Icon: PlusCircle,
    accent: 'from-emerald-500 to-teal-500',
  },
};

export default function SupportLayout({ children, channel }: SupportLayoutProps) {
  const meta = CHANNEL_META[channel];
  const Icon = meta.Icon;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Channel nav */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <Link
            to="/support/chat"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
              channel === 'human' ? 'bg-rose-500 text-white' : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <MessageCircle className="h-3 w-3" /> Live chat
          </Link>
          <Link
            to="/support/ai"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
              channel === 'ai' ? 'bg-sky-500 text-white' : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <Sparkles className="h-3 w-3" /> AI chat
          </Link>
          <Link
            to="/support/ticket"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
              channel === 'ticket' ? 'bg-emerald-500 text-white' : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <PlusCircle className="h-3 w-3" /> New ticket
          </Link>
        </div>

        {/* Header card — Intercom-style team header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className={`relative bg-gradient-to-br ${meta.accent} p-6 text-white`}>
            <Link
              to="/"
              className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur transition hover:bg-white/25"
            >
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                  OP
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">{meta.eyebrow}</div>
                <div className="text-xl font-semibold">{meta.name}</div>
                <div className="text-xs text-white/80">{meta.role}</div>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 border-b border-neutral-200 bg-[#F5F5F7] px-5 py-3 text-xs text-neutral-600">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
            <span>{meta.blurb}</span>
          </div>

          {children}
        </motion.div>
      </div>
    </PublicLayout>
  );
}
