// 地形タイル その2（動物園・新神戸・布引の滝・ロープウェイ・三宮・南京町・須磨・舞子・明石海峡大橋・六甲山・掬星台）
// 座標は 0.1ドット単位（0〜160）
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from './svg.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile, brickWall, water, WIN } from './tiles.mjs';

// ---------- 共通の道具 ----------
// 土（小石つき）。小石はタイルのはしをまたがないので、となりとつながる
function soil(c, seed, o = {}) {
  const r = rng(seed);
  const out = [rect(0, 0, U, U, c.base)];
  if (o.strata) for (let k = 0; k < 3; k++) {
    const y = 30 + k * 48 + r() * 10;
    out.push(path(`M0 ${y} Q40 ${y - 6} 80 ${y} T160 ${y} L160 ${y + 10} Q120 ${y + 4} 80 ${y + 10} T0 ${y + 10} Z`, c.dark, { opacity: 0.35 }));
  }
  const n = o.pebbles ?? 5;
  for (let i = 0; i < n; i++) {
    const rx = 6 + r() * 9, ry = rx * (0.55 + r() * 0.25);
    const x = 14 + rx + r() * (U - 28 - rx * 2), y = 12 + ry + r() * (U - 24 - ry * 2);
    const col = r() < 0.5 ? c.peb1 : c.peb2;
    out.push(ell(x, y + 2.5, rx, ry, shade(col, -0.25)), ell(x, y, rx, ry, col), ell(x - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.3, shade(col, 0.35), { opacity: 0.8 }));
  }
  for (let i = 0; i < (o.specks ?? 6); i++) out.push(circ(10 + r() * 140, 10 + r() * 140, 2 + r() * 2, r() < 0.5 ? c.dark : c.light || shade(c.base, 0.2), { opacity: 0.6 }));
  return out.join('');
}
// 草のふち（下が波うつ）。はしの高さはそろえてあるのでつながる
function grassCap(c, v, o = {}) {
  const h = o.h ?? 40;
  const wave = (y0, amp) => {
    let d = `M0 0 L160 0 L160 ${y0}`;
    const pts = [[140, y0 + amp], [120, y0 - amp * 0.4], [100, y0 + amp * 1.2], [80, y0], [60, y0 + amp], [40, y0 - amp * 0.5], [20, y0 + amp * 0.9], [0, y0]];
    for (const [x, y] of pts) d += ` Q${x + 10} ${y + amp * 0.4} ${x} ${y}`;
    return d + ' Z';
  };
  const out = [
    path(wave(h + 10, 8), '#000000', { opacity: 0.18 }),
    path(wave(h + 4, 8), c.dark),
    path(wave(h - 4, 7), c.base),
    rect(0, 0, U, 7, c.light),
    ...[18, 58, 98, 138].map((x, i) => path(`M${x + (v * 13) % 20} 8 q4 -6 8 0 q4 -7 8 0`, 'none', { stroke: c.light, strokeWidth: 3, strokeLinecap: 'round', opacity: 0.8 }))
  ];
  if (o.flowers && v === 1) {
    const cols = o.flowers;
    [[34, 20], [70, 26], [112, 18], [132, 30]].forEach(([x, y], i) => {
      const col = cols[i % cols.length];
      out.push(...[0, 72, 144, 216, 288].map(a => circ(x + Math.cos(a * Math.PI / 180) * 4.4, y + Math.sin(a * Math.PI / 180) * 4.4, 3.4, col)), circ(x, y, 2.6, '#ffe45a'));
    });
  }
  return out.join('');
}
// 地面セット（胴体・上・はし・坂）をまとめて登録
function groundSet(th, body, top, cap, o = {}) {
  const nb = o.bodies || 3;
  for (let v = 0; v < nb; v++) tile(`t/${th}/g/body${v}`, defs => body(v, defs));
  for (let v = 0; v < 2; v++) tile(`t/${th}/g/top${v}`, defs => top(v, defs));
  const eo = o.edge ?? 0.3;
  tile(`t/${th}/g/edgeL`, defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', eo], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile(`t/${th}/g/edgeR`, defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', eo]], 0, 0, 1, 0)));
  if (o.topL !== false) {
    tile(`t/${th}/g/topL`, () => o.topL ? o.topL() : [rect(0, 0, 8, cap.h + 2, cap.dark), rect(0, 0, 4, cap.h - 4, shade(cap.base, -0.05))].join(''));
    tile(`t/${th}/g/topR`, () => o.topR ? o.topR() : [rect(152, 0, 8, cap.h + 2, cap.dark), rect(156, 0, 4, cap.h - 4, shade(cap.base, -0.05))].join(''));
  }
  for (const k of Object.keys(SLOPES)) tile(`t/${th}/g/${k}`, defs => slopeTile(defs, k, body(k.length % nb, defs), cap));
}
// 細い坂（木の橋・ケーブル・鉄の通路）: 坂の線にそった帯だけ
function thinSlope(k, layers) {
  const [yl, yr] = SLOPES[k];
  return layers.map(([off, w, col, o]) => path(`M0 ${yl + off} L160 ${yr + off}`, 'none', { stroke: col, strokeWidth: w, strokeLinecap: 'butt', ...(o || {}) })).join('');
}

