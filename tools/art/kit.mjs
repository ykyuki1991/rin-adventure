// 絵を描くための共通の部品（窓・ひさし・看板・れんが・瓦屋根・ちょうちん・葉っぱ・木など）
// ステージ1（yakumo2.mjs）で作ったものを、ほかのステージでも同じ質で使えるようにまとめたもの
// 座標は各スプライトの中の単位（多くは 0.1ドット単位）で、呼ぶ側が tr(..., 0.1) で縮める
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix } from './svg.mjs';

export const st = (c, w, o = {}) => ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', ...o });
export const TAU = Math.PI * 2;

// スプライトごとに使い回すグラデーション
export function G(defs) {
  return {
    glass: defs.lin([[0, '#d4edf8'], [0.55, '#a9d3ea'], [1, '#8cc0de']]),
    warm: defs.lin([[0, '#ffe7b8'], [1, '#f6c98a']]),
    inShade: defs.lin([[0, '#000000', 0.42], [0.45, '#000000', 0.12], [1, '#000000', 0]]),
    under: defs.lin([[0, '#000000', 0.26], [1, '#000000', 0]]),
    awnShade: defs.lin([[0, '#ffffff', 0.22], [0.45, '#ffffff', 0], [1, '#000000', 0.16]]),
    wallShade: defs.lin([[0, '#000000', 0.1], [0.25, '#000000', 0], [1, '#000000', 0.06]]),
    globe: defs.rad([[0, '#ffffff'], [0.6, '#fff6e2'], [1, '#ead9b4']], 0.4, 0.35, 0.65),
    steel: defs.lin([[0, '#e2d6bd'], [0.4, '#fbf6ec'], [1, '#cbbd9f']], 0, 0, 1, 0),
    iron: defs.lin([[0, '#2c2c31'], [0.45, '#55555e'], [1, '#232327']], 0, 0, 1, 0)
  };
}

