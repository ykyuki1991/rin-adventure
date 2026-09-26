// ステージ4「布引ロープウェイ」を描き直したもの（高いところから見下ろす神戸の街と海・ハーブ園）
// 背景（空と大きな雲・海と街・かすむ山なみ・森の谷）、地面（あたたかい色の石がき＋芝生）、
// 飾り（駅・ゴンドラ・鉄塔・レストハウス・温室の中・ラベンダー畑・プランター・ベンチ・街灯・木）
// 座標：背景は画面の絶対座標（高さ240）、飾りは 0.1ドット単位で足元が原点（上がマイナス）
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, portTowerFar, museum, bridge } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile } from '../tiles.mjs';
import { TAU, st, G, win, flowerBox, cloverBlob, clover } from '../kit.mjs';

resetTheme('ropeway');
const SH = 's4';
const OUT = '#2a2236';   // 乗りもののふちどり

// ========================================================================
// 背景
// ========================================================================
// ふわふわの大きな雲（下が平らで、うすい青のかげ）
function puff(x, y, s, r, c = {}) {
  const body = c.body || '#ffffff', sh = c.sh || '#d4e5f2', base = c.base || '#e4eef7', hi = c.hi || '#ffffff';
  const n = 7, bumps = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), h = Math.sin(Math.PI * t);
    const br = (8 + 11 * h + r() * 4) * s;
    bumps.push([x + (t - 0.5) * 74 * s + (r() - 0.5) * 6 * s, y - (3 + 15 * h + r() * 3) * s + br * 0.3, br]);
  }
  const shape = (dy, col) => bumps.map(([bx, by, br]) => circ(bx, by + dy, br, col)).join('') + rrect(x - 42 * s, y - 6 * s + dy, 84 * s, 12 * s, 6 * s, col);
  return [
    shape(3.2 * s, sh), shape(0, body),
    ell(x, y + 3 * s, 38 * s, 3.4 * s, base, { opacity: 0.9 }),
    ...bumps.slice(1, -1).map(([bx, by, br]) => circ(bx - br * 0.3, by - br * 0.38, br * 0.42, hi, { opacity: 0.55 }))
  ].join('');
}

// 空の雲（大きい雲は上、小さい雲は低く＝自分より下にも雲があって高さを感じる）
bgLayer('ropeway', { f: 0.018, w: 1500, y: 0, h: 130 }, (defs, w) => {
  const r = rng(4001), out = [];
  for (const [x, y, s] of [[120, 40, 1.35], [470, 26, 0.95], [760, 52, 1.6], [1110, 32, 1.1], [1360, 58, 0.8]]) out.push(wrap(w, x - 50 * s, 100 * s, xx => puff(xx + 50 * s, y, s, rng(4002 + x))));
  for (let i = 0; i < 6; i++) { const x = (i + r() * 0.5) * w / 6, y = 78 + r() * 14, s = 0.32 + r() * 0.16; out.push(wrap(w, x - 50 * s, 100 * s, xx => puff(xx + 50 * s, y, s, rng(4020 + i), { sh: '#dce9f3' }))); }
  return out.join('');
});

// はるか下の海と神戸の街（ポートタワーが小さな赤いアクセント）
const HZ = 74; // 水平線
bgLayer('ropeway', { f: 0.032, w: 1600, y: 56, h: 184 }, (defs, w) => {
  const r = rng(4101), out = [];
  // 海のむこうの山（とてもかすむ）
  out.push(path(ridgePath(w, HZ - 1, [[3, 7], [5, 4], [13, 2]], 4103, HZ + 3, 8), '#bdd3e6'));
  out.push(path(ridgePath(w, HZ + 1, [[2, 3], [7, 2]], 4105, HZ + 3, 8), '#aec9df'));
  // 海
  out.push(rect(0, HZ, w, 240 - HZ, defs.linU([[0, '#b2d9f0'], [0.25, '#8cc6ec'], [1, '#5ea6de']], 0, HZ, 0, 130)));
  out.push(rect(0, HZ, w, 0.8, '#f2f9fd'));
  for (let i = 0; i < 46; i++) {
    const y = HZ + 3 + Math.pow(r(), 1.2) * 26, l = 4 + r() * 12 * (0.4 + (y - HZ) / 26), x = r() * w;
    out.push(wrap(w, x, l, xx => rrect(xx, y, l, 0.8, 0.4, '#ffffff', { opacity: 0.35 + r() * 0.3 })));
  }
  // 明石海峡大橋（はるか右）
  out.push(bridge(1200, HZ + 1.6, 96, 8, '#eef4f9'));
  // 船
  for (const [x, y, s] of [[180, 88, 1], [520, 82, 0.7], [1000, 92, 1.1], [1420, 85, 0.8]]) out.push(g([path(`M${x - 5 * s} ${y} L${x + 5 * s} ${y} L${x + 3.5 * s} ${y + 1.4 * s} L${x - 4 * s} ${y + 1.4 * s} Z`, '#ffffff'), rect(x - 1.5 * s, y - 1.6 * s, 3 * s, 1.6 * s, '#ffffff'), rrect(x - 12 * s, y + 1.2 * s, 10 * s, 0.6, 0.3, '#ffffff', { opacity: 0.7 })]));
  // 人工島（ポートアイランド・六甲アイランド）
  for (const [x0, x1, y] of [[560, 700, 93], [900, 1000, 95], [130, 230, 94]]) {
    out.push(path(`M${x0} ${y + 3} L${x0 + 6} ${y} L${x1 - 4} ${y} L${x1} ${y + 3} Z`, '#d5e3d2'));
    for (let x = x0 + 8; x < x1 - 10; x += 8 + r() * 8) { const bh = 2 + r() * 4, bw = 3 + r() * 4; out.push(rect(x, y - bh, bw, bh, '#f4f6f8'), rect(x + bw * 0.7, y - bh, bw * 0.3, bh, '#dde6ee')); }
    out.push(rect(x0 + 4, y + 3, x1 - x0 - 8, 0.8, '#7fb8e2'));
  }
  const shore = x => 104 + 2 * Math.sin(x / w * TAU * 3 + 1) + 1.2 * Math.sin(x / w * TAU * 7);
  // 陸地
  let d = `M0 240 L0 ${f(shore(0))}`;
  for (let x = 0; x <= w; x += 8) d += ` L${x} ${f(shore(x))}`;
  out.push(path(d + ` L${w} 240 Z`, defs.linU([[0, '#d6e5d0'], [1, '#b9d5b3']], 0, 104, 0, 160)));
  // 波止場
  for (let x = 40; x < w; x += 90 + r() * 110) { const pw = 8 + r() * 14; out.push(wrap(w, x, pw, xx => rect(xx, shore(x) - 3, pw, 3.2, '#e6ece6'))); }
  // 街（パステルのビル。奥は小さく、手前は大きく。三宮のあたりは高い）
  const cols = ['#fbfcfd', '#eef3f7', '#fbf3e6', '#e2ebf3', '#f6ece2', '#f7f9fb', '#e9eef0'];
  const roofs = ['#d9a28c', '#a9b8c6', '#c7d2dc', '#e0b39a'];
  const tallAt = x => Math.max(0, 1 - Math.abs(x - 820) / 200) + Math.max(0, 1 - Math.abs(x - 320) / 120) * 0.5;
  // 公園や緑の丘（街の中の大きな緑）
  for (let i = 0; i < 14; i++) { const x = r() * w, y = 118 + r() * 22, rx = 18 + r() * 30; out.push(wrap(w, x - rx, rx * 2, xx => ell(xx, y, rx, 5 + r() * 4, '#b0d3a4'))); }
  for (const [y0, sc, row] of [[106, 1, 0], [118, 1.3, 1], [133, 1.6, 2]]) {
    const trees = [];
    for (let x = -8; x < w;) {
      const tall = row === 0 ? tallAt(x) : row === 1 ? tallAt(x) * 0.35 : 0;
      const bw = (5 + r() * 7) * sc;
      if (tall < 0.3 && r() < 0.32) { trees.push([x + bw / 2, Math.max(y0, shore(x) + 2) + 1, 1.6]); x += bw; continue; }
      const bh = (2.5 + r() * 4 + tall * (8 + r() * 14)) * sc;
      const c = cols[Math.floor(r() * cols.length)], yb = Math.max(y0, shore(x) + 1.5) + r() * 2 * sc;
      const house = tall < 0.2 && bh < 5 * sc && r() < 0.6, rf = roofs[Math.floor(r() * roofs.length)];
      out.push(wrap(w, x, bw, xx => {
        const p = [rect(xx, yb - bh, bw, bh + 3 * sc, c), rect(xx + bw * 0.72, yb - bh, bw * 0.28, bh + 3 * sc, '#cfdce8', { opacity: 0.7 })];
        if (house) p.push(path(`M${xx - 0.5} ${yb - bh} L${xx + bw / 2} ${yb - bh - 2.2 * sc} L${xx + bw + 0.5} ${yb - bh} Z`, rf));
        else p.push(rect(xx, yb - bh, bw, 0.7, '#ffffff'));
        if (bh > 8) for (let yy = yb - bh + 2; yy < yb - 1.5; yy += 2.6) p.push(rect(xx + 0.8, yy, bw * 0.6, 0.8, '#b3cde2'));
        return p.join('');
      }));
      if (r() < 0.3) trees.push([x + bw + 1.2 * sc, yb + 0.5, 1]);
      x += bw + (1 + r() * 3) * sc;
    }
    for (const [x, y, k] of trees) out.push(wrap(w, x - 5, 10, xx => clover(xx, y, (2 + r() * 1.4) * sc * k, r() < 0.5 ? '#9cc893' : '#a9d19e', '#d2eac4')));
  }
  // ポートタワー・海洋博物館・観覧車（メリケンパーク）
  const PT = 740, sy = shore(PT);
  out.push(rect(PT - 40, sy - 1, 90, 4, '#d9ead3'));
  out.push(museum(PT + 28, sy + 0.5, 0.3, '#ffffff', '#d3dce6'));
  out.push(portTowerFar(PT, sy + 0.5, 0.44, false));
  out.push(circ(PT - 34, sy - 7, 6, 'none', { stroke: '#f0f4f8', strokeWidth: 0.8 }), path(`M${PT - 37} ${sy} L${PT - 34} ${sy - 7} L${PT - 31} ${sy}`, 'none', st('#e4ebf1', 0.6)));
  // 水平線のかすみ
  out.push(rect(0, HZ - 16, w, 40, defs.linU([[0, '#eef6fb', 0], [0.4, '#eef6fb', 0.6], [1, '#eef6fb', 0]], 0, HZ - 16, 0, HZ + 24)));
  out.push(rect(0, 100, w, 60, defs.linU([[0, '#f0f6f8', 0.28], [1, '#f0f6f8', 0]], 0, 100, 0, 160)));
  return tr(0, -56, out.join(''));
});

