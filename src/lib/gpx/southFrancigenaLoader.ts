/**
 * Load South Francigena (Bari - Leuca) from Loreto full GPX + Otranto-Leuca.
 * Extracts Bari-to-Otranto from Loreto, then adds Otranto-Leuca from otranto-leuca.gpx.
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

/** Bari -> Otranto stage names (from Loreto full). Otranto-Leuca added from otranto-leuca.gpx */
const BARI_OTRANTO_STAGES = [
  '32 Bari - Mola di Bari',
  '33 Mola di Bari - Monopoli',
  '34 Monopoli - Savelletri',
  'Tappa 35 - Da Savelletri a Torre Canne',
  'Tappa 36 - Da Torre Canne a Torre Santa Sabina',
  'Tappa 38 - Da Serranova a Brindisi',
  'Tappa 39 - Da Brindisi a Torchiarolo',
  'Tappa 40 - Da Torchiarolo a Lecce',
  'Tappa 40 - Da Lecce a Martano',
  'Tappa 41 - Da Martano a Otranto',
];

const STAGE_SET = new Set(BARI_OTRANTO_STAGES);

export async function loadSouthFrancigena(): Promise<Route | null> {
  try {
    const mappeDir = path.join(process.cwd(), 'public', 'mappe');

    const loretoContent = await readFile(path.join(mappeDir, 'loreto-full.gpx'), 'utf-8');
    const loretoParsed = parseGpx(loretoContent);

    const bariOtrantoTracks = loretoParsed.tracks.filter(
      (t) => t.name && STAGE_SET.has(t.name)
    );

    if (bariOtrantoTracks.length === 0) return null;

    const orderedFromLoreto = BARI_OTRANTO_STAGES.filter((name) =>
      bariOtrantoTracks.some((t) => t.name === name)
    ).map((name) => bariOtrantoTracks.find((t) => t.name === name)!);

    const otrantoLeucaContent = await readFile(path.join(mappeDir, 'otranto-leuca.gpx'), 'utf-8');
    const otrantoLeucaParsed = parseGpx(otrantoLeucaContent);
    const otrantoLeucaTrack = otrantoLeucaParsed.tracks.find(
      (t) => t.name === 'FRANCIGENA 3 OTRANTO-LEUCA'
    );

    const allOrdered = otrantoLeucaTrack
      ? [...orderedFromLoreto, otrantoLeucaTrack]
      : orderedFromLoreto;

    const MAX_POINTS_PER_STAGE = 500;
    const coordinates = allOrdered.map((t) => {
      let pts = t.points;
      if (pts.length > MAX_POINTS_PER_STAGE) {
        const step = Math.ceil(pts.length / MAX_POINTS_PER_STAGE);
        pts = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
      }
      const coords = toGeoJsonCoordsWithElevation(pts);
      return coords as GeoJSON.Position[];
    });

    const allPoints = allOrdered.flatMap((t) => t.points);
    const distanceMeters = computeTotalDistance(allPoints);
    const elevationGainMeters = computeElevationGain(allPoints);
    const elevationLossMeters = computeElevationLoss(allPoints);

    return {
      id: 'gpx-south-francigena',
      slug: 'south-francigena',
      title: 'South Francigena',
      shortDescription: 'Bari - Santa Maria di Leuca, 12 tappe',
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