// ---------- 部品 ----------
// 窓（わく・ガラス・うつりこみ・カーテン）
export function win(G, x, y, w, h, o = {}) {
  const fr = o.frame || '#ffffff', fw = o.fw ?? 12;
  const out = [rect(x - fw, y - fw, w + fw * 2, h + fw * 2, fr), rect(x, y, w, h, o.glass || G.glass)];
  if (o.light) out.push(rect(x, y, w, h, G.warm, { opacity: 0.85 }));
  if (o.curtain) {
    const c = o.curtain;
    out.push(path(`M${x} ${y} L${x + w * 0.26} ${y} Q${x + w * 0.12} ${y + h * 0.55} ${x + w * 0.2} ${y + h} L${x} ${y + h} Z`, c));
    out.push(path(`M${x + w} ${y} L${x + w * 0.74} ${y} Q${x + w * 0.88} ${y + h * 0.55} ${x + w * 0.8} ${y + h} L${x + w} ${y + h} Z`, c));
    out.push(rect(x, y, w, h * 0.1, shade(c, -0.12)));
  }
  out.push(path(`M${x + w * 0.1} ${y} L${x + w * 0.38} ${y} L${x + w * 0.1} ${y + h * 0.62} Z`, '#ffffff', { opacity: 0.42 }));
  out.push(path(`M${x + w * 0.46} ${y} L${x + w * 0.56} ${y} L${x + w * 0.3} ${y + h} L${x + w * 0.2} ${y + h} Z`, '#ffffff', { opacity: 0.18 }));
  if (o.mull !== false) out.push(rect(x + w / 2 - fw * 0.35, y, fw * 0.7, h, fr));
  if (o.bar) out.push(rect(x, y + h * 0.45, w, fw * 0.6, fr));
  out.push(rect(x, y, w, fw * 0.8, '#000000', { opacity: 0.12 }));
  if (o.sill !== false) out.push(rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 1.3, shade(fr, -0.16)), rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 0.4, '#ffffff', { opacity: 0.5 }));
  return out.join('');
}
// ショーウィンドウのわく（中の品物の上に重ねる：わく・うつりこみ・まどわく）
export function glassFrame(x, y, w, h, fr, fw = 12, o = {}) {
  const out = [
    path(`M${x + w * 0.06} ${y} L${x + w * 0.3} ${y} L${x + w * 0.06} ${y + h * 0.5} Z`, '#ffffff', { opacity: 0.3 }),
    path(`M${x + w * 0.4} ${y} L${x + w * 0.48} ${y} L${x + w * 0.22} ${y + h} L${x + w * 0.14} ${y + h} Z`, '#ffffff', { opacity: 0.14 }),
    rect(x - fw, y - fw, w + fw * 2, fw, fr), rect(x - fw, y + h, w + fw * 2, fw, fr),
    rect(x - fw, y, fw, h, fr), rect(x + w, y, fw, h, fr),
    rect(x - fw, y - fw, w + fw * 2, 3, '#ffffff', { opacity: 0.3 })
  ];
  if (o.mull) out.push(rect(x + w / 2 - fw * 0.35, y, fw * 0.7, h, fr));
  if (o.sill) out.push(rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 1.3, shade(fr, -0.2)));
  return out.join('');
}
// 花のプランター
export function flowerBox(x, y, w, r, cols = ['#ff6b7d', '#ffd24a', '#ffffff', '#ff9ac2']) {
  const out = [];
  for (let i = 0; i < w / 28; i++) {
    const fx = x + 14 + i * 28 + (r() - 0.5) * 8, fy = y - 18 - r() * 22;
    out.push(circ(fx, fy + 14, 16, i % 2 ? '#4f9a45' : '#5eac4f'));
  }
  for (let i = 0; i < w / 34; i++) {
    const fx = x + 18 + i * 34 + (r() - 0.5) * 10, fy = y - 26 - r() * 20, c = cols[i % cols.length];
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; out.push(circ(fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 5.5, c)); }
    out.push(circ(fx, fy, 3.5, '#f7b733'));
  }
  out.push(rrect(x, y - 4, w, 34, 6, '#a0603a'), rect(x, y - 4, w, 8, '#c07a4c'), rect(x + 6, y + 22, w - 12, 5, '#000000', { opacity: 0.15 }));
  return out.join('');
}
// しましまのひさし（下が波）
export function awning(G, x, y, w, h, c1, c2, n) {
  const sw = w / n, out = [rect(x, y + h, w, h * 0.9, G.under)];
  for (let i = 0; i < n; i++) {
    const c = i % 2 ? c2 : c1, sx = x + i * sw;
    out.push(path(`M${sx} ${y} L${sx + sw + 0.6} ${y} L${sx + sw + 0.6} ${y + h} Q${sx + sw / 2} ${y + h + sw * 0.5} ${sx} ${y + h} Z`, c));
  }
  out.push(rect(x, y, w, h, G.awnShade));
  for (let i = 0; i < n; i++) { const sx = x + i * sw; out.push(path(`M${sx + 4} ${y + h + 2} Q${sx + sw / 2} ${y + h + sw * 0.46} ${sx + sw - 4} ${y + h + 2}`, 'none', st('#000000', 3, { opacity: 0.12 }))); }
  out.push(rrect(x - 8, y - 12, w + 16, 16, 5, shade(c1, -0.35)), rect(x - 8, y - 12, w + 16, 4, '#ffffff', { opacity: 0.25 }));
  return out.join('');
}
// レンガのかべ（パン屋の2階）
export function bricks(x, y, w, h, c = '#d9a47a', m = '#efd9bf') {
  const out = [rect(x, y, w, h, m)];
  for (let row = 0, yy = y; yy < y + h; row++, yy += 28) {
    for (let xx = x - (row % 2 ? 36 : 0); xx < x + w; xx += 72) {
      const x0 = Math.max(x, xx + 3), x1 = Math.min(x + w, xx + 69);
      if (x1 - x0 > 6) out.push(rect(x0, yy + 3, x1 - x0, Math.min(22, y + h - yy - 3), (row * 7 + Math.floor(xx / 72)) % 5 === 0 ? shade(c, -0.08) : (row + Math.floor(xx / 72)) % 3 === 0 ? shade(c, 0.08) : c));
    }
  }
  return out.join('');
}
// 無地のひさし（カフェ：青にカップのマーク）
export function solidAwning(G, x, y, w, h, c) {
  const cx = x + w / 2, cy = y + h / 2 + 4;
  return [
    rect(x, y + h, w, h * 0.9, G.under),
    path(`M${x} ${y} L${x + w} ${y} L${x + w + 6} ${y + h} L${x - 6} ${y + h} Z`, c),
    rect(x - 6, y + h - 12, w + 12, 12, shade(c, -0.25)),
    rect(x, y, w, h, G.awnShade),
    tr(cx, cy, [
      path('M-20 -16 L16 -16 L12 12 Q-2 20 -16 12 Z', '#ffffff'),
      path('M15 -10 q14 2 12 12 q-2 8 -14 8', 'none', st('#ffffff', 5)),
      path('M-8 -22 q4 -8 0 -14 M4 -22 q4 -8 0 -14', 'none', st('#ffffff', 3, { opacity: 0.8 })),
      ell(-2, 22, 28, 5, '#ffffff', { opacity: 0.9 })
    ], 1.5),
    rrect(x - 8, y - 12, w + 16, 16, 5, shade(c, -0.35))
  ].join('');
}
// 看板（文字はゲームで描く）
export function board(x, y, w, h, c, edge, r = 12) {
  return [
    rrect(x, y + 8, w, h, r, '#000000', { opacity: 0.16 }),
    rrect(x, y, w, h, r, edge), rrect(x + 9, y + 9, w - 18, h - 18, r * 0.7, c),
    rect(x + 16, y + 12, w - 32, 7, '#ffffff', { opacity: 0.22 }),
    circ(x + 20, y + h / 2, 5, shade(edge, -0.3)), circ(x + w - 20, y + h / 2, 5, shade(edge, -0.3))
  ].join('');
}
// 店の中（奥が暗い）
export const inside = (G, x, y, w, h, c) => rect(x, y, w, h, c) + rect(x, y, w, h, G.inShade);
// 瓦（いぶし銀）の小さい屋根
export function tileRoof(x, y, w, h, c = '#5d6674') {
  const out = [path(`M${x} ${y + h} L${x + 30} ${y} L${x + w - 30} ${y} L${x + w} ${y + h} Z`, c)];
  const rows = Math.max(2, Math.round(h / 26));
  for (let i = 1; i < rows; i++) { const yy = y + (h / rows) * i; out.push(rect(x + 30 * (1 - i / rows), yy - 2, w - 60 * (1 - i / rows), 3, shade(c, 0.22), { opacity: 0.8 })); }
  for (let xx = x + 8; xx < x + w - 8; xx += 22) out.push(circ(xx + 11, y + h + 2, 9, shade(c, -0.25)), circ(xx + 11, y + h + 1, 6, shade(c, 0.12)));
  out.push(rect(x + 26, y - 6, w - 52, 10, shade(c, -0.3)), rect(x + 26, y - 6, w - 52, 3, shade(c, 0.3)));
  return out.join('');
}
// ちょうちん
export function lantern(x, y, s = 1) {
  return tr(x, y, [
    rect(-3, -34, 6, 14, '#3a2a22'),
    rrect(-24, -22, 48, 8, 3, '#2a2220'),
    ell(0, 18, 30, 40, '#f6ead0'), ell(-8, 10, 10, 26, '#ffffff', { opacity: 0.7 }), path('M-10 8 Q0 -6 10 8 Q0 30 -10 8 Z', '#8a5a3a', { opacity: 0.85 }),
    ...[-18, -4, 10, 24, 38].map(yy => path(`M${-Math.sqrt(Math.max(0, 1 - ((yy - 18) / 40) ** 2)) * 30} ${yy} Q0 ${yy + 4} ${Math.sqrt(Math.max(0, 1 - ((yy - 18) / 40) ** 2)) * 30} ${yy}`, 'none', st('#d8c8a6', 2))),
    rrect(-24, 52, 48, 8, 3, '#2a2220'), rect(-2, 60, 4, 14, '#2a2220')
  ], s);
}

