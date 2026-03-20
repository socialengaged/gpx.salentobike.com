/**
 * GPX parsing - safely parse GPX XML and extract coordinates.
 * Handles invalid GPX, empty tracks, and large files.
 * Uses @xmldom/xmldom in Node.js (DOMParser not available).
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

export interface NormalizedRoute {
  coordinates: [number, number][];
  waypoints: Array<{ lat: number; lng: number; name?: string }>;
}

const MAX_POINTS = 50000;

function parseFloatSafe(val: string | null | undefined): number {
  if (val == null || val === '') return 0;
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : 0;
}

function extractPoints(parent: Element, tagName: string): GpxPoint[] {
  const points: GpxPoint[] = [];
  const elements = parent.getElementsByTagName(tagName);

  for (let i = 0; i < elements.length && points.length < MAX_POINTS; i++) {
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

function getDOMParser(): new () => DOMParser {
  if (typeof globalThis.DOMParser !== 'undefined') {
    return globalThis.DOMParser;
  }
  // Node.js: use @xmldom/xmldom (dynamic to avoid bundling in client)
  const { DOMParser } = require('@xmldom/xmldom');
  return DOMParser;
}

export function parseGpx(xmlString: string): GpxParseResult {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new Error('Invalid GPX: empty or non-string input');
  }

  const Parser = getDOMParser();
  const doc = new Parser().parseFromString(xmlString, 'text/xml');

  const parseErrors = doc.getElementsByTagName?.('parsererror') ?? [];
  if (parseErrors.length > 0) {
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

export function toGeoJsonCoords(points: GpxPoint[]): [number, number][] {
  return points.map((p) => [p.lng, p.lat]);
}

/** GeoJSON Position with elevation [lng, lat, ele] when available */
export function toGeoJsonCoordsWithElevation(
  points: GpxPoint[]
): [number, number][] | [number, number, number][] {
  const hasEle = points.some((p) => p.elevation != null && Number.isFinite(p.elevation));
  if (!hasEle) return points.map((p) => [p.lng, p.lat]);
  return points.map((p) => [p.lng, p.lat, p.elevation ?? 0]);
}

export function toGeoJsonLineString(points: GpxPoint[]): GeoJSON.LineString {
  return {
    type: 'LineString',
    coordinates: toGeoJsonCoords(points),
  };
}

export function toGeoJsonLineStringWithElevation(
  points: GpxPoint[]
): GeoJSON.LineString {
  return {
    type: 'LineString',
    coordinates: toGeoJsonCoordsWithElevation(points) as GeoJSON.Position[],
  };
}
