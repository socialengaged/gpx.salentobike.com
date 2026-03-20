#!/usr/bin/env node
import { injectManifest } from 'workbox-build';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const staticRoutes = [
  '/',
  '/routes',
  '/routes/coastal-loop',
  '/routes/olive-groves-gravel',
  '/routes/test-route',
  '/install',
  '/saved',
  '/admin',
  '/admin/upload',
  '/admin/routes',
];

const additionalManifestEntries = [
  { url: '/manifest.webmanifest', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  ...staticRoutes.map((url) => ({ url, revision: Date.now().toString() })),
];

const { count, size } = await injectManifest({
  swSrc: path.join(root, 'src/sw/sw.js'),
  swDest: path.join(root, 'public/sw.js'),
  globDirectory: path.join(root, '.next'),
  globPatterns: [
    'static/chunks/**/*.js',
    'static/css/**/*.css',
    'static/media/**/*',
  ],
  globIgnores: ['**/node_modules/**'],
  additionalManifestEntries,
});

console.log(`Service worker generated: ${count} files, ${(size / 1024).toFixed(1)} KB`);