export function cloverBlob(x, y, r, c, light) {
  const k = r * 0.52;
  return [circ(x - k, y, r * 0.62, c), circ(x + k, y, r * 0.62, c), circ(x, y - k, r * 0.62, c), circ(x, y + k * 0.7, r * 0.58, c),
    light ? circ(x - k * 0.9, y - k * 0.6, r * 0.28, light, { opacity: 0.9 }) : ''].join('');
}

// 小さいクローバーの葉（背景の木・ツタ用。ドット単位）
export function clover(x, y, r, c, light) {
  const k = r * 0.52;
  return [
    circ(x - k, y, r * 0.62, c), circ(x + k, y, r * 0.62, c), circ(x, y - k, r * 0.62, c), circ(x, y + k * 0.7, r * 0.58, c),
    light ? circ(x - k * 0.9, y - k * 0.6, r * 0.28, light, { opacity: 0.9 }) : ''
  ].join('');
}
// 背景の木（幹＋葉のかたまり）。s は大きさ、c は {trunk, dark, base, mid, light}
export function cloverTree(x, y, s, r, c) {
  const out = [path(`M${x - 2.2 * s} ${y} C${x - 1.5 * s} ${y - 12 * s} ${x - 3 * s} ${y - 18 * s} ${x - 6 * s} ${y - 24 * s} L${x - 4 * s} ${y - 25 * s} C${x - 1 * s} ${y - 20 * s} ${x + 1 * s} ${y - 18 * s} ${x + 2 * s} ${y - 26 * s} L${x + 3.6 * s} ${y - 25 * s} C${x + 2.5 * s} ${y - 16 * s} ${x + 2.4 * s} ${y - 10 * s} ${x + 2.4 * s} ${y} Z`, c.trunk)];
  const blobs = [];
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    blobs.push([x + Math.cos(a) * 13 * s * d, y - 32 * s + Math.sin(a) * 10 * s * d, (5 + r() * 3) * s]);
  }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(clover(bx, by + 1.2 * s, br, c.dark));
  for (const [bx, by, br] of blobs) out.push(clover(bx, by, br * 0.92, r() < 0.5 ? c.base : c.mid, c.light));
  return out.join('');
}
