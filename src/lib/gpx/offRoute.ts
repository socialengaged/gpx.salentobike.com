/**
 * Off-route detection with confirmation threshold.
 * Requires 2-3 consecutive off-route readings before alerting.
 */

import { findNearestPoint, type TrackPoint } from './nearestPoint';

const OFF_ROUTE_THRESHOLD_M = 50;
const CONFIRMATION_COUNT = 3;

export function createOffRouteDetector() {
  let offRouteCount = 0;

  return {
    check(
      lat: number,
      lng: number,
      points: TrackPoint[],
      thresholdMeters: number = OFF_ROUTE_THRESHOLD_M
    ): { isOffRoute: boolean; distanceMeters: number; confirmed: boolean } {
      const nearest = findNearestPoint(lat, lng, points);
      if (!nearest) {
        return { isOffRoute: true, distanceMeters: Infinity, confirmed: true };
      }

      const isOffRoute = nearest.distanceMeters > thresholdMeters;

      if (isOffRoute) {
        offRouteCount = Math.min(offRouteCount + 1, CONFIRMATION_COUNT);
      } else {
        offRouteCount = 0;
      }

      return {
        isOffRoute: offRouteCount >= CONFIRMATION_COUNT,
        distanceMeters: nearest.distanceMeters,
        confirmed: offRouteCount >= CONFIRMATION_COUNT,
      };
    },
    reset() {
      offRouteCount = 0;
    },
  };
}
