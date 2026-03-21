/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute([{"revision":"41476fa7d4fcd7e847527b3a23f4651e","url":"static/chunks/turbopack-0eanqc~4ervrm.js"},{"revision":"497776200856b05ae2db4b8685daa593","url":"static/chunks/184rtx6rog9gc.js"},{"revision":"9258156a38383e62bbf9e9a5d0c1c777","url":"static/chunks/15pjn.n4_q6le.js"},{"revision":"7f2102cf1f85fab290ca4e8c9a45c85e","url":"static/chunks/0~qsb84gdxv~l.js"},{"revision":"17a9c6f1fef5b06e0903ffe90481840b","url":"static/chunks/0yswhac3uy35w.js"},{"revision":"8463b05367b578b220eeef166e0af00e","url":"static/chunks/0v90rtu52tv5m.js"},{"revision":"c621d697f789f9a625e80384da50359c","url":"static/chunks/0pqt~8bl3ukh4.js"},{"revision":"f720333f0347cbe9213820212931db1b","url":"static/chunks/0mj2unc_hhic..js"},{"revision":"2c5a21a14af44164c73a893de730251b","url":"static/chunks/0effu3~665-rp.js"},{"revision":"d2b948c38709ec123e4b532b853d9a60","url":"static/chunks/0e-wrhqh4h3r5.js"},{"revision":"2c6890538a7dca3df0f031d8acf1bf06","url":"static/chunks/0d3shmwh5_nmn.js"},{"revision":"c4286a8e57c054a8377faf522001475a","url":"static/chunks/0bss2lzx8epxr.js"},{"revision":"b728c34224d3b3ef4194d2600db7b1f9","url":"static/chunks/0bsih5z~6fxz2.js"},{"revision":"1b3f5b69c9eeb6a1ee7e2e83f63b13f4","url":"static/chunks/04awysoez2ull.js"},{"revision":"846118c33b2c0e922d7b3a7676f81f6f","url":"static/chunks/03~yq9q893hmn.js"},{"revision":"1041237016d9c9d3e0259ba17820bd9b","url":"static/chunks/03-si-63shc_d.js"},{"revision":"c7ccf6943f2bdccb995fe5bb7d242b8a","url":"static/chunks/01xlw8hd842-c.js"},{"revision":"857d9b949e10ac9094c85fe647e3a47e","url":"static/chunks/00ilazh50sdzh.js"},{"revision":"c30c7d42707a47a3f4591831641e50dc","url":"static/media/favicon.0x3dzn~oxb6tn.ico"},{"revision":"18bae71b1e1b2bb25321090a3b563103","url":"static/media/caa3a2e1cccd8315-s.p.16t1db8_9y2o~.woff2"},{"revision":"a0761690ccf4441ace5cec893b82d4ab","url":"static/media/bbc41e54d2fcbd21-s.0gw~uztddq1df.woff2"},{"revision":"cc728f6c0adb04da0dfcb0fc436a8ae5","url":"static/media/8a480f0b521d4e75-s.06d3mdzz5bre_.woff2"},{"revision":"da83d5f06d825c5ae65b7cca706cb312","url":"static/media/797e433ab948586e-s.p.0.q-h669a_dqa.woff2"},{"revision":"8ea4f719af3312a055caf09f34c89a77","url":"static/media/7178b3e590c64307-s.11.cyxs5p-0z~.woff2"},{"revision":"7b7c0ef93df188a852344fc272fc096b","url":"static/media/4fa387ec64143e14-s.0q3udbd2bu5yp.woff2"},{"revision":"1","url":"/manifest.webmanifest"},{"revision":"1","url":"/manifest.json"},{"revision":"1774089450054","url":"/"},{"revision":"1774089450054","url":"/routes"},{"revision":"1774089450054","url":"/routes/coastal-loop"},{"revision":"1774089450054","url":"/routes/olive-groves-gravel"},{"revision":"1774089450054","url":"/routes/test-route"},{"revision":"1774089450054","url":"/install"},{"revision":"1774089450054","url":"/saved"},{"revision":"1774089450054","url":"/admin"},{"revision":"1774089450054","url":"/admin/upload"},{"revision":"1774089450054","url":"/admin/routes"}]);

// App shell: cache-first for fast load (JS, CSS, fonts, icons)
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'app-shell',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Route data: network-first with cache fallback (API, JSON, GPX)
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.gpx'),
  new NetworkFirst({
    cacheName: 'route-data',
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// Map tiles: limited cache (do not overcache)
registerRoute(
  ({ url }) =>
    url.hostname.includes('tile') ||
    url.hostname.includes('basemap') ||
    url.pathname.includes('/tiles/'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 14 * 24 * 60 * 60 }),
    ],
  })
);
