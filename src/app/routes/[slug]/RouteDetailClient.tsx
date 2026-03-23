'use client';

import { useState, useEffect } from 'react';
import type { Route } from '@/lib/routes/types';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ComuniSearch } from '@/components/route/ComuniSearch';
import { RouteTools } from '@/components/route/RouteTools';
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus';
import { useGpsTracking } from '@/lib/hooks/useGpsTracking';
import { useCurrentPosition } from '@/lib/hooks/useCurrentPosition';
import { saveRoute, isRouteSaved } from '@/lib/db/routes-db';
import { trackRecorder, downloadRecordedGpx } from '@/lib/gps/trackRecorder';
import { useT } from '@/i18n/useT';

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
    mapState?: MapState | null,
    showComuni?: boolean,
    showFontane?: boolean
  ) => React.ReactNode;
  renderStats?: React.ReactNode;
}

const CONTACT_URL = 'https://wa.me/393204864478';

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function IconComuni() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconFontane() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3s-4 4.5-4 9a4 4 0 108 0c0-4.5-4-9-4-9z"
      />
    </svg>
  );
}

export function RouteDetailClient({
  route,
  onRouteChange,
  splitRoutes,
  onSplitRoutesChange,
  onSplitResult,
  renderMap,
  renderStats,
}: RouteDetailClientProps) {
  const t = useT();
  const [saved, setSaved] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [autoCenter, setAutoCenter] = useState(false);
  const [recording, setRecording] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [showComuni, setShowComuni] = useState(true);
  const [showFontane, setShowFontane] = useState(true);
  const [showComuniSearch, setShowComuniSearch] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
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

  const gpsChipLabel = (() => {
    const s = tracking && offRoute ? 'possibly-off-route' : gpsState;
    switch (s) {
      case 'gps-ok':
        return t('route.gps_ok');
      case 'gps-weak':
        return t('route.gps_weak');
      case 'gps-unavailable':
        return t('route.gps_unavailable');
      case 'possibly-off-route':
        return t('route.gps_off_route');
      default:
        return t('route.gps_default');
    }
  })();

  const gpsChipVariant: 'default' | 'success' | 'warning' | 'error' = (() => {
    const s = tracking && offRoute ? 'possibly-off-route' : gpsState;
    switch (s) {
      case 'gps-ok':
        return 'success';
      case 'gps-weak':
      case 'possibly-off-route':
        return 'warning';
      case 'gps-unavailable':
        return 'error';
      default:
        return 'default';
    }
  })();

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {renderMap?.(userPosition, mapState, showComuni, showFontane)}
      {tracking && offRoute && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-100 text-amber-800 text-sm text-center">
          {t('route.off_route')}
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
            {panelCollapsed ? t('route.show_controls') : t('route.hide_controls')}
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
          <div className="p-5 space-y-4 overflow-y-auto max-h-[35vh]">
            {tracking && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  {formatDistance(Math.max(0, distanceRemaining))} {t('route.remaining')}
                </span>
                <span className="font-medium text-slate-900">{progressPercent}%</span>
              </div>
            )}
            {renderStats}

            <div className="flex flex-wrap gap-2 items-center pt-1">
              <button
                type="button"
                onClick={() => setShowComuni((s) => !s)}
                aria-pressed={showComuni}
                aria-label={showComuni ? t('route.aria_layer_comuni_on') : t('route.aria_layer_comuni_off')}
                className={`inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border-2 transition-colors ${
                  showComuni ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <IconComuni />
              </button>
              <button
                type="button"
                onClick={() => setShowFontane((s) => !s)}
                aria-pressed={showFontane}
                aria-label={showFontane ? t('route.aria_layer_fontane_on') : t('route.aria_layer_fontane_off')}
                className={`inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border-2 transition-colors ${
                  showFontane ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <IconFontane />
              </button>
              <Chip variant={isOffline ? 'warning' : 'success'}>
                {isOffline ? t('route.offline') : t('route.online')}
              </Chip>
              <Chip variant={gpsChipVariant}>{gpsChipLabel}</Chip>
              {tracking && gpsState === 'gps-unavailable' && (
                <Button variant="ghost" size="md" onClick={() => window.location.reload()}>
                  {t('route.gps_retry')}
                </Button>
              )}
              {tracking && <Chip variant="success">{t('route.tracking_active')}</Chip>}
            </div>

            {onRouteChange && (
              <>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className="w-full flex items-center justify-between py-2 text-left font-medium text-slate-800 border-t border-slate-100 mt-2 pt-3"
                >
                  <span>{t('route.panel_advanced')}</span>
                  <svg
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {advancedOpen && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowComuniSearch((s) => !s)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                        showComuniSearch ? 'bg-sky-100 text-sky-800' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {t('route.search_comuni_toggle')}
                      <span className="float-right">{showComuniSearch ? '▼' : '▶'}</span>
                    </button>
                    {showComuniSearch && <ComuniSearch />}
                    <RouteTools
                      route={route}
                      onRouteChange={onRouteChange}
                      onSplitResult={(routes) => {
                        onSplitResult?.(routes);
                        onSplitRoutesChange?.(routes);
                      }}
                    />
                    {splitRoutes && (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={route.id === splitRoutes[0].id ? 'primary' : 'outline'}
                          size="md"
                          onClick={() => onRouteChange?.(splitRoutes[0])}
                        >
                          {t('route.part_one')}
                        </Button>
                        <Button
                          variant={route.id === splitRoutes[1].id ? 'primary' : 'outline'}
                          size="md"
                          onClick={() => onRouteChange?.(splitRoutes[1])}
                        >
                          {t('route.part_two')}
                        </Button>
                        <Button variant="ghost" size="md" onClick={() => onSplitRoutesChange?.(null)}>
                          {t('route.cancel')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-3">
              <Button variant="outline" size="md" fullWidth onClick={handleSaveOffline} disabled={saved}>
                {saved ? t('route.saved_offline') : t('route.save_offline')}
              </Button>
              <Button variant="outline" size="md" fullWidth onClick={handleRecordToggle}>
                {recording ? t('route.record_stop_export') : t('route.record_track')}
              </Button>
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="md" fullWidth>
                  {t('route.contact_whatsapp')}
                </Button>
              </a>
            </div>
          </div>
        )}
        <div className="px-5 pb-4 pt-2 border-t border-slate-100">
          <Button variant="primary" size="lg" fullWidth onClick={handleStartRoute}>
            {tracking ? t('route.stop_tracking') : t('route.start_route')}
          </Button>
        </div>
      </div>
    </div>
  );
}
