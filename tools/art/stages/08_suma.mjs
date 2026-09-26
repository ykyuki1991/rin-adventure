// ステージ8「須磨海岸」（夏の晴れた日の海水浴場）
// 背景：入道雲・淡路島と明石海峡大橋（遠く）・鉢伏山と山上遊園のロープウェイ・ヨットハーバーの灯台と防波堤・近くの海
// 地面：白い砂浜（貝がら・足あと）、ターコイズの海、岩場
// 飾り（シート s8）：海の家・パラソル・須磨の松・監視台・ビーチチェア・砂のお城・おもちゃ・須磨海浜水族園・シャチ・ヨット
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY } from '../bgs.mjs';
import { U, tile, SLOPES, slopeTile } from '../tiles.mjs';
import { TAU, st, G, win, awning, board, inside, cloverBlob, clover } from '../kit.mjs';

resetTheme('suma');
const SH = 's8';

// ========================================================================
// 共通の道具（stage 9 でも使う）
// ========================================================================
// もくもくの雲（下が平ら・上が明るい・下が青いかげ）
export function puff(x, y, s, o = {}) {
  const c = o.c || '#ffffff', sh = o.sh || '#d5e5f2', hi = o.hi || '#ffffff', r = rng(o.seed || 1);
  const bumps = o.bumps || [[-30, 2, 10], [-18, -8, 14], [-2, -14, 17], [16, -9, 14], [30, 0, 10], [8, -22, 11], [-12, -20, 9]];
  const body = (dy, col) => [...bumps.map(([bx, by, br]) => circ(x + bx * s, y + by * s + dy, br * s, col)), ell(x, y + 6 * s + dy, 40 * s, 7 * s, col)].join('');
  const out = [body(3 * s, sh), body(0, c)];
  // 下のかげ（ふちの内側）
  out.push(ell(x + 2 * s, y + 7 * s, 34 * s, 4 * s, sh, { opacity: 0.55 }));
  if (o.warm) out.push(ell(x + 2 * s, y + 8 * s, 30 * s, 3 * s, o.warm, { opacity: 0.5 }));
  out.push(circ(x - 8 * s, y - 20 * s, 7 * s, hi, { opacity: 0.8 }), circ(x - 20 * s, y - 10 * s, 5 * s, hi, { opacity: 0.7 }), circ(x + 4 * s, y - 26 * s, 5 * s, hi, { opacity: 0.6 }));
  void r;
  return out.join('');
}
// 入道雲（高くもりあがる）
export function tower(x, y, s, o = {}) {
  const c = o.c || '#ffffff', sh = o.sh || '#cfe0ef';
  const bl = [[-40, 0, 16], [-22, -10, 20], [0, -14, 22], [22, -8, 19], [42, 2, 14], [-14, -34, 18], [10, -38, 20], [-2, -58, 17], [18, -60, 13], [-18, -54, 12], [4, -76, 13]];
  const body = (dy, col) => [...bl.map(([bx, by, br]) => circ(x + bx * s, y + by * s + dy, br * s, col)), ell(x, y + 10 * s + dy, 54 * s, 8 * s, col)].join('');
  return [body(4 * s, sh), body(0, c), ell(x, y + 10 * s, 46 * s, 5 * s, sh, { opacity: 0.5 }),
    ...[[-10, -60, 7], [-26, -38, 7], [-4, -84, 5], [-34, -12, 6]].map(([bx, by, br]) => circ(x + bx * s, y + by * s, br * s, '#ffffff', { opacity: 0.85 }))].join('');
}
// 須磨・舞子の松（黒松）：原点は幹の根もと。0.1ドット単位
// o: { h: 高さ, lean: てっぺんのずれ, spread: 横の広がり, pads: 枝の数, seed, dark, base, mid, light }
export function blackPine(o) {
  const r = rng(o.seed || 1);
  const H = o.h || 800, L = o.lean || 120, S = o.spread || 360;
  const C = { trunk: '#7b4a32', trunkL: '#a0694a', trunkD: '#57321f', dark: '#1e4d30', base: '#2f6e42', mid: '#3c8248', light: '#74b765', needle: '#8fcc78', ...o.col };
  const out = [];
  // 根もとのかげ
  out.push(ell(L * 0.1, 0, 120, 14, '#000000', { opacity: 0.12 }));
  // 幹（ゆるくくねる）
  const tx = t => L * Math.pow(t, 1.4) + Math.sin(t * 5 + (o.seed || 1)) * 22 * t;
  const pts = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([tx(t), -H * 0.72 * t, 34 * (1 - t) + 12]); }
  let dL = '', dR = '';
  pts.forEach(([x, y, w], i) => { dL += (i ? ' L' : 'M') + f(x - w) + ' ' + f(y); });
  for (let i = pts.length - 1; i >= 0; i--) { const [x, y, w] = pts[i]; dR += ' L' + f(x + w) + ' ' + f(y); }
  out.push(path(dL + dR + ' Z', C.trunk));
  out.push(path(pts.map(([x, y, w], i) => (i ? 'L' : 'M') + f(x - w + 6) + ' ' + f(y)).join(' '), 'none', st(C.trunkL, 10, { opacity: 0.8 })));
  out.push(path(pts.map(([x, y, w], i) => (i ? 'L' : 'M') + f(x + w - 7) + ' ' + f(y)).join(' '), 'none', st(C.trunkD, 9, { opacity: 0.7 })));
  // 松の皮（うろこ）
  for (let i = 1; i < 9; i++) { const [x, y, w] = pts[i]; out.push(path(`M${f(x - w * 0.5)} ${f(y + 6)} q${f(w * 0.5)} -8 ${f(w)} 0`, 'none', st(C.trunkD, 4, { opacity: 0.55 }))); }
  // 枝と葉のかたまり（横に平たい「雲」）
  const n = o.pads || 6, pads = [];
  for (let i = 0; i < n; i++) {
    const t = 0.42 + (i / (n - 1)) * 0.58;
    const side = i === n - 1 ? 0 : (i % 2 ? 1 : -1);
    const bx = tx(Math.min(1, t)), by = -H * 0.72 * Math.min(1, t);
    const hw = (i === n - 1 ? 130 : 170 - i * 8) * (o.padK || 1);
    const px = bx + side * (S * (0.62 - (i / n) * 0.3) + r() * 30), py = by - 20 - r() * 30 - (i === n - 1 ? 70 : 0);
    pads.push([bx, by, px, py, hw, hw * 0.52]);
  }
  for (const [bx, by, px, py] of pads) out.push(path(`M${f(bx)} ${f(by)} Q${f((bx + px) / 2)} ${f(by - 24)} ${f(px)} ${f(py + 16)}`, 'none', st(C.trunk, 18)), path(`M${f(bx)} ${f(by - 4)} Q${f((bx + px) / 2)} ${f(by - 28)} ${f(px)} ${f(py + 12)}`, 'none', st(C.trunkL, 5, { opacity: 0.6 })));
  for (const [, , px, py, hw, ph] of pads) {
    const top = [], low = [];
    const N = Math.round(hw / 26) + 3;
    for (let j = 0; j < N; j++) {
      const u = (j / (N - 1)) * 2 - 1 + (r() - 0.5) * 0.12;
      top.push([px + u * hw * 0.8, py - ph * 0.42 * Math.sqrt(Math.max(0, 1 - u * u * 0.85)) + r() * 8, ph * (0.46 + r() * 0.12) * (1 - 0.3 * Math.abs(u))]);
    }
    for (let j = 0; j < N - 1; j++) { const u = ((j + 0.5) / (N - 1)) * 2 - 1; low.push([px + u * hw * 0.86, py + ph * 0.12 + r() * 6, ph * (0.4 + r() * 0.1) * (1 - 0.25 * Math.abs(u))]); }
    const all = [...low, ...top];
    out.push(ell(px, py + ph * 0.34, hw * 0.98, ph * 0.3, C.dark));
    if (o.lite) {
      // 背景用（形の数を少なく）
      for (const [x, y, rr] of all) out.push(circ(x, y + 12, rr, C.dark));
      for (const [x, y, rr] of all) out.push(circ(x, y, rr * 0.95, C.base));
      for (const [x, y, rr] of top) out.push(circ(x - rr * 0.3, y - rr * 0.35, rr * 0.4, C.light, { opacity: 0.8 }));
      continue;
    }
    for (const [x, y, rr] of all) out.push(cloverBlob(x, y + 12, rr, C.dark));
    for (const [x, y, rr] of low) out.push(cloverBlob(x, y, rr * 0.95, C.base));
    for (const [x, y, rr] of top) out.push(cloverBlob(x, y, rr * 0.95, r() < 0.5 ? C.base : C.mid));
    for (const [x, y, rr] of top) out.push(cloverBlob(x - rr * 0.15, y - rr * 0.22, rr * 0.55, C.mid));
    for (const [x, y, rr] of top.filter((p, j) => p[0] <= px + hw * 0.3 && j % 2 === 0)) out.push(circ(x - rr * 0.38, y - rr * 0.42, rr * 0.26, C.light, { opacity: 0.9 }));
    // 針の葉（上のふち）
    for (const [x, y, rr] of top) for (const dx of [-0.4, 0, 0.4]) out.push(path(`M${f(x + dx * rr)} ${f(y - rr * 0.62)} l-4 -11 M${f(x + dx * rr)} ${f(y - rr * 0.62)} l4 -11`, 'none', st(C.needle, 2.6, { opacity: 0.75 })));
  }
  return out.join('');
}
// ヨット（右向き）: 原点は船の底。s は大きさ
export function yacht(x, y, s, sail = '#ffffff', stripe = '#2f86c6', jib = '#ffffff') {
  return [
    path(`M${x - 11 * s} ${y - 3 * s} L${x + 12 * s} ${y - 3 * s} L${x + 8 * s} ${y} L${x - 8 * s} ${y} Z`, '#ffffff'),
    rect(x - 10 * s, y - 2 * s, 20 * s, 0.9 * s, stripe),
    rect(x - 0.4 * s, y - 26 * s, 0.8 * s, 23 * s, '#8a8f99'),
    path(`M${x - 0.8 * s} ${y - 25 * s} L${x - 0.8 * s} ${y - 4.5 * s} L${x - 11 * s} ${y - 4.5 * s} Z`, sail),
    path(`M${x + 0.8 * s} ${y - 22 * s} L${x + 0.8 * s} ${y - 5 * s} L${x + 9 * s} ${y - 5 * s} Z`, jib),
    path(`M${x - 0.8 * s} ${y - 25 * s} L${x - 0.8 * s} ${y - 4.5 * s} L${x - 4 * s} ${y - 4.5 * s} Z`, '#000000', { opacity: 0.08 })
  ].join('');
}

