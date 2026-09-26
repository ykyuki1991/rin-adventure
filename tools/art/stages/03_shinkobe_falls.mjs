// ステージ3「新神戸・布引の滝」の絵（背景・地面・飾り）
// 新神戸駅（高架の駅・N700ふうの新幹線・駅前の広場・すぐうしろの六甲山）→ 布引の滝への山道（苔の石段・もみじ・清流・石橋・雌滝・雄滝・布引ダム）
// 看板の文字はゲームの中で描く（js/sd/stage3.js）
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, roundPoly, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, cloud } from '../bgs.mjs';
import { U, tile, masonry, joints, SLOPES, slopeTile, water } from '../tiles.mjs';
import { TAU, st, G, win, glassFrame, board, cloverBlob, clover, cloverTree } from '../kit.mjs';

resetTheme('shinkobe');
resetTheme('falls');
const SH = 's3';
const INK = '#2a2230';

// もみじの葉（5つのとがり）
function mapleLeaf(x, y, r, c, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + rot, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  return poly(pts, c);
}

// ========================================================================
// 新神戸：背景
// ========================================================================
bgLayer('shinkobe', { f: 0.025, w: 1200, y: 0, h: 110 }, (defs, w) => {
  const out = [];
  for (const [x, y, s] of [[160, 26, 0.9], [520, 18, 0.7], [820, 34, 1.0], [1080, 22, 0.6]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#dbe8f4', '#ffffff')));
  return out.join('');
});

// すぐうしろの六甲山（高くて急・ロープウェイのケーブル）
bgLayer('shinkobe', { f: 0.05, w: 1100, y: 20, h: 220 }, (defs, w) => {
  const r = rng(3101);
  const MAIN = [[1, 18], [2, 16], [4, 9], [9, 4]];
  const out = [];
  out.push(path(ridgePath(w, 70, [[2, 18], [5, 8]], 3103, 240), defs.linU([[0, '#9fc8b8'], [1, '#bcdcd0']], 0, 30, 0, 120)));
  const main = ridgePath(w, 96, MAIN, 3105, 240);
  out.push(path(main, defs.linU([[0, '#4f9e57'], [0.5, '#46924f'], [1, '#5ca462']], 0, 40, 0, 200)));
  const clip = defs.clip(`<path d="${main}"/>`);
  const bumps = [];
  for (let i = 0; i < 900; i++) {
    const x = r() * w, top = ridgeY(w, 96, MAIN, 3105, x);
    const y = top + 3 + Math.pow(r(), 0.8) * (200 - top);
    const rr = 2.4 + r() * 2.8;
    const c = r() < 0.4 ? '#3f8a48' : r() < 0.6 ? '#4f9a52' : '#5aa85a';
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, c)));
    if (r() < 0.33) bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.35, y - rr * 0.4, rr * 0.45, '#82c078', { opacity: 0.8 })));
  }
  for (let i = 0; i < 10; i++) {
    const x = (i + 0.3 + r() * 0.4) * (w / 10), top = ridgeY(w, 96, MAIN, 3105, x) + 6;
    bumps.push(path(`M${x} ${top} Q${x + 6 + r() * 8} ${top + 36} ${x - 4 + r() * 8} ${top + 90}`, 'none', st('#2f7040', 6 + r() * 4, { opacity: 0.3 })));
  }
  // 岩はだ
  for (const x of [260, 820]) { const y = ridgeY(w, 96, MAIN, 3105, x) + 26; bumps.push(path(roundPoly([[x - 12, y + 16], [x - 6, y], [x + 8, y - 2], [x + 14, y + 18]], 4), '#9aa494', { opacity: 0.7 })); }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  out.push(path(main.replace(/ L\d+ 240 Z$/, '').replace(/^M0 240 L/, 'M'), 'none', st('#86c97c', 1.4, { opacity: 0.6 })));
  // ロープウェイのケーブルと小さなゴンドラ
  out.push(path('M380 196 L560 70', 'none', st('#4a5058', 0.6, { opacity: 0.8 })), path('M384 198 L564 72', 'none', st('#4a5058', 0.5, { opacity: 0.6 })));
  for (const u of [0.3, 0.72]) { const x = 380 + 180 * u, y = 196 - 126 * u; out.push(rect(x - 0.3, y, 0.6, 3, '#4a5058'), rrect(x - 2.4, y + 3, 4.8, 4, 1, '#e8f0f6'), rect(x - 2.4, y + 5.6, 4.8, 1, '#4a8fd8')); }
  out.push(rect(0, 150, w, 90, defs.linU([[0, '#d6ecf2', 0], [1, '#d6ecf2', 0.7]], 0, 150, 0, 200)));
  return tr(0, -20, out.join(''));
});

// ホテルのタワーと街（かすむ）
bgLayer('shinkobe', { f: 0.1, w: 1000, y: 40, h: 200 }, (defs, w) => {
  const r = rng(3201);
  const out = [];
  const cols = ['#e2e8ef', '#d3dce6', '#eef1f5', '#c9d4e0'];
  for (let x = -10; x < w;) {
    const bw = 12 + r() * 22, bh = 8 + Math.pow(r(), 1.6) * 34;
    const c = cols[Math.floor(r() * cols.length)], top = 196 - bh;
    out.push(wrap(w, x, bw, xx => {
      const p = [rect(xx, top, bw, bh + 10, c), rect(xx + bw * 0.74, top, bw * 0.26, bh + 10, shade(c, -0.07))];
      for (let yy = top + 3; yy < 194; yy += 4) for (let wx = xx + 2; wx < xx + bw - 2.5; wx += 3.6) p.push(rect(wx, yy, 1.8, 2, '#aec2d6', { opacity: 0.8 }));
      return p.join('');
    }));
    x += bw + r() * 3;
  }
  // 高いホテルのタワー（白・たてのすじ・王冠のような屋上）
  const tx = 300, tw = 40, ty = 70;
  out.push(rect(tx, ty, tw, 130, '#eef2f6'), rect(tx + tw - 10, ty, 10, 130, '#d5dde6'));
  for (let x = tx + 3; x < tx + tw - 4; x += 4) out.push(rect(x, ty + 4, 1.6, 124, '#b6c8da', { opacity: 0.8 }));
  out.push(path(`M${tx - 2} ${ty} L${tx + 4} ${ty - 10} L${tx + tw - 4} ${ty - 10} L${tx + tw + 2} ${ty} Z`, '#dfe6ee'), rect(tx + tw / 2 - 0.5, ty - 20, 1, 10, '#b9c4cf'));
  out.push(rect(tx + 8, ty - 14, 3, 4, '#e8eef4'), rect(tx + tw - 11, ty - 14, 3, 4, '#e8eef4'));
  // 低い商業ビル
  out.push(rect(tx + tw + 4, 150, 60, 50, '#e8e2d8'), rect(tx + tw + 4, 150, 60, 3, '#f6f2ea'));
  for (let x = tx + tw + 8; x < tx + tw + 60; x += 7) out.push(rect(x, 158, 4, 30, '#b5c6d6', { opacity: 0.8 }));
  for (let i = 0; i < 40; i++) { const x = r() * w, y = 194 + r() * 6; out.push(wrap(w, x - 10, 20, xx => clover(xx + 10, y, 4 + r() * 4, r() < 0.5 ? '#7cbf73' : '#8ccb7f', '#b3e0a2'))); }
  out.push(rect(0, 198, w, 60, '#b9d3be'));
  out.push(rect(0, 150, w, 60, defs.linU([[0, '#eaf5fb', 0], [1, '#eaf5fb', 0.4]], 0, 150, 0, 205)));
  return tr(0, -40, out.join(''));
});

