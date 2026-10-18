// Service Worker: macht die App offline spielbar.
// CACHE_VERSION bei jeder neuen Version an src/version.js angleichen (siehe CLAUDE.md).
const CACHE_VERSION = '1.10';
const CACHE = `hansis-jass-${CACHE_VERSION}`;
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'src/version.js',
  'src/core/cards.js', 'src/core/rules.js', 'src/core/weis.js', 'src/core/round.js', 'src/core/game.js', 'src/core/rng.js',
  'src/ai/worker.js', 'src/ai/player.js', 'src/ai/knowledge.js', 'src/ai/sampler.js', 'src/ai/search.js',
  'src/ai/policy.js', 'src/ai/strategy.js', 'src/ai/bidding.js',
  'src/ui/app.js', 'src/ui/cards-view.js', 'src/ui/faces.js', 'src/ui/styles.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hansis-jass-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Zuerst Netz (damit neue Versionen sofort ankommen), offline aus dem Cache.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
