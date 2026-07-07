/**
 * AISupportPage — AI assistant chat surface. Quick-prompt suggestions,
 * a clean conversation view, and an input bar with a model indicator.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, CreditCard, Lock, RefreshCw } from 'lucide-react';
import SupportLayout from './SupportLayout';

type Msg = { id: string; from: 'ai' | 'me'; text: string };

const SUGGESTIONS = [
  { Icon: TrendingUp, label: 'Track my spending', text: 'How much did I spend on dining last month?' },
  { Icon: CreditCard, label: 'Card question', text: 'Can I lock my card from this app?' },
  { Icon: Lock, label: 'Security check', text: 'Show me the last 5 sign-ins to my account.' },
  { Icon: RefreshCw, label: 'Move money', text: 'Transfer $200 from savings to checking.' },
];

export default function AISupportPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'a0',
      from: 'ai',
      text: "Hi! I'm Orbit AI. Ask me about your balances, recent transactions, fees, or any feature. I never store or share your data outside your account.",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: `m${Date.now()}`, from: 'me', text: text.trim() }]);
    setDraft('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          from: 'ai',
          text: "Here's what I found in your account. Want me to walk you through it?",
        },
      ]);
    }, 1200);
  };

  return (
    <SupportLayout channel="ai">
      <div ref={scrollerRef} className="h-[min(60vh,520px)] overflow-y-auto bg-[#F5F5F7] px-4 py-6">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.from === 'ai' ? 'flex items-end gap-2' : 'flex items-end justify-end gap-2'}
              >
                {m.from === 'ai' && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.from === 'ai'
                      ? 'rounded-bl-md bg-white text-neutral-900'
                      : 'rounded-br-md bg-gradient-to-br from-sky-500 to-indigo-500 text-white'
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}

            {thinking && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '120ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 1 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.text)}
                  className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left transition hover:border-sky-300 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100">
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">{s.label}</div>
                    <div className="text-[11px] text-neutral-500">{s.text}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2 border-t border-neutral-200 bg-white p-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Orbit AI anything…"
          className="flex-1 rounded-full border border-neutral-200 bg-[#F5F5F7] px-4 py-2 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sm transition hover:opacity-90"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </SupportLayout>
  );
}
