// ステージ7「メリケンパーク・ハーバーランド」を完成イメージ（夕焼けのメリケンパーク）に合わせて描き直したもの
// メリケンパーク：夕焼けの空・沈む夕日と海の照り返し・紫の六甲山と錨・明石海峡大橋・街とホテル・海洋博物館
//                 石の岸壁（黒い防げん材）・深い青の海
// ハーバーランド：日が沈んだあとの空（紫〜ピンク）・夜景の山・灯りのともったポートタワーと博物館・板張りの岸壁
// 飾り（s7 シート）：ポートタワー・足場・クレーン・コンテナ・レンガ倉庫・街灯・ビット・はしご・BE KOBE・客船・観覧車
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from '../svg.mjs';
import { wrap, cloud, anchor } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile } from '../tiles.mjs';
import { st, TAU, cloverBlob } from '../kit.mjs';

resetTheme('meriken');
resetTheme('harborland');

const SH = 's7';
const HZ = 154;                                   // 水平線の高さ（画面のy）
const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
// くり返しの幅 w でつながる波（山の形などに使う）
const waves = (w, x, amps) => amps.reduce((s, [k, a, ph]) => s + a * Math.sin((x / w) * TAU * k + ph), 0);
// x の列から折れ線の山の形を作る（下は bottom まで）
function profile(w, fn, bottom, step = 3) {
  let d = `M0 ${bottom}`;
  for (let x = 0; x <= w; x += step) d += ` L${f(x)} ${f(fn(x))}`;
  return d + ` L${w} ${bottom} Z`;
}

// ========================================================================
// 地形タイル
// ========================================================================
// 岸壁の石（大きな切り石・夕日で少しあたたかい）
function quayBody(pal, v) {
  const P = { colors: pal.stones, jitter: 0, round: 7, gap: 8, speck: true };
  return [
    rect(0, 0, U, U, pal.mortar),
    masonry([
      { y0: 0, y1: 80, edge: pal.edge[0], joints: joints(34 + (v % 3) * 6, 128, 7300 + v, 44, 66) },
      { y0: 80, y1: 160, edge: pal.edge[1], joints: joints(70 - (v % 2) * 12, 150, 7310 + v, 40, 64) }
    ], P, 7330 + v),
    rect(0, 0, U, U, pal.tint, { opacity: pal.tintA })
  ].join('');
}
// 黒いゴムの防げん材（岸壁に数マスおき）
function fenderTop() {
  return [
    rect(30, 98, 100, 14, '#4d475f'), rect(30, 98, 100, 4, '#7a7390'),
    circ(40, 105, 3, '#2a2636'), circ(120, 105, 3, '#2a2636'),
    path('M44 160 L44 128 Q44 112 60 112 L100 112 Q116 112 116 128 L116 160 Z', '#211e2b'),
    path('M50 160 L50 130 Q50 118 62 118 L70 118 L70 160 Z', '#3b3749'),
    rect(96, 120, 6, 40, '#15131c', { opacity: 0.7 }),
    rect(112, 116, 4, 44, '#e9a27e', { opacity: 0.35 })
  ].join('');
}
function fenderBody() {
  return [
    path('M44 0 L44 96 Q44 112 60 112 L100 112 Q116 112 116 96 L116 0 Z', '#211e2b'),
    path('M50 0 L50 98 Q50 106 62 106 L70 106 L70 0 Z', '#3b3749'),
    rect(96, 0, 6, 104, '#15131c', { opacity: 0.7 }),
    rect(112, 0, 4, 100, '#e9a27e', { opacity: 0.3 }),
    rect(60, 44, 40, 5, '#15131c', { opacity: 0.6 }),
    // くさり
    ell(80, 122, 5, 9, 'none', { stroke: '#3a3548', strokeWidth: 3.5 }),
    ell(80, 138, 8, 5, 'none', { stroke: '#3a3548', strokeWidth: 3.5 }),
    ell(80, 153, 5, 9, 'none', { stroke: '#3a3548', strokeWidth: 3.5 })
  ].join('');
}
// 海（深い青・明るい波がしら・夕日の照り返し）。となりのマスとつながるように、はしの高さは動かさない
function seaTile(name, c, frame, top) {
  tile(name, defs => {
    const ph = frame * Math.PI / 2;
    const SURF = 62;
    const yAt = x => SURF + 7 * Math.sin(TAU * x / 80) * Math.cos(ph) + 5 * Math.sin(TAU * x / 160) * Math.sin(ph);
    const out = [];
    if (top) {
      let d = `M0 160 L0 ${f(yAt(0))}`, d2 = `M0 ${f(yAt(0))}`;
      for (let x = 5; x <= 160; x += 5) { d += ` L${x} ${f(yAt(x))}`; d2 += ` L${x} ${f(yAt(x))}`; }
      out.push(path(d + ' L160 160 Z', defs.linU([[0, c.surf], [1, c.mid]], 0, 50, 0, 160)));
      out.push(path(d2, 'none', { stroke: c.crest, strokeWidth: 10, strokeLinecap: 'round' }));
      out.push(path(d2, 'none', { stroke: c.foam, strokeWidth: 3.5, strokeLinecap: 'round', opacity: 0.9, strokeDasharray: '16 12', strokeDashoffset: -frame * 7 }));
      out.push(path(d2.replace(/ (\d+(\.\d+)?)$/, ''), 'none', { stroke: c.deep, strokeWidth: 3, opacity: 0.35, transform: 'translate(0 8)' }));
    } else {
      out.push(rect(0, 0, U, U, defs.linU([[0, c.mid], [1, c.deep]], 0, 0, 0, 160)));
    }
    // 照り返し（金色）と明るいすじ
    const r = rng(7400 + frame * 7 + (top ? 1 : 0));
    for (let i = 0; i < 3; i++) {
      const x = (i * 53 + frame * 13 + r() * 10) % 138, y = (top ? 96 : 18) + ((i * 41 + frame * 9) % (top ? 50 : 120));
      out.push(rrect(x, y, 16 + r() * 10, 3.5, 1.7, i === 1 ? c.glint : c.gold, { opacity: 0.55 + r() * 0.25 }));
    }
    out.push(rrect((frame * 37 + 60) % 120, top ? 130 : 80, 30, 2.5, 1.2, c.streak, { opacity: 0.5 }));
    return out.join('');
  });
}

// ---------- メリケンパーク：石の岸壁と明るい笠石 ----------
{
  const PAL = {
    stones: ['#8f87a3', '#978ea8', '#877f9b', '#9b8fa3', '#8b8499'], mortar: '#4b4466', edge: ['#918aa5', '#8b839c'],
    tint: '#ffae7a', tintA: 0.06
  };
  const body = v => quayBody(PAL, v);
  for (let v = 0; v < 4; v++) tile(`t/meriken/g/body${v}`, () => body(v));
  // 上の段：夕日に照らされた明るい笠石（歩くところ）
  const top = v => [
    body(v + 4),
    rect(0, 90, U, 18, '#1d1530', { opacity: 0.32 }),
    // 笠石の前の面
    rect(0, 46, U, 48, '#8f7688'), rect(0, 46, U, 42, '#c2a6a4'), rect(0, 46, U, 6, '#e5c7b8'),
    rect(v % 2 ? 36 : 116, 52, 3, 36, '#9f8590'),
    // 上の面（明るい）
    rect(0, 0, U, 48, '#ecc9a6'), rect(0, 32, U, 16, '#dcb393'),
    rect(0, 0, U, 8, '#fff2da'), rect(0, 8, U, 3, '#f8dcb8'),
    rect(v % 2 ? 76 : 4, 11, 2, 21, '#d4a98a', { opacity: 0.8 }), rect(v % 2 ? 156 : 84, 11, 2, 21, '#d4a98a', { opacity: 0.8 }),
    circ(30 + v * 30, 22, 1.8, '#d9b18f'), circ(118 - v * 20, 16, 1.5, '#d9b18f')
  ].join('');
  for (let v = 0; v < 3; v++) tile(`t/meriken/g/top${v}`, () => top(v));
  tile('t/meriken/g/edgeL', defs => rect(0, 0, 28, U, defs.lin([[0, '#170f28', 0.42], [1, '#170f28', 0]], 0, 0, 1, 0)));
  tile('t/meriken/g/edgeR', defs => rect(132, 0, 28, U, defs.lin([[0, '#170f28', 0], [1, '#170f28', 0.42]], 0, 0, 1, 0)));
  tile('t/meriken/g/topL', () => [rect(0, 0, 12, 94, '#7d6478'), rect(0, 0, 7, 46, '#e2bb98'), rect(0, 0, 12, 8, '#fff2da')].join(''));
  tile('t/meriken/g/topR', () => [rect(148, 0, 12, 94, '#6f566c'), rect(153, 0, 7, 46, '#f4c99c'), rect(148, 0, 12, 8, '#fff2da')].join(''));
  tile('t/meriken/g/colTop', fenderTop);
  tile('t/meriken/g/col', fenderBody);
  const cap = { h: 46, base: '#ecc9a6', dark: '#8f7688', light: '#fff2da' };
  for (const k of Object.keys(SLOPES)) tile(`t/meriken/g/${k}`, defs => slopeTile(defs, k, body(k.length % 4), cap));
  tile('t/meriken/hard', () => [
    rrect(0, 0, U, U, 10, '#5d5474'), rrect(5, 5, 150, 148, 8, '#a69cb4'),
    path('M12 12 L148 12 L136 26 L26 26 L26 136 L12 148 Z', '#c9bfcf'), path('M148 12 L148 148 L12 148 L26 136 L136 136 L136 26 Z', '#8a809c'),
    rect(12, 12, 136, 5, '#ffe2c4', { opacity: 0.6 })
  ].join(''));
  tile('t/meriken/semi', () => [rrect(0, 0, U, 50, 8, '#6d4a34'), rrect(0, 0, U, 42, 8, '#c08658'), rect(0, 0, U, 8, '#f3c894'), rect(50, 0, 3, 42, '#8a5a3a'), rect(106, 0, 3, 42, '#8a5a3a')].join(''));
  const SEA = { surf: '#5171c4', mid: '#3a56a6', deep: '#253c86', crest: '#9cb8f2', foam: '#eef4ff', gold: '#ffc987', glint: '#ffe6b0', streak: '#7d98e4' };
  for (let fr = 0; fr < 4; fr++) { seaTile(`t/meriken/waterT${fr}`, SEA, fr, true); seaTile(`t/meriken/water${fr}`, SEA, fr, false); }
}