// 新幹線の高架（防音かべ・橋げた）。この層のあとに新幹線が走る
bgLayer('shinkobe', { f: 0.2, w: 900, y: 120, h: 120 }, (defs, w) => {
  const r = rng(3301);
  const out = [];
  const TC = { trunk: '#6f5a46', dark: '#3f8a45', base: '#58a650', mid: '#4f9c48', light: '#96d27c' };
  // 高架の下の木
  for (let i = 0; i < 18; i++) { const x = r() * w; out.push(wrap(w, x - 20, 40, xx => cloverTree(xx + 20, 214 + r() * 6, 0.8 + r() * 0.5, r, TC))); }
  const dy = 128;
  out.push(rect(0, dy, w, 9, '#d4d8dd'), rect(0, dy, w, 2, '#f2f4f6'), rect(0, dy + 9, w, 3, '#a9b0b8'), rect(0, dy + 12, w, 2, '#000000', { opacity: 0.08 }));
  // 防音かべ
  out.push(rect(0, dy - 7, w, 7, '#e6e9ec'), rect(0, dy - 7, w, 1.4, '#ffffff'));
  for (let x = 0; x < w; x += 12) out.push(rect(x, dy - 7, 0.8, 7, '#c3c9d0'));
  // 橋脚
  for (let x = 30; x < w; x += 90) {
    out.push(path(`M${x - 6} ${dy + 12} L${x + 18} ${dy + 12} L${x + 14} ${dy + 20} L${x + 13} 230 L${x - 1} 230 L${x - 2} ${dy + 20} Z`, '#c1c7ce'), rect(x + 1, dy + 20, 3, 210 - dy, '#d8dde2'));
  }
  // 架線柱
  for (let x = 70; x < w; x += 90) out.push(rect(x, dy - 26, 1.6, 20, '#8a9098'), rect(x - 6, dy - 25, 14, 1.2, '#8a9098'));
  out.push(path(`M0 ${dy - 22} L${w} ${dy - 22}`, 'none', st('#4a4f57', 0.5, { opacity: 0.8 })));
  out.push(rect(0, 222, w, 30, '#b8c9b4'));
  return tr(0, -120, out.join(''));
});

// 駅前の並木と街灯
bgLayer('shinkobe', { f: 0.36, w: 820, y: 60, h: 180 }, (defs, w) => {
  const r = rng(3401);
  const out = [];
  const TC = { trunk: '#7a5a42', dark: '#3f8a3f', base: '#5dab4f', mid: '#54a048', light: '#9ad47c' };
  for (const x of [120, 470, 700]) out.push(wrap(w, x - 40, 80, xx => cloverTree(xx + 40, 222, 2.2, r, TC)));
  for (const x of [300, 620]) {
    out.push(rect(x - 1.2, 120, 2.4, 100, '#6b7280'), rect(x - 1.2, 120, 0.8, 100, '#9aa1ab'));
    out.push(rrect(x - 7, 116, 14, 4, 1.5, '#6b7280'), rect(x - 6, 120, 12, 1.4, '#ffffff', { opacity: 0.8 }));
  }
  return tr(0, -60, out.join(''));
});

bgLayer('shinkobe', { f: 1.32, w: 1300, y: 180, h: 60, fg: true }, (defs, w) => {
  const r = rng(3501);
  const blur = defs.blur(1.5);
  const out = [];
  for (const cx of [380, 900]) {
    const parts = [];
    for (let k = 0; k < 12; k++) { const x = cx + (k - 6) * 10 + r() * 8, y = 248 - r() * 8, rr = 10 + r() * 7; parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2f6c38' : '#377c3e', '#4f9a4c'))); }
    for (let k = 0; k < 6; k++) { const x = cx + (k - 3) * 14 + r() * 8; parts.push(wrap(w, x - 5, 10, xx => clover(xx, 236 + r() * 4, 3.4, '#f07aa6', '#ffd0e2'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -180, out.join(''));
});

// ========================================================================
// 布引の滝：背景
// ========================================================================
bgLayer('falls', { f: 0.025, w: 1200, y: 0, h: 100 }, (defs, w) => {
  const out = [];
  for (const [x, y, s] of [[200, 22, 0.7], [640, 14, 0.9], [1000, 30, 0.55]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffffff', '#dcebf0', '#ffffff')));
  return out.join('');
});

// 遠くの山なみ（青みどり・かすみ）
bgLayer('falls', { f: 0.04, w: 1100, y: 20, h: 220 }, (defs, w) => {
  const r = rng(4101);
  const out = [];
  out.push(path(ridgePath(w, 70, [[2, 20], [3, 10], [7, 4]], 4103, 240), '#b4d6d0'));
  const mid = ridgePath(w, 96, [[1, 14], [3, 14], [6, 6]], 4105, 240);
  out.push(path(mid, defs.linU([[0, '#8dbfa6'], [1, '#a9d0bf']], 0, 60, 0, 170)));
  const clip = defs.clip(`<path d="${mid}"/>`);
  const bumps = [];
  for (let i = 0; i < 420; i++) {
    const x = r() * w, top = ridgeY(w, 96, [[1, 14], [3, 14], [6, 6]], 4105, x), y = top + 3 + r() * (170 - top), rr = 2 + r() * 2.4;
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, r() < 0.5 ? '#80b69c' : '#96c6ae')));
  }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  out.push(rect(0, 110, w, 130, defs.linU([[0, '#e2f2ee', 0], [1, '#e2f2ee', 0.8]], 0, 110, 0, 180)));
  return tr(0, -20, out.join(''));
});

// 谷と布引ダム（石づくりのダム・あふれる水）
bgLayer('falls', { f: 0.1, w: 1000, y: 40, h: 200 }, (defs, w) => {
  const r = rng(4201);
  const out = [];
  const dx = 600, dwid = 110, dtop = 56;
  // 谷の両がわの森
  const ridge = ridgePath(w, 128, [[2, 14], [5, 8], [11, 3]], 4203, 240);
  // ダムのまわりは谷（低く）
  out.push(path(ridge, defs.linU([[0, '#5f9e6a'], [1, '#6ea878']], 0, 80, 0, 200)));
  const clip = defs.clip(`<path d="${ridge}"/>`);
  const bumps = [];
  for (let i = 0; i < 700; i++) {
    const x = r() * w, top = ridgeY(w, 128, [[2, 14], [5, 8], [11, 3]], 4203, x), y = top + 2 + Math.pow(r(), 0.8) * (210 - top), rr = 2.4 + r() * 3;
    const k = r(); const c = k < 0.35 ? '#4e8e5a' : k < 0.7 ? '#5f9e66' : k < 0.95 ? '#6cac70' : '#c9a25a';
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, c)));
    if (r() < 0.14) bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.35, y - rr * 0.4, rr * 0.45, '#9ccf94', { opacity: 0.6 })));
  }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  // ダムのまわりの高い山（谷のまん中にダム）
  const hill = `M${dx - 230} 200 Q${dx - 150} 30 ${dx - 30} 40 Q${dx + dwid / 2} 44 ${dx + dwid + 30} 40 Q${dx + dwid + 150} 30 ${dx + dwid + 230} 200 Z`;
  out.push(path(hill, '#5a9a64'));
  const hclip = defs.clip(`<path d="${hill}"/>`);
  const hb = [];
  for (let i = 0; i < 160; i++) { const x = dx - 220 + r() * (dwid + 440), y = 40 + r() * 160, rr = 2.6 + r() * 3; hb.push(circ(x, y, rr, r() < 0.4 ? '#4e8e5a' : r() < 0.8 ? '#5f9e66' : '#6cac70')); if (r() < 0.15) hb.push(circ(x - rr * 0.35, y - rr * 0.4, rr * 0.45, '#9ccf94', { opacity: 0.6 })); }
  out.push(g(hb.join(''), { 'clip-path': hclip }));
  // ダム：うしろの湖
  out.push(rect(dx - 10, dtop - 8, dwid + 20, 9, '#7fc0da'), rect(dx - 10, dtop - 8, dwid + 20, 1.4, '#c8ecf6'));
  // ダムの石のかべ（上がせまく下が広い）
  const face = `M${dx} ${dtop} L${dx + dwid} ${dtop} L${dx + dwid + 16} ${dtop + 62} L${dx - 16} ${dtop + 62} Z`;
  out.push(path(face, '#bdb4a2'));
  const fclip = defs.clip(`<path d="${face}"/>`);
  const blocks = [];
  for (let row = 0, y = dtop + 4; y < dtop + 62; row++, y += 4.4) {
    blocks.push(rect(dx - 20, y, dwid + 40, 0.7, '#958b78', { opacity: 0.9 }));
    for (let x = dx - 20 + (row % 2) * 4; x < dx + dwid + 20; x += 8) blocks.push(rect(x, y - 3.7, 0.7, 3.7, '#958b78', { opacity: 0.7 }));
  }
  // あふれる水（上から白いカーテン）
  blocks.push(path(`M${dx + 10} ${dtop} L${dx + dwid - 10} ${dtop} L${dx + dwid - 4} ${dtop + 34} Q${dx + dwid / 2} ${dtop + 44} ${dx + 4} ${dtop + 34} Z`, '#e8f4f7', { opacity: 0.85 }));
  for (let x = dx + 12; x < dx + dwid - 10; x += 2.6) blocks.push(path(`M${x} ${dtop + 1} L${x + (x - dx - dwid / 2) * 0.02} ${dtop + 34 + Math.sin(x) * 4}`, 'none', st('#bfe2ee', 0.5)));
  blocks.push(rect(dx - 20, dtop + 50, dwid + 40, 14, '#ffffff', { opacity: 0.6 }));
  out.push(g(blocks.join(''), { 'clip-path': fclip }));
  out.push(rect(dx - 3, dtop - 3, dwid + 6, 3.2, '#ddd6c6'), rect(dx - 3, dtop - 3, dwid + 6, 0.9, '#fbf8f0'));
  for (let x = dx - 2; x < dx + dwid + 3; x += 5) out.push(rect(x, dtop - 6, 0.7, 3, '#8f8676'));
  out.push(rect(dx - 3, dtop - 6.3, dwid + 6, 0.7, '#8f8676'));
  // 谷の両がわ（ダムのはしをかくす）
  for (const sd of [-1, 1]) {
    const ex = sd < 0 ? dx : dx + dwid;
    out.push(path(`M${ex + sd * 70} ${dtop - 24} Q${ex + sd * 4} ${dtop - 22} ${ex - sd * 12} ${dtop + 64} L${ex + sd * 90} ${dtop + 90} Z`, '#5a9a64'));
    for (let k = 0; k < 12; k++) { const u = r(), x = ex + sd * (4 + u * 60), y = dtop - 14 + r() * 80; out.push(circ(x, y, 2.4 + r() * 2.6, r() < 0.5 ? '#4e8e5a' : '#68a86c')); }
  }
  // ダムを遠くに見せるかすみ
  out.push(rect(dx - 100, dtop - 30, dwid + 200, 120, '#dcefee', { opacity: 0.28 }));
  // 手前の木（ダムの足もとをかくす）
  for (let i = 0; i < 16; i++) { const x = dx - 40 + r() * (dwid + 80), y = dtop + 64 + r() * 12; out.push(clover(x, y, 6 + r() * 4, r() < 0.5 ? '#4e8e5a' : '#5f9e66', '#9ccf94')); }
  out.push(rect(0, 150, w, 90, defs.linU([[0, '#e4f2ee', 0], [1, '#e4f2ee', 0.55]], 0, 150, 0, 215)));
  return tr(0, -40, out.join(''));
});

