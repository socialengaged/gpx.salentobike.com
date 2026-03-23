'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import { useLocale } from '@/i18n/useLocale';

const SOURCE_ID = 'fontane-puglia';
const LAYER_ID = 'fontane-puglia-circles';
const HIT_LAYER_ID = 'fontane-puglia-hit';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/** Visible radius: zoom 7→3, 10→6, 13+→10 */
function radiusInterpolate(): maplibregl.ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 7, 3, 10, 6, 13, 10];
}

/** Hit = visible + 8px */
function hitRadiusInterpolate(): maplibregl.ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 7, 11, 10, 14, 13, 18];
}

export function FontaneLayer() {
  const { t } = useLocale();
  const { map, mapReady } = useMapContext();
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const handlersRef = useRef<{
    onClick: (e: MapLayerMouseEvent) => void;
    onEnter: () => void;
    onLeave: () => void;
  } | null>(null);

  useEffect(() => {
    if (!map || !mapReady) return;

    let cancelled = false;

    (async () => {
      const res = await fetch('/data/fontane-puglia.json');
      if (!res.ok || cancelled) return;
      const points = (await res.json()) as { lat: number; lon: number }[];
      if (cancelled || !points.length) return;

      const maplibregl = (await import('maplibre-gl')).default;

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: points.map((p, i) => ({
          type: 'Feature' as const,
          id: i,
          geometry: {
            type: 'Point' as const,
            coordinates: [p.lon, p.lat],
          },
          properties: { lat: p.lat, lon: p.lon },
        })),
      };

      map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

      const beforeId = map.getLayer('route-line-0') ? 'route-line-0' : undefined;

      map.addLayer(
        {
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-radius': radiusInterpolate(),
            'circle-color': '#06b6d4',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
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

      popupRef.current?.remove();
      const popup = new maplibregl.Popup({ offset: 10, maxWidth: '260px', closeButton: true });
      popupRef.current = popup;

      const title = t('map.fontane_public');

      const onClick = (e: MapLayerMouseEvent) => {
        const lat = e.features?.[0]?.properties?.lat as number | undefined;
        const lon = e.features?.[0]?.properties?.lon as number | undefined;
        if (lat == null || lon == null) return;
        const html = `<div style="padding:8px 10px;font-family:system-ui,sans-serif;max-width:260px">
          <p style="margin:0;font-weight:600;font-size:14px;color:#0f172a">${escapeHtml(title)}</p>
          <p style="margin:6px 0 0;font-size:11px;color:#64748b">${escapeHtml(lat.toFixed(5))}, ${escapeHtml(lon.toFixed(5))}</p>
        </div>`;
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
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
      popupRef.current?.remove();
      popupRef.current = null;

      const h = handlersRef.current;
      if (h && map) {
        map.off('click', HIT_LAYER_ID, h.onClick);
        map.off('mouseenter', HIT_LAYER_ID, h.onEnter);
        map.off('mouseleave', HIT_LAYER_ID, h.onLeave);
      }
      handlersRef.current = null;

      [HIT_LAYER_ID, LAYER_ID].forEach((id) => {
        if (map?.getLayer(id)) map.removeLayer(id);
      });
      if (map?.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, mapReady, t]);

  return null;
}
