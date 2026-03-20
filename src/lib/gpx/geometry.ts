/**
 * GPX geometry utilities.
 * Distance, elevation, bounds, simplification.
 */

import type { GpxPoint } from './parser';

const EARTH_RADIUS_M = 6371000;

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function computeTotalDistance(points: GpxPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return total;
}

export function computeElevationGain(points: GpxPoint[]): number {
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].elevation ?? 0;
    const curr = points[i].elevation ?? 0;
    const diff = curr - prev;
    if (diff > 0) gain += diff;
  }
  return gain;
}

export function computeElevationLoss(points: GpxPoint[]): number {
  let loss = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].elevation ?? 0;
    const curr = points[i].elevation ?? 0;
    const diff = prev - curr;
    if (diff > 0) loss += diff;
  }
  return loss;
}

export function computeBounds(points: GpxPoint[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Douglas-Peucker simplification to reduce point count.
 */
export function simplifyPoints(
  points: GpxPoint[],
  toleranceMeters: number
): GpxPoint[] {
  if (points.length <= 2) return points;

  const sqTolerance = toleranceMeters * toleranceMeters;

  function getSqDist(p1: GpxPoint, p2: GpxPoint): number {
    const d = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    return d * d;
  }

  function getSqSegDist(p: GpxPoint, p1: GpxPoint, p2: GpxPoint): number {
    const d = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    if (d === 0) return getSqDist(p, p1);
    const t =
      ((p.lng - p1.lng) * (p2.lng - p1.lng) +
        (p.lat - p1.lat) * (p2.lat - p1.lat)) /
      (d * d);
    const clamped = Math.max(0, Math.min(1, t));
    const proj = {
      lat: p1.lat + clamped * (p2.lat - p1.lat),
      lng: p1.lng + clamped * (p2.lng - p1.lng),
    };
    return getSqDist(p, proj);
  }

  function simplifyDPStep(
    points: GpxPoint[],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: GpxPoint[]
  ): void {
    let maxSqDist = sqTolerance;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(
        points[i],
        points[first],
        points[last]
      );
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      simplifyDPStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }

  const simplified: GpxPoint[] = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
}

export function toGeoJsonLineString(points: GpxPoint[]): GeoJSON.LineString {
  return {
    type: 'LineString',
    coordinates: points.map((p) => [p.lng, p.lat] as [number, number]),
  };
}
