// 新しい敵（イノシシ・ペンギン・クラゲ・ちょうちんおばけ・タコ）と新しいアイテム
// 座標は 0.1ドット単位、足元のまん中が (0,0)、右向きで描く
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, shade } from './svg.mjs';

const INK = '#241a2e';
const stroke = (c, w, o = {}) => ({ stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', ...o });

function eye(x, y, rx, ry, o = {}) {
  const out = [ell(x, y, rx, ry, '#ffffff'), ell(x + rx * 0.3, y + ry * 0.12, rx * 0.6, ry * 0.64, o.pupil || INK), circ(x + rx * 0.45, y - ry * 0.2, rx * 0.22, '#ffffff')];
  if (o.angry) out.push(path(`M${x - rx * 1.2} ${y - ry * 1.5} L${x + rx * 1.1} ${y - ry * 0.95}`, 'none', stroke(o.brow || INK, ry * 0.34)));
  if (o.tired) out.push(path(`M${x - rx} ${y - ry * 0.2} L${x + rx} ${y - ry * 0.2}`, 'none', stroke(INK, ry * 0.3)));
  return out.join('');
}

// ===================== イノシシ =====================
const BOAR = { dark: '#4e3829', body: '#7a583f', light: '#a07a58', belly: '#b99676', snout: '#e6b49c', mane: '#3e2c20' };
function boar(step, mode) {
  const C = BOAR;
  const out = [];
  const charge = mode === 'charge', ready = mode === 'ready', rest = mode === 'rest';
  // 走るときのけむり
  if (charge) out.push(circ(-112, -18, 16, '#d9d2c4', { opacity: 0.8 }), circ(-132, -30, 11, '#e6e0d4', { opacity: 0.7 }), circ(-96, -8, 10, '#d9d2c4', { opacity: 0.7 }));
  // あし（奥）
  const legs = (xs, c, k) => xs.map((x, i) => {
    const sw = (i % 2 ? step : -step) * (charge ? 14 : 7);
    return path(`M${x} -40 L${x + sw} -4`, 'none', stroke(c, 17)) + ell(x + sw + 2, -4, 11, 6, '#2a1d14');
  }).join('');
  out.push(legs([-44, 34], C.dark));
  // しっぽ
  out.push(path('M-92 -66 Q-112 -74 -106 -88 Q-100 -96 -94 -86', 'none', stroke(C.dark, 6)));
  // 体
  out.push(ell(-6, -58, 92, 46, C.dark));
  out.push(ell(-8, -62, 86, 40, C.body));
  out.push(ell(4, -34, 60, 14, C.belly, { opacity: 0.8 }));
  out.push(ell(-30, -82, 40, 12, C.light, { opacity: 0.6, rot: -6 }));
  // せなかの毛
  out.push(path('M-86 -80 L-78 -100 L-66 -86 L-56 -108 L-42 -92 L-30 -112 L-16 -96 L-2 -114 L10 -98 L22 -112 L32 -94 L20 -86 L-80 -74 Z', C.mane));
  // 頭
  out.push(ell(56, -58, 44, 36, C.dark));
  out.push(ell(56, -62, 40, 32, C.body));
  out.push(path('M30 -90 L20 -122 L52 -96 Z', C.dark), path('M31 -94 L25 -114 L45 -97 Z', '#c98f7a'));
  // 鼻
  out.push(ell(96, -46, 20, 22, shade(C.snout, -0.2)), ell(98, -48, 17, 19, C.snout));
  out.push(ell(94, -52, 3.5, 6, '#6e3b2a'), ell(104, -50, 3.5, 6, '#6e3b2a'));
  // きば
  out.push(path('M82 -30 Q90 -26 94 -40 Q88 -36 84 -38 Z', '#fbf7ee'));
  // 目
  if (rest) out.push(path('M58 -74 Q66 -68 74 -74', 'none', stroke(INK, 4)));
  else out.push(eye(64, -72, 9, 11, { angry: charge || ready }));
  // ほっぺ
  out.push(ell(74, -52, 9, 5, '#e88d7a', { opacity: 0.5 }));
  // あし（手前）
  out.push(legs([-24, 54], C.body));
  if (rest) out.push(path('M118 -64 Q128 -70 124 -80 M126 -54 Q138 -56 138 -66', 'none', stroke('#ffffff', 3.5, { opacity: 0.9 })));
  if (ready) out.push(path('M-60 -4 L-80 -18 M-50 -4 L-58 -24', 'none', stroke('#d9d2c4', 5)));
  return out.join('');
}
sprite('enemies', 'boar/0', 28, 17, 13, 16, () => tr(13, 16, boar(1, 'walk'), 0.1));
sprite('enemies', 'boar/1', 28, 17, 13, 16, () => tr(13, 16, boar(-1, 'walk'), 0.1));
sprite('enemies', 'boar/ready', 28, 17, 13, 16, () => tr(13, 16, boar(0.4, 'ready'), 0.1));
sprite('enemies', 'boar/run0', 30, 17, 15, 16, () => tr(15, 16, tr(0, 0, boar(1.2, 'charge'), 1, 4), 0.1));
sprite('enemies', 'boar/run1', 30, 17, 15, 16, () => tr(15, 16, tr(0, 0, boar(-1.2, 'charge'), 1, 4), 0.1));
sprite('enemies', 'boar/rest', 28, 17, 13, 16, () => tr(13, 16, boar(0, 'rest'), 0.1));
sprite('enemies', 'boar/flat', 22, 8, 11, 7, () => tr(11, 7, [
  ell(0, -18, 96, 22, BOAR.dark), ell(0, -22, 90, 18, BOAR.body),
  ell(84, -18, 16, 12, BOAR.snout),
  path('M36 -30 L50 -18 M50 -30 L36 -18', 'none', stroke(INK, 4))
], 0.1));

// ===================== ペンギン（フンボルトペンギン） =====================
const PEN = { body: '#2b3350', dark: '#1a2036', belly: '#ffffff', beak: '#f2a93a', foot: '#f59a42', pink: '#f59aa6' };
function penguinStand(step) {
  const C = PEN;
  return [
    // 足
    ell(-18 + step * 6, -4, 20, 8, C.foot), ell(22 - step * 6, -4, 20, 8, C.foot),
    // 体
    path('M0 -176 C-44 -176 -62 -120 -62 -70 C-62 -26 -36 -6 0 -6 C36 -6 62 -26 62 -70 C62 -120 44 -176 0 -176 Z', C.body),
    // おなか
    path('M16 -126 C-18 -120 -38 -90 -38 -60 C-38 -30 -18 -14 8 -14 C34 -14 48 -34 48 -66 C48 -100 38 -124 16 -126 Z', C.belly),
    // 胸の黒い帯（フンボルトペンギンのしるし）
    path('M-36 -84 Q8 -104 48 -90 L48 -80 Q8 -94 -36 -74 Z', C.body),
    // 顔の白いすじ
    path('M-10 -160 Q30 -170 40 -140 Q42 -128 34 -122 Q30 -148 -8 -150 Z', C.belly),
    // 目・くちばし・ピンク
    eye(22, -142, 8, 9),
    ell(38, -128, 8, 5, C.pink, { opacity: 0.9 }),
    path('M40 -140 L74 -130 L40 -122 Z', C.beak), path('M40 -130 L74 -130 L40 -122 Z', shade(C.beak, -0.2)),
    // つばさ
    path(`M-40 -110 Q${-78 - step * 6} -70 ${-58 - step * 8} -40 Q-44 -64 -36 -96 Z`, C.dark),
    ell(-18, -150, 12, 7, '#ffffff', { opacity: 0.25, rot: -30 })
  ].join('');
}
sprite('enemies', 'penguin/0', 18, 19, 9, 18, () => tr(9, 18, tr(0, 0, penguinStand(1), 1, -6), 0.1));
sprite('enemies', 'penguin/1', 18, 19, 9, 18, () => tr(9, 18, tr(0, 0, penguinStand(-1), 1, 6), 0.1));
sprite('enemies', 'penguin/slide', 26, 12, 13, 11, () => tr(13, 11, [
  // スピードの線
  ...[[-120, -70, 40], [-130, -40, 30], [-116, -16, 26]].map(([x, y, l]) => path(`M${x} ${y} L${x + l} ${y}`, 'none', stroke('#ffffff', 4, { opacity: 0.8 }))),
  ell(-90, -30, 16, 8, PEN.foot, { rot: 20 }), ell(-94, -18, 16, 8, PEN.foot, { rot: -10 }),
  path('M-86 -40 C-86 -86 -20 -96 40 -90 C96 -84 116 -60 116 -40 C116 -14 70 -4 10 -4 C-50 -4 -86 -14 -86 -40 Z', PEN.body),
  path('M-70 -16 C-30 -2 60 -2 104 -24 C96 -8 60 0 10 0 C-40 0 -66 -6 -70 -16 Z', PEN.belly),
  path('M60 -86 Q100 -84 108 -56 Q90 -74 58 -74 Z', PEN.belly),
  eye(86, -64, 8, 9),
  path('M110 -58 L140 -48 L110 -42 Z', PEN.beak),
  path('M-20 -84 Q-60 -110 -80 -100 Q-54 -86 -30 -72 Z', PEN.dark)
], 0.1));
sprite('enemies', 'penguin/flat', 20, 8, 10, 7, () => tr(10, 7, [
  ell(0, -18, 80, 20, PEN.body), ell(6, -18, 56, 12, PEN.belly),
  path('M60 -24 L84 -18 L60 -12 Z', PEN.beak),
  path('M22 -30 L36 -18 M36 -30 L22 -18', 'none', stroke(INK, 4))
], 0.1));

// ===================== クラゲ =====================
function jelly(k) {
  const sq = k ? 1.1 : 0.94, h = k ? 0.88 : 1.06;
  const out = [];
  // 足（ゆらゆら）
  const tent = [-40, -16, 12, 36];
  tent.forEach((x, i) => {
    const w = (i % 2 ? 1 : -1) * (k ? 10 : -10);
    out.push(path(`M${x * sq} -86 Q${x + w} -60 ${x - w * 0.6} -38 Q${x + w} -18 ${x - w * 0.3} -2`, 'none', stroke(i % 2 ? '#e79ad6' : '#c98ee8', 6, { opacity: 0.85 })));
  });
  out.push(path(`M-18 -86 Q-26 -60 -12 -46 M18 -86 Q10 -58 22 -48`, 'none', stroke('#ffffff', 9, { opacity: 0.7 })));
  // かさ
  const top = -86 - 90 * h, R = 72 * sq;
  const bell = `M${-R} -86 C${-R} ${top + 10} ${-R * 0.5} ${top} 0 ${top} C${R * 0.5} ${top} ${R} ${top + 10} ${R} -86 ` +
    `Q${R * 0.75} -74 ${R * 0.5} -86 Q${R * 0.25} -74 0 -86 Q${-R * 0.25} -74 ${-R * 0.5} -86 Q${-R * 0.75} -74 ${-R} -86 Z`;
  out.push(path(bell, '#ffffff', { opacity: 0.55, transform: 'translate(0 3) scale(1.06 1.02)' }));
  out.push(path(bell, '#f2b3e4', { opacity: 0.92 }));
  out.push(ell(0, -100, R * 0.7, 20, '#e08fd0', { opacity: 0.55 }));
  out.push(ell(-R * 0.42, top + 40, 16, 22, '#ffffff', { opacity: 0.75, rot: -25 }));
  out.push(circ(R * 0.35, top + 30, 7, '#ffffff', { opacity: 0.8 }), circ(R * 0.55, top + 52, 5, '#ffffff', { opacity: 0.7 }));
  // 顔
  out.push(circ(-14, -122, 6, INK), circ(20, -122, 6, INK), circ(-12, -124, 2, '#ffffff'), circ(22, -124, 2, '#ffffff'));
  out.push(ell(-28, -110, 9, 5, '#ff7fb6', { opacity: 0.6 }), ell(34, -110, 9, 5, '#ff7fb6', { opacity: 0.6 }));
  out.push(path('M-2 -112 Q3 -106 8 -112', 'none', stroke(INK, 3)));
  return out.join('');
}
sprite('enemies', 'jelly/0', 18, 19, 9, 18, () => tr(9, 18, jelly(0), 0.1));
sprite('enemies', 'jelly/1', 18, 19, 9, 18, () => tr(9, 18, jelly(1), 0.1));

// ===================== ちょうちんおばけ =====================
function lantern(k, defs) {
  const out = [];
  const glow = defs.radU([[0, '#ffcf6a', k ? 0.55 : 0.4], [1, '#ffb040', 0]], 0, -104, 118);
  out.push(circ(0, -104, 118, glow));
  // つり手
  out.push(path('M-10 -210 Q0 -228 10 -210', 'none', stroke('#2a2230', 5)));
  // 上下のふた
  out.push(rrect(-38, -208, 76, 22, 6, '#2a2230'), rect(-34, -204, 68, 5, '#4a4050'));
  out.push(rrect(-34, -30, 68, 18, 5, '#2a2230'));
  // ふさ
  out.push(...[-10, -4, 2, 8].map((x, i) => path(`M${x} -14 L${x + (k ? 2 : -2) * (i - 1.5)} 10`, 'none', stroke('#f2b134', 4))));
  out.push(rect(-12, -16, 24, 6, '#e0922a'));
  // ちょうちん（赤い紙）
  out.push(path('M-36 -188 C-86 -170 -86 -48 -34 -30 L34 -30 C86 -48 86 -170 36 -188 Z', '#b82e2a'));
  out.push(path('M-32 -186 C-78 -168 -78 -52 -30 -34 L30 -34 C78 -52 78 -168 32 -186 Z', '#e8473c'));
  for (let i = 1; i < 7; i++) {
    const y = -188 + i * 22.6, wv = 74 * Math.sin(Math.PI * (i / 7)) + 4;
    out.push(path(`M${-wv} ${y} Q0 ${y + 6} ${wv} ${y}`, 'none', stroke('#a8261f', 3, { opacity: 0.7 })));
  }
  out.push(ell(-40, -126, 10, 40, '#ff8a70', { opacity: 0.55, rot: 6 }));
  // 顔
  out.push(eye(-4, -128, 13, 16), eye(34, -130, 10, 13));
  out.push(path('M-6 -86 Q16 -70 42 -88 Q30 -64 10 -64 Q-2 -66 -6 -86 Z', '#6e1414'));
  out.push(path(`M14 -76 Q${24 + k * 3} -44 ${30 + k * 4} -48 Q38 -58 34 -80 Z`, '#ff86a0'));
  out.push(path('M24 -72 L27 -56', 'none', stroke('#e0607e', 2.5)));
  return out.join('');
}
sprite('enemies', 'lantern/0', 24, 25, 12, 22, defs => tr(12, 22, lantern(0, defs), 0.1));
sprite('enemies', 'lantern/1', 24, 25, 12, 22, defs => tr(12, 22, lantern(1, defs), 0.1));

// ===================== タコ（明石だこ・はちまき） =====================
const TAKO = { body: '#e5533c', dark: '#b33722', light: '#ff8e6e', sucker: '#ffd3bd' };
function tako(up) {
  const C = TAKO;
  const out = [];
  // 足
  const legs = [-54, -32, -10, 12, 34, 56];
  legs.forEach((x, i) => {
    const s = x < 0 ? -1 : 1;
    const d = up
      ? `M${x * 0.6} -84 Q${x * 0.8 + s * 6} -44 ${x * 0.5 + s * (i % 2 ? 4 : -4)} -6`
      : `M${x * 0.6} -84 Q${x * 1.3} -70 ${x * 1.7} -${40 + (i % 2) * 18} Q${x * 1.9} -${60 + (i % 2) * 18} ${x * 1.5} -${70 + (i % 2) * 14}`;
    out.push(path(d, 'none', stroke(C.dark, 20)), path(d, 'none', stroke(C.body, 14)));
  });
  if (up) out.push(...[-30, -8, 14, 34].map((x, i) => circ(x * 0.55, -40 + i * 6, 3.5, C.sucker)));
  // 頭
  out.push(ell(-4, -150, 64, 62, C.dark), ell(-6, -154, 60, 58, C.body));
  out.push(ell(-28, -182, 18, 26, C.light, { opacity: 0.8, rot: -20 }), circ(-4, -196, 5, '#ffffff', { opacity: 0.7 }));
  // 顔
  out.push(ell(0, -94, 50, 20, C.body));
  out.push(eye(-12, -104, 11, 13), eye(24, -104, 11, 13));
  out.push(circ(52, -88, 12, C.dark), circ(52, -88, 7, '#8a2412'));
  out.push(ell(-26, -84, 9, 5, '#ff9fb0', { opacity: 0.7 }));
  // はちまき
  out.push(tr(0, -16, [
    path('M-66 -134 Q-4 -118 58 -138 L60 -124 Q-4 -104 -66 -120 Z', '#ffffff'),
    path('M-66 -127 Q-4 -111 59 -131', 'none', stroke('#3a6fd0', 4, { strokeDasharray: '10 8' })),
    path('M56 -134 Q80 -150 84 -136 Q76 -128 58 -126 Z', '#ffffff'), path('M58 -126 Q78 -118 74 -104 Q66 -110 58 -122 Z', '#f1f1f1')
  ]));
  return out.join('');
}
sprite('enemies', 'tako/0', 24, 23, 12, 22, () => tr(12, 22, tako(true), 0.1));
sprite('enemies', 'tako/1', 24, 23, 12, 22, () => tr(12, 22, tako(false), 0.1));

// ===================== ジャンプぐつ =====================
function wing(k) {
  const a = k ? -18 : 8;
  return tr(0, 0, [
    path('M0 0 C-20 -30 -60 -46 -80 -40 C-66 -30 -70 -22 -58 -16 C-70 -12 -66 -2 -50 -2 C-58 6 -40 10 -20 6 Z', '#ffffff'),
    path('M-8 -4 C-26 -20 -50 -30 -66 -32', 'none', stroke('#c9d9f0', 3)),
    path('M-12 2 C-26 -6 -40 -10 -52 -10', 'none', stroke('#c9d9f0', 3))
  ], 1, a);
}
function boots() {
  return [
    circ(0, 4, 88, '#9ad7ff', { opacity: 0.28 }),
    tr(-34, -6, wing(0)),
    // くつ
    path('M-50 -40 L-50 20 L66 20 C74 20 78 10 72 0 C60 -14 30 -14 10 -26 L0 -48 Q-24 -56 -50 -40 Z', '#c52d2d'),
    path('M-46 -38 L-46 12 L60 12 C66 12 68 6 64 0 C52 -10 26 -12 8 -22 L-2 -44 Q-24 -50 -46 -38 Z', '#ef4a3e'),
    path('M-54 12 L72 12 C80 12 80 28 70 30 L-54 30 Z', '#ffffff'), rect(-54, 24, 126, 6, '#d6dde6'),
    path('M36 -8 C50 -4 62 0 66 8 L40 10 Z', '#ffffff'),
    path('M-8 -30 L12 -18 M-14 -20 L6 -8 M-20 -10 L0 2', 'none', stroke('#ffffff', 5)),
    path('M-44 -30 Q-44 0 -30 8', 'none', stroke('#ffd24a', 7)),
    ell(-30, -30, 8, 12, '#ffffff', { opacity: 0.5, rot: 20 })
  ].join('');
}
sprite('items', 'boots', 20, 18, 10, 9, () => tr(10, 9, boots(), 0.1));
// りんのかかとにつく羽
sprite('chars', 'bootwing/0', 9, 7, 8, 5, () => tr(8, 5, wing(0), 0.1));
sprite('chars', 'bootwing/1', 9, 7, 8, 5, () => tr(8, 5, wing(1), 0.1));

// ===================== ご当地の1UP =====================
// 神戸プリン（カラメル・クリーム・さくらんぼ）
sprite('items', 'pudding', 18, 18, 9, 9, () => tr(9, 10, [
  ell(0, 56, 80, 16, '#d9dde4'), ell(0, 52, 74, 12, '#ffffff'),
  path('M-54 50 L-38 -34 Q0 -44 38 -34 L54 50 Q0 60 -54 50 Z', '#e8b440'),
  path('M-48 46 L-34 -30 Q0 -38 34 -30 L48 46 Q0 54 -48 46 Z', '#ffd66a'),
  path('M-38 -34 Q0 -48 38 -34 L42 -14 Q34 -4 30 -16 Q22 -2 14 -14 Q4 0 -4 -14 Q-14 0 -22 -14 Q-30 -2 -40 -14 Z', '#8e3f12'),
  ell(-10, -40, 26, 6, '#b8611e', { opacity: 0.8 }),
  ell(-26, 14, 8, 22, '#fff2b8', { opacity: 0.9, rot: 8 }),
  circ(-8, -52, 16, '#ffffff'), circ(8, -54, 14, '#ffffff'), circ(0, -64, 12, '#ffffff'),
  path('M6 -74 Q12 -92 24 -96', 'none', stroke('#4f8a3a', 3)),
  circ(4, -76, 11, '#e0263a'), circ(0, -80, 3.5, '#ffffff', { opacity: 0.8 })
], 0.1));
// 明石焼き（赤い板に3つ）
sprite('items', 'akashiyaki', 20, 16, 10, 9, () => tr(10, 9, [
  path('M-40 -60 Q-44 -76 -34 -86 M-6 -64 Q-12 -80 -2 -92 M28 -60 Q22 -76 32 -86', 'none', stroke('#ffffff', 4, { opacity: 0.7 })),
  rrect(-90, 30, 180, 30, 10, '#8e1b1b'), rrect(-90, 26, 180, 26, 10, '#c62828'), rect(-80, 30, 160, 4, '#e8605a', { opacity: 0.7 }),
  ...[[-50, 0], [0, -8], [50, 0]].map(([x, y]) => [
    circ(x, y + 4, 34, '#d99a3a'), circ(x, y, 32, '#f6cf7a'),
    ell(x - 10, y - 12, 12, 8, '#fff3cf', { opacity: 0.9, rot: -25 }),
    ell(x + 10, y + 18, 14, 6, '#e6a94a', { opacity: 0.8 })
  ].join(''))
], 0.1));
