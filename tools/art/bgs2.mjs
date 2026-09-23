// 背景 その2（動物園・新神戸・布引の滝・ロープウェイ・三宮・南京町・須磨・舞子・明石海峡大橋・六甲山・掬星台）
// 座標はゲーム内の1ドット単位、画面の高さは240。横にくり返すので、はみ出す形は wrap で反対側にも描く
import { bgLayer } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from './svg.mjs';
import { wrap, ridgePath, ridgeY, cloud, canopy, farCity, house, apartment, building, tree, cypress, anchor, radioTower, portTowerFar, museum, bridge, cloudLayer, fgBushes, SKYCLOUD } from './bgs.mjs';

// ---------- 共通の道具 ----------
// 海（上のふちが明るい・波のきらめき）
function sea(w, y0, y1, c, r, sparkle = 24) {
  const out = [rect(0, y0, w, y1 - y0, c.base), rect(0, y0, w, 1.6, c.hi), rect(0, y0 + (y1 - y0) * 0.5, w, (y1 - y0) * 0.5, c.deep, { opacity: 0.5 })];
  for (let i = 0; i < sparkle; i++) out.push(rrect(r() * w, y0 + 3 + r() * (y1 - y0 - 6), 5 + r() * 14, 0.9, 0.45, c.glint || '#ffffff', { opacity: 0.35 + r() * 0.35 }));
  return out.join('');
}
// 島（淡路島など）
function island(x, y, w, h, col, hi) {
  return [path(`M${x} ${y} C${x + w * 0.15} ${y - h * 0.8} ${x + w * 0.35} ${y - h} ${x + w * 0.5} ${y - h * 0.9} C${x + w * 0.7} ${y - h * 0.8} ${x + w * 0.85} ${y - h * 0.5} ${x + w} ${y} Z`, col),
    hi ? path(`M${x + w * 0.2} ${y - h * 0.6} C${x + w * 0.3} ${y - h * 0.9} ${x + w * 0.45} ${y - h * 0.95} ${x + w * 0.5} ${y - h * 0.9}`, 'none', { stroke: hi, strokeWidth: 1.2, opacity: 0.6 }) : ''].join('');
}
// 明石海峡大橋（大きな主塔2本とケーブル）: 左の主塔 x1, 右の主塔 x2, 道路の高さ y, 塔の高さ h
function akashiBridge(x1, x2, y, h, c) {
  const out = [];
  const span = x2 - x1, side = span * 0.45;
  // ケーブル
  const cable = `M${x1 - side} ${y - 4} Q${x1 - side * 0.45} ${y - h * 0.55} ${x1} ${y - h} Q${(x1 + x2) / 2} ${y - 8} ${x2} ${y - h} Q${x2 + side * 0.55} ${y - h * 0.55} ${x2 + side} ${y - 4}`;
  // ハンガー（たて糸）
  for (let k = 1; k < 30; k++) {
    const t = k / 30, x = x1 + span * t;
    const cy = y - h + (h - 8) * (1 - Math.pow(2 * t - 1, 2));
    out.push(rect(x - 0.2, cy, 0.4, y - cy, c.line, { opacity: 0.6 }));
  }
  for (let k = 1; k < 12; k++) {
    for (const [a, b, s] of [[x1 - side, x1, -1], [x2, x2 + side, 1]]) {
      const t = k / 12, x = a + (b - a) * t;
      const tt = s < 0 ? t : 1 - t;
      const cy = y - 4 - (h - 4) * Math.pow(tt, 1.6);
      out.push(rect(x - 0.2, cy, 0.4, y - cy, c.line, { opacity: 0.5 }));
    }
  }
  out.push(path(cable, 'none', { stroke: c.cable, strokeWidth: 1.4 }));
  // 道路（トラス）
  out.push(rect(x1 - side - 20, y, span + side * 2 + 40, 4, c.deck), rect(x1 - side - 20, y, span + side * 2 + 40, 1.2, c.hi));
  for (let x = x1 - side - 20; x < x2 + side + 20; x += 4) out.push(path(`M${x} ${y + 1.5} L${x + 2} ${y + 4} L${x + 4} ${y + 1.5}`, 'none', { stroke: c.line, strokeWidth: 0.4, opacity: 0.7 }));
  // 主塔
  for (const x of [x1, x2]) {
    out.push(rect(x - 3.2, y - h - 3, 2.2, h + 16, c.tower), rect(x + 1, y - h - 3, 2.2, h + 16, c.tower));
    for (let k = 0; k < 4; k++) out.push(rect(x - 3.2, y - h + 4 + k * (h / 4.4), 6.4, 1.3, c.tower));
    out.push(rect(x - 3.6, y - h - 4, 7.2, 1.5, c.hi), rect(x - 1.8, y - h - 3, 1, h + 16, c.hi, { opacity: 0.5 }));
    out.push(rect(x - 5, y + 10, 10, 6, shade(c.tower, -0.2)));
  }
  return out.join('');
}
// 夜景の光のつぶ
function lights(w, top, bottom, n, r, cols = ['#ffd98a', '#ffffff', '#ff9a7a', '#ffe9a8'], sizeK = 1) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = top + Math.pow(r(), 0.7) * (bottom - top);
    const c = cols[Math.floor(r() * cols.length)];
    const s = (0.35 + r() * 0.55) * sizeK;
    out.push(circ(x, y, s, c, { opacity: 0.6 + r() * 0.4 }));
    if (r() < 0.06) out.push(circ(x, y, s * 4, c, { opacity: 0.12 }));
  }
  return out.join('');
}
// 星空
function starSky(theme, seed, n, o = {}) {
  bgLayer(theme, { f: 0.015, w: 1000, y: 0, h: o.h || 170 }, (defs, w, h) => {
    const r = rng(seed);
    const out = [];
    if (o.milky) {
      const mw = defs.lin([[0, '#9aa8ff', 0], [0.5, '#c9d0ff', 0.22], [1, '#9aa8ff', 0]], 0, 0, 0, 1);
      out.push(tr(0, 0, rect(-100, 30, w + 200, 60, mw), 1, -8));
      for (let i = 0; i < 260; i++) { const x = r() * w, y = 40 + (r() - 0.5) * 50 + (x / w) * -30 + 20; out.push(circ(x, y, 0.3 + r() * 0.4, '#ffffff', { opacity: 0.3 + r() * 0.4 })); }
    }
    for (let i = 0; i < n; i++) out.push(circ(r() * w, r() * (h - 10), 0.3 + r() * 0.8, r() < 0.85 ? '#ffffff' : '#ffe9a8', { opacity: 0.4 + r() * 0.6 }));
    for (let i = 0; i < 6; i++) { const x = r() * w, y = r() * 100; out.push(path(`M${x - 3} ${y} L${x + 3} ${y} M${x} ${y - 3} L${x} ${y + 3}`, 'none', { stroke: '#ffffff', strokeWidth: 0.5, opacity: 0.8 }), circ(x, y, 1.2, '#ffffff')); }
    if (o.moon) out.push(circ(o.moon[0], o.moon[1], 30, '#fff7d6', { opacity: 0.07 }), circ(o.moon[0], o.moon[1], 12, '#fff7d6'), circ(o.moon[0] + 5, o.moon[1] - 3, 11, '#141c48', { opacity: 0.25 }));
    return out.join('');
  });
}
// 松（遠く・小さい）
function pineFar(x, y, s, c) {
  const out = [path(`M${x - 1 * s} ${y} Q${x + 2 * s} ${y - 10 * s} ${x - 1 * s} ${y - 20 * s} L${x + 1 * s} ${y - 20 * s} Q${x + 4 * s} ${y - 10 * s} ${x + 1.5 * s} ${y} Z`, c.trunk)];
  for (const [dx, dy, rx] of [[-6, -19, 8], [5, -23, 7], [-1, -28, 6], [8, -15, 5], [-8, -13, 4.5]]) {
    out.push(ell(x + dx * s, y + dy * s + 1, rx * s, 3.2 * s, c.dark), ell(x + dx * s, y + dy * s, rx * s * 0.95, 2.8 * s, c.base));
  }
  return out.join('');
}
// 中華街の建物
function chinaHouse(x, y, w, h, r, lit) {
  const wall = ['#f3dcc0', '#efd2b0', '#f6e4cc'][Math.floor(r() * 3)];
  const out = [rect(x, y - h, w, h, wall), rect(x + w - 4, y - h, 4, h, shade(wall, -0.1))];
  // 赤い柱と2かいのベランダ
  for (const px of [x + 2, x + w - 5]) out.push(rect(px, y - h + 8, 3, h - 8, '#c62828'));
  out.push(rect(x, y - h * 0.55, w, 2.2, '#c62828'), rect(x, y - h * 0.55 - 5, w, 1, '#c62828'));
  for (let px = x + 3; px < x + w - 2; px += 3) out.push(rect(px, y - h * 0.55 - 5, 0.6, 5, '#c62828'));
  // 窓
  const nw = Math.max(1, Math.floor((w - 10) / 9));
  for (let i = 0; i < nw; i++) {
    const wx = x + 6 + i * ((w - 12) / nw);
    out.push(rrect(wx, y - h + 12, 5, 7, 2.4, lit ? '#ffd98a' : '#e8a86a'), rrect(wx, y - h * 0.55 + 5, 5, 7, 2.4, lit ? '#ffcf7a' : '#e8a86a'));
  }
  // 屋根（緑の瓦・はしがそり上がる）
  out.push(path(`M${x - 6} ${y - h + 1} Q${x - 2} ${y - h - 3} ${x + 3} ${y - h - 4} L${x + w - 3} ${y - h - 4} Q${x + w + 2} ${y - h - 3} ${x + w + 6} ${y - h + 1} L${x + w} ${y - h + 2} L${x} ${y - h + 2} Z`, '#2e8a64'));
  out.push(rect(x + 2, y - h - 5, w - 4, 1.4, '#7fd6ae'));
  // たての看板
  if (r() < 0.8) { const sx = x + w * (0.3 + r() * 0.4); out.push(rect(sx, y - h + 6, 5, 18, r() < 0.5 ? '#c62828' : '#ffd54f'), rect(sx + 1, y - h + 8, 3, 14, r() < 0.5 ? '#ffd54f' : '#c62828', { opacity: 0.6 })); }
  // お店の入り口
  out.push(rect(x + 5, y - 12, w - 10, 12, lit ? '#ffcf7a' : '#7a3a2a'), rect(x + 3, y - 14, w - 6, 2.4, '#c62828'));
  return out.join('');
}
// ちょうちんのひも（背景用）
function lanternString(x1, x2, y, sag, r, n, lit) {
  const out = [path(`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`, 'none', { stroke: '#3b2a1a', strokeWidth: 0.5 })];
  for (let i = 1; i < n; i++) {
    const u = i / n, lx = x1 + (x2 - x1) * u, ly = y + sag * 4 * u * (1 - u);
    if (lit) out.push(circ(lx, ly + 4, 6, '#ffb070', { opacity: 0.25 }));
    out.push(ell(lx, ly + 4, 2.6, 3.2, lit ? '#ff6a4a' : '#e53935'), rect(lx - 1.6, ly + 0.6, 3.2, 0.8, '#2b2b2b'), rect(lx - 1.6, ly + 7, 3.2, 0.8, '#2b2b2b'));
  }
  return out.join('');
}

