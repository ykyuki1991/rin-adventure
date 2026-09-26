// ステージ選択の「ぼうけんマップ」（神戸の地図の絵）。art/map.svg に書き出す
// 座標は 1000×440（ステージの丸の位置は js/main.js の MAP_NODES と同じ座標）。地名の文字はゲーム側で重ねる
import { picture } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade } from './svg.mjs';
import { st, cloverBlob } from './kit.mjs';

const W = 1000, H = 440;
// 海岸線（これより上が陸）
const COAST = 'M0,252 C60,256 110,262 150,270 C190,278 230,284 280,292 C320,300 360,308 400,318 C430,326 450,340 480,336 C520,330 560,308 610,304 C660,300 720,302 790,298 C860,294 930,292 1000,288';
const coastY = x => {
  const pts = [[0, 252], [150, 270], [280, 292], [400, 318], [480, 336], [610, 304], [790, 298], [1000, 288]];
  for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  return 288;
};
// 山の稜線（RIDGE）と、山のふもと（BASE）。BASE より上が山
const lerpY = (pts, x) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  return pts[pts.length - 1][1];
};
const RIDGE = 'M0,150 C60,120 100,110 130,100 C200,70 260,80 320,60 C380,40 430,60 480,40 C540,20 600,40 660,24 C720,12 790,18 850,12 C900,8 950,16 1000,10';
const ridgeY = x => lerpY([[0, 150], [130, 100], [200, 80], [260, 76], [320, 60], [380, 48], [430, 56], [480, 40], [540, 26], [600, 36], [660, 24], [720, 14], [790, 16], [850, 12], [900, 9], [950, 13], [1000, 10]], x);
const BASE = 'M0,244 C60,242 100,238 130,236 C220,230 300,210 380,190 C410,180 430,172 440,170 C470,178 490,188 500,190 C540,184 560,178 580,175 C610,168 630,160 640,160 C670,168 690,178 700,180 C740,176 770,172 790,170 C820,166 840,160 850,160 C880,162 900,164 920,165 C950,160 980,154 1000,150';
const baseY = x => lerpY([[0, 244], [130, 236], [220, 226], [300, 210], [380, 190], [440, 170], [500, 190], [580, 175], [640, 160], [700, 180], [790, 170], [850, 160], [920, 165], [1000, 150]], x);
const footY = baseY;

