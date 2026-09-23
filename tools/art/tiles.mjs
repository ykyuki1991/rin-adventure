// 地形タイル（16×16ドット）。座標は 0.1ドット単位（0〜160）
// 石垣・石だたみ・岸壁などは、となりのタイルとつながるように目地の位置をそろえてある
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from './svg.mjs';

const U = 160;
const tile = (name, draw) => sprite('tiles', name, 16, 16, 0, 0, defs => tr(0, 0, draw(defs), 0.1));

// ---------- 石の積み方 ----------
// courses: [{ y0, y1, joints: [x...], edge: 色 }]  joints の最初と最後はタイルのはしをまたぐ石の位置（全部のばらつきで同じにする）
function masonry(courses, o, seed) {
  const r = rng(seed);
  const out = [];
  const gap = o.gap ?? 7;
  for (const c of courses) {
    const xs = [0, ...c.joints, U];
    for (let i = 0; i < xs.length - 1; i++) {
      const edgeL = i === 0, edgeR = i === xs.length - 2;
      const x0 = xs[i] + (edgeL ? 0 : gap / 2), x1 = xs[i + 1] - (edgeR ? 0 : gap / 2);
      const y0 = c.y0 + gap / 2, y1 = c.y1 - gap / 2;
      if (x1 - x0 < 4) continue;
      const col = (edgeL || edgeR) ? (c.edge || o.colors[0]) : o.colors[Math.floor(r() * o.colors.length)];
      const j = o.jitter || 0;
      const jy = () => (r() - 0.5) * j;
      // 石の形（はしをまたぐ石は、はしの辺をまっすぐにする）
      const pts = [
        [x0, edgeL ? y0 : y0 + jy()], [x1, edgeR ? y0 : y0 + jy()],
        [x1, edgeR ? y1 : y1 + jy()], [x0, edgeL ? y1 : y1 + jy()]
      ];
      const rad = o.round ?? 10;
      let d;
      if (edgeL || edgeR) {
        // まっすぐな辺と丸いかどを組み合わせる
        const [a, b, cc, dd] = pts;
        const rr_ = Math.min(rad, (x1 - x0) / 2, (y1 - y0) / 2);
        if (edgeL && edgeR) d = `M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} L${f(cc[0])} ${f(cc[1])} L${f(dd[0])} ${f(dd[1])} Z`;
        else if (edgeL) d = `M${f(a[0])} ${f(a[1])} L${f(b[0] - rr_)} ${f(b[1])} Q${f(b[0])} ${f(b[1])} ${f(b[0])} ${f(b[1] + rr_)} L${f(cc[0])} ${f(cc[1] - rr_)} Q${f(cc[0])} ${f(cc[1])} ${f(cc[0] - rr_)} ${f(cc[1])} L${f(dd[0])} ${f(dd[1])} Z`;
        else d = `M${f(a[0] + rr_)} ${f(a[1])} L${f(b[0])} ${f(b[1])} L${f(cc[0])} ${f(cc[1])} L${f(dd[0] + rr_)} ${f(dd[1])} Q${f(dd[0])} ${f(dd[1])} ${f(dd[0])} ${f(dd[1] - rr_)} L${f(a[0])} ${f(a[1] + rr_)} Q${f(a[0])} ${f(a[1])} ${f(a[0] + rr_)} ${f(a[1])} Z`;
      } else d = roundPoly(pts, rad);
      out.push(path(d, shade(col, -0.18)));
      out.push(path(d, col, { transform: `translate(0 -2.5)` }));
      // 上の明るいふち
      const topY = Math.min(pts[0][1], pts[1][1]);
      out.push(rect(x0 + (edgeL ? 0 : 5), topY + 1, Math.max(0, x1 - x0 - (edgeL ? 0 : 5) - (edgeR ? 0 : 5)), 5, shade(col, 0.25), { opacity: 0.8 }));
      if (o.speck && x1 - x0 > 30) {
        for (let k = 0; k < 2; k++) out.push(circ(x0 + 8 + r() * (x1 - x0 - 16), y0 + 10 + r() * (y1 - y0 - 18), 2 + r() * 2, shade(col, -0.12), { opacity: 0.7 }));
      }
    }
  }
  return out.join('');
}