// ========================================================================
// 背景
// ========================================================================
const HOR = 142; // 水平線

// 雲（入道雲と、もくもく）
bgLayer('suma', { f: 0.02, w: 1400, y: 0, h: 150 }, (defs, w) => {
  const r = rng(8101), out = [];
  // 水平線の上の入道雲（かすんだ）
  for (const [x, y, s] of [[260, 128, 0.9], [980, 126, 1.1], [1260, 132, 0.7]]) out.push(wrap(w, x - 60 * s, 120 * s, xx => tower(xx + 60 * s, y, s, { c: '#f4fafd', sh: '#d6e7f2' })));
  for (const [x, y, s] of [[120, 36, 0.9], [470, 58, 0.62], [700, 28, 1.05], [900, 70, 0.55], [1130, 40, 0.85], [1330, 88, 0.5]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s, { seed: x })));
  for (let i = 0; i < 5; i++) { const x = r() * w, y = 96 + r() * 16, s = 0.3 + r() * 0.14; out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s, { sh: '#e1edf6' }))); }
  return out.join('');
});

// 遠く：神戸の街・淡路島・明石海峡大橋・海
bgLayer('suma', { f: 0.035, w: 1600, y: 96, h: 144 }, (defs, w) => {
  const r = rng(8201), out = [];
  // 水平線のかすみ
  out.push(rect(0, 96, w, HOR - 96, defs.linU([[0, '#e4f5fb', 0], [1, '#eef9fc', 0.85]], 0, 96, 0, HOR)));
  // 六甲の山なみ（左・遠い）と神戸の街
  out.push(path(`M0 ${HOR} ` + Array.from({ length: 56 }, (_, i) => { const x = i * 4; const u = x / 220; return `L${x} ${f(HOR - 2 - Math.sin(u * Math.PI) * 14 - Math.sin(u * 13) * 1.5)}`; }).join(' ') + ` L220 ${HOR} Z`, '#bcd8e5'));
  for (let x = 8; x < 180;) { const bw = 2 + r() * 4, bh = 2 + r() * 6; out.push(rect(x, HOR - bh, bw, bh, r() < 0.5 ? '#d8e8f0' : '#c9dde8')); x += bw + r() * 2; }
  out.push(rect(96, HOR - 12, 1.2, 12, '#e3867a'), rect(95.2, HOR - 13, 2.8, 1.4, '#eeb6ae')); // ポートタワー
  // 淡路島（ながく、かすむ）
  const aw = (x0, x1, h, col, top, seed) => {
    const rr = rng(seed);
    let d = `M${x0} ${HOR}`;
    for (let x = x0; x <= x1; x += 6) { const u = (x - x0) / (x1 - x0); d += ` L${x} ${f(HOR - Math.pow(Math.sin(u * Math.PI), 0.6) * h - Math.sin(u * 23 + seed) * 2 - rr() * 1.2)}`; }
    return path(d + ` L${x1} ${HOR} Z`, col) + (top ? path(d.replace(`M${x0} ${HOR} L`, 'M'), 'none', st(top, 1, { opacity: 0.6 })) : '');
  };
  out.push(aw(200, 760, 26, '#a7c7da', '#cfe2ec', 3));
  out.push(aw(250, 560, 15, '#9dbfd2', null, 5));
  for (let i = 0; i < 26; i++) { const x = 230 + r() * 500; out.push(rect(x, HOR - 1.6 - r(), 1 + r() * 2, 1.2, '#e2edf2', { opacity: 0.8 })); }
  // 海
  out.push(rect(0, HOR, w, 240 - HOR, defs.linU([[0, '#8ed5ec'], [0.3, '#4fc0e2'], [1, '#27a2d6']], 0, HOR, 0, 240)));
  out.push(rect(0, HOR, w, 0.8, '#f4fbff', { opacity: 0.9 }));
  for (const [y, h, c, o] of [[147, 3, '#b5e6f4', 0.45], [156, 5, '#2aa6d6', 0.18], [168, 4, '#9fe2f2', 0.3], [184, 8, '#1c95cc', 0.14]]) out.push(rect(0, y, w, h, c, { opacity: o }));
  for (let i = 0; i < 90; i++) { const y = HOR + 2 + Math.pow(r(), 1.6) * 90; out.push(rrect(r() * w, y, 3 + r() * 6 * (1 + (y - HOR) / 40), 0.7, 0.35, '#ffffff', { opacity: 0.3 + r() * 0.35 })); }
  // 遠くのヨット
  for (const [x, y, s] of [[140, 150, 0.35], [300, 147, 0.28], [620, 152, 0.4], [860, 148, 0.3], [1380, 151, 0.34]]) out.push(yacht(x, y, s));
  return tr(0, -96, out.join(''));
});

// 鉢伏山と鉄拐山（須磨浦山上遊園・ロープウェイ・回転展望閣）
bgLayer('suma', { f: 0.06, w: 1300, y: 40, h: 200 }, (defs, w) => {
  const r = rng(8301), out = [];
  const DX = -150;
  // 山の形（ベジェ）
  const back = 'M560 184 C620 150 700 96 780 92 C840 88 880 74 920 72 C980 70 1040 110 1100 150 C1130 168 1160 180 1190 186 Z';
  const main = 'M420 188 C480 178 560 150 620 118 C660 96 690 86 712 86 C736 86 760 98 790 112 C850 138 900 162 960 176 C1000 184 1040 188 1060 190 Z';
  out.push(path(back, defs.linU([[0, '#8fc0a2'], [1, '#a9d2bb']], 0, 70, 0, 190)));
  // 鉄拐山の木のもこもこ（うすく）
  const clipB = defs.clip(`<path d="${back}"/>`);
  const bb = [];
  for (let i = 0; i < 140; i++) { const x = 560 + r() * 630, y = 70 + r() * 120; bb.push(circ(x, y, 3 + r() * 3, r() < 0.5 ? '#98c8a8' : '#86b998')); }
  out.push(g(bb.join(''), { 'clip-path': clipB }));
  out.push(path(main, defs.linU([[0, '#5fae68'], [0.6, '#4f9c5a'], [1, '#6cae76']], 0, 84, 0, 190)));
  const clip = defs.clip(`<path d="${main}"/>`);
  const bumps = [];
  for (let i = 0; i < 520; i++) {
    const x = 420 + r() * 640, y = 84 + Math.pow(r(), 0.8) * 106, rr = 2.4 + r() * 2.8;
    bumps.push(circ(x, y, rr, r() < 0.4 ? '#4a9651' : r() < 0.6 ? '#5aa85c' : '#68b566'));
    if (r() < 0.3) bumps.push(circ(x - rr * 0.35, y - rr * 0.4, rr * 0.45, '#92cc84', { opacity: 0.85 }));
  }
  for (let i = 0; i < 7; i++) { const x = 560 + i * 60 + r() * 20; bumps.push(path(`M${x} ${100 + i * 4} Q${x + 10} ${130 + i * 3} ${x + 2} ${176}`, 'none', st('#3c8448', 5, { opacity: 0.3 }))); }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  out.push(path('M420 188 C480 178 560 150 620 118 C660 96 690 86 712 86 C736 86 760 98 790 112 C850 138 900 162 960 176', 'none', st('#9fd98f', 1.2, { opacity: 0.55 })));
  // ロープウェイ（ふもとの駅 → 山の上の駅）
  const s0 = [560, 160], s1 = [704, 88];
  out.push(rrect(s0[0] - 8, s0[1] - 7, 16, 9, 1.5, '#f2efe6'), rect(s0[0] - 8, s0[1] - 7, 16, 2, '#c9574a'), rect(s0[0] - 6, s0[1] - 3, 12, 3, '#8fbad6'));
  out.push(rrect(s1[0] - 16, s1[1] - 4, 12, 7, 1.5, '#f2efe6'), rect(s1[0] - 16, s1[1] - 4, 12, 1.6, '#c9574a'));
  for (const dy of [0, 1.4]) out.push(path(`M${s0[0]} ${s0[1] - 6 + dy} Q${(s0[0] + s1[0]) / 2} ${(s0[1] + s1[1]) / 2 + 10 + dy} ${s1[0] - 10} ${s1[1] - 2 + dy}`, 'none', st('#4d5560', 0.45)));
  out.push(rect(620, 118, 1.2, 12, '#7d8591'), rect(618, 118, 5, 1, '#7d8591'));
  for (const [u, c] of [[0.3, '#fff3d6'], [0.72, '#d9f0e6']]) {
    const x = s0[0] + (s1[0] - 10 - s0[0]) * u, y = s0[1] - 6 + (s1[1] - 2 - s0[1] + 6) * u + 10 * 4 * u * (1 - u) * 0.5;
    out.push(rect(x - 0.3, y, 0.6, 2.5, '#4d5560'), rrect(x - 3, y + 2.4, 6, 4.6, 1.2, c), rect(x - 2.2, y + 3.4, 4.4, 1.6, '#7fb3d6'));
  }
  // 回転展望閣（山のてっぺんの丸い建物）
  out.push(rect(716, 80, 1.6, 8, '#e8e6de'), ell(717, 80, 9, 3.2, '#f6f4ee'), rect(708, 76, 18, 4, '#f6f4ee'), rect(708, 76.8, 18, 1.8, '#7fb3d6'), ell(717, 76, 9, 2.4, '#e2ded2'), ell(717, 74.5, 5, 2, '#f6f4ee'), rect(716.6, 70, 0.8, 4, '#b8b4aa'));
  // ふもと（須磨浦の町と松）
  out.push(path('M420 188 L1060 190 L1060 196 L420 196 Z', '#e9e1cf'));
  for (let x = 470; x < 1040;) { const bw = 4 + r() * 6, bh = 3 + r() * 5; out.push(rect(x, 188 - bh, bw, bh, ['#f4f0e6', '#e8e2d4', '#dce6ee'][Math.floor(r() * 3)]), rect(x - 0.5, 188 - bh - 1, bw + 1, 1.2, ['#b85a48', '#6b7686', '#4f7f6a'][Math.floor(r() * 3)])); x += bw + 2 + r() * 8; }
  for (let i = 0; i < 16; i++) { const x = 440 + r() * 600; out.push(clover(x, 185 - r() * 3, 3 + r() * 2, '#3f8a4c', '#7cc070')); }
  out.push(rect(0, 150, 1200, 50, defs.linU([[0, '#e4f4fa', 0], [1, '#e4f4fa', 0.55]], 0, 150, 0, 196)));
  return tr(DX, -40, out.join(''));
});

