/**
 * i18n tests — verify the translation set is consistent and the language
 * detector can switch languages.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n, { setLanguage, SUPPORTED_LANGUAGES } from '@/i18n/config';

describe('i18n', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('loads English by default', () => {
    expect(i18n.t('common.signIn')).toBe('Sign In');
    expect(i18n.t('common.openAccount')).toBe('Open account');
  });

  it('switches to Spanish and exposes Spanish strings', async () => {
    await setLanguage('es');
    expect(i18n.t('common.signIn')).toBe('Iniciar sesión');
    expect(i18n.t('common.openAccount')).toBe('Abrir cuenta');
    expect(i18n.t('landing.heroHeadline')).toBe('Banca');
  });

  it('switches to French and exposes French strings', async () => {
    await setLanguage('fr');
    expect(i18n.t('common.signIn')).toBe('Se connecter');
    expect(i18n.t('auth.welcomeBack')).toBe('Bon retour');
  });

  it('switches to German and exposes German strings', async () => {
    await setLanguage('de');
    expect(i18n.t('common.signIn')).toBe('Anmelden');
    expect(i18n.t('support.greeting')).toBe('Hallo!');
  });

  it('falls back to English for unknown locales', async () => {
    await i18n.changeLanguage('en');
    // unknown
    await i18n.changeLanguage('xx');
    expect(i18n.t('common.signIn')).toBe('Sign In');
  });

  it('all supported languages have the same shape as English', () => {
    const en = i18n.getResourceBundle('en', 'translation') as Record<string, any>;
    expect(en).toBeTruthy();
    for (const lang of SUPPORTED_LANGUAGES) {
      const bundle = i18n.getResourceBundle(lang.code, 'translation') as Record<string, any>;
      expect(bundle, `language ${lang.code} should be loaded`).toBeTruthy();
      for (const ns of Object.keys(en)) {
        expect(bundle[ns], `${lang.code} missing ${ns}`).toBeTruthy();
        for (const k of Object.keys(en[ns])) {
          expect(bundle[ns][k], `${lang.code}.${ns}.${k} should be a string`).toBeTypeOf('string');
        }
      }
    }
  });
});
