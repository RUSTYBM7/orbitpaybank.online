/**
 * ReceiveFlow — matches the template's "Receive" screen: yellow gradient
 * Client-pays / You-receive cards, QR + Share + More actions, reference ID input.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Share2, MoreHorizontal, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrightCard } from '@/components/bright';
import { useStore } from '@/store';

const RATES = { USD_EUR: 0.95, USD_GBP: 0.79 };

export default function ReceiveFlow() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [clientAmount, setClientAmount] = useState(648.23);
  const [reference, setReference] = useState('1148990');

  if (!user) return null;
  const eurAmount = clientAmount * RATES.USD_EUR;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-100 via-mint-50 to-white px-6 pt-6 pb-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-[0_4px_16px_rgba(15,17,21,0.05)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold text-neutral-900">Receive</h1>
        <div className="ml-auto flex gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-[0_4px_16px_rgba(15,17,21,0.05)]"
            aria-label="Refresh"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-[0_4px_16px_rgba(15,17,21,0.05)]"
            aria-label="Charts"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Profile avatar */}
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-mint-300 to-sky-300" />
        <div className="text-base font-semibold text-neutral-900">{user.fullName}</div>
        <div className="text-xs text-neutral-500">{user.email}</div>
      </div>

      {/* Conversion: Client pays → You receive */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 space-y-3"
      >
        <BrightCard variant="yellow" size="md" className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-neutral-700/80">
            Client pays
          </div>
          <div className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
            ${clientAmount.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-neutral-700/70">
            {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </BrightCard>

        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(15,17,21,0.06)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <BrightCard variant="yellow" size="md" className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-neutral-700/80">
            You receive
          </div>
          <div className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
            €{eurAmount.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-neutral-700/70">
            {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </BrightCard>
      </motion.div>

      {/* Rate strip */}
      <div className="mb-6 text-center text-xs text-neutral-500">
        1 USD = EUR {RATES.USD_EUR} · GBR {RATES.USD_GBP}
      </div>

      {/* Action row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-neutral-900 shadow-[0_4px_16px_rgba(15,17,21,0.05)]">
          <QrCode className="h-5 w-5" /> Scan QR
        </button>
        <button className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-neutral-900 shadow-[0_4px_16px_rgba(15,17,21,0.05)]">
          <Share2 className="h-5 w-5" /> Share
        </button>
        <button className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-neutral-900 shadow-[0_4px_16px_rgba(15,17,21,05)]">
          <MoreHorizontal className="h-5 w-5" /> More
        </button>
      </div>

      {/* Amount + Reference */}
      <BrightCard size="md" className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">
            Amount (USD)
          </label>
          <input
            type="number"
            value={clientAmount}
            onChange={(e) => setClientAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-mint-300"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">
            Reference ID <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-mint-300"
          />
        </div>
      </BrightCard>

      {/* Bottom nav dots */}
      <div className="mt-8 flex justify-center gap-3">
        <span className="h-2 w-2 rounded-full bg-neutral-900" />
        <span className="h-2 w-2 rounded-full bg-neutral-300" />
        <span className="h-2 w-2 rounded-full bg-neutral-300" />
      </div>
    </div>
  );
}