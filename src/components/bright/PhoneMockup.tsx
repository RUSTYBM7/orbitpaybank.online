/**
 * PhoneMockup — frames content as if rendered inside an iPhone.
 * Used by the redesigned HomeScreen hero (the "$2,101.70 balance" hero on the
 * OrbitPay 2025 landing template).
 *
 * Decoration only — does not intercept pointer events. Renders as an absolute
 * iPhone-style bezel with a notch + content slot.
 */

import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  /** Scale factor; default 1.0 (use 0.7 for thumbnails). */
  scale?: number;
}

export function PhoneMockup({ children, className = '', scale = 1 }: PhoneMockupProps) {
  const width = 320 * scale;
  const height = 640 * scale;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {/* Bezel */}
      <div
        className="absolute inset-0 rounded-[44px] bg-gradient-to-b from-neutral-900 via-neutral-950 to-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
        style={{ padding: 8 * scale }}
      >
        {/* Inner screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-white">
          {/* Notch */}
          <div
            className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-black"
            style={{ width: 110 * scale, height: 26 * scale }}
          />
          {/* Content */}
          <div className="h-full w-full overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}