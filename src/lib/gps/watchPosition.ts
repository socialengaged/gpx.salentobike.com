/**
 * Throttled geolocation watchPosition wrapper.
 * 1-2 sec update frequency for performance.
 */

import { getAccuracyState } from './accuracyScore';
import { filterGpsReading } from './gpsFilter';
import type { GpsAccuracyState } from './accuracyScore';

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
}

export interface WatchPositionOptions {
  throttleMs?: number;
  enableHighAccuracy?: boolean;
}

const DEFAULT_THROTTLE_MS = 1500;

let lastEmit = 0;
let lastPosition: GpsPosition | null = null;

export function watchPosition(
  onUpdate: (pos: GpsPosition, state: GpsAccuracyState) => void,
  onError?: (err: GeolocationPositionError) => void,
  options: WatchPositionOptions = {}
): number {
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS;
  const enableHighAccuracy = options.enableHighAccuracy ?? true;

  if (typeof window === 'undefined' || !navigator.geolocation) {
    return -1;
  }

  const handlePosition = (pos: GeolocationPosition) => {
    const reading = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };

    const gpsPos: GpsPosition = {
      ...reading,
      altitude: pos.coords.altitude,
    };

    if (!filterGpsReading(reading, lastPosition)) {
      return;
    }

    const now = Date.now();
    if (now - lastEmit < throttleMs) {
      return;
    }

    lastPosition = gpsPos;
    lastEmit = now;

    const state = getAccuracyState(gpsPos.accuracy);
    onUpdate(gpsPos, state);
  };

  const handleError = (err: GeolocationPositionError) => {
    onError?.(err);
    onUpdate(
      lastPosition ?? {
        lat: 0,
        lng: 0,
        accuracy: Infinity,
        altitude: null,
        timestamp: 0,
      },
      'unavailable'
    );
  };

  return navigator.geolocation.watchPosition(
    handlePosition,
    handleError,
    {
      enableHighAccuracy,
      maximumAge: 5000,
      timeout: 10000,
    }
  );
}

export function clearWatch(watchId: number): void {
  if (navigator.geolocation && watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
}