// ========================================================================
// 王子動物園：草と土、生け垣
// ========================================================================
{
  const S = { base: '#c9955a', dark: '#a8763f', light: '#dcb07a', peb1: '#e0bb86', peb2: '#b7864f' };
  const cap = { h: 40, base: '#6cc95a', dark: '#44a236', light: '#a8ec8e' };
  groundSet('zoo', v => soil(S, 1200 + v, { strata: true }), v => soil(S, 1210 + v, { pebbles: 3 }) + grassCap(cap, v, { flowers: ['#ffffff', '#ffd6e8', '#fff27a'] }), cap);
  // 生け垣（まるい葉っぱがぎっしり）
  const hedge = (top) => {
    const r = rng(top ? 1250 : 1240);
    const out = [rect(0, 0, U, U, '#2f7a3c')];
    for (let i = 0; i < 16; i++) {
      const x = 10 + (i % 4) * 40 + r() * 20 - 10, y = 14 + Math.floor(i / 4) * 40 + r() * 12;
      out.push(circ(x, y + 4, 22, '#276a33'), circ(x, y, 20, i % 3 ? '#43a052' : '#4fae5c'), circ(x - 6, y - 7, 8, '#7fcd78', { opacity: 0.8 }));
    }
    if (top) out.push(rect(0, 0, U, 30, '#4fae5c'), rect(0, 0, U, 8, '#8fd87e'), rect(0, 30, U, 6, '#2f7a3c', { opacity: 0.6 }));
    return out.join('');
  };
  tile('m/hedge/hard', () => hedge(false));
  tile('m/hedge/hardT', () => [rect(0, 0, U, 34, '#4fae5c'), rect(0, 0, U, 8, '#8fd87e'), rect(0, 30, U, 6, '#2f7a3c', { opacity: 0.5 }), ...[20, 60, 100, 140].map(x => circ(x, 34, 14, '#43a052'))].join(''));
}

