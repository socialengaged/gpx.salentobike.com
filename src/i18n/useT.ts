'use client';

import { useLocaleContext } from './LocaleContext';

export function useT() {
  return useLocaleContext().t;
}
