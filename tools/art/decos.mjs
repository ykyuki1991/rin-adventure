// 飾り（家・店・駅・タワー・乗り物など）。座標は 0.1ドット単位（特に書いていないとき）
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, pline, line, rng, shade, text, f } from './svg.mjs';

// ---------- 木 ----------
function roundTree(c) {
  return [
    path('M-12 0 L-8 -120 L8 -120 L12 0 Z', c.trunk), path('M-4 -10 L-2 -110 L4 -110 L2 -10 Z', shade(c.trunk, 0.2), { opacity: 0.6 }),
    circ(-62, -150, 60, c.dark), circ(62, -150, 58, c.dark), circ(0, -220, 78, c.dark),
    circ(-56, -160, 56, c.base), circ(58, -160, 52, c.base), circ(0, -226, 72, c.base), circ(-20, -190, 60, c.base), circ(30, -186, 58, c.base),
    circ(-30, -250, 34, c.light, { opacity: 0.85 }), circ(-70, -176, 22, c.light, { opacity: 0.7 }), circ(26, -262, 20, c.light, { opacity: 0.7 }),
    ...[[40, -140], [-10, -140], [70, -190]].map(([x, y]) => circ(x, y, 22, c.dark, { opacity: 0.35 }))
  ].join('');
}
sprite('decos', 'deco/tree', 26, 32, 13, 31, () => tr(13, 31, roundTree({ trunk: '#7a5236', dark: '#3f8a43', base: '#5aac52', light: '#8fd07a' }), 0.1));
sprite('decos', 'deco/treeN', 26, 32, 13, 31, () => tr(13, 31, roundTree({ trunk: '#3a2a2a', dark: '#1a3a38', base: '#24504a', light: '#3a7066' }), 0.1));

// ---------- ベンチ ----------
sprite('decos', 'deco/bench', 26, 12, 1, 11, () => tr(1, 11, [
  rect(20, -60, 12, 60, '#3c3d46'), rect(200, -60, 12, 60, '#3c3d46'),
  rrect(0, -70, 232, 16, 4, '#9a6a45'), rrect(0, -70, 232, 6, 3, '#c08d62'),
  rrect(0, -104, 232, 14, 4, '#9a6a45'), rrect(0, -104, 232, 5, 3, '#c08d62'),
  rect(20, -104, 10, 40, '#3c3d46'), rect(202, -104, 10, 40, '#3c3d46')
], 0.1));

// ---------- 街灯 ----------
sprite('decos', 'deco/lamp', 14, 36, 7, 35, () => tr(7, 35, [
  rrect(-22, -24, 44, 24, 6, '#2b2c35'), rect(-8, -300, 16, 280, '#2b2c35'), rect(-4, -300, 4, 280, '#4a4c58'),
  rrect(-14, -310, 28, 14, 4, '#2b2c35'),
  path('M-26 -312 L26 -312 L20 -334 L-20 -334 Z', '#2b2c35'),
  path('M-22 -334 L22 -334 L18 -318 L-18 -318 Z', '#fff1c2', { transform: 'translate(0 -18) scale(1 1)' }),
  rrect(-20, -330, 40, 36, 6, '#fff3c9', { transform: 'translate(0 -20)' }),
  path('M-24 -348 L24 -348 L0 -372 Z', '#2b2c35'), circ(0, -374, 5, '#2b2c35')
], 0.1));

