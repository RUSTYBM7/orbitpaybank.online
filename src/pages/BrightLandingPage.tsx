/**
 * BrightLandingPage — Velobank-style template adapted for OrbitPay Credit
 * Union. Expanded to 14 sections:
 *
 *   1. Top pill nav (with mega dropdown)
 *   2. Hero (eyebrow + headline + sub + app store buttons + phone mockup)
 *   3. Trust strip (partner logos row)
 *   4. Features (3 image cards: Smart Insights, Security, Global Payments)
 *   5. Branded HQ showcase (video + image grid)
 *   6. About (HQ video panel — dark)
 *   7. Mission (dark)
 *   8. Statistics / impact (light)
 *   9. Pricing (3 plans — dark)
 *   10. Partnership (light)
 *   11. Download (light, with phone mockup)
 *   12. Branches locations (light)
 *   13. CTA + marquee (light)
 *   14. Footer
 */

import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PARTNER_LOGOS } from '@/components/public/brandLogos';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Lock,
  Phone,
  Sparkles,
  TrendingUp,
  Download,
  Apple,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  Handshake,
} from 'lucide-react';
import PublicNav from '@/components/public/PublicNav';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Smart Insights',
    body: 'Real-time analytics, AI-driven spending insights, and goal tracking so every dollar works harder.',
    image: '/imgs/savings-growth-investment-concept.jpg',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
  },
  {
    icon: Lock,
    title: 'Advanced Security',
    body: 'Bank-grade encryption, biometric login, real-time fraud monitoring, and instant card freeze.',
    image: '/imgs/secure-mobile-banking-protection.jpg',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-500',
  },
  {
    icon: Globe,
    title: 'Global Payments',
    body: 'Send and receive in 40+ currencies with the real exchange rate — no hidden fees, no borders.',
    image: '/imgs/premium-credit-card-payment-transaction.jpg',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-500',
  },
];

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    bullets: [
      'Zero monthly fees',
      'Essential banking features',
      '2-factor authentication',
      'Access to global payments',
    ],
    cta: 'Join Now',
    accent: false,
  },
  {
    name: 'Premium',
    price: '$9.99',
    cadence: '/month',
    bullets: [
      'Everything in Basic, plus:',
      'Priority customer support',
      'Higher withdrawal & transfer limits',
      'Fee-free global payments',
      'Virtual and physical debit cards',
      'Exclusive financial insights and tools',
    ],
    cta: 'Join Now',
    accent: true,
  },
  {
    name: 'Business',
    price: 'Custom',
    bullets: [
      'All Premium Plan features, plus:',
      'Dedicated account manager',
      'Payroll management',
      'Multi-user access',
      'API for seamless integration',
      'Advanced analytics to track',
      'Discounted international fees',
    ],
    cta: 'Join Now',
    accent: false,
  },
];

const PARTNERS = [
  { name: 'Mastercard', category: 'Network' },
  { name: 'Visa', category: 'Network' },
  { name: 'NCUA', category: 'Trust' },
  { name: 'FDIC-Insured', category: 'Trust' },
  { name: 'Plaid', category: 'Data' },
  { name: 'Coinbase', category: 'Crypto' },
  { name: 'Wise', category: 'FX' },
  { name: 'Apple Pay', category: 'Wallet' },
  { name: 'Google Pay', category: 'Wallet' },
  { name: 'SOC 2 Type II', category: 'Compliance' },
  { name: 'ISO 27001', category: 'Compliance' },
  { name: 'Stripe', category: 'Payments' },
];

const STATS = [
  { value: '2.4M+', label: 'Members served' },
  { value: '$15B', label: 'In member assets' },
  { value: '5.25%', label: 'APY on high-yield savings' },
  { value: '38', label: 'States covered' },
  { value: '18', label: 'Physical branches' },
  { value: '4.9 ★', label: 'App store rating' },
];

