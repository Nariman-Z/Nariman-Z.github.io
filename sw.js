const CACHE_NAME = "offline-v2";  // Update cache version
const OFFLINE_URLS = [
    "/",
    "/index.html",
    "/offline.html",
    "/assets/css/styles.css",               // Add CSS files
    "/assets/css/swiper-bundle.min.css",
    "/assets/js/main.js",                   // Add JS files
    "/assets/js/swiper-bundle.min.js",
    "/assets/img/about.jpg",                // Add images
    "/assets/img/banner.jpg",
    "/assets/img/blob.svg",
    "/assets/img/icon.png",
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
    "/assets/pdf/Nariman Ziaie (CV).pdf"    // Add pdf files
];

// Install event – Precache resources
self.addEventListener("install", event => {
    event.waitUntil(preCache());
});

// Pre-cache important assets
const preCache = () => {
    console.log("Installing and caching important resources...");
    return caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(OFFLINE_URLS);
    });
};

// Fetch event – Handle requests
self.addEventListener("fetch", event => {
    event.respondWith(handleFetch(event.request));
    event.waitUntil(updateCache(event.request));
});

// Handle fetch request (Network First for dynamic content, Cache First for static assets)
const handleFetch = request => {
    // Cache first for static assets
    if (OFFLINE_URLS.includes(request.url) || request.url.endsWith(".html")) {
        return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                console.log(`Returning cached resource: ${request.url}`);
                return cachedResponse;
            }
            return fetch(request).catch(() => returnFromCache(request));  // Fallback to cache
        });
    }
    
    // Network first for dynamic content (e.g., API requests)
    return fetch(request).then(response => {
        if (!response || response.status !== 200) {
            return returnFromCache(request);  // Return from cache if failed
        }
        return response;
    }).catch(() => returnFromCache(request));  // Fallback to cache if network fails
};

// Update the cache with new resources
const updateCache = request => {
    return caches.open(CACHE_NAME).then(cache => {
        return fetch(request).then(response => {
            if (response.ok) {
                console.log(`Caching new resource: ${request.url}`);
                cache.put(request, response);
            }
        }).catch(error => {
            console.warn(`Failed to fetch resource for cache update: ${error}`);
        });
    });
};

// Return from cache when resource is not found in the network
const returnFromCache = request => {
    return caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(matching => {
            if (matching) {
                return matching;
            }
            // If the resource is not found, return an offline page (fallback)
            return cache.match("offline.html");
        });
    });
};

// Activate event – Clean up old caches
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
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
});