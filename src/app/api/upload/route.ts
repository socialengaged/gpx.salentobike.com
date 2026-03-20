import { NextRequest, NextResponse } from 'next/server';
import {
  parseGpx,
  computeTotalDistance,
  computeElevationGain,
  computeElevationLoss,
  toGeoJsonLineString,
} from '@/lib/gpx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('gpx') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No GPX file' }, { status: 400 });
    }
    const text = await file.text();
    const parsed = parseGpx(text);
    const firstTrack = parsed.tracks[0] ?? parsed.routes[0];
    if (!firstTrack?.points?.length) {
      return NextResponse.json({ error: 'No track or route points in GPX' }, { status: 400 });
    }
    const distance = computeTotalDistance(firstTrack.points);
    const elevationGain = computeElevationGain(firstTrack.points);
    const elevationLoss = computeElevationLoss(firstTrack.points);
    const normalizedGeoJson = toGeoJsonLineString(firstTrack.points);
    const waypoints = parsed.waypoints.map((w, i) => ({
      id: `wpt-${i}`,
      name: `Waypoint ${i + 1}`,
      lat: w.lat,
      lng: w.lng,
      elevation: w.elevation,
    }));
    return NextResponse.json({
      normalizedGeoJson,
      waypoints,
      distanceMeters: distance,
      elevationGainMeters: elevationGain,
      elevationLossMeters: elevationLoss,
      trackName: firstTrack.name,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parse failed' },
      { status: 400 }
    );
  }
}
