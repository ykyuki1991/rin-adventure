// ステージ9「舞子・明石海峡大橋」
// 舞子（maiko）：舞子の松・移情閣・旧武藤山治邸・海ぞいの遊歩道・うしろに大きな明石海峡大橋と淡路島
// 橋の上（bridge）：午後の空・かすむ淡路島・海峡の船、地面は補剛トラス（しっかりした鉄の箱）・主塔・主ケーブル・点検通路
// 飾り（シート s9）：移情閣・武藤邸・松・街灯・主塔・船
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from '../svg.mjs';
import { wrap } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile } from '../tiles.mjs';
import { TAU, st, G, win, board, inside, cloverBlob, clover } from '../kit.mjs';
import { puff, tower, blackPine } from './08_suma.mjs';

resetTheme('maiko');
resetTheme('bridge');
const SH = 's9';

// ========================================================================
// 共通：明石海峡大橋（背景用）
// ========================================================================
// 主塔（正面から見た2本の脚と X のすじかい）。x: 中心、top: てっぺん、foot: 海面、w: 幅
function bigTower(x, top, foot, w, c) {
  const out = [];
  const lw = w * 0.26, h = foot - top;
  const legL = x - w / 2, legR = x + w / 2 - lw;
  // すじかい
  const tiers = 6;
  for (let k = 0; k < tiers; k++) {
    const y0 = top + h * 0.06 + k * (h * 0.78 / tiers), y1 = y0 + h * 0.78 / tiers;
    out.push(path(`M${legL + lw} ${y0} L${legR} ${y1} M${legR} ${y0} L${legL + lw} ${y1}`, 'none', st(c.brace, w * 0.07)));
    out.push(rect(legL + lw, y0 - w * 0.03, legR - legL - lw, w * 0.07, c.brace));
  }
  // 脚
  for (const lx of [legL, legR]) out.push(rect(lx, top, lw, h, c.leg), rect(lx, top, lw * 0.35, h, c.hi, { opacity: 0.8 }), rect(lx + lw * 0.72, top, lw * 0.28, h, c.shade));
  // てっぺん（サドル）と航空障害灯
  out.push(rrect(x - w * 0.62, top - w * 0.18, w * 1.24, w * 0.3, w * 0.08, c.leg), rect(x - w * 0.62, top - w * 0.18, w * 1.24, w * 0.08, c.hi));
  out.push(circ(x - w * 0.5, top - w * 0.24, w * 0.07, '#e0443a'), circ(x + w * 0.5, top - w * 0.24, w * 0.07, '#e0443a'));
  // 足もと（ケーソン）
  out.push(ell(x, foot, w * 1.3, w * 0.22, c.base), rect(x - w * 1.3, foot - w * 0.3, w * 2.6, w * 0.3, c.base), ell(x, foot - w * 0.3, w * 1.3, w * 0.2, shade(c.base, 0.15)));
  return out.join('');
}
// 橋ぜんたい（横から）。t1,t2: 主塔の x、deck: 道路の高さ、top: 塔のてっぺん、foot: 海面
function bigBridge(t1, t2, deck, top, foot, w, c, o = {}) {
  const out = [];
  const side = (t2 - t1) * 0.5;
  const sag = deck - 10;
  const cable = (dy) => `M${t1 - side} ${deck + dy} Q${t1 - side * 0.5} ${top + (deck - top) * 0.55 + dy} ${t1} ${top + dy} Q${(t1 + t2) / 2} ${sag + (sag - top) + dy} ${t2} ${top + dy} Q${t2 + side * 0.5} ${top + (deck - top) * 0.55 + dy} ${t2 + side} ${deck + dy}`;
  const cy = (x) => {
    if (x < t1) { const u = (x - (t1 - side)) / side; const p0 = deck, p1 = top + (deck - top) * 0.55, p2 = top; return (1 - u) ** 2 * p0 + 2 * (1 - u) * u * p1 + u * u * p2; }
    if (x > t2) { const u = (x - t2) / side; const p0 = top, p1 = top + (deck - top) * 0.55, p2 = deck; return (1 - u) ** 2 * p0 + 2 * (1 - u) * u * p1 + u * u * p2; }
    const u = (x - t1) / (t2 - t1); const p0 = top, p1 = sag + (sag - top), p2 = top; return (1 - u) ** 2 * p0 + 2 * (1 - u) * u * p1 + u * u * p2;
  };
  // ハンガー（たて糸）
  const step = o.step || 7;
  for (let x = t1 - side + step; x < t2 + side; x += step) {
    if (Math.abs(x - t1) < w * 0.6 || Math.abs(x - t2) < w * 0.6) continue;
    const y = cy(x);
    out.push(rect(x - 0.25, y, 0.5, deck - y, c.hanger, { opacity: 0.8 }));
  }
  // 主塔（道路より後ろの部分から）
  out.push(bigTower(t1, top, foot, w, c), bigTower(t2, top, foot, w, c));
  // 道路（補剛トラス）
  const dh = o.deckH || 7;
  out.push(rect(t1 - side - 40, deck, t2 - t1 + side * 2 + 80, dh, c.truss));
  for (let x = t1 - side - 40; x < t2 + side + 40; x += dh) out.push(path(`M${x} ${deck + dh - 0.8} L${x + dh / 2} ${deck + 1.2} L${x + dh} ${deck + dh - 0.8}`, 'none', st(c.trussLine, 0.5, { opacity: 0.9 })));
  out.push(rect(t1 - side - 40, deck - 1, t2 - t1 + side * 2 + 80, 1.6, c.hi), rect(t1 - side - 40, deck + dh - 1, t2 - t1 + side * 2 + 80, 1, c.shade));
  // 主ケーブル
  out.push(path(cable(0), 'none', st(c.cable, o.cableW || 2)), path(cable(-0.6), 'none', st(c.hi, (o.cableW || 2) * 0.35, { opacity: 0.9 })));
  return out.join('');
}