// ========================================================================
// 王子動物園（春・桜）
// ========================================================================
cloudLayer('zoo', 211, 6, SKYCLOUD);
bgLayer('zoo', { f: 0.06, w: 1000, y: 80, h: 160 }, (defs, w) => tr(0, -80, [
  path(ridgePath(w, 130, [[2, 28], [3, 14], [7, 6]], 41), '#a9c8d8'),
  path(ridgePath(w, 146, [[2, 18], [5, 8], [11, 3]], 43), '#93bcb4'),
  canopy(w, 166, [[3, 12], [7, 5], [13, 2]], 47, { dark: '#6f9f86', base: '#7fb08f', mid: '#78a98a', light: '#a3cba8' }, { size: 5, step: 6 })
].join('')));
bgLayer('zoo', { f: 0.14, w: 900, y: 120, h: 120 }, (defs, w) => {
  const r = rng(221);
  const out = [farCity(w, 196, 223, ['#e6e9ef', '#dde3ea', '#efe9e1', '#e3e8e1'], { minW: 8, varW: 16, minH: 10, varH: 26, win: '#c9d4df' })];
  // 桜の丘（ピンクの木がならぶ）
  out.push(canopy(w, 190, [[3, 6], [8, 3]], 227, { dark: '#e79fbf', base: '#f7c3d7', mid: '#f4b3cc', light: '#ffe1ec' }, { size: 7, step: 8 }));
  for (let i = 0; i < 18; i++) out.push(circ(r() * w, 190 + r() * 16, 1, '#ffffff', { opacity: 0.8 }));
  out.push(rect(0, 204, w, 36, '#8fc47e'));
  return tr(0, -120, out.join(''));
});
bgLayer('zoo', { f: 0.3, w: 800, y: 110, h: 130 }, (defs, w) => {
  const r = rng(231);
  const out = [];
  // 動物の家（西洋館：旧ハンター住宅）
  out.push(wrap(w, 520, 90, xx => [house(xx, 200, 64, 34, '#f4f1e6', '#4f8f73', r, { chimney: true }), rect(xx + 4, 188, 56, 2, '#d8d2c4')].join('')));
  // 桜並木
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 88 + r() * 20;
    if (x > 500 && x < 620) continue;
    out.push(wrap(w, x - 22, 44, xx => [
      rect(xx + 20, 190, 3, 16, '#7a5236'),
      ...[[-12, -6, 12], [10, -8, 13], [0, -16, 13], [-4, -2, 11], [14, 2, 9]].map(([dx, dy, rr], k) => circ(xx + 22 + dx, 188 + dy, rr, ['#f9c6d9', '#f4a8c6', '#fbd9e6'][k % 3])),
      circ(xx + 16, 174, 4, '#ffffff', { opacity: 0.7 })
    ].join('')));
  }
  // 動物園のさく
  out.push(rect(0, 200, w, 2, '#6a8a5a'), rect(0, 192, w, 1.4, '#6a8a5a'));
  for (let x = 0; x < w; x += 8) out.push(rect(x, 190, 1.2, 14, '#6a8a5a'));
  out.push(rect(0, 204, w, 36, '#7fb86c'));
  return tr(0, -110, out.join(''));
});
fgBushes('zoo', 241, ['#3f7d3a', '#4d8f45', '#6fae5c'], ['#ffc0d8', '#ffffff', '#ff9ab8']);