// 目地の位置をばらつかせる（はしの石は固定）
function joints(first, last, seed, minW, maxW) {
  const r = rng(seed);
  const out = [first];
  let x = first;
  while (true) {
    const w = minW + r() * (maxW - minW);
    if (x + w > last - minW * 0.8) break;
    x += w; out.push(Math.round(x));
  }
  out.push(last);
  return out;
}

// 坂の形（左はしの高さ, 右はしの高さ）
const SLOPES = { sR: [160, 0], sL: [0, 160], sRa: [160, 80], sRb: [80, 0], sLb: [0, 80], sLa: [80, 160] };

// 坂タイル: 本体を坂の線で切り抜き、上に縁石をのせる
function slopeTile(defs, kind, bodySvg, cap) {
  const [yl, yr] = SLOPES[kind];
  const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
  const th = cap.h;
  return [
    g(bodySvg, { 'clip-path': cp }),
    path(`M0 ${yl} L160 ${yr} L160 ${yr + th + 8} L0 ${yl + th + 8} Z`, '#000000', { opacity: 0.18 }),
    path(`M0 ${yl} L160 ${yr} L160 ${yr + th} L0 ${yl + th} Z`, cap.dark),
    path(`M0 ${yl} L160 ${yr} L160 ${yr + th - 6} L0 ${yl + th - 6} Z`, cap.base),
    path(`M0 ${yl + 1.5} L160 ${yr + 1.5}`, 'none', { stroke: cap.light, strokeWidth: 3 })
  ].join('');
}

