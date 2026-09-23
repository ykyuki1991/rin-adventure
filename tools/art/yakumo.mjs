// ステージ1「八雲通・春日野道」を完成イメージ（商店街の絵）に合わせて描き直したもの
// 背景（空・六甲山・街・阪急の高架・電柱）、地面（石垣とツタ・歩道）、飾り（店・アーケード・街灯・木・自販機・りんの家）
import { bgLayer, sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, text, f } from './svg.mjs';
import { wrap, ridgePath, ridgeY, cloud, anchor } from './bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile } from './tiles.mjs';

const st = (c, w, o = {}) => ({ stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', ...o });

// ---------- 共通：クローバーのような葉っぱのかたまり（完成イメージの木） ----------
function clover(x, y, r, c, light) {
  const k = r * 0.52;
  return [
    circ(x - k, y, r * 0.62, c), circ(x + k, y, r * 0.62, c), circ(x, y - k, r * 0.62, c), circ(x, y + k * 0.7, r * 0.58, c),
    light ? circ(x - k * 0.9, y - k * 0.6, r * 0.28, light, { opacity: 0.9 }) : ''
  ].join('');
}
// 木（幹＋葉のかたまり）。s は大きさ
function cloverTree(x, y, s, r, c) {
  const out = [path(`M${x - 2.2 * s} ${y} C${x - 1.5 * s} ${y - 12 * s} ${x - 3 * s} ${y - 18 * s} ${x - 6 * s} ${y - 24 * s} L${x - 4 * s} ${y - 25 * s} C${x - 1 * s} ${y - 20 * s} ${x + 1 * s} ${y - 18 * s} ${x + 2 * s} ${y - 26 * s} L${x + 3.6 * s} ${y - 25 * s} C${x + 2.5 * s} ${y - 16 * s} ${x + 2.4 * s} ${y - 10 * s} ${x + 2.4 * s} ${y} Z`, c.trunk)];
  const blobs = [];
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    blobs.push([x + Math.cos(a) * 13 * s * d, y - 32 * s + Math.sin(a) * 10 * s * d, (5 + r() * 3) * s]);
  }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(clover(bx, by + 1.2 * s, br, c.dark));
  for (const [bx, by, br] of blobs) out.push(clover(bx, by, br * 0.92, r() < 0.5 ? c.base : c.mid, c.light));
  return out.join('');
}

// ========================================================================
// 背景
// ========================================================================
// 雲（大きくてふわふわ、下が平ら・うすい青のかげ）
bgLayer('yakumo', { f: 0.025, w: 1200, y: 0, h: 120 }, (defs, w) => {
  const r = rng(7101);
  const out = [];
  const spots = [[90, 34, 0.9], [330, 58, 0.62], [560, 26, 1.05], [800, 48, 0.75], [1020, 30, 0.85]];
  for (const [x, y, s] of spots) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#dbe8f4', '#ffffff')));
  for (let i = 0; i < 4; i++) { const x = r() * w, y = 80 + r() * 20, s = 0.35 + r() * 0.15; out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#e1edf7', null))); }
  return out.join('');
});

// 六甲山（大きく・緑あざやか・木のもこもこ・錨山と電波塔）
bgLayer('yakumo', { f: 0.055, w: 1100, y: 24, h: 216 }, (defs, w) => {
  const r = rng(7201);
  const FAR = [[2, 22], [3, 12], [7, 5]], MAIN = [[2, 30], [3, 18], [5, 9], [11, 3]];
  const out = [];
  // いちばん奥の山なみ（かすんで青っぽい）
  out.push(path(ridgePath(w, 94, FAR, 7203, 240), defs.linU([[0, '#a8cfc0'], [1, '#c2dfd6']], 0, 50, 0, 150)));
  // 手前の大きな山
  const main = ridgePath(w, 122, MAIN, 7205, 240);
  out.push(path(main, defs.linU([[0, '#5eae5e'], [0.5, '#4f9d55'], [1, '#6aae70']], 0, 60, 0, 200)));
  // 木のもこもこ（山の中だけに描く）
  const clip = defs.clip(`<path d="${main}"/>`);
  const bumps = [];
  for (let i = 0; i < 900; i++) {
    const x = r() * w, top = ridgeY(w, 122, MAIN, 7205, x);
    const y = top + 3 + Math.pow(r(), 0.8) * (190 - top);
    const rr = 2.2 + r() * 2.6;
    const c = r() < 0.4 ? '#4a9651' : r() < 0.6 ? '#5aa85c' : '#66b565';
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, c)));
    if (r() < 0.35) bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.35, y - rr * 0.4, rr * 0.45, '#86c77c', { opacity: 0.8 })));
  }
  // 谷のかげ
  for (let i = 0; i < 9; i++) {
    const x = (i + 0.3 + r() * 0.4) * (w / 9), top = ridgeY(w, 122, MAIN, 7205, x) + 6;
    bumps.push(path(`M${x} ${top} Q${x + 6 + r() * 8} ${top + 30} ${x - 4 + r() * 8} ${top + 70}`, 'none', st('#3c8448', 5 + r() * 4, { opacity: 0.35 })));
  }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  // 尾根の明るいふち
  out.push(path(ridgePath(w, 122, MAIN, 7205, 240).replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#8fd083', 1.4, { opacity: 0.6 })));
  // 錨山の錨（白）と電波塔
  const ax = 330, ay = ridgeY(w, 122, MAIN, 7205, ax) + 26;
  out.push(anchor(ax, ay + 6, 1.5, '#f7fbff'));
  const px = 560, py = ridgeY(w, 122, MAIN, 7205, px);
  for (const [dx, hh] of [[0, 20], [11, 15]]) {
    const bx = px + dx, by = ridgeY(w, 122, MAIN, 7205, bx) + 2;
    out.push(path(`M${bx - 2.4} ${by} L${bx} ${by - hh} L${bx + 2.4} ${by} M${bx - 1.8} ${by - hh * 0.3} L${bx + 1.8} ${by - hh * 0.3} M${bx - 1.2} ${by - hh * 0.6} L${bx + 1.2} ${by - hh * 0.6}`, 'none', st('#e8eef3', 0.8)));
    out.push(rect(bx - 0.5, by - hh - 3, 1, 3, '#e05a4a'), rect(bx - 1.2, by - hh * 0.45, 2.4, 1.2, '#e05a4a'));
  }
  // ふもとのかすみ
  out.push(rect(0, 140, w, 100, defs.linU([[0, '#d6ecf5', 0], [1, '#d6ecf5', 0.7]], 0, 140, 0, 185)));
  return tr(0, -24, out.join(''));
});

