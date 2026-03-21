'use client';

import { useEffect, useState } from 'react';

/**
 * Register SW as soon as the client runs — not on `window.load`.
 * Delayed registration can block Chrome from firing `beforeinstallprompt`.
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
