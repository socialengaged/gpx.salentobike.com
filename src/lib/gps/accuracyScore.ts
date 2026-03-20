/**
 * GPS accuracy scoring - OK, weak, unavailable.
 */

export type GpsAccuracyState = 'ok' | 'weak' | 'unavailable';

export const ACCURACY_OK_METERS = 20;
export const ACCURACY_WEAK_MAX_METERS = 60;

export function getAccuracyState(accuracyMeters: number): GpsAccuracyState {
  if (!Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    return 'unavailable';
  }
  if (accuracyMeters <= ACCURACY_OK_METERS) return 'ok';
  if (accuracyMeters <= ACCURACY_WEAK_MAX_METERS) return 'weak';
  return 'weak';
}
