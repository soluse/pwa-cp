const CACHE = 'v1';

// 초기 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        '/pwa-demo/',
        '/pwa-demo/index.html',
        '/pwa-demo/manifest.json',
        '/pwa-demo/icons/icon-192.png',
        '/pwa-demo/icons/icon-512.png'
      ])
    )
  );
  self.skipWaiting(); // 새 SW가 즉시 대기상태로
});

// 활성화 & 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 열린 탭에 즉시 적용
});

// 네트워크 요청 가로채기 (Cache, then Network fallback)
self.addEventListener('fetch', (event) => {
  // scope 밖 요청은 무시(선택)
  if (!event.request.url.includes('/pwa-demo/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => 
      cached || fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => cached) // 오프라인 fallback
    )
  );
});
