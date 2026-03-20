/**
 * IndexedDB setup and utilities.
 */

import { openDB, type IDBPDatabase } from 'idb';

export const DB_NAME = 'salentogpx';
export const DB_VERSION = 2;

export const STORE_ROUTES = 'routes';
export const STORE_META = 'meta';

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (!db.objectStoreNames.contains(STORE_ROUTES)) {
        db.createObjectStore(STORE_ROUTES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    },
  });
  return dbPromise;
}
