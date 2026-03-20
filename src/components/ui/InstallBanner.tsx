'use client';

import { useState } from 'react';
import { useIsInstalled, useInstallFlow } from '@/lib/pwa/install-state';
import { useInstallModal } from '@/lib/pwa/InstallContext';
import { Button } from './Button';

export function InstallBanner() {
  const isInstalled = useIsInstalled();
  const { browser, canUsePrompt, prompt, canShowInstall } = useInstallFlow();
  const openModal = useInstallModal()?.openInstallModal;
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !canShowInstall) return null;

  const handleInstall = async () => {
    if (canUsePrompt && prompt) {
      await prompt();
    } else if (openModal) {
      openModal();
    }
  };

  const buttonLabel = canUsePrompt ? 'Installa' : 'Come installare';

  return (
    <div className="flex-shrink-0 px-5 py-4 bg-sky-50 border-b-2 border-sky-200 flex items-center justify-between gap-4">
      <p className="text-base text-sky-700">
        {canUsePrompt ? 'Install for offline use' : 'Add to Home screen for offline use'}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleInstall}
        >
          {buttonLabel}
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sky-600 hover:text-sky-800 text-lg p-2 min-w-[44px] min-h-[44px]"
          aria-label="Chiudi"
        >
          ×
        </button>
      </div>
    </div>
  );
}
