const CACHE_VERSION = "hyzr-code-v3";
const APP_SHELL = ["/", "/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("hyzr-code-") && key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_VERSION).then((cache) => cache.put("/", response.clone()));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  // A voice manifest contains byte offsets into its matching lecture files.
  // Serving a stale manifest beside a newly deployed recording (or vice versa)
  // turns later slides into unrelated fragments. Always refresh this tiny map;
  // the versioned request remains available offline as a fallback.
  if (/^\/voice-packs\/[^/]+\/manifest\.json$/.test(url.pathname) || url.pathname === "/reels/audio/manifest.json") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone())).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  const cacheable =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/pyodide/") ||
    url.pathname.startsWith("/voice-packs/") ||
    url.pathname.startsWith("/reels/audio/") ||
    url.pathname.startsWith("/models/") ||
    APP_SHELL.includes(url.pathname);

  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone())).catch(() => {});
        }
        return response;
      });
    }),
  );
});