// ---------- りんの家 ----------
sprite('decos', 'deco/rinhouse', 92, 78, 6, 77, () => tr(6, 77, [
  // かべ
  rect(0, -480, 800, 480, '#f7eddc'), rect(740, -480, 60, 480, '#e8dac4'),
  rect(0, -80, 800, 80, '#e3d3bb'),
  // 屋根
  path('M-60 -470 L400 -740 L860 -470 Z', '#c24a36'), path('M-60 -470 L400 -740 L400 -712 L-20 -470 Z', '#e0664e'),
  rect(-66, -486, 932, 26, '#8e2f22'),
  ...Array.from({ length: 6 }, (_, i) => path(`M${-20 + i * 70} ${-490 - i * 40} L${820 - i * 70} ${-490 - i * 40}`, 'none', { stroke: '#a83a2a', strokeWidth: 5, opacity: 0.5 })),
  rect(560, -760, 70, 140, '#8a6a58'), rect(550, -772, 90, 20, '#6e5446'),
  // 窓
  ...[[80, -380], [560, -380]].map(([x, y]) => [rrect(x - 10, y - 10, 170, 150, 8, '#ffffff'), rect(x, y, 150, 130, '#9fd3ef'), rect(x + 70, y, 10, 130, '#ffffff'), rect(x, y + 60, 150, 10, '#ffffff'),
    path(`M${x + 10} ${y + 10} L${x + 50} ${y + 10} L${x + 10} ${y + 56} Z`, '#ffffff', { opacity: 0.6 }), rect(x - 20, y + 140, 190, 16, '#d8c8b0'),
    ...[0, 1, 2, 3].map(k => circ(x + 20 + k * 38, y + 128, 16, ['#ff7a8a', '#ffd35a', '#ff9ac0', '#ffffff'][k]))].join('')),
  // ドア
  rrect(320, -290, 150, 290, 20, '#8a5a3a'), rrect(336, -272, 118, 120, 12, '#a8744c'), rrect(336, -140, 118, 120, 12, '#a8744c'),
  circ(440, -140, 9, '#ffd35a'), rect(300, -310, 190, 20, '#6e4a30'),
  // 表札（文字はゲームで描く）
  rrect(80, -190, 200, 84, 10, '#ffffff'), rrect(80, -190, 200, 84, 10, 'none', { stroke: '#b89a7a', strokeWidth: 6 }),
  // ポストと植木ばち
  rect(640, -170, 12, 170, '#555'), rrect(610, -230, 72, 70, 8, '#d83a3a'), rect(620, -210, 52, 8, '#8a1f1f'),
  path('M700 0 L712 -70 L780 -70 L792 0 Z', '#c0703a'), circ(726, -96, 26, '#4a9a48'), circ(756, -104, 28, '#5aac52'), circ(744, -120, 16, '#ff6a7a')
], 0.1));

