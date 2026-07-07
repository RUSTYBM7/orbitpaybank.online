/**
 * LanguageProvider — exposes a React context for the current language and
 * a `setLang` function that updates both i18n and the HTML lang attribute.
 *
 * Anywhere in the tree you can call `useLanguage()` to read or change the
 * language. The picker in the menu/footer and the SupportButton all funnel
 * through this provider.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, setLanguage, type LangCode } from './config';

interface LanguageApi {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  languages: typeof SUPPORTED_LANGUAGES;
}

const Ctx = createContext<LanguageApi | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState<LangCode>(() => {
    const initial = (i18n.language || 'en').split('-')[0] as LangCode;
    return (SUPPORTED_LANGUAGES.find((l) => l.code === initial)?.code ?? 'en') as LangCode;
  });

  useEffect(() => {
    const handler = (lng: string) => {
      const code = lng.split('-')[0] as LangCode;
      setLangState((SUPPORTED_LANGUAGES.find((l) => l.code === code)?.code ?? 'en') as LangCode);
    };
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const setLang = useCallback((code: LangCode) => {
    setLanguage(code);
    setLangState(code);
  }, []);

  const api = useMemo<LanguageApi>(
    () => ({ lang, setLang, languages: SUPPORTED_LANGUAGES }),
    [lang, setLang]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const v = useContext(Ctx);
  if (!v) {
    return {
      lang: 'en' as LangCode,
      setLang: setLanguage,
      languages: SUPPORTED_LANGUAGES,
    };
  }
  return v;
}
