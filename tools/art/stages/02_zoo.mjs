// ステージ2「王子動物園」の絵（背景・地面・飾り）
// 晴れた春の動物園：桜・入り口の門・キリン／ゾウ／パンダ／コアラ／フラミンゴ・のりもの広場・旧ハンター住宅
// 看板の文字はゲームの中で描く（js/sd/stage2.js）
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, cloud } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile, water } from '../tiles.mjs';
import { TAU, st, G, win, flowerBox, awning, board, cloverBlob, clover, cloverTree } from '../kit.mjs';

resetTheme('zoo');
const SH = 's2';

// 桜の色
const PK = { dark: '#e08aac', base: '#f7c0d4', mid: '#fbd2e0', pale: '#fde3ec', light: '#fff4f8', trunk: '#5e4038' };
const INK = '#2a2230';
const eye = (x, y, r) => [circ(x, y, r, INK), circ(x + r * 0.38, y - r * 0.38, r * 0.36, '#ffffff')].join('');

// 背景の桜の木（ドット単位）
function sakuraBg(x, y, s, r, c = PK) {
  const out = [path(`M${x - 2 * s} ${y} C${x - 1.5 * s} ${y - 10 * s} ${x - 4 * s} ${y - 16 * s} ${x - 9 * s} ${y - 21 * s} L${x - 7 * s} ${y - 22.5 * s} C${x - 2 * s} ${y - 18 * s} ${x} ${y - 17 * s} ${x + 1 * s} ${y - 22 * s} L${x + 2.6 * s} ${y - 22 * s} C${x + 3 * s} ${y - 16 * s} ${x + 6 * s} ${y - 17 * s} ${x + 10 * s} ${y - 20 * s} L${x + 11 * s} ${y - 18.5 * s} C${x + 5 * s} ${y - 14 * s} ${x + 2.4 * s} ${y - 9 * s} ${x + 2.2 * s} ${y} Z`, c.trunk)];
  const blobs = [];
  for (let i = 0; i < 9; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([x + Math.cos(a) * 15 * s * d, y - 27 * s + Math.sin(a) * 7 * s * d, (6 + r() * 3) * s]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(clover(bx, by + 1.4 * s, br, c.dark));
  for (const [bx, by, br] of blobs) out.push(clover(bx, by, br * 0.92, r() < 0.5 ? c.base : c.mid, c.light));
  return out.join('');
}

// ========================================================================
// 背景
// ========================================================================
// 雲
bgLayer('zoo', { f: 0.025, w: 1200, y: 0, h: 120 }, (defs, w) => {
  const r = rng(2101);
  const out = [];
  for (const [x, y, s] of [[120, 30, 0.95], [380, 56, 0.6], [610, 22, 1.1], [860, 46, 0.72], [1070, 28, 0.8]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#dbe8f4', '#ffffff')));
  for (let i = 0; i < 5; i++) { const x = r() * w, y = 78 + r() * 22, s = 0.3 + r() * 0.16; out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#e1edf7', null))); }
  return out.join('');
});

// 六甲山・摩耶山（みどり・山桜・アンテナ）
bgLayer('zoo', { f: 0.05, w: 1100, y: 28, h: 212 }, (defs, w) => {
  const r = rng(2201);
  const FAR = [[2, 20], [3, 11], [7, 4]], MAIN = [[1, 16], [3, 16], [5, 8], [11, 3]];
  const out = [];
  out.push(path(ridgePath(w, 92, FAR, 2203, 240), defs.linU([[0, '#a9cfc6'], [1, '#c6e0dc']], 0, 50, 0, 150)));
  const main = ridgePath(w, 124, MAIN, 2205, 240);
  out.push(path(main, defs.linU([[0, '#62b060'], [0.5, '#54a258'], [1, '#6cb272']], 0, 60, 0, 200)));
  const clip = defs.clip(`<path d="${main}"/>`);
  const bumps = [];
  for (let i = 0; i < 820; i++) {
    const x = r() * w, top = ridgeY(w, 124, MAIN, 2205, x);
    const y = top + 3 + Math.pow(r(), 0.8) * (190 - top);
    const rr = 2.2 + r() * 2.6;
    const k = r();
    const c = k < 0.06 && y > top + 18 ? '#f2d2dc' : k < 0.4 ? '#4c9853' : k < 0.66 ? '#5aa85c' : '#68b666';
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, c)));
    if (r() < 0.33) bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.35, y - rr * 0.4, rr * 0.45, c === '#f2d2dc' ? '#fff0f4' : '#8ac87e', { opacity: 0.8 })));
  }
  for (let i = 0; i < 9; i++) {
    const x = (i + 0.3 + r() * 0.4) * (w / 9), top = ridgeY(w, 124, MAIN, 2205, x) + 6;
    bumps.push(path(`M${x} ${top} Q${x + 6 + r() * 8} ${top + 30} ${x - 4 + r() * 8} ${top + 70}`, 'none', st('#3c8448', 5 + r() * 4, { opacity: 0.3 })));
  }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  out.push(path(main.replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#90d184', 1.4, { opacity: 0.6 })));
  // 摩耶山のアンテナ
  const px = 700;
  for (const [dx, hh] of [[0, 16], [9, 12], [-8, 10]]) {
    const bx = px + dx, by = ridgeY(w, 124, MAIN, 2205, bx) + 2;
    out.push(path(`M${bx - 2} ${by} L${bx} ${by - hh} L${bx + 2} ${by} M${bx - 1.5} ${by - hh * 0.35} L${bx + 1.5} ${by - hh * 0.35} M${bx - 1} ${by - hh * 0.65} L${bx + 1} ${by - hh * 0.65}`, 'none', st('#e8eef3', 0.8)));
    out.push(rect(bx - 0.5, by - hh - 3, 1, 3, '#e05a4a'));
  }
  out.push(rect(0, 140, w, 100, defs.linU([[0, '#d9eef6', 0], [1, '#d9eef6', 0.75]], 0, 138, 0, 186)));
  return tr(0, -28, out.join(''));
});

// 灘の街（かすんだビル・王子スタジアムの照明塔）
bgLayer('zoo', { f: 0.1, w: 1000, y: 104, h: 136 }, (defs, w) => {
  const r = rng(2301);
  const out = [];
  const cols = ['#e2eaf3', '#d3deec', '#eff3f8', '#cddaea', '#e8edf5', '#f3ede6'];
  for (let x = -10; x < w;) {
    const bw = 10 + r() * 20, bh = 6 + Math.pow(r(), 1.7) * 30;
    const c = cols[Math.floor(r() * cols.length)], top = 186 - bh;
    out.push(wrap(w, x, bw, xx => {
      const p = [rect(xx, top, bw, bh + 10, c), rect(xx + bw * 0.72, top, bw * 0.28, bh + 10, shade(c, -0.06)), rect(xx - 0.5, top - 1.2, bw + 1, 1.6, shade(c, 0.35))];
      for (let yy = top + 3; yy < 184; yy += 4) for (let wx = xx + 2; wx < xx + bw - 2.5; wx += 3.6) p.push(rect(wx, yy, 1.8, 2, r() < 0.15 ? '#f4f9ff' : '#b2c6da', { opacity: 0.8 }));
      return p.join('');
    }));
    x += bw + r() * 2;
  }
  // 照明塔（王子スタジアム）
  for (const x of [240, 330]) {
    out.push(path(`M${x - 2} 186 L${x - 0.8} 128 L${x + 0.8} 128 L${x + 2} 186 Z`, '#c9d2dc'));
    out.push(rect(x - 6, 120, 12, 8, '#dde4ec'), rect(x - 5, 121, 10, 6, '#f6f8fb'));
    for (let k = 0; k < 3; k++) out.push(rect(x - 4.5 + k * 3.2, 121.6, 2.2, 1.8, '#c2ccd8'), rect(x - 4.5 + k * 3.2, 124.4, 2.2, 1.8, '#c2ccd8'));
  }
  for (let i = 0; i < 44; i++) { const x = r() * w, y = 182 + r() * 8; out.push(wrap(w, x - 10, 20, xx => clover(xx + 10, y, 4 + r() * 4, r() < 0.3 ? '#f4cddc' : r() < 0.6 ? '#86c47a' : '#94cf86', r() < 0.3 ? '#fff0f5' : '#b9e3a8'))); }
  out.push(rect(0, 186, w, 60, '#bcd8c0'));
  out.push(rect(0, 150, w, 44, defs.linU([[0, '#eef7fb', 0], [1, '#eef7fb', 0.5]], 0, 150, 0, 194)));
  return tr(0, -104, out.join(''));
});

// 動物園の中（桜並木・動物の家の屋根・緑の木）
bgLayer('zoo', { f: 0.2, w: 960, y: 96, h: 144 }, (defs, w) => {
  const r = rng(2401);
  const out = [];
  const TC = { trunk: '#76584a', dark: '#4a8f47', base: '#62ad57', mid: '#58a24f', light: '#a2d886' };
  // うしろの緑の木
  for (let i = 0; i < 11; i++) { const x = r() * w; out.push(wrap(w, x - 20, 40, xx => cloverTree(xx + 20, 200 + r() * 6, 0.9 + r() * 0.5, r, TC))); }
  // 動物の家（小さな屋根）
  const houses = [[90, 34, '#5f9a62', '#f2ead8'], [300, 42, '#c96b4f', '#f6efe2'], [520, 30, '#4f8faa', '#eef2ee'], [760, 38, '#8a6a4a', '#f4ecd8']];
  for (const [x, bw, roof, wall] of houses) {
    out.push(wrap(w, x - 6, bw + 12, xx => [
      rect(xx, 186, bw, 20, wall), rect(xx + bw - 4, 186, 4, 20, shade(wall, -0.08)),
      path(`M${xx - 5} 187 L${xx + bw * 0.5} ${176} L${xx + bw + 5} 187 Z`, roof), rect(xx - 5, 186, bw + 10, 1.6, shade(roof, -0.25)),
      ...[0.2, 0.45, 0.7].map(k => rect(xx + bw * k, 191, 5, 5, '#a9c8da')),
      rect(xx + bw * 0.5 - 3, 196, 6, 10, shade(wall, -0.25))
    ].join('')));
  }
  // 桜並木
  const PB = { dark: '#ecb9cc', base: '#f8d6e2', mid: '#fbe0e9', pale: '#fde9f0', light: '#fff7fa', trunk: '#8a6c62' };
  for (let i = 0; i < 20; i++) { const x = (i + r() * 0.8) * (w / 20); out.push(wrap(w, x - 30, 60, xx => sakuraBg(xx, 208 + r() * 4, 0.95 + r() * 0.45, r, PB))); }
  out.push(rect(0, 206, w, 40, '#b8d9a8'));
  out.push(rect(0, 204, w, 3, '#d8ecc8'));
  out.push(rect(0, 140, w, 80, defs.linU([[0, '#f4f8fb', 0.05], [1, '#f4f8fb', 0.42]], 0, 140, 0, 212)));
  return tr(0, -96, out.join(''));
});

// 手前：旗のついた街灯（動物のマークの旗）
bgLayer('zoo', { f: 0.42, w: 820, y: 60, h: 180 }, (defs, w) => {
  const out = [];
  const flags = [['#ef7fa6', '#ffe1ec'], ['#5fb55a', '#e6f6d9'], ['#f2b632', '#fff2cc']];
  [[140, 0], [560, 1]].forEach(([x, k]) => {
    out.push(rect(x - 1.6, 96, 3.2, 120, '#3f6a55'), rect(x - 1.6, 96, 1, 120, '#6a9a80'));
    out.push(rrect(x - 4, 210, 8, 6, 1.5, '#35584a'));
    out.push(circ(x, 93, 5.5, '#fff6de', { opacity: 0.4 }), circ(x, 93, 4.2, '#fffaf0'), circ(x - 1.3, 91.6, 1.4, '#ffffff'), rect(x - 3, 97, 6, 1.6, '#35584a'), path(`M${x - 3} 89 L${x} 85 L${x + 3} 89 Z`, '#35584a'));
    for (const [s, dy] of [[-1, 0], [1, 6]]) {
      const [c, c2] = flags[(k * 2 + (s > 0 ? 1 : 0)) % 3];
      const fx = x + s * 1.6, fy = 106 + dy;
      out.push(rect(Math.min(fx, fx + s * 12), fy - 1, 12, 1.2, '#35584a'));
      out.push(path(`M${fx} ${fy} L${fx + s * 11} ${fy} L${fx + s * 11} ${fy + 26} L${fx + s * 5.5} ${fy + 22} L${fx} ${fy + 26} Z`, c));
      out.push(circ(fx + s * 5.5, fy + 10, 3.4, c2), circ(fx + s * 5.5 - 1.7, fy + 7.4, 1.3, c2), circ(fx + s * 5.5 + 1.7, fy + 7.4, 1.3, c2));
      out.push(circ(fx + s * 4.3, fy + 10, 0.5, INK), circ(fx + s * 6.7, fy + 10, 0.5, INK));
    }
    // 花のかご
    out.push(path(`M${x - 6} 140 L${x + 6} 140 L${x + 4} 146 L${x - 4} 146 Z`, '#8a5a3a'));
    for (let i = 0; i < 6; i++) out.push(circ(x - 5 + i * 2, 139 - (i % 2) * 1.5, 1.8, i % 2 ? '#5aa84e' : '#ff8fb3'));
  });
  return tr(0, -60, out.join(''));
});

// 手前の植え込み（ツツジ・ぼかし）
bgLayer('zoo', { f: 1.32, w: 1300, y: 176, h: 64, fg: true }, (defs, w) => {
  const r = rng(2601);
  const blur = defs.blur(1.5);
  const out = [];
  for (const cx of [90, 560, 1010]) {
    const parts = [];
    for (let k = 0; k < 13; k++) {
      const x = cx + (k - 6.5) * 10 + r() * 8, y = 246 - r() * 8 - Math.cos((k - 6.5) / 6.5 * 1.4) * 6, rr = 10 + r() * 7;
      parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2f6c38' : '#377c3e', '#4f9a4c')));
    }
    for (let k = 0; k < 9; k++) { const x = cx + (k - 4.5) * 12 + r() * 8, y = 232 + r() * 6; parts.push(wrap(w, x - 6, 12, xx => clover(xx, y, 3.6 + r() * 2, k % 2 ? '#f07aa6' : '#f59ac0', '#ffd0e2'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -176, out.join(''));
});

// ========================================================================
// 地面：御影石（みかげいし）の石垣＋芝生のふち、生け垣、池の水
// ========================================================================
{
  const P = { colors: ['#cdb29a', '#c2a68d', '#d6bda6', '#bb9e86', '#d0b7a4'], jitter: 12, round: 20, speck: true, gap: 8 };
  const mortar = '#8a705e';
  const speckle = (seed) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < 16; i++) out.push(circ(8 + r() * 144, 8 + r() * 144, 1.4 + r() * 1.4, r() < 0.5 ? '#6e5a4e' : '#f3e6da', { opacity: 0.55 }));
    return out.join('');
  };
  const vine = (x, y, n, seed) => {
    const r = rng(seed);
    const out = [path(`M${x} ${y} Q${x - 6} ${y + n * 9} ${x + 4} ${y + n * 18}`, 'none', st('#3e7a34', 2.4))];
    for (let i = 0; i < n * 3; i++) {
      const lx = x - 12 + r() * 24, ly = y + r() * n * 18;
      out.push(clover(lx, ly + 1.5, 6 + r() * 2.5, '#3d8a35'), clover(lx, ly, 5.6 + r() * 2.5, r() < 0.5 ? '#5aaa45' : '#68b84e', '#9ad67a'));
    }
    return out.join('');
  };
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 80, edge: '#c9ad94', joints: joints(46, 118, 2700 + v, 44, 74) }, { y0: 80, y1: 160, edge: '#c6aa91', joints: joints(14, 148, 2710 + v, 46, 78) }], P, 2730 + v),
    speckle(2740 + v),
    v === 1 ? vine(96, 6, 4, 2750) : v === 3 ? ell(40, 150, 26, 7, '#5f9a48', { opacity: 0.55 }) : ''
  ].join('');
  const cap = { h: 38, base: '#6cc24f', dark: '#3f9a35', light: '#b8ee8e' };
  for (let v = 0; v < 4; v++) tile(`t/zoo/g/body${v}`, () => body(v));
  const grass = (v) => {
    const h = cap.h;
    const wave = (y0, amp, ph) => {
      let d = `M0 0 L160 0 L160 ${y0}`;
      for (let x = 160; x >= 0; x -= 20) d += ` Q${x + 10} ${y0 + amp * (((x / 20 + ph) % 2) ? 1.2 : -0.2)} ${x} ${y0}`;
      return d + ' Z';
    };
    const out = [
      path(wave(h + 10, 7, 0), '#000000', { opacity: 0.2 }),
      path(wave(h + 4, 8, 1), cap.dark),
      path(wave(h - 3, 7, 0), cap.base),
      rect(0, 0, U, 6, cap.light),
      rect(0, 6, U, 3, '#8fdc6e', { opacity: 0.8 })
    ];
    for (const x of [14, 50, 92, 128]) out.push(path(`M${x + (v * 11) % 16} 8 q3 -7 6 0 q3 -8 6 0 q3 -6 6 0`, 'none', st(cap.light, 3, { opacity: 0.9 })));
    if (v === 1) [[30, 22], [74, 26], [118, 20]].forEach(([x, y], i) => { out.push(...[0, 72, 144, 216, 288].map(a => circ(x + Math.cos(a * Math.PI / 180) * 4, y + Math.sin(a * Math.PI / 180) * 4, 3.2, i === 1 ? '#fff27a' : '#ffffff')), circ(x, y, 2.4, '#ffcf3a')); });
    if (v === 2) [[36, 18, 20], [88, 28, -30], [132, 16, 50]].forEach(([x, y, a]) => out.push(ell(x, y, 6, 3.6, '#fbd0de', { rot: a }), ell(x - 1, y - 0.6, 3, 1.6, '#ffffff', { rot: a, opacity: 0.7 })));
    return out.join('');
  };
  const top = (v) => [body(v + 4), grass(v)].join('');
  for (let v = 0; v < 3; v++) tile(`t/zoo/g/top${v}`, () => top(v));
  tile('t/zoo/g/edgeL', defs => rect(0, 0, 26, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/zoo/g/edgeR', defs => rect(134, 0, 26, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tile('t/zoo/g/topL', () => [path('M0 0 L14 0 Q10 26 16 44 L0 46 Z', cap.dark), path('M0 0 L10 0 Q7 20 10 36 L0 38 Z', cap.base), rect(0, 0, 10, 6, cap.light)].join(''));
  tile('t/zoo/g/topR', () => [path('M160 0 L146 0 Q150 26 144 44 L160 46 Z', cap.dark), path('M160 0 L150 0 Q153 20 150 36 L160 38 Z', cap.base), rect(150, 0, 10, 6, cap.light)].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/zoo/g/${k}`, defs => slopeTile(defs, k, body(k.length % 4), cap));
  // 石のブロック
  tile('t/zoo/hard', () => [
    rrect(0, 0, U, U, 10, '#8f7462'), rrect(4, 4, 152, 150, 8, '#cfb49c'),
    path('M10 10 L150 10 L140 22 L22 22 L22 140 L10 150 Z', '#e6d2bf'),
    path('M150 10 L150 150 L10 150 L22 140 L140 140 L140 22 Z', '#b0927a'),
    speckle(2790)
  ].join(''));
  // 生け垣（まるく刈りこんだ葉っぱ）
  const hedge = (seed) => {
    const r = rng(seed);
    const out = [rect(0, 0, U, U, '#2c6a36')];
    for (let row = 0; row < 5; row++) for (let i = 0; i < 5; i++) {
      const x = i * 40 + (row % 2) * 20 - 10 + (r() - 0.5) * 8, y = row * 38 + 6 + (r() - 0.5) * 6;
      out.push(circ(x, y + 5, 23, '#265d30'), circ(x, y, 21, r() < 0.5 ? '#3f9a4a' : '#46a452'), circ(x - 7, y - 7, 8, '#79c86e', { opacity: 0.75 }));
    }
    return out.join('');
  };
  tile('t/zoo/m/hedge/hard', () => hedge(2800));
  tile('t/zoo/m/hedge/hardT', () => [
    path('M0 0 L160 0 L160 34 Q140 44 120 36 Q100 46 80 36 Q60 46 40 36 Q20 46 0 36 Z', '#2f7a3a'),
    path('M0 0 L160 0 L160 28 Q140 36 120 29 Q100 38 80 29 Q60 38 40 29 Q20 38 0 29 Z', '#5dbb5a'),
    rect(0, 0, U, 7, '#a8ea8c'), rect(0, 7, U, 3, '#86d474', { opacity: 0.8 }),
    ...[20, 60, 100, 140].map(x => circ(x, 17, 5, '#8ad878', { opacity: 0.7 }))
  ].join(''));
  // 池の水（みどりがかった水色）
  for (let fr = 0; fr < 4; fr++) {
    water(`t/zoo/waterT${fr}`, ['#c9f3ee', '#5cc0c6', '#2d8a99', '#ffffff'], fr, true);
    water(`t/zoo/water${fr}`, ['#c9f3ee', '#5cc0c6', '#2d8a99', '#ffffff'], fr, false);
  }
}

// ========================================================================
// 飾り
// ========================================================================
// ---------- 桜の木（大きい） ----------
sprite(SH, 's2/sakura', 68, 76, 34, 75, () => {
  const r = rng(2901), out = [];
  out.push(ell(0, -4, 230, 26, '#000000', { opacity: 0.1 }));
  out.push(path('M-34 0 C-26 -110 -44 -190 -130 -290 L-110 -306 C-50 -250 -18 -214 -6 -300 L-4 -380 L20 -382 C22 -300 30 -230 44 -196 C84 -250 134 -286 196 -314 L210 -294 C154 -266 96 -228 64 -164 C46 -112 40 -60 42 0 Z', PK.trunk));
  out.push(path('M6 0 C8 -100 12 -200 10 -372 L18 -374 C20 -260 26 -110 26 0 Z', '#80604f', { opacity: 0.75 }));
  for (let k = 0; k < 7; k++) out.push(rect(-22, -30 - k * 42, 42, 4, '#43302a', { opacity: 0.55 }));
  const blobs = [];
  for (let i = 0; i < 34; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 250 * d, -450 + Math.sin(a) * 160 * d, 62 + r() * 32]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 16, br, PK.dark));
  for (const [bx, by, br] of blobs) { const t = (by + 610) / 330; out.push(cloverBlob(bx, by, br * 0.9, t > 0.62 ? '#f4b6cd' : r() < 0.5 ? PK.base : PK.mid, t < 0.55 ? PK.light : null)); }
  // 枝のすきま
  for (let i = 0; i < 46; i++) { const x = -250 + r() * 500, y = -610 + r() * 320; out.push(circ(x, y, 5 + r() * 5, '#ffffff', { opacity: 0.75 })); }
  for (let i = 0; i < 16; i++) out.push(ell(-220 + r() * 440, -6 + r() * 10, 8, 4, r() < 0.5 ? '#f6b8cf' : '#fbd6e3', { rot: r() * 180 }));
  return tr(34, 75, out.join(''), 0.1);
});

// ---------- 緑の木（ケヤキ） ----------
sprite(SH, 's2/tree', 54, 70, 27, 69, () => {
  const r = rng(2911), out = [];
  out.push(ell(0, -4, 150, 22, '#000000', { opacity: 0.1 }));
  out.push(path('M-24 0 C-16 -120 -30 -190 -80 -270 L-60 -280 C-26 -230 -8 -206 0 -300 L20 -298 C18 -210 30 -150 70 -250 L88 -238 C40 -150 26 -90 26 0 Z', '#7a5a42'));
  out.push(path('M6 0 C8 -110 12 -180 12 -290 L20 -290 C20 -190 22 -110 24 0 Z', '#9a7654', { opacity: 0.8 }));
  const blobs = [];
  for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 200 * d, -430 + Math.sin(a) * 150 * d, 60 + r() * 30]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#3a7f3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 570) / 300; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4f9a45' : r() < 0.5 ? '#5dab4f' : '#68b758', t < 0.5 ? '#a6dc84' : null)); }
  for (let i = 0; i < 12; i++) out.push(circ(-150 + r() * 300, -570 + r() * 250, 8 + r() * 8, '#c2eca0', { opacity: 0.5 }));
  return tr(27, 69, out.join(''), 0.1);
});

// ---------- 入り口の門（王子動物園） ----------
// 看板の文字: (x+66, y-93) と (x+66, y-85.4)
sprite(SH, 's2/gate', 140, 138, 4, 137, defs => {
  const Gd = G(defs), out = [];
  const pillar = (x, animal) => {
    const o = [];
    o.push(rect(x, -780, 170, 780, '#f5ecdb'), rect(x + 130, -780, 40, 780, '#e3d6bf'), rect(x + 10, -780, 10, 780, '#ffffff', { opacity: 0.6 }));
    o.push(rect(x - 14, -150, 198, 150, '#b69c84'), rect(x - 14, -150, 198, 16, '#d2bba4'));
    for (let yy = -134; yy < 0; yy += 34) o.push(rect(x - 14, yy + 30, 198, 3, '#8f7462', { opacity: 0.6 }));
    // 屋根（緑のかわら）
    o.push(path(`M${x - 40} -780 L${x + 20} -850 L${x + 150} -850 L${x + 210} -780 Z`, '#4f9a54'), rect(x - 40, -790, 250, 14, '#3a7a40'), rect(x + 16, -858, 138, 12, '#6fbf6a'));
    for (let k = 0; k < 5; k++) o.push(rect(x - 30 + k * 50, -840, 4, 52, '#3f8446', { opacity: 0.6 }));
    // 動物の絵（レリーフ）
    o.push(rrect(x + 22, -620, 126, 250, 16, '#ffffff', { opacity: 0.55 }));
    if (animal === 'giraffe') {
      o.push(tr(x + 85, -400, [
        path('M-24 0 L-20 -80 L-26 -150 Q-10 -170 6 -150 L2 -80 L6 0 Z', '#f2b64a'),
        rrect(-12, -198, 40, 26, 12, '#f2b64a'), rect(-6, -214, 4, 18, '#8a5a2a'), rect(6, -214, 4, 18, '#8a5a2a'),
        ...[[-14, -40], [-8, -80], [-16, -110], [-6, -140]].map(([a, b]) => rrect(a, b, 12, 14, 4, '#b8702e')),
        circ(14, -186, 3.5, INK)
      ]));
    } else {
      o.push(tr(x + 85, -420, [
        ell(0, 0, 50, 40, '#98a4b0'), circ(34, -26, 26, '#98a4b0'), ell(20, -26, 16, 22, '#b9c3cd'),
        path('M54 -20 Q70 0 60 30', 'none', st('#98a4b0', 12)), circ(42, -32, 3.5, INK),
        rect(-36, 24, 16, 30, '#98a4b0'), rect(18, 24, 16, 30, '#98a4b0')
      ]));
    }
    return o.join('');
  };
  out.push(pillar(0, 'giraffe'), pillar(1140, 'elephant'));
  // 旗（三角の小旗）
  const bx0 = 170, bx1 = 1140;
  out.push(path(`M${bx0} -700 Q${(bx0 + bx1) / 2} -600 ${bx1} -700`, 'none', st('#6a5a4a', 4)));
  const fc = ['#ef6f8e', '#ffcf3a', '#5fb55a', '#4fa3dc', '#ff9a4a'];
  for (let i = 1; i < 14; i++) {
    const u = i / 14, x = bx0 + (bx1 - bx0) * u, y = -700 + 100 * 4 * u * (1 - u) * 0.98;
    out.push(path(`M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 50} Z`, fc[i % 5]));
  }
  // 大きな看板
  out.push(path('M150 -800 Q660 -870 1170 -800 L1170 -760 Q660 -830 150 -760 Z', '#3f8a43'));
  out.push(rrect(130, -1040, 1060, 250, 40, '#000000', { opacity: 0.16 }));
  out.push(rrect(116, -1056, 1060, 250, 40, '#3f8a43'), rrect(136, -1036, 1020, 210, 28, '#fffbf0'), rrect(150, -1022, 992, 182, 20, 'none', { stroke: '#8fd07a', strokeWidth: 5 }));
  out.push(rect(170, -1016, 950, 12, '#ffffff', { opacity: 0.8 }));
  // 看板の上の桜の花かざり
  const r = rng(2921);
  for (let i = 0; i < 16; i++) { const x = 170 + i * 62 + r() * 20, y = -1056 + (r() - 0.5) * 20; out.push(cloverBlob(x, y + 6, 36, PK.dark), cloverBlob(x, y, 32, i % 2 ? PK.base : PK.mid, PK.light)); }
  // キリン（看板の左うしろから顔を出す）
  out.push(tr(250, -1080, [
    path('M-30 60 L-18 -120 L20 -120 L26 60 Z', '#f2b64a'),
    ...[[-14, 20], [-6, -30], [-16, -80]].map(([a, b]) => rrect(a, b, 18, 20, 6, '#b8702e')),
    rrect(-40, -190, 110, 80, 36, '#f5bf55'), rrect(40, -160, 44, 40, 18, '#e8a94a'),
    rect(-18, -226, 8, 40, '#8a5a2a'), rect(10, -226, 8, 40, '#8a5a2a'), circ(-14, -228, 9, '#8a5a2a'), circ(14, -228, 9, '#8a5a2a'),
    ell(-40, -170, 18, 9, '#f2b64a', { rot: -20 }), eye(24, -166, 9), ell(8, -140, 10, 6, '#ff9aa8', { opacity: 0.6 })
  ]));
  // パンダ（看板の右上にすわる）
  out.push(tr(1060, -1060, [
    ell(0, -40, 64, 50, '#ffffff'), circ(-46, -120, 22, '#2a2a30'), circ(46, -120, 22, '#2a2a30'),
    circ(0, -110, 54, '#ffffff'), ell(-22, -112, 14, 18, '#2a2a30', { rot: 30 }), ell(22, -112, 14, 18, '#2a2a30', { rot: -30 }),
    circ(-20, -114, 5, '#ffffff'), circ(24, -114, 5, '#ffffff'), ell(0, -92, 9, 6, '#2a2a30'), ell(-34, -90, 10, 6, '#ffb0c0', { opacity: 0.7 }), ell(34, -90, 10, 6, '#ffb0c0', { opacity: 0.7 }),
    ell(-50, -20, 20, 28, '#2a2a30', { rot: 20 }), ell(50, -20, 20, 28, '#2a2a30', { rot: -20 })
  ]));
  // 足もとの植木ばち
  for (const x of [-20, 1300]) out.push(path(`M${x - 40} -90 L${x + 40} -90 L${x + 30} 0 L${x - 30} 0 Z`, '#c0703a'), cloverBlob(x, -140, 56, '#4f9a45', '#9ad47c'), circ(x - 20, -150, 10, '#ff6a8a'), circ(x + 16, -130, 9, '#ffd24a'));
  return tr(4, 137, out.join(''), 0.1);
});

// ---------- 売店（おやつ） ----------
// 看板の文字: (x+32, y-47)
sprite(SH, 's2/kiosk', 70, 72, 4, 71, defs => {
  const Gd = G(defs), out = [];
  const W = 560;
  out.push(ell(W / 2, -6, 320, 20, '#000000', { opacity: 0.1 }));
  out.push(rect(0, -400, W, 400, '#fff1cf'), rect(0, -400, W, 400, Gd.wallShade));
  for (let x = 20; x < W; x += 46) out.push(rect(x, -400, 3, 400, '#ecd6ad'));
  out.push(rect(W - 30, -400, 30, 400, '#ead3a8'));
  // 窓口と品物
  out.push(rect(50, -330, W - 100, 170, '#6a4a38'), rect(50, -330, W - 100, 170, Gd.inShade));
  out.push(rect(70, -320, 130, 150, '#d94a3f'), rect(80, -310, 110, 90, '#fff6d8'));
  for (let i = 0; i < 14; i++) out.push(circ(90 + (i % 5) * 22, -240 - Math.floor(i / 5) * 18, 10, i % 3 ? '#fff4c0' : '#ffe38a'));
  out.push(rect(80, -220, 110, 8, '#b33a30'));
  for (let i = 0; i < 5; i++) out.push(rrect(240 + i * 44, -250, 30, 60, 8, ['#ff6a5a', '#4fb3e8', '#ffcf3a', '#7ad07a', '#ff9ac2'][i]), rect(244 + i * 44, -236, 22, 14, '#ffffff', { opacity: 0.7 }));
  out.push(rect(40, -170, W - 80, 26, '#c98a4a'), rect(40, -170, W - 80, 8, '#e6b27a'));
  // ソフトクリーム（台の上）
  for (const x of [120, 180]) out.push(path(`M${x - 12} -178 L${x + 12} -178 L${x} -140 Z`, '#d9a05a'), ell(x, -186, 14, 9, '#fffaf0'), ell(x, -198, 9, 7, '#fffaf0'), circ(x, -208, 5, '#fffaf0'));
  // 下の板
  out.push(rect(20, -144, W - 40, 144, '#f4dcaa'));
  for (let x = 36; x < W - 30; x += 40) out.push(rect(x, -140, 26, 136, '#eccf96'));
  out.push(rect(20, -20, W - 40, 20, '#c9a26a'));
  // ひさし（赤白のしま）
  out.push(awning(Gd, -20, -470, W + 40, 70, '#e8453a', '#ffffff', 9));
  // 看板
  out.push(board(90, -560, 380, 90, '#fff8ea', '#e8453a', 16));
  // 屋根の上の大きなソフトクリーム
  out.push(rect(-10, -480, W + 20, 16, '#b8322a'));
  out.push(tr(W / 2, -560, [
    path('M-44 0 L44 0 L0 -0 Z', '#b98a4a'),
    path('M-40 -10 L40 -10 L0 110 Z', '#e0a860'), path('M-40 -10 L40 -10 L30 10 L-30 10 Z', '#c98e4a'),
    path('M-20 10 L20 70 M20 10 L-20 70 M-30 -8 L10 50 M30 -8 L-10 50', 'none', st('#b87a3a', 4)),
    ell(0, -34, 60, 32, '#fffbf2'), ell(0, -70, 44, 26, '#ffffff'), ell(0, -100, 28, 20, '#fffbf2'), path('M-6 -118 Q4 -140 18 -132', 'none', st('#ffffff', 12)),
    ell(-20, -40, 18, 10, '#ffffff', { opacity: 0.8 }), ell(26, -26, 20, 8, '#efe3d0', { opacity: 0.8 })
  ], 1));
  return tr(4, 71, out.join(''), 0.1);
});

// ---------- 案内板（矢印） ----------
// 文字: (x+7.5, y-44.2) (x-7.5, y-35.6) (x+7.5, y-27)
sprite(SH, 's2/signpost', 44, 54, 22, 53, () => {
  const out = [];
  out.push(ell(0, -4, 60, 8, '#000000', { opacity: 0.12 }));
  out.push(rect(-16, -500, 32, 500, '#8a5a36'), rect(-16, -500, 10, 500, '#a8744a'), rect(8, -500, 8, 500, '#6e4428'));
  out.push(path('M-26 -500 L0 -530 L26 -500 Z', '#6e4428'));
  const arrow = (y, dir, c) => {
    const x0 = dir > 0 ? -40 : 40, x1 = dir > 0 ? 190 : -190, tip = dir > 0 ? 220 : -220;
    return [
      path(`M${x0} ${y + 8} L${x1} ${y + 8} L${tip} ${y + 43} L${x1} ${y + 78} L${x0} ${y + 78} Z`, '#000000', { opacity: 0.16 }),
      path(`M${x0} ${y} L${x1} ${y} L${tip} ${y + 35} L${x1} ${y + 70} L${x0} ${y + 70} Z`, shade(c, -0.25)),
      path(`M${x0 + dir * 6} ${y + 6} L${x1} ${y + 6} L${tip - dir * 9} ${y + 35} L${x1} ${y + 64} L${x0 + dir * 6} ${y + 64} Z`, c),
      rect(Math.min(x0, x1) + 10, y + 10, 150, 6, '#ffffff', { opacity: 0.3 }),
      circ(dir > 0 ? -24 : 24, y + 35, 6, shade(c, -0.4))
    ].join('');
  };
  out.push(arrow(-480, 1, '#4f9a45'), arrow(-394, -1, '#e8913a'), arrow(-308, 1, '#3f7fc8'));
  out.push(path('M-16 -60 Q-40 -40 -30 0 M16 -50 Q40 -30 34 0', 'none', st('#5aa84e', 8)), cloverBlob(-24, -40, 26, '#5aa84e', '#9ad47c'), cloverBlob(26, -30, 22, '#4f9a45'));
  return tr(22, 53, out.join(''), 0.1);
});

// ---------- 街灯（動物園・小鳥のかざり） ----------
sprite(SH, 's2/lamp', 20, 64, 10, 63, defs => tr(10, 63, [
  rrect(-40, -60, 80, 60, 10, '#2f5a48'), rect(-40, -60, 80, 10, '#4f8068'),
  path('M-14 -60 L-10 -500 L10 -500 L14 -60 Z', '#35604e'), path('M-8 -60 L-5 -500 L0 -500 L-2 -60 Z', '#6a9a80', { opacity: 0.7 }),
  rrect(-22, -160, 44, 22, 8, '#2f5a48'),
  // 花かご
  path('M-60 -300 L60 -300 L44 -250 L-44 -250 Z', '#8a5a3a'), rect(-60, -300, 120, 8, '#a8744c'),
  ...[-44, -22, 0, 22, 44].map((x, i) => circ(x, -306 - (i % 2) * 10, 16, i % 2 ? '#5aa84e' : '#4f9a45')),
  ...[-36, -8, 20, 42].map((x, i) => circ(x, -316 + (i % 2) * 8, 9, ['#ff7aa6', '#ffffff', '#ffcf3a', '#ff7aa6'][i])),
  path('M-30 -250 Q-36 -220 -30 -200 M24 -250 Q30 -226 26 -210', 'none', st('#4f9a45', 6)),
  // ランプ
  rrect(-34, -520, 68, 22, 6, '#2f5a48'),
  circ(0, -570, 56, '#fff6de', { opacity: 0.3 }),
  path('M-34 -520 L-44 -610 L44 -610 L34 -520 Z', defs.lin([[0, '#fffdf4'], [1, '#f6e6c0']])), path('M-30 -524 L-38 -604 L-18 -604 L-14 -524 Z', '#ffffff', { opacity: 0.8 }),
  path('M-56 -610 L0 -660 L56 -610 Z', '#2f5a48'), rect(-56, -616, 112, 10, '#264a3c'),
  // 小鳥
  tr(0, -672, [ell(0, 0, 20, 14, '#ffcf3a'), circ(16, -10, 11, '#ffcf3a'), path('M26 -12 L36 -8 L26 -6 Z', '#ff8a3a'), circ(18, -12, 2.6, INK), path('M-16 -4 L-32 -14 L-26 4 Z', '#f2b632')])
], 0.1));

// ---------- 木のさく（低い・丸太） ----------
sprite(SH, 's2/fence', 32, 14, 0, 13, () => tr(0, 13, [
  ...[40, 200].map(x => [rrect(x - 12, -120, 24, 120, 6, '#8a6446'), rect(x - 12, -120, 7, 120, '#a8805e'), ell(x, -120, 12, 5, '#c89a74')].join('')),
  rrect(0, -100, 320, 16, 7, '#9a7050'), rect(0, -100, 320, 5, '#b88c68'),
  rrect(0, -56, 320, 16, 7, '#9a7050'), rect(0, -56, 320, 5, '#b88c68')
], 0.1));

// ---------- キリンの家（キリン舎・アカシア・えさかご） ----------
sprite(SH, 's2/giraffeYard', 140, 116, 0, 115, defs => {
  const Gd = G(defs), r = rng(2931), out = [];
  // 小屋
  const bx = 700, bw = 620;
  out.push(rect(bx, -900, bw, 900, '#c48a56'), rect(bx, -900, bw, 900, Gd.wallShade));
  for (let x = bx + 20; x < bx + bw; x += 40) out.push(rect(x, -900, 4, 900, '#a8703e', { opacity: 0.8 }));
  out.push(rect(bx + bw - 40, -900, 40, 900, '#a8703e'));
  // キリン模様の帯
  out.push(rect(bx, -900, bw, 110, '#f2c060'));
  for (let i = 0; i < 9; i++) out.push(path(roundPoly([[bx + 20 + i * 68, -880 + (i % 2) * 10], [bx + 70 + i * 68, -884], [bx + 76 + i * 68, -820], [bx + 26 + i * 68, -814 - (i % 2) * 8]], 12), '#b8702e'));
  // 屋根
  out.push(path(`M${bx - 60} -890 L${bx + bw / 2} -1090 L${bx + bw + 60} -890 Z`, '#4f8f5a'), path(`M${bx - 60} -890 L${bx + bw / 2} -1090 L${bx + bw / 2} -1060 L${bx - 20} -890 Z`, '#6fb074'));
  out.push(rect(bx - 70, -900, bw + 140, 20, '#3a6e44'));
  out.push(circ(bx + bw / 2, -960, 40, '#ffffff'), circ(bx + bw / 2, -960, 30, Gd.glass));
  // 背の高い扉
  const dx = bx + 160, dw = 300;
  out.push(rect(dx - 16, -720, dw + 32, 720, '#7a4a2a'), rect(dx, -704, dw, 704, '#5a3a24'));
  out.push(rect(dx, -704, dw, 704, Gd.inShade, { opacity: 0.6 }));
  out.push(path(`M${dx} -704 L${dx + dw} 0 M${dx + dw} -704 L${dx} 0`, 'none', st('#7a4a2a', 14, { opacity: 0.8 })));
  out.push(rect(dx + dw / 2 - 5, -704, 10, 704, '#7a4a2a'));
  // 干し草
  out.push(path(`M${dx + 20} 0 Q${dx + 80} -70 ${dx + 150} -30 Q${dx + 220} -80 ${dx + 280} 0 Z`, '#e8c86a'));
  for (let i = 0; i < 10; i++) out.push(path(`M${dx + 40 + i * 24} -10 l${(r() - 0.5) * 30} -40`, 'none', st('#d4a846', 4)));
  // アカシアの木
  {
    const a = [path('M150 0 C160 -200 130 -400 180 -560 L204 -556 C170 -420 200 -220 196 0 Z', '#7a5a42'),
      path('M170 -420 C120 -480 70 -520 20 -560 M186 -500 C230 -560 300 -600 380 -620', 'none', st('#7a5a42', 22))];
    for (const [cx, cy, rw] of [[40, -610, 130], [190, -660, 180], [360, -640, 140]]) a.push(ell(cx, cy + 20, rw, 44, '#557a36'), ell(cx, cy, rw * 0.94, 40, '#7aa64a'), ell(cx - rw * 0.3, cy - 14, rw * 0.4, 14, '#a8cc70', { opacity: 0.8 }));
    out.push(tr(110, 0, a));
  }
  // えさかご
  out.push(rect(560, -760, 16, 760, '#8a6446'), rect(560, -760, 5, 760, '#a8805e'));
  out.push(path('M500 -790 L636 -790 L612 -720 L524 -720 Z', '#9a6e3e'), path('M500 -790 L636 -790', 'none', st('#6e4a28', 8)));
  for (let i = 0; i < 5; i++) out.push(path(`M${512 + i * 26} -786 L${528 + i * 22} -722`, 'none', st('#6e4a28', 3)));
  for (let i = 0; i < 9; i++) out.push(path(`M${510 + i * 14} -790 l${(r() - 0.5) * 30} -${26 + r() * 20}`, 'none', st('#7aa84a', 5)));
  // 岩と草
  out.push(path(roundPoly([[0, 0], [30, -90], [140, -120], [220, -60], [240, 0]], 30), '#b9a88c'), path(roundPoly([[30, -70], [120, -104], [180, -80], [90, -60]], 20), '#d6c7aa'));
  for (let i = 0; i < 8; i++) out.push(path(`M${260 + i * 50} 0 q-6 -40 -20 -56 M${270 + i * 50} 0 q4 -44 16 -60`, 'none', st(i % 2 ? '#6aa84a' : '#86bc5a', 6)));
  return tr(0, 115, out.join(''), 0.1);
});

// ---------- パンダ（竹やぶ・岩のほらあな・竹をたべるパンダ） ----------
// 名札の文字: (x+26, y-17)
sprite(SH, 's2/pandaYard', 130, 90, 0, 89, () => {
  const r = rng(2941), out = [];
  // 竹
  const bamboo = (x, h, c, lean) => {
    const o = [path(`M${x - 13} 0 L${x - 11 + lean} ${-h} L${x + 11 + lean} ${-h} L${x + 13} 0 Z`, c), path(`M${x - 7} 0 L${x - 6 + lean} ${-h} L${x - 1 + lean} ${-h} L${x - 2} 0 Z`, shade(c, 0.25), { opacity: 0.7 })];
    for (let y = -90; y > -h; y -= 90 + (x % 3) * 8) { const l = lean * (-y / h); o.push(rect(x - 15 + l, y - 4, 30, 8, shade(c, -0.22)), rect(x - 15 + l, y - 4, 30, 3, shade(c, 0.3))); }
    return o.join('');
  };
  const leaves = (x, y, n, s = 1) => {
    const o = [];
    for (let k = 0; k < n; k++) { const a = -Math.PI + (k / (n - 1)) * Math.PI * 0.9 + (r() - 0.5) * 0.3, L = (60 + r() * 30) * s; o.push(path(`M${x} ${y} Q${x + Math.cos(a) * L * 0.5 - 8} ${y + Math.sin(a) * L * 0.5 - 10} ${x + Math.cos(a) * L} ${y + Math.sin(a) * L + 16} Q${x + Math.cos(a) * L * 0.5 + 8} ${y + Math.sin(a) * L * 0.5 + 10} ${x} ${y} Z`, k % 2 ? '#5aa048' : '#6fb655')); }
    return o.join('');
  };
  const cols = ['#7cba54', '#8ac65c', '#6aa84a', '#94cc66'];
  const stalks = [];
  for (let i = 0; i < 15; i++) stalks.push([30 + i * 88 + (r() - 0.5) * 30, 520 + r() * 300, cols[i % 4], (r() - 0.5) * 50]);
  for (const [x, h, c, l] of stalks) out.push(bamboo(x, h, shade(c, -0.12), l));
  for (const [x, h, , l] of stalks) { out.push(leaves(x + l, -h + 20, 7), leaves(x + l * 0.6 - 10, -h * 0.62, 4, 0.8)); }
  // ほらあな
  out.push(path(roundPoly([[640, 0], [700, -300], [880, -400], [1080, -330], [1180, -120], [1200, 0]], 60), '#a49a88'));
  out.push(path(roundPoly([[700, -200], [760, -330], [900, -390], [1000, -350], [880, -300]], 40), '#c2b8a4'));
  out.push(path('M820 0 Q820 -200 920 -210 Q1020 -200 1020 0 Z', '#4a4238'), path('M840 0 Q840 -180 920 -190 Q940 -190 956 -184 Q880 -160 870 0 Z', '#2e2822', { opacity: 0.6 }));
  // すわる台の岩
  out.push(path(roundPoly([[220, 0], [250, -90], [420, -110], [540, -60], [560, 0]], 30), '#9e9482'), path(roundPoly([[260, -70], [330, -104], [460, -96], [380, -70]], 16), '#bdb3a0'));
  // パンダ（すわって竹をたべる）
  out.push(tr(400, -96, [
    ell(0, -110, 110, 118, '#fbfbf6'), ell(-10, -120, 70, 70, '#ffffff', { opacity: 0.6 }),
    ell(-80, -20, 46, 36, '#2a2a30'), ell(80, -20, 46, 36, '#2a2a30'),
    ell(-60, 6, 30, 22, '#3a3a42'), ell(60, 6, 30, 22, '#3a3a42'),
    ell(0, -180, 128, 30, '#2a2a30', { opacity: 0.0 }),
    path('M-110 -160 Q-60 -130 -40 -160 Q-60 -200 -110 -190 Z', '#2a2a30'),
    // 竹
    path('M60 -60 L40 -330', 'none', st('#6aa84a', 14)), path('M58 -120 L44 -300', 'none', st('#9ad06a', 4)), leaves(40, -330, 5, 0.9),
    path('M110 -170 Q80 -130 40 -150 Q30 -110 60 -90 Q120 -110 130 -150 Z', '#2a2a30'),
    // 頭
    circ(-80, -300, 32, '#2a2a30'), circ(70, -306, 32, '#2a2a30'),
    ell(-4, -250, 104, 90, '#ffffff'), ell(-20, -276, 60, 40, '#ffffff', { opacity: 0.7 }),
    ell(-44, -258, 24, 30, '#2a2a30', { rot: 30 }), ell(36, -262, 24, 30, '#2a2a30', { rot: -30 }),
    circ(-40, -262, 9, '#ffffff'), circ(36, -266, 9, '#ffffff'), circ(-38, -260, 4, INK), circ(38, -264, 4, INK),
    ell(-4, -222, 16, 10, '#2a2a30'), path('M-18 -204 Q-4 -194 10 -204', 'none', st('#2a2a30', 4)),
    ell(-70, -214, 16, 10, '#ffb0c0', { opacity: 0.7 }), ell(62, -218, 16, 10, '#ffb0c0', { opacity: 0.7 })
  ], 0.9));
  // 竹垣（ひくい・はしだけ）
  const fence = (x0, x1) => { const o = [rect(x0, -120, x1 - x0, 12, '#b89a5a'), rect(x0, -60, x1 - x0, 12, '#b89a5a')]; for (let x = x0 + 6; x < x1; x += 22) o.push(rrect(x, -140, 16, 140, 7, '#d4bc7a'), rect(x + 3, -140, 4, 140, '#ecd89a')); return o.join(''); };
  out.push(fence(0, 200), fence(1100, 1290));
  // 名札
  out.push(rect(250, -110, 10, 110, '#6e4428'), rect(450, -110, 10, 110, '#6e4428'));
  out.push(board(160, -220, 200, 90, '#fffaf0', '#2a2a30', 12));
  // 草
  for (let i = 0; i < 12; i++) out.push(path(`M${40 + i * 100 + r() * 30} 0 q-4 -30 -16 -44 M${48 + i * 100} 0 q4 -36 14 -48`, 'none', st(i % 2 ? '#5aa048' : '#7cba54', 6)));
  return tr(0, 89, out.join(''), 0.1);
});

// ---------- ゾウの庭（岩山・ゾウの家の入り口・大きな木） ----------
sprite(SH, 's2/elephantYard', 150, 104, 0, 103, defs => {
  const Gd = G(defs), r = rng(2951), out = [];
  // 大きな木（右）
  out.push(path('M1280 0 C1290 -200 1260 -400 1300 -620 L1330 -616 C1300 -420 1330 -200 1330 0 Z', '#7a5a42'));
  const blobs = [];
  for (let i = 0; i < 20; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([1300 + Math.cos(a) * 170 * d, -760 + Math.sin(a) * 140 * d, 60 + r() * 26]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#3a7f3c'));
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by, br * 0.9, r() < 0.5 ? '#5dab4f' : '#68b758', by < -780 ? '#a6dc84' : null));
  // 岩山
  const rock = (pts, c, hi) => [path(roundPoly(pts, 50), shade(c, -0.12)), path(roundPoly(pts.map(([x, y]) => [x, y - 14]), 50), c), hi ? path(roundPoly(hi, 30), shade(c, 0.18)) : ''].join('');
  out.push(rock([[0, 0], [20, -520], [180, -700], [420, -660], [560, -520], [640, -360], [700, 0]], '#d9bf92', [[60, -500], [180, -660], [380, -630], [240, -560]]));
  out.push(rock([[560, 0], [600, -380], [760, -520], [960, -470], [1100, -300], [1160, 0]], '#e2c9a0', [[640, -380], [760, -500], [920, -460], [780, -420]]));
  for (let i = 0; i < 12; i++) { const x = 60 + r() * 1000, y = -80 - r() * 400; out.push(path(`M${x} ${y} q${20 + r() * 30} ${10 + r() * 16} ${50 + r() * 40} 0`, 'none', st('#b8986a', 5, { opacity: 0.6 }))); }
  // ゾウの家の入り口
  out.push(path('M150 0 L150 -330 Q300 -470 450 -330 L450 0 Z', '#e8dcc6'), path('M190 0 L190 -310 Q300 -420 410 -310 L410 0 Z', '#5a4a3e'), path('M190 0 L190 -310 Q300 -420 410 -310 L410 0 Z', Gd.inShade));
  out.push(path('M150 -330 Q300 -470 450 -330', 'none', st('#cdbfa6', 16)));
  // ほし草と水おけ
  out.push(path('M470 0 Q520 -80 600 -40 Q660 -90 720 0 Z', '#e8c86a'));
  for (let i = 0; i < 8; i++) out.push(path(`M${490 + i * 28} -10 l${(r() - 0.5) * 30} -40`, 'none', st('#d4a846', 4)));
  out.push(rrect(760, -90, 200, 90, 16, '#9aa4ae'), rect(776, -80, 168, 22, '#6fc6e0'), rect(776, -80, 168, 6, '#c8f0fa'));
  // 地面の草
  for (let i = 0; i < 14; i++) out.push(path(`M${20 + i * 100 + r() * 40} 0 q-4 -34 -16 -48 M${30 + i * 100} 0 q4 -40 14 -52`, 'none', st(i % 2 ? '#6aa84a' : '#86bc5a', 6)));
  return tr(0, 103, out.join(''), 0.1);
});

// ---------- ゾウ（右向き・鼻を上げる）: 鼻の先は (x+56, y-48) ----------
sprite(SH, 's2/elephant', 78, 62, 6, 61, () => {
  const c = { base: '#9ea9b5', hi: '#b7c1cb', dark: '#838e9b', ear: '#8c97a4' };
  return tr(6, 61, [
    ell(200, -6, 250, 24, '#000000', { opacity: 0.12 }),
    // うしろ足
    rrect(40, -170, 76, 170, 30, c.dark), rrect(290, -170, 76, 170, 30, c.dark),
    // しっぽ
    path('M-10 -260 Q-40 -210 -26 -170', 'none', st(c.dark, 12)), path('M-26 -170 l-10 20 M-26 -170 l6 22', 'none', st('#6d7784', 6)),
    // 体
    ell(190, -270, 230, 150, c.base), ell(170, -300, 190, 106, c.hi, { opacity: 0.7 }), ell(120, -360, 90, 30, '#d3dae1', { opacity: 0.7 }),
    // 前足
    rrect(110, -180, 80, 180, 32, c.base), rrect(360, -190, 80, 190, 32, c.base),
    ...[120, 370].map(x => [rect(x + 6, -22, 60, 12, '#e6e1d6', { opacity: 0.7 })].join('')),
    // 頭
    circ(430, -330, 116, c.base), circ(420, -350, 96, c.hi, { opacity: 0.7 }),
    // 耳
    path('M370 -420 C250 -470 230 -250 330 -200 C380 -186 400 -250 402 -330 Z', c.ear), path('M366 -396 C282 -430 270 -276 336 -232 C368 -224 382 -270 384 -330 Z', '#efbcc6', { opacity: 0.55 }),
    // 鼻（上へ）
    path('M500 -290 C560 -300 580 -360 560 -470', 'none', st(c.base, 60)),
    path('M506 -296 C564 -306 578 -360 562 -462', 'none', st(c.hi, 38, { opacity: 0.8 })),
    ...[0, 1, 2, 3, 4].map(k => path(`M${538 + k * 5} ${-330 - k * 30} l26 -4`, 'none', st(c.dark, 4))),
    ell(560, -484, 32, 16, c.dark), ell(560, -488, 20, 8, '#6d7784'),
    // 目・きば・ほっぺ
    eye(468, -372, 15), path('M470 -400 Q484 -414 500 -406', 'none', st('#6d7784', 5)),
    path('M480 -270 Q520 -250 534 -284', 'none', st('#fbf7ee', 18)),
    ell(440, -292, 30, 16, '#f4a8b8', { opacity: 0.6 })
  ], 0.1);
});

// ---------- コアラ（ユーカリの木・コアラ館） ----------
// 名札の文字: (x+74, y-39)
sprite(SH, 's2/koalaYard', 110, 116, 0, 115, defs => {
  const Gd = G(defs), r = rng(2961), out = [];
  const leafC = ['#8db89a', '#a3c8ab', '#79a488'];
  const euca = (x, h, lean) => {
    const o = [];
    o.push(path(`M${x - 34} 0 C${x - 30} ${-h * 0.4} ${x - 20 + lean} ${-h * 0.7} ${x - 10 + lean} ${-h} L${x + 14 + lean} ${-h} C${x + 20 + lean} ${-h * 0.7} ${x + 30} ${-h * 0.4} ${x + 34} 0 Z`, '#e8e2d4'));
    for (let k = 0; k < 6; k++) o.push(path(roundPoly([[x - 26 + (k % 2) * 20, -80 - k * h / 7], [x - 6 + (k % 2) * 20, -90 - k * h / 7], [x - 4 + (k % 2) * 20, -40 - k * h / 7], [x - 22 + (k % 2) * 20, -36 - k * h / 7]], 10), '#c8b89a', { opacity: 0.8 }));
    o.push(path(`M${x + 10} ${-h * 0.55} C${x + 60} ${-h * 0.65} ${x + 110} ${-h * 0.72} ${x + 150} ${-h * 0.8}`, 'none', st('#ddd6c6', 16)));
    o.push(path(`M${x - 8} ${-h * 0.7} C${x - 60} ${-h * 0.78} ${x - 110} ${-h * 0.82} ${x - 140} ${-h * 0.9}`, 'none', st('#ddd6c6', 14)));
    const bl = [];
    for (let i = 0; i < 16; i++) { const a = r() * TAU, d = Math.sqrt(r()); bl.push([x + lean + Math.cos(a) * 170 * d, -h - 30 + Math.sin(a) * 100 * d, 46 + r() * 22]); }
    bl.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, br] of bl) o.push(cloverBlob(bx, by + 12, br, '#6a927a'));
    for (const [bx, by, br] of bl) o.push(cloverBlob(bx, by, br * 0.9, r() < 0.5 ? '#8db89a' : '#9cc4a6', by < -h - 40 ? '#cfe6d2' : null));
    for (let i = 0; i < 18; i++) {
      const [bx, by, br] = bl[Math.floor(r() * bl.length)], cx = bx + (r() - 0.5) * br, cy = by + br * 0.5;
      for (let k = 0; k < 3; k++) { const aa = Math.PI / 2 + (k - 1) * 0.3; o.push(path(`M${cx} ${cy} q${Math.cos(aa) * 14 - 6} ${Math.sin(aa) * 20} ${Math.cos(aa) * 20} ${Math.sin(aa) * 50}`, 'none', st(leafC[(i + k) % 3], 10))); }
    }
    return o.join('');
  };
  const koala = (x, y, s, sleep) => tr(x, y, [
    ell(0, 30, 52, 62, '#9aa0a6'), ell(-8, 20, 30, 40, '#b8bdc2', { opacity: 0.7 }), ell(0, 60, 30, 26, '#e8e6e0'),
    ell(-44, 0, 20, 34, '#8a9096', { rot: 30 }), ell(44, 4, 20, 34, '#8a9096', { rot: -30 }),
    circ(-52, -76, 30, '#9aa0a6'), circ(52, -76, 30, '#9aa0a6'), circ(-52, -76, 18, '#f2f0ea'), circ(52, -76, 18, '#f2f0ea'),
    ell(0, -50, 56, 48, '#a4aab0'), ell(0, -38, 20, 24, '#3a3a42'), ell(-4, -46, 6, 8, '#6a6a72'),
    sleep ? path('M-30 -60 q8 6 16 0 M14 -60 q8 6 16 0', 'none', st(INK, 4)) : eye(-24, -60, 6) + eye(24, -60, 6),
    ell(-36, -34, 9, 6, '#ffb0c0', { opacity: 0.6 }), ell(36, -34, 9, 6, '#ffb0c0', { opacity: 0.6 })
  ], s);
  out.push(euca(820, 820, 30));
  // コアラ館
  const hx = 380, hw = 560;
  out.push(rect(hx, -440, hw, 440, '#f1dfb8'), rect(hx, -440, hw, 440, Gd.wallShade), rect(hx + hw - 30, -440, 30, 440, '#dcc59a'));
  out.push(path(`M${hx - 50} -430 L${hx + 60} -540 L${hx + hw - 60} -540 L${hx + hw + 50} -430 Z`, '#a8603a'), rect(hx - 50, -440, hw + 100, 18, '#7a4028'));
  for (let k = 1; k < 4; k++) out.push(rect(hx - 50 + k * 26, -440 - k * 27, hw + 100 - k * 52, 4, '#c47a4a', { opacity: 0.7 }));
  out.push(circ(hx + 150, -250, 90, '#ffffff'), circ(hx + 150, -250, 74, Gd.glass), path(`M${hx + 100} -300 L${hx + 140} -310 L${hx + 96} -240 Z`, '#ffffff', { opacity: 0.5 }));
  out.push(rect(hx + 320, -300, 160, 300, '#8a5a3a'), rect(hx + 334, -286, 132, 150, Gd.glass), circ(hx + 450, -130, 7, '#f2c94c'));
  out.push(board(hx + 250, -430, 260, 84, '#fffaf0', '#7a4028', 12));
  out.push(rect(hx, -30, hw, 30, '#cdbfa6'));
  // 木（前）とコアラ
  out.push(euca(200, 700, -20));
  out.push(koala(214, -440, 1, false));
  out.push(koala(700, -700, 0.85, true));
  // 足もとの草
  for (let i = 0; i < 10; i++) out.push(path(`M${20 + i * 104 + r() * 30} 0 q-4 -30 -16 -44 M${30 + i * 104} 0 q4 -36 14 -48`, 'none', st(i % 2 ? '#6aa84a' : '#86bc5a', 6)));
  return tr(0, 115, out.join(''), 0.1);
});

// ---------- フラミンゴ（2つのポーズ） ----------
const flamingo = (pose) => {
  const pk = '#f58fae', pk2 = '#f9aac2', dk = '#e06e92';
  const out = [path('M0 0 L0 -150', 'none', st('#e87a9a', 6))];
  if (pose === 0) out.push(path('M0 -100 L-24 -120 L-2 -146', 'none', st('#e87a9a', 5)));
  else out.push(path('M8 0 L6 -150', 'none', st('#e87a9a', 6)));
  out.push(ell(6, -176, 66, 40, pk, { rot: -10 }), ell(-8, -184, 46, 24, pk2, { rot: -10 }), path('M-44 -170 Q-78 -160 -70 -134 Q-44 -156 -22 -156 Z', dk), path('M-10 -196 Q30 -206 60 -190', 'none', st(dk, 6)));
  if (pose === 0) out.push(path('M52 -188 Q96 -250 54 -300 Q34 -330 64 -342', 'none', st(pk, 17)), circ(68, -338, 23, pk), eye(74, -342, 5),
    path('M84 -338 Q116 -332 110 -306 Q100 -316 86 -324 Z', INK), path('M84 -338 Q106 -336 106 -322 L90 -326 Z', '#fff2e0'));
  else out.push(path('M52 -186 Q100 -210 90 -250 Q80 -280 40 -250', 'none', st(pk, 17)), circ(34, -240, 22, pk), eye(28, -246, 5),
    path('M20 -232 Q6 -206 30 -196 Q30 -214 34 -222 Z', INK), path('M20 -232 Q14 -216 26 -210 L30 -222 Z', '#fff2e0'));
  return out.join('');
};
sprite(SH, 's2/flam0', 22, 38, 9, 37, () => tr(9, 37, flamingo(0), 0.1));
sprite(SH, 's2/flam1', 22, 38, 9, 37, () => tr(9, 37, flamingo(1), 0.1));

// ---------- 池の向こう岸（岩・草・フラミンゴの小屋） ----------
// 名札の文字: (x+30, y-25.5)
sprite(SH, 's2/pondBack', 240, 40, 0, 39, () => {
  const r = rng(2971), out = [];
  out.push(path('M0 40 L0 -160 Q300 -210 600 -170 Q900 -140 1200 -180 Q1600 -220 2000 -170 Q2240 -150 2400 -170 L2400 40 Z', '#8fc27a'));
  out.push(path('M0 -150 Q300 -200 600 -160 Q900 -130 1200 -170 Q1600 -210 2000 -160 Q2240 -140 2400 -160', 'none', st('#b2dc96', 8)));
  // 小屋
  out.push(rect(120, -330, 360, 300, '#f6efe0'), rect(440, -330, 40, 300, '#e2d6c0'));
  out.push(path('M90 -320 L300 -420 L510 -320 Z', '#e27a8a'), rect(86, -330, 428, 16, '#c05a6a'));
  out.push(rect(180, -260, 80, 80, '#a9c8da'), rect(330, -250, 90, 220, '#b98a5a'));
  out.push(board(160, -300, 280, 70, '#fffaf0', '#e27a8a', 10));
  // 岩
  for (const [x, w0, h0] of [[600, 160, 90], [1180, 120, 70], [1700, 180, 100], [2200, 140, 80]]) out.push(path(roundPoly([[x, 0], [x + 20, -h0], [x + w0 * 0.6, -h0 - 20], [x + w0, -h0 * 0.5], [x + w0 + 20, 0]], 30), '#a9a595'), path(roundPoly([[x + 30, -h0 + 10], [x + w0 * 0.6, -h0 - 10], [x + w0 * 0.8, -h0 * 0.6], [x + w0 * 0.4, -h0 * 0.6]], 16), '#c6c2b2'));
  // 草・アシ
  for (let i = 0; i < 40; i++) { const x = 500 + r() * 1900, hh = 60 + r() * 80; out.push(path(`M${x} 0 q${(r() - 0.5) * 20} ${-hh * 0.6} ${(r() - 0.5) * 30} ${-hh}`, 'none', st(r() < 0.5 ? '#5aa048' : '#76b85a', 5))); }
  for (let i = 0; i < 8; i++) { const x = 560 + i * 240 + r() * 60; out.push(rrect(x - 7, -150 - r() * 30, 14, 40, 7, '#8a5a36')); }
  return tr(0, 39, out.join(''), 0.1);
});

// ---------- 池のはしのアシ ----------
sprite(SH, 's2/reeds', 34, 42, 17, 41, () => {
  const r = rng(2981), out = [];
  out.push(path(roundPoly([[-150, 20], [-120, -60], [0, -80], [120, -50], [150, 20]], 30), '#9a978a'), path(roundPoly([[-110, -40], [-20, -76], [80, -54], [0, -40]], 16), '#b8b5a6'));
  for (let i = 0; i < 16; i++) { const x = -120 + r() * 240, hh = 200 + r() * 180, bend = (r() - 0.5) * 60; out.push(path(`M${x} -40 Q${x + bend * 0.3} ${-hh * 0.6} ${x + bend} ${-hh}`, 'none', st(i % 2 ? '#5a9a48' : '#72b25a', 7))); }
  for (let i = 0; i < 4; i++) { const x = -80 + i * 55 + r() * 20, y = -260 - r() * 120; out.push(path(`M${x} ${y + 60} L${x} ${y - 30}`, 'none', st('#6a8a48', 4)), rrect(x - 8, y - 10, 16, 56, 8, '#8a5a36')); }
  return tr(17, 41, out.join(''), 0.1);
});

// ---------- メリーゴーランド（台・屋根・木馬） ----------
sprite(SH, 's2/merryBase', 84, 52, 42, 51, defs => {
  const out = [];
  out.push(ell(0, -4, 420, 24, '#000000', { opacity: 0.12 }));
  // まん中の柱（鏡と絵）
  out.push(rect(-60, -500, 120, 440, '#f6e4c0'), rect(-60, -500, 120, 440, defs.lin([[0, '#000000', 0.1], [0.5, '#ffffff', 0.2], [1, '#000000', 0.15]], 0, 0, 1, 0)));
  for (let k = 0; k < 4; k++) out.push(rrect(-44, -480 + k * 104, 88, 84, 14, k % 2 ? '#bfe3f5' : '#ffd6e2'), rrect(-44, -480 + k * 104, 88, 84, 14, 'none', { stroke: '#e0b04a', strokeWidth: 6 }));
  // 台
  out.push(path('M-400 -60 L400 -60 L380 0 L-380 0 Z', '#c43a4a'), rect(-400, -76, 800, 20, '#f2c94c'), rect(-400, -76, 800, 6, '#fff2b0'));
  for (let x = -370; x < 380; x += 50) out.push(circ(x, -30, 9, '#fff6c8'), circ(x, -30, 5, '#ffffff'));
  return tr(42, 51, out.join(''), 0.1);
});
sprite(SH, 's2/merryTop', 90, 44, 45, 20, defs => {
  const out = [];
  const cols = ['#e8453a', '#ffffff'];
  // 円すいの屋根（しま）
  for (let i = 0; i < 12; i++) {
    const x0 = -440 + i * (880 / 12), x1 = x0 + 880 / 12;
    out.push(path(`M0 -200 L${x0} 0 L${x1} 0 Z`, cols[i % 2]));
  }
  out.push(path('M0 -200 L-440 0 L440 0 Z', defs.lin([[0, '#000000', 0.12], [0.5, '#ffffff', 0.15], [1, '#000000', 0.18]], 0, 0, 1, 0)));
  // ふちの飾り（波形）
  out.push(rect(-450, -10, 900, 50, '#f2c94c'), rect(-450, -10, 900, 12, '#fff2b0'));
  for (let i = 0; i < 18; i++) { const x = -450 + i * 50; out.push(path(`M${x} 40 Q${x + 25} 90 ${x + 50} 40 Z`, i % 2 ? '#e8453a' : '#3f7fc8')); }
  for (let x = -430; x < 440; x += 50) out.push(circ(x + 10, 16, 8, '#fff6c8'));
  // てっぺん
  out.push(circ(0, -206, 22, '#f2c94c'), path('M0 -226 L0 -300', 'none', st('#c89a2a', 6)), path('M2 -300 L60 -284 L2 -266 Z', '#e8453a'));
  return tr(45, 20, out.join(''), 0.1);
});
[['#ffffff', '#f2c94c', '#e8a8c0'], ['#ffd6e2', '#8ac8f0', '#e86a8a'], ['#d8ecff', '#f2c94c', '#6a9ae0']].forEach(([body, mane, saddle], i) => sprite(SH, `s2/horse${i}`, 22, 24, 11, 20, () => tr(11, 20, [
  // 左向きの木馬（ポールはゲームで描く）
  ell(10, -90, 70, 36, body), ell(0, -100, 50, 20, '#ffffff', { opacity: 0.5 }),
  path('M-40 -110 Q-70 -160 -60 -190 L-30 -180 Q-40 -150 -10 -120 Z', body),
  rrect(-100, -210, 64, 40, 18, body), circ(-80, -198, 5, INK), path('M-64 -212 L-56 -236 L-46 -210 Z', body),
  path('M-40 -200 Q-20 -170 -24 -130 Q-10 -150 -16 -196 Z', mane),
  path('M70 -100 Q110 -90 100 -40', 'none', st(mane, 12)),
  path('M-30 -64 L-60 -10 M-10 -64 L0 -4 M40 -64 L30 -4 M60 -66 L90 -20', 'none', st(body, 14)),
  ell(20, -122, 30, 12, saddle), rect(-2, -80, 50, 10, '#f2c94c')
], 0.1)));

// ---------- 豆汽車 ----------
sprite(SH, 's2/ktrain', 80, 36, 0, 35, () => {
  const out = [];
  // レール
  out.push(rect(0, -20, 800, 12, '#8a8f96'), rect(0, -20, 800, 4, '#c3c7cc'));
  for (let x = 10; x < 800; x += 40) out.push(rect(x, -12, 24, 12, '#7a5a42'));
  // 客車
  const car = (x, c) => [rrect(x, -150, 180, 110, 16, c), rect(x + 14, -140, 152, 14, '#ffffff', { opacity: 0.35 }), rect(x + 20, -190, 12, 50, '#8a5a36'), rect(x + 148, -190, 12, 50, '#8a5a36'), rrect(x - 10, -206, 200, 22, 8, shade(c, -0.25)), circ(x + 40, -30, 22, '#3a3a40'), circ(x + 140, -30, 22, '#3a3a40'), circ(x + 40, -30, 8, '#c9c9c9'), circ(x + 140, -30, 8, '#c9c9c9')].join('');
  out.push(car(20, '#3f7fc8'), car(230, '#f2b632'));
  out.push(rect(200, -80, 40, 10, '#555555'), rect(410, -80, 40, 10, '#555555'));
  // きかんしゃ
  const lx = 450;
  out.push(rrect(lx, -170, 250, 130, 18, '#d94a3f'), rrect(lx + 170, -250, 120, 210, 16, '#b8322a'), rect(lx + 186, -234, 88, 60, '#bfe3f5'));
  out.push(rrect(lx + 150, -276, 160, 30, 10, '#2a2a30'));
  out.push(rect(lx + 30, -250, 44, 80, '#2a2a30'), rrect(lx + 18, -272, 68, 26, 8, '#2a2a30'), rect(lx + 100, -210, 40, 40, '#f2c94c'));
  out.push(rect(lx, -80, 300, 14, '#f2c94c'), circ(lx + 50, -34, 30, '#2a2a30'), circ(lx + 190, -34, 30, '#2a2a30'), circ(lx + 50, -34, 11, '#e8453a'), circ(lx + 190, -34, 11, '#e8453a'));
  out.push(path(`M${lx + 250} -56 L${lx + 330} -20 L${lx + 250} -20 Z`, '#555555'), circ(lx + 20, -130, 14, '#fff3b0'));
  return tr(0, 35, out.join(''), 0.1);
});

// ---------- のりものの切符売り場 ----------
// 看板の文字: (x+16, y-40.5)
sprite(SH, 's2/booth', 36, 50, 2, 49, defs => {
  const Gd = G(defs), out = [];
  out.push(rect(20, -330, 280, 330, '#fff6e6'), rect(260, -330, 40, 330, '#ecdcc0'));
  out.push(rect(50, -270, 220, 120, Gd.glass), path('M60 -266 L110 -266 L60 -200 Z', '#ffffff', { opacity: 0.5 }), rect(40, -150, 240, 16, '#c98a4a'));
  out.push(rect(20, -40, 280, 40, '#3f7fc8'));
  out.push(awning(Gd, 0, -390, 320, 60, '#3f7fc8', '#ffffff', 6));
  out.push(board(10, -480, 300, 90, '#fffaf0', '#3f7fc8', 12));
  return tr(2, 49, out.join(''), 0.1);
});

// ---------- 旧ハンター住宅（白い木の洋館・ベランダ） ----------
// 名札の文字: (x+120, y-12)
sprite(SH, 's2/hunter', 156, 128, 4, 127, defs => {
  const Gd = G(defs), out = [];
  const W = 1480, wall = '#f7f5ee', trim = '#ffffff', sash = '#6f8a86';
  // 屋根（寄棟）とえんとつ
  for (const x of [380, 1160]) out.push(rect(x, -1250, 70, 200, '#a8543a'), rect(x - 10, -1262, 90, 22, '#8a4030'), ...[0, 1, 2, 3, 4, 5].map(k => rect(x, -1230 + k * 30, 70, 3, '#8a4030', { opacity: 0.6 })));
  out.push(path(`M-40 -960 L180 -1180 L${W - 180} -1180 L${W + 40} -960 Z`, '#5f6f7c'));
  out.push(path(`M-40 -960 L180 -1180 L220 -1180 L20 -960 Z`, '#7a8a96'));
  for (let i = 1; i < 6; i++) { const t = i / 6; out.push(rect(180 - 220 * t, -1180 + 220 * t - 2, W - 360 + 440 * t, 4, '#4f5d68', { opacity: 0.6 })); }
  out.push(rect(-50, -970, W + 100, 22, '#46525c'), rect(-50, -970, W + 100, 6, '#8a9aa6'));
  // ドーマー窓
  out.push(rect(1000, -1130, 130, 110, wall), path('M980 -1120 L1065 -1190 L1150 -1120 Z', '#5f6f7c'), rect(1024, -1110, 82, 80, Gd.glass), rect(1062, -1110, 6, 80, trim));
  // かべ（下見板）
  out.push(rect(0, -950, W, 950, wall), rect(0, -950, W, 950, Gd.wallShade));
  for (let y = -940; y < -40; y += 28) out.push(rect(0, y, W, 3, '#e2ddd0'));
  out.push(rect(W - 50, -950, 50, 950, '#e6e1d4'));
  // 2階：ガラスのベランダ（小さなまどがたくさん）
  const vx = 40, vw = 860;
  out.push(rect(vx, -900, vw, 380, '#eaf2f2'));
  for (let i = 0; i < 6; i++) {
    const x = vx + 20 + i * 140;
    out.push(rect(x, -880, 120, 250, Gd.glass));
    for (let k = 1; k < 4; k++) out.push(rect(x, -880 + k * 62, 120, 5, trim));
    out.push(rect(x + 58, -880, 5, 250, trim), path(`M${x + 8} -876 L${x + 40} -876 L${x + 8} -820 Z`, '#ffffff', { opacity: 0.5 }));
    out.push(rect(x - 20, -900, 20, 380, trim));
  }
  out.push(rect(vx + vw - 20, -900, 24, 380, trim));
  // 2階の手すり（格子）
  out.push(rect(vx - 10, -640, vw + 20, 16, trim), rect(vx - 10, -530, vw + 20, 20, trim));
  for (let x = vx; x < vx + vw; x += 36) out.push(path(`M${x} -624 L${x + 36} -530 M${x + 36} -624 L${x} -530`, 'none', st('#dcd8cc', 5)));
  // 1階と2階のあいだの軒（ブラケット）
  out.push(rect(-20, -520, W + 40, 30, trim), rect(-20, -490, W + 40, 10, '#000000', { opacity: 0.08 }));
  for (let x = 30; x < W; x += 110) out.push(path(`M${x} -490 L${x + 30} -490 L${x + 30} -450 Q${x + 12} -456 ${x} -470 Z`, '#ecebe4'));
  // 1階：アーチのベランダ
  out.push(rect(vx, -480, vw, 440, '#d8dcd8'));
  for (let i = 0; i < 5; i++) {
    const x = vx + 20 + i * 168;
    out.push(rect(x + 10, -420, 148, 380, '#8a9a9a'), rect(x + 10, -420, 148, 380, Gd.inShade, { opacity: 0.5 }));
    out.push(rect(x + 40, -380, 88, 170, Gd.glass), rect(x + 82, -380, 5, 170, trim));
    out.push(path(`M${x} -480 L${x + 168} -480 L${x + 168} -330 Q${x + 84} -440 ${x} -330 Z`, trim));
    out.push(rect(x - 10, -480, 26, 440, trim));
  }
  out.push(rect(vx + vw - 16, -480, 26, 440, trim));
  // 右：窓（よろい戸）
  for (const [y, h] of [[-860, 250], [-420, 250]]) for (const x of [1010, 1250]) {
    out.push(rect(x - 46, y, 36, h, sash), rect(x + 130, y, 36, h, sash));
    for (let k = 0; k < h / 26; k++) out.push(rect(x - 42, y + 8 + k * 26, 28, 5, shade(sash, -0.2)), rect(x + 134, y + 8 + k * 26, 28, 5, shade(sash, -0.2)));
    out.push(win(Gd, x, y, 120, h, { frame: trim, curtain: '#f3ecd8', bar: true }));
  }
  // 土台・階段
  out.push(rect(-10, -50, W + 20, 50, '#b8b0a2'), rect(-10, -50, W + 20, 10, '#d8d2c6'));
  out.push(rect(360, -60, 240, 20, '#d8d2c6'), rect(340, -40, 280, 40, '#c9c2b4'));
  // 植え込みと名札
  for (const x of [80, 700, 1400]) out.push(cloverBlob(x, -60, 60, '#3f8a3f'), cloverBlob(x, -70, 54, '#5dab4f', '#9ad47c'));
  out.push(rect(1110, -130, 10, 130, '#6e4428'), rect(1270, -130, 10, 130, '#6e4428'));
  out.push(board(1000, -180, 400, 80, '#fffaf0', '#5f6f7c', 10));
  return tr(4, 127, out.join(''), 0.1);
});

// ---------- 観覧車の乗り場（ゴンドラの下の台） ----------
sprite(SH, 's2/wheelDeck', 64, 20, 32, 19, () => tr(32, 19, [
  rect(-300, -120, 600, 120, '#e9e2d4'), rect(-300, -120, 600, 16, '#fffaf0'), rect(-300, -20, 600, 20, '#c9c0ae'),
  ...[-240, -120, 0, 120, 240].map(x => rect(x - 4, -104, 8, 84, '#d6cebd')),
  rect(-40, -190, 80, 70, '#f6f0e4'), path('M-60 -190 L0 -226 L60 -190 Z', '#e8453a')
], 0.1));
