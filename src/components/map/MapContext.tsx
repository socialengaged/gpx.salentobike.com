'use client';

import { createContext, useContext } from 'react';
import type { Map } from 'maplibre-gl';

export interface MapContextValue {
  map: Map | null;
  mapReady: boolean;
}

export const MapContext = createContext<MapContextValue>({
  map: null,
  mapReady: false,
});

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  return ctx;
}