// ========================================================================
// 八雲通・春日野道：石垣（ランダムな石）＋ 歩道の縁石、ツタ
// ========================================================================
{
  const P = { colors: ['#a3a8ae', '#979ca3', '#b0b4b9', '#8e949b', '#a9a39a'], jitter: 10, round: 12, speck: true };
  const mortar = '#6f747c';
  const C1 = { y0: 0, y1: 80, edge: '#9da2a9' }, C2 = { y0: 80, y1: 160, edge: '#a6a29b' };
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ ...C1, joints: joints(34, 132, 11 + v, 36, 62) }, { ...C2, joints: joints(66, 150, 23 + v, 34, 60) }], P, 100 + v)
  ].join('');
  const cap = { h: 40, base: '#d8d2c6', dark: '#a89f90', light: '#f3efe8' };
  for (let v = 0; v < 3; v++) tile(`t/yakumo/g/body${v}`, () => body(v));
  // 上の段：歩道の縁石＋石
  const top = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 40, y1: 100, edge: '#9da2a9', joints: joints(20, 118, 51 + v, 34, 56) }, { y0: 100, y1: 160, edge: '#a6a29b', joints: joints(66, 150, 61 + v, 34, 60) }], P, 300 + v),
    rect(0, 40, U, 12, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 42, cap.dark),
    rect(0, 0, U, 36, cap.base),
    rect(0, 0, U, 5, cap.light),
    rect(79, 5, 2.5, 31, '#b9b1a3'),
    circ(40, 20, 2, '#c4bcaf'), circ(122, 14, 1.6, '#c4bcaf'),
    // ツタ
    v === 1 ? g([
      path('M96 40 Q92 70 100 96', 'none', { stroke: '#3d7a32', strokeWidth: 3 }),
      ...[[92, 50, -20], [102, 60, 20], [94, 74, -30], [104, 86, 25], [98, 98, 0], [110, 52, 30], [86, 62, -40]].map(([x, y, a]) => ell(x, y, 9, 6, a > 0 ? '#5aa84a' : '#4b9a3f', { rot: a })),
      ...[[88, 46], [106, 70], [96, 88]].map(([x, y]) => ell(x, y, 5, 3.4, '#8ed07a', { rot: -30 }))
    ]) : ''
  ].join('');
  for (let v = 0; v < 2; v++) tile(`t/yakumo/g/top${v}`, () => top(v));
  tile('t/yakumo/g/edgeL', defs => rect(0, 0, 26, U, defs.lin([[0, '#000000', 0.35], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/yakumo/g/edgeR', defs => rect(134, 0, 26, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.35]], 0, 0, 1, 0)));
  tile('t/yakumo/g/topL', () => [rect(0, 0, 10, 42, cap.dark), rect(0, 0, 6, 36, '#c9c2b5')].join(''));
  tile('t/yakumo/g/topR', () => [rect(150, 0, 10, 42, cap.dark), rect(154, 0, 6, 36, '#c9c2b5')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/yakumo/g/${k}`, defs => slopeTile(defs, k, body(k.length), cap));
  // 石のブロック（階段）
  tile('t/yakumo/hard', () => [
    rrect(0, 0, U, U, 10, '#8a8f96'), rrect(4, 4, 152, 150, 8, '#bfc2c6'),
    path('M10 10 L150 10 L140 22 L22 22 L22 140 L10 150 Z', '#d9dbde'),
    path('M150 10 L150 150 L10 150 L22 140 L140 140 L140 22 Z', '#a4a8ae'),
    circ(60, 70, 3, '#aeb2b7'), circ(110, 100, 2.5, '#aeb2b7')
  ].join(''));
}

// ========================================================================
// 北野：切り石の石だたみ（明るい灰色）＋ 石のふち
// ========================================================================
{
  const P = { colors: ['#c3c4c3', '#b7b9ba', '#cdcbc6', '#b1b4b7'], jitter: 0, round: 9, speck: true, gap: 8 };
  const mortar = '#8d9093';
  const body = (v) => {
    const r = rng(700 + v);
    return [
      rect(0, 0, U, U, mortar),
      masonry([
        { y0: 0, y1: 80, joints: [80], edge: '#bfc1c1' },
        { y0: 80, y1: 160, joints: [40, 120], edge: '#c6c5c1' }
      ], { ...P, colors: [P.colors[Math.floor(r() * 4)], P.colors[Math.floor(r() * 4)]] }, 710 + v),
      // 苔
      v === 2 ? g([ell(30, 150, 18, 6, '#6f9f55', { opacity: 0.7 }), ell(44, 152, 10, 4, '#88b86a', { opacity: 0.7 })]) : ''
    ].join('');
  };
  const cap = { h: 36, base: '#e4ddd0', dark: '#aaa293', light: '#f7f3eb' };
  for (let v = 0; v < 3; v++) tile(`t/kitano/g/body${v}`, () => body(v));
  const top = (v) => [
    body(v + 3),
    rect(0, 36, U, 12, '#000000', { opacity: 0.2 }),
    rect(0, 0, U, 38, cap.dark), rect(0, 0, U, 32, cap.base), rect(0, 0, U, 5, cap.light),
    rect(0, 5, 3, 27, '#cbc3b4'), rect(157, 5, 3, 27, '#cbc3b4'),
    v === 1 ? g([
      // 花の植え込み（ふちの手前）
      ...[[30, 50], [44, 56], [58, 48]].map(([x, y]) => ell(x, y, 12, 8, '#5f9e4c')),
      circ(34, 44, 4, '#ff8fb0'), circ(50, 50, 3.5, '#fff27a'), circ(58, 42, 4, '#ffffff')
    ]) : ''
  ].join('');
  for (let v = 0; v < 2; v++) tile(`t/kitano/g/top${v}`, () => top(v));
  tile('t/kitano/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/kitano/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tile('t/kitano/g/topL', () => [rect(0, 0, 10, 38, cap.dark), rect(0, 0, 6, 32, '#d6cebf')].join(''));
  tile('t/kitano/g/topR', () => [rect(150, 0, 10, 38, cap.dark), rect(154, 0, 6, 32, '#d6cebf')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/kitano/g/${k}`, defs => slopeTile(defs, k, body(k.length % 3), cap));
  // レンガのかべブロック（北野の石段のわき）
  tile('t/kitano/hard', () => brickWall('#b9553d', '#d97a5c', '#8a3a26', '#e8cdb6'));
}

// レンガのかべ（4段）
function brickWall(base, light, dark, mortar, lit) {
  const out = [rect(0, 0, U, U, mortar)];
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 40 : 0;
    for (let x = off - 80; x < U; x += 80) {
      const x0 = Math.max(0, x + 3), x1 = Math.min(U, x + 77);
      if (x1 - x0 < 6) continue;
      const y = row * 40;
      const tint = ((x + row * 37) * 13) % 3;
      const c = tint === 0 ? base : tint === 1 ? shade(base, 0.06) : shade(base, -0.06);
      out.push(rect(x0, y + 3, x1 - x0, 34, c));
      out.push(rect(x0, y + 3, x1 - x0, 6, light, { opacity: 0.8 }));
      out.push(rect(x0, y + 30, x1 - x0, 7, dark, { opacity: 0.55 }));
    }
  }
  return out.join('');
}

// ========================================================================
// メリケンパーク：岸壁（大きな石のブロック）＋ 黒い防げん材
// ========================================================================
{
  const P = { colors: ['#8f96a3', '#98a0ad', '#878e9b'], jitter: 0, round: 8, gap: 8 };
  const mortar = '#5d6472';
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 80, joints: [60], edge: '#939aa7' }, { y0: 80, y1: 160, joints: [20, 120], edge: '#8b92a0' }], P, 900 + v),
    // 夕日の照り返し
    rect(0, 0, U, U, '#ffb07a', { opacity: 0.06 })
  ].join('');
  for (let v = 0; v < 3; v++) tile(`t/meriken/g/body${v}`, () => body(v));
  const cap = { h: 34, base: '#c9c4bd', dark: '#8d8a86', light: '#f4d7b8' };
  const top = (v) => [
    body(v),
    rect(0, 34, U, 12, '#000000', { opacity: 0.25 }),
    rect(0, 0, U, 36, cap.dark), rect(0, 0, U, 30, cap.base), rect(0, 0, U, 5, cap.light),
    rect(0, 5, 2.5, 25, '#a9a49d')
  ].join('');
  for (let v = 0; v < 2; v++) tile(`t/meriken/g/top${v}`, () => top(v));
  tile('t/meriken/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.35], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/meriken/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.35]], 0, 0, 1, 0)));
  tile('t/meriken/g/topL', () => [rect(0, 0, 10, 36, cap.dark), rect(0, 0, 6, 30, '#b6b1aa')].join(''));
  tile('t/meriken/g/topR', () => [rect(150, 0, 10, 36, cap.dark), rect(154, 0, 6, 30, '#b6b1aa')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/meriken/g/${k}`, defs => slopeTile(defs, k, body(0), cap));
  // 防げん材（岸壁の黒いゴム）: 数マスごとに縦に重ねる
  tile('t/meriken/g/col', () => [
    rrect(46, 0, 68, 160, 14, '#1e2230'), rrect(52, 0, 22, 160, 8, '#3a3f52'),
    path('M80 60 L80 100', 'none', { stroke: '#11141d', strokeWidth: 3 })
  ].join(''));
  tile('t/meriken/g/colTop', () => [
    rrect(46, 44, 68, 130, 14, '#1e2230'), rrect(52, 48, 22, 120, 8, '#3a3f52'),
    rect(40, 40, 80, 10, '#5b6070'),
    path('M80 50 Q70 90 84 120 Q94 140 78 160', 'none', { stroke: '#4a4f60', strokeWidth: 5, strokeDasharray: '8 5' })
  ].join(''));
}

// ========================================================================
// ハーバーランド（夜）：レンガの広場＋レンガのかべ
// ========================================================================
{
  const body = (v) => {
    const out = [brickWall('#7d4235', '#9b5a49', '#4e2820', '#3b2a2b')];
    out.push(rect(0, 0, U, U, '#1b2350', { opacity: 0.18 }));
    if (v === 1) out.push(ell(80, 40, 50, 30, '#ffc070', { opacity: 0.08 }));
    return out.join('');
  };
  for (let v = 0; v < 2; v++) tile(`t/harborland/g/body${v}`, () => body(v));
  const cap = { h: 34, base: '#a36a55', dark: '#5c3a30', light: '#e6a978' };
  const top = (v) => [
    body(v),
    rect(0, 34, U, 12, '#000000', { opacity: 0.3 }),
    rect(0, 0, U, 36, cap.dark), rect(0, 0, U, 30, cap.base),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + (v ? 20 : 0) - 1, 4, 2, 26, '#7a4c3f')),
    rect(0, 0, U, 4, cap.light, { opacity: 0.9 })
  ].join('');
  for (let v = 0; v < 2; v++) tile(`t/harborland/g/top${v}`, () => top(v));
  tile('t/harborland/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.4], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/harborland/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.4]], 0, 0, 1, 0)));
  for (const k of Object.keys(SLOPES)) tile(`t/harborland/g/${k}`, defs => slopeTile(defs, k, body(0), cap));
}

// ========================================================================
// 水（場所ごとに色がちがう）
// ========================================================================
function water(name, c, frame, top) {
  tile(name, defs => {
    const ph = frame * Math.PI / 2;
    const out = [rect(0, 0, U, U, defs.lin([[0, c[1]], [1, c[2]]]))];
    if (top) {
      let d = `M0 160 L0 ${60 + Math.sin(ph) * 10}`;
      for (let x = 0; x <= 160; x += 10) d += ` L${x} ${f(60 + Math.sin(x / 160 * Math.PI * 2 + ph) * 10)}`;
      d += ' L160 160 Z';
      out[0] = rect(0, 0, U, U, 'none');
      out.push(path(d, c[1]));
      let d2 = `M0 ${f(60 + Math.sin(ph) * 10)}`;
      for (let x = 0; x <= 160; x += 10) d2 += ` L${x} ${f(60 + Math.sin(x / 160 * Math.PI * 2 + ph) * 10)}`;
      out.push(path(d2, 'none', { stroke: c[0], strokeWidth: 10, strokeLinecap: 'round' }));
      out.push(path(d2, 'none', { stroke: '#ffffff', strokeWidth: 3, opacity: 0.7, strokeDasharray: '14 20', strokeDashoffset: -frame * 8 }));
      out.push(rect(0, 100, U, 60, c[2], { opacity: 0.35 }));
    }
    // きらめき
    const r = rng(40 + frame);
    for (let i = 0; i < 3; i++) {
      const x = (i * 57 + frame * 16) % 150, y = (top ? 90 : 20) + ((i * 43) % (top ? 60 : 130));
      out.push(rrect(x, y, 22, 4, 2, c[3] || '#ffffff', { opacity: 0.35 + r() * 0.2 }));
    }
    return out.join('');
  });
}
const WATERS = {
  default: ['#8fe0f5', '#3fa9dc', '#1d6fa8', '#e9fbff'],
  meriken: ['#b9a9e8', '#4c5ea8', '#28336e', '#ffc48a'],
  harborland: ['#6f86d6', '#1f2d66', '#0d163a', '#ffd98a']
};
for (const [th, c] of Object.entries(WATERS)) for (let fr = 0; fr < 4; fr++) {
  const pre = th === 'default' ? 'water/' : `t/${th}/`;
  water(`${pre}waterT${fr}`, c, fr, true);
  water(`${pre}water${fr}`, c, fr, false);
}

// ========================================================================
// 素材（家のかべ・屋根・木・アーケード・駅・コンテナ）
// ========================================================================
const WIN = (frame, glass, lit, arch) => {
  const gl = lit ? '#ffd98a' : glass;
  if (arch) return [
    path('M34 150 L34 70 Q34 30 80 30 Q126 30 126 70 L126 150 Z', frame),
    path('M46 142 L46 72 Q46 42 80 42 Q114 42 114 72 L114 142 Z', gl),
    rect(76, 40, 8, 104, frame), rect(46, 88, 68, 7, frame),
    lit ? '' : path('M52 70 Q56 50 72 46 L60 90 L52 90 Z', '#ffffff', { opacity: 0.45 }),
    rect(28, 146, 104, 10, shade(frame, -0.1))
  ].join('');
  return [
    rect(30, 26, 100, 118, frame), rect(40, 36, 80, 98, gl),
    rect(76, 34, 8, 102, frame), rect(38, 80, 84, 7, frame),
    lit ? '' : path('M44 40 L66 40 L44 76 Z', '#ffffff', { opacity: 0.45 }),
    rect(24, 140, 112, 10, shade(frame, -0.12))
  ].join('');
};

// うろこの家（うろこ形の石の外壁）
function urokoWall(extra = '') {
  const out = [rect(0, 0, U, U, '#8697a8')];
  for (let row = 0; row < 7; row++) {
    const y = row * 26 - 6;
    for (let x = (row % 2) * 20 - 20; x < U + 20; x += 40) {
      out.push(path(`M${x} ${y} Q${x} ${y + 30} ${x + 20} ${y + 32} Q${x + 40} ${y + 30} ${x + 40} ${y} Z`, row % 3 === 1 ? '#9fb0c1' : '#93a4b6'));
      out.push(path(`M${x + 3} ${y + 2} Q${x + 4} ${y + 22} ${x + 20} ${y + 26}`, 'none', { stroke: '#c3d0dc', strokeWidth: 3, opacity: 0.7 }));
    }
  }
  return out.join('') + extra;
}
tile('m/uroko/hard', () => urokoWall());
tile('m/urokowin/hard', () => urokoWall(WIN('#f4f1ea', '#78b6de', false, false)));

// 風見鶏の館・レンガ倉庫
tile('m/brick/hard', () => brickWall('#c0583f', '#e07e62', '#8e3a28', '#ecd3bf'));
tile('m/brickwin/hard', () => brickWall('#c0583f', '#e07e62', '#8e3a28', '#ecd3bf') + WIN('#f6f1e8', '#6fb1db', false, true));
tile('t/harborland/m/brick/hard', () => brickWall('#8a4636', '#a85e4a', '#55291e', '#6b4a40'));
const hCornice = () => [rect(0, 0, 160, 30, '#3a2620'), rect(0, 0, 160, 22, '#8a6a5a'), rect(0, 0, 160, 6, '#c79a7e'), ...[0, 1, 2, 3].map(k => rect(k * 40 + 14, 30, 12, 10, '#3a2620')), rect(0, 40, 160, 6, '#000000', { opacity: 0.25 }), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => circ(10 + k * 20, 14, 3, ['#ffe9a8', '#ff9ab8', '#9ad7ff'][k % 3]))].join('');
tile('t/harborland/m/brick/hardT', hCornice);
tile('t/harborland/m/brickwin/hardT', hCornice);
tile('t/harborland/m/brickwin/hard', () => brickWall('#8a4636', '#a85e4a', '#55291e', '#6b4a40') + WIN('#d9c7a8', '#6fb1db', true, true) + ell(80, 90, 70, 60, '#ffcf7a', { opacity: 0.12 }));

// 萌黄の館（うすい緑の板張り）
function moegi(extra = '') {
  const out = [rect(0, 0, U, U, '#b7d9a6')];
  for (let y = 0; y < U; y += 32) {
    out.push(rect(0, y, U, 26, '#c5e3b5'));
    out.push(rect(0, y + 26, U, 6, '#94bd82'));
    out.push(rect(0, y, U, 4, '#dff0d4'));
  }
  out.push(rect(0, 0, 8, U, '#f3f1e6'), rect(152, 0, 8, U, '#f3f1e6'));
  return out.join('') + extra;
}
tile('m/moegi/hard', () => moegi());
tile('m/moegiwin/hard', () => moegi(WIN('#ffffff', '#7fbfe0', false, false)));

// 屋根（坂と中身）
const ROOFS = { roof: ['#b8513a', '#8a3524', '#e0826a'], roofK: ['#5b6678', '#3c4454', '#8d99ad'], roofG: ['#4f8f73', '#316651', '#86c7a5'], roofO: ['#d88a45', '#a2602a', '#f4b67a'] };
for (const [name, [base, dark, light]] of Object.entries(ROOFS)) {
  const fill = () => {
    const out = [rect(0, 0, U, U, base)];
    for (let y = 0; y < U; y += 32) {
      out.push(rect(0, y + 24, U, 8, dark));
      for (let x = (y / 32) % 2 ? 20 : 0; x < U; x += 40) out.push(rect(x, y, 3, 26, dark, { opacity: 0.6 }));
      out.push(rect(0, y, U, 4, light, { opacity: 0.5 }));
    }
    return out.join('');
  };
  tile(`m/${name}/hard`, fill);
  for (const k of Object.keys(SLOPES)) tile(`m/${name}/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    return [
      g(fill(), { 'clip-path': cp }),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 16} L0 ${yl + 16} Z`, dark),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 9} L0 ${yl + 9} Z`, light)
    ].join('');
  });
}

