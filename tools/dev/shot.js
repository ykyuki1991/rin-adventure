// ゲームの画面を撮る（開発用）。先にプロジェクトのフォルダで python3 -m http.server <port> を動かしておく
// 使い方: NODE_PATH=/home/claude/.npm-global/lib/node_modules node tools/dev/shot.js --port 8765 --stages 5,6 --at 0.1,0.5 --out /tmp/shots [--dpr 1.5] [--grid /tmp/grid.png] [--cols 2]
//   --at はステージの長さに対する割合（0〜1）。その位置にりんを置き、1.5秒ぶん動かしてから撮る
//   --grid をつけると、撮った画像を1枚にならべた画像も作る
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const port = arg('port', '8765'), out = arg('out', '/tmp/shots'), dpr = parseFloat(arg('dpr', '1.5'));
const stages = arg('stages', '1').split(','), at = arg('at', '0.02,0.3,0.55,0.8').split(',').map(Number);
const grid = arg('grid', null), cols = parseInt(arg('cols', '2'), 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  const files = [];
  for (const st of stages) {
    await page.goto(`http://localhost:${port}/index.html?stage=${st}`); await sleep(2500);
    for (const [i, f] of at.entries()) {
      await page.evaluate((f) => {
        const app = window.__rin; let g = app.game;
        // 前の位置でミスしていても影響しないよう、毎回ステージを始めからにする
        if (g.state !== 'play') { g.start(g.stageIdx); g = app.game; }
        g.banner = 0;
        const p = g.player; p.inv = 99;
        p.x = Math.max(40, g.level.w * 16 * f); p.vy = 0;
        // その位置の足場の上に置く（穴の上なら少し右の足場をさがす）
        const L = g.level;
        let placed = false;
        for (let dx = 0; dx < 12 && !placed; dx++) {
          const tx = Math.floor(p.x / 16) + dx;
          for (let ty = 1; ty < L.h - 1; ty++) {
            const t = L.get(tx, ty);
            if (t !== 0 && t !== 13 && t !== 20 && L.get(tx, ty - 1) === 0) { p.x = tx * 16 + 2; p.y = ty * 16 - p.h - 1; placed = true; break; }
          }
        }
        if (!placed) p.y = 10;
        const inp = { left: false, right: false, jump: false, jumpPressed: false };
        for (let k = 0; k < 90; k++) { p.inv = 99; g.update(1 / 60, inp); }
        p.inv = 0;
        app.renderer.draw(g, app);
      }, f);
      await sleep(250);
      const fn = path.join(out, `s${st}_${i}.png`);
      await page.screenshot({ path: fn });
      files.push(fn);
    }
  }
  console.log('ERRORS', [...new Set(errs)].join('\n') || 'none');
  await browser.close();
  if (grid) {
    const W = 1266 / Math.max(1, cols) * (cols === 1 ? 1 : 1);
    const imgs = await Promise.all(files.map(f => sharp(f).resize({ width: Math.round(W) }).png().toBuffer({ resolveWithObject: true })));
    const H = imgs[0].info.height, w = imgs[0].info.width;
    const rows = Math.ceil(imgs.length / cols);
    await sharp({ create: { width: cols * w + (cols - 1) * 4, height: rows * H + (rows - 1) * 4, channels: 3, background: '#222' } })
      .composite(imgs.map((im, i) => ({ input: im.data, left: (i % cols) * (w + 4), top: Math.floor(i / cols) * (H + 4) }))).png().toFile(grid);
    console.log('grid', grid);
  }
})();
