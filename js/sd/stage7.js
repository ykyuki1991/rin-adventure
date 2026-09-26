// ステージ7 の飾り・テーマの上書き（tools/art/stages/07_meriken_harborland.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

export const DECOS = {};
const WARM = '255,196,120';

// ---------- ポートタワー ----------
DECOS.s7_tower = (ctx, d, x, y, time) => {
  const cx = x + 8;
  glow(ctx, cx, y - 110, 110, '255,110,90', 0.1);
  Art.draw(ctx, 's7/tower', cx, y);
  // てっぺんの赤いランプ（ゆっくり点滅）
  const a = 0.35 + 0.35 * (Math.sin(time * 2.4) + 1) / 2;
  glow(ctx, cx, y - 213, 7, '255,80,70', a);
};
// タワーの中の足場（赤い鉄のはり）。side: タワーにつながっている側 'L' / 'R'、post: 地面までの柱
DECOS.s7_beam = (ctx, d, x, y) => {
  const w = (d.w || 5) * TILE, side = d.side || 'R';
  const fx = side === 'R' ? x + 3 : x + w - 3, tx = side === 'R' ? x + w - 4 : x + 4;
  ctx.lineCap = 'round';
  // 下のトラス（タワーにつながる側が深い）
  ctx.strokeStyle = '#8e2430'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(fx, y + 6); ctx.lineTo(tx, y + 15); ctx.stroke();
  const n = Math.max(2, Math.round(w / 14));
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const u = i / n, px = fx + (tx - fx) * u, py = y + 6 + 9 * u;
    ctx.moveTo(px, y + 5); ctx.lineTo(px, py);
    if (i < n) { const u2 = (i + 1) / n; ctx.moveTo(px, py); ctx.lineTo(fx + (tx - fx) * u2, y + 5); }
  }
  ctx.stroke();
  if (d.post) {
    const gy = (d.ground || 13) * TILE;
    ctx.fillStyle = '#8e2430'; ctx.fillRect(fx - 1.2, y + 5, 2.4, gy - y - 5);
    ctx.fillStyle = '#e84a3c'; ctx.fillRect(fx - 0.4, y + 5, 0.8, gy - y - 5);
    ctx.fillStyle = '#4a3a50'; ctx.fillRect(fx - 3, gy - 2, 6, 2);
  }
  for (let i = 0; i < (d.w || 5); i++) Art.draw(ctx, 's7/beam', x + i * TILE, y);
};
// 展望台のバルコニー（乗れる）
DECOS.s7_deck = (ctx, d, x, y) => Art.draw(ctx, 's7/deck', x, y);

// ---------- クレーン（つられたコンテナがゆれる） ----------
DECOS.s7_crane = (ctx, d, x, y, time) => {
  if (!Art.draw(ctx, 's7/crane', x, y)) return;
  const tipX = x - 66, tipY = y - 187 + 2;
  const sway = Math.sin(time * 0.8) * 0.05, len = 8 + Math.sin(time * 0.3) * 1.5;
  const hx = tipX + Math.sin(sway) * len, hy = tipY + Math.cos(sway) * len;
  ctx.strokeStyle = '#2e2838'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(tipX - 1.2, tipY); ctx.lineTo(hx - 1.2, hy); ctx.moveTo(tipX + 1.2, tipY); ctx.lineTo(hx + 1.2, hy); ctx.stroke();
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-sway * 0.6); Art.draw(ctx, 's7/hangbox', 0, 0); ctx.restore();
};
// コンテナの山（かべのタイルの上にかぶせる）
DECOS.s7_stack = (ctx, d, x, y) => Art.draw(ctx, 's7/stack' + (d.v || 'A'), x, y);