// 森（杉ともみじ・木もれ日）
bgLayer('falls', { f: 0.2, w: 960, y: 20, h: 220 }, (defs, w) => {
  const r = rng(4301);
  const out = [];
  // 奥の森のかたまり
  const ridge = ridgePath(w, 150, [[3, 12], [7, 6], [13, 3]], 4303, 240);
  out.push(path(ridge, '#3f7a4c'));
  const clip = defs.clip(`<path d="${ridge}"/>`);
  const bumps = [];
  for (let i = 0; i < 520; i++) {
    const x = r() * w, top = ridgeY(w, 150, [[3, 12], [7, 6], [13, 3]], 4303, x), y = top + 2 + r() * (230 - top), rr = 3 + r() * 4;
    bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx, y, rr, r() < 0.4 ? '#346c42' : r() < 0.7 ? '#40804c' : '#4c8e56')));
    if (r() < 0.12) bumps.push(wrap(w, x - rr, rr * 2, xx => circ(xx - rr * 0.35, y - rr * 0.4, rr * 0.45, '#72ae70', { opacity: 0.6 })));
  }
  out.push(g(bumps.join(''), { 'clip-path': clip }));
  // 杉（とがった木）
  const cedar = (x, y, s, c) => {
    const o = [rect(x - 1 * s, y - 10 * s, 2 * s, 10 * s, '#5a4436')];
    for (let k = 0; k < 5; k++) { const yy = y - 8 * s - k * 9 * s, ww = (12 - k * 2) * s; o.push(path(`M${x - ww} ${yy} L${x} ${yy - 14 * s} L${x + ww} ${yy} Z`, k % 2 ? c : shade(c, 0.08))); }
    o.push(path(`M${x} ${y - 56 * s} L${x - 3 * s} ${y - 46 * s} L${x} ${y - 47 * s} Z`, '#8cc48a', { opacity: 0.6 }));
    return o.join('');
  };
  for (let i = 0; i < 16; i++) { const x = (i + r() * 0.8) * (w / 16), s = 1.1 + r() * 0.8; out.push(wrap(w, x - 16 * s, 32 * s, xx => cedar(xx, 214 + r() * 10, s, r() < 0.5 ? '#2f6a40' : '#377446'))); }
  // もみじ（明るい黄みどり・ところどころ赤）
  for (let i = 0; i < 14; i++) {
    const x = r() * w, y = 170 + r() * 30, red = r() < 0.2;
    out.push(wrap(w, x - 22, 44, xx => {
      const o = [rect(xx - 1, y, 2, 30, '#5a4436')];
      for (let k = 0; k < 7; k++) o.push(clover(xx + (r() - 0.5) * 30, y + (r() - 0.5) * 14, 7 + r() * 4, red ? (k % 2 ? '#d9674a' : '#e88a4a') : (k % 2 ? '#7cbf5a' : '#90cc62'), red ? '#f6b27a' : '#c2e890'));
      return o.join('');
    }));
  }
  // 木もれ日（ななめの光の帯）
  for (const [x, ww] of [[120, 30], [420, 22], [700, 36]]) out.push(path(`M${x} 0 L${x + ww} 0 L${x + ww + 70} 240 L${x + 70} 240 Z`, defs.linU([[0, '#fff8d8', 0.32], [1, '#fff8d8', 0]], 0, 0, 0, 240)));
  out.push(rect(0, 160, w, 80, defs.linU([[0, '#dcefe6', 0], [1, '#dcefe6', 0.25]], 0, 160, 0, 230)));
  return tr(0, -20, out.join(''));
});

// 手前の大きな木の幹（こけ・木もれ日の光のつぶ）
bgLayer('falls', { f: 0.42, w: 860, y: 0, h: 240 }, (defs, w) => {
  const r = rng(4401);
  const out = [];
  for (const [x, tw] of [[150, 14], [520, 10], [700, 17]]) {
    out.push(path(`M${x - tw / 2} 0 L${x + tw / 2} 0 L${x + tw / 2 + 2} 222 L${x - tw / 2 - 4} 222 Z`, '#5b4a3e'));
    out.push(rect(x - tw / 2 + 2, 0, tw * 0.25, 222, '#7a6656', { opacity: 0.7 }));
    for (let k = 0; k < 5; k++) out.push(ell(x - tw / 2 + 2, 40 + k * 40 + r() * 14, 3, 7, '#6ea85a', { opacity: 0.8 }));
    // 上の葉
    for (let k = 0; k < 9; k++) { const lx = x + (r() - 0.5) * 90, ly = r() * 28; out.push(wrap(w, lx - 20, 40, xx => clover(xx, ly, 12 + r() * 8, k % 2 ? '#3f7f46' : '#4a8f4e', '#7cc070'))); }
  }
  // 光のつぶ
  for (let i = 0; i < 24; i++) { const x = r() * w, y = 30 + r() * 150; out.push(wrap(w, x - 3, 6, xx => circ(xx, y, 1.4 + r() * 1.6, '#fff6cc', { opacity: 0.35 }))); }
  return out.join('');
});

// 手前のシダ（ぼかし）
bgLayer('falls', { f: 1.32, w: 1300, y: 190, h: 50, fg: true }, (defs, w) => {
  const r = rng(4501);
  const blur = defs.blur(1.4);
  const out = [];
  for (const cx of [200, 720, 1100]) {
    const parts = [];
    for (let k = 0; k < 9; k++) {
      const x = cx + (k - 4.5) * 12 + r() * 6, y = 250, L = 24 + r() * 12, a = -Math.PI / 2 + (k - 4.5) * 0.18;
      const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
      parts.push(wrap(w, x - 30, 60, xx => {
        const o = [path(`M${xx} ${y} Q${xx + Math.cos(a) * L * 0.5 + 4} ${y + Math.sin(a) * L * 0.5} ${xx + (ex - x)} ${ey}`, 'none', st('#2c6030', 2.4))];
        for (let j = 1; j < 7; j++) { const u = j / 7, px = xx + (ex - x) * u, py = y + (ey - y) * u; o.push(ell(px - 3, py, 4 * (1 - u * 0.5), 1.6, '#357a3a', { rot: -30 }), ell(px + 3, py, 4 * (1 - u * 0.5), 1.6, '#3f8a42', { rot: 30 })); }
        return o.join('');
      }));
    }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -190, out.join(''));
});

