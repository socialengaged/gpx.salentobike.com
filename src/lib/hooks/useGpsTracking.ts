'use client';

import { useState, useEffect, useRef } from 'react';
import { watchPosition, clearWatch } from '@/lib/gps/watchPosition';
import { findNearestPoint, coordsToTrackPoints } from '@/lib/gpx/nearestPoint';
import { createOffRouteDetector } from '@/lib/gpx/offRoute';
import type { Route } from '@/lib/routes/types';
import type { GpsPosition } from '@/lib/gps/watchPosition';

export type TrackingState =
  | 'idle'
  | 'gps-ok'
  | 'gps-weak'
  | 'gps-unavailable'
  | 'possibly-off-route';

export function useGpsTracking(route: Route | null, active: boolean) {
  const [state, setState] = useState<TrackingState>('idle');
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [progressFraction, setProgressFraction] = useState(0);
  const [offRoute, setOffRoute] = useState(false);
  const watchIdRef = useRef<number>(-1);
  const offRouteDetectorRef = useRef(createOffRouteDetector());

  const points = route
    ? coordsToTrackPoints(
        route.normalizedGeoJson.type === 'LineString'
          ? route.normalizedGeoJson.coordinates
          : (route.normalizedGeoJson as GeoJSON.MultiLineString).coordinates.flat()
      )
    : [];

  useEffect(() => {
    if (!active || points.length < 2) {
      setState('idle');
      setPosition(null);
      setOffRoute(false);
      offRouteDetectorRef.current.reset();
      if (watchIdRef.current >= 0) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = -1;
      }
      return;
    }

    const detector = offRouteDetectorRef.current;

    watchIdRef.current = watchPosition(
      (pos, accuracyState) => {
        setPosition(pos);
        setState(
          accuracyState === 'unavailable'
            ? 'gps-unavailable'
            : accuracyState === 'ok'
              ? 'gps-ok'
              : 'gps-weak'
        );

        const nearest = findNearestPoint(pos.lat, pos.lng, points);
        if (nearest) {
          setProgressFraction(nearest.progressFraction);
          const { isOffRoute } = detector.check(pos.lat, pos.lng, points);
          setOffRoute(isOffRoute);
        }
      },
      () => setState('gps-unavailable')
    );

    return () => {
      if (watchIdRef.current >= 0) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = -1;
      }
      detector.reset();
    };
  }, [active, route?.id, points.length]);

  return {
    state,
    position,
    progressFraction,
    offRoute,
  };
}
