'use client';

import { createPortal } from 'react-dom';
import { Button } from './Button';
import type { InstallBrowserType } from '@/lib/pwa/install-state';
import { useT } from '@/i18n/useT';

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 text-slate-700 text-left">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 font-bold text-sm">
        {n}
      </span>
      <span className="pt-1 leading-relaxed text-[15px] sm:text-base">{children}</span>
    </li>
  );
}

function ManualInstructions({ browser }: { browser: InstallBrowserType }) {
  const t = useT();

  const block = (
    badgeKey: string,
    steps: { key: string }[],
    extra?: React.ReactNode,
  ) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-sky-800">{t(badgeKey)}</p>
      <ol className="list-none space-y-3 pl-0">
        {steps.map((s, i) => (
          <Step key={s.key} n={i + 1}>
            {t(s.key)}
          </Step>
        ))}
      </ol>
      {extra}
    </div>
  );

  switch (browser) {
    case 'chrome-android':
      return block(
        'install.chrome_android.badge',
        [
          { key: 'install.chrome_android.step1' },
          { key: 'install.chrome_android.step2' },
          { key: 'install.chrome_android.step3' },
        ],
        <p className="text-sm text-slate-500 border-t border-slate-200 pt-3 leading-relaxed">
          {t('install.chrome_android.fallback')}
        </p>,
      );
    case 'chrome-desktop':
      return block('install.chrome_desktop.badge', [
        { key: 'install.chrome_desktop.step1' },
        { key: 'install.chrome_desktop.step2' },
      ]);
    case 'chrome-ios':
      return block('install.chrome_ios.badge', [
        { key: 'install.chrome_ios.step1' },
        { key: 'install.chrome_ios.step2' },
      ]);
    case 'firefox':
      return block('install.firefox.badge', [
        { key: 'install.firefox.step1' },
        { key: 'install.firefox.step2' },
        { key: 'install.firefox.step3' },
      ]);
    case 'firefox-ios':
      return block('install.firefox_ios.badge', [{ key: 'install.firefox_ios.step1' }]);
    case 'safari-ios':
      return block('install.safari_ios.badge', [
        { key: 'install.safari_ios.step1' },
        { key: 'install.safari_ios.step2' },
        { key: 'install.safari_ios.step3' },
      ]);
    case 'safari-desktop':
      return block('install.safari_desktop.badge', [
        { key: 'install.safari_desktop.step1' },
        { key: 'install.safari_desktop.step2' },
      ]);
    default:
      return block('install.other.badge', [
        { key: 'install.other.step1' },
        { key: 'install.other.step2' },
      ]);
  }
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  browser: InstallBrowserType;
  onPrompt?: () => Promise<void>;
  canUsePrompt?: boolean;
}

export function InstallModal({
  isOpen,
  onClose,
  browser,
  onPrompt,
  canUsePrompt,
}: InstallModalProps) {
  const t = useT();

  if (!isOpen || typeof document === 'undefined') return null;

  const handleInstall = async () => {
    if (canUsePrompt && onPrompt) {
      await onPrompt();
      onClose();
    }
  };

  const showChromeFallback =
    canUsePrompt &&
    onPrompt &&
    (browser === 'chrome-android' || browser === 'chrome-desktop');

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="install-modal-title" className="text-xl font-bold text-slate-900 mb-4">
          {t('install.modal.title')}
        </h2>

        {canUsePrompt && onPrompt ? (
          <div className="space-y-4">
            <p className="text-slate-600 text-[15px] leading-relaxed">{t('install.prompt.lead')}</p>
            {showChromeFallback && (
              <p className="text-sm text-slate-500 leading-relaxed border-l-4 border-sky-200 pl-3">
                {t('install.prompt.chrome_hint')}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" onClick={handleInstall} className="flex-1 min-h-[52px]">
                {t('install.prompt.btn')}
              </Button>
              <Button variant="outline" size="lg" onClick={onClose} className="min-h-[52px]">
                {t('install.prompt.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 text-[15px] leading-relaxed">{t('install.manual.lead')}</p>
            <ManualInstructions browser={browser} />
            <p className="text-sm text-slate-500 leading-relaxed">{t('install.footer')}</p>
            <Button variant="primary" size="lg" fullWidth onClick={onClose} className="min-h-[52px]">
              {t('nav.close')}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