// ========================================================================
// 新神戸（山のふもとの駅）
// ========================================================================
cloudLayer('shinkobe', 311, 5, SKYCLOUD, 50);
bgLayer('shinkobe', { f: 0.05, w: 1000, y: 30, h: 210 }, (defs, w) => {
  const A = [[2, 40], [3, 18], [7, 7]];
  const out = [path(ridgePath(w, 150, A, 51), '#8fb8a8')];
  out.push(canopy(w, 150, A, 51, { dark: '#5f9a78', base: '#6fac84', mid: '#67a37e', light: '#9ccfa6' }, { size: 6, step: 6 }));
  // ロープウェイのワイヤー（山をのぼる）
  const x0 = 560, y0 = ridgeY(w, 150, A, 51, 560) + 40, x1 = 760, y1 = ridgeY(w, 150, A, 51, 760) + 6;
  out.push(path(`M${x0} ${y0} L${x1} ${y1}`, 'none', { stroke: '#4a5a60', strokeWidth: 0.6 }));
  for (const t of [0.3, 0.7]) out.push(rrect(x0 + (x1 - x0) * t - 2, y0 + (y1 - y0) * t + 1, 4, 3.6, 1, '#e53935'));
  return tr(0, -30, out.join(''));
});
bgLayer('shinkobe', { f: 0.14, w: 900, y: 50, h: 190 }, (defs, w) => {
  const r = rng(321);
  const out = [];
  for (let x = 0; x < w;) {
    const bw = 16 + r() * 26, bh = 24 + r() * 50;
    const c = ['#e4e8ee', '#d6dde6', '#eceef2', '#dfe4ea'][Math.floor(r() * 4)];
    if (!(x > 280 && x < 360)) out.push(wrap(w, x, bw, xx => building(xx, 200 - bh, bw, bh, { wall: c, side: shade(c, -0.1), roof: shade(c, 0.1), win: '#aebfd2', r })));
    x += bw + 2 + r() * 6;
  }
  // 高いホテル
  out.push(building(300, 70, 40, 130, { wall: '#eef1f5', side: '#cdd5de', roof: '#ffffff', win: '#9fb6cf', r, winW: 3.4, winH: 2.4, gapX: 2.6, gapY: 2.2 }));
  out.push(rect(312, 60, 16, 10, '#dfe4ea'), rect(318, 50, 2, 10, '#9aa3ad'));
  out.push(rect(0, 200, w, 40, '#c7d0d8'));
  return tr(0, -50, out.join(''));
});
bgLayer('shinkobe', { f: 0.3, w: 800, y: 110, h: 130 }, (defs, w) => {
  const r = rng(331);
  const out = [];
  out.push(canopy(w, 196, [[4, 6], [9, 3]], 333, { dark: '#4f8f52', base: '#5fa45e', mid: '#579c58', light: '#8ccd82' }, { size: 7, step: 9 }));
  // 新幹線の高架
  out.push(rect(0, 160, w, 8, '#d9d6cf'), rect(0, 160, w, 2, '#f2f0ea'), rect(0, 168, w, 3, '#aca69b'));
  out.push(rect(0, 156, w, 4, '#c9c5bc', { opacity: 0.8 }));
  for (let x = 12; x < w; x += 80) out.push(rect(x, 171, 10, 40, '#c7c2b7'), rect(x, 171, 3, 40, '#e0dcd3'));
  // 電柱の柱（架線）
  for (let x = 40; x < w; x += 80) out.push(rect(x, 140, 1.4, 20, '#8a8f99'), rect(x - 4, 142, 9, 1, '#8a8f99'));
  out.push(path(`M0 143 L${w} 143`, 'none', { stroke: '#555', strokeWidth: 0.4, opacity: 0.6 }));
  out.push(rect(0, 208, w, 32, '#9db594'));
  return tr(0, -110, out.join(''));
});
fgBushes('shinkobe', 341, ['#3f7d3a', '#4d8f45', '#6fae5c']);

