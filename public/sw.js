const CACHE_NAME = 'nexus-market-v3';
const urlsToCache = [
  '/',
  '/auth',
  '/dashboard',
  '/biblioteca',
  '/perfil',
  '/manifest.json',
  '/maskable-icon-512x512.png',
  '/pwa-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache Supabase requests - always go network-first
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        // If network fails, return a basic error response instead of cached content
        return new Response('Network error', { status: 503 });
      })
    );
    return;
  }
  
  // For navigation requests (pages), use network-first strategy
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'document' ||
      urlsToCache.includes(url.pathname)) {
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          // If network succeeds, cache the response and return it
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, return cached version
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other assets (static files), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request.clone()).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});