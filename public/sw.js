// Service Worker for IntimDiary PWA
const CACHE_NAME = 'intimdiary-v1';
const STATIC_ASSETS = [
    '/',
    '/favicon.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests - always fetch from network
    if (url.pathname.startsWith('/api/')) return;

    // For navigation requests, try network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('/'))
        );
        return;
    }

    // For static assets, try cache first, then network
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    // Return cached and update in background
                    event.waitUntil(
                        fetch(request)
                            .then(response => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(request, response));
                                }
                            })
                            .catch(() => { })
                    );
                    return cached;
                }

                // No cache, fetch from network
                return fetch(request)
                    .then(response => {
                        if (response.ok && url.origin === self.location.origin) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    });
            })
    );
});