// 街（うすい水色と白のビルがぎっしり・ところどころ緑）
bgLayer('yakumo', { f: 0.12, w: 1000, y: 96, h: 144 }, (defs, w) => {
  const r = rng(7301);
  const out = [];
  const cols = ['#dfe8f3', '#d0dcec', '#eef2f8', '#c9d7e8', '#e6ecf4', '#d8e3ef'];
  for (let x = -10; x < w;) {
    const bw = 10 + r() * 22, bh = 8 + Math.pow(r(), 1.8) * 34;
    const c = cols[Math.floor(r() * cols.length)], top = 178 - bh;
    out.push(wrap(w, x, bw, xx => {
      const p = [rect(xx, top, bw, bh + 10, c), rect(xx + bw * 0.72, top, bw * 0.28, bh + 10, shade(c, -0.07)), rect(xx - 0.5, top - 1.2, bw + 1, 1.6, shade(c, 0.35))];
      for (let yy = top + 3; yy < 176; yy += 4) for (let wx = xx + 2; wx < xx + bw - 2.5; wx += 3.6) p.push(rect(wx, yy, 1.8, 2, r() < 0.15 ? '#eef6ff' : '#a9bfd6', { opacity: 0.85 }));
      if (r() < 0.25) p.push(rect(xx + bw * 0.3, top - 5, 1, 5, '#aab6c4'));
      return p.join('');
    }));
    x += bw + r() * 2;
  }
  // 緑のかたまり
  for (let i = 0; i < 40; i++) { const x = r() * w, y = 174 + r() * 8; out.push(wrap(w, x - 10, 20, xx => clover(xx + 10, y, 4 + r() * 4, r() < 0.5 ? '#7cbf73' : '#8ccb7f', '#b3e0a2'))); }
  out.push(rect(0, 178, w, 70, '#b9d3be'));
  out.push(rect(0, 140, w, 50, defs.linU([[0, '#eaf5fb', 0], [1, '#eaf5fb', 0.45]], 0, 140, 0, 190)));
  return tr(0, -96, out.join(''));
});

