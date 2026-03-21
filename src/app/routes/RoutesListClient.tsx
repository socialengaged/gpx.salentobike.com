'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { getLocalRoutes } from '@/lib/db/localRoutes';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import type { RouteSummary } from '@/lib/routes/types';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatDuration(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
  return `${min} min`;
}

export function RoutesListClient() {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOffline = useOfflineStatus();

  async function loadRoutes() {
    try {
      if (isOffline) {
        const local = await getLocalRoutes();
        setRoutes(
          local.map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            shortDescription: r.shortDescription,
            category: r.category,
            distanceMeters: r.distanceMeters,
            elevationGainMeters: r.elevationGainMeters,
            difficulty: r.difficulty,
            estimatedDuration: r.estimatedDuration,
          }))
        );
      } else {
        const res = await fetch('/api/routes');
        if (!res.ok) throw new Error('Errore nel caricamento');
        const data = await res.json();
        setRoutes(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle route');
      const local = await getLocalRoutes();
      setRoutes(
        local.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          shortDescription: r.shortDescription,
          category: r.category,
          distanceMeters: r.distanceMeters,
          elevationGainMeters: r.elevationGainMeters,
          difficulty: r.difficulty,
          estimatedDuration: r.estimatedDuration,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadRoutes();
  }, [isOffline]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadRoutes();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5">
        <p className="text-slate-600 text-lg">Caricamento route...</p>
        <Button variant="outline" size="lg" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-10 text-slate-600 space-y-5">
        {isOffline ? (
          <p className="text-base">Nessuna route salvata. Salva le route quando sei online per usarle offline.</p>
        ) : (
          <p className="text-base">Nessuna route disponibile.</p>
        )}
        <Button variant="outline" size="lg" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 text-amber-800 text-base">
          {error} — mostrando le route salvate.
        </div>
      )}
      <ul className="space-y-5">
        {routes.map((route) => (
          <li key={route.id}>
            <Link
              href={`/routes/${route.slug}`}
              className="block p-5 rounded-xl bg-white border-2 border-slate-200 hover:border-sky-300 hover:shadow-md transition-all active:scale-[0.99] min-h-[80px]"
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-semibold text-lg text-slate-900">{route.title}</h2>
                <Chip variant="default">{route.category}</Chip>
              </div>
              <p className="text-base text-slate-600 mt-2 line-clamp-2">
                {route.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-sm text-slate-500">
                <span>{formatDistance(route.distanceMeters)}</span>
                <span>•</span>
                <span>+{route.elevationGainMeters} m</span>
                <span>•</span>
                <span>{formatDuration(route.estimatedDuration)}</span>
                <span>•</span>
                <span className="capitalize">{route.difficulty}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