// ---------- ハーバーランド：板張りの岸壁（モザイクのボードウォーク） ----------
{
  const PAL = {
    stones: ['#7a7292', '#827a99', '#726a8a', '#857b93', '#776f8e'], mortar: '#3c3658', edge: ['#7d7596', '#79718f'],
    tint: '#6a5aa8', tintA: 0.08
  };
  const body = v => quayBody(PAL, v + 10);
  for (let v = 0; v < 4; v++) tile(`t/harborland/g/body${v}`, () => body(v));
  const top = v => {
    const out = [body(v + 4), rect(0, 90, U, 18, '#140d28', { opacity: 0.35 })];
    // 板の前のはり
    out.push(rect(0, 44, U, 48, '#5e3a2c'), rect(0, 44, U, 42, '#86553a'), rect(0, 44, U, 6, '#b27a52'), rect(0, 78, U, 8, '#5e3a2c'));
    out.push(circ(40, 64, 3.5, '#4a2c20'), circ(120, 64, 3.5, '#4a2c20'), circ(39, 63, 1.4, '#c89a74'), circ(119, 63, 1.4, '#c89a74'));
    // 板の上の面（ランプの光で明るい）
    out.push(rect(0, 0, U, 46, '#d9a06a'), rect(0, 30, U, 16, '#c28a58'));
    for (let x = (v * 12) % 32; x < U; x += 32) out.push(rect(x, 9, 2.5, 37, '#8e5e3c', { opacity: 0.55 }));
    out.push(rect(0, 0, U, 8, '#ffe6bc'), rect(0, 8, U, 3, '#f2c894'));
    out.push(rect(20 + v * 40, 18, 22, 2, '#ffe0b0', { opacity: 0.5 }));
    return out.join('');
  };
  for (let v = 0; v < 3; v++) tile(`t/harborland/g/top${v}`, () => top(v));
  tile('t/harborland/g/edgeL', defs => rect(0, 0, 28, U, defs.lin([[0, '#120c24', 0.45], [1, '#120c24', 0]], 0, 0, 1, 0)));
  tile('t/harborland/g/edgeR', defs => rect(132, 0, 28, U, defs.lin([[0, '#120c24', 0], [1, '#120c24', 0.45]], 0, 0, 1, 0)));
  tile('t/harborland/g/topL', () => [rect(0, 0, 12, 92, '#4e3024'), rect(0, 0, 7, 44, '#c89060'), rect(0, 0, 12, 8, '#ffe6bc')].join(''));
  tile('t/harborland/g/topR', () => [rect(148, 0, 12, 92, '#4e3024'), rect(153, 0, 7, 44, '#c89060'), rect(148, 0, 12, 8, '#ffe6bc')].join(''));
  tile('t/harborland/g/colTop', fenderTop);
  tile('t/harborland/g/col', fenderBody);
  const cap = { h: 44, base: '#d9a06a', dark: '#5e3a2c', light: '#ffe6bc' };
  for (const k of Object.keys(SLOPES)) tile(`t/harborland/g/${k}`, defs => slopeTile(defs, k, body(k.length % 4), cap));
  tile('t/harborland/hard', () => [
    rrect(0, 0, U, U, 10, '#463e62'), rrect(5, 5, 150, 148, 8, '#8a82a2'),
    path('M12 12 L148 12 L136 26 L26 26 L26 136 L12 148 Z', '#aba3c0'), path('M148 12 L148 148 L12 148 L26 136 L136 136 L136 26 Z', '#6e6688')
  ].join(''));
  tile('t/harborland/semi', () => [rrect(0, 0, U, 50, 8, '#5e3a2c'), rrect(0, 0, U, 42, 8, '#c08658'), rect(0, 0, U, 8, '#ffe0b0'), rect(50, 0, 3, 42, '#8a5a3a'), rect(106, 0, 3, 42, '#8a5a3a')].join(''));
  // レンガ倉庫（かべの絵は飾り s7_renga が上からかぶせる。これは下地）
  const brick = (lit) => {
    const out = [rect(0, 0, U, U, '#5a2a24')];
    for (let row = 0; row < 4; row++) for (let x = (row % 2 ? -40 : 0); x < U; x += 80) {
      const x0 = Math.max(0, x + 3), x1 = Math.min(U, x + 77);
      out.push(rect(x0, row * 40 + 3, x1 - x0, 34, ((x + row * 7) / 40) % 3 ? '#9a4634' : '#8a3e2e'), rect(x0, row * 40 + 3, x1 - x0, 6, '#b8604a', { opacity: 0.7 }));
    }
    if (lit) out.push(path('M40 150 L40 70 Q40 34 80 34 Q120 34 120 70 L120 150 Z', '#d9c2a2'), path('M50 144 L50 72 Q50 44 80 44 Q110 44 110 72 L110 144 Z', '#ffd27e'), rect(77, 44, 6, 100, '#d9c2a2'));
    return out.join('');
  };
  tile('t/harborland/m/brick/hard', () => brick(false));
  tile('t/harborland/m/brickwin/hard', () => brick(true));
  const cor = () => [rect(0, 0, U, 34, '#6b4a3e'), rect(0, 0, U, 28, '#e2c6ae'), rect(0, 0, U, 8, '#fff0dc'), rect(0, 34, U, 8, '#000000', { opacity: 0.25 })].join('');
  tile('t/harborland/m/brick/hardT', cor);
  tile('t/harborland/m/brickwin/hardT', cor);
  const SEA = { surf: '#3f58aa', mid: '#2c418c', deep: '#1c2c6a', crest: '#8098e0', foam: '#e6ecff', gold: '#ffc987', glint: '#ffb4d0', streak: '#6f86d6' };
  for (let fr = 0; fr < 4; fr++) { seaTile(`t/harborland/waterT${fr}`, SEA, fr, true); seaTile(`t/harborland/water${fr}`, SEA, fr, false); }
}

