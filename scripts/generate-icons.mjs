#!/usr/bin/env node
/**
 * Generates placeholder PWA icons.
 * Replace with real Salento Bike branding before production.
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

mkdirSync(iconsDir, { recursive: true });

// Minimal valid 1x1 PNG (transparent)
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// For 192 and 512 we use the same minimal PNG - browsers will scale
// In production, replace with proper branded icons
writeFileSync(path.join(iconsDir, 'icon-192.png'), minimalPng);
writeFileSync(path.join(iconsDir, 'icon-512.png'), minimalPng);

console.log('Placeholder icons generated in public/icons/');
console.log('Replace with branded 192x192 and 512x512 PNGs before production.');
