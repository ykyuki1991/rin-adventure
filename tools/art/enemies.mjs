// 敵キャラクター。座標は 0.1ドット単位、足元のまん中が (0,0)（鳥は体のまん中）
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, shade } from './svg.mjs';

const INK = '#241a2e';

// 大きな白目＋黒目（dir=1 で右向き）
function eyes(cx, cy, gap, rx, ry, o = {}) {
  const out = [];
  for (const s of [-1, 1]) {
    const x = cx + s * gap;
    out.push(ell(x, cy, rx, ry, '#ffffff'));
    out.push(ell(x + rx * 0.3, cy + ry * 0.15, rx * 0.58, ry * 0.62, o.pupil || INK));
    out.push(circ(x + rx * 0.45, cy - ry * 0.18, rx * 0.2, '#ffffff'));
    if (o.angry) out.push(path(`M${x - rx * 1.1} ${cy - ry * (s < 0 ? 1.45 : 1.05)} L${x + rx * 1.1} ${cy - ry * (s < 0 ? 1.05 : 1.45)}`, 'none', { stroke: o.brow || INK, strokeWidth: ry * 0.32, strokeLinecap: 'round' }));
  }
  return out.join('');
}

// ===================== スライム =====================
const SLIME = {
  green: ['#6fd35a', '#43a838', '#a8f08f'],
  teal: ['#4fd0e6', '#1f9cc0', '#a6f0fb'],
  purple: ['#a36ae6', '#6f3fb8', '#d4b2ff']
};
function slimeBody(c, sx = 1, sy = 1) {
  const [body, dark, light] = c;
  const d = (k) => `M${-94 * k} 0 C${-96 * k} ${-64 * sy} ${-58 * k} ${-110 * sy} 0 ${-110 * sy} C${58 * k} ${-110 * sy} ${96 * k} ${-64 * sy} ${94 * k} 0 Q0 8 ${-94 * k} 0 Z`;
  return tr(0, 0, [
    path(d(sx), dark),
    path(d(sx * 0.95), body, { transform: `translate(0 ${-7 * sy})` }),
    ell(-44 * sx, -72 * sy, 24 * sx, 13 * sy, '#ffffff', { opacity: 0.8, rot: -32 }),
    circ(-16 * sx, -94 * sy, 6.5, '#ffffff', { opacity: 0.85 }),
    ell(44 * sx, -22 * sy, 30 * sx, 8 * sy, light, { opacity: 0.35 })
  ]);
}
for (const [name, c] of Object.entries(SLIME)) {
  sprite('enemies', `slime/${name}/0`, 21, 13, 10.5, 12.5, () => tr(10.5, 12.5, [slimeBody(c), eyes(14, -52, 24, 14, 20)], 0.1));
  sprite('enemies', `slime/${name}/1`, 21, 13, 10.5, 12.5, () => tr(10.5, 12.5, [slimeBody(c, 1.06, 0.9), eyes(16, -47, 25, 14, 19)], 0.1));
  sprite('enemies', `slime/${name}/flat`, 20, 8, 10, 7, () => tr(10, 7, [
    path('M-92 0 C-90 -30 -50 -44 0 -44 C50 -44 90 -30 92 0 Q0 8 -92 0 Z', c[1]),
    path('M-86 -4 C-84 -30 -48 -40 0 -40 C48 -40 84 -30 86 -4 Q0 2 -86 -4 Z', c[0]),
    path('M-30 -26 L-14 -16 M-14 -26 L-30 -16 M14 -26 L30 -16 M30 -26 L14 -16', 'none', { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' })
  ], 0.1));
}

// ===================== トゲぼう =====================
function spikyBody(step) {
  const out = [];
  // トゲ（白）
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i / 8) * Math.PI * 1.0 + (i === 0 ? 0.15 : i === 8 ? -0.15 : 0);
    const ang = a;
    const bx = Math.cos(ang) * 50, by = -62 + Math.sin(ang) * 50;
    const tx = Math.cos(ang) * 92, ty = -62 + Math.sin(ang) * 92;
    const px = Math.cos(ang + Math.PI / 2) * 16, py = Math.sin(ang + Math.PI / 2) * 16;
    out.push(poly([[bx + px, by + py], [tx, ty], [bx - px, by - py]], '#e9e6f2'));
    out.push(poly([[bx + px * 0.2, by + py * 0.2], [tx, ty], [bx - px, by - py]], '#ffffff'));
  }
  for (const s of [-1, 1]) out.push(poly([[s * 44, -40], [s * 88, -30], [s * 50, -18]], '#e9e6f2'));
  // 足
  out.push(ell(-26 + step * 8, -8, 22, 12, '#3b1466'), ell(26 - step * 8, -8, 22, 12, '#3b1466'));
  // 体
  out.push(circ(0, -58, 56, '#6a2bb8'));
  out.push(circ(-6, -64, 48, '#8a46d8'));
  out.push(ell(-22, -86, 16, 10, '#c9a2ff', { opacity: 0.7, rot: -30 }));
  out.push(eyes(12, -56, 19, 11, 14, { angry: true }));
  out.push(path('M2 -28 Q14 -34 26 -28', 'none', { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' }));
  return out.join('');
}
sprite('enemies', 'spiky/0', 20, 17, 10, 16, () => tr(10, 16, spikyBody(1), 0.1));
sprite('enemies', 'spiky/1', 20, 17, 10, 16, () => tr(10, 16, spikyBody(-1), 0.1));

// ===================== ウニ =====================
function urchin(ph) {
  const out = [];
  const cy = -66;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + ph;
    const L = 96 + (i % 2) * 8, bw = 0.2;
    out.push(poly([[Math.cos(a - bw) * 46, cy + Math.sin(a - bw) * 46], [Math.cos(a) * L, cy + Math.sin(a) * L], [Math.cos(a + bw) * 46, cy + Math.sin(a + bw) * 46]], i % 2 ? '#3a1d63' : '#4a2878', { strokeLinejoin: 'round' }));
    out.push(circ(Math.cos(a) * (L - 3), cy + Math.sin(a) * (L - 3), 4, i % 2 ? '#3a1d63' : '#4a2878'));
  }
  out.push(circ(0, cy, 58, '#3d1f69'));
  out.push(circ(-6, cy - 6, 48, '#55308c'));
  out.push(ell(-24, cy - 28, 14, 8, '#9d7ad6', { opacity: 0.6, rot: -30 }));
  out.push(eyes(10, cy + 4, 20, 12, 14, { angry: true, pupil: '#2a0f45', brow: '#1a0b2e' }));
  return out.join('');
}
sprite('enemies', 'urchin/0', 22, 21, 11, 18, () => tr(11, 18, urchin(0), 0.1));
sprite('enemies', 'urchin/1', 22, 21, 11, 18, () => tr(11, 18, urchin(0.12), 0.1));

// ===================== カニ =====================
function crab(step, claw) {
  const out = [];
  const leg = (s, k) => {
    const x0 = s * 40, y0 = -34;
    const kx = s * (70 + k * 8), ky = -44 + k * 6 + (k % 2 ? step : -step) * 4;
    const fx = s * (80 + k * 12), fy = 0 + (k % 2 ? step : -step) * 3;
    return path(`M${x0} ${y0} L${kx} ${ky} L${fx} ${fy}`, 'none', { stroke: '#b8341b', strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' });
  };
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) out.push(leg(s, k));
  // はさみ
  for (const s of [-1, 1]) {
    const cx = s * 84, cy = -84 + claw * s * 4;
    out.push(path(`M${s * 44} -44 Q${s * 70} -56 ${cx} ${cy + 18}`, 'none', { stroke: '#d9482a', strokeWidth: 10, strokeLinecap: 'round' }));
    out.push(ell(cx, cy, 20, 22, '#ea5a36'));
    out.push(path(`M${cx - 8 * s} ${cy - 24} L${cx + 2 * s} ${cy - 4} L${cx + 16 * s} ${cy - 20} Z`, '#f6f1ea', { opacity: 0 }));
    out.push(path(`M${cx - 4 * s} ${cy - 22} Q${cx + 6 * s} ${cy - 8} ${cx + 18 * s} ${cy - 20} L${cx + 14 * s} ${cy - 2} Z`, '#fbf5ef'));
    out.push(ell(cx - 6 * s, cy + 4, 7, 5, '#ff9b73', { opacity: 0.7 }));
  }
  // 体
  out.push(ell(0, -40, 64, 38, '#d9482a'));
  out.push(ell(0, -45, 60, 32, '#ef6a40'));
  out.push(ell(-18, -60, 26, 11, '#ffa27c', { opacity: 0.8 }));
  // 目（くき）
  for (const s of [-1, 1]) {
    out.push(rect(s * 20 - 4, -104, 8, 34, '#d9482a'));
    out.push(circ(s * 20, -106, 14, '#ffffff'));
    out.push(circ(s * 20 + 3, -104, 7.5, INK));
    out.push(circ(s * 20 + 5, -108, 2.5, '#ffffff'));
  }
  out.push(path('M-12 -30 Q0 -22 12 -30', 'none', { stroke: '#8a2412', strokeWidth: 4, strokeLinecap: 'round' }));
  return out.join('');
}
sprite('enemies', 'crab/0', 24, 14, 12, 13, () => tr(12, 13, crab(1, 1), 0.1));
sprite('enemies', 'crab/1', 24, 14, 12, 13, () => tr(12, 13, crab(-1, -1), 0.1));
sprite('enemies', 'crab/flat', 20, 7, 10, 6, () => tr(10, 6, [
  ell(0, -16, 80, 20, '#d9482a'), ell(0, -20, 74, 16, '#ef6a40'),
  path('M-30 -26 L-16 -14 M-16 -26 L-30 -14 M16 -26 L30 -14 M30 -26 L16 -14', 'none', { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' })
], 0.1));

// ===================== 鳥・ハチ・コウモリ =====================
// wing: 1 = 上, -1 = 下（右向きで描く）
function gull(wing) {
  const wy = wing > 0 ? -1 : 1;
  return [
    // 奥のつばさ
    path(`M-6 -18 Q-40 ${-30 + wy * 40} -70 ${-20 + wy * 58} Q-40 ${-8 + wy * 20} -10 0 Z`, '#9aa4b1'),
    ell(-8, 0, 50, 36, '#ffffff'),
    ell(-14, 12, 42, 20, '#e3e8ee'),
    // しっぽ
    poly([[-50, -6], [-80, -16], [-78, 10], [-50, 8]], '#e3e8ee'),
    poly([[-66, -12], [-80, -16], [-79, 0]], '#4a5360'),
    // 顔
    circ(30, -14, 26, '#ffffff'),
    poly([[50, -14], [82, -6], [50, 2]], '#f7b21e'),
    poly([[50, -6], [82, -6], [50, 2]], '#e08a00'),
    circ(38, -20, 5.5, INK), circ(40, -22, 1.8, '#ffffff'),
    // 手前のつばさ
    path(`M-2 -8 Q-24 ${-36 + wy * 44} -64 ${-36 + wy * 70} Q-40 ${-10 + wy * 26} -2 10 Z`, '#c3cbd5'),
    path(`M-52 ${-30 + wy * 62} Q-60 ${-34 + wy * 68} -64 ${-36 + wy * 70} Q-50 ${-20 + wy * 50} -44 ${-18 + wy * 44} Z`, '#4a5360'),
    // あし
    path('M-4 34 L-8 48 M8 34 L6 48', 'none', { stroke: '#f28c1e', strokeWidth: 5, strokeLinecap: 'round' })
  ].join('');
}
function roundBird(wing, c) {
  const wy = wing > 0 ? -1 : 1;
  return [
    path(`M-10 -14 Q-36 ${-24 + wy * 30} -58 ${-14 + wy * 40} Q-30 ${-2 + wy * 14} -8 4 Z`, shade(c.wing, -0.15)),
    ell(0, 0, 52, 44, c.body),
    ell(8, 18, 36, 22, c.belly),
    c.neck ? ell(24, -2, 22, 20, c.neck, { opacity: 0.9 }) : '',
    poly([[-46, -4], [-76, -14], [-70, 14], [-44, 12]], c.wing),
    circ(26, -18, 28, c.body),
    c.neck ? path('M8 -2 Q26 8 44 -4 L44 4 Q26 16 8 6 Z', c.neck) : '',
    poly([[50, -16], [74, -8], [50, 0]], c.beak),
    circ(34, -24, 6, c.eye || INK), circ(36, -26, 2, '#ffffff'),
    c.cheek ? ell(40, -8, 7, 4, c.cheek, { opacity: 0.6 }) : '',
    c.tuft ? path('M18 -44 Q22 -66 34 -60 Q26 -54 28 -44 Z', c.tuft) : '',
    path(`M-6 -6 Q-28 ${-26 + wy * 32} -54 ${-20 + wy * 48} Q-28 ${-2 + wy * 16} -6 12 Z`, c.wing)
  ].join('');
}
const BIRDS = {
  pigeon: { body: '#a3adc0', belly: '#c3cad8', wing: '#8792a8', neck: '#71b8a6', beak: '#5a5a66', eye: '#b8321e', cheek: null },
  crow: { body: '#2e3044', belly: '#3b3e56', wing: '#1f2133', beak: '#3a3a44', eye: INK },
  chick: { body: '#ffd35c', belly: '#fff0b8', wing: '#f5b633', beak: '#ff8a1e', cheek: '#ff9aa6', tuft: '#f5b633' }
};
for (const w of [1, -1]) {
  const k = w > 0 ? 0 : 1;
  sprite('enemies', `bird/gull/${k}`, 20, 16, 10, 8, () => tr(10, 8.5, gull(w), 0.1));
  for (const [name, c] of Object.entries(BIRDS)) sprite('enemies', `bird/${name}/${k}`, 18, 16, 9, 8, () => tr(9, 8.5, roundBird(w, c), 0.1));
  // ハチ
  sprite('enemies', `bird/bee/${k}`, 20, 16, 10, 8, () => tr(10, 9, [
    ell(-10, -48 + (w > 0 ? -6 : 6), 20, 30, '#dff4ff', { opacity: 0.9, rot: w > 0 ? -25 : 15 }),
    ell(-44, 6, 22, 16, '#1f1a24', { rot: 10 }),
    poly([[-60, 4], [-84, 10], [-60, 14]], '#1f1a24'),
    ell(0, 0, 56, 44, '#ffc83a'),
    path('M-30 -36 Q-20 0 -30 38 L-14 42 Q-4 0 -14 -41 Z', '#1f1a24'),
    path('M4 -44 Q14 0 4 44 L20 40 Q30 0 20 -40 Z', '#1f1a24'),
    ell(-14, -24, 22, 9, '#fff1b8', { opacity: 0.6, rot: -10 }),
    circ(36, -8, 7, INK), circ(38, -10, 2.4, '#ffffff'),
    ell(8, -46 + (w > 0 ? -8 : 8), 20, 32, '#eefaff', { opacity: 0.92, rot: w > 0 ? 20 : -10 }),
    path('M40 -38 Q48 -60 58 -58', 'none', { stroke: '#1f1a24', strokeWidth: 4, strokeLinecap: 'round' })
  ], 0.1));
  // コウモリ
  sprite('enemies', `bird/bat/${k}`, 22, 16, 11, 8, () => tr(11, 8, [
    ...[-1, 1].map(s => path(`M${s * 20} -8 Q${s * 60} ${w > 0 ? -60 : 10} ${s * 100} ${w > 0 ? -40 : 30} Q${s * 80} ${w > 0 ? -20 : 36} ${s * 70} ${w > 0 ? -6 : 44} Q${s * 56} ${w > 0 ? 0 : 30} ${s * 40} 10 Q${s * 30} 10 ${s * 20} 8 Z`, '#4b1d7a')),
    circ(0, 0, 40, '#6a2fa0'),
    poly([[-30, -24], [-22, -56], [-8, -30]], '#6a2fa0'), poly([[30, -24], [22, -56], [8, -30]], '#6a2fa0'),
    circ(-14, -4, 8, '#ff5a7a'), circ(16, -4, 8, '#ff5a7a'), circ(-12, -6, 3, '#fff'), circ(18, -6, 3, '#fff'),
    poly([[-6, 16], [-2, 28], [2, 16]], '#ffffff'), poly([[4, 16], [8, 28], [12, 16]], '#ffffff')
  ], 0.1));
}

// ===================== カエル =====================
function frog(air) {
  const body = '#5cbf6e', dark = '#2f8a47', belly = '#e5f7d4';
  return [
    air ? path('M-50 -30 L-74 6 L-56 10 L-36 -20 Z', dark) : ell(-46, -8, 30, 14, dark),
    air ? path('M40 -30 L70 10 L52 12 L30 -20 Z', dark) : ell(46, -8, 30, 14, dark),
    ell(0, -46, 70, air ? 52 : 46, body),
    ell(12, -30, 40, 22, belly),
    ell(-24, -70, 18, 8, '#9be6a8', { opacity: 0.7, rot: -20 }),
    circ(-26, -92, 24, body), circ(26, -92, 24, body),
    circ(-24, -94, 17, '#ffffff'), circ(28, -94, 17, '#ffffff'),
    circ(-18, -93, 9, INK), circ(34, -93, 9, INK), circ(-15, -97, 3, '#fff'), circ(37, -97, 3, '#fff'),
    path('M-10 -52 Q14 -40 40 -54', 'none', { stroke: dark, strokeWidth: 5, strokeLinecap: 'round' }),
    ell(46, -52, 9, 5, '#ff9aa6', { opacity: 0.5 })
  ].join('');
}
sprite('enemies', 'frog/sit', 18, 14, 9, 12.5, () => tr(9, 12.5, frog(false), 0.1));
sprite('enemies', 'frog/jump', 18, 14, 9, 13, () => tr(9, 13.5, frog(true), 0.1));

// ===================== ゴロいわ =====================
function rock(angry) {
  const out = [];
  for (let i = 0; i < 4; i++) { const x = -96 + 20 + i * 52; out.push(poly([[x - 16, 236], [x, 270], [x + 16, 236]], '#dfe3e8')); }
  out.push(rrect(-120, 0, 240, 240, 44, '#56606f'));
  out.push(rrect(-112, 6, 224, 220, 38, '#7f8a9a'));
  out.push(path('M-96 30 Q-60 6 -10 12 L-20 40 Q-60 36 -88 56 Z', '#a9b3c0', { opacity: 0.8 }));
  out.push(path('M60 30 L44 70 L74 92', 'none', { stroke: '#56606f', strokeWidth: 7, strokeLinecap: 'round' }));
  out.push(path('M-80 170 L-50 190', 'none', { stroke: '#56606f', strokeWidth: 7, strokeLinecap: 'round' }));
  if (angry) {
    for (const s of [-1, 1]) {
      out.push(ell(s * 44, 120, 26, 22, '#ffffff'));
      out.push(circ(s * 44, 124, 12, '#d0192b'));
      out.push(path(`M${s * 76} 76 L${s * 18} 98`, 'none', { stroke: '#1d2230', strokeWidth: 14, strokeLinecap: 'round' }));
    }
    out.push(rrect(-40, 162, 80, 26, 8, '#1d2230'));
    for (let i = 0; i < 4; i++) out.push(rect(-32 + i * 18, 162, 10, 10, '#ffffff'));
  } else {
    for (const s of [-1, 1]) out.push(path(`M${s * 44 - 18} 118 Q${s * 44} 102 ${s * 44 + 18} 118`, 'none', { stroke: '#1d2230', strokeWidth: 9, strokeLinecap: 'round' }));
    out.push(path('M-18 170 L18 170', 'none', { stroke: '#1d2230', strokeWidth: 9, strokeLinecap: 'round' }));
  }
  return out.join('');
}
sprite('enemies', 'rock/calm', 26, 29, 1, 1, () => tr(13, 1, rock(false), 0.1));
sprite('enemies', 'rock/angry', 26, 29, 1, 1, () => tr(13, 1, rock(true), 0.1));

// ===================== キングスライム =====================
function boss(flash) {
  const body = flash ? '#ffffff' : '#7b52b8', dark = flash ? '#dddddd' : '#503283', light = flash ? '#ffffff' : '#a883e0';
  const out = [];
  const D = k => `M${-212 * k} 0 C${-214 * k} -140 ${-132 * k} -252 0 -252 C${132 * k} -252 ${214 * k} -140 ${212 * k} 0 Q0 16 ${-212 * k} 0 Z`;
  out.push(path(D(1), dark));
  out.push(path(D(0.95), body, { transform: 'translate(0 -14)' }));
  out.push(ell(-112, -176, 46, 26, '#ffffff', { opacity: flash ? 0 : 0.45, rot: -35 }));
  out.push(circ(-74, -212, 12, '#ffffff', { opacity: flash ? 0 : 0.55 }));
  out.push(ell(80, -60, 70, 18, light, { opacity: 0.3 }));
  // 王冠
  out.push(tr(0, -240, [
    path('M-86 20 L-100 -80 L-50 -30 L0 -104 L50 -30 L100 -80 L86 20 Z', '#f0a800'),
    path('M-80 14 L-92 -66 L-50 -22 L0 -90 L50 -22 L92 -66 L80 14 Z', '#ffd23a'),
    rect(-86, 0, 172, 22, '#f0a800'), rect(-86, 0, 172, 8, '#ffe27a'),
    circ(0, -18, 16, '#e8243a'), circ(-4, -22, 5, '#ff9aa6'),
    circ(-56, -6, 11, '#3fc9e8'), circ(56, -6, 11, '#3fc9e8'),
    circ(-100, -80, 9, '#ffd23a'), circ(0, -104, 10, '#ffd23a'), circ(100, -80, 9, '#ffd23a')
  ].join('')));
  // 顔
  for (const s of [-1, 1]) {
    const x = s * 62, y = -132;
    out.push(ell(x, y, 40, 42, '#ffffff'));
    out.push(circ(x + 6, y + 6, 22, '#e01b2a'));
    out.push(circ(x + 6, y + 6, 9, '#2a0a12'));
    out.push(circ(x - 2, y - 4, 6, '#ffffff'));
    out.push(path(`M${x - s * 54} ${y - 62} L${x + s * 44} ${y - 30}`, 'none', { stroke: '#1d1030', strokeWidth: 20, strokeLinecap: 'round' }));
  }
  out.push(path('M-80 -66 Q0 -18 80 -66 Q56 -24 0 -24 Q-56 -24 -80 -66 Z', '#1d1030'));
  out.push(poly([[-50, -54], [-37, -32], [-25, -50]], '#ffffff'), poly([[25, -50], [37, -32], [50, -54]], '#ffffff'));
  return out.join('');
}
sprite('enemies', 'boss/0', 44, 46, 22, 45, () => tr(22, 45, boss(false), 0.1));
sprite('enemies', 'boss/flash', 44, 46, 22, 45, () => tr(22, 45, boss(true), 0.1));