// ---------- 岸壁の小物 ----------
DECOS.s7_soko = (ctx, d, x, y) => {
  glow(ctx, x + 62, y - 50, 26, WARM, 0.3);
  glow(ctx, x + 83, y - 50, 26, WARM, 0.3);
  Art.draw(ctx, 's7/soko', x, y);
};
DECOS.s7_lamp = (ctx, d, x, y, time) => {
  const cx = x + 8, ly = y - 50;
  const fl = 0.94 + Math.sin(time * 5 + x) * 0.03 + Math.sin(time * 13 + x * 0.3) * 0.02;
  glow(ctx, cx, ly, 34, WARM, 0.34 * fl);
  glow(ctx, cx, ly, 12, '255,230,170', 0.6 * fl);
  Art.draw(ctx, 's7/lamp', cx, y);
};
// 街灯の光が地面を照らす（タイルの前）
DECOS.s7_pool = (ctx, d, x, y) => {
  const cx = x + 8;
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - 40, y, 80, 10); ctx.clip();
  ctx.translate(cx, y + 1); ctx.scale(1, 0.18);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 38);
  g.addColorStop(0, 'rgba(255,226,160,0.5)'); g.addColorStop(1, 'rgba(255,226,160,0)');
  ctx.fillStyle = g; ctx.fillRect(-40, -40, 80, 80);
  ctx.restore();
};
DECOS.s7_bollard = (ctx, d, x, y) => Art.draw(ctx, 's7/bollard', x + 8, y);
DECOS.s7_ladder = (ctx, d, x, y) => Art.draw(ctx, 's7/ladder', x + 8, y);
DECOS.s7_bekobe = (ctx, d, x, y) => {
  Art.draw(ctx, 's7/bekobe', x, y);
  const cx = x + 40, cy = y - 13.5;
  ctx.save();
  ctx.font = '900 15px "Arial Black", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // 文字のあつみ
  for (let k = 3; k >= 1; k--) { ctx.fillStyle = k === 1 ? '#b7a6c2' : '#8f7ea0'; ctx.fillText('BE KOBE', cx - k * 0.55, cy + k * 0.45); }
  const g = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0);
  g.addColorStop(0, '#f4eef8'); g.addColorStop(0.6, '#ffffff'); g.addColorStop(1, '#ffe0c8');
  ctx.fillStyle = g; ctx.fillText('BE KOBE', cx, cy);
  ctx.restore();
};

// ---------- 観覧車（モザイク）：回る輪とイルミネーション ----------
DECOS.s7_wheel = (ctx, d, x, y, time) => {
  const r = (d.r || 4.5) * TILE, sp = d.speed || 0.35;
  glow(ctx, x, y, r * 1.35, '255,150,210', 0.13);
  Art.draw(ctx, 's7/wheelLegs', x, y);
  ctx.save(); ctx.translate(x, y); ctx.rotate(time * sp); Art.draw(ctx, 's7/wheel', 0, 0); ctx.restore();
  // 輪のふちの電球（色がながれる）
  for (let k = 0; k < 48; k++) {
    const a = k / 48 * TAU + time * sp;
    ctx.fillStyle = `hsl(${(k * 15 - time * 90) % 360},95%,72%)`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * (r - 0.3), y + Math.sin(a) * (r - 0.3), 0.9, 0, TAU); ctx.fill();
  }
  glow(ctx, x, y, 7, '255,230,160', 0.7);
};

// ---------- ハーバーランドのレンガ倉庫（かべのタイルの上にかぶせる） ----------
DECOS.s7_renga = (ctx, d, x, y, time) => {
  if (!Art.draw(ctx, 's7/renga', x, y)) return;
  text(ctx, 'れんが倉庫', x + 88, y - 75.2, 5.2, '#ffe6a8');
  // 電球がちかちか
  const cols = ['255,240,168', '255,176,200', '168,224,255', '255,210,122'];
  for (let x0 = 0, j = 0; x0 < 176; x0 += 22, j++) for (let k = 1; k < 6; k++) {
    const u = k / 6, px = x + x0 + 22 * u, py = y - 115.2 + 12 * u * (1 - u);
    const a = 0.25 + 0.25 * Math.sin(time * 3 + (j * 5 + k) * 1.7);
    glow(ctx, px, py, 3.2, cols[(k + j) % 4], a);
  }
};

export const THEMES = {
  // 夕焼け：上は紫、水平線に向かってピンク → オレンジ
  meriken: {
    skyStops: [[0, '#5b4a9c'], [0.22, '#8559a4'], [0.4, '#c56a98'], [0.52, '#ee8a72'], [0.6, '#ffae6a'], [0.66, '#ffc57c'], [1, '#ffd08a']],
    wash: 'rgba(60,36,96,0.14)'
  },
  // 日が沈んだあと：上は藍色、水平線のあたりにピンクの残り火
  harborland: {
    skyStops: [[0, '#231f5e'], [0.25, '#3b2f7a'], [0.44, '#6a4190'], [0.56, '#b0588e'], [0.63, '#e57e84'], [0.68, '#f5a07e'], [1, '#f7b088']],
    wash: 'rgba(24,18,62,0.18)',
    slime: 'green'
  }
};

// 背景の海をゆっくり進む客船（岸の建物の層のすぐ前）
function cruise(ctx, cam, vw, time, f, speed, y) {
  if (!Art.has('s7/cruise')) return;
  const P = vw + 360, x = ((300 + time * speed - cam * f) % P + P) % P - 140;
  Art.draw(ctx, 's7/cruise', x, y + Math.sin(time * 0.9) * 0.4);
}
export const BG = {
  meriken: { artDyn: { after: 4, draw(ctx, cam, vw, time) { cruise(ctx, cam, vw, time, 0.14, 2.2, 171); } } },
  harborland: { artDyn: { after: 4, draw(ctx, cam, vw, time) { cruise(ctx, cam, vw, time, 0.14, 2.2, 172); } } }
};