// 阪急の高架と、その下の家並み・木
bgLayer('yakumo', { f: 0.26, w: 900, y: 80, h: 160 }, (defs, w) => {
  const r = rng(7401);
  const out = [];
  const walls = ['#f6eee2', '#efe4d2', '#f3efe8', '#e9eef2', '#f5e7d6'];
  const roofs = ['#5b6576', '#4f5a6b', '#6b4e3d', '#7a3d33', '#56667c'];
  // 高架（コンクリート）
  const deckY = 122;
  out.push(rect(0, deckY, w, 10, '#cdd0d4'), rect(0, deckY, w, 2, '#eceef0'), rect(0, deckY + 10, w, 3, '#a6abb2'), rect(0, deckY + 13, w, 2, '#000000', { opacity: 0.08 }));
  for (let x = 20; x < w; x += 75) {
    out.push(path(`M${x} ${deckY + 13} L${x + 12} ${deckY + 13} L${x + 10} 216 L${x + 2} 216 Z`, '#b3b8bf'), rect(x + 2, deckY + 13, 2.5, 216 - deckY - 13, '#cdd1d6'));
    out.push(rect(x - 4, deckY + 13, 20, 3, '#b1b6bd'));
  }
  // 架線の柱と電線
  for (let x = 58; x < w; x += 75) out.push(rect(x, deckY - 22, 1.6, 22, '#7d838c'), rect(x - 5, deckY - 21, 12, 1.2, '#7d838c'));
  out.push(path(`M0 ${deckY - 19} L${w} ${deckY - 19}`, 'none', st('#4a4f57', 0.5, { opacity: 0.8 })));
  // うしろの木
  const TC = { trunk: '#7a5a42', dark: '#3f8a3f', base: '#5dab4f', mid: '#54a048', light: '#9ad47c' };
  for (let i = 0; i < 34; i++) { const x = r() * w; out.push(wrap(w, x - 20, 40, xx => cloverTree(xx + 20, 206 + r() * 8, 0.9 + r() * 0.6, r, TC))); }
  // 家（瓦屋根）とマンション
  for (let x = 0; x < w;) {
    const kind = r(), wall = walls[Math.floor(r() * walls.length)], roof = roofs[Math.floor(r() * roofs.length)];
    let bw;
    if (kind < 0.28) {
      bw = 36 + r() * 16; const bh = 48 + r() * 30, top = 214 - bh;
      out.push(wrap(w, x, bw + 2, xx => {
        const p = [rect(xx, top, bw, bh, wall), rect(xx + bw - 5, top, 5, bh, shade(wall, -0.08)), rect(xx - 1, top - 2, bw + 2, 2.4, shade(wall, 0.2))];
        for (let yy = top + 6; yy < 206; yy += 10) {
          p.push(rect(xx + 1, yy + 6, bw - 6, 1.6, shade(wall, -0.2)));
          for (let wx = xx + 4; wx < xx + bw - 8; wx += 8) p.push(rect(wx, yy, 5.5, 5, '#9cc0d8'), rect(wx, yy, 5.5, 1, '#ffffff', { opacity: 0.6 }));
        }
        return p.join('');
      }));
    } else {
      bw = 28 + r() * 16; const bh = 30 + r() * 14, top = 214 - bh;
      out.push(wrap(w, x, bw + 8, xx => {
        const p = [rect(xx + 3, top, bw, bh, wall), rect(xx + bw - 1, top, 4, bh, shade(wall, -0.08))];
        // 瓦屋根（ゆるい台形・いぶし銀）
        p.push(path(`M${xx - 2} ${top + 1} L${xx + 6} ${top - 9} L${xx + bw} ${top - 9} L${xx + bw + 8} ${top + 1} Z`, roof));
        for (let k = 0; k < 3; k++) p.push(rect(xx + 1 + k * 1.5, top - 7 + k * 2.6, bw + 4 - k * 3, 0.8, shade(roof, 0.25), { opacity: 0.7 }));
        p.push(rect(xx - 2, top, bw + 10, 1.6, shade(roof, -0.25)));
        for (let wx = xx + 7; wx < xx + bw - 4; wx += 10) p.push(rect(wx, top + 5, 6, 6, '#a7c6db'), rect(wx + 2.7, top + 5, 0.6, 6, '#ffffff'));
        return p.join('');
      }));
    }
    x += bw + 10 + r() * 14;
  }
  out.push(rect(0, 214, w, 26, '#b9c7b2'));
  return tr(0, -80, out.join(''));
});

