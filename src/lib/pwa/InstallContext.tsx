'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { InstallModal } from '@/components/ui/InstallModal';
import { useInstallFlow } from './install-state';

interface InstallContextValue {
  openInstallModal: () => void;
}

const InstallContext = createContext<InstallContextValue | null>(null);

export function useInstallModal() {
  const ctx = useContext(InstallContext);
  return ctx;
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { browser, canUsePrompt, prompt } = useInstallFlow();

  const openInstallModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <InstallContext.Provider value={{ openInstallModal }}>
      {children}
      <InstallModal
        isOpen={modalOpen}
        onClose={closeModal}
        browser={browser}
        onPrompt={prompt ?? undefined}
        canUsePrompt={canUsePrompt}
      />
    </InstallContext.Provider>
  );
}
