// IMTEYAZ SKILL HUB — service worker (v2)
// हर बार सर्वर से पूछता है कि फाइल बदली है या नहीं (no-cache), इसलिए GitHub पर नई फाइल डालते ही
// ऐप में बदलाव दिखता है। नेट न हो तो आख़िरी देखा हुआ वर्शन चलता है।
// हर बार बड़ा बदलाव डालें तो नीचे का नंबर बढ़ा दें (v2 -> v3 ...)।

const CACHE_NAME = "imteyaz-skill-hub-v2";
const CORE_FILES = [
  "./",
  "./index.html",
  "./book.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(CORE_FILES.map((u) =>
        fetch(new Request(u, { cache: "reload" }))
          .then((r) => (r.ok ? cache.put(u, r) : null))
          .catch(() => null)
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  // अपनी साइट की फाइलें: हमेशा सर्वर से ताज़ा जांचकर लो (HTTP cache की देरी नहीं)
  const network = sameOrigin
    ? fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" }))
    : fetch(req);

  event.respondWith(
    network
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
  );
});
