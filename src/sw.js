/**
 * Block 1 of 1 — sw.js
 * Description: Shell cache + SKIP_WAITING for force update
 * Version: 1.a
 * Revised: 10Jul26
 */

const CACHE = 'nano-ssg-shell-260711a';
const SHELL = [
  '/',
  '/index.html',
  '/css/00-tokens.css',
  '/css/01-reset.css',
  '/css/02-layout.css',
  '/css/03-toolbar.css',
  '/css/07-library.css',
  '/js/library/main.js',
  '/js/shared/constants.js',
  '/locales/en.json',
  '/locales/pt.json',
  '/icons/favicon.svg'
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

  // Network-first for book bodies / toc / library.json
  if (
    /\/body\.html$/.test(url.pathname) ||
    /\/toc\.json$/.test(url.pathname) ||
    /\/library\.json$/.test(url.pathname) ||
    /\/integrity\.json$/.test(url.pathname)
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
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
