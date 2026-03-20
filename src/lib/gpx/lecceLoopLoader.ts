/**
 * Load Lecce Loop - multi-stage route Lecce -> Martano -> Otranto.
 * Shows all main stages from lecce-loop.gpx.
 */

import { readFile } from 'fs/promises';
import path from 'path';
import {
  parseGpx,
  computeTotalDistance,
  computeElevationGain,
  computeElevationLoss,
  toGeoJsonCoordsWithElevation,
} from '@/lib/gpx';
import type { Route } from '@/lib/routes/types';

/** Lecce Loop stage names in order (Lecce -> Martano -> Otranto) */
const LECCE_LOOP_STAGES = [
  'Tappa 40 - Da Lecce a Martano 1 1',
  'Tappa 41 - Da Martano a Otranto',
  'Tappa 40 - Da Lecce a Martano 2',
  'variante per san foca',
  'Tappa 40 - Da Lecce a Martano 1 2',
  'variante torre orso otranto',
];

const STAGE_SET = new Set(LECCE_LOOP_STAGES);

export async function loadLecceLoop(): Promise<Route | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'mappe', 'lecce-loop.gpx');
    const content = await readFile(filePath, 'utf-8');
    const parsed = parseGpx(content);

    const loopTracks = parsed.tracks.filter(
      (t) => t.name && STAGE_SET.has(t.name)
    );

    if (loopTracks.length === 0) return null;

    const ordered = LECCE_LOOP_STAGES.filter((name) =>
      loopTracks.some((t) => t.name === name)
    ).map((name) => loopTracks.find((t) => t.name === name)!);

    const MAX_POINTS_PER_STAGE = 500;
    const coordinates = ordered.map((t) => {
      let pts = t.points;
      if (pts.length > MAX_POINTS_PER_STAGE) {
        const step = Math.ceil(pts.length / MAX_POINTS_PER_STAGE);
        pts = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
      }
      const coords = toGeoJsonCoordsWithElevation(pts);
      return coords as GeoJSON.Position[];
    });

    const allPoints = ordered.flatMap((t) => t.points);
    const distanceMeters = computeTotalDistance(allPoints);
    const elevationGainMeters = computeElevationGain(allPoints);
    const elevationLossMeters = computeElevationLoss(allPoints);

    return {
      id: 'gpx-lecce-loop',
      slug: 'lecce-loop',
      title: 'Lecce Loop',
      shortDescription: 'Lecce - Martano - Otranto, più tappe e varianti',
      language: 'it' as const,
      category: 'road' as const,
      distanceMeters,
      elevationGainMeters,
      elevationLossMeters,
      estimatedDuration:
        Math.round(distanceMeters / 200) + Math.round(elevationGainMeters / 10),
      difficulty: 'moderate' as const,
      normalizedGeoJson: {
        type: 'MultiLineString',
        coordinates,
      },
      waypoints: parsed.waypoints.map((w, i) => ({
        id: `wpt-${i}`,
        name: `Waypoint ${i + 1}`,
        lat: w.lat,
        lng: w.lng,
        elevation: w.elevation,
      })),
      published: true,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
