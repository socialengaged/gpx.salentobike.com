export type RouteCategory = 'road' | 'gravel' | 'ebike';

export type RouteDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export type RouteLanguage = 'it' | 'en';

export type WaypointType = 'default' | 'water' | 'food' | 'repair' | 'view';

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation?: number;
  description?: string;
  type?: WaypointType;
}

export interface Route {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  language: RouteLanguage;
  category: RouteCategory;
  distanceMeters: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  estimatedDuration: number; // minutes
  difficulty: RouteDifficulty;
  sourceGpxUrl?: string;
  normalizedGeoJson: GeoJSON.LineString | GeoJSON.MultiLineString;
  waypoints: RouteWaypoint[];
  published: boolean;
  updatedAt: string; // ISO date
}

export interface RouteSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: RouteCategory;
  distanceMeters: number;
  elevationGainMeters: number;
  difficulty: RouteDifficulty;
  estimatedDuration: number;
}
