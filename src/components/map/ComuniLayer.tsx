'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import { getComuneBySlug } from '@/lib/comuni/loader';

const SOURCE_ID = 'comuni-puglia';
const LAYER_ID = 'comuni-puglia-circles';

function truncate(text: string | null, maxLen: number): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen) + '…';
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function ComuniLayer() {
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
      const res = await fetch('/data/comuni-puglia-lite.json');
      if (!res.ok || cancelled) return;
      const lite = (await res.json()) as {
        istat: string;
        nome: string;
        slug: string;
        lat: number;
        lon: number;
      }[];
      if (cancelled) return;

      const maplibregl = (await import('maplibre-gl')).default;

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: lite.map((c) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [c.lon, c.lat],
          },
          properties: {
            istat: c.istat,
            nome: c.nome,
            slug: c.slug,
          },
        })),
      };

      if (cancelled) return;

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: geojson,
      });

      const beforeId = map.getLayer('route-line-0') ? 'route-line-0' : undefined;

      map.addLayer(
        {
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-radius': 6,
            'circle-color': '#0ea5e9',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95,
          },
        },
        beforeId
      );

      popupRef.current?.remove();
      const popup = new maplibregl.Popup({ offset: 12, maxWidth: 'min(320px, 90vw)' });
      popupRef.current = popup;

      const onClick = async (e: MapLayerMouseEvent) => {
        const f = e.features?.[0];
        const slug = f?.properties?.slug as string | undefined;
        if (!slug) return;

        const comune = await getComuneBySlug(slug);
        if (!comune) return;

        const intro = truncate(comune.improved_intro, 200);
        const attractions = truncate(comune.attractions_section, 150);
        const restaurants = truncate(comune.restaurants_section, 150);
        const parts = [intro, attractions, restaurants].filter(Boolean);
        const html = `
            <div class="p-3 text-sm text-slate-700 space-y-2 max-h-[40vh] overflow-y-auto">
              <h3 class="font-semibold text-slate-900 text-base">${escapeHtml(comune.nome)}</h3>
              ${parts.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
            </div>
          `;

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

      if (map?.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
      if (map?.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
    };
  }, [map, mapReady]);

  return null;
}