// ---------- 小さな建物と目印 ----------
function bldg(x, y, w, h, c, r, roof) {
  const out = [rect(x, y - h, w, h, c), rect(x + w * 0.7, y - h, w * 0.3, h, shade(c, -0.1))];
  for (let yy = y - h + 3; yy < y - 3; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3.5) out.push(rect(xx, yy, 1.6, 2, r() < 0.2 ? '#fff6c8' : '#9fc3dd', { opacity: 0.9 }));
  if (roof) out.push(path(`M${x - 1.5} ${y - h} L${x + w / 2} ${y - h - w * 0.45} L${x + w + 1.5} ${y - h} Z`, roof));
  else out.push(rect(x - 0.6, y - h - 1.2, w + 1.2, 1.6, shade(c, 0.4)));
  return out.join('');
}
function house(x, y, s, wall, roof) {
  return tr(x, y, [rect(-6, -8, 12, 8, wall), path('M-7.5 -8 L0 -14 L7.5 -8 Z', roof), rect(-4, -6, 2.6, 2.6, '#9fc3dd'), rect(1.5, -6, 2.6, 2.6, '#9fc3dd'), rect(-1, -3.6, 2, 3.6, shade(wall, -0.3))], s);
}
function tree(x, y, s, r) {
  const c = ['#3f8a3f', '#4f9a45', '#5dab4f'][Math.floor(r() * 3)];
  return [rect(x - 0.7 * s, y - 3 * s, 1.4 * s, 3 * s, '#7a5a3f'), cloverBlob(x, y - 6 * s, 7 * s, shade(c, -0.15)), cloverBlob(x, y - 6.8 * s, 6.2 * s, c, '#a6dc84')].join('');
}
function pine(x, y, s) {
  return tr(x, y, [rect(-0.8, -6, 1.6, 6, '#6b4a32'), ell(-3, -7, 5, 2.4, '#2f6a3a'), ell(2.5, -9.5, 4.5, 2.2, '#3a7a44'), ell(-1, -12, 3.6, 2, '#3f8a4a')], s);
}
// ポートタワー（赤いつづみ形）
function portTower(x, y, s) {
  return tr(x, y, [
    path('M-7 0 C-3 -14 -3 -26 -6 -40 L6 -40 C3 -26 3 -14 7 0 Z', '#e0443e'),
    path('M-4.5 0 C-1.5 -14 -1.5 -26 -4 -40', 'none', st('#ff8a7a', 1.2)),
    ...[-8, -16, -24, -32].map(yy => path(`M${-6 + Math.abs(yy + 20) * 0.05} ${yy} L${6 - Math.abs(yy + 20) * 0.05} ${yy}`, 'none', st('#a92a26', 0.8))),
    rect(-7, -44, 14, 5, '#f4f1ea'), rect(-5.5, -48, 11, 4, '#e0443e'), rect(-0.5, -54, 1, 6, '#e0443e')
  ], s);
}
// 海洋博物館（白い帆のような屋根）
function museum(x, y, s) {
  return tr(x, y, [
    rect(-16, -6, 32, 6, '#e9eef3'),
    path('M-16 -6 L-6 -26 L2 -8 L10 -24 L16 -6 Z', '#ffffff', { stroke: '#c9d6e2', strokeWidth: 0.8 }),
    path('M-12 -6 L-6 -26 M-2 -6 L-6 -26 M2 -8 L10 -24 M8 -6 L10 -24', 'none', st('#c9d6e2', 0.6))
  ], s);
}
// 観覧車
function wheel(x, y, s, cols) {
  const out = [circ(0, -18, 15, 'none', { stroke: '#ffffff', strokeWidth: 1.6 }), path('M-8 0 L0 -18 L8 0', 'none', st('#ffffff', 1.6))];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; out.push(path(`M0 -18 L${Math.cos(a) * 15} ${-18 + Math.sin(a) * 15}`, 'none', st('#ffffff', 0.6)), circ(Math.cos(a) * 15, -18 + Math.sin(a) * 15, 2.3, cols[k % cols.length])); }
  return tr(x, y, out, s);
}
// 南京町の門
function chinaGate(x, y, s) {
  return tr(x, y, [
    rect(-12, -14, 2.6, 14, '#d23a32'), rect(9.4, -14, 2.6, 14, '#d23a32'),
    rect(-11, -17, 22, 4, '#f2c14e'), path('M-16 -17 L-12 -23 L12 -23 L16 -17 Z', '#2f9a6a'), path('M-17 -17 Q0 -15 17 -17', 'none', st('#1f7a52', 1.2)),
    path('M-9 -26 L-6 -29 L6 -29 L9 -26 Z', '#2f9a6a'), rect(-4, -26, 8, 3, '#d23a32')
  ], s);
}
// 風見鶏の館
function weathercock(x, y, s) {
  return tr(x, y, [
    rect(-10, -12, 20, 12, '#c9573e'), path('M-12 -12 L0 -20 L12 -12 Z', '#8a3a2a'),
    rect(5, -26, 5, 14, '#c9573e'), path('M4 -26 L7.5 -32 L11 -26 Z', '#8a3a2a'), rect(7.2, -36, 0.8, 4, '#4a3a2a'),
    path('M5 -36 Q8 -39 11 -36 L9 -35 Z', '#3a3a3a'),
    ...[-7, -2, 3].map(xx => rrect(xx, -9, 3, 5, 1.4, '#ffffff'))
  ], s);
}
// ロープウェイ（ケーブルとゴンドラ）
function ropeway(x0, y0, x1, y1) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + 4;
  return [path(`M${x0} ${y0} Q${mx} ${my + 6} ${x1} ${y1}`, 'none', st('#4a4f57', 1)),
    tr(mx, my + 3, [path('M0 -6 L0 -2', 'none', st('#4a4f57', 0.8)), rrect(-4, -2, 8, 7, 2, '#e2453a'), rect(-3, -0.5, 6, 2.4, '#d9eef8')])].join('');
}
// 布引の滝
function falls(x, y, s) {
  return tr(x, y, [
    path('M-10 0 L-8 -26 L8 -26 L10 0 Z', '#6d7a70'), path('M-3 -26 L3 -26 L4 0 L-4 0 Z', '#dff4ff'),
    path('M-2 -24 L-1 -2 M1.5 -24 L2 -2', 'none', st('#ffffff', 0.8)), ell(0, 1, 9, 3, '#8fd3ef'), ell(0, 0, 6, 2, '#ffffff', { opacity: 0.8 })
  ], s);
}
// パンダ
function panda(x, y, s) {
  return tr(x, y, [
    ell(0, -5, 8, 6, '#ffffff'), circ(0, -14, 6.5, '#ffffff'), circ(-5, -19, 2.6, '#2a2a2e'), circ(5, -19, 2.6, '#2a2a2e'),
    ell(-2.4, -14.5, 1.8, 2.2, '#2a2a2e'), ell(2.4, -14.5, 1.8, 2.2, '#2a2a2e'), circ(-2.2, -14.8, 0.6, '#ffffff'), circ(2.6, -14.8, 0.6, '#ffffff'),
    ell(0, -11.6, 1.2, 0.8, '#2a2a2e'), ell(-6, -4, 2.6, 4, '#2a2a2e'), ell(6, -4, 2.6, 4, '#2a2a2e'),
    rect(9, -16, 1.4, 16, '#5aa84a'), ell(11, -13, 3, 1.2, '#6ab85a', { rot: -30 })
  ], s);
}
// 商店街のアーケード
function arcade(x, y, s) {
  return tr(x, y, [
    rect(-14, -10, 28, 10, '#f3e6d2'), path('M-16 -10 A16 9 0 0 1 16 -10 Z', '#d9eef8', { stroke: '#e6dcc6', strokeWidth: 1.4 }),
    ...[-10, -3, 4, 11].map((xx, i) => rect(xx - 2, -6, 4, 3, ['#e2453a', '#3f9a4a', '#f2b632', '#2f6fb8'][i])),
    rect(-14, -2, 28, 2, '#cfc8bb')
  ], s);
}
// 摩耶山の展望台と星
function kikusei(x, y, s) {
  return tr(x, y, [
    rect(-12, -7, 24, 7, '#e9e4dc'), rect(-14, -9, 28, 2.6, '#9aa4ad'), rect(-8, -5, 16, 2.4, '#9fc3dd'),
    path('M0 -26 L2.4 -19.5 L9 -19.3 L3.8 -15.2 L5.7 -8.8 L0 -12.6 L-5.7 -8.8 L-3.8 -15.2 L-9 -19.3 L-2.4 -19.5 Z', '#ffd24a', { stroke: '#e0a100', strokeWidth: 0.8 })
  ], s);
}
// 明石海峡大橋
function akashiBridge(x0, y0, x1, y1) {
  const out = [];
  const dx = x1 - x0, dy = y1 - y0;
  const at = t => [x0 + dx * t, y0 + dy * t];
  out.push(path(`M${x0} ${y0} L${x1} ${y1}`, 'none', st('#ffffff', 3.4)), path(`M${x0} ${y0} L${x1} ${y1}`, 'none', st('#b9c4cf', 1)));
  const [ax, ay] = at(0.3), [bx, by] = at(0.7);
  for (const [tx, ty] of [[ax, ay], [bx, by]]) out.push(rect(tx - 1.6, ty - 22, 3.2, 22, '#ffffff'), rect(tx - 2.6, ty - 22, 5.2, 2, '#e8edf2'));
  out.push(path(`M${x0} ${y0 - 2} Q${(x0 + ax) / 2} ${(y0 + ay) / 2 - 4} ${ax} ${ay - 21} Q${(ax + bx) / 2} ${(ay + by) / 2 - 6} ${bx} ${by - 21} Q${(bx + x1) / 2} ${(by + y1) / 2 - 4} ${x1} ${y1 - 2}`, 'none', st('#ffffff', 1.2)));
  return out.join('');
}
function sailboat(x, y, s, c = '#ffffff') {
  return tr(x, y, [path('M-8 0 L8 0 L6 3 L-6 3 Z', '#3a6ab0'), path('M0 -1 L0 -16 L8 -2 Z', c), path('M-1 -2 L-1 -12 L-7 -2 Z', '#f6f1e6'), rect(-0.5, -17, 1, 17, '#6b6b6b')], s);
}
function ferry(x, y, s) {
  return tr(x, y, [path('M-18 0 L18 0 L14 5 L-15 5 Z', '#2f4f7f'), rect(-14, -5, 26, 5, '#ffffff'), rect(-9, -9, 16, 4, '#ffffff'), rect(-2, -13, 4, 4, '#e2453a'), ...[-11, -6, -1, 4, 9].map(xx => rect(xx, -3.5, 3, 2, '#7fb6dd'))], s);
}
function gull(x, y, s) {
  return path(`M${x - 5 * s} ${y} Q${x - 2.5 * s} ${y - 3 * s} ${x} ${y} Q${x + 2.5 * s} ${y - 3 * s} ${x + 5 * s} ${y}`, 'none', st('#ffffff', 1.2 * s));
}
function parasol(x, y, c) {
  return [rect(x - 0.4, y - 8, 0.8, 8, '#8a6446'), path(`M${x - 6} ${y - 7} Q${x} ${y - 13} ${x + 6} ${y - 7} Z`, c), path(`M${x - 2} ${y - 7.6} Q${x} ${y - 12.6} ${x + 2} ${y - 7.6} Z`, '#ffffff', { opacity: 0.85 })].join('');
}
function palm(x, y, s) {
  return tr(x, y, [path('M0 0 Q2 -8 1 -16', 'none', st('#8a6446', 1.6)), ...[-60, -20, 20, 60, 100].map(a => path(`M1 -16 q${Math.cos((a - 90) * Math.PI / 180) * 7} ${Math.sin((a - 90) * Math.PI / 180) * 7 + 2} ${Math.cos((a - 90) * Math.PI / 180) * 10} ${Math.sin((a - 90) * Math.PI / 180) * 10 + 5}`, 'none', st('#3f9a4a', 2)))], s);
}