// ---------- 商店街の店（名前はゲームで描く） ----------
const SHOPS = [
  { wall: '#f3e6d2', awn: ['#e8584a', '#ffffff'], goods: 'bread' },
  { wall: '#efe9dd', awn: ['#2a9d8f', '#ffffff'], goods: 'shoes' },
  { wall: '#f6edd9', awn: ['#e9b84a', '#ffffff'], goods: 'books' },
  { wall: '#eee6dc', awn: ['#7a9c5a', '#ffffff'], goods: 'cafe' },
  { wall: '#f5e9d6', awn: ['#f08a4a', '#ffffff'], goods: 'bread' },
  { wall: '#e9edf1', awn: ['#5a7ab8', '#ffffff'], goods: 'toys' }
];
function goods(kind, r) {
  const out = [];
  if (kind === 'bread') for (let i = 0; i < 6; i++) out.push(ell(60 + (i % 3) * 110, -210 + Math.floor(i / 3) * 60, 34, 20, '#d9a25a'), ell(54 + (i % 3) * 110, -216 + Math.floor(i / 3) * 60, 20, 8, '#f0c888'));
  if (kind === 'shoes') for (let i = 0; i < 6; i++) out.push(rrect(40 + (i % 3) * 110, -222 + Math.floor(i / 3) * 60, 60, 24, 10, ['#e84a5a', '#3a7ad8', '#f4f4f4'][i % 3]));
  if (kind === 'books') for (let i = 0; i < 18; i++) out.push(rect(34 + i * 18, -250 + (i % 2) * 6, 14, 60 - (i % 3) * 8, ['#d84a4a', '#4a7ad8', '#e8c84a', '#5aac5a'][i % 4]));
  if (kind === 'books') for (let i = 0; i < 18; i++) out.push(rect(34 + i * 18, -170 + (i % 3) * 4, 14, 50, ['#8a5ad8', '#e87a4a', '#4ab8c8'][i % 3]));
  if (kind === 'cafe') out.push(circ(120, -210, 30, '#ffffff'), rect(116, -250, 8, 20, '#8a5a3a'), circ(260, -210, 30, '#ffffff'), ell(190, -150, 90, 14, '#8a5a3a'), rect(186, -150, 8, 80, '#6a4a2a'));
  if (kind === 'toys') for (let i = 0; i < 6; i++) out.push(circ(70 + (i % 3) * 110, -214 + Math.floor(i / 3) * 60, 22, ['#ff6a8a', '#ffd35a', '#6ad0ff'][i % 3]));
  return out.join('');
}
SHOPS.forEach((c, i) => sprite('decos', `deco/shop${i}`, 48, 82, 0, 81, () => tr(0, 81, [
  rect(0, -800, 470, 800, c.wall), rect(450, -800, 30, 800, shade(c.wall, -0.1)),
  // 2階の窓（ブロックの高さはかべだけにしておく）
  rrect(60, -780, 130, 100, 8, '#ffffff'), rect(70, -770, 110, 80, '#9cc8e4'), rect(122, -770, 6, 80, '#ffffff'),
  rrect(280, -780, 130, 100, 8, '#ffffff'), rect(290, -770, 110, 80, '#9cc8e4'), rect(342, -770, 6, 80, '#ffffff'),
  rect(20, -660, 440, 8, shade(c.wall, -0.12)),
  // かんばん（文字はゲーム）
  rrect(40, -470, 390, 104, 14, c.awn[0]), rrect(50, -462, 370, 88, 10, shade(c.awn[0], 0.15)),
  // ひさし（しましま）
  ...Array.from({ length: 8 }, (_, k) => rect(10 + k * 57.5, -360, 57.5, 60, c.awn[k % 2])),
  ...Array.from({ length: 8 }, (_, k) => path(`M${10 + k * 57.5} -300 Q${38.75 + k * 57.5} -262 ${67.5 + k * 57.5} -300 Z`, c.awn[k % 2])),
  rect(10, -366, 460, 10, shade(c.awn[0], -0.2)),
  // ショーウィンドウ
  rect(20, -260, 430, 180, '#fff8e8'), rect(20, -260, 430, 16, '#000000', { opacity: 0.08 }),
  tr(0, 70, goods(c.goods)),
  rect(20, -260, 430, 180, 'none', { stroke: shade(c.wall, -0.3), strokeWidth: 8 }),
  path('M40 -250 L100 -250 L40 -190 Z', '#ffffff', { opacity: 0.5 }),
  rect(0, -80, 480, 80, shade(c.wall, -0.2))
], 0.1)));

// ---------- 駅の屋根（1つ48ドット） ----------
sprite('decos', 'deco/stationRoof', 48, 62, 0, 61, () => tr(0, 61, [
  rect(0, -610, 480, 50, '#6b7b8c'), rect(0, -610, 480, 14, '#8a9aab'), rect(0, -560, 480, 20, '#000000', { opacity: 0.12 }),
  rect(90, -560, 26, 560, '#9aa3ad'), rect(90, -560, 8, 560, '#c3cad3'),
  path('M103 -540 L180 -560 M103 -540 L30 -560', 'none', { stroke: '#9aa3ad', strokeWidth: 10 }),
  rrect(260, -520, 110, 60, 8, '#f4f6f8'), rrect(268, -512, 94, 44, 6, '#2a4a7a'), rect(312, -540, 6, 20, '#9aa3ad'),
  circ(290, -490, 5, '#ffd35a'), circ(340, -490, 5, '#5ae07a')
], 0.1));

