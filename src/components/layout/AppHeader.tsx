'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useInstallModal } from '@/lib/pwa/InstallContext';
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/types';

const navLinks: {
  href: string;
  msgKey: string;
  className?: string;
  isInstall?: boolean;
}[] = [
  { href: '/saved', msgKey: 'nav.saved' },
  { href: '/routes', msgKey: 'nav.routes' },
  { href: '#', msgKey: 'nav.install', isInstall: true },
  { href: '/admin', msgKey: 'nav.admin', className: 'text-slate-400' },
];

/** Mobile overflow menu: routes/saved/install live in BottomNav */
const moreMenuLinks: {
  href: string;
  msgKey: string;
  className?: string;
  isInstall?: boolean;
}[] = [
  { href: '/admin', msgKey: 'nav.admin', className: 'text-slate-400' },
  { href: '#', msgKey: 'nav.more_install', isInstall: true },
];

const linkClass =
  'text-slate-600 hover:text-slate-900 text-base font-medium min-h-[52px] flex items-center px-5 py-4';

function LocaleSwitch({
  compact,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale } = useLocale();

  const pill = (l: Locale, label: string) => (
    <button
      key={l}
      type="button"
      onClick={() => setLocale(l)}
      className={`px-2 py-1 rounded-md font-semibold transition-colors ${
        locale === l
          ? 'bg-sky-100 text-sky-800'
          : 'text-slate-500 hover:text-slate-800'
      }`}
      aria-pressed={locale === l}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex items-center gap-1 text-sm ${compact ? '' : 'border border-slate-200 rounded-lg bg-slate-50/80 px-1'} ${className}`}
      role="group"
      aria-label="Language"
    >
      {pill('it', 'IT')}
      <span className="text-slate-300 select-none" aria-hidden>
        |
      </span>
      {pill('en', 'EN')}
    </div>
  );
}

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openInstallModal = useInstallModal()?.openInstallModal;
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200">
      <div className="flex h-16 items-center px-4 max-w-4xl mx-auto">
        <Link href="/" className="font-semibold text-xl text-slate-900">
          Salento Bike
        </Link>

        <nav className="ml-auto hidden sm:flex gap-3 items-center">
          {navLinks.map(({ href, msgKey, className, isInstall }) =>
            isInstall && openInstallModal ? (
              <button
                key="install"
                type="button"
                onClick={() => {
                  openInstallModal();
                  setMenuOpen(false);
                }}
                className={linkClass}
              >
                {t(msgKey)}
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                className={`${linkClass} ${className ?? ''}`}
              >
                {t(msgKey)}
              </Link>
            ),
          )}
          <LocaleSwitch />
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="sm:hidden ml-auto p-3 -mr-2 min-w-[52px] min-h-[52px] flex items-center justify-center text-slate-600 hover:text-slate-900"
          aria-label={t('nav.more_menu')}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] sm:hidden flex flex-col bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 shrink-0 safe-area-padding">
              <span className="font-semibold text-xl text-slate-900">{t('nav.more_menu')}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-3 -mr-2 min-w-[52px] min-h-[52px] flex items-center justify-center text-slate-500 hover:text-slate-900 text-3xl leading-none"
                aria-label={t('nav.close')}
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col flex-1 overflow-auto py-4">
              {moreMenuLinks.map(({ href, msgKey, className, isInstall }) =>
                isInstall && openInstallModal ? (
                  <button
                    key="more-install"
                    type="button"
                    onClick={() => {
                      openInstallModal();
                      setMenuOpen(false);
                    }}
                    className={`${linkClass} border-b border-slate-100`}
                  >
                    {t(msgKey)}
                  </button>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`${linkClass} border-b border-slate-100 ${className ?? ''}`}
                  >
                    {t(msgKey)}
                  </Link>
                ),
              )}
            </nav>
            <div className="shrink-0 px-4 pb-3 border-t border-slate-200 safe-area-padding">
              <div className="flex justify-center py-3">
                <LocaleSwitch compact />
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center font-medium text-lg text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                {t('nav.close')}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
