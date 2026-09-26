// オフラインでも遊べるようにするための Service Worker
// ネットにつながっているときは最新のファイルを取りに行き、つながらないときは保存しておいたファイルを使う
// ファイルを追加したら ASSETS にも追加し、VERSION の数字を上げてください
const VERSION = 'rin-adventure-v7';
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
  './js/art.js',
  './js/tileart.js',
  './js/art-data.js',
  './js/sd/util.js',
  './js/sd/index.js',
  './js/sd/stage2.js',
  './js/sd/stage3.js',
  './js/sd/stage4.js',
  './js/sd/stage5.js',
  './js/sd/stage6.js',
  './js/sd/stage7.js',
  './js/sd/stage8.js',
  './js/sd/stage9.js',
  './js/sd/stage10.js',
  // ART-START（tools/art/build.mjs が自動で書きかえます）
  './art/chars.svg',
  './art/enemies.svg',
  './art/items.svg',
  './art/tiles.svg',
  './art/decos.svg',
  './art/pf.svg',
  './art/decos2.svg',
  './art/yakumo.svg',
  './art/s2.svg',
  './art/s3.svg',
  './art/s4.svg',
  './art/s5.svg',
  './art/s6.svg',
  './art/s7.svg',
  './art/s8.svg',
  './art/s9.svg',
  './art/s10.svg',
  './art/bg/kitano-0.svg',
  './art/bg/kitano-1.svg',
  './art/bg/kitano-2.svg',
  './art/bg/kitano-3.svg',
  './art/bg/kitano-4.svg',
  './art/bg/meriken-0.svg',
  './art/bg/meriken-1.svg',
  './art/bg/meriken-2.svg',
  './art/bg/meriken-3.svg',
  './art/bg/meriken-4.svg',
  './art/bg/meriken-5.svg',
  './art/bg/harborland-0.svg',
  './art/bg/harborland-1.svg',
  './art/bg/harborland-2.svg',
  './art/bg/harborland-3.svg',
  './art/bg/harborland-4.svg',
  './art/bg/harborland-5.svg',
  './art/bg/zoo-0.svg',
  './art/bg/zoo-1.svg',
  './art/bg/zoo-2.svg',
  './art/bg/zoo-3.svg',
  './art/bg/zoo-4.svg',
  './art/bg/zoo-5.svg',
  './art/bg/shinkobe-0.svg',
  './art/bg/shinkobe-1.svg',
  './art/bg/shinkobe-2.svg',
  './art/bg/shinkobe-3.svg',
  './art/bg/shinkobe-4.svg',
  './art/bg/shinkobe-5.svg',
  './art/bg/falls-0.svg',
  './art/bg/falls-1.svg',
  './art/bg/falls-2.svg',
  './art/bg/falls-3.svg',
  './art/bg/falls-4.svg',
  './art/bg/falls-5.svg',
  './art/bg/ropeway-0.svg',
  './art/bg/ropeway-1.svg',
  './art/bg/ropeway-2.svg',
  './art/bg/ropeway-3.svg',
  './art/bg/ropeway-4.svg',
  './art/bg/ropeway-5.svg',
  './art/bg/sannomiya-0.svg',
  './art/bg/sannomiya-1.svg',
  './art/bg/sannomiya-2.svg',
  './art/bg/sannomiya-3.svg',
  './art/bg/sannomiya-4.svg',
  './art/bg/sannomiya-5.svg',
  './art/bg/nankin-0.svg',
  './art/bg/nankin-1.svg',
  './art/bg/nankin-2.svg',
  './art/bg/nankin-3.svg',
  './art/bg/suma-0.svg',
  './art/bg/suma-1.svg',
  './art/bg/suma-2.svg',
  './art/bg/suma-3.svg',
  './art/bg/suma-4.svg',
  './art/bg/suma-5.svg',
  './art/bg/maiko-0.svg',
  './art/bg/maiko-1.svg',
  './art/bg/maiko-2.svg',
  './art/bg/maiko-3.svg',
  './art/bg/maiko-4.svg',
  './art/bg/bridge-0.svg',
  './art/bg/bridge-1.svg',
  './art/bg/bridge-2.svg',
  './art/bg/bridge-3.svg',
  './art/bg/rokko-0.svg',
  './art/bg/rokko-1.svg',
  './art/bg/rokko-2.svg',
  './art/bg/rokko-3.svg',
  './art/bg/rokko-4.svg',
  './art/bg/rokko-5.svg',
  './art/bg/kikusei-0.svg',
  './art/bg/kikusei-1.svg',
  './art/bg/kikusei-2.svg',
  './art/bg/kikusei-3.svg',
  './art/bg/yakumo-0.svg',
  './art/bg/yakumo-1.svg',
  './art/bg/yakumo-2.svg',
  './art/bg/yakumo-3.svg',
  './art/bg/yakumo-4.svg',
  './art/bg/yakumo-5.svg',
  './art/map.svg',
  // ART-END
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