// ========================================================================
// 新神戸駅：みがいた石のゆか
// ========================================================================
{
  const floor = (v, seed) => {
    const r = rng(seed);
    const cols = ['#9aa0a8', '#a3a8b0', '#959ba3', '#a9adb4'];
    const out = [rect(0, 0, U, U, '#7d828a')];
    for (let i = 0; i < 4; i++) {
      const x = (i % 2) * 80, y = Math.floor(i / 2) * 80;
      const c = cols[Math.floor(r() * 4)];
      out.push(rect(x + 3, y + 3, 74, 74, c), rect(x + 3, y + 3, 74, 6, shade(c, 0.2)), rect(x + 3, y + 71, 74, 6, shade(c, -0.1)));
      for (let k = 0; k < 4; k++) out.push(circ(x + 10 + r() * 60, y + 12 + r() * 58, 1.6, shade(c, r() < 0.5 ? -0.2 : 0.25)));
    }
    return out.join('');
  };
  const cap = { h: 34, base: '#e4e6ea', dark: '#a9adb4', light: '#ffffff' };
  groundSet('shinkobe', v => floor(v, 1300 + v), v => [floor(v, 1310 + v), rect(0, 32, U, 10, '#000000', { opacity: 0.2 }), rect(0, 0, U, 36, cap.dark), rect(0, 0, U, 30, cap.base), rect(0, 0, U, 5, cap.light), rect(0, 12, U, 3, '#c9ccd2')].join(''), cap);
  tile('t/shinkobe/hard', () => [
    rrect(0, 0, U, U, 8, '#8e939b'), rrect(5, 5, 150, 148, 6, '#c7cbd1'),
    path('M10 10 L150 10 L138 22 L22 22 L22 138 L10 150 Z', '#e4e7eb'), path('M150 10 L150 150 L10 150 L22 138 L138 138 L138 22 Z', '#aeb3ba')
  ].join(''));
}

// ========================================================================
// 布引の滝：しめった岩と苔
// ========================================================================
{
  const P = { colors: ['#7c7766', '#6f6b5c', '#858070', '#77735f'], jitter: 14, round: 22, speck: true, gap: 9 };
  const mortar = '#46423a';
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 76, edge: '#7a7564', joints: joints(44, 124, 1400 + v, 40, 70) }, { y0: 76, y1: 160, edge: '#737060', joints: joints(20, 104, 1410 + v, 40, 70) }], P, 1420 + v),
    v === 1 ? g([ell(40, 150, 26, 8, '#4f8a42', { opacity: 0.8 }), ell(58, 154, 14, 5, '#6fae5a', { opacity: 0.8 })]) : '',
    v === 2 ? path('M120 20 q6 20 -2 40', 'none', { stroke: '#9fd6e6', strokeWidth: 4, opacity: 0.5, strokeLinecap: 'round' }) : ''
  ].join('');
  const cap = { h: 40, base: '#5a9e4b', dark: '#3d7a33', light: '#8fce7a' };
  const top = (v) => body(v + 3) + grassCap(cap, v) + (v === 1 ? [
    // シダ
    path('M110 34 Q118 14 134 8', 'none', { stroke: '#3d7a33', strokeWidth: 3 }),
    ...[0, 1, 2, 3].map(k => ell(114 + k * 5, 28 - k * 5, 6, 2.6, '#6fbf5a', { rot: -40 })),
    ...[0, 1, 2].map(k => ell(122 + k * 4, 30 - k * 6, 5, 2.2, '#6fbf5a', { rot: 30 }))
  ].join('') : '');
  groundSet('falls', body, top, cap);
  // 大きな岩のブロック
  const boulder = (o = {}) => [
    rect(0, 0, U, U, '#4a463d'),
    path(roundPoly([[4, 8], [150, 4], [156, 150], [8, 156]], 30), '#5d5a4f'),
    path(roundPoly([[8, 4], [148, 8], [150, 140], [10, 146]], 28), '#8a8677'),
    path(roundPoly([[18, 12], [120, 12], [96, 40], [24, 50]], 16), '#aaa594', { opacity: 0.8 }),
    path('M60 80 L84 100 L78 124 M84 100 L108 94', 'none', { stroke: '#5d5a4f', strokeWidth: 4, strokeLinecap: 'round' }),
    o.wet ? rect(0, 0, U, U, '#5fb8d6', { opacity: 0.08 }) : ''
  ].join('');
  tile('m/rock/hard', () => boulder());
  tile('m/rock/hardT', () => [ell(80, 6, 76, 14, '#3d7a33'), ell(80, 2, 70, 10, '#5a9e4b'), ell(60, 0, 30, 4, '#8fce7a', { opacity: 0.8 }), ell(20, 10, 16, 8, '#5a9e4b'), ell(140, 12, 14, 8, '#5a9e4b')].join(''));
  // 木の橋の坂（板）
  for (const k of Object.keys(SLOPES)) tile(`m/wood/${k}`, () => thinSlope(k, [[26, 40, '#6a4020'], [18, 30, '#b98150'], [8, 8, '#d9a674']]) + (() => {
    const [yl, yr] = SLOPES[k];
    return [40, 120].map(x => { const y = yl + (yr - yl) * x / 160; return rect(x - 5, y + 44, 10, 26, '#6a4020', { opacity: 0.9 }); }).join('');
  })());
}

