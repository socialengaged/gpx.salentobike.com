'use client';

import { useState } from 'react';
import { RouteMap } from '@/components/map/RouteMap';
import { MapControls } from '@/components/map/MapControls';
import { RouteDetailClient } from './RouteDetailClient';
import { RouteElevationStats } from '@/components/route/RouteElevationStats';
import type { Route } from '@/lib/routes/types';

interface RouteDetailViewProps {
  route: Route;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatDuration(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
  return `${min} min`;
}

export function RouteDetailView({ route: initialRoute }: RouteDetailViewProps) {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [splitRoutes, setSplitRoutes] = useState<[Route, Route] | null>(null);

  const handleSplitResult = (routes: [Route, Route]) => {
    setSplitRoutes(routes);
    setRoute(routes[0]);
  };

  return (
    <RouteDetailClient
      route={route}
      onRouteChange={(r) => {
        setRoute(r);
        const isSplitPart = splitRoutes && (r.id === splitRoutes[0].id || r.id === splitRoutes[1].id);
        if (!isSplitPart) setSplitRoutes(null);
      }}
      splitRoutes={splitRoutes}
      onSplitRoutesChange={setSplitRoutes}
      onSplitResult={handleSplitResult}
      renderMap={(userPosition, mapState) => (
        <div className="flex-1 min-h-0 min-h-[200px] relative w-full overflow-hidden">
          <RouteMap
            route={route}
            userPosition={userPosition}
            className="absolute inset-0"
          >
            {mapState && (
              <MapControls
                position={userPosition}
                autoCenter={mapState.autoCenter}
                onAutoCenterToggle={mapState.onAutoCenterToggle}
                showRecenter={mapState.showRecenter}
              />
            )}
          </RouteMap>
        </div>
      )}
      renderStats={
        <>
          <div className="grid grid-cols-4 gap-3 text-center text-base">
            <div>
              <div className="font-semibold text-slate-900">
                {formatDistance(route.distanceMeters)}
              </div>
              <div className="text-slate-500 text-sm">Distanza</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                +{Math.round(route.elevationGainMeters)} m
              </div>
              <div className="text-slate-500 text-sm">Dislivello +</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                -{Math.round(route.elevationLossMeters)} m
              </div>
              <div className="text-slate-500 text-sm">Dislivello -</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 capitalize">
                {route.difficulty}
              </div>
              <div className="text-slate-500 text-sm">Livello</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm mb-1">
              {formatDuration(route.estimatedDuration)} stimati
            </div>
            <RouteElevationStats route={route} />
          </div>
        </>
      }
    />
  );
}