// ========================================================================
// 背景の部品
// ========================================================================
// 空の光・太陽・海（水平線より下はずっと遠いので、ほとんど動かない）
function skySea(theme, o) {
  bgLayer(theme, { f: 0.006, w: 1400, y: 0, h: 240 }, (defs, w) => {
    const r = rng(o.seed);
    const { SX, SY } = o;
    const out = [];
    out.push(rect(0, 0, w, HZ + 1, defs.radU(o.glow, SX, SY, o.glowR)));
    if (o.stars) for (let i = 0; i < o.stars; i++) {
      const x = r() * w, y = 4 + Math.pow(r(), 1.6) * 90, rr = 0.35 + r() * 0.6, a = 0.35 + r() * 0.5;
      out.push(circ(x, y, rr, '#fff6e6', { opacity: a }));
      if (rr > 0.8) out.push(rect(x - 2.2, y - 0.2, 4.4, 0.4, '#fff6e6', { opacity: a * 0.6 }), rect(x - 0.2, y - 2.2, 0.4, 4.4, '#fff6e6', { opacity: a * 0.6 }));
    }
    if (o.sun) {
      out.push(circ(SX, SY, 30, '#ffd48a', { opacity: 0.3 }), circ(SX, SY, 23.5, '#ffe2a0', { opacity: 0.45 }));
      out.push(circ(SX, SY, 20, defs.radU([[0, '#fffbe4'], [0.35, '#ffeaa0'], [0.8, '#ffc85a'], [1, '#ffb244']], SX - 5, SY - 6, 25)));
      out.push(circ(SX, SY, 20, 'none', { stroke: '#fff2c8', strokeWidth: 0.8, opacity: 0.7 }));
    }
    // 海
    out.push(rect(0, HZ, w, 240 - HZ, defs.linU(o.sea, 0, HZ, 0, 240)));
    out.push(ell(SX, HZ + 2, 230, 30, defs.rad(o.seaGlow)));
    out.push(rect(0, HZ - 0.4, w, 1.1, o.hzLine, { opacity: 0.7 }));
    // 水平線の近くの細いすじ
    for (let i = 0; i < 40; i++) { const x = r() * w, y = HZ + 2 + r() * 10, l = 6 + r() * 26; out.push(wrap(w, x, l, xx => rrect(xx, y, l, 0.6, 0.3, o.line, { opacity: 0.35 }))); }
    // 太陽の照り返し（遠いところは太く明るく、手前はうすく）
    for (let y = HZ + 1.4; y < 214; y += 2.2 + (y - HZ) * 0.028) {
      const k = (y - HZ) / 55, half = (9 + k * 30) * (o.refW ?? 1), a = Math.max(0.1, 0.95 - k * 0.78) * (o.refA ?? 1);
      const n = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const cx = SX + (r() - 0.5) * half * 1.7, len = 3 + r() * half * 0.9;
        out.push(rrect(cx - len / 2, y, len, 0.9 + k * 0.6, 0.5, r() < 0.5 ? o.ref[0] : o.ref[1], { opacity: a * (0.55 + r() * 0.45) }));
      }
    }
    // 海のきらめき
    for (let i = 0; i < 120; i++) {
      const x = r() * w, y = HZ + 4 + Math.pow(r(), 1.2) * 82, l = 3 + r() * 9, a = 0.18 + r() * 0.28;
      out.push(wrap(w, x, l, xx => rrect(xx, y, l, 0.7, 0.35, o.glint, { opacity: a })));
    }
    return out.join('');
  });
}
// 雲の層
function cloudsLayer(theme, o) {
  bgLayer(theme, { f: 0.02, w: 1400, y: 0, h: 150 }, (defs, w) => {
    const out = [];
    // 横に長いすじ雲
    for (const [x, y, l, c, a] of o.streaks) out.push(wrap(w, x, l, xx => rrect(xx, y, l, 2.4, 1.2, c, { opacity: a }) + rrect(xx + l * 0.2, y + 2.6, l * 0.5, 1.4, 0.7, c, { opacity: a * 0.6 })));
    for (const [x, y, s, k] of o.puffs) {
      const c = o.cols[k || 0];
      out.push(wrap(w, x - 40 * s, 80 * s, xx => cloud(xx + 40 * s, y, s, c[0], c[1], c[2])));
    }
    return out.join('');
  });
}
// 明石海峡大橋（遠く・シルエット）
function akashiBridge(o) {
  const { x0, x1, t1, t2, deck, top, col } = o;
  const out = [];
  const cy = 2 * (deck - 3) - top;               // 真ん中のケーブルがいちばん下がる高さ = deck-3
  const cab = u => (1 - u) * (1 - u) * top + 2 * u * (1 - u) * cy + u * u * top;
  // 橋げた
  out.push(rect(x0, deck, x1 - x0, 2.2, col), rect(x0, deck + 2.2, x1 - x0, 0.8, shade(col, -0.25)));
  // 主塔と足
  for (const t of [t1, t2]) {
    out.push(rect(t - 2.3, top - 1, 1.5, HZ + 1 - top, col), rect(t + 0.8, top - 1, 1.5, HZ + 1 - top, col));
    for (const yy of [top + 2, top + 12, deck - 6]) out.push(rect(t - 2.3, yy, 4.6, 1, col));
    out.push(rect(t - 3.2, deck + 3, 6.4, HZ + 1 - deck - 3, shade(col, -0.1)));
  }
  // ケーブル
  let d = `M${x0} ${deck - 0.5} Q${(x0 + t1) / 2} ${deck - 4} ${t1} ${top}`;
  d += ` Q${(t1 + t2) / 2} ${cy} ${t2} ${top} Q${(t2 + x1) / 2} ${deck - 4} ${x1} ${deck - 0.5}`;
  out.push(path(d, 'none', { stroke: col, strokeWidth: 0.9 }));
  for (let x = t1 + 3; x < t2 - 1; x += 3.2) { const u = (x - t1) / (t2 - t1); out.push(rect(x, cab(u), 0.35, deck - cab(u), col, { opacity: 0.8 })); }
  if (o.lights) for (let k = 0; k <= 24; k++) { const u = k / 24, x = t1 + (t2 - t1) * u; out.push(circ(x, cab(u), 0.55, o.lights[k % o.lights.length], { opacity: 0.9 })); }
  return out.join('');
}
// 遠くの山（紫）。メリケンパークでは夕日のあたりで海までさがる
function hillsLayer(theme, o) {
  bgLayer(theme, { f: 0.035, w: 1200, y: 64, h: 96 }, (defs, w) => {
    const r = rng(o.seed);
    const envAt = (x, a, b) => {
      x = ((x % w) + w) % w;
      if (x < a) return 1;
      if (x < b) return 1 - sm((x - a) / (b - a));
      if (x < 860) return 0;
      if (x < 1100) return sm((x - 860) / 240);
      return 1;
    };
    const env = x => envAt(x, 280, 385), envB = x => envAt(x, 240, 350);
    const back = x => HZ + 2 - envB(x) * (58 + waves(w, x, [[3, 10, 1.2], [7, 6, 0.4], [13, 2.5, 2]]));
    const front = x => HZ + 2 - env(x) * (38 + waves(w, x, [[2, 8, 2.6], [5, 7, 0.9], [11, 3, 1.7], [19, 1.5, 0.3]]));
    const out = [];
    // 淡路島（遠く）
    out.push(path(profile(w, x => HZ + 1 - Math.max(0, sm((x - 700) / 60) * (1 - sm((x - 900) / 120))) * (13 + waves(w, x, [[9, 2, 0.5]])), HZ + 2), o.island));
    const pb = profile(w, back, HZ + 2), pf = profile(w, front, HZ + 2);
    out.push(path(pb, defs.linU(o.back, 0, 90, 0, HZ)));
    out.push(path(pf, defs.linU(o.front, 0, 100, 0, HZ)));
    // ふもとのかすみ・谷のかげ（山の中だけ）
    const clip = defs.clip(`<path d="${pf}"/>`);
    const inner = [rect(0, 118, w, 40, defs.linU([[0, o.haze, 0], [1, o.haze, o.hazeA]], 0, 118, 0, HZ))];
    // ふもとの家の明かり
    for (let i = 0; i < o.lights; i++) {
      const x = r() * w; if (env(x) < 0.4) continue;
      const tp = front(x), y = tp + 8 + Math.pow(r(), 0.6) * (HZ - tp - 8);
      inner.push(circ(x, y, 0.45 + r() * 0.35, r() < 0.8 ? '#ffd98a' : '#ffffff', { opacity: 0.55 + r() * 0.4 }));
    }
    out.push(g(inner.join(''), { 'clip-path': clip }));
    // 尾根のふち（夕日のがわが明るい）
    {
      let d = '', pen = false;
      for (let x = 0; x <= w; x += 3) {
        const y = front(x);
        if (y < HZ - 1) { d += `${pen ? 'L' : 'M'}${f(x)} ${f(y)} `; pen = true; } else pen = false;
      }
      out.push(path(d.trim(), 'none', st(o.rim, 0.9, { opacity: 0.55 })));
    }
    // 錨山の錨
    const ax = 236;
    out.push(g(anchor(ax, front(ax) + 14, 0.62, o.anchor), { opacity: o.anchorA }));
    if (o.anchorGlow) out.push(circ(ax, front(ax) + 13, 10, o.anchor, { opacity: 0.16 }));
    // 明石海峡大橋
    out.push(akashiBridge({ x0: 404, x1: 760, t1: 486, t2: 626, deck: 144, top: 110, col: o.bridge, lights: o.bridgeLights }));
    return tr(0, -64, out.join(''));
  });
}
// ビル（窓・屋上・夕日の当たるふち）
function tower(x, base, w, h, c, r, o = {}) {
  const top = base - h;
  const out = [rect(x, top, w, h, c), rect(x, top, Math.max(1.5, w * 0.22), h, shade(c, -0.14))];
  if (o.rim) out.push(rect(x + w - 1, top, 1, h, o.rim, { opacity: 0.55 }), rect(x, top, w, 0.9, o.rim, { opacity: 0.5 }));
  const cw = o.cw || 1.6, ch = o.ch || 1.8, gx = o.gx || 1.5, gy = o.gy || 2;
  for (let yy = top + 3; yy < base - 3; yy += ch + gy) for (let xx = x + 2; xx < x + w - cw - 1; xx += cw + gx) {
    const lit = r() < (o.lit || 0.35);
    if (lit) out.push(rect(xx, yy, cw, ch, r() < 0.3 ? '#fff0c0' : '#ffd584', { opacity: 0.9 }));
    else if (r() < 0.6) out.push(rect(xx, yy, cw, ch, shade(c, -0.12)));
  }
  if (o.antenna && r() < 0.35) out.push(rect(x + w * 0.5, top - 5, 0.8, 5, shade(c, -0.2)), circ(x + w * 0.5 + 0.4, top - 5.5, 0.8, '#ff6a5a'));
  return out.join('');
}
// 遠くの街（岸までの x0〜x1。夕日のあたりはあけておく）
function cityLayer(theme, o) {
  bgLayer(theme, { f: 0.07, w: 1100, y: 76, h: 104 }, (defs, w) => {
    const r = rng(o.seed);
    const out = [];
    for (const [x0, x1] of o.spans) {
      for (let x = x0; x < x1;) {
        const bw = 9 + r() * 18, tall = r() < 0.18, bh = tall ? 40 + r() * 22 : 12 + r() * 30;
        const c = o.cols[Math.floor(r() * o.cols.length)];
        const bx = x, seed = Math.floor(r() * 1e6);
        out.push(wrap(w, bx, bw, xx => tower(xx, 170, bw, bh, c, rng(seed), { rim: o.rim, lit: o.lit, antenna: true })));
        x += bw + 0.5 + r() * 2.5;
      }
      // 岸（街の足もと）
      out.push(rect(x0 - 4, 166, x1 - x0 + 8, 5, o.shore), rect(x0 - 4, 166, x1 - x0 + 8, 0.8, o.shoreLight, { opacity: 0.6 }));
    }
    return tr(0, -76, out.join(''));
  });
}
// 海洋博物館（白い網の帆の屋根）
function museumNet(x, base, s, o) {
  const X = v => x + v * s, Y = v => base - v * s;
  const out = [];
  // 建物
  out.push(rect(X(-6), Y(14), 104 * s, 14 * s, o.wall), rect(X(-6), Y(14), 104 * s, 1.2, o.wallLight));
  for (let i = 0; i < 14; i++) out.push(rect(X(-2 + i * 7), Y(10), 4 * s, 5 * s, o.win, { opacity: 0.9 }));
  // 帆の形（左の小さい山・右の高い山）
  const outline = `M${X(-4)} ${Y(13)} Q${X(10)} ${Y(20)} ${X(22)} ${Y(34)} Q${X(34)} ${Y(22)} ${X(50)} ${Y(20)} Q${X(66)} ${Y(26)} ${X(96)} ${Y(56)} Q${X(90)} ${Y(30)} ${X(98)} ${Y(13)} Z`;
  out.push(path(outline, o.fill, { opacity: o.fillA }));
  const lines = [];
  for (let k = -12; k < 26; k++) {
    lines.push(`M${X(-10 + k * 5)} ${Y(12)} L${X(30 + k * 5)} ${Y(62)}`);
    lines.push(`M${X(-10 + k * 5)} ${Y(62)} L${X(30 + k * 5)} ${Y(12)}`);
  }
  const cp = o.defs.clip(`<path d="${outline}"/>`);
  out.push(g(path(lines.join(' '), 'none', { stroke: o.net, strokeWidth: 0.55 * s, opacity: 0.95 }), { 'clip-path': cp }));
  out.push(path(outline, 'none', { stroke: o.edge, strokeWidth: 1.1 * s, strokeLinejoin: 'round' }));
  return out.join('');
}
// ホテルオークラ（白い高いビル）
function okura(x, base, h, o) {
  const w = 22, top = base - h, out = [];
  out.push(rect(x, top, w, h, o.wall), rect(x, top, 6, h, o.shadow), rect(x + w - 1.2, top, 1.2, h, o.rim, { opacity: 0.8 }));
  for (let yy = top + 5; yy < base - 3; yy += 3.2) for (let k = 0; k < 5; k++) out.push(rect(x + 2.5 + k * 3.8, yy, 2, 1.8, (Math.floor(yy) * 7 + k * 3) % 5 < 2 ? o.lit : o.win, { opacity: 0.9 }));
  // 屋上の冠
  out.push(rect(x - 1.5, top - 1.5, w + 3, 2.4, o.crown), rect(x + 3, top - 6, w - 6, 4.6, o.wall), rect(x + 3, top - 6, 3, 4.6, o.shadow), rect(x + 6, top - 9, w - 12, 3, o.crown));
  out.push(rect(x + w / 2 - 0.4, top - 15, 0.8, 6, o.shadow), circ(x + w / 2, top - 15.5, 0.9, '#ff6a5a'));
  return out.join('');
}
// オリエンタルホテル（船の形の白い建物）
function oriental(x, base, o) {
  const out = [];
  out.push(path(`M${x} ${base} L${x} ${base - 12} L${x + 44} ${base - 12} Q${x + 58} ${base - 12} ${x + 62} ${base} Z`, o.wall));
  out.push(rect(x + 4, base - 18, 34, 6, o.wall), rect(x + 10, base - 23, 20, 5, o.wall), rect(x + 4, base - 18, 34, 0.9, o.rim, { opacity: 0.7 }));
  for (let i = 0; i < 9; i++) out.push(rect(x + 3 + i * 5.2, base - 9, 3, 2, o.lit, { opacity: 0.9 }));
  for (let i = 0; i < 6; i++) out.push(rect(x + 6 + i * 5.2, base - 16, 3, 2, i % 2 ? o.win : o.lit, { opacity: 0.9 }));
  out.push(rect(x, base - 12, 3, 12, o.shadow));
  return out.join('');
}
// 丸い木（シルエット）
function bgTree(x, base, s, c) {
  return [rect(x - 0.6 * s, base - 5 * s, 1.2 * s, 5 * s, c.trunk), circ(x - 3 * s, base - 7 * s, 3.6 * s, c.dark), circ(x + 3 * s, base - 7 * s, 3.4 * s, c.dark),
    circ(x, base - 10 * s, 4.6 * s, c.base), circ(x - 1.6 * s, base - 11.6 * s, 1.8 * s, c.light, { opacity: 0.8 })].join('');
}
// 岸のプロムナード（灯りの列）
function promenade(x0, x1, y, o) {
  const out = [rect(x0, y, x1 - x0, 4, o.col), rect(x0, y, x1 - x0, 0.9, o.light, { opacity: 0.8 }), rect(x0, y + 4, x1 - x0, 1.2, '#000000', { opacity: 0.2 })];
  for (let x = x0 + 3; x < x1 - 2; x += 7) out.push(circ(x, y - 1.2, 1.8, o.lamp, { opacity: 0.25 }), circ(x, y - 1.2, 0.6, o.lamp));
  return out.join('');
}

