import { readFile } from 'fs/promises';
import path from 'path';
import {
  parseGpx,
  computeTotalDistance,
  computeElevationGain,
  computeElevationLoss,
  toGeoJsonLineStringWithElevation,
} from '@/lib/gpx';
import type { Route } from '@/lib/routes/types';
import { loadSouthFrancigena } from './southFrancigenaLoader';
import { loadLecceLoop } from './lecceLoopLoader';
import { loadNorthFrancigena } from './northFrancigenaLoader';
import { loadAllTracksFromFile } from './multiTrackLoader';

const ALLOWED_FILES = ['lecce-loop', 'lecce-otranto', 'otranto-leuca', 'jonio'];

const MULTI_TRACK_ROUTES: Record<string, { title: string; desc: string }> = {
  'lecce-otranto': { title: 'Lecce - Otranto', desc: 'Francigena 2, tutte le tracce' },
  'otranto-leuca': { title: 'Otranto - Leuca', desc: 'Francigena 3, tutte le tracce' },
  jonio: { title: 'Jonio', desc: 'Costa ionica, tutte le tracce' },
};

/** Load any GPX route by slug (including multi-stage routes) */
export async function loadRouteBySlug(slug: string): Promise<Route | null> {
  if (slug === 'south-francigena') return loadSouthFrancigena();
  if (slug === 'north-francigena') return loadNorthFrancigena();
  if (slug === 'lecce-loop') return loadLecceLoop();
  const multi = MULTI_TRACK_ROUTES[slug];
  if (multi) return loadAllTracksFromFile(slug, multi.title, multi.desc);
  return loadGpxRoute(slug);
}

export async function loadGpxRoute(slug: string): Promise<Route | null> {
  const base = slug.replace(/[^a-z0-9-]/gi, '');
  if (!ALLOWED_FILES.includes(base)) return null;

  try {
    const filePath = path.join(process.cwd(), 'public', 'mappe', `${base}.gpx`);
    const content = await readFile(filePath, 'utf-8');
    const parsed = parseGpx(content);

    const firstTrack = parsed.tracks[0] ?? parsed.routes[0];
    if (!firstTrack?.points?.length) return null;

    const distanceMeters = computeTotalDistance(firstTrack.points);
    const elevationGainMeters = computeElevationGain(firstTrack.points);
    const elevationLossMeters = computeElevationLoss(firstTrack.points);
    const normalizedGeoJson = toGeoJsonLineStringWithElevation(firstTrack.points);

    const waypoints = parsed.waypoints.map((w, i) => ({
      id: `wpt-${i}`,
      name: `Waypoint ${i + 1}`,
      lat: w.lat,
      lng: w.lng,
      elevation: w.elevation,
    }));

    return {
      id: `gpx-${base}`,
      slug: base,
      title: firstTrack.name || base.replace(/-/g, ' '),
      shortDescription: `Route da ${base.replace(/-/g, ' ')}`,
      language: 'en' as const,
      category: 'road' as const,
      distanceMeters,
      elevationGainMeters,
      elevationLossMeters,
      estimatedDuration:
        Math.round(distanceMeters / 200) + Math.round(elevationGainMeters / 10),
      difficulty: 'moderate' as const,
      normalizedGeoJson,
      waypoints,
      published: true,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
