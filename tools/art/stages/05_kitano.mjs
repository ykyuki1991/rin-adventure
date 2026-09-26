// ステージ5「北野・異人館」を完成イメージ（北野の坂の上から港を見おろす絵）に合わせて描き直したもの
// 背景：空と雲 → 遠くの山・港の街・ポートタワー・海 → 坂の家なみと木 → 手前の洋館と木
// 地面：灰色の石のふち石＋石の段＋赤レンガの土どめ（ツタ・石の柱）、坂は石段
// 飾り（s5 シート）：風見鶏の館の塔と風見鶏・ラインの館ふうのクリーム色の洋館・英国館ふうの白い洋館
//                   黒い街灯・鉄のさく・花のプランター・イトスギ・針葉樹・丸い木・ツタ
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, cloud, museum } from '../bgs.mjs';
import { U, tile, SLOPES } from '../tiles.mjs';
import { clover, cloverBlob, st, G, win, flowerBox, TAU } from '../kit.mjs';

const TH = 'kitano';
const SH = 's5';
resetTheme(TH);
// タイルの絵は 0〜160 の外にはみ出さないように切り抜く（シートのとなりの絵をよごさない）
const tileC = (name, draw) => tile(name, defs => g(draw(defs), { 'clip-path': defs.clip('<rect x="0" y="0" width="160" height="160"/>') }));

// かすみ：遠いものほど空の色にまぜる
const HAZE = '#d6e8f4';
const hz = (c, k) => mix(c, HAZE, k);

// ========================================================================
// 背景
// ========================================================================
// 雲（大きくふわふわ）
bgLayer(TH, { f: 0.025, w: 1200, y: 0, h: 120 }, (defs, w) => {
  const r = rng(5101);
  const out = [];
  const spots = [[90, 30, 0.85], [330, 54, 0.55], [560, 22, 1.0], [800, 46, 0.7], [1040, 28, 0.9]];
  for (const [x, y, s] of spots) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#d8e6f2', '#ffffff')));
  for (let i = 0; i < 4; i++) { const x = r() * w, y = 74 + r() * 16, s = 0.3 + r() * 0.15; out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#e1edf7', null))); }
  return out.join('');
});

// ポートタワー（赤いつづみ形・白い展望台）
function portTower(x, y, s) {
  const out = [];
  const H = 40 * s;
  const shape = `M${x - 4.2 * s} ${y} C${x - 1.4 * s} ${y - H * 0.35} ${x - 1.2 * s} ${y - H * 0.55} ${x - 3.6 * s} ${y - H * 0.86} L${x + 3.6 * s} ${y - H * 0.86} C${x + 1.2 * s} ${y - H * 0.55} ${x + 1.4 * s} ${y - H * 0.35} ${x + 4.2 * s} ${y} Z`;
  out.push(path(shape, '#d8463c'));
  out.push(path(`M${x - 1.2 * s} ${y} C${x - 0.3 * s} ${y - H * 0.4} ${x - 0.3 * s} ${y - H * 0.55} ${x - 1.4 * s} ${y - H * 0.86} L${x + 0.6 * s} ${y - H * 0.86} C${x + 0.4 * s} ${y - H * 0.55} ${x + 0.5 * s} ${y - H * 0.4} ${x + 1.6 * s} ${y} Z`, '#f06a5c', { opacity: 0.8 }));
  for (let k = 1; k < 7; k++) { const yy = y - H * 0.86 * k / 7; out.push(rect(x - 4 * s, yy, 8 * s, 0.35 * s, '#a8322b', { opacity: 0.55 })); }
  out.push(rrect(x - 4.4 * s, y - H * 0.92, 8.8 * s, 2.4 * s, 0.6 * s, '#f6f3ec'), rect(x - 4.4 * s, y - H * 0.92 + 1.8 * s, 8.8 * s, 0.6 * s, '#c9c3b8'));
  out.push(rrect(x - 3.2 * s, y - H * 0.98, 6.4 * s, 2 * s, 0.6 * s, '#d8463c'), rect(x - 0.4 * s, y - H * 1.1, 0.8 * s, H * 0.12, '#e8e2d6'));
  return out.join('');
}
// 白いアーチ橋
function archBridge(x, y, w, h) {
  const out = [rect(x, y - 1.2, w, 1.6, '#f4f6f8'), rect(x, y + 0.4, w, 0.8, '#b9c6d2')];
  const a = x + w * 0.22, b = x + w * 0.78;
  out.push(path(`M${a} ${y} Q${(a + b) / 2} ${y - h * 2} ${b} ${y}`, 'none', st('#ffffff', 1.1)));
  out.push(path(`M${a + 3} ${y} Q${(a + b) / 2} ${y - h * 1.6} ${b - 3} ${y}`, 'none', st('#ffffff', 0.5, { opacity: 0.8 })));
  for (let k = 1; k < 10; k++) { const t = k / 10, px = a + (b - a) * t, py = y - h * 4 * t * (1 - t); out.push(rect(px - 0.2, py, 0.4, y - py, '#ffffff', { opacity: 0.85 })); }
  for (const px of [x + 2, a, b, x + w - 2]) out.push(rect(px - 0.6, y, 1.2, 5, '#d5dee6'));
  return out.join('');
}

// 遠くの山なみ・港の街・ポートタワー・海
bgLayer(TH, { f: 0.045, w: 1400, y: 40, h: 150 }, (defs, w) => {
  const r = rng(5201);
  const out = [];
  const R1 = [[2, 26], [3, 12], [7, 5]], R2 = [[2, 18], [4, 8], [9, 3]];
  out.push(path(ridgePath(w, 86, R1, 5203, 190), defs.linU([[0, '#9fbadb'], [1, '#c3d5ea']], 0, 60, 0, 112)));
  out.push(path(ridgePath(w, 97, R2, 5205, 190), defs.linU([[0, '#6f98c6'], [1, '#9dbbdb']], 0, 76, 0, 114)));
  // 山の明るい面（左上から光）
  for (let i = 0; i < 12; i++) {
    const x = (i + r() * 0.5) * (w / 12), top = ridgeY(w, 97, R2, 5205, x);
    out.push(wrap(w, x - 12, 30, xx => path(`M${xx} ${top + 2} Q${xx - 6} ${top + 8} ${xx - 12} ${top + 16}`, 'none', st('#a9c4e0', 3, { opacity: 0.6 }))));
  }
  out.push(rect(0, 100, w, 14, defs.linU([[0, '#dbe8f3', 0], [1, '#e2edf5', 0.6]], 0, 100, 0, 114)));
  // 海（手前ほどこい青）
  out.push(rect(0, 112, w, 78, defs.linU([[0, '#8cc4ea'], [0.2, '#5ba6e0'], [1, '#3a86cc']], 0, 112, 0, 190)));
  // 向こう岸の街（小さなビルがぎっしり）
  const cols = ['#eef2f6', '#dfe6ee', '#e9e4dc', '#d3dde8', '#f4f1ea', '#c9d5e2'];
  for (let x = -4; x < w;) {
    const nearTower = Math.abs(x - 640) < 260 || Math.abs(x - 1180) < 120;
    const bw = 3 + r() * 7, bh = (nearTower ? 5 : 2.5) + Math.pow(r(), 1.8) * (nearTower ? 16 : 8);
    const c = cols[Math.floor(r() * cols.length)];
    out.push(wrap(w, x, bw, xx => {
      const p = [rect(xx, 113 - bh, bw, bh, c), rect(xx + bw * 0.7, 113 - bh, bw * 0.3, bh, shade(c, -0.08))];
      for (let yy = 113 - bh + 1.6; yy < 111.5; yy += 2.4) p.push(rect(xx + 0.8, yy, bw - 1.6, 0.8, '#aebfd2', { opacity: 0.7 }));
      return p.join('');
    }));
    x += bw + 0.3 + r() * 1.2;
  }
  // 海岸の緑
  for (let i = 0; i < 30; i++) { const x = r() * w; out.push(wrap(w, x - 5, 10, xx => ell(xx + 5, 113, 4 + r() * 5, 1.6, '#9cc6a8', { opacity: 0.8 }))); }
  // ポートタワー・海洋博物館・橋
  out.push(portTower(640, 114, 1));
  out.push(museum(676, 114, 0.34, '#f7f9fb', '#c3cfdb'));
  out.push(archBridge(840, 112, 96, 7));
  out.push(portTower(640 + w, 114, 1));
  // 波止場・船・きらめき
  out.push(rect(560, 113, 180, 1.6, '#e6edf3'), rect(900, 113, 120, 1.4, '#e6edf3'));
  for (const [x, y, s] of [[480, 124, 1], [1010, 132, 0.8], [230, 140, 1.2]]) out.push(path(`M${x - 6 * s} ${y} L${x + 6 * s} ${y} L${x + 4.6 * s} ${y + 2 * s} L${x - 4.6 * s} ${y + 2 * s} Z`, '#ffffff'), rect(x - 2 * s, y - 2.2 * s, 4.4 * s, 2.2 * s, '#f3f5f7'), path(`M${x + 6 * s} ${y + 1.6 * s} L${x + 18 * s} ${y + 1.8 * s}`, 'none', st('#ffffff', 0.5, { opacity: 0.6 })));
  for (let i = 0; i < 70; i++) { const x = r() * w, y = 116 + Math.pow(r(), 0.8) * 60; out.push(wrap(w, x, 12, xx => rrect(xx, y, 3 + r() * 9, 0.7, 0.35, '#ffffff', { opacity: 0.35 + r() * 0.4 }))); }
  return tr(0, -40, out.join(''));
});

// ---------- 坂の家（背景用の小さな洋館） ----------
function hillHouse(x, y, w, h, wall, roof, r, k = 0) {
  const W = (c) => hz(c, k);
  const out = [rect(x, y - h, w, h, W(wall)), rect(x + w - w * 0.18, y - h, w * 0.18, h, W(shade(wall, -0.1)))];
  const kind = r();
  const rh = w * (kind < 0.5 ? 0.42 : 0.3);
  if (kind < 0.5) {
    // 切妻（三角の屋根）
    out.push(poly([[x - 1.6, y - h + 0.5], [x + w / 2, y - h - rh], [x + w + 1.6, y - h + 0.5]], W(roof)));
    out.push(poly([[x - 1.6, y - h + 0.5], [x + w / 2, y - h - rh], [x + w / 2, y - h - rh + 1.6], [x + 0.6, y - h + 0.5]], W(shade(roof, 0.22))));
  } else {
    // 寄棟（台形の屋根）
    out.push(poly([[x - 1.8, y - h + 0.5], [x + w * 0.22, y - h - rh], [x + w * 0.78, y - h - rh], [x + w + 1.8, y - h + 0.5]], W(roof)));
    out.push(rect(x + w * 0.22, y - h - rh, w * 0.56, 1, W(shade(roof, 0.25))));
  }
  out.push(rect(x - 1.8, y - h, w + 3.6, 1, W(shade(roof, -0.3))));
  if (r() < 0.6) out.push(rect(x + w * 0.7, y - h - rh * 0.9, 2.2, rh * 0.7, W('#a8563f')));
  // 窓（白いわくに青いガラス）
  const rows = Math.max(1, Math.floor((h - 3) / 6)), cols = Math.max(1, Math.floor((w - 3) / 6));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const wx = x + 2 + j * ((w - 4) / cols) + ((w - 4) / cols - 3) / 2, wy = y - h + 2.5 + i * 6;
    out.push(rect(wx - 0.5, wy - 0.5, 4, 4.4, W('#ffffff')), rect(wx, wy, 3, 3.4, W(r() < 0.2 ? '#cfe6f5' : '#7fa9cc')));
  }
  return out.join('');
}
const WALLS = ['#f6f1e6', '#f2e2c8', '#eef1f4', '#f7e8e0', '#e9efe2', '#fbf6ea'];
const ROOFS = ['#c25a40', '#5a6a84', '#4f8f73', '#b86a3e', '#7a5a8e', '#c25a40', '#44607e'];

