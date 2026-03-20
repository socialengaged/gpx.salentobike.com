/**
 * Find nearest point on route and distance from route.
 */

export interface TrackPoint {
  lat: number;
  lng: number;
}

export interface NearestPointResult {
  index: number;
  distanceMeters: number;
  progressMeters: number;
  progressFraction: number;
}

const R = 6371000;

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
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversineMeters(py, px, y1, x1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projLng = x1 + t * dx;
  const projLat = y1 + t * dy;
  return haversineMeters(py, px, projLat, projLng);
}

function trackDistance(points: TrackPoint[]): number {
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

export function findNearestPoint(
  lat: number,
  lng: number,
  points: TrackPoint[]
): NearestPointResult | null {
  if (points.length < 2) return null;

  let bestIndex = 0;
  let bestDist = Infinity;
  let bestProgress = 0;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dist = pointToSegmentDistance(lng, lat, p1.lng, p1.lat, p2.lng, p2.lat);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i - 1;
      bestProgress = accumulated;
    }
    accumulated += haversineMeters(p1.lat, p1.lng, p2.lat, p2.lng);
  }

  const totalDist = trackDistance(points);
  return {
    index: bestIndex,
    distanceMeters: bestDist,
    progressMeters: bestProgress,
    progressFraction: totalDist > 0 ? bestProgress / totalDist : 0,
  };
}

export function coordsToTrackPoints(
  coords: GeoJSON.Position[]
): TrackPoint[] {
  return coords.map((c) => ({ lng: c[0], lat: c[1] }));
}
