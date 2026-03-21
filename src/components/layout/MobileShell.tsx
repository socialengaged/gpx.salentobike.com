'use client';

import { useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InstallProvider } from '@/lib/pwa/InstallContext';
import { LocaleProvider } from '@/i18n/LocaleContext';
import { registerServiceWorker } from '@/lib/sw-register';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <LocaleProvider>
      <InstallProvider>
        <div className="h-dvh min-h-dvh flex flex-col bg-slate-50 safe-area-padding">
          <AppHeader />
          <InstallBanner />
          <OfflineBanner />
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </InstallProvider>
    </LocaleProvider>
  );
}