const BRANCHES = [
  {
    city: 'Sacramento, CA',
    address: '500 Capitol Mall, Suite 1800',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-916-555-0100',
    photo: '/imgs/orbitpay-hq-real.jpg',
  },
  {
    city: 'San Francisco, CA',
    address: '101 California Street, Floor 12',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-415-555-0101',
    photo: '/imgs/modern-bank-headquarters-exterior.jpg',
  },
  {
    city: 'Los Angeles, CA',
    address: '725 S Figueroa Street, Suite 2200',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-213-555-0102',
    photo: '/imgs/modern-bank-headquarters-building-exterior.jpg',
  },
  {
    city: 'Seattle, WA',
    address: '1201 3rd Avenue, Suite 2400',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-206-555-0103',
    photo: '/imgs/modern-bank-building-exterior.jpg',
  },
  {
    city: 'Denver, CO',
    address: '1700 Lincoln Street, Floor 18',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-303-555-0104',
    photo: '/imgs/modern-bank-building-exterior-architecture.jpg',
  },
  {
    city: 'Austin, TX',
    address: '300 W 6th Street, Suite 2100',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-512-555-0105',
    photo: '/imgs/diverse-community-group-office.jpg',
  },
  {
    city: 'Chicago, IL',
    address: '200 E Randolph Street, Floor 60',
    hours: 'Mon–Fri 9am–5pm',
    phone: '1-312-555-0106',
    photo: '/imgs/modern-professional-office-workspace.jpg',
  },
  {
    city: 'New York, NY',
    address: '1290 Avenue of the Americas',
    hours: 'Mon–Fri 8am–6pm',
    phone: '1-212-555-0107',
    photo: '/imgs/diverse-community-banking-team.jpg',
  },
  {
    city: 'Frankfurt, Germany',
    address: 'Europa Headquarters, Mainzer Landstraße 1',
    hours: 'Mon–Fri 9am–6pm CET',
    phone: '+49 69 555 0100',
    photo: '/imgs/orbitpay-v2/conference-room-1.png',
  },
];

const TESTIMONIALS = [
  {
    q: '"Moving our operating account took a week. Same-day funding on card transactions meant we stopped carrying a 14-day float on $4M of monthly volume."',
    name: 'Marisol Vega',
    role: 'CFO, Northwind Logistics',
  },
  {
    q: '"A real human answered my call on the second ring. That hasn\u2019t happened at any bank in 15 years."',
    name: 'Aliyah Chen',
    role: 'Owner, Chen Family Restaurants',
  },
  {
    q: '"The mobile deposit is faster than my old bank\u2019s desktop version. I genuinely do not visit a branch anymore."',
    name: 'Devon Walker',
    role: 'Founder, Salt & Pine Studios',
  },
  {
    q: '"We refinanced the apartment building through OrbitPay in 11 days. Our previous bank took four months and still asked for the same paperwork twice."',
    name: 'Henrik Jansen',
    role: 'Principal, Linden Real Estate',
  },
  {
    q: '"The international wire interface is the first one I\u2019ve used that didn\u2019t make me open a spreadsheet. USD \u2194 EUR in three clicks."',
    name: 'Eva Novak',
    role: 'Treasurer, Atelier Novak',
  },
  {
    q: '"I had a charge I didn\u2019t recognize on a Sunday night at 11pm. The chat agent had it reversed before I woke up on Monday."',
    name: 'Matteo Ricci',
    role: 'Architect, Ricci Studio',
  },
  {
    q: '"My mom is 74 and refuses to learn a banking app. The branch staff in Sacramento know her by name. That\u2019s the point."',
    name: 'Sarah Chen',
    role: 'Retired teacher, Sacramento',
  },
  {
    q: '"Auto-saving into a vacation fund every payday without thinking about it is the single best financial decision I\u2019ve made in five years."',
    name: 'Bianca Ortiz',
    role: 'Pediatric nurse, San Francisco',
  },
  {
    q: '"Switching the LLC\u2019s payroll over saved us $480 a month in fees. The migration team walked us through every screen."',
    name: 'Luis Mendoza',
    role: 'Founder, Mendoza Contracting',
  },
];

