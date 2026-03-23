'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import type { Route } from '@/lib/routes/types';
import { getRouteSegmentsWithStats, type RouteSegmentWithStats } from '@/lib/gpx';

/** Colors for multi-stage routes (tappe) */
const STAGE_COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#ec4899',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

const LINE_WIDTH = 6;
/** Wide tap target for mobile; must stay queryable (opacity > 0). */
const HIT_WIDTH = 36;

interface RoutePolylineProps {
  route: Route;
  onSegmentSelect?: (info: RouteSegmentWithStats | null) => void;
}

export function RoutePolyline({ route, onSegmentSelect }: RoutePolylineProps) {
  const { map, mapReady } = useMapContext();
  const onSelectRef = useRef<RoutePolylineProps['onSegmentSelect']>(onSegmentSelect);
  onSelectRef.current = onSegmentSelect;

  const segments = useMemo(() => getRouteSegmentsWithStats(route), [route.normalizedGeoJson, route.id]);

  const isMulti = segments.length > 1;

  useEffect(() => {
    if (!map || !mapReady) return;

    const sourceIds: string[] = [];
    const layerIds: string[] = [];

    segments.forEach((seg, i) => {
      const sourceId = `route-polyline-${i}`;
      const layerId = `route-line-${i}`;
      const hitLayerId = `route-hit-${i}`;
      sourceIds.push(sourceId);
      layerIds.push(layerId, hitLayerId);

      const color = isMulti ? STAGE_COLORS[i % STAGE_COLORS.length] : '#0ea5e9';

      const feature: GeoJSON.Feature = {
        type: 'Feature',
        properties: {
          segmentIndex: seg.segmentIndex,
          totalSegments: seg.totalSegments,
          distanceMeters: Math.round(seg.distanceMeters),
          elevationGainMeters: Math.round(seg.elevationGainMeters),
          elevationLossMeters: Math.round(seg.elevationLossMeters),
          pointCount: seg.pointCount,
        },
        geometry: seg.geometry,
      };

      if (map.getSource(sourceId)) {
        const src = map.getSource(sourceId) as unknown as {
          setData: (d: GeoJSON.Feature) => void;
        };
        src?.setData?.(feature);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: feature,
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
            'line-width': LINE_WIDTH,
          },
        });

        map.addLayer({
          id: hitLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#000000',
            'line-width': HIT_WIDTH,
            'line-opacity': 0.06,
          },
        });
      }
    });

    const hitLayerIds = segments.map((_, i) => `route-hit-${i}`);

    const pickSegment = (e: MapLayerMouseEvent): RouteSegmentWithStats | null => {
      const slug = e.features?.[0]?.properties;
      if (!slug) return null;
      const si = Number(slug.segmentIndex);
      const seg = segments[si];
      if (!seg) return null;
      return seg;
    };

    const onHitClick = (e: MapLayerMouseEvent) => {
      const info = pickSegment(e);
      if (info) onSelectRef.current?.(info);
    };

    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    hitLayerIds.forEach((hid) => {
      map.on('click', hid, onHitClick);
      map.on('mouseenter', hid, onEnter);
      map.on('mouseleave', hid, onLeave);
    });

    return () => {
      hitLayerIds.forEach((hid) => {
        map.off('click', hid, onHitClick);
        map.off('mouseenter', hid, onEnter);
        map.off('mouseleave', hid, onLeave);
      });

      layerIds.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      sourceIds.forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map, mapReady, segments, isMulti]);

  return null;
}
