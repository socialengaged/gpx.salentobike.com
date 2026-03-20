/**
 * GPX track simplification for performance.
 * Douglas-Peucker algorithm.
 */

import type { GpxPoint } from './parseGpx';

const EARTH_RADIUS_M = 6371000;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function simplifyTrack(
  points: GpxPoint[],
  toleranceMeters: number
): GpxPoint[] {
  if (points.length <= 2) return points;

  const sqTolerance = toleranceMeters * toleranceMeters;

  function getSqSegDist(p: GpxPoint, p1: GpxPoint, p2: GpxPoint): number {
    const d = haversineMeters(p1.lat, p1.lng, p2.lat, p2.lng);
    if (d === 0) {
      const d2 = haversineMeters(p.lat, p.lng, p1.lat, p1.lng);
      return d2 * d2;
    }
    const t =
      ((p.lng - p1.lng) * (p2.lng - p1.lng) +
        (p.lat - p1.lat) * (p2.lat - p1.lat)) /
      (d * d);
    const clamped = Math.max(0, Math.min(1, t));
    const projLat = p1.lat + clamped * (p2.lat - p1.lat);
    const projLng = p1.lng + clamped * (p2.lng - p1.lng);
    const dist = haversineMeters(p.lat, p.lng, projLat, projLng);
    return dist * dist;
  }

  function simplifyStep(
    points: GpxPoint[],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: GpxPoint[]
  ): void {
    let maxSqDist = sqTolerance;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      simplifyStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      simplifyStep(points, index, last, sqTolerance, simplified);
    }
  }

  const simplified: GpxPoint[] = [points[0]];
  simplifyStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
}