// ========================================================================
// 地面
// ========================================================================
// 新神戸：みかげ石の広場・駅のかいだん・ホーム・高架
{
  const P = { colors: ['#c3c6cb', '#b9bdc3', '#cbced2', '#b3b8bf'], jitter: 0, round: 8, speck: true, gap: 7 };
  const mortar = '#8b9098';
  const body = (v) => [rect(0, 0, U, U, mortar), masonry([{ y0: 0, y1: 80, joints: [60], edge: '#bfc3c8' }, { y0: 80, y1: 160, joints: [20, 110], edge: '#c5c8cd' }], P, 5100 + v)].join('');
  const cap = { h: 36, base: '#e6e8eb', dark: '#9ea4ac', light: '#ffffff' };
  for (let v = 0; v < 3; v++) tile(`t/shinkobe/g/body${v}`, () => body(v));
  const top = (v) => [body(v + 3), rect(0, 34, U, 12, '#000000', { opacity: 0.2 }), rect(0, 0, U, 38, cap.dark), rect(0, 0, U, 32, cap.base), rect(0, 0, U, 5, cap.light), rect(0, 16, U, 2.5, '#cdd1d6'), rect(78, 5, 2.5, 27, '#cdd1d6'), v === 1 ? circ(40, 24, 2, '#c2c6cc') : ''].join('');
  for (let v = 0; v < 2; v++) tile(`t/shinkobe/g/top${v}`, () => top(v));
  tile('t/shinkobe/g/edgeL', defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/shinkobe/g/edgeR', defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tile('t/shinkobe/g/topL', () => [rect(0, 0, 10, 38, cap.dark), rect(0, 0, 6, 32, '#d6d9dd')].join(''));
  tile('t/shinkobe/g/topR', () => [rect(150, 0, 10, 38, cap.dark), rect(154, 0, 6, 32, '#d6d9dd')].join(''));
  for (const k of Object.keys(SLOPES)) tile(`t/shinkobe/g/${k}`, defs => slopeTile(defs, k, body(0), cap));
  // かいだん（石の段）
  tile('t/shinkobe/hard', () => [rect(0, 0, U, U, '#8e949c'), rect(0, 0, U, 150, '#b9bec5'), rect(4, 4, 152, 30, '#c9cdd3'), rect(0, 60, U, 3, '#a7adb5'), rect(0, 110, U, 3, '#a7adb5'), rect(0, 150, U, 10, '#7d838b')].join(''));
  tile('t/shinkobe/hardT', () => [rect(0, 0, U, 40, '#8e949c'), rect(0, 0, U, 34, '#eceef1'), rect(0, 0, U, 6, '#ffffff'), rect(0, 22, U, 6, '#e8b93a'), rect(0, 34, U, 8, '#000000', { opacity: 0.18 })].join(''));
  // ホーム（白いふち・黄色い点字ブロック）
  tile('t/shinkobe/m/platform/hard', () => [
    rect(0, 0, U, U, '#b8bcc2'), rect(0, 0, U, 14, '#ffffff'), rect(0, 14, U, 8, '#dde0e4'),
    rect(0, 26, U, 24, '#f2c230'), ...[0, 1, 2, 3, 4, 5, 6].map(i => circ(12 + i * 23, 38, 3.6, '#d9a816')),
    rect(0, 50, U, 60, '#c9cdd2'), rect(0, 110, U, 6, '#a3a8ae'), rect(0, 116, U, 44, '#9aa0a7'),
    rect(79, 56, 2, 50, '#b4b9bf')
  ].join(''));
  // 高架の駅の下（白いコンクリートのかべ・横のすじ）
  tile('t/shinkobe/m/rail/hard', () => [
    rect(0, 0, U, U, '#a8afb8'), rect(0, 0, U, 12, '#7f8791'), rect(0, 12, U, 4, '#c3c9d0'),
    rect(0, 58, U, 4, '#8f97a1'), rect(0, 62, U, 3, '#c0c6cd'), rect(0, 112, U, 4, '#8f97a1'), rect(0, 116, U, 3, '#c0c6cd'),
    rect(0, 0, 4, U, '#98a0aa'), rect(4, 0, 3, U, '#c0c6cd', { opacity: 0.7 }),
    rrect(34, 24, 92, 26, 4, '#8a939e'), rrect(38, 28, 84, 18, 3, '#6d7884'), ...[0, 1, 2, 3].map(k => rect(42 + k * 20, 30, 12, 3, '#9aa3ad')),
    circ(40, 90, 2, '#949ca6'), circ(120, 140, 2, '#949ca6')
  ].join(''));
}

// 布引の滝：苔の石垣・苔のふち・大きな岩・石の橋・清流
{
  const P = { colors: ['#8a948c', '#7f8a83', '#949e95', '#858f86', '#8f9790'], jitter: 14, round: 22, speck: true, gap: 9 };
  const mortar = '#4b544f';
  const moss = (seed, n) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) { const x = 10 + r() * 140, y = 10 + r() * 140; out.push(ell(x, y, 10 + r() * 12, 4 + r() * 3, r() < 0.5 ? '#5f9a4a' : '#6fae54', { opacity: 0.75 }), ell(x - 3, y - 1.5, 5, 1.6, '#a6d67e', { opacity: 0.6 })); }
    return out.join('');
  };
  const fernT = (x, y, s = 1) => [path(`M${x} ${y} Q${x + 8 * s} ${y - 16 * s} ${x + 24 * s} ${y - 22 * s}`, 'none', st('#3d7a33', 3)), ...[0, 1, 2, 3].map(k => ell(x + 4 * s + k * 5 * s, y - 5 * s - k * 5 * s, 6 * s, 2.4 * s, '#6fbf5a', { rot: -40 })), ...[0, 1, 2].map(k => ell(x + 10 * s + k * 4 * s, y - 4 * s - k * 6 * s, 5 * s, 2.2 * s, '#5aa84a', { rot: 30 }))].join('');
  const body = (v) => [
    rect(0, 0, U, U, mortar),
    masonry([{ y0: 0, y1: 76, edge: '#8a948c', joints: joints(42, 122, 5200 + v, 40, 72) }, { y0: 76, y1: 160, edge: '#848e87', joints: joints(18, 146, 5210 + v, 42, 74) }], P, 5230 + v),
    moss(5240 + v, v === 0 ? 1 : 2),
    v === 2 ? fernT(100, 150, 1.2) : '',
    v === 3 ? path('M40 10 q6 30 -2 60', 'none', st('#a8dcea', 4, { opacity: 0.45 })) : ''
  ].join('');
  const cap = { h: 40, base: '#62b04e', dark: '#3e8436', light: '#b4e88a' };
  for (let v = 0; v < 4; v++) tile(`t/falls/g/body${v}`, () => body(v));
  const top = (v) => {
    const out = [body(v + 4)];
    const wave = (y0, amp) => { let d = `M0 0 L160 0 L160 ${y0}`; for (let x = 160; x >= 0; x -= 20) d += ` Q${x + 10} ${y0 + amp * ((x / 20) % 2 ? 1.3 : -0.3)} ${x} ${y0}`; return d + ' Z'; };
    out.push(path(wave(cap.h + 12, 8), '#000000', { opacity: 0.22 }), path(wave(cap.h + 5, 9), cap.dark), path(wave(cap.h - 3, 7), cap.base));
    out.push(rect(0, 0, U, 6, cap.light), rect(0, 6, U, 3, '#8fd46a', { opacity: 0.8 }));
    for (const x of [16, 56, 96, 136]) out.push(circ(x + (v * 9) % 14, 20, 7, '#78c25e', { opacity: 0.8 }));
    if (v === 1) out.push(fernT(110, 30, 1), ...[[30, 18], [44, 24]].map(([x, y]) => [0, 72, 144, 216, 288].map(a => circ(x + Math.cos(a * Math.PI / 180) * 3, y + Math.sin(a * Math.PI / 180) * 3, 2.4, '#ffffff')).join('') + circ(x, y, 1.8, '#ffe45a')));
    if (v === 2) out.push(path('M20 44 q6 20 0 40', 'none', st('#3e8436', 3)), clover(20, 70, 8, '#5aa84a', '#9ad67a'), clover(26, 56, 7, '#6fbf5a'));
    return out.join('');
  };
  for (let v = 0; v < 3; v++) tile(`t/falls/g/top${v}`, () => top(v));
  tile('t/falls/g/edgeL', defs => rect(0, 0, 26, U, defs.lin([[0, '#000000', 0.34], [1, '#000000', 0]], 0, 0, 1, 0)));
  tile('t/falls/g/edgeR', defs => rect(134, 0, 26, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.34]], 0, 0, 1, 0)));
  tile('t/falls/g/topL', () => [path('M0 0 L14 0 Q10 30 16 50 L0 52 Z', cap.dark), path('M0 0 L10 0 Q7 22 10 40 L0 42 Z', cap.base), rect(0, 0, 10, 6, cap.light)].join(''));
  tile('t/falls/g/topR', () => [path('M160 0 L146 0 Q150 30 144 50 L160 52 Z', cap.dark), path('M160 0 L150 0 Q153 22 150 40 L160 42 Z', cap.base), rect(150, 0, 10, 6, cap.light)].join(''));
  // 坂：苔むした石段（段の線を入れる）
  for (const k of Object.keys(SLOPES)) tile(`t/falls/g/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    const steps = [];
    for (let x = 20; x < 160; x += 40) { const y = yl + (yr - yl) * x / 160; steps.push(rect(x - 2, y + 30, 5, 60, '#3f4843', { opacity: 0.5 })); }
    return slopeTile(defs, k, body(k.length % 4), cap) + g(steps.join(''), { 'clip-path': cp });
  });
  tile('t/falls/hard', () => [rrect(0, 0, U, U, 12, '#4f5a54'), rrect(5, 5, 150, 148, 10, '#8c978f'), path('M12 12 L148 12 L136 26 L26 26 L26 138 L12 148 Z', '#a8b2aa'), moss(5290, 1)].join(''));
  // 岩（苔むした石のブロック）
  const boulder = (v) => [
    rect(0, 0, U, U, '#3f4843'),
    path(roundPoly([[4, 6], [152, 4], [156, 152], [6, 156]], 30), '#5c6862'),
    path(roundPoly([[6, 4], [150, 8], [150, 142], [10, 146]], 28), v ? '#86918a' : '#8e9891'),
    path(roundPoly([[18, 12], [118, 10], [96, 40], [26, 48]], 16), '#a9b3ab', { opacity: 0.8 }),
    path('M58 84 L82 102 L76 126 M82 102 L106 96', 'none', st('#5c6862', 4)),
    ell(40, 140, 26, 8, '#5f9a4a', { opacity: 0.7 })
  ].join('');
  tile('t/falls/m/rock/hard', () => boulder(0));
  tile('t/falls/m/rock/hardT', () => [path('M0 0 L160 0 L160 30 Q120 44 80 34 Q40 46 0 32 Z', '#3e8436'), path('M0 0 L160 0 L160 22 Q120 34 80 26 Q40 36 0 24 Z', '#62b04e'), rect(0, 0, U, 6, '#b4e88a'), fernT(120, 26, 0.8)].join(''));
  // 砂子橋：石の橋（すり抜け足場と坂）
  const deck = [rect(0, 0, U, 70, '#6f756f'), rect(0, 0, U, 60, '#b9bcb4'), rect(0, 0, U, 8, '#eeeee6'), rect(0, 8, U, 4, '#d6d6cc'), rect(78, 12, 3, 48, '#9a9e96'), rect(0, 60, U, 10, '#000000', { opacity: 0.2 }), ell(30, 58, 20, 5, '#6fae54', { opacity: 0.6 })].join('');
  tile('t/falls/m/wood/semi', () => deck);
  for (const k of Object.keys(SLOPES)) tile(`t/falls/m/wood/${k}`, () => {
    const [yl, yr] = SLOPES[k];
    return [
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 70} L0 ${yl + 70} Z`, '#6f756f'),
      path(`M0 ${yl} L160 ${yr} L160 ${yr + 60} L0 ${yl + 60} Z`, '#b9bcb4'),
      path(`M0 ${yl + 3} L160 ${yr + 3}`, 'none', { stroke: '#eeeee6', strokeWidth: 8 }),
      path(`M80 ${(yl + yr) / 2 + 10} L80 ${(yl + yr) / 2 + 58}`, 'none', { stroke: '#9a9e96', strokeWidth: 3 })
    ].join('');
  });
  // 清流の水（すきとおった青みどり）
  for (let fr = 0; fr < 4; fr++) {
    water(`t/falls/waterT${fr}`, ['#e6fbfb', '#62c3d6', '#2c88a6', '#ffffff'], fr, true);
    water(`t/falls/water${fr}`, ['#e6fbfb', '#62c3d6', '#2c88a6', '#ffffff'], fr, false);
  }
}

