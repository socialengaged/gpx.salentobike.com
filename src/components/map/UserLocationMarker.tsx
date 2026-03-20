'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from './MapContext';

interface UserLocationMarkerProps {
  lat: number;
  lng: number;
  accuracy?: number;
}

const SOURCE_ID = 'user-location';
const LAYER_ID = 'user-location-circle';

export function UserLocationMarker({ lat, lng, accuracy = 20 }: UserLocationMarkerProps) {
  const { map, mapReady } = useMapContext();
  const prevPosRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !mapReady) return;

    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (prevPosRef.current === key) return;
    prevPosRef.current = key;

    const geoData = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat],
      },
      properties: {},
    };

    if (map.getSource(SOURCE_ID)) {
      const src = map.getSource(SOURCE_ID) as unknown as { setData: (d: GeoJSON.Feature) => void };
      if (src?.setData) src.setData(geoData);
      return;
    }

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geoData,
    });
    map.addLayer({
      id: LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 10,
        'circle-color': '#22c55e',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      prevPosRef.current = null;
    };
  }, [map, mapReady, lat, lng, accuracy]);

  return null;
}