// 電柱と電線（手前・大きく）
bgLayer('yakumo', { f: 0.5, w: 760, y: 20, h: 220 }, (defs, w) => {
  const out = [];
  const xs = [120, 500];
  const wireYs = [52, 60, 72];
  for (const x of xs) {
    out.push(rect(x - 2.4, 36, 4.8, 190, '#7b7f86'), rect(x - 2.4, 36, 1.6, 190, '#9a9ea5'), rect(x + 1.4, 36, 1, 190, '#62666d'));
    // うでぎ・がいし
    out.push(rrect(x - 16, 50, 32, 3, 1, '#5c6068'), rrect(x - 12, 69, 24, 3, 1, '#5c6068'));
    for (const dx of [-14, -6, 6, 14]) out.push(rrect(x + dx - 1.2, 46.5, 2.4, 4, 1, '#e9ecef'));
    for (const dx of [-10, 10]) out.push(rrect(x + dx - 1.2, 65.5, 2.4, 4, 1, '#e9ecef'));
    // 変圧器
    out.push(rrect(x + 3.5, 80, 10, 14, 2.5, '#9aa4ad'), rect(x + 3.5, 83, 10, 1, '#7d8791'), rect(x + 3.5, 88, 10, 1, '#7d8791'));
    // 住所の看板
    out.push(rect(x - 3, 150, 6, 16, '#2f6db3'), rect(x - 2.2, 151, 4.4, 14, '#ffffff', { opacity: 0.2 }));
  }
  // 電線（たるむ）
  for (const [i, wy] of wireYs.entries()) {
    const a = xs[0] + (i === 2 ? -10 : -14), b = xs[1] + (i === 2 ? -10 : -14);
    const sag = 14 + i * 3;
    out.push(path(`M${b - w} ${wy} Q${(a + b - w) / 2} ${wy + sag} ${a} ${wy} Q${(a + b) / 2} ${wy + sag} ${b} ${wy} Q${(b + a + w) / 2} ${wy + sag} ${a + w} ${wy}`, 'none', st('#3a3e45', 0.6, { opacity: 0.85 })));
  }
  return tr(0, -20, out.join(''));
});

