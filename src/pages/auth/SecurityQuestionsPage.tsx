/**
 * SecurityQuestionsPage — set up legacy security questions. Modern
 * recommendation is MFA, but security questions are still supported as a
 * fallback recovery method.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const QUESTIONS = [
  'What was the name of your first pet?',
  'What city did your parents meet in?',
  'What was the model of your first car?',
  'What is your oldest sibling’s middle name?',
  'What street did you grow up on?',
  'What was the name of your elementary school?',
];

export default function SecurityQuestionsPage() {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q1 && q2 && q3 && a1 && a2 && a3 && new Set([q1, q2, q3]).size === 3) {
      setDone(true);
    }
  };

  if (done) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            Security questions saved.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
            You can use these questions to recover your account if you lose
            access to your second factor.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to all access options
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const Select = ({ value, onChange, idx }: { value: string; onChange: (v: string) => void; idx: number }) => {
    const used = [q1, q2, q3].filter((q) => q && q !== value);
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm text-neutral-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        >
          <option value="">Pick a question</option>
          {QUESTIONS.map((q) => (
            <option key={q} value={q} disabled={used.includes(q)}>
              {q}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            Security Questions
          </div>
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            Pick 3 security questions.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            We recommend MFA instead, but questions are still a valid fallback
            for account recovery. Pick 3 and answer them.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {[
            { idx: 0, q: q1, setQ: setQ1, a: a1, setA: setA1 },
            { idx: 1, q: q2, setQ: setQ2, a: a2, setA: setA2 },
            { idx: 2, q: q3, setQ: setQ3, a: a3, setA: setA3 },
          ].map(({ idx, q, setQ, a, setA }) => (
            <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-1 text-xs font-semibold text-neutral-500">
                Question {idx + 1}
              </div>
              <Select value={q} onChange={setQ} idx={idx} />
              <div className="mt-3">
                <input
                  type="text"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder="Your answer"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={!q1 || !q2 || !q3 || !a1 || !a2 || !a3 || new Set([q1, q2, q3]).size !== 3}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-50"
          >
            Save security questions
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}
