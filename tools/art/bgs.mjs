// 背景（奥から手前へ何枚も重ねる）。座標はゲーム内の1ドット単位、画面の高さは240
// 横にくり返すので、右はしをはみ出す形は左はしにも描いてつなげる
import { bgLayer } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from './svg.mjs';

// はみ出した分を反対側にも描く
function wrap(w, x, width, draw) {
  const out = [draw(x)];
  if (x + width > w) out.push(draw(x - w));
  if (x < 0) out.push(draw(x + w));
  return out.join('');
}
// 周期的な山の稜線（w の整数倍の波を重ねるので、はしがつながる）
function ridgePath(w, base, amps, seed, bottom = 240, step = 4) {
  const r = rng(seed);
  const waves = amps.map(([k, a]) => [k, a, r() * Math.PI * 2]);
  let d = `M0 ${bottom}`;
  for (let x = 0; x <= w; x += step) {
    let y = base;
    for (const [k, a, ph] of waves) y -= a * (0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * k + ph));
    d += ` L${f(x)} ${f(y)}`;
  }
  return d + ` L${w} ${bottom} Z`;
}
function ridgeY(w, base, amps, seed, x) {
  const r = rng(seed);
  const waves = amps.map(([k, a]) => [k, a, r() * Math.PI * 2]);
  let y = base;
  for (const [k, a, ph] of waves) y -= a * (0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * k + ph));
  return y;
}
// ふわふわの雲（下が平ら）
function cloud(x, y, s, col, shadowCol, hi) {
  const bumps = [[-20, 2, 11], [-9, -6, 14], [6, -9, 16], [20, -2, 12], [30, 4, 8], [-30, 5, 7]];
  const out = [];
  const body = (dy, c) => [
    ...bumps.map(([bx, by, r]) => circ(x + bx * s, y + by * s + dy, r * s, c)),
    ell(x, y + 7 * s + dy, 38 * s, 7 * s, c)
  ].join('');
  if (shadowCol) out.push(body(2.5 * s, shadowCol));
  out.push(body(0, col));
  if (hi) out.push(circ(x - 2 * s, y - 12 * s, 7 * s, hi, { opacity: 0.7 }), circ(x + 10 * s, y - 11 * s, 5 * s, hi, { opacity: 0.6 }));
  return out.join('');
}
// 木でおおわれた丘（丸い木を並べる）
function canopy(w, base, amps, seed, c, o = {}) {
  const r = rng(seed + 1000);
  const out = [path(ridgePath(w, base + 6, amps, seed, o.bottom || 240), c.dark)];
  const step = o.step || 7;
  for (let x = -4; x < w + 4; x += step * (0.7 + r() * 0.6)) {
    const y = ridgeY(w, base, amps, seed, ((x % w) + w) % w);
    const rr = (o.size || 6) * (0.8 + r() * 0.5);
    out.push(wrap(w, x - rr, rr * 2, xx => circ(xx + rr, y + rr * 0.6, rr, r() < 0.5 ? c.base : c.mid || c.base)));
  }
  for (let x = 0; x < w; x += step * 1.6 * (0.7 + r() * 0.6)) {
    const y = ridgeY(w, base, amps, seed, x);
    const rr = (o.size || 6) * 0.45;
    out.push(wrap(w, x - rr, rr * 2, xx => circ(xx + rr - 1.5, y - rr * 0.1, rr, c.light, { opacity: 0.8 })));
  }
  return out.join('');
}
// 遠くの街（小さなビルがぎっしり）
function farCity(w, bottom, seed, cols, o = {}) {
  const r = rng(seed);
  const out = [];
  for (let x = -6; x < w; ) {
    const bw = (o.minW || 8) + r() * (o.varW || 16), bh = (o.minH || 10) + r() * (o.varH || 30);
    const c = cols[Math.floor(r() * cols.length)];
    out.push(wrap(w, x, bw, xx => {
      const parts = [rect(xx, bottom - bh, bw, bh, c), rect(xx + bw - bw * 0.22, bottom - bh, bw * 0.22, bh, shade(c, -0.06))];
      for (let yy = bottom - bh + 3; yy < bottom - 3; yy += 3.4) for (let wx = xx + 2; wx < xx + bw - 3; wx += 3) {
        const lit = o.lit && r() < o.lit;
        if (lit || r() < 0.8) parts.push(rect(wx, yy, 1.5, 1.6, lit ? '#ffd98a' : (o.win || shade(c, -0.1))));
      }
      if (r() < 0.2) parts.push(rect(xx + bw / 2 - 0.5, bottom - bh - 4, 1, 4, shade(c, -0.15)));
      return parts.join('');
    }));
    x += bw + r() * 1.5;
  }
  return out.join('');
}
// 家（切妻屋根・窓わく・ドア）
function house(x, y, w, h, wall, roof, r, o = {}) {
  const out = [rect(x, y - h, w, h, wall), rect(x + w - 3, y - h, 3, h, shade(wall, -0.08))];
  out.push(poly([[x - 3, y - h + 1], [x + w / 2, y - h - w * 0.32], [x + w + 3, y - h + 1]], roof));
  out.push(poly([[x - 3, y - h + 1], [x + w / 2, y - h - w * 0.32], [x + w / 2, y - h - w * 0.32 + 2.5], [x, y - h + 1.5]], shade(roof, 0.18)));
  out.push(rect(x - 3, y - h, w + 6, 1.4, shade(roof, -0.25)));
  const nWin = Math.max(1, Math.floor((w - 6) / 9));
  for (let i = 0; i < nWin; i++) {
    const wx = x + 4 + i * ((w - 8) / nWin) + ((w - 8) / nWin - 5) / 2;
    out.push(rect(wx - 0.6, y - h + 4.4, 6.2, 6.2, '#fbf8f1'), rect(wx, y - h + 5, 5, 5, o.lit ? '#ffd36b' : '#8fb6d4'), rect(wx + 2.2, y - h + 5, 0.6, 5, '#fbf8f1'));
  }
  if (h > 16) out.push(rect(x + w * 0.35, y - 9, 5, 9, '#8a6244'), rect(x + w * 0.35 - 1, y - 9.5, 7, 1, shade(wall, -0.2)));
  if (o.chimney) out.push(rect(x + w * 0.72, y - h - w * 0.26, 3, 6, shade(roof, -0.1)));
  return out.join('');
}
// マンション（ベランダつき）
function apartment(x, y, w, h, wall, r, o = {}) {
  const out = [rect(x, y - h, w, h, wall), rect(x + w - 4, y - h, 4, h, shade(wall, -0.08)), rect(x - 1, y - h - 1.5, w + 2, 2, shade(wall, 0.15))];
  for (let yy = y - h + 4; yy < y - 6; yy += 8) {
    out.push(rect(x + 1, yy + 4.6, w - 6, 1.4, shade(wall, -0.18)));
    for (let xx = x + 3; xx < x + w - 8; xx += 7) {
      const lit = o.lit && r() < o.lit;
      out.push(rect(xx, yy, 5, 4.4, lit ? '#ffd36b' : '#98b9d3'));
      if (r() < 0.25 && !o.lit) out.push(rect(xx + 0.5, yy + 1, 4, 3.2, ['#f4c7c7', '#fff1c7', '#cbe6c9'][Math.floor(r() * 3)], { opacity: 0.9 }));
    }
  }
  return out.join('');
}
// 窓のあるビル
function building(x, y, w, h, o) {
  const out = [rect(x, y, w, h, o.wall)];
  if (o.side) out.push(rect(x + w - Math.min(6, w * 0.2), y, Math.min(6, w * 0.2), h, o.side));
  if (o.roof) out.push(rect(x - 1, y - 2, w + 2, 3, o.roof));
  const r = o.r;
  const cw = o.winW || 3, ch = o.winH || 3.4, gx = o.gapX || 3, gy = o.gapY || 4;
  for (let yy = y + 5; yy < y + h - 6; yy += ch + gy) {
    for (let xx = x + 3; xx < x + w - cw - 2; xx += cw + gx) {
      const lit = o.lit && r() < o.lit;
      out.push(rect(xx, yy, cw, ch, lit ? (r() < 0.3 ? '#ffe9a8' : '#ffd36b') : o.win));
    }
  }
  return out.join('');
}
// 丸い木
function tree(x, y, s, c) {
  return [
    rect(x - 1.2 * s, y - 8 * s, 2.4 * s, 8 * s, c.trunk || '#6b4a30'),
    circ(x - 5 * s, y - 10 * s, 6 * s, c.dark), circ(x + 5 * s, y - 10 * s, 6 * s, c.dark),
    circ(x, y - 15 * s, 8 * s, c.base), circ(x - 5 * s, y - 11 * s, 5.5 * s, c.base), circ(x + 5 * s, y - 11 * s, 5.5 * s, c.base),
    circ(x - 2.5 * s, y - 18 * s, 3.5 * s, c.light)
  ].join('');
}
// 細長い木（イトスギ）
function cypress(x, y, s, c) {
  return [path(`M${x} ${y - 34 * s} C${x + 7 * s} ${y - 20 * s} ${x + 6 * s} ${y - 4 * s} ${x} ${y} C${x - 6 * s} ${y - 4 * s} ${x - 7 * s} ${y - 20 * s} ${x} ${y - 34 * s} Z`, c.base),
    path(`M${x} ${y - 30 * s} C${x - 4 * s} ${y - 18 * s} ${x - 4 * s} ${y - 8 * s} ${x - 1 * s} ${y - 2 * s}`, 'none', { stroke: c.light, strokeWidth: 1.4 * s, opacity: 0.6 })].join('');
}
// 錨のマーク（錨山）
function anchor(x, y, s, col) {
  return g([
    circ(x, y - 12 * s, 2.2 * s, 'none', { stroke: col, strokeWidth: 1.4 * s }),
    rect(x - 0.8 * s, y - 10 * s, 1.6 * s, 18 * s, col),
    rect(x - 5 * s, y - 7 * s, 10 * s, 1.5 * s, col),
    path(`M${x - 9 * s} ${y + 2 * s} Q${x - 8 * s} ${y + 9 * s} ${x} ${y + 9 * s} Q${x + 8 * s} ${y + 9 * s} ${x + 9 * s} ${y + 2 * s}`, 'none', { stroke: col, strokeWidth: 1.6 * s, strokeLinecap: 'round' }),
    poly([[x - 11 * s, y + 4 * s], [x - 9 * s, y], [x - 7 * s, y + 4 * s]], col), poly([[x + 7 * s, y + 4 * s], [x + 9 * s, y], [x + 11 * s, y + 4 * s]], col)
  ]);
}
// 電波塔
function radioTower(x, y, h, col) {
  return [path(`M${x - 2} ${y} L${x} ${y - h} L${x + 2} ${y} Z`, 'none', { stroke: col, strokeWidth: 0.7 }), rect(x - 0.4, y - h - 3, 0.8, 3, col),
    path(`M${x - 1.5} ${y - h * 0.3} L${x + 1.5} ${y - h * 0.3} M${x - 1} ${y - h * 0.6} L${x + 1} ${y - h * 0.6}`, 'none', { stroke: col, strokeWidth: 0.5 })].join('');
}
// ポートタワー（遠く）
function portTowerFar(x, y, s, lit) {
  const red = lit ? '#ff5a5a' : '#e0443a';
  return g([
    path(`M${x - 6 * s} ${y} C${x - 2 * s} ${y - 20 * s} ${x - 2 * s} ${y - 36 * s} ${x - 5 * s} ${y - 58 * s} L${x + 5 * s} ${y - 58 * s} C${x + 2 * s} ${y - 36 * s} ${x + 2 * s} ${y - 20 * s} ${x + 6 * s} ${y} Z`, red),
    ...(lit ? [0.2, 0.4, 0.6, 0.8].map(k => rect(x - 3 * s, y - 58 * s * k, 6 * s, 0.8 * s, '#ffd0c0')) : []),
    rect(x - 5.5 * s, y - 62 * s, 11 * s, 4 * s, lit ? '#fff3c4' : '#f4f1ea'),
    rect(x - 0.6 * s, y - 70 * s, 1.2 * s, 8 * s, red)
  ]);
}
// 海洋博物館（白い帆の屋根）
function museum(x, y, s, col, line) {
  const out = [rect(x - 30 * s, y - 8 * s, 60 * s, 8 * s, col)];
  const d = `M${x - 34 * s} ${y - 8 * s} Q${x - 14 * s} ${y - 14 * s} ${x - 4 * s} ${y - 34 * s} Q${x + 10 * s} ${y - 12 * s} ${x + 36 * s} ${y - 26 * s} Q${x + 24 * s} ${y - 12 * s} ${x + 34 * s} ${y - 8 * s} Z`;
  out.push(path(d, col, { opacity: 0.9 }));
  for (let k = 1; k < 8; k++) out.push(path(`M${x - 34 * s + k * 9 * s} ${y - 8 * s} L${x - 4 * s + (k - 4) * 3 * s} ${y - 34 * s + Math.abs(k - 4) * 3 * s}`, 'none', { stroke: line, strokeWidth: 0.5 * s }));
  return out.join('');
}
// つり橋（遠く）
function bridge(x, y, w, h, col) {
  const out = [rect(x, y, w, 2, col)];
  for (const px of [x + w * 0.2, x + w * 0.8]) out.push(rect(px - 1.2, y - h, 2.4, h + 6, col));
  out.push(path(`M${x} ${y} Q${x + w * 0.1} ${y - h * 0.3} ${x + w * 0.2} ${y - h} Q${x + w * 0.5} ${y - 4} ${x + w * 0.8} ${y - h} Q${x + w * 0.9} ${y - h * 0.3} ${x + w} ${y}`, 'none', { stroke: col, strokeWidth: 0.8 }));
  for (let k = 0.24; k < 0.78; k += 0.04) {
    const t = (k - 0.2) / 0.6, cy = y - h + (h - 4) * (1 - Math.pow(2 * t - 1, 2));
    out.push(rect(x + w * k, cy, 0.4, y - cy, col, { opacity: 0.7 }));
  }
  return out.join('');
}
// 洋館（遠く）
function ijinkan(x, y, s, wall, roof, r) {
  const w = (26 + r() * 14) * s, h = (18 + r() * 8) * s;
  return [
    rect(x, y - h, w, h, wall),
    poly([[x - 2 * s, y - h], [x + w / 2, y - h - 12 * s], [x + w + 2 * s, y - h]], roof),
    ...Array.from({ length: Math.floor(w / (7 * s)) }, (_, i) => rect(x + 3 * s + i * 7 * s, y - h + 5 * s, 3 * s, 5 * s, '#6f9fc4')),
    r() < 0.5 ? rect(x + w * 0.6, y - h - 16 * s, 3 * s, 8 * s, roof) : ''
  ].join('');
}

