'use client';

import { useState, useEffect } from 'react';
import type { Route } from '@/lib/routes/types';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { RouteTools } from '@/components/route/RouteTools';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import { useGpsTracking } from '@/lib/hooks/useGpsTracking';
import { useCurrentPosition } from '@/lib/hooks/useCurrentPosition';
import { saveRoute, isRouteSaved } from '@/lib/db/routes-db';
import { trackRecorder, downloadRecordedGpx } from '@/lib/gps/trackRecorder';

export interface MapState {
  onRecenter: () => void;
  autoCenter: boolean;
  onAutoCenterToggle: () => void;
  showRecenter: boolean;
}

interface RouteDetailClientProps {
  route: Route;
  onRouteChange?: (route: Route) => void;
  splitRoutes?: [Route, Route] | null;
  onSplitRoutesChange?: (routes: [Route, Route] | null) => void;
  onSplitResult?: (routes: [Route, Route]) => void;
  renderMap?: (
    userPosition: { lat: number; lng: number; accuracy?: number } | null,
    mapState?: MapState | null
  ) => React.ReactNode;
  renderStats?: React.ReactNode;
}

const CONTACT_URL = 'tel:+393331234567';
const CONTACT_LABEL = 'Contact Salento Bike';

function gpsStateToChip(state: string): { label: string; variant: 'default' | 'success' | 'warning' | 'error' } {
  switch (state) {
    case 'gps-ok':
      return { label: 'GPS OK', variant: 'success' };
    case 'gps-weak':
      return { label: 'GPS weak', variant: 'warning' };
    case 'gps-unavailable':
      return { label: 'Location unavailable', variant: 'error' };
    case 'possibly-off-route':
      return { label: 'Possibly off route', variant: 'warning' };
    default:
      return { label: 'GPS', variant: 'default' };
  }
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export function RouteDetailClient({ route, onRouteChange, splitRoutes, onSplitRoutesChange, onSplitResult, renderMap, renderStats }: RouteDetailClientProps) {
  const [saved, setSaved] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [autoCenter, setAutoCenter] = useState(false);
  const [recording, setRecording] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const isOffline = useOfflineStatus();
  const { state: gpsState, offRoute, position, progressFraction } = useGpsTracking(route, tracking);
  const currentPos = useCurrentPosition(!tracking);

  const userPosition =
    tracking && position
      ? { lat: position.lat, lng: position.lng, accuracy: position.accuracy }
      : currentPos
        ? { lat: currentPos.lat, lng: currentPos.lng, accuracy: currentPos.accuracy }
        : null;

  const distanceRemaining = route.distanceMeters * (1 - progressFraction);
  const progressPercent = Math.round(progressFraction * 100);


  useEffect(() => {
    if (recording && position) {
      trackRecorder.addPoint(position);
    }
  }, [recording, position]);

  useEffect(() => {
    isRouteSaved(route.id).then(setSaved);
  }, [route.id]);

  const handleSaveOffline = async () => {
    await saveRoute(route);
    setSaved(true);
  };

  const handleStartRoute = () => {
    setTracking(!tracking);
  };

  const handleRecordToggle = () => {
    if (recording) {
      trackRecorder.stop();
      downloadRecordedGpx(`recorded-${Date.now()}`);
    } else {
      trackRecorder.start();
    }
    setRecording(!recording);
  };

  const mapState: MapState | null = tracking
    ? {
        onRecenter: () => {},
        autoCenter,
        onAutoCenterToggle: () => setAutoCenter((a) => !a),
        showRecenter: true,
      }
    : null;

  const gpsChip = gpsStateToChip(tracking && offRoute ? 'possibly-off-route' : gpsState);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {renderMap?.(userPosition, mapState)}
      {tracking && offRoute && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-100 text-amber-800 text-sm text-center">
          Possibly off route
        </div>
      )}
      <div className="flex-shrink-0 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={() => setPanelCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-4 py-3 gap-3 hover:bg-slate-50 active:bg-slate-100 touch-manipulation min-h-[52px]"
          aria-expanded={!panelCollapsed}
        >
          <span className="text-base font-medium text-slate-600">
            {panelCollapsed ? 'Mostra controlli' : 'Nascondi controlli'}
          </span>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${panelCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {!panelCollapsed && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[40vh]">
            {tracking && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  {formatDistance(Math.max(0, distanceRemaining))} left
                </span>
                <span className="font-medium text-slate-900">{progressPercent}%</span>
              </div>
            )}
            {renderStats}
            {onRouteChange && (
              <>
                <RouteTools
                  route={route}
                  onRouteChange={onRouteChange}
                  onSplitResult={(routes) => {
                    onSplitResult?.(routes);
                    onSplitRoutesChange?.(routes);
                  }}
                />
                {splitRoutes && (
                  <div className="flex gap-2">
                <Button
                  variant={route.id === splitRoutes[0].id ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => onRouteChange?.(splitRoutes[0])}
                >
                  Part 1
                </Button>
                <Button
                  variant={route.id === splitRoutes[1].id ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => onRouteChange?.(splitRoutes[1])}
                >
                  Part 2
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => onSplitRoutesChange?.(null)}
                >
                  Clear
                </Button>
                  </div>
                )}
              </>
            )}
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                <Chip variant={isOffline ? 'warning' : 'success'}>
                  {isOffline ? 'Offline' : 'Online'}
                </Chip>
                <Chip variant={gpsChip.variant}>{gpsChip.label}</Chip>
        {tracking && gpsState === 'gps-unavailable' && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => window.location.reload()}
          >
            Retry GPS
          </Button>
        )}
                {tracking && (
                  <Chip variant="success">Tracking active</Chip>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartRoute}
                >
                  {tracking ? 'Stop Tracking' : 'Start Route'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleSaveOffline}
                  disabled={saved}
                >
                  {saved ? 'Saved for offline' : 'Save offline'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleRecordToggle}
                >
                  {recording ? 'Stop & export recording' : 'Record track'}
                </Button>
                <a href={CONTACT_URL}>
                  <Button variant="ghost" size="lg" fullWidth>
                    {CONTACT_LABEL}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
        {panelCollapsed && (
          <div className="px-5 pb-5">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStartRoute}
            >
              {tracking ? 'Stop Tracking' : 'Start Route'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