// かすむ山なみ（六甲のすそ野・北野の家・遠くのハーブ園の段々畑）
bgLayer('ropeway', { f: 0.07, w: 1400, y: 110, h: 130 }, (defs, w) => {
  const r = rng(4201), out = [];
  const A = [[2, 12], [3, 7], [7, 3]], B = [[3, 9], [5, 5], [11, 2]];
  // 奥の尾根
  const back = ridgePath(w, 146, A, 4203, 240);
  out.push(path(back, defs.linU([[0, '#9cc7b0'], [1, '#90bea3']], 0, 120, 0, 200)));
  const cb = defs.clip(`<path d="${back}"/>`), bumps = [];
  for (let i = 0; i < 420; i++) {
    const x = r() * w, top = ridgeY(w, 146, A, 4203, x), y = top + 3 + Math.pow(r(), 0.9) * 60, rr = 1.8 + r() * 2.2;
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, r() < 0.5 ? '#8bbb9e' : '#a3cdb3')));
  }
  // 北野の家（小さく）
  for (let i = 0; i < 30; i++) {
    const x = r() * w, y = ridgeY(w, 146, A, 4203, x) + 14 + r() * 26, hw = 2.4 + r() * 2.4;
    bumps.push(wrap(w, x - 4, 8, xx => [rect(xx - hw, y - 2.6, hw * 2, 2.6, '#eef0ea'), path(`M${xx - hw - 0.6} ${y - 2.4} L${xx} ${y - 4.6} L${xx + hw + 0.6} ${y - 2.4} Z`, ['#d8a08a', '#9fb0bf', '#c9967e'][Math.floor(r() * 3)])].join('')));
  }
  out.push(g(bumps.join(''), { 'clip-path': cb }));
  out.push(path(ridgePath(w, 146, A, 4203, 240).replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#c3dccf', 1, { opacity: 0.7 })));
  // 手前の尾根（ハーブ園の段々のラベンダー畑がかすかに見える）
  const front = ridgePath(w, 176, B, 4207, 240);
  out.push(path(front, defs.linU([[0, '#7fb88a'], [1, '#72ad7e']], 0, 150, 0, 220)));
  const cf = defs.clip(`<path d="${front}"/>`), fb = [];
  for (const cx of [260, 980]) {
    const top = ridgeY(w, 176, B, 4207, cx);
    for (let k = 0; k < 6; k++) fb.push(path(`M${cx - 40 + k * 3} ${top + 6 + k * 3.2} Q${cx} ${top + 3 + k * 3.2} ${cx + 44 - k * 2} ${top + 7 + k * 3.2}`, 'none', st(k % 2 ? '#a99ccf' : '#94bf8e', 1.8, { opacity: 0.9 })));
  }
  for (let i = 0; i < 380; i++) {
    const x = r() * w, top = ridgeY(w, 176, B, 4207, x), y = top + 3 + Math.pow(r(), 0.9) * 60, rr = 2.2 + r() * 2.6;
    fb.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, r() < 0.5 ? '#77aa84' : '#8cbd96')));
    if (r() < 0.3) fb.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.3, y - rr * 0.4, rr * 0.45, '#b2d6b6', { opacity: 0.8 })));
  }
  out.push(g(fb.join(''), { 'clip-path': cf }));
  out.push(path(ridgePath(w, 176, B, 4207, 240).replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#b1d4b6', 1.1, { opacity: 0.7 })));
  // すそのかすみ
  out.push(rect(0, 150, w, 90, defs.linU([[0, '#e6f1f2', 0], [1, '#e6f1f2', 0.3]], 0, 150, 0, 240)));
  return tr(0, -110, out.join(''));
});

// 森の谷（ずっと下の木々と布引の滝）
bgLayer('ropeway', { f: 0.15, w: 1300, y: 150, h: 90 }, (defs, w) => {
  const r = rng(4301), out = [];
  const top = x => 188 + 7 * Math.sin(x / w * TAU * 3 + 0.6) + 4 * Math.sin(x / w * TAU * 7 + 2);
  let d = `M0 240 L0 ${f(top(0) + 8)}`;
  for (let x = 0; x <= w; x += 10) d += ` L${x} ${f(top(x) + 8)}`;
  out.push(path(d + ` L${w} 240 Z`, '#4f8f52'));
  // 布引の滝（白い細い流れ）
  const fx = 640;
  out.push(rect(fx - 2.6, top(fx) - 4, 5.2, 60, '#e9f6fb'), rect(fx - 1, top(fx) - 4, 1.4, 60, '#ffffff'), rect(fx + 1.4, top(fx) - 4, 1.2, 60, '#bfe0ee'));
  // 杉（とがった木）
  for (let i = 0; i < 22; i++) {
    const x = r() * w, y = top(x) + 6 + r() * 10, s = 0.8 + r() * 0.6;
    out.push(wrap(w, x - 8 * s, 16 * s, xx => [path(`M${xx} ${y - 22 * s} Q${xx + 3 * s} ${y - 12 * s} ${xx + 7 * s} ${y} L${xx - 7 * s} ${y} Q${xx - 3 * s} ${y - 12 * s} ${xx} ${y - 22 * s} Z`, '#3f7d4c'), path(`M${xx} ${y - 20 * s} Q${xx - 2 * s} ${y - 10 * s} ${xx - 5 * s} ${y - 1 * s}`, 'none', st('#6aa874', 1.2 * s, { opacity: 0.8 }))].join('')));
  }
  // まるい木のかたまり
  for (let x = -10; x < w + 10; x += 7 + r() * 6) {
    const y = top(x) + r() * 8, rr = 6 + r() * 5;
    const c = r() < 0.3 ? '#5a9d58' : r() < 0.5 ? '#68ab60' : '#73b468';
    out.push(wrap(w, x - rr, rr * 2, xx => [clover(xx, y + 1.5, rr, '#467f47'), clover(xx, y, rr * 0.94, c, r() < 0.6 ? '#9fd08a' : null)].join('')));
  }
  for (let x = -10; x < w + 10; x += 9 + r() * 7) {
    const y = top(x) + 14 + r() * 16, rr = 7 + r() * 5;
    out.push(wrap(w, x - rr, rr * 2, xx => clover(xx, y, rr, r() < 0.5 ? '#5b9b57' : '#62a45d', '#8cc47c')));
  }
  // 滝つぼのしぶき
  out.push(ell(fx, top(fx) + 40, 7, 2.4, '#ffffff', { opacity: 0.7 }));
  // かすみ（遠くに見せる）
  out.push(rect(0, 170, w, 70, defs.linU([[0, '#e1eff0', 0.26], [0.6, '#e1eff0', 0.08], [1, '#e1eff0', 0.14]], 0, 170, 0, 240)));
  return tr(0, -150, out.join(''));
});

