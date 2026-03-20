/**
 * Merge multiple tracks into one.
 * Handles gaps by connecting endpoints.
 */

import type { GpxPoint } from './parseGpx';
import { computeTotalDistance, computeElevationGain, computeElevationLoss } from './computeStats';

export function mergeTracks(tracks: GpxPoint[][]): GpxPoint[] {
  if (tracks.length === 0) return [];
  if (tracks.length === 1) return [...tracks[0]];

  const merged: GpxPoint[] = [];
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.length === 0) continue;

    const startIdx = (() => {
      if (merged.length === 0) return 0;
      const last = merged[merged.length - 1];
      const first = track[0];
      const dist = haversineMeters(last.lat, last.lng, first.lat, first.lng);
      return dist < 0.1 ? 1 : 0;
    })();

    for (let j = startIdx; j < track.length; j++) {
      merged.push(track[j]);
    }
  }

  return merged;
}

export function mergeTracksStats(points: GpxPoint[]): {
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
} {
  return {
    distanceMeters: computeTotalDistance(points),
    elevationGainMeters: computeElevationGain(points),
    elevationLossMeters: computeElevationLoss(points),
  };
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
