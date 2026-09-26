// ステージ10「六甲山・摩耶山」（夜）を描き直したもの
// 六甲山牧場（月あかりの牧草地・ひつじ・木のさく・牛舎）→ 摩耶ケーブル → 虹の駅 → 摩耶ロープウェー → 星の駅 → 掬星台（1000万ドルの夜景・星空・星のモニュメント）
// 夜景（街の明かり）は dim:true の層に分けてあり、ボスをたおすまでは暗い
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, portTowerFar } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile } from '../tiles.mjs';
import { TAU, st, G, cloverBlob, clover } from '../kit.mjs';
import { pylon } from './04_ropeway.mjs';

resetTheme('rokko');
resetTheme('kikusei');
const SH = 's10';
const OUT = '#1a1430';

// 小さな点をまとめて1つのパスにする（星・街の明かり。数が多いので軽くする）
const r1 = n => (Math.round(n * 10) / 10).toString();
const dots = (pts, fill, o = {}) => pts.length ? path(pts.map(([x, y, s]) => `M${r1(x)} ${r1(y)}h${r1(s)}v${r1(s)}h-${r1(s)}z`).join(''), fill, o) : '';
const star5 = (x, y, r1, r2, rot = 0) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const a = -Math.PI / 2 + rot + i * Math.PI / 5, rr = i % 2 ? r2 : r1; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; });
const sparkle = (x, y, s, c, o = 1) => path(`M${x} ${y - 3 * s} Q${x + 0.4 * s} ${y - 0.4 * s} ${x + 3 * s} ${y} Q${x + 0.4 * s} ${y + 0.4 * s} ${x} ${y + 3 * s} Q${x - 0.4 * s} ${y + 0.4 * s} ${x - 3 * s} ${y} Q${x - 0.4 * s} ${y - 0.4 * s} ${x} ${y - 3 * s} Z`, c, { opacity: o });

// 星空（w の幅でくり返す）
function starField(defs, w, h, seed, n, o = {}) {
  const r = rng(seed), out = [];
  const buckets = { a: [], b: [], c: [] };
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = Math.pow(r(), o.pow || 1.25) * h, s = 0.35 + Math.pow(r(), 3) * 1.1;
    (r() < 0.45 ? buckets.a : r() < 0.6 ? buckets.b : buckets.c).push([x, y, s]);
  }
  out.push(dots(buckets.a, '#ffffff', { opacity: 0.9 }), dots(buckets.b, '#cfe0ff', { opacity: 0.7 }), dots(buckets.c, '#fff1c8', { opacity: 0.6 }));
  for (let i = 0; i < (o.big || 22); i++) {
    const x = r() * w, y = Math.pow(r(), 1.3) * h * 0.85, s = 0.7 + r() * 0.8;
    out.push(wrap(w, x - 4 * s, 8 * s, xx => [circ(xx, y, 2.6 * s, '#cfe0ff', { opacity: 0.18 }), sparkle(xx, y, s, '#ffffff', 0.95)].join('')));
  }
  return out.join('');
}

// ========================================================================
// 六甲山（夜）の背景
// ========================================================================
// 星空
bgLayer('rokko', { f: 0.01, w: 1300, y: 0, h: 170 }, (defs, w) => starField(defs, w, 165, 10101, 520, { big: 26 }));