// ========================================================================
// 八雲通・春日野道（晴れ）
// ========================================================================
const SKYCLOUD = { col: '#ffffff', sh: '#d6e6f3', hi: '#ffffff' };
function cloudLayer(theme, seed, n, c, yMax = 90) {
  bgLayer(theme, { f: 0.03, w: 1000, y: 0, h: 130 }, (defs, w) => {
    const r = rng(seed);
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = (i + r() * 0.6) * (w / n), y = 24 + r() * yMax, s = 0.45 + r() * 0.5;
      out.push(wrap(w, x - 42 * s, 84 * s, xx => cloud(xx + 42 * s, y, s, c.col, c.sh, c.hi)));
    }
    return out.join('');
  });
}
cloudLayer('yakumo', 11, 6, SKYCLOUD);
bgLayer('yakumo', { f: 0.06, w: 1000, y: 80, h: 160 }, (defs, w) => {
  const A = [[2, 30], [5, 10], [11, 4]];
  return tr(0, -80, [
    // 六甲山（いちばん奥）
    path(ridgePath(w, 128, [[2, 30], [3, 16], [7, 6]], 3), '#a9c8d8'),
    radioTower(640, ridgeY(w, 128, [[2, 30], [3, 16], [7, 6]], 3, 640) + 1, 10, '#8aa6b6'),
    radioTower(652, ridgeY(w, 128, [[2, 30], [3, 16], [7, 6]], 3, 652) + 1, 7, '#8aa6b6'),
    path(ridgePath(w, 144, A, 5), '#93bcb4'),
    // 錨山の錨
    anchor(300, ridgeY(w, 144, A, 5, 300) + 14, 0.62, '#f4fbff'),
    canopy(w, 166, [[3, 14], [7, 5], [13, 2]], 7, { dark: '#6f9f86', base: '#7fb08f', mid: '#78a98a', light: '#a3cba8' }, { size: 5, step: 6 })
  ].join(''));
});
bgLayer('yakumo', { f: 0.13, w: 900, y: 130, h: 110 }, (defs, w) => tr(0, -130, [
  farCity(w, 200, 21, ['#dde5ee', '#d2dce8', '#e6e8ef', '#d7e0ea', '#e2dcea'], { minW: 8, varW: 18, minH: 14, varH: 34, win: '#c3d0de' }),
  rect(0, 199, w, 41, '#cfd9e3')
].join('')));
bgLayer('yakumo', { f: 0.26, w: 800, y: 110, h: 130 }, (defs, w) => {
  const r = rng(31);
  const out = [];
  const walls = ['#f4e8d4', '#efe2cc', '#ece2d6', '#f7efe3', '#e8d8c4', '#e3e9ee'];
  const roofs = ['#b9533e', '#5f6a7c', '#8a5a3b', '#56688a', '#a0463a', '#4f7a6a'];
  // うしろの木
  out.push(canopy(w, 186, [[4, 6], [9, 3]], 33, { dark: '#5f9a5a', base: '#6fae63', mid: '#67a55f', light: '#96cc84' }, { size: 7, step: 9 }));
  // 家とマンション
  for (let x = 0; x < w; ) {
    const kind = r();
    const wall = walls[Math.floor(r() * walls.length)], roof = roofs[Math.floor(r() * roofs.length)];
    let bw;
    if (kind < 0.3) { bw = 30 + r() * 16; const bh = 50 + r() * 24; out.push(wrap(w, x, bw + 2, xx => apartment(xx, 208, bw, bh, wall, r))); }
    else { bw = 22 + r() * 14; const bh = 22 + r() * 10; out.push(wrap(w, x, bw + 6, xx => house(xx + 3, 208, bw, bh, wall, roof, r, { chimney: r() < 0.3 }))); }
    x += bw + 6 + r() * 12;
  }
  for (let i = 0; i < 10; i++) { const x = r() * w, s = 0.7 + r() * 0.4; out.push(wrap(w, x - 10, 20, xx => tree(xx + 10, 210, s, { base: '#6fae5c', dark: '#548f47', light: '#94cc7c' }))); }
  // 高架（阪急）
  out.push(rect(0, 150, w, 9, '#d3cdc2'), rect(0, 150, w, 2, '#eeeae2'), rect(0, 159, w, 3, '#aca69b'));
  for (let x = 16; x < w; x += 64) out.push(rect(x, 162, 8, 48, '#c2bcb0'), rect(x, 162, 2, 48, '#dcd6cb'));
  out.push(rect(0, 208, w, 32, '#9fb09a'));
  return tr(0, -110, out.join(''));
});
bgLayer('yakumo', { f: 0.5, w: 700, y: 96, h: 144 }, (defs, w) => {
  const out = [];
  // 電柱と電線
  const xs = [60, 410];
  for (const x of xs) {
    out.push(rect(x, 108, 3.2, 124, '#8a7f72'), rect(x + 2.2, 108, 1, 124, '#a79c8e'));
    out.push(rect(x - 11, 118, 25, 2.2, '#716759'), rect(x - 8, 127, 19, 1.8, '#716759'));
    out.push(rrect(x + 4, 140, 7, 10, 1.5, '#9aa5b0'), rect(x - 2, 180, 7, 12, '#e8e4dc'), rect(x - 1, 182, 5, 2, '#d33a2c'));
  }
  for (const dy of [0, 9]) {
    const y0 = 119 + dy;
    out.push(path(`M${xs[0] - w + xs[1]} ${y0} Q${(xs[0] + xs[1] - w) / 2} ${y0 + 12} ${xs[0]} ${y0} Q${(xs[0] + xs[1]) / 2} ${y0 + 12} ${xs[1]} ${y0} Q${(xs[1] + xs[0] + w) / 2} ${y0 + 12} ${xs[0] + w} ${y0}`, 'none', { stroke: '#40414a', strokeWidth: 0.55, opacity: 0.7 }));
  }
  return tr(0, -96, out.join(''));
});
// 手前の植え込み（いちばん下）
function fgBushes(theme, seed, cols, flowers) {
  bgLayer(theme, { f: 1.3, w: 1100, y: 212, h: 28, fg: true }, (defs, w) => {
    const r = rng(seed);
    const out = [];
    for (const cx of [140, 600, 900]) {
      for (let k = 0; k < 8; k++) {
        const x = cx + (k - 4) * 9 + r() * 5, y = 244 - r() * 6, rr = 9 + r() * 8;
        out.push(wrap(w, x - rr, rr * 2, xx => circ(xx + rr, y, rr, cols[k % cols.length])));
      }
      for (let k = 0; k < 4; k++) { const x = cx + (k - 2) * 12 + r() * 6; out.push(wrap(w, x - 4, 8, xx => circ(xx + 4, 232 + r() * 4, 4, cols[2], { opacity: 0.9 }))); }
      if (flowers) for (let k = 0; k < 4; k++) { const x = cx + (k - 2) * 14 + r() * 8; out.push(wrap(w, x - 3, 6, xx => circ(xx + 3, 230 + r() * 6, 2.4, flowers[k % flowers.length]))); }
    }
    return tr(0, -212, out.join(''));
  });
}
fgBushes('yakumo', 51, ['#3f7d3a', '#4d8f45', '#6fae5c']);

