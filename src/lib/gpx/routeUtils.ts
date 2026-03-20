/**
 * Route conversion utilities - GeoJSON to GpxPoint and back.
 */

import type { GpxPoint } from './parseGpx';
import type { Route } from '@/lib/routes/types';
import { toGeoJsonLineString } from './parseGpx';

export function routeToGpxPoints(route: Route): GpxPoint[] {
  const geo = route.normalizedGeoJson;
  const coords =
    geo.type === 'LineString'
      ? geo.coordinates
      : (geo as GeoJSON.MultiLineString).coordinates.flat();

  return coords.map((c) => ({
    lat: c[1],
    lng: c[0],
    elevation: c[2] as number | undefined,
  }));
}

export function gpxPointsToRoute(
  points: GpxPoint[],
  baseRoute: Route,
  overrides: Partial<Route>
): Route {
  return {
    ...baseRoute,
    ...overrides,
    normalizedGeoJson: toGeoJsonLineString(points),
  };
}