// 月と遠くの海・陸（明かりのない形。いつも見える）
const RHZ = 120;
const rShore = (x, w) => 142 + 3 * Math.sin(x / w * TAU * 3 + 0.5) + 1.5 * Math.sin(x / w * TAU * 8);
bgLayer('rokko', { f: 0.03, w: 1600, y: 0, h: 240 }, (defs, w) => {
  const r = rng(10201), out = [];
  // 月（大きく・やさしい光）
  const MX = 420, MY = 40;
  out.push(circ(MX, MY, 60, defs.radU([[0, '#dfe8ff', 0.3], [0.4, '#b9c8ff', 0.12], [1, '#8a9ae0', 0]], MX, MY, 60)));
  out.push(circ(MX, MY, 12.5, '#fff8de'), circ(MX + 3.6, MY - 2.4, 3, '#f1e6c2', { opacity: 0.7 }), circ(MX - 4, MY + 3.4, 2.2, '#f1e6c2', { opacity: 0.6 }), circ(MX - 2, MY - 5, 1.4, '#f1e6c2', { opacity: 0.6 }));
  // 月あかりの細い雲
  for (const [x, y, l] of [[330, 58, 80], [500, 30, 60], [980, 70, 110], [1320, 44, 70]]) out.push(rrect(x, y, l, 3.2, 1.6, '#51609e', { opacity: 0.55 }), rrect(x + 6, y - 0.6, l * 0.7, 1, 0.5, '#aab8ee', { opacity: 0.4 }));
  // 水平線の空のあかるみ
  out.push(rect(0, RHZ - 40, w, 44, defs.linU([[0, '#3e50a0', 0], [1, '#4a5cae', 0.55]], 0, RHZ - 40, 0, RHZ + 4)));
  // 海のむこうの山
  out.push(path(ridgePath(w, RHZ, [[3, 6], [5, 3], [13, 1.5]], 10203, RHZ + 4, 8), '#233068'));
  // 海（月の道）
  out.push(rect(0, RHZ + 2, w, 240 - RHZ, defs.linU([[0, '#26377a'], [1, '#121c4c']], 0, RHZ, 0, 150)), rect(0, RHZ + 2, w, 0.7, '#8898d8', { opacity: 0.6 }));
  for (let i = 0; i < 16; i++) { const y = RHZ + 4 + i * 1.3, l = 4 + i * 0.9 + r() * 4; out.push(rrect(MX - l / 2 + (r() - 0.5) * 6, y, l, 0.6, 0.3, '#dfe6ff', { opacity: 0.55 - i * 0.025 })); }
  // 陸
  let d = `M0 240 L0 ${f(rShore(0, w))}`;
  for (let x = 0; x <= w; x += 8) d += ` L${x} ${f(rShore(x, w))}`;
  out.push(path(d + ` L${w} 240 Z`, defs.linU([[0, '#18204f'], [1, '#121840']], 0, 140, 0, 220)));
  // 海ぞいの港（うすい形）
  for (let x = 30; x < w; x += 120 + r() * 120) { const pw = 10 + r() * 20; out.push(wrap(w, x, pw, xx => rect(xx, rShore(x, w) - 2.2, pw, 2.4, '#222c5e'))); }
  // いつもついている少しの明かり
  const few = [];
  for (let i = 0; i < 160; i++) { const x = r() * w, y = rShore(x, w) + 2 + Math.pow(r(), 0.8) * 90; few.push([x, y, 0.8 + r() * 0.6]); }
  out.push(dots(few, '#ffd98a', { opacity: 0.8 }));
  return out.join('');
});
// 街の明かり（1000万ドルの夜景。ボスをたおすまで暗い）
function cityLights(defs, w, shoreFn, yEnd, seed, dens, o = {}) {
  const r = rng(seed), out = [];
  const warm = [], white = [], orange = [], cool = [], road = [];
  const y0 = shoreFn(0), H = yEnd - y0;
  // 光のもや（街全体がほんのり明るい）
  out.push(rect(0, y0 - 6, w, H + 12, defs.linU([[0, '#ffb070', 0.1], [0.3, '#ffc080', 0.2], [1, '#ffa060', 0.24]], 0, y0 - 6, 0, yEnd)));
  // 町ごとのかたまり
  const cl = [];
  for (let i = 0; i < (o.clusters || 40); i++) cl.push([r() * w, y0 + 3 + Math.pow(r(), 0.8) * (H - 3), 20 + r() * 50, 3 + r() * 8]);
  for (const [cx, cy, rx, ry] of cl) out.push(wrap(w, cx - rx, rx * 2, xx => ell(xx, cy, rx, ry, '#ffc27a', { opacity: 0.1 })));
  const gauss = () => (r() + r() + r() - 1.5) / 1.5;
  for (let i = 0; i < dens; i++) {
    let x, y;
    if (r() < 0.65) { const [cx, cy, rx, ry] = cl[Math.floor(r() * cl.length)]; x = ((cx + gauss() * rx) % w + w) % w; y = cy + gauss() * ry * 1.6; }
    else { x = r() * w; y = y0 + r() * H; }
    const sh = shoreFn(x); if (y < sh + 1.5 || y > yEnd) continue;
    const t = (y - y0) / H, s = (0.55 + t * (o.grow ?? 0.9)) * (0.75 + r() * 0.5);
    const k = r();
    (k < 0.5 ? warm : k < 0.72 ? white : k < 0.93 ? orange : cool).push([x, y, s]);
  }
  // 大きな道路（とぎれとぎれの光の線）
  for (let k = 0; k < (o.roads || 4); k++) {
    const yy = y0 + 8 + (k + r() * 0.6) * (H - 10) / (o.roads || 4), amp = 2 + r() * 4, ph = r() * TAU, cyc = 1 + Math.floor(r() * 3);
    for (let x = r() * 30; x < w; x += 2.6 + r() * 2.2) { if (Math.sin(x * 0.013 + k) > 0.55) continue; road.push([x, yy + amp * Math.sin(x / w * TAU * cyc + ph) + (r() - 0.5) * 0.8, 0.7 + (yy - y0) / H * 0.6]); }
  }
  out.push(dots(road, '#ffbf66', { opacity: 0.75 }), dots(warm, '#ffd98a'), dots(white, '#fff4dc'), dots(orange, '#ffa45a', { opacity: 0.95 }), dots(cool, '#a8e4ff', { opacity: 0.85 }));
  // 港の明かりの水面のゆらぎ
  for (let i = 0; i < 60; i++) { const x = r() * w, y = shoreFn(x) - 2 - r() * 10; out.push(rrect(x, y, 2 + r() * 6, 0.5, 0.25, r() < 0.6 ? '#ffd98a' : '#ff9a7a', { opacity: 0.35 + r() * 0.3 })); }
  return out.join('');
}
bgLayer('rokko', { f: 0.03, w: 1600, y: 0, h: 240, dim: true }, (defs, w) => {
  const out = [cityLights(defs, w, x => rShore(x, w), 206, 10301, 3400, { roads: 4, clusters: 46 })];
  // ポートタワー（赤く光る）・明石海峡大橋の光
  out.push(portTowerFar(760, rShore(760, w) + 0.5, 0.3, true));
  const r = rng(10302);
  for (let i = 0; i <= 24; i++) { const u = i / 24, x = 1180 + u * 120, y = RHZ + 3 - Math.sin(u * Math.PI) * 4; out.push(circ(x, y, 0.55, i % 4 ? '#bfe6ff' : '#ffffff')); }
  for (let i = 0; i < 40; i++) out.push(circ(r() * w, RHZ + 0.8 + r() * 1.4, 0.4 + r() * 0.3, '#ffe2a8', { opacity: 0.7 }));
  return out.join('');
});

// 摩耶山・六甲の尾根（月のあかりのふち・電波塔の赤い光）
bgLayer('rokko', { f: 0.07, w: 1400, y: 110, h: 130 }, (defs, w) => {
  const r = rng(10401), out = [];
  const A = [[2, 20], [3, 10], [7, 4]];
  const ridge = ridgePath(w, 190, A, 10403, 240);
  out.push(path(ridge, defs.linU([[0, '#222d66'], [1, '#161e4a']], 0, 150, 0, 230)));
  out.push(path(ridge.replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#7e90d8', 1.3, { opacity: 0.75 })));
  // 木のもこもこ（ほんのり）
  const cb = defs.clip(`<path d="${ridge}"/>`), bumps = [];
  for (let i = 0; i < 260; i++) { const x = r() * w, y = ridgeY(w, 190, A, 10403, x) + 3 + Math.pow(r(), 0.8) * 50, rr = 2 + r() * 2.6; bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, r() < 0.5 ? '#202c62' : '#1a2456'))); }
  // 家の明かり
  for (let i = 0; i < 40; i++) { const x = r() * w, y = ridgeY(w, 190, A, 10403, x) + 8 + r() * 36; bumps.push(rect(x, y, 1.1, 1, '#ffd98a', { opacity: 0.8 })); }
  out.push(g(bumps.join(''), { 'clip-path': cb }));
  // 電波塔と赤い光
  for (const px of [300, 980]) {
    const by = ridgeY(w, 190, A, 10403, px) + 1;
    out.push(path(`M${px - 2.6} ${by} L${px} ${by - 22} L${px + 2.6} ${by} M${px - 1.8} ${by - 7} L${px + 1.8} ${by - 7} M${px - 1.1} ${by - 14} L${px + 1.1} ${by - 14}`, 'none', st('#4a5890', 0.8)));
    out.push(circ(px, by - 23, 1.1, '#ff5a4a'), circ(px, by - 23, 3, '#ff5a4a', { opacity: 0.25 }), circ(px, by - 12, 0.8, '#ff5a4a'));
  }
  return tr(0, -110, out.join(''));
});

