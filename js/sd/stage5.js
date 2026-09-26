// ステージ5 の飾り・テーマの上書き（tools/art/stages/05_kitano.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';
import { windDir } from '../zones.js';

// 大きさ（s）と向き（flip）をつけて描く
// flip のときは、絵の左はしが同じ場所にくるようにずらす
const put = (name, dx = 8) => (ctx, d, x, y) => {
  const k = d.s || 1, fr = Art.frame(name);
  const sh = d.flip && fr ? (fr[3] - 2 * fr[5]) * k : 0;
  return Art.draw(ctx, name, x + dx + sh, y, !!d.flip, k, k);
};

export const DECOS = {
  s5_rhine: put('s5/rhine', 0),
  s5_eikoku: put('s5/eikoku', 0),
  s5_lamp: put('s5/lamp'),
  s5_planter: put('s5/planter', 0),
  s5_pot: put('s5/pot'),
  s5_cypress: put('s5/cypress'),
  s5_conifer: put('s5/conifer'),
  s5_tree: put('s5/tree'),
  // れんがの壁にたれるツタ（layer: 'mid' で地面の前に描く）
  s5_ivy: (ctx, d, x, y) => { const k = d.s || 1; return Art.draw(ctx, 's5/ivy' + (d.v || 0), x + 8, y + 2.5, !!d.flip, k, k); },
  // 鉄のさく（w マスぶん）
  s5_fence: (ctx, d, x, y) => {
    const w = (d.w || 2) * TILE;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - 20, w + 4, 21); ctx.clip();
    for (let px = x; px < x + w; px += 32) Art.draw(ctx, 's5/fence', px, y);
    ctx.restore();
    for (let px = x; px <= x + w; px += 64) Art.draw(ctx, 's5/fencepost', Math.min(px, x + w), y);
    if (w % 64) Art.draw(ctx, 's5/fencepost', x + w, y);
    return true;
  },
  // 風見鶏の館の塔。てっぺんの風見鶏は、風の向き（d.wind）に合わせて向きをかえる
  s5_tower: (ctx, d, x, y, time) => {
    const cx = x + 8;
    Art.draw(ctx, 's5/tower', cx, y);
    const dir = d.wind ? windDir(d.wind, time) : 1;
    const wob = Math.sin(time * 2.3) * 0.05;
    ctx.save(); ctx.translate(cx, y - 104); ctx.rotate(wob);
    Art.draw(ctx, 's5/rooster', 0, 0, dir < 0);
    ctx.restore();
    return true;
  }
};

export const THEMES = {
  kitano: {
    skyStops: [[0, '#4aa3ea'], [0.35, '#79c1f1'], [0.62, '#b5ddf5'], [1, '#e1f1f8']],
    wash: 'rgba(236,244,252,0.16)'
  }
};
export const BG = {};