// ========================================================================
// 舞子（晴れた空・大きな橋）
// ========================================================================
const MH = 150; // 水平線
bgLayer('maiko', { f: 0.02, w: 1400, y: 0, h: 150 }, (defs, w) => {
  const r = rng(9101), out = [];
  for (const [x, y, s] of [[160, 40, 0.8], [620, 30, 1.0], [980, 62, 0.6], [1250, 36, 0.9]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s)));
  for (const [x, y, s] of [[80, 132, 0.6], [760, 128, 0.8]]) out.push(wrap(w, x - 60 * s, 120 * s, xx => tower(xx + 60 * s, y, s, { c: '#f4fafd', sh: '#d6e7f2' })));
  for (let i = 0; i < 5; i++) { const x = r() * w, y = 96 + r() * 20, s = 0.3 + r() * 0.12; out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s, { sh: '#e1edf6' }))); }
  return out.join('');
});
// 淡路島と海
bgLayer('maiko', { f: 0.025, w: 1400, y: 70, h: 170 }, (defs, w) => {
  const r = rng(9201), out = [];
  out.push(rect(0, 70, w, MH - 70, defs.linU([[0, '#e4f4fb', 0], [1, '#eef8fc', 0.85]], 0, 70, 0, MH)));
  const hill = (x0, x1, h, col, seed) => { let d = `M${x0} ${MH}`; for (let x = x0; x <= x1; x += 6) { const u = (x - x0) / (x1 - x0); d += ` L${x} ${f(MH - Math.pow(Math.sin(u * Math.PI), 0.5) * h - Math.sin(u * 19 + seed) * 3 - Math.sin(u * 47 + seed) * 1.2)}`; } return path(d + ` L${x1} ${MH} Z`, col); };
  out.push(hill(180, 1380, 34, '#a9c6d9', 1), hill(240, 900, 22, '#9dbdd1', 4), hill(700, 1300, 18, '#98b9cd', 7));
  for (let i = 0; i < 40; i++) { const x = 220 + r() * 1100; out.push(rect(x, MH - 1.8 - r(), 1 + r() * 2, 1.4, '#e4eef3', { opacity: 0.8 })); }
  out.push(rect(0, MH, w, 240 - MH, defs.linU([[0, '#9bd5ec'], [0.3, '#5fb6e2'], [1, '#2d8ccc']], 0, MH, 0, 240)));
  out.push(rect(0, MH, w, 0.8, '#f4fbff'));
  for (const [y, h, c, o] of [[154, 3, '#c1e8f5', 0.45], [166, 5, '#2b8fcc', 0.15], [182, 4, '#a6dcf0', 0.3]]) out.push(rect(0, y, w, h, c, { opacity: o }));
  for (let i = 0; i < 80; i++) { const y = MH + 2 + Math.pow(r(), 1.5) * 86; out.push(rrect(r() * w, y, 3 + r() * 7 * (1 + (y - MH) / 40), 0.7, 0.35, '#ffffff', { opacity: 0.3 + r() * 0.3 })); }
  return tr(0, -70, out.join(''));
});
// 大きな明石海峡大橋（1本目の主塔が画面の右よりに立つ）
bgLayer('maiko', { f: 0.045, w: 1600, y: 0, h: 240 }, (defs, w) => {
  const c = { leg: '#eef3f3', hi: '#ffffff', shade: '#c3d0d2', brace: '#dbe4e4', base: '#cfd8da', truss: '#dfe7e8', trussLine: '#a9b9bc', cable: '#dfe7ea', hanger: '#c9d5d9' };
  const out = [bigBridge(440, 1380, 150, 14, 190, 22, c, { step: 7, cableW: 2.2 })];
  // ケーソンのまわりの白い波
  for (const x of [440, 1380]) out.push(path(`M${x - 34} 190 q8 -3 16 0 t16 0 t16 0 t16 0`, 'none', st('#ffffff', 1.1, { opacity: 0.8 })));
  // かすみ（道路より下）
  out.push(rect(0, 150, w, 44, defs.linU([[0, '#eaf6fb', 0], [1, '#eaf6fb', 0.4]], 0, 150, 0, 194)));
  return out.join('');
});
// 海ぞいの松林・遊歩道のさく・街灯
bgLayer('maiko', { f: 0.3, w: 1000, y: 96, h: 144 }, (defs, w) => {
  const r = rng(9401), out = [];
  // 近くの海
  out.push(rect(0, 184, w, 56, defs.linU([[0, '#4aa9dc'], [1, '#3a97d0']], 0, 184, 0, 240)));
  for (let i = 0; i < 26; i++) out.push(rrect(r() * w, 186 + r() * 12, 6 + r() * 12, 0.8, 0.4, '#ffffff', { opacity: 0.4 }));
  // 護岸の石
  out.push(rect(0, 196, w, 44, '#cfc8ba'), rect(0, 196, w, 2, '#ece7dc'));
  for (let x = 0; x < w; x += 22) out.push(rect(x, 198, 1, 42, '#b5ae9f'));
  // 松林（遠い・やわらかい色）
  const PC = { col: { trunk: '#8a6a58', trunkL: '#a58876', trunkD: '#6f5446', dark: '#4f8468', base: '#5f9676', mid: '#6ea583', light: '#9fcaa8', needle: '#a9d2b0' } };
  for (let i = 0; i < 9; i++) {
    const x = 50 + i * 112 + r() * 40, s = 0.075 + r() * 0.03;
    out.push(wrap(w, x - 50, 100, xx => tr(xx, 198, blackPine({ h: 900 + r() * 200, lean: (r() < 0.6 ? 1 : -1) * (120 + r() * 160), spread: 300, pads: 5, seed: 20 + i, lite: true, ...PC }), s)));
  }
  // 遊歩道のさく（石の柱とくさり）と街灯（うすく）
  for (let x = 6; x < w; x += 24) out.push(rect(x, 188, 2.4, 9, '#e6e0d4'), rect(x, 188, 2.4, 1, '#ffffff'));
  for (let x = 6; x < w - 6; x += 24) out.push(path(`M${x + 2.4} 190 Q${x + 13} 194 ${x + 24} 190`, 'none', st('#6c6f78', 0.5, { opacity: 0.8 })));
  for (let x = 60; x < w; x += 180) out.push(rect(x, 160, 1.2, 37, '#5a5f6a'), rrect(x - 2, 156, 5.2, 5, 1.5, '#fbf6e4'), rect(x - 2.4, 155, 6, 1.2, '#5a5f6a'), rect(x - 0.8, 153, 2.8, 2, '#5a5f6a'));
  out.push(rect(0, 150, w, 60, defs.linU([[0, '#eaf6fb', 0], [1, '#eaf6fb', 0.25]], 0, 150, 0, 210)));
  return tr(0, -96, out.join(''));
});
// 手前：ぼかした松の枝と草（地面より下だけ）
bgLayer('maiko', { f: 1.35, w: 1200, y: 212, h: 28, fg: true }, (defs, w) => {
  const r = rng(9501), blur = defs.blur(1.4), out = [];
  for (const cx of [140, 700]) {
    const parts = [];
    for (let k = 0; k < 12; k++) { const x = cx + (k - 6) * 10 + r() * 6, y = 245 - r() * 6 - Math.cos((k - 6) / 6 * 1.4) * 7, rr = 8 + r() * 7; parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2c5e36' : '#356c3e', '#4f8a4c'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -212, out.join(''));
});

// ========================================================================
// 橋の上（午後・海と淡路島）
// ========================================================================
const BH = 138; // 水平線
bgLayer('bridge', { f: 0.02, w: 1400, y: 0, h: 150 }, (defs, w) => {
  const r = rng(9601), out = [];
  // 午後の日ざしのにじみ（右上）
  out.push(rect(0, 0, w, 150, defs.radU([[0, '#fff4dc', 0.5], [1, '#fff4dc', 0]], 1080, 40, 260)));
  const warm = '#f7dcc0';
  for (const [x, y, s] of [[140, 44, 0.9], [520, 26, 0.75], [860, 64, 1.0], [1200, 34, 0.7]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s, { sh: '#dcdfe9', warm })));
  for (const [x, y, s] of [[380, 126, 0.8], [1080, 124, 0.7]]) out.push(wrap(w, x - 60 * s, 120 * s, xx => tower(xx + 60 * s, y, s, { c: '#fbf6f0', sh: '#ecd9c9' })));
  for (let i = 0; i < 6; i++) { const x = r() * w, y = 92 + r() * 22, s = 0.28 + r() * 0.12; out.push(wrap(w, x - 44 * s, 88 * s, xx => puff(xx, y, s, { sh: '#ece0d6' }))); }
  return out.join('');
});
bgLayer('bridge', { f: 0.02, w: 1600, y: 70, h: 170 }, (defs, w) => {
  const r = rng(9701), out = [];
  out.push(rect(0, 70, w, BH - 70, defs.linU([[0, '#f6e4cc', 0], [0.6, '#f8dfc0', 0.55], [1, '#fbe2c4', 0.95]], 0, 70, 0, BH)));
  // 本州がわ（左：六甲の山なみと垂水・舞子の町）
  let d = `M0 ${BH}`;
  for (let x = 0; x <= 440; x += 5) { const u = x / 440; d += ` L${x} ${f(BH - 4 - Math.pow(Math.sin((u * 0.9 + 0.1) * Math.PI), 0.7) * 26 - Math.sin(u * 21) * 2.4)}`; }
  out.push(path(d + ` L440 ${BH} Z`, '#b9c7d6'));
  for (let x = 10; x < 400;) { const bw = 2 + r() * 5, bh = 2 + r() * 7; out.push(rect(x, BH - bh, bw, bh, r() < 0.5 ? '#dfe4ea' : '#d2d9e1')); x += bw + r() * 2.5; }
  // 淡路島（大きく・かすむ・ゆるい山）
  const hill = (x0, x1, h, col, seed, e = 0.55) => { let dd = `M${x0} ${BH}`; for (let x = x0; x <= x1; x += 6) { const u = (x - x0) / (x1 - x0); dd += ` L${x} ${f(BH - Math.pow(Math.sin(u * Math.PI), e) * h - Math.sin(u * 17 + seed) * 3.2 - Math.sin(u * 41 + seed) * 1.4)}`; } return path(dd + ` L${x1} ${BH} Z`, col); };
  out.push(hill(420, 1600, 40, '#b4c3d4', 2), hill(520, 1200, 28, '#a8b9cc', 5), hill(1000, 1580, 24, '#a3b5c9', 9));
  out.push(path(`M420 ${BH} L1600 ${BH} L1600 ${BH - 5} Q1000 ${BH - 2} 420 ${BH - 3} Z`, '#9fb4b8', { opacity: 0.6 }));
  for (let i = 0; i < 60; i++) { const x = 440 + r() * 1140; out.push(rect(x, BH - 2.4 - r() * 1.4, 1 + r() * 2.4, 1.6, r() < 0.7 ? '#eceff2' : '#e8d9c8', { opacity: 0.85 })); }
  // 海（午後の光）
  out.push(rect(0, BH, w, 240 - BH, defs.linU([[0, '#b7d6e4'], [0.15, '#7fb9dc'], [0.5, '#3f8fcc'], [1, '#246fb0']], 0, BH, 0, 240)));
  out.push(rect(0, BH, w, 0.8, '#fff6e6'));
  for (const [y, h, c, o] of [[142, 2, '#f2ead8', 0.5], [150, 4, '#2f7fc0', 0.15], [164, 3, '#b8dcee', 0.3], [196, 8, '#1d64a4', 0.2]]) out.push(rect(0, y, w, h, c, { opacity: o }));
  // 日の光のきらめき（右）
  for (let i = 0; i < 70; i++) { const x = 900 + (r() - 0.5) * 520, y = BH + 2 + Math.pow(r(), 1.3) * 60; out.push(rrect(x, y, 2 + r() * 8, 0.8, 0.4, '#fff3d6', { opacity: 0.35 + r() * 0.4 })); }
  for (let i = 0; i < 70; i++) { const y = BH + 2 + Math.pow(r(), 1.4) * 96; out.push(rrect(r() * w, y, 3 + r() * 8 * (1 + (y - BH) / 50), 0.7, 0.35, '#ffffff', { opacity: 0.25 + r() * 0.3 })); }
  // 行く先に見える、淡路島がわの主塔とケーブル（かすんで見える。橋の上のどこからでも見える位置 x=380〜600）
  {
    const tx = 500, top = 74, deck = 124, c = '#d3dde6', hz = { opacity: 0.85 };
    const cab = `M360 ${deck - 2} Q${tx - 60} ${deck - 10} ${tx} ${top} Q${tx + 50} ${deck - 18} 600 ${BH - 3}`;
    for (let x = 372; x < 596; x += 6) {
      if (Math.abs(x - tx) < 5) continue;
      const u = x < tx ? (x - 360) / (tx - 360) : (x - tx) / (600 - tx);
      const y = x < tx ? (1 - u) ** 2 * (deck - 2) + 2 * (1 - u) * u * (deck - 10) + u * u * top : (1 - u) ** 2 * top + 2 * (1 - u) * u * (deck - 18) + u * u * (BH - 3);
      out.push(rect(x, y, 0.4, Math.max(0, (x < 590 ? deck : BH) - y), '#dbe3ea', { opacity: 0.6 }));
    }
    out.push(rect(tx - 5, top, 2.6, BH + 4 - top, c, hz), rect(tx + 2.4, top, 2.6, BH + 4 - top, c, hz));
    for (let k = 0; k < 5; k++) { const y0 = top + 6 + k * 9; out.push(path(`M${tx - 2.4} ${y0} L${tx + 2.4} ${y0 + 9} M${tx + 2.4} ${y0} L${tx - 2.4} ${y0 + 9}`, 'none', st(c, 0.6, hz))); }
    out.push(rect(tx - 6, top - 2, 12, 2.4, c), circ(tx - 4.6, top - 3, 0.7, '#e0443a'), circ(tx + 4.6, top - 3, 0.7, '#e0443a'));
    out.push(path(cab, 'none', st('#e4ebf1', 1)), rect(360, deck, 240, 2.2, '#cfd9e2', hz), ell(tx, BH + 4, 9, 1.4, '#c3cfd8', hz));
  }
  return tr(0, -70, out.join(''));
});
// 海峡（潮の流れのすじ・白波・漁船）
bgLayer('bridge', { f: 0.07, w: 1200, y: 140, h: 100 }, (defs, w) => {
  const r = rng(9801), out = [];
  for (let i = 0; i < 18; i++) { const x = r() * w, y = 146 + Math.pow(r(), 0.9) * 90, l = 40 + r() * 90; out.push(wrap(w, x, l, xx => path(`M${xx} ${y} q${l * 0.25} -1.6 ${l * 0.5} 0 t${l * 0.5} 0`, 'none', st('#cfe8f4', 0.9, { opacity: 0.35 })))); }
  for (let i = 0; i < 40; i++) { const x = r() * w, y = 150 + Math.pow(r(), 0.8) * 86, l = 4 + r() * 8 * (1 + (y - 150) / 40); out.push(wrap(w, x, l, xx => path(`M${xx} ${y} q${l / 2} -1.6 ${l} 0`, 'none', st('#ffffff', 0.9, { opacity: 0.55 })))); }
  // 漁船（たこつぼ漁）
  const boat = (x, y, s) => [path(`M${x - 8 * s} ${y - 2 * s} L${x + 9 * s} ${y - 2 * s} L${x + 6 * s} ${y} L${x - 7 * s} ${y} Z`, '#f7f7f2'), rect(x - 7 * s, y - 1.2 * s, 15 * s, 0.6 * s, '#3a78c0'), rect(x + 1 * s, y - 6 * s, 5 * s, 4 * s, '#f7f7f2'), rect(x + 1.6 * s, y - 5.2 * s, 3.6 * s, 1.4 * s, '#7fa9c8'), rect(x - 4 * s, y - 9 * s, 0.5 * s, 7 * s, '#8a8f99'), ell(x, y + 0.5 * s, 10 * s, 1.2 * s, '#ffffff', { opacity: 0.5 })].join('');
  for (const [x, y, s] of [[80, 150, 0.45], [260, 156, 0.6], [470, 148, 0.4], [640, 158, 0.65], [900, 152, 0.5], [1100, 157, 0.55], [180, 204, 0.9], [760, 206, 1]]) out.push(boat(x, y, s));
  return tr(0, -140, out.join(''));
});
// 橋の下の近い海（大きな波）
bgLayer('bridge', { f: 0.45, w: 900, y: 186, h: 54 }, (defs, w) => {
  const r = rng(9901), out = [];
  out.push(rect(0, 190, w, 50, defs.linU([[0, '#2f82c4', 0], [0.2, '#2f82c4', 0.8], [1, '#1f68a8', 0.9]], 0, 190, 0, 240)));
  for (let i = 0; i < 30; i++) { const x = r() * w, y = 194 + r() * 42, l = 10 + r() * 18; out.push(wrap(w, x, l, xx => path(`M${xx} ${y} q${l / 4} -2.4 ${l / 2} 0 t${l / 2} 0`, 'none', st('#e6f5fb', 1.2, { opacity: 0.5 })))); }
  return tr(0, -186, out.join(''));
});

// ========================================================================
// 地面：舞子（みかげ石の遊歩道）
// ========================================================================
{
  const P = { colors: ['#cfc6b6', '#c5bcac', '#d7cfc0', '#bfb6a6'], jitter: 0, round: 10, speck: true, gap: 8 };
  const body = (v) => [rect(0, 0, U, U, '#948b7c'), masonry([{ y0: 0, y1: 80, joints: [30 + v * 12, 110 + v * 8], edge: '#cbc2b2' }, { y0: 80, y1: 160, joints: [70 + v * 10], edge: '#c3baaa' }], P, 9020 + v)].join('');
  const cap = { h: 40, base: '#ebe4d6', dark: '#a89e8c', light: '#fbf8f1' };
  const top = (v) => {
    const out = [body(v + 3), rect(0, 38, U, 10, '#000000', { opacity: 0.22 }), rect(0, 0, U, 42, cap.dark), rect(0, 0, U, 35, cap.base), rect(0, 0, U, 5, cap.light), rect(0, 28, U, 7, '#dcd4c4')];
    out.push(rect(v % 2 ? 40 : 110, 5, 2.4, 23, '#d0c7b6'));
    if (v === 1) out.push(path('M30 20 l14 -3 M36 24 l12 2', 'none', st('#8a6a44', 1.6)), ell(98, 18, 6, 4, '#8a5a3a'), path('M94 16 l8 4 M94 20 l8 -4', 'none', st('#6a4428', 1.2)));
    if (v === 2) out.push(...[20, 30, 124, 132].map((x, i) => path(`M${x} 2 q${i % 2 ? 3 : -3} -8 ${i % 2 ? 1 : -1} -12`, 'none', st('#6fae5c', 2.4))));
    return out.join('');
  };
  for (let v = 0; v < 3; v++) tile(`t/maiko/g/body${v}`, () => body(v));
  for (let v = 0; v < 3; v++) tile(`t/maiko/g/top${v}`, () => top(v));
  tile('t/maiko/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/maiko/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tile('t/maiko/g/topL', () => [rect(0, 0, 10, 42, cap.dark), rect(0, 0, 6, 35, '#ddd5c6')].join(''));
  tile('t/maiko/g/topR', () => [rect(150, 0, 10, 42, cap.dark), rect(154, 0, 6, 35, '#ddd5c6')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/maiko/g/${k}`, defs => slopeTile(defs, k, body(k.length % 3), cap));
  // みかげ石の階段
  tile('t/maiko/hard', () => [
    rrect(0, 0, U, U, 8, '#8f877a'), rrect(4, 4, 152, 150, 7, '#d3cbbc'),
    path('M10 10 L150 10 L138 22 L22 22 L22 138 L10 150 Z', '#ebe5d9'), path('M150 10 L150 150 L10 150 L22 138 L138 138 L138 22 Z', '#b4ab9b'),
    ...[[54, 64], [104, 96], [74, 116], [112, 50]].map(([x, y]) => circ(x, y, 2.2, '#a79e8e'))
  ].join(''));
}

// ========================================================================
// 地面：橋（補剛トラス＝しっかりした鉄の箱）・アンカレイジ・主塔・ケーブル・点検通路
// ========================================================================
{
  const STEEL = '#e6edec', STEEL_L = '#fbfdfc', STEEL_D = '#a7b8b8', IN0 = '#5a7580', IN1 = '#3e5663';
  // トラスの中（奥のトラスがうっすら見える、暗い面）
  const inner = (defs, y0, y1) => [rect(0, y0, U, y1 - y0, defs.linU([[0, IN0], [1, IN1]], 0, 0, 0, 160))].join('');
  // 上の段（道路＋上弦材＋トラスの上半分）
  const deckTop = (defs, v) => {
    const out = [inner(defs, 60, 160)];
    // 奥のトラス（うすく）
    out.push(path('M40 60 L80 160 L120 60', 'none', st('#6f8b95', 8, { opacity: 0.6 })));
    // 手前のすじかい（X）
    out.push(path('M8 66 L80 160 M152 66 L80 160', 'none', st('#8ea3a6', 17)), path('M8 66 L80 160 M152 66 L80 160', 'none', st(STEEL, 11)), path('M8 66 L80 160', 'none', st(STEEL_L, 3, { opacity: 0.9 })));
    // たての材（はし）
    out.push(rect(0, 60, 11, 100, STEEL), rect(149, 60, 11, 100, STEEL_D), rect(0, 60, 3, 100, STEEL_L));
    // 上弦材
    out.push(rect(0, 38, U, 26, STEEL), rect(0, 38, U, 6, STEEL_L), rect(0, 58, U, 6, STEEL_D));
    for (const x of [20, 60, 100, 140]) out.push(circ(x, 51, 2.6, '#b8c7c6'));
    // 道路（ふち石が明るい）
    out.push(rect(0, 0, U, 40, '#7d878e'), rect(0, 24, U, 16, '#68737a'));
    out.push(rect(0, 0, U, 20, '#eef2f1'), rect(0, 0, U, 6, '#ffffff'), rect(0, 17, U, 4, '#b9c3c5'));
    for (const x of [30, 110]) out.push(rect(x, 26, 20, 6, '#f2c230', { opacity: 0.9 }));
    out.push(rect(0, 36, U, 4, '#000000', { opacity: 0.18 }));
    return out.join('');
  };
  // 下の段（トラスの下半分＋下弦材）
  const deckBody = (defs, v) => {
    const out = [inner(defs, 0, 116)];
    out.push(path('M40 116 L80 0 L120 116', 'none', st('#6f8b95', 8, { opacity: 0.6 })));
    out.push(path('M80 0 L8 108 M80 0 L152 108', 'none', st('#8ea3a6', 17)), path('M80 0 L8 108 M80 0 L152 108', 'none', st(STEEL, 11)), path('M80 0 L8 108', 'none', st(STEEL_L, 3, { opacity: 0.9 })));
    out.push(circ(80, 2, 9, STEEL), circ(80, 2, 4, '#b8c7c6'));
    out.push(rect(0, 0, 11, 116, STEEL), rect(149, 0, 11, 116, STEEL_D), rect(0, 0, 3, 116, STEEL_L));
    // 下弦材
    out.push(rect(0, 108, U, 30, STEEL), rect(0, 108, U, 6, STEEL_L), rect(0, 132, U, 6, STEEL_D));
    for (const x of [20, 60, 100, 140]) out.push(circ(x, 122, 2.6, '#b8c7c6'));
    // 底（点検レール）
    out.push(rect(0, 138, U, 22, '#6f8185'), rect(0, 138, U, 4, '#8fa1a5'), rect(0, 154, U, 6, '#46565c'));
    if (v === 1) out.push(rect(66, 144, 28, 8, '#f2c230'), rect(70, 146, 8, 4, '#3a3a3a'), rect(82, 146, 8, 4, '#3a3a3a'));
    return out.join('');
  };
  for (let v = 0; v < 2; v++) tile(`t/bridge/g/body${v}`, defs => deckBody(defs, v));
  for (let v = 0; v < 2; v++) tile(`t/bridge/g/top${v}`, defs => deckTop(defs, v));
  // はし（切れ目の端板）
  tile('t/bridge/g/edgeL', () => [rect(0, 0, 18, U, '#d3dddc'), rect(0, 0, 5, U, '#ffffff'), rect(16, 0, 4, U, '#7d8f93')].join(''));
  tile('t/bridge/g/edgeR', () => [rect(142, 0, 18, U, '#b2c1c1'), rect(155, 0, 5, U, '#7d8f93'), rect(140, 0, 4, U, '#eef3f2')].join(''));
  tile('t/bridge/g/topL', () => [rect(0, 0, 18, 40, '#f2f5f4'), rect(0, 0, 6, 12, '#ffffff')].join(''));
  tile('t/bridge/g/topR', () => [rect(142, 0, 18, 40, '#dfe6e6'), rect(154, 0, 6, 12, '#ffffff')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/bridge/g/${k}`, defs => slopeTile(defs, k, deckBody(defs, 0), { h: 40, base: '#e6edec', dark: '#8d979d', light: '#ffffff' }));

  // アンカレイジ（コンクリートのかたまり）
  const conc = (T) => {
    const out = [rect(0, 0, U, U, '#cdd2ce'), rect(0, 0, U, 80, '#ffffff', { opacity: 0.1 })];
    out.push(rect(0, 76, U, 5, '#b2b8b4'), rect(0, 81, U, 2, '#e8ece9'), rect(0, 154, U, 6, '#b2b8b4'));
    out.push(rect(78, 0, 3, U, '#b8beba'), rect(81, 0, 2, U, '#e8ece9'));
    for (const [x, y] of [[14, 12], [146, 12], [14, 92], [146, 92]]) out.push(circ(x, y, 3, '#aeb4b0'));
    out.push(ell(40, 130, 22, 8, '#c2c8c4', { opacity: 0.8 }), circ(120, 40, 3, '#b9bfbb'), circ(128, 46, 2, '#b9bfbb'));
    if (T) out.push(rect(0, 0, U, 26, '#f0f2ef'), rect(0, 0, U, 6, '#ffffff'), rect(0, 26, U, 8, '#a8afab'), rect(0, 34, U, 6, '#000000', { opacity: 0.1 }));
    return out.join('');
  };
  tile('t/bridge/m/s9anc/hard', () => conc(false));
  tile('t/bridge/m/s9anc/hardT', () => [rect(0, 0, U, 26, '#f0f2ef'), rect(0, 0, U, 6, '#ffffff'), rect(0, 26, U, 8, '#a8afab'), rect(0, 34, U, 6, '#000000', { opacity: 0.1 })].join(''));
  // 主塔のタイル（ふだんは主塔の飾りが上にかぶさる）
  tile('t/bridge/m/bridgeTower/hard', () => [rect(0, 0, U, U, '#9fb1b3'), rect(0, 0, 44, U, '#eef3f3'), rect(0, 0, 14, U, '#ffffff'), rect(116, 0, 44, U, '#c9d5d6'), rect(0, 150, U, 10, '#8b9ea1')].join(''));
  tile('t/bridge/m/bridgeTower/hardT', () => [rect(0, 0, U, 24, '#f4f7f7'), rect(0, 0, U, 6, '#ffffff'), rect(0, 24, U, 6, '#8b9ea1')].join(''));

  // 主ケーブル（歩ける・太くて丸い）
  const CAB = [[44, 90, '#4f6266'], [42, 78, '#d5dfdf'], [56, 40, '#aebfc0'], [70, 12, '#8a9c9e', { opacity: 0.8 }], [16, 18, '#f7fafa']];
  tile('t/bridge/m/cable/semi', () => [
    rect(0, 0, U, 90, '#4f6266'), rect(0, 3, U, 78, '#d5dfdf'), rect(0, 40, U, 36, '#aebfc0'), rect(0, 64, U, 12, '#8a9c9e'), rect(0, 6, U, 20, '#f7fafa'),
    ...[0, 40, 80, 120].map(x => path(`M${x + 8} 26 L${x + 32} 74`, 'none', st('#94a6a8', 3, { opacity: 0.55 }))),
    rect(0, 84, U, 6, '#34444a')
  ].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/bridge/m/cable/${k}`, () => {
    const [yl, yr] = SLOPES[k];
    const cos = Math.cos(Math.atan2(Math.abs(yr - yl), 160));
    return CAB.map(([off, wd, col, o]) => path(`M-4 ${f(yl + off - (yr - yl) / 160 * 4)} L164 ${f(yr + off + (yr - yl) / 160 * 4)}`, 'none', { stroke: col, strokeWidth: f(wd * cos), strokeLinecap: 'butt', ...(o || {}) })).join('');
  });
  // 点検通路（明るい床板・黄色のふち・すきまのある鉄の床）
  tile('t/bridge/m/grating/semi', () => [
    rect(0, 0, U, 50, '#35414a'),
    rect(0, 0, U, 8, '#fbfcfa'), rect(0, 8, U, 8, '#f2c230'), rect(0, 16, U, 22, '#4a5a64'),
    ...Array.from({ length: 10 }, (_, i) => rect(4 + i * 16, 18, 7, 18, '#9fb2ba')),
    rect(0, 38, U, 8, '#7d8f97'), rect(0, 46, U, 4, '#26303a'),
    rect(22, 50, 10, 26, '#35414a'), rect(128, 50, 10, 26, '#35414a')
  ].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/bridge/m/grating/${k}`, () => {
    const [yl, yr] = SLOPES[k];
    return [[26, 52, '#35414a'], [4, 8, '#fbfcfa'], [12, 8, '#f2c230'], [27, 22, '#8fa1aa', { strokeDasharray: '8 6' }]].map(([off, wd, col, o]) => path(`M0 ${yl + off} L160 ${yr + off}`, 'none', { stroke: col, strokeWidth: wd, strokeLinecap: 'butt', ...(o || {}) })).join('');
  });

  // 海峡の海（深い青・白波）
  for (let fr = 0; fr < 4; fr++) {
    const ph = fr * Math.PI / 2;
    const wy = x => 58 + Math.sin(x / 160 * TAU + ph) * 8;
    tile(`t/bridge/waterT${fr}`, defs => {
      let d = `M0 160 L0 ${f(wy(0))}`;
      for (let x = 10; x <= 160; x += 10) d += ` L${x} ${f(wy(x))}`;
      const crest = d.replace('M0 160 L', 'M');
      const out = [path(d + ' L160 160 Z', defs.linU([[0, '#4a9fd8'], [0.5, '#2c7fc0'], [1, '#2170b2']], 0, 50, 0, 160))];
      out.push(path(crest, 'none', st('#bfe4f6', 14)), path(crest, 'none', st('#ffffff', 5, { strokeDasharray: '26 12', strokeDashoffset: -fr * 9 })));
      for (let i = 0; i < 5; i++) { const x = (i * 31 + fr * 11) % 160; out.push(circ(x, wy(x) + 12 + (i % 3) * 3, 2, '#ffffff', { opacity: 0.7 })); }
      out.push(rrect((fr * 29) % 120, 118, 26, 3.6, 1.8, '#dff3fb', { opacity: 0.45 }));
      return out.join('');
    });
    tile(`t/bridge/water${fr}`, defs => {
      const out = [rect(0, 0, U, U, defs.lin([[0, '#2170b2'], [1, '#18609f']]))];
      for (let i = 0; i < 3; i++) { const y = 30 + i * 46, x0 = (fr * 14 + i * 50) % 160; out.push(path(`M${x0 - 30} ${y} q15 -6 30 0 t30 0`, 'none', st('#5aa4dc', 3, { opacity: 0.45 }))); }
      return out.join('');
    });
  }
}

// ========================================================================
// 飾り（シート s9）
// ========================================================================
// ---------- 移情閣（八角形・3かいだて・うすい緑の壁に白いふち・赤茶色の屋根） ----------
sprite(SH, 's9/ijo', 92, 118, 46, 117, defs => {
  const Gd = G(defs), out = [];
  const WALL = '#cfe5c9', WALL_L = '#e0f0da', WALL_D = '#a9c9a6', TRIM = '#fbfbf6', ROOF = '#9a4a32', ROOF_D = '#6f3222', ROOF_L = '#c46a48';
  out.push(ell(0, -4, 480, 26, '#000000', { opacity: 0.12 }));
  // 八角形の1面を3つ（左・まん中・右）ならべて描く
  const floor = (y0, y1, hw, o = {}) => {
    const cw = hw * 0.58, sw = hw - cw; // まん中の面の半分, ななめの面の幅
    const p = [];
    p.push(rect(-cw, y0, cw * 2, y1 - y0, WALL));
    p.push(path(`M${-hw} ${y0 + 10} L${-cw} ${y0} L${-cw} ${y1} L${-hw} ${y1 - 10} Z`, WALL_L));
    p.push(path(`M${cw} ${y0} L${hw} ${y0 + 10} L${hw} ${y1 - 10} L${cw} ${y1} Z`, WALL_D));
    // 角の白い柱
    for (const x of [-hw, -cw, cw, hw]) p.push(rect(x - 12, y0, 24, y1 - y0, TRIM), rect(x - 12, y0, 6, y1 - y0, '#ffffff'));
    // 窓（アーチ・白わく）
    const winA = (cx, wy0, ww, wh, k = 1) => [
      path(`M${cx - ww / 2 - 12} ${wy0 + wh} L${cx - ww / 2 - 12} ${wy0 + ww / 2} A${ww / 2 + 12} ${ww / 2 + 12} 0 0 1 ${cx + ww / 2 + 12} ${wy0 + ww / 2} L${cx + ww / 2 + 12} ${wy0 + wh} Z`, TRIM),
      path(`M${cx - ww / 2} ${wy0 + wh} L${cx - ww / 2} ${wy0 + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${cx + ww / 2} ${wy0 + ww / 2} L${cx + ww / 2} ${wy0 + wh} Z`, k < 1 ? '#86b3cf' : Gd.glass),
      rect(cx - 3, wy0 + 10, 6, wh - 10, TRIM), rect(cx - ww / 2, wy0 + wh * 0.55, ww, 5, TRIM),
      path(`M${cx - ww / 2 + 6} ${wy0 + ww / 2} L${cx - 4} ${wy0 + 16} L${cx - 4} ${wy0 + wh * 0.5} L${cx - ww / 2 + 6} ${wy0 + wh * 0.5} Z`, '#ffffff', { opacity: 0.35 }),
      rect(cx - ww / 2 - 18, wy0 + wh, ww + 36, 10, '#e6ece2')
    ].join('');
    const wh = (y1 - y0) * 0.66, wy = y0 + (y1 - y0) * 0.16;
    for (const cx of o.center || [0]) p.push(winA(cx, wy, o.ww || 90, wh));
    p.push(winA(-(hw + cw) / 2, wy + 6, (o.ww || 90) * 0.55, wh - 12, 0.5), winA((hw + cw) / 2, wy + 6, (o.ww || 90) * 0.55, wh - 12, 0.5));
    p.push(path(`M${cw} ${y0} L${hw} ${y0 + 10} L${hw} ${y1 - 10} L${cw} ${y1} Z`, '#000000', { opacity: 0.08 }));
    // 上の白い帯（コーニス）
    p.push(path(`M${-hw - 20} ${y0 + 6} L${-cw} ${y0 - 6} L${cw} ${y0 - 6} L${hw + 20} ${y0 + 6} L${hw + 20} ${y0 + 22} L${cw} ${y0 + 12} L${-cw} ${y0 + 12} L${-hw - 20} ${y0 + 22} Z`, TRIM));
    return p.join('');
  };
  // ベランダの手すり（白）
  const rail = (y, hw) => {
    const p = [path(`M${-hw - 30} ${y + 6} L${-hw * 0.58} ${y - 4} L${hw * 0.58} ${y - 4} L${hw + 30} ${y + 6} L${hw + 30} ${y + 16} L${hw * 0.58} ${y + 6} L${-hw * 0.58} ${y + 6} L${-hw - 30} ${y + 16} Z`, TRIM)];
    for (let x = -hw - 20; x <= hw + 20; x += 20) { const yy = y + 12 + (Math.abs(x) > hw * 0.58 ? (Math.abs(x) - hw * 0.58) / (hw * 0.42) * 10 : 0); p.push(rect(x - 3, yy, 6, 44, TRIM)); }
    p.push(path(`M${-hw - 30} ${y + 56 + 10} L${-hw * 0.58} ${y + 56} L${hw * 0.58} ${y + 56} L${hw + 30} ${y + 56 + 10}`, 'none', st(TRIM, 10)));
    return p.join('');
  };
  // ひさし（赤茶の屋根・はしがそり返る）
  const eave = (y, hw, h) => [
    path(`M${-hw - 70} ${y + 4} Q${-hw - 40} ${y - 4} ${-hw * 0.7} ${y - h} L${hw * 0.7} ${y - h} Q${hw + 40} ${y - 4} ${hw + 70} ${y + 4} Q${hw * 0.6} ${y - 6} 0 ${y - 6} Q${-hw * 0.6} ${y - 6} ${-hw - 70} ${y + 4} Z`, ROOF),
    path(`M${-hw * 0.7} ${y - h} L${hw * 0.7} ${y - h} L${hw * 0.6} ${y - h + 8} L${-hw * 0.6} ${y - h + 8} Z`, ROOF_L),
    ...Array.from({ length: 9 }, (_, i) => { const u = (i + 1) / 10 - 0.5; return path(`M${u * hw * 1.4} ${y - h + 2} L${u * (hw * 2 + 100)} ${y - 2}`, 'none', st(ROOF_D, 4, { opacity: 0.5 })); }),
    path(`M${-hw - 70} ${y + 4} Q${hw * -0.6} ${y - 6} 0 ${y - 6} Q${hw * 0.6} ${y - 6} ${hw + 70} ${y + 4}`, 'none', st(ROOF_D, 8)),
    path(`M${hw * 0.1} ${y - h} L${hw * 0.7} ${y - h} Q${hw + 40} ${y - 4} ${hw + 70} ${y + 4} Q${hw * 0.6} ${y - 6} ${hw * 0.2} ${y - 6} Z`, '#000000', { opacity: 0.12 })
  ].join('');
  // 基だん
  out.push(rect(-440, -60, 880, 60, '#c9c1b2'), rect(-440, -60, 880, 10, '#e2dccf'), rect(-400, -110, 800, 50, '#d8d1c3'), rect(-400, -110, 800, 8, '#efe9de'));
  // 1かい
  out.push(floor(-440, -110, 340, { center: [-100, 100], ww: 100 }));
  // 入口
  out.push(rect(-52, -300, 104, 190, '#7a4a32'), rect(-44, -292, 88, 182, '#9a6244'), rect(-4, -292, 8, 182, '#7a4a32'), rect(-40, -290, 36, 90, Gd.glass, { opacity: 0.8 }), rect(4, -290, 36, 90, Gd.glass, { opacity: 0.8 }));
  out.push(eave(-440, 340, 60));
  // 2かい
  out.push(floor(-760, -470, 290, { center: [-80, 80], ww: 80 }));
  out.push(rail(-530, 300));
  out.push(eave(-760, 290, 56));
  // 3かい
  out.push(floor(-990, -800, 220, { center: [0], ww: 76 }));
  out.push(rail(-850, 230));
  // 屋根（八角のとがり屋根）
  out.push(path('M-300 -986 Q-240 -1000 -150 -1070 L0 -1150 L150 -1070 Q240 -1000 300 -986 Q150 -1000 0 -1000 Q-150 -1000 -300 -986 Z', ROOF));
  out.push(path('M0 -1150 L150 -1070 Q240 -1000 300 -986 Q150 -1000 40 -1000 Z', ROOF_D, { opacity: 0.55 }));
  out.push(path('M0 -1150 L-150 -1070 Q-240 -1000 -300 -986 L-240 -994 Q-180 -1016 -110 -1068 Z', ROOF_L, { opacity: 0.6 }));
  for (const u of [-0.55, -0.2, 0.2, 0.55]) out.push(path(`M${u * 40} -1146 L${u * 520} -992`, 'none', st(ROOF_D, 4, { opacity: 0.45 })));
  out.push(path('M-300 -986 Q-150 -1000 0 -1000 Q150 -1000 300 -986', 'none', st(ROOF_D, 8)));
  out.push(rect(-6, -1210, 12, 64, '#5a4a3a'), circ(0, -1160, 14, '#d9b04a'), circ(0, -1196, 10, '#d9b04a'), circ(-3, -1200, 4, '#fff0b0'));
  return tr(46, 117, out.join(''), 0.1);
});

// ---------- 旧武藤山治邸（水色の下見板・白いふち・ベランダ） ----------
sprite(SH, 's9/muto', 128, 90, 4, 89, defs => {
  const Gd = G(defs), r = rng(9311), out = [];
  const W = 1180, WALL = '#bcd6e6', WALL_L = '#d4e6f1', LINE = '#a3c1d4', TRIM = '#fbfbf6', ROOF = '#4e5a6a';
  out.push(ell(W / 2, -4, 660, 22, '#000000', { opacity: 0.12 }));
  // 本体
  out.push(rect(0, -620, W, 620, WALL), rect(0, -620, W, 620, Gd.wallShade));
  for (let y = -610; y < -20; y += 24) out.push(rect(0, y, W, 4, LINE), rect(0, y + 4, W, 3, WALL_L, { opacity: 0.8 }));
  out.push(rect(W - 50, -620, 50, 620, '#000000', { opacity: 0.06 }));
  for (const x of [0, W - 24, 560]) out.push(rect(x, -620, 24, 620, TRIM));
  // えんとつ（れんが）
  out.push(rect(860, -900, 70, 180, '#b9553d'), rect(850, -912, 90, 22, '#8a3a26'));
  for (let y = -890; y < -720; y += 22) out.push(rect(860, y, 70, 3, '#8a3a26', { opacity: 0.5 }));
  // 屋根（寄棟・スレート）とドーマー
  out.push(path(`M-60 -610 L140 -800 L${W - 140} -800 L${W + 60} -610 Z`, ROOF));
  for (let i = 1; i < 6; i++) { const t = i / 6; out.push(rect(-60 + 200 * t, -610 - 190 * t, W + 120 - 400 * t, 3, '#6c7888', { opacity: 0.7 })); }
  out.push(path(`M-60 -610 L140 -800 L170 -800 L-20 -610 Z`, '#6c7888', { opacity: 0.7 }));
  out.push(rect(-70, -620, W + 140, 22, TRIM), rect(-70, -598, W + 140, 10, '#000000', { opacity: 0.12 }));
  out.push(rect(420, -780, 180, 150, WALL), path('M400 -780 L510 -860 L620 -780 Z', ROOF), rect(396, -786, 228, 12, TRIM), win(Gd, 460, -760, 100, 100, { frame: TRIM, sill: false }));
  // 2かいの窓（白わく・レースのカーテン）
  for (const x of [80, 320, 660, 900]) out.push(win(Gd, x, -560, 150, 170, { frame: TRIM, curtain: '#f4f1ea', bar: true }), rect(x - 36, -566, 20, 182, '#5f8a70'), rect(x + 166, -566, 20, 182, '#5f8a70'));
  // 1かいのベランダ（白い柱と手すり）
  out.push(rect(-40, -330, W + 80, 26, TRIM), rect(-40, -304, W + 80, 10, '#000000', { opacity: 0.12 }));
  out.push(inside(Gd, 20, -304, W - 40, 304, '#d6e6ef'));
  for (const x of [120, 400, 700, 960]) out.push(win(Gd, x, -270, 130, 190, { frame: TRIM, curtain: '#fff3d6' }));
  out.push(rect(540, -290, 100, 290, '#6b4a32'), rect(552, -278, 76, 120, Gd.glass), circ(616, -140, 6, '#e0c060'));
  for (const x of [-30, 260, 520, 660, 900, W + 10]) out.push(rect(x, -304, 30, 304, TRIM), rect(x, -304, 8, 304, '#ffffff'), rect(x + 22, -304, 8, 304, '#d9dedc'));
  out.push(rect(-40, -120, 560, 12, TRIM), rect(690, -120, W - 650, 12, TRIM));
  for (let x = -20; x < W + 20; x += 26) if (x < 510 || x > 690) out.push(rect(x, -108, 8, 88, TRIM));
  out.push(rect(-40, -24, W + 80, 24, '#cfc8ba'), rect(-40, -24, W + 80, 5, '#e8e3d8'));
  // 植えこみ
  for (let x = -20; x < W + 20; x += 70) if (x < 470 || x > 700) out.push(cloverBlob(x + r() * 10, -30, 34, '#3f8a4a', '#86c874'));
  return tr(4, 89, out.join(''), 0.1);
});

// ---------- 舞子の松（大きな古い黒松） ----------
sprite(SH, 's9/pine0', 132, 112, 64, 111, () => tr(64, 111, blackPine({ h: 1020, lean: 240, spread: 380, pads: 7, seed: 11, padK: 1.05, col: { dark: '#173f28', base: '#265f3a', mid: '#347447', light: '#6aaa5c', trunk: '#6e3f2a', trunkD: '#4a2818' } }), 0.1));
sprite(SH, 's9/pine1', 118, 96, 62, 95, () => tr(62, 95, blackPine({ h: 860, lean: -220, spread: 320, pads: 6, seed: 17, col: { dark: '#173f28', base: '#265f3a', mid: '#347447', light: '#6aaa5c', trunk: '#6e3f2a', trunkD: '#4a2818' } }), 0.1));

// ---------- 遊歩道の街灯 ----------
sprite(SH, 's9/lamp', 16, 52, 8, 51, () => tr(8, 51, [
  rrect(-34, -44, 68, 44, 8, '#2e3138'), rect(-34, -44, 68, 8, '#50545e'),
  path('M-12 -44 L-8 -420 L8 -420 L12 -44 Z', '#33363e'), path('M-7 -44 L-4 -420 L0 -420 L-1 -44 Z', '#6e717c', { opacity: 0.7 }),
  rrect(-18, -130, 36, 18, 6, '#2e3138'),
  path('M-30 -420 L30 -420 L22 -436 L-22 -436 Z', '#2e3138'),
  circ(0, -466, 44, '#fff6de', { opacity: 0.3 }),
  path('M-26 -436 L26 -436 L32 -490 L-32 -490 Z', '#fdf8e8'), path('M-26 -436 L-6 -436 L-10 -490 L-32 -490 Z', '#ffffff', { opacity: 0.8 }),
  rect(-2, -490, 4, 54, '#2e3138'), rect(-32, -470, 64, 3, '#2e3138'),
  path('M-40 -490 L40 -490 L0 -520 Z', '#2e3138'), rect(-3, -532, 6, 14, '#2e3138')
], 0.1));

// ---------- 主塔（遊べる主塔の上にかぶせる絵） ----------
// 上の部分（6マス＝96ドット）: 原点は主塔の左上（てっぺん）
const TW = { leg: '#f1f5f5', hi: '#ffffff', sh: '#bfcdcf', inner: '#97abaf', innerD: '#7b9195', brace: '#dbe4e5', ink: '#2c2a44' };
function towerLegs(h, o = {}) {
  const out = [];
  // 脚のあいだ（中の面・くらい）
  out.push(rect(70, 0, 180, h, o.far ? '#b7c6c8' : TW.inner), rect(70, 0, 180, h, '#000000', { opacity: 0.08 }));
  // X のすじかい
  const n = Math.max(1, Math.round(h / 320));
  for (let k = 0; k < n; k++) {
    const y0 = k * h / n + 20, y1 = (k + 1) * h / n - 20;
    out.push(path(`M78 ${y0} L242 ${y1} M242 ${y0} L78 ${y1}`, 'none', st(TW.innerD, 30)), path(`M78 ${y0} L242 ${y1} M242 ${y0} L78 ${y1}`, 'none', st(TW.brace, 20)));
    out.push(rect(70, y1 + 4, 180, 32, TW.brace), rect(70, y1 + 4, 180, 8, '#ffffff', { opacity: 0.7 }), rect(70, y1 + 30, 180, 6, TW.innerD));
  }
  // 脚
  for (const x of [0, 250]) out.push(rect(x, 0, 70, h, TW.leg), rect(x, 0, 18, h, TW.hi), rect(x + 50, 0, 20, h, TW.sh));
  for (let y = 80; y < h; y += 160) for (const x of [0, 250]) out.push(rect(x, y, 70, 4, TW.sh, { opacity: 0.8 }));
  return out.join('');
}
sprite(SH, 's9/tw', 36, 104, 2, 8, () => {
  const H = 960, out = [];
  out.push(rect(-8, -2, 336, H + 4, TW.ink, { opacity: 0.55 }));
  out.push(towerLegs(H));
  // 主塔のてっぺん（サドルのカバー）: 上の面は平らで明るい
  out.push(rect(-10, 0, 340, 90, '#e8eeee'), rect(-10, 0, 340, 14, '#ffffff'), rect(-10, 70, 340, 20, TW.sh), rect(-10, 90, 340, 8, '#000000', { opacity: 0.15 }));
  out.push(rrect(40, 26, 240, 36, 10, '#d5dede'), ...[80, 160, 240].map(x => circ(x, 44, 6, '#aab9bb')));
  // 航空障害灯
  for (const x of [-4, 324]) out.push(rect(x - 6, -50, 12, 50, '#8a9699'), circ(x, -56, 14, '#e0443a'), circ(x - 4, -60, 5, '#ffb0a0'));
  // いちばん下のはり（道路の上）
  out.push(rect(-10, H - 60, 340, 60, '#e8eeee'), rect(-10, H - 60, 340, 10, '#ffffff'), rect(-10, H - 12, 340, 12, TW.sh));
  return tr(2, 8, out.join(''), 0.1);
});
// 道路の高さ（くぐれるところ）: 奥の脚だけうすく見える
sprite(SH, 's9/twgap', 36, 34, 2, 1, () => tr(2, 1, [
  rect(80, 0, 160, 320, '#a9bcc0', { opacity: 0.35 }),
  path('M84 0 L236 320 M236 0 L84 320', 'none', st('#c9d6d8', 16, { opacity: 0.6 })),
  rect(0, 0, 60, 320, '#dfe8e9', { opacity: 0.75 }), rect(260, 0, 60, 320, '#d2dddf', { opacity: 0.75 }),
  rect(0, 0, 14, 320, '#ffffff', { opacity: 0.5 })
], 0.1));
// 道路より下（海の中のケーソンまで）
sprite(SH, 's9/twlow', 60, 52, 14, 1, () => {
  const out = [rect(-8, 0, 336, 330, TW.ink, { opacity: 0.55 }), towerLegs(330)];
  // ケーソン（海面）
  out.push(rect(-120, 200, 560, 300, '#cfd8da'), rect(-120, 200, 560, 20, '#eef3f3'), rect(-120, 220, 560, 10, '#a9b7ba'), rect(-120, 200, 40, 300, '#ffffff', { opacity: 0.4 }), rect(390, 200, 50, 300, '#a9b7ba'));
  for (const y of [270, 340, 410]) out.push(rect(-120, y, 560, 4, '#b7c3c6'));
  for (const x of [-40, 60, 160, 260, 350]) out.push(rect(x, 230, 4, 270, '#bcc8ca', { opacity: 0.8 }));
  out.push(rect(-120, 330, 560, 170, '#2f7fc0', { opacity: 0.25 }));
  out.push(path('M-130 300 q30 -16 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 L460 300', 'none', st('#ffffff', 10, { opacity: 0.8 })));
  return tr(14, 1, out.join(''), 0.1);
});

// ---------- 船（背景を動く） ----------
// 0: コンテナ船, 1: フェリー, 2: 漁船（右向き・原点は船の底のまん中）
sprite(SH, 's9/ship0', 96, 26, 48, 24, () => tr(48, 24, [
  ell(0, 4, 470, 18, '#1f5f9a', { opacity: 0.3 }),
  path('M-460 -60 L440 -60 L400 0 L-430 0 Z', '#c0392b'), path('M-460 -60 L440 -60 L436 -52 L-458 -52 Z', '#f4f4f0'),
  rect(-440, -34, 870, 10, '#8a2a22'),
  ...Array.from({ length: 10 }, (_, i) => rect(-330 + i * 64, -150, 58, 88, ['#2f6fb8', '#e0892b', '#3a9a62', '#d9483b', '#f4f4f0', '#2f6fb8', '#8a6ad8', '#e0892b', '#3a9a62', '#d9483b'][i])),
  ...Array.from({ length: 7 }, (_, i) => rect(-266 + i * 64, -220, 58, 68, ['#e0892b', '#2f6fb8', '#d9483b', '#3a9a62', '#2f6fb8', '#f4f4f0', '#e0892b'][i])),
  ...Array.from({ length: 10 }, (_, i) => rect(-330 + i * 64, -150, 4, 88, '#000000', { opacity: 0.15 })),
  rect(-440, -230, 90, 170, '#f4f4f0'), rect(-430, -210, 70, 14, '#6f93b8'), rect(-430, -180, 70, 14, '#6f93b8'), rect(-420, -290, 40, 60, '#3a3a40'), rect(-420, -280, 40, 12, '#e0443a')
], 0.1));
sprite(SH, 's9/ship1', 70, 26, 35, 24, () => tr(35, 24, [
  ell(0, 4, 340, 16, '#1f5f9a', { opacity: 0.3 }),
  path('M-330 -80 L320 -80 Q350 -60 300 0 L-300 0 Z', '#f7f7f2'), rect(-320, -30, 640, 14, '#2f7fd0'), rect(-320, -12, 630, 8, '#e0443a'),
  rect(-240, -150, 440, 70, '#f7f7f2'), rect(-220, -134, 400, 20, '#7fa9c8'),
  ...Array.from({ length: 9 }, (_, i) => rect(-226 + i * 46, -134, 4, 20, '#f7f7f2')),
  rect(-150, -210, 260, 60, '#f7f7f2'), rect(-130, -196, 220, 16, '#7fa9c8'),
  rect(-40, -250, 50, 40, '#2f7fd0'), rect(-40, -250, 50, 10, '#e0443a')
], 0.1));
sprite(SH, 's9/ship2', 30, 20, 15, 18, () => tr(15, 18, [
  ell(0, 4, 130, 12, '#1f5f9a', { opacity: 0.3 }),
  path('M-120 -34 L130 -34 L100 0 L-100 0 Z', '#f7f7f2'), rect(-110, -18, 230, 8, '#3a78c0'),
  rect(10, -110, 70, 76, '#f7f7f2'), rect(18, -98, 54, 22, '#7fa9c8'),
  rect(-70, -160, 6, 126, '#8a8f99'), path('M-64 -150 L-20 -120 L-64 -120 Z', '#e0443a'),
  ...[-100, -60, -30].map(x => circ(x, -44, 9, '#e0892b'))
], 0.1));