// 坂の家なみと木（少しかすんだ、港の手前の丘）
bgLayer(TH, { f: 0.1, w: 1200, y: 96, h: 144 }, (defs, w) => {
  const r = rng(5301);
  const out = [];
  const RID = [[3, 7], [5, 4], [11, 2]];
  const K = 0.2;
  const TC = { d: hz('#3f8349', K), b: hz('#58a056', K), m: hz('#4d9350', K), l: hz('#a4d68e', K) };
  const top = x => ridgeY(w, 140, RID, 5303, ((x % w) + w) % w);
  out.push(path(ridgePath(w, 140, RID, 5303, 240), hz('#4f9150', K)));
  // 木のもこもこ（y0〜y1 の帯）
  const band = (n, y0, y1, r0, r1) => {
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = top(x) + y0 + r() * (y1 - y0), rr = r0 + r() * (r1 - r0);
      out.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y + 1.2, rr, TC.d) + clover(xx, y, rr * 0.9, r() < 0.5 ? TC.b : TC.m, r() < 0.5 ? TC.l : null)));
    }
  };
  const houses = (x0, gap, dy, hmin) => {
    for (let x = x0; x < w;) {
      const bw = 12 + r() * 12, y = top(x + bw / 2) + dy + r() * 5;
      out.push(wrap(w, x - 3, bw + 6, xx => hillHouse(xx, y, bw, hmin + r() * 5, WALLS[Math.floor(r() * WALLS.length)], ROOFS[Math.floor(r() * ROOFS.length)], r, K)));
      x += bw + gap + r() * gap;
    }
  };
  band(130, -2, 12, 3.5, 6.5);
  for (let i = 0; i < 24; i++) { const x = r() * w, y = top(x) + 8 + r() * 10, s = 0.6 + r() * 0.5; out.push(wrap(w, x - 5, 10, xx => cypressBg(xx, y, s, hz('#2f6e43', K), hz('#6fae6a', K)))); }
  houses(0, 16, 12, 7);
  band(125, 14, 34, 4.2, 7.2);
  houses(30, 22, 32, 9);
  band(110, 36, 70, 5, 8.5);
  for (let i = 0; i < 16; i++) { const x = r() * w, y = top(x) + 40 + r() * 16, s = 0.8 + r() * 0.4; out.push(wrap(w, x - 5, 10, xx => cypressBg(xx, y, s, hz('#2f6e43', K), hz('#6fae6a', K)))); }
  out.push(rect(0, 120, w, 120, defs.linU([[0, HAZE, 0.1], [1, HAZE, 0.02]], 0, 120, 0, 240)));
  return tr(0, -96, out.join(''));
});

// 背景用のイトスギ（ドット単位）
function cypressBg(x, y, s, c, light) {
  const h = 26 * s;
  return [
    path(`M${x} ${y - h} C${x + 4.6 * s} ${y - h * 0.62} ${x + 4.4 * s} ${y - h * 0.15} ${x + 1.2 * s} ${y} L${x - 1.2 * s} ${y} C${x - 4.4 * s} ${y - h * 0.15} ${x - 4.6 * s} ${y - h * 0.62} ${x} ${y - h} Z`, c),
    path(`M${x - 0.4} ${y - h * 0.9} C${x - 3 * s} ${y - h * 0.6} ${x - 3.2 * s} ${y - h * 0.3} ${x - 1.4 * s} ${y - h * 0.05}`, 'none', st(light, 1.3 * s, { opacity: 0.65 }))
  ].join('');
}

// 手前の丘：大きめの洋館・木・イトスギ
function villa(x, y, w, h, wall, roof, r) {
  const out = [];
  const rh = h * 0.55;
  out.push(rect(x, y - h, w, h, wall), rect(x + w - 4, y - h, 4, h, shade(wall, -0.1)));
  // 屋根（寄棟）と煙突
  out.push(rect(x + w * 0.68, y - h - rh - 3, 3.6, rh, '#a8563f'), rect(x + w * 0.68 - 0.6, y - h - rh - 4, 4.8, 1.4, '#8a4432'));
  out.push(poly([[x - 3, y - h + 1], [x + w * 0.2, y - h - rh], [x + w * 0.8, y - h - rh], [x + w + 3, y - h + 1]], roof));
  out.push(poly([[x - 3, y - h + 1], [x + w * 0.2, y - h - rh], [x + w * 0.24, y - h - rh], [x + 1, y - h + 1]], shade(roof, 0.2)));
  for (let k = 1; k < 4; k++) out.push(rect(x - 3 + k * w * 0.05, y - h + 1 - rh * k / 4, w + 6 - k * w * 0.1, 0.5, shade(roof, -0.15), { opacity: 0.6 }));
  out.push(rect(x - 3, y - h, w + 6, 1.4, shade(roof, -0.32)), rect(x - 2, y - h + 1.4, w + 4, 1.2, '#ffffff', { opacity: 0.5 }));
  // 屋根窓
  if (w > 34) out.push(poly([[x + w * 0.42, y - h - rh * 0.28], [x + w * 0.5, y - h - rh * 0.72], [x + w * 0.58, y - h - rh * 0.28]], shade(roof, -0.1)), rect(x + w * 0.46, y - h - rh * 0.42, w * 0.08, rh * 0.18, '#9cc0dc'));
  // 窓（白いわく・よろい戸）
  const cols = Math.max(2, Math.floor(w / 9)), rows = Math.max(1, Math.floor((h - 4) / 11));
  const sh = ['#3f8a64', '#5a7fa8', '#8a5a4a'][Math.floor(r() * 3)];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const cw = (w - 6) / cols, wx = x + 3 + j * cw + (cw - 4) / 2, wy = y - h + 3 + i * 11;
    out.push(rect(wx - 1.6, wy, 1.4, 7, sh), rect(wx + 4.2, wy, 1.4, 7, sh));
    out.push(rect(wx - 0.5, wy - 0.5, 5, 8, '#ffffff'), rect(wx, wy, 4, 7, '#86b2d4'), rect(wx + 1.8, wy, 0.4, 7, '#ffffff'), path(`M${wx} ${wy} L${wx + 1.6} ${wy} L${wx} ${wy + 3} Z`, '#ffffff', { opacity: 0.5 }));
    out.push(rect(wx - 1, wy + 7, 6, 0.8, shade(wall, -0.25)));
  }
  return out.join('');
}
bgLayer(TH, { f: 0.2, w: 1000, y: 118, h: 122 }, (defs, w) => {
  const r = rng(5401);
  const out = [];
  const RID = [[2, 6], [5, 3]];
  const TC = { d: '#3f7f47', b: '#58a052', m: '#4f9449', l: '#94cf7a' };
  out.push(path(ridgePath(w, 176, RID, 5403, 240), '#5d9a57'));
  // 洋館
  const spots = [[20, 50, 26], [170, 40, 22], [330, 58, 30], [520, 44, 24], [690, 52, 28], [860, 38, 22]];
  for (const [x, bw, bh] of spots) {
    const y = ridgeY(w, 176, RID, 5403, x + bw / 2) + 16 + r() * 6;
    out.push(wrap(w, x - 6, bw + 12, xx => villa(xx, y, bw, bh, WALLS[Math.floor(r() * WALLS.length)], ROOFS[Math.floor(r() * ROOFS.length)], r)));
  }
  // イトスギと丸い木
  for (let i = 0; i < 22; i++) {
    const x = r() * w, y = ridgeY(w, 176, RID, 5403, x) + 24 + r() * 12, s = 1 + r() * 0.6;
    out.push(wrap(w, x - 8, 16, xx => cypressBg(xx, y, s, '#336e45', '#5f9e5c')));
  }
  for (let i = 0; i < 180; i++) {
    const x = r() * w, top = ridgeY(w, 176, RID, 5403, x);
    const y = top + 14 + Math.pow(r(), 0.9) * 50, rr = 4.5 + r() * 4;
    out.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y + 1.5, rr, TC.d) + clover(xx, y, rr * 0.92, r() < 0.5 ? TC.b : TC.m, r() < 0.45 ? TC.l : null)));
  }
  out.push(rect(0, 150, w, 90, defs.linU([[0, HAZE, 0], [1, HAZE, 0.14]], 0, 150, 0, 240)));
  return tr(0, -118, out.join(''));
});

