'use client';

import { useMemo } from 'react';
import { routeToGpxPoints } from '@/lib/gpx';
import { computeElevationProfile, computeMaxGradient } from '@/lib/gpx';
import type { Route } from '@/lib/routes/types';
import { useT } from '@/i18n/useT';

interface RouteElevationStatsProps {
  route: Route;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export function RouteElevationStats({ route }: RouteElevationStatsProps) {
  const t = useT();
  const { profile, maxGradient, hasElevation } = useMemo(() => {
    const points = routeToGpxPoints(route);
    const hasElev = points.some((p) => p.elevation != null && Number.isFinite(p.elevation));
    return {
      profile: hasElev ? computeElevationProfile(points) : [],
      maxGradient: hasElev ? computeMaxGradient(points) : 0,
      hasElevation: hasElev,
    };
  }, [route?.id, route?.normalizedGeoJson]);

  if (!hasElevation || profile.length < 2) return null;

  const maxEle = Math.max(...profile.map((p) => p.eleM));
  const minEle = Math.min(...profile.map((p) => p.eleM));
  const range = maxEle - minEle || 1;
  const lastDist = profile[profile.length - 1]?.distKm ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
        <span>{t('route.elevation_profile')}</span>
        <span>
          {t('route.max_slope')}: {maxGradient}%
        </span>
      </div>
      <div className="h-16 w-full rounded-lg bg-slate-100 overflow-hidden relative">
        <svg
          viewBox={`0 0 100 100`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeLinejoin="round"
            points={profile
              .map(
                (p, i) =>
                  `${(i / (profile.length - 1)) * 100},${100 - ((p.eleM - minEle) / range) * 100}`
              )
              .join(' ')}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{minEle} m</span>
        <span>{formatDistance(lastDist * 1000)}</span>
        <span>{maxEle} m</span>
      </div>
    </div>
  );
}
