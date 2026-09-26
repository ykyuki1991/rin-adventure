// ステージ3 の飾り・テーマの上書き（tools/art/stages/ の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

export const DECOS = {};
export const THEMES = {};
export const BG = {};

// ---------- 新神戸・布引の滝 ----------
THEMES.shinkobe = {
  skyStops: [[0, '#3f9fe8'], [0.5, '#86ccf4'], [0.85, '#c4e6f6'], [1, '#e2f3fa']],
  wash: 'rgba(236,244,252,0.15)'
};
THEMES.falls = {
  skyStops: [[0, '#58b2dc'], [0.5, '#9dd6e4'], [1, '#dcf1ea']],
  wash: 'rgba(228,242,238,0.17)'
};

// 高架の上を走る新幹線（背景・4枚目の層のあと）
BG.shinkobe = {
  artDyn: { after: 3, draw(ctx, cam, vw, time) {
    if (!Art.has('s3/shinCar')) return;
    const k = 0.3, car = 64 * k, nose = 90 * k, n = 6;
    const len = nose * 2 + car * n;
    const P = vw + len + 900;
    const x = ((time * 110 - cam * 0.2) % P + P) % P - len - 200;
    Art.draw(ctx, 's3/shinNose', x + nose, 127.5, true, k, k);
    for (let i = 0; i < n; i++) Art.draw(ctx, 's3/shinCar', x + nose + i * car - 0.2, 127.5, false, k, k);
    Art.draw(ctx, 's3/shinNose', x + nose + n * car - 0.4, 127.5, false, k, k);
  } }
};
// 森の中をまう葉っぱと光のつぶ（手前の幹の層のうしろ）
BG.falls = {
  artDyn: { after: 3, draw(ctx, cam, vw, time) {
    const W = vw + 60;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 131.7 + time * 8 - cam * 0.3) % W + W) % W - 30 + Math.sin(time * 0.9 + i) * 10;
      const y = ((i * 71.3 + time * (9 + (i % 4) * 2)) % 230);
      const a = time * (1.2 + (i % 3) * 0.5) + i;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = i % 5 === 0 ? 'rgba(232,120,70,0.8)' : i % 2 ? 'rgba(150,205,100,0.8)' : 'rgba(190,225,120,0.75)';
      ctx.beginPath(); ctx.ellipse(0, 0, 1.8, 0.8 + Math.abs(Math.sin(a)) * 0.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 10; i++) {
      const x = ((i * 97 - cam * 0.25) % W + W) % W - 30, y = 40 + (i * 37) % 150;
      const a = 0.18 + 0.14 * Math.sin(time * 1.5 + i * 2.1);
      glow(ctx, x, y, 5, '255,248,210', a);
    }
  } }
};

const label = (ctx, str, x, y, size, color, stroke) => text(ctx, str, x, y, size, color, stroke);

// 新神戸駅
DECOS.s3_station = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's3/station', x, y)) return;
  label(ctx, '新神戸駅', x + 66, y - 112.2, 8.6, '#ffffff');
  label(ctx, 'SHIN-KOBE STATION', x + 66, y - 104.6, 3.2, '#cfe0ff');
};
// ホームの屋根（w マス）
DECOS.s3_roof = (ctx, d, x, y) => {
  const w = (d.w || 6) * TILE;
  for (let i = 0, px = x; px < x + w - 4; i++, px += 48) Art.draw(ctx, 's3/roof' + (i % 3), px, y);
};
// 止まっている新幹線（w マス。右はしが先頭）
DECOS.s3_shinkansen = (ctx, d, x, y) => {
  if (!Art.has('s3/shinCar')) return;
  const len = (d.w || 12) * TILE;
  for (let px = x; px < x + len - 90; px += 64) Art.draw(ctx, 's3/shinCar', px, y + 2);
  Art.draw(ctx, 's3/shinNose', x + len - 90, y + 2);
};
DECOS.s3_clock = (ctx, d, x, y) => { Art.draw(ctx, 's3/clock', x + 8, y); };
DECOS.s3_planter = (ctx, d, x, y) => { Art.draw(ctx, 's3/planter', x + 8, y); };
DECOS.s3_ztree = (ctx, d, x, y) => { const k = d.s || 1; Art.draw(ctx, 's3/ztree', x + 8, y, !!d.flip, k, k); };
DECOS.s3_maple = (ctx, d, x, y) => { const k = d.s || 1; Art.draw(ctx, 's3/maple' + (d.v || 0), x + 8, y, !!d.flip, k, k); };
DECOS.s3_cedar = (ctx, d, x, y) => { const k = d.s || 1; Art.draw(ctx, 's3/cedar', x + 8, y, false, k, k); };
DECOS.s3_boulder = (ctx, d, x, y) => { Art.draw(ctx, 's3/boulder' + (d.v || 0), x + 8, y + 1, !!d.flip); };
DECOS.s3_lantern = (ctx, d, x, y) => { Art.draw(ctx, 's3/lantern', x + 8, y); };
DECOS.s3_kahi = (ctx, d, x, y) => { Art.draw(ctx, 's3/kahi', x + 8, y); };
DECOS.s3_fern = (ctx, d, x, y) => { Art.draw(ctx, 's3/fern', x + 8, y + 1, !!d.flip); };
// 滝のうしろのがけ（x = 滝のまん中、y = 滝つぼの水面）＋ 滝つぼのもや
DECOS.s3_cliff = (ctx, d, x, y, time) => {
  if (!Art.draw(ctx, 's3/cliff' + (d.v || 1), x, y)) return;
  const chans = d.v === 2 ? [-40, 40] : [0];
  for (const c of chans) {
    for (let i = 0; i < 5; i++) {
      const u = (time * 0.35 + i / 5) % 1;
      ctx.fillStyle = `rgba(255,255,255,${0.32 * Math.sin(u * Math.PI)})`;
      ctx.beginPath(); ctx.arc(x + c + Math.sin(i * 2.3 + time * 0.6) * 14, y - 6 - u * 26, 6 + u * 8, 0, TAU); ctx.fill();
    }
  }
};
// 砂子橋のアーチ（x = 橋のまん中、y = 橋の上の面）
DECOS.s3_arch = (ctx, d, x, y) => { Art.draw(ctx, 's3/arch', x, y); };
DECOS.s3_teahouse = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's3/teahouse', x, y)) return;
  label(ctx, d.text || 'おんたき茶屋', x + 26, y - 51.5, 4.6, '#5a3a24');
  label(ctx, '滝見だんご', x + 0.3, y - 44.6, 4.2, '#ffffff');
};
// 道しるべ（たて書き）
DECOS.s3_post = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's3/post', x + 8, y)) return;
  const s = d.text || '布引の滝';
  label(ctx, s, x + 8, y - 30, 4.8, '#4a3220');
};
