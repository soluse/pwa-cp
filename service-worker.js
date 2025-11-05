const CACHE = 'pwa-cp-v1';
const BASE = '/pwa-cp/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([
      BASE,
      BASE + 'index.html',
      BASE + 'manifest.json',
      BASE + 'icons/icon-192.png',
      BASE + 'icons/icon-512.png'
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(BASE)) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => cached))
  );
});
