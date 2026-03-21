'use client';

import { useLocaleContext } from './LocaleContext';

export function useLocale() {
  return useLocaleContext();
}
