/**
 * Track recording - start/stop, save locally, export GPX.
 */

import type { GpsPosition } from './watchPosition';

export interface RecordedPoint {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp: number;
}

class TrackRecorderClass {
  private points: RecordedPoint[] = [];
  private isRecording = false;
  private listeners: Set<() => void> = new Set();

  start(): void {
    this.points = [];
    this.isRecording = true;
    this.notify();
  }

  stop(): void {
    this.isRecording = false;
    this.notify();
  }

  addPoint(pos: GpsPosition): void {
    if (!this.isRecording) return;
    this.points.push({
      lat: pos.lat,
      lng: pos.lng,
      elevation: pos.altitude ?? undefined,
      timestamp: pos.timestamp,
    });
    this.notify();
  }

  getPoints(): RecordedPoint[] {
    return [...this.points];
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  clear(): void {
    this.points = [];
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const trackRecorder = new TrackRecorderClass();

export function pointsToGpx(
  points: RecordedPoint[],
  name: string = 'Recorded Track'
): string {
  let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
  gpx += '<gpx version="1.1" creator="Salento Bike" xmlns="http://www.topografix.com/GPX/1/1">\n';
  gpx += `  <trk><name>${name}</name><trkseg>\n`;
  for (const p of points) {
    const time = new Date(p.timestamp).toISOString();
    gpx += `    <trkpt lat="${p.lat}" lon="${p.lng}">`;
    if (p.elevation != null) gpx += `<ele>${p.elevation}</ele>`;
    gpx += `<time>${time}</time></trkpt>\n`;
  }
  gpx += '  </trkseg></trk>\n</gpx>';
  return gpx;
}

export function downloadRecordedGpx(name: string = 'recorded-track'): void {
  const points = trackRecorder.getPoints();
  if (points.length === 0) return;
  const gpx = pointsToGpx(points, name);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}