// 牧場の丘（月あかりの牧草・遠くの牛舎・木・ひつじ）
bgLayer('rokko', { f: 0.17, w: 1200, y: 140, h: 100 }, (defs, w) => {
  const r = rng(10501), out = [];
  const A = [[2, 9], [3, 6], [5, 3]];
  const hill = ridgePath(w, 206, A, 10503, 240);
  out.push(path(hill, defs.linU([[0, '#284f4a'], [1, '#1c3a3c']], 0, 180, 0, 240)));
  out.push(path(hill.replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#5f8a88', 1, { opacity: 0.5 })));
  // さく（ひくい・うすい）
  for (let x = 20; x < w; x += 170 + r() * 120) {
    const len = 60 + r() * 60;
    for (let k = 0; k <= len; k += 10) { const y = ridgeY(w, 206, A, 10503, (x + k) % w) + 6; out.push(wrap(w, x + k, 2, xx => rect(xx, y - 5, 1, 5, '#5e7f7a'))); }
    const pts = []; for (let k = 0; k <= len; k += 10) pts.push([x + k, ridgeY(w, 206, A, 10503, (x + k) % w) + 3]);
    out.push(wrap(w, x, len, xx => path('M' + pts.map(([px, py]) => `${f(px - x + xx)} ${f(py)}`).join(' L'), 'none', st('#5e7f7a', 0.7))));
  }
  // 牛舎（まどに明かり）
  for (const bx of [240, 820]) {
    const by = ridgeY(w, 206, A, 10503, bx) + 8;
    out.push(wrap(w, bx - 16, 32, xx => [rect(xx - 13, by - 12, 26, 12, '#4a2a38'), path(`M${xx - 15} ${by - 11} L${xx - 10} ${by - 19} L${xx + 10} ${by - 19} L${xx + 15} ${by - 11} Z`, '#2f2436'), rect(xx - 9, by - 8, 3, 3, '#ffcf7a'), rect(xx + 6, by - 8, 3, 3, '#ffcf7a'), rect(xx - 2.5, by - 9, 5, 9, '#3a2030'), circ(xx, by - 8, 7, '#ffcf7a', { opacity: 0.12 })].join('')));
  }
  // 木（まるい影）
  for (let i = 0; i < 18; i++) {
    const x = r() * w, y = ridgeY(w, 206, A, 10503, x) + 4, s = 0.7 + r() * 0.6;
    out.push(wrap(w, x - 12 * s, 24 * s, xx => [rect(xx - 1 * s, y - 8 * s, 2 * s, 8 * s, '#1a2a30'), clover(xx, y - 12 * s, 9 * s, '#17333a'), clover(xx - 2 * s, y - 13.5 * s, 7 * s, '#1f4447', '#3f6f6a')].join('')));
  }
  // 遠くのひつじ
  for (let i = 0; i < 14; i++) { const x = r() * w, y = ridgeY(w, 206, A, 10503, x) + 8 + r() * 10; out.push(ell(x, y, 2, 1.3, '#c8d2e8', { opacity: 0.8 }), circ(x + 1.8, y - 0.4, 0.7, '#3a3a4a')); }
  // 手前の草のかげと谷のもや（下は遠くに見せる）
  out.push(path(ridgePath(w, 226, [[3, 5], [7, 3]], 10505, 240), '#16303a'));
  out.push(rect(0, 190, w, 50, defs.linU([[0, '#3a4a8a', 0], [1, '#3a4a8a', 0.35]], 0, 190, 0, 240)));
  return tr(0, -140, out.join(''));
});

// いちばん手前（ぼかした夜の草むら。地面より下だけ）
bgLayer('rokko', { f: 1.35, w: 1300, y: 206, h: 34, fg: true }, (defs, w) => {
  const r = rng(10601), blur = defs.blur(1.5), out = [];
  for (const cx of [150, 640, 1060]) {
    const parts = [];
    for (let k = 0; k < 12; k++) { const x = cx + (k - 6) * 11 + r() * 8, y = 248 - r() * 8 - Math.cos((k - 6) / 6 * 1.4) * 7, rr = 10 + r() * 7; parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#0f2229' : '#132b30', '#244a48'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -206, out.join(''));
});

// ========================================================================
// 掬星台（夜）の背景：大きな星空と天の川・1000万ドルの夜景
// ========================================================================
bgLayer('kikusei', { f: 0.008, w: 1400, y: 0, h: 150 }, (defs, w) => {
  const out = [];
  // 天の川（ななめの淡い帯）
  const band = (x, y, rx, ry, rot, c, o) => ell(x, y, rx, ry, c, { opacity: o, rot });
  out.push(g([band(700, 60, 560, 40, -14, '#5a66c0', 0.2), band(700, 60, 440, 22, -14, '#9aa4e8', 0.18), band(660, 66, 300, 11, -14, '#e0e4ff', 0.16), band(520, 100, 120, 8, -14, '#ffe8f0', 0.1), band(1380, 20, 200, 26, -14, '#6a74c8', 0.12), band(40, 150, 240, 26, -14, '#6a74c8', 0.12)]));
  const r = rng(11102), mw = [];
  for (let i = 0; i < 900; i++) { const t = r(), x = 180 + t * 1040, y = 60 - (x - 700) * Math.tan(14 * Math.PI / 180) + (r() + r() + r() - 1.5) * 24; if (y > 0 && y < 150) mw.push([x, y, 0.3 + r() * 0.35]); }
  out.push(dots(mw, '#e8ecff', { opacity: 0.75 }));
  out.push(starField(defs, w, 145, 11101, 620, { big: 34, pow: 1.1 }));
  // 流れ星（止まった絵のひとつ）
  out.push(path('M1020 26 L1060 14', 'none', st('#ffffff', 0.8, { opacity: 0.7 })), circ(1060, 14, 1.2, '#ffffff'));
  return out.join('');
});
const KHZ = 60;
const kShore = (x, w) => 80 + 2.4 * Math.sin(x / w * TAU * 3 + 2) + 1.2 * Math.sin(x / w * TAU * 9);
bgLayer('kikusei', { f: 0.025, w: 1600, y: 30, h: 210 }, (defs, w) => {
  const r = rng(11201), out = [];
  // 空のすそ（街の光でほんのり明るい）
  out.push(rect(0, 30, w, KHZ - 30 + 2, defs.linU([[0, '#2d3d86', 0], [1, '#3a4a92', 0.7]], 0, 30, 0, KHZ)));
  // 大阪湾のむこうの山
  out.push(path(ridgePath(w, KHZ, [[3, 7], [5, 3], [11, 2]], 11203, KHZ + 4, 8), '#1c275c'));
  // 湾
  out.push(rect(0, KHZ + 2, w, 240 - KHZ, defs.linU([[0, '#1a2862'], [1, '#0f1946']], 0, KHZ, 0, 96)));
  // 人工島（ポートアイランド・神戸空港）
  for (const [x0, x1, y] of [[520, 680, 72], [700, 820, 67], [980, 1080, 74]]) out.push(path(`M${x0} ${y + 2} L${x0 + 5} ${y} L${x1 - 4} ${y} L${x1} ${y + 2} Z`, '#161f4e'));
  // 陸
  let d = `M0 240 L0 ${f(kShore(0, w))}`;
  for (let x = 0; x <= w; x += 8) d += ` L${x} ${f(kShore(x, w))}`;
  out.push(path(d + ` L${w} 240 Z`, defs.linU([[0, '#1a2252'], [1, '#141a44']], 0, 80, 0, 200)));
  // いつもついている少しの明かり
  const few = [];
  for (let i = 0; i < 200; i++) { const x = r() * w, y = kShore(x, w) + 2 + Math.pow(r(), 0.8) * 150; few.push([x, y, 0.8 + r() * 0.8]); }
  out.push(dots(few, '#ffd98a', { opacity: 0.85 }));
  return tr(0, -30, out.join(''));
});
bgLayer('kikusei', { f: 0.025, w: 1600, y: 30, h: 210, dim: true }, (defs, w) => {
  const r = rng(11301), out = [];
  // 湾のむこう（大阪・和歌山）の明かり
  const far = [];
  for (let i = 0; i < 260; i++) far.push([r() * w, KHZ - 1 + r() * 3, 0.5 + r() * 0.4]);
  out.push(dots(far, '#ffe2a8', { opacity: 0.8 }));
  // 島の明かり（空港の滑走路の光の列）
  for (const [x0, x1, y] of [[520, 680, 72], [700, 820, 67], [980, 1080, 74]]) { const pts = []; for (let x = x0 + 4; x < x1 - 4; x += 2.4) pts.push([x, y - 0.4 + (r() < 0.3 ? -1.6 * r() : 0), 0.7]); out.push(dots(pts, r() < 0.5 ? '#fff4dc' : '#ffd98a')); }
  out.push(cityLights(defs, w, x => kShore(x, w), 134, 11303, 4600, { roads: 3, clusters: 60, grow: 0.8 }));
  // ポートタワー・観覧車（光る）
  out.push(portTowerFar(620, kShore(620, w) + 0.5, 0.42, true));
  const wx = 580, wy = kShore(580, w) - 7;
  out.push(circ(wx, wy, 6.5, 'none', { stroke: '#9fd8ff', strokeWidth: 0.7 }), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => circ(wx + Math.cos(k / 8 * TAU) * 6.5, wy + Math.sin(k / 8 * TAU) * 6.5, 0.6, k % 2 ? '#ff9ab8' : '#ffe9a8')));
  // 明石海峡大橋（光の首かざり）
  const bx = 1250, by = KHZ + 3;
  for (let i = 0; i <= 40; i++) { const u = i / 40, x = bx + u * 200, y = by - (u < 0.2 ? u / 0.2 * 9 : u > 0.8 ? (1 - u) / 0.2 * 9 : 9 - Math.sin((u - 0.2) / 0.6 * Math.PI) * 7); out.push(circ(x, y, 0.55, i % 5 ? '#bfe6ff' : '#ffffff')); }
  out.push(rect(bx + 38, by - 12, 1.2, 12, '#9fb6e8'), rect(bx + 160, by - 12, 1.2, 12, '#9fb6e8'), circ(bx + 38.6, by - 12.5, 0.8, '#ff5a4a'), circ(bx + 160.6, by - 12.5, 0.8, '#ff5a4a'));
  // 水面にうつる光
  for (let i = 0; i < 50; i++) { const x = r() * w, y = KHZ + 4 + r() * 16; out.push(rrect(x, y, 3 + r() * 8, 0.5, 0.25, r() < 0.6 ? '#ffd98a' : '#9fd8ff', { opacity: 0.3 + r() * 0.3 })); }
  return tr(0, -30, out.join(''));
});
// 掬星台のまわりの木（まるい木のかたまり。月あかりのふち）
bgLayer('kikusei', { f: 0.2, w: 1100, y: 70, h: 170 }, (defs, w) => {
  const r = rng(11401), out = [];
  for (const [cx, n] of [[90, 5], [760, 3]]) {
    const blobs = [];
    for (let k = 0; k < n; k++) { const x = cx + (k - n / 2) * 16 + r() * 8, top = 104 + r() * 14 - Math.sin(k / (n - 1) * Math.PI) * 12; for (let j = 0; j < 3; j++) blobs.push([x + (r() - 0.5) * 10, top + j * 9 + r() * 4, 8 + r() * 4]); }
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [x, y, rr] of blobs) out.push(wrap(w, x - rr, rr * 2, xx => clover(xx, y + 1.5, rr, '#0a1230')));
    for (const [x, y, rr] of blobs) out.push(wrap(w, x - rr, rr * 2, xx => clover(xx, y, rr * 0.92, '#111c42', r() < 0.5 ? '#2e3e7a' : null)));
    out.push(rect(cx - n * 9 - 10, 128, n * 18 + 20, 20, '#0a1230'));
  }
  return tr(0, -70, out.join(''));
});

// ========================================================================
// 地面
// ========================================================================
// 六甲山：月あかりの牧草（明るいふち）＋ あたたかい土と石
const RCAP = { h: 40, base: '#4f9656', dark: '#2c5f39', light: '#b9eca4' };
{
  const S = { base: '#5b4636', dark: '#43332a', light: '#6f5846', peb1: '#7a6554', peb2: '#5f4c3e' };
  const soil = (seed, o = {}) => {
    const r = rng(seed), out = [rect(0, 0, U, U, S.base)];
    for (let k = 0; k < 2; k++) { const y = 50 + k * 60 + r() * 10; out.push(path(`M0 ${y} Q40 ${y - 6} 80 ${y} T160 ${y} L160 ${y + 10} Q120 ${y + 4} 80 ${y + 10} T0 ${y + 10} Z`, S.dark, { opacity: 0.45 })); }
    for (let i = 0; i < (o.stones ?? 4); i++) {
      const rx = 8 + r() * 10, ry = rx * (0.55 + r() * 0.2), x = 16 + rx + r() * (U - 32 - rx * 2), y = 16 + ry + r() * (U - 32 - ry * 2), c = r() < 0.5 ? S.peb1 : S.peb2;
      out.push(ell(x, y + 3, rx, ry, shade(c, -0.3)), ell(x, y, rx, ry, c), ell(x - rx * 0.3, y - ry * 0.4, rx * 0.45, ry * 0.3, '#9ea6c8', { opacity: 0.55 }));
    }
    for (let i = 0; i < 6; i++) out.push(circ(10 + r() * 140, 10 + r() * 140, 2 + r() * 2, r() < 0.5 ? S.dark : S.light, { opacity: 0.7 }));
    return out.join('');
  };
  const grass = v => {
    const r = rng(10760 + v), out = [rect(0, 38, U, 14, '#000000', { opacity: 0.28 })];
    for (let x = 0; x <= 160; x += 20) out.push(circ(x, 40 + (x % 40 ? 2 : 0), 11, RCAP.dark));
    out.push(rect(0, 0, U, 40, RCAP.dark));
    for (let x = 0; x <= 160; x += 20) out.push(circ(x, 34 + (x % 40 ? 2 : 0), 10, RCAP.base));
    out.push(rect(0, 0, U, 34, RCAP.base), rect(0, 0, U, 10, '#78c07a'), rect(0, 0, U, 4, RCAP.light), rect(0, 0, U, 1.6, '#f0ffe6'));
    for (let i = 0; i < 5; i++) { const x = 8 + i * 32 + r() * 10; out.push(path(`M${x} 14 q3 -6 6 0 q3 -7 6 0`, 'none', st('#a8e0a0', 2.4, { opacity: 0.9 }))); }
    if (v === 1) [[36, 22], [104, 26]].forEach(([x, y]) => out.push(...[0, 1, 2, 3, 4].map(k => circ(x + Math.cos(k / 5 * TAU) * 3.2, y + Math.sin(k / 5 * TAU) * 3.2, 2.6, '#ffffff')), circ(x, y, 1.8, '#ffe45a')));
    if (v === 2) out.push(circ(70, 22, 2.4, '#fff3a0'), circ(70, 22, 6, '#fff3a0', { opacity: 0.25 }));
    return out.join('');
  };
  for (let v = 0; v < 3; v++) tile(`t/rokko/g/body${v}`, () => soil(10700 + v));
  for (let v = 0; v < 3; v++) tile(`t/rokko/g/top${v}`, () => soil(10710 + v, { stones: 2 }) + grass(v));
  tile('t/rokko/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.35], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/rokko/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.35]], 0, 0, 1, 0)));
  tile('t/rokko/g/topL', () => [rect(0, 0, 10, 46, RCAP.dark), rect(0, 0, 5, 36, '#3f8048'), rect(0, 0, 10, 3, '#f0ffe6')].join(''));
  tile('t/rokko/g/topR', () => [rect(150, 0, 10, 46, RCAP.dark), rect(155, 0, 5, 36, '#3f8048'), rect(150, 0, 10, 3, '#f0ffe6')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/rokko/g/${k}`, defs => slopeTile(defs, k, soil(10720 + k.length), RCAP));
  // 鉄塔（夜）
  const S2 = { base: '#6c7a98', dark: '#353e5c', light: '#b4c2e2' };
  tile('t/rokko/m/steel/hard', () => [
    path('M22 6 L138 78 M138 6 L22 78 M22 84 L138 156 M138 84 L22 156', 'none', st(S2.dark, 11)),
    path('M22 6 L138 78 M138 6 L22 78 M22 84 L138 156 M138 84 L22 156', 'none', st(S2.base, 6)),
    rect(0, 74, U, 12, S2.dark), rect(0, 76, U, 5, S2.base),
    rect(0, 0, 26, U, S2.dark), rect(134, 0, 26, U, S2.dark), rect(3, 0, 16, U, S2.base), rect(137, 0, 16, U, S2.base), rect(5, 0, 5, U, S2.light), rect(139, 0, 5, U, S2.light)
  ].join(''));
  tile('t/rokko/m/steel/hardT', () => [
    rect(0, 0, U, 40, S2.dark), rect(0, 0, U, 32, '#a7b3cc'), rect(0, 0, U, 7, '#f4f7ff'),
    rect(0, 32, U, 5, '#f2c12e'), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => path(`M${i * 20} 37 L${i * 20 + 10} 32 L${i * 20 + 16} 32 L${i * 20 + 6} 37 Z`, '#2a2f40')),
    rect(0, 40, U, 8, '#000000', { opacity: 0.3 })
  ].join(''));
}

// 掬星台：あかりに照らされた石の広場（明るいふち）＋ 石がき
const KCAP = { h: 36, base: '#d6ccb8', dark: '#8c8472', light: '#fff4d8' };
{
  const P = { colors: ['#737a96', '#6a7190', '#7c83a0', '#666d8a'], jitter: 8, round: 16, speck: true, gap: 9 };
  const mortar = '#454b66';
  const body = v => [rect(0, 0, U, U, mortar), masonry([{ y0: 0, y1: 80, edge: '#70779a', joints: joints(40, 118, 11700 + v, 48, 78) }, { y0: 80, y1: 160, edge: '#6c7392', joints: joints(14, 146, 11710 + v, 50, 80) }], P, 11730 + v)].join('');
  for (let v = 0; v < 3; v++) tile(`t/kikusei/g/body${v}`, () => body(v));
  const top = v => [
    body(v + 4),
    rect(0, 34, U, 12, '#000000', { opacity: 0.3 }),
    rect(0, 0, U, 38, KCAP.dark), rect(0, 0, U, 32, KCAP.base),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + (v % 2 ? 20 : 0) - 1, 6, 2, 26, '#b9ae98')),
    rect(0, 0, U, 5, KCAP.light), rect(0, 0, U, 1.6, '#ffffff'),
    v === 1 ? poly(star5(80, 19, 8, 3.4), '#f3c94a') : ''
  ].join('');
  for (let v = 0; v < 2; v++) tile(`t/kikusei/g/top${v}`, () => top(v));
  tile('t/kikusei/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.35], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/kikusei/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.35]], 0, 0, 1, 0)));
  tile('t/kikusei/g/topL', () => [rect(0, 0, 10, 38, KCAP.dark), rect(0, 0, 5, 32, '#bdb29c'), rect(0, 0, 10, 3, '#ffffff')].join(''));
  tile('t/kikusei/g/topR', () => [rect(150, 0, 10, 38, KCAP.dark), rect(155, 0, 5, 32, '#bdb29c'), rect(150, 0, 10, 3, '#ffffff')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/kikusei/g/${k}`, defs => slopeTile(defs, k, body(0), KCAP));
  // はしのかべ（石がき：タイルどうしでつながる）
  tile('t/kikusei/hard', () => [rect(0, 0, U, U, '#3f4560'), masonry([{ y0: 0, y1: 80, edge: '#7c83a2', joints: [80] }, { y0: 80, y1: 160, edge: '#767d9c', joints: [40, 120] }], { ...P, jitter: 0, round: 10, colors: ['#7c83a2', '#737a98', '#8289a6'] }, 11750)].join(''));
  tile('t/kikusei/hardT', () => [rect(0, 0, U, 30, '#8c8472'), rect(0, 0, U, 24, KCAP.base), rect(0, 0, U, 5, KCAP.light)].join(''));
  // 展望デッキ（すり抜けられる足場）：木の床と明るいふち
  tile('t/kikusei/semi', () => [
    rect(0, 0, U, 50, '#6a4a34'), rect(0, 0, U, 42, '#b98a5a'), rect(52, 4, 3, 38, '#8e6440'), rect(108, 4, 3, 38, '#8e6440'),
    rect(0, 0, U, 7, '#ffe2a8'), rect(0, 0, U, 2, '#ffffff'), rect(0, 42, U, 8, '#000000', { opacity: 0.25 }),
    path('M22 50 L22 96 M138 50 L138 96 M22 60 L60 50 M138 60 L100 50', 'none', st('#4a5470', 8))
  ].join(''));
}

// ========================================================================
// 飾り（シート s10）
// ========================================================================
// ---------- 牛舎（赤い板・白いふち・まどに明かり） ----------
sprite(SH, 's10/barn', 100, 82, 2, 81, defs => {
  const out = [], W = 900;
  const red = '#a8434a', redD = '#7e2f3a', trim = '#e8e2f0';
  out.push(rect(0, -520, W, 520, red));
  for (let x = 30; x < W; x += 60) out.push(rect(x, -520, 6, 520, redD, { opacity: 0.6 }));
  out.push(rect(0, -520, W, 520, defs.lin([[0, '#6a78c8', 0.18], [1, '#1a1f40', 0.25]])));
  // 屋根（ギャンブレル）
  out.push(path(`M-40 -500 L80 -700 L${W / 2} -800 L${W - 80} -700 L${W + 40} -500 Z`, '#3d3650'), path(`M-40 -500 L80 -700 L${W / 2} -800 L${W / 2} -770 L100 -680 L-10 -500 Z`, '#5d5a82'));
  out.push(path(`M-40 -500 L80 -700 L${W / 2} -800 L${W - 80} -700 L${W + 40} -500`, 'none', st('#9aa6d8', 8, { opacity: 0.6 })));
  // 大きな戸（白いXのわく）
  const dx = W / 2 - 170;
  out.push(rect(dx, -380, 340, 380, redD), rect(dx, -380, 340, 380, 'none', { stroke: trim, strokeWidth: 18 }), path(`M${dx} -380 L${dx + 340} 0 M${dx + 340} -380 L${dx} 0 M${dx + 170} -380 L${dx + 170} 0`, 'none', st(trim, 14)));
  // 上の窓（ほし草・明かり）
  out.push(rect(W / 2 - 70, -620, 140, 110, '#ffcf7a'), rect(W / 2 - 70, -620, 140, 110, 'none', { stroke: trim, strokeWidth: 14 }), path(`M${W / 2 - 60} -520 Q${W / 2} -560 ${W / 2 + 60} -520 Z`, '#d9a13a'));
  // 横の窓（明かり）
  for (const x of [80, W - 200]) out.push(rect(x, -360, 120, 100, '#ffd98a'), rect(x, -360, 120, 100, 'none', { stroke: trim, strokeWidth: 12 }), path(`M${x + 60} -360 L${x + 60} -260 M${x} -310 L${x + 120} -310`, 'none', st(trim, 8)), rect(x + 8, -352, 40, 40, '#ffffff', { opacity: 0.35 }));
  // ほし草のたば
  out.push(rrect(40, -120, 150, 120, 30, '#c9a24a'), rrect(40, -120, 150, 26, 12, '#e8c56a'), rrect(W - 200, -100, 130, 100, 26, '#b8923e'));
  out.push(rect(0, -24, W, 24, '#2a2034'));
  return tr(2, 81, out.join(''), 0.1);
});
// ---------- 木のさく（くり返し） ----------
sprite(SH, 's10/fence', 32, 16, 0, 15, () => tr(0, 15, [
  ...[20, 180].map(x => [rect(x, -150, 26, 150, '#6a5448'), rect(x, -150, 8, 150, '#a8948a'), path(`M${x} -150 L${x + 13} -164 L${x + 26} -150 Z`, '#6a5448')].join('')),
  rect(0, -126, 320, 18, '#7a6252'), rect(0, -126, 320, 5, '#b8a498'), rect(0, -66, 320, 18, '#7a6252'), rect(0, -66, 320, 5, '#b8a498')
], 0.1));
// ---------- ちょうちんの柱（牧場の道） ----------
sprite(SH, 's10/lantern', 16, 44, 8, 43, () => tr(8, 43, [
  rect(-10, -400, 20, 400, '#5a4638'), rect(-10, -400, 6, 400, '#8a7464'),
  path('M0 -380 L60 -380', 'none', st('#4a3a30', 10)), path('M50 -380 L50 -350', 'none', st('#2a2220', 4)),
  rrect(26, -352, 48, 10, 3, '#2a2220'),
  ell(50, -306, 34, 42, '#ffe7b0'), ell(40, -314, 11, 26, '#ffffff', { opacity: 0.8 }),
  ...[-330, -306, -282].map(y => path(`M20 ${y} Q50 ${y + 5} 80 ${y}`, 'none', st('#e8b86a', 2.4))),
  rrect(26, -266, 48, 10, 3, '#2a2220'),
  rrect(-24, -20, 48, 20, 5, '#3a2e28')
], 0.1));
// ---------- ひつじ（月あかりの白い毛） ----------
sprite(SH, 's10/sheep', 24, 20, 11, 19, () => tr(11, 19, [
  ell(0, -4, 100, 14, '#000000', { opacity: 0.25 }),
  rect(-54, -60, 16, 60, '#2e2c38'), rect(34, -60, 16, 60, '#2e2c38'), rect(-26, -56, 14, 52, '#24222e'), rect(14, -56, 14, 52, '#24222e'),
  ...[[-50, -92, 42], [0, -114, 46], [46, -94, 40], [-20, -74, 40], [26, -72, 40], [-66, -66, 30]].map(([x, y, rr]) => circ(x, y + 5, rr + 4, '#b7bfd8')),
  ...[[-50, -96, 42], [0, -118, 46], [46, -98, 40], [-20, -78, 40], [26, -76, 40], [-66, -70, 30]].map(([x, y, rr]) => circ(x, y, rr, '#f2f4fb')),
  ...[[-24, -134], [26, -142], [-62, -112]].map(([x, y]) => circ(x, y, 13, '#ffffff')),
  ell(92, -102, 30, 36, '#2e2c38', { rot: 12 }), ell(72, -124, 17, 8, '#2e2c38', { rot: -30 }), circ(70, -130, 20, '#f2f4fb'),
  circ(100, -108, 7, '#ffffff'), circ(102, -108, 3.4, '#1a1a22')
], 0.1));
// ---------- 夜の木（まるい・月あかりのふち） ----------
sprite(SH, 's10/tree', 50, 64, 25, 63, () => {
  const r = rng(12001), out = [];
  out.push(path('M-20 0 C-14 -110 -24 -170 -60 -240 L-44 -250 C-18 -206 -6 -190 2 -270 L20 -266 C16 -190 22 -110 22 0 Z', '#3a2e34'));
  const blobs = [];
  for (let i = 0; i < 22; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 170 * d, -390 + Math.sin(a) * 130 * d, 54 + r() * 26]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#12302e'));
  for (const [bx, by, br] of blobs) { const t = (by + 520) / 260; out.push(cloverBlob(bx, by, br * 0.9, t > 0.55 ? '#1b3e3c' : '#24504a', t < 0.4 && bx < 40 ? '#4f8a7a' : null)); }
  return tr(25, 63, out.join(''), 0.1);
});
// ---------- 駅（夜・まどに明かり。上は三角の屋根なので乗れないように見える） ----------
function nightStation(defs, W, bayLeft, roofC, bandC, wheel) {
  const out = [], wall = '#d9d4e4';
  out.push(rect(0, -560, W, 560, wall), rect(0, -560, W, 560, defs.lin([[0, '#5a66b0', 0.25], [1, '#1a1f40', 0.35]])));
  // 三角の屋根（とがっている）
  out.push(path(`M-50 -540 L${W / 2} -760 L${W + 50} -540 Z`, roofC), path(`M-50 -540 L${W / 2} -760 L${W / 2} -730 L-6 -540 Z`, shade(roofC, 0.25), { opacity: 0.7 }), rect(-60, -560, W + 120, 30, shade(roofC, -0.3)));
  out.push(path(`M-50 -540 L${W / 2} -760 L${W + 50} -540`, 'none', st('#b8c4f0', 8, { opacity: 0.55 })));
  // 帯（虹の駅は虹色）
  if (bandC === 'rainbow') ['#ff6a6a', '#ffb05a', '#ffe36a', '#7ed87a', '#6ab8ff', '#a88aff'].forEach((c, i) => out.push(rect(0, -520 + i * 12, W, 12, c, { opacity: 0.85 })));
  else out.push(rect(0, -520, W, 60, bandC), rect(0, -520, W, 10, '#ffffff', { opacity: 0.3 }));
  // 名前の板（文字はゲームで描く）
  out.push(rrect(W / 2 - 220, -680, 440, 100, 12, '#fff7e4'), rrect(W / 2 - 220, -680, 440, 100, 12, 'none', { stroke: '#2a3050', strokeWidth: 8 }));
  // ゴンドラの入り口と滑車
  const bay = bayLeft ? [0, 400] : null;
  const hx0 = bay ? 440 : 60, hx1 = W - 60;
  if (bay) {
    out.push(rect(bay[0], -440, bay[1] - bay[0], 440, defs.lin([[0, '#1c2440'], [1, '#2c3658']])));
    const [wx, wy, wr] = wheel;
    out.push(circ(wx, wy, wr, 'none', { stroke: '#aab4d0', strokeWidth: 14 }), circ(wx, wy, 14, '#ff5a4a'));
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; out.push(path(`M${wx} ${wy} L${wx + Math.cos(a) * (wr - 6)} ${wy + Math.sin(a) * (wr - 6)}`, 'none', st('#7f8aa8', 7))); }
    out.push(rect(bay[1], -440, 30, 440, '#c9c4d8'));
    out.push(rect(0, -40, bay[1], 40, '#ffe2a8', { opacity: 0.25 }));
  }
  // あかるい窓（中の人の影・ランプ）
  out.push(rect(hx0, -430, hx1 - hx0, 330, '#ffd98a'), rect(hx0, -430, hx1 - hx0, 330, defs.lin([[0, '#ffffff', 0.3], [1, '#ff9a4a', 0.2]])));
  for (let x = hx0 + 40; x < hx1 - 60; x += 150) out.push(path(`M${x} -100 L${x} -170 Q${x + 26} -220 ${x + 52} -170 L${x + 52} -100 Z`, '#8a5a4a', { opacity: 0.5 }), circ(x + 26, -196, 20, '#8a5a4a', { opacity: 0.5 }));
  for (let x = hx0; x <= hx1 + 1; x += (hx1 - hx0) / Math.max(2, Math.round((hx1 - hx0) / 150))) out.push(rect(x - 7, -430, 14, 330, '#e8e4f2'));
  out.push(rect(hx0 - 10, -440, hx1 - hx0 + 20, 14, '#e8e4f2'), rect(hx0 - 10, -110, hx1 - hx0 + 20, 16, '#e8e4f2'));
  out.push(rect(0, -40, W, 40, '#6a6480'), rect(0, -40, W, 6, '#a8a2c0'));
  return out.join('');
}
// 虹の駅（摩耶ケーブルの上の駅）
sprite(SH, 's10/niji', 112, 82, 6, 81, defs => tr(6, 81, nightStation(defs, 1000, false, '#4a4a7a', 'rainbow'), 0.1));
// 星の駅（ロープウェーの上の駅・左にゴンドラの入り口）
sprite(SH, 's10/hoshi', 146, 82, 6, 81, defs => tr(6, 81, nightStation(defs, 1340, true, '#3a4a86', '#3a5aa8', [230, -270, 70]), 0.1));
// 出発する側の滑車の台（夜・赤い光）
sprite(SH, 's10/gantry', 36, 46, 30, 45, () => tr(30, 45, [
  path('M-270 0 L-200 -300 L-170 -300 L-210 0 Z', '#58658a'), path('M-20 0 L-80 -300 L-110 -300 L-80 0 Z', '#4a5678'),
  path('M-236 -120 L-60 -120 M-220 -200 L-80 -200', 'none', st('#4a5678', 10)),
  path('M-236 -120 L-80 -200 M-60 -120 L-220 -200', 'none', st('#6c7a9e', 6)),
  rrect(-240, -330, 200, 40, 8, '#353e5c'), rect(-230, -330, 180, 10, '#9aa8cc'),
  circ(-60, -270, 72, 'none', { stroke: '#353e5c', strokeWidth: 16 }), circ(-60, -270, 72, 'none', { stroke: '#aab8d8', strokeWidth: 6 }),
  ...[0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * TAU; return path(`M-60 -270 L${-60 + Math.cos(a) * 64} ${-270 + Math.sin(a) * 64}`, 'none', st('#6c7a9e', 5)); }),
  circ(-60, -270, 14, '#ff5a4a'), circ(-140, -346, 10, '#ff5a4a'),
  rect(-290, -12, 290, 12, '#4a4458')
], 0.1));
// 鉄塔（夜：点検台から上 82・下 80）
sprite(SH, 's10/pylon', 36, 168, 18, 88, () => tr(18, 88, pylon(82, 80, { base: '#6c7a98', dark: '#353e5c', light: '#b4c2e2', lamp: true }), 0.1));

// ---------- 摩耶ケーブルのケーブルカー（幅48・クリームとえんじ色・窓に明かり） ----------
sprite(SH, 's10/cablecar', 56, 40, 4, 30, () => {
  const body = 'M-24 -250 Q-24 -290 16 -290 L464 -290 Q504 -290 504 -250 L504 10 L-24 10 Z';
  return tr(4, 30, [
    path(body, 'none', { stroke: OUT, strokeWidth: 12, strokeLinejoin: 'round' }),
    path(body, '#8a2a34'), path('M-24 -250 Q-24 -290 16 -290 L464 -290 Q504 -290 504 -250 L504 -100 L-24 -100 Z', '#f1e3c2'),
    rect(-24, -300, 528, 26, '#5a4a5a'), rect(-10, -300, 500, 8, '#9a8aa8'),
    ...[0, 1, 2, 3].map(i => [rrect(12 + i * 120, -250, 100, 120, 12, '#ffd98a'), rrect(12 + i * 120, -250, 100, 120, 12, '#fff4d0', { opacity: 0.4 }), path(`M${40 + i * 120} -120 L${40 + i * 120} -150 Q${60 + i * 120} -180 ${80 + i * 120} -150 L${80 + i * 120} -120 Z`, '#9a6a4a', { opacity: 0.45 })].join('')),
    rect(-24, -108, 528, 14, '#d9a94a'),
    circ(480, -60, 16, '#fff6c0'), circ(-2, -60, 12, '#ff5a4a'),
    rect(-20, -14, 520, 14, '#d5d0c6'), rect(-20, -14, 520, 5, '#fbf8f2'),
    ...[60, 420].map(x => [circ(x, 50, 24, '#2b2b36'), circ(x, 50, 9, '#9a9fb0')].join('')),
    rect(20, 10, 440, 22, '#3a3444')
  ].join(''), 0.1);
});

// ---------- 星のモニュメント・広場の街灯・ベンチ・望遠鏡 ----------
sprite(SH, 's10/monument', 36, 58, 18, 57, () => tr(18, 57, [
  rrect(-120, -60, 240, 60, 10, '#5b6078'), rect(-120, -60, 240, 12, '#9aa0bc'), rrect(-80, -110, 160, 50, 8, '#6a7090'), rect(-80, -110, 160, 10, '#aab0cc'),
  path('M-26 -110 L-16 -400 L16 -400 L26 -110 Z', '#8d93ae'), path('M-26 -110 L-16 -400 L-4 -400 L-8 -110 Z', '#c3c8de'),
  rrect(-50, -86, 100, 18, 4, '#d9c78a'),
  poly(star5(0, -470, 118, 50), '#e0a82e'), poly(star5(0, -476, 108, 44), '#ffd54f'), poly(star5(-8, -484, 56, 24), '#fff6c2'),
  path('M0 -588 L0 -476 L-102 -510', 'none', st('#ffffff', 5, { opacity: 0.5 }))
], 0.1));
sprite(SH, 's10/lamp', 16, 56, 8, 55, defs => tr(8, 55, [
  rrect(-34, -44, 68, 44, 10, '#2e3244'), rect(-34, -44, 68, 8, '#5a6078'),
  path('M-12 -44 L-8 -470 L8 -470 L12 -44 Z', '#343a50'), rect(-6, -470, 4, 420, '#6a7294', { opacity: 0.8 }),
  rrect(-40, -486, 80, 20, 8, '#2e3244'),
  circ(0, -530, 44, defs.rad([[0, '#ffffff'], [0.55, '#fff4d0'], [1, '#ffd98a']], 0.4, 0.4, 0.6)), ell(-14, -546, 10, 14, '#ffffff', { opacity: 0.9 }),
  rrect(-20, -580, 40, 12, 5, '#2e3244')
], 0.1));
sprite(SH, 's10/bench', 28, 16, 1, 15, () => tr(1, 15, [
  rect(20, -90, 8, 90, '#2a2a36'), rect(232, -90, 8, 90, '#2a2a36'),
  ...[0, 1, 2].map(k => rect(10, -150 + k * 20, 240, 14, k % 2 ? '#8a6a52' : '#9a785c')),
  rect(0, -86, 260, 16, '#9a785c'), rect(0, -86, 260, 5, '#d8b890'), rect(0, -70, 260, 6, '#5a4434')
], 0.1));
sprite(SH, 's10/scope', 18, 30, 9, 29, () => tr(9, 29, [
  rect(-6, -170, 12, 160, '#4a5070'), rrect(-40, -16, 80, 16, 5, '#2e3244'),
  rrect(-60, -250, 120, 70, 24, '#3a8a7a', { rot: -12 }), rrect(-68, -244, 24, 58, 8, '#2a6a5a', { rot: -12 }),
  circ(-58, -232, 11, '#bfe3f5'), rect(-20, -190, 40, 20, '#2e3244')
], 0.1));