// 木（階段の木箱・木の足場）
tile('m/wood/hard', () => [
  rrect(0, 0, U, U, 10, '#7b4c28'), rrect(6, 6, 148, 146, 8, '#b98150'),
  ...[0, 1, 2].map(i => rect(6, 12 + i * 48, 148, 5, '#d4a06c', { opacity: 0.8 })),
  ...[0, 1, 2].map(i => rect(6, 48 + i * 48, 148, 4, '#8b5a30', { opacity: 0.7 })),
  circ(20, 20, 5, '#6a4020'), circ(140, 20, 5, '#6a4020'), circ(20, 140, 5, '#6a4020'), circ(140, 140, 5, '#6a4020')
].join(''));
tile('m/wood/semi', () => [
  rrect(0, 0, U, 56, 8, '#7b4c28'), rrect(0, 0, U, 46, 8, '#b98150'),
  rect(0, 4, U, 6, '#d9a674'), rect(52, 0, 3, 46, '#8b5a30'), rect(108, 0, 3, 46, '#8b5a30'),
  rect(20, 56, 12, 24, '#6a4020', { opacity: 0.9 }), rect(128, 56, 12, 24, '#6a4020', { opacity: 0.9 })
].join(''));

// 商店街のアーケード屋根（ガラス）
tile('m/arcade/semi', () => [
  rect(0, 0, U, 50, '#dff4fb', { opacity: 0.92 }),
  path('M0 50 Q80 20 160 50', 'none', { stroke: '#b9dde9', strokeWidth: 6 }),
  rect(0, 44, U, 14, '#6f8d98'), rect(0, 0, U, 8, '#6f8d98'),
  rect(76, 0, 8, 50, '#6f8d98'),
  path('M14 16 L40 16 L22 38 Z', '#ffffff', { opacity: 0.8 }), path('M94 16 L120 16 L102 38 Z', '#ffffff', { opacity: 0.8 }),
  rect(0, 58, U, 6, '#000000', { opacity: 0.15 })
].join(''));

