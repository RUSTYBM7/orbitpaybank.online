/**
 * EnrollProductPage — single page reused for all 25 product detail /
 * landing-then-enroll pages. Adapts content based on URL.
 */

import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
  PiggyBank,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  Building2,
  LineChart,
  CreditCard,
  Coins,
  Home,
  ShieldCheck,
  Clock,
  FileText,
  Award,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';

const PRODUCTS: Record<string, { name: string; Icon: any; family: 'deposit' | 'lending' | 'cards' | 'invest'; blurb: string; features: string[]; docs: string[]; time: string; rate?: string }> = {
  'personal-checking': {
    name: 'Personal Checking',
    Icon: Wallet,
    family: 'deposit',
    blurb: 'No monthly fee, no minimum balance, free debit card.',
    features: ['No monthly fee', 'No minimum balance', 'Free debit card', 'Early direct deposit', 'Mobile check deposit', 'Apple Pay & Google Pay'],
    docs: ['Government photo ID', 'Proof of address'],
    time: '5 minutes',
    rate: '0.05% APY',
  },
  savings: {
    name: 'High-Yield Savings',
    Icon: PiggyBank,
    family: 'deposit',
    blurb: 'Money that earns more while it waits.',
    features: ['4.35% APY', 'FDIC/NCUA insured', 'Free transfers to checking', 'Goal-based sub-accounts'],
    docs: ['Government photo ID'],
    time: '5 minutes',
    rate: '4.35% APY',
  },
  'money-market': {
    name: 'Money Market',
    Icon: PiggyBank,
    family: 'deposit',
    blurb: 'Higher yield + check-writing power.',
    features: ['Higher variable rate', 'Free checks', 'Up to 6 withdrawals per month', 'FDIC/NCUA insured'],
    docs: ['Government photo ID', 'Opening deposit ($1,000+)'],
    time: '5 minutes',
    rate: '4.10% APY',
  },
  certificates: {
    name: 'Share Certificates',
    Icon: Lock,
    family: 'deposit',
    blurb: 'Lock in a guaranteed rate.',
    features: ['6mo – 5yr terms', 'Guaranteed rate', 'FDIC/NCUA insured', 'Add laddered CDs in one click'],
    docs: ['Government photo ID', 'Opening deposit'],
    time: '5 minutes',
    rate: 'Up to 4.65% APY',
  },
  youth: {
    name: 'Youth Banking',
    Icon: User,
    family: 'deposit',
    blurb: 'Smart money habits start early.',
    features: ['Ages 0-17 with parent/custodian', 'No monthly fee', 'Free debit card', 'Educational app'],
    docs: ['Child SSN', 'Custodian photo ID'],
    time: '10 minutes',
  },
  student: {
    name: 'Student Banking',
    Icon: GraduationCap,
    family: 'deposit',
    blurb: 'No monthly fee up to age 24.',
    features: ['No monthly fee up to age 24', 'Student loan rate discounts', 'Free debit card', 'Mobile check deposit'],
    docs: ['Government photo ID', 'School enrollment proof'],
    time: '5 minutes',
  },
  'business-checking': {
    name: 'Business Checking',
    Icon: Briefcase,
    family: 'deposit',
    blurb: 'Clear, fee-light operating account.',
    features: ['100 free transactions / month', 'ACH & wire included', 'Multi-user permissions', 'QuickBooks + Wave integration'],
    docs: ['EIN or SSN', 'Business registration docs', 'Beneficial owners photo ID'],
    time: '15 minutes',
  },
  'business-savings': {
    name: 'Business Savings',
    Icon: Briefcase,
    family: 'deposit',
    blurb: 'Earn yield on operating cash.',
    features: ['4.10% APY', 'FDIC/NCUA insured', 'Free transfers', 'Tiered balance bonuses'],
    docs: ['Business registration', 'Beneficial owners photo ID'],
    time: '10 minutes',
    rate: '4.10% APY',
  },
  nonprofit: {
    name: 'Non-Profit Account',
    Icon: Building2,
    family: 'deposit',
    blurb: 'Tailored for 501(c)(3) and associations.',
    features: ['No monthly fee for verified 501(c)(3)', 'Donation-ready payment links', 'Granular permissions'],
    docs: ['501(c)(3) determination letter', 'EIN confirmation'],
    time: '15 minutes',
  },
  trust: {
    name: 'Trust Account',
    Icon: Building2,
    family: 'deposit',
    blurb: 'For revocable and irrevocable trusts.',
    features: ['Trust documentation support', 'Multi-trustee options', 'Estate planning integration'],
    docs: ['Trust agreement', 'Trustee photo ID'],
    time: '20 minutes',
  },
  'personal-loan': {
    name: 'Personal Loan',
    Icon: LineChart,
    family: 'lending',
    blurb: 'Predictable, fixed-rate financing.',
    features: ['Fixed rates from 7.99% APR', '12-84 month terms', '$5K–$50K', 'No prepayment fees'],
    docs: ['Government photo ID', '2 pay stubs', 'Bank statements (3 mo)'],
    time: '10 minutes',
    rate: 'From 7.99% APR',
  },
  'auto-loan': {
    name: 'Auto Loan',
    Icon: CreditCard,
    family: 'lending',
    blurb: 'New, used, and refinance.',
    features: ['New, used, and refinance', 'Quick pre-approval', 'Dealer network', 'No application fee'],
    docs: ['Government photo ID', 'Vehicle details', 'Proof of insurance (after approval)'],
    time: '15 minutes',
    rate: 'From 5.49% APR',
  },
  mortgage: {
    name: 'Mortgage',
    Icon: Home,
    family: 'lending',
    blurb: 'Fixed, ARM, FHA, VA, jumbo.',
    features: ['Fixed, ARM, FHA, VA, jumbo', 'Lock rate up to 90 days', 'No origination fees'],
    docs: ['Government photo ID', '2 pay stubs', '2 years of W-2s', 'Bank statements'],
    time: '20 minutes',
    rate: 'From 6.25% APR',
  },
  'home-equity': {
    name: 'Home Equity',
    Icon: Home,
    family: 'lending',
    blurb: 'HELOC and fixed-rate options.',
    features: ['HELOC or fixed-rate', '10–30 yr terms', 'No closing cost options'],
    docs: ['Government photo ID', 'Mortgage statement', 'Property tax statement'],
    time: '20 minutes',
    rate: 'From 7.50% APR',
  },
  'student-loan': {
    name: 'Student Loan',
    Icon: GraduationCap,
    family: 'lending',
    blurb: 'Undergraduate, graduate, refinance.',
    features: ['In-school deferment', 'Grace period', 'Auto-pay rate discount', 'Refinance existing loans'],
    docs: ['Government photo ID', 'Enrollment proof', 'Financial aid letter'],
    time: '10 minutes',
    rate: 'From 4.50% APR',
  },
  'business-loan': {
    name: 'Business Loan',
    Icon: LineChart,
    family: 'lending',
    blurb: 'Lines of credit, term loans, SBA.',
    features: ['Lines of credit $10K–$500K', 'Term loans $25K–$5M', 'SBA 7(a) & 504', 'Same-day decisions on small loans'],
    docs: ['EIN', 'Business registration', '2 yrs of business tax returns', 'Recent P&L'],
    time: '20 minutes',
    rate: 'From 6.99% APR',
  },
  'rewards-card': {
    name: 'Rewards Credit Card',
    Icon: CreditCard,
    family: 'cards',
    blurb: '3% dining, 2% groceries, 1% everything.',
    features: ['3% dining', '2% groceries', '1% everything', '$0 annual fee', 'No foreign transaction fees'],
    docs: ['Government photo ID', 'Proof of income'],
    time: '8 minutes',
    rate: '14.99% – 24.99% APR',
  },
  'cashback-card': {
    name: 'Cashback Credit Card',
    Icon: CreditCard,
    family: 'cards',
    blurb: '2% flat, every purchase.',
    features: ['2% flat cash back', '$0 annual fee', 'Intro 0% APR for 15 months'],
    docs: ['Government photo ID', 'Proof of income'],
    time: '8 minutes',
    rate: '13.99% – 23.99% APR',
  },
  'travel-card': {
    name: 'Travel Credit Card',
    Icon: CreditCard,
    family: 'cards',
    blurb: '3x points, transfer to 12+ partners.',
    features: ['3x travel & dining', 'Transfer to 12+ airline/hotel partners', 'Trip delay insurance', 'No foreign transaction fees'],
    docs: ['Government photo ID', 'Proof of income'],
    time: '8 minutes',
    rate: '16.99% – 24.99% APR',
  },
  'platinum-card': {
    name: 'Platinum Credit Card',
    Icon: CreditCard,
    family: 'cards',
    blurb: 'Premium metal, lounge access.',
    features: ['Premium metal card', '1,500+ lounges', '$300 travel credit', 'Concierge 24/7'],
    docs: ['Government photo ID', 'Proof of high income'],
    time: '10 minutes',
    rate: '18.99% – 26.99% APR',
  },
  'business-card': {
    name: 'Business Credit Card',
    Icon: CreditCard,
    family: 'cards',
    blurb: '1.5% on everything for your team.',
    features: ['1.5% cash back', 'Unlimited virtual cards', 'Expense categorization', 'Up to 99 employee cards'],
    docs: ['EIN', 'Business registration', 'Beneficial owners photo ID'],
    time: '10 minutes',
    rate: '15.99% – 23.99% APR',
  },
  'secured-card': {
    name: 'Secured Credit Card',
    Icon: Lock,
    family: 'cards',
    blurb: 'Build credit with a refundable deposit.',
    features: ['Refundable deposit $200–$5,000', 'Reports to all 3 bureaus', 'Free credit score', 'Graduates to unsecured'],
    docs: ['Government photo ID', 'Refundable deposit'],
    time: '8 minutes',
    rate: '21.99% APR',
  },
  investment: {
    name: 'Investment Account',
    Icon: Coins,
    family: 'invest',
    blurb: 'Brokerage, managed, goal-based.',
    features: ['Self-directed or managed', 'Goal-based portfolios', '$0 commissions on stocks & ETFs', 'Tax-loss harvesting'],
    docs: ['Government photo ID', 'W-9 or W-8BEN'],
    time: '15 minutes',
  },
  retirement: {
    name: 'Retirement Account',
    Icon: Coins,
    family: 'invest',
    blurb: 'IRAs, Roth, 401(k) rollovers.',
    features: ['Traditional IRA, Roth IRA, SEP', '401(k) rollover support', 'Target-date funds'],
    docs: ['Government photo ID', 'Beneficiary info'],
    time: '15 minutes',
  },
  wealth: {
    name: 'Wealth Management',
    Icon: LineChart,
    family: 'invest',
    blurb: 'For $1M+ households.',
    features: ['Dedicated advisor', 'Custom portfolio', 'Tax & estate planning', 'Concierge banking'],
    docs: ['Government photo ID', 'Account verification'],
    time: 'Schedule a call',
  },
};

