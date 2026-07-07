/**
 * Smartsupp integration
 * ----------------------
 * Embeds the official Smartsupp live-chat widget INSIDE the in-app
 * `<SupportButton />` panel (not as a separate floating bubble that
 * would fight our Intercom-style UI).
 *
 * The widget key is the **public** value Smartsupp shows under
 *   Dashboard → Settings → Channels → Chat widget → "Widget key"
 * It is *designed* to live in client JavaScript — it scopes the
 * widget to a single Smartsupp account.
 *
 * **SECURITY RULES — DO NOT change without thinking:**
 *
 *   - This module reads `import.meta.env.VITE_SMARTSUPP_WIDGET_KEY`.
 *   - The Smartsupp **secret API key** (40-hex-char, server-side) must
 *     NEVER appear in a `VITE_*` env var, NEVER ship in client
 *     bundles, and NEVER be pasted into chat. If it has been pasted,
 *     rotate it in the Smartsupp dashboard immediately.
 *
 * For the agent ↔ member flow inside `/app`, see `useAgentSupport.ts`
 * (Supabase Realtime with scoped JWTs — no Smartsupp key involved).
 */

const SMARTSUPP_SCRIPT_ID = 'smartsupp-loader-script';

declare global {
  interface Window {
    smartsupp?: any;
    _smartsupp?: any;
  }
}

export interface SmartsuppConfig {
  /** Smartsupp widget key (PUBLIC). Set via VITE_SMARTSUPP_WIDGET_KEY. */
  widgetKey?: string;
  /** Working hours / availability label shown in the widget. */
  label?: string;
}

export function getSmartsuppConfig(): SmartsuppConfig {
  const widgetKey = (import.meta.env.VITE_SMARTSUPP_WIDGET_KEY as string | undefined)?.trim();
  return {
    widgetKey: widgetKey && widgetKey.length > 0 ? widgetKey : undefined,
    label: (import.meta.env.VITE_SMARTSUPP_LABEL as string | undefined) || 'OrbitPay Support',
  };
}

export function isSmartsuppEnabled(): boolean {
  return Boolean(getSmartsuppConfig().widgetKey);
}

/**
 * Load Smartsupp's official loader script. Idempotent. Returns true
 * if the script tag is already in the DOM. Returns false (without
 * throwing) when no widget key is configured.
 */
export function loadSmartsuppWidget(): boolean {
  if (typeof window === 'undefined') return false;
  const { widgetKey, label } = getSmartsuppConfig();
  if (!widgetKey) return false;
  if (document.getElementById(SMARTSUPP_SCRIPT_ID)) return true;

  // Smartsupp's loader expects a `_smartsupp` config object before
  // the loader script runs. It also exposes `smartsupp` once loaded
  // so we can programmatically open the panel from our own UI.
  window._smartsupp = window._smartsupp || {
    key: widgetKey,
    onLoaded: () => {
      // eslint-disable-next-line no-console
      console.info(`[smartsupp] widget loaded (${label})`);
    },
  };

  const s = document.createElement('script');
  s.id = SMARTSUPP_SCRIPT_ID;
  s.async = true;
  s.src = 'https://www.smartsuppchat.com/loader.js?';
  s.setAttribute('data-smartsupp-key', widgetKey);
  document.head.appendChild(s);
  return true;
}

/**
 * Programmatically open the Smartsupp chat panel (after the loader
 * has finished). Falls back to a no-op if Smartsupp isn't loaded.
 */
export function openSmartsupp(): void {
  try {
    // Smartsupp exposes `smartsupp('open')` after the loader runs.
    if (typeof window !== 'undefined' && typeof window.smartsupp === 'function') {
      window.smartsupp('open');
    } else if (window._smartsupp && typeof window._smartsupp.open === 'function') {
      window._smartsupp.open();
    }
  } catch {
    // Smartsupp's API surface varies; ignore failures.
  }
}

/**
 * Tear down the widget — used by the in-portal SupportButton so we
 * don't double-render two chat UIs.
 */
export function unloadSmartsuppWidget(): void {
  if (typeof window === 'undefined') return;
  const existing = document.getElementById(SMARTSUPP_SCRIPT_ID);
  if (existing) existing.remove();
  try {
    delete window.smartsupp;
    delete window._smartsupp;
  } catch {
    // delete on window properties is rare-fail in strict mode; harmless
  }
}