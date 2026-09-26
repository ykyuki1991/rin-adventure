// ステージ6 の飾り・テーマの上書き（tools/art/stages/06_sannomiya_nankin.mjs の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

// センター街の店：[看板の文字, 文字の色]
const CG = {
  fuku: ['ふく', '#d85a88'], kutsu: ['くつ', '#ffffff'], honya: ['ほんや', '#3f8a45'],
  cafe: ['カフェ', '#fff3dc'], pan: ['パン', '#c0503a'], zakka: ['ざっか', '#c9861a']
};
// 屋台の看板の色（0: 豚まん / 1: 餃子 / 2: ごま団子）
const STALL_TEXT = ['#8e1f1b', '#1f5a42', '#b8521a'];

// 湯気（ふわふわ上がって消える）
function steam(ctx, x, y, time, n = 3) {
  for (let i = 0; i < n; i++) {
    const u = ((time * 0.55 + i / n) % 1);
    const px = x + Math.sin((time + i) * 2.2) * 1.6, py = y - u * 14, r = 1.6 + u * 2.6;
    ctx.fillStyle = `rgba(255,255,255,${(1 - u) * 0.75})`;
    ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.arc(px + r * 0.8, py + 0.6, r * 0.7, 0, TAU); ctx.fill();
  }
}
// くり返して描く（w ドットで切る）
function repeat(ctx, name, x, y, w, step, clipTop, clipH) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y + clipTop, w, clipH); ctx.clip();
  for (let px = x; px < x + w; px += step) Art.draw(ctx, name, px, y);
  ctx.restore();
  return true;
}
const put = (name, dx = 8) => (ctx, d, x, y) => { const k = d.s || 1; return Art.draw(ctx, name, x + dx, y, !!d.flip, k, k); };

export const DECOS = {
  // 三宮の駅ビル
  s6_station: (ctx, d, x, y) => {
    if (!Art.draw(ctx, 's6/station', x, y)) return false;
    text(ctx, d.text || '三宮駅', x + 75, y - 45, 2.8, '#6e1826');
    return true;
  },
  // センター街の店（アーケードの屋根の下）
  s6_shops: (ctx, d, x, y) => {
    const w = (d.w || 10) * TILE, kinds = d.shops || Object.keys(CG);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y - 100, w, 104); ctx.clip();
    for (let i = 0, sx = x; sx < x + w; i++, sx += 64) {
      const k = kinds[i % kinds.length];
      Art.draw(ctx, 's6/cg/' + k, sx, y);
      text(ctx, CG[k][0], sx + 32, y - 63.5, 6.5, CG[k][1]);
    }
    ctx.restore();
    return true;
  },
  // センター街の入口
  s6_cgate: (ctx, d, x, y) => {
    if (!Art.draw(ctx, 's6/cgate', x, y)) return false;
    text(ctx, d.text || '三宮センター街', x + 52, y - 127.5, 7.2, '#23466e');
    if (d.kana !== '') text(ctx, d.kana || 'さんのみや せんたーがい', x + 52, y - 121.2, 2.8, '#6a7a8a');
    return true;
  },
  s6_tree: put('s6/tree'),
  s6_signal: put('s6/signal', 4),
  s6_pavilion: put('s6/pavilion'),
  // 横断歩道（layer: 'mid' で地面のふちの上に）
  s6_zebra: (ctx, d, x, y) => repeat(ctx, 's6/zebra', x, y + 0.2, (d.w || 3) * TILE, 48, -1, 6),
  // ポートライナーの高架
  s6_guideway: (ctx, d, x, y) => repeat(ctx, 's6/guideway', x, y, (d.w || 8) * TILE, 64, 0, 140),
  // 長安門・西安門（y は屋根のてっぺん＝歩けるところ）
  s6_gate: (ctx, d, x, y) => {
    const k = (d.w || 8) / 8;
    if (!Art.draw(ctx, 's6/gate', x, y, false, k, 1)) return false;
    text(ctx, d.text || '長安門', x + 64 * k, y + 35.8, 9.5, '#8e1f1b');
    return true;
  },
  // 屋台（v: 0 豚まん / 1 餃子 / 2 ごま団子）
  s6_stall: (ctx, d, x, y, time) => {
    const v = d.v || 0;
    if (!Art.draw(ctx, 's6/stall' + v, x, y)) return false;
    text(ctx, d.text || '豚まん', x + 36, y - 46.5, 6.8, STALL_TEXT[v]);
    if (v === 0) for (const [sx, n] of [[18.5, 3], [37.5, 2], [56.5, 3]]) steam(ctx, x + sx, y - 27 - n * 4.4, time + sx);
    if (v === 1) steam(ctx, x + 22, y - 30, time, 4);
    return true;
  },
  // ひもにつるしたちょうちん（ゆらゆら）
  s6_lanterns: (ctx, d, x, y, time) => {
    const w = (d.w || 8) * TILE, sag = 14;
    ctx.strokeStyle = '#4a2e22'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2, x + w, y); ctx.stroke();
    const n = Math.max(3, Math.round(w / 17));
    for (let i = 1; i < n; i++) {
      const u = i / n, lx = x + w * u, ly = y + sag * 4 * u * (1 - u);
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.sin(time * 1.8 + i * 0.9) * 0.07);
      Art.draw(ctx, 's6/lantern', 0, 0);
      ctx.restore();
    }
    return true;
  }
};

export const THEMES = {
  // 夕方の少し前のあたたかい空
  sannomiya: {
    skyStops: [[0, '#6c9ed8'], [0.3, '#aac4e2'], [0.5, '#ecd6c6'], [0.74, '#ffcf9e'], [1, '#ffdaa8']],
    wash: 'rgba(246,238,230,0.15)'
  },
  nankin: {
    skyStops: [[0, '#6f8fd6'], [0.3, '#c6a5cf'], [0.56, '#ffb994'], [0.8, '#ffd3a0'], [1, '#ffe6bb']],
    wash: 'rgba(255,236,222,0.14)'
  }
};

export const BG = {
  // JR の高架の上を走る電車（JR：左から右 / 阪急：右から左、少し奥）
  sannomiya: {
    artDyn: { after: 4, draw(ctx, cam, vw, time) {
      if (!Art.has('s6/bgjr')) return;
      const P = vw + 700;
      const xh = ((-time * 38 - cam * 0.3) % P + P) % P - 300;
      for (let i = 0; i < 3; i++) Art.draw(ctx, 's6/bghk', xh + i * 71, 112.5);
      const xj = ((time * 55 - cam * 0.3 + 350) % P + P) % P - 300;
      for (let i = 0; i < 4; i++) Art.draw(ctx, 's6/bgjr', xj + i * 71, 116);
    } }
  }
};
