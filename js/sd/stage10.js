// ステージ10 の飾り・テーマの上書き（tools/art/stages/10_rokko_kikusei.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

// 流れ星（ときどき空をすべる）
function shootingStar(ctx, cam, vw, time) {
  const P = 6.5, t = time % P;
  if (t > 1.1) return;
  const k = Math.floor(time / P), u = t / 1.1;
  const sx = 40 + ((k * 211) % Math.max(100, vw - 140)), sy = 12 + ((k * 53) % 46);
  const x = sx + u * 110, y = sy + u * 34, a = Math.sin(u * Math.PI);
  const g = ctx.createLinearGradient(x - 36, y - 11, x, y);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${0.9 * a})`);
  ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 36, y - 11); ctx.lineTo(x, y); ctx.stroke();
  glow(ctx, x, y, 4, '255,255,255', 0.8 * a);
}

export const DECOS = {
  // 牧場
  s10_barn: (ctx, d, x, y) => Art.draw(ctx, 's10/barn', x, y),
  s10_fence(ctx, d, x, y) { for (let i = 0; i < (d.n || 1); i++) Art.draw(ctx, 's10/fence', x + i * 32, y); },
  s10_sheep(ctx, d, x, y, time) {
    const bob = Math.abs(Math.sin((time + x * 0.1) * 2)) * 0.8;
    Art.draw(ctx, 's10/sheep', x + 8, y - bob, !!d.flip);
  },
  s10_tree(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, 's10/tree', x + 8, y, !!d.flip, k, k); },
  // ちょうちん（あたたかい光）
  s10_lantern(ctx, d, x, y, time) {
    const a = 0.5 + Math.sin(time * 2.3 + x) * 0.05;
    glow(ctx, x + 13, y - 30, 26, '255,200,120', a);
    Art.draw(ctx, 's10/lantern', x + 8, y);
  },
  // 駅（虹の駅・星の駅）。名前は板に描く
  s10_station(ctx, d, x, y) {
    const hoshi = d.v === 'hoshi';
    glow(ctx, x + (hoshi ? 90 : 50), y - 25, 60, '255,210,140', 0.22);
    if (!Art.draw(ctx, hoshi ? 's10/hoshi' : 's10/niji', x, y)) return;
    text(ctx, d.text || '', x + (hoshi ? 67 : 50), y - 63.2, 6.6, '#2a3050');
  },
  s10_gantry: (ctx, d, x, y) => Art.draw(ctx, 's10/gantry', x + 30, y),
  s10_pylon(ctx, d, x, y, time) {
    Art.draw(ctx, 's10/pylon', x + 8, y);
    if (Math.sin(time * 3) > 0) glow(ctx, x + 8, y - 75, 8, '255,90,70', 0.7);
  },
  // ロープウェーのワイヤー（夜は明るい灰色）
  s10_cable(ctx, d) {
    const x1 = d.x + 8, y1 = d.y - 34, x2 = d.x2 * TILE + 8, y2 = d.y2 * TILE - 34;
    ctx.lineCap = 'round';
    for (const [dy, c, w] of [[0, '#8e98b8', 1.5], [-3.6, '#737d9c', 1.1], [-0.5, '#d4dcf4', 0.45]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x1, y1 + dy); ctx.lineTo(x2, y2 + dy); ctx.stroke();
    }
  },
  // 摩耶ケーブルの線路（細い鉄の橋げた。乗れる地面ではないので細く暗く）
  s10_track(ctx, d, x, y) {
    const w = d.w || 3, xa = d.x + w * TILE / 2, ya = d.y + 7;   // 車の中心の通り道（床より 7 下）
    const xb = d.x2 * TILE, yb = d.y2 * TILE + 0.5;
    const slope = (yb - ya) / (xb - xa), X0 = d.x, Y0 = ya + (X0 - xa) * slope, gy = d.ground * TILE;
    const at = px => ya + (px - xa) * slope;
    // 柱
    ctx.strokeStyle = '#3a4262'; ctx.lineWidth = 2;
    for (let px = X0 + 10; px < xb - 6; px += 30) { const ty = at(px) + 3; if (gy - ty < 4) continue; ctx.beginPath(); ctx.moveTo(px, ty); ctx.lineTo(px, gy); ctx.stroke(); }
    ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(90,102,140,0.9)';
    for (let px = X0 + 10; px < xb - 36; px += 30) { const t1 = at(px) + 3, t2 = at(px + 30) + 3; if (gy - t1 < 12) continue; ctx.beginPath(); ctx.moveTo(px, t1 + 4); ctx.lineTo(px + 30, Math.min(gy, t1 + 22)); ctx.moveTo(px, Math.min(gy, t1 + 22)); ctx.lineTo(px + 30, t2 + 4); ctx.stroke(); }
    // けた
    ctx.strokeStyle = '#2c3350'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(X0, Y0 + 2.6); ctx.lineTo(xb, yb + 2.6); ctx.stroke();
    // まくら木
    ctx.strokeStyle = '#5a4a44'; ctx.lineWidth = 1.4;
    const len = Math.hypot(xb - X0, yb - Y0), n = Math.floor(len / 5);
    for (let i = 0; i <= n; i++) { const u = i / n, px = X0 + (xb - X0) * u, py = Y0 + (yb - Y0) * u; ctx.beginPath(); ctx.moveTo(px - 1.2, py - 0.6); ctx.lineTo(px + 1.2, py + 1.4); ctx.stroke(); }
    // レール（月あかりで光る）
    ctx.strokeStyle = '#9aa6c8'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(xb, yb); ctx.stroke();
    ctx.strokeStyle = 'rgba(230,238,255,0.8)'; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(X0, Y0 - 0.4); ctx.lineTo(xb, yb - 0.4); ctx.stroke();
  },
  // 掬星台
  s10_monument(ctx, d, x, y, time) {
    const a = 0.45 + Math.sin(time * 3) * 0.15;
    glow(ctx, x + 8, y - 47, 30, '255,225,120', a);
    Art.draw(ctx, 's10/monument', x + 8, y);
  },
  s10_lamp(ctx, d, x, y) {
    glow(ctx, x + 8, y - 53, 34, '255,220,150', 0.55);
    Art.draw(ctx, 's10/lamp', x + 8, y);
  },
  s10_bench: (ctx, d, x, y) => Art.draw(ctx, 's10/bench', x, y, !!d.flip),
  s10_scope: (ctx, d, x, y) => Art.draw(ctx, 's10/scope', x + 8, y, !!d.flip),
  // ケーブルカー（まどに明かり・前のライト）
  pf_cablecar(ctx, pf, x, y, w, time, night) {
    if (!Art.has('s10/cablecar')) return false;
    glow(ctx, x + w / 2, y - 12, 34, '255,214,140', 0.3);
    Art.draw(ctx, 's10/cablecar', x, y, false, w / 48, 1);
  }
};

export const THEMES = {
  rokko: {
    sky: ['#070f2c', '#3a4a8a'],
    skyStops: [[0, '#060d28'], [0.4, '#111c4e'], [0.7, '#22306c'], [1, '#34427e']],
    wash: 'rgba(10,14,40,0.14)'
  },
  kikusei: {
    sky: ['#040a22', '#34448a'],
    skyStops: [[0, '#040a22'], [0.3, '#0c1544'], [0.55, '#1c2a68'], [1, '#2e3e84']],
    wash: 'rgba(10,14,40,0.12)'
  }
};
export const BG = {
  rokko: { artDyn: { after: 0, draw: shootingStar } },
  kikusei: { artDyn: { after: 0, draw: shootingStar } }
};