// ========================================================================
// 布引の滝（森の谷）
// ========================================================================
cloudLayer('falls', 411, 4, SKYCLOUD, 40);
bgLayer('falls', { f: 0.05, w: 1000, y: 40, h: 200 }, (defs, w) => {
  const out = [
    path(ridgePath(w, 110, [[2, 34], [3, 16], [7, 6]], 61), '#9cc4c0'),
    path(ridgePath(w, 132, [[2, 26], [5, 10], [11, 4]], 63), '#7fae9c')
  ];
  // 遠くの滝（がけから落ちる）
  const x = 640, top = ridgeY(w, 132, [[2, 26], [5, 10], [11, 4]], 63, 640) + 6;
  out.push(path(`M${x - 14} ${top + 4} L${x + 14} ${top} L${x + 18} 200 L${x - 18} 200 Z`, '#6d8f7e'));
  out.push(rect(x - 2.5, top + 2, 5, 200 - top, '#f4fbff', { opacity: 0.9 }), rect(x - 4, top + 2, 1.2, 200 - top, '#d9f1fb', { opacity: 0.7 }));
  out.push(ell(x, 200, 16, 5, '#ffffff', { opacity: 0.7 }));
  out.push(canopy(w, 166, [[3, 12], [7, 5], [13, 2]], 67, { dark: '#4f8a6a', base: '#5f9c76', mid: '#58946f', light: '#8cc49a' }, { size: 6, step: 6 }));
  return tr(0, -40, out.join(''));
});
bgLayer('falls', { f: 0.16, w: 900, y: 60, h: 180 }, (defs, w) => {
  const r = rng(421);
  const out = [canopy(w, 150, [[2, 16], [5, 8], [11, 3]], 423, { dark: '#2f6b48', base: '#3d8054', mid: '#377a4e', light: '#63a574' }, { size: 9, step: 9 })];
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = ridgeY(w, 150, [[2, 16], [5, 8], [11, 3]], 423, x) + 30 + r() * 30;
    out.push(wrap(w, x - 8, 16, xx => cypress(xx + 8, y, 1.1 + r() * 0.5, { base: '#24583a', light: '#3f7d52' })));
  }
  out.push(rect(0, 210, w, 30, '#2f6242'));
  return tr(0, -60, out.join(''));
});
bgLayer('falls', { f: 0.36, w: 800, y: 0, h: 240 }, (defs, w) => {
  const r = rng(431);
  const out = [];
  // 杉の幹（画面の上までのびる）と、ところどころの枝葉
  for (let i = 0; i < 9; i++) {
    const x = r() * w, tw = 5 + r() * 4;
    out.push(wrap(w, x - 16, tw + 32, xx => {
      const X = xx + 16;
      const parts = [rect(X, 0, tw, 220, '#5a4636'), rect(X, 0, tw * 0.35, 220, '#7a604a'), rect(X + tw * 0.75, 0, tw * 0.25, 220, '#44342a')];
      for (let k = 0; k < 3; k++) {
        const by = 10 + k * 40 + r() * 20, s = r() < 0.5 ? -1 : 1;
        parts.push(path(`M${X + tw / 2} ${by + 8} L${X + tw / 2 + s * 12} ${by}`, 'none', { stroke: '#44342a', strokeWidth: 1.4 }));
        parts.push(ell(X + tw / 2 + s * 14, by - 1, 10, 4.5, '#2f6242'), ell(X + tw / 2 + s * 13, by - 2.5, 7, 2.6, '#4f8a5a'));
      }
      return parts.join('');
    }));
  }
  // 苔むした岩
  for (let i = 0; i < 7; i++) {
    const x = r() * w, rw = 30 + r() * 30, rh = 14 + r() * 14;
    out.push(wrap(w, x, rw, xx => [ell(xx + rw / 2, 214, rw / 2, rh, '#6f6b5c'), ell(xx + rw / 2 - 3, 210, rw / 2 - 4, rh - 4, '#8a8575'), ell(xx + rw / 2 - 2, 214 - rh + 3, rw / 3, 4, '#5a9e4b')].join('')));
  }
  out.push(rect(0, 216, w, 24, '#3f6a3e'));
  return out.join('');
});
fgBushes('falls', 441, ['#2c5f2e', '#3a7a3a', '#4f944a']);