// ========================================================================
// 北野・異人館（晴れ・坂の上から港が見える）
// ========================================================================
cloudLayer('kitano', 61, 5, SKYCLOUD, 60);
bgLayer('kitano', { f: 0.05, w: 1100, y: 70, h: 120 }, (defs, w) => {
  const r = rng(66);
  return tr(0, -70, [
    path(ridgePath(w, 112, [[2, 30], [3, 12], [8, 5]], 13), '#a6c4d8'),
    path(ridgePath(w, 126, [[2, 22], [5, 8], [11, 3]], 17), '#8fb7c0'),
    // 港と海（遠く）
    rect(0, 152, w, 40, '#72b8e0'), rect(0, 152, w, 1.6, '#b9e2f6'),
    farCity(w, 152, 67, ['#e3e9f0', '#d6e0ea', '#eceef2'], { minW: 5, varW: 10, minH: 4, varH: 14, win: '#c6d3e0' }),
    portTowerFar(480, 152, 0.36, false),
    museum(430, 152, 0.3, '#f4f7fa', '#c9d3de'),
    bridge(700, 150, 80, 11, '#eef3f8'),
    ...Array.from({ length: 16 }, () => rrect(r() * w, 156 + r() * 30, 6 + r() * 10, 0.8, 0.4, '#ffffff', { opacity: 0.6 }))
  ].join(''));
});
bgLayer('kitano', { f: 0.14, w: 1000, y: 120, h: 120 }, (defs, w) => {
  const r = rng(71);
  const out = [];
  const walls = ['#f6f1e6', '#f2e4d0', '#eaeff3', '#f4ebdf', '#e6f0e1'];
  const roofs = ['#c0583f', '#5c6b82', '#4f8f73', '#b86a3e', '#6f5e8e'];
  out.push(canopy(w, 178, [[2, 12], [5, 6], [11, 2]], 19, { dark: '#5c9458', base: '#6aa861', mid: '#63a05b', light: '#93c982' }, { size: 6, step: 7 }));
  for (let x = 0; x < w; x += 36 + r() * 40) {
    const y = ridgeY(w, 178, [[2, 12], [5, 6], [11, 2]], 19, x) + 14;
    out.push(wrap(w, x, 50, xx => house(xx, y, 22 + r() * 12, 14 + r() * 6, walls[Math.floor(r() * 5)], roofs[Math.floor(r() * 5)], r, { chimney: r() < 0.5 })));
  }
  for (let i = 0; i < 22; i++) {
    const x = r() * w, y = ridgeY(w, 178, [[2, 12], [5, 6], [11, 2]], 19, x) + 16 + r() * 12;
    out.push(wrap(w, x - 8, 16, xx => r() < 0.55 ? cypress(xx + 8, y, 0.8, { base: '#3f7d4a', light: '#6fae6a' }) : tree(xx + 8, y, 0.75, { base: '#6aac5c', dark: '#4f8f47', light: '#8fcc7a' })));
  }
  out.push(rect(0, 204, w, 36, '#6fa864'));
  return tr(0, -120, out.join(''));
});
bgLayer('kitano', { f: 0.32, w: 900, y: 104, h: 136 }, (defs, w) => {
  const r = rng(81);
  const out = [];
  out.push(canopy(w, 184, [[3, 8], [7, 3]], 83, { dark: '#4f8f4c', base: '#5fa153', mid: '#579a4f', light: '#8cc874' }, { size: 8, step: 10 }));
  // 洋館（大きめ）
  for (let x = 30; x < w; x += 170 + r() * 90) {
    const wall = ['#f6f0e4', '#e8f0e0', '#f2e2d0', '#eef0f4'][Math.floor(r() * 4)], roof = ['#b24f3a', '#56657c', '#4c8a70'][Math.floor(r() * 3)];
    out.push(wrap(w, x, 90, xx => [
      house(xx, 204, 68, 40, wall, roof, r, { chimney: true }),
      rect(xx + 6, 196, 56, 3, shade(wall, -0.15)), ...Array.from({ length: 8 }, (_, i) => rect(xx + 7 + i * 7, 190, 1, 6, shade(wall, -0.15)))
    ].join('')));
  }
  for (let i = 0; i < 12; i++) { const x = r() * w; out.push(wrap(w, x - 12, 24, xx => r() < 0.4 ? cypress(xx + 12, 210, 1.2, { base: '#356f40', light: '#5f9e5c' }) : tree(xx + 12, 210, 1.15, { base: '#5fa653', dark: '#468a42', light: '#88c874' }))); }
  // 鉄のさく
  out.push(rect(0, 204, w, 2, '#33413d'), rect(0, 192, w, 1.6, '#33413d'));
  for (let x = 0; x < w; x += 5) out.push(rect(x, 192, 0.9, 12, '#33413d'));
  for (let x = 2.5; x < w; x += 5) out.push(circ(x, 191.5, 0.8, '#33413d'));
  out.push(rect(0, 206, w, 34, '#6b9e60'));
  return tr(0, -104, out.join(''));
});
fgBushes('kitano', 91, ['#2f6b3a', '#3d8045', '#5a9e52'], ['#ff9ab8', '#fff4a0', '#ffffff', '#ffb35a']);

