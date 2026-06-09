const CACHE_NAME = 'releaf-cache-v6';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/challenges.js',
  './js/leaderboard.js',
  './js/gemini.js',
  './js/charts.js',
  './js/pwa.js',
  './js/config.js',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for API calls (Firebase and Gemini)
  if (url.origin.includes('firebaseio.com') || url.origin.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback or do nothing if offline for these API requests
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Optionally cache new requests here if needed
        return networkResponse;
      }).catch(() => {
        // Provide offline fallback page here if applicable
      });
    })
  );
});