// ========================================================================
// 布引ロープウェイ（山の上から海と街を見下ろす）
// ========================================================================
bgLayer('ropeway', { f: 0.02, w: 1200, y: 110, h: 130 }, (defs, w) => {
  const r = rng(511);
  const out = [];
  out.push(sea(w, 168, 240, { base: '#6fb4e2', hi: '#d6f0fb', deep: '#3f8fcf' }, r, 40));
  // 港の街（ずっと下）
  out.push(farCity(w, 170, 513, ['#f0f2f5', '#e3e8ee', '#f4efe6', '#dbe3ec'], { minW: 3, varW: 7, minH: 3, varH: 10, win: '#c9d4df' }));
  // ポートアイランドと空港
  out.push(rect(420, 176, 120, 5, '#cfd9e3'), rect(600, 182, 90, 4, '#cfd9e3'), rect(606, 181, 70, 1, '#9aa7b4'));
  out.push(portTowerFar(330, 170, 0.3, false), museum(360, 170, 0.22, '#ffffff', '#c9d3de'));
  // 紀伊半島（うすく）
  out.push(path(`M780 168 Q880 156 1000 162 Q1100 158 1200 166 L1200 168 L780 168 Z`, '#9bbcd6', { opacity: 0.8 }));
  // 下のほうの雲
  for (const [x, y, s] of [[120, 188, 0.5], [520, 196, 0.6], [900, 190, 0.45]]) out.push(cloud(x, y, s, '#ffffff', '#e1edf5', null));
  return tr(0, -110, out.join(''));
});
cloudLayer('ropeway', 521, 5, SKYCLOUD, 50);
bgLayer('ropeway', { f: 0.12, w: 1000, y: 120, h: 120 }, (defs, w) => {
  const A = [[2, 20], [5, 8], [11, 3]];
  return tr(0, -120, [
    path(ridgePath(w, 196, A, 71), '#5f9c6a'),
    canopy(w, 196, A, 71, { dark: '#4f8f5a', base: '#5fa068', mid: '#57985f', light: '#8cc88e' }, { size: 7, step: 7 })
  ].join(''));
});
bgLayer('ropeway', { f: 0.3, w: 800, y: 140, h: 100 }, (defs, w) => {
  const r = rng(531);
  const out = [];
  // ハーブ園の段々畑（ラベンダー）
  out.push(path(`M0 196 Q200 186 400 192 T800 190 L800 240 L0 240 Z`, '#7fbf6a'));
  for (let row = 0; row < 3; row++) {
    const y = 198 + row * 9;
    const col = ['#9a7ad8', '#b58ae6', '#ffc2d8'][row % 3];
    for (let x = row * 7; x < w; x += 16) out.push(wrap(w, x, 14, xx => [ell(xx + 7, y + 2, 7, 3.2, '#5f9a4e'), ell(xx + 7, y, 6.4, 2.8, col), ell(xx + 5, y - 1, 2.4, 1.2, '#ffffff', { opacity: 0.4 })].join('')));
  }
  // 温室と西洋館
  out.push(wrap(w, 200, 70, xx => [
    path(`M${xx} 196 L${xx} 178 Q${xx + 32} 158 ${xx + 64} 178 L${xx + 64} 196 Z`, '#d8f1f8', { opacity: 0.95 }),
    ...[0, 1, 2, 3, 4, 5, 6].map(k => rect(xx + k * 10.6, 172, 0.8, 24, '#ffffff')),
    path(`M${xx} 178 Q${xx + 32} 158 ${xx + 64} 178`, 'none', { stroke: '#ffffff', strokeWidth: 1.2 })
  ].join('')));
  out.push(wrap(w, 560, 70, xx => house(xx, 196, 50, 26, '#f6f1e6', '#b24f3a', r, { chimney: true })));
  out.push(rect(0, 226, w, 14, '#6aa85a'));
  return tr(0, -140, out.join(''));
});
fgBushes('ropeway', 541, ['#3f7d3a', '#4d8f45', '#6fae5c'], ['#b58ae6', '#9a6ad8', '#ffffff', '#ffc2d8']);

// ========================================================================
// 三宮（ビルの街）
// ========================================================================
cloudLayer('sannomiya', 611, 5, SKYCLOUD, 40);
bgLayer('sannomiya', { f: 0.05, w: 1000, y: 70, h: 170 }, (defs, w) => {
  const A = [[2, 30], [5, 10], [11, 4]];
  return tr(0, -70, [
    path(ridgePath(w, 124, [[2, 28], [3, 14], [7, 6]], 81), '#a9c8d8'),
    path(ridgePath(w, 140, A, 83), '#93bcb4'),
    anchor(260, ridgeY(w, 140, A, 83, 260) + 16, 0.62, '#f4fbff'),
    canopy(w, 160, [[3, 12], [7, 5], [13, 2]], 87, { dark: '#6f9f86', base: '#7fb08f', mid: '#78a98a', light: '#a3cba8' }, { size: 5, step: 6 })
  ].join(''));
});
bgLayer('sannomiya', { f: 0.12, w: 900, y: 30, h: 210 }, (defs, w) => {
  const r = rng(621);
  const out = [];
  for (let x = 0; x < w;) {
    const bw = 18 + r() * 30, bh = 50 + r() * 90;
    const c = ['#cdd7e3', '#bfcadb', '#dfe5ec', '#b3c2d6', '#d8dfe8'][Math.floor(r() * 5)];
    out.push(wrap(w, x, bw, xx => [
      building(xx, 200 - bh, bw, bh, { wall: c, side: shade(c, -0.12), roof: shade(c, 0.12), win: '#8fb0d4', r, winW: 3, winH: 2.6, gapX: 2.4, gapY: 2.4 }),
      r() < 0.3 ? rect(xx + bw * 0.4, 200 - bh - 8, 1, 8, '#8a95a5') : '',
      r() < 0.25 ? path(`M${xx + 3} ${200 - bh + 4} L${xx + bw * 0.6} ${200 - bh + 4} L${xx + 3} ${200 - bh + bh * 0.5} Z`, '#ffffff', { opacity: 0.25 }) : ''
    ].join('')));
    x += bw + 1 + r() * 4;
  }
  out.push(rect(0, 200, w, 40, '#c3ccd6'));
  return tr(0, -30, out.join(''));
});
bgLayer('sannomiya', { f: 0.28, w: 800, y: 100, h: 140 }, (defs, w) => {
  const r = rng(631);
  const out = [];
  const signs = ['#e53935', '#ffb300', '#1e88e5', '#43a047', '#8e24aa', '#f4511e'];
  for (let x = 0; x < w;) {
    const bw = 30 + r() * 26, bh = 44 + r() * 40;
    const c = ['#efe9df', '#e3e7ec', '#f2e6d8', '#e6ece9', '#ece3ea'][Math.floor(r() * 5)];
    out.push(wrap(w, x, bw, xx => {
      const parts = [building(xx, 208 - bh, bw, bh, { wall: c, side: shade(c, -0.1), roof: shade(c, 0.1), win: '#9cb6cf', r, winW: 5, winH: 4, gapX: 3, gapY: 4 })];
      // 看板（横とたて）
      const sc = signs[Math.floor(r() * signs.length)];
      parts.push(rrect(xx + 3, 208 - bh + 6, bw - 6, 6, 1.5, sc), rect(xx + 5, 208 - bh + 8, bw - 10, 1.4, '#ffffff', { opacity: 0.8 }));
      if (r() < 0.6) parts.push(rect(xx + bw - 7, 208 - bh + 16, 5, 22, signs[Math.floor(r() * signs.length)]), rect(xx + bw - 6, 208 - bh + 18, 3, 18, '#ffffff', { opacity: 0.4 }));
      parts.push(rect(xx + 2, 196, bw - 4, 12, '#8fb6cf'), rect(xx, 194, bw, 2.4, shade(sc, -0.1)));
      return parts.join('');
    }));
    x += bw + 2 + r() * 6;
  }
  // ポートライナーの高架
  out.push(rect(0, 150, w, 6, '#e8ebef'), rect(0, 150, w, 1.6, '#ffffff'), rect(0, 156, w, 2, '#aeb6c0'));
  for (let x = 30; x < w; x += 96) out.push(rect(x, 158, 6, 50, '#d3d9e0'), rect(x, 158, 2, 50, '#eef1f4'));
  // 街路樹
  for (let i = 0; i < 7; i++) { const x = 40 + i * 115 + r() * 20; out.push(wrap(w, x - 12, 24, xx => tree(xx + 12, 212, 0.9, { base: '#5fa653', dark: '#468a42', light: '#88c874' }))); }
  out.push(rect(0, 208, w, 32, '#9aa3ad'));
  return tr(0, -100, out.join(''));
});

