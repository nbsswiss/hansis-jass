// Service Worker: macht die App offline spielbar.
// CACHE_VERSION bei jeder neuen Version an src/version.js angleichen (siehe CLAUDE.md).
const CACHE_VERSION = '1.80';
const CACHE = `hansis-jass-${CACHE_VERSION}`;
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'assets/portraits/bauer.jpg',
  'src/version.js',
  'src/core/cards.js', 'src/core/rules.js', 'src/core/weis.js', 'src/core/round.js', 'src/core/game.js', 'src/core/rng.js',
  'src/ai/worker.js', 'src/ai/player.js', 'src/ai/knowledge.js', 'src/ai/sampler.js', 'src/ai/search.js',
  'src/ai/policy.js', 'src/ai/strategy.js', 'src/ai/bidding.js',
  'src/ui/app.js', 'src/ui/cards-view.js', 'src/ui/faces.js', 'src/ui/de-cards.js', 'src/ui/tafel.js', 'src/ui/styles.css',
];

// Beim Installieren am Browser-Cache vorbei laden (GitHub Pages erlaubt sonst 10 Minuten alte Dateien).
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hansis-jass-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Zuerst Netz, und zwar immer beim Server nachfragen (no-cache), damit neue Versionen sofort
// ankommen. Ohne Netz aus dem Cache.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  const network = sameOrigin ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  e.respondWith(
    network
      .then((res) => {
        if (res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req.url, copy));
        }
        return res;
      })
      .catch(() => caches.match(req.url, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
