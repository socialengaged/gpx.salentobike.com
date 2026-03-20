/**
 * GPS filtering - ignore unrealistic jumps and low accuracy.
 */

export interface GpsReading {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const MAX_JUMP_METERS = 500;
const MIN_ACCURACY_METERS = 60;

const R = 6371000;

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterGpsReading(
  reading: GpsReading,
  lastReading: { lat: number; lng: number } | null
): boolean {
  if (reading.accuracy > MIN_ACCURACY_METERS) {
    return false;
  }
  if (!lastReading) return true;
  const dist = haversineMeters(
    lastReading.lat,
    lastReading.lng,
    reading.lat,
    reading.lng
  );
  return dist <= MAX_JUMP_METERS;
}
