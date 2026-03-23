'use client';

import { useEffect, useState } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import { isClickOnRouteHit } from './mapHitUtils';
import type { RouteWaypoint, WaypointType } from '@/lib/routes/types';

const TYPE_COLORS: Record<WaypointType | 'default', string> = {
  default: '#0ea5e9',
  water: '#0ea5e9',
  food: '#f59e0b',
  repair: '#ef4444',
  view: '#22c55e',
};

interface WaypointLayerProps {
  waypoints: RouteWaypoint[];
}

export function WaypointLayer({ waypoints }: WaypointLayerProps) {
  const { map, mapReady } = useMapContext();
  const [popup, setPopup] = useState<RouteWaypoint | null>(null);

  useEffect(() => {
    if (!map || !mapReady || waypoints.length === 0) return;

    const sources: string[] = [];
    const layers: string[] = [];
    const listeners: Array<(e: MapLayerMouseEvent) => void> = [];

    waypoints.forEach((wp, i) => {
      const sourceId = `waypoint-${wp.id}`;
      const layerId = `waypoint-layer-${wp.id}`;

      if (map.getSource(sourceId)) return;

      const color =
        i === 0
          ? '#22c55e'
          : i === waypoints.length - 1
            ? '#ef4444'
            : TYPE_COLORS[wp.type ?? 'default'];

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [wp.lng, wp.lat],
          },
          properties: { name: wp.name },
        },
      });
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 10,
          'circle-color': color,
        },
      });

      const handler = (e: MapLayerMouseEvent) => {
        if (isClickOnRouteHit(map, e.point)) return;
        setPopup(wp);
      };
      map.on('click', layerId, handler);
      listeners.push(handler);

      map.getCanvas().style.cursor = 'pointer';

      sources.push(sourceId);
      layers.push(layerId);
    });

    return () => {
      layers.forEach((id, i) => {
        map.off('click', id, listeners[i]);
        if (map.getLayer(id)) map.removeLayer(id);
      });
      sources.forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map, mapReady, waypoints]);

  if (!popup) return null;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-20 p-3 bg-white rounded-lg shadow-lg border border-slate-200">
      <div className="font-semibold text-slate-900">{popup.name}</div>
      {popup.description && (
        <div className="text-sm text-slate-600 mt-1">{popup.description}</div>
      )}
      {popup.type && popup.type !== 'default' && (
        <span className="text-xs text-slate-500 capitalize">{popup.type}</span>
      )}
      <button
        type="button"
        onClick={() => setPopup(null)}
        className="mt-2 text-sm text-sky-600"
      >
        Close
      </button>
    </div>
  );
}
