'use client';

import { useState, useEffect } from 'react';

export type InstallBrowserType = 'chrome' | 'firefox' | 'safari-ios' | 'safari-desktop' | 'other';

export function useIsIos(): boolean {
  const [ios, setIos] = useState(false);
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
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

export function useCanInstall(): { canInstall: boolean; prompt: (() => Promise<void>) | null } {
  const [state, setState] = useState<{
    canInstall: boolean;
    prompt: (() => Promise<void>) | null;
  }>({ canInstall: false, prompt: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setState({
        canInstall: true,
        prompt: () =>
          e.prompt().then(() => {
            setState({ canInstall: false, prompt: null });
          }),
      });
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return state;
}

function detectBrowser(): InstallBrowserType {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIos) return 'safari-ios';
  if (/Firefox|FxiOS/.test(ua)) return 'firefox';
  if (/Safari/.test(ua) && !/Chrome|Chromium/.test(ua)) return 'safari-desktop';
  if (/Chrome|Chromium|Edg/.test(ua)) return 'chrome';
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
    browser === 'firefox' ||
    browser === 'safari-desktop' ||
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
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
