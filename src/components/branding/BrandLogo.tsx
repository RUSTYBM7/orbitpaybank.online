/**
 * Orbitpay Finance — central brand logo component.
 *
 * Uses the user-provided master SVG logo (the "Orbitpay Finance" mark with
 * two diagonal stripes). The same file is served everywhere; only the
 * rendered height changes per variant.
 */

import React from 'react';

// Authoritative user-provided master logo files.
export const BRAND_LOGO_URL = '/assets/logo/orbitpay-master-logo.svg'; // master SVG wordmark
export const BRAND_MARK_URL = '/assets/logo/orbitpay-master-logo.svg'; // same SVG, sized for compact use

export interface BrandLogoProps {
  variant?: 'header' | 'nav' | 'hero' | 'footer' | 'auth' | 'card' | 'modal' | 'settings' | 'compact' | 'full';
  className?: string;
  onDark?: boolean;
  style?: React.CSSProperties;
  src?: string;
}

const variantClasses = {
  header: 'h-10 md:h-12 lg:h-14 w-auto',
  nav: 'h-8 md:h-10 w-auto',
  hero: 'h-16 md:h-20 lg:h-24 w-auto',
  footer: 'h-8 md:h-10 w-auto opacity-90',
  auth: 'h-12 md:h-14 w-auto',
  card: 'h-8 w-auto',
  modal: 'h-10 w-auto',
  settings: 'h-10 w-auto',
  compact: 'h-8 w-auto',
  full: 'h-12 md:h-14 w-auto',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  onDark = false,
  style,
  src,
}) => {
  const logoSrc = src || BRAND_LOGO_URL;
  return (
    <img
      src={logoSrc}
      alt="Orbitpay Finance"
      className={`
        object-contain object-left
        ${variantClasses[variant]}
        ${onDark ? 'brightness-110 contrast-105' : ''}
        ${className}
      `}
      style={{
        maxWidth: '320px',
        ...style,
      }}
    />
  );
};

// Square mark for compact uses (nav button, app icon, etc.)
export const BrandMark: React.FC<{
  className?: string;
  size?: number;
  src?: string;
}> = ({ className = '', size, src }) => (
  <img
    src={src || BRAND_MARK_URL}
    alt="Orbitpay Finance"
    className={className}
    style={size ? { height: size, width: size } : undefined}
  />
);

export default BrandLogo;
