/**
 * Reverse track - flip coordinate order, swap elevation gain/loss.
 */

import type { GpxPoint } from './parseGpx';
import { toGeoJsonLineString } from './parseGpx';
import { computeTotalDistance, computeElevationGain, computeElevationLoss } from './computeStats';

export function reverseTrack(points: GpxPoint[]): GpxPoint[] {
  if (points.length <= 1) return [...points];
  return [...points].reverse();
}

export function reverseTrackToGeoJson(points: GpxPoint[]): GeoJSON.LineString {
  return toGeoJsonLineString(reverseTrack(points));
}

export function computeReversedStats(points: GpxPoint[]): {
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
} {
  const reversed = reverseTrack(points);
  return {
    distanceMeters: computeTotalDistance(reversed),
    elevationGainMeters: computeElevationLoss(points),
    elevationLossMeters: computeElevationGain(points),
  };
}
