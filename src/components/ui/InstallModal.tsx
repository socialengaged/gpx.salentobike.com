'use client';

import { createPortal } from 'react-dom';
import { Button } from './Button';
import type { InstallBrowserType } from '@/lib/pwa/install-state';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  browser: InstallBrowserType;
  onPrompt?: () => Promise<void>;
  canUsePrompt?: boolean;
}

function InstructionsContent({ browser }: { browser: InstallBrowserType }) {
  if (browser === 'safari-ios') {
    return (
      <ol className="list-decimal list-inside space-y-2 text-slate-600 text-left">
        <li>Tocca il pulsante Condividi (quadrato con freccia su) in Safari</li>
        <li>Scorri e tocca &quot;Aggiungi a Home&quot;</li>
        <li>Tocca &quot;Aggiungi&quot;</li>
      </ol>
    );
  }
  if (browser === 'firefox') {
    return (
      <ol className="list-decimal list-inside space-y-2 text-slate-600 text-left">
        <li>Apri il menu (≡) accanto alla barra degli indirizzi</li>
        <li>Seleziona &quot;Installa&quot; o &quot;Installa app&quot;</li>
        <li>Conferma l&apos;aggiunta alla schermata Home</li>
      </ol>
    );
  }
  if (browser === 'safari-desktop') {
    return (
      <ol className="list-decimal list-inside space-y-2 text-slate-600 text-left">
        <li>Nel menu Safari: File → Aggiungi a Dock</li>
        <li>Oppure usa il menu Sviluppo se disponibile</li>
      </ol>
    );
  }
  return (
    <ol className="list-decimal list-inside space-y-2 text-slate-600 text-left">
      <li>Apri il menu del browser (tre puntini o ≡)</li>
      <li>Cerca &quot;Installa app&quot; o &quot;Aggiungi a schermata Home&quot;</li>
      <li>Conferma</li>
    </ol>
  );
}

export function InstallModal({
  isOpen,
  onClose,
  browser,
  onPrompt,
  canUsePrompt,
}: InstallModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const handleInstall = async () => {
    if (canUsePrompt && onPrompt) {
      await onPrompt();
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="install-modal-title" className="text-xl font-bold text-slate-900 mb-4">
          Install Salento Bike
        </h2>

        {canUsePrompt && onPrompt ? (
          <div className="space-y-4">
            <p className="text-slate-600">
              Tocca il pulsante qui sotto per installare l&apos;app e usarla offline.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="lg" onClick={handleInstall} className="flex-1">
                Install now
              </Button>
              <Button variant="outline" size="lg" onClick={onClose}>
                Annulla
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600">
              Segui questi passaggi per aggiungere l&apos;app alla schermata Home:
            </p>
            <InstructionsContent browser={browser} />
            <p className="text-sm text-slate-500">
              L&apos;app funziona offline dopo aver salvato le route.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              Ho capito
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
