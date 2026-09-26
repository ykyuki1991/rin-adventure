// ステージ4 の飾り・テーマの上書き（tools/art/stages/04_ropeway.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

// ロープウェイのワイヤー（2本：支えのワイヤーと引っぱるワイヤー）。ゴンドラのつり手は床より 34 上
function cable(ctx, d, night) {
  const x1 = d.x + 8, y1 = d.y - 34, x2 = d.x2 * TILE + 8, y2 = d.y2 * TILE - 34;
  ctx.lineCap = 'round';
  const lines = night
    ? [[0, '#8e98b8', 1.5], [-3.6, '#737d9c', 1.1], [-0.5, '#d4dcf4', 0.45]]
    : [[0, '#2c323b', 1.5], [-3.6, '#454c57', 1.1], [-0.5, '#aab4c2', 0.45]];
  for (const [dy, c, w] of lines) {
    ctx.strokeStyle = c; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1 + dy); ctx.lineTo(x2, y2 + dy); ctx.stroke();
  }
}

export const DECOS = {
  s4_cable: (ctx, d, x, y, time, night) => cable(ctx, d, night),
  // 駅（v:0 ふもと＝右に入り口・幅224 / v:1 中間・山頂＝左に入り口・幅128）。名前は板に描く
  s4_station(ctx, d, x, y) {
    const big = !d.v;
    if (!Art.draw(ctx, big ? 's4/station0' : 's4/station1', x, y)) return;
    if (d.text) text(ctx, d.text, x + (big ? 88.5 : 87.5), y - 55.2, 6.4, '#1f5a54');
  },
  s4_gantry: (ctx, d, x, y) => Art.draw(ctx, 's4/gantry', x + 30, y),
  // 鉄塔（y は点検台の上面＝柱のいちばん上のマス）
  s4_pylon: (ctx, d, x, y) => Art.draw(ctx, 's4/pylon' + (d.v || 'A'), x + 8, y),
  s4_resthouse(ctx, d, x, y) {
    if (!Art.draw(ctx, 's4/resthouse', x, y)) return;
    text(ctx, d.text || 'レストハウス', x + 77, y - 27.3, 4.6, '#6a4430');
  },
  s4_greenhouse: (ctx, d, x, y) => Art.draw(ctx, 's4/greenhouse', x, y),
  s4_lavender(ctx, d, x, y) { for (let i = 0; i < (d.n || 1); i++) Art.draw(ctx, 's4/lavender', x + i * 96, y); },
  s4_planter: (ctx, d, x, y) => Art.draw(ctx, 's4/planter', x, y, !!d.flip),
  s4_bench: (ctx, d, x, y) => Art.draw(ctx, 's4/bench', x, y, !!d.flip),
  s4_lamp: (ctx, d, x, y) => Art.draw(ctx, 's4/lamp', x + 8, y),
  s4_tree(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, 's4/tree', x + 8, y, !!d.flip, k, k); },
  s4_cypress(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, 's4/cypress', x + 8, y, false, k, k); },
  s4_flowerbed: (ctx, d, x, y) => Art.draw(ctx, 's4/flowerbed', x, y),
  s4_scope: (ctx, d, x, y) => Art.draw(ctx, 's4/scope', x + 8, y, !!d.flip),
  s4_terrace: (ctx, d, x, y) => Art.draw(ctx, 's4/terrace', x, y),
  s4_ivy(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, 's4/ivy' + (d.v || 0), x + 8, y + 2, !!d.flip, k, k); },
  // ゴンドラ（赤い箱・大きな窓。夜は窓に明かり）
  pf_gondola(ctx, pf, x, y, w, time, night) {
    if (!Art.has('s4/gondola')) return false;
    if (night) glow(ctx, x + w / 2, y - 12, 26, '255,214,140', 0.35);
    Art.draw(ctx, night ? 's4/gondolaL' : 's4/gondola', x, y, false, w / 32, 1);
  }
};

export const THEMES = {
  ropeway: {
    sky: ['#3d97e6', '#eef6fa'],
    skyStops: [[0, '#3a92e4'], [0.3, '#62b2ee'], [0.55, '#9fd2f5'], [0.75, '#cfe8f8'], [1, '#eaf4f8']],
    wash: 'rgba(238,246,252,0.16)'
  }
};
export const BG = {};
