'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useMapContext } from './MapContext';
import type { Route } from '@/lib/routes/types';
import { routeToGpxPoints } from '@/lib/gpx';
import { simplifyTrack, toGeoJsonLineString } from '@/lib/gpx';

const SIMPLIFY_THRESHOLD = 500;
const SIMPLIFY_TOLERANCE_M = 5;

/** Colors for multi-stage routes (tappe) */
const STAGE_COLORS = [
  '#0ea5e9', // sky
  '#22c55e', // emerald
  '#eab308', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
];

interface RoutePolylineProps {
  route: Route;
}

export function RoutePolyline({ route }: RoutePolylineProps) {
  const { map, mapReady } = useMapContext();
  const addedRef = useRef(false);

  const { segments, isMulti } = useMemo(() => {
    const geo = route.normalizedGeoJson;
    if (geo.type === 'MultiLineString' && geo.coordinates.length > 1) {
      return {
        segments: geo.coordinates.map((coords) => ({
          type: 'LineString' as const,
          coordinates: coords,
        })),
        isMulti: true,
      };
    }
    const points = routeToGpxPoints(route);
    const simplified =
      points.length > SIMPLIFY_THRESHOLD
        ? simplifyTrack(points, SIMPLIFY_TOLERANCE_M)
        : points;
    return {
      segments: [toGeoJsonLineString(simplified)],
      isMulti: false,
    };
  }, [route.normalizedGeoJson, route?.id]);

  useEffect(() => {
    if (!map || !mapReady) return;

    const sourceIds: string[] = [];
    const layerIds: string[] = [];

    segments.forEach((geom, i) => {
      const sourceId = `route-polyline-${i}`;
      const layerId = `route-line-${i}`;
      sourceIds.push(sourceId);
      layerIds.push(layerId);

      const color = isMulti ? STAGE_COLORS[i % STAGE_COLORS.length] : '#0ea5e9';

      if (map.getSource(sourceId)) {
        const src = map.getSource(sourceId) as unknown as {
          setData: (d: GeoJSON.Feature) => void;
        };
        if (src?.setData) {
          src.setData({
            type: 'Feature',
            properties: {},
            geometry: geom,
          });
        }
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: geom,
          },
        });
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': 4,
          },
        });
      }
    });

    addedRef.current = true;

    return () => {
      layerIds.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      sourceIds.forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
      addedRef.current = false;
    };
  }, [map, mapReady, segments, isMulti]);

  return null;
}