// ========================================================================
// メリケンパーク（夕焼け）
// ========================================================================
skySea('meriken', {
  seed: 7501, SX: 420, SY: 145, sun: true, glowR: 250,
  glow: [[0, '#ffd08a', 0.8], [0.14, '#ffbc7a', 0.55], [0.42, '#ff9c70', 0.22], [1, '#ff9a72', 0]],
  sea: [[0, '#c98fa6'], [0.07, '#a283b8'], [0.3, '#6b74ba'], [0.62, '#4f63b0'], [1, '#4058a6']],
  seaGlow: [[0, '#ffd592', 0.85], [0.45, '#f7a482', 0.35], [1, '#f7a482', 0]],
  hzLine: '#ffe2b8', line: '#f4c2b8', ref: ['#fff1b8', '#ffc478'], glint: '#d6c6f4'
});
cloudsLayer('meriken', {
  cols: [['#ffb689', '#ee8c80', '#ffd9a8'], ['#ffc794', '#f5a07e', '#ffe6b8'], ['#f7a595', '#d9808e', '#ffc9ae']],
  puffs: [[96, 40, 1.25, 0], [214, 66, 0.62, 2], [352, 30, 0.72, 1], [486, 58, 0.9, 1], [606, 34, 0.7, 0], [770, 72, 0.6, 2], [912, 36, 1.05, 0], [1090, 62, 0.75, 1], [1260, 44, 0.9, 2]],
  streaks: [[150, 110, 120, '#f7a78e', 0.55], [290, 124, 80, '#ffc796', 0.6], [420, 100, 110, '#ffcf9a', 0.55], [520, 130, 90, '#ffd4a0', 0.5], [610, 88, 140, '#f5a08e', 0.45],
    [40, 132, 70, '#e79a9e', 0.4], [760, 118, 120, '#f5a390', 0.45], [980, 104, 140, '#f3a092', 0.45], [1180, 126, 100, '#ffc796', 0.5]]
});
hillsLayer('meriken', {
  seed: 7601, back: [[0, '#a47fbd'], [1, '#c28fb2']], front: [[0, '#7c5ca4'], [1, '#9a73ac']], island: '#b08cbd',
  haze: '#f2a7a2', hazeA: 0.4, valley: '#6a4c92', rim: '#f5b8a6', lights: 70, anchor: '#ffe0a2', anchorA: 0.85,
  bridge: '#8b6fae'
});
cityLayer('meriken', {
  seed: 7701, spans: [[-10, 372], [790, 1110]], cols: ['#735f9e', '#7e69a8', '#67568f', '#8a74ae', '#6f5a98'], rim: '#f7ae90', lit: 0.33,
  shore: '#4a3c70', shoreLight: '#f3b690'
});
// 岸の建物：オリエンタルホテル・ホテルオークラ・海洋博物館・木とプロムナード
bgLayer('meriken', { f: 0.13, w: 1300, y: 76, h: 104 }, (defs, w) => {
  const out = [];
  const TC = { trunk: '#3c3058', dark: '#40386a', base: '#51467c', light: '#7a6a9e' };
  out.push(oriental(8, 171, { wall: '#ece2ee', shadow: '#bfb0cf', rim: '#ffcba6', lit: '#ffd98a', win: '#9d8fbf' }));
  out.push(okura(124, 171, 76, { wall: '#eee6f2', shadow: '#c4b6d8', rim: '#ffc8a4', lit: '#ffdc94', win: '#a898c4', crown: '#d7cce4' }));
  for (const [x, s] of [[82, 1.1], [96, 0.9], [110, 1.2], [160, 1], [176, 1.25], [194, 0.95], [214, 1.1], [232, 0.9], [388, 1.1], [404, 0.95], [420, 1.2], [1180, 1], [1200, 1.2], [1260, 1]]) out.push(wrap(w, x - 6, 12, xx => bgTree(xx, 172, s, TC)));
  out.push(museumNet(262, 172, 1.18, { defs, wall: '#d9cde2', wallLight: '#fff0e0', win: '#ffd98a', fill: '#f6eef6', fillA: 0.18, net: '#fbf5fb', edge: '#ffffff' }));
  out.push(promenade(-4, 436, 170, { col: '#3f3264', light: '#f6b894', lamp: '#ffe2a0' }));
  out.push(promenade(1150, 1304, 170, { col: '#3f3264', light: '#f6b894', lamp: '#ffe2a0' }));
  // 岸の影が水にうつる
  out.push(rect(-4, 175, 440, 4, '#2c2458', { opacity: 0.25 }));
  return tr(0, -76, out.join(''));
});
// 手前の海（下ほど少し暗く・波のすじ）
bgLayer('meriken', { f: 0.3, w: 900, y: 160, h: 80 }, (defs, w) => {
  const r = rng(7801);
  const out = [rect(0, 176, w, 64, defs.linU([[0, '#26306e', 0], [0.55, '#26306e', 0.2], [1, '#1c2460', 0.42]], 0, 176, 0, 240))];
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = 178 + Math.pow(r(), 0.8) * 30, l = 5 + r() * 14, c = r() < 0.75 ? '#a8b0ec' : '#ffcf98', a = 0.2 + r() * 0.2;
    out.push(wrap(w, x, l, xx => rrect(xx, y, l, 0.8, 0.4, c, { opacity: a })));
  }
  return tr(0, -160, out.join(''));
});

// ========================================================================
// ハーバーランド（日が沈んだあと・灯りがともる）
// ========================================================================
// 遠くのポートタワー（灯りつき）
function towerFar(x, base, s, o) {
  const H = 96 * s, hw = y => { const t = (y - 0.56) / 0.22; return (4.6 * Math.sqrt(1 + t * t)) * s; };
  let L = '', R = '';
  for (let k = 0; k <= 20; k++) { const u = k / 20, y = base - H * u; L += `${k ? 'L' : 'M'}${f(x - hw(u))} ${f(y)} `; R = `L${f(x + hw(u))} ${f(y)} ` + R; }
  const out = [path(L + R + 'Z', o.body)];
  for (let k = -3; k <= 3; k++) out.push(path(`M${x + k * hw(0) / 3.4} ${base} L${x - k * hw(1) / 3.4} ${base - H}`, 'none', { stroke: o.line, strokeWidth: 0.45 * s, opacity: 0.9 }));
  for (let k = 1; k < 9; k++) { const u = k / 9; out.push(rect(x - hw(u), base - H * u, hw(u) * 2, 0.5 * s, o.ring, { opacity: 0.8 })); }
  out.push(rrect(x - hw(1) - 1.5 * s, base - H - 4.5 * s, (hw(1) + 1.5 * s) * 2, 4.5 * s, 1, o.deck), rect(x - hw(1), base - H - 3.4 * s, hw(1) * 2, 1.4 * s, o.win));
  out.push(rect(x - 2.4 * s, base - H - 8 * s, 4.8 * s, 3.5 * s, o.body), rect(x - 0.4 * s, base - H - 13 * s, 0.8 * s, 5 * s, o.body), circ(x, base - H - 13.5 * s, 0.9 * s, '#ff5a50'));
  return out.join('');
}
skySea('harborland', {
  seed: 7511, SX: 420, SY: 176, sun: false, glowR: 330, stars: 110, refA: 0.45, refW: 1.4,
  glow: [[0, '#ffc19a', 0.85], [0.2, '#f69a8c', 0.5], [0.5, '#c0659a', 0.18], [1, '#b05a9a', 0]],
  sea: [[0, '#b27aa2'], [0.06, '#8069ac'], [0.3, '#4e519c'], [0.62, '#3e468f'], [1, '#353f88']],
  seaGlow: [[0, '#f5a58e', 0.6], [0.5, '#c07aa0', 0.22], [1, '#c07aa0', 0]],
  hzLine: '#ffc0a8', line: '#e6a0b8', ref: ['#ffd0b0', '#f7a2b8'], glint: '#b4a8ee'
});
cloudsLayer('harborland', {
  cols: [['#6e5296', '#f09a98', '#8a6cae'], ['#5e4888', '#e5808f', '#7c62a4'], ['#7d5a9c', '#ffb09a', '#9a78b4']],
  puffs: [[120, 56, 1.0, 0], [300, 36, 0.62, 1], [470, 78, 0.7, 2], [640, 44, 0.85, 0], [860, 64, 0.7, 1], [1040, 40, 0.95, 0], [1250, 70, 0.7, 2]],
  streaks: [[170, 118, 130, '#f59a96', 0.5], [360, 128, 90, '#ffb49a', 0.55], [520, 108, 120, '#e88a98', 0.45], [700, 124, 150, '#f59a96', 0.45], [60, 100, 80, '#9a70b0', 0.4], [900, 112, 140, '#e88a98', 0.45], [1150, 128, 110, '#ffb49a', 0.5]]
});
hillsLayer('harborland', {
  seed: 7611, back: [[0, '#4f3f88'], [1, '#6c4f96']], front: [[0, '#372d6c'], [1, '#4b3a80']], island: '#6a5698',
  haze: '#c46a9a', hazeA: 0.32, valley: '#2a2258', rim: '#e88aa2', lights: 320, anchor: '#ffe7a8', anchorA: 1, anchorGlow: true,
  bridge: '#5c4a90', bridgeLights: ['#fff2c0', '#ffb0d0', '#a8e0ff', '#fff2c0']
});
cityLayer('harborland', {
  seed: 7711, spans: [[-10, 372], [790, 1110]], cols: ['#3f3776', '#473e80', '#37306c', '#4d4386'], rim: '#e88aa2', lit: 0.55,
  shore: '#2a2458', shoreLight: '#f0a0a8'
});
// 海の向こうのメリケンパーク（灯りのともったタワー・博物館・ホテル）
bgLayer('harborland', { f: 0.13, w: 1300, y: 66, h: 124 }, (defs, w) => {
  const r = rng(7721);
  const out = [];
  const TC = { trunk: '#231d44', dark: '#2a2452', base: '#352c62', light: '#54477e' };
  // 水面の光のたて長のうつりこみ
  const refl = (x, c, n, wd) => { for (let i = 0; i < n; i++) out.push(rrect(x - wd / 2 + (r() - 0.5) * wd * 0.6, 176 + i * 2.6, wd * (0.4 + r() * 0.6), 0.9, 0.45, c, { opacity: 0.6 - i * 0.045 })); };
  out.push(okura(330, 171, 80, { wall: '#d8cde8', shadow: '#9f92c0', rim: '#f2a6b4', lit: '#ffe29a', win: '#7a6ea6', crown: '#c4b8dc' }));
  refl(341, '#ffe29a', 9, 14);
  out.push(ell(452, 120, 16, 50, '#ff6a5a', { opacity: 0.07 }));
  out.push(towerFar(452, 171, 0.8, { body: '#d8443e', line: '#ffb0a0', ring: '#ffd0b8', deck: '#ffe8c8', win: '#ffd27a' }));
  refl(452, '#ff7a6a', 12, 12);
  out.push(museumNet(500, 172, 1.05, { defs, wall: '#6a5f96', wallLight: '#c8b8e8', win: '#ffd98a', fill: '#bfe0ff', fillA: 0.28, net: '#e8f6ff', edge: '#ffffff' }));
  refl(560, '#cfeaff', 10, 30);
  out.push(oriental(640, 171, { wall: '#cfc4e0', shadow: '#8e82b0', rim: '#f2a6b4', lit: '#ffe29a', win: '#7a6ea6' }));
  refl(672, '#ffe29a', 8, 26);
  for (const [x, s] of [[262, 1.1], [278, 0.9], [296, 1.2], [312, 1], [366, 1], [384, 1.2], [404, 0.9], [424, 1.1], [616, 1], [712, 1.1], [730, 0.9], [748, 1.2]]) out.push(wrap(w, x - 6, 12, xx => bgTree(xx, 172, s, TC)));
  out.push(promenade(250, 770, 170, { col: '#2a2456', light: '#e89aae', lamp: '#ffe2a0' }));
  // 船の灯り
  for (const [x, y] of [[800, 178], [900, 174], [1000, 180]]) out.push(rrect(x - 7, y - 2, 14, 2.4, 1, '#2a2456'), circ(x - 4, y - 3, 0.7, '#ffe29a'), circ(x + 3, y - 3, 0.7, '#ff8a8a'));
  return tr(0, -66, out.join(''));
});
bgLayer('harborland', { f: 0.3, w: 900, y: 160, h: 80 }, (defs, w) => {
  const r = rng(7811);
  const out = [rect(0, 176, w, 64, defs.linU([[0, '#1c2060', 0], [0.5, '#1c2060', 0.22], [1, '#141852', 0.45]], 0, 176, 0, 240))];
  for (let i = 0; i < 80; i++) {
    const x = r() * w, y = 178 + Math.pow(r(), 0.8) * 30, l = 4 + r() * 12, c = ['#a8a8ec', '#ffcf98', '#ff9ab0', '#a8e0ff'][Math.floor(r() * 4)], a = 0.2 + r() * 0.22;
    out.push(wrap(w, x, l, xx => rrect(xx, y, l, 0.8, 0.4, c, { opacity: a })));
  }
  return tr(0, -160, out.join(''));
});

