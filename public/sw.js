const VERSION = "v3";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  // Alle alten Caches löschen wenn neue SW-Version aktiv wird
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Navigation (HTML-Seiten): immer frisch vom Netz, HTTP-Cache bypassen
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }
  // Statische Assets (_next/static/**): HTTP-Cache normal nutzen (immutable hashes)
});
