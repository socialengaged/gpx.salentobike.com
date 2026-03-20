/**
 * Local route storage - save, retrieve, last opened.
 */

import { getDB, STORE_ROUTES, STORE_META } from './indexedDb';
import type { Route } from '@/lib/routes/types';

const LAST_ROUTE_KEY = 'lastOpenedRoute';

export async function saveRouteLocally(route: Route): Promise<void> {
  const db = await getDB();
  await db.put(STORE_ROUTES, {
    ...route,
    savedAt: new Date().toISOString(),
  });
}

export async function getLocalRoute(id: string): Promise<Route | undefined> {
  const db = await getDB();
  const stored = await db.get(STORE_ROUTES, id);
  if (!stored) return undefined;
  const { savedAt, ...route } = stored as Route & { savedAt: string };
  return route;
}

export async function getLocalRouteBySlug(slug: string): Promise<Route | undefined> {
  const db = await getDB();
  const all = await db.getAll(STORE_ROUTES);
  const match = all.find((r) => (r as Route).slug === slug);
  if (!match) return undefined;
  const { savedAt, ...route } = match as Route & { savedAt: string };
  return route;
}

export async function getLocalRoutes(): Promise<Route[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_ROUTES);
  return all.map((r) => {
    const { savedAt, ...route } = r as Route & { savedAt: string };
    return route;
  });
}

export async function deleteLocalRoute(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_ROUTES, id);
}

export async function isRouteSavedLocally(id: string): Promise<boolean> {
  const route = await getLocalRoute(id);
  return route != null;
}

export async function setLastOpenedRoute(routeId: string): Promise<void> {
  const db = await getDB();
  await db.put(STORE_META, {
    key: LAST_ROUTE_KEY,
    value: routeId,
    updatedAt: new Date().toISOString(),
  });
}

export async function getLastOpenedRoute(): Promise<Route | undefined> {
  const db = await getDB();
  const meta = await db.get(STORE_META, LAST_ROUTE_KEY);
  if (!meta || !(meta as { value: string }).value) return undefined;
  const routeId = (meta as { value: string }).value;
  return getLocalRoute(routeId);
}
