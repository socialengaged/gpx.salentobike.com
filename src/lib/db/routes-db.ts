/**
 * IndexedDB persistence for saved routes.
 * Delegates to localRoutes.
 */

import type { Route } from '@/lib/routes/types';
import {
  saveRouteLocally,
  getLocalRoute,
  getLocalRoutes,
  deleteLocalRoute,
  isRouteSavedLocally,
  setLastOpenedRoute,
} from './localRoutes';

export async function saveRoute(route: Route): Promise<void> {
  await saveRouteLocally(route);
  await setLastOpenedRoute(route.id);
}

export async function getSavedRoute(id: string): Promise<Route | undefined> {
  return getLocalRoute(id);
}

export async function getSavedRoutes(): Promise<Route[]> {
  return getLocalRoutes();
}

export async function deleteSavedRoute(id: string): Promise<void> {
  await deleteLocalRoute(id);
}

export async function isRouteSaved(id: string): Promise<boolean> {
  return isRouteSavedLocally(id);
}
