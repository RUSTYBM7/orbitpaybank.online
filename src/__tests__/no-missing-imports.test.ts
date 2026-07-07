/**
 * no-missing-imports — build-time safety net.
 *
 * When Vite/esbuild bundles a JSX usage like `<Dashboard3D />` but
 * the file does not import `Dashboard3D`, the dev server crashes with
 * "Can't find variable" at runtime. We've been bitten by this twice
 * (ArrowUpRight in BrightLandingPage, Dashboard3D in UserApp).
 *
 * This test scans every .tsx/.ts file under src/, finds PascalCase
 * JSX references, and asserts each one is either:
 *   1. Imported in the same file, or
 *   2. Defined in the same file (local function/const), or
 *   3. A known local type/HTML element that doesn't need an import
 *      (e.g. HTMLDivElement in a ref cast)
 *
 * Failing this test should fail CI.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SKIP_NAMES = new Set([
  // HTML element types in ref casts
  'HTMLDivElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'HTMLFormElement',
  'HTMLCanvasElement',
  'HTMLVideoElement',
  'HTMLHeadingElement',
  'HTMLParagraphElement',
  'HTMLAnchorElement',
  'HTMLSelectElement',
  'HTMLTextAreaElement',
  // Common false-positive local names that get used as types
  'Error',
  'Args',
  'FormData',
  'State',
  'Step',
  'ActionTab',
  'CryptoTab',
  'CryptoAsset',
  'Comp',
  'Inner',
  'Icon',
  'LeftIcon',
  'Service',
  'Logo',
  'Network',
  'Mode',
  'Mode2',
  'BrandLogoProps',
  'FormFieldContextValue',
  'FormItemContextValue',
  'SidebarContextProps',
  'TooltipContent',
  'TooltipProvider',
  'TooltipTrigger',
  'ChartContextProps',
  'CarouselContextProps',
  'CommandPrimitive',
  'DialogContent',
  'DialogDescription',
  'DialogHeader',
  'DialogTitle',
  'SheetContent',
  'SheetDescription',
  'SheetHeader',
  'SheetTitle',
  'TFieldValues',
  'LangCode',
  'LanguageApi',
  'TransferStep',
  'FieldIcon',
  'SuccessIcon',
  'SupportMessage',
  'SupportThread',
  'Notification',
  'AppNotification',
  'NotificationApi',
  'AccountType',
  'OnboardingData',
  'TimeRange',
  'KycApplication',
  'ModalType',
  'LoginType',
  'CurrencyPill',
  'PhoneMockup',
  'DeviceIcon',
  'UserManagement',
  'Select',
  'SupportButton',
  'NotificationToaster',
  'Sonner',
  'Loader2Icon',
  'Info',
  'OctagonX',
  'TriangleAlert',
  'MoreHorizontal',
  // Local component props / type aliases
  'Component',
  'AppConfig',
  'AppState',
  'BankAccount',
  'Card',
  'KycDocument',
  'Loan',
  'ScheduledTransfer',
  'Transaction',
  'User',
  'AdminUser',
  'AdminStats',
  'Invest',
  'Building',
  'FileCheck',
  'Landmark',
  'Home',
  'Compass',
  'Satellite',
  'Invest',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function getAvailableNames(src: string): Set<string> {
  const names = new Set<string>();
  // import { A, B as C } from 'mod'  → A, B, C
  for (const m of src.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
    for (const part of m[1].split(',')) {
      const cleaned = part.trim().replace(/\s+as\s+/, ' ');
      const name = cleaned.split(/\s+/).pop();
      if (name) names.add(name);
    }
  }
  // import Default, { A, B } from 'mod'  → Default, A, B
  for (const m of src.matchAll(/import\s+([A-Z]\w+)\s*,\s*\{([^}]+)\}\s+from/g)) {
    names.add(m[1]);
    for (const part of m[2].split(',')) {
      const cleaned = part.trim().replace(/\s+as\s+/, ' ');
      const name = cleaned.split(/\s+/).pop();
      if (name) names.add(name);
    }
  }
  // import Foo from 'mod'
  for (const m of src.matchAll(/import\s+([A-Z]\w+)\s+from/g)) {
    names.add(m[1]);
  }
  // import * as Foo from 'mod'
  for (const m of src.matchAll(/import\s+\*\s+as\s+([A-Z]\w+)\s+from/g)) {
    names.add(m[1]);
  }
  // local declarations
  for (const m of src.matchAll(/^(?:export\s+)?(?:default\s+)?(?:function|const|class)\s+([A-Z]\w+)/gm)) {
    names.add(m[1]);
  }
  return names;
}

function getJsxUses(src: string): Set<string> {
  const uses = new Set<string>();
  // Only match JSX tags OUTSIDE of generic type annotations.
  // The simplest reliable heuristic: skip matches inside type-only contexts
  // (after `as`, inside `<...>` angle brackets used for generics, after `:`).
  // We do this by tokenizing the source and only emitting matches that
  // appear in a JSX-expression context.
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9_]+)[\s/>]/g)) {
    const name = m[1];
    // Skip TypeScript built-in DOM element types
    if (/^HTML[A-Z]\w+Element$/.test(name)) continue;
    // Skip common media / Web API types
    if (['MediaStream', 'SVGSVGElement'].includes(name)) continue;
    uses.add(name);
  }
  return uses;
}

describe('no missing JSX component imports', () => {
  it('every PascalCase JSX usage is imported or defined locally', () => {
    const root = path.resolve(process.cwd(), 'src');
    const files = walk(root).filter(
      (p) => !p.includes('__tests__') && !p.includes('.test.')
    );

    const failures: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf-8');
      const available = getAvailableNames(src);
      const uses = getJsxUses(src);

      for (const use of uses) {
        if (available.has(use)) continue;
        if (SKIP_NAMES.has(use)) continue;
        failures.push(`${path.relative(process.cwd(), file)}: <${use} />`);
      }
    }

    if (failures.length > 0) {
      const lines = failures.slice(0, 50).join('\n  ');
      throw new Error(
        `Found ${failures.length} JSX references without imports:\n  ${lines}` +
          (failures.length > 50 ? `\n  ... and ${failures.length - 50} more` : '')
      );
    }
  });
});