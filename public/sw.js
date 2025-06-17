
const CACHE_NAME = 'church-manager-v2';
const STATIC_CACHE_NAME = 'church-manager-static-v2';

// Only cache essential static files that we know exist
const staticFilesToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME)
        .then(function(cache) {
          console.log('Caching static files');
          return cache.addAll(staticFilesToCache);
        }),
      // Clear old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(function() {
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch(function(error) {
      console.error('Service Worker installation failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('Cleaning up old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests to external domains
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip API requests and Supabase calls
  if (url.pathname.includes('/api/') || 
      url.hostname.includes('supabase') || 
      url.hostname.includes('vercel')) {
    return;
  }
  
  // For HTML requests (navigation), always go to network first
  if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          // Clone the response before using it
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(function() {
          // If network fails, try cache
          return caches.match(request).then(function(response) {
            return response || new Response('Offline', { 
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
    return;
  }
  
  // For static assets, try cache first, then network
  if (url.pathname.includes('/assets/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico')) {
    
    event.respondWith(
      caches.match(request).then(function(response) {
        if (response) {
          // Check if cached response is fresh (less than 1 hour old)
          const cachedTime = response.headers.get('sw-cache-time');
          if (cachedTime && (Date.now() - parseInt(cachedTime)) < 3600000) {
            return response;
          }
        }
        
        // Fetch from network
        return fetch(request).then(function(networkResponse) {
          // Only cache successful responses
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            
            caches.open(CACHE_NAME).then(function(cache) {
              // Add timestamp to cached response
              const responseWithTime = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                  ...Object.fromEntries(responseClone.headers.entries()),
                  'sw-cache-time': Date.now().toString()
                }
              });
              cache.put(request, responseWithTime);
            });
          }
          
          return networkResponse;
        }).catch(function(error) {
          console.log('Network fetch failed, trying cache:', error);
          return response || new Response('Resource not available offline', { 
            status: 404,
            statusText: 'Not Found'
          });
        });
      })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('All caches cleared');
        self.clients.matchAll().then(function(clients) {
          clients.forEach(function(client) {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});