// ========================================================================
// 飾り：新神戸
// ========================================================================
// 新幹線（N700ふう：白・青い線・長い鼻）。足もと = ホームの高さ
const SK = { white: '#f7f9fb', shade: '#dfe5eb', blue: '#1f4fb4', win: '#34425a', skirt: '#cfd6de' };
sprite(SH, 's3/shinCar', 64, 30, 0, 29, () => tr(0, 29, [
  rect(0, -272, 640, 256, SK.white), rect(0, -272, 640, 16, '#e7ecf1'), rect(0, -256, 640, 10, '#ffffff'),
  rect(0, -56, 640, 40, SK.skirt), rect(0, -16, 640, 16, '#5d6470'),
  rect(0, -112, 640, 26, SK.blue), rect(0, -128, 640, 6, SK.blue),
  ...[0, 1, 2, 3, 4, 5].map(i => [rrect(110 + i * 82, -218, 60, 46, 8, SK.win), path(`M${116 + i * 82} -212 L${138 + i * 82} -212 L${116 + i * 82} -180 Z`, '#ffffff', { opacity: 0.35 })].join('')),
  // ドア
  rrect(24, -236, 64, 192, 6, 'none', { stroke: '#c3cad2', strokeWidth: 4 }), rrect(38, -214, 36, 50, 6, SK.win),
  rect(634, -262, 6, 250, '#aab3bd')
], 0.1));
sprite(SH, 's3/shinNose', 90, 30, 0, 29, () => tr(0, 29, [
  path('M0 -272 L260 -272 C400 -270 470 -236 560 -176 C640 -124 740 -96 880 -78 Q896 -60 880 -34 L860 -16 L0 -16 Z', SK.white),
  path('M0 -272 L260 -272 C380 -270 450 -244 520 -206 L0 -206 Z', '#ffffff', { opacity: 0.7 }),
  path('M0 -56 L840 -56 Q870 -46 862 -30 L850 -16 L0 -16 Z', SK.skirt), rect(0, -16, 820, 16, '#5d6470'),
  path('M0 -112 L700 -112 C780 -104 840 -94 884 -80 L886 -66 C830 -78 760 -86 690 -86 L0 -86 Z', SK.blue),
  path('M0 -128 L560 -128 L600 -122 L0 -122 Z', SK.blue),
  ...[0, 1].map(i => [rrect(110 + i * 82, -218, 60, 46, 8, SK.win), path(`M${116 + i * 82} -212 L${138 + i * 82} -212 L${116 + i * 82} -180 Z`, '#ffffff', { opacity: 0.35 })].join('')),
  // 運転席の窓
  path('M330 -250 C400 -250 460 -230 520 -196 L500 -178 C440 -206 390 -222 330 -222 Z', SK.win), path('M340 -246 L380 -246 L352 -224 Z', '#ffffff', { opacity: 0.4 }),
  ell(820, -70, 16, 7, '#fff6c8'), ell(820, -70, 26, 10, '#fff6c8', { opacity: 0.35 }),
  rrect(24, -236, 64, 192, 6, 'none', { stroke: '#c3cad2', strokeWidth: 4 })
], 0.1));

// ホームの屋根（48ドットごと）。0:発車案内 1:時計 2:号車の案内
for (let v = 0; v < 3; v++) sprite(SH, `s3/roof${v}`, 48, 72, 0, 71, defs => {
  const out = [];
  out.push(rect(222, -580, 32, 580, '#e4e8ec'), rect(222, -580, 10, 580, '#ffffff', { opacity: 0.7 }), rect(246, -580, 8, 580, '#bcc3cb'));
  out.push(rect(212, -40, 52, 40, '#9aa2ab'));
  out.push(path('M238 -560 L110 -640 L130 -646 L238 -582 L346 -646 L366 -640 Z', '#cfd5dc'));
  out.push(rect(0, -680, 480, 46, '#eef1f4'), rect(0, -690, 480, 12, '#b3bcc6'), rect(0, -690, 480, 4, '#dfe5ea'), rect(0, -636, 480, 14, '#aab3bd'), rect(0, -622, 480, 8, '#000000', { opacity: 0.08 }));
  out.push(rrect(60, -610, 110, 8, 4, '#ffffff'), rrect(310, -610, 110, 8, 4, '#ffffff'), rect(60, -602, 110, 14, '#fffbe8', { opacity: 0.35 }), rect(310, -602, 110, 14, '#fffbe8', { opacity: 0.35 }));
  if (v === 0) {
    out.push(path('M330 -622 L330 -560 M430 -622 L430 -560', 'none', st('#6b737c', 4)));
    out.push(rrect(300, -566, 170, 76, 6, '#23252b'), rect(312, -554, 146, 22, '#101114'), rect(312, -526, 146, 22, '#101114'));
    for (let i = 0; i < 9; i++) out.push(rect(316 + i * 15.5, -550, 10, 14, i < 3 ? '#ff9a2a' : '#ffd24a', { opacity: 0.9 }), rect(316 + i * 15.5, -522, 10, 14, i < 3 ? '#5ad07a' : '#ffffff', { opacity: i === 8 ? 0 : 0.85 }));
  } else if (v === 1) {
    out.push(path('M110 -622 L110 -580', 'none', st('#6b737c', 5)), circ(110, -530, 48, '#3a3f46'), circ(110, -530, 40, '#ffffff'), path('M110 -530 L110 -560 M110 -530 L132 -522', 'none', st('#23252b', 6)), circ(110, -530, 5, '#e2453a'));
  } else {
    out.push(path('M360 -622 L360 -590', 'none', st('#6b737c', 4)), rrect(320, -594, 80, 60, 8, '#2f5fb8'), rrect(330, -584, 60, 40, 6, '#ffffff'));
  }
  return tr(0, 71, out.join(''), 0.1);
});

