'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getLastOpenedRoute } from '@/lib/db/localRoutes';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import { useInstallModal } from '@/lib/pwa/InstallContext';

export function HomeContent() {
  const [lastRoute, setLastRoute] = useState<{ slug: string; title: string } | null>(null);
  const isOffline = useOfflineStatus();
  const openInstallModal = useInstallModal()?.openInstallModal;

  useEffect(() => {
    getLastOpenedRoute().then((r) => {
      if (r) setLastRoute({ slug: r.slug, title: r.title });
    });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {isOffline && lastRoute && (
        <Link href={`/routes/${lastRoute.slug}`}>
          <Button variant="secondary" size="lg" fullWidth>
            Apri ultima route: {lastRoute.title}
          </Button>
        </Link>
      )}
      <Link href="/routes">
        <Button variant="primary" size="lg" fullWidth>
          Browse Routes
        </Button>
      </Link>
      <Link href="/saved">
        <Button variant="outline" size="lg" fullWidth>
          Route salvate
        </Button>
      </Link>
      {openInstallModal && (
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={openInstallModal}
        >
          Installa app
        </Button>
      )}
    </div>
  );
}
