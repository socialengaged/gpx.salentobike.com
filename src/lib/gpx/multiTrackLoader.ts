/**
 * Generic loader for GPX files with multiple tracks.
 * Loads ALL tracks from the file as MultiLineString.
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

const MAX_POINTS_PER_TRACK = 500;

export async function loadAllTracksFromFile(
  slug: string,
  title: string,
  shortDescription: string
): Promise<Route | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'mappe', `${slug}.gpx`);
    const content = await readFile(filePath, 'utf-8');
    const parsed = parseGpx(content);

    const tracks = parsed.tracks;
    if (!tracks.length) return null;

    const coordinates = tracks.map((t) => {
      let pts = t.points;
      if (pts.length > MAX_POINTS_PER_TRACK) {
        const step = Math.ceil(pts.length / MAX_POINTS_PER_TRACK);
        pts = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
      }
      const coords = toGeoJsonCoordsWithElevation(pts);
      return coords as GeoJSON.Position[];
    });

    const allPoints = tracks.flatMap((t) => t.points);
    const distanceMeters = computeTotalDistance(allPoints);
    const elevationGainMeters = computeElevationGain(allPoints);
    const elevationLossMeters = computeElevationLoss(allPoints);

    return {
      id: `gpx-${slug}`,
      slug,
      title,
      shortDescription,
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
