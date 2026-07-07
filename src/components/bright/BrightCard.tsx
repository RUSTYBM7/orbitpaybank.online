/**
 * BrightCard — rounded white card with soft shadow, matches the OrbitPay 2025
 * template's "premium glass card on pastel background" aesthetic.
 *
 * Variants:
 *   - default: white card
 *   - yellow:  yellow gradient card (for "Total Spend", "You receive" CTAs)
 *   - mint:    mint gradient card (for balance displays)
 *   - outline: white card with mint border
 *
 * Sizes:
 *   - sm: p-4
 *   - md: p-6
 *   - lg: p-8
 */

import { HTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'yellow' | 'mint' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  default: 'bg-white text-neutral-900 shadow-[0_8px_30px_rgba(15,17,21,0.06)]',
  yellow:
    'bg-gradient-to-br from-butter-300 via-butter-200 to-lime-200 text-neutral-900 shadow-[0_8px_30px_rgba(214,221,124,0.45)]',
  mint:
    'bg-gradient-to-br from-mint-300 via-mint-200 to-mint-100 text-neutral-900 shadow-[0_8px_30px_rgba(94,195,112,0.30)]',
  outline:
    'bg-white text-neutral-900 ring-1 ring-mint-300/60 shadow-[0_8px_30px_rgba(15,17,21,0.04)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'p-4 rounded-2xl',
  md: 'p-6 rounded-3xl',
  lg: 'p-8 rounded-[2rem]',
};

interface BrightCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  size?: Size;
}

export const BrightCard = forwardRef<HTMLDivElement, BrightCardProps>(function BrightCard(
  { variant = 'default', size = 'md', className = '', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});