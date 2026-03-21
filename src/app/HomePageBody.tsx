'use client';

import { HomeContent } from './HomeContent';
import { useT } from '@/i18n/useT';

export function HomePageBody() {
  const t = useT();

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
        Salento Bike Routes
      </h1>
      <p className="text-slate-600 text-lg sm:text-xl">{t('home.tagline')}</p>
      <HomeContent />
    </>
  );
}
