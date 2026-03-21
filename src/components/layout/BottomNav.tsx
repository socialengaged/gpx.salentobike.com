'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/i18n/useLocale';
import { useInstallModal } from '@/lib/pwa/InstallContext';

const tabClass = (active: boolean) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] text-[10px] font-medium transition-colors touch-manipulation ${
    active ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800'
  }`;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const openInstallModal = useInstallModal()?.openInstallModal;

  const isHome = pathname === '/';
  const isRoutes = pathname === '/routes' || pathname.startsWith('/routes/');
  const isSaved = pathname === '/saved';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex sm:hidden border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 safe-area-padding"
      aria-label="Navigazione principale"
    >
      <Link href="/" className={tabClass(isHome)} prefetch={true}>
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>{t('bottom.tab_home')}</span>
      </Link>
      <Link href="/routes" className={tabClass(isRoutes)} prefetch={true}>
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{t('bottom.tab_routes')}</span>
      </Link>
      <Link href="/saved" className={tabClass(isSaved)} prefetch={true}>
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span>{t('bottom.tab_saved')}</span>
      </Link>
      {openInstallModal ? (
        <button type="button" className={tabClass(false)} onClick={() => openInstallModal()}>
          <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{t('bottom.tab_install')}</span>
        </button>
      ) : (
        <span className={tabClass(false)} aria-hidden>
          <span className="w-[22px] h-[22px]" />
          <span>{t('bottom.tab_install')}</span>
        </span>
      )}
    </nav>
  );
}
