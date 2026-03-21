'use client';

import { HomeContent } from './HomeContent';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useT } from '@/i18n/useT';

export function HomePageBody() {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto">
      <section className="bg-gradient-to-br from-sky-600 to-sky-700 text-white px-6 pt-8 pb-12 sm:pt-10 sm:pb-14 shrink-0">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Salento Bike Routes</h1>
          <p className="text-sky-100 text-lg sm:text-xl leading-relaxed">{t('home.tagline')}</p>
        </div>
      </section>
      <section className="flex-1 bg-slate-50 px-6 py-8 rounded-t-3xl -mt-6 relative z-10 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] min-h-0 flex flex-col">
        <div className="max-w-md mx-auto w-full">
          <HomeContent />
        </div>
        <SiteFooter />
      </section>
    </div>
  );
}
