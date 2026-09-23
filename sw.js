// オフラインでも遊べるようにするための Service Worker
// ネットにつながっているときは最新のファイルを取りに行き、つながらないときは保存しておいたファイルを使う
// ファイルを追加したら ASSETS にも追加し、VERSION の数字を上げてください
const VERSION = 'rin-adventure-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/config.js',
  './js/physics.js',
  './js/level.js',
  './js/levels.js',
  './js/player.js',
  './js/entities.js',
  './js/game.js',
  './js/render.js',
  './js/sprites.js',
  './js/input.js',
  './js/audio.js',
  './js/storage.js',
  './js/zones.js',
  './js/tiles.js',
  './js/themes.js',
  './js/decos.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const target = req.mode === 'navigate' ? req.url : req;
      const res = await Promise.race([fetch(target, { cache: 'no-cache' }), timeout(4000)]);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (_) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const home = await cache.match('./index.html');
        if (home) return home;
      }
      return new Response('offline', { status: 503 });
    }
  })());
});