// 駅の建物（高架の駅の東のはし・ガラスのかべ）。文字: (x+66, y-106)
sprite(SH, 's3/station', 150, 150, 0, 149, defs => {
  const Gd = G(defs), out = [];
  const W = 1480;
  // 屋根（ホームの屋根のつづき・ゆるいアーチ）
  out.push(path(`M0 -1400 Q${W / 2} -1480 ${W} -1400 L${W} -1330 L0 -1330 Z`, '#dfe4e9'), path(`M0 -1400 Q${W / 2} -1480 ${W} -1400`, 'none', st('#ffffff', 8)), rect(0, -1340, W, 16, '#aab3bd'));
  // 上のかべ（白いパネル）
  out.push(rect(0, -1330, W, 540, '#f2f4f6'), rect(0, -1330, W, 540, Gd.wallShade));
  for (let x = 120; x < W; x += 160) out.push(rect(x, -1330, 4, 540, '#dde2e7'));
  out.push(rect(0, -1100, W, 4, '#dde2e7'));
  // 駅名の看板
  out.push(rrect(300, -1200, 720, 190, 14, '#1f3f76'), rrect(314, -1186, 692, 162, 10, '#24498a'), rect(330, -1180, 660, 10, '#ffffff', { opacity: 0.18 }));
  // 高架の線路の高さのすじ
  out.push(rect(0, -800, W, 26, '#c8ced5'), rect(0, -780, W, 10, '#000000', { opacity: 0.08 }));
  // ガラスのかべ（コンコース）
  out.push(rect(0, -770, W, 560, '#9fc6de'), rect(0, -770, W, 560, defs.lin([[0, '#ffffff', 0.25], [1, '#1f3f5f', 0.2]])));
  for (let x = 0; x <= W; x += 120) out.push(rect(x, -770, 10, 560, '#e6eaee'));
  for (let y = -770; y < -210; y += 140) out.push(rect(0, y, W, 8, '#e6eaee'));
  out.push(path('M60 -760 L260 -760 L60 -500 Z', '#ffffff', { opacity: 0.3 }), path('M700 -760 L780 -760 L560 -220 L480 -220 Z', '#ffffff', { opacity: 0.18 }));
  // 中の人かげ・明かり
  for (const [x, c] of [[200, '#e87a6a'], [520, '#5a8ad0'], [900, '#f2c94c'], [1200, '#7ac07a']]) out.push(circ(x, -300, 16, '#3a3a44', { opacity: 0.35 }), rrect(x - 16, -284, 32, 60, 10, c, { opacity: 0.45 }));
  // 入り口のひさし・自動ドア
  out.push(rect(-20, -220, W + 40, 30, '#8f98a3'), rect(-20, -220, W + 40, 8, '#c9d0d7'));
  out.push(rect(0, -190, W, 190, '#dfe4e9'));
  for (const x of [400, 820]) out.push(rect(x, -180, 240, 180, '#7aa6c4'), rect(x + 118, -180, 4, 180, '#e6eaee'), path(`M${x + 10} -176 L${x + 60} -176 L${x + 10} -110 Z`, '#ffffff', { opacity: 0.4 }));
  out.push(rect(0, -20, W, 20, '#b8bec6'));
  return tr(0, 149, out.join(''), 0.1);
});

// 広場の時計の柱
sprite(SH, 's3/clock', 20, 62, 10, 61, () => tr(10, 61, [
  rrect(-40, -40, 80, 40, 8, '#7b828c'), rect(-12, -520, 24, 480, '#8a919b'), rect(-12, -520, 8, 480, '#b3b9c1'),
  circ(0, -560, 60, '#5d646e'), circ(0, -560, 50, '#ffffff'), circ(0, -560, 50, 'none', { stroke: '#dfe3e8', strokeWidth: 4 }),
  path('M0 -560 L0 -596 M0 -560 L24 -548', 'none', st('#23252b', 6)), circ(0, -560, 5, '#e2453a'),
  ...[0, 1, 2, 3].map(k => rect(-2 + Math.cos(k * Math.PI / 2) * 40, -562 + Math.sin(k * Math.PI / 2) * 40, 4, 4, '#5d646e'))
], 0.1));
// 植えこみ（ツツジ）
sprite(SH, 's3/planter', 50, 24, 25, 23, () => {
  const r = rng(5301), out = [];
  out.push(rect(-240, -90, 480, 90, '#b9bec5'), rect(-240, -90, 480, 14, '#dde0e4'), rect(-240, -10, 480, 10, '#9aa0a7'));
  for (let i = 0; i < 14; i++) out.push(cloverBlob(-210 + i * 32, -110 - r() * 30, 36, '#3f8a3f'));
  for (let i = 0; i < 14; i++) out.push(cloverBlob(-210 + i * 32, -120 - r() * 30, 32, i % 2 ? '#5dab4f' : '#52a048', '#9ad47c'));
  for (let i = 0; i < 16; i++) { const x = -220 + r() * 440, y = -150 + r() * 40; out.push(circ(x, y, 9, r() < 0.5 ? '#ff7aa6' : '#ffffff'), circ(x, y, 3, '#ffe45a')); }
  return tr(25, 23, out.join(''), 0.1);
});
// 駅前のケヤキ
sprite(SH, 's3/ztree', 56, 74, 28, 73, () => {
  const r = rng(5311), out = [];
  out.push(ell(0, -4, 150, 22, '#000000', { opacity: 0.1 }));
  out.push(path('M-24 0 C-16 -120 -34 -200 -90 -300 L-70 -310 C-30 -250 -10 -220 0 -330 L20 -328 C18 -230 32 -160 80 -270 L98 -256 C44 -160 28 -90 26 0 Z', '#7a5a42'));
  out.push(rrect(-80, -40, 160, 40, 6, '#9aa0a7'), rect(-80, -40, 160, 8, '#c9cdd2'));
  const blobs = [];
  for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 210 * d, -460 + Math.sin(a) * 150 * d, 60 + r() * 30]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#3a7f3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 600) / 300; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4f9a45' : r() < 0.5 ? '#5dab4f' : '#68b758', t < 0.5 ? '#a6dc84' : null)); }
  return tr(28, 73, out.join(''), 0.1);
});

