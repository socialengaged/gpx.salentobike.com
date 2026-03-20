import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { Route } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ROUTES_FILE = path.join(DATA_DIR, 'added-routes.json');

export async function loadAddedRoutes(): Promise<Route[]> {
  try {
    const content = await readFile(ROUTES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAddedRoutes(routes: Route[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ROUTES_FILE, JSON.stringify(routes, null, 2), 'utf-8');
}
