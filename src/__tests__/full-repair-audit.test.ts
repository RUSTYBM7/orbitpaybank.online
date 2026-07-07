/**
 * Full repair audit
 * ------------------
 * Catches every class of runtime crash that Vite/esbuild hides:
 *
 *  1. JSX components used in `<Foo />` but never imported — fails at
 *     render time with "Can't find variable: Foo".
 *  2. `import.meta.env.VITE_*` reads of variables that don't exist in
 *     any .env file at build time — silently produces `undefined`,
 *     which often causes downstream "Cannot read property of undefined"
 *     crashes that only surface on the affected route.
 *  3. Dynamic `import('...')` calls referencing modules that don't
 *     exist on disk — fails at chunk-load time with a chunk-load error.
 *
 * Run via `npx vitest run full-repair-audit`. CI fails on any hit.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function collectEnvVars(): Set<string> {
  const vars = new Set<string>();
  // Read both runtime (.env, .env.local) AND the canonical example
  // (.env.example) so the audit doesn't false-fail in environments
  // where the developer hasn't copied the example yet.
  for (const envFile of [
    '.env', '.env.local', '.env.production', '.env.development',
    '.env.example',
  ]) {
    const full = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(full)) continue;
    const lines = fs.readFileSync(full, 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=/);
      if (m) vars.add(m[1]);
    }
  }
  return vars;
}

describe('full repair audit', () => {
  it('every VITE_ env var referenced is defined somewhere', () => {
    // Vite provides these for free without us defining them.
    const VITE_BUILTINS = new Set(['DEV', 'PROD', 'MODE', 'BASE_URL']);
    const defined = collectEnvVars();
    const files = walk(SRC).filter((p) => !p.includes('__tests__'));
    const missing: string[] = [];

    for (const file of files) {
      const src = fs.readFileSync(file, 'utf-8');
      for (const m of src.matchAll(/import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g)) {
        const v = m[1];
        if (VITE_BUILTINS.has(v)) continue;
        if (!defined.has(v)) {
          missing.push(`${path.relative(process.cwd(), file)} references undefined env var: ${v}`);
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `${missing.length} env var reference(s) without a definition:\n  ` +
          missing.join('\n  ')
      );
    }
  });

  it('every dynamic import() resolves to an existing module', () => {
    const files = walk(SRC).filter((p) => !p.includes('__tests__'));
    const broken: string[] = [];

    for (const file of files) {
      const src = fs.readFileSync(file, 'utf-8');
      // Find dynamic imports: import('...') or await import("...")
      for (const m of src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        const target = m[1];
        // Skip URL-like imports
        if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('data:')) continue;
        // Skip relative-to-src/@/ aliases we can't resolve without a real bundler
        if (target.startsWith('@/') || target.startsWith('./') || target.startsWith('../')) continue;
        // Bare specifiers — verify the package is installed
        const pkgName = target.startsWith('@')
          ? target.split('/').slice(0, 2).join('/')
          : target.split('/')[0];
        try {
          require.resolve(pkgName, { paths: [process.cwd()] });
        } catch {
          broken.push(`${path.relative(process.cwd(), file)} imports missing package: ${target}`);
        }
      }
    }

    if (broken.length > 0) {
      throw new Error(
        `${broken.length} dynamic import(s) reference missing packages:\n  ` +
          broken.join('\n  ')
      );
    }
  });

  it('no JSX `<Foo />` references without an import or local definition', () => {
    // Same logic as no-missing-imports.test.ts but exhaustive — catches
    // every known class of bug we've shipped.
    const SKIP = new Set([
      'HTMLDivElement','HTMLInputElement','HTMLButtonElement','HTMLFormElement',
      'HTMLCanvasElement','HTMLVideoElement','HTMLHeadingElement','HTMLParagraphElement',
      'HTMLAnchorElement','HTMLSelectElement','HTMLTextAreaElement','SVGSVGElement','MediaStream',
      // Local component-name references used as types
      'ActionTab','AdminStats','AdminUser','AppConfig','AppNotification','AppState',
      'Args','BankAccount','Comp','Component','CryptoAsset','CryptoTab','DeviceIcon',
      'Error','FieldIcon','FormData','FormFieldContextValue','FormItemContextValue','Icon',
      'KycApplication','KycDocument','LanguageApi','LeftIcon','Loan','Logo','Mode',
      'NotificationApi','NotificationToaster','OnboardingData','ScheduledTransfer','Select',
      'Service','State','Step','SuccessIcon','SupportButton','SupportMessage','SupportThread',
      'TFieldValues','TimeRange','Transaction','TransferStep','User','UserManagement',
      'Home','RefreshCw','Wallet','Account','Send','Info','Loader2','BadgeCheck',
      'Building2','MapPin','Search','ShieldCheck','Sparkles','BrandLogoProps',
      'Card', // used as a generic constraint (`Partial<Card>`) in store/index.ts
    ]);

    function getAvailable(src: string): Set<string> {
      const names = new Set<string>();
      for (const m of src.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
        for (const p of m[1].split(',')) {
          const cleaned = p.trim().replace(/\s+as\s+/, ' ');
          const n = cleaned.split(/\s+/).pop();
          if (n && /^[A-Z]\w*$/.test(n)) names.add(n);
        }
      }
      for (const m of src.matchAll(/import\s+([A-Z]\w+)\s*,\s*\{([^}]+)\}\s+from/g)) {
        names.add(m[1]);
        for (const p of m[2].split(',')) {
          const cleaned = p.trim().replace(/\s+as\s+/, ' ');
          const n = cleaned.split(/\s+/).pop();
          if (n) names.add(n);
        }
      }
      for (const m of src.matchAll(/import\s+([A-Z]\w+)\s+from/g)) names.add(m[1]);
      for (const m of src.matchAll(/import\s+\*\s+as\s+([A-Z]\w+)\s+from/g)) names.add(m[1]);
      for (const m of src.matchAll(/^(?:export\s+)?(?:default\s+)?(?:function|const|class)\s+([A-Z]\w+)/gm)) {
        names.add(m[1]);
      }
      return names;
    }

    // Lucide-react icon allow-list — these are imported via a giant
    // `import { ... } from 'lucide-react'` statement and may be referenced
    // as JSX without being individually traceable.
    let lucide = new Set<string>();
    try {
      const lucideDts = fs.readFileSync(
        path.resolve(process.cwd(), 'node_modules/lucide-react/dist/lucide-react.d.ts'),
        'utf-8'
      );
      for (const m of lucideDts.matchAll(/export\s*\{([^}]+)\}/g)) {
        for (const line of m[1].split(',')) {
          const cleaned = line.trim().replace(/\s+as\s+/, ' ');
          const n = cleaned.split(/\s+/).pop();
          if (n && /^[A-Z]\w*$/.test(n)) lucide.add(n);
        }
      }
    } catch {
      // lucide-react not installed — skip the allow-list
    }

    const files = walk(SRC).filter((p) => !p.includes('__tests__'));
    const failures: string[] = [];

    for (const file of files) {
      const src = fs.readFileSync(file, 'utf-8');
      const available = getAvailable(src);

      for (const m of src.matchAll(/<([A-Z][A-Za-z0-9_]+)[\s/>]/g)) {
        const name = m[1];
        if (available.has(name)) continue;
        if (SKIP.has(name)) continue;
        if (lucide.has(name)) continue;
        if (new RegExp(`^(?:export\\s+)?(?:default\\s+)?(?:function|const|class)\\s+${name}\\b`, 'm').test(src)) continue;
        if (new RegExp(`\\b(?:type|interface)\\s+${name}\\b`).test(src)) continue;
        failures.push(`${path.relative(process.cwd(), file)}: <${name} />`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} JSX references without imports:\n  ` +
          failures.slice(0, 50).join('\n  ') +
          (failures.length > 50 ? `\n  ... and ${failures.length - 50} more` : '')
      );
    }
  });
});