const CACHE_NAME = "offline-v1";  // Update cache version
const OFFLINE_URLS = [
    "/",
    "/index.html",
    "/offline.html",
    "/assets/css/styles.css",
    "/assets/css/swiper-bundle.min.css",
    "/assets/js/main.js",
    "/assets/js/swiper-bundle.min.js",
    "/assets/img/about.jpg",
    "/assets/img/banner.jpg",
    "/assets/img/blob.svg",
    "/assets/img/icon192.png",
    "/assets/img/icon512.png",
    "/assets/img/icon1024.png",
    "/assets/img/prifil.png",
    "/assets/img/portfolio1.jpg",
    "/assets/img/portfolio2.jpg",
    "/assets/img/portfolio3.jpg",
    "/assets/img/portfolio4.jpg",
    "/assets/img/portfolio5.jpg",
    "/assets/img/portfolio6.jpg",
    "/assets/img/portfolio7.jpg",
    "/assets/img/portfolio8.jpg",
    "/assets/img/portfolio9.jpg",
    "/assets/img/portfolio10.jpg",
    "/assets/img/project.png",
    "/assets/pdf/Nariman Ziaie (CV).pdf"
];

// Install event – Pre-cache important assets
self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching important resources...");
            return cache.addAll(OFFLINE_URLS);
        })
    );
});

// Fetch event – Handle requests
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`Serving cached resource: ${event.request.url}`);
                return cachedResponse;
            }
            return fetch(event.request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        console.warn(`Network request failed: ${event.request.url}`);
                        return caches.match("/offline.html");
                    }
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        console.log(`Caching new resource: ${event.request.url}`);
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.warn(`Offline: Fallback to offline.html for ${event.request.url}`);
                    return caches.match("/offline.html");
                });
        })
    );
});

// Activate event – Clean up old caches
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    console.log("Service Worker: Activating...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});