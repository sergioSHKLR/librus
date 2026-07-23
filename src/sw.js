/**
 * Block 1 of 1 — sw.js
 * Description: Shell cache + SKIP_WAITING for force update
 * Version: 1.b
 * Revised: 22Jul26
 *
 * CACHE name must change on every shell/UI release so activate() drops
 * stale CSS/HTML. Keep in sync with BUILD_ID.
 */

const CACHE = 'librus-shell-260723d';
const SHELL = [
  '/',
  '/index.html',
  '/css/00-tokens.css',
  '/css/01-reset.css',
  '/css/02-layout.css',
  '/css/03-toolbar.css',
  '/css/04-book.css',
  '/css/05-context.css',
  '/css/07-library.css',
  '/js/library/main.js',
  '/js/shared/constants.js',
  '/locales/en.json',
  '/locales/pt.json',
  '/icons/favicon.svg',
  '/icons/sliders-horizontal.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /*
   * Network-first for content + reader chrome that change every release.
   * Cache-first for the rest (icons, fonts, etc.).
   */
  if (
    /\/body\.html$/.test(url.pathname) ||
    /\/toc\.json$/.test(url.pathname) ||
    /\/pages\.json$/.test(url.pathname) ||
    /\/library\.json$/.test(url.pathname) ||
    /\/integrity\.json$/.test(url.pathname) ||
    /\/books\/[^/]+\/(?:index\.html)?$/.test(url.pathname) ||
    /\/css\/.+\.css$/.test(url.pathname) ||
    /\/js\/.+\.js$/.test(url.pathname) ||
    /\/locales\/.+\.json$/.test(url.pathname) ||
    /\/sw\.js$/.test(url.pathname)
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
