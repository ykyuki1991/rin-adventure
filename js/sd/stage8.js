// ステージ8 の飾り・テーマの上書き（tools/art/stages/08_suma.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

export const DECOS = {
  // 須磨海浜水族園（シャチのモニュメント）
  s8_aqua(ctx, d, x, y) {
    if (!Art.draw(ctx, 's8/aqua', x, y)) return;
    text(ctx, d.text || '須磨海浜水族園', x + 92, y - 67, 6.4, '#1f6fb0');
    text(ctx, d.kana || 'すまかいひんすいぞくえん', x + 92, y - 61, 2.8, '#5a7a96', null, 'normal');
  },
  // 海の家（v:0 は屋根に乗れる平らな屋根、v:1 は三角屋根のかき氷やさん）
  s8_umi(ctx, d, x, y) {
    const v = d.v || 0;
    if (!Art.draw(ctx, 's8/umi' + v, x, y)) return;
    if (v === 0) {
      text(ctx, d.text || '海の家', x + 64, y - 38.2, 7.6, '#1d5f96');
      text(ctx, '氷', x + 137, y - 57.2, 7, '#e8453c');
    } else {
      text(ctx, d.text || 'かき氷', x + 55, y - 42, 7.6, '#c0392b');
      text(ctx, '氷', x - 4, y - 47.2, 7, '#e8453c');
    }
  },
  // ビーチパラソル（上に乗れる。x,y は乗れる面の左はし、d.base は地面の行）
  s8_para(ctx, d, x, y) {
    const cx = x + 16, gy = (d.base || 13) * TILE;
    if (!Art.has('s8/para0')) return;
    ctx.fillStyle = 'rgba(120,90,50,0.25)'; ctx.beginPath(); ctx.ellipse(cx, gy, 5, 1.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d7dbe2'; ctx.fillRect(cx - 1.1, y + 6, 2.2, gy - y - 6);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 1.1, y + 6, 0.8, gy - y - 6);
    ctx.fillStyle = '#9aa1ab'; ctx.fillRect(cx + 0.6, y + 6, 0.5, gy - y - 6);
    Art.draw(ctx, 's8/para' + ((d.color || 0) % 4), x, y);
  },
  s8_pine(ctx, d, x, y) { const k = d.s || 1; Art.draw(ctx, d.v ? 's8/pine1' : 's8/pine', x + 8, y, !!d.flip, k, k); },
  s8_life(ctx, d, x, y) { Art.draw(ctx, 's8/life', x + 8, y, !!d.flip); },
  s8_chair(ctx, d, x, y) { Art.draw(ctx, 's8/chair', x, y, !!d.flip); },
  s8_castle(ctx, d, x, y) { Art.draw(ctx, 's8/castle', x, y, !!d.flip); },
  s8_toys(ctx, d, x, y) { Art.draw(ctx, 's8/toys', x, y, !!d.flip); },
  // シャチ（乗れる足場）
  pf_orca(ctx, pf, x, y, w) {
    if (!Art.has('s8/orca')) return false;
    ctx.save();
    ctx.translate(x + w / 2, y + 10);
    ctx.rotate(Math.atan2(pf.vyNow || 0, 120 * (pf.facing || 1)) * 0.6);
    Art.draw(ctx, 's8/orca', 0, 0, (pf.facing || 1) < 0, w / 48, 1);
    ctx.restore();
  }
};

export const THEMES = {
  suma: {
    skyStops: [[0, '#2c8ee8'], [0.3, '#4fb0f2'], [0.55, '#8fd0f7'], [0.62, '#cdeefb'], [1, '#e6f7fc']],
    wash: 'rgba(238,248,252,0.16)'
  }
};

// 沖を行き来するヨット（淡路島の層のすぐ前・山の層より奥）
const YACHTS = [[0, 0.7, 162, 7, 0], [1, 0.55, 156, 5, 380], [2, 0.8, 168, -6, 760], [1, 0.45, 152, -4, 1100]];
export const BG = {
  suma: {
    artDyn: { after: 1, draw(ctx, cam, vw, time) {
      if (!Art.has('s8/yacht0')) return;
      const P = vw + 400;
      for (const [v, s, yy, sp, off] of YACHTS) {
        const x = ((off + time * sp - cam * 0.04) % P + P) % P - 200;
        const bob = Math.sin(time * 1.3 + off) * 0.4;
        Art.draw(ctx, 's8/yacht' + v, x, yy + bob, sp < 0, s, s);
      }
    } }
  }
};
