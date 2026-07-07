const OFFLINE_CACHE = 'der-erfasser-offline-v1';

// Nur die minimale App-Shell für den Offline-Fallback vorhalten
const APP_SHELL = [
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Alle alten Caches löschen
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== OFFLINE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Network-first für alle Requests: immer frische Ressourcen vom Server.
  // Cache dient nur als Offline-Fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Nur navigations-Antworten im Offline-Cache aktualisieren
        if (request.mode === 'navigate' && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(OFFLINE_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        // Offline: gecachte Shell ausliefern
        caches.match(request).then(
          (cached) => cached || caches.match('/index.html')
        )
      )
  );
});
