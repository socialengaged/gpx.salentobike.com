/**
 * GPX stats - distance, elevation, bounding box.
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

export function computeTotalDistance(points: GpxPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(
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
    if (curr > prev) gain += curr - prev;
  }
  return gain;
}

export function computeElevationLoss(points: GpxPoint[]): number {
  let loss = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].elevation ?? 0;
    const curr = points[i].elevation ?? 0;
    if (prev > curr) loss += prev - curr;
  }
  return loss;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Sampled elevation profile for chart - max 80 points for performance */
export function computeElevationProfile(
  points: GpxPoint[],
  maxSamples = 80
): { distKm: number; eleM: number }[] {
  if (points.length < 2) return [];
  let dist = 0;
  const profile: { distKm: number; eleM: number }[] = [{ distKm: 0, eleM: points[0].elevation ?? 0 }];
  const step = Math.max(1, Math.floor(points.length / maxSamples));
  for (let i = 1; i < points.length; i++) {
    dist += haversineMeters(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
    if (i % step === 0 || i === points.length - 1) {
      profile.push({ distKm: dist / 1000, eleM: points[i].elevation ?? 0 });
    }
  }
  return profile;
}

/** Max gradient % over ~100m segments */
export function computeMaxGradient(points: GpxPoint[]): number {
  if (points.length < 2) return 0;
  let max = 0;
  let segDist = 0;
  let segGain = 0;
  const segLen = 100;
  for (let i = 1; i < points.length; i++) {
    const d = haversineMeters(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
    const prevEle = points[i - 1].elevation ?? 0;
    const currEle = points[i].elevation ?? 0;
    segDist += d;
    segGain += Math.max(0, currEle - prevEle);
    if (segDist >= segLen) {
      const pct = segDist > 0 ? (segGain / segDist) * 100 : 0;
      max = Math.max(max, pct);
      segDist = 0;
      segGain = 0;
    }
  }
  return Math.round(max * 10) / 10;
}

export function computeBounds(points: GpxPoint[]): BoundingBox {
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