// ========================================================================
// 南京町（夕方・中華街）
// ========================================================================
bgLayer('nankin', { f: 0.015, w: 1200, y: 0, h: 180 }, (defs, w) => {
  const glow = defs.radU([[0, '#fff0c0', 0.9], [0.3, '#ffd08a', 0.5], [1, '#ffb070', 0]], 700, 170, 200);
  return [
    rect(0, 0, w, 180, glow),
    ...[[150, 60, 0.8], [520, 40, 0.9], [940, 70, 0.7]].map(([x, y, s]) => cloud(x, y, s, '#ffc9a0', '#f4a07e', '#ffe2c4')),
    ...[[300, 110, 120], [760, 126, 90], [1040, 100, 110]].map(([x, y, l]) => rrect(x, y, l, 2.4, 1.2, '#ffd0a8', { opacity: 0.7 }))
  ].join('');
});
bgLayer('nankin', { f: 0.08, w: 1000, y: 60, h: 180 }, (defs, w) => {
  const r = rng(821);
  const out = [];
  for (let x = 0; x < w;) {
    const bw = 20 + r() * 34, bh = 40 + r() * 80;
    const c = ['#d99a82', '#cf8f7a', '#e0a88c', '#c88672'][Math.floor(r() * 4)];
    out.push(wrap(w, x, bw, xx => building(xx, 190 - bh, bw, bh, { wall: c, side: shade(c, -0.12), roof: shade(c, 0.1), win: shade(c, -0.08), lit: 0.15, r })));
    x += bw + 1 + r() * 5;
  }
  out.push(rect(0, 190, w, 50, '#b97a64'));
  return tr(0, -60, out.join(''));
});
bgLayer('nankin', { f: 0.25, w: 900, y: 70, h: 170 }, (defs, w) => {
  const r = rng(831);
  const out = [];
  for (let x = 0; x < w;) {
    const bw = 44 + r() * 30, bh = 60 + r() * 34;
    out.push(wrap(w, x, bw + 8, xx => chinaHouse(xx, 210, bw, bh, r, false)));
    x += bw + 10 + r() * 8;
  }
  // 通りをわたるちょうちん
  for (let x = 0; x < w; x += 150) out.push(wrap(w, x, 150, xx => lanternString(xx, xx + 150, 94 + (x % 300 ? 6 : 0), 9, r, 8, false)));
  out.push(rect(0, 210, w, 30, '#a4604c'));
  return tr(0, -70, out.join(''));
});

