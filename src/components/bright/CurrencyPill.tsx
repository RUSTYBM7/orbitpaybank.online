/**
 * CurrencyPill — small rounded chip showing a currency code on a colored disc,
 * plus name + rate below. Used by the redesigned HomeScreen hero to show
 * "Euro 1,952.00 / Pound 2,174.00 / Swiss Franc 3,156.05".
 */

interface CurrencyPillProps {
  code: string;
  name: string;
  rate: number;
  symbol?: string;
  /** Background class for the code disc (default mint green). */
  discClass?: string;
}

export function CurrencyPill({
  code,
  name,
  rate,
  symbol,
  discClass = 'bg-mint-400',
}: CurrencyPillProps) {
  const formatted = rate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,17,21,0.04)]">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${discClass}`}
      >
        {code === 'EUR' ? '€' : code === 'GBP' ? '£' : code.charAt(0)}
      </div>
      <div>
        <div className="text-xs text-neutral-500">{name}</div>
        <div className="text-base font-semibold text-neutral-900">
          {symbol ?? ''}{formatted}
        </div>
      </div>
    </div>
  );
}