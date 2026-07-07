/**
 * TrustedDevicesPage — list every device that has signed in to your
 * account, with metadata (location, OS, browser, last active). Revoke
 * individual devices or all of them at once.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Check,
  Plus,
  Clock,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const INITIAL = [
  {
    id: 'd1',
    name: 'MacBook Pro 16"',
    type: 'laptop' as const,
    os: 'macOS 14.5',
    browser: 'Safari 18',
    location: 'Sacramento, CA',
    ip: '73.231.xxx.xxx',
    lastActive: 'Now',
    current: true,
  },
  {
    id: 'd2',
    name: 'iPhone 15 Pro',
    type: 'phone' as const,
    os: 'iOS 17.5',
    browser: 'OrbitPay App 4.2',
    location: 'Sacramento, CA',
    ip: '73.231.xxx.xxx',
    lastActive: '5 min ago',
    current: true,
  },
  {
    id: 'd3',
    name: 'iPad Air',
    type: 'tablet' as const,
    os: 'iPadOS 17',
    browser: 'Safari 18',
    location: 'San Francisco, CA',
    ip: '24.124.xxx.xxx',
    lastActive: '2 days ago',
    current: false,
  },
  {
    id: 'd4',
    name: 'Windows Desktop',
    type: 'laptop' as const,
    os: 'Windows 11',
    browser: 'Chrome 124',
    location: 'Austin, TX',
    ip: '45.32.xxx.xxx',
    lastActive: '3 weeks ago',
    current: false,
  },
];

const iconFor = (type: string) => (type === 'phone' ? Smartphone : type === 'tablet' ? Tablet : Monitor);

export default function TrustedDevicesPage() {
  const [devices, setDevices] = useState(INITIAL);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const remove = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setConfirmId(null);
  };

  const removeAll = () => {
    setDevices((prev) => prev.filter((d) => d.current));
    setConfirmAll(false);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <ShieldCheck className="h-3 w-3" /> Trusted Devices
            </div>
            <h1 className="font-serif text-3xl font-medium sm:text-4xl">
              Devices that can sign in.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">
              Trusted devices skip MFA for 30 days. Review this list
              regularly and remove anything you don&rsquo;t recognize.
            </p>
          </div>
          <Link
            to="/auth/mfa-setup"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" /> Add a device
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { v: devices.length, l: 'Trusted devices' },
            { v: devices.filter((d) => d.current).length, l: 'Active now' },
            { v: devices.filter((d) => !d.current).length, l: 'Need review' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-neutral-900">{s.v}</div>
              <div className="text-xs text-neutral-500">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Device list */}
        <div className="space-y-3">
          {devices.map((d) => {
            const Icon = iconFor(d.type);
            const isConfirming = confirmId === d.id;
            return (
              <motion.div
                key={d.id}
                layout
                className={`rounded-2xl border p-4 ${
                  d.current
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {d.name}
                      </h3>
                      {d.current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" /> This device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600">
                      {d.os} · {d.browser}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {d.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {d.lastActive}
                      </span>
                      <span className="font-mono">{d.ip}</span>
                    </div>
                  </div>
                  {!d.current && (
                    isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => remove(d.id)}
                          className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(d.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove device"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Revoke all */}
        {devices.filter((d) => !d.current).length > 0 && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
            {confirmAll ? (
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-rose-900">
                    Revoke all other devices?
                  </h3>
                  <p className="text-xs text-rose-800/80">
                    This will sign out every non-current device immediately.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={removeAll}
                    className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    Yes, revoke all
                  </button>
                  <button
                    onClick={() => setConfirmAll(false)}
                    className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-rose-900">
                    Don&rsquo;t recognize a device?
                  </h3>
                  <p className="text-xs text-rose-800/80">
                    Revoke all other devices and change your password.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmAll(true)}
                  className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  Revoke all other devices
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
