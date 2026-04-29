// ToolHub Service Worker
// Caches static assets for offline functionality

const CACHE_NAME = 'toolhub-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/chatbot.js',
  '/footer.html',
  '/favicon.png',
  // CDN resources that should be cached
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-brands-400.woff2'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.error('Cache install error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests for HTML, CSS, JS
  if (url.origin === location.origin || 
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('jsdelivr.net')) {
    
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            // Return cached version, but also fetch fresh in background
            event.waitUntil(fetchAndCache(request));
            return cached;
          }
          return fetchAndCache(request);
        })
        .catch(() => {
          // Fallback offline page
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
      );
  } else {
    // Let third-party requests (AdSense, APIs) go to network
    event.respondWith(fetch(request));
  }
});

async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Network error', { status: 503 });
  }
}
