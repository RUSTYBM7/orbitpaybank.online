/**
 * Smoke tests for src/lib/utils.ts (FIX-16).
 * Verifies the cn() helper merges Tailwind classes correctly.
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles undefined / null / false', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting tailwind utilities (later wins)', () => {
    // twMerge keeps the last value of a conflicting utility
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('preserves non-conflicting classes', () => {
    expect(cn('text-red-500', 'bg-blue-100', 'p-4')).toContain('text-red-500');
    expect(cn('text-red-500', 'bg-blue-100', 'p-4')).toContain('bg-blue-100');
    expect(cn('text-red-500', 'bg-blue-100', 'p-4')).toContain('p-4');
  });

  it('accepts arrays and objects (clsx semantics)', () => {
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).toContain('foo');
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).toContain('bar');
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).toContain('baz');
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).not.toContain('qux');
  });
});