// 中ほど：ヨットハーバー（防波堤と白い灯台）・海のヨット
bgLayer('suma', { f: 0.12, w: 1400, y: 140, h: 100 }, (defs, w) => {
  const r = rng(8401), out = [];
  // 波のきらめき（中ほど）
  for (let i = 0; i < 70; i++) { const y = 150 + Math.pow(r(), 0.8) * 80; out.push(rrect(r() * w, y, 4 + r() * 10, 0.8, 0.4, '#ffffff', { opacity: 0.25 + r() * 0.25 })); }
  // ヨットハーバー（マスト）
  for (let x = 170; x < 330; x += 7 + r() * 5) { const h = 12 + r() * 10; out.push(rect(x, 176 - h, 0.6, h, '#dfe3e8'), rrect(x - 3, 175, 7, 2.2, 1, '#ffffff')); }
  // 防波堤とテトラポッド
  out.push(rect(136, 182, 308, 3, '#1f86b8', { opacity: 0.35 }), rect(140, 175, 300, 7, '#cfcac0'), rect(140, 175, 300, 1.4, '#f2efe8'), rect(140, 180.5, 300, 1.6, '#a8a398'));
  for (let x = 146; x < 436; x += 7) out.push(path(`M${x} 184 l3 -4 l3 4 Z`, '#bdb8ad'), circ(x + 3, 181, 1.2, '#d8d4cb'));
  // 白い灯台
  const lx = 420;
  out.push(path(`M${lx - 5} 177 L${lx - 3.6} 146 L${lx + 3.6} 146 L${lx + 5} 177 Z`, '#fbfbf8'), path(`M${lx + 1.6} 177 L${lx + 1.4} 146 L${lx + 3.6} 146 L${lx + 5} 177 Z`, '#dcdcd6'));
  out.push(rect(lx - 5.6, 144, 11.2, 2, '#e8e6e0'), rect(lx - 3, 136, 6, 8, '#fdf6d8'), rect(lx - 3, 136, 6, 8, 'none', { stroke: '#5b6270', strokeWidth: 0.6 }), path(`M${lx - 4} 136 L${lx} 131.5 L${lx + 4} 136 Z`, '#5b6270'), rect(lx - 0.3, 129, 0.6, 3, '#5b6270'));
  out.push(rrect(lx - 1.2, 166, 2.4, 5, 1, '#8bb8d6'), rect(lx - 1, 154, 2, 3, '#8bb8d6'));
  out.push(circ(lx, 140, 5, '#fff3b0', { opacity: 0.25 }));
  // 須磨海づり公園の長い桟橋
  out.push(rect(640, 171, 240, 3.4, '#ece6da'), rect(640, 171, 240, 1, '#ffffff'), rect(640, 174.4, 240, 1.2, '#b9b2a4'));
  for (let x = 644; x < 880; x += 9) out.push(rect(x, 175.6, 1.4, 10, '#c9c2b4'), rect(x - 1, 185, 3.4, 1, '#1f86b8', { opacity: 0.35 }));
  for (let x = 648; x < 880; x += 18) out.push(rect(x, 167.6, 0.6, 3.4, '#8a8f99'));
  out.push(rect(640, 168, 240, 0.5, '#8a8f99', { opacity: 0.8 }), rrect(860, 162, 14, 9, 1.5, '#f4f0e6'), rect(860, 161, 14, 2, '#3f7fbf'));
  // 海に浮かぶヨット
  for (const [x, y, s, sl, str, jb] of [[560, 186, 0.55, '#ffffff', '#e0584f', '#ffe0a0'], [720, 176, 0.42, '#ffffff', '#2f86c6', '#ffffff'], [880, 190, 0.6, '#ffe7b0', '#2f86c6', '#ffffff'], [1080, 180, 0.46, '#ffffff', '#1f9d8a', '#ffd0d8'], [1260, 188, 0.52, '#ffffff', '#e0584f', '#ffffff'], [60, 188, 0.5, '#ffffff', '#2f86c6', '#ffe0a0']]) {
    out.push(ell(x, y + 0.6, 11 * s * 1.1, 1.4 * s + 0.6, '#1f86b8', { opacity: 0.3 }), yacht(x, y, s, sl, str, jb));
  }
  return tr(0, -140, out.join(''));
});

// 近くの海（浅いターコイズ・やさしい波）
bgLayer('suma', { f: 0.3, w: 1200, y: 160, h: 80 }, (defs, w) => {
  const r = rng(8501), out = [];
  out.push(rect(0, 160, w, 80, defs.linU([[0, '#44bde0', 0], [0.25, '#46c4df', 0.9], [0.6, '#5ccfdc'], [1, '#7adcd8']], 0, 160, 0, 240)));
  // 波の白いすじ（とぎれとぎれ・うすく）
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = 176 + Math.pow(r(), 0.7) * 30, l = 14 + r() * 26;
    out.push(wrap(w, x, l, xx => path(`M${xx} ${y} q${l * 0.25} -2.2 ${l * 0.5} 0 t${l * 0.5} 0`, 'none', st('#ffffff', 1.1, { opacity: 0.35 + r() * 0.2 }))));
    if (r() < 0.6) out.push(wrap(w, x, l, xx => circ(xx + l * (0.2 + r() * 0.6), y + 2, 0.7, '#ffffff', { opacity: 0.5 })));
  }
  for (let i = 0; i < 40; i++) out.push(rrect(r() * w, 168 + r() * 70, 3 + r() * 8, 0.8, 0.4, '#e9fcff', { opacity: 0.35 }));
  // 泳ぐ人（うき輪）とビーチボール（小さく・やさしく）
  for (const [x, y, c] of [[90, 181, '#ff5a5f'], [230, 186, '#ffb703'], [420, 179, '#2ec4b6'], [610, 184, '#ff8fb3'], [800, 180, '#3a86ff'], [1010, 185, '#ffb703']]) {
    out.push(ell(x, y + 0.6, 4.6, 1.6, '#ffffff', { opacity: 0.35 }), ell(x, y, 3.8, 1.6, c), ell(x, y - 0.2, 1.8, 0.7, '#2c9fc4'), circ(x, y - 1.8, 1.5, '#5a3a2a'), circ(x - 0.4, y - 2.4, 0.9, ['#ffd84a', '#ffffff', '#ff8fb3'][Math.floor(x) % 3]));
  }
  for (const x of [330, 900]) out.push(circ(x, 182, 1.8, '#ffffff'), path(`M${x - 1.8} 182 A1.8 1.8 0 0 1 ${x} 180.2 L${x} 182 Z`, '#e8453c'), path(`M${x} 180.2 A1.8 1.8 0 0 1 ${x + 1.8} 182 L${x} 182 Z`, '#2f7fd0'));
  // 遊泳区域のブイ（黄色・とぎれとぎれ）
  for (const [x0, x1] of [[60, 250], [520, 680], [900, 1080]]) {
    out.push(path(`M${x0} 172.6 Q${(x0 + x1) / 2} 174 ${x1} 172.6`, 'none', st('#ffffff', 0.35, { opacity: 0.4 })));
    for (let x = x0; x <= x1; x += 19) out.push(circ(x, 172.6 + Math.sin((x - x0) / (x1 - x0) * Math.PI) * 1.2, 1, '#ffe07a', { opacity: 0.75 }));
  }
  return tr(0, -160, out.join(''));
});

// 手前：ぼかしたハマヒルガオの草むら（地面より下だけ）
bgLayer('suma', { f: 1.35, w: 1300, y: 212, h: 28, fg: true }, (defs, w) => {
  const r = rng(8601), blur = defs.blur(1.3), out = [];
  for (const cx of [110, 640, 1030]) {
    const parts = [];
    for (let k = 0; k < 11; k++) { const x = cx + (k - 5.5) * 9 + r() * 6, y = 244 - r() * 6 - Math.cos((k - 5.5) / 5.5 * 1.4) * 6, rr = 7 + r() * 6; parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#4f8a3c' : '#5c9a44', '#86bd62'))); }
    for (let k = 0; k < 5; k++) { const x = cx + (k - 2.5) * 13 + r() * 6, y = 230 + r() * 5; parts.push(wrap(w, x - 5, 10, xx => [0, 72, 144, 216, 288].map(a => circ(xx + Math.cos(a * Math.PI / 180) * 2.2, y + Math.sin(a * Math.PI / 180) * 2.2, 2, '#ffb3cf')).join('') + circ(xx, y, 1.2, '#fff4f8'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -212, out.join(''));
});

// ========================================================================
// 地面：白い砂浜（地層・貝がら・足あと）
// ========================================================================
{
  const SA = { base: '#e6c78e', dark: '#cfa86c', light: '#f2dcac', peb: ['#f7e8c6', '#c99d64', '#e9b4a8', '#d7b27a'] };
  const band = (y, amp, ph) => { let d = `M0 ${f(y + Math.sin(ph) * amp)}`; for (let x = 10; x <= 160; x += 10) d += ` L${x} ${f(y + Math.sin(x / 80 * Math.PI + ph) * amp)}`; return d; };
  const body = (v) => {
    const r = rng(8700 + v), out = [rect(0, 0, U, U, SA.base)];
    const strip = (y0, y1, amp, ph) => { let d = band(y0, amp, ph); for (let x = 160; x >= 0; x -= 10) d += ` L${x} ${f(y1 + Math.sin(x / 80 * Math.PI + ph) * amp)}`; return d + ' Z'; };
    out.push(path(strip(40, 56, 5, v), SA.dark, { opacity: 0.35 }));
    out.push(path(band(104, 6, v + 1) + ` L160 120 L0 120 Z`, SA.dark, { opacity: 0.25 }));
    out.push(path(band(76, 4, v + 2), 'none', st(SA.light, 5, { opacity: 0.6 })));
    for (let i = 0; i < 6; i++) {
      const x = 16 + r() * 128, y = 14 + r() * 132, rx = 3 + r() * 6, ry = rx * (0.5 + r() * 0.3), c = SA.peb[Math.floor(r() * 4)];
      out.push(ell(x, y + 1.6, rx, ry, shade(c, -0.2)), ell(x, y, rx, ry, c), ell(x - rx * 0.3, y - ry * 0.3, rx * 0.4, ry * 0.3, '#ffffff', { opacity: 0.5 }));
    }
    for (let i = 0; i < 10; i++) out.push(circ(8 + r() * 144, 8 + r() * 144, 1.2 + r() * 1.3, r() < 0.5 ? '#c49a62' : '#f6e4bc', { opacity: 0.8 }));
    // 小さな貝がらのかけら
    if (v === 1) out.push(path('M96 120 Q104 108 112 120 Z', '#f4c4bc'), path('M104 120 L100 112 M104 120 L104 110 M104 120 L108 112', 'none', st('#e09a90', 1.2)));
    return out.join('');
  };
  const capWave = (y, amp) => { let d = `M0 0 L160 0 L160 ${y}`; for (let x = 150; x >= 0; x -= 10) d += ` L${x} ${f(y + Math.sin(x / 40 * Math.PI) * amp)}`; return d + ' Z'; };
  const top = (v) => {
    const r = rng(8800 + v), out = [body(v + 3)];
    out.push(path(capWave(50, 3), '#000000', { opacity: 0.12 }));
    out.push(path(capWave(44, 3), '#d6b47c'));
    out.push(path(capWave(38, 3), '#f5e5bd'));
    out.push(rect(0, 0, U, 8, '#fffaec'), rect(0, 8, U, 4, '#fbefcf'));
    // 風のもよう（砂の波）
    out.push(path('M8 24 q14 -4 28 0 M60 30 q12 -3 24 0 M112 22 q14 -4 28 0', 'none', st('#ead6a6', 2.4, { opacity: 0.9 })));
    if (v === 0) {
      // 足あと
      for (const [x, y, a] of [[26, 22, -10], [52, 30, 10], [80, 20, -10], [108, 30, 10], [136, 21, -10]]) out.push(ell(x, y, 7, 3.6, '#e2c894', { rot: a }), ell(x + 1, y + 0.8, 5, 2.4, '#d8bb84', { rot: a }), circ(x + 8, y - 0.5, 1.6, '#e2c894'));
    } else if (v === 1) {
      // ピンクの貝がら
      out.push(path('M92 30 Q100 12 108 30 Z', '#f7c3c6'), ...[0, 1, 2, 3].map(k => path(`M100 30 L${94 + k * 4} 19`, 'none', st('#e89aa2', 1.3))), rect(96, 29, 8, 2.4, '#e89aa2'));
      out.push(ell(40, 26, 4, 2.4, '#ffffff', { opacity: 0.9 }), ell(40, 26.6, 2.4, 1.2, '#e8d8c8'));
    } else if (v === 2) {
      // ヒトデ
      out.push(tr(44, 24, poly([0, 72, 144, 216, 288].flatMap(a => [[Math.cos((a - 90) * Math.PI / 180) * 10, Math.sin((a - 90) * Math.PI / 180) * 7], [Math.cos((a - 54) * Math.PI / 180) * 4, Math.sin((a - 54) * Math.PI / 180) * 3]]), '#f4a37e')));
      out.push(circ(44, 24, 1.4, '#ffd0b0'));
      out.push(circ(120, 22, 2.6, '#ffffff', { opacity: 0.9 }), circ(126, 26, 1.8, '#f6e6d0'));
    } else {
      out.push(ell(118, 26, 6, 2.2, '#c9b28a', { opacity: 0.6 }), path('M60 18 l3 8 l3 -8', 'none', st('#8fae6a', 1.6)));
    }
    void r;
    return out.join('');
  };
  const cap = { h: 38, base: '#f5e5bd', dark: '#d6b47c', light: '#fffaec' };
  for (let v = 0; v < 3; v++) tile(`t/suma/g/body${v}`, () => body(v));
  for (let v = 0; v < 4; v++) tile(`t/suma/g/top${v}`, () => top(v));
  tile('t/suma/g/edgeL', defs => rect(0, 0, 22, U, defs.lin([[0, '#8a5a2a', 0.3], [1, '#8a5a2a', 0]], 0, 0, 1, 0)));
  tile('t/suma/g/edgeR', defs => rect(138, 0, 22, U, defs.lin([[0, '#8a5a2a', 0], [1, '#8a5a2a', 0.3]], 0, 0, 1, 0)));
  tile('t/suma/g/topL', () => [rect(0, 0, 8, 42, '#d6b47c'), rect(0, 0, 4, 36, '#efdcae')].join(''));
  tile('t/suma/g/topR', () => [rect(152, 0, 8, 42, '#d6b47c'), rect(156, 0, 4, 36, '#efdcae')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/suma/g/${k}`, defs => slopeTile(defs, k, body(k.length % 3), cap));

  // 海（ターコイズ・白い波がしら）
  for (let fr = 0; fr < 4; fr++) {
    const ph = fr * Math.PI / 2;
    const wy = x => 58 + Math.sin(x / 160 * TAU + ph) * 8;
    tile(`t/suma/waterT${fr}`, defs => {
      let d = `M0 160 L0 ${f(wy(0))}`;
      for (let x = 10; x <= 160; x += 10) d += ` L${x} ${f(wy(x))}`;
      const crest = d.replace('M0 160 L', 'M');
      const r = rng(8900 + fr), out = [path(d + ' L160 160 Z', defs.linU([[0, '#5ad3e2'], [0.45, '#35bcd9'], [1, '#249fcf']], 0, 50, 0, 160))];
      out.push(path(crest, 'none', st('#bdf3f5', 16)), path(crest, 'none', st('#ffffff', 7)));
      for (let i = 0; i < 7; i++) { const x = (i * 23 + fr * 9) % 160; out.push(circ(x, wy(x) + 10 + (i % 3) * 3, 2 + (i % 2), '#ffffff', { opacity: 0.8 })); }
      out.push(path(crest.replace(/L(\d+) ([\d.]+)/g, (m, x, y) => `L${x} ${f(+y + 30)}`).replace(/^M0 ([\d.]+)/, (m, y) => `M0 ${f(+y + 30)}`), 'none', st('#7fe0ea', 3, { opacity: 0.6, strokeDasharray: '18 22', strokeDashoffset: -fr * 10 })));
      for (let i = 0; i < 2; i++) out.push(rrect((i * 71 + fr * 20) % 140, 110 + i * 22, 20, 3.6, 1.8, '#e9fbff', { opacity: 0.4 + r() * 0.2 }));
      return out.join('');
    });
    tile(`t/suma/water${fr}`, defs => {
      const r = rng(8950 + fr), out = [rect(0, 0, U, U, defs.lin([[0, '#249fcf'], [1, '#1b86bd']]))];
      for (let i = 0; i < 3; i++) { const y = 30 + i * 46, x0 = (fr * 14 + i * 50) % 160; out.push(path(`M${x0 - 30} ${y} q15 -6 30 0 t30 0`, 'none', st('#5fd0e4', 3, { opacity: 0.45 }))); }
      out.push(rrect((fr * 37) % 130, 70, 22, 3.6, 1.8, '#e9fbff', { opacity: 0.35 + r() * 0.2 }));
      return out.join('');
    });
  }

  // 岩場（2マス×3マスの岩の柱）
  tile('t/suma/m/rock/hard', () => {
    const r = rng(8990), out = [rect(0, 0, U, U, '#95877a')];
    out.push(path('M0 0 L70 0 Q50 60 60 160 L0 160 Z', '#a89a8a'), path('M110 0 L160 0 L160 160 L124 160 Q130 80 110 0 Z', '#7f7266'));
    out.push(path('M20 20 Q40 12 60 30 Q46 56 22 50 Z', '#bfb2a1', { opacity: 0.8 }), path('M84 90 Q104 80 120 98 Q106 120 86 114 Z', '#b3a594', { opacity: 0.7 }));
    out.push(path('M70 0 Q50 60 60 160 M110 0 Q130 80 124 160', 'none', st('#6d6155', 3, { opacity: 0.6 })));
    for (let i = 0; i < 7; i++) { const x = 16 + r() * 128, y = 20 + r() * 124; out.push(circ(x, y, 4 + r() * 2, '#e9e1d2'), circ(x, y, 1.6, '#8f8273')); }
    out.push(path('M0 150 Q20 126 40 150 Q52 132 70 152 L70 160 L0 160 Z', '#3f7a52', { opacity: 0.6 }));
    return out.join('');
  });
  tile('t/suma/m/rock/hardT', () => [
    path('M-4 34 Q10 4 40 2 L120 2 Q150 4 164 34 L164 44 L-4 44 Z', '#8d7e6f'),
    path('M0 30 Q12 2 40 0 L120 0 Q148 2 160 30 Z', '#cdbfab'),
    rect(30, 0, 100, 5, '#eee4d4'),
    ell(116, 16, 12, 4, '#b7a893'), circ(52, 18, 4, '#f4ecde')
  ].join(''));
}

// ========================================================================
// 飾り（シート s8）
// ========================================================================
const GOLD = '#ffd84a';
// 氷の旗（文字「氷」はゲームで描く）
const iceFlag = (x, y) => [
  rect(x - 6, y - 10, 5, 330, '#8a8f99'), circ(x - 3.5, y - 12, 6, '#c9ced6'),
  path(`M${x} ${y} L${x + 100} ${y} L${x + 100} ${y + 170} L${x} ${y + 170} Z`, '#fdfcf6'),
  rect(x, y, 100, 18, '#2f7fd0'),
  path(`M${x} ${y + 130} q12 -14 25 0 t25 0 t25 0 t25 0 L${x + 100} ${y + 170} L${x} ${y + 170} Z`, '#2f7fd0'),
  path(`M${x} ${y + 146} q12 -12 25 0 t25 0 t25 0 t25 0`, 'none', st('#ffffff', 4)),
  path(`M${x + 70} ${y} L${x + 100} ${y} L${x + 100} ${y + 170} L${x + 80} ${y + 170} Z`, '#000000', { opacity: 0.05 })
].join('');
// かき氷（紙のカップ・丸い氷）
const kakigori = (x, y, c, s = 1) => tr(x, y, [
  path('M-20 0 L20 0 L14 30 L-14 30 Z', '#ffffff'), rect(-20, 6, 40, 6, '#2f7fd0'),
  circ(0, -8, 22, '#f4fbff'), path('M-22 -6 Q0 -34 22 -6 Q12 -2 0 -10 Q-12 -2 -22 -6 Z', c), circ(-8, -18, 5, '#ffffff', { opacity: 0.8 })
], s);
// うき輪（横向き）
const ring = (x, y, rx, c) => [ell(x, y + 3, rx, rx * 0.95, shade(c, -0.25)), ell(x, y, rx, rx * 0.95, c), ...[0.4, 1.97, 3.54, 5.11].map(a => ell(x + Math.cos(a) * rx * 0.72, y + Math.sin(a) * rx * 0.72, rx * 0.26, rx * 0.2, '#ffffff', { rot: a * 57.3 + 90 })), ell(x, y, rx * 0.42, rx * 0.4, '#6d5a44'), ell(x - rx * 0.4, y - rx * 0.5, rx * 0.25, rx * 0.12, '#ffffff', { opacity: 0.6, rot: -30 })].join('');
// ビーチボール
const ball = (x, y, rr) => [circ(x, y, rr, '#ffffff'), path(`M${x} ${y - rr} Q${x - rr * 0.8} ${y} ${x} ${y + rr} Q${x - rr * 1.2} ${y + rr * 0.4} ${x - rr} ${y} Q${x - rr * 1.1} ${y - rr * 0.6} ${x} ${y - rr} Z`, '#e8453c'), path(`M${x} ${y - rr} Q${x + rr * 0.8} ${y} ${x} ${y + rr} Q${x + rr * 0.3} ${y} ${x} ${y - rr} Z`, '#2f7fd0'), path(`M${x} ${y - rr} Q${x + rr * 0.9} ${y - rr * 0.3} ${x + rr} ${y + rr * 0.1} Q${x + rr * 0.9} ${y - rr * 0.1} ${x + rr * 0.7} ${y - rr * 0.6} Z`, GOLD), circ(x - rr * 0.3, y - rr * 0.4, rr * 0.25, '#ffffff', { opacity: 0.6 }), circ(x, y, rr, 'none', { stroke: '#000000', strokeWidth: 1.5, opacity: 0.15 })].join('');
// よしず（あしのすだれ）
const yoshizu = (x, y, w, h) => {
  const out = [rect(x, y, w, h, '#dcc48e')];
  for (let xx = x + 5; xx < x + w; xx += 10) out.push(rect(xx, y, 2.4, h, '#c7ab70', { opacity: 0.8 }));
  for (const yy of [y + h * 0.18, y + h * 0.62]) out.push(rect(x, yy, w, 5, '#9c7f4c'));
  out.push(rect(x, y, w, h, 'none', { stroke: '#8c6f3e', strokeWidth: 4 }));
  return out.join('');
};
// 木の柱
const post = (x, y0, y1, w = 34) => [rect(x, y0, w, y1 - y0, '#b98653'), rect(x + 4, y0, w * 0.25, y1 - y0, '#d8a874', { opacity: 0.8 }), rect(x + w - 8, y0, 8, y1 - y0, '#8f6236')].join('');
// 旗のひも（三角の小旗）
const bunting = (x0, x1, y, cols) => {
  const out = [path(`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 18} ${x1} ${y}`, 'none', st('#6d5a44', 2))];
  const n = Math.floor((x1 - x0) / 36);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = x0 + (x1 - x0) * u, yy = y + 18 * 4 * u * (1 - u) * 0.5; out.push(path(`M${x - 14} ${yy} L${x + 14} ${yy} L${x} ${yy + 26} Z`, cols[i % cols.length])); }
  return out.join('');
};

// ---------- 海の家（屋根の上に乗れる・幅128）: 看板の文字は (x+64, y-38) ----------
sprite(SH, 's8/umi0', 146, 70, 4, 69, defs => {
  const Gd = G(defs), r = rng(8111), out = [];
  const W = 1280;
  out.push(ell(W / 2, -2, 700, 20, '#000000', { opacity: 0.12 }));
  // 奥（店の中）
  out.push(inside(Gd, 20, -440, W - 40, 440, '#7a634a'));
  // 左：よしずと貸しうき輪・ビーチボール・ボディボード
  out.push(yoshizu(40, -420, 560, 380));
  out.push(rect(50, -392, 540, 8, '#6d5a44'));
  [['#ff5a5f', 110], ['#ffb703', 230], ['#2ec4b6', 350], ['#3a86ff', 470]].forEach(([c, x], i) => out.push(path(`M${x} -388 L${x} -372`, 'none', st('#6d5a44', 3)), ring(x, -330, 52 - (i % 2) * 6, c)));
  for (const [x, c] of [[80, '#ff8fb3'], [128, '#5fc8f0'], [176, '#ffd84a']]) out.push(rrect(x, -250, 42, 190, 18, c), rrect(x + 6, -240, 10, 170, 5, '#ffffff', { opacity: 0.35 }), rect(x, -120, 42, 8, '#ffffff', { opacity: 0.6 }));
  out.push(ball(290, -110, 34), ball(360, -92, 28), ball(318, -150, 24));
  // ベンチ（低い）
  out.push(rect(420, -80, 170, 14, '#a0703f'), rect(420, -80, 170, 4, '#c99a62'), rect(432, -66, 10, 66, '#7a5230'), rect(568, -66, 10, 66, '#7a5230'));
  // 右：カウンター（かき氷・シロップ・メニュー・氷の機械）
  out.push(rect(660, -410, 560, 150, '#f3ead6'), rect(660, -410, 560, 150, Gd.wallShade));
  out.push(rrect(690, -400, 250, 124, 8, '#fffdf6'), rect(690, -400, 250, 18, '#e8453c'));
  for (let i = 0; i < 4; i++) out.push(circ(712, -362 + i * 24, 5, ['#e8453c', '#2f7fd0', '#3fb35a', GOLD][i]), rect(724, -365 + i * 24, 120 + (i % 2) * 40, 6, '#8a7a66', { opacity: 0.6 }), rect(880, -365 + i * 24, 40, 6, '#e8453c', { opacity: 0.7 }));
  for (let i = 0; i < 5; i++) { const x = 970 + i * 44, c = ['#e8453c', '#2f7fd0', '#3fb35a', GOLD, '#ff8fb3'][i]; out.push(rrect(x, -372, 30, 92, 8, c, { opacity: 0.95 }), rect(x + 5, -390, 20, 22, '#f4f4f4'), rect(x + 6, -362, 6, 70, '#ffffff', { opacity: 0.4 })); }
  // 氷の機械
  out.push(rrect(700, -250, 110, 90, 12, '#e8453c'), rect(716, -236, 78, 40, '#ffffff'), circ(755, -270, 24, '#c9ced6'), rect(745, -300, 20, 30, '#9aa1ab'), circ(755, -306, 16, '#e8453c'));
  // カウンター
  out.push(rect(640, -170, 600, 170, '#2f86c6'), rect(640, -170, 600, 18, '#1f6ba6'), rect(630, -186, 620, 20, '#c99a62'), rect(630, -186, 620, 6, '#ecc899'));
  for (let x = 660; x < 1230; x += 70) out.push(path(`M${x} -100 q17 -16 35 0 t35 0`, 'none', st('#ffffff', 5, { opacity: 0.8 })));
  out.push(rect(640, -40, 600, 40, '#1f6ba6'));
  [[860, '#e8453c'], [930, '#2f7fd0'], [1000, '#3fb35a'], [1070, GOLD], [1140, '#ff8fb3']].forEach(([x, c]) => out.push(kakigori(x, -218, c, 1.05)));
  // クーラーボックス（ラムネ）
  out.push(rrect(460, -210, 120, 96, 10, '#4db3e6'), rect(460, -210, 120, 22, '#ffffff'), ...[0, 1, 2].map(k => rrect(478 + k * 30, -244, 16, 44, 6, '#8fe0d0', { opacity: 0.9 })));
  // 柱
  out.push(post(0, -440, 0), post(612, -440, 0), post(W - 34, -440, 0));
  // ひさし（青としろのしま）
  out.push(awning(Gd, 20, -306, W - 40, 56, '#2f8fd8', '#ffffff', 16));
  // 看板
  out.push(board(330, -434, 620, 104, '#fffaf0', '#2176b8'));
  // 小旗
  out.push(bunting(40, 300, -430, ['#e8453c', GOLD, '#3fb35a', '#2f7fd0']), bunting(980, 1240, -430, ['#2f7fd0', '#e8453c', GOLD, '#3fb35a']));
  // 屋根（平ら・乗れる）: 上のふちが明るい
  out.push(rect(20, -440, W - 40, 22, '#000000', { opacity: 0.22 }));
  out.push(rect(-30, -470, W + 60, 36, '#2a7fc4'), rect(-30, -446, W + 60, 12, '#1d5f96'));
  for (let x = -20; x < W + 30; x += 60) out.push(path(`M${x} -446 q15 -12 30 0`, 'none', st('#ffffff', 4, { opacity: 0.85 })));
  out.push(rect(-30, -484, W + 60, 16, '#fff3d6'), rect(-30, -484, W + 60, 5, '#ffffff'), rect(-30, -470, W + 60, 3, '#caa878'));
  // 氷の旗（屋根の右はし）
  out.push(iceFlag(W + 40, -660));
  void r;
  return tr(4, 69, out.join(''), 0.1);
});

// ---------- かき氷やさん（三角屋根・屋根に大きなかき氷）: 看板の文字は (x+55, y-44) ----------
sprite(SH, 's8/umi1', 127, 86, 10, 85, defs => {
  const Gd = G(defs), out = [];
  const W = 1100;
  out.push(ell(W / 2, -2, 620, 18, '#000000', { opacity: 0.12 }));
  out.push(inside(Gd, 20, -470, W - 40, 470, '#6f5a44'));
  out.push(yoshizu(40, -440, 300, 400));
  // シロップのたなとメニュー
  out.push(rect(380, -440, 680, 170, '#f7eedd'), rect(380, -440, 680, 170, Gd.wallShade));
  for (let i = 0; i < 6; i++) { const x = 410 + i * 44, c = ['#e8453c', '#2f7fd0', '#3fb35a', GOLD, '#ff8fb3', '#b58ae6'][i]; out.push(rrect(x, -400, 30, 92, 8, c), rect(x + 5, -418, 20, 22, '#f4f4f4'), rect(x + 6, -390, 6, 70, '#ffffff', { opacity: 0.4 })); }
  out.push(rrect(700, -430, 330, 140, 8, '#fffdf6'), rect(700, -430, 330, 20, '#2f7fd0'));
  for (let i = 0; i < 4; i++) out.push(circ(724, -392 + i * 26, 6, ['#e8453c', '#2f7fd0', '#3fb35a', GOLD][i]), rect(740, -395 + i * 26, 170, 6, '#8a7a66', { opacity: 0.55 }), rect(960, -395 + i * 26, 50, 6, '#e8453c', { opacity: 0.7 }));
  // カウンターとかき氷
  out.push(rect(360, -180, 720, 180, '#e8584f'), rect(360, -180, 720, 18, '#c0413a'), rect(350, -196, 740, 20, '#c99a62'), rect(350, -196, 740, 6, '#ecc899'));
  for (let x = 380; x < 1070; x += 80) out.push(rrect(x, -140, 60, 100, 8, '#ffffff', { opacity: 0.2 }));
  out.push(rect(360, -40, 720, 40, '#b8352f'));
  [[420, '#e8453c'], [500, '#2f7fd0'], [580, '#3fb35a'], [660, GOLD], [740, '#ff8fb3'], [820, '#b58ae6']].forEach(([x, c]) => out.push(kakigori(x, -228, c, 1.05)));
  out.push(rrect(880, -290, 120, 94, 12, '#2f7fd0'), rect(896, -276, 88, 40, '#ffffff'), circ(940, -312, 24, '#c9ced6'), rect(930, -340, 20, 30, '#9aa1ab'), circ(940, -346, 16, '#2f7fd0'));
  // 左：うき輪とビーチボールのかご
  out.push(ring(120, -330, 56, '#ff5a5f'), ring(240, -300, 50, '#2ec4b6'));
  out.push(path('M60 -160 L300 -160 L280 0 L80 0 Z', '#c8914a'), ...[0, 1, 2].map(k => rect(70 + k * 4, -120 + k * 40, 220 - k * 8, 6, '#a06f34')));
  out.push(ball(120, -190, 40), ball(200, -200, 44), ball(260, -186, 34));
  // 柱
  out.push(post(0, -470, 0), post(340, -470, 0), post(W - 34, -470, 0));
  // ひさし（赤としろ）
  out.push(awning(Gd, 20, -330, W - 40, 60, '#e8453c', '#ffffff', 14));
  // 看板
  out.push(board(180, -470, 740, 100, '#fffaf0', '#e0584f'));
  // 風鈴
  for (const x of [80, 1020]) out.push(path(`M${x} -470 L${x} -430`, 'none', st('#6d5a44', 2)), path(`M${x - 16} -400 Q${x - 16} -430 ${x} -430 Q${x + 16} -430 ${x + 16} -400 Z`, '#dff4fb', { opacity: 0.9 }), path(`M${x - 10} -414 q5 -6 10 0 t10 0`, 'none', st('#e8453c', 2.4)), rect(x - 1, -400, 2, 16, '#6d5a44'), rect(x - 8, -384, 16, 34, '#ffffff'), rect(x - 8, -384, 16, 8, '#2f7fd0'));
  // 三角屋根（トタン・水色）
  out.push(rect(20, -482, W - 40, 20, '#000000', { opacity: 0.2 }));
  out.push(path(`M-50 -478 L${W / 2} -640 L${W + 50} -478 Z`, '#35b3c4'));
  for (let x = -20; x < W + 40; x += 40) { const t = Math.abs(x - W / 2) / (W / 2 + 50); out.push(path(`M${x} -478 L${W / 2 + (x - W / 2) * 0.1} ${-640 + 8}`, 'none', st('#6fd0dc', 4, { opacity: 0.6 * (1 - t * 0.4) }))); }
  out.push(path(`M-50 -478 L${W / 2} -640 L${W / 2} -624 L-30 -478 Z`, '#8fe2ea', { opacity: 0.7 }));
  out.push(rect(-56, -484, W + 112, 14, '#1f8795'), rect(-56, -484, W + 112, 4, '#bff0f4'));
  // 屋根の上の大きなかき氷
  out.push(tr(W / 2, -650, [
    path('M-70 0 L70 0 L50 110 L-50 110 Z', '#ffffff'), rect(-70, 20, 140, 16, '#2f7fd0'), path('M-40 60 q10 -10 20 0 t20 0 t20 0 t20 0', 'none', st('#2f7fd0', 4)),
    circ(0, -20, 74, '#f4fbff'), path('M-76 -16 Q0 -120 76 -16 Q40 0 0 -26 Q-40 0 -76 -16 Z', '#e8453c'), circ(-30, -60, 16, '#ffffff', { opacity: 0.85 }),
    path('M0 -94 Q14 -120 36 -112', 'none', st('#3fb35a', 6)), circ(4, -96, 12, '#d8303a')
  ], 0.7));
  out.push(iceFlag(-90, -560));
  return tr(10, 85, out.join(''), 0.1);
});

// ---------- ビーチパラソル（4色・上に乗れる）: 原点は乗れる面の左はし ----------
const PARA = [['#ff5a5f', '#ffffff'], ['#2ec4b6', '#ffffff'], ['#ffb703', '#ffffff'], ['#3a86ff', '#fff3a8']];
PARA.forEach(([a, b], i) => sprite(SH, `s8/para${i}`, 50, 20, 9, 4, () => {
  const out = [];
  const ink = '#2e2644';
  const edge = 'M-72 90 Q-52 8 40 -3 L280 -3 Q372 8 392 90 Z';
  out.push(path('M-60 92 Q160 70 380 92 L380 108 Q160 86 -60 108 Z', '#000000', { opacity: 0.14 }));
  out.push(path(edge, ink, { stroke: ink, strokeWidth: 10, strokeLinejoin: 'round' }));
  const segs = 6, gores = [];
  for (let k = 0; k < segs; k++) {
    const x0 = -66 + k * (452 / segs), x1 = x0 + 452 / segs;
    const t0 = 40 + (k / segs) * 240, t1 = 40 + ((k + 1) / segs) * 240;
    gores.push(path(`M${t0} 0 L${t1} 0 Q${(t1 + x1) / 2 + (k < 3 ? -6 : 6)} 40 ${x1} 86 L${x0} 86 Q${(t0 + x0) / 2 + (k < 3 ? -6 : 6)} 40 ${t0} 0 Z`, k % 2 ? b : a));
  }
  out.push(...gores);
  // 右がわのかげ・左の光
  out.push(path('M200 0 L280 0 Q372 8 388 86 L300 86 Z', '#000000', { opacity: 0.1 }));
  out.push(path('M-50 80 Q-34 14 40 6 L80 6 Q0 30 -20 82 Z', '#ffffff', { opacity: 0.35 }));
  // ふちのひだ
  for (let k = 0; k < 6; k++) { const x0 = -66 + k * 75.3; out.push(path(`M${x0} 84 Q${x0 + 37} 108 ${x0 + 75.3} 84 Z`, k % 2 ? shade(b, -0.1) : shade(a, -0.14)), path(`M${x0} 84 Q${x0 + 37} 108 ${x0 + 75.3} 84`, 'none', st(ink, 3, { opacity: 0.5 }))); }
  // 乗れる面（上）を明るく
  out.push(rect(40, -2, 240, 6, '#ffffff', { opacity: 0.75 }));
  out.push(rrect(148, -10, 24, 12, 5, '#f7f7f2'), rrect(148, -10, 24, 12, 5, 'none', { stroke: ink, strokeWidth: 2.4 }));
  return tr(9, 4, out.join(''), 0.1);
}));

// ---------- 須磨の松 ----------
sprite(SH, 's8/pine', 116, 94, 56, 93, () => tr(56, 93, blackPine({ h: 820, lean: 140, spread: 330, pads: 6, seed: 3 }), 0.1));
sprite(SH, 's8/pine1', 110, 82, 60, 81, () => tr(60, 81, blackPine({ h: 700, lean: -120, spread: 280, pads: 5, seed: 7, padK: 0.9 }), 0.1));

// ---------- 監視台（ライフセーバーのいす） ----------
sprite(SH, 's8/life', 34, 64, 17, 63, () => {
  const out = [ell(0, -2, 140, 12, '#000000', { opacity: 0.1 })];
  const leg = (x0, x1) => path(`M${x0 - 7} 0 L${x1 - 6} -380 L${x1 + 6} -380 L${x0 + 7} 0 Z`, '#f6f4ee');
  out.push(leg(-110, -60), leg(110, 60), leg(-40, -30), leg(40, 30));
  for (let k = 1; k < 5; k++) { const y = -k * 76, w = 110 - k * 11; out.push(rect(-w, y - 4, w * 2, 8, '#e2ddd2')); }
  out.push(path('M-96 -60 L90 -300 M96 -60 L-90 -300', 'none', st('#dcd6ca', 6)));
  // いす
  out.push(rect(-74, -392, 148, 18, '#e84a3f'), rect(-74, -392, 148, 5, '#ff8a7a'), rect(-74, -470, 14, 90, '#f6f4ee'), rect(60, -470, 14, 90, '#f6f4ee'), rect(-64, -460, 128, 50, '#e84a3f'), rect(-64, -448, 128, 10, '#ffffff'));
  // 日よけのかさ
  out.push(rect(-3, -600, 6, 150, '#9aa1ab'));
  out.push(path('M-150 -540 Q0 -640 150 -540 Z', '#f4c430'), path('M-150 -540 Q-60 -610 0 -618 L0 -540 Z', '#e84a3f'), path('M-150 -540 Q0 -610 150 -540', 'none', st('#ffffff', 3, { opacity: 0.5 })));
  // 旗（赤と黄）
  out.push(rect(95, -560, 4, 180, '#9aa1ab'), path('M99 -560 L170 -560 L170 -514 L99 -514 Z', '#e84a3f'), path('M99 -537 L170 -537 L170 -514 L99 -514 Z', '#f4c430'));
  out.push(rect(-40, -120, 80, 60, '#ffffff'), path('M-26 -100 L26 -100 M0 -114 L0 -72', 'none', st('#e84a3f', 12)));
  return tr(17, 63, out.join(''), 0.1);
});

// ---------- ビーチチェアのセット ----------
sprite(SH, 's8/chair', 50, 30, 4, 29, () => {
  const out = [ell(240, -2, 240, 14, '#000000', { opacity: 0.1 })];
  // デッキチェア（白いわくに しまのぬの）
  out.push(path('M20 0 L60 -90 M200 0 L150 -90 M300 0 L330 -60', 'none', st('#f6f4ee', 10)));
  out.push(path('M30 -96 L260 -96 L350 -200 L330 -214 L250 -110 L30 -110 Z', '#ffffff'));
  const cloth = 'M36 -104 L256 -104 L338 -198 L326 -206 L248 -116 L36 -116 Z';
  out.push(path(cloth, '#3a86ff'));
  for (let k = 0; k < 5; k++) out.push(rect(50 + k * 44, -114, 20, 10, '#ffffff'));
  out.push(path('M266 -118 L278 -132 L336 -198 L324 -186 Z', '#ffffff', { opacity: 0.8 }));
  // タオル
  out.push(path('M90 -112 L180 -112 L176 -74 L94 -76 Z', '#ff8fb3'), rect(92, -100, 86, 6, '#ffffff', { opacity: 0.6 }));
  // クーラーボックス
  out.push(rrect(360, -100, 120, 100, 12, '#2fb3a8'), rrect(356, -114, 128, 30, 10, '#ffffff'), rect(372, -60, 96, 8, '#ffffff', { opacity: 0.5 }), rect(400, -126, 40, 14, '#9aa1ab'));
  // サングラスと麦わらぼうし
  out.push(ell(420, -134, 60, 12, '#f3d98a'), ell(420, -150, 34, 22, '#f3d98a'), rect(386, -146, 68, 8, '#e84a3f'));
  return tr(4, 29, out.join(''), 0.1);
});

// ---------- 砂のお城とおもちゃ ----------
sprite(SH, 's8/castle', 44, 38, 4, 37, () => {
  const out = [ell(200, -4, 230, 18, '#c9a46a', { opacity: 0.5 })];
  const sand = '#e6c485', sandD = '#cfa564', sandL = '#f4dca8';
  out.push(path('M-10 0 L10 -120 L330 -120 L350 0 Z', sand), rect(10, -120, 320, 16, sandL), path('M300 -120 L330 -120 L350 0 L316 0 Z', sandD, { opacity: 0.6 }));
  for (const [x, y, w] of [[30, -220, 80], [230, -220, 80], [120, -300, 100]]) {
    out.push(rect(x, y, w, -120 - y + 4, sand), rect(x + w - 16, y, 16, -120 - y + 4, sandD), rect(x, y, w, 10, sandL));
    for (let k = 0; k < 3; k++) out.push(rect(x + k * (w / 3) + 3, y - 18, w / 3 - 10, 20, sand));
    out.push(rrect(x + w / 2 - 10, y + 30, 20, 30, 10, '#a98450'));
  }
  out.push(rrect(140, -80, 60, 80, 30, '#a98450'));
  out.push(rect(168, -400, 5, 110, '#7a5230'), path('M173 -400 L236 -380 L173 -360 Z', '#e8453c'));
  for (const [x, y] of [[50, -40], [270, -70], [110, -150], [60, -260]]) out.push(circ(x, y, 7, '#ffffff', { opacity: 0.9 }), circ(x + 1, y + 1, 3, '#f4c4bc'));
  // バケツとスコップ
  out.push(path('M360 -110 L430 -110 L420 0 L370 0 Z', '#e8453c'), rect(356, -118, 78, 12, '#ff8a7a'), path('M360 -110 Q395 -170 430 -110', 'none', st('#8a8f99', 4)));
  out.push(path('M300 -30 L380 -180', 'none', st('#2f7fd0', 8)), path('M372 -176 L396 -216 L404 -178 Z', '#3a86ff'));
  return tr(4, 37, out.join(''), 0.1);
});
sprite(SH, 's8/toys', 44, 18, 2, 17, () => {
  const out = [ell(200, -3, 220, 14, '#000000', { opacity: 0.1 })];
  out.push(ball(60, -60, 60));
  out.push(ell(230, -26, 110, 34, shade('#ffb703', -0.25)), ell(230, -32, 110, 32, '#ffb703'), ell(230, -34, 50, 13, '#7a634a'), ...[0.4, 2.2, 3.6, 5.4].map(a => ell(230 + Math.cos(a) * 80, -32 + Math.sin(a) * 22, 16, 10, '#ffffff')));
  out.push(path('M360 -80 L410 -80 L402 0 L368 0 Z', '#3fb35a'), rect(356, -86, 58, 10, '#7fd08a'));
  return tr(2, 17, out.join(''), 0.1);
});

// ---------- 須磨海浜水族園（シャチのモニュメント）: 名前は (x+86, y-70) ----------
sprite(SH, 's8/aqua', 212, 104, 20, 103, defs => {
  const Gd = G(defs), out = [];
  const W = 1700;
  out.push(ell(W / 2, -4, 900, 24, '#000000', { opacity: 0.1 }));
  // 建物（白・青い波の屋根）
  out.push(rect(120, -640, 1440, 640, '#f4f6f8'), rect(120, -640, 1440, 640, Gd.wallShade), rect(1480, -640, 80, 640, '#dfe5ea'));
  out.push(path('M80 -630 Q400 -720 760 -760 Q1100 -800 1600 -660 L1600 -620 Q1100 -760 760 -720 Q400 -680 80 -600 Z', '#2a86c8'));
  out.push(path('M80 -630 Q400 -720 760 -760 Q1100 -800 1600 -660', 'none', st('#bfe6fb', 10)));
  out.push(path('M120 -606 Q420 -676 760 -712 Q1100 -750 1560 -630 L1560 -600 L120 -580 Z', '#f4f6f8'));
  // 大きなガラス（中に魚）
  const gx = 560, gy = -560, gw = 900, gh = 380;
  out.push(rect(gx - 14, gy - 14, gw + 28, gh + 28, '#d6dde3'));
  out.push(rect(gx, gy, gw, gh, defs.lin([[0, '#5fc3e8'], [0.6, '#2f8fcf'], [1, '#1f6fb0']])));
  for (const [x, y, s, c] of [[680, -470, 1, '#ffd84a'], [820, -380, 0.8, '#ff9a6a'], [1000, -450, 1.2, '#dff4ff'], [1200, -350, 0.9, '#ffd84a'], [1320, -480, 0.7, '#ff9a6a']]) out.push(tr(x, y, [ell(0, 0, 30, 14, c), path('M26 0 L46 -14 L46 14 Z', c), circ(-14, -3, 3, '#1b2a3a')], s));
  out.push(tr(1060, -300, [ell(0, 0, 110, 30, '#3a5f84'), path('M100 0 L150 -30 L146 30 Z', '#3a5f84'), ...[0, 1, 2, 3, 4].map(k => circ(-60 + k * 30, -6 + (k % 2) * 8, 5, '#dff4ff'))], 1));
  for (let k = 1; k < 5; k++) out.push(rect(gx + k * gw / 5 - 5, gy, 10, gh, '#e8eef2'));
  out.push(rect(gx, gy + gh * 0.5 - 4, gw, 8, '#e8eef2'));
  out.push(path(`M${gx + 30} ${gy} L${gx + 150} ${gy} L${gx + 30} ${gy + 220} Z`, '#ffffff', { opacity: 0.3 }), path(`M${gx + 420} ${gy} L${gx + 470} ${gy} L${gx + 330} ${gy + gh} L${gx + 280} ${gy + gh} Z`, '#ffffff', { opacity: 0.14 }));
  // 入口
  out.push(rect(700, -170, 380, 170, '#d6dde3'), rect(720, -150, 160, 150, Gd.glass), rect(900, -150, 160, 150, Gd.glass), rect(876, -150, 28, 150, '#d6dde3'));
  out.push(path('M660 -190 L1120 -190 L1100 -160 L680 -160 Z', '#2a86c8'), rect(660, -196, 460, 8, '#bfe6fb'));
  // 名前の看板
  out.push(rrect(560, -760 + 60, 740, 120, 18, '#000000', { opacity: 0.1 }), rrect(550, -770 + 60, 740, 120, 18, '#ffffff'), rrect(550, -770 + 60, 740, 120, 18, 'none', { stroke: '#2a86c8', strokeWidth: 10 }));
  // シャチのモニュメント（波からジャンプ）
  out.push(tr(300, -560, [
    path('M-260 480 Q-200 380 -120 440 Q-60 330 20 420 Q80 340 160 430 Q220 380 260 480 Z', '#6fd0ec'),
    path('M-200 470 Q-150 410 -100 450 M-20 440 Q30 380 90 440', 'none', st('#ffffff', 10)),
    // シャチ（上向きにジャンプ）
    tr(0, 80, [
      path('M-120 300 Q-180 80 -40 -180 Q20 -280 90 -300 Q150 -250 150 -150 Q130 60 20 300 Z', '#1b1f2a'),
      path('M-40 -120 Q-150 -170 -200 -90 Q-120 -110 -60 -70 Z', '#1b1f2a'),
      path('M60 40 Q190 40 250 140 Q160 110 80 110 Z', '#1b1f2a'),
      path('M-100 280 Q-60 60 40 -150 Q80 -80 60 60 Q20 200 -30 290 Z', '#ffffff'),
      ell(80, -230, 26, 50, '#ffffff', { rot: 20 }),
      path('M-60 300 L-150 420 L-40 380 L0 440 L10 300 Z', '#1b1f2a'),
      circ(64, -260, 9, '#ffffff'), circ(66, -260, 5, '#1b1f2a'),
      path('M100 -290 Q130 -250 110 -210', 'none', st('#3a4054', 6)),
      path('M-30 -150 Q-80 0 -90 200', 'none', st('#4a5068', 10, { opacity: 0.5 }))
    ], 0.9, 18),
    ...[[-160, 330], [180, 320], [-220, 400], [230, 390]].map(([x, y]) => circ(x, y, 14, '#ffffff'))
  ]));
  // ヤシの木
  const palm = (x, h) => {
    const o = [path(`M${x - 14} 0 Q${x - 30} ${-h / 2} ${x} ${-h} L${x + 16} ${-h} Q${x - 6} ${-h / 2} ${x + 14} 0 Z`, '#9a7a52')];
    for (let k = 0; k < 7; k++) o.push(path(`M${x - 10} ${-h + 20 + k * (h / 8)} l24 -8`, 'none', st('#7a5a3a', 4)));
    for (const a of [-160, -120, -60, -20, 20, 70, 150]) { const rad = a * Math.PI / 180; o.push(path(`M${x + 4} ${-h} Q${x + 4 + Math.cos(rad) * 140} ${-h - 60 + Math.sin(rad) * 40} ${x + 4 + Math.cos(rad) * 230} ${-h + 40 + Math.abs(Math.sin(rad)) * 20}`, 'none', st(a % 40 ? '#3f9a4a' : '#56b35a', 26))); }
    o.push(circ(x + 4, -h + 10, 14, '#7a5a3a'));
    return o.join('');
  };
  out.push(palm(1610, 700), palm(60, 520));
  // 花だん
  out.push(rect(0, -40, W, 40, '#d8d2c4'), rect(0, -40, W, 8, '#ece8df'));
  for (let x = 20; x < W; x += 60) if (x < 690 || x > 1090) out.push(cloverBlob(x, -54, 32, '#3f8a4a', '#7cc070'), circ(x + 8, -64, 7, ['#ff8fb3', GOLD, '#ffffff'][Math.floor(x / 60) % 3]));
  return tr(20, 103, out.join(''), 0.1);
});

// ---------- シャチ（乗れる足場・右向き・まん中が基準）----------
sprite(SH, 's8/orca', 86, 38, 43, 16, () => {
  const ink = '#1c1830';
  const body = 'M-330 40 Q-300 -40 -140 -74 Q40 -104 200 -80 Q330 -58 380 10 Q390 60 330 90 Q200 128 20 120 Q-180 112 -300 80 Z';
  const tail = 'M-300 46 L-400 -40 Q-410 -10 -380 30 Q-420 80 -410 120 L-300 70 Z';
  const out = [];
  // ふちどり（足場なので くっきり）
  for (const d of [body, tail]) out.push(path(d, ink, { stroke: ink, strokeWidth: 14, strokeLinejoin: 'round' }));
  out.push(path('M-60 -86 L-20 -200 Q0 -206 20 -196 L60 -90 Z', ink, { stroke: ink, strokeWidth: 14, strokeLinejoin: 'round' }));
  out.push(path('M60 90 Q120 150 60 190 Q20 150 10 100 Z', ink, { stroke: ink, strokeWidth: 14, strokeLinejoin: 'round' }));
  // 体
  out.push(path(tail, '#242a3a'), path(body, '#242a3a'));
  out.push(path('M-60 -86 L-20 -198 Q0 -204 18 -194 L60 -90 Z', '#242a3a'));
  out.push(path('M60 90 Q116 146 62 184 Q24 148 16 100 Z', '#1a1f2c'));
  // 白いおなか・目のうしろの白い模様・サドルパッチ（灰色）
  out.push(path('M-250 76 Q-120 60 0 76 Q140 90 250 70 Q320 56 360 40 Q350 90 300 100 Q180 124 20 118 Q-150 110 -250 76 Z', '#ffffff'));
  out.push(ell(210, -26, 58, 22, '#ffffff', { rot: -8 }));
  out.push(path('M-150 -60 Q-60 -40 40 -66 Q-40 -90 -150 -60 Z', '#8e98ab', { opacity: 0.9 }));
  // せなかのつや（上のふちが明るい）
  out.push(path('M-260 -20 Q-120 -74 60 -86 Q200 -80 300 -40', 'none', st('#5d6884', 12, { opacity: 0.8 })));
  out.push(circ(300, -10, 12, '#ffffff'), circ(304, -10, 7, ink), circ(301, -13, 2.4, '#ffffff'));
  out.push(path('M330 40 Q350 50 372 34', 'none', st('#0f0c1e', 5)));
  out.push(ell(310, 30, 20, 9, '#ff9ab0', { opacity: 0.5 }));
  return tr(43, 16, out.join(''), 0.1);
});

// ---------- ヨット（背景を動く） ----------
[['#ffffff', '#e0584f', '#ffe0a0'], ['#ffffff', '#2f86c6', '#ffffff'], ['#fff1c9', '#1f9d8a', '#ffd0d8']].forEach(([s, c, j], i) => sprite(SH, `s8/yacht${i}`, 26, 30, 13, 29, () => tr(13, 29, [
  ell(0, 4, 130, 14, '#1f86b8', { opacity: 0.3 }),
  yacht(0, 0, 10, s, c, j)
], 0.1)));
