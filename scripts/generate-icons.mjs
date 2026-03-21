#!/usr/bin/env node
/**
 * Generates valid PNG icons at 192×192 and 512×512 (Salento Bike sky blue).
 * Chrome requires real pixel dimensions for PWA installability — 1×1 placeholders break beforeinstallprompt.
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

mkdirSync(iconsDir, { recursive: true });

/** Theme sky-500 #0ea5e9 */
function fillSky(png) {
  const { width, height, data } = png;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = 14;
      data[idx + 1] = 165;
      data[idx + 2] = 233;
      data[idx + 3] = 255;
    }
  }
}

function writeIcon(size, filename) {
  const png = new PNG({ width: size, height: size });
  fillSky(png);
  const buf = PNG.sync.write(png);
  writeFileSync(path.join(iconsDir, filename), buf);
  console.log(`Wrote ${filename} (${size}×${size})`);
}

writeIcon(192, 'icon-192.png');
writeIcon(512, 'icon-512.png');