// 手前の木のてっぺん（谷の上をわたる感じ）
bgLayer('ropeway', { f: 0.32, w: 1100, y: 196, h: 44 }, (defs, w) => {
  const r = rng(4401), out = [];
  for (let x = -10; x < w + 10; x += 12 + r() * 12) {
    const y = 214 + r() * 8 + 5 * Math.sin(x / w * TAU * 4), rr = 10 + r() * 7;
    const c = r() < 0.5 ? '#4f9448' : '#5aa052';
    out.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => [clover(xx, y + 2, rr, '#3a7a3c'), clover(xx, y, rr * 0.94, c, '#8cc978'), clover(xx + rr * 0.8, y + rr * 0.6, rr * 0.7, '#4a8f46', '#80c06e')].join('')));
  }
  out.push(rect(0, 226, w, 20, '#3f8440'));
  
  return tr(0, -196, out.join(''));
});

// いちばん手前（ぼかした葉っぱ。地面より下だけ）
bgLayer('ropeway', { f: 1.35, w: 1300, y: 204, h: 36, fg: true }, (defs, w) => {
  const r = rng(4501), blur = defs.blur(1.5), out = [];
  for (const cx of [120, 610, 1040]) {
    const parts = [];
    for (let k = 0; k < 12; k++) {
      const x = cx + (k - 6) * 11 + r() * 8, y = 246 - r() * 8 - Math.cos((k - 6) / 6 * 1.4) * 7, rr = 10 + r() * 7;
      parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2d6a36' : '#357a3c', '#4f9a4c')));
    }
    for (let k = 0; k < 5; k++) { const x = cx + (k - 2.5) * 16 + r() * 6; parts.push(wrap(w, x - 6, 12, xx => clover(xx, 232 + r() * 5, 5 + r() * 3, '#4a9446', '#7cc26a'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -204, out.join(''));
});

// ========================================================================
// 地面：あたたかい色の石がき＋芝生（ハーブ園の段々）
// ========================================================================
const CAP = { h: 40, base: '#78cb5d', dark: '#4c9c3f', light: '#c6f3a3' };
{
  const P = { colors: ['#dccfb3', '#d0c1a3', '#e6dac2', '#c8b898', '#d8c8a8'], jitter: 12, round: 22, speck: true, gap: 9 };
  const mortar = '#a08f72';
  const leaves = (x, y, n, seed, fl) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const lx = x - 12 + r() * 24, ly = y + r() * n * 5;
      out.push(clover(lx, ly + 1.5, 6 + r() * 2, '#3f8a38'), clover(lx, ly, 5.5 + r() * 2, r() < 0.5 ? '#5aaa45' : '#6ab84e', '#9ad67a'));
    }
    if (fl) for (let i = 0; i < 3; i++) { const fx = x - 8 + r() * 16, fy = y + r() * n * 4; out.push(...[0, 1, 2, 3, 4].map(k => circ(fx + Math.cos(k / 5 * TAU) * 3, fy + Math.sin(k / 5 * TAU) * 3, 2.6, fl)), circ(fx, fy, 1.8, '#ffd84a')); }
    return out.join('');
  };
  const body = v => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 80, edge: '#d7c9ae', joints: joints(44, 120, 4700 + v, 50, 80) }, { y0: 80, y1: 160, edge: '#d2c3a6', joints: joints(12, 150, 4710 + v, 52, 84) }], P, 4730 + v),
    v === 1 ? leaves(96, 70, 3, 4740) : v === 3 ? leaves(40, 110, 3, 4741, '#ffffff') : ''
  ].join('');
  for (let v = 0; v < 4; v++) tile(`t/ropeway/g/body${v}`, () => body(v));
  // 芝生のふち（下が葉っぱのようにまるくたれる）
  const grass = (v) => {
    const r = rng(4760 + v), out = [rect(0, 38, U, 14, '#000000', { opacity: 0.2 })];
    for (let x = 0; x <= 160; x += 20) out.push(circ(x, 40 + (x % 40 ? 2 : 0), 11, CAP.dark));
    out.push(rect(0, 0, U, 40, CAP.dark));
    for (let x = 0; x <= 160; x += 20) out.push(circ(x, 34 + (x % 40 ? 2 : 0), 10, CAP.base));
    out.push(rect(0, 0, U, 34, CAP.base), rect(0, 0, U, 9, CAP.light), rect(0, 0, U, 2.5, '#eaffd6'));
    for (let i = 0; i < 5; i++) { const x = 8 + i * 32 + r() * 10; out.push(path(`M${x} 12 q3 -6 6 0 q3 -7 6 0`, 'none', st('#a8e888', 2.4, { opacity: 0.9 }))); }
    for (let i = 0; i < 6; i++) out.push(circ(10 + r() * 140, 16 + r() * 18, 2 + r() * 1.5, '#5fb04b', { opacity: 0.8 }));
    if (v === 1) [[30, 22, '#ffffff'], [98, 18, '#ffe45a'], [128, 26, '#ffffff']].forEach(([x, y, c]) => out.push(...[0, 1, 2, 3, 4].map(k => circ(x + Math.cos(k / 5 * TAU) * 3.4, y + Math.sin(k / 5 * TAU) * 3.4, 2.8, c)), circ(x, y, 2, '#f7b733')));
    if (v === 2) [[56, 24], [118, 20]].forEach(([x, y]) => out.push(circ(x, y, 3, '#ff9ab8'), circ(x + 5, y + 3, 2.6, '#ffc2d6')));
    return out.join('');
  };
  for (let v = 0; v < 3; v++) tile(`t/ropeway/g/top${v}`, () => body(v + 5) + grass(v));
  tile('t/ropeway/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/ropeway/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tile('t/ropeway/g/topL', () => [rect(0, 0, 10, 46, CAP.dark), rect(0, 0, 5, 36, '#5fb04b'), rect(0, 0, 10, 3, '#eaffd6')].join(''));
  tile('t/ropeway/g/topR', () => [rect(150, 0, 10, 46, CAP.dark), rect(155, 0, 5, 36, '#5fb04b'), rect(150, 0, 10, 3, '#eaffd6')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/ropeway/g/${k}`, defs => slopeTile(defs, k, body(k.length % 4), CAP));

  // 鉄塔（すけて見える鉄骨の柱）と、てっぺんの点検台
  const S = { base: '#8d9aa8', dark: '#56626f', light: '#c9d3dc' };
  tile('t/ropeway/m/steel/hard', () => [
    path('M22 6 L138 78 M138 6 L22 78 M22 84 L138 156 M138 84 L22 156', 'none', st(S.dark, 11)),
    path('M22 6 L138 78 M138 6 L22 78 M22 84 L138 156 M138 84 L22 156', 'none', st(S.base, 6)),
    rect(0, 74, U, 12, S.dark), rect(0, 76, U, 5, S.base),
    rect(0, 0, 26, U, S.dark), rect(134, 0, 26, U, S.dark), rect(3, 0, 16, U, S.base), rect(137, 0, 16, U, S.base), rect(5, 0, 5, U, S.light), rect(139, 0, 5, U, S.light),
    ...[[12, 80], [148, 80]].map(([x, y]) => circ(x, y, 4, S.light))
  ].join(''));
  tile('t/ropeway/m/steel/hardT', () => [
    rect(0, 0, U, 40, S.dark), rect(0, 0, U, 32, '#b7c2cd'), rect(0, 0, U, 7, '#f2f6f9'),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 6, 12, 26, 3, '#8d9aa8', { opacity: 0.7 })),
    rect(0, 32, U, 5, '#f2c12e'), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => path(`M${i * 20} 37 L${i * 20 + 10} 32 L${i * 20 + 16} 32 L${i * 20 + 6} 37 Z`, '#3a3f46')),
    rect(0, 40, U, 8, '#000000', { opacity: 0.25 })
  ].join(''));

  // 温室のガラス（白いわく。中の植物がすけて見える）
  const glass = (door) => {
    const out = [rect(0, 0, U, U, '#d8f1f7', { opacity: door ? 0.18 : 0.42 })];
    if (!door) out.push(path('M18 150 L58 10 L80 10 L40 150 Z', '#ffffff', { opacity: 0.35 }), path('M96 150 L122 60 L132 60 L106 150 Z', '#ffffff', { opacity: 0.25 }));
    out.push(rect(0, 0, 10, U, '#ffffff'), rect(150, 0, 10, U, '#e6edf0'), rect(0, 0, U, 8, '#ffffff'), rect(0, 152, U, 8, '#dfe7ea'));
    if (!door) out.push(rect(76, 0, 8, U, '#ffffff'), rect(0, 76, U, 7, '#ffffff'));
    else out.push(path('M10 8 L46 22 L46 150 L10 152 Z', '#ffffff', { opacity: 0.85 }), path('M18 26 L40 34 L40 140 L18 144 Z', '#cdeef6', { opacity: 0.8 }), circ(40, 90, 3.5, '#d7b04a'));
    return out.join('');
  };
  tile('t/ropeway/m/glass/hard', () => glass(false));
  tile('t/ropeway/m/glass/fake', () => glass(true));
  tile('t/ropeway/m/glass/hardT', () => [rect(0, 0, U, 18, '#8fa4ad'), rect(0, 0, U, 13, '#f4f8f9'), rect(0, 0, U, 4, '#ffffff'), ...[20, 60, 100, 140].map(x => circ(x, 8, 3, '#cfdadf'))].join(''));
}

// ========================================================================
// 飾り（シート s4）
// ========================================================================
// ---------- ゴンドラ（幅32。床が y、ワイヤーは床より 34 上） ----------
function gondola(lit) {
  const red = '#e8423a', redD = '#b52a25', redL = '#ff7f70';
  const body = 'M-6 -250 Q-6 -282 26 -282 L294 -282 Q326 -282 326 -250 L326 -10 Q326 20 296 20 L24 20 Q-6 20 -6 -10 Z';
  return [
    // つり手とにぎり（ワイヤーの上を走る車輪）
    path('M160 -334 L160 -300 Q160 -292 150 -290 L150 -282 M160 -300 Q164 -292 176 -290 L176 -282', 'none', st('#3d434d', 14)),
    rrect(112, -362, 96, 22, 8, '#4b535f'), circ(130, -346, 11, '#2f343c'), circ(190, -346, 11, '#2f343c'), circ(130, -346, 4, '#9aa3ad'), circ(190, -346, 4, '#9aa3ad'),
    // 屋根
    rrect(44, -304, 232, 30, 12, '#56606c'), rect(60, -304, 200, 8, '#8f99a5'),
    // 箱
    path(body, 'none', { stroke: OUT, strokeWidth: 12, strokeLinejoin: 'round' }),
    path(body, redD), path('M-6 -250 Q-6 -282 26 -282 L294 -282 Q326 -282 326 -250 L326 -20 L-6 -20 Z', red),
    rect(-6, -272, 332, 10, redL, { opacity: 0.8 }),
    // 窓
    rrect(12, -240, 296, 112, 18, lit ? '#ffe6a0' : '#cfeaf6'),
    lit ? rrect(12, -240, 296, 112, 18, '#fff4cf', { opacity: 0.5 }) : path('M28 -232 L92 -232 L28 -150 Z', '#ffffff', { opacity: 0.7 }),
    lit ? '' : path('M200 -232 L226 -232 L186 -136 L160 -136 Z', '#ffffff', { opacity: 0.35 }),
    rect(106, -240, 10, 112, redD), rect(204, -240, 10, 112, redD),
    rrect(12, -240, 296, 112, 18, 'none', { stroke: '#8e1f1b', strokeWidth: 5 }),
    // 白い帯と番号
    rect(-6, -112, 332, 16, '#ffffff'),
    rrect(136, -84, 48, 26, 5, '#ffffff', { opacity: 0.85 }), rect(146, -76, 28, 8, redD),
    // 床（乗るところ）
    rect(-2, -14, 324, 14, '#d5d0c6'), rect(-2, -14, 324, 5, '#fbf8f2'), rect(-2, 0, 324, 8, '#8a847a')
  ].join('');
}
sprite(SH, 's4/gondola', 38, 42, 3, 38, () => tr(3, 38, gondola(false), 0.1));
sprite(SH, 's4/gondolaL', 38, 42, 3, 38, () => tr(3, 38, gondola(true), 0.1));

// ---------- 駅（ガラスの大きな窓・緑の帯・ゴンドラの入り口と大きな滑車） ----------
// 屋根の上面が -64（乗れる）。bayW: ゴンドラの入り口の幅、wheel: 滑車の中心 [x, y]
function station(defs, W, bayRight, wheel) {
  const Gd = G(defs), out = [];
  const wall = '#f5efe3', band = '#2e8b83', bandD = '#1f6b64';
  const bay = bayRight ? [W - 470, W] : [0, 470];
  const hall = bayRight ? [0, W - 470] : [470, W];
  // 本体
  out.push(rect(0, -600, W, 600, wall), rect(0, -600, W, 600, Gd.wallShade));
  // ゴンドラの入り口（中は暗い）
  out.push(rect(bay[0], -560, bay[1] - bay[0], 520, defs.lin([[0, '#314452'], [1, '#4d6270']])));
  out.push(rect(bay[0], -560, bay[1] - bay[0], 40, '#000000', { opacity: 0.25 }));
  // 大きな滑車
  const [wx, wy, wr] = wheel;
  out.push(circ(wx, wy, wr + 10, '#26343e', { opacity: 0.5 }), circ(wx, wy, wr, 'none', { stroke: '#c9d2da', strokeWidth: 16 }), circ(wx, wy, wr - 12, 'none', { stroke: '#7e8c98', strokeWidth: 6 }));
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; out.push(path(`M${wx} ${wy} L${wx + Math.cos(a) * (wr - 8)} ${wy + Math.sin(a) * (wr - 8)}`, 'none', st('#a9b5bf', 8))); }
  out.push(circ(wx, wy, 18, '#e8413a'), circ(wx, wy, 7, '#ffffff'));
  out.push(path(`M${wx - 60} ${wy + wr + 14} L${wx + 60} ${wy + wr + 14} L${wx + 40} 0 L${wx - 40} 0 Z`, '#5b6b77'));
  // 入り口のはしら
  for (const x of [bay[0], bay[1] - 30]) out.push(rect(x, -600, 30, 600, '#dfe6ea'), rect(x, -600, 8, 600, '#ffffff'));
  // 待合室の大きなガラス
  const gx0 = hall[0] + 70, gx1 = hall[1] - 70, gy0 = -520, gy1 = -110;
  out.push(rect(gx0 - 14, gy0 - 14, gx1 - gx0 + 28, gy1 - gy0 + 28, '#ffffff'));
  out.push(rect(gx0, gy0, gx1 - gx0, gy1 - gy0, defs.lin([[0, '#fff3dc'], [1, '#f2dcb6']])), rect(gx0, gy0, gx1 - gx0, gy1 - gy0, Gd.inShade, { opacity: 0.45 }));
  // 中：改札・階段・ポスター・ペンダントライト
  const mid = (gx0 + gx1) / 2;
  for (let i = 0; i < 6; i++) out.push(rect(mid + 40 + i * 30, gy1 - 30 - i * 30, gx1 - mid - 60 - i * 30, 30, i % 2 ? '#d8c6a8' : '#e6d6bb'));
  for (let x = gx0 + 50; x < mid - 20; x += 90) out.push(rrect(x, gy1 - 110, 50, 110, 6, '#8a9aa8'), rect(x + 8, gy1 - 100, 34, 22, '#bfe3f5'), rect(x + 20, gy1 - 60, 10, 30, '#f2c94c'));
  out.push(rrect(gx0 + 40, gy0 + 60, 90, 120, 6, '#ffffff'), rect(gx0 + 48, gy0 + 68, 74, 60, '#7cc5e8'), rect(gx0 + 48, gy0 + 132, 74, 10, '#e8413a'), rect(gx0 + 48, gy0 + 150, 50, 6, '#999999'));
  for (const x of [gx0 + (gx1 - gx0) * 0.35, gx0 + (gx1 - gx0) * 0.7]) out.push(path(`M${x} ${gy0} L${x} ${gy0 + 50}`, 'none', st('#555555', 3)), path(`M${x - 22} ${gy0 + 70} Q${x} ${gy0 + 36} ${x + 22} ${gy0 + 70} Z`, '#2e8b83'), circ(x, gy0 + 74, 9, '#fff2c0'));
  // ガラスのわく・うつりこみ
  for (let x = gx0; x <= gx1 + 1; x += (gx1 - gx0) / Math.max(2, Math.round((gx1 - gx0) / 180))) out.push(rect(x - 6, gy0, 12, gy1 - gy0, '#ffffff'));
  out.push(rect(gx0, gy0 + 150, gx1 - gx0, 10, '#ffffff'));
  out.push(path(`M${gx0 + 20} ${gy0} L${gx0 + 140} ${gy0} L${gx0 + 20} ${gy0 + 150} Z`, '#ffffff', { opacity: 0.35 }), path(`M${gx0 + 200} ${gy0 + 160} L${gx0 + 250} ${gy0 + 160} L${gx0 + 170} ${gy1} L${gx0 + 120} ${gy1} Z`, '#ffffff', { opacity: 0.18 }));
  // 入り口の自動ドア
  const dx = bayRight ? gx0 + (gx1 - gx0) * 0.5 - 90 : gx0 + (gx1 - gx0) * 0.5 - 90;
  out.push(rect(dx - 10, gy1 - 250, 200, 260, '#6b7a86'), rect(dx, gy1 - 240, 88, 250, '#bfe3f5'), rect(dx + 92, gy1 - 240, 88, 250, '#bfe3f5'), path(`M${dx + 10} ${gy1 - 230} L${dx + 50} ${gy1 - 230} L${dx + 10} ${gy1 - 170} Z`, '#ffffff', { opacity: 0.6 }));
  // 緑の帯と名前の板（文字はゲームで描く）
  out.push(rect(0, -600, W, 70, band), rect(0, -600, W, 12, '#57b3a9'), rect(0, -536, W, 8, bandD));
  const sx = (hall[0] + hall[1]) / 2;
  out.push(rrect(sx - 250, -590, 500, 96, 12, '#ffffff'), rrect(sx - 250, -590, 500, 96, 12, 'none', { stroke: bandD, strokeWidth: 6 }), rect(sx - 240, -520, 480, 8, '#e8413a'));
  // 屋根（平ら・上に乗れる：明るいふち）
  out.push(rect(-40, -640, W + 80, 46, '#b3ada1'), rect(-40, -640, W + 80, 34, '#efeae0'), rect(-40, -640, W + 80, 8, '#ffffff'), rect(-40, -594, W + 80, 10, '#000000', { opacity: 0.15 }));
  // 足もと（石）と花のプランター
  out.push(rect(0, -50, W, 50, '#c9bda8'), rect(0, -50, W, 8, '#e3dacb'));
  const r = rng(4901);
  for (const x of [hall[0] + 20, hall[1] - 180]) out.push(flowerBox(x, -58, 160, r, ['#ff6b7d', '#ffd24a', '#ffffff', '#b58ae6']));
  return out.join('');
}
// ふもとの駅（幅224。右にゴンドラの入り口）
sprite(SH, 's4/station0', 232, 70, 4, 68, defs => tr(4, 68, station(defs, 2240, true, [2090, -420, 80]), 0.1));
// 中間駅・山頂駅（幅128。左にゴンドラの入り口）
sprite(SH, 's4/station1', 136, 70, 4, 68, defs => tr(4, 68, station(defs, 1280, false, [230, -270, 70]), 0.1));

// 出発する側の滑車の台（地面のはし。ワイヤーは地面から 34 上）
sprite(SH, 's4/gantry', 36, 46, 30, 45, defs => tr(30, 45, [
  path('M-270 0 L-200 -300 L-170 -300 L-210 0 Z', '#7f8c99'), path('M-20 0 L-80 -300 L-110 -300 L-80 0 Z', '#6b7885'),
  path('M-236 -120 L-60 -120 M-220 -200 L-80 -200', 'none', st('#6b7885', 10)),
  path('M-236 -120 L-80 -200 M-60 -120 L-220 -200', 'none', st('#8d9aa8', 6)),
  rrect(-240, -330, 200, 40, 8, '#56626f'), rect(-230, -330, 180, 10, '#aeb9c4'),
  circ(-60, -270, 72, 'none', { stroke: '#56626f', strokeWidth: 16 }), circ(-60, -270, 72, 'none', { stroke: '#c9d3dc', strokeWidth: 6 }),
  ...[0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * TAU; return path(`M-60 -270 L${-60 + Math.cos(a) * 64} ${-270 + Math.sin(a) * 64}`, 'none', st('#8d9aa8', 5)); }),
  circ(-60, -270, 14, '#e8413a'),
  rect(-290, -12, 290, 12, '#8d8577')
], 0.1));

// ---------- 鉄塔の上の部分（点検台から上のマストと、ワイヤーをのせる滑車）・点検台より下の足 ----------
// up: 点検台からワイヤーまでの高さ、down: 点検台から画面の下までの長さ（ドット）
export function pylon(up, down, c) {
  const U2 = up * 10, D2 = down * 10, out = [];
  // 下の足（うしろに広がる）
  out.push(path(`M-70 0 L${-70 - D2 * 0.22} ${D2} M70 0 L${70 + D2 * 0.22} ${D2}`, 'none', st(c.dark, 16)));
  out.push(path(`M-70 0 L${-70 - D2 * 0.22} ${D2} M70 0 L${70 + D2 * 0.22} ${D2}`, 'none', st(c.base, 9)));
  for (let y = 40; y + 120 <= D2 + 40; y += 120) { const a = 70 + y * 0.22, b2 = 70 + Math.min(D2, y + 120) * 0.22, y2 = Math.min(D2, y + 120); out.push(path(`M${-a} ${y} L${b2} ${y2} M${a} ${y} L${-b2} ${y2} M${-b2} ${y2} L${b2} ${y2}`, 'none', st(c.base, 5, { opacity: 0.85 }))); }
  // 上のマスト（細くなる）
  const topY = -U2 + 60;
  out.push(path(`M-60 0 L-24 ${topY} M60 0 L24 ${topY}`, 'none', st(c.dark, 14)), path(`M-60 0 L-24 ${topY} M60 0 L24 ${topY}`, 'none', st(c.base, 8)));
  for (let y = -40; y > topY + 20; y -= 90) {
    const w0 = 60 - (y / topY) * 36, w1 = 60 - ((y - 90) / topY) * 36;
    out.push(path(`M${-w0} ${y} L${w1} ${Math.max(topY, y - 90)} M${w0} ${y} L${-w1} ${Math.max(topY, y - 90)}`, 'none', st(c.base, 5)));
  }
  out.push(path(`M${-24} ${topY} L${24} ${topY}`, 'none', st(c.dark, 12)));
  // 腕と滑車（ワイヤーは -U2 の高さ）
  out.push(rrect(-110, topY - 36, 220, 30, 10, c.dark), rect(-100, topY - 36, 200, 8, c.light));
  for (const x of [-70, 0, 70]) out.push(circ(x, -U2 + 16, 16, c.dark), circ(x, -U2 + 16, 6, c.light));
  if (c.lamp) out.push(circ(0, topY - 50, 12, '#ff4a3a'), circ(0, topY - 50, 5, '#ffd0c8'));
  return out.join('');
}
const STEEL = { base: '#8d9aa8', dark: '#56626f', light: '#d3dce4' };
sprite(SH, 's4/pylonA', 30, 108, 15, 58, () => tr(15, 58, pylon(57, 48, STEEL), 0.1));
sprite(SH, 's4/pylonB', 36, 148, 18, 67, () => tr(18, 67, pylon(66, 80, STEEL), 0.1));

// ---------- レストハウス（ヨーロッパふう・テラコッタの屋根・丸い塔） ----------
sprite(SH, 's4/resthouse', 150, 108, 6, 107, defs => {
  const Gd = G(defs), out = [], r = rng(4951);
  const W = 1300, wall = '#f7ecd6', roof = '#d0643f', roofD = '#a44a2e', roofL = '#e98a62';
  // 屋根の瓦（テラコッタ）
  const tiles = (x0, x1, y0, y1, taper) => {
    const o = [];
    for (let y = y0 + 34, k = 0; y < y1; y += 36, k++) {
      const t = (y - y0) / (y1 - y0), a = x0 + taper * (1 - t), b = x1 - taper * (1 - t);
      o.push(rect(a, y - 3, b - a, 5, roofD, { opacity: 0.55 }));
      for (let x = a + (k % 2) * 20; x < b - 10; x += 40) o.push(rect(x, y - 30, 3, 27, roofD, { opacity: 0.35 }));
    }
    return o.join('');
  };
  // 本体（2階建て）
  out.push(rect(260, -640, W - 260, 640, wall), rect(260, -640, W - 260, 640, Gd.wallShade), rect(W - 60, -640, 60, 640, '#e8d9bd'));
  // 屋根（寄せ棟）
  out.push(path(`M200 -620 L360 -860 L${W - 100} -860 L${W + 60} -620 Z`, roof));
  out.push(tiles(200, W + 60, -860, -620, 160));
  out.push(path(`M200 -620 L360 -860 L380 -860 L240 -620 Z`, roofL, { opacity: 0.6 }));
  out.push(rect(180, -636, W - 100, 26, roofD), rect(180, -636, W - 100, 8, roofL));
  out.push(rect(340, -876, W - 420, 20, roofD));
  // 屋根窓（ドーマー）とえんとつ
  for (const x of [620, 940]) out.push(path(`M${x - 70} -700 L${x - 70} -790 L${x} -840 L${x + 70} -790 L${x + 70} -700 Z`, wall), path(`M${x - 88} -782 L${x} -852 L${x + 88} -782 L${x + 70} -774 L${x} -830 L${x - 70} -774 Z`, roof), rect(x - 34, -780, 68, 72, Gd.glass), rect(x - 3, -780, 6, 72, '#ffffff'), path(`M${x - 28} -774 L${x - 6} -774 L${x - 28} -740 Z`, '#ffffff', { opacity: 0.5 }));
  out.push(rect(1080, -960, 70, 130, '#c9b89a'), rect(1070, -972, 90, 20, '#a8977a'));
  // 丸い塔（左）
  out.push(rect(20, -760, 280, 760, '#f1e2c6'), rect(20, -760, 80, 760, '#fff6e6', { opacity: 0.5 }), rect(230, -760, 70, 760, '#000000', { opacity: 0.07 }));
  out.push(path('M0 -750 L160 -990 L320 -750 Z', roof), tiles(0, 320, -990, -750, 160));
  out.push(path('M0 -750 L160 -990 L150 -750 Z', roofL, { opacity: 0.35 }), rect(-10, -766, 340, 24, roofD));
  out.push(rect(156, -1050, 8, 70, '#4a4a4a'), path('M164 -1040 L220 -1030 L164 -1016 Z', '#e8413a'), circ(160, -1052, 10, '#d7b04a'));
  // 塔の窓（アーチ）
  for (const y of [-620, -380]) out.push(path(`M110 ${y + 150} L110 ${y + 40} A50 50 0 0 1 210 ${y + 40} L210 ${y + 150} Z`, '#ffffff'), path(`M124 ${y + 140} L124 ${y + 44} A36 36 0 0 1 196 ${y + 44} L196 ${y + 140} Z`, Gd.glass), rect(156, y + 10, 8, 132, '#ffffff'), path(`M130 ${y + 60} L150 ${y + 30} L130 ${y + 110} Z`, '#ffffff', { opacity: 0.5 }));
  // ツタとバラ（塔）
  for (let i = 0; i < 16; i++) { const x = 30 + r() * 60, y = -40 - r() * 520; out.push(cloverBlob(x, y + 4, 26 + r() * 10, '#3f8a3f'), cloverBlob(x, y, 24 + r() * 10, r() < 0.5 ? '#5dab4f' : '#4f9a45', '#9ad47c')); if (r() < 0.5) out.push(circ(x + 10, y - 6, 8, '#ff6b7d'), circ(x + 10, y - 6, 3, '#ffd0d6')); }
  // 2階の窓（よろい戸と花の箱）
  for (const x of [400, 640, 880, 1100]) {
    out.push(rect(x - 44, -540, 30, 170, '#3f8a64'), rect(x + 114, -540, 30, 170, '#3f8a64'));
    for (let k = 0; k < 7; k++) out.push(rect(x - 40, -530 + k * 23, 22, 5, '#2f6a4c'), rect(x + 118, -530 + k * 23, 22, 5, '#2f6a4c'));
    out.push(win(Gd, x, -540, 100, 170, { frame: '#ffffff', curtain: '#f8e6e0', bar: true }), flowerBox(x - 20, -346, 140, r, ['#ff4a5a', '#ffffff', '#ff8a9a']));
  }
  // 1階：アーチのテラス（中はあたたかい光）
  for (const [i, x] of [340, 560, 780, 1000].entries()) {
    out.push(path(`M${x} 0 L${x} -200 A100 100 0 0 1 ${x + 200} -200 L${x + 200} 0 Z`, '#ffffff'));
    out.push(path(`M${x + 16} 0 L${x + 16} -200 A84 84 0 0 1 ${x + 184} -200 L${x + 184} 0 Z`, defs.lin([[0, '#ffe2ae'], [1, '#e9c58a']])));
    out.push(path(`M${x + 16} 0 L${x + 16} -200 A84 84 0 0 1 ${x + 184} -200 L${x + 184} 0 Z`, Gd.inShade, { opacity: 0.5 }));
    if (i === 1) out.push(rect(x + 50, -220, 100, 220, '#8a5a3a'), rect(x + 60, -210, 80, 210, '#a8744c'), rect(x + 70, -196, 60, 90, '#ffe2ae'), circ(x + 124, -100, 6, '#f2c94c'));
    else out.push(rect(x + 30, -80, 140, 10, '#8a5a3a'), rect(x + 40, -70, 8, 70, '#6a4430'), rect(x + 152, -70, 8, 70, '#6a4430'), ...[x + 60, x + 100, x + 140].map(cx => [rrect(cx - 14, -104, 28, 24, 6, '#ffffff'), path(`M${cx + 14} -98 q10 4 0 12`, 'none', st('#ffffff', 4))].join('')));
  }
  // 看板（文字はゲームで描く）
  out.push(rrect(560, -312, 420, 78, 12, '#6a4430'), rrect(572, -300, 396, 54, 8, '#fff6e6'));
  // 足もと（石）
  out.push(rect(0, -36, W, 36, '#cbbfa8'), rect(0, -36, W, 7, '#e5dccb'));
  return tr(6, 107, out.join(''), 0.1);
});

// ---------- 温室の中（ガラスのかべのうしろ。幅128・高さ64） ----------
sprite(SH, 's4/greenhouse', 130, 66, 1, 65, defs => {
  const r = rng(4961), out = [];
  out.push(rect(0, -640, 1280, 640, defs.lin([[0, '#e9f8ef'], [1, '#cfe9d6']])));
  // 鉄のはり
  for (const x of [320, 640, 960]) out.push(rect(x - 5, -640, 10, 640, '#ffffff', { opacity: 0.7 }));
  out.push(path('M0 -470 Q640 -600 1280 -470', 'none', st('#ffffff', 8, { opacity: 0.7 })));
  // 大きな葉（ヤシ・バナナ）
  const palm = (x, y, s) => {
    const o = [path(`M${x - 8 * s} ${y} Q${x - 14 * s} ${y - 200 * s} ${x} ${y - 360 * s} L${x + 12 * s} ${y - 360 * s} Q${x + 4 * s} ${y - 200 * s} ${x + 12 * s} ${y} Z`, '#8a6a4a')];
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.45, l = (170 + r() * 50) * s; const ex = x + Math.cos(a) * l, ey = y - 360 * s + Math.sin(a) * l * 0.55 + l * 0.35; o.push(path(`M${x} ${y - 360 * s} Q${(x + ex) / 2} ${y - 400 * s} ${ex} ${ey}`, 'none', st(k % 2 ? '#3f8a3f' : '#4f9a45', 26 * s))); o.push(path(`M${x} ${y - 360 * s} Q${(x + ex) / 2} ${y - 400 * s} ${ex} ${ey}`, 'none', st('#8fd07a', 6 * s, { opacity: 0.7 }))); }
    return o.join('');
  };
  out.push(palm(240, 0, 1.3), palm(1010, 0, 1.15), palm(640, 0, 0.9));
  // こんもりした植物と花
  for (let i = 0; i < 22; i++) { const x = r() * 1280, y = -60 - r() * 140; out.push(cloverBlob(x, y + 8, 44 + r() * 20, '#2f7a3a'), cloverBlob(x, y, 40 + r() * 18, r() < 0.5 ? '#4f9a45' : '#5dab4f', '#9ad47c')); }
  const fl = ['#ff6b7d', '#ffd24a', '#ffffff', '#ff9ac2', '#ff8a3a'];
  for (let i = 0; i < 30; i++) { const x = 20 + r() * 1240, y = -80 - r() * 150, c = fl[i % fl.length]; out.push(...[0, 1, 2, 3, 4].map(k => circ(x + Math.cos(k / 5 * TAU) * 9, y + Math.sin(k / 5 * TAU) * 9, 8, c)), circ(x, y, 5, '#f7b733')); }
  // つりかご
  for (const x of [420, 860]) out.push(path(`M${x} -640 L${x} -470`, 'none', st('#6b6258', 3)), path(`M${x - 50} -470 Q${x} -410 ${x + 50} -470 Z`, '#a0603a'), cloverBlob(x, -486, 40, '#4f9a45', '#9ad47c'), circ(x - 20, -470, 9, '#ff6b7d'), circ(x + 24, -476, 9, '#ffffff'));
  // 石の床
  out.push(rect(0, -40, 1280, 40, '#d9cdb5'), rect(0, -40, 1280, 6, '#efe6d4'));
  return tr(1, 65, out.join(''), 0.1);
});

// ---------- ラベンダー畑（うしろに広がる段々。下の方は芝生で静かに） ----------
sprite(SH, 's4/lavender', 96, 48, 0, 47, defs => {
  const r = rng(4971), out = [];
  const W = 960;
  // 丸い丘の形で切りぬく（ならべると、ゆるい丘がつづいて見える）
  const hill = defs.clip(`<path d="M-10 0 L-10 -200 Q60 -250 160 -330 Q480 -560 800 -330 Q900 -250 970 -200 L970 0 Z"/>`);
  const field = [];
  field.push(path(`M0 0 L0 -470 L960 -470 L960 0 Z`, '#8cc873'));
  // うね（奥ほど細く、手前ほど太い）。紫のもこもこの列と緑の列を交互に
  const rowY = x => -40 * Math.sin(x / W * Math.PI * 2 + 0.4) * 0.3;
  for (let k = 0; k < 6; k++) {
    const y = -430 + k * 40, rad = 10 + k * 3.6, gap = 18 + k * 5;
    field.push(path(`M0 ${y + rowY(0) + rad * 0.8} L${W} ${y + rowY(W) + rad * 0.8} L${W} ${y + rowY(W) + rad * 2.2} L0 ${y + rowY(0) + rad * 2.2} Z`, k % 2 ? '#78b862' : '#6fb05b'));
    for (let x = -rad; x < W + rad; x += gap) {
      const yy = y + rowY(x) + (r() - 0.5) * 3;
      field.push(circ(x, yy + rad * 0.35, rad, '#8467b8'), circ(x, yy, rad * 0.95, k < 2 ? '#b8a3e0' : '#a58ad8'), circ(x - rad * 0.3, yy - rad * 0.35, rad * 0.45, '#d7c8f4', { opacity: 0.85 }));
    }
  }
  out.push(g(field.join(''), { 'clip-path': hill }));
  // 手前の芝生とひくい石のふち（歩くところのすぐ上は静かに）
  out.push(rect(0, -180, W, 180, '#80c56a'), rect(0, -180, W, 10, '#a8dc8e'));
  for (let x = 0; x < W; x += 40) out.push(clover(x + r() * 16, -150 + r() * 26, 12 + r() * 6, '#72b95e', '#a2da86'));
  out.push(rect(0, -40, W, 40, '#d8cbb0'), rect(0, -40, W, 8, '#efe6d4'));
  return tr(0, 47, out.join(''), 0.1);
});

// ---------- ハーブのプランター・ベンチ・街灯・木・花だん・望遠鏡 ----------
sprite(SH, 's4/planter', 34, 22, 1, 21, () => {
  const r = rng(4981), out = [];
  // ローズマリー（細い葉）・バジル（丸い葉）・ミント・花
  for (let k = 0; k < 9; k++) { const x = 30 + k * 12, a = -Math.PI / 2 + (k - 4) * 0.12; out.push(path(`M${x} -70 Q${x + Math.cos(a) * 20} -130 ${x + Math.cos(a) * 30} ${-150 - r() * 30}`, 'none', st(k % 2 ? '#4a8a5a' : '#5f9e6a', 6))); }
  for (let k = 0; k < 6; k++) out.push(circ(38 + r() * 90, -140 - r() * 20, 5, '#b39ddb'));
  for (let k = 0; k < 7; k++) out.push(ell(160 + r() * 60, -100 - r() * 50, 18, 12, r() < 0.5 ? '#5fb04b' : '#6fc15a', { rot: r() * 60 - 30 }), ell(156 + r() * 60, -106 - r() * 50, 7, 4, '#b6ea98', { opacity: 0.8 }));
  for (let k = 0; k < 8; k++) out.push(cloverBlob(250 + r() * 70, -96 - r() * 40, 22, '#3f9a55', '#8ad89a'));
  for (let k = 0; k < 4; k++) out.push(circ(250 + r() * 70, -130 - r() * 20, 7, '#ffffff'), circ(250 + r() * 70, -120 - r() * 20, 6, '#ff9ac2'));
  // 木の箱
  out.push(rect(10, -80, 320, 80, '#a8733f'), rect(10, -80, 320, 12, '#c9925a'));
  for (let k = 0; k < 3; k++) out.push(rect(10, -56 + k * 22, 320, 3, '#8a5a30', { opacity: 0.8 }));
  out.push(rect(10, -80, 12, 80, '#8a5a30'), rect(318, -80, 12, 80, '#8a5a30'));
  // 名札
  for (const x of [60, 170, 280]) out.push(rect(x, -110, 4, 40, '#e8dcc4'), rrect(x - 14, -126, 32, 20, 3, '#fffaf0'));
  return tr(1, 21, out.join(''), 0.1);
});
sprite(SH, 's4/bench', 28, 16, 1, 15, () => tr(1, 15, [
  rect(20, -90, 8, 90, '#3d3a3a'), rect(232, -90, 8, 90, '#3d3a3a'), path('M20 -90 Q10 -120 26 -140 M240 -90 Q250 -120 234 -140', 'none', st('#3d3a3a', 8)),
  ...[0, 1, 2].map(k => rect(10, -150 + k * 20, 240, 14, k % 2 ? '#b07a45' : '#c48a50')),
  rect(0, -86, 260, 16, '#c48a50'), rect(0, -86, 260, 5, '#e0ad74'), rect(0, -70, 260, 6, '#8a5a30'),
  rect(0, -4, 260, 4, '#000000', { opacity: 0.12 })
], 0.1));
sprite(SH, 's4/lamp', 16, 50, 8, 49, defs => tr(8, 49, [
  rrect(-34, -50, 68, 50, 10, '#2e3136'), rect(-34, -50, 68, 8, '#55595f'),
  path('M-12 -50 L-8 -380 L8 -380 L12 -50 Z', '#2e3136'), rect(-6, -380, 4, 330, '#5a5e66', { opacity: 0.8 }),
  rrect(-18, -130, 36, 18, 6, '#2e3136'),
  path('M-40 -380 L40 -380 L30 -400 L-30 -400 Z', '#2e3136'),
  path('M-30 -400 L-40 -470 L40 -470 L30 -400 Z', defs.rad([[0, '#ffffff'], [0.7, '#fff6de'], [1, '#e8d6ac']], 0.4, 0.4, 0.7)),
  path('M-30 -400 L-40 -470 L-34 -470 L-20 -400 Z', '#ffffff', { opacity: 0.8 }),
  rect(-3, -470, 6, 70, '#2e3136', { opacity: 0.7 }),
  path('M-54 -470 L54 -470 L0 -500 Z', '#2e3136'), circ(0, -506, 8, '#2e3136')
], 0.1));
// 木（ヨーロッパの庭の丸い木・細いイトスギ）
sprite(SH, 's4/tree', 52, 66, 26, 65, () => {
  const r = rng(4991), out = [];
  out.push(ell(0, -4, 140, 20, '#000000', { opacity: 0.12 }));
  out.push(path('M-20 0 C-14 -110 -24 -170 -60 -240 L-44 -250 C-18 -206 -6 -190 2 -270 L20 -266 C16 -190 22 -110 22 0 Z', '#7a5a3f'));
  const blobs = [];
  for (let i = 0; i < 24; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 180 * d, -400 + Math.sin(a) * 140 * d, 56 + r() * 28]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#3a7f3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 540) / 280; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4f9a45' : r() < 0.5 ? '#5dab4f' : '#66b556', t < 0.5 ? '#a6dc84' : null)); }
  for (let i = 0; i < 12; i++) out.push(circ(-140 + r() * 280, -540 + r() * 240, 8 + r() * 8, '#c2eca0', { opacity: 0.55 }));
  return tr(26, 65, out.join(''), 0.1);
});
sprite(SH, 's4/cypress', 16, 64, 8, 63, () => tr(8, 63, [
  rect(-8, -60, 16, 60, '#6a4a32'),
  path('M0 -630 C70 -470 76 -200 40 -50 L-40 -50 C-76 -200 -70 -470 0 -630 Z', '#2f6f3f'),
  path('M0 -620 C60 -460 64 -210 30 -60 L4 -60 C24 -220 20 -460 0 -620 Z', '#245a33', { opacity: 0.7 }),
  path('M-6 -600 C-44 -460 -50 -260 -30 -80', 'none', st('#5fa068', 10, { opacity: 0.7 })),
  ...[[-20, -500], [-30, -380], [-24, -250], [-34, -160]].map(([x, y]) => ell(x, y, 12, 26, '#4f9a55', { opacity: 0.8 }))
], 0.1));
sprite(SH, 's4/flowerbed', 40, 14, 0, 13, () => {
  const r = rng(4995), out = [];
  out.push(ell(200, -20, 200, 50, '#5a9e48'), ell(200, -30, 186, 40, '#6fb85a'));
  const cols = ['#ff5a6e', '#ffd24a', '#ffffff', '#ff9ac2', '#ff8a3a'];
  for (let i = 0; i < 26; i++) { const x = 30 + r() * 340, y = -30 - r() * 50 + Math.abs(x - 200) * 0.18, c = cols[Math.floor(r() * cols.length)]; out.push(...[0, 1, 2, 3, 4].map(k => circ(x + Math.cos(k / 5 * TAU) * 6, y + Math.sin(k / 5 * TAU) * 6, 5.5, c)), circ(x, y, 3.4, '#f7b733')); }
  out.push(rect(0, -14, 400, 14, '#d8cbb0'), rect(0, -14, 400, 4, '#f0e8d8'));
  return tr(0, 13, out.join(''), 0.1);
});
// 望遠鏡（景色を見る）
sprite(SH, 's4/scope', 16, 30, 8, 29, () => tr(8, 29, [
  rect(-6, -180, 12, 170, '#5a6470'), rrect(-40, -16, 80, 16, 5, '#3d444d'),
  rrect(-50, -250, 110, 64, 20, '#2f7fb8', { rot: -12 }), rrect(-58, -244, 22, 52, 8, '#1f5f8e', { rot: -12 }),
  circ(-50, -232, 10, '#bfe3f5'), rect(-20, -200, 40, 20, '#3d444d')
], 0.1));
// 石がきにたれる花とツタ（タイルの前）
for (let v = 0; v < 2; v++) sprite(SH, `s4/ivy${v}`, 40, 56, 20, 0, () => {
  const r = rng(4996 + v), out = [];
  const len = v ? 520 : 380;
  for (let s = 0; s < 3; s++) {
    const x0 = -120 + s * 110 + r() * 30, l = len * (0.5 + r() * 0.5);
    out.push(path(`M${x0} 20 Q${x0 + (r() - 0.5) * 60} ${l * 0.5} ${x0 + (r() - 0.5) * 30} ${l}`, 'none', st('#3e7a34', 6)));
    for (let k = 0; k < l / 36; k++) { const yy = 30 + k * 36 + r() * 10, xx = x0 + (r() - 0.5) * 44 * (yy / l); out.push(cloverBlob(xx, yy + 5, 32 + r() * 12, '#2f6a2c'), cloverBlob(xx, yy, 28 + r() * 10, r() < 0.5 ? '#4f9a45' : '#5dab4f', r() < 0.5 ? '#9ad67a' : null)); if (r() < 0.35) out.push(circ(xx + 8, yy - 6, 8, v ? '#ffffff' : '#ff8aa8'), circ(xx + 8, yy - 6, 3, '#ffd24a')); }
  }
  for (let k = 0; k < 8; k++) { const xx = -170 + k * 46 + r() * 18; out.push(cloverBlob(xx, 26 + r() * 16, 36 + r() * 14, '#3f8a3f'), cloverBlob(xx, 20 + r() * 12, 32 + r() * 12, '#5dab4f', '#a6dc84')); }
  return tr(20, 0, out.join(''), 0.1);
});
// 木のデッキのテラス（床は地面と同じ高さ・パラソルのテーブル）
sprite(SH, 's4/terrace', 64, 44, 0, 43, () => {
  const out = [];
  // デッキの床（地面の高さ。段にならないように薄く）
  out.push(rect(0, -26, 640, 26, '#b98150'), rect(0, -26, 640, 6, '#e0ad74'));
  for (let x = 0; x < 640; x += 64) out.push(rect(x, -20, 3, 20, '#8b5a30', { opacity: 0.7 }));
  // パラソル（丸い屋根なので乗れる足場には見えない）
  const umb = (cx, c1, c2) => {
    const o = [rect(cx - 5, -380, 10, 360, '#e8e2d6')];
    for (let i = 0; i < 6; i++) { const a0 = -150 + i * 50; o.push(path(`M${cx} -400 L${cx + a0} -300 Q${cx + a0 + 25} -318 ${cx + a0 + 50} -300 Z`, i % 2 ? c2 : c1)); }
    o.push(circ(cx, -404, 10, '#e8e2d6'));
    // テーブルといす
    o.push(rrect(cx - 70, -130, 140, 14, 5, '#ffffff'), rect(cx - 6, -118, 12, 94, '#8a8f96'), rect(cx - 36, -30, 72, 8, '#8a8f96'));
    for (const d of [-1, 1]) o.push(rect(cx + d * 110 - 24, -96, 48, 10, '#2f7a5a'), rect(cx + d * 110 + (d > 0 ? 18 : -24), -170, 6, 80, '#2f7a5a'), rect(cx + d * 110 - 20, -86, 5, 62, '#2f7a5a'), rect(cx + d * 110 + 15, -86, 5, 62, '#2f7a5a'));
    o.push(rrect(cx - 30, -150, 22, 20, 5, '#ffffff'), rrect(cx + 10, -146, 18, 16, 4, '#f6d8a8'));
    return o.join('');
  };
  out.push(umb(170, '#e8423a', '#ffffff'), umb(470, '#2e8b83', '#ffffff'));
  // プランターの花
  out.push(rect(310, -70, 40, 44, '#a8733f'), cloverBlob(330, -90, 36, '#4f9a45', '#9ad47c'), circ(318, -100, 8, '#ff6b7d'), circ(342, -92, 8, '#ffd24a'));
  return tr(0, 43, out.join(''), 0.1);
});