export default function EnrollProductPage() {
  const { productId = '' } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS[productId];

  if (!product) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-medium">Product not found</h1>
          <Link to="/enroll" className="mt-4 inline-block text-sm font-semibold text-rose-600">
            ← Back to all products
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const Icon = product.Icon;
  const accent = product.family === 'deposit' ? 'emerald' : product.family === 'lending' ? 'rose' : product.family === 'cards' ? 'orange' : 'pink';

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              accent === 'emerald'
                ? 'radial-gradient(circle at 30% 20%, #10b98120 0%, transparent 60%), radial-gradient(circle at 80% 60%, #34d39915 0%, transparent 50%)'
                : accent === 'rose'
                ? 'radial-gradient(circle at 30% 20%, #f43f5e20 0%, transparent 60%), radial-gradient(circle at 80% 60%, #ec489915 0%, transparent 50%)'
                : accent === 'orange'
                ? 'radial-gradient(circle at 30% 20%, #f9731620 0%, transparent 60%), radial-gradient(circle at 80% 60%, #fb923c15 0%, transparent 50%)'
                : 'radial-gradient(circle at 30% 20%, #ec489920 0%, transparent 60%), radial-gradient(circle at 80% 60%, #d946ef15 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-20">
          <Link to="/enroll" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="h-3.5 w-3.5" /> All products
          </Link>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg ${
                  accent === 'emerald' ? 'from-emerald-500 to-teal-500' : accent === 'rose' ? 'from-rose-500 to-pink-500' : accent === 'orange' ? 'from-orange-500 to-rose-500' : 'from-pink-500 to-purple-500'
                }`}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
              <h1 className="font-serif text-4xl font-medium sm:text-5xl">{product.name}</h1>
              <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-lg">{product.blurb}</p>
              {product.rate && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm font-semibold text-rose-600">
                  <Award className="h-4 w-4" /> {product.rate}
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/onboard?product=${productId}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800"
                >
                  Apply now
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Clock className="h-3.5 w-3.5" /> ~{product.time}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.features.slice(0, 4).map((f) => (
                <div key={f} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <Check className="mb-2 h-4 w-4 text-rose-500" />
                  <div className="text-sm font-medium text-neutral-900">{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">What&rsquo;s included</h2>
            <ul className="mt-5 space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm text-neutral-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">What you&rsquo;ll need</h2>
            <ul className="mt-5 space-y-2">
              {product.docs.map((d) => (
                <li key={d} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                  <span className="text-sm text-neutral-700">{d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold">256-bit encryption</div>
                  <p className="mt-0.5 text-xs text-emerald-800/80">
                    All your information is encrypted in transit and at rest. We
                    never sell member data — that&rsquo;s the credit union promise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 text-center sm:p-12">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-rose-500" />
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">Ready to apply?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
            The 10-step wizard adapts to this product. You can save and come
            back any time.
          </p>
          <button
            onClick={() => navigate(`/onboard?product=${productId}`)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800"
          >
            Start application
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}