// ========================================================================
// 布引ハーブ園（ロープウェイの上）：石がきと花だん、温室のガラス
// ========================================================================
{
  const P = { colors: ['#c9bea8', '#bfb39b', '#d3c9b4', '#b8ac94'], jitter: 0, round: 10, speck: true, gap: 8 };
  const mortar = '#948771';
  const body = (v) => [rect(0, 0, U, U, mortar), masonry([{ y0: 0, y1: 54, joints: [60, 120], edge: '#c4b9a3' }, { y0: 54, y1: 108, joints: [30, 100], edge: '#bdb29c' }, { y0: 108, y1: 160, joints: [70, 140], edge: '#c7bca6' }], P, 1500 + v)].join('');
  const cap = { h: 40, base: '#72cc5c', dark: '#4ea63d', light: '#b1ee98' };
  const top = (v) => body(v + 3) + grassCap(cap, 1, { flowers: v ? ['#b58ae6', '#9a6ad8', '#ffffff'] : ['#ff9ab8', '#fff27a', '#b58ae6'] });
  groundSet('ropeway', body, top, cap);
  const glass = (fake) => [
    rect(0, 0, U, U, '#bfe8f2', { opacity: fake ? 0.78 : 0.85 }),
    path('M0 160 L0 110 Q30 96 50 118 Q70 90 96 112 Q120 94 160 108 L160 160 Z', '#7cc56e', { opacity: 0.55 }),
    rect(0, 0, U, 10, '#ffffff'), rect(0, 150, U, 10, '#e4ecef'), rect(0, 0, 8, U, '#ffffff'), rect(152, 0, 8, U, '#e4ecef'), rect(76, 0, 8, U, '#ffffff'),
    path('M16 140 L60 16 L76 16 L32 140 Z', '#ffffff', { opacity: 0.55 }), path('M100 140 L130 60 L140 60 L110 140 Z', '#ffffff', { opacity: 0.35 }),
    fake ? circ(118, 36, 5, '#ffffff', { opacity: 0.9 }) + path('M118 26 L118 46 M108 36 L128 36', 'none', { stroke: '#ffffff', strokeWidth: 2 }) : ''
  ].join('');
  tile('m/glass/hard', () => glass(false));
  tile('m/glass/fake', () => glass(true));
  tile('m/glass/hardT', () => [rect(0, 0, U, 14, '#dfe7ea'), rect(0, 0, U, 5, '#ffffff'), rect(0, 14, U, 4, '#9fb2ba')].join(''));
}
// 鉄骨（すけて見える）
function steelLattice(c, dark, light) {
  return [
    path('M14 10 L146 150 M146 10 L14 150', 'none', { stroke: dark, strokeWidth: 14 }),
    path('M14 10 L146 150 M146 10 L14 150', 'none', { stroke: c, strokeWidth: 8 }),
    rect(0, 0, 22, U, dark), rect(138, 0, 22, U, dark), rect(3, 0, 12, U, c), rect(141, 0, 12, U, c), rect(5, 0, 4, U, light),
    rect(0, 0, U, 16, dark), rect(0, 2, U, 9, c), rect(0, 2, U, 3, light),
    ...[[10, 8], [150, 8], [80, 80]].map(([x, y]) => circ(x, y, 4, light))
  ].join('');
}
tile('m/steel/hard', () => steelLattice('#9aa5b1', '#5f6b77', '#d3dae2'));
tile('t/rokko/m/steel/hard', () => steelLattice('#5c6a86', '#2c3550', '#8fa0c4'));

// ========================================================================
// 三宮：歩道のブロックとビル
// ========================================================================
{
  const body = (v) => soil({ base: '#6f747d', dark: '#5c6069', light: '#8a8f98', peb1: '#7d828b', peb2: '#666a73' }, 1600 + v, { pebbles: 0, specks: 14 });
  const cap = { h: 42, base: '#d3c6b3', dark: '#9d917f', light: '#f1e8da' };
  const top = (v) => [
    body(v),
    rect(0, 40, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 44, cap.dark),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 4, 36, 16, i % 2 ? '#d9ccb8' : '#c9b7a0')),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 22 - 20 * (i % 2 ? 0 : 1) + 2, 22, 36, 14, i % 2 ? '#c9b7a0' : '#ddd1be')),
    rect(0, 0, U, 4, cap.light),
    v === 1 ? rect(0, 22, U, 14, '#f2c230') : ''
  ].join('');
  groundSet('sannomiya', body, top, cap);
  tile('t/sannomiya/hard', () => [rrect(0, 0, U, U, 6, '#8e949e'), rrect(5, 5, 150, 148, 5, '#c5cbd3'), rect(10, 10, 140, 10, '#e2e6ea'), rect(10, 136, 140, 12, '#a6adb7')].join(''));
  // ビルのかべ（ガラスの窓）
  const bldg = (defs, lit) => {
    const gl = lit ? '#ffd97a' : defs.lin([[0, '#9cc3e6'], [0.5, '#6f97c2'], [1, '#aacbe8']], 0, 0, 1, 1);
    return [
      rect(0, 0, U, U, '#c3ccd8'),
      ...[[12, 10], [88, 10], [12, 88], [88, 88]].map(([x, y]) => [rect(x - 3, y - 3, 66, 66, '#8e99a8'), rect(x, y, 60, 60, gl), path(`M${x + 6} ${y + 54} L${x + 40} ${y + 6} L${x + 52} ${y + 6} L${x + 18} ${y + 54} Z`, '#ffffff', { opacity: lit ? 0.15 : 0.4 })].join('')),
      rect(0, 76, U, 8, '#d9e0e8'), rect(76, 0, 8, U, '#d9e0e8')
    ].join('');
  };
  tile('m/bldg/hard', defs => bldg(defs, false));
  tile('m/bldg/hardT', () => [rect(0, 0, U, 22, '#e8ecf1'), rect(0, 0, U, 6, '#ffffff'), rect(0, 22, U, 6, '#7d8896')].join(''));
  tile('m/roofTop/hard', defs => bldg(defs, false));
  tile('m/roofTop/hardT', () => [
    rect(0, 0, U, 26, '#e8ecf1'), rect(0, 0, U, 6, '#ffffff'), rect(0, 26, U, 6, '#7d8896'),
    ...[10, 50, 90, 130].map(x => rect(x, 8, 6, 14, '#c3ccd8'))
  ].join(''));
}

// ========================================================================
// 南京町：赤レンガと石だたみ、ちょうちんの足場
// ========================================================================
{
  const body = (v) => brickWall(v === 1 ? '#a35a46' : '#9c5846', '#c27a62', '#6e3528', '#5e3a30');
  const cap = { h: 40, base: '#d8c3a8', dark: '#8a6a58', light: '#f1e4d0' };
  const top = (v) => [
    body(v),
    rect(0, 38, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 42, cap.dark),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 3, 36, 34, (i + v) % 2 ? '#d8c3a8' : '#b85a48')),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 3, 36, 6, '#ffffff', { opacity: 0.25 })),
    rect(0, 0, U, 3, cap.light)
  ].join('');
  groundSet('nankin', body, top, cap, { bodies: 2 });
  tile('t/nankin/semi', () => [
    // 赤いはりと、ぶら下がるちょうちん
    rect(0, 0, U, 40, '#8e1b1b'), rect(0, 0, U, 30, '#c62828'), rect(0, 0, U, 6, '#ef5350'), rect(0, 26, U, 4, '#ffd54f'),
    ...[40, 120].map(x => [
      rect(x - 1.5, 40, 3, 12, '#3b2a1a'),
      rrect(x - 18, 52, 36, 8, 3, '#2b2b2b'),
      ell(x, 80, 26, 24, '#d93a30'), ell(x, 78, 22, 20, '#ff5a4a'), ell(x - 8, 72, 6, 10, '#ffb09a', { opacity: 0.7 }),
      rrect(x - 18, 100, 36, 8, 3, '#2b2b2b'),
      rect(x - 2, 108, 4, 16, '#ffd54f')
    ].join(''))
  ].join(''));
}

// ========================================================================
// 須磨海岸：砂浜と岩
// ========================================================================
{
  const S = { base: '#e8cf93', dark: '#d4b777', light: '#f6e6bb', peb1: '#f4e2b0', peb2: '#d8bd84' };
  const body = (v) => soil(S, 1700 + v, { strata: true, pebbles: 3, specks: 10 });
  const cap = { h: 40, base: '#f6e6bb', dark: '#e0c98f', light: '#fffaf0' };
  const top = (v) => [
    body(v + 3),
    path('M0 0 L160 0 L160 44 Q120 52 80 44 T0 44 Z', cap.dark),
    path('M0 0 L160 0 L160 36 Q120 44 80 36 T0 36 Z', cap.base),
    rect(0, 0, U, 5, cap.light),
    ell(40, 20, 7, 3, '#e8d09a'), ell(110, 16, 6, 2.6, '#e8d09a'),
    v === 1 ? g([
      // 貝がらとヒトデ
      path('M96 26 Q104 10 112 26 Z', '#ffc0cb'), ...[0, 1, 2].map(k => path(`M104 26 L${99 + k * 5} 16`, 'none', { stroke: '#f09aa8', strokeWidth: 1.4 })),
      tr(40, 22, poly([0, 72, 144, 216, 288].flatMap(a => [[Math.cos((a - 90) * Math.PI / 180) * 12, Math.sin((a - 90) * Math.PI / 180) * 12], [Math.cos((a - 54) * Math.PI / 180) * 5, Math.sin((a - 54) * Math.PI / 180) * 5]]), '#ff8a5a'))
    ]) : circ(124, 22, 3, '#ffffff', { opacity: 0.8 })
  ].join('');
  groundSet('suma', body, top, cap);
  tile('t/suma/m/rock/hard', () => [
    rect(0, 0, U, U, '#5b5148'),
    path(roundPoly([[4, 6], [154, 4], [156, 154], [6, 156]], 30), '#6f655a'),
    path(roundPoly([[8, 4], [150, 8], [148, 136], [10, 146]], 28), '#9a8e7e'),
    path(roundPoly([[18, 12], [110, 12], [90, 36], [24, 46]], 14), '#b8ad9c', { opacity: 0.8 }),
    ...[[40, 120], [52, 128], [120, 110], [110, 126]].map(([x, y]) => circ(x, y, 6, '#e8e0d0')),
    ell(100, 150, 40, 10, '#3f7a5a', { opacity: 0.6 })
  ].join(''));
}

// ========================================================================
// 舞子公園：芝生と土、みかげ石
// ========================================================================
{
  const S = { base: '#b08a5a', dark: '#8d6a40', light: '#c9a472', peb1: '#c7a577', peb2: '#957045' };
  const cap = { h: 40, base: '#6cbf55', dark: '#469a37', light: '#a6e38d' };
  groundSet('maiko', v => soil(S, 1800 + v), v => soil(S, 1810 + v, { pebbles: 3 }) + grassCap(cap, v, { flowers: ['#ffffff', '#fff27a'] }), cap);
  tile('t/maiko/hard', () => [
    rrect(0, 0, U, U, 8, '#8d8f94'), rrect(5, 5, 150, 148, 6, '#c9cbcf'),
    path('M10 10 L150 10 L138 22 L22 22 L22 138 L10 150 Z', '#e2e3e6'), path('M150 10 L150 150 L10 150 L22 138 L138 138 L138 22 Z', '#aeb0b5'),
    ...[[50, 60], [100, 90], [70, 110], [110, 50]].map(([x, y]) => circ(x, y, 2.4, '#8d8f94'))
  ].join(''));
}

