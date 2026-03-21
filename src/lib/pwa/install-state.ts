'use client';

import { useState, useEffect, useCallback } from 'react';

export type InstallBrowserType =
  | 'chrome-android'
  | 'chrome-desktop'
  | 'chrome-ios'
  | 'firefox'
  | 'firefox-ios'
  | 'safari-ios'
  | 'safari-desktop'
  | 'other';

export function useIsIos(): boolean {
  const [ios, setIos] = useState(false);
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    );
  }, []);
  return ios;
}

export function useIsInstalled(): boolean {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const check = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(isStandalone);
    };

    check();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', check);
    return () =>
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', check);
  }, []);

  return installed;
}

/** Chrome/Edge/Samsung (Chromium) install prompt — captured early via inline script + sync here. */
export function useCanInstall(): {
  canInstall: boolean;
  prompt: (() => Promise<void>) | null;
} {
  const [state, setState] = useState<{
    canInstall: boolean;
    prompt: (() => Promise<void>) | null;
  }>({ canInstall: false, prompt: null });

  const syncFromDeferred = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & { __salentoBip?: BeforeInstallPromptEvent | null };
    const e = w.__salentoBip;
    if (!e) return;

    setState({
      canInstall: true,
      prompt: () => {
        const ev = w.__salentoBip;
        if (!ev) return Promise.resolve();
        return ev.prompt().then(() => {
          w.__salentoBip = null;
          setState({ canInstall: false, prompt: null });
        });
      },
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStored = () => syncFromDeferred();

    window.addEventListener('salento-bip-stored', onStored);
    syncFromDeferred();

    return () => {
      window.removeEventListener('salento-bip-stored', onStored);
    };
  }, [syncFromDeferred]);

  return state;
}

export function detectBrowser(): InstallBrowserType {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIos) {
    if (/CriOS/.test(ua)) return 'chrome-ios';
    if (/FxiOS/.test(ua)) return 'firefox-ios';
    return 'safari-ios';
  }
  if (/Firefox/i.test(ua)) return 'firefox';
  if (/Chrome|Chromium|Edg/i.test(ua)) {
    if (/Android/i.test(ua)) return 'chrome-android';
    return 'chrome-desktop';
  }
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) return 'safari-desktop';
  return 'other';
}

export interface InstallFlowState {
  browser: InstallBrowserType;
  canUsePrompt: boolean;
  prompt: (() => Promise<void>) | null;
  canShowInstall: boolean;
}

export function useInstallFlow(): InstallFlowState {
  const { canInstall, prompt } = useCanInstall();
  const [browser, setBrowser] = useState<InstallBrowserType>('other');

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const canUsePrompt = canInstall && !!prompt;
  const canShowInstall =
    canUsePrompt ||
    browser === 'safari-ios' ||
    browser === 'chrome-ios' ||
    browser === 'firefox-ios' ||
    browser === 'firefox' ||
    browser === 'safari-desktop' ||
    browser === 'chrome-android' ||
    browser === 'chrome-desktop' ||
    browser === 'other';

  return {
    browser,
    canUsePrompt,
    prompt,
    canShowInstall,
  };
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Window {
    __salentoBip?: BeforeInstallPromptEvent | null;
  }
}

/** Chromium PWA install event (not in all TS DOM libs). */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