// ========================================================================
// 飾り（s7 シート）
// ========================================================================
const hwT = y => 110 * Math.sqrt(1 + ((y + 880) / 346.8) ** 2);   // ポートタワーのはば（0.1ドット単位。y=0 が足元、-1560 が上）
// ---------- ポートタワー（赤いつづみ形の網・灯りのともった窓） ----------
sprite(SH, 's7/tower', 100, 218, 50, 216, defs => {
  const TOP = -1560, out = [];
  let L = '', R = '';
  for (let y = 0; y >= TOP; y -= 40) { L += `${y === 0 ? 'M' : 'L'}${f(-hwT(y))} ${y} `; R = `L${f(hwT(y))} ${y} ` + R; }
  const sil = L + R + 'Z';
  const cp = defs.clip(`<path d="${sil}"/>`);
  // 足もとの建物
  out.push(rect(-400, -120, 800, 120, '#b9a3ae'), rect(-400, -120, 800, 16, '#f4dccb'), rect(-400, -12, 800, 12, '#7f6a7e'));
  for (let i = 0; i < 6; i++) out.push(rect(-360 + i * 130, -88, 70, 50, i === 2 || i === 3 ? '#ffd98a' : '#8e7c98'));
  // 中（うす暗い赤むらさき）
  out.push(path(sil, defs.lin([[0, '#3e1c3a'], [0.55, '#5e2440'], [1, '#86323e']], 0, 0, 1, 0)));
  const inner = [];
  // まん中のしん（エレベーター）
  inner.push(rect(-62, TOP, 124, -TOP, defs.lin([[0, '#8a6474'], [0.5, '#c79ea2'], [1, '#a47482']], 0, 0, 1, 0)));
  for (let y = -200; y > TOP + 40; y -= 150) inner.push(rect(-18, y, 36, 50, '#ffe2a0', { opacity: 0.85 }));
  // 灯りのともった網の目（完成イメージの黄色い窓）
  const rr = rng(7901);
  for (let k = 0; k < 12; k++) {
    const y0 = -k * 130 - 30, ym = y0 - 50, hw = hwT(ym);
    for (const c of [-0.74, -0.48, 0.48, 0.74]) {
      if (rr() < 0.3) continue;
      inner.push(rect(c * hw - hw * 0.1, ym - 36, hw * 0.2, 72, rr() < 0.4 ? '#fff0c0' : '#ffcf78', { opacity: 0.55 + rr() * 0.35 }));
    }
  }
  // うしろがわの網
  const al = 2.3, N = 18;
  for (let i = 0; i < N; i++) for (const s of [1, -1]) {
    const th = i / N * TAU, a = th + s * al;
    const z = 0.5 * 300 * Math.sin(th) + 0.5 * 242 * Math.sin(a);
    if (z > 0) continue;
    inner.push(path(`M${f(300 * Math.cos(th))} 0 L${f(242 * Math.cos(a))} ${TOP}`, 'none', { stroke: '#9a2e34', strokeWidth: 8 }));
  }
  // わっか
  for (let k = 1; k <= 12; k++) { const y = -k * 130, hw = hwT(y); inner.push(rect(-hw, y - 5, hw * 2, 11, '#c9383a'), rect(-hw, y - 5, hw * 2, 3, '#ff8a70', { opacity: 0.8 })); }
  // 手前の網
  for (let i = 0; i < N; i++) for (const s of [1, -1]) {
    const th = i / N * TAU, a = th + s * al;
    const z = 0.5 * 300 * Math.sin(th) + 0.5 * 242 * Math.sin(a);
    if (z <= 0) continue;
    const x0 = 300 * Math.cos(th), x1 = 242 * Math.cos(a);
    inner.push(path(`M${f(x0)} 0 L${f(x1)} ${TOP}`, 'none', { stroke: '#e8473c', strokeWidth: 13 }));
    inner.push(path(`M${f(x0 + 3)} 0 L${f(x1 + 3)} ${TOP}`, 'none', { stroke: '#ff8c6c', strokeWidth: 4, opacity: 0.7 }));
  }
  // かげ（左）と夕日のふち（右）
  inner.push(rect(-340, TOP, 300, -TOP, defs.lin([[0, '#1a0c2a', 0.45], [1, '#1a0c2a', 0]], 0, 0, 1, 0)));
  out.push(g(inner.join(''), { 'clip-path': cp }));
  out.push(path(R.replace(/^L/, 'M'), 'none', { stroke: '#ffb48c', strokeWidth: 9, opacity: 0.8 }));
  out.push(path(L, 'none', { stroke: '#6e2234', strokeWidth: 9, opacity: 0.8 }));
  // 展望台（2階ぶん）
  const deckY = TOP;
  out.push(rect(-290, deckY - 30, 580, 34, '#b8302e'), rect(-290, deckY - 30, 580, 8, '#ff8466'));
  out.push(rect(-270, deckY - 120, 540, 90, '#f2e2d6'), rect(-270, deckY - 120, 80, 90, '#c9b0b4'), rect(-250, deckY - 104, 500, 56, '#ffd98a'));
  for (let x = -250; x <= 250; x += 50) out.push(rect(x - 3, deckY - 104, 6, 56, '#b88c7a'));
  out.push(rect(-280, deckY - 132, 560, 14, '#c8342e'));
  out.push(rect(-250, deckY - 200, 500, 70, '#efe0d6'), rect(-250, deckY - 200, 70, 70, '#c9b0b4'), rect(-232, deckY - 188, 464, 44, '#ffe6ae'));
  for (let x = -232; x <= 232; x += 46) out.push(rect(x - 3, deckY - 188, 6, 44, '#b88c7a'));
  // 手すりのあるバルコニーの下（バルコニーの床は飾り s7_deck が描く）
  // バルコニーの上：回転レストランの階と屋根
  const up = deckY - 240;
  out.push(rect(-190, up - 150, 380, 150, '#f4e6dc'), rect(-190, up - 150, 60, 150, '#cbb2b6'), rect(-172, up - 124, 344, 70, '#ffdf98'));
  for (let x = -172; x <= 172; x += 43) out.push(rect(x - 3, up - 124, 6, 70, '#b88c7a'));
  out.push(rect(-200, up - 40, 400, 12, '#d8c0bc'));
  out.push(path(`M-210 ${up - 150} L-130 ${up - 200} L130 ${up - 200} L210 ${up - 150} Z`, '#d03a34'), path(`M-210 ${up - 150} L-130 ${up - 200} L-100 ${up - 200} L-170 ${up - 150} Z`, '#9a2a30'));
  out.push(rect(-60, up - 270, 120, 72, '#f0e2da'), rect(-60, up - 270, 30, 72, '#c9b0b4'), rect(-66, up - 278, 132, 12, '#d03a34'));
  out.push(rect(-12, up - 360, 24, 84, '#d03a34'), rect(-12, up - 360, 8, 84, '#ff8a70'));
  return tr(50, 216, out.join(''), 0.1);
});
// 展望台のまわりのバルコニー（乗れる足場。はば80）
sprite(SH, 's7/deck', 84, 9, 2, 0, () => tr(2, 0, [
  rect(0, 0, 800, 48, '#9a2a30'), rect(0, 12, 800, 30, '#d8403a'), rect(0, 36, 800, 6, '#ff8a70', { opacity: 0.6 }),
  rect(0, 0, 800, 16, '#fff3e4'), rect(0, 0, 800, 5, '#ffffff'),
  rect(0, 48, 800, 20, '#1e1230', { opacity: 0.3 }),
  ...[40, 200, 360, 440, 600, 760].map(x => rect(x - 4, 16, 8, 26, '#9a2a30'))
], 0.1));
// タワーの中の足場（赤い鉄のはり。上が明るい）
sprite(SH, 's7/beam', 16, 7, 0, 0, () => tr(0, 0, [
  rect(0, 0, 160, 60, '#8e2430'),
  rect(0, 14, 160, 30, '#d23e36'),
  path('M8 16 L40 40 L72 16 Z M88 16 L120 40 L152 16 Z', '#7a1e2c'),
  rect(0, 42, 160, 10, '#7a1e2c'), rect(0, 42, 160, 3, '#ff8a70', { opacity: 0.5 }),
  rect(0, 0, 160, 15, '#fff0dc'), rect(0, 0, 160, 5, '#ffffff'),
  rect(0, 52, 160, 14, '#1e1230', { opacity: 0.3 })
], 0.1));

