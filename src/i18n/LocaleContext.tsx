'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from './types';
import { LOCALE_COOKIE } from './types';
import { getMessages } from './getMessages';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function readLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'it';
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const raw = match?.[1] ? decodeURIComponent(match[1]) : '';
  return raw === 'en' ? 'en' : 'it';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>('it');

  useEffect(() => {
    setLocaleState(readLocaleFromCookie());
  }, []);

  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      setLocaleState(l);
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string) => {
      const dict = getMessages(locale) as Record<string, string>;
      return dict[key] ?? key;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocaleContext must be used within LocaleProvider');
  }
  return ctx;
}