// 駅のホーム（黄色い点字ブロック）
tile('m/platform/hard', () => [
  rect(0, 0, U, U, '#b9b5ad'), rect(0, 0, U, 12, '#e9e5dc'),
  rect(0, 18, U, 26, '#f2c230'), ...[0, 1, 2, 3, 4, 5, 6].map(i => circ(12 + i * 23, 31, 4, '#d9a816')),
  rect(0, 50, U, 6, '#8e8a82'), rect(0, 150, U, 10, '#8e8a82'),
  rect(79, 56, 2, 94, '#a5a198')
].join(''));
// 高架（線路の下のコンクリート）
tile('m/rail/hard', () => [
  rect(0, 0, U, U, '#c7c1b6'), rect(0, 0, U, 22, '#77726a'), rect(0, 22, U, 8, '#a39d92'),
  rect(0, 130, U, 30, '#b0a99c'), rect(0, 128, U, 4, '#d9d3c8'),
  circ(40, 80, 3, '#b8b1a5'), circ(120, 60, 2.5, '#b8b1a5')
].join(''));

// コンテナ（3マスで1個。色は4種類、はしに枠）
const CONT = [['#d9483b', '#a92f25', '#f07a6c'], ['#2f6fb8', '#1f4d86', '#5b95d8'], ['#3a9a62', '#276e45', '#63c28a'], ['#e0892b', '#a8611a', '#f4ab5a']];
CONT.forEach(([base, dark, light], i) => tile(`m/container/c${i}`, () => [
  rect(0, 0, U, U, base),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => rect(6 + k * 20, 0, 8, U, dark, { opacity: 0.55 })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => rect(6 + k * 20, 0, 3, U, light, { opacity: 0.5 }))
].join('')));
tile('m/container/L', () => [rect(0, 0, 12, U, '#000000', { opacity: 0.35 }), rect(0, 0, 4, U, '#ffffff', { opacity: 0.25 })].join(''));
tile('m/container/R', () => rect(148, 0, 12, U, '#000000', { opacity: 0.4 }));
tile('m/container/T', () => [rect(0, 0, U, 12, '#000000', { opacity: 0.3 }), rect(0, 0, U, 4, '#ffffff', { opacity: 0.35 })].join(''));
tile('m/container/B', () => rect(0, 146, U, 14, '#000000', { opacity: 0.35 }));

