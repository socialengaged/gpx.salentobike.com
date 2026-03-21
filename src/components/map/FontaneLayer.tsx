'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';

const SOURCE_ID = 'fontane-puglia';
const LAYER_ID = 'fontane-puglia-circles';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function FontaneLayer() {
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
            'circle-radius': 5,
            'circle-color': '#38bdf8',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        },
        beforeId,
      );

      popupRef.current?.remove();
      const popup = new maplibregl.Popup({ offset: 10, maxWidth: '260px', closeButton: true });
      popupRef.current = popup;

      const onClick = (e: MapLayerMouseEvent) => {
        const lat = e.features?.[0]?.properties?.lat as number | undefined;
        const lon = e.features?.[0]?.properties?.lon as number | undefined;
        if (lat == null || lon == null) return;
        const html = `<div class="p-3 text-sm text-slate-700">
          <p class="font-semibold text-slate-900">Fontana pubblica</p>
          <p class="mt-1 text-xs text-slate-500">${escapeHtml(lat.toFixed(5))}, ${escapeHtml(lon.toFixed(5))}</p>
        </div>`;
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
      };

      const onEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
      };
      const onLeave = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('click', LAYER_ID, onClick);
      map.on('mouseenter', LAYER_ID, onEnter);
      map.on('mouseleave', LAYER_ID, onLeave);

      handlersRef.current = { onClick, onEnter, onLeave };
    })();

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      popupRef.current = null;

      const h = handlersRef.current;
      if (h && map) {
        map.off('click', LAYER_ID, h.onClick);
        map.off('mouseenter', LAYER_ID, h.onEnter);
        map.off('mouseleave', LAYER_ID, h.onLeave);
      }
      handlersRef.current = null;

      if (map?.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map?.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, mapReady]);

  return null;
}