// 手前の植え込み（ぼかして、ピントの外れた感じ・地面より下だけ）
bgLayer(TH, { f: 1.3, w: 1300, y: 200, h: 40, fg: true }, (defs, w) => {
  const r = rng(5601);
  const blur = defs.blur(1.6);
  const out = [];
  for (const cx of [140, 700, 1120]) {
    const parts = [];
    for (let k = 0; k < 11; k++) {
      const x = cx + (k - 5) * 11 + r() * 8, y = 244 - r() * 6 - Math.cos((k - 5) / 5 * 1.3) * 7, rr = 9 + r() * 7;
      parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2b6436' : '#34763d', '#4f9a4c')));
    }
    for (let k = 0; k < 5; k++) { const x = cx + (k - 2) * 16 + r() * 8; parts.push(wrap(w, x - 6, 12, xx => circ(xx, 234 + r() * 4, 2.2, ['#ff9ab8', '#ffffff', '#ffe27a'][k % 3], { opacity: 0.9 }))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -200, out.join(''));
});

// ========================================================================
// 地面：灰色のふち石＋石の段＋赤レンガ（ツタ・石の柱）
// ========================================================================
const BRK = ['#b65a42', '#bf6449', '#ad5540', '#c46c50', '#b86048', '#a9503b', '#b35e49'];
const BRK_EDGE = '#b75c44', MORTAR = '#cdb7a0';
function brickBody(seed) {
  const r = rng(seed);
  const out = [rect(0, 0, U, U, MORTAR)];
  for (let row = 0; row < 4; row++) {
    const y = row * 40, off = row % 2 ? 40 : 0;
    for (let x = off - 80; x < U; x += 80) {
      const x0 = x + 3, x1 = x + 77;
      if (x1 <= 0 || x0 >= U) continue;
      const cross = x0 < 0 || x1 > U;
      const c = cross ? BRK_EDGE : BRK[Math.floor(r() * BRK.length)];
      const cx0 = Math.max(0, x0), cx1 = Math.min(U, x1);
      out.push(cross ? rect(cx0, y + 3, cx1 - cx0, 34, c) : rrect(cx0, y + 3, cx1 - cx0, 34, 4, c));
      out.push(rect(cx0 + (x0 < 0 ? 0 : 3), y + 4, cx1 - cx0 - (x0 < 0 ? 0 : 3) - (x1 > U ? 0 : 3), 5, shade(c, 0.2), { opacity: 0.75 }));
      out.push(rect(cx0, y + 30, cx1 - cx0, 7, shade(c, -0.2), { opacity: 0.6 }));
      if (!cross && r() < 0.4) out.push(circ(x0 + 12 + r() * 50, y + 14 + r() * 12, 2.4, shade(c, -0.14), { opacity: 0.8 }));
    }
  }
  return out.join('');
}
// ツタ（クローバーのような葉）
function ivyPatch(x, y, n, seed, len = 1) {
  const r = rng(seed);
  const out = [path(`M${x} ${y} Q${x - 8} ${y + n * 9 * len} ${x + 4} ${y + n * 18 * len}`, 'none', st('#3e7a34', 2.4))];
  for (let i = 0; i < n * 3; i++) {
    const lx = x - 12 + r() * 24, ly = y + r() * n * 18 * len;
    out.push(clover(lx, ly + 1.5, 6.5 + r() * 2.5, '#2f6d2c'), clover(lx, ly, 6 + r() * 2.5, r() < 0.5 ? '#4f9d3f' : '#5fae48', '#9ad67a'));
  }
  return out.join('');
}
// 灰色の切り石の段（ふち石のすぐ下）
const STONE = ['#c7c3bb', '#bcb8b0', '#cdc9c1', '#b6b2aa'];
function stoneCourse(y0, y1, v) {
  const out = [rect(0, y0, U, y1 - y0, '#8e8a83')];
  const xs = v % 2 ? [0, 56, 118, 160] : [0, 80, 160];
  xs.slice(0, -1).forEach((x, i) => {
    const xe = xs[i + 1], a = x === 0 ? 0 : 3, b = xe === U ? 0 : 3;
    const c = x === 0 || xe === U ? STONE[0] : STONE[(i + v) % STONE.length];
    out.push(rect(x + a, y0 + 3, xe - x - a - b, y1 - y0 - 6, c));
    out.push(rect(x + a, y0 + 3, xe - x - a - b, 4, '#e4e1db', { opacity: 0.8 }));
    out.push(rect(x + a, y1 - 9, xe - x - a - b, 6, '#9c978f', { opacity: 0.7 }));
  });
  return out.join('');
}
const CAP = { h: 40, base: '#dcd8d0', dark: '#a39e95', light: '#f7f5f0' };
{
  const body = (v) => [
    brickBody(5700 + v),
    v === 1 ? ivyPatch(96, 6, 5, 5740) : '',
    v === 2 ? g([ell(40, 150, 26, 7, '#5f8a4a', { opacity: 0.45 }), ell(120, 60, 10, 30, '#000000', { opacity: 0.05 })]) : ''
  ].join('');
  for (let v = 0; v < 5; v++) tileC(`t/${TH}/g/body${v}`, () => body(v));
  const top = (v) => [
    brickBody(5750 + v),
    stoneCourse(34, 92, v),
    rect(0, 92, U, 8, '#000000', { opacity: 0.18 }),
    rect(0, 34, U, 8, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 40, CAP.dark), rect(0, 0, U, 33, CAP.base), rect(0, 0, U, 5, CAP.light),
    rect(0, 26, U, 7, '#cbc6bd'),
    rect(v % 2 ? 60 : 100, 5, 2.5, 21, '#c2bdb3'),
    circ(30 + v * 17, 16, 1.6, '#c4bfb5'), circ(128 - v * 9, 12, 1.4, '#c4bfb5'),
    v === 1 ? ivyPatch(110, 38, 4, 5760, 1.2) : ''
  ].join('');
  for (let v = 0; v < 4; v++) tileC(`t/${TH}/g/top${v}`, () => top(v));
  tileC(`t/${TH}/g/edgeL`, defs => rect(0, 0, 26, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tileC(`t/${TH}/g/edgeR`, defs => rect(134, 0, 26, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tileC(`t/${TH}/g/topL`, () => [rect(0, 0, 10, 40, CAP.dark), rrect(0, 0, 8, 33, 3, '#d0cbc2'), rect(0, 0, 8, 5, CAP.light)].join(''));
  tileC(`t/${TH}/g/topR`, () => [rect(150, 0, 10, 40, CAP.dark), rrect(152, 0, 8, 33, 3, '#c9c4bb'), rect(152, 0, 8, 5, CAP.light)].join(''));
  // 石の柱（6マスごと）
  const pier = (y0) => {
    const out = [rect(40, y0, 80, U - y0, '#8a867f')];
    for (let y = y0, k = 0; y < U; y += 40, k++) {
      const x0 = k % 2 ? 44 : 50, x1 = k % 2 ? 116 : 110;
      out.push(rect(x0, y + 3, x1 - x0, 34, k % 2 ? '#c9c5bd' : '#bfbbb3'), rect(x0, y + 3, x1 - x0, 4, '#e6e3dd', { opacity: 0.8 }), rect(x0, y + 3, 4, 34, '#dedad3', { opacity: 0.7 }), rect(x1 - 6, y + 3, 6, 34, '#9f9a92', { opacity: 0.8 }));
    }
    out.push(rect(34, y0, 6, U - y0, '#000000', { opacity: 0.12 }), rect(120, y0, 8, U - y0, '#000000', { opacity: 0.16 }));
    return out.join('');
  };
  tileC(`t/${TH}/g/col`, () => pier(0));
  tileC(`t/${TH}/g/colTop`, () => [pier(40), rect(36, 0, 88, 40, CAP.dark), rect(36, 0, 88, 33, '#e3dfd8'), rect(36, 0, 88, 5, CAP.light), rect(36, 0, 3, 33, '#c7c2b9'), rect(121, 0, 3, 33, '#c7c2b9')].join(''));
  // 坂（石段のもようのふち石＋レンガ）
  for (const k of Object.keys(SLOPES)) tileC(`t/${TH}/g/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    const th = 44, ly = x => yl + (yr - yl) * x / 160;
    const n = Math.abs(yr - yl) > 100 ? 8 : 4, sw = 160 / n;
    const out = [g(brickBody(5780 + k.length), { 'clip-path': cp })];
    out.push(path(`M0 ${yl} L160 ${yr} L160 ${yr + th + 9} L0 ${yl + th + 9} Z`, '#000000', { opacity: 0.2 }));
    out.push(path(`M0 ${yl} L160 ${yr} L160 ${yr + th} L0 ${yl + th} Z`, CAP.dark));
    out.push(path(`M0 ${yl} L160 ${yr} L160 ${yr + th - 8} L0 ${yl + th - 8} Z`, CAP.base));
    // 石段の区切り（けあげの線と、ふみづらの明るい線）
    for (let i = 1; i < n; i++) { const x = i * sw; out.push(path(`M${x} ${ly(x) + 3} L${x} ${ly(x) + th - 8}`, 'none', st('#aaa59c', 2.4))); }
    for (let i = 0; i < n; i++) { const x0 = i * sw + 2, x1 = (i + 1) * sw - 2; out.push(path(`M${x0} ${ly(x0) + 10} L${x1} ${ly(x1) + 10}`, 'none', st('#ebe8e2', 2, { opacity: 0.7 }))); }
    out.push(path(`M0 ${yl + 2} L160 ${yr + 2}`, 'none', { stroke: CAP.light, strokeWidth: 4 }));
    return out.join('');
  });
  // 石のブロック
  tileC(`t/${TH}/hard`, () => [
    rrect(0, 0, U, U, 10, '#8f8b84'), rrect(4, 4, 152, 150, 8, '#c8c4bc'),
    path('M10 10 L150 10 L140 22 L22 22 L22 140 L10 150 Z', '#dedbd4'),
    path('M150 10 L150 150 L10 150 L22 140 L140 140 L140 22 Z', '#aaa59d'),
    circ(60, 70, 3, '#b6b2aa'), circ(110, 100, 2.5, '#b6b2aa')
  ].join(''));
}

// ========================================================================
// 異人館のかべ・屋根（タイルで作った家。屋根の上を歩ける）
// ========================================================================
const WINW = (o = {}) => {
  // 白いわくの縦長の窓（上げ下げ窓）
  const fr = o.frame || '#fbfaf5', gl = o.glass || '#7fb3db';
  const out = [];
  if (o.shut) out.push(rect(20, 22, 22, 112, o.shut), rect(118, 22, 22, 112, o.shut), ...[0, 1, 2, 3, 4, 5].map(k => rect(23, 30 + k * 17, 16, 4, shade(o.shut, -0.2)) + rect(121, 30 + k * 17, 16, 4, shade(o.shut, -0.2))));
  if (o.arch) {
    out.push(path('M40 140 L40 62 Q40 26 80 26 Q120 26 120 62 L120 140 Z', fr));
    out.push(path('M52 132 L52 64 Q52 38 80 38 Q108 38 108 64 L108 132 Z', gl));
    out.push(path('M56 66 Q60 46 74 42 L62 96 L56 96 Z', '#ffffff', { opacity: 0.5 }));
    out.push(rect(77, 36, 6, 98, fr), rect(52, 84, 56, 6, fr), path('M52 64 Q52 38 80 38', 'none', st(fr, 4)));
    out.push(path('M36 62 Q36 20 80 20 Q124 20 124 62', 'none', st(o.key || '#e9e2d2', 8)), rect(74, 12, 12, 16, o.key || '#e9e2d2'));
  } else {
    out.push(rect(42, 24, 76, 112, fr), rect(52, 34, 56, 92, gl));
    out.push(path('M56 38 L74 38 L56 72 Z', '#ffffff', { opacity: 0.5 }));
    out.push(rect(77, 32, 6, 96, fr), rect(50, 76, 60, 7, fr));
    if (o.curtain) out.push(path(`M52 34 L66 34 Q58 56 62 76 L52 76 Z`, o.curtain), path(`M108 34 L94 34 Q102 56 98 76 L108 76 Z`, o.curtain));
  }
  out.push(rect(34, 136, 92, 10, shade(fr, -0.12)), rect(34, 136, 92, 3, '#ffffff', { opacity: 0.6 }), rect(38, 146, 84, 5, '#000000', { opacity: 0.12 }));
  return out.join('');
};
// うろこの家：緑がかったうろこ形の天然スレート
function scales(base, light, dark, hi, rowH = 20, w = 40) {
  const out = [rect(0, 0, U, U, dark)];
  const rows = [];
  for (let row = 0, y = -rowH; y < U; row++, y += rowH) rows.push([row, y]);
  for (const [row, y] of rows.reverse()) {
    for (let x = (row % 2) * (w / 2) - w; x < U + w; x += w) {
      const c = (row * 3 + Math.round(x / w)) % 5 === 0 ? shade(base, 0.08) : (row + Math.round(x / w)) % 4 === 0 ? shade(base, -0.06) : base;
      out.push(path(`M${x + 1} ${y} L${x + 1} ${y + rowH * 0.7} Q${x + 1} ${y + rowH + 6} ${x + w / 2} ${y + rowH + 8} Q${x + w - 1} ${y + rowH + 6} ${x + w - 1} ${y + rowH * 0.7} L${x + w - 1} ${y} Z`, c));
      out.push(path(`M${x + 5} ${y + rowH * 0.5} Q${x + 6} ${y + rowH + 2} ${x + w / 2} ${y + rowH + 4}`, 'none', st(light, 2.4, { opacity: 0.6 })));
    }
  }
  if (hi) out.push(rect(0, 0, U, U, hi));
  return out.join('');
}
const urokoWall = () => scales('#74b392', '#d2f2dc', '#3f7058');
tileC(`t/${TH}/m/uroko/hard`, () => urokoWall());
tileC(`t/${TH}/m/urokowin/hard`, () => urokoWall() + WINW({ frame: '#fbfaf5', glass: '#7fb3db', curtain: '#f4e6d0' }));
// 風見鶏の館：赤レンガと白いアーチ窓
function houseBrick() {
  const out = [rect(0, 0, U, U, '#e6cdb4')];
  for (let row = 0; row < 6; row++) {
    const y = row * 27, off = row % 2 ? 36 : 0;
    for (let x = off - 72; x < U; x += 72) {
      const x0 = Math.max(0, x + 2.5), x1 = Math.min(U, x + 69.5);
      if (x1 - x0 < 4) continue;
      const k = (row * 5 + Math.round(x / 72) * 3) % 4;
      const c = ['#c85f3f', '#d06a48', '#bd5838', '#cc6644'][k];
      out.push(rect(x0, y + 2.5, x1 - x0, 22, c), rect(x0, y + 2.5, x1 - x0, 4, '#e58a68', { opacity: 0.7 }));
    }
  }
  return out.join('');
}
tileC(`t/${TH}/m/brick/hard`, () => houseBrick());
tileC(`t/${TH}/m/brickwin/hard`, () => houseBrick() + WINW({ arch: true, frame: '#fbf8f0', glass: '#7fb3db', key: '#efe6d4' }));
// 萌黄の館：うすい緑の板張り
function siding() {
  const out = [rect(0, 0, U, U, '#b9dba5')];
  for (let y = 0; y < U; y += 32) out.push(rect(0, y, U, 27, '#c6e4b4'), rect(0, y, U, 4, '#e0f2d4'), rect(0, y + 25, U, 7, '#93be80'));
  return out.join('');
}
tileC(`t/${TH}/m/moegi/hard`, () => siding());
tileC(`t/${TH}/m/moegiwin/hard`, () => siding() + WINW({ frame: '#ffffff', glass: '#86bede', shut: '#5f9a6e' }));
// 屋根（坂と中身）：うろこ＝スレート、風見鶏＝赤茶、萌黄＝緑
const RF = {
  roofK: { base: '#5f7486', light: '#a9bccb', dark: '#435566', edge: '#e8eef2', edgeD: '#34414e' },
  roof: { base: '#b0553d', light: '#e59a7c', dark: '#853b28', edge: '#f7e4d6', edgeD: '#6e2e1f' },
  roofG: { base: '#4d8c6d', light: '#9fd3b5', dark: '#346a51', edge: '#eaf5ec', edgeD: '#28543f' }
};
for (const [name, c] of Object.entries(RF)) {
  const fill = () => scales(c.base, c.light, c.dark, null, 20, 32);
  tileC(`t/${TH}/m/${name}/hard`, () => fill());
  // 屋根のてっぺん（歩けるところ）：小さな塔屋（窓つき）
  tileC(`t/${TH}/m/${name}/hardT`, defs => [
    rect(0, 0, U, U, c.dark),
    rect(14, 30, 132, 130, '#f6f1e6'), rect(120, 30, 26, 130, '#ddd5c4'),
    path('M46 150 L46 84 Q46 56 80 56 Q114 56 114 84 L114 150 Z', '#fbf8f0'),
    path('M56 150 L56 86 Q56 66 80 66 Q104 66 104 86 L104 150 Z', G(defs).glass),
    rect(78, 64, 4, 86, '#fbf8f0'), path('M60 88 Q62 72 74 68 L66 104 L60 104 Z', '#ffffff', { opacity: 0.5 }),
    rect(0, 0, U, 34, c.edgeD), rect(0, 0, U, 26, c.edge), rect(0, 0, U, 6, '#ffffff'),
    ...[20, 60, 100, 140].map(x => circ(x, 15, 4, shade(c.edge, -0.14))),
    rect(0, 34, U, 8, '#000000', { opacity: 0.18 })
  ].join(''));
  for (const k of Object.keys(SLOPES)) tileC(`t/${TH}/m/${name}/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    return [
      g(fill(), { 'clip-path': cp }),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 30} L0 ${yl + 30} Z`, '#000000', { opacity: 0.2 }),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 22} L0 ${yl + 22} Z`, c.edgeD),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 15} L0 ${yl + 15} Z`, c.edge),
      path(`M0 ${yl + 2} L160 ${yr + 2}`, 'none', { stroke: '#ffffff', strokeWidth: 4 })
    ].join('');
  });
}
// 風見鶏の館へ上がる白いベランダ（すり抜け足場）
tileC(`t/${TH}/m/wood/semi`, () => [
  rect(0, 44, U, 10, '#000000', { opacity: 0.18 }),
  ...[16, 56, 96, 136].map(x => rect(x, 44, 9, 80, '#efeae0') + rect(x + 6, 44, 3, 80, '#cfc8ba')),
  rect(0, 110, U, 10, '#e6e0d4'),
  rect(0, 0, U, 44, '#b7ae9e'), rect(0, 0, U, 36, '#f6f2ea'), rect(0, 0, U, 6, '#ffffff'),
  rect(0, 30, U, 6, '#3f8a64'), rect(78, 6, 3, 24, '#ddd6c8')
].join(''));

// ========================================================================
// 飾り（s5 シート）。座標は 0.1ドット単位、原点は足もと
// ========================================================================
// 白いわくのアーチ窓
function archWin(Gd, x, y, w, h, o = {}) {
  const fr = o.frame || '#fbf8f0', r = w / 2, fw = o.fw ?? 14;
  const out = [];
  out.push(path(`M${x - fw} ${y + h} L${x - fw} ${y + r} A${r + fw} ${r + fw} 0 0 1 ${x + w + fw} ${y + r} L${x + w + fw} ${y + h} Z`, fr));
  out.push(path(`M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z`, o.glass || Gd.glass));
  if (o.curtain) out.push(path(`M${x} ${y + r} L${x + w * 0.24} ${y + r} Q${x + w * 0.1} ${y + h * 0.6} ${x + w * 0.18} ${y + h} L${x} ${y + h} Z`, o.curtain), path(`M${x + w} ${y + r} L${x + w * 0.76} ${y + r} Q${x + w * 0.9} ${y + h * 0.6} ${x + w * 0.82} ${y + h} L${x + w} ${y + h} Z`, o.curtain));
  out.push(path(`M${x + w * 0.14} ${y + r * 0.9} Q${x + w * 0.2} ${y + r * 0.3} ${x + w * 0.4} ${y + r * 0.15} L${x + w * 0.2} ${y + h * 0.55} L${x + w * 0.14} ${y + h * 0.55} Z`, '#ffffff', { opacity: 0.45 }));
  out.push(rect(x + w / 2 - fw * 0.3, y, fw * 0.6, h, fr), rect(x, y + r + (h - r) * 0.35, w, fw * 0.5, fr));
  if (o.key !== false) out.push(rect(x + w / 2 - fw * 0.9, y - fw * 1.3, fw * 1.8, fw * 2, o.key || '#efe7d6'));
  out.push(rect(x - fw * 1.8, y + h, w + fw * 3.6, fw * 1.1, shade(fr, -0.14)), rect(x - fw * 1.8, y + h, w + fw * 3.6, fw * 0.35, '#ffffff', { opacity: 0.6 }));
  return out.join('');
}
// 上げ下げ窓（よろい戸つき）
function sash(Gd, x, y, w, h, o = {}) {
  const out = [];
  if (o.shut) { out.push(rect(x - w * 0.42 - 14, y - 6, w * 0.42, h + 12, o.shut), rect(x + w + 14, y - 6, w * 0.42, h + 12, o.shut)); for (let yy = y + 6; yy < y + h; yy += 18) out.push(rect(x - w * 0.42 - 10, yy, w * 0.42 - 8, 5, shade(o.shut, -0.22)), rect(x + w + 18, yy, w * 0.42 - 8, 5, shade(o.shut, -0.22))); }
  out.push(win(Gd, x, y, w, h, { frame: o.frame || '#fbf9f3', curtain: o.curtain, bar: true, fw: o.fw ?? 12 }));
  if (o.head) out.push(rect(x - 26, y - 34, w + 52, 20, o.head), rect(x - 26, y - 34, w + 52, 6, '#ffffff', { opacity: 0.6 }));
  return out.join('');
}
const IRON = '#2c3033', IRONL = '#5a6167';

// ---------- 風見鶏 ----------
sprite(SH, 's5/rooster', 28, 34, 14, 33, () => {
  const cu = '#c0633a', cuL = '#e9925a', cuD = '#823d20', red = '#e2453a', gold = '#e0a93a';
  const out = [];
  out.push(rect(-6, -176, 12, 176, IRON), rect(-6, -176, 4, 176, IRONL));
  out.push(rect(-96, -76, 192, 9, IRON), circ(-98, -72, 9, gold), circ(98, -72, 9, gold), circ(0, -72, 12, IRON), circ(0, -30, 10, IRON));
  // 矢
  out.push(rect(-118, -178, 236, 9, IRON), poly([[112, -196], [140, -174], [112, -152]], IRON), poly([[-134, -198], [-104, -182], [-104, -166], [-134, -150], [-120, -174]], IRON));
  // にわとり（右向き）
  const body = `M-40 -196 Q-70 -230 -56 -262 Q-40 -292 0 -284 Q30 -280 44 -300 Q46 -330 66 -334 Q92 -332 94 -304 Q94 -276 76 -258 Q66 -226 40 -206 Q10 -190 -40 -196 Z`;
  const tail = `M-44 -214 Q-104 -236 -118 -300 Q-120 -330 -96 -322 Q-104 -288 -70 -262 Q-90 -300 -70 -332 Q-50 -344 -52 -318 Q-58 -290 -38 -262 Z`;
  out.push(path(tail, cuD), path(tail, cu, { transform: 'translate(3 -4)' }));
  out.push(path(`M-100 -318 Q-104 -290 -76 -264`, 'none', st(cuL, 6, { opacity: 0.8 })), path(`M-64 -330 Q-58 -300 -44 -276`, 'none', st(cuL, 5, { opacity: 0.8 })));
  out.push(path(body, cuD, { transform: 'translate(0 5)' }), path(body, cu));
  out.push(path('M-30 -270 Q10 -276 30 -250 Q12 -226 -24 -232 Q-40 -246 -30 -270 Z', cuD, { opacity: 0.55 }));
  out.push(path('M-46 -262 Q-30 -284 4 -278', 'none', st(cuL, 7, { opacity: 0.8 })), path('M52 -318 Q64 -330 80 -326', 'none', st(cuL, 5, { opacity: 0.8 })));
  out.push(path('M56 -330 Q56 -350 66 -346 Q70 -360 80 -352 Q88 -362 94 -348 Q100 -340 92 -330 Z', red));
  out.push(poly([[92, -312], [116, -302], [92, -294]], gold), ell(84, -282, 8, 13, red));
  out.push(circ(76, -312, 7, '#ffffff'), circ(78, -312, 4.6, '#2a1a10'));
  out.push(rect(-12, -196, 7, 22, cuD), rect(12, -196, 7, 22, cuD), rect(-20, -178, 22, 6, cuD), rect(6, -178, 22, 6, cuD));
  return tr(14, 33, out.join(''), 0.1);
});

// ---------- 風見鶏の館の塔（赤レンガ・白いアーチ窓・とがった屋根） ----------
sprite(SH, 's5/tower', 50, 105, 25, 104, defs => {
  const Gd = G(defs), out = [];
  const W = 170;
  out.push(rect(-W, -600, W * 2, 600, '#e8cfb8'));
  out.push(g((() => { const o = []; for (let row = 0, y = -600; y < 0; row++, y += 30) for (let x = -W - (row % 2 ? 40 : 0); x < W; x += 80) { const x0 = Math.max(-W, x + 3), x1 = Math.min(W, x + 77); if (x1 - x0 > 6) o.push(rect(x0, y + 3, x1 - x0, 24, ['#c65e3e', '#cf6a48', '#bd5738', '#c96443'][(row * 3 + Math.floor((x + 400) / 80)) % 4]), rect(x0, y + 3, x1 - x0, 4, '#e58a68', { opacity: 0.6 })); } return o.join(''); })()));
  out.push(rect(-W, -600, W * 2, 600, defs.lin([[0, '#ffffff', 0.12], [0.3, '#ffffff', 0], [0.7, '#000000', 0], [1, '#000000', 0.2]], 0, 0, 1, 0)));
  // 角の白い石
  for (let k = 0, y = -600; y < -60; k++, y += 60) for (const sx of [-1, 1]) { const bw = k % 2 ? 50 : 34; out.push(rect(sx < 0 ? -W : W - bw, y + 2, bw, 28, '#f3eee3'), rect(sx < 0 ? -W : W - bw, y + 2, bw, 5, '#ffffff', { opacity: 0.7 })); }
  // 土台・帯
  out.push(rect(-W - 16, -70, W * 2 + 32, 70, '#cfc8bb'), rect(-W - 16, -70, W * 2 + 32, 10, '#e9e4db'), rect(-W - 16, -12, W * 2 + 32, 12, '#a9a296'));
  out.push(rect(-W - 10, -316, W * 2 + 20, 22, '#f4efe4'), rect(-W - 10, -316, W * 2 + 20, 6, '#ffffff'), rect(-W - 6, -294, W * 2 + 12, 8, '#000000', { opacity: 0.14 }));
  // 1階：アーチのドア
  out.push(path('M-62 -70 L-62 -200 A62 62 0 0 1 62 -200 L62 -70 Z', '#f3eee3'));
  out.push(path('M-48 -70 L-48 -196 A48 48 0 0 1 48 -196 L48 -70 Z', '#3f6f58'), path('M-48 -196 A48 48 0 0 1 48 -196 Z', '#9fcbe4'), rect(-2, -244, 4, 48, '#f3eee3'));
  out.push(rect(-40, -186, 34, 110, '#355f4b'), rect(6, -186, 34, 110, '#355f4b'), circ(-10, -126, 5, '#f2c94c'), circ(10, -126, 5, '#f2c94c'));
  // 2階：アーチ窓ふたつ
  out.push(archWin(Gd, -118, -548, 72, 190, { curtain: '#f6e2d2' }), archWin(Gd, 46, -548, 72, 190, { curtain: '#f6e2d2' }));
  // コーニス
  out.push(rect(-W - 26, -636, W * 2 + 52, 36, '#f4efe4'), rect(-W - 26, -636, W * 2 + 52, 8, '#ffffff'));
  for (let x = -W - 16; x < W + 16; x += 26) out.push(rect(x, -600, 14, 12, '#e3dccd'));
  out.push(rect(-W - 10, -588, W * 2 + 20, 10, '#000000', { opacity: 0.12 }));
  // とがった屋根（左が明るい）
  const R = 214, top = -968;
  out.push(poly([[-R, -632], [0, top], [R, -632]], '#a9503a'), poly([[-R, -632], [0, top], [0, -632]], '#c96a4c'));
  for (let k = 1; k < 9; k++) { const t = k / 9, y = -632 + (top + 632) * t; out.push(rect(-R * (1 - t), y - 2, R * 2 * (1 - t), 4, '#8a3e2a', { opacity: 0.45 })); }
  out.push(path(`M${-R} -632 L0 ${top}`, 'none', st('#e99a7c', 6, { opacity: 0.8 })));
  // 屋根窓
  out.push(poly([[-46, -690], [0, -772], [46, -690]], '#f4efe4'), rect(-40, -690, 80, 12, '#f4efe4'), path('M-24 -690 L-24 -724 A24 24 0 0 1 24 -724 L24 -690 Z', Gd.glass), rect(-2, -746, 4, 56, '#f4efe4'));
  out.push(rect(-R - 8, -640, R * 2 + 16, 14, '#6e2e1f'));
  // てっぺんの飾り
  out.push(rect(-6, -1040, 12, 80, IRON), circ(0, -986, 14, '#c8923a'), circ(-4, -990, 5, '#ffe2a0'));
  return tr(25, 104, out.join(''), 0.1);
});

// ---------- ラインの館ふうの洋館（クリーム色の板張り・緑の屋根・白いベランダ） ----------
sprite(SH, 's5/rhine', 122, 116, 5, 115, defs => {
  const Gd = G(defs), r = rng(5901), out = [];
  const W = 1120, wall = '#f3e4bf', shut = '#3f8a64';
  // 煙突
  for (const cx of [230, 900]) out.push(rect(cx - 34, -1150, 68, 200, '#b0563f'), rect(cx - 44, -1162, 88, 26, '#8a4030'), ...[0, 1, 2, 3, 4].map(k => rect(cx - 34, -1130 + k * 34, 68, 4, '#8a4030', { opacity: 0.5 })));
  // 屋根（寄棟・緑）
  const top = -1100;
  out.push(poly([[-46, -900], [250, top], [W - 250, top], [W + 46, -900]], '#4c8a6c'));
  out.push(poly([[-46, -900], [250, top], [300, top], [60, -900]], '#6fae8c'));
  for (let k = 1; k < 7; k++) { const t = k / 7, y = -900 + (top + 900) * t; out.push(rect(-46 + 296 * t, y - 2, W + 92 - 592 * t, 4, '#3a6e56', { opacity: 0.5 })); }
  out.push(rect(250, top - 8, W - 500, 12, '#3a6e56'));
  // 屋根窓
  out.push(poly([[480, -920], [560, -1040], [640, -920]], '#f7efd9'), rect(488, -930, 144, 30, '#f7efd9'), path('M522 -930 L522 -976 A38 38 0 0 1 598 -976 L598 -930 Z', Gd.glass), rect(557, -1010, 6, 80, '#f7efd9'), poly([[470, -918], [560, -1052], [650, -918], [636, -918], [560, -1030], [484, -918]], '#3a6e56'));
  // かべ
  out.push(rect(0, -900, W, 900, wall));
  for (let y = -890; y < -40; y += 26) out.push(rect(0, y, W, 3, '#e2cf9f'));
  out.push(rect(0, -900, W, 900, Gd.wallShade));
  out.push(rect(0, -900, 30, 900, '#fbf5e6'), rect(W - 30, -900, 30, 900, '#fbf5e6'), rect(W - 30, -900, 8, 900, '#e0d3b4'));
  // 軒（白い鼻かくし・持ち送り）
  out.push(rect(-50, -920, W + 100, 34, '#fbf8f0'), rect(-50, -920, W + 100, 8, '#ffffff'), rect(-40, -886, W + 80, 10, '#000000', { opacity: 0.12 }));
  for (let x = 20; x < W; x += 90) out.push(path(`M${x} -886 L${x + 22} -886 L${x + 22} -866 Q${x + 11} -862 ${x} -874 Z`, '#efe7d4'));
  // 2階の窓
  for (const cx of [150, 420, 700, 970]) out.push(sash(Gd, cx - 60, -820, 120, 210, { shut, curtain: '#f6e7cf' }));
  // 2階のベランダ（白い手すり）
  out.push(rect(-20, -520, W + 40, 24, '#f7f2e6'), rect(-20, -520, W + 40, 5, '#fffdf8'), rect(-20, -496, W + 40, 12, '#000000', { opacity: 0.12 }));
  out.push(rect(-20, -606, W + 40, 14, '#efe6d2'));
  for (let x = -6; x < W + 20; x += 32) out.push(rrect(x, -592, 12, 72, 5, '#f4efe2'), rect(x + 8, -592, 4, 72, '#d9cfba'));
  for (const x of [-20, 270, 550, 830, W + 4]) out.push(rect(x, -620, 36, 100, '#fbf8f0'), rect(x + 26, -620, 10, 100, '#ddd2bc'));
  // 1階：ベランダの柱と窓・ドア
  out.push(rect(0, -484, W, 420, '#000000', { opacity: 0.06 }));
  for (const cx of [150, 700, 970]) out.push(sash(Gd, cx - 64, -420, 128, 250, { shut, curtain: '#fff3d6' }));
  out.push(rect(360, -430, 120, 380, '#fbf8f0'), rect(374, -416, 92, 366, '#4a7a62'), rect(386, -402, 68, 150, '#bfe0f0'), rect(386, -236, 68, 170, '#3f6f58'), circ(446, -170, 6, '#f2c94c'), path('M360 -430 L420 -480 L480 -430 Z', '#fbf8f0'));
  for (const x of [40, 290, 560, 830, 1070]) {
    out.push(rect(x - 20, -484, 40, 434, '#fbf8f0'), rect(x + 8, -484, 12, 434, '#ddd2bc'), rect(x - 28, -484, 56, 18, '#ffffff'), rect(x - 26, -70, 52, 20, '#e6dfd0'));
  }
  // 土台と階段
  out.push(rect(-20, -52, W + 40, 52, '#cfc8bb'), rect(-20, -52, W + 40, 8, '#e9e4db'), rect(330, -60, 180, 60, '#d8d2c6'), rect(330, -60, 180, 8, '#eeeae3'), rect(310, -30, 220, 30, '#cbc4b7'));
  // 植え込み（ベランダの前）
  for (const cx of [150, 700, 970]) { out.push(cloverBlob(cx - 40, -64, 44, '#3f8a3f'), cloverBlob(cx + 36, -60, 40, '#3f8a3f'), cloverBlob(cx - 40, -70, 40, '#5dab4f', '#9ad47c'), cloverBlob(cx + 36, -66, 36, '#56a24a', '#9ad47c')); for (let k = 0; k < 4; k++) out.push(circ(cx - 70 + k * 40 + r() * 10, -86 + r() * 20, 7, ['#ff7a9a', '#ffffff', '#ffd24a', '#ff9ac2'][k])); }
  return tr(5, 115, out.join(''), 0.1);
});

// ---------- 英国館ふうの白い洋館（青いスレート屋根・出窓・丸窓） ----------
sprite(SH, 's5/eikoku', 106, 116, 5, 115, defs => {
  const Gd = G(defs), out = [];
  const W = 960, wall = '#f6f5f0', roof = '#56657c', shut = '#5a7fa8';
  // 煙突
  out.push(rect(760, -1060, 64, 200, '#9a8f86'), rect(750, -1072, 84, 24, '#7d736b'));
  // わきの屋根（寄棟）
  out.push(poly([[-44, -760], [160, -930], [800, -930], [W + 44, -760]], roof), poly([[-44, -760], [160, -930], [200, -930], [40, -760]], '#7d8ca3'));
  for (let k = 1; k < 5; k++) { const t = k / 5, y = -760 - 170 * t; out.push(rect(-44 + 204 * t, y - 2, W + 88 - 408 * t, 4, '#44526a', { opacity: 0.5 })); }
  // かべ
  out.push(rect(0, -760, W, 760, wall));
  for (let y = -750; y < -40; y += 26) out.push(rect(0, y, W, 3, '#e3e3dc'));
  out.push(rect(0, -760, W, 760, Gd.wallShade), rect(W - 26, -760, 26, 760, '#e4e3dc'));
  out.push(rect(-40, -776, W + 80, 26, '#ffffff'), rect(-34, -750, W + 68, 10, '#000000', { opacity: 0.1 }));
  // 正面の切妻（丸窓）
  const gx0 = 330, gx1 = 630;
  out.push(rect(gx0, -900, gx1 - gx0, 900, '#fbfaf6'), rect(gx1 - 20, -900, 20, 900, '#e6e5de'));
  for (let y = -890; y < -40; y += 26) out.push(rect(gx0, y, gx1 - gx0 - 20, 3, '#e8e8e1'));
  out.push(poly([[gx0 - 40, -890], [(gx0 + gx1) / 2, -1090], [gx1 + 40, -890]], roof), poly([[gx0 - 40, -890], [(gx0 + gx1) / 2, -1090], [(gx0 + gx1) / 2, -1060], [gx0 - 10, -890]], '#7d8ca3'));
  out.push(poly([[gx0 - 6, -896], [(gx0 + gx1) / 2, -1052], [gx1 + 6, -896]], '#ffffff'), poly([[gx0 + 14, -900], [(gx0 + gx1) / 2, -1030], [gx1 - 14, -900]], '#fbfaf6'));
  out.push(circ(480, -960, 44, '#ffffff'), circ(480, -960, 34, Gd.glass), path('M446 -960 L514 -960 M480 -994 L480 -926', 'none', st('#ffffff', 6)));
  // 窓
  for (const cx of [140, 820]) out.push(sash(Gd, cx - 58, -690, 116, 200, { shut, curtain: '#e6eef6' }));
  out.push(sash(Gd, 420, -760, 120, 190, { curtain: '#e6eef6' }));
  // 出窓（左）
  out.push(rect(40, -440, 220, 330, '#fbfaf6'), rect(40, -470, 220, 34, roof), rect(30, -474, 240, 10, '#44526a'));
  for (const [x, ww] of [[60, 50], [122, 56], [190, 50]]) out.push(rect(x, -420, ww, 230, Gd.glass), path(`M${x + 6} -414 L${x + 26} -414 L${x + 6} -370 Z`, '#ffffff', { opacity: 0.5 }), rect(x, -320, ww, 8, '#ffffff'));
  out.push(rect(40, -186, 220, 26, '#e8e6df'), rect(40, -160, 220, 50, '#f1f0ea'));
  // 右の窓
  out.push(sash(Gd, 760, -420, 120, 220, { shut, curtain: '#fff3d6' }));
  // げんかん（柱とペディメント）
  out.push(rect(395, -380, 170, 330, '#34506e'), rect(410, -366, 140, 150, '#a9cde6'), rect(410, -210, 140, 160, '#2c4560'), rect(478, -366, 4, 316, '#34506e'), circ(530, -150, 6, '#f2c94c'));
  out.push(poly([[350, -400], [480, -486], [610, -400]], '#ffffff'), poly([[370, -406], [480, -472], [590, -406]], '#eef0f2'), rect(350, -410, 260, 16, '#ffffff'));
  for (const x of [360, 580]) out.push(rect(x, -396, 26, 346, '#ffffff'), rect(x + 18, -396, 8, 346, '#dcdcd4'));
  // 土台・植木
  out.push(rect(-20, -52, W + 40, 52, '#cfc8bb'), rect(-20, -52, W + 40, 8, '#e9e4db'), rect(370, -58, 220, 58, '#dcd6ca'), rect(370, -58, 220, 8, '#f0ece5'));
  for (const cx of [300, 660, 900]) out.push(cloverBlob(cx, -70, 46, '#3f8a3f'), cloverBlob(cx, -78, 40, '#5dab4f', '#9ad47c'), circ(cx - 14, -96, 7, '#ffffff'), circ(cx + 18, -84, 7, '#ff8ab0'));
  return tr(5, 115, out.join(''), 0.1);
});

// ---------- 黒い街灯（むかしのガス灯ふう） ----------
sprite(SH, 's5/lamp', 16, 62, 8, 61, defs => {
  const glass = defs.lin([[0, '#fffbe6'], [0.6, '#ffe7a8'], [1, '#f6c96a']]);
  return tr(8, 61, [
    rrect(-34, -60, 68, 60, 8, IRON), rect(-34, -60, 68, 10, IRONL), rrect(-24, -84, 48, 28, 6, IRON),
    path('M-12 -84 L-9 -470 L9 -470 L12 -84 Z', IRON), path('M-7 -84 L-5 -470 L0 -470 L-2 -84 Z', IRONL, { opacity: 0.8 }),
    rrect(-18, -180, 36, 18, 6, IRON), rrect(-16, -400, 32, 16, 6, IRON),
    rect(-44, -430, 88, 8, IRON), circ(-44, -426, 7, IRON), circ(44, -426, 7, IRON),
    // ランタン
    path('M-26 -482 L26 -482 L16 -470 L-16 -470 Z', IRON),
    path('M-30 -572 L30 -572 L24 -482 L-24 -482 Z', glass),
    rect(-3, -572, 6, 90, IRON, { opacity: 0.8 }), path('M-30 -572 L-24 -482', 'none', st(IRON, 5)), path('M30 -572 L24 -482', 'none', st(IRON, 5)),
    path('M-24 -566 L-12 -566 L-20 -500 Z', '#ffffff', { opacity: 0.7 }),
    path('M-44 -572 L44 -572 L20 -604 L-20 -604 Z', IRON), rect(-44, -576, 88, 6, IRONL),
    circ(0, -612, 9, IRON), rect(-2, -628, 4, 16, IRON)
  ], 0.1);
});

// ---------- 鉄のさく（黒・槍の先の形） ----------
sprite(SH, 's5/fence', 32, 15, 0, 14, () => tr(0, 14, [
  rect(0, -118, 320, 9, IRON), rect(0, -118, 320, 3, IRONL), rect(0, -30, 320, 8, IRON),
  ...Array.from({ length: 8 }, (_, i) => { const x = 20 + i * 40; return [rect(x - 3, -128, 6, 128, IRON), poly([[x - 7, -128], [x, -142], [x + 7, -128]], IRON)].join(''); }),
  ...Array.from({ length: 8 }, (_, i) => path(`M${i * 40} -106 Q${i * 40 + 20} -80 ${i * 40 + 40} -106`, 'none', st(IRON, 4)))
], 0.1));
// さくの柱（玉のかざり）
sprite(SH, 's5/fencepost', 5, 18, 2.5, 17, () => tr(2.5, 17, [
  rect(-12, -134, 24, 134, '#3a3f43'), rect(-12, -134, 7, 134, IRONL), rrect(-17, -148, 34, 14, 4, IRON), circ(0, -160, 11, IRON), circ(-3, -163, 4, IRONL)
], 0.1));

// ---------- 花のプランター（レンガ） ----------
sprite(SH, 's5/planter', 36, 22, 1, 21, () => {
  const r = rng(5951), out = [];
  for (let i = 0; i < 12; i++) out.push(cloverBlob(20 + i * 28 + r() * 10, -120 - r() * 30, 34 + r() * 10, i % 2 ? '#3f8a3f' : '#4a944a'));
  for (let i = 0; i < 10; i++) out.push(cloverBlob(26 + i * 30 + r() * 8, -130 - r() * 34, 26, '#5dab4f', '#9ad47c'));
  const fl = ['#ff6b8a', '#ffffff', '#ffd24a', '#c77ddf', '#ff9ac2'];
  for (let i = 0; i < 11; i++) { const fx = 24 + i * 29 + r() * 10, fy = -150 - r() * 40, c = fl[i % fl.length]; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; out.push(circ(fx + Math.cos(a) * 8, fy + Math.sin(a) * 8, 7, c)); } out.push(circ(fx, fy, 4.5, '#f7b733')); }
  out.push(rect(0, -110, 340, 110, '#b85c43'));
  for (let row = 0; row < 3; row++) for (let x = (row % 2) * 30 - 30; x < 340; x += 60) { const x0 = Math.max(0, x + 3), x1 = Math.min(340, x + 57); out.push(rect(x0, -84 + row * 28, x1 - x0, 22, (row + x) % 3 ? '#c46a4f' : '#b1553d')); }
  out.push(rect(-8, -118, 356, 26, '#d9d4cb'), rect(-8, -118, 356, 7, '#f2efe9'), rect(0, -92, 340, 8, '#000000', { opacity: 0.18 }));
  return tr(1, 21, out.join(''), 0.1);
});
// 植木ばち（テラコッタの壺）
sprite(SH, 's5/pot', 16, 24, 8, 23, () => {
  const r = rng(5961), out = [];
  out.push(cloverBlob(0, -150, 58, '#3f8a3f'), cloverBlob(0, -158, 52, '#5dab4f', '#9ad47c'));
  for (let i = 0; i < 6; i++) { const fx = -40 + r() * 80, fy = -190 + r() * 60; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; out.push(circ(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 6.5, i % 2 ? '#ff6b8a' : '#ffffff')); } out.push(circ(fx, fy, 4, '#f7b733')); }
  out.push(path('M-50 -104 L50 -104 Q56 -60 30 -20 L34 0 L-34 0 L-30 -20 Q-56 -60 -50 -104 Z', '#c0703a'), rect(-58, -116, 116, 20, '#d98a5a'), path('M-34 -96 Q-40 -60 -22 -30', 'none', st('#ffffff', 8, { opacity: 0.25 })));
  return tr(8, 23, out.join(''), 0.1);
});

// ---------- 木 ----------
// イトスギ（細長い）
sprite(SH, 's5/cypress', 18, 66, 9, 65, () => {
  const r = rng(5971), out = [];
  out.push(rect(-8, -40, 16, 40, '#6a4a32'));
  const H = 640;
  const shape = `M0 ${-H} C46 ${-H * 0.7} 70 ${-H * 0.35} 34 -30 L-34 -30 C-70 ${-H * 0.35} -46 ${-H * 0.7} 0 ${-H} Z`;
  out.push(path(shape, '#28603b'));
  for (let i = 0; i < 40; i++) { const t = r(), y = -40 - t * (H - 80), wdt = Math.sin(Math.min(1, (1 - t) * 1.3) * Math.PI * 0.55) * 60 * (0.4 + (1 - t) * 0.6); const x = (r() - 0.5) * wdt * 1.4; out.push(cloverBlob(x, y, 22 + r() * 12, x < 0 ? '#3f8a4f' : '#2f7042', x < -8 && r() < 0.6 ? '#7cc07a' : null)); }
  out.push(path(`M-6 ${-H + 40} C-30 ${-H * 0.6} -40 ${-H * 0.3} -22 -60`, 'none', st('#8fd08a', 5, { opacity: 0.45 })));
  return tr(9, 65, out.join(''), 0.1);
});
// 針葉樹（ヒマラヤスギふう・段になった枝）
sprite(SH, 's5/conifer', 36, 68, 18, 67, () => {
  const out = [rect(-12, -80, 24, 80, '#6a4a32')];
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers, y = -80 - t * 540, w = 170 * (1 - t * 0.8), h = 150;
    out.push(path(`M${-w} ${y} Q${-w * 0.4} ${y - h * 0.5} 0 ${y - h} Q${w * 0.4} ${y - h * 0.5} ${w} ${y} Q${w * 0.5} ${y - 18} 0 ${y - 8} Q${-w * 0.5} ${y - 18} ${-w} ${y} Z`, '#2c6a4a'));
    out.push(path(`M${-w * 0.9} ${y - 10} Q${-w * 0.4} ${y - h * 0.5} 0 ${y - h + 6} L0 ${y - 30} Q${-w * 0.5} ${y - 30} ${-w * 0.9} ${y - 10} Z`, '#4a8f68'));
    out.push(path(`M${-w * 0.7} ${y - 24} Q${-w * 0.35} ${y - h * 0.5} ${-6} ${y - h + 20}`, 'none', st('#8cc7a0', 5, { opacity: 0.6 })));
  }
  out.push(poly([[-10, -700], [0, -740], [10, -700]], '#2c6a4a'));
  return tr(18, 67, out.join(''), 0.1);
});
// 丸い木（クローバーの葉）
sprite(SH, 's5/tree', 60, 76, 30, 75, () => {
  const r = rng(5981), out = [];
  out.push(ell(0, -4, 160, 22, '#000000', { opacity: 0.12 }));
  out.push(path('M-26 0 C-18 -120 -30 -190 -70 -260 L-50 -270 C-22 -224 -8 -200 2 -290 L22 -286 C18 -200 26 -120 26 0 Z', '#7a5a3f'));
  out.push(path('M-4 -200 C30 -230 60 -250 90 -300 L100 -290 C70 -240 40 -220 4 -186 Z', '#7a5a3f'));
  const blobs = [];
  for (let i = 0; i < 28; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 200 * d, -450 + Math.sin(a) * 160 * d, 60 + r() * 32]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#347a3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 600) / 320; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4a9443' : r() < 0.5 ? '#58a64d' : '#63b255', t < 0.5 ? '#a6dc84' : null)); }
  for (let i = 0; i < 12; i++) out.push(circ(-150 + r() * 300, -600 + r() * 260, 8 + r() * 8, '#c2eca0', { opacity: 0.5 }));
  return tr(30, 75, out.join(''), 0.1);
});

// ---------- れんがの壁にたれるツタ（タイルの前に描く） ----------
for (let v = 0; v < 2; v++) sprite(SH, `s5/ivy${v}`, 46, 66, 23, 0, () => {
  const r = rng(5990 + v), out = [];
  const len = v ? 580 : 420;
  for (let s = 0; s < 4; s++) {
    const x0 = -150 + s * 100 + r() * 40, l = len * (0.45 + r() * 0.55);
    out.push(path(`M${x0} 20 Q${x0 + (r() - 0.5) * 80} ${l * 0.5} ${x0 + (r() - 0.5) * 40} ${l}`, 'none', st('#3e7a34', 6)));
    for (let k = 0; k < l / 32; k++) {
      const yy = 30 + k * 32 + r() * 10, xx = x0 + (r() - 0.5) * 56 * (yy / l);
      out.push(cloverBlob(xx, yy + 5, 32 + r() * 14, '#2a6428'), cloverBlob(xx, yy, 28 + r() * 12, r() < 0.5 ? '#4a9a40' : '#58a848', r() < 0.5 ? '#9ad67a' : null));
    }
  }
  for (let k = 0; k < 9; k++) { const xx = -190 + k * 48 + r() * 20; out.push(cloverBlob(xx, 34 + r() * 20, 38 + r() * 16, '#3a843a'), cloverBlob(xx, 28 + r() * 16, 34 + r() * 14, '#58a848', '#a6dc84')); }
  return tr(23, 0, out.join(''), 0.1);
});