// 土管（緑）
for (const k of ['pipeTL', 'pipeTR', 'pipeL', 'pipeR']) tile(`pipe/${k}`, () => {
  const left = k.endsWith('L'), top = k.startsWith('pipeT');
  const base = '#3fbf6a', light = '#a7efc0', dark = '#1f8a45';
  if (top) return [
    rrect(left ? 4 : -20, 4, 176, 120, 14, dark),
    rect(left ? 8 : 0, 8, left ? 152 : 150, 108, base),
    left ? rect(30, 14, 26, 96, light, { opacity: 0.85 }) : rect(100, 14, 30, 96, dark, { opacity: 0.6 }),
    rect(0, 124, U, 36, dark, { opacity: 0.4 }),
    rect(left ? 20 : 0, 124, left ? 140 : 140, 36, base),
    left ? rect(40, 124, 18, 36, light, { opacity: 0.7 }) : rect(96, 124, 24, 36, dark, { opacity: 0.5 })
  ].join('');
  return [
    rect(left ? 14 : 0, 0, left ? 146 : 146, U, dark),
    rect(left ? 20 : 0, 0, 140, U, base),
    left ? rect(40, 0, 18, U, light, { opacity: 0.7 }) : rect(96, 0, 24, U, dark, { opacity: 0.5 })
  ].join('');
});

// 深い地面を少し暗くする（ごちゃごちゃして見えないように）
tile('deep1', () => rect(0, 0, U, U, '#141a2e', { opacity: 0.16 }));
tile('deep2', () => rect(0, 0, U, U, '#141a2e', { opacity: 0.3 }));
tile('deep3', () => rect(0, 0, U, U, '#141a2e', { opacity: 0.42 }));

// ひび（こわれる地面）
tile('crack', () => path('M40 60 L70 86 L60 110 L92 132 M70 86 L100 80', 'none', { stroke: '#000000', strokeWidth: 5, opacity: 0.35, strokeLinecap: 'round', strokeLinejoin: 'round' }));
// トゲ
tile('spike', () => [
  rect(0, 130, U, 30, '#6c7686'), rect(0, 130, U, 6, '#9aa4b2'),
  ...[0, 1, 2].map(i => { const x = i * 53.3; return poly([[x + 3, 130], [x + 26.7, 50], [x + 50, 130]], '#c9d0d8') + poly([[x + 12, 130], [x + 26.7, 56], [x + 26.7, 130]], '#f4f7fa'); })
].join(''));
