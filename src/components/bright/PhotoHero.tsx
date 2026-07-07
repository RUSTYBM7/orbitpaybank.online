/**
 * PhotoHero — reusable hero banner for product pages. Pairs a template photo
 * with a glassmorphic overlay, gradient fade, and a clear CTA. Used at the
 * top of Investment / Cards / Crypto / Loans / Accounts / Bills.
 */

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhotoHeroProps {
  imageUrl: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  align?: 'left' | 'center';
  height?: 'sm' | 'md' | 'lg';
  accent?: 'emerald' | 'teal' | 'cyan' | 'mint' | 'amber';
}

const accentGradients: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-500',
  teal: 'from-teal-500 to-cyan-500',
  cyan: 'from-cyan-500 to-blue-500',
  mint: 'from-emerald-400 to-green-400',
  amber: 'from-amber-500 to-orange-500',
};

const heightClasses: Record<string, string> = {
  sm: 'h-44',
  md: 'h-56',
  lg: 'h-72',
};

export default function PhotoHero({
  imageUrl,
  eyebrow,
  title,
  description,
  ctaLabel,
  onCta,
  align = 'left',
  height = 'md',
  accent = 'emerald',
}: PhotoHeroProps) {
  const isCenter = align === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        'relative overflow-hidden rounded-3xl shadow-xl',
        heightClasses[height]
      )}
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          // Soft fallback when the photo is missing — show a gradient panel.
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Multi-layer gradient for readable text */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(6, 17, 24, 0.10) 0%, rgba(6, 17, 24, 0.55) 50%, rgba(6, 17, 24, 0.92) 100%)',
        }}
      />
      <div
        aria-hidden
        className={cn('absolute inset-0 opacity-70 bg-gradient-to-br', accentGradients[accent])}
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Soft glow corner accent */}
      <div
        aria-hidden
        className={cn(
          'absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-30 bg-gradient-to-br',
          accentGradients[accent]
        )}
      />

      {/* Content */}
      <div
        className={cn(
          'relative z-10 flex h-full flex-col justify-end p-5 text-white',
          isCenter ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {eyebrow}
        </span>
        <h2 className="text-2xl font-bold leading-tight drop-shadow">{title}</h2>
        <p className="mt-1 max-w-sm text-sm text-white/80">{description}</p>
        {ctaLabel && (
          <button
            type="button"
            onClick={onCta}
            aria-label={ctaLabel}
            className={cn(
              'mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25',
              isCenter && 'self-center'
            )}
          >
            {ctaLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
