'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { getLocalRoutes } from '@/lib/db/localRoutes';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import type { RouteDifficulty, RouteSummary } from '@/lib/routes/types';
import { useT } from '@/i18n/useT';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatDuration(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
  return `${min} min`;
}

function difficultyAccent(d: RouteDifficulty): string {
  switch (d) {
    case 'easy':
      return 'border-l-emerald-500';
    case 'moderate':
      return 'border-l-sky-500';
    case 'hard':
      return 'border-l-orange-500';
    case 'expert':
      return 'border-l-red-500';
    default:
      return 'border-l-slate-400';
  }
}

function IconBike({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`inline-block shrink-0 text-slate-500 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconMountain({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`inline-block shrink-0 text-slate-500 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`inline-block shrink-0 text-slate-500 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function RoutesListClient() {
  const t = useT();
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
          })),
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
        })),
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
        <p className="text-slate-600 text-lg">{t('routes.loading')}</p>
        <Button variant="outline" size="lg" onClick={handleRetry}>
          {t('routes.retry')}
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
          {t('routes.retry')}
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
              className={`block p-5 rounded-xl bg-white border border-slate-200 border-l-4 ${difficultyAccent(route.difficulty)} hover:border-sky-300 hover:shadow-md transition-all active:scale-[0.99] min-h-[80px]`}
            >
              <h2 className="font-bold text-xl text-slate-900 pr-2">{route.title}</h2>
              <p className="text-base text-slate-600 mt-2 line-clamp-2">{route.shortDescription}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <IconBike />
                  {formatDistance(route.distanceMeters)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconMountain />
                  +{route.elevationGainMeters} m
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconClock />
                  {formatDuration(route.estimatedDuration)}
                </span>
                <span className="inline-flex items-center gap-1.5 capitalize text-slate-700 font-medium">
                  {route.difficulty}
                </span>
                <Chip variant="default" className="text-xs px-2 py-0.5 font-medium">
                  {route.category}
                </Chip>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
