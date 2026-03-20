/**
 * Geolocation watcher wrapper.
 * Handles permission, accuracy, noise filtering, and impossible jumps.
 */

export type GpsStatus = 'ok' | 'weak' | 'unavailable';

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
}

export interface GpsWatcherOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  /** Meters - reject positions that jump more than this */
  maxJumpMeters?: number;
  /** Minimum accuracy in meters to consider "ok" */
  goodAccuracyMeters?: number;
}

const EARTH_RADIUS_M = 6371000;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class GpsWatcher {
  private watchId: number | null = null;
  private lastPosition: GpsPosition | null = null;
  private options: Required<GpsWatcherOptions>;
  private listeners: Set<(pos: GpsPosition, status: GpsStatus) => void> =
    new Set();

  constructor(options: GpsWatcherOptions = {}) {
    this.options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
      maxJumpMeters: 500,
      goodAccuracyMeters: 20,
      ...options,
    };
  }

  start(): void {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (this.watchId != null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePosition(pos),
      (err) => this.handleError(err),
      {
        enableHighAccuracy: this.options.enableHighAccuracy,
        maximumAge: this.options.maximumAge,
        timeout: this.options.timeout,
      }
    );
  }

  stop(): void {
    if (this.watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.lastPosition = null;
  }

  subscribe(listener: (pos: GpsPosition, status: GpsStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getLastPosition(): GpsPosition | null {
    return this.lastPosition;
  }

  private handlePosition(pos: GeolocationPosition): void {
    const gpsPos: GpsPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      timestamp: pos.timestamp,
    };

    if (this.lastPosition) {
      const dist = haversineMeters(
        this.lastPosition.lat,
        this.lastPosition.lng,
        gpsPos.lat,
        gpsPos.lng
      );
      if (dist > this.options.maxJumpMeters) {
        return;
      }
    }

    this.lastPosition = gpsPos;
    const status: GpsStatus =
      gpsPos.accuracy <= this.options.goodAccuracyMeters
        ? 'ok'
        : gpsPos.accuracy <= 100
          ? 'weak'
          : 'weak';

    this.listeners.forEach((fn) => fn(gpsPos, status));
  }

  private handleError(_err: GeolocationPositionError): void {
    this.listeners.forEach((fn) =>
      fn(
        this.lastPosition ?? {
          lat: 0,
          lng: 0,
          accuracy: Infinity,
          altitude: null,
          timestamp: 0,
        },
        'unavailable'
      )
    );
  }
}
