#!/usr/bin/env node
/**
 * Build comuni-puglia.json from comuni_italiani_full.csv
 * Filters regione Puglia, geocodes with Nominatim if lat/lon missing.
 * Usage: node scripts/build-comuni.mjs [path/to/comuni_italiani_full.csv]
 */

import { parse } from 'csv-parse';
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DEFAULT_CSV = join(
  process.env.USERPROFILE || process.env.HOME || '',
  'Desktop',
  'comuni_italiani_full.csv'
);
const OUTPUT_PATH = join(PROJECT_ROOT, 'public', 'data', 'comuni-puglia.json');
const LITE_OUTPUT_PATH = join(PROJECT_ROOT, 'public', 'data', 'comuni-puglia-lite.json');
const POI_COUNTS_PATH = join(PROJECT_ROOT, 'public', 'data', 'poi-counts.json');
const GEOCODE_CACHE_PATH = join(PROJECT_ROOT, 'scripts', '.comuni-geocode-cache.json');

const COLS = [
  'istat', 'nome', 'slug', 'regione', 'provincia_sigla', 'provincia_completa', 'cap',
  'improved_intro', 'attractions_section', 'restaurants_section',
  'wikipedia_extract', 'wikipedia_url', 'lat', 'lon', 'thumbnail', 'enhanced_at'
];

function parseFloatSafe(val) {
  if (!val || typeof val !== 'string') return null;
  const n = parseFloat(val.trim());
  return Number.isFinite(n) ? n : null;
}

async function geocode(nome, provincia) {
  const cache = await loadGeocodeCache();
  const key = `${nome}, ${provincia}`;
  if (cache[key]) return cache[key];

  const prov = provincia?.replace(/\s*\([A-Z]+\)\s*$/, '').trim() || 'Puglia';
  const q = encodeURIComponent(`${nome}, ${prov}, Italia`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SalentoBikeGPX/1.0' }
  });
  const data = await res.json();
  const lat = data[0]?.lat ? parseFloat(data[0].lat) : null;
  const lon = data[0]?.lon ? parseFloat(data[0].lon) : null;
  cache[key] = lat && lon ? { lat, lon } : null;
  await saveGeocodeCache(cache);
  await sleep(1100); // Nominatim: 1 req/sec
  return cache[key];
}

function loadGeocodeCache() {
  try {
    const raw = readFileSync(GEOCODE_CACHE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveGeocodeCache(cache) {
  try {
    writeFileSync(GEOCODE_CACHE_PATH, JSON.stringify(cache, null, 0), 'utf8');
  } catch (e) {
    console.warn('Could not save geocode cache:', e.message);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Allineato a src/app/comuni/[slug]/page.tsx — conteggi per popup mappa */
function countBulletItems(text) {
  if (!text) return 0;
  const lines = text.split(/\n/).map((l) => l.trim());
  const bullets = lines.filter((l) => /^\s*-\s/.test(l));
  if (bullets.length > 0) return bullets.length;
  const inline = text.split(/\s+-\s+/).filter((p) => p.length > 8);
  if (inline.length >= 2) return inline.length;
  return 0;
}

function countAttractionItems(text) {
  if (!text) return 0;
  const b = countBulletItems(text);
  if (b > 0) return b;
  const sentences = text.split(/\.\s+/).filter((s) => s.trim().length > 25);
  return Math.max(0, sentences.length);
}

function parseCsv(path) {
  return new Promise((resolve, reject) => {
    const rows = [];
    createReadStream(path, { encoding: 'utf8' })
      .pipe(parse({ columns: COLS, relax_column_count: true, skip_empty_lines: true }))
      .on('data', (r) => rows.push(r))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV;
  console.log('Reading CSV:', csvPath);

  const rows = await parseCsv(csvPath);
  const puglia = rows.filter((r) => r.regione === 'Puglia');
  console.log(`Filtered ${puglia.length} comuni (regione Puglia)`);

  const out = [];
  const skipGeocode = process.env.SKIP_GEOCODE === '1';

  for (let i = 0; i < puglia.length; i++) {
    const r = puglia[i];
    let lat = parseFloatSafe(r.lat);
    let lon = parseFloatSafe(r.lon);

    if ((!lat || !lon) && !skipGeocode) {
      const coords = await geocode(r.nome, r.provincia_completa || 'Puglia');
      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
        console.log(`  Geocoded: ${r.nome}`);
      }
    }

    out.push({
      istat: r.istat,
      nome: r.nome,
      slug: r.slug,
      regione: r.regione,
      provincia_sigla: r.provincia_sigla,
      cap: r.cap || null,
      improved_intro: r.improved_intro || null,
      attractions_section: r.attractions_section || null,
      restaurants_section: r.restaurants_section || null,
      lat,
      lon,
    });
  }

  let poiBySlug = {};
  try {
    poiBySlug = JSON.parse(readFileSync(POI_COUNTS_PATH, 'utf8'));
  } catch {
    console.warn('No poi-counts.json — run: node scripts/fetch-poi-puglia.mjs');
  }

  for (const row of out) {
    const p = poiBySlug[row.slug];
    row.poi_fontane = p ? p.fontane : null;
    row.poi_ristoranti = p ? p.ristoranti : null;
    row.poi_farmacie = p ? p.farmacie : null;
    row.poi_ospedali = p ? p.ospedali : null;
    row.poi_bici = p ? p.bici : null;
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 0), 'utf8');
  console.log('Written:', OUTPUT_PATH);

  const lite = out
    .filter((c) => c.lat != null && c.lon != null)
    .map((c) => {
      const ts = countBulletItems(c.restaurants_section);
      const ta = countAttractionItems(c.attractions_section);
      return {
        istat: c.istat,
        nome: c.nome,
        slug: c.slug,
        lat: c.lat,
        lon: c.lon,
        prov: c.provincia_sigla || '',
        hasRist: !!c.restaurants_section,
        hasAttr: !!c.attractions_section,
        txt_spec: ts > 0 ? ts : 0,
        txt_attr: ta > 0 ? ta : 0,
        poi_fontane: c.poi_fontane,
        poi_ristoranti: c.poi_ristoranti,
        poi_farmacie: c.poi_farmacie,
        poi_ospedali: c.poi_ospedali,
        poi_bici: c.poi_bici,
      };
    });
  writeFileSync(LITE_OUTPUT_PATH, JSON.stringify(lite, null, 0), 'utf8');
  console.log('Written:', LITE_OUTPUT_PATH, `(${lite.length} punti)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
