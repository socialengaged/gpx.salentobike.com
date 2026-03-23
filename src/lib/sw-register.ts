'use client';

import { useEffect, useState } from 'react';

/**
 * Called from MobileShell after `requestIdleCallback` (or next tick) so first interaction stays fast.
 * Registration is still early enough for `beforeinstallprompt` in practice.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('SW registered:', reg.scope);
      }
    })
    .catch((err) => {
      console.warn('SW registration failed:', err);
    });
}

export function useServiceWorkerReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(() => setReady(true));
  }, []);

  return ready;
}