// ========================================================================
// メリケンパーク（夕焼け）
// ========================================================================
bgLayer('meriken', { f: 0.015, w: 1400, y: 0, h: 200 }, (defs, w) => {
  const SX = 290, SY = 160;
  const sun = defs.radU([[0, '#fff2c0', 1], [0.2, '#ffd98a', 0.85], [1, '#ffb070', 0]], SX, SY, 110);
  const streak = (x, y, len, c, o) => rrect(x, y, len, 2.2, 1.1, c, { opacity: o });
  return [
    rect(0, 0, w, 200, sun),
    circ(SX, SY, 21, '#ffd98a'), circ(SX, SY, 18, '#ffeab0'),
    // 横に長い夕焼け雲
    streak(170, 128, 90, '#ffb880', 0.7), streak(340, 118, 70, '#ffc596', 0.6), streak(430, 136, 60, '#ff9f86', 0.5),
    streak(120, 96, 80, '#f59a86', 0.5), streak(760, 104, 110, '#f5a08c', 0.5),
    ...[[160, 40, 0.9], [620, 62, 0.7], [1000, 36, 1.0], [1260, 80, 0.6]].map(([x, y, s]) => cloud(x, y, s, '#f7a38e', '#d9788a', '#ffc9a8')),
    ...[[330, 96, 0.55], [900, 110, 0.6]].map(([x, y, s]) => cloud(x, y, s, '#ffbf93', '#f08f86', '#ffe0b8'))
  ].join('');
});
bgLayer('meriken', { f: 0.06, w: 1000, y: 90, h: 110 }, (defs, w) => {
  const r = rng(101);
  const out = [path(ridgePath(w, 150, [[2, 34], [3, 14], [7, 6]], 23, 200), '#7a5d97'), path(ridgePath(w, 164, [[3, 16], [7, 5]], 29, 200), '#6a5089')];
  for (let i = 0; i < 70; i++) { const x = r() * w, y = ridgeY(w, 164, [[3, 16], [7, 5]], 29, x) + 4 + r() * 20; out.push(circ(x, y, 0.6, '#ffd98a', { opacity: 0.8 })); }
  // 海の向こうのつり橋
  out.push(bridge(700, 172, 150, 22, '#8a6fa8'));
  return tr(0, -90, out.join(''));
});
bgLayer('meriken', { f: 0.12, w: 1000, y: 110, h: 130 }, (defs, w) => {
  const r = rng(111);
  const out = [];
  // 街（夕方の明かり）
  for (let x = 0; x < w; ) {
    const bw = 14 + r() * 26, bh = 20 + r() * 44;
    const c = ['#5a4f86', '#645892', '#4f4679', '#6e5f98'][Math.floor(r() * 4)];
    if (!(x > 330 && x < 470)) out.push(wrap(w, x, bw, xx => building(xx, 176 - bh, bw, bh, { wall: c, side: shade(c, -0.15), roof: shade(c, 0.1), win: shade(c, -0.1), lit: 0.35, r })));
    x += bw + 1 + r() * 4;
  }
  // ホテル（白いビル）
  out.push(building(360, 96, 26, 80, { wall: '#d9d2e8', side: '#b4abc9', roof: '#f0ecf6', win: '#9d93bd', lit: 0.3, r, winW: 3, winH: 2.4, gapX: 2.4, gapY: 2.6 }));
  // 海
  out.push(rect(0, 176, w, 64, '#4d5aa0'));
  out.push(rect(0, 176, w, 2, '#f3b68a', { opacity: 0.8 }));
  for (let i = 0; i < 16; i++) out.push(rrect(780 + (r() - 0.5) * 60, 180 + i * 3.4, 18 + r() * 34, 1.6, 0.8, '#ffc98a', { opacity: 0.8 - i * 0.04 }));
  for (let i = 0; i < 24; i++) out.push(rrect(r() * w, 182 + r() * 50, 8 + r() * 14, 1, 0.5, '#9aa3e0', { opacity: 0.5 }));
  // 海洋博物館
  out.push(museum(560, 176, 1.1, '#f6f1f4', '#d6c9d9'));
  return tr(0, -110, out.join(''));
});
bgLayer('meriken', { f: 0.4, w: 900, y: 130, h: 110 }, (defs, w) => {
  const r = rng(121);
  const out = [];
  // 岸壁の倉庫と木
  for (const x of [60, 470]) out.push(wrap(w, x, 130, xx => [
    rect(xx, 176, 120, 34, '#8a5244'), poly([[xx - 4, 176], [xx + 60, 162], [xx + 124, 176]], '#6e3f35'),
    ...Array.from({ length: 7 }, (_, i) => rect(xx + 8 + i * 16, 186, 7, 12, '#ffcf7a', { opacity: 0.85 })),
    rect(xx, 176, 120, 2, '#c07a5e')
  ].join('')));
  for (let i = 0; i < 8; i++) { const x = r() * w; out.push(wrap(w, x - 12, 24, xx => tree(xx + 12, 212, 1.1, { base: '#4f6f5a', dark: '#3b5646', light: '#7d8e6a' }))); }
  out.push(rect(0, 210, w, 30, '#5b5068'));
  return tr(0, -130, out.join(''));
});

