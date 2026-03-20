/**
 * Split track at point index or percentage.
 */

import type { GpxPoint } from './parseGpx';
import { computeTotalDistance, computeElevationGain, computeElevationLoss } from './computeStats';

export interface SplitResult {
  part1: GpxPoint[];
  part2: GpxPoint[];
  stats1: { distanceMeters: number; elevationGainMeters: number; elevationLossMeters: number };
  stats2: { distanceMeters: number; elevationGainMeters: number; elevationLossMeters: number };
}

export function splitTrackAtIndex(points: GpxPoint[], index: number): SplitResult {
  if (index <= 0) {
    return {
      part1: [],
      part2: [...points],
      stats1: { distanceMeters: 0, elevationGainMeters: 0, elevationLossMeters: 0 },
      stats2: {
        distanceMeters: computeTotalDistance(points),
        elevationGainMeters: computeElevationGain(points),
        elevationLossMeters: computeElevationLoss(points),
      },
    };
  }
  if (index >= points.length) {
    return {
      part1: [...points],
      part2: [],
      stats1: {
        distanceMeters: computeTotalDistance(points),
        elevationGainMeters: computeElevationGain(points),
        elevationLossMeters: computeElevationLoss(points),
      },
      stats2: { distanceMeters: 0, elevationGainMeters: 0, elevationLossMeters: 0 },
    };
  };

  const part1 = points.slice(0, index + 1);
  const part2 = points.slice(index);

  return {
    part1,
    part2,
    stats1: {
      distanceMeters: computeTotalDistance(part1),
      elevationGainMeters: computeElevationGain(part1),
      elevationLossMeters: computeElevationLoss(part1),
    },
    stats2: {
      distanceMeters: computeTotalDistance(part2),
      elevationGainMeters: computeElevationGain(part2),
      elevationLossMeters: computeElevationLoss(part2),
    },
  };
}

export function splitTrackAtPercentage(points: GpxPoint[], percent: number): SplitResult {
  const clamped = Math.max(0, Math.min(100, percent));
  const totalDist = computeTotalDistance(points);
  const targetDist = (totalDist * clamped) / 100;

  let accumulated = 0;
  let index = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = haversineMeters(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
    accumulated += seg;
    if (accumulated >= targetDist) {
      index = i - 1;
      break;
    }
    index = i;
  }

  return splitTrackAtIndex(points, index);
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