picture('map', W, H, defs => {
  const r = rng(4242);
  const out = [];
  // 海
  out.push(rect(0, 0, W, H, defs.linU([[0, '#9fe0fa'], [0.55, '#5cb8ea'], [1, '#2f8fd4']], 0, 240, 0, 440)));
  // 波とかがやき
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = 250 + r() * 190;
    if (y < coastY(x) + 10) continue;
    out.push(path(`M${x} ${y} q3 -2.4 6 0 q3 2.4 6 0`, 'none', st('#ffffff', 1.1, { opacity: 0.35 + r() * 0.3 })));
  }
  for (let i = 0; i < 30; i++) { const x = r() * W, y = 300 + r() * 140; if (y > coastY(x) + 14) out.push(circ(x, y, 0.9 + r(), '#ffffff', { opacity: 0.7 })); }
  // 淡路島
  out.push(path('M0,330 C40,322 90,330 140,352 C170,368 160,400 150,440 L0,440 Z', '#a9d18e'));
  out.push(path('M0,330 C40,322 90,330 140,352 C170,368 160,400 150,440', 'none', st('#f3e3b6', 4)));
  for (let i = 0; i < 26; i++) { const x = 8 + r() * 120, y = 350 + r() * 80; if (x < 140 - (y - 350) * 0.1) out.push(tree(x, y, 0.8, r)); }
  // 陸（平地）
  out.push(path(`${COAST} L1000,0 L0,0 Z`, defs.linU([[0, '#9fd48a'], [1, '#d7eebb']], 0, 150, 0, 320)));
  // 砂浜（須磨）と港の岸壁
  out.push(path('M150,270 C190,278 230,284 280,292 C320,300 360,308 400,318', 'none', st('#f6e3b0', 8)));
  out.push(path('M400,318 C430,326 450,340 480,336 C520,330 560,308 610,304 C660,300 720,302 790,298 C860,294 930,292 1000,288', 'none', st('#c9c3b8', 3.4)));
  out.push(path(COAST, 'none', st('#ffffff', 1.2, { opacity: 0.8 })));
  // ポートアイランドと橋
  out.push(path('M565,338 L640,338 L646,388 L570,392 Z', '#d7eebb', { stroke: '#c9c3b8', strokeWidth: 2.4 }));
  out.push(path('M598,306 L600,338', 'none', st('#e2453a', 2.4)));
  for (let i = 0; i < 12; i++) out.push(bldg(572 + (i % 6) * 11, 356 + Math.floor(i / 6) * 22, 7 + r() * 3, 8 + r() * 10, ['#eef2f6', '#dfe8f2', '#f6efe4'][i % 3], r));
  // 線路（JR・阪急）と電車
  out.push(path('M150,246 C300,258 420,262 560,258 C680,256 820,252 1000,246', 'none', st('#8d949c', 2.6)), path('M150,246 C300,258 420,262 560,258 C680,256 820,252 1000,246', 'none', st('#ffffff', 0.8, { strokeDasharray: '4 4' })));
  out.push(tr(800, 252, [rrect(-12, -5, 24, 5, 2, '#7a1f2b'), rect(-10, -4, 20, 1.6, '#e8d9b8'), rrect(12.5, -5, 12, 5, 2, '#7a1f2b')]));
  // 街（ビルと家）
  for (let i = 0; i < 170; i++) {
    const x = 170 + r() * 820, top = footY(x) + 20, bot = coastY(x) - 6;
    if (bot - top < 10) continue;
    const y = top + Math.pow(r(), 0.7) * (bot - top);
    const dense = x > 470 && x < 720;
    if (r() < (dense ? 0.55 : 0.3)) out.push(bldg(x, y, 6 + r() * 6, 8 + r() * (dense ? 26 : 12), ['#f4f6f8', '#e2eaf3', '#f6eee2', '#dfe9e4', '#f3e5e2'][Math.floor(r() * 5)], r));
    else out.push(house(x, y, 0.7 + r() * 0.3, ['#fbf4e6', '#f3efe8', '#fbe9e4'][Math.floor(r() * 3)], ['#d0613f', '#5b6576', '#3f8a6a', '#8a4a38'][Math.floor(r() * 4)]));
  }
  // 街路樹
  for (let i = 0; i < 60; i++) { const x = 170 + r() * 820, y = footY(x) + 20 + r() * (coastY(x) - footY(x) - 28); out.push(tree(x, y, 0.55, r)); }
  // 山なみ（奥の山・手前の六甲山）
  out.push(path(`${BASE} L1000,0 L0,0 Z`, defs.linU([[0, '#3f8a4a'], [1, '#5fae62']], 0, 0, 0, 240)));
  out.push(path(`${RIDGE} L1000,0 L0,0 Z`, defs.linU([[0, '#7fb8a8'], [1, '#6aa89a']], 0, 0, 0, 150)));
  for (let i = 0; i < 620; i++) {
    const x = r() * W, by = baseY(x), ry = ridgeY(x), y = ry + 3 + r() * (by - ry - 6);
    if (by - ry < 10) continue;
    const rr = 5 + r() * 5, c = r() < 0.35 ? '#3a7f3c' : r() < 0.6 ? '#4f9a45' : '#5dab4f';
    out.push(cloverBlob(x, y, rr, c, r() < 0.3 ? '#8fd07a' : null));
  }
  for (let i = 0; i < 160; i++) { const x = r() * W, y = 2 + r() * (ridgeY(x) - 4); if (ridgeY(x) > 8) out.push(cloverBlob(x, y, 4 + r() * 3, r() < 0.5 ? '#6aa89a' : '#79b4a2')); }
  // 山のひだ
  for (let i = 0; i < 12; i++) { const x = 160 + i * 72 + r() * 30; out.push(path(`M${x} ${baseY(x) - 4} Q${x + 10} ${baseY(x) - 30} ${x - 4} ${ridgeY(x) + 10}`, 'none', st('#2f6a3a', 5, { opacity: 0.22 }))); }
  // 稜線とふもとの明るいふち
  out.push(path(RIDGE, 'none', st('#a8dca0', 2.4, { opacity: 0.8 })), path(BASE, 'none', st('#bfe6a0', 3, { opacity: 0.8 })));
  // 桜（王子動物園・布引）
  for (let i = 0; i < 14; i++) { const x = 690 + r() * 90, y = 196 + r() * 40; out.push(cloverBlob(x, y, 5 + r() * 3, '#f7b6cf', '#ffe0ec')); }
  for (let i = 0; i < 6; i++) { const x = 612 + r() * 50, y = 150 + r() * 30; out.push(cloverBlob(x, y, 4 + r() * 2, '#f7b6cf', '#ffe0ec')); }
  // ラベンダー（ハーブ園）
  for (let k = 0; k < 4; k++) out.push(path(`M${590 + k * 5} ${98 - k * 4} q14 -3 26 -1`, 'none', st('#a88ad8', 3)));

  // ---------- 目印 ----------
  out.push(arcade(690, 268, 1));                      // 1 春日野道
  out.push(panda(760, 238, 1), wheel(700, 226, 0.75, ['#ff6b8a', '#ffd24a', '#6ad0ff', '#8ac926'])); // 2 王子動物園
  out.push(falls(642, 170, 1));                       // 3 布引の滝
  out.push(ropeway(528, 150, 600, 86));               // 4 ロープウェイ
  out.push(weathercock(478, 196, 1));                 // 5 北野
  out.push(chinaGate(604, 286, 0.95));                // 6 南京町
  out.push(portTower(492, 332, 0.8), museum(518, 336, 0.8), wheel(446, 330, 0.7, ['#ff6b8a', '#ffd24a', '#6ad0ff']), rect(430, 318, 14, 8, '#b85a44')); // 7 メリケン・ハーバーランド
  out.push(parasol(240, 290, '#e2453a'), parasol(256, 293, '#2f6fb8'), parasol(298, 300, '#f2b632'), palm(228, 292, 1), palm(316, 304, 0.9)); // 8 須磨
  out.push(akashiBridge(104, 268, 70, 338));          // 9 明石海峡大橋
  for (let i = 0; i < 7; i++) out.push(pine(122 + i * 9 + r() * 4, 262 + r() * 4, 0.9));
  out.push(tr(123, 255, [path('M-6 0 L-6 -10 L0 -15 L6 -10 L6 0 Z', '#bfe3d0'), path('M-7 -10 L0 -17 L7 -10 Z', '#8a4a38'), rect(-3, -8, 6, 4, '#ffffff')]));
  out.push(kikusei(830, 70, 1));                      // 10 摩耶山
  // 海の上
  out.push(ferry(700, 372, 1.1), sailboat(360, 372, 1), sailboat(250, 400, 0.8, '#ffd24a'), sailboat(860, 360, 0.9, '#ff9ac2'));
  out.push(gull(330, 344, 1), gull(345, 336, 0.8), gull(780, 340, 1), gull(200, 330, 0.8));
  // 雲
  for (const [x, y, s] of [[80, 60, 1], [360, 30, 0.8], [940, 110, 0.9]]) out.push(tr(x, y, [ell(0, 0, 26, 8, '#ffffff', { opacity: 0.9 }), circ(-10, -5, 9, '#ffffff', { opacity: 0.9 }), circ(4, -8, 11, '#ffffff', { opacity: 0.9 }), circ(16, -3, 7, '#ffffff', { opacity: 0.9 })], s));
  return out.join('');
});
