/**
 * i18n configuration — single source of truth for OrbitPay's
 * localization. Uses i18next + react-i18next with browser language
 * detection and a localStorage override.
 *
 * To add a language:
 *   1. Create `src/i18n/<code>.ts` exporting the same shape as `en`.
 *   2. Import it below and add to `resources`.
 *   3. Add an entry in `SUPPORTED_LANGUAGES` in `LanguageProvider.tsx`.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
] as const;

export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const STORAGE_KEY = 'orbitpay-lang';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr', 'de'],
      nonExplicitSupportedLngs: true,
      load: 'currentOnly',
      debug: false,
      interpolation: { escapeValue: false },
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        lookupLocalStorage: STORAGE_KEY,
        caches: ['localStorage'],
      },
      react: { useSuspense: false },
    });
}

export function setLanguage(code: LangCode) {
  if (!i18n.hasResourceBundle(code, 'translation')) return;
  i18n.changeLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
  }
}

export default i18n;
