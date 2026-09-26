// ステージ9 の飾り・テーマの上書き（tools/art/stages/09_maiko_bridge.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

export const DECOS = {
  // 舞子公園
  s9_ijo(ctx, d, x, y) { Art.draw(ctx, 's9/ijo', x + 8, y, !!d.flip); },
  s9_muto(ctx, d, x, y) { Art.draw(ctx, 's9/muto', x, y, !!d.flip); },
  s9_pine(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, 's9/pine' + (d.v || 0), x + 8, y, !!d.flip, k, k); },
  s9_lamp(ctx, d, x, y) { Art.draw(ctx, 's9/lamp', x + 8, y); },
  // 主塔（遊べる主塔の上にかぶせる。x,y は主塔のてっぺんの左はし）
  s9_tower(ctx, d, x, y) {
    Art.draw(ctx, 's9/tw', x, y);
    Art.draw(ctx, 's9/twlow', x, (d.low || 12) * TILE);
  },
  // 主塔の、道路の高さ（くぐれるところ）: 奥の脚がうすく見える
  s9_twgap(ctx, d, x, y) { Art.draw(ctx, 's9/twgap', x, y); },
  // ハンガーロープ（主ケーブルから道路へ、2本ずつ）
  s9_hangers(ctx, d) {
    for (const [px, top, bottom] of d.lines) {
      ctx.fillStyle = 'rgba(150,170,172,0.85)';
      ctx.fillRect(px - 1.3, top, 0.8, bottom - top); ctx.fillRect(px + 0.5, top, 0.8, bottom - top);
      ctx.fillStyle = 'rgba(245,249,249,0.95)';
      ctx.fillRect(px - 1.3, top, 0.35, bottom - top); ctx.fillRect(px + 0.5, top, 0.35, bottom - top);
      ctx.fillStyle = '#8fa1a3'; ctx.fillRect(px - 2.2, top - 1.4, 4.4, 2.4);
      ctx.fillStyle = '#c9d5d5'; ctx.fillRect(px - 2.2, top - 1.4, 4.4, 0.8);
      ctx.fillStyle = '#8fa1a3'; ctx.fillRect(px - 2, bottom - 1.6, 4, 1.6);
    }
  },
  // 側径間のケーブル（アンカレイジから主塔のてっぺんへ・奥にうすく）
  s9_side(ctx, d) {
    const x0 = d.x, y0 = d.y, x1 = d.x2 * TILE, y1 = d.y2 * TILE + 4;
    const cx = x0 + (x1 - x0) * 0.62, cy = y0 - (y0 - y1) * 0.2;
    const at = u => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1];
    ctx.save(); ctx.globalAlpha = 0.55;
    for (let u = 0.08; u < 0.97; u += 0.07) {
      const [hx, hy] = at(u);
      ctx.fillStyle = 'rgba(170,188,190,0.8)'; ctx.fillRect(hx - 0.4, hy, 0.8, d.y - hy);
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#b7c6c7'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
    ctx.strokeStyle = '#f4f8f8'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0 - 1); ctx.quadraticCurveTo(cx, cy - 1, x1, y1 - 1); ctx.stroke();
    ctx.restore();
  },
  // 点検通路をつるす棒（道路の下）
  s9_rods(ctx, d, x) {
    const x1 = (d.x2 + 1) * TILE;
    for (let px = x + 6; px < x1; px += 32) {
      ctx.fillStyle = '#56666e'; ctx.fillRect(px, 192, 1.6, 16);
      ctx.fillStyle = '#9fb0b6'; ctx.fillRect(px, 192, 0.5, 16);
    }
  }
};

export const THEMES = {
  maiko: {
    skyStops: [[0, '#2f8ee6'], [0.35, '#5fb2f0'], [0.58, '#a9d9f6'], [0.64, '#d7eefa'], [1, '#eaf6fb']],
    wash: 'rgba(236,246,252,0.16)'
  },
  // 午後：水平線のほうが あたたかい色
  bridge: {
    skyStops: [[0, '#3a84d2'], [0.28, '#68a8e2'], [0.45, '#b9cfe3'], [0.53, '#eedfcc'], [0.58, '#f7d8b4'], [1, '#f3cfa4']],
    wash: 'rgba(246,242,236,0.14)'
  }
};

// 海峡を行き来する船
function ships(list, ctx, cam, vw, time, par) {
  const P = vw + 500;
  for (const [v, s, yy, sp, off] of list) {
    const x = ((off + time * sp - cam * par) % P + P) % P - 250;
    Art.draw(ctx, 's9/ship' + v, x, yy + Math.sin(time * 0.9 + off) * 0.3, sp < 0, s, s);
  }
}
const MAIKO_SHIPS = [[0, 0.45, 170, 4, 60], [1, 0.5, 176, -6, 420], [2, 0.6, 182, 8, 240]];
const BRIDGE_SHIPS = [[0, 0.32, 150, 5, 0], [1, 0.36, 154, -7, 320], [2, 0.42, 157, 9, 600], [0, 0.26, 147, -4, 860]];
export const BG = {
  maiko: { artDyn: { after: 1, draw(ctx, cam, vw, time) { if (Art.has('s9/ship0')) ships(MAIKO_SHIPS, ctx, cam, vw, time, 0.04); } } },
  bridge: { artDyn: { after: 2, draw(ctx, cam, vw, time) { if (Art.has('s9/ship0')) ships(BRIDGE_SHIPS, ctx, cam, vw, time, 0.05); } } }
};
