'use client';

import { useState, useEffect } from 'react';

export interface CurrentPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

/** One-time geolocation when entering a route - shows user on map without tracking. */
export function useCurrentPosition(enabled: boolean): CurrentPosition | null {
  const [position, setPosition] = useState<CurrentPosition | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return position;
}
