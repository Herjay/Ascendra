/**
 * Ascendra - Resilient Offline Service Worker
 * Version: 1.2.2
 */

const CACHE_NAME = 'ascendra-v1.2.2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/welcome.css',
  './assets/css/print.css',
  './assets/icons/ascendra-logo.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-64.png',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './js/app.js',
  './js/router.js',
  './js/database/schema.js',
  './js/database/db.js',
  './js/utils/uuid.js',
  './js/utils/dateUtils.js',
  './js/utils/dom.js',
  './js/utils/demoData.js',
  './js/services/healthService.js',
  './js/services/streakService.js',
  './js/services/searchService.js',
  './js/services/demoService.js',
  './js/modules/welcome.js',
  './js/modules/dashboard.js',
  './js/modules/projects.js',
  './js/modules/daily.js',
  './js/modules/tasks.js',
  './js/modules/goals.js',
  './js/modules/issues.js',
  './js/modules/timeTracker.js',
  './js/modules/calendar.js',
  './js/modules/analytics.js',
  './js/modules/backup.js'
];

// Install: Resiliently pre-cache all core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Pre-caching core assets for', CACHE_NAME);

      // Cache each asset individually with Promise.allSettled so a redirect or single miss doesn't abort
      await Promise.allSettled(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.warn('[ServiceWorker] Notice caching asset:', url, response.status);
            }
          } catch (err) {
            console.warn('[ServiceWorker] Skip asset:', url, err.message);
          }
        })
      );

      // Guarantee root index is cached under all navigation keys
      try {
        const indexResp = await fetch('./index.html', { cache: 'no-cache' });
        if (indexResp.ok) {
          await cache.put('./index.html', indexResp.clone());
          await cache.put('./', indexResp.clone());
          await cache.put('index.html', indexResp.clone());
          await cache.put('/', indexResp.clone());
        }
      } catch (err) {
        console.warn('[ServiceWorker] Root index mirror warning:', err.message);
      }
    })
  );
});

// Activate: Immediately clean legacy caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy tailored for offline PWA navigation and static caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML page visits, PWA launch, reloads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network first to ensure freshest content when online
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            cache.put('./index.html', networkResponse.clone());
            cache.put('./', networkResponse.clone());
            return networkResponse;
          }
        } catch (netErr) {
          // Network failed (offline or server unreachable) - proceed to cache
        }

        // Offline navigation fallback: Match request or any cached index variant
        const cache = await caches.open(CACHE_NAME);
        const cached =
          (await cache.match(event.request, { ignoreSearch: true })) ||
          (await cache.match('./index.html')) ||
          (await cache.match('/index.html')) ||
          (await cache.match('./')) ||
          (await cache.match('/')) ||
          (await cache.match('index.html'));

        if (cached) {
          return cached;
        }

        return new Response('Ascendra is offline. Please reconnect to access new resources.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // 2. Static subresources (CSS, JS, Icons, Images): Cache-first with stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request, { ignoreSearch: true });

      if (cachedResponse) {
        // Revalidate in background when online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse);
            }
          })
          .catch(() => { /* Offline - silent ignore */ });

        return cachedResponse;
      }

      // Not in cache: fetch from network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (fetchErr) {
        // Offline fallback for any failed subresource
        const fallback = await cache.match(event.request, { ignoreSearch: true });
        if (fallback) return fallback;
        throw fetchErr;
      }
    })()
  );
});