// ========================================================================
// 明石海峡大橋：道路の下の鉄のトラス・主塔・ケーブル
// ========================================================================
{
  const truss = (v) => [
    rect(0, 0, U, U, '#34464f'),
    path('M0 0 L80 160 L160 0 M0 160 L80 0 L160 160', 'none', { stroke: '#8fa6a0', strokeWidth: 12 }),
    path('M0 0 L80 160 L160 0', 'none', { stroke: '#b9ccc6', strokeWidth: 4 }),
    rect(0, 0, 10, U, '#a9bbb5'), rect(150, 0, 10, U, '#7d918a'), rect(0, 0, U, 10, '#c7d6d0'), rect(0, 150, U, 10, '#7d918a'),
    v === 1 ? ell(80, 80, 30, 30, '#5bb4e6', { opacity: 0.12 }) : ''
  ].join('');
  const cap = { h: 40, base: '#6c7178', dark: '#43474d', light: '#b6bbc1' };
  const top = (v) => [
    truss(v),
    rect(0, 40, U, 10, '#000000', { opacity: 0.3 }),
    rect(0, 0, U, 44, '#c7d6d0'), rect(0, 0, U, 34, cap.base), rect(0, 0, U, 4, cap.light),
    rect(v ? 20 : 100, 16, 50, 5, '#ffffff'),
    rect(0, 34, U, 10, '#a9bbb5')
  ].join('');
  groundSet('bridge', truss, top, cap, { bodies: 2, edge: 0.2 });
  const towerPanel = (T) => [
    rect(0, 0, U, U, '#c7d6d0'), rect(0, 0, 18, U, '#a9bcb5'), rect(142, 0, 18, U, '#9bb0a9'), rect(24, 0, 14, U, '#e6efec'),
    rect(0, 76, U, 8, '#9bb0a9'), ...[20, 60, 100, 140].map(x => circ(x, 70, 3, '#8fa39c')), ...[20, 60, 100, 140].map(x => circ(x, 90, 3, '#8fa39c')),
    T ? '' : ''
  ].join('');
  tile('m/bridgeTower/hard', () => towerPanel(false));
  tile('m/bridgeTower/hardT', () => [rect(0, 0, U, 20, '#e6efec'), rect(0, 20, U, 6, '#8fa39c')].join(''));
  // 主ケーブル（歩ける）
  const cableBand = [[18, 36, '#6f807b'], [14, 28, '#c9d6d2'], [8, 8, '#f2f7f5']];
  tile('m/cable/semi', () => [
    rect(0, 0, U, 34, '#6f807b'), rect(0, 2, U, 26, '#c9d6d2'), rect(0, 4, U, 7, '#f2f7f5'),
    ...[20, 100].map(x => rect(x, 0, 12, 34, '#9fb2ad'))
  ].join(''));
  for (const k of Object.keys(SLOPES)) tile(`m/cable/${k}`, () => thinSlope(k, cableBand));
  // 点検用の鉄の通路
  tile('m/grating/semi', () => [
    rect(0, 0, U, 44, '#3f4a50'), rect(0, 4, U, 30, '#5c6b73'),
    ...Array.from({ length: 10 }, (_, i) => rect(4 + i * 16, 6, 7, 26, '#8fa1aa')),
    rect(0, 0, U, 5, '#b6c6cd'),
    rect(20, 44, 8, 30, '#3f4a50'), rect(132, 44, 8, 30, '#3f4a50')
  ].join(''));
  for (const k of Object.keys(SLOPES)) tile(`m/grating/${k}`, () => thinSlope(k, [[22, 40, '#3f4a50'], [18, 28, '#8fa1aa', { strokeDasharray: '8 6' }], [6, 6, '#b6c6cd']]));
}

