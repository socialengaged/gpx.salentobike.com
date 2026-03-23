'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import { isClickOnRouteHit } from './mapHitUtils';
import type { ComuneLite } from '@/lib/comuni/types';

const SOURCE_ID = 'comuni-puglia';
const LAYER_ID = 'comuni-puglia-circles';
const HIT_LAYER_ID = 'comuni-puglia-hit';
const LABEL_LAYER_ID = 'comuni-puglia-labels';

/** Labels only from this zoom — less symbol collision work at mid zoom. */
const MIN_ZOOM_COMUNE_LABELS = 11;

function radiusInterpolate(): maplibregl.ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 7, 8, 9, 13, 11, 18, 13, 24];
}

/** Hit area = visible + margin for touch (must stay above route hit priority guard). */
function hitRadiusInterpolate(): maplibregl.ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 7, 20, 9, 26, 11, 30, 13, 34];
}

export interface ComuniLayerProps {
  selectedSlug?: string | null;
  onComuneSelect?: (comune: ComuneLite | null) => void;
}

export function ComuniLayer({ selectedSlug = null, onComuneSelect }: ComuniLayerProps) {
  const { map, mapReady } = useMapContext();
  const onSelectRef = useRef<ComuniLayerProps['onComuneSelect']>(onComuneSelect);
  onSelectRef.current = onComuneSelect;
  const comuniRef = useRef<Map<string, ComuneLite>>(new Map());
  const handlersRef = useRef<{
    onClick: (e: MapLayerMouseEvent) => void;
    onEnter: () => void;
    onLeave: () => void;
  } | null>(null);

  useEffect(() => {
    if (!map || !mapReady) return;

    let cancelled = false;

    (async () => {
      const res = await fetch('/data/comuni-puglia-lite.json');
      if (!res.ok || cancelled) return;
      const lite = (await res.json()) as ComuneLite[];
      if (cancelled) return;

      const lookup = new Map<string, ComuneLite>();
      for (const c of lite) lookup.set(c.slug, c);
      comuniRef.current = lookup;

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: lite.map((c) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [c.lon, c.lat],
          },
          properties: {
            slug: c.slug,
            nome: c.nome,
          },
        })),
      };

      if (cancelled) return;

      map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

      const beforeId = map.getLayer('route-line-0') ? 'route-line-0' : undefined;

      const baseCirclePaint: maplibregl.CircleLayerSpecification['paint'] = {
        'circle-radius': radiusInterpolate(),
        'circle-color': '#0ea5e9',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.95,
      };

      map.addLayer(
        {
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: baseCirclePaint,
        },
        beforeId,
      );

      map.addLayer(
        {
          id: LABEL_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          minzoom: MIN_ZOOM_COMUNE_LABELS,
          layout: {
            'text-field': ['get', 'nome'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 11, 13, 12, 15, 14, 18],
            'text-offset': [0, 1.65],
            'text-anchor': 'top',
            'text-max-width': 12,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'text-optional': true,
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        },
        beforeId,
      );

      map.addLayer(
        {
          id: HIT_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-radius': hitRadiusInterpolate(),
            'circle-color': '#000000',
            'circle-opacity': 0,
            'circle-stroke-width': 0,
          },
        },
        beforeId,
      );

      const onClick = (e: MapLayerMouseEvent) => {
        if (isClickOnRouteHit(map, e.point)) return;
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (!slug) return;
        const comune = comuniRef.current.get(slug);
        if (!comune) return;
        onSelectRef.current?.(comune);
        const z = map.getZoom();
        map.flyTo({
          center: [comune.lon, comune.lat],
          zoom: Math.max(z, 12),
          duration: 550,
        });
      };

      const onEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
      };
      const onLeave = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('click', HIT_LAYER_ID, onClick);
      map.on('mouseenter', HIT_LAYER_ID, onEnter);
      map.on('mouseleave', HIT_LAYER_ID, onLeave);

      handlersRef.current = { onClick, onEnter, onLeave };
    })();

    return () => {
      cancelled = true;

      const h = handlersRef.current;
      if (h && map) {
        map.off('click', HIT_LAYER_ID, h.onClick);
        map.off('mouseenter', HIT_LAYER_ID, h.onEnter);
        map.off('mouseleave', HIT_LAYER_ID, h.onLeave);
      }
      handlersRef.current = null;

      [HIT_LAYER_ID, LABEL_LAYER_ID, LAYER_ID].forEach((id) => {
        if (map?.getLayer(id)) map.removeLayer(id);
      });
      if (map?.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, mapReady]);

  useEffect(() => {
    if (!map || !map.getLayer(LAYER_ID)) return;
    const sel = selectedSlug ?? '';
    map.setPaintProperty(LAYER_ID, 'circle-color', [
      'case',
      ['==', ['get', 'slug'], sel],
      '#0369a1',
      '#0ea5e9',
    ] as maplibregl.ExpressionSpecification);
  }, [map, selectedSlug]);

  return null;
}