// ========================================================================
// ハーバーランド（夜景）
// ========================================================================
bgLayer('harborland', { f: 0.02, w: 1000, y: 0, h: 150 }, (defs, w) => {
  const r = rng(131);
  const out = [];
  for (let i = 0; i < 110; i++) out.push(circ(r() * w, r() * 140, 0.3 + r() * 0.7, '#ffffff', { opacity: 0.4 + r() * 0.6 }));
  out.push(circ(260, 40, 12, '#fff7d6'), circ(265, 37, 11, '#1b2350', { opacity: 0.25 }));
  out.push(circ(260, 40, 26, '#fff7d6', { opacity: 0.08 }));
  return out.join('');
});
bgLayer('harborland', { f: 0.05, w: 1000, y: 70, h: 130, dim: true }, (defs, w) => {
  const r = rng(141);
  const out = [path(ridgePath(w, 130, [[2, 38], [3, 14], [7, 6]], 31, 200), '#1a2250'), path(ridgePath(w, 146, [[3, 18], [7, 6]], 37, 200), '#161d45')];
  // 山すその夜景（光のつぶ）
  for (let i = 0; i < 420; i++) {
    const x = r() * w, top = ridgeY(w, 146, [[3, 18], [7, 6]], 37, x);
    const y = top + 6 + Math.pow(r(), 0.6) * (196 - top - 6);
    const c = r() < 0.7 ? '#ffd98a' : r() < 0.5 ? '#ffffff' : '#ff9a7a';
    out.push(circ(x, y, 0.4 + r() * 0.6, c, { opacity: 0.6 + r() * 0.4 }));
  }
  return tr(0, -70, out.join(''));
});
bgLayer('harborland', { f: 0.13, w: 1000, y: 100, h: 140 }, (defs, w) => {
  const r = rng(151);
  const out = [];
  for (let x = 0; x < w; ) {
    const bw = 14 + r() * 28, bh = 26 + r() * 60;
    const c = ['#232c5e', '#2a3468', '#1e2654'][Math.floor(r() * 3)];
    out.push(wrap(w, x, bw, xx => building(xx, 184 - bh, bw, bh, { wall: c, side: shade(c, -0.2), roof: shade(c, 0.1), win: shade(c, 0.05), lit: 0.55, r })));
    x += bw + 1 + r() * 5;
  }
  out.push(portTowerFar(620, 184, 0.9, true));
  out.push(rect(0, 184, w, 56, '#141c44'));
  // 水面の光
  for (let i = 0; i < 60; i++) out.push(rrect(r() * w, 188 + r() * 40, 4 + r() * 12, 1, 0.5, r() < 0.5 ? '#ffd98a' : '#ff8a8a', { opacity: 0.5 }));
  return tr(0, -100, out.join(''));
});
bgLayer('harborland', { f: 0.38, w: 900, y: 120, h: 120 }, (defs, w) => {
  const r = rng(161);
  const out = [];
  // 赤レンガ倉庫とイルミネーション
  for (const x of [30, 330, 620]) out.push(wrap(w, x, 180, xx => [
    rect(xx, 162, 150, 50, '#5a2e27'), poly([[xx - 4, 162], [xx + 75, 146], [xx + 154, 162]], '#452420'),
    ...Array.from({ length: 8 }, (_, i) => [path(`M${xx + 10 + i * 18} 196 L${xx + 10 + i * 18} 176 Q${xx + 14.5 + i * 18} 170 ${xx + 19 + i * 18} 176 L${xx + 19 + i * 18} 196 Z`, '#ffcf7a'), rect(xx + 14 + i * 18, 172, 1, 24, '#5a2e27')].join('')),
    path(`M${xx - 4} 150 Q${xx + 36} 164 ${xx + 75} 146 Q${xx + 114} 164 ${xx + 154} 150`, 'none', { stroke: '#ffe9a8', strokeWidth: 0.6, opacity: 0.8 }),
    ...Array.from({ length: 16 }, (_, i) => circ(xx + i * 10, 150 + Math.sin(i / 16 * Math.PI * 2) * 6 + 6, 1, ['#ffe9a8', '#ff9ab8', '#9ad7ff'][i % 3]))
  ].join('')));
  for (let i = 0; i < 6; i++) { const x = r() * w; out.push(wrap(w, x - 12, 24, xx => tree(xx + 12, 214, 1.1, { base: '#1f3a3a', dark: '#16302f', light: '#2e5a52', trunk: '#2a2020' }))); }
  out.push(rect(0, 212, w, 28, '#1f1c30'));
  return tr(0, -120, out.join(''));
});

// ほかのファイル（bgs2.mjs）でも使う道具
export { wrap, ridgePath, ridgeY, cloud, canopy, farCity, house, apartment, building, tree, cypress, anchor, radioTower, portTowerFar, museum, bridge, ijinkan, cloudLayer, fgBushes, SKYCLOUD };
