'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getLastOpenedRoute } from '@/lib/db/localRoutes';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import { useInstallModal } from '@/lib/pwa/InstallContext';
import { useT } from '@/i18n/useT';

export function HomeContent() {
  const t = useT();
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
            {t('home.open_last_route')}: {lastRoute.title}
          </Button>
        </Link>
      )}
      <Link href="/routes">
        <Button variant="primary" size="lg" fullWidth>
          {t('home.cta_routes')}
        </Button>
      </Link>
      <Link href="/saved">
        <Button variant="outline" size="lg" fullWidth>
          {t('home.cta_saved')}
        </Button>
      </Link>
      {openInstallModal && (
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={openInstallModal}
        >
          {t('home.cta_install')}
        </Button>
      )}
    </div>
  );
}