// ========================================================================
// 須磨海岸（夏の海）
// ========================================================================
cloudLayer('suma', 911, 6, SKYCLOUD, 60);
bgLayer('suma', { f: 0.03, w: 1400, y: 110, h: 130 }, (defs, w) => {
  const r = rng(921);
  const out = [];
  out.push(island(860, 152, 520, 20, '#8fb3cc', '#c8dcea'));
  out.push(tr(0, 0, akashiBridge(700, 790, 146, 14, { tower: '#dfe8ee', cable: '#dfe8ee', deck: '#dfe8ee', hi: '#ffffff', line: '#dfe8ee' })));
  out.push(sea(w, 152, 240, { base: '#3fb0e0', hi: '#d6f4fb', deep: '#1f86c0' }, r, 60));
  // ヨットの帆
  for (const [x, y] of [[180, 166], [260, 172], [1100, 170]]) out.push(poly([[x, y], [x + 4, y - 11], [x + 5, y]], '#ffffff'), rect(x - 2, y, 9, 1.4, '#e0e8ee'));
  return tr(0, -110, out.join(''));
});
bgLayer('suma', { f: 0.07, w: 1000, y: 90, h: 150 }, (defs, w) => {
  const r = rng(931);
  // 須磨の山（鉢伏山）: 木でおおわれた丘。上のふちはもこもこ
  const P0 = [0, 180], C1 = [50, 120], C2 = [130, 104], P1 = [210, 106], C3 = [290, 108], C4 = [350, 140], P2 = [430, 180];
  const bez = (a, b, c, d, t) => [0, 1].map(k => (1 - t) ** 3 * a[k] + 3 * (1 - t) ** 2 * t * b[k] + 3 * (1 - t) * t * t * c[k] + t ** 3 * d[k]);
  const d = `M${P0} C${C1} ${C2} ${P1} C${C3} ${C4} ${P2} Z`;
  const out = [path(d, '#6a9f78')];
  const clip = defs.clip(`<path d="${d}"/>`);
  const inner = [];
  for (let i = 0; i < 90; i++) inner.push(circ(r() * 430, 100 + r() * 80, 5 + r() * 5, ['#6fac78', '#78b481', '#63a070'][i % 3]));
  for (let i = 0; i < 30; i++) inner.push(circ(r() * 430, 100 + r() * 70, 2.5 + r() * 2, '#9ccf9e', { opacity: 0.7 }));
  out.push(g(inner.join(''), { 'clip-path': clip }));
  for (let t = 0.02; t < 0.98; t += 0.035) {
    const [x, y] = t < 0.5 ? bez(P0, C1, C2, P1, t * 2) : bez(P1, C3, C4, P2, t * 2 - 1);
    out.push(circ(x, y + 3, 5.5 + r() * 2, r() < 0.5 ? '#6fac78' : '#78b481'), circ(x - 1.5, y + 1, 2.2, '#9ccf9e', { opacity: 0.8 }));
  }
  // 回転展望台
  out.push(rect(206, 99, 2, 9, '#e8e8e8'), ell(207, 97, 8, 3.4, '#f4f4f4'), ell(207, 96, 6, 1.8, '#9fd3ef'));
  out.push(rect(0, 178, 440, 2, '#f2e2b6', { opacity: 0.7 }));
  return tr(0, -90, out.join(''));
});
bgLayer('suma', { f: 0.2, w: 900, y: 130, h: 110 }, (defs, w) => {
  const r = rng(941);
  const out = [];
  // 波打ちぎわ・テトラ・防波堤
  out.push(rect(0, 190, w, 50, '#48bde6'), rect(0, 190, w, 2, '#e6fbff'));
  for (let i = 0; i < 26; i++) out.push(rrect(r() * w, 194 + r() * 20, 8 + r() * 16, 1.2, 0.6, '#ffffff', { opacity: 0.5 }));
  out.push(wrap(w, 600, 160, xx => [rect(xx, 184, 150, 6, '#c9c4bb'), rect(xx, 184, 150, 1.4, '#e8e4dc'), rect(xx + 144, 170, 6, 16, '#e0443a'), rect(xx + 143, 168, 8, 3, '#ffffff')].join('')));
  // 松林（遠く）
  for (let i = 0; i < 10; i++) { const x = r() * w; out.push(wrap(w, x - 10, 20, xx => pineFar(xx + 10, 190, 0.8 + r() * 0.3, { trunk: '#6b4a2e', dark: '#2a6a3e', base: '#3f8a52' }))); }
  // 砂浜
  out.push(path(`M0 222 Q150 214 300 220 T600 218 T900 222 L900 240 L0 240 Z`, '#f1ddb0'));
  out.push(path(`M0 222 Q150 214 300 220 T600 218 T900 222`, 'none', { stroke: '#ffffff', strokeWidth: 1.4, opacity: 0.8 }));
  return tr(0, -130, out.join(''));
});
fgBushes('suma', 951, ['#6f9a4a', '#8cb05a', '#a8c26a']);

// ========================================================================
// 舞子（明石海峡大橋が見える）
// ========================================================================
cloudLayer('maiko', 1011, 5, SKYCLOUD, 40);
bgLayer('maiko', { f: 0.03, w: 1400, y: 30, h: 210 }, (defs, w) => {
  const r = rng(1021);
  const out = [];
  out.push(island(700, 162, 720, 30, '#88aec6', '#c4d9e8'));
  out.push(sea(w, 160, 240, { base: '#4aa8df', hi: '#d6f0fb', deep: '#2078bb' }, r, 60));
  out.push(akashiBridge(420, 900, 150, 104, { tower: '#e8eef1', cable: '#d7e0e6', deck: '#dfe7ec', hi: '#ffffff', line: '#c4d0d8' }));
  // 橋のかげ
  out.push(rect(0, 166, w, 3, '#2d7ab8', { opacity: 0.3 }));
  return tr(0, -30, out.join(''));
});
bgLayer('maiko', { f: 0.2, w: 900, y: 130, h: 110 }, (defs, w) => {
  const r = rng(1031);
  const out = [];
  out.push(rect(0, 196, w, 44, '#3b9ad4'), rect(0, 196, w, 1.6, '#d6f0fb'));
  // 護岸と遊歩道
  out.push(rect(0, 204, w, 10, '#c9c7c0'), rect(0, 204, w, 2, '#ecebe6'));
  for (let x = 0; x < w; x += 10) out.push(rect(x, 198, 1, 6, '#6a7078'));
  out.push(rect(0, 198, w, 1, '#6a7078'));
  // 松
  for (let i = 0; i < 12; i++) { const x = r() * w; out.push(wrap(w, x - 14, 28, xx => pineFar(xx + 14, 208, 1.1 + r() * 0.5, { trunk: '#6b4a2e', dark: '#24603a', base: '#377e4c' }))); }
  out.push(rect(0, 214, w, 26, '#7fb86c'));
  return tr(0, -130, out.join(''));
});
fgBushes('maiko', 1041, ['#3f7d3a', '#4d8f45', '#6fae5c'], ['#ffffff', '#fff27a']);

