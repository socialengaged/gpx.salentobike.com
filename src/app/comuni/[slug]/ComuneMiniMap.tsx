'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lon: number;
  nome: string;
}

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
  ],
};

export function ComuneMiniMap({ lat, lon, nome }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: maplibregl.Map | undefined;

    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css');

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: OSM_STYLE,
        center: [lon, lat],
        zoom: 12,
        interactive: false,
      });

      new maplibregl.Marker({ color: '#0ea5e9' })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setText(nome))
        .addTo(map);
    })();

    return () => {
      map?.remove();
    };
  }, [lat, lon, nome]);

  return <div ref={containerRef} className="w-full h-full" />;
}
