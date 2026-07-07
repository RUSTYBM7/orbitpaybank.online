/**
 * EnrollHubPage — landing hub for every product application. Filter by
 * category, search, and launch the adaptive 10-step wizard.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Wallet,
  Briefcase,
  CreditCard,
  Home,
  GraduationCap,
  LineChart,
  Building2,
  PiggyBank,
  Coins,
  Users,
  Lock,
  Search,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { TEMPLATE_PHOTOS } from '@/components/bright';

const CATEGORIES = [
  {
    id: 'personal-deposit',
    label: 'Personal Deposit',
    Icon: Wallet,
    blurb: 'Checking, savings, money market, CDs, youth, student.',
    items: [
      { id: 'personal-checking', name: 'Personal Checking', route: '/enroll/personal-checking', body: 'No monthly fee, no minimum balance, free debit card.' },
      { id: 'savings', name: 'High-Yield Savings', route: '/enroll/savings', body: 'Money that earns more while it waits.' },
      { id: 'money-market', name: 'Money Market', route: '/enroll/money-market', body: 'Higher yield + check-writing power.' },
      { id: 'certificates', name: 'Share Certificates', route: '/enroll/certificates', body: 'Lock in a guaranteed rate.' },
      { id: 'youth', name: 'Youth Banking', route: '/enroll/youth', body: 'Custodial account for ages 0-17.' },
      { id: 'student', name: 'Student Banking', route: '/enroll/student', body: 'No monthly fee up to age 24.' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    Icon: Briefcase,
    blurb: 'Checking, savings, treasury, merchant, payroll.',
    items: [
      { id: 'business-checking', name: 'Business Checking', route: '/enroll/business-checking', body: 'Clear, fee-light operating account.' },
      { id: 'business-savings', name: 'Business Savings', route: '/enroll/business-savings', body: 'Earn yield on operating cash.' },
      { id: 'nonprofit', name: 'Non-Profit Account', route: '/enroll/nonprofit', body: 'Tailored for 501(c)(3) and associations.' },
      { id: 'trust', name: 'Trust Account', route: '/enroll/trust', body: 'For revocable and irrevocable trusts.' },
    ],
  },
  {
    id: 'lending',
    label: 'Lending',
    Icon: LineChart,
    blurb: 'Personal, auto, mortgage, home equity, student, business.',
    items: [
      { id: 'personal-loan', name: 'Personal Loan', route: '/enroll/personal-loan', body: 'Predictable, fixed-rate financing.' },
      { id: 'auto-loan', name: 'Auto Loan', route: '/enroll/auto-loan', body: 'New, used, and refinance.' },
      { id: 'mortgage', name: 'Mortgage', route: '/enroll/mortgage', body: 'Fixed, ARM, FHA, VA, jumbo.' },
      { id: 'home-equity', name: 'Home Equity', route: '/enroll/home-equity', body: 'HELOC and fixed-rate options.' },
      { id: 'student-loan', name: 'Student Loan', route: '/enroll/student-loan', body: 'Undergraduate, graduate, refinance.' },
      { id: 'business-loan', name: 'Business Loan', route: '/enroll/business-loan', body: 'Lines of credit, term loans, SBA.' },
    ],
  },
  {
    id: 'cards',
    label: 'Cards',
    Icon: CreditCard,
    blurb: 'Debit and credit cards, including premium metal.',
    items: [
      { id: 'rewards-card', name: 'Rewards Credit Card', route: '/enroll/rewards-card', body: '3% dining, 2% groceries, 1% everything.' },
      { id: 'cashback-card', name: 'Cashback Credit Card', route: '/enroll/cashback-card', body: '2% flat, every purchase.' },
      { id: 'travel-card', name: 'Travel Credit Card', route: '/enroll/travel-card', body: '3x points, transfer to 12+ partners.' },
      { id: 'platinum-card', name: 'Platinum Credit Card', route: '/enroll/platinum-card', body: 'Premium metal, lounge access.' },
      { id: 'business-card', name: 'Business Credit Card', route: '/enroll/business-card', body: '1.5% on everything for your team.' },
      { id: 'secured-card', name: 'Secured Credit Card', route: '/enroll/secured-card', body: 'Build credit with a refundable deposit.' },
    ],
  },
  {
    id: 'investments',
    label: 'Investments',
    Icon: Coins,
    blurb: 'Investment, retirement, wealth management.',
    items: [
      { id: 'investment', name: 'Investment Account', route: '/enroll/investment', body: 'Brokerage, managed, goal-based.' },
      { id: 'retirement', name: 'Retirement Account', route: '/enroll/retirement', body: 'IRAs, Roth, 401(k) rollovers.' },
      { id: 'wealth', name: 'Wealth Management', route: '/enroll/wealth', body: 'For $1M+ households.' },
    ],
  },
];

export default function EnrollHubPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const allItems = CATEGORIES.flatMap((c) => c.items);
  const filtered = search
    ? allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.body.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
            <Sparkles className="h-3 w-3" /> Open a new account or product
          </div>
          <h1 className="font-serif text-4xl font-medium sm:text-5xl">
            Apply for{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
            >
              anything from OrbitPay.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            One adaptive 10-step wizard adapts to the product you choose. Most
            applications take 5–10 minutes.
          </p>
        </motion.div>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products (e.g. checking, mortgage, rewards)…"
              className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {/* Search results */}
        {filtered && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold text-neutral-500">
              {filtered.length} match{filtered.length === 1 ? '' : 'es'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((i) => (
                <Link
                  key={i.id}
                  to={i.route}
                  className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-rose-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{i.name}</div>
                    <div className="text-xs text-neutral-600">{i.body}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!filtered && (
          <div className="mt-12 space-y-10">
            {CATEGORIES.map((cat) => (
              <section key={cat.id}>
                <div className="mb-4 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                      <cat.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold sm:text-2xl">{cat.label}</h2>
                      <p className="text-xs text-neutral-600">{cat.blurb}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {cat.items.length} products
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((i) => (
                    <Link
                      key={i.id}
                      to={i.route}
                      className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-rose-300 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-pink-500 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-neutral-900">{i.name}</div>
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-600">{i.body}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Master wizard CTA */}
        <div className="mt-16 rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 text-center sm:p-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600">
            <Sparkles className="h-3 w-3" /> Adaptive 10-step wizard
          </div>
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">
            Or start the master application
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
            Skip the product picker. Start the wizard and choose your product on
            the first step.
          </p>
          <button
            onClick={() => navigate('/onboard')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800"
          >
            Start the wizard
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
