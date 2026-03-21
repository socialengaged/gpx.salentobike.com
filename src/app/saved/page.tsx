'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalRoutes } from '@/lib/db/localRoutes';
import type { Route } from '@/lib/routes/types';
import { Chip } from '@/components/ui/Chip';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export default function SavedRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalRoutes().then((r) => {
      setRoutes(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-slate-600 text-lg">Loading saved routes...</p>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <p className="text-slate-600 text-center mb-4 text-lg">
          No saved routes yet.</p>
        <p className="text-base text-slate-500 text-center">
          Apri una route e tocca &quot;Salva offline&quot; per accedervi senza connessione.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto px-5 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Route salvate</h1>
      <p className="text-slate-600 mb-6 text-base">
        Available offline. Tap to open.
      </p>
      <ul className="space-y-5">
        {routes.map((route) => (
          <li key={route.id}>
            <Link
              href={`/routes/${route.slug}`}
              className="block p-5 rounded-xl bg-white border-2 border-slate-200 hover:border-sky-300 transition-all active:scale-[0.99] min-h-[80px]"
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-semibold text-lg text-slate-900">{route.title}</h2>
                <Chip variant="success">Offline</Chip>
              </div>
              <p className="text-base text-slate-600 mt-2 line-clamp-2">
                {route.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-sm text-slate-500">
                <span>{formatDistance(route.distanceMeters)}</span>
                <span>•</span>
                <span>+{route.elevationGainMeters} m</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