export default function BrightLandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F5F7] text-neutral-900 antialiased">
      {/* ============================================================ */}
      {/* TOP NAV (Pages button only — PublicNav provides it)            */}
      {/* ============================================================ */}
      <PublicNav />

      {/* ============================================================ */}
      {/* 1. HERO (video as main hero — FULL-BLEED, tall)               */}
      {/* ============================================================ */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-neutral-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[min(86vh,820px)] min-h-[540px] w-full"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/imgs/orbitpay-hero-banner.png"
          >
            <source src="/assets/videos/orbitpay-hero.mp4" type="video/mp4" />
          </video>

          {/* Subtle dark wash for text legibility — full-bleed across the video */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          {/* Top-left brand chip */}
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="text-rose-300">★</span>
            {t('landing.heroEyebrow')}
          </div>

          {/* Hero headline overlay (bottom-left) */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-10 md:p-16">
            <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {t('landing.heroHeadline')}
              <br />
              {t('landing.heroHeadlineEm').split('.')[0]}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #FCA5A5 0%, #FDBA74 50%, #F9A8D4 100%)',
                }}
              >
                Simplified.
              </span>
            </h1>
            <p className="max-w-xl text-sm text-white/85 sm:text-lg">
              {t('landing.heroSub')}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#download"
                className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-neutral-900 shadow-md transition hover:bg-neutral-100"
              >
                <Apple className="h-5 w-5" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wider opacity-70">{t('landing.downloadAppStore')}</div>
                  <div className="text-sm font-semibold">{t('landing.appStore')}</div>
                </div>
              </a>
              <a
                href="#download"
                className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white shadow-md backdrop-blur transition hover:bg-white/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#4285F4"/>
                  <path d="M16.808 8.978l1.7 1.07c.66.42.66 1.39 0 1.81l-1.7 1.07-2.41-2.31 2.41-2.31z" fill="#FBBC04"/>
                  <path d="M16.808 15.022L3.609 22.186a1 1 0 0 1-.609-.92L13.792 12l3.016 3.022z" fill="#EA4335"/>
                  <path d="M3.609 1.814L16.808 8.978 13.792 12 3 2.734a1 1 0 0 1 .609-.92z" fill="#34A853"/>
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{t('landing.downloadPlay')}</div>
                  <div className="text-sm font-semibold">{t('landing.googlePlay')}</div>
                </div>
              </a>
              <Link
                to="/onboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                {t('common.openAccount')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRUST STRIP                                                */}
      {/* ============================================================ */}
      <section
        aria-label="Trust badges"
        className="border-y border-neutral-200 bg-white px-6 py-8"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-neutral-500">
          {(['FDIC Insured', 'NCUA', 'SOC 2', 'PCI DSS', '256-bit Encryption', '5.25% APY'] as const).map((p) => (
            <div
              key={p}
              className="text-sm font-semibold tracking-wide text-neutral-700/80 sm:text-base"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURES                                                   */}
      {/* ============================================================ */}
      <section id="feature" className="bg-[#F5F5F7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
                <span className="text-rose-500">★</span>
                {t('common.menu')}
              </div>
              <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                {t('landing.featuresHeading')}
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)',
                  }}
                >
                  Around You.
                </span>
              </h2>
            </div>
            <div className="md:pt-8">
              <p className="mb-5 max-w-md text-sm leading-relaxed text-neutral-600">
                This modern, straightforward copy captures OrbitPay's
                forward-thinking approach to banking while maintaining
                simplicity.
              </p>
              <Link
                to="/personal"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400"
              >
                Learn More
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/60"
              >
                <div className="relative h-56 overflow-hidden rounded-2xl bg-neutral-100">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white ${f.iconBg}`}
                  >
                    <f.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="px-2 pb-2 pt-4">
                  <h3 className="mb-1 text-lg font-semibold text-neutral-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. BRANDED HQ SHOWCASE (image grid + video)                  */}
      {/* ============================================================ */}
      <section className="bg-white px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <span className="text-rose-500">★</span>
              Headquartered in Sacramento
            </div>
            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              A 50-year{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
              >
                institution,
              </span>{' '}
              reimagined.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              The OrbitPay headquarters in Sacramento anchors our 18-branch
              network. Walk in, open an account, or call — you’ll talk to a
              real banker, not a call center.
            </p>
          </div>

          {/* Two-up image grid: Sacramento Capitol billboard (top) + real HQ building (bottom) */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl shadow-md">
              <img
                src="/imgs/orbitpay-hero-banner.png"
                alt="OrbitPay Sacramento Capitol billboard"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                <div className="text-xs uppercase tracking-wider text-rose-300">Global Headquarters</div>
                <div className="text-lg font-semibold">Sacramento, California, USA</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl shadow-md">
              <img
                src="/imgs/orbitpay-hq-real.jpg"
                alt="OrbitPay Credit Union HQ"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                <div className="text-xs uppercase tracking-wider text-rose-300">Credit Union Building</div>
                <div className="text-lg font-semibold">Our flagship branch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ABOUT (DARK)                                               */}
      {/* ============================================================ */}
      <section id="company" className="bg-[#0A0A0A] px-4 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-rose-300 backdrop-blur">
                <span className="text-rose-400">★</span>
                About
              </div>
              <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                About{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)',
                  }}
                >
                  OrbitPay.
                </span>
              </h2>
            </div>
            <div className="md:pt-8">
              <p className="mb-5 max-w-md text-sm leading-relaxed text-neutral-300">
                We bring a fast, secure, and intuitive banking experience
                directly to your fingertips. effortless, accessible, and
                transparent.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur transition hover:bg-white/10"
              >
                More Details
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. MISSION (DARK)                                             */}
      {/* ============================================================ */}
      <section className="bg-[#0A0A0A] px-4 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-2xl font-light text-white/50 sm:text-3xl">Our mission?</p>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-5xl">
            To make banking effortless,
            <br />
            accessible, and transparent for{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)',
              }}
            >
              everyone.
            </span>
          </h2>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. STATS / IMPACT (LIGHT)                                     */}
      {/* ============================================================ */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-center"
              >
                <div
                  className="bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)',
                  }}
                >
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-neutral-500 sm:text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. TESTIMONIALS                                               */}
      {/* ============================================================ */}
      <section className="bg-[#F5F5F7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <span className="text-rose-500">★</span>
              Members
            </div>
            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              Real feedback. Real{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
              >
                relationships.
              </span>
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <blockquote className="text-sm leading-relaxed text-neutral-700">
                  {t.q}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 text-xs">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-orange-500 to-pink-500 text-[11px] font-bold text-white">
                    {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{t.name}</div>
                    <div className="text-neutral-500">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* 8b. INSIDE ORBITPAY — REAL PHOTOS */}
      <section className="bg-white px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <span className="text-rose-500">★</span>
              Inside OrbitPay
            </div>
            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              Real places. Real people. <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
              >Real banking.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
              A snapshot of the spaces where the OrbitPay team works, builds, and
              serves our members — from the Frankfurt operations center to the
              member portal on every device.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: '/imgs/orbitpay-v2/conference-room-1.png', label: 'Frankfurt Operations', sub: 'Europa Headquarters, Germany' },
              { src: '/imgs/orbitpay-v2/team-meeting-1.jpeg', label: 'Brand room', sub: 'Authentic corporate branding' },
              { src: '/imgs/orbitpay-v2/team-meeting-2.jpeg', label: 'OrbitPay Mobile APP', sub: 'iOS & Android — member portal' },
              { src: '/imgs/orbitpay-v2/office-1.png', label: 'Open floor', sub: 'Engineering' },
              { src: '/imgs/orbitpay-v2/office-2.png', label: 'Operations', sub: 'Floor 8' },
            ].map((img, i) => (
              <motion.figure
                key={img.src}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={img.src}
                    alt={`${img.label} at OrbitPay`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <figcaption className="flex items-center justify-between px-3 py-2 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-900">{img.label}</div>
                    <div className="text-[10px] text-neutral-500">{img.sub}</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-rose-500" />
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. PRICING (DARK)                                             */}
      {/* ============================================================ */}
      <section id="pricing" className="bg-[#0A0A0A] px-4 pb-20 pt-4 text-white sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-rose-300 backdrop-blur">
              <span className="text-rose-400">★</span>
              Pricing
            </div>
            <h2 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">
              {t('landing.pricingHeading')}
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-6 ${
                  plan.accent
                    ? 'border border-rose-400/40 bg-gradient-to-br from-rose-500 via-orange-500 to-pink-500 shadow-2xl shadow-rose-500/20'
                    : 'border border-white/10 bg-white/5 backdrop-blur'
                }`}
              >
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                )}
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-semibold">{plan.name} Plan</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.cadence && (
                      <span className="text-sm text-white/70">{plan.cadence}</span>
                    )}
                  </div>
                </div>
                <ul className="mb-6 space-y-2.5 text-sm text-white/85">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/60" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboard"
                  className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                    plan.accent
                      ? 'bg-white text-rose-600 hover:bg-white/90'
                      : 'border border-rose-400/30 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. PARTNERSHIP                                               */}
      {/* ============================================================ */}
      <section id="business" className="bg-white px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <Handshake className="h-3 w-3" />
              Partnerships
            </div>
            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              {t('landing.partnersHeading')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              We work with the networks, regulators, and platforms you already
              trust. Every partnership is in service of one thing — a better
              experience for you.
            </p>
          </div>

          {/* Brand-logo grid — each card is fully occupied by the partner's actual logo */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {PARTNERS.map((p) => {
              const Logo = PARTNER_LOGOS[p.name];
              return (
                <div
                  key={p.name}
                  className="group flex aspect-[16/9] flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-rose-300 hover:shadow-md"
                  title={`${p.name} — ${p.category}`}
                >
                  {Logo ? (
                    <Logo className="h-full w-full" />
                  ) : (
                    <div className="text-sm font-bold text-neutral-900">{p.name}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Spotlight card */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Regulated & audited',
                body: 'NCUA-insured deposits, SEC-registered advisors, SOC 2 Type II certified. Audited annually by an independent third party.',
              },
              {
                icon: Globe,
                title: 'Global by design',
                body: 'Direct integrations with Visa, Mastercard, Plaid, Wise, and Coinbase so your money moves where it needs to, instantly.',
              },
              {
                icon: Building2,
                title: 'Community partners',
                body: 'Foundation grants to 38 community partners last year, focused on financial literacy, small business, and housing stability.',
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-400"
            >
              Partner with OrbitPay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. DOWNLOAD (with phone mockup + QR placeholder)            */}
      {/* ============================================================ */}
      <section id="download" className="bg-[#F5F5F7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
                <Download className="h-3 w-3" />
                Download
              </div>
              <h2 className="font-serif text-4xl font-medium sm:text-5xl">
                The OrbitPay app.{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
                >
                  Always with you.
                </span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
                Open an account in under 10 minutes. Fund it with one tap from
                another bank. Card in mobile wallet the same day. No paperwork,
                no branch visit, no waiting on a callback.
              </p>

              {/* App store buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-5 py-3 text-white shadow-md transition hover:bg-neutral-800"
                >
                  <Apple className="h-5 w-5" />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-neutral-900 shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#4285F4"/>
                    <path d="M16.808 8.978l1.7 1.07c.66.42.66 1.39 0 1.81l-1.7 1.07-2.41-2.31 2.41-2.31z" fill="#FBBC04"/>
                    <path d="M16.808 15.022L3.609 22.186a1 1 0 0 1-.609-.92L13.792 12l3.016 3.022z" fill="#EA4335"/>
                    <path d="M3.609 1.814L16.808 8.978 13.792 12 3 2.734a1 1 0 0 1 .609-.92z" fill="#34A853"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-500">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </div>

              <ul className="mt-8 space-y-2 text-sm text-neutral-700">
                {[
                  '4.9 ★ rating on the App Store',
                  'Native iOS 15+ and Android 9+',
                  'Biometric login, real-time alerts',
                  'No ads, no upsells, no selling your data',
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                      <span className="text-[8px]">✓</span>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone with phone mockup + scan panel */}
            <div className="relative flex justify-center">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-rose-200/40 via-pink-200/30 to-amber-200/30 blur-2xl" />
              <div className="relative flex flex-col items-center gap-6">
                <img
                  src="/imgs/orbitpay-portrait-1.png"
                  alt="OrbitPay app"
                  className="h-auto w-72 rounded-3xl object-contain drop-shadow-2xl sm:w-80"
                />
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 shadow-md">
                  <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                    Scan to download
                  </div>
                  <div className="text-sm font-bold text-neutral-900">orbitpay.com/app</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. BRANCHES LOCATIONS                                        */}
      {/* ============================================================ */}
      <section className="bg-white px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 shadow-sm">
              <MapPin className="h-3 w-3" />
              Branches
            </div>
            <h2 className="font-serif text-4xl font-medium sm:text-5xl">
              9 branches across{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #F43F5E 0%, #F97316 50%, #EC4899 100%)' }}
              >
                the U.S. and Europe.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              Drop in for account opening, notary services, safe deposit boxes,
              or just to say hi to a banker who knows your name.
            </p>
          </div>

          {/* Branch photo grid — every branch has its own card with a real photo */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRANCHES.map((b, i) => (
              <motion.figure
                key={b.city}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={b.photo}
                    alt={`OrbitPay branch in ${b.city}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 shadow-sm backdrop-blur">
                    <MapPin className="h-3 w-3" />
                    {b.city}
                  </div>
                </div>
                <figcaption className="space-y-2 p-4">
                  <div className="text-sm font-semibold text-neutral-900">{b.address}</div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {b.hours}
                    </span>
                    <a
                      href={`tel:${b.phone.replace(/[^+\d]/g, '')}`}
                      className="inline-flex items-center gap-1 font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      <Phone className="h-3 w-3" />
                      {b.phone}
                    </a>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800"
            >
              Find your nearest branch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13. CTA                                                       */}
      {/* ============================================================ */}
      <section className="bg-[#F5F5F7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">
            {t('landing.ctaHeading')}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
            {t('landing.ctaSub')}
          </p>
          <button
            onClick={() => navigate('/onboard')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800"
          >
            {t('landing.ctaButton')}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 14. MARQUEE                                                   */}
      {/* ============================================================ */}
      <div className="overflow-hidden border-y border-neutral-200 bg-white py-6">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            >
              <span className="opacity-90">IN ORBITPAY</span>
              <span className="mx-4 text-rose-500">★</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
