import type { Map, PointLike } from 'maplibre-gl';

/**
 * True if the click is on a route segment hit layer (wide invisible line).
 * Used so comuni/fontane/waypoint handlers don't steal taps meant for the track.
 */
export function isClickOnRouteHit(map: Map, point: PointLike): boolean {
  const style = map.getStyle();
  if (!style?.layers) return false;
  const routeHitIds = style.layers.map((l) => l.id).filter((id) => id.startsWith('route-hit-'));
  if (routeHitIds.length === 0) return false;
  const feats = map.queryRenderedFeatures(point, { layers: routeHitIds });
  return feats.length > 0;
}
