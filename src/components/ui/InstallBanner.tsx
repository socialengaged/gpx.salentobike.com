'use client';

import { useState } from 'react';
import { useIsInstalled, useInstallFlow } from '@/lib/pwa/install-state';
import { useInstallModal } from '@/lib/pwa/InstallContext';
import { useT } from '@/i18n/useT';
import { Button } from './Button';

export function InstallBanner() {
  const t = useT();
  const isInstalled = useIsInstalled();
  const { canUsePrompt, prompt, canShowInstall } = useInstallFlow();
  const openInstallModal = useInstallModal()?.openInstallModal;
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !canShowInstall) return null;

  const handleInstall = async () => {
    if (canUsePrompt && prompt) {
      await prompt();
    } else if (openInstallModal) {
      openInstallModal();
    }
  };

  const primaryLabel = canUsePrompt ? t('install.banner.btn_install') : t('install.banner.btn_how');
  const description = canUsePrompt ? t('install.banner.prompt') : t('install.banner.manual');

  return (
    <div className="flex-shrink-0 px-4 sm:px-5 py-4 bg-sky-50 border-b-2 border-sky-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-base sm:text-[17px] text-sky-900 leading-snug flex-1">{description}</p>
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="primary" size="md" onClick={handleInstall} className="min-h-[48px] px-5">
          {primaryLabel}
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sky-700 hover:text-sky-900 text-2xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('nav.close')}
        >
          ×
        </button>
      </div>
    </div>
  );
}