// ---------- オレンジのクレーン（左にのびた腕からコンテナをつる） ----------
sprite(SH, 's7/crane', 186, 208, 74, 206, () => {
  const O = '#f08a2e', Od = '#b85e1c', Ol = '#ffb86c', Rim = '#ffd8a4';
  const out = [];
  const leg = (xb, xt) => [
    path(`M${xb - 24} 0 L${xb + 24} 0 L${xt + 22} -1500 L${xt - 22} -1500 Z`, O),
    path(`M${xb - 24} 0 L${xb - 8} 0 L${xt - 6} -1500 L${xt - 22} -1500 Z`, Od),
    path(`M${xb + 12} 0 L${xb + 24} 0 L${xt + 22} -1500 L${xt + 12} -1500 Z`, Rim, { opacity: 0.8 })
  ].join('');
  const xl = y => 40 + (160 - 40) * (-y / 1500), xr = y => 540 - (540 - 420) * (-y / 1500);
  // すじかい（ななめだけ）
  for (const [ya, yb] of [[-60, -540], [-540, -1020], [-1020, -1480]]) {
    out.push(path(`M${xl(ya)} ${ya} L${xr(yb)} ${yb} M${xr(ya)} ${ya} L${xl(yb)} ${yb}`, 'none', st(Od, 14)));
  }
  out.push(leg(40, 160), leg(540, 420));
  // 車輪
  for (const x of [40, 540]) out.push(rrect(x - 70, -54, 140, 54, 10, '#3e3850'), circ(x - 38, -12, 14, '#221e2c'), circ(x + 38, -12, 14, '#221e2c'), rect(x - 70, -54, 140, 10, '#6a6480'));
  // 台と機械室
  out.push(rect(-30, -1560, 640, 70, Od), rect(-30, -1560, 640, 20, Ol));
  out.push(rect(0, -1780, 600, 230, O), rect(0, -1780, 120, 230, Od), rect(560, -1780, 40, 230, Rim, { opacity: 0.7 }), rect(-10, -1800, 620, 30, Ol));
  for (let i = 0; i < 5; i++) out.push(rect(170 + i * 76, -1740, 44, 130, Od, { opacity: 0.8 }));
  // 運転室（左）
  out.push(rect(-150, -1720, 150, 150, '#e6e0ea'), rect(-150, -1720, 150, 20, '#ffffff'), rect(-130, -1690, 110, 70, '#ffd6a8'), path('M-126 -1686 L-86 -1686 L-126 -1636 Z', '#ffffff', { opacity: 0.6 }));
  // A形のやぐら
  out.push(path('M60 -1790 L270 -2010 L300 -2010 L110 -1790 Z', O), path('M500 -1790 L300 -2010 L270 -2010 L450 -1790 Z', Od));
  out.push(rect(240, -2030, 90, 30, Od));
  // うで（トラス）
  const tipX = -660, tipY = -1870;
  out.push(path(`M60 -1720 L${tipX} ${tipY + 10} L${tipX} ${tipY + 40} L60 -1620 Z`, 'none'));
  out.push(path(`M60 -1735 L${tipX} ${tipY}`, 'none', st(O, 22)), path(`M60 -1625 L${tipX} ${tipY + 40}`, 'none', st(Od, 18)));
  for (let k = 0; k < 14; k++) {
    const u0 = k / 14, u1 = (k + 1) / 14;
    const ax = 60 + (tipX - 60) * u0, bx = 60 + (tipX - 60) * u1;
    const ay0 = -1735 + (tipY + 1735) * u0, by1 = -1625 + (tipY + 40 + 1625) * u1;
    out.push(path(`M${ax} ${ay0} L${bx} ${by1}`, 'none', st(Od, 8)));
  }
  out.push(path(`M60 -1741 L${tipX} ${tipY - 6}`, 'none', st(Ol, 7)));
  out.push(rect(tipX - 30, tipY - 20, 60, 70, Od), circ(tipX, tipY + 20, 22, '#3e3850'));
  // うしろのうでとおもり
  out.push(path('M600 -1740 L1060 -1790', 'none', st(O, 20)), path('M600 -1660 L1060 -1700', 'none', st(Od, 14)));
  for (let k = 0; k < 6; k++) out.push(path(`M${600 + k * 76} ${-1740 - k * 8} L${676 + k * 76} ${-1668 - k * 7}`, 'none', st(Od, 7)));
  out.push(rect(880, -1880, 200, 170, '#8e8898'), rect(880, -1880, 200, 24, '#b8b2c2'), rect(880, -1880, 40, 170, '#6e6878'));
  // つりワイヤー
  out.push(path(`M285 -2020 L${tipX} ${tipY - 10} M285 -2020 L1040 -1800`, 'none', { stroke: '#3a3048', strokeWidth: 5 }));
  return tr(74, 206, out.join(''), 0.1);
});
// つられたコンテナ（フックの先が基準）
sprite(SH, 's7/hangbox', 46, 30, 23, 1, () => tr(23, 1, [
  path('M0 60 L-190 150 M0 60 L190 150', 'none', { stroke: '#2e2838', strokeWidth: 5 }),
  rrect(-40, 0, 80, 56, 8, '#3a3448'), rect(-40, 16, 80, 12, '#f2c230'), path('M0 56 Q-14 70 0 80', 'none', st('#2e2838', 7)),
  rect(-210, 146, 420, 14, '#3a3448'),
  cont(-210, 160, 420, 128, { base: '#3a6fc0', light: '#5e92dc', dark: '#274f94', top: '#bcd4f4', corner: '#1d3a70', bar: '#9ab8e4' }, { doors: 'R', label: true })
], 0.1));

// ---------- コンテナ（青・赤）と木箱 ----------
const CB = { base: '#3468b8', light: '#5b8fd8', dark: '#244c8e', top: '#c4dcff', corner: '#18336a', bar: '#9cbbe8' };
const CR = { base: '#d4473c', light: '#ef7466', dark: '#9e2e28', top: '#ffd2c4', corner: '#6e1c1c', bar: '#f3aea2' };
function cont(x, y, w, h, p, o = {}) {
  const out = [rect(x, y, w, h, p.base)];
  for (let xx = x + 26; xx < x + w - 30; xx += 24) out.push(rect(xx, y + 14, 10, h - 28, p.light, { opacity: 0.55 }), rect(xx + 10, y + 14, 7, h - 28, p.dark, { opacity: 0.55 }));
  out.push(rect(x, y + h - 16, w, 16, p.dark), rect(x, y, w, 16, p.dark), rect(x, y, w, 8, p.top));
  out.push(rect(x, y, 16, h, p.dark), rect(x + w - 16, y, 16, h, p.dark));
  for (const cx of [x + 2, x + w - 14]) for (const cy of [y + 2, y + h - 12]) out.push(rect(cx, cy, 12, 10, p.corner));
  if (o.doors) {
    const dx = o.doors === 'R' ? x + w - 16 - 110 : x + 16;
    out.push(rect(dx, y + 16, 110, h - 32, p.base), rect(dx + 54, y + 16, 3, h - 32, p.dark));
    for (const bx of [dx + 14, dx + 38, dx + 70, dx + 94]) out.push(rect(bx, y + 18, 5, h - 36, p.bar), rect(bx - 3, y + h * 0.55, 11, 6, p.bar));
  }
  if (o.label && w > 300) out.push(rrect(x + w * 0.3, y + h * 0.32, w * 0.22, h * 0.2, 4, '#ffffff', { opacity: 0.85 }), rect(x + w * 0.33, y + h * 0.39, w * 0.16, h * 0.06, p.dark, { opacity: 0.8 }));
  out.push(rect(x, y + h * 0.5, w, h * 0.5, '#1a1030', { opacity: 0.12 }));
  return out.join('');
}
function crate(x, y, w, h) {
  const out = [rect(x, y, w, h, '#7a4a2a'), rect(x + 14, y + 14, w - 28, h - 28, '#c68a50')];
  const n = Math.max(2, Math.round((h - 28) / 50));
  for (let i = 1; i < n; i++) out.push(rect(x + 14, y + 14 + (h - 28) * i / n - 2, w - 28, 5, '#8a5a32', { opacity: 0.8 }));
  out.push(path(`M${x + 14} ${y + h - 14} L${x + w - 14} ${y + 14}`, 'none', { stroke: '#8f5e34', strokeWidth: 22 }), path(`M${x + 14} ${y + h - 18} L${x + w - 18} ${y + 14}`, 'none', { stroke: '#dca36a', strokeWidth: 6 }));
  out.push(rect(x, y, w, 14, '#9a6438'), rect(x, y, w, 6, '#f2c48c'), rect(x, y, 14, h, '#8a5530'), rect(x + w - 14, y, 14, h, '#6a4024'));
  out.push(circ(x + 7, y + 7, 3, '#4a2e1a'), circ(x + w - 7, y + 7, 3, '#4a2e1a'), circ(x + 7, y + h - 7, 3, '#4a2e1a'), circ(x + w - 7, y + h - 7, 3, '#4a2e1a'));
  out.push(rect(x, y + h * 0.5, w, h * 0.5, '#1a1030', { opacity: 0.12 }));
  return out.join('');
}
const stackEdge = (W, H) => [rect(0, 0, W, 5, '#ffffff', { opacity: 0.7 }), rect(1.5, 1.5, W - 3, H - 3, 'none', { stroke: '#1e1834', strokeWidth: 3, opacity: 0.55 })].join('');
sprite(SH, 's7/stackA', 96, 48, 0, 48, () => tr(0, 0, [
  cont(0, 0, 960, 240, CB, { doors: 'R', label: true }), cont(0, 240, 560, 240, CR, { doors: 'L' }), crate(560, 240, 400, 240), stackEdge(960, 480)
], 0.1));
sprite(SH, 's7/stackB', 112, 64, 0, 64, () => tr(0, 0, [
  cont(0, 0, 720, 320, CR, { doors: 'L', label: true }), crate(720, 0, 400, 320),
  cont(0, 320, 560, 320, CB, { doors: 'L' }), cont(560, 320, 560, 320, CR, { doors: 'R' }), stackEdge(1120, 640)
], 0.1));
sprite(SH, 's7/stackC', 96, 32, 0, 32, () => tr(0, 0, [
  cont(0, 0, 600, 320, CB, { doors: 'R', label: true }), crate(600, 0, 360, 320), stackEdge(960, 320)
], 0.1));

