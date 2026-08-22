// IMTEYAZ SKILL HUB — service worker
// Purpose: makes the site installable as an app and lets it load offline
// after the first visit. Uses a simple "network first, fallback to cache"
// strategy so you always get the latest version when online, and the
// last-seen version when offline.

const CACHE_NAME = "imteyaz-skill-hub-v1";
const CORE_FILES = [
  "./index.html",
  "./book.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// On install: pre-cache the core app files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

// On activate: clean up old caches if the version number ever changes
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// On fetch: try the network first (so updates show up), fall back to the
// cache if offline, and save every successful response for next time.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
