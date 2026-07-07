/**
 * ChatSupportPage — Intercom-style human chat. Conversation view, input
 * bar, suggested quick replies, member-side attachment/emoji affordances.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, ChevronDown, MoreHorizontal } from 'lucide-react';
import SupportLayout from './SupportLayout';

type Msg = { id: string; from: 'them' | 'me'; text: string; time: string; status?: 'sent' | 'delivered' | 'read' };

const SEED_MESSAGES: Msg[] = [
  {
    id: 'm1',
    from: 'them',
    text: "Hi! I'm Sarah from the OrbitPay support team. 👋  How can I help you today?",
    time: '10:42 AM',
  },
];

const QUICK_REPLIES = [
  'I have a question about a recent charge',
  'I need to dispute a transaction',
  'I lost my card',
  'Help me open a new account',
];

export default function ChatSupportPage() {
  const [messages, setMessages] = useState<Msg[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const me: Msg = { id: `m${Date.now()}`, from: 'me', text: text.trim(), time: 'now', status: 'sent' };
    setMessages((m) => [...m, me]);
    setDraft('');
    // Simulate reply
    setTimeout(() => {
      const reply: Msg = {
        id: `m${Date.now() + 1}`,
        from: 'them',
        text: "Got it — I'm looking that up for you. One moment please.",
        time: 'now',
      };
      setMessages((m) => [...m, reply]);
    }, 900);
  };

  return (
    <SupportLayout channel="human">
      {/* Conversation area */}
      <div
        ref={scrollerRef}
        className="h-[min(60vh,520px)] overflow-y-auto bg-[#F5F5F7] px-4 py-6"
      >
        <div className="flex flex-col gap-3">
          <div className="mx-auto rounded-full bg-white px-3 py-1 text-[11px] text-neutral-500 shadow-sm">
            Today
          </div>

          <AnimatePresence initial={false}>
            {messages.map((m) =>
              m.from === 'them' ? (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-[10px] font-bold text-white">
                    S
                  </div>
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm">
                      {m.text}
                    </div>
                    <div className="mt-1 text-[10px] text-neutral-400">{m.time}</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end justify-end gap-2"
                >
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-rose-500 to-pink-500 px-4 py-2.5 text-sm text-white shadow-sm">
                      {m.text}
                    </div>
                    <div className="mt-1 text-right text-[10px] text-neutral-400">
                      {m.time} {m.status ? `· ${m.status}` : ''}
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {messages.length <= 2 && (
            <div className="mt-2 flex flex-wrap gap-2 pl-9">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2 border-t border-neutral-200 bg-white p-3"
      >
        <button
          type="button"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply…"
          className="flex-1 rounded-full border border-neutral-200 bg-[#F5F5F7] px-4 py-2 text-sm outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
        />
        <button
          type="button"
          className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 sm:flex"
          aria-label="Emoji"
        >
          <Smile className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm transition hover:opacity-90"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="border-t border-neutral-200 bg-[#F5F5F7] px-4 py-2 text-center text-[11px] text-neutral-500">
        Encrypted end-to-end · Powered by OrbitPay Support
      </div>
    </SupportLayout>
  );
}
