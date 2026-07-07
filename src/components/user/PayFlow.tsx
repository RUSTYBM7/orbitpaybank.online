/**
 * PayFlow — matches the template's "Pay" screen: masked card chip + recipient
 * + amount + 0-9 keypad + big black "Send" button.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Delete, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrightCard } from '@/components/bright';
import { useStore } from '@/store';

export default function PayFlow() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [amount, setAmount] = useState('2101.70');
  const [note, setNote] = useState('');

  if (!user) return null;

  const press = (key: string) => {
    if (key === 'C') return setAmount('0');
    if (key === '←') return setAmount((s) => s.slice(0, -1) || '0');
    setAmount((s) => (s === '0' ? key : s + key));
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'];

  return (
    <div className="min-h-screen bg-white px-6 pt-6 pb-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-semibold text-neutral-900">Pay</h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
          aria-label="Contacts"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Card chip + recipient */}
      <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-700">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span>•••• 2872</span>
      </div>

      {/* Recipient */}
      <BrightCard size="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-300 text-sm font-bold text-white">
              MR
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Matteo Ricci</div>
              <div className="text-xs text-neutral-500">1111 •••• 1/20</div>
            </div>
          </div>
          <button className="text-xs font-medium text-mint-700 hover:underline">Change</button>
        </div>
      </BrightCard>

      {/* Amount */}
      <div className="mb-6 text-center">
        <div className="text-5xl font-extrabold tracking-tight text-neutral-900">
          ${amount}
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Balance: ${user.balanceUsd.toLocaleString()}
        </div>
      </div>

      {/* Note */}
      <div className="mb-6 rounded-2xl bg-neutral-100 px-4 py-3">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      {/* Keypad */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="flex h-14 items-center justify-center rounded-2xl bg-neutral-100 text-xl font-semibold text-neutral-900 transition hover:bg-neutral-200 active:scale-95"
          >
            {k === '←' ? <Delete className="h-5 w-5" /> : k}
          </button>
        ))}
      </div>

      {/* Send button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl bg-neutral-900 py-4 text-base font-bold text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      >
        Send
      </motion.button>
    </div>
  );
}