'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useInstallModal } from '@/lib/pwa/InstallContext';

const navLinks: { href: string; label: string; className?: string; isInstall?: boolean }[] = [
  { href: '/saved', label: 'Saved' },
  { href: '/routes', label: 'Routes' },
  { href: '#', label: 'Install App', isInstall: true },
  { href: '/admin', label: 'Admin', className: 'text-slate-400' },
];

const linkClass = 'text-slate-600 hover:text-slate-900 text-base font-medium min-h-[52px] flex items-center px-5 py-4';

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openInstallModal = useInstallModal()?.openInstallModal;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200">
      <div className="flex h-16 items-center px-4 max-w-4xl mx-auto">
        <Link href="/" className="font-semibold text-xl text-slate-900">
          Salento Bike
        </Link>

        <nav className="ml-auto hidden sm:flex gap-4 items-center">
          {navLinks.map(({ href, label, className, isInstall }) =>
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
                {label}
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                className={`${linkClass} ${className ?? ''}`}
              >
                {label}
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="sm:hidden ml-auto p-3 -mr-2 min-w-[52px] min-h-[52px] flex items-center justify-center text-slate-600 hover:text-slate-900"
          aria-label="Apri menu"
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
              <span className="font-semibold text-xl text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-3 -mr-2 min-w-[52px] min-h-[52px] flex items-center justify-center text-slate-500 hover:text-slate-900 text-3xl leading-none"
                aria-label="Chiudi menu"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col flex-1 overflow-auto py-4">
              {navLinks.map(({ href, label, className, isInstall }) =>
                isInstall && openInstallModal ? (
                  <button
                    key="install"
                    type="button"
                    onClick={() => {
                      openInstallModal();
                      setMenuOpen(false);
                    }}
                    className={`${linkClass} border-b border-slate-100`}
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`${linkClass} border-b border-slate-100 ${className ?? ''}`}
                  >
                    {label}
                  </Link>
                )
              )}
            </nav>
            <div className="shrink-0 p-4 border-t border-slate-200 safe-area-padding">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center font-medium text-lg text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Chiudi
              </button>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
