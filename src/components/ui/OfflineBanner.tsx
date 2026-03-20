'use client';

import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';

export function OfflineBanner() {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="flex-shrink-0 px-5 py-3 bg-amber-100 text-amber-800 text-base text-center">
      You are offline. Saved routes are available.
    </div>
  );
}
