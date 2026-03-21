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

type ListRow = { label: string; value: number; hint: string };

function buildListRows(c: ComuneLite, L: SummaryLabels): ListRow[] {
  const rows: ListRow[] = [];
  if (c.txt_spec > 0)
    rows.push({ label: L.rowSpec, value: c.txt_spec, hint: L.hintSpec });
  if (c.txt_attr > 0)
    rows.push({ label: L.rowAttr, value: c.txt_attr, hint: L.hintAttr });
  const add = (label: string, v: number | null | undefined) => {
    if (v != null && v > 0) rows.push({ label, value: v, hint: L.hintOsm });
  };
  add(L.rowFontane, c.poi_fontane);
  add(L.rowRistoranti, c.poi_ristoranti);
  add(L.rowFarmacie, c.poi_farmacie);
  add(L.rowOspedali, c.poi_ospedali);
  add(L.rowBici, c.poi_bici);
  return rows;
}

function buildPopupHtml(c: ComuneLite, L: SummaryLabels): string {
  const badgeBase =
    'display:inline-flex;align-items:center;gap:3px;border-radius:6px;padding:2px 7px;font-size:12px;font-weight:500';
  const badges: string[] = [];
  if (c.hasRist)
    badges.push(
      `<span style="${badgeBase};background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0">${escapeHtml(L.cuisineBadge)}</span>`,
    );
  if (c.hasAttr)
    badges.push(
      `<span style="${badgeBase};background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe">${escapeHtml(L.attractionsBadge)}</span>`,
    );

  const listRows = buildListRows(c, L);
  const listHtml =
    listRows.length > 0
      ? `<ul style="margin:0 0 10px;padding:0;list-style:none;font-size:14px;line-height:1.35;max-height:min(38vh,220px);overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc">
${listRows
  .map(
    (r) =>
      `<li style="display:flex;justify-content:space-between;gap:8px;padding:8px 12px;border-bottom:1px solid #e2e8f0;align-items:baseline">
  <span style="color:#334155">${escapeHtml(r.label)}</span>
  <span style="font-weight:600;color:#0f172a;white-space:nowrap">${r.value} <span style="font-weight:400;color:#64748b;font-size:12px">(${escapeHtml(r.hint)})</span></span>
</li>`,
  )
  .join('')}
</ul>`
      : `<p style="margin:0 0 10px;font-size:14px;color:#64748b">${escapeHtml(L.noData)}</p>`;

  return `<div style="padding:10px 12px;max-width:300px;font-family:system-ui,sans-serif">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-weight:700;font-size:15px;color:#0f172a">${escapeHtml(c.nome)}</span>
      <span style="background:#f1f5f9;color:#64748b;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:600">${escapeHtml(c.prov)}</span>
    </div>
    ${badges.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${badges.join('')}</div>` : ''}
    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.03em">${escapeHtml(L.whatIsHere)}</p>
    ${listHtml}
    <a href="/comuni/${escapeHtml(c.slug)}" style="display:inline-flex;align-items:center;gap:4px;background:#0ea5e9;color:#fff;border-radius:6px;padding:6px 14px;font-size:14px;font-weight:600;text-decoration:none">${escapeHtml(L.fullCard)}</a>
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
      const popup = new maplibregl.Popup({ offset: 12, maxWidth: '320px', closeButton: true });
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
