import type { Locale } from './types';
import it from './it.json';
import en from './en.json';

export type Messages = typeof it;

export function getMessages(locale: Locale): Messages {
  return locale === 'en' ? en : it;
}

export function tServer(locale: Locale, key: keyof Messages): string {
  const m = getMessages(locale);
  return m[key] ?? String(key);
}
