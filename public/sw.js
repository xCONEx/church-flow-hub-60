
const CACHE_NAME = 'church-manager-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // Only cache files that definitely exist
        return cache.addAll(urlsToCache.filter(url => {
          // Skip static files that might not exist in production
          return !url.includes('/static/');
        }));
      })
      .catch(function(error) {
        console.warn('Cache addAll failed:', error);
        // Don't fail the service worker installation if caching fails
        return Promise.resolve();
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(function() {
        // Return a basic response if everything fails
        return new Response('Offline', { status: 503 });
      })
  );
});
