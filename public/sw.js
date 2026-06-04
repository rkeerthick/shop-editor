const CACHE_NAME = "shop-editor-v1";

// Pages to cache immediately on install
const PRECACHE_URLS = ["/", "/dashboard", "/login"];

// ── Install: pre-cache shell pages ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clear old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first with cache fallback ─────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests; skip API calls and auth routes
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack") ||
    url.pathname.includes("hot-update")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful HTML and static asset responses
        if (
          response.status === 200 &&
          (event.request.destination === "document" ||
            event.request.destination === "script" ||
            event.request.destination === "style" ||
            event.request.destination === "image" ||
            event.request.destination === "font")
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — serve cached version
        return caches.match(event.request).then(
          (cached) => cached ?? caches.match("/dashboard")
        );
      })
  );
});