// ========================================================================
// 明石海峡大橋の上（空と海）
// ========================================================================
cloudLayer('bridge', 1111, 7, SKYCLOUD, 80);
bgLayer('bridge', { f: 0.03, w: 1400, y: 100, h: 140 }, (defs, w) => {
  const r = rng(1121);
  const out = [];
  out.push(path(ridgePath(w, 150, [[2, 14], [5, 6]], 1123, 160), '#a8c4d6'));
  out.push(farCity(w, 158, 1125, ['#e8eef4', '#dde6ee'], { minW: 3, varW: 6, minH: 2, varH: 6, win: '#c9d4df' }));
  out.push(island(760, 158, 560, 20, '#86a9c0', '#c4d9e8'));
  out.push(sea(w, 158, 240, { base: '#3f98d8', hi: '#d6f0fb', deep: '#1a64a8' }, r, 70));
  return tr(0, -100, out.join(''));
});
bgLayer('bridge', { f: 0.1, w: 1000, y: 170, h: 70 }, (defs, w) => {
  const r = rng(1131);
  const out = [];
  for (let i = 0; i < 60; i++) {
    const x = r() * w, y = 176 + r() * 60, l = 6 + r() * 16;
    out.push(path(`M${x} ${y} q${l / 4} -2 ${l / 2} 0 t${l / 2} 0`, 'none', { stroke: '#ffffff', strokeWidth: 0.8, opacity: 0.35 + r() * 0.3 }));
  }
  return tr(0, -170, out.join(''));
});

// ========================================================================
// 六甲山（夜・1000万ドルの夜景）
// ========================================================================
starSky('rokko', 1211, 160, { moon: [760, 44] });
bgLayer('rokko', { f: 0.04, w: 1000, y: 130, h: 110, dim: true }, (defs, w) => {
  const r = rng(1221);
  const out = [];
  const glow = defs.lin([[0, '#3a3a78', 0], [1, '#5a4a80', 0.6]], 0, 0, 0, 1);
  out.push(rect(0, 140, w, 60, glow));
  out.push(lights(w, 144, 206, 1100, r));
  out.push(rect(0, 204, w, 36, '#0b1030'));
  out.push(lights(w, 204, 212, 60, r, ['#ffd98a', '#ff8fa3', '#9ad7ff']));
  out.push(portTowerFar(420, 204, 0.3, true));
  for (let i = 0; i < 30; i++) out.push(rrect(r() * w, 208 + r() * 28, 4 + r() * 10, 0.8, 0.4, r() < 0.5 ? '#ffd98a' : '#ff9a8a', { opacity: 0.4 }));
  return tr(0, -130, out.join(''));
});
bgLayer('rokko', { f: 0.14, w: 900, y: 120, h: 120 }, (defs, w) => {
  const r = rng(1231);
  const A = [[2, 8], [5, 4], [11, 2]];
  return tr(0, -120, [
    path(ridgePath(w, 222, A, 1233), '#0f1733'),
    canopy(w, 222, A, 1233, { dark: '#0b1228', base: '#121c3a', mid: '#0f1834', light: '#1e2b52' }, { size: 6, step: 7 }),
    ...Array.from({ length: 5 }, () => { const x = r() * w; return circ(x, ridgeY(w, 222, A, 1233, x) + 12, 1, '#ffd98a', { opacity: 0.8 }); })
  ].join(''));
});
bgLayer('rokko', { f: 0.36, w: 800, y: 110, h: 130 }, (defs, w) => {
  const r = rng(1241);
  const out = [];
  for (let i = 0; i < 8; i++) {
    const x = (i + r() * 0.5) * (w / 8), s = 0.9 + r() * 0.5;
    out.push(wrap(w, x - 16, 32, xx => r() < 0.5 ? cypress(xx + 16, 222, s * 1.2, { base: '#0a1022', light: '#16223e' }) : tree(xx + 16, 222, s, { base: '#0c1428', dark: '#080e1e', light: '#18244a', trunk: '#060a16' })));
  }
  // 山小屋の明かり
  out.push(wrap(w, 380, 40, xx => [rect(xx, 200, 30, 20, '#141a30'), poly([[xx - 3, 200], [xx + 15, 190], [xx + 33, 200]], '#0e1326'), rect(xx + 5, 205, 6, 5, '#ffd98a'), rect(xx + 18, 205, 6, 5, '#ffd98a'), circ(xx + 15, 207, 18, '#ffd98a', { opacity: 0.08 })].join('')));
  out.push(rect(0, 218, w, 22, '#070b18'));
  // ホタル
  for (let i = 0; i < 16; i++) { const x = r() * w, y = 170 + r() * 40; out.push(circ(x, y, 3, '#d9ffb0', { opacity: 0.15 }), circ(x, y, 0.8, '#eaffc8')); }
  return tr(0, -110, out.join(''));
});

// ========================================================================
// 掬星台（夜・星をすくう展望台）
// ========================================================================
starSky('kikusei', 1311, 240, { milky: true, h: 180 });
bgLayer('kikusei', { f: 0.04, w: 1000, y: 140, h: 100, dim: true }, (defs, w) => {
  const r = rng(1321);
  const out = [];
  const glow = defs.lin([[0, '#3a3a78', 0], [1, '#6a5090', 0.5]], 0, 0, 0, 1);
  out.push(rect(0, 150, w, 50, glow));
  out.push(lights(w, 162, 214, 1300, r, ['#ffd98a', '#ffffff', '#ff9a7a', '#ffe9a8', '#9ad7ff']));
  out.push(rect(0, 212, w, 28, '#070c26'));
  out.push(lights(w, 212, 218, 50, r, ['#ffd98a', '#ff8fa3']));
  out.push(portTowerFar(300, 212, 0.26, true));
  // 明石海峡大橋のあかり（遠く・右）
  out.push(path('M760 206 Q800 196 840 206 Q880 196 920 206', 'none', { stroke: '#9ad7ff', strokeWidth: 0.6, opacity: 0.8, strokeDasharray: '1.2 1.6' }));
  return tr(0, -140, out.join(''));
});
bgLayer('kikusei', { f: 0.2, w: 900, y: 180, h: 60 }, (defs, w) => {
  const r = rng(1331);
  const out = [path(ridgePath(w, 224, [[3, 6], [7, 3]], 1333), '#0a0f26')];
  for (let i = 0; i < 8; i++) { const x = r() * w; out.push(wrap(w, x - 12, 24, xx => tree(xx + 12, 228, 0.9 + r() * 0.4, { base: '#0c1330', dark: '#080d22', light: '#16204a', trunk: '#060a16' }))); }
  return tr(0, -180, out.join(''));
});
