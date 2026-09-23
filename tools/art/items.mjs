// アイテム・ブロック・旗など。座標は 0.1ドット単位
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, shade } from './svg.mjs';

// ？の形（文字を使わずに形で描く）
const QMARK = 'M-22 -30 C-22 -52 -8 -62 4 -62 C22 -62 34 -50 34 -34 C34 -18 22 -12 14 -6 C8 -2 8 2 8 8 L-8 8 C-8 -2 -6 -8 4 -16 C12 -22 16 -26 16 -34 C16 -42 10 -46 4 -46 C-4 -46 -8 -40 -8 -30 Z M-9 18 L9 18 L9 34 L-9 34 Z';

// ===================== コイン（回る） =====================
function coin(k) {
  // k: 横のはば（1 = 正面, 0 = 真横）
  const w = Math.max(0.12, k);
  const out = [];
  out.push(ell(0, 0, 60 * w + 6, 70, '#d98f00'));
  out.push(ell(0, -2, 60 * w, 66, '#ffd23f'));
  if (w > 0.35) {
    out.push(ell(0, -2, 44 * w, 50, '#f5b400'));
    out.push(ell(0, -4, 40 * w, 46, '#ffdc5c'));
    out.push(rrect(-7 * w, -30, 14 * w, 56, 6 * w, '#e39e00'));
    out.push(ell(-28 * w, -30, 12 * w, 18, '#fff4b8', { opacity: 0.85, rot: 20 }));
  } else {
    out.push(rect(-3, -64, 6, 124, '#fff0a0', { opacity: 0.6 }));
  }
  return out.join('');
}
const COIN_W = [1, 0.82, 0.45, 0.12, 0.45, 0.82];
COIN_W.forEach((k, i) => sprite('items', `coin/${i}`, 14, 16, 7, 8, () => tr(7, 8, coin(k), 0.1)));

// ===================== メダル =====================
const STAR = (r1, r2) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return p; };
function medal(k) {
  const w = Math.max(0.2, k);
  return [
    ell(0, 4, 96 * w, 96, '#b86f00'),
    ell(0, 0, 94 * w, 94, '#ffc21a'),
    ell(0, 0, 76 * w, 76, '#ffe07a'),
    ell(0, 0, 66 * w, 66, '#fff6d0'),
    tr(0, 4, poly(STAR(52, 22), '#2fb6e0'), [w, 1]),
    tr(-6 * w, -2, poly(STAR(22, 9), '#bff0ff'), [w, 1]),
    ell(-46 * w, -48, 18 * w, 10, '#ffffff', { opacity: 0.8, rot: -40 })
  ].join('');
}
[1, 0.7, 0.4, 0.7].forEach((k, i) => sprite('items', `medal/${i}`, 22, 22, 11, 11, () => tr(11, 11, medal(k), 0.1)));
sprite('items', 'medal/empty', 22, 22, 11, 11, () => tr(11, 11, [
  circ(0, 0, 90, '#000000', { opacity: 0.3 }), circ(0, 0, 90, 'none', { stroke: '#ffffff', strokeWidth: 12, opacity: 0.85 }),
  tr(0, 4, poly(STAR(46, 20), '#ffffff', { opacity: 0.35 }))
], 0.1));

// ===================== 金のリンゴ =====================
sprite('items', 'apple', 20, 20, 10, 11, () => tr(10, 11, [
  circ(0, 10, 86, '#ffe680', { opacity: 0.35 }),
  path('M0 -44 C-30 -64 -72 -48 -70 -4 C-68 44 -34 72 -12 64 C-4 60 4 60 12 64 C34 72 68 44 70 -4 C72 -48 30 -64 0 -44 Z', '#d99100'),
  path('M0 -40 C-28 -58 -64 -44 -62 -6 C-60 38 -30 62 -10 56 C-4 52 4 52 10 56 C30 62 60 38 62 -6 C64 -44 28 -58 0 -40 Z', '#ffcc2e'),
  ell(-30, -18, 12, 22, '#fff6c9', { opacity: 0.9, rot: 20 }),
  ell(32, 30, 18, 12, '#f0a400', { opacity: 0.5 }),
  path('M0 -44 Q2 -64 10 -76', 'none', { stroke: '#6b3a1c', strokeWidth: 8, strokeLinecap: 'round' }),
  path('M8 -62 C22 -86 52 -80 56 -66 C40 -56 22 -56 8 -62 Z', '#4cb870'),
  path('M12 -63 C28 -74 44 -72 52 -67', 'none', { stroke: '#8ee0a6', strokeWidth: 3, strokeLinecap: 'round' })
], 0.1));

// ===================== にじ色スター =====================
sprite('items', 'star', 18, 18, 9, 9, defs => {
  const grad = defs.lin([[0, '#ff5a7a'], [0.25, '#ffb23a'], [0.5, '#ffe45a'], [0.75, '#5ee0a0'], [1, '#4aa8ff']], 0, 0, 1, 1);
  return tr(9, 9, [
    poly(STAR(84, 40), '#ffffff'),
    poly(STAR(74, 34), grad),
    tr(-8, -10, poly(STAR(28, 12), '#ffffff', { opacity: 0.85 })),
    circ(-16, 12, 7, '#2a1a3a'), circ(16, 12, 7, '#2a1a3a')
  ], 0.1);
});

// ===================== ハート・豚まん =====================
sprite('items', 'heart', 18, 16, 9, 8, () => tr(9, 8, [
  path('M0 62 C-60 20 -86 -10 -76 -40 C-66 -70 -26 -76 0 -44 C26 -76 66 -70 76 -40 C86 -10 60 20 0 62 Z', '#e8336e'),
  path('M0 52 C-54 16 -76 -10 -68 -36 C-60 -60 -26 -64 0 -34 C26 -64 60 -60 68 -36 C76 -10 54 16 0 52 Z', '#ff5a8e'),
  ell(-38, -34, 16, 10, '#ffffff', { opacity: 0.8, rot: -35 })
], 0.1));
sprite('items', 'nikuman', 18, 14, 9, 8, () => tr(9, 8, [
  ell(0, 28, 76, 22, '#c9b089'),
  path('M-76 26 C-78 -30 -40 -52 0 -52 C40 -52 78 -30 76 26 Q0 42 -76 26 Z', '#f6ead3'),
  path('M-60 10 C-58 -26 -30 -42 0 -44 C-26 -34 -44 -14 -46 16 Z', '#ffffff', { opacity: 0.8 }),
  ...[-30, -14, 0, 14, 30].map(x => path(`M0 -44 Q${x * 0.6} -30 ${x} -18`, 'none', { stroke: '#d8c2a0', strokeWidth: 4, strokeLinecap: 'round' })),
  circ(0, -46, 8, '#e8d6b6')
], 0.1));

