'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useMapContext } from './MapContext';
import type { ComuneLite } from '@/lib/comuni/types';
import { useLocale } from '@/i18n/useLocale';
import { getSummaryLabels } from '@/lib/comuni/summaryLabels';
import type { SummaryLabels } from '@/lib/comuni/summaryLabels';

const SOURCE_ID = 'comuni-puglia';
const LAYER_ID = 'comuni-puglia-circles';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

const CHIP =
  'display:inline-flex;align-items:center;border-radius:4px;padding:2px 6px;background:#f1f5f9;font-size:13px;font-weight:600;color:#0f172a;margin:2px';

/** Compact cyclist-friendly popup: emoji + count only, ~100px height. */
function buildPopupHtml(c: ComuneLite, L: SummaryLabels): string {
  const chips: string[] = [];
  const add = (emoji: string, n: number | null | undefined) => {
    if (n != null && n > 0) chips.push(`<span style="${CHIP}">${emoji}${n}</span>`);
  };
  add('🚰', c.poi_fontane);
  add('🍴', c.poi_ristoranti);
  add('💊', c.poi_farmacie);
  add('🏥', c.poi_ospedali);
  add('🔧', c.poi_bici);
  add('🏛️', c.txt_attr);
  add('📋', c.txt_spec);

  const chipsRow =
    chips.length > 0
      ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin:6px 0 0;line-height:1.3">${chips.join('')}</div>`
      : `<p style="margin:6px 0 0;font-size:12px;color:#64748b">${escapeHtml(L.noData)}</p>`;

  return `<div style="padding:8px 10px;max-width:260px;font-family:system-ui,sans-serif">
    <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap">
      <span style="font-weight:700;font-size:15px;color:#0f172a;line-height:1.2">${escapeHtml(c.nome)}</span>
      <span style="background:#f1f5f9;color:#64748b;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:600">${escapeHtml(c.prov)}</span>
    </div>
    ${chipsRow}
    <a href="/comuni/${escapeHtml(c.slug)}" style="display:block;margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;color:#0284c7;font-size:13px;font-weight:600;text-decoration:none">${escapeHtml(L.popupMore)}</a>
  </div>`;
}

export function ComuniLayer() {
  const { locale } = useLocale();
  const { map, mapReady } = useMapContext();
  const popupRef = useRef<maplibregl.Popup | null>(null);
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
            slug: c.slug,
            nome: c.nome,
          },
        })),
      };

      if (cancelled) return;

      map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

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
        beforeId,
      );

      popupRef.current?.remove();
      const popup = new maplibregl.Popup({ offset: 12, maxWidth: '260px', closeButton: true });
      popupRef.current = popup;

      const onClick = (e: MapLayerMouseEvent) => {
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (!slug) return;
        const comune = comuniRef.current.get(slug);
        if (!comune) return;
        const labels = getSummaryLabels(locale);
        popup.setLngLat(e.lngLat).setHTML(buildPopupHtml(comune, labels)).addTo(map);
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
  }, [map, mapReady, locale]);

  return null;
}
