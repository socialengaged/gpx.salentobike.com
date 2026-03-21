#!/usr/bin/env node
/**
 * Fetch OSM POI in Puglia via Overpass, assign to nearest comune (max 5 km).
 * Reads public/data/comuni-puglia-lite.json for comune coordinates.
 * Writes public/data/poi-counts.json and public/data/fontane-puglia.json
 *
 * Usage: node scripts/fetch-poi-puglia.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LITE_PATH = join(ROOT, 'public', 'data', 'comuni-puglia-lite.json');
const OUT_COUNTS = join(ROOT, 'public', 'data', 'poi-counts.json');
const OUT_FONTANE = join(ROOT, 'public', 'data', 'fontane-puglia.json');

/** Puglia bbox: south, west, north, east */
const BBOX = [39.8, 14.9, 42.3, 18.6];

const MAX_M = 5000;

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toR = (d) => (Math.PI * d) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function getCoords(el) {
  if (el.type === 'node' && el.lat != null && el.lon != null) {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center && el.center.lat != null && el.center.lon != null) {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

function classify(tags) {
  if (!tags) return null;
  if (tags.amenity === 'drinking_water') return 'fontane';
  if (tags.amenity === 'restaurant') return 'ristoranti';
  if (tags.amenity === 'pharmacy') return 'farmacie';
  if (tags.amenity === 'hospital') return 'ospedali';
  if (tags.shop === 'bicycle') return 'bici';
  if (tags.amenity === 'bicycle_repair_station') return 'bici';
  return null;
}

function nearestComune(lat, lon, comuni) {
  let best = null;
  let bestD = Infinity;
  for (const c of comuni) {
    const d = haversineM(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  if (best && bestD <= MAX_M) return { slug: best.slug, dist: bestD };
  return null;
}

const OVERPASS_QUERY = `
[out:json][timeout:180];
(
  nwr["amenity"="drinking_water"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  nwr["amenity"="restaurant"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  nwr["amenity"="pharmacy"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  nwr["amenity"="hospital"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  nwr["shop"="bicycle"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  nwr["amenity"="bicycle_repair_station"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
);
out center;
`.trim();

async function main() {
  const raw = readFileSync(LITE_PATH, 'utf8');
  const comuni = JSON.parse(raw);
  if (!Array.isArray(comuni) || comuni.length === 0) {
    throw new Error('comuni-puglia-lite.json missing or empty');
  }

  const counts = {};
  for (const c of comuni) {
    counts[c.slug] = {
      fontane: 0,
      ristoranti: 0,
      farmacie: 0,
      ospedali: 0,
      bici: 0,
    };
  }

  console.log('Overpass query (Puglia POI)...');
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
  });
  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}`);
  }
  const data = await res.json();
  const elements = data.elements || [];
  console.log(`Received ${elements.length} elements`);

  const fontanePoints = [];

  for (const el of elements) {
    const coords = getCoords(el);
    if (!coords) continue;
    const cat = classify(el.tags);
    if (!cat) continue;

    const near = nearestComune(coords.lat, coords.lon, comuni);
    if (!near) continue;

    counts[near.slug][cat]++;

    if (cat === 'fontane') {
      fontanePoints.push({ lat: coords.lat, lon: coords.lon });
    }
  }

  mkdirSync(dirname(OUT_COUNTS), { recursive: true });
  writeFileSync(OUT_COUNTS, JSON.stringify(counts, null, 0), 'utf8');
  writeFileSync(OUT_FONTANE, JSON.stringify(fontanePoints, null, 0), 'utf8');

  console.log('Written:', OUT_COUNTS);
  console.log('Written:', OUT_FONTANE, `(${fontanePoints.length} fontane)`);

  const totalFontane = Object.values(counts).reduce((s, c) => s + c.fontane, 0);
  console.log('Total fontane assigned to comuni:', totalFontane);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