// ===================== ブロック =====================
function qblock(shine) {
  return [
    rrect(0, 0, 160, 160, 22, '#b86b00'),
    rrect(6, 6, 148, 146, 18, '#f7b21c'),
    path('M12 12 L148 12 L136 26 L26 26 L26 132 L12 146 Z', shade('#ffd65a', shine * 0.4)),
    rrect(26, 26, 108, 106, 8, shade('#ffc22e', shine * 0.3)),
    ...[[20, 20], [140, 20], [20, 138], [140, 138]].map(([x, y]) => circ(x, y, 6, '#b86b00')),
    tr(86, 90, path(QMARK, '#9a4e00'), 1.15),
    tr(80, 84, path(QMARK, '#ffffff'), 1.15),
    shine > 0 ? path('M36 36 L60 36 L36 60 Z', '#ffffff', { opacity: 0.35 * shine }) : ''
  ].join('');
}
[0, 0.5, 1].forEach((k, i) => sprite('items', `q/${i}`, 16, 16, 0, 0, () => tr(0, 0, qblock(k), 0.1)));
sprite('items', 'used', 16, 16, 0, 0, () => tr(0, 0, [
  rrect(0, 0, 160, 160, 22, '#5e3a22'),
  rrect(6, 6, 148, 146, 18, '#9a6a45'),
  path('M12 12 L148 12 L136 26 L26 26 L26 132 L12 146 Z', '#b98a62'),
  rrect(26, 26, 108, 106, 8, '#8c5e3c'),
  ...[[20, 20], [140, 20], [20, 138], [140, 138]].map(([x, y]) => circ(x, y, 6, '#5e3a22'))
], 0.1));
// レンガのブロック
function brickRow(y, off, h, c) {
  const out = [];
  for (let x = off - 80; x < 160; x += 80) {
    const x0 = Math.max(0, x + 3), x1 = Math.min(160, x + 77);
    if (x1 - x0 < 6) continue;
    out.push(rrect(x0, y + 3, x1 - x0, h - 6, 6, c.base));
    out.push(rrect(x0, y + 3, x1 - x0, 9, 4, c.light));
    out.push(rect(x0 + 3, y + h - 12, x1 - x0 - 6, 8, c.dark, { opacity: 0.6 }));
  }
  return out.join('');
}
export const BRICK = { base: '#d0603c', light: '#ee8a62', dark: '#9a3c22', mortar: '#f2caa4' };
sprite('items', 'brick', 16, 16, 0, 0, () => tr(0, 0, [
  rect(0, 0, 160, 160, BRICK.mortar),
  brickRow(0, 0, 40, BRICK), brickRow(40, 40, 40, BRICK), brickRow(80, 0, 40, BRICK), brickRow(120, 40, 40, BRICK),
  rect(0, 0, 160, 4, '#fff1e0', { opacity: 0.8 })
], 0.1));

// ===================== 中間ポイントの旗 =====================
function cpFlag(active, wave) {
  const c = active ? '#3fbf5a' : '#e9edf2', cd = active ? '#2a9a44' : '#c3cad3';
  return [
    rect(-8, 0, 16, 470, '#6c7686'), rect(-8, 0, 6, 470, '#9aa4b2'),
    circ(0, 0, 18, active ? '#ffd23a' : '#b9c0ca'),
    path(`M8 24 Q60 ${30 + wave} 118 ${56} Q60 ${82 + wave} 8 94 Z`, cd),
    path(`M8 24 Q60 ${26 + wave} 112 ${54} Q60 ${74 + wave} 8 84 Z`, c),
    active ? tr(52, 56, poly(STAR(18, 8), '#ffffff')) : '',
    rrect(-34, 440, 68, 40, 8, '#5b6472')
  ].join('');
}
sprite('items', 'cp/off', 14, 49, 3, 48, () => tr(3, 0.5, cpFlag(false, 0), 0.1));
sprite('items', 'cp/on0', 14, 49, 3, 48, () => tr(3, 0.5, cpFlag(true, 6), 0.1));
sprite('items', 'cp/on1', 14, 49, 3, 48, () => tr(3, 0.5, cpFlag(true, -6), 0.1));

// ===================== ゴールの旗 =====================
function goalFlag(wave) {
  return [
    path(`M0 0 Q-80 ${36 + wave} -168 70 Q-80 ${104 + wave} 0 140 Z`, '#d63a5c'),
    path(`M0 0 Q-80 ${30 + wave} -160 66 Q-80 ${94 + wave} 0 126 Z`, '#ff5a7e'),
    tr(-62, 66, poly(STAR(30, 13), '#ffffff'))
  ].join('');
}
sprite('items', 'goalflag/0', 18, 15, 17, 1, () => tr(17, 0.5, goalFlag(10), 0.1));
sprite('items', 'goalflag/1', 18, 15, 17, 1, () => tr(17, 0.5, goalFlag(-10), 0.1));
sprite('items', 'goalball', 9, 9, 4.5, 4.5, () => tr(4.5, 4.5, [circ(0, 0, 38, '#e8a400'), circ(0, -3, 34, '#ffd23a'), circ(-12, -14, 10, '#fff4b8')], 0.1));
