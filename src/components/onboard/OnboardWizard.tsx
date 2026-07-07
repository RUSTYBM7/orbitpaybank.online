/**
 * OnboardWizard — adaptive 10-step onboarding.
 *
 * 1. Welcome & product selection
 * 2. Identity, contact, and verification
 * 3. Financial & employment profile
 * 4. Product configuration (adapts to product)
 * 5. Digital banking enrollment
 * 6. Documents & supporting information
 * 7. Agreements & compliance
 * 8. Review & submission
 * 9. Intelligent processing center (animated)
 * 10. Welcome to OrbitPay
 *
 * The wizard uses draft state persisted to localStorage so a member can
 * resume later. Each step renders only the fields required for the
 * previously selected product (skip-if-not-applicable).
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  Wallet,
  CreditCard,
  Home,
  GraduationCap,
  Briefcase,
  LineChart,
  Coins,
  Building2,
  PiggyBank,
  Save,
  Lock,
  FileText,
  Camera,
  Upload,
  ChevronRight,
  AlertCircle,
  Clock,
  X,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  Briefcase as BriefcaseIcon,
  DollarSign,
  KeyRound,
  Smartphone,
  Fingerprint,
  Bell,
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { useStore } from '@/store';
import { useNotifications, notify } from '@/state/notifications';

const PRODUCT_KEYS = [
  'personal-checking', 'savings', 'money-market', 'certificates', 'youth', 'student',
  'business-checking', 'business-savings', 'nonprofit', 'trust',
  'personal-loan', 'auto-loan', 'mortgage', 'home-equity', 'student-loan', 'business-loan',
  'rewards-card', 'cashback-card', 'travel-card', 'platinum-card', 'business-card', 'secured-card',
  'investment', 'retirement', 'wealth',
] as const;

type ProductKey = (typeof PRODUCT_KEYS)[number];

const PRODUCTS: Record<string, { name: string; Icon: any; family: 'deposit' | 'lending' | 'cards' | 'invest'; blurb: string }> = {
  'personal-checking': { name: 'Personal Checking', Icon: Wallet, family: 'deposit', blurb: 'No monthly fee, no minimum balance' },
  'savings': { name: 'High-Yield Savings', Icon: PiggyBank, family: 'deposit', blurb: 'Money that earns more while it waits' },
  'money-market': { name: 'Money Market', Icon: PiggyBank, family: 'deposit', blurb: 'Higher yield + check-writing power' },
  'certificates': { name: 'Share Certificates', Icon: Lock, family: 'deposit', blurb: 'Lock in a guaranteed rate' },
  'youth': { name: 'Youth Banking', Icon: User, family: 'deposit', blurb: 'Smart money habits start early' },
  'student': { name: 'Student Banking', Icon: GraduationCap, family: 'deposit', blurb: 'No monthly fee up to age 24' },
  'business-checking': { name: 'Business Checking', Icon: Briefcase, family: 'deposit', blurb: 'Clear, fee-light operating account' },
  'business-savings': { name: 'Business Savings', Icon: Briefcase, family: 'deposit', blurb: 'Earn yield on operating cash' },
  'nonprofit': { name: 'Non-Profit Account', Icon: Building2, family: 'deposit', blurb: 'Tailored for 501(c)(3) and associations' },
  'trust': { name: 'Trust Account', Icon: Building2, family: 'deposit', blurb: 'For revocable and irrevocable trusts' },
  'personal-loan': { name: 'Personal Loan', Icon: LineChart, family: 'lending', blurb: 'Predictable, fixed-rate financing' },
  'auto-loan': { name: 'Auto Loan', Icon: CreditCard, family: 'lending', blurb: 'New, used, and refinance' },
  'mortgage': { name: 'Mortgage', Icon: Home, family: 'lending', blurb: 'Fixed, ARM, FHA, VA, jumbo' },
  'home-equity': { name: 'Home Equity', Icon: Home, family: 'lending', blurb: 'HELOC and fixed-rate options' },
  'student-loan': { name: 'Student Loan', Icon: GraduationCap, family: 'lending', blurb: 'Undergraduate, graduate, refinance' },
  'business-loan': { name: 'Business Loan', Icon: LineChart, family: 'lending', blurb: 'Lines of credit, term loans, SBA' },
  'rewards-card': { name: 'Rewards Credit Card', Icon: CreditCard, family: 'cards', blurb: '3% dining, 2% groceries, 1% everything' },
  'cashback-card': { name: 'Cashback Credit Card', Icon: CreditCard, family: 'cards', blurb: '2% flat, every purchase' },
  'travel-card': { name: 'Travel Credit Card', Icon: CreditCard, family: 'cards', blurb: '3x points, transfer to 12+ partners' },
  'platinum-card': { name: 'Platinum Credit Card', Icon: CreditCard, family: 'cards', blurb: 'Premium metal, lounge access' },
  'business-card': { name: 'Business Credit Card', Icon: CreditCard, family: 'cards', blurb: '1.5% on everything for your team' },
  'secured-card': { name: 'Secured Credit Card', Icon: Lock, family: 'cards', blurb: 'Build credit with a refundable deposit' },
  'investment': { name: 'Investment Account', Icon: Coins, family: 'invest', blurb: 'Brokerage, managed, goal-based' },
  'retirement': { name: 'Retirement Account', Icon: Coins, family: 'invest', blurb: 'IRAs, Roth, 401(k) rollovers' },
  'wealth': { name: 'Wealth Management', Icon: LineChart, family: 'invest', blurb: 'For $1M+ households' },
};

const STORAGE_KEY = 'orbitpay-onboard-draft';

const initialDraft: any = {
  product: '' as ProductKey | '',
  identity: { firstName: '', lastName: '', dob: '', ssn: '', citizenship: 'US', idType: '', idNumber: '' },
  contact: { email: '', phone: '', street: '', city: '', state: '', zip: '' },
  financial: { employment: '', employer: '', income: '', assets: '', liabilities: '' },
  productConfig: { initialDeposit: '', purpose: '', amount: '', term: '' },
  digital: { username: '', password: '', mfaMethod: 'authenticator', passkey: false, biometrics: false, notifyEmail: true, notifySms: false },
  documents: [] as { name: string; type: string }[],
  agreements: { terms: false, privacy: false, marketing: false, eSign: false },
};

const STEP_TITLES = [
  'Welcome & product',
  'Identity & contact',
  'Financial profile',
  'Product details',
  'Digital banking',
  'Documents',
  'Agreements',
  'Review',
  'Processing',
  'Welcome',
];

const SUGGESTED_DOCS: Record<string, string[]> = {
  deposit: ['Government-issued photo ID', 'Proof of address (utility bill or bank statement)'],
  lending: ['Government-issued photo ID', '2 pay stubs', '2 years of W-2s or tax returns', 'Bank statements (3 mo)'],
  cards: ['Government-issued photo ID', 'Proof of income (pay stub or W-2)'],
  invest: ['Government-issued photo ID', 'W-9 or W-8BEN', 'Bank account for funding'],
};

export default function OnboardWizard() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notif = useNotifications();
  const initialProduct = (params.get('product') as ProductKey) || '';
  const [draft, setDraft] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...initialDraft, ...JSON.parse(stored), product: initialProduct || JSON.parse(stored).product };
    } catch {}
    return { ...initialDraft, product: initialProduct };
  });
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const product = PRODUCTS[draft.product as string];
  const requiredDocs = useMemo(
    () => (product ? SUGGESTED_DOCS[product.family] ?? [] : []),
    [product]
  );

  // When the wizard reaches the success step, persist a minimal member
  // profile + seed the Zustand store so the member portal renders with
  // the new identity on the very first paint (no flash of empty home).
  useEffect(() => {
    if (step !== 9) return;
    try {
      const memberId = 'OP-' + Math.floor(100000 + Math.random() * 900000);
      const fullName =
        [draft?.identity?.firstName, draft?.identity?.lastName]
          .filter(Boolean)
          .join(' ') || 'OrbitPay Member';
      const profile = {
        memberId,
        firstName: draft?.identity?.firstName || '',
        lastName: draft?.identity?.lastName || '',
        name: fullName,
        email: draft?.contact?.email || '',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('orbitpay-onboarded', '1');
      localStorage.setItem('orbitpay-onboarded-profile', JSON.stringify(profile));
      // Seed Zustand immediately so /app renders with the new identity.
      useStore.getState().setUser({
          id: memberId,
          email: profile.email,
          phone: '',
          fullName,
          kycStatus: 'approved' as any,
          accountStatus: 'active' as any,
          tier: 'premium' as any,
          dailyLimit: 50000,
          weeklyLimit: 250000,
          monthlyLimit: 1000000,
          balanceUsd: 2500,
          balanceEur: 2300,
          balanceGbp: 1950,
          balanceBtc: 0.012,
          btcPrice: 67000,
          createdAt: profile.createdAt,
          updatedAt: profile.createdAt,
          lastActive: profile.createdAt,
          isOnline: true,
        });
    } catch {}
  }, [step]);

  const set = (path: string, value: any) => {
    setDraft((d: any) => {
      const next = JSON.parse(JSON.stringify(d));
      const parts = path.split('.');
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const next = () => {
    if (step === 7) {
      setSubmitting(true);
      setStep(8);
      notify(notif, 'submitted');
      // Animate processing
      const items = ['Identity verification', 'KYC review', 'AML screening', 'Credit assessment', 'Approved'];
      let i = 0;
      const tick = () => {
        setProcessingStep(i);
        if (i === 1) notify(notif, 'identity-approved');
        if (i === 2) notify(notif, 'security-alert', { severity: 'info', title: 'AML screening complete', body: 'No matches found in any screening lists.' });
        i++;
        if (i < items.length) setTimeout(tick, 700);
        else {
          setTimeout(() => {
            const isCard = product?.family === 'cards';
            const isLending = product?.family === 'lending';
            notify(notif, 'approved');
            if (isCard) {
              setTimeout(() => notify(notif, 'card-issued'), 600);
              setTimeout(() => notify(notif, 'card-shipped'), 1400);
            } else if (isLending) {
              setTimeout(() => notify(notif, 'loan-update', { body: `Your ${product.name} is moving to underwriting.` }), 800);
            } else {
              setTimeout(() => notify(notif, 'account-opened'), 600);
              setTimeout(() => notify(notif, 'banking-activated', { title: 'Online banking ready', body: 'Your username and MFA are configured.' }), 1400);
            }
            setStep(9);
          }, 800);
        }
      };
      setTimeout(tick, 600);
      return;
    }
    setStep((s) => Math.min(s + 1, 9));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const totalSteps = STEP_TITLES.length;
  const progress = step === 9 ? 100 : Math.round((step / 8) * 100);

  if (!draft.product && step === 0) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <Sparkles className="h-3 w-3" /> Adaptive 10-step wizard
            </div>
            <h1 className="font-serif text-4xl font-medium sm:text-5xl">
              What are you applying for?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
              Pick one product to start. The wizard will only ask for fields
              that product needs. You can add more products after.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PRODUCTS).slice(0, 12).map(([key, p]) => (
              <button
                key={key}
                onClick={() => {
                  set('product', key);
                  setStep(1);
                }}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                  <p.Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{p.name}</div>
                  <div className="mt-0.5 text-xs text-neutral-600">{p.blurb}</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/enroll"
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              See all 25 products
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700">
              Step {Math.min(step + 1, 10)} of 10 · {STEP_TITLES[Math.min(step, 9)]}
            </span>
            <span className="text-neutral-500">{progress}% complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-500">
            <Save className="h-3 w-3" /> Auto-saved · you can close and resume later
          </div>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {step === 0 && (
              <div>
                <h2 className="font-serif text-2xl font-medium sm:text-3xl">
                  Hi there! Let&rsquo;s get you set up.
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  You picked{' '}
                  <span className="font-semibold text-rose-600">
                    {product?.name}
                  </span>
                  . We&rsquo;ll need about 8 minutes and some basic info. We auto-save
                  every step, so you can close this and come back any time.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { Icon: Clock, label: '~8 min', body: 'Most members finish in one sitting' },
                    { Icon: ShieldCheck, label: 'Encrypted', body: '256-bit, audited annually' },
                    { Icon: Save, label: 'Auto-save', body: 'Resume from any device' },
                  ].map((b) => (
                    <div key={b.label} className="rounded-2xl border border-neutral-200 bg-[#F5F5F7] p-4 text-center">
                      <b.Icon className="mx-auto mb-2 h-6 w-6 text-rose-500" />
                      <div className="text-sm font-semibold text-neutral-900">{b.label}</div>
                      <div className="text-[11px] text-neutral-500">{b.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">Tell us about you</h2>
                <p className="text-sm text-neutral-600">
                  We use this to verify your identity. It is encrypted at rest
                  and never sold.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" value={draft.identity.firstName} onChange={(v) => set('identity.firstName', v)} />
                  <Field label="Last name" value={draft.identity.lastName} onChange={(v) => set('identity.lastName', v)} />
                </div>
                <Field label="Date of birth" type="date" value={draft.identity.dob} onChange={(v) => set('identity.dob', v)} />
                <Field label="Last 4 of SSN" value={draft.identity.ssn} onChange={(v) => set('identity.ssn', v)} maxLength={4} />
                <SelectField label="Citizenship" value={draft.identity.citizenship} onChange={(v) => set('identity.citizenship', v)} options={['US citizen', 'Permanent resident', 'Visa holder', 'Other']} />
                <SelectField label="ID type" value={draft.identity.idType} onChange={(v) => set('identity.idType', v)} options={["Driver's license", 'Passport', 'State ID', 'Military ID']} />
                <Field label="ID number" value={draft.identity.idNumber} onChange={(v) => set('identity.idNumber', v)} />

                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900">Where can we reach you?</h3>
                  <Field label="Email" type="email" value={draft.contact.email} onChange={(v) => set('contact.email', v)} placeholder="you@example.com" leftIcon={Mail} />
                  <Field label="Mobile" type="tel" value={draft.contact.phone} onChange={(v) => set('contact.phone', v)} placeholder="+1 555 010 0000" leftIcon={Phone} />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Street" value={draft.contact.street} onChange={(v) => set('contact.street', v)} leftIcon={MapPin} />
                    <Field label="City" value={draft.contact.city} onChange={(v) => set('contact.city', v)} />
                    <Field label="State" value={draft.contact.state} onChange={(v) => set('contact.state', v)} />
                    <Field label="ZIP" value={draft.contact.zip} onChange={(v) => set('contact.zip', v)} maxLength={10} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">Your financial picture</h2>
                <p className="text-sm text-neutral-600">
                  Helps us pick the right products and verify your income.
                </p>
                <SelectField label="Employment status" value={draft.financial.employment} onChange={(v) => set('financial.employment', v)} options={['Employed full-time', 'Employed part-time', 'Self-employed', 'Retired', 'Student', 'Unemployed']} />
                <Field label="Employer" value={draft.financial.employer} onChange={(v) => set('financial.employer', v)} leftIcon={BriefcaseIcon} />
                <Field label="Annual income" type="number" value={draft.financial.income} onChange={(v) => set('financial.income', v)} leftIcon={DollarSign} placeholder="75000" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total assets" type="number" value={draft.financial.assets} onChange={(v) => set('financial.assets', v)} placeholder="50000" leftIcon={DollarSign} />
                  <Field label="Total liabilities" type="number" value={draft.financial.liabilities} onChange={(v) => set('financial.liabilities', v)} placeholder="15000" leftIcon={DollarSign} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">
                  Configure your {product?.name}
                </h2>
                <p className="text-sm text-neutral-600">
                  A few details specific to {product?.name}.
                </p>
                {product?.family === 'deposit' && (
                  <>
                    <Field label="Initial deposit" type="number" value={draft.productConfig.initialDeposit} onChange={(v) => set('productConfig.initialDeposit', v)} leftIcon={DollarSign} placeholder="100" />
                    <SelectField label="Fund from" value={draft.productConfig.funding} onChange={(v) => set('productConfig.funding', v)} options={['Another bank (ACH)', 'Wire transfer', 'Check deposit', 'Cash deposit at branch']} />
                  </>
                )}
                {product?.family === 'lending' && (
                  <>
                    <SelectField label="Loan purpose" value={draft.productConfig.purpose} onChange={(v) => set('productConfig.purpose', v)} options={['Debt consolidation', 'Home improvement', 'Major purchase', 'Other']} />
                    <Field label="Loan amount" type="number" value={draft.productConfig.amount} onChange={(v) => set('productConfig.amount', v)} leftIcon={DollarSign} placeholder="25000" />
                    <SelectField label="Term" value={draft.productConfig.term} onChange={(v) => set('productConfig.term', v)} options={['12 months', '24 months', '36 months', '60 months', '84 months']} />
                  </>
                )}
                {product?.family === 'cards' && (
                  <>
                    <SelectField label="Rewards" value={draft.productConfig.rewards} onChange={(v) => set('productConfig.rewards', v)} options={['Cash back', 'Travel points', 'Low intro APR']} />
                    <Field label="Requested credit limit" type="number" value={draft.productConfig.limit} onChange={(v) => set('productConfig.limit', v)} leftIcon={DollarSign} placeholder="5000" />
                  </>
                )}
                {product?.family === 'invest' && (
                  <>
                    <SelectField label="Investment experience" value={draft.productConfig.experience} onChange={(v) => set('productConfig.experience', v)} options={['Beginner', 'Some experience', 'Experienced', 'Professional']} />
                    <SelectField label="Risk tolerance" value={draft.productConfig.risk} onChange={(v) => set('productConfig.risk', v)} options={['Conservative', 'Moderate', 'Aggressive']} />
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">Online banking</h2>
                <p className="text-sm text-neutral-600">
                  Set up how you&rsquo;ll sign in. We strongly recommend biometrics
                  and an authenticator app.
                </p>
                <Field label="Choose a username" value={draft.digital.username} onChange={(v) => set('digital.username', v)} leftIcon={User} />
                <Field label="Choose a password" type="password" value={draft.digital.password} onChange={(v) => set('digital.password', v)} leftIcon={Lock} hint="12+ characters" showPasswordToggle />
                <SelectField label="Two-factor method" value={draft.digital.mfaMethod} onChange={(v) => set('digital.mfaMethod', v)} options={['Authenticator app (recommended)', 'SMS code', 'Hardware key', 'Email code']} />
                <div className="grid grid-cols-2 gap-3">
                  <Toggle label="Enable passkey" Icon={KeyRound} value={draft.digital.passkey} onChange={(v) => set('digital.passkey', v)} />
                  <Toggle label="Enable biometrics" Icon={Fingerprint} value={draft.digital.biometrics} onChange={(v) => set('digital.biometrics', v)} />
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-neutral-900">
                    <Bell className="h-3.5 w-3.5 text-rose-500" /> Notifications
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs text-neutral-700">
                      <input type="checkbox" checked={draft.digital.notifyEmail} onChange={(e) => set('digital.notifyEmail', e.target.checked)} className="rounded" />
                      Email me about transactions and security alerts
                    </label>
                    <label className="flex items-center gap-2 text-xs text-neutral-700">
                      <input type="checkbox" checked={draft.digital.notifySms} onChange={(e) => set('digital.notifySms', e.target.checked)} className="rounded" />
                      Text me for urgent alerts only
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">Upload documents</h2>
                <p className="text-sm text-neutral-600">
                  We only ask for what {product?.name} needs. You can upload now
                  or after submission.
                </p>
                <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-[#F5F5F7] p-8 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                  <div className="text-sm font-semibold text-neutral-900">
                    Drag & drop or browse
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    PDF, JPG, PNG · up to 10MB each
                  </div>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:border-neutral-400">
                    <Camera className="h-3.5 w-3.5" /> Use camera
                  </button>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <h3 className="mb-2 text-xs font-semibold text-neutral-700">
                    Recommended for {product?.name}
                  </h3>
                  <ul className="space-y-1.5">
                    {requiredDocs.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-xs text-neutral-600">
                        <FileText className="h-3.5 w-3.5 text-rose-500" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setStep(6)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  Skip — upload later
                </button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-medium">Agreements & signatures</h2>
                <p className="text-sm text-neutral-600">
                  By signing below, you agree to the following. You can revoke
                  electronic consent at any time.
                </p>
                {[
                  { key: 'terms', label: 'I agree to the OrbitPay Terms of Use and Account Agreement.' },
                  { key: 'privacy', label: 'I have read the Privacy Policy and authorize the disclosure of my information as described.' },
                  { key: 'marketing', label: 'I would like to receive marketing communications about products and offers.' },
                  { key: 'eSign', label: 'I consent to receive electronic records and signatures in lieu of paper.' },
                ].map((a) => (
                  <label key={a.key} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={draft.agreements[a.key as keyof typeof draft.agreements]}
                      onChange={(e) => set(`agreements.${a.key}`, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-sm text-neutral-700">{a.label}</span>
                  </label>
                ))}
                <Link to="/terms" className="inline-block text-xs font-semibold text-rose-600 hover:text-rose-700">
                  Read the full terms →
                </Link>
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="font-serif text-2xl font-medium">Review & submit</h2>
                <p className="text-sm text-neutral-600">
                  One last look. Edit anything by clicking the section.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Product', value: product?.name, step: 0 },
                    { label: 'Identity', value: `${draft.identity.firstName} ${draft.identity.lastName} · ${draft.contact.email}`, step: 1 },
                    { label: 'Financial', value: `${draft.financial.employment} · $${draft.financial.income || '0'}`, step: 2 },
                    { label: 'Product details', value: draft.productConfig.amount || draft.productConfig.initialDeposit || 'Set', step: 3 },
                    { label: 'Online banking', value: `@${draft.digital.username || 'pending'}`, step: 4 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setStep(s.step)}
                      className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-rose-300"
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-500">{s.label}</div>
                        <div className="text-sm text-neutral-900">{s.value}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      You can still save and come back. We auto-save every
                      change. Once you submit, the review process typically
                      takes 1–3 business days.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 className="text-center font-serif text-2xl font-medium sm:text-3xl">
                  Reviewing your application
                </h2>
                <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-600">
                  This usually takes 1–3 minutes. Hang tight.
                </p>
                <div className="mt-8 space-y-2">
                  {['Identity verification', 'KYC review', 'AML screening', 'Credit assessment', 'Approved'].map((label, i) => {
                    const done = i < processingStep;
                    const current = i === processingStep;
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                          done
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : current
                            ? 'border-rose-200 bg-rose-50/40'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : current
                              ? 'bg-rose-500 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : current ? <Clock className="h-4 w-4 animate-pulse" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-neutral-900">{label}</div>
                          <div className="text-xs text-neutral-500">
                            {done ? 'Complete' : current ? 'In progress…' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg"
                >
                  <Check className="h-10 w-10" />
                </motion.div>
                <h1 className="font-serif text-3xl font-medium sm:text-4xl">
                  Welcome to{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
                  >
                    OrbitPay.
                  </span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
                  Your application for {product?.name} is{' '}
                  <span className="font-semibold text-rose-600">approved</span>.
                  We sent a confirmation to {draft.contact.email}. Your
                  membership number is on its way.
                </p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => navigate('/app')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                  >
                    Open member portal
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900">
                    Download welcome packet
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 9 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-30"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg"
            >
              {step === 7 ? 'Submit application' : step === 8 ? 'Continue' : 'Continue'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {step === 9 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {}
                navigate('/enroll');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              Start another application
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  leftIcon?: any;
  maxLength?: number;
  hint?: string;
  showPasswordToggle?: boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder, leftIcon: LeftIcon, maxLength, hint, showPasswordToggle }: FieldProps) {
  const [show, setShow] = useState(false);
  const t = type === 'password' && showPasswordToggle && show ? 'text' : type;
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-700">
        <span>{label}</span>
        {hint && <span className="text-[11px] font-normal text-neutral-500">{hint}</span>}
      </label>
      <div className="relative flex items-center rounded-2xl border border-neutral-200 bg-white transition focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
        {LeftIcon && (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-neutral-400">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <input
          type={t}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-neutral-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, Icon, value, onChange }: { label: string; Icon: any; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between rounded-2xl border p-4 transition ${
        value ? 'border-rose-300 bg-rose-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${value ? 'text-rose-500' : 'text-neutral-500'}`} />
        <span className="text-sm font-medium text-neutral-900">{label}</span>
      </div>
      <div className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-rose-500' : 'bg-neutral-300'}`}>
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            value ? 'left-5' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}
