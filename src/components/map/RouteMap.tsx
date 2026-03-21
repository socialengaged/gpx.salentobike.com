'use client';

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapContext } from './MapContext';
import { ComuniLayer } from './ComuniLayer';
import { RoutePolyline } from './RoutePolyline';
import { UserLocationMarker } from './UserLocationMarker';
import { WaypointLayer } from './WaypointLayer';
import type { Route } from '@/lib/routes/types';

interface RouteMapProps {
  route: Route | null;
  userPosition?: { lat: number; lng: number; accuracy?: number } | null;
  className?: string;
  children?: React.ReactNode;
  showComuni?: boolean;
}

function getRouteBounds(route: Route): [[number, number], [number, number]] | null {
  const geo = route.normalizedGeoJson;
  const coords =
    geo.type === 'LineString'
      ? geo.coordinates
      : (geo as GeoJSON.MultiLineString).coordinates.flat();

  if (coords.length === 0) return null;

  const bounds = coords.reduce(
    (acc, coord) => {
      const lng = coord[0];
      const lat = coord[1];
      acc.minLng = Math.min(acc.minLng, lng);
      acc.maxLng = Math.max(acc.maxLng, lng);
      acc.minLat = Math.min(acc.minLat, lat);
      acc.maxLat = Math.max(acc.maxLat, lat);
      return acc;
    },
    { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
  );

  if (bounds.minLng > bounds.maxLng) return null;

  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
  ];
}

export function RouteMap({
  route,
  userPosition,
  className = '',
  children,
  showComuni = true,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current;

    const loadMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      const center: [number, number] = route
        ? (() => {
            const b = getRouteBounds(route);
            if (b)
              return [
                (b[0][0] + b[1][0]) / 2,
                (b[0][1] + b[1][1]) / 2,
              ];
            return [18.17, 40.35];
          })()
        : [18.17, 40.35];

      const mapInstance = new maplibregl.Map({
        container,
        style: {
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
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center,
        zoom: 12,
        maxZoom: 19,
        minZoom: 4,
        touchZoomRotate: true,
        dragRotate: false,
        pitchWithRotate: false,
      });

      mapInstanceRef.current = mapInstance;

      mapInstance.on('load', () => {
        setMap(mapInstance);
        setMapReady(true);
        if (route) {
          const b = getRouteBounds(route);
          if (b) {
            mapInstance.fitBounds(b, { padding: 48, maxZoom: 16 });
          }
        }
        resizeObserverRef.current = new ResizeObserver(() => {
          mapInstance.resize();
        });
        resizeObserverRef.current.observe(container);
        const doResize = () => mapInstance.resize();
        requestAnimationFrame(doResize);
        setTimeout(doResize, 100);
        setTimeout(doResize, 400);
      });
    };

    const rafId = requestAnimationFrame(() => {
      loadMap();
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMap(null);
      setMapReady(false);
    };
  }, [route?.id]);

  return (
    <div ref={mapRef} className={`w-full h-full min-h-[200px] ${className}`.trim()}>
      <MapContext.Provider value={{ map, mapReady }}>
        {route && <RoutePolyline route={route} />}
        {showComuni && <ComuniLayer />}
        {route?.waypoints && route.waypoints.length > 0 && (
          <WaypointLayer waypoints={route.waypoints} />
        )}
        {userPosition && mapReady && (
          <UserLocationMarker
            lat={userPosition.lat}
            lng={userPosition.lng}
            accuracy={userPosition.accuracy}
          />
        )}
        {mapReady && children}
      </MapContext.Provider>
    </div>
  );
}
