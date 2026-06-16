const CACHE_NAME = "rta-cache-v2";
const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/logo192.png",
    "/logo512.png"
];

// Install a service worker
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

// Cache and return requests with Network-First strategy
self.addEventListener("fetch", (event) => {
    // Only intercept GET requests from the same origin
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip caching for API calls if they happen to start with the same origin
    if (event.request.url.includes("/api/")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200 && response.type === "basic") {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails (offline)
                return caches.match(event.request);
            })
    );
});

// Update service worker and claim clients immediately
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Claim clients immediately to activate the new SW
    );
});

