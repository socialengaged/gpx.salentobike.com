/**
 * GPX parser utilities.
 * Safely parses GPX XML and extracts track/route data.
 */

export interface GpxPoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
}

export interface GpxTrack {
  name?: string;
  points: GpxPoint[];
}

export interface GpxParseResult {
  tracks: GpxTrack[];
  routes: GpxTrack[];
  waypoints: GpxPoint[];
}

function parseFloatSafe(val: string | null | undefined): number {
  if (val == null || val === '') return 0;
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : 0;
}

function extractPoints(parent: Element, tagName: string): GpxPoint[] {
  const points: GpxPoint[] = [];
  const elements = parent.getElementsByTagName(tagName);

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const lat = parseFloatSafe(el.getAttribute('lat'));
    const lon = parseFloatSafe(el.getAttribute('lon'));
    if (lat === 0 && lon === 0) continue;

    const eleEl = el.getElementsByTagName('ele')[0];
    const timeEl = el.getElementsByTagName('time')[0];

    points.push({
      lat,
      lng: lon,
      elevation: eleEl ? parseFloatSafe(eleEl.textContent) : undefined,
      time: timeEl?.textContent?.trim() || undefined,
    });
  }
  return points;
}

export function parseGpx(xmlString: string): GpxParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid GPX XML');
  }

  const result: GpxParseResult = {
    tracks: [],
    routes: [],
    waypoints: [],
  };

  const trkElements = doc.getElementsByTagName('trk');
  for (let i = 0; i < trkElements.length; i++) {
    const trk = trkElements[i];
    const nameEl = trk.getElementsByTagName('name')[0];
    const seg = trk.getElementsByTagName('trkseg')[0];
    const points = seg ? extractPoints(seg, 'trkpt') : [];
    if (points.length > 0) {
      result.tracks.push({
        name: nameEl?.textContent?.trim(),
        points,
      });
    }
  }

  const rteElements = doc.getElementsByTagName('rte');
  for (let i = 0; i < rteElements.length; i++) {
    const rte = rteElements[i];
    const nameEl = rte.getElementsByTagName('name')[0];
    const points = extractPoints(rte, 'rtept');
    if (points.length > 0) {
      result.routes.push({
        name: nameEl?.textContent?.trim(),
        points,
      });
    }
  }

  const wptElements = doc.getElementsByTagName('wpt');
  for (let i = 0; i < wptElements.length; i++) {
    const wpt = wptElements[i];
    const lat = parseFloatSafe(wpt.getAttribute('lat'));
    const lon = parseFloatSafe(wpt.getAttribute('lon'));
    if (lat !== 0 || lon !== 0) {
      const eleEl = wpt.getElementsByTagName('ele')[0];
      const nameEl = wpt.getElementsByTagName('name')[0];
      result.waypoints.push({
        lat,
        lng: lon,
        elevation: eleEl ? parseFloatSafe(eleEl.textContent) : undefined,
      });
    }
  }

  return result;
}
