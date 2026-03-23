/**
 * Split route geometry into segments with per-segment stats from GPX coordinates.
 */

import type { GpxPoint } from './parseGpx';
import type { Route } from '@/lib/routes/types';
import { computeElevationGain, computeElevationLoss, computeTotalDistance } from './computeStats';
import { routeToGpxPoints } from './routeUtils';
import { toGeoJsonLineString } from './parseGpx';
import { simplifyTrack } from './simplifyTrack';

const SIMPLIFY_THRESHOLD = 500;
const SIMPLIFY_TOLERANCE_M = 5;

export interface RouteSegmentWithStats {
  geometry: GeoJSON.LineString;
  /** 0-based index */
  segmentIndex: number;
  totalSegments: number;
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  pointCount: number;
}

function pointsFromLineCoords(coords: number[][]): GpxPoint[] {
  return coords.map((c) => ({
    lat: c[1],
    lng: c[0],
    elevation: c.length > 2 ? (c[2] as number) : undefined,
  }));
}

export function getRouteSegmentsWithStats(route: Route): RouteSegmentWithStats[] {
  const geo = route.normalizedGeoJson;

  if (geo.type === 'MultiLineString' && geo.coordinates.length > 0) {
    const total = geo.coordinates.length;
    return geo.coordinates.map((coords, i) => {
      const pts = pointsFromLineCoords(coords);
      return {
        geometry: { type: 'LineString', coordinates: coords },
        segmentIndex: i,
        totalSegments: total,
        distanceMeters: computeTotalDistance(pts),
        elevationGainMeters: computeElevationGain(pts),
        elevationLossMeters: computeElevationLoss(pts),
        pointCount: pts.length,
      };
    });
  }

  const points = routeToGpxPoints(route);
  const simplified =
    points.length > SIMPLIFY_THRESHOLD ? simplifyTrack(points, SIMPLIFY_TOLERANCE_M) : points;
  const lineString = toGeoJsonLineString(simplified);

  return [
    {
      geometry: lineString,
      segmentIndex: 0,
      totalSegments: 1,
      distanceMeters: computeTotalDistance(simplified),
      elevationGainMeters: computeElevationGain(simplified),
      elevationLossMeters: computeElevationLoss(simplified),
      pointCount: simplified.length,
    },
  ];
}