// ---------- 高架（1つ64ドット） ----------
sprite('decos', 'deco/viaduct', 64, 100, 0, 0, () => tr(0, 0, [
  rect(0, 100, 640, 110, '#d2ccc1'), rect(0, 100, 640, 16, '#ece8e0'), rect(0, 190, 640, 20, '#a9a397'),
  rect(0, 80, 640, 20, '#6d6a64'),
  // 柱
  rect(240, 210, 110, 790, '#c4bdb1'), rect(240, 210, 30, 790, '#ddd8cf'), rect(320, 210, 30, 790, '#aba497'),
  path('M200 210 L390 210 L350 260 L240 260 Z', '#b9b2a6'),
  // 手すり
  rect(0, 60, 640, 8, '#8a8a90'), ...Array.from({ length: 16 }, (_, i) => rect(i * 40 + 18, 60, 4, 30, '#8a8a90'))
], 0.1));

// ---------- 風見鶏 ----------
sprite('decos', 'deco/weathercock', 24, 36, 12, 35, () => tr(12, 35, [
  rect(-7, -220, 14, 220, '#4a3a30'),
  rect(-80, -140, 160, 8, '#4a3a30'), rect(-4, -190, 8, 90, '#4a3a30'),
  text(0, -196, 'N', 34, '#4a3a30'), text(-96, -128, 'W', 26, '#4a3a30'), text(96, -128, 'E', 26, '#4a3a30'),
  // ニワトリ（右向き）
  tr(0, -250, [
    path('M-90 20 C-110 -40 -80 -70 -40 -50 L-20 -20 L20 -34 C30 -80 60 -100 80 -70 L96 -60 L80 -46 C84 -10 60 20 10 24 Z', '#b88a2a'),
    path('M-86 14 C-100 -30 -78 -56 -46 -42 L-26 -14 L18 -26 C28 -70 54 -88 74 -64 L86 -58 L74 -48 C78 -14 56 14 10 18 Z', '#e0b43a'),
    path('M-90 20 C-120 -10 -130 -60 -110 -90 C-100 -50 -86 -30 -60 -20 Z', '#c89a30'),
    path('M60 -96 Q70 -116 84 -104 Q80 -96 72 -90 Z', '#d8342a'),
    poly([[92, -64], [108, -58], [92, -52]], '#f2a01e'),
    circ(70, -72, 4, '#2a1a10'),
    path('M-20 22 L-20 60 M20 22 L20 60', 'none', { stroke: '#b88a2a', strokeWidth: 8 })
  ].join(''))
], 0.1));

// ---------- BE KOBE ----------
sprite('decos', 'deco/bekobe', 76, 26, 0, 25, () => tr(0, 25, [
  rrect(-10, -30, 780, 30, 6, '#b9bec6'), rect(-10, -30, 780, 8, '#d9dde2'),
  text(386, -46, 'BE KOBE', 170, '#a8b0ba', { fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontWeight: 900, textLength: 720, lengthAdjust: 'spacingAndGlyphs' }),
  text(380, -52, 'BE KOBE', 170, '#ffffff', { fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontWeight: 900, textLength: 720, lengthAdjust: 'spacingAndGlyphs' })
], 0.1));

// ---------- ポートタワー（s=1 のとき 高さ110） ----------
sprite('decos', 'deco/porttower', 36, 126, 18, 125, defs => {
  const H = 1100, bw = 150, ww = 50, tw = 130;
  const shape = `M${-bw} 0 Q${-ww * 0.6} ${-H * 0.5} ${-tw} ${-H * 0.9} L${tw} ${-H * 0.9} Q${ww * 0.6} ${-H * 0.5} ${bw} 0 Z`;
  const cp = defs.clip(`<path d="${shape}"/>`);
  const out = [];
  out.push(path(shape, '#c8322a'));
  const lat = [];
  for (let i = -8; i <= 8; i++) {
    lat.push(path(`M${i * bw / 8} 0 L${-i * tw / 8} ${-H * 0.9}`, 'none', { stroke: '#ff6a5a', strokeWidth: 9 }));
    lat.push(path(`M${i * bw / 8} 0 L${i * tw / 8} ${-H * 0.9}`, 'none', { stroke: '#e0443a', strokeWidth: 7 }));
  }
  for (let k = 1; k < 10; k++) lat.push(rect(-200, -H * 0.09 * k, 400, 6, '#ff8a7a', { opacity: 0.6 }));
  out.push(g(lat.join(''), { 'clip-path': cp }));
  // 左がわの影
  out.push(g(rect(-200, -H, 120, H, '#000000', { opacity: 0.18 }), { 'clip-path': cp }));
  // 展望台
  out.push(rrect(-tw - 16, -H * 0.97, (tw + 16) * 2, 70, 12, '#f4efe6'));
  for (let i = 0; i < 9; i++) out.push(rect(-tw - 4 + i * 31, -H * 0.97 + 18, 20, 30, '#7fb2d8'));
  out.push(rect(-tw - 20, -H * 0.97 + 64, (tw + 20) * 2, 12, '#c8322a'));
  out.push(rect(-40, -H * 1.03, 80, 70, '#e0443a'), rect(-8, -H * 1.12, 16, 110, '#e0443a'), circ(0, -H * 1.12, 10, '#ffcf3a'));
  return tr(18, 125, out.join(''), 0.1);
});
// タワーの中の足場（はり）
sprite('decos', 'deco/beam', 16, 5, 0, 0, () => tr(0, 0, [
  rect(0, 0, 160, 40, '#f4efe6'), rect(0, 0, 160, 10, '#ffffff'), rect(0, 30, 160, 10, '#b9b0a2'),
  ...[20, 60, 100, 140].map(x => circ(x, 20, 5, '#b9b0a2'))
], 0.1));

// ---------- クレーン ----------
sprite('decos', 'deco/crane', 130, 160, 30, 159, () => tr(30, 159, [
  // 足
  ...[0, 340].map(x => [rect(x, -1200, 60, 1200, '#e0892b'), rect(x, -1200, 18, 1200, '#f4ab5a'), rect(x - 20, -30, 100, 30, '#5b6472')].join('')),
  ...Array.from({ length: 6 }, (_, k) => path(`M60 ${-k * 200} L340 ${-k * 200 - 200}`, 'none', { stroke: '#c46f1c', strokeWidth: 12 })),
  ...Array.from({ length: 6 }, (_, k) => rect(60, -k * 200 - 200, 280, 12, '#c46f1c')),
  // うで
  rect(-300, -1300, 1300, 90, '#e0892b'), rect(-300, -1300, 1300, 24, '#f4ab5a'),
  ...Array.from({ length: 26 }, (_, k) => path(`M${-300 + k * 50} -1210 L${-275 + k * 50} -1290`, 'none', { stroke: '#c46f1c', strokeWidth: 8 })),
  rect(-40, -1420, 460, 120, '#d57a22'), rect(260, -1400, 130, 90, '#9fd3ef'),
  path('M60 -1420 L200 -1560 L340 -1420', 'none', { stroke: '#c46f1c', strokeWidth: 18 })
], 0.1));

// ---------- かべの上のふち（コーニス） ----------
for (const [name, base, light, dark] of [['brick', '#d9c9b4', '#f4ead8', '#8a6a52'], ['brickwin', '#d9c9b4', '#f4ead8', '#8a6a52'], ['hbrick', '#8a6a5a', '#b8927a', '#3a2620']]) {
  sprite('tiles', `m/${name}/hardT`, 16, 16, 0, 0, () => tr(0, 0, [
    rect(0, 0, 160, 30, dark), rect(0, 0, 160, 22, base), rect(0, 0, 160, 6, light),
    ...[0, 1, 2, 3].map(k => rect(k * 40 + 14, 30, 12, 10, dark)),
    rect(0, 40, 160, 6, '#000000', { opacity: 0.18 })
  ], 0.1));
}

