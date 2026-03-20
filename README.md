# Salento Bike Routes PWA

A production-oriented PWA for Salento Bike customers to view, save, and follow bike routes on iPhone and Android.

## Features

- Browse and view bike routes with interactive maps
- Save routes for offline access
- Live GPS tracking with off-route detection
- Quick contact from route screen
- Installable PWA (Add to Home Screen)

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- MapLibre GL JS for maps
- IndexedDB for local route persistence
- Workbox for service worker caching
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

The build generates a service worker in `public/sw.js` for offline support.

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # UI components (map, layout, ui)
  lib/           # Utilities (gpx, gps, db, routes)
  sw/            # Service worker source
docs/            # GPS rules, offline strategy, iOS constraints
```

## Documentation

- [GPS Rules](docs/gps-rules.md) - Geolocation behavior and constraints
- [Offline Strategy](docs/offline-strategy.md) - Caching and IndexedDB
- [iOS Constraints](docs/ios-constraints.md) - PWA limitations on iPhone

## Admin

Internal admin at `/admin` for GPX upload and route management. Add authentication before production.

## Contact

Replace `CONTACT_URL` in `RouteDetailClient.tsx` with Salento Bike's phone number.
