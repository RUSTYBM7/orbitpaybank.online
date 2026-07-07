/**
 * CardServicesPage — post-issuance card management: replace a card,
 * order a virtual card, upgrade to premium, set/reset PIN, activate
 * contactless, manage card controls, add to digital wallet.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Smartphone,
  Crown,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Bell,
  Wifi,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

type Service =
  | 'replace'
  | 'virtual'
  | 'premium'
  | 'pin'
  | 'contactless'
  | 'controls'
  | 'wallet';

const SERVICES: { id: Service; label: string; Icon: any; body: string; color: string }[] = [
  { id: 'replace', label: 'Replace a card', Icon: RefreshCw, body: 'Lost, stolen, or damaged? Order a replacement now.', color: 'rose' },
  { id: 'virtual', label: 'Virtual card', Icon: CreditCard, body: 'Get a digital number to use instantly online.', color: 'orange' },
  { id: 'premium', label: 'Upgrade to premium', Icon: Crown, body: 'Unlock metal, lounge access, $300 travel credit.', color: 'pink' },
  { id: 'pin', label: 'Set/reset PIN', Icon: Lock, body: 'Set a new ATM PIN or reset your existing one.', color: 'emerald' },
  { id: 'contactless', label: 'Activate contactless', Icon: Wifi, body: 'Turn on tap-to-pay for faster checkouts.', color: 'sky' },
  { id: 'controls', label: 'Card controls', Icon: Shield, body: 'Set spending limits, freeze card, alert me.', color: 'amber' },
  { id: 'wallet', label: 'Add to digital wallet', Icon: Smartphone, body: 'Apple Pay, Google Pay, Samsung Pay.', color: 'purple' },
];

export default function CardServicesPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Service | null>(null);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            <Sparkles className="h-3 w-3" /> Card services
          </div>
          <h1 className="font-serif text-4xl font-medium sm:text-5xl">
            Manage every card in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
            >
              one place.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Lost a card? Want premium? Need a virtual number? Pinpoint the
            service and we&rsquo;ll guide you through it.
          </p>
        </div>

        {/* Demo card */}
        <div className="relative mt-10 mx-auto max-w-sm">
          <div className="relative aspect-[1.6/1] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-900 to-pink-700 p-6 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 0%, white 0%, transparent 50%)' }} />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-xs uppercase tracking-widest opacity-80">OrbitPay</div>
                <Wifi className="h-5 w-5 rotate-90 opacity-80" />
              </div>
              <div>
                <div className="font-mono text-sm tracking-widest opacity-90">•••• •••• •••• 4729</div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase opacity-70">Holder</div>
                    <div className="text-sm font-semibold">Mavis M</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase opacity-70">Expires</div>
                    <div className="text-sm font-semibold">07/30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-700 shadow">
            Active · Tap to manage
          </div>
        </div>

        {/* Service tiles */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white bg-gradient-to-br ${
                s.color === 'rose' ? 'from-rose-500 to-pink-500' :
                s.color === 'orange' ? 'from-orange-500 to-rose-500' :
                s.color === 'pink' ? 'from-pink-500 to-rose-500' :
                s.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                s.color === 'sky' ? 'from-sky-500 to-cyan-500' :
                s.color === 'amber' ? 'from-amber-500 to-orange-500' :
                'from-purple-500 to-pink-500'
              }`}>
                <s.Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{s.label}</div>
                <div className="mt-0.5 text-xs text-neutral-600">{s.body}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Service modal */}
        <AnimatePresence>
          {active && (
            <ServiceModal
              service={SERVICES.find((s) => s.id === active)!}
              onClose={() => setActive(null)}
              onApply={(route) => {
                setActive(null);
                navigate(route);
              }}
            />
          )}
        </AnimatePresence>

        {/* Quick links */}
        <div className="mt-16 rounded-3xl border border-neutral-200 bg-white p-8 text-center">
          <h2 className="font-serif text-2xl font-medium">Need a different card?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600">
            Browse our full credit and debit card lineup — apply in 8 minutes.
          </p>
          <Link
            to="/cards"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800"
          >
            See card lineup
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

function ServiceModal({ service, onClose, onApply }: { service: typeof SERVICES[number]; onClose: () => void; onApply: (route: string) => void }) {
  const [pin, setPin] = useState('');
  const [limit, setLimit] = useState('1000');
  const [freeze, setFreeze] = useState(false);
  const [premiumTier, setPremiumTier] = useState('Platinum');

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="fixed left-1/2 top-1/2 z-[61] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white bg-gradient-to-br ${
              service.color === 'rose' ? 'from-rose-500 to-pink-500' :
              service.color === 'orange' ? 'from-orange-500 to-rose-500' :
              service.color === 'pink' ? 'from-pink-500 to-rose-500' :
              service.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
              service.color === 'sky' ? 'from-sky-500 to-cyan-500' :
              service.color === 'amber' ? 'from-amber-500 to-orange-500' :
              'from-purple-500 to-pink-500'
            }`}>
              <service.Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">{service.label}</div>
              <div className="text-[11px] text-neutral-500">{service.body}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {service.id === 'replace' && (
            <ReasonPicker
              options={['Lost', 'Stolen', 'Damaged', 'Updating info (name, address)']}
            />
          )}
          {service.id === 'virtual' && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-700">
                Generate a virtual card number for safer online purchases.
              </p>
              <ReasonPicker
                options={['For online shopping', 'For subscriptions', 'For a one-time purchase']}
              />
            </div>
          )}
          {service.id === 'premium' && (
            <div>
              <p className="mb-2 text-sm text-neutral-700">Pick the tier:</p>
              <div className="grid grid-cols-3 gap-2">
                {['Platinum', 'Gold', 'Black Reserve'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPremiumTier(t)}
                    className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition ${
                      premiumTier === t ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {service.id === 'pin' && (
            <>
              <p className="text-sm text-neutral-700">Choose a new 4-digit ATM PIN.</p>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </>
          )}
          {service.id === 'contactless' && (
            <p className="text-sm text-neutral-700">
              Tap-to-pay uses the same secure chip. Most terminals accept it by
              default — once enabled, just tap your card.
            </p>
          )}
          {service.id === 'controls' && (
            <>
              <label className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Freeze card</div>
                  <div className="text-[11px] text-neutral-500">Block all charges instantly</div>
                </div>
                <button
                  onClick={() => setFreeze((v) => !v)}
                  className={`relative h-6 w-11 rounded-full ${freeze ? 'bg-rose-500' : 'bg-neutral-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${freeze ? 'left-5' : 'left-0.5'}`} />
                </button>
              </label>
              <div className="rounded-2xl border border-neutral-200 p-4">
                <div className="text-sm font-semibold text-neutral-900">Monthly limit</div>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 p-3 text-sm">
                <input type="checkbox" defaultChecked className="rounded" />
                Notify me on every transaction
              </label>
            </>
          )}
          {service.id === 'wallet' && (
            <ReasonPicker options={['Apple Pay', 'Google Pay', 'Samsung Pay', 'All of the above']} />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
          <button onClick={onClose} className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:border-neutral-400">
            Cancel
          </button>
          <button
            onClick={() => onApply('/onboard?product=rewards-card')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
          >
            <Check className="h-3.5 w-3.5" /> Submit
          </button>
        </div>
      </motion.div>
    </>
  );
}

function ReasonPicker({ options }: { options: string[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setPicked(o)}
          className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition ${
            picked === o ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