// ---------- 乗り物 ----------
// 電車（阪急マルーン）: 床の左はしが基準。幅80
sprite('pf', 'pf/train', 88, 44, 4, 30, () => tr(4, 30, [
  rrect(-30, -270, 860, 370, 30, '#6e1a26'),
  rrect(-30, -270, 860, 60, 30, '#e9e1cf'),
  rect(-30, -230, 860, 20, '#6e1a26'),
  // 大きな窓（中が見える）
  rrect(10, -196, 780, 140, 10, '#d8eef8'),
  ...[0, 1, 2, 3, 4].map(i => rect(10 + i * 156 + 150, -196, 14, 140, '#6e1a26')),
  ...[0, 1, 2, 3, 4].map(i => path(`M${22 + i * 156} -186 L${60 + i * 156} -186 L${22 + i * 156} -120 Z`, '#ffffff', { opacity: 0.55 })),
  rect(-30, -40, 860, 16, '#e9e1cf', { opacity: 0.9 }),
  rect(0, 0, 800, 30, '#b8b4ab'),
  rect(-30, 60, 860, 40, '#4a1018'),
  ...[100, 700].map(x => [circ(x, 110, 34, '#2b2b30'), circ(x, 110, 14, '#6b6b72')].join('')),
  path('M340 -270 L400 -330 L460 -270', 'none', { stroke: '#3a3a40', strokeWidth: 8 }),
  rect(380, -340, 40, 10, '#3a3a40')
], 0.1));
// 船（甲板が足場）: 幅96
sprite('pf', 'pf/ship', 116, 52, 8, 22, () => tr(8, 22, [
  path('M-70 20 L1040 20 L960 290 L40 290 Z', '#1d3557'),
  path('M-70 20 L1040 20 L1020 80 L-50 80 Z', '#f4f1ea'),
  rect(-40, 200, 1020, 30, '#e63946'),
  ...Array.from({ length: 10 }, (_, i) => circ(60 + i * 90, 140, 16, '#9ad0ec')),
  rect(-60, 0, 1100, 24, '#a47551'), rect(-60, 0, 1100, 8, '#c8966c'),
  // 船室
  rrect(320, -160, 420, 160, 14, '#f4f1ea'), rect(320, -160, 420, 20, '#ffffff'),
  ...[0, 1, 2, 3, 4].map(i => rrect(344 + i * 78, -120, 56, 44, 8, '#5d8fb8')),
  rrect(440, -250, 180, 96, 10, '#f4f1ea'), ...[0, 1].map(i => rect(460 + i * 80, -226, 56, 36, '#5d8fb8')),
  rect(500, -330, 60, 90, '#e0443a'), rect(500, -330, 60, 20, '#1d3557'),
  // 手すり
  rect(-60, -60, 1100, 8, '#ffffff'), ...Array.from({ length: 23 }, (_, i) => rect(-56 + i * 48, -60, 6, 60, '#ffffff'))
], 0.1));
// 観覧車のゴンドラ（6色）
const GONDOLA = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043'];
GONDOLA.forEach((c, i) => {
  for (const lit of [false, true]) sprite('pf', `pf/gondola${i}${lit ? 'L' : ''}`, 38, 34, 3, 26, () => tr(3, 26, [
    rect(150, -300, 16, 60, '#8a8f99'),
    rrect(-20, -250, 360, 280, 60, shade(c, -0.25)),
    rrect(-20, -256, 360, 270, 60, c),
    rrect(10, -210, 300, 120, 30, lit ? '#ffe9a8' : '#dff1fb'),
    lit ? '' : path('M30 -200 L90 -200 L30 -120 Z', '#ffffff', { opacity: 0.6 }),
    rect(-20, -60, 360, 14, shade(c, 0.3), { opacity: 0.7 }),
    rect(0, 0, 320, 20, '#b8b4ab')
  ], 0.1));
});
