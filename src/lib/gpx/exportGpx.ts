/**
 * Export route to GPX format.
 */

import type { Route, RouteWaypoint } from '@/lib/routes/types';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatTrkpt(coord: [number, number] | [number, number, number]): string {
  const lng = coord[0];
  const lat = coord[1];
  const ele = coord[2];
  let xml = `  <trkpt lat="${lat}" lon="${lng}">`;
  if (ele != null) xml += `\n    <ele>${ele}</ele>`;
  xml += '\n  </trkpt>';
  return xml;
}

function formatWpt(wp: RouteWaypoint): string {
  let xml = `  <wpt lat="${wp.lat}" lon="${wp.lng}">`;
  xml += `\n    <name>${escapeXml(wp.name)}</name>`;
  if (wp.elevation != null) xml += `\n    <ele>${wp.elevation}</ele>`;
  if (wp.description) xml += `\n    <desc>${escapeXml(wp.description)}</desc>`;
  xml += '\n  </wpt>';
  return xml;
}

export function routeToGpx(route: Route): string {
  const coords =
    route.normalizedGeoJson.type === 'LineString'
      ? route.normalizedGeoJson.coordinates
      : (route.normalizedGeoJson as GeoJSON.MultiLineString).coordinates.flat();

  let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
  gpx += '<gpx version="1.1" creator="Salento Bike" xmlns="http://www.topografix.com/GPX/1/1">\n';

  gpx += `  <metadata>\n    <name>${escapeXml(route.title)}</name>\n`;
  if (route.shortDescription) {
    gpx += `    <desc>${escapeXml(route.shortDescription)}</desc>\n`;
  }
  gpx += '  </metadata>\n';

  for (const wp of route.waypoints) {
    gpx += formatWpt(wp) + '\n';
  }

  gpx += '  <trk>\n';
  gpx += `    <name>${escapeXml(route.title)}</name>\n`;
  gpx += '    <trkseg>\n';
  for (const coord of coords) {
    const c = coord as [number, number] | [number, number, number];
    gpx += formatTrkpt(c) + '\n';
  }
  gpx += '    </trkseg>\n  </trk>\n';
  gpx += '</gpx>';

  return gpx;
}

export function downloadGpx(route: Route, filename?: string): void {
  const gpx = routeToGpx(route);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${route.slug}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}