// 手前の植え込み（ぼかして、ピントの外れた感じ）
bgLayer('yakumo', { f: 1.35, w: 1300, y: 170, h: 70, fg: true }, (defs, w) => {
  const r = rng(7601);
  const blur = defs.blur(1.6);
  const out = [];
  for (const cx of [60, 520, 980]) {
    const parts = [];
    for (let k = 0; k < 14; k++) {
      const x = cx + (k - 7) * 10 + r() * 8, y = 242 - r() * 10 - Math.cos((k - 7) / 7 * 1.4) * 8, rr = 10 + r() * 8;
      parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2e6a36' : '#357a3c', '#4f9a4c')));
    }
    for (let k = 0; k < 8; k++) { const x = cx + (k - 4) * 14 + r() * 8; parts.push(wrap(w, x - 8, 16, xx => clover(xx, 226 + r() * 6, 6 + r() * 3, '#4a9446', '#7cc26a'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -170, out.join(''));
});

// 背景を走る阪急電車（高架の上）
sprite('decos2', 'bg/hankyu', 70, 22, 0, 21, () => tr(0, 21, [
  rrect(0, -200, 690, 190, 24, '#6e1826'),
  rrect(0, -200, 690, 40, 20, '#efe5d2'), rect(0, -168, 690, 12, '#efe5d2'),
  ...[0, 1, 2, 3, 4].map(i => [rrect(34 + i * 128, -140, 86, 58, 8, '#d9eef8'), path(`M${40 + i * 128} -134 L${70 + i * 128} -134 L${40 + i * 128} -96 Z`, '#ffffff', { opacity: 0.6 })].join('')),
  ...[1, 3].map(i => rrect(18 + i * 128 + 104, -146, 22, 120, 4, '#5a1320')),
  rect(0, -60, 690, 8, '#8c2433'),
  rect(0, -12, 690, 12, '#3a3a40'),
  path('M330 -200 L350 -236 L370 -200 M340 -236 L360 -236', 'none', st('#3a3a40', 5)),
  rect(684, -190, 6, 170, '#5a1320')
], 0.1));

// ========================================================================
// 地面：石垣（丸みのある石・ツタ）と歩道のふち
// ========================================================================
{
  const P = { colors: ['#b0b4b8', '#a3a8ad', '#bcbfc2', '#989da3', '#b4afa7', '#a8adb2'], jitter: 14, round: 24, speck: true, gap: 9 };
  const mortar = '#737880';
  // ツタ（クローバーのような葉）
  const ivy = (x, y, n, seed) => {
    const r = rng(seed);
    const out = [path(`M${x} ${y} Q${x - 6} ${y + n * 9} ${x + 4} ${y + n * 18}`, 'none', st('#3e7a34', 2.4))];
    for (let i = 0; i < n * 3; i++) {
      const lx = x - 12 + r() * 24, ly = y + r() * n * 18;
      out.push(clover(lx, ly + 1.5, 6.5 + r() * 2.5, '#3d8a35'), clover(lx, ly, 6 + r() * 2.5, r() < 0.5 ? '#5aaa45' : '#68b84e', '#9ad67a'));
    }
    return out.join('');
  };
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 80, edge: '#a9adb1', joints: joints(44, 120, 7700 + v, 50, 80) }, { y0: 80, y1: 160, edge: '#a4a8ac', joints: joints(12, 150, 7710 + v, 52, 84) }], P, 7730 + v),
    v === 1 ? ivy(92, 8, 5, 7740) : v === 3 ? ivy(40, 30, 4, 7741) : ''
  ].join('');
  const cap = { h: 40, base: '#e3e0d9', dark: '#aaa59b', light: '#f7f5f0' };
  for (let v = 0; v < 4; v++) tile(`t/yakumo/g/body${v}`, () => body(v));
  // 上の段：歩道のふち石（明るい灰色）＋ツタがたれる
  const top = (v) => [
    body(v + 5),
    rect(0, 40, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 42, cap.dark), rect(0, 0, U, 35, cap.base), rect(0, 0, U, 5, cap.light),
    rect(0, 28, U, 7, '#cfcbc2'),
    rect(78, 5, 2.5, 23, '#c9c4ba'),
    circ(34, 16, 1.8, '#c7c2b8'), circ(122, 12, 1.5, '#c7c2b8'),
    v === 1 ? ivy(104, 38, 4, 7750) : v === 2 ? ivy(30, 38, 3, 7751) : ''
  ].join('');
  for (let v = 0; v < 3; v++) tile(`t/yakumo/g/top${v}`, () => top(v));
  tile('t/yakumo/g/edgeL', defs => rect(0, 0, 26, U, defs.lin([[0, '#000000', 0.32], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/yakumo/g/edgeR', defs => rect(134, 0, 26, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.32]], 0, 0, 1, 0)));
  tile('t/yakumo/g/topL', () => [rect(0, 0, 10, 42, cap.dark), rect(0, 0, 6, 35, '#d2cec5')].join(''));
  tile('t/yakumo/g/topR', () => [rect(150, 0, 10, 42, cap.dark), rect(154, 0, 6, 35, '#d2cec5')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/yakumo/g/${k}`, defs => slopeTile(defs, k, body(k.length % 4), cap));
  // アーケードの屋根（ガラスのかまぼこ屋根を横から見たところ。上に乗れる）
  tile('t/yakumo/m/arcade/semi', defs => [
    rect(0, 14, U, 106, defs.lin([[0, '#f2fbfe'], [0.5, '#cfeaf4'], [1, '#a9d4e6']]), { opacity: 0.9 }),
    rect(0, 30, U, 4, '#ffffff', { opacity: 0.7 }),
    path('M14 36 L46 36 L22 108 L6 108 Z', '#ffffff', { opacity: 0.45 }), path('M96 36 L108 36 L88 108 L76 108 Z', '#ffffff', { opacity: 0.3 }),
    rect(0, 14, 5, 106, '#ffffff'), rect(155, 14, 5, 106, '#ffffff'), rect(76, 14, 8, 106, '#ffffff'), rect(82, 14, 2, 106, '#cfc3aa'),
    rect(0, 72, U, 4, '#ffffff', { opacity: 0.9 }),
    rect(0, 0, U, 16, '#e6dcc6'), rect(0, 0, U, 5, '#fffaf0'), rect(0, 12, U, 4, '#b9ab8e', { opacity: 0.8 }),
    rect(0, 118, U, 30, '#e9dfca'), rect(0, 118, U, 5, '#fffaf0'), rect(0, 140, U, 8, '#cbbd9f'),
    ...[20, 60, 100, 140].map(x => circ(x, 132, 3.5, '#c9bb9d')),
    rect(0, 148, U, 12, '#a99a7d'), rect(0, 156, U, 4, '#000000', { opacity: 0.2 })
  ].join(''));
  // 石の段（階段のブロック）
  tile('t/yakumo/hard', () => [
    rrect(0, 0, U, U, 10, '#8a8f96'), rrect(4, 4, 152, 150, 8, '#c4c7cb'),
    path('M10 10 L150 10 L140 22 L22 22 L22 140 L10 150 Z', '#dcdee1'),
    path('M150 10 L150 150 L10 150 L22 140 L140 140 L140 22 Z', '#a8acb2'),
    circ(60, 70, 3, '#b2b6ba'), circ(110, 100, 2.5, '#b2b6ba')
  ].join(''));
  // 自販機（土管のかわり）：左は赤、右は青
  const vend = (left, top) => {
    const c = left ? ['#e2453a', '#b52d25', '#ff7a6c'] : ['#2f74c8', '#1f5596', '#6aa5ea'];
    const out = [rect(0, 0, U, U, c[0]), rect(left ? 0 : 150, 0, 10, U, c[1]), rect(left ? 150 : 0, 0, 10, U, '#000000', { opacity: 0.12 })];
    if (top) {
      out.push(rect(0, 0, U, 14, c[1]), rect(0, 0, U, 5, c[2]));
      out.push(rrect(16, 24, 128, 104, 8, '#eef6fb'), rect(16, 24, 128, 104, '#ffffff', { opacity: 0 }));
      const cans = ['#f4d03f', '#e74c3c', '#27ae60', '#3498db', '#ff9ff3', '#ffffff', '#e67e22', '#8e44ad'];
      for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) {
        const cx = 30 + i * 25, cy = 40 + row * 32;
        out.push(rrect(cx - 8, cy - 11, 16, 22, 5, cans[(row * 5 + i + (left ? 0 : 3)) % cans.length]), rect(cx - 8, cy - 5, 16, 5, '#ffffff', { opacity: 0.55 }));
        out.push(rect(cx - 9, cy + 13, 18, 3, '#e05a4a'));
      }
      out.push(path('M22 30 L60 30 L22 90 Z', '#ffffff', { opacity: 0.35 }));
      out.push(rect(0, 140, U, 20, c[1]));
    } else {
      out.push(rrect(16, 10, 128, 52, 6, '#2b2f36'), rect(24, 20, 112, 8, '#39ff88', { opacity: 0.6 }));
      out.push(rrect(100, 36, 18, 20, 3, '#c9cfd6'), rect(107, 40, 4, 12, '#2b2f36'));
      out.push(rrect(22, 92, 116, 40, 6, '#1d2127'), rect(30, 100, 100, 6, '#ffffff', { opacity: 0.2 }));
      out.push(rect(0, 146, U, 14, '#3a3f47'));
    }
    return out.join('');
  };
  tile('t/yakumo/pipe/pipeTL', () => vend(true, true));
  tile('t/yakumo/pipe/pipeTR', () => vend(false, true));
  tile('t/yakumo/pipe/pipeL', () => vend(true, false));
  tile('t/yakumo/pipe/pipeR', () => vend(false, false));
}
