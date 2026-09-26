// ステージ2 の飾り・テーマの上書き（tools/art/stages/ の絵と組みにして使う）
// DECOS:  b.deco('型の名前', x, y, {...}) の「型の名前」→ 描く関数 (ctx, d, x, y, time, night)。x,y は飾りの足元（ドット）
// THEMES: js/themes.js の THEMES[テーマ名] に上書きする値（skyStops・wash など）
// BG:     js/themes.js の BG[テーマ名] に上書きする値（artDyn：背景の中を動くもの など）
import { Art, TILE, TAU, text, glow } from './util.js';

export const DECOS = {};
export const THEMES = {};
export const BG = {};

// ---------- 王子動物園 ----------
THEMES.zoo = {
  skyStops: [[0, '#4aaef0'], [0.45, '#7ecbf5'], [0.8, '#bde6f8'], [1, '#dcf1fa']],
  wash: 'rgba(238,245,252,0.16)'
};

// 背景の中をひらひら落ちる桜の花びら（旗の街灯の層のうしろ）
BG.zoo = {
  artDyn: { after: 4, draw(ctx, cam, vw, time) {
    const W = vw + 60;
    for (let i = 0; i < 22; i++) {
      const sp = 14 + (i % 5) * 3;
      const x = ((i * 97.3 + time * sp * 0.6 - cam * 0.55) % W + W) % W - 30 + Math.sin(time * 1.3 + i) * 6;
      const y = ((i * 53.7 + time * sp) % 250) - 5;
      const a = time * (1.5 + (i % 3) * 0.4) + i;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = i % 3 ? 'rgba(252,196,216,0.85)' : 'rgba(255,232,240,0.9)';
      ctx.beginPath(); ctx.ellipse(0, 0, 1.6, 0.9 + Math.abs(Math.sin(a)) * 0.4, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  } }
};

const sign = (ctx, str, x, y, size, color, stroke) => text(ctx, str, x, y, size, color, stroke);

// 入り口の門
DECOS.s2_gate = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/gate', x, y)) return;
  // 看板：キリン・パンダ・ゾウ（王子動物園の人気もの）
  sign(ctx, 'キリン', x + 44.6, y - 92.5, 8.2, '#c98a2a');
  sign(ctx, d.text || '王子動物園', x + 64.6, y - 92.5, 10, '#2f7a33');
  sign(ctx, 'ゾウ', x + 84.6, y - 92.5, 8.2, '#6f7f96');
};
DECOS.s2_sakura = (ctx, d, x, y) => { const k = d.s || 1; Art.draw(ctx, 's2/sakura', x + 8, y, !!d.flip, k, k); };
DECOS.s2_tree = (ctx, d, x, y) => { const k = d.s || 1; Art.draw(ctx, 's2/tree', x + 8, y, !!d.flip, k, k); };
DECOS.s2_lamp = (ctx, d, x, y) => { Art.draw(ctx, 's2/lamp', x + 8, y); };
DECOS.s2_kiosk = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/kiosk', x, y)) return;
  sign(ctx, d.text || 'おやつ', x + 28, y - 51.5, 6, '#d8413a');
};
// 案内板（3まいの矢印）: labels = [右, 左, 右]
DECOS.s2_signpost = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/signpost', x + 8, y)) return;
  const L = d.labels || ['キリン', 'もん', 'ゾウ'];
  const cx = x + 8;
  sign(ctx, L[0], cx + 7.5, y - 44.5, 4.4, '#ffffff', 'rgba(20,50,20,0.55)');
  sign(ctx, L[1], cx - 7.5, y - 35.9, 4.4, '#ffffff', 'rgba(80,40,10,0.55)');
  sign(ctx, L[2], cx + 7.5, y - 27.3, 4.4, '#ffffff', 'rgba(20,40,80,0.55)');
};
// 木のさく（w マス）
DECOS.s2_fence = (ctx, d, x, y) => {
  const n = Math.ceil((d.w || 2) * TILE / 32);
  for (let i = 0; i < n; i++) Art.draw(ctx, 's2/fence', x + i * 32, y);
};
DECOS.s2_giraffe = (ctx, d, x, y) => { Art.draw(ctx, 's2/giraffeYard', x, y); };
DECOS.s2_panda = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/pandaYard', x, y)) return;
  sign(ctx, 'パンダ', x + 26, y - 17.5, 5, '#2a2a30');
};
DECOS.s2_elephantYard = (ctx, d, x, y) => { Art.draw(ctx, 's2/elephantYard', x, y); };
// ゾウ（鼻の先が x+56 にくる）
DECOS.s2_elephant = (ctx, d, x, y, time) => { Art.draw(ctx, 's2/elephant', x, y + Math.sin(time * 2) * 0.4); };
DECOS.s2_koala = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/koalaYard', x, y)) return;
  sign(ctx, 'コアラ', x + 76, y - 38.8, 5, '#7a4028');
};
DECOS.s2_pond = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/pondBack', x, y)) return;
  sign(ctx, 'フラミンゴ', x + 30, y - 26.5, 4.4, '#c05a6a');
};
DECOS.s2_reeds = (ctx, d, x, y) => { Art.draw(ctx, 's2/reeds', x + 8, y + 4, !!d.flip); };
// フラミンゴ（水の中に立つ）
DECOS.s2_flamingo = (ctx, d, x, y, time) => {
  const bob = Math.sin(time * 1.6 + x * 0.05) * 0.4;
  Art.draw(ctx, 's2/flam' + (d.v || 0), x + 8, y + 9 + bob, !!d.flip);
};
// メリーゴーランド（木馬がまわる）
DECOS.s2_merry = (ctx, d, x, y, time) => {
  if (!Art.has('s2/merryBase')) return;
  const cx = x + 8, top = y - 50;
  Art.draw(ctx, 's2/merryBase', cx, y);
  const hs = [];
  for (let k = 0; k < 5; k++) {
    const a = time * 0.9 + k / 5 * TAU;
    hs.push({ k, a, z: Math.sin(a), hx: cx + Math.cos(a) * 31 });
  }
  hs.sort((p, q) => p.z - q.z);
  for (const h of hs) {
    const bob = (Math.sin(time * 3 + h.k * 1.7) + 1) * 1.6;
    const hy = y - 10 - bob, s = 0.86 + h.z * 0.12;
    ctx.globalAlpha = h.z < 0 ? 0.8 : 1;
    ctx.fillStyle = '#e2b640'; ctx.fillRect(h.hx - 0.5, top + 4, 1, hy - top - 12);
    Art.draw(ctx, 's2/horse' + (h.k % 3), h.hx, hy, Math.sin(h.a) < 0, s, s);
    ctx.globalAlpha = 1;
  }
  Art.draw(ctx, 's2/merryTop', cx, top);
};
// 豆汽車（えんとつのけむり）
DECOS.s2_train = (ctx, d, x, y, time) => {
  if (!Art.draw(ctx, 's2/ktrain', x, y)) return;
  for (let i = 0; i < 3; i++) {
    const u = (time * 0.5 + i / 3) % 1;
    ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - u)})`;
    ctx.beginPath(); ctx.arc(x + 50 - u * 6, y - 29 - u * 16, 1.6 + u * 3, 0, TAU); ctx.fill();
  }
};
DECOS.s2_booth = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/booth', x, y)) return;
  sign(ctx, d.text || 'のりもの', x + 16, y - 43.5, 5, '#2f6fb8');
};
DECOS.s2_hunter = (ctx, d, x, y) => {
  if (!Art.draw(ctx, 's2/hunter', x, y)) return;
  sign(ctx, '旧ハンター住宅', x + 120, y - 14, 4.1, '#46525c');
};

// 観覧車（むかしながらの小さな観覧車）。b.wheel() の飾りを 's2_wheel' にかえて使う
const RIM = ['#ff8fa8', '#ffd36b', '#8fd8ff', '#9ee69a', '#ffb07a', '#d4a8ff'];
DECOS.s2_wheel = (ctx, d, cx, cy, time, night) => {
  const r = d.r * TILE, base = d.base * TILE, rot = time * 0.35;
  // 足（白いトラス）
  for (const s of [-1, 1]) {
    const bx = cx + s * r * 0.66;
    ctx.strokeStyle = '#d7dde6'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + s * 1.5, cy); ctx.lineTo(bx, base); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s * 1.5, cy); ctx.lineTo(bx - s * 9, base); ctx.stroke();
    ctx.strokeStyle = '#f4f6f9'; ctx.lineWidth = 0.9;
    for (let k = 1; k < 7; k++) {
      const u0 = k / 7, u1 = (k + 0.5) / 7;
      ctx.beginPath();
      ctx.moveTo(cx + (bx - cx) * u0, cy + (base - cy) * u0);
      ctx.lineTo(cx + (bx - s * 9 - cx) * u1, cy + (base - cy) * u1);
      ctx.stroke();
    }
  }
  // 色つきの輪
  const n = 12;
  ctx.lineWidth = r * 0.1;
  for (let k = 0; k < n; k++) {
    ctx.strokeStyle = RIM[k % RIM.length];
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.93, rot + k / n * TAU, rot + (k + 1) / n * TAU); ctx.stroke();
  }
  // スポーク
  ctx.strokeStyle = '#fbf6ea'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const a = rot + k / n * TAU;
    ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const b = rot + (k + 0.5) / n * TAU;
    ctx.moveTo(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55); ctx.lineTo(cx + Math.cos(b) * r * 0.86, cy + Math.sin(b) * r * 0.86);
  }
  ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, TAU); ctx.stroke();
  // 電球
  for (let k = 0; k < 24; k++) {
    const a = rot + k / 24 * TAU;
    ctx.fillStyle = k % 2 ? '#fff4b8' : '#ffffff';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.9, 0, TAU); ctx.fill();
  }
  // まん中の花
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 6; k++) { const a = rot * 2 + k / 6 * TAU; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 3, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ff8fa8'; ctx.beginPath(); ctx.arc(cx, cy, 3.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, TAU); ctx.fill();
  Art.draw(ctx, 's2/wheelDeck', cx, base);
};
