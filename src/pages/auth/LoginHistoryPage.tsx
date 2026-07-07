/**
 * LoginHistoryPage — chronological list of every sign-in attempt (success
 * and failure) with location, device, IP, and timestamp. Lets the member
 * mark "this wasn't me" on any unrecognized event.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, MapPin, Clock, Monitor, Smartphone, Tablet, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const EVENTS = [
  { id: 'e1', type: 'success' as const, when: 'Now', device: 'MacBook Pro 16"', os: 'macOS · Safari 18', location: 'Sacramento, CA', ip: '73.231.xxx.xxx' },
  { id: 'e2', type: 'success' as const, when: '5 min ago', device: 'iPhone 15 Pro', os: 'iOS · OrbitPay App 4.2', location: 'Sacramento, CA', ip: '73.231.xxx.xxx' },
  { id: 'e3', type: 'success' as const, when: 'Yesterday at 9:14 AM', device: 'iPhone 15 Pro', os: 'iOS · OrbitPay App 4.2', location: 'Sacramento, CA', ip: '73.231.xxx.xxx' },
  { id: 'e4', type: 'success' as const, when: '2 days ago at 7:02 PM', device: 'iPad Air', os: 'iPadOS · Safari 18', location: 'San Francisco, CA', ip: '24.124.xxx.xxx' },
  { id: 'e5', type: 'failed' as const, when: '3 days ago at 3:42 AM', device: 'Unknown', os: 'Windows · Chrome 124', location: 'Lagos, Nigeria', ip: '102.89.xxx.xxx' },
  { id: 'e6', type: 'success' as const, when: '5 days ago at 11:00 AM', device: 'Windows Desktop', os: 'Windows 11 · Chrome 124', location: 'Austin, TX', ip: '45.32.xxx.xxx' },
  { id: 'e7', type: 'success' as const, when: '1 week ago at 8:18 AM', device: 'iPhone 15 Pro', os: 'iOS · OrbitPay App 4.2', location: 'Sacramento, CA', ip: '73.231.xxx.xxx' },
  { id: 'e8', type: 'failed' as const, when: '2 weeks ago at 1:09 PM', device: 'Unknown', os: 'Linux · Firefox 122', location: 'Frankfurt, Germany', ip: '85.214.xxx.xxx' },
];

const iconFor = (device: string) =>
  device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')
    ? Smartphone
    : device.toLowerCase().includes('ipad')
    ? Tablet
    : Monitor;

export default function LoginHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const filtered = EVENTS.filter((e) => filter === 'all' || e.type === filter);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <ShieldCheck className="h-3 w-3" /> Login History
            </div>
            <h1 className="font-serif text-3xl font-medium sm:text-4xl">
              Every sign-in, every time.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              A complete audit log of every successful and failed sign-in. We
              keep 90 days of history.
            </p>
          </div>
          <div className="flex gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
            {(['all', 'success', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {filtered.map((e, i) => {
            const Icon = iconFor(e.device);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 rounded-2xl border p-4 ${
                  e.type === 'failed'
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      e.type === 'failed'
                        ? 'bg-rose-500 text-white'
                        : 'bg-gradient-to-br from-rose-500 to-pink-500 text-white'
                    }`}
                  >
                    {e.type === 'failed' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </div>
                  {i < filtered.length - 1 && (
                    <div className="mt-1 h-full w-px bg-neutral-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {e.type === 'success' ? 'Signed in' : 'Failed sign-in attempt'}
                    </h3>
                    <span className="text-[11px] text-neutral-500">{e.when}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {e.device} · {e.os}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                    <span className="font-mono text-[10px]">{e.ip}</span>
                  </div>
                  {e.type === 'failed' && (
                    <div className="mt-2 flex items-center gap-2">
                      <button className="rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-600">
                        This wasn't me
                      </button>
                      <button className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900">
                        I forgot my password
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
