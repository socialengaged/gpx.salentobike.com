/**
 * Route store with file persistence. Routes come from GPX files in public/mappe/
 * and optionally added routes persisted in data/added-routes.json.
 */

import { loadAddedRoutes, saveAddedRoutes } from './persistence';
import type { Route } from './types';
import type { RouteSummary } from './types';

const GPX_ROUTES = [
  { slug: 'lecce-loop', title: 'Lecce Loop' },
  { slug: 'lecce-otranto', title: 'Lecce - Otranto' },
  { slug: 'otranto-leuca', title: 'Otranto - Leuca' },
  { slug: 'jonio', title: 'Jonio' },
  { slug: 'south-francigena', title: 'South Francigena' },
  { slug: 'north-francigena', title: 'North Francigena' },
];

export async function getAllRoutes(): Promise<Route[]> {
  return loadAddedRoutes();
}

export async function getRouteById(id: string): Promise<Route | undefined> {
  const routes = await getAllRoutes();
  return routes.find((r) => r.id === id);
}

export async function getRouteBySlugFromStore(slug: string): Promise<Route | undefined> {
  const routes = await getAllRoutes();
  return routes.find((r) => r.slug === slug);
}

export function getGpxRouteSlugs(): string[] {
  return GPX_ROUTES.map((r) => r.slug);
}

export function getGpxRouteSummaries(): RouteSummary[] {
  return GPX_ROUTES.map((r) => ({
    id: `gpx-${r.slug}`,
    slug: r.slug,
    title: r.title,
    shortDescription:
      r.slug === 'south-francigena'
        ? 'Bari - Santa Maria di Leuca, 12 tappe'
        : r.slug === 'north-francigena'
          ? 'Bari - Foggia, 10 tappe'
          : r.slug === 'lecce-loop'
            ? 'Lecce - Martano - Otranto, più tappe e varianti'
            : `Route from ${r.title}`,
    category: 'road' as const,
    distanceMeters: 0,
    elevationGainMeters: 0,
    difficulty: 'moderate' as const,
    estimatedDuration: 0,
  }));
}

export async function addRoute(route: Route): Promise<void> {
  const routes = await loadAddedRoutes();
  routes.push(route);
  await saveAddedRoutes(routes);
}

export async function updateRoute(id: string, updates: Partial<Route>): Promise<void> {
  const routes = await loadAddedRoutes();
  const idx = routes.findIndex((r) => r.id === id);
  if (idx >= 0) {
    routes[idx] = { ...routes[idx], ...updates };
    await saveAddedRoutes(routes);
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'route';
}

export function generateId(): string {
  return `route-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getRouteSummariesFromStore(): Promise<RouteSummary[]> {
  const added = await getAllRoutes();
  const fromStore = added
    .filter((r) => r.published)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      shortDescription: r.shortDescription,
      category: r.category,
      distanceMeters: r.distanceMeters,
      elevationGainMeters: r.elevationGainMeters,
      difficulty: r.difficulty,
      estimatedDuration: r.estimatedDuration,
    }));
  const gpxSummaries = getGpxRouteSummaries();
  return [...gpxSummaries, ...fromStore];
}