// ========================================================================
// 飾り：布引の滝
// ========================================================================
// もみじの木（0: 青もみじ 1: 赤いもみじ）
for (let v = 0; v < 2; v++) sprite(SH, `s3/maple${v}`, 66, 74, 33, 73, () => {
  const r = rng(5401 + v), out = [];
  const C = v ? { dark: '#b8452f', base: '#e0643e', mid: '#ec8446', light: '#ffc07a' } : { dark: '#3f8a3c', base: '#6cbf52', mid: '#80cc5e', light: '#c8f09a' };
  out.push(ell(0, -4, 200, 22, '#000000', { opacity: 0.12 }));
  out.push(path('M-20 0 C-10 -100 -40 -170 -120 -250 L-104 -264 C-40 -210 -12 -190 -2 -280 L16 -280 C18 -200 40 -170 120 -240 L134 -226 C60 -160 30 -100 26 0 Z', '#6a5040'));
  out.push(path('M4 0 C6 -100 8 -180 8 -270 L16 -270 C16 -180 20 -100 22 0 Z', '#86685a', { opacity: 0.8 }));
  const blobs = [];
  for (let i = 0; i < 24; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 250 * d, -420 + Math.sin(a) * 140 * d, 56 + r() * 28]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, C.dark));
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by, br * 0.9, r() < 0.5 ? C.base : C.mid, by < -440 ? C.light : null));
  // ふちの葉（もみじの形）
  for (let i = 0; i < 26; i++) { const a = r() * TAU, x = Math.cos(a) * 270, y = -420 + Math.sin(a) * 160; out.push(mapleLeaf(x, y, 22 + r() * 8, r() < 0.5 ? C.base : C.mid, r())); }
  for (let i = 0; i < 10; i++) out.push(mapleLeaf(-200 + r() * 400, -520 + r() * 200, 14, C.light, r()));
  return tr(33, 73, out.join(''), 0.1);
});
// 杉
sprite(SH, 's3/cedar', 40, 100, 20, 99, () => {
  const out = [rect(-18, -200, 36, 200, '#5a4436'), rect(-18, -200, 10, 200, '#7a6252')];
  for (let k = 0; k < 7; k++) { const y = -140 - k * 110, ww = 190 - k * 22; out.push(path(`M${-ww} ${y + 20} Q0 ${y - 20} ${ww} ${y + 20} L0 ${y - 170} Z`, k % 2 ? '#2f6a40' : '#377648'), path(`M${-ww * 0.7} ${y + 6} L0 ${y - 150} L${-ww * 0.2} ${y + 4} Z`, '#4f8e5a', { opacity: 0.6 })); }
  return tr(20, 99, out.join(''), 0.1);
});
// 苔むした岩
for (let v = 0; v < 2; v++) sprite(SH, `s3/boulder${v}`, 40, 22, 20, 21, () => {
  const r = rng(5501 + v);
  const pts = v ? [[-190, 10], [-170, -110], [-40, -190], [120, -160], [190, -40], [180, 10]] : [[-160, 10], [-150, -90], [-30, -150], [100, -130], [170, -30], [160, 10]];
  return tr(20, 21, [
    path(roundPoly(pts, 40), '#5c6862'), path(roundPoly(pts.map(([x, y]) => [x * 0.94, y - 8]), 40), '#8a958d'),
    path(roundPoly([[pts[1][0] * 0.8, pts[1][1] * 0.9], [pts[2][0] * 0.8, pts[2][1] * 0.98], [pts[3][0] * 0.8, pts[3][1] * 0.9], [0, pts[2][1] * 0.6]], 30), '#62b04e'),
    path(roundPoly([[pts[1][0] * 0.6, pts[1][1] * 0.95], [pts[2][0] * 0.6, pts[2][1] * 0.98], [0, pts[2][1] * 0.8]], 20), '#9ad67a', { opacity: 0.8 }),
    ...Array.from({ length: 5 }, () => circ(-100 + r() * 200, -40 - r() * 40, 5, '#6f7a73', { opacity: 0.6 }))
  ].join(''), 0.1);
});
// 石どうろう（苔つき）
sprite(SH, 's3/lantern', 20, 34, 10, 33, () => tr(10, 33, [
  rrect(-70, -40, 140, 40, 8, '#8a9089'), rect(-24, -170, 48, 130, '#9aa099'), rrect(-60, -200, 120, 34, 6, '#8a9089'),
  rect(-44, -270, 88, 70, '#a6aca5'), rect(-24, -256, 48, 44, '#4a4f4a'), rect(-20, -252, 40, 36, '#ffe9a8', { opacity: 0.5 }),
  path('M-86 -270 L0 -320 L86 -270 Z', '#8a9089'), rect(-86, -276, 172, 10, '#7a8079'), circ(0, -330, 14, '#8a9089'),
  ell(-40, -300, 30, 10, '#62b04e', { opacity: 0.85 }), ell(30, -40, 36, 8, '#62b04e', { opacity: 0.7 })
], 0.1));
// 歌碑（石にきざんだ歌）
sprite(SH, 's3/kahi', 26, 30, 13, 29, () => tr(13, 29, [
  path(roundPoly([[-110, 0], [-120, -200], [-60, -280], [90, -260], [120, -120], [110, 0]], 30), '#6f7a74'),
  path(roundPoly([[-100, -10], [-108, -196], [-56, -266], [80, -248], [106, -120], [98, -10]], 26), '#9aa49d'),
  ...[-50, -20, 10, 40].map(x => path(`M${x} -220 L${x} -60`, 'none', st('#6f7a74', 5, { strokeDasharray: '14 10' }))),
  ell(-60, -250, 40, 12, '#62b04e', { opacity: 0.8 }), rect(-130, -10, 260, 10, '#5c6862')
], 0.1));
// シダのしげみ
sprite(SH, 's3/fern', 34, 20, 17, 19, () => {
  const out = [];
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.32, L = 150 + (3 - Math.abs(k - 3)) * 20, ex = Math.cos(a) * L, ey = Math.sin(a) * L;
    out.push(path(`M0 0 Q${ex * 0.5 + 10} ${ey * 0.5 - 10} ${ex} ${ey}`, 'none', st('#3d7a33', 4)));
    for (let j = 1; j < 8; j++) { const u = j / 8, px = ex * u, py = ey * u, s = 1 - u * 0.6; out.push(ell(px - 12 * s, py + 2, 16 * s, 6 * s, k % 2 ? '#5aa84a' : '#6fbf5a', { rot: -30 }), ell(px + 12 * s, py + 2, 16 * s, 6 * s, k % 2 ? '#6fbf5a' : '#5aa84a', { rot: 30 })); }
  }
  return tr(17, 19, out.join(''), 0.1);
});

// 滝のうしろのがけ（ぬれた岩・苔・シダ）。水の通り道は暗くして、白い滝が見やすいように
// ch: 水の通り道の [まん中x, はば]（ドット、スプライトの左はしから）
function cliff(defs, W, H, chans, seed) {
  const r = rng(seed);
  const out = [];
  const w10 = W * 10, h10 = H * 10;
  // がけの形（上はせまく、下は広い。ふちはごつごつ）
  const L = [], R = [];
  for (let y = -h10; y <= 0; y += 120) {
    const t = (y + h10) / h10;
    L.push([90 - t * 70 + (r() - 0.5) * 50, y]);
    R.push([w10 - 90 + t * 70 + (r() - 0.5) * 50, y]);
  }
  const outline = [...L, [0, 40], [w10, 40], ...R.reverse()];
  const shapeD = roundPoly(outline, 30);
  const body = [];
  body.push(rect(0, -h10, w10, h10 + 40, '#58645f'));
  for (let row = 0; row < H / 22; row++) {
    for (let x = -40 + (row % 2) * 60; x < w10 + 40; x += 110 + r() * 50) {
      const y = -h10 + row * 220 + (r() - 0.5) * 30, ww = 120 + r() * 60, hh = 200 + r() * 40;
      const c = r() < 0.5 ? '#687570' : '#6f7c76';
      body.push(path(roundPoly([[x, y + hh], [x + 10, y + 20], [x + ww * 0.6, y], [x + ww, y + 30], [x + ww - 10, y + hh]], 30), shade(c, -0.16)));
      body.push(path(roundPoly([[x + 6, y + hh - 16], [x + 14, y + 22], [x + ww * 0.6, y + 6], [x + ww - 8, y + 34], [x + ww - 16, y + hh - 16]], 28), c));
      body.push(path(`M${x + 20} ${y + 30} L${x + ww * 0.55} ${y + 12}`, 'none', st('#8a9892', 8, { opacity: 0.7 })));
      if (r() < 0.5) body.push(ell(x + ww * 0.5, y + 16, ww * 0.35, 14, '#5a9a48', { opacity: 0.85 }), ell(x + ww * 0.4, y + 10, ww * 0.18, 6, '#8fcc6a', { opacity: 0.7 }));
    }
  }
  // 水の通り道（暗くぬれた岩）と、段になった滝のしぶき
  for (const [cx, cw] of chans) {
    const x0 = (cx - cw / 2 - 5) * 10, x1 = (cx + cw / 2 + 5) * 10;
    body.push(path(`M${x0} ${-h10} L${x1} ${-h10} L${x1 + 30} 0 L${x0 - 30} 0 Z`, '#2f3a39'));
    body.push(rect(x0 + 40, -h10, x1 - x0 - 80, h10, defs.lin([[0, '#bfe6f2', 0.35], [1, '#e6f8fb', 0.55]])));
    for (const ty of [0.34, 0.66]) {
      const y = -h10 * (1 - ty);
      body.push(path(`M${x0 - 90} ${y + 30} Q${(x0 + x1) / 2} ${y - 40} ${x1 + 90} ${y + 30} L${x1 + 80} ${y + 70} L${x0 - 80} ${y + 70} Z`, '#3c4846'));
      body.push(path(`M${x0 - 90} ${y + 30} Q${(x0 + x1) / 2} ${y - 40} ${x1 + 90} ${y + 30}`, 'none', st('#7d8c86', 10)));
      const n = 9;
      for (let k = 0; k < n; k++) { const xx = x0 - 80 + k * (x1 - x0 + 160) / (n - 1), yy = y + 18 - Math.sin(k / (n - 1) * Math.PI) * 30; body.push(circ(xx, yy, 38 + (k % 3) * 12, '#eef9fc', { opacity: 0.92 })); }
      for (let k = 0; k < 6; k++) body.push(path(`M${x0 - 60 + k * (x1 - x0 + 120) / 5} ${y + 40} l${(k - 2.5) * 6} 110`, 'none', st('#d8f1f8', 10, { opacity: 0.7 })));
    }
  }
  // シダ（かべのはし）
  for (let i = 0; i < 10; i++) {
    const side = i % 2, x = side ? w10 - 110 - r() * 60 : 110 + r() * 60, y = -h10 * (0.2 + r() * 0.65);
    for (let k = 0; k < 4; k++) { const a = (side ? Math.PI : 0) + (side ? 1 : -1) * (0.4 + k * 0.3), Ln = 80 + r() * 30; body.push(path(`M${x} ${y} q${Math.cos(a) * Ln * 0.5} ${Math.sin(a) * Ln * 0.5 - 20} ${Math.cos(a) * Ln} ${Math.sin(a) * Ln}`, 'none', st(k % 2 ? '#5aa84a' : '#6fbf5a', 11))); }
  }
  const cp = defs.clip(`<path d="${shapeD}"/>`);
  out.push(g(body.join(''), { 'clip-path': cp }));
  out.push(path(shapeD, 'none', st('#3f4a46', 8, { opacity: 0.5 })));
  // ふちの木と苔（上からおおいかぶさる）
  for (let i = 0; i < 18; i++) {
    const top = i < 10, x = top ? (r() < 0.5 ? r() * w10 * 0.32 : w10 * 0.68 + r() * w10 * 0.32) : (i % 2 ? w10 - 40 - r() * 80 : 40 + r() * 80);
    const y = top ? -h10 + r() * 180 : -h10 * (0.3 + r() * 0.5);
    const rr = top ? 70 + r() * 36 : 40 + r() * 20;
    out.push(cloverBlob(x, y + 12, rr, '#2f6a36'), cloverBlob(x, y, rr * 0.92, r() < 0.5 ? '#4f9a48' : '#5aa850', '#9ad67a'));
  }
  return out.join('');
}
sprite(SH, 's3/cliff1', 84, 216, 42, 216, defs => tr(42, 216, tr(-420, 0, cliff(defs, 84, 216, [[42, 32]], 5601)), 0.1));
sprite(SH, 's3/cliff2', 130, 216, 65, 216, defs => tr(65, 216, tr(-650, 0, cliff(defs, 130, 216, [[25, 16], [105, 16]], 5602)), 0.1));
sprite(SH, 's3/cliff3', 116, 216, 58, 216, defs => tr(58, 216, tr(-580, 0, cliff(defs, 116, 216, [[58, 48]], 5603)), 0.1));

