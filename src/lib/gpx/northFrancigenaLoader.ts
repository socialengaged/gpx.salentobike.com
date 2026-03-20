/**
 * Load North Francigena (Bari - Foggia) from Loreto full GPX.
 * Bari -> Bitonto -> Ruvo -> Corato -> Andria -> Canosa -> Cerignola -> Stornara -> Ordona -> Troia -> Celle San Vito
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

/** Bari -> Foggia stage names (Tappa 29 reversed: Bitonto-Bari -> Bari-Bitonto) */
const BARI_FOGGIA_STAGES = [
  'Tappa 29 - Da Bitonto a Bari',
  'Tappa 28 - Da Ruvo di Puglia a Bitonto',
  'Tappa 27 - Da Corato a Ruvo di Puglia',
  'Tappa 26 - Da Andria a Corato',
  'Cerignola - Canosa',
  'Tappa 23 - Da Stornara a Cerignola',
  'Tappa 20 - Da Ordona a Stornara',
  '23 Castelluccio dei Sauri - Ordona',
  '22 Troia - Castelluccio dei Sauri',
  '21 Celle San Vito - Troia',
];

const STAGE_SET = new Set(BARI_FOGGIA_STAGES);

export async function loadNorthFrancigena(): Promise<Route | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'mappe', 'loreto-full.gpx');
    const content = await readFile(filePath, 'utf-8');
    const parsed = parseGpx(content);

    const northTracks = parsed.tracks.filter(
      (t) => t.name && STAGE_SET.has(t.name)
    );

    if (northTracks.length === 0) return null;

    const ordered = BARI_FOGGIA_STAGES.filter((name) =>
      northTracks.some((t) => t.name === name)
    ).map((name) => northTracks.find((t) => t.name === name)!);

    const MAX_POINTS_PER_STAGE = 500;
    const coordinates = ordered.map((t, idx) => {
      let pts = t.points;
      if (idx === 0) pts = [...pts].reverse();
      if (pts.length > MAX_POINTS_PER_STAGE) {
        const step = Math.ceil(pts.length / MAX_POINTS_PER_STAGE);
        pts = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
      }
      const coords = toGeoJsonCoordsWithElevation(pts);
      return coords as GeoJSON.Position[];
    });

    const allPoints = ordered.flatMap((t, idx) =>
      idx === 0 ? [...t.points].reverse() : t.points
    );
    const distanceMeters = computeTotalDistance(allPoints);
    const elevationGainMeters = computeElevationGain(allPoints);
    const elevationLossMeters = computeElevationLoss(allPoints);

    return {
      id: 'gpx-north-francigena',
      slug: 'north-francigena',
      title: 'North Francigena',
      shortDescription: 'Bari - Foggia, 10 tappe',
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
      waypoints: [],
      published: true,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