// ---------- レンガ倉庫（ステージのはじめ。アーチの窓に灯り） ----------
function brickWall(x, y, w, h, c, m, rw = 64, rh = 22) {
  const out = [rect(x, y, w, h, m)];
  for (let row = 0, yy = y; yy < y + h; row++, yy += rh) {
    for (let xx = x - (row % 2 ? rw / 2 : 0); xx < x + w; xx += rw) {
      const x0 = Math.max(x, xx + 2.5), x1 = Math.min(x + w, xx + rw - 2.5);
      if (x1 - x0 > 5) out.push(rect(x0, yy + 2.5, x1 - x0, Math.min(rh - 5, y + h - yy - 2.5), (row * 5 + Math.floor(xx / rw)) % 7 === 0 ? shade(c, -0.12) : (row + Math.floor(xx / rw)) % 4 === 0 ? shade(c, 0.1) : c));
    }
  }
  return out.join('');
}
function archWin(x, y, w, h, o) {
  const r = w / 2, out = [];
  out.push(path(`M${x - 16} ${y + h + 10} L${x - 16} ${y + r} A${r + 16} ${r + 16} 0 0 1 ${x + w + 16} ${y + r} L${x + w + 16} ${y + h + 10} Z`, o.frame));
  out.push(path(`M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z`, o.glass));
  out.push(rect(x + w / 2 - 4, y, 8, h, o.bar), rect(x, y + r + (h - r) * 0.45, w, 7, o.bar));
  out.push(path(`M${x + w * 0.2} ${y + r * 0.9} L${x + w * 0.45} ${y + r * 0.4} L${x + w * 0.2} ${y + r + 40} Z`, '#ffffff', { opacity: 0.35 }));
  out.push(rect(x - 24, y + h + 8, w + 48, 16, o.sill), rect(x - 24, y + h + 8, w + 48, 5, '#fff3e4', { opacity: 0.6 }));
  // かなめ石
  out.push(path(`M${x + w / 2 - 14} ${y - 16} L${x + w / 2 + 14} ${y - 16} L${x + w / 2 + 9} ${y + 8} L${x + w / 2 - 9} ${y + 8} Z`, o.key));
  return out.join('');
}
sprite(SH, 's7/soko', 106, 112, 2, 110, defs => {
  const out = [];
  const glass = defs.lin([[0, '#fff2c4'], [0.6, '#ffd07a'], [1, '#f2a24e']]);
  // 屋根の下の三角のかべ
  out.push(path('M0 -700 L480 -960 L960 -700 Z', '#9c4a34'));
  out.push(brickWall(0, -700, 960, 700, '#b95c3e', '#85402e'));
  out.push(g(brickWall(0, -980, 960, 290, '#a9533a', '#7a3a2a'), { 'clip-path': defs.clip('<path d="M0 -700 L480 -960 L960 -700 Z"/>') }));
  // 角の石
  for (let y = -690; y < -80; y += 60) for (const x of [0, 916]) out.push(rect(x + (y / 60 % 2 ? 0 : 6), y, 44 - (y / 60 % 2 ? 0 : 6), 26, '#dcc6b4'), rect(x, y + 26, 44, 4, '#8a5a48', { opacity: 0.4 }));
  // 丸い窓
  out.push(circ(480, -820, 58, '#dcc6b4'), circ(480, -820, 44, glass), path('M436 -820 L524 -820 M480 -864 L480 -776', 'none', st('#6a3a2c', 6)));
  // アーチの窓（2つ・灯り）
  for (const x of [520, 730]) out.push(archWin(x, -620, 130, 250, { frame: '#e2cdb8', glass, bar: '#6a3a2c', sill: '#c9ae98', key: '#f0dcc8' }));
  // 大きな扉
  out.push(path('M90 -60 L90 -370 A170 170 0 0 1 430 -370 L430 -60 Z', '#e2cdb8'));
  out.push(path('M112 -60 L112 -366 A148 148 0 0 1 408 -366 L408 -60 Z', '#4e566e'));
  for (let x = 140; x < 400; x += 40) out.push(rect(x, -470, 6, 410, '#3a4058'));
  out.push(rect(256, -500, 8, 440, '#2c3046'), rect(112, -250, 296, 8, '#3a4058'), circ(240, -220, 7, '#c9b08a'), circ(280, -220, 7, '#c9b08a'));
  out.push(path('M130 -380 L230 -470 L230 -440 L130 -350 Z', '#ffffff', { opacity: 0.1 }));
  // 1階の小さい窓
  out.push(archWin(560, -250, 90, 150, { frame: '#e2cdb8', glass, bar: '#6a3a2c', sill: '#c9ae98', key: '#f0dcc8' }), archWin(770, -250, 90, 150, { frame: '#e2cdb8', glass, bar: '#6a3a2c', sill: '#c9ae98', key: '#f0dcc8' }));
  // 石の土台
  out.push(rect(0, -60, 960, 60, '#8a7c88'), rect(0, -60, 960, 10, '#c4b4bc'));
  // 屋根（青みどり）
  out.push(path('M-50 -690 L480 -1000 L1010 -690 L1010 -660 L480 -968 L-50 -660 Z', '#2e4e56'));
  out.push(path('M-50 -690 L480 -1000 L1010 -690 L960 -690 L480 -972 L0 -690 Z', '#447176'));
  for (let k = 1; k < 7; k++) { const t = k / 7; out.push(path(`M${480 - 530 * t} ${-1000 + 310 * t} L${480 - 480 * t} ${-972 + 282 * t}`, 'none', st('#2e4e56', 5, { opacity: 0.6 })), path(`M${480 + 530 * t} ${-1000 + 310 * t} L${480 + 480 * t} ${-972 + 282 * t}`, 'none', st('#2e4e56', 5, { opacity: 0.6 }))); }
  out.push(path('M-50 -690 L480 -1000 L1010 -690', 'none', st('#8ab8b4', 7, { opacity: 0.8 })));
  out.push(path('M480 -1000 L1010 -690', 'none', st('#ffc8a0', 5, { opacity: 0.6 })));
  // 右がわに夕日
  out.push(path('M0 0 L0 -700 L480 -960 L960 -700 L960 0 Z', defs.lin([[0, '#2a1440', 0.18], [0.5, '#2a1440', 0], [1, '#ffb080', 0.12]], 0, 0, 1, 0)));
  return tr(2, 110, out.join(''), 0.1);
});

// ---------- 昔ふうの街灯（黒い柱・あたたかい灯り） ----------
sprite(SH, 's7/lamp', 20, 58, 10, 57, defs => tr(10, 57, [
  path('M-54 0 L54 0 L42 -36 L22 -54 L22 -74 L-22 -74 L-22 -54 L-42 -36 Z', '#24202e'),
  path('M-54 0 L-36 0 L-28 -36 L-14 -54 L-14 -74 L-22 -74 L-22 -54 L-42 -36 Z', '#4a4458'),
  rect(-13, -420, 26, 350, '#27232f'), rect(-9, -420, 7, 350, '#57516a'), rect(6, -420, 4, 350, '#e9a27e', { opacity: 0.35 }),
  rrect(-22, -150, 44, 20, 5, '#24202e'), rrect(-20, -420, 40, 18, 5, '#24202e'),
  path('M-13 -428 Q-46 -440 -40 -470 M13 -428 Q46 -440 40 -470', 'none', st('#24202e', 7)),
  rrect(-26, -452, 52, 26, 6, '#24202e'),
  path('M-38 -458 L38 -458 L30 -540 L-30 -540 Z', defs.lin([[0, '#fff8d8'], [0.5, '#ffe29a'], [1, '#ffbd62']])),
  path('M-38 -458 L38 -458 L30 -540 L-30 -540 Z', 'none', { stroke: '#24202e', strokeWidth: 7 }),
  path('M0 -540 L0 -458', 'none', st('#6a4a3a', 4, { opacity: 0.5 })),
  path('M-50 -538 L50 -538 L0 -590 Z', '#24202e'), path('M-50 -538 L-30 -538 L0 -590 Z', '#4a4458'),
  circ(0, -598, 9, '#24202e')
], 0.1));

// ---------- ビット（船をつなぐ黒い柱） ----------
sprite(SH, 's7/bollard', 14, 10, 7, 9, () => tr(7, 9, [
  rrect(-60, -16, 120, 16, 4, '#2a2632'),
  path('M-32 -16 L-28 -52 L28 -52 L32 -16 Z', '#24212c'), path('M-32 -16 L-28 -52 L-14 -52 L-16 -16 Z', '#46405a'),
  ell(0, -58, 46, 15, '#2e2a38'), ell(-10, -63, 24, 6, '#6e6884'), path('M30 -52 L32 -16', 'none', st('#f0a884', 4, { opacity: 0.6 }))
], 0.1));

// ---------- 岸壁のはしご ----------
sprite(SH, 's7/ladder', 14, 40, 7, 6, () => tr(7, 6, [
  path('M-40 20 L-40 -40 Q-40 -56 -24 -56 L24 -56 Q40 -56 40 -40 L40 20', 'none', st('#2c283a', 10)),
  rect(-46, 0, 12, 340, '#2c283a'), rect(34, 0, 12, 340, '#2c283a'), rect(-44, 0, 4, 340, '#5c566e'), rect(36, 0, 4, 340, '#5c566e'),
  ...[40, 90, 140, 190, 240, 290].map(y => rect(-36, y, 72, 8, '#2c283a')),
  ...[40, 90, 140, 190, 240, 290].map(y => rect(-36, y, 72, 2.5, '#6a6480'))
], 0.1));

