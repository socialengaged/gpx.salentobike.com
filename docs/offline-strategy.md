# Offline Strategy

## Overview

Salento Bike uses a layered offline approach:

1. **Service Worker (Workbox)**: Caches app shell and network requests
2. **IndexedDB**: Persists saved routes for offline access
3. **No tile over-caching**: Map tiles are cached sparingly to avoid storage bloat

## Service Worker

- **Precache**: App shell (JS, CSS) from `.next` build output
- **StaleWhileRevalidate**: Scripts, styles, fonts
- **NetworkFirst**: API routes, JSON, GPX (10s timeout)
- **CacheFirst**: Map tiles (max 200 entries, 30 days)

## IndexedDB

- **Store**: `salentogpx.routes`
- **Key**: Route `id`
- **Content**: Full route object including `normalizedGeoJson` and waypoints

## Saved Routes Flow

1. User taps "Save offline" on route detail
2. Route is written to IndexedDB
3. When offline, user can open saved routes from a future "Saved" list
4. Map renders from cached GeoJSON; tiles may load from cache if previously viewed

## Cache Versioning

- Service worker is regenerated on each `next build`
- `additionalManifestEntries` include timestamp for `/` to bust cache
- To force refresh: unregister SW, hard reload

## Limitations

- First visit requires network
- Map tiles not precached; user must view route online first for full offline map
- Consider offline tile package (e.g. MapTiler offline) for critical routes
