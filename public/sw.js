/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute([{"revision":"c8c13e035938fb581404e94f41b9e85a","url":"static/chunks/turbopack-0oq5h.vctzk12.js"},{"revision":"9e539137db16a07590b2d29f14dd6263","url":"static/chunks/15dc0~4sgnepl.js"},{"revision":"b8cc8c94a6248c9b80ffe917642e29f9","url":"static/chunks/129o2v_elnj5_.js"},{"revision":"6aaf0c465690bb580ad94ee26ae8a651","url":"static/chunks/0v_on0d8xqxls.js"},{"revision":"8463b05367b578b220eeef166e0af00e","url":"static/chunks/0v90rtu52tv5m.js"},{"revision":"c621d697f789f9a625e80384da50359c","url":"static/chunks/0pqt~8bl3ukh4.js"},{"revision":"f720333f0347cbe9213820212931db1b","url":"static/chunks/0mj2unc_hhic..js"},{"revision":"ec451f48be58766b28e349983a78a90e","url":"static/chunks/0lx~hiu-qn3un.js"},{"revision":"4b3002f727656e80d7874812f3ce1548","url":"static/chunks/0g6h3klck-moo.js"},{"revision":"1762909a45b84178eef721b83fbf5abe","url":"static/chunks/0ecgq73clst12.js"},{"revision":"d2b948c38709ec123e4b532b853d9a60","url":"static/chunks/0e-wrhqh4h3r5.js"},{"revision":"2c6890538a7dca3df0f031d8acf1bf06","url":"static/chunks/0d3shmwh5_nmn.js"},{"revision":"b13e53a9a0a134632d60d9cbab58585b","url":"static/chunks/0bvc-l110bml0.js"},{"revision":"f321f0416df0ddda99ed57801a86cb59","url":"static/chunks/0a3pg.k92a8rq.js"},{"revision":"791324c4ccfee7a74a1094933b595ccb","url":"static/chunks/06-92b6z~1l3..js"},{"revision":"1b3f5b69c9eeb6a1ee7e2e83f63b13f4","url":"static/chunks/04awysoez2ull.js"},{"revision":"846118c33b2c0e922d7b3a7676f81f6f","url":"static/chunks/03~yq9q893hmn.js"},{"revision":"c7ccf6943f2bdccb995fe5bb7d242b8a","url":"static/chunks/01xlw8hd842-c.js"},{"revision":"c30c7d42707a47a3f4591831641e50dc","url":"static/media/favicon.0x3dzn~oxb6tn.ico"},{"revision":"18bae71b1e1b2bb25321090a3b563103","url":"static/media/caa3a2e1cccd8315-s.p.16t1db8_9y2o~.woff2"},{"revision":"a0761690ccf4441ace5cec893b82d4ab","url":"static/media/bbc41e54d2fcbd21-s.0gw~uztddq1df.woff2"},{"revision":"cc728f6c0adb04da0dfcb0fc436a8ae5","url":"static/media/8a480f0b521d4e75-s.06d3mdzz5bre_.woff2"},{"revision":"da83d5f06d825c5ae65b7cca706cb312","url":"static/media/797e433ab948586e-s.p.0.q-h669a_dqa.woff2"},{"revision":"8ea4f719af3312a055caf09f34c89a77","url":"static/media/7178b3e590c64307-s.11.cyxs5p-0z~.woff2"},{"revision":"7b7c0ef93df188a852344fc272fc096b","url":"static/media/4fa387ec64143e14-s.0q3udbd2bu5yp.woff2"},{"revision":"1","url":"/manifest.webmanifest"},{"revision":"1","url":"/manifest.json"},{"revision":"1774266619238","url":"/"},{"revision":"1774266619238","url":"/routes"},{"revision":"1774266619238","url":"/routes/coastal-loop"},{"revision":"1774266619238","url":"/routes/olive-groves-gravel"},{"revision":"1774266619238","url":"/routes/test-route"},{"revision":"1774266619238","url":"/install"},{"revision":"1774266619238","url":"/saved"},{"revision":"1774266619238","url":"/admin"},{"revision":"1774266619238","url":"/admin/upload"},{"revision":"1774266619238","url":"/admin/routes"}]);

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