// ========================================================================
// 六甲山（夜）：夜の草と土
// ========================================================================
{
  const S = { base: '#4b3a30', dark: '#3a2c24', light: '#5e4a3e', peb1: '#5e4c42', peb2: '#3e3029' };
  const cap = { h: 40, base: '#2f6e48', dark: '#1f4f33', light: '#57a86a' };
  const top = (v) => soil(S, 1910 + v, { pebbles: 3 }) + grassCap(cap, v) + (v === 1 ? [circ(40, 20, 3, '#d9ffb0', { opacity: 0.9 }), circ(40, 20, 8, '#d9ffb0', { opacity: 0.25 }), circ(120, 14, 2.4, '#d9ffb0', { opacity: 0.8 })].join('') : circ(90, 12, 2, '#bfe8ff', { opacity: 0.7 }));
  groundSet('rokko', v => soil(S, 1900 + v, { strata: true }), top, cap, { edge: 0.4 });
}

// ========================================================================
// 掬星台（夜）：石の広場
// ========================================================================
{
  const P = { colors: ['#6a6c7e', '#626476', '#727487', '#5e6072'], jitter: 0, round: 9, gap: 8 };
  const body = (v) => [rect(0, 0, U, U, '#3d3f4c'), masonry([{ y0: 0, y1: 80, joints: [70], edge: '#686a7c' }, { y0: 80, y1: 160, joints: [30, 110], edge: '#646678' }], P, 2000 + v)].join('');
  const cap = { h: 36, base: '#a3a5ba', dark: '#6a6c7e', light: '#d4d6e8' };
  const star = (x, y, r1, col) => poly([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r1 * 0.45 : r1; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; }), col);
  const top = (v) => [body(v + 3), rect(0, 34, U, 10, '#000000', { opacity: 0.25 }), rect(0, 0, U, 38, cap.dark), rect(0, 0, U, 32, cap.base), rect(0, 0, U, 5, cap.light),
    v === 1 ? star(80, 18, 10, '#ffe066') : ''].join('');
  groundSet('kikusei', body, top, cap, { edge: 0.35 });
  tile('t/kikusei/hard', () => [rect(0, 0, U, U, '#3d3f4c'), rrect(4, 4, 152, 150, 8, '#5b5f73'), rect(10, 10, 140, 8, '#8a8ca0'), star(80, 84, 44, '#ffe066'), star(76, 80, 20, '#fff6c2')].join(''));
  tile('t/kikusei/semi', () => [rect(0, 0, U, 60, '#3d3f4c'), rect(0, 0, U, 46, '#8a8ca0'), rect(0, 4, U, 8, '#b0b2c4'), rect(76, 0, 6, 46, '#5d5f70'), rect(20, 60, 12, 26, '#3d3f4c'), rect(128, 60, 12, 26, '#3d3f4c')].join(''));
}

// ========================================================================
// 水（場所ごとの色）
// ========================================================================
const WATERS2 = {
  zoo: ['#b9f0f5', '#4bb3c9', '#2b879c', '#ffffff'],
  falls: ['#e4f8fc', '#5fb8d6', '#2f86a8', '#ffffff'],
  suma: ['#b4f4fa', '#29b6d6', '#1283b0', '#ffffff'],
  maiko: ['#a8e4f7', '#2a8fcc', '#155f99', '#ffffff'],
  bridge: ['#9fd4f2', '#1f6fb0', '#0f4478', '#e9fbff']
};
for (const [th, c] of Object.entries(WATERS2)) for (let fr = 0; fr < 4; fr++) {
  water(`t/${th}/waterT${fr}`, c, fr, true);
  water(`t/${th}/water${fr}`, c, fr, false);
}
tile('t/suma/m/rock/hardT', () => [ell(80, 4, 74, 10, '#b8ad9c'), ell(60, 2, 30, 4, '#d8cfbf', { opacity: 0.9 })].join(''));