// 砂子橋のアーチ（石・下は深い谷と流れ）。足もと = 橋の上の面
sprite(SH, 's3/arch', 190, 80, 95, 4, defs => {
  const out = [];
  const R = 760;
  // 谷
  out.push(path('M-900 60 L900 60 L900 760 L-900 760 Z', defs.lin([[0, '#3a4a44'], [1, '#1f2a28']])));
  out.push(path('M-600 700 Q0 640 600 700 L600 760 L-600 760 Z', '#5fb8d6', { opacity: 0.8 }), path('M-500 690 Q0 650 500 690', 'none', st('#dff6fb', 6, { opacity: 0.8 })));
  // 石のかべ（アーチのまわり）
  out.push(path(`M-950 60 L950 60 L950 760 L${R} 760 A${R} ${R * 0.8} 0 0 0 ${-R} 760 L-950 760 Z`, '#8f978f'));
  const clipP = `M-950 60 L950 60 L950 760 L${R} 760 A${R} ${R * 0.8} 0 0 0 ${-R} 760 L-950 760 Z`;
  const cp = defs.clip(`<path d="${clipP}"/>`);
  const bl = [];
  for (let row = 0, y = 70; y < 760; row++, y += 60) for (let x = -950 + (row % 2) * 60; x < 950; x += 120) bl.push(rect(x + 4, y + 4, 112, 52, (row + Math.floor(x / 120)) % 3 ? '#a1a89f' : '#98a097'), rect(x + 4, y + 4, 112, 8, '#b6bcb2', { opacity: 0.7 }));
  out.push(g(bl.join(''), { 'clip-path': cp }));
  // アーチの石（くさび）
  for (let k = 0; k <= 16; k++) {
    const a = Math.PI + k / 16 * Math.PI, a2 = Math.PI + (k + 1) / 16 * Math.PI;
    if (k === 16) break;
    const p = (ang, rr) => [Math.cos(ang) * rr, 760 + Math.sin(ang) * rr * 0.8];
    out.push(poly([p(a + 0.01, R), p(a2 - 0.01, R), p(a2 - 0.01, R + 90), p(a + 0.01, R + 90)], k % 2 ? '#b4bab0' : '#a9b0a6'));
  }
  // 苔とシダ
  out.push(ell(-700, 80, 120, 20, '#5a9a48', { opacity: 0.8 }), ell(640, 90, 140, 22, '#5a9a48', { opacity: 0.8 }), ell(-200, 70, 90, 14, '#6fae54', { opacity: 0.7 }));
  for (const x of [-860, 820]) for (let k = 0; k < 4; k++) out.push(path(`M${x} 120 q${(k - 1.5) * 30} 60 ${(k - 1.5) * 50} 140`, 'none', st(k % 2 ? '#5aa84a' : '#6fbf5a', 10)));
  return tr(95, 4, out.join(''), 0.1);
});

// 雄滝の茶屋（木の小屋・赤い毛せんの長いす・のぼり）。文字: (x+30, y-47)
sprite(SH, 's3/teahouse', 100, 76, 0, 75, defs => {
  const Gd = G(defs), out = [];
  out.push(rect(0, -470, 640, 470, '#a8784c'), rect(0, -470, 640, 470, Gd.wallShade));
  for (let x = 20; x < 640; x += 40) out.push(rect(x, -470, 4, 470, '#8a5e3a', { opacity: 0.8 }));
  out.push(path('M-60 -460 L100 -600 L540 -600 L700 -460 Z', '#5a6068'), rect(-70, -470, 780, 22, '#3f454c'));
  for (let i = 1; i < 5; i++) out.push(rect(-60 + i * 32, -460 - i * 28, 760 - i * 64, 4, '#737a83', { opacity: 0.7 }));
  out.push(rect(60, -400, 300, 250, '#4a3a2e'), rect(60, -400, 300, 250, Gd.inShade), rect(60, -400, 300, 60, '#f3ead8'));
  for (let x = 60; x < 360; x += 50) out.push(rect(x, -400, 6, 60, '#8a5e3a'));
  out.push(board(80, -560, 360, 90, '#fff6e2', '#6a4430', 10));
  // のれん
  for (let i = 0; i < 4; i++) out.push(rect(400 + i * 50, -400, 46, 150, '#2d4f8a'));
  out.push(rect(396, -406, 208, 12, '#3a2418'));
  // 長いす
  out.push(rect(40, -130, 560, 26, '#d83a3a'), rect(40, -130, 560, 8, '#ff6a5a'), rect(70, -104, 16, 104, '#6a4430'), rect(560, -104, 16, 104, '#6a4430'));
  // 赤いかさ
  out.push(path('M760 -40 L760 -520', 'none', st('#6a4430', 10)), path('M560 -440 Q760 -620 960 -440 Z', '#d8403a'), path('M560 -440 Q660 -470 760 -440 Q860 -470 960 -440', 'none', st('#b8302a', 6)));
  for (let k = 0; k < 8; k++) out.push(path(`M760 -560 L${580 + k * 50} -446`, 'none', st('#f6d8c8', 2, { opacity: 0.6 })));
  out.push(rect(640, -140, 240, 20, '#d83a3a'), rect(660, -120, 12, 120, '#6a4430'), rect(850, -120, 12, 120, '#6a4430'));
  // のぼり
  out.push(rect(-40, -560, 8, 560, '#6a4430'), rect(-32, -540, 70, 300, '#e84a3a'), rect(-32, -540, 70, 20, '#ffffff'));
  return tr(0, 75, out.join(''), 0.1);
});

// 道しるべ（木の柱）。文字はゲームで描く: (x, y-34)
sprite(SH, 's3/post', 14, 44, 7, 43, () => tr(7, 43, [
  rect(-40, -420, 80, 420, '#8a6446'), rect(-40, -420, 24, 420, '#a8805e'), rect(24, -420, 16, 420, '#6e4a30'),
  path('M-46 -420 L0 -452 L46 -420 Z', '#6e4a30'),
  rect(-34, -400, 68, 280, '#f3e6c8'), ell(-10, -30, 50, 12, '#62b04e', { opacity: 0.8 })
], 0.1));
