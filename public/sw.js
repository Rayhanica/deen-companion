const CACHE_VERSION = "deen-companion-v3";
const APP_SHELL = [
  "/",
  "/quran",
  "/learn",
  "/community",
  "/profile",
  "/duas",
  "/prayer",
  "/manifest.webmanifest",
  "/favicon.png",
  "/brand/deen-companion-mark.png",
  "/brand/deen-companion-icon-192.png",
  "/brand/deen-companion-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const cacheableApi =
    url.pathname.startsWith("/api/quran/") ||
    url.pathname.startsWith("/api/prayer/") ||
    url.pathname.startsWith("/api/search") ||
    url.pathname.startsWith("/api/sources/");

  if (cacheableApi) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.destination !== "document") {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.destination === "document") return caches.match("/");
        return Response.error();
      })
  );
});