// ---------- BE KOBE の台（文字はゲームの中で描く） ----------
sprite(SH, 's7/bekobe', 92, 12, 6, 11, () => tr(6, 11, [
  rrect(-40, -70, 880, 70, 8, '#8e8298'), rrect(-40, -70, 880, 18, 6, '#e8dce0'), rect(-40, -20, 880, 20, '#6e6278'),
  rect(-40, -52, 880, 3, '#ffffff', { opacity: 0.4 }),
  ...[80, 400, 720].map(x => [ell(x, -76, 40, 10, '#3f7a4a'), ell(x - 10, -80, 20, 5, '#6aa870')].join(''))
], 0.1));

// ---------- 客船（背景の海をゆっくり進む。水面が基準） ----------
sprite(SH, 's7/cruise', 100, 34, 50, 30, () => {
  const out = [];
  out.push(path('M-500 0 L420 0 Q480 -40 522 -128 L-490 -128 Q-506 -60 -500 0 Z', '#f2ecf4'));
  out.push(path('M-500 0 L420 0 Q450 -20 470 -44 L-503 -44 Q-503 -20 -500 0 Z', '#2e3c7c'));
  out.push(rect(-496, -62, 980, 8, '#4a78c8'));
  for (let i = 0; i < 20; i++) out.push(circ(-440 + i * 44, -92, 7, '#ffd98a', { opacity: i % 3 ? 0.9 : 0.5 }));
  out.push(rect(-440, -206, 840, 80, '#f6f0f6'), rect(-440, -206, 840, 8, '#ffffff'), rect(-440, -140, 840, 10, '#d8cce0'));
  for (let i = 0; i < 26; i++) out.push(rect(-420 + i * 31, -188, 20, 26, i % 4 === 1 ? '#a89cc8' : '#ffdc92'));
  out.push(rect(-380, -270, 660, 66, '#f6f0f6'), rect(-380, -270, 660, 8, '#ffffff'));
  for (let i = 0; i < 20; i++) out.push(rect(-362 + i * 32, -254, 20, 24, i % 5 === 2 ? '#a89cc8' : '#ffe6a8'));
  out.push(path('M280 -270 L360 -270 L400 -206 L280 -206 Z', '#f6f0f6'), path('M300 -258 L352 -258 L378 -218 L300 -218 Z', '#3a4a7a'));
  out.push(rect(-250, -324, 380, 56, '#f6f0f6'));
  for (let i = 0; i < 11; i++) out.push(rect(-236 + i * 33, -312, 20, 20, '#ffe6a8'));
  out.push(path('M-160 -330 L-150 -410 L-60 -410 L-50 -330 Z', '#2e3c7c'), rect(-156, -396, 100, 22, '#e0443a'));
  out.push(rect(150, -420, 8, 100, '#8a809a'), rect(110, -400, 90, 5, '#8a809a'), circ(154, -424, 7, '#ff6a5a'));
  out.push(path('M-500 0 L-503 -128 L-440 -128 L-440 -206 L-380 -206 L-380 -128', 'none'));
  out.push(rect(-505, -330, 300, 330, '#3a2a6a', { opacity: 0.12 }));
  out.push(path('M470 -44 Q500 -80 522 -128', 'none', st('#ffc8a0', 6, { opacity: 0.7 })));
  return tr(50, 30, out.join(''), 0.095);
});

// ---------- 観覧車（ハーバーランドのモザイク。回る輪とささえ） ----------
sprite(SH, 's7/wheel', 162, 162, 81, 81, () => {
  const out = [];
  const R = 720, R2 = 652;
  const cols = ['#ff6a8a', '#ffb45a', '#ffe36a', '#7ae08a', '#6ac8ff', '#a88aff'];
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * TAU, c = Math.cos(a), s = Math.sin(a);
    out.push(path(`M${f(c * 60)} ${f(s * 60)} L${f(c * R2)} ${f(s * R2)}`, 'none', { stroke: '#e8e2f2', strokeWidth: 7, opacity: 0.9 }));
  }
  out.push(circ(0, 0, R, 'none', { stroke: '#f6f2fa', strokeWidth: 22 }), circ(0, 0, R2, 'none', { stroke: '#e2dcee', strokeWidth: 12 }));
  const zz = [];
  for (let k = 0; k < 72; k++) { const a0 = k / 72 * TAU, a1 = (k + 0.5) / 72 * TAU; zz.push(`M${f(Math.cos(a0) * R2)} ${f(Math.sin(a0) * R2)} L${f(Math.cos(a1) * R)} ${f(Math.sin(a1) * R)}`); }
  out.push(path(zz.join(' '), 'none', { stroke: '#d6d0e6', strokeWidth: 5 }));
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * TAU, c = Math.cos(a), s = Math.sin(a);
    for (const [i, rr] of [180, 290, 400, 510, 610].entries()) out.push(circ(c * rr, s * rr, 11, cols[(k + i) % cols.length]));
  }
  out.push(circ(0, 0, 86, '#e8e2f2'), circ(0, 0, 56, '#ffd98a'), circ(0, 0, 26, '#ff8fa3'));
  return tr(81, 81, out.join(''), 0.1);
});
sprite(SH, 's7/wheelLegs', 112, 118, 56, 4, () => {
  const out = [];
  for (const s of [-1, 1]) {
    out.push(path(`M${s * 20} 0 L${s * 520} 1120 L${s * 440} 1120 Z`, '#d9d2e6'), path(`M${s * 20} 0 L${s * 470} 1120 L${s * 440} 1120 Z`, '#9d94b8'));
    for (let k = 1; k < 6; k++) { const t = k / 6; out.push(path(`M${s * (20 + 450 * t)} ${1120 * t} L${s * (20 + 480 * (t + 0.08))} ${1120 * (t + 0.08)}`, 'none', st('#b8b0cc', 8))); }
  }
  out.push(rect(-230, 560, 460, 18, '#c8c0da'), rect(-160, 280, 320, 14, '#c8c0da'));
  out.push(rrect(-540, 1040, 1080, 90, 10, '#4a3f6e'), rect(-540, 1040, 1080, 16, '#8a7eb0'));
  for (let i = 0; i < 7; i++) out.push(rect(-500 + i * 145, 1072, 80, 40, '#ffd98a', { opacity: 0.85 }));
  return tr(56, 4, out.join(''), 0.1);
});

// ---------- ハーバーランドのレンガ倉庫（乗れるかべの見た目。176×128） ----------
sprite(SH, 's7/renga', 176, 128, 0, 128, defs => {
  const W = 1760, out = [];
  const glass = defs.lin([[0, '#fff0c0'], [0.6, '#ffcf78'], [1, '#f09a4a']]);
  const inside = defs.lin([[0, '#ffdca0'], [1, '#e89048']]);
  out.push(brickWall(0, -1200, W, 1200, '#a24a36', '#6a2c22', 70, 24));
  // 柱
  for (const x of [0, 575, 1115, 1690]) {
    out.push(rect(x, -1200, 70, 1200, '#8e3e2e'), rect(x + 6, -1200, 12, 1200, '#c06a50', { opacity: 0.5 }));
    for (let y = -1180; y < -60; y += 90) out.push(rect(x + (Math.floor(y / 90) % 2 ? 0 : 10), y, 60, 36, '#d8b8a4'));
  }
  // 2階の窓
  for (const x of [120, 350, 690, 900, 1235, 1465]) out.push(archWin(x, -1110, 130, 300, { frame: '#e0c6b0', glass, bar: '#5a2c22', sill: '#c4a690', key: '#f2dcc6' }));
  // 間の帯
  out.push(rect(0, -690, W, 44, '#c9a894'), rect(0, -690, W, 10, '#f2dcc6'), rect(0, -646, W, 10, '#000000', { opacity: 0.2 }));
  // 1階：大きなアーチの入口（レストランの灯り）
  for (const x of [150, 690, 1230]) {
    out.push(path(`M${x - 24} -40 L${x - 24} ${-420} A${174} ${174} 0 0 1 ${x + 324} ${-420} L${x + 324} -40 Z`, '#e0c6b0'));
    out.push(path(`M${x} -40 L${x} -420 A150 150 0 0 1 ${x + 300} -420 L${x + 300} -40 Z`, inside));
    out.push(rect(x, -160, 300, 120, '#5a2c22', { opacity: 0.45 }));
    for (const px of [x + 70, x + 230]) out.push(path(`M${px} -560 L${px} -470`, 'none', st('#4a2a20', 4)), path(`M${px - 30} -440 Q${px} -490 ${px + 30} -440 Z`, '#3a2a28'), circ(px, -436, 12, '#fff4c8'));
    out.push(rect(x + 40, -200, 80, 10, '#6a3a2a'), rect(x + 180, -200, 80, 10, '#6a3a2a'), rect(x + 76, -190, 8, 60, '#6a3a2a'), rect(x + 216, -190, 8, 60, '#6a3a2a'));
    out.push(rect(x + 147, -570, 6, 530, '#5a2c22'), rect(x, -300, 300, 6, '#5a2c22'));
  }
  // 看板（文字はゲームで描く）
  out.push(rrect(720, -800, 320, 96, 10, '#20382e'), rrect(730, -790, 300, 76, 7, '#2e5242'), rrect(738, -782, 284, 60, 5, 'none', { stroke: '#e6c27a', strokeWidth: 4 }));
  // てっぺん（歩ける）：石の軒と電球のひも
  out.push(rect(0, -1280, W, 84, '#6e4a40'), rect(0, -1280, W, 72, '#dcc2ac'), rect(0, -1280, W, 26, '#fff0dc'), rect(0, -1254, W, 6, '#f2d4b8'));
  for (let x = 20; x < W; x += 60) out.push(rect(x, -1196, 30, 22, '#7a4a3a'));
  out.push(rect(0, -1174, W, 14, '#000000', { opacity: 0.25 }));
  const bulbs = ['#fff0a8', '#ffb0c8', '#a8e0ff', '#ffd27a'];
  for (let x0 = 0; x0 < W; x0 += 220) {
    out.push(path(`M${x0} -1160 Q${x0 + 110} -1100 ${x0 + 220} -1160`, 'none', { stroke: '#3a2420', strokeWidth: 3 }));
    for (let k = 1; k < 6; k++) { const u = k / 6, y = -1160 + 4 * 30 * u * (1 - u) * 1.0; out.push(circ(x0 + 220 * u, y + 8, 9, bulbs[(k + x0 / 220) % 4])); }
  }
  // 石の土台
  out.push(rect(0, -44, W, 44, '#6a5c6e'), rect(0, -44, W, 8, '#a898ac'));
  // 左がわはかげ、右は灯り
  out.push(rect(0, -1200, W, 1200, defs.lin([[0, '#1a0c2a', 0.25], [0.3, '#1a0c2a', 0], [1, '#1a0c2a', 0.1]], 0, 0, 1, 0)));
  out.push(rect(2, -1278, W - 4, 1276, 'none', { stroke: '#1e1834', strokeWidth: 4, opacity: 0.6 }));
  return tr(0, 128, out.join(''), 0.1);
});
