'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LOCALES, type Locale, messages, appMessages } from './messages';

/* eslint-disable @typescript-eslint/no-explicit-any */
function get(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  appText: (id: string) => { title: string; description: string };
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved && (LOCALES as readonly string[]).includes(saved)) {
        setLocaleState(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    const b = (navigator.language || 'en').slice(0, 2) as Locale;
    if ((LOCALES as readonly string[]).includes(b)) setLocaleState(b);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('locale', l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = get(messages[locale], key) ?? get(messages.en, key) ?? key;
      if (typeof s === 'string' && vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      }
      return s as string;
    },
    [locale],
  );

  const appText = useCallback(
    (id: string) => appMessages[locale]?.[id] ?? appMessages.en[id] ?? { title: id, description: '' },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t, appText }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext);
  if (!c) throw new Error('useI18n must be used inside I18nProvider');
  return c;
}
