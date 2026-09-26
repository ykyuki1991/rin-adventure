// ステージ6「三宮・南京町」を描き直したもの（夕方の少し前・あたたかい光）
// 三宮：六甲山と錨山 → ガラスのビル街 → デパート・オフィスの街 → JRの高架と電車 → 駅ビル・センター街・横断歩道
// 南京町：夕焼けの空 → 元町の街とポートタワー → 中国ふうの屋根なみ → 南京町の店なみ → 長安門・屋台・ちょうちん・広場のあずまや
import { bgLayer, sprite, resetTheme } from '../registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix, f } from '../svg.mjs';
import { wrap, ridgePath, ridgeY, cloud, anchor } from '../bgs.mjs';
import { U, tile, SLOPES } from '../tiles.mjs';
import { clover, cloverBlob, st, G, win, glassFrame, awning, board, inside, TAU } from '../kit.mjs';

const SH = 's6';
resetTheme('sannomiya');
resetTheme('nankin');
// タイルの絵は 0〜160 の外にはみ出さないように切り抜く
const tileC = (name, draw) => tile(name, defs => g(draw(defs), { 'clip-path': defs.clip('<rect x="0" y="0" width="160" height="160"/>') }));

// ========================================================================
// 三宮：背景
// ========================================================================
const TH = 'sannomiya';
const HZ = '#f3dcc8';                 // 夕方のかすみ（あたたかい色）
const hz = (c, k) => mix(c, HZ, k);

// 雲（下がうすいオレンジ）
bgLayer(TH, { f: 0.02, w: 1200, y: 0, h: 120 }, (defs, w) => {
  const r = rng(6101);
  const out = [];
  for (const [x, y, s] of [[120, 28, 0.8], [380, 52, 0.6], [620, 24, 0.95], [880, 44, 0.7], [1080, 30, 0.55]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#fffaf3', '#f4d2bc', '#ffffff')));
  for (let i = 0; i < 4; i++) { const x = r() * w, y = 70 + r() * 18, s = 0.3 + r() * 0.15; out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#fff6ec', '#f6dcc8', null))); }
  return out.join('');
});

// 六甲山と錨山
bgLayer(TH, { f: 0.04, w: 1300, y: 40, h: 160 }, (defs, w) => {
  const r = rng(6201);
  const R1 = [[2, 22], [3, 10], [7, 4]], R2 = [[2, 16], [5, 7], [9, 3]];
  const out = [];
  out.push(path(ridgePath(w, 82, R1, 6203, 200), defs.linU([[0, '#98a6d2'], [1, '#cfc4da']], 0, 50, 0, 120)));
  out.push(path(ridgePath(w, 94, R2, 6205, 200), defs.linU([[0, '#7489bf'], [1, '#b7b2cf']], 0, 66, 0, 130)));
  for (let i = 0; i < 14; i++) {
    const x = (i + r() * 0.5) * (w / 14), top = ridgeY(w, 94, R2, 6205, x);
    out.push(wrap(w, x - 12, 30, xx => path(`M${xx} ${top + 2} Q${xx + 7} ${top + 9} ${xx + 13} ${top + 18}`, 'none', st('#eac8c4', 2.6, { opacity: 0.5 }))));
  }
  const ax = 420, ay = ridgeY(w, 94, R2, 6205, ax) + 18;
  out.push(anchor(ax, ay, 1.2, '#f8f2f4'));
  out.push(rect(0, 104, w, 96, defs.linU([[0, HZ, 0], [0.5, HZ, 0.6], [1, HZ, 0.9]], 0, 104, 0, 200)));
  return tr(0, -40, out.join(''));
});

// ガラスのビル街（高いビル・かすんで見える）
bgLayer(TH, { f: 0.08, w: 1200, y: 40, h: 200 }, (defs, w) => {
  const r = rng(6301);
  const out = [];
  const cols = ['#a9b8cd', '#bcc6d6', '#c9cdd8', '#b2bfd0', '#d2d2da', '#9fb0c6'];
  const tower = (x, bw, top, c, kind) => {
    const p = [rect(x, top, bw, 240 - top, c), rect(x + bw * 0.72, top, bw * 0.28, 240 - top, '#f2d1b3', { opacity: 0.55 })];
    if (kind === 0) for (let y = top + 4; y < 236; y += 5) p.push(rect(x + 1.5, y, bw * 0.7 - 2, 1.4, shade(c, -0.12), { opacity: 0.8 }));
    else if (kind === 1) for (let xx = x + 2; xx < x + bw - 2; xx += 3.2) p.push(rect(xx, top + 3, 1, 236 - top, shade(c, -0.1), { opacity: 0.7 }));
    else for (let y = top + 4; y < 236; y += 6) for (let xx = x + 2; xx < x + bw * 0.7 - 1; xx += 3.4) p.push(rect(xx, y, 2, 2.6, shade(c, -0.14), { opacity: 0.8 }));
    p.push(rect(x - 0.6, top - 1.2, bw + 1.2, 1.6, shade(c, 0.3)));
    if (r() < 0.4) p.push(rect(x + bw * 0.4, top - 7, 1, 7, '#9aa4b4'), circ(x + bw * 0.4 + 0.5, top - 7, 0.9, '#ff6a5a'));
    return p.join('');
  };
  for (let x = -10; x < w;) {
    const bw = 14 + r() * 22, top = 104 + Math.pow(r(), 1.1) * 64;
    const c = cols[Math.floor(r() * cols.length)], kind = Math.floor(r() * 3);
    out.push(wrap(w, x, bw, xx => tower(xx, bw, top, c, kind)));
    x += bw + 3 + r() * 10;
  }
  // 目立つビル：市役所ふう（上に四角いわく）、丸い屋根のビル
  out.push(wrap(w, 300, 40, xx => tower(xx, 34, 70, '#c3cad8', 0) + rect(xx - 2, 62, 38, 3, '#aeb8c8') + rect(xx - 2, 62, 3, 10, '#aeb8c8') + rect(xx + 33, 62, 3, 10, '#aeb8c8')));
  out.push(wrap(w, 760, 34, xx => tower(xx, 28, 86, '#b6c3d6', 1) + path(`M${xx} 86 Q${xx + 14} 70 ${xx + 28} 86 Z`, '#b6c3d6')));
  out.push(rect(0, 150, w, 90, defs.linU([[0, HZ, 0], [1, HZ, 0.75]], 0, 150, 0, 230)));
  return tr(0, -40, out.join(''));
});

// デパート・オフィスの街（中くらいの高さ・くわしく）
bgLayer(TH, { f: 0.16, w: 1000, y: 80, h: 160 }, (defs, w) => {
  const r = rng(6401);
  const out = [];
  const walls = ['#efe2cf', '#e6d3bb', '#f3ece2', '#d9c2a7', '#e9e4dc', '#dcc9b6', '#cfd6df'];
  const signC = ['#e2574c', '#2f78c4', '#f2b632', '#3f9a5a', '#e97aa2'];
  for (let x = -6; x < w;) {
    const bw = 30 + r() * 34, bh = 50 + r() * 60, top = 212 - bh, c = walls[Math.floor(r() * walls.length)], kind = r();
    out.push(wrap(w, x, bw + 2, xx => {
      const p = [rect(xx, top, bw, bh + 30, c), rect(xx + bw - 5, top, 5, bh + 30, shade(c, -0.1)), rect(xx - 1, top - 2, bw + 2, 3, shade(c, 0.25))];
      if (kind < 0.35) {
        // ガラスの帯の窓
        for (let y = top + 6; y < 200; y += 9) p.push(rect(xx + 3, y, bw - 9, 5, '#9fb9d2'), rect(xx + 3, y, bw - 9, 1.2, '#ffffff', { opacity: 0.5 }), rect(xx + 3 + (bw - 9) * 0.7, y, (bw - 9) * 0.3, 5, '#f6d7b6', { opacity: 0.6 }));
      } else {
        for (let y = top + 6; y < 200; y += 10) for (let wx = xx + 4; wx < xx + bw - 8; wx += 7) p.push(rect(wx, y, 4.4, 5.6, '#a6bfd6'), rect(wx, y, 4.4, 1.2, '#ffffff', { opacity: 0.55 }));
      }
      // 屋上の看板・給水タンク
      if (r() < 0.55) { const sc = signC[Math.floor(r() * signC.length)], sw = bw * (0.4 + r() * 0.3); p.push(rect(xx + 4, top - 12, sw, 10, sc), rect(xx + 6, top - 10, sw - 4, 2, '#ffffff', { opacity: 0.5 }), rect(xx + 6, top - 2, 1, 2, '#6b6f78'), rect(xx + sw, top - 2, 1, 2, '#6b6f78')); }
      else if (r() < 0.5) p.push(rrect(xx + bw * 0.6, top - 8, 9, 8, 2, '#c9ccd2'), rect(xx + bw * 0.6 + 1, top - 2, 1, 2, '#8a8f98'));
      // たて長の看板
      if (r() < 0.45) { const sc = signC[Math.floor(r() * signC.length)]; p.push(rect(xx + bw - 10, top + 10, 6, 34, sc), rect(xx + bw - 9, top + 12, 1.4, 30, '#ffffff', { opacity: 0.5 })); }
      return p.join('');
    }));
    x += bw + 2 + r() * 8;
  }
  // 街路樹
  const TC = ['#5f9a57', '#6aa860', '#7ab56a'];
  for (let i = 0; i < 40; i++) { const x = r() * w, y = 206 + r() * 6, rr = 5 + r() * 4; out.push(wrap(w, x - 10, 20, xx => clover(xx, y, rr, TC[i % 3], '#a9d68e'))); }
  out.push(rect(0, 212, w, 30, '#b9aa9a'));
  out.push(rect(0, 140, w, 100, defs.linU([[0, HZ, 0], [1, HZ, 0.35]], 0, 140, 0, 240)));
  return tr(0, -80, out.join(''));
});

// JR の高架（たかい位置・下に店）と、その下の店のあかり
bgLayer(TH, { f: 0.3, w: 900, y: 92, h: 148 }, (defs, w) => {
  const r = rng(6501);
  const out = [];
  const deck = 116;
  // 高架の下の店
  const shopC = ['#f6d59a', '#ffe2b0', '#f3c98c', '#fbe9c8'];
  for (let x = 0; x < w; x += 90) {
    out.push(rect(x + 8, deck + 20, 74, 90, '#c9b8a4'));
    out.push(path(`M${x + 12} ${deck + 110} L${x + 12} ${deck + 40} Q${x + 45} ${deck + 22} ${x + 78} ${deck + 40} L${x + 78} ${deck + 110} Z`, '#8a7866'));
    out.push(rect(x + 16, deck + 58, 58, 52, shopC[(x / 90) % 4], { opacity: 0.95 }));
    out.push(rect(x + 16, deck + 58, 58, 52, defs.lin([[0, '#000000', 0.25], [0.5, '#000000', 0.05], [1, '#000000', 0]])));
    out.push(rect(x + 18, deck + 44, 54, 10, ['#e2574c', '#2f78c4', '#3f9a5a', '#f2b632'][(x / 90) % 4]), rect(x + 20, deck + 46, 50, 2, '#ffffff', { opacity: 0.5 }));
  }
  // 柱・けた
  for (let x = 0; x < w; x += 90) out.push(rect(x - 6, deck + 12, 14, 110, '#b9b4ab'), rect(x - 6, deck + 12, 4, 110, '#d6d1c7'));
  out.push(rect(0, deck, w, 16, '#cfcac1'), rect(0, deck, w, 3, '#ece8e1'), rect(0, deck + 13, w, 4, '#a7a198'), rect(0, deck + 17, w, 3, '#000000', { opacity: 0.1 }));
  out.push(rect(0, deck - 5, w, 5, '#bdb8af'), rect(0, deck - 5, w, 1.4, '#e4e0d9'));
  // 架線の柱と電線
  for (let x = 30; x < w; x += 90) out.push(rect(x, deck - 26, 1.8, 21, '#7d838c'), rect(x - 6, deck - 25, 14, 1.3, '#7d838c'), rect(x - 6, deck - 17, 14, 1, '#7d838c'));
  out.push(path(`M0 ${deck - 22} L${w} ${deck - 22}`, 'none', st('#4a4f57', 0.5, { opacity: 0.8 })), path(`M0 ${deck - 15} L${w} ${deck - 15}`, 'none', st('#4a4f57', 0.4, { opacity: 0.6 })));
  out.push(rect(0, deck + 110, w, 40, '#a39d95'));
  out.push(rect(0, deck, w, 150, defs.linU([[0, HZ, 0.12], [1, HZ, 0.2]], 0, deck, 0, 240)));
  return tr(0, -92, out.join(''));
});

// 手前の植えこみ（ぼかして・地面より下だけ）
bgLayer(TH, { f: 1.3, w: 1300, y: 204, h: 36, fg: true }, (defs, w) => {
  const r = rng(6601);
  const blur = defs.blur(1.5);
  const out = [];
  for (const cx of [200, 820]) {
    const parts = [];
    for (let k = 0; k < 9; k++) { const x = cx + (k - 4) * 12 + r() * 8, y = 244 - r() * 6 - Math.cos((k - 4) / 4 * 1.3) * 6, rr = 9 + r() * 6; parts.push(wrap(w, x - rr * 1.3, rr * 2.6, xx => clover(xx, y, rr, k % 3 ? '#2d6a38' : '#37793f', '#5aa050'))); }
    out.push(g(parts.join(''), { filter: blur }));
  }
  return tr(0, -204, out.join(''));
});

// 背景の電車（JR：銀に青い帯 / 阪急：マルーン）
sprite(SH, 's6/bgjr', 72, 20, 0, 19, () => tr(0, 19, [
  rrect(0, -186, 700, 176, 22, '#dfe3e8'), rect(0, -186, 700, 26, '#f4f6f8'),
  rect(0, -96, 700, 14, '#2f6fb8'), rect(0, -80, 700, 8, '#c9a46a'),
  ...[0, 1, 2, 3, 4].map(i => [rrect(34 + i * 128, -150, 86, 46, 6, '#b9d6ea'), path(`M${40 + i * 128} -144 L${66 + i * 128} -144 L${40 + i * 128} -112 Z`, '#ffffff', { opacity: 0.6 })].join('')),
  ...[1, 3].map(i => rrect(18 + i * 128 + 104, -156, 22, 118, 4, '#c3c9d0')),
  rect(0, -12, 700, 12, '#3a3a40'), path('M330 -186 L350 -222 L370 -186 M340 -222 L360 -222', 'none', st('#3a3a40', 5))
], 0.1));
sprite(SH, 's6/bghk', 72, 20, 0, 19, () => tr(0, 19, [
  rrect(0, -186, 700, 176, 22, '#6e1826'), rrect(0, -186, 700, 36, 18, '#efe5d2'), rect(0, -160, 700, 10, '#efe5d2'),
  ...[0, 1, 2, 3, 4].map(i => [rrect(34 + i * 128, -134, 86, 52, 6, '#d9eef8'), path(`M${40 + i * 128} -128 L${66 + i * 128} -128 L${40 + i * 128} -94 Z`, '#ffffff', { opacity: 0.6 })].join('')),
  rect(0, -58, 700, 8, '#8c2433'), rect(0, -12, 700, 12, '#3a3a40'), path('M330 -186 L350 -222 L370 -186 M340 -222 L360 -222', 'none', st('#3a3a40', 5))
], 0.1));

// ========================================================================
// 三宮：地面（歩道のタイル＋花こう岩のかべ）
// ========================================================================
{
  const blocks = (seed) => {
    const out = [rect(0, 0, U, U, '#7b766e')];
    const cols = ['#aaa59c', '#b3aea5', '#a19c93', '#b8b3aa'];
    const r = rng(seed);
    for (let row = 0; row < 2; row++) {
      const y = row * 80, xs = row ? [0, 40, 120, 160] : [0, 80, 160];
      for (let i = 0; i < xs.length - 1; i++) {
        const x0 = xs[i] + (xs[i] ? 3 : 0), x1 = xs[i + 1] - (xs[i + 1] < U ? 3 : 0);
        const c = xs[i] === 0 || xs[i + 1] === U ? cols[0] : cols[Math.floor(r() * cols.length)];
        out.push(rect(x0, y + 3, x1 - x0, 74, c), rect(x0, y + 3, x1 - x0, 5, '#cdc9c1', { opacity: 0.8 }), rect(x0, y + 68, x1 - x0, 9, '#8f8a82', { opacity: 0.6 }));
        if (r() < 0.6) out.push(circ(x0 + 10 + r() * (x1 - x0 - 20), y + 20 + r() * 40, 2.2, '#98938a'));
      }
    }
    return out.join('');
  };
  const body = (v) => blocks(6700 + v) + (v === 2 ? rrect(56, 96, 48, 30, 4, '#5f5b55') + [0, 1, 2, 3].map(k => rect(62 + k * 11, 100, 5, 22, '#3f3c38')).join('') : '');
  for (let v = 0; v < 3; v++) tileC(`t/${TH}/g/body${v}`, () => body(v));
  // 上：歩道（ベージュとテラコッタのれんがタイル）＋明るいふち
  const top = (v) => [
    blocks(6710 + v),
    rect(0, 44, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 46, '#8a7a68'),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 7, 36, 16, (i + v) % 2 ? '#e2cdb0' : '#c9876a')),
    ...[0, 1, 2, 3, 4].map(i => rect(i * 40 - 18, 25, 36, 16, (i + v) % 2 ? '#d6b99a' : '#e6d5bd')),
    rect(0, 0, U, 6, '#f6ede0'),
    v === 1 ? rect(0, 7, U, 16, '#f2c230') + [0, 1, 2, 3, 4, 5, 6, 7].map(k => circ(10 + k * 20, 15, 3.2, '#d9a816')).join('') : ''
  ].join('');
  for (let v = 0; v < 2; v++) tileC(`t/${TH}/g/top${v}`, () => top(v));
  tileC(`t/${TH}/g/edgeL`, defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tileC(`t/${TH}/g/edgeR`, defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tileC(`t/${TH}/g/topL`, () => [rect(0, 0, 8, 46, '#8a7a68'), rect(0, 0, 5, 40, '#d9c6ad')].join(''));
  tileC(`t/${TH}/g/topR`, () => [rect(152, 0, 8, 46, '#8a7a68'), rect(155, 0, 5, 40, '#d9c6ad')].join(''));
  for (const k of Object.keys(SLOPES)) tileC(`t/${TH}/g/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    return [g(blocks(6720), { 'clip-path': cp }), path(`M0 ${yl} L160 ${yr} L160 ${yr + 44} L0 ${yl + 44} Z`, '#8a7a68'), path(`M0 ${yl} L160 ${yr} L160 ${yr + 36} L0 ${yl + 36} Z`, '#dcc3a4'), path(`M0 ${yl + 2} L160 ${yr + 2}`, 'none', { stroke: '#f6ede0', strokeWidth: 5 })].join('');
  });
  // 石の階段（花こう岩のブロック）
  tileC(`t/${TH}/hard`, () => [
    rect(0, 0, U, U, '#8d887f'), rrect(3, 3, 154, 152, 6, '#bdb7ad'),
    path('M8 8 L152 8 L144 20 L20 20 L20 144 L8 152 Z', '#d6d1c8'), path('M152 8 L152 152 L8 152 L20 144 L144 144 L144 20 Z', '#a39d93'),
    circ(60, 70, 3, '#aca69c'), circ(110, 100, 2.5, '#aca69c')
  ].join(''));
  tileC(`t/${TH}/hardT`, () => [rect(0, 0, U, 24, '#8d887f'), rect(0, 0, U, 18, '#e9e4db'), rect(0, 0, U, 5, '#fbf8f2')].join(''));

  // センター街のアーケード屋根（ガラスのかまぼこ屋根を横から見たところ。上に乗れる）
  tileC(`t/${TH}/m/arcade/semi`, defs => [
    rect(0, 22, U, 96, defs.lin([[0, '#eaf6fb'], [0.5, '#c5e2ee'], [1, '#9fcadd']]), { opacity: 0.92 }),
    path('M12 34 L44 34 L22 104 L6 104 Z', '#ffffff', { opacity: 0.5 }), path('M96 34 L108 34 L88 104 L76 104 Z', '#ffffff', { opacity: 0.3 }),
    rect(0, 22, 6, 96, '#7f95a3'), rect(154, 22, 6, 96, '#7f95a3'), rect(77, 22, 6, 96, '#7f95a3'),
    rect(0, 64, U, 5, '#7f95a3'),
    rect(0, 0, U, 24, '#5e7584'), rect(0, 0, U, 16, '#e6edf1'), rect(0, 0, U, 5, '#ffffff'),
    rect(0, 116, U, 26, '#6f8593'), rect(0, 116, U, 5, '#a9bcc8'), ...[20, 60, 100, 140].map(x => circ(x, 130, 3.5, '#f4d68a')),
    rect(0, 142, U, 8, '#000000', { opacity: 0.2 })
  ].join(''));

  // ---------- ビル（素材ごとにちがう見た目。上の段は屋上のふち） ----------
  const parapet = (c, light) => [rect(0, 0, U, 30, shade(c, -0.35)), rect(0, 0, U, 24, c), rect(0, 0, U, 6, light), rect(0, 30, U, 8, '#000000', { opacity: 0.2 })].join('');
  // デパート（クリーム色の石・たて長の窓）
  tileC(`t/${TH}/m/s6dept/hard`, defs => [
    rect(0, 0, U, U, '#eadcc4'), rect(0, 76, U, 6, '#d8c6a8'), rect(0, 156, U, 4, '#d8c6a8'),
    rect(0, 0, 10, U, '#f6ecdb'), rect(150, 0, 10, U, '#d9c9ad'),
    ...[[26, 12], [92, 12]].map(([x, y]) => rect(x - 4, y - 4, 50, 142, '#c9b595') + rect(x, y, 42, 134, G(defs).glass) + path(`M${x + 4} ${y + 4} L${x + 20} ${y + 4} L${x + 4} ${y + 40} Z`, '#ffffff', { opacity: 0.5 }) + rect(x, y + 66, 42, 5, '#c9b595') + rect(x + 28, y, 14, 134, '#f6d7b6', { opacity: 0.4 }))
  ].join(''));
  tileC(`t/${TH}/m/s6dept/hardT`, () => parapet('#e3d2b4', '#fffaf0') + [20, 60, 100, 140].map(x => rect(x - 6, 36, 12, 12, '#d2bf9e')).join(''));
  tileC(`t/${TH}/m/s6deptG/hard`, defs => [
    rect(0, 0, U, U, '#e6d7bd'),
    rect(0, 0, U, 30, '#b5433a'), rect(0, 0, U, 6, '#d8645a'), rect(0, 24, U, 6, '#8a2f28'),
    inside(G(defs), 8, 36, 144, 112, '#f7ead6'),
    rect(20, 70, 28, 60, '#e98aa6'), circ(34, 62, 9, '#f2d2b6'), rect(62, 84, 36, 44, '#7fb2d8'), rrect(68, 76, 24, 10, 4, '#e7c24f'), rect(108, 64, 30, 66, '#f2c46a'), circ(123, 56, 9, '#f2d2b6'),
    glassFrame(8, 36, 144, 112, '#8a7a68', 6), rect(0, 148, U, 12, '#b9ad9c')
  ].join(''));
  // ガラスのオフィスビル（青いガラスのかべ）
  tileC(`t/${TH}/m/s6glass/hard`, defs => [
    rect(0, 0, U, U, defs.lin([[0, '#8fb3d6'], [0.5, '#6f98c4'], [1, '#9dc0e0']], 0, 0, 1, 1)),
    path('M0 150 L110 0 L150 0 L40 160 L0 160 Z', '#ffffff', { opacity: 0.16 }), path('M100 160 L160 70 L160 110 L128 160 Z', '#f8d9b8', { opacity: 0.35 }),
    rect(0, 0, U, 8, '#dfe7ee'), rect(0, 76, U, 6, '#dfe7ee'), rect(0, 0, 6, U, '#dfe7ee'), rect(77, 0, 5, U, '#c7d3de')
  ].join(''));
  tileC(`t/${TH}/m/s6glass/hardT`, () => parapet('#dfe7ee', '#ffffff') + rect(20, 38, 120, 4, '#b7c6d4'));
  tileC(`t/${TH}/m/s6glassG/hard`, defs => [
    rect(0, 0, U, U, '#dfe7ee'), rect(0, 0, U, 24, '#4f6f8c'), rect(0, 0, U, 5, '#7f9ab2'),
    rect(10, 34, 140, 114, '#ffe6bd'), rect(10, 34, 140, 114, G(defs).inShade, { opacity: 0.5 }),
    rect(30, 94, 100, 10, '#c9a878'), circ(40, 56, 7, '#fff4d0'), circ(120, 56, 7, '#fff4d0'),
    glassFrame(10, 34, 140, 114, '#4f6f8c', 6, { mull: true }), rect(0, 148, U, 12, '#aeb8c2')
  ].join(''));
  // テラコッタのタイルのビル（小さい・カフェ）
  tileC(`t/${TH}/m/s6brick/hard`, defs => {
    const out = [rect(0, 0, U, U, '#e8cdb2')];
    for (let row = 0; row < 8; row++) for (let x = (row % 2) * 20 - 20; x < U; x += 40) out.push(rect(Math.max(0, x + 1.5), row * 20 + 1.5, Math.min(U, x + 38.5) - Math.max(0, x + 1.5), 17, (row + x / 20) % 3 ? '#c9805e' : '#bb7050'));
    out.push(win(G(defs), 44, 30, 72, 88, { frame: '#f6efe2', curtain: '#f6e2c6', bar: true, fw: 8 }));
    return out.join('');
  });
  tileC(`t/${TH}/m/s6brick/hardT`, () => parapet('#d9c6ae', '#fbf4e8') + [30, 80, 130].map(x => rrect(x - 12, 40, 24, 10, 4, '#5aa050')).join(''));
  tileC(`t/${TH}/m/s6brickG/hard`, defs => [
    rect(0, 0, U, U, '#c9805e'),
    awning(G(defs), 6, 12, 148, 26, '#2f7a52', '#f5efe0', 6),
    inside(G(defs), 12, 60, 136, 88, '#ffe2b0'), rect(20, 110, 120, 10, '#8a5a3a'), ...[34, 70, 106].map(x => rrect(x, 96, 14, 14, 3, '#ffffff')),
    glassFrame(12, 60, 136, 88, '#4a3526', 5, { mull: true }), rect(0, 148, U, 12, '#b9ad9c')
  ].join(''));
  // 白いパネルのビル（ホテル）
  tileC(`t/${TH}/m/s6hotel/hard`, defs => [
    rect(0, 0, U, U, '#eef0f2'), rect(0, 0, 6, U, '#ffffff'), rect(152, 0, 8, U, '#d7dbe0'),
    ...[[16, 16], [88, 16], [16, 92], [88, 92]].map(([x, y]) => rect(x, y, 56, 52, '#8fb0cc') + rect(x, y, 56, 52, G(defs).glass, { opacity: 0.6 }) + path(`M${x + 4} ${y + 4} L${x + 22} ${y + 4} L${x + 4} ${y + 30} Z`, '#ffffff', { opacity: 0.5 }) + rect(x - 4, y + 52, 64, 6, '#c9ced4') + rect(x + 36, y, 20, 52, '#f6d7b6', { opacity: 0.35 }))
  ].join(''));
  tileC(`t/${TH}/m/s6hotel/hardT`, () => parapet('#e3e7eb', '#ffffff') + rect(0, 38, U, 6, '#e05a4a'));
  tileC(`t/${TH}/m/s6hotelG/hard`, defs => [
    rect(0, 0, U, U, '#eef0f2'), rect(0, 0, U, 22, '#3f4a5c'), rect(0, 22, U, 4, '#d8b25a'),
    inside(G(defs), 12, 40, 136, 108, '#ffe9c4'), rect(50, 60, 60, 88, '#c9a878', { opacity: 0.5 }), circ(80, 52, 10, '#fff6dc'),
    glassFrame(12, 40, 136, 108, '#3f4a5c', 6, { mull: true }), rect(0, 148, U, 12, '#aeb8c2')
  ].join(''));
}

// ========================================================================
// 三宮：飾り（s6 シート）。座標は 0.1ドット単位
// ========================================================================
// 駅ビル（大きなアーチのガラス窓・時計・駅の入口）
sprite(SH, 's6/station', 156, 142, 3, 141, defs => {
  const Gd = G(defs), out = [];
  const W = 1500, wall = '#ecdfc9';
  // 屋上と時計
  out.push(rect(560, -1230, 380, 150, '#e3d3b8'), rect(560, -1230, 380, 12, '#fbf4e6'));
  out.push(circ(750, -1170, 70, '#f6efe2'), circ(750, -1170, 58, '#ffffff'), circ(750, -1170, 58, 'none', { stroke: '#7a2432', strokeWidth: 8 }), path('M750 -1170 L750 -1214 M750 -1170 L786 -1160', 'none', st('#3a3a40', 8)), circ(750, -1170, 6, '#7a2432'));
  // かべ
  out.push(rect(0, -1100, W, 1100, wall), rect(0, -1100, W, 1100, Gd.wallShade));
  out.push(rect(-20, -1120, W + 40, 34, '#f8f1e4'), rect(-20, -1120, W + 40, 8, '#ffffff'), rect(-10, -1086, W + 20, 10, '#000000', { opacity: 0.12 }));
  for (let y = -1060; y < -500; y += 60) out.push(rect(0, y, W, 3, '#dccdb2'));
  // わきのオフィスの窓
  for (const x0 of [40, 1180]) for (let y = -1040; y < -560; y += 120) for (let x = x0; x < x0 + 280; x += 94) out.push(win(Gd, x, y, 64, 80, { frame: '#f8f3ea', fw: 8, curtain: (x + y) % 3 ? null : '#f6e7cf' }));
  // 大きなアーチの窓（夕日がうつる）
  const cx = 750, R = 360, sy = -640;
  out.push(path(`M${cx - R - 40} -520 L${cx - R - 40} ${sy} A${R + 40} ${R + 40} 0 0 1 ${cx + R + 40} ${sy} L${cx + R + 40} -520 Z`, '#f8f1e4'));
  out.push(path(`M${cx - R} -520 L${cx - R} ${sy} A${R} ${R} 0 0 1 ${cx + R} ${sy} L${cx + R} -520 Z`, defs.lin([[0, '#bfdcf0'], [0.55, '#9cc6e4'], [1, '#f6cfa6']], 0, 0, 1, 1)));
  for (let k = 1; k < 8; k++) { const a = Math.PI + k / 8 * Math.PI; out.push(path(`M${cx} ${sy} L${cx + Math.cos(a) * R} ${sy + Math.sin(a) * R}`, 'none', st('#f8f1e4', 10))); }
  out.push(path(`M${cx - 180} ${sy} A180 180 0 0 1 ${cx + 180} ${sy}`, 'none', st('#f8f1e4', 10)), rect(cx - R, sy - 5, R * 2, 10, '#f8f1e4'));
  for (let x = cx - R + 90; x < cx + R; x += 90) out.push(rect(x - 5, sy, 10, 120, '#f8f1e4'));
  out.push(path(`M${cx - R + 60} ${sy - 30} A${R - 60} ${R - 60} 0 0 1 ${cx - 120} ${sy - R + 70}`, 'none', st('#ffffff', 16, { opacity: 0.45 })));
  out.push(rect(cx - R - 60, -524, R * 2 + 120, 20, '#e0d0b4'));
  // 1階：駅の入口（ひさしの文字はゲームで描く）
  out.push(rect(0, -470, W, 40, '#6e1826'), rect(0, -470, W, 8, '#9a3040'), rect(0, -436, W, 10, '#4a0f1a'));
  out.push(rrect(cx - 250, -466, 500, 32, 6, '#f8f1e4'));
  out.push(inside(Gd, 120, -420, W - 240, 390, '#ffe6bd'));
  for (const x of [260, 520, 980, 1240]) out.push(rrect(x - 30, -330, 60, 12, 4, '#ffffff'), rect(x - 3, -318, 6, 60, '#d9d2c4', { opacity: 0.7 }));
  for (let x = 300; x < 1200; x += 110) out.push(rect(x, -160, 70, 130, '#8d99a6'), rect(x, -160, 70, 12, '#c3ccd6'), rect(x + 30, -150, 10, 16, '#39c86a'));
  out.push(glassFrame(120, -420, W - 240, 390, '#6b6258', 12, { mull: true }));
  for (let x = 120; x < W - 120; x += 210) out.push(rect(x - 12, -430, 24, 400, '#e3d6bf'));
  out.push(rect(-10, -34, W + 20, 34, '#cfc8bb'), rect(-10, -34, W + 20, 6, '#e8e3da'));
  return tr(3, 141, out.join(''), 0.1);
});

// ---------- センター街の店（アーケードの下） ----------
const CG = {
  fuku: { wall: '#f6ebf0', sign: ['#ffffff', '#d85a88'], awn: ['#e97aa2', '#fff1f5'] },
  kutsu: { wall: '#e9eef5', sign: ['#23466e', '#172f4c'], awn: null, canopy: '#2f5a88' },
  honya: { wall: '#efe6d6', sign: ['#fff8ea', '#3f8a45'], awn: ['#3f9a4a', '#f3f8ea'] },
  cafe: { wall: '#f1e8dc', sign: ['#2e3b36', '#1f2a26'], awn: null, canopy: '#3a6b4f' },
  pan: { wall: '#f6e4c8', sign: ['#fff4e6', '#c0503a'], awn: ['#d94a3f', '#fff4e6'] },
  zakka: { wall: '#eef3e6', sign: ['#fff8dc', '#e0a02a'], awn: ['#f2b632', '#fffaf0'] }
};
export const CG_KINDS = Object.keys(CG);
function cgGoods(Gd, key, W, r) {
  const out = [];
  if (key === 'fuku') {
    out.push(inside(Gd, 24, -440, W - 48, 410, '#fbe9ee'));
    out.push(rect(40, -380, W - 80, 6, '#b8a0a8'));
    const dress = ['#e97aa2', '#6aa5ea', '#f2c94c', '#8ac86a', '#c77ddf'];
    for (let i = 0; i < 5; i++) { const x = 70 + i * 100; out.push(path(`M${x - 26} -370 L${x + 26} -370 L${x + 40} -240 L${x - 40} -240 Z`, dress[i]), rect(x - 3, -390, 6, 20, '#9a8a90')); }
    for (const x of [150, 470]) out.push(circ(x, -200, 18, '#f2d2b6'), path(`M${x - 34} -180 L${x + 34} -180 L${x + 50} -60 L${x - 50} -60 Z`, x < 300 ? '#ffffff' : '#2f5a88'), rect(x - 4, -60, 8, 30, '#9a8a90'), ell(x, -30, 34, 6, '#9a8a90'));
  } else if (key === 'kutsu') {
    out.push(inside(Gd, 24, -440, W - 48, 410, '#f3eee6'));
    const sc = ['#e2453a', '#2f78c4', '#ffffff', '#f2b632', '#3a3a40', '#8a5a3a', '#e97aa2'];
    for (let row = 0; row < 4; row++) { const y = -380 + row * 90; out.push(rect(36, y + 40, W - 72, 8, '#b9a58c')); for (let x = 50; x < W - 70; x += 64) { const c = sc[Math.floor(r() * sc.length)]; out.push(path(`M${x} ${y + 40} L${x} ${y + 14} Q${x + 10} ${y + 4} ${x + 22} ${y + 16} L${x + 48} ${y + 26} Q${x + 54} ${y + 40} ${x + 48} ${y + 40} Z`, c), rect(x, y + 34, 50, 6, '#ffffff', { opacity: 0.7 })); } }
  } else if (key === 'honya') {
    out.push(inside(Gd, 24, -440, W - 48, 410, '#f1e6d2'));
    const bc = ['#d84a4a', '#3f72c8', '#e8c24a', '#5aa85a', '#8a5ad8', '#e87a4a', '#4ab8c8', '#f4f0e6'];
    for (let row = 0; row < 3; row++) { const y = -420 + row * 110; out.push(rect(34, y + 96, W - 68, 10, '#8a6446')); for (let x = 40; x < W - 44;) { const bw = 13 + r() * 8, bh = 64 + r() * 26; out.push(rect(x, y + 96 - bh, bw, bh, bc[Math.floor(r() * bc.length)]), rect(x + 2, y + 104 - bh, bw - 4, 3, '#ffffff', { opacity: 0.45 })); x += bw + 2; } }
    out.push(rect(60, -110, W - 120, 80, '#8a6446'), rect(60, -110, W - 120, 10, '#b08a64'));
    for (let x = 80; x < W - 100; x += 70) out.push(rect(x, -130, 54, 20, bc[Math.floor(r() * bc.length)]));
  } else if (key === 'cafe') {
    out.push(rect(24, -440, W - 48, 410, '#ffe2b0'), rect(24, -440, W - 48, 410, Gd.inShade, { opacity: 0.5 }));
    for (const x of [W * 0.3, W * 0.7]) out.push(path(`M${x} -440 L${x} -390`, 'none', st('#3a2a22', 3)), path(`M${x - 24} -370 Q${x} -408 ${x + 24} -370 Z`, '#2f3a3a'), circ(x, -366, 8, '#fff2c0'), circ(x, -360, 34, '#fff2c0', { opacity: 0.35 }));
    out.push(rect(40, -260, W - 80, 110, '#e9e3da'), rect(56, -250, W - 112, 80, '#dff0f6'));
    for (let x = 80; x < W - 80; x += 60) out.push(rrect(x, -226, 36, 30, 6, ['#f6d6e0', '#f2c46a', '#8a5a3a', '#ffffff'][Math.floor(x / 60) % 4]), circ(x + 18, -234, 7, '#e2453a'));
    out.push(rect(40, -150, W - 80, 120, '#8a5a3a'), rect(40, -150, W - 80, 12, '#b07a4a'));
  } else if (key === 'pan') {
    out.push(inside(Gd, 24, -440, W - 48, 410, '#fbe6c6'));
    for (let row = 0; row < 3; row++) { const y = -340 + row * 100; out.push(rect(34, y, W - 68, 8, '#a8744c')); for (let x = 60; x < W - 50; x += 50) { const k = (row + Math.floor(x / 50)) % 3; if (k === 0) out.push(ell(x, y - 18, 22, 16, '#d8914a'), ell(x - 4, y - 24, 10, 6, '#f0c080', { opacity: 0.8 })); else if (k === 1) out.push(path(`M${x - 22} ${y - 8} Q${x} ${y - 40} ${x + 22} ${y - 8} Q${x} ${y - 20} ${x - 22} ${y - 8} Z`, '#c9782f')); else out.push(rrect(x - 22, y - 26, 44, 24, 10, '#b86e30')); } }
  } else {
    out.push(inside(Gd, 24, -440, W - 48, 410, '#f6f3e6'));
    const zc = ['#e97aa2', '#6aa5ea', '#f2c94c', '#8ac86a', '#ff9a5a', '#c77ddf', '#ffffff'];
    for (let row = 0; row < 3; row++) { const y = -350 + row * 100; out.push(rect(34, y, W - 68, 8, '#b9a58c')); for (let x = 50; x < W - 50; x += 40) { const c = zc[Math.floor(r() * zc.length)]; out.push(r() < 0.5 ? rrect(x, y - 36, 28, 36, 6, c) : circ(x + 14, y - 16, 15, c)); } }
    out.push(path(`M${W - 110} -40 L${W - 70} -40 L${W - 76} -100 L${W - 104} -100 Z`, '#c0703a'), cloverBlob(W - 90, -130, 40, '#5aa050', '#9ad47c'));
  }
  return out.join('');
}
function cgShop(defs, key) {
  const c = CG[key], W = 640, Gd = G(defs), r = rng(6800 + CG_KINDS.indexOf(key) * 13);
  const out = [rect(0, -1000, W, 1000, c.wall), rect(0, -1000, W, 1000, Gd.wallShade)];
  // 2階の窓
  out.push(win(Gd, 60, -940, W - 120, 170, { frame: '#ffffff', curtain: r() < 0.5 ? '#f3d9c2' : '#dfeaf2', mull: true, fw: 10 }));
  out.push(rect(0, -1000, 14, 1000, shade(c.wall, -0.14)), rect(W - 14, -1000, 14, 1000, shade(c.wall, -0.24)), rect(14, -1000, 4, 1000, '#ffffff', { opacity: 0.35 }));
  // 看板（文字はゲームで描く）
  out.push(board(36, -690, W - 72, 110, c.sign[0], c.sign[1]));
  // ひさし
  if (c.awn) out.push(awning(Gd, 18, -548, W - 36, 64, c.awn[0], c.awn[1], 7));
  else out.push(rect(18, -484, W - 36, 50, Gd.under), rect(10, -552, W - 20, 70, c.canopy), rect(10, -552, W - 20, 12, shade(c.canopy, 0.3)), rect(10, -490, W - 20, 8, shade(c.canopy, -0.3)));
  out.push(cgGoods(Gd, key, W, r));
  out.push(glassFrame(24, -440, W - 48, 410, '#6b6258', 10, { mull: key !== 'cafe' }));
  out.push(rect(0, -30, W, 30, '#cfc8bb'), rect(0, -30, W, 6, '#e8e3da'));
  return out.join('');
}
for (const key of CG_KINDS) sprite(SH, `s6/cg/${key}`, 64, 100, 0, 99, defs => tr(0, 99, cgShop(defs, key), 0.1));

// センター街の入口（正面から見たガラスのかまぼこ屋根・名前の帯）
sprite(SH, 's6/cgate', 106, 156, 1, 155, defs => {
  const Gd = G(defs), out = [];
  const cx = 520, cy = -1060, R = 480;
  for (const x of [20, 940]) {
    out.push(rect(x, -1080, 80, 1080, Gd.steel), rect(x + 10, -1080, 6, 1080, '#ffffff', { opacity: 0.7 }));
    for (let y = -960; y < -100; y += 240) out.push(rect(x - 6, y, 92, 18, '#d8cbb0'), rect(x - 6, y, 92, 5, '#fffaf0'));
    out.push(rrect(x - 20, -90, 120, 90, 10, '#bdb6aa'), rect(x - 20, -90, 120, 14, '#dcd6cb'));
  }
  out.push(path(`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z`, '#e9e3d6'), path(`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`, 'none', st('#fffaf0', 10)));
  out.push(path(`M${cx - R + 46} ${cy} A${R - 46} ${R - 46} 0 0 1 ${cx + R - 46} ${cy} Z`, defs.lin([[0, '#e8f7fc', 0.95], [1, '#b5dcec', 0.95]])));
  for (let k = 1; k < 8; k++) { const a = Math.PI + k / 8 * Math.PI; out.push(path(`M${cx} ${cy} L${cx + Math.cos(a) * (R - 40)} ${cy + Math.sin(a) * (R - 40)}`, 'none', st('#ffffff', 9))); }
  out.push(path(`M${cx - R + 86} ${cy - 40} A${R - 86} ${R - 86} 0 0 1 ${cx - 120} ${cy - R + 106}`, 'none', st('#ffffff', 14, { opacity: 0.5 })));
  for (let k = 0; k <= 14; k++) { const a = Math.PI + k / 14 * Math.PI; out.push(circ(cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22), 10, k % 2 ? '#ffe08a' : '#ffffff')); }
  // 名前の帯（文字はゲームで描く）
  out.push(rrect(cx - 400, -1330, 800, 150, 24, '#000000', { opacity: 0.16 }), rrect(cx - 400, -1344, 800, 150, 24, '#23466e'), rrect(cx - 384, -1328, 768, 118, 16, '#fffaf0'), rect(cx - 360, -1320, 720, 10, '#ffffff'));
  return tr(1, 155, out.join(''), 0.1);
});

// 街路樹（ケヤキ）
sprite(SH, 's6/tree', 48, 74, 24, 73, () => {
  const r = rng(6901), out = [];
  out.push(rect(-60, -20, 120, 20, '#8a7a68'), rect(-60, -20, 120, 5, '#b1a390'));
  out.push(path('M-18 -20 C-14 -140 -24 -200 -60 -270 L-44 -278 C-20 -236 -6 -210 2 -300 L18 -296 C14 -210 20 -140 20 -20 Z', '#6e5440'));
  out.push(path('M-2 -210 C26 -240 50 -260 76 -310 L86 -300 C60 -250 34 -228 2 -196 Z', '#6e5440'));
  const blobs = [];
  for (let i = 0; i < 24; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 170 * d, -440 + Math.sin(a) * 150 * d, 54 + r() * 28]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 12, br, '#3c7d3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 590) / 300; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4f9445' : r() < 0.5 ? '#5ea54f' : '#6ab45a', t < 0.5 ? '#b3e08e' : null)); }
  out.push(ell(80, -470, 70, 90, '#ffd9a0', { opacity: 0.18 }));
  return tr(24, 73, out.join(''), 0.1);
});

// 信号機（車の信号と歩行者の信号）
sprite(SH, 's6/signal', 36, 68, 6, 67, () => tr(6, 67, [
  rrect(-26, -40, 52, 40, 8, '#6b7078'), rect(-10, -660, 20, 624, '#8e949c'), rect(-10, -660, 6, 624, '#b9bec5'),
  rect(0, -640, 260, 14, '#8e949c'),
  rrect(120, -672, 200, 70, 14, '#5b6068'), rrect(126, -666, 188, 58, 10, '#3a3e45'),
  circ(160, -637, 20, '#3fd07a'), circ(160, -637, 30, '#3fd07a', { opacity: 0.25 }), circ(220, -637, 20, '#6a5a3a'), circ(280, -637, 20, '#6a3a3a'),
  rect(120, -606, 200, 6, '#000000', { opacity: 0.15 }),
  rrect(10, -440, 70, 130, 10, '#4d525a'), rrect(16, -432, 58, 54, 6, '#2b2e33'), rrect(16, -372, 58, 54, 6, '#2b2e33'),
  circ(45, -348, 8, '#5fe08a'), path('M45 -340 L38 -322 M45 -340 L54 -324 M45 -340 L45 -328 M36 -334 L54 -334', 'none', st('#5fe08a', 5)),
  circ(45, -412, 8, '#5a3030'), rect(38, -404, 14, 20, '#5a3030'),
  rrect(-40, -220, 26, 90, 8, '#f2c230'), rect(-36, -200, 18, 40, '#ffffff', { opacity: 0.5 })
], 0.1));

// 横断歩道の白いしま（地面のふちの上に重ねる）
sprite(SH, 's6/zebra', 48, 5, 0, 0, () => tr(0, 0, [...[0, 1, 2, 3, 4, 5].map(i => rect(i * 80 + 8, 6, 44, 36, '#ffffff', { opacity: 0.92 }) + rect(i * 80 + 8, 36, 44, 6, '#d7d2ca'))].join(''), 0.1));

// ポートライナーの高架（コンクリートの軌道と T 字の柱）
sprite(SH, 's6/guideway', 64, 130, 0, 0, () => tr(0, 0, [
  rect(0, 40, 640, 26, '#c3c7cc'), rect(0, 40, 640, 6, '#e8ebee'),
  rect(0, 66, 640, 104, '#dfe2e6'), rect(0, 66, 640, 10, '#f4f6f8'), rect(0, 150, 640, 20, '#b7bcc3'), rect(0, 170, 640, 12, '#000000', { opacity: 0.12 }),
  rect(0, 110, 640, 8, '#2f6fb8', { opacity: 0.7 }),
  path('M200 182 L440 182 L380 250 L260 250 Z', '#c7ccd2'), path('M200 182 L260 250 L276 250 L222 182 Z', '#e1e4e8'),
  rect(270, 250, 100, 1030, '#cdd1d6'), rect(270, 250, 26, 1030, '#e6e9ec'), rect(346, 250, 24, 1030, '#b3b8bf'),
  rect(250, 1240, 140, 40, '#b3b8bf'), rect(250, 1240, 140, 8, '#d4d8dc')
], 0.1));

// ========================================================================
// 南京町：背景（夕焼け）
// ========================================================================
const NK = 'nankin';
const NHZ = '#f8d2b6';
const nhz = (c, k) => mix(c, NHZ, k);
const RED = '#c8342a', REDL = '#e8574a', REDD = '#8e1f1b', GOLD = '#f2c14c', GOLDD = '#b8862a', JADE = '#2f8a62', JADEL = '#62c08e', JADED = '#1f5f45';

bgLayer(NK, { f: 0.02, w: 1200, y: 0, h: 120 }, (defs, w) => {
  const r = rng(7101);
  const out = [];
  for (const [x, y, s] of [[140, 34, 0.75], [420, 56, 0.55], [640, 26, 0.9], [900, 48, 0.65], [1100, 30, 0.5]]) out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#fff0e2', '#f3b8a2', '#fffaf4')));
  for (let i = 0; i < 4; i++) { const x = r() * w, y = 74 + r() * 16, s = 0.3 + r() * 0.15; out.push(wrap(w, x - 44 * s, 88 * s, xx => cloud(xx + 44 * s, y, s, '#ffeede', '#f5c6ae', null))); }
  return out.join('');
});
// 元町の街とポートタワー（夕日でうすいオレンジ）
bgLayer(NK, { f: 0.05, w: 1200, y: 50, h: 170 }, (defs, w) => {
  const r = rng(7201);
  const out = [];
  const cols = ['#d9b3b4', '#e3c0b8', '#cfaab4', '#e8cbbf', '#d4b8c0'];
  for (let x = -6; x < w;) {
    const bw = 14 + r() * 24, top = 118 + Math.pow(r(), 1.4) * 50, c = cols[Math.floor(r() * cols.length)];
    out.push(wrap(w, x, bw, xx => {
      const p = [rect(xx, top, bw, 220 - top, c), rect(xx + bw * 0.7, top, bw * 0.3, 220 - top, '#f7cfae', { opacity: 0.45 }), rect(xx - 0.5, top - 1, bw + 1, 1.4, shade(c, 0.25))];
      for (let y = top + 4; y < 214; y += 5) for (let wx = xx + 2; wx < xx + bw * 0.7 - 2; wx += 3.6) if (r() < 0.8) p.push(rect(wx, y, 1.8, 2.2, r() < 0.2 ? '#ffe2a6' : shade(c, -0.1), { opacity: 0.8 }));
      return p.join('');
    }));
    x += bw + 2 + r() * 6;
  }
  // ポートタワー
  const px = 760, py = 176;
  out.push(wrap(w, px - 10, 20, xx => [
    path(`M${xx - 6} ${py} C${xx - 2} ${py - 22} ${xx - 2} ${py - 34} ${xx - 5} ${py - 52} L${xx + 5} ${py - 52} C${xx + 2} ${py - 34} ${xx + 2} ${py - 22} ${xx + 6} ${py} Z`, '#e0604c'),
    rect(xx - 5.5, py - 56, 11, 4, '#f6e9dc'), rect(xx - 4, py - 60, 8, 4, '#e0604c'), rect(xx - 0.6, py - 68, 1.2, 8, '#e0604c')
  ].join('')));
  out.push(rect(0, 130, w, 90, defs.linU([[0, NHZ, 0], [1, NHZ, 0.7]], 0, 130, 0, 220)));
  return tr(0, -50, out.join(''));
});
// 中国ふうの屋根（反りのある屋根の先）
function chinaRoof(x, y, w, h, c, cl, cd, tip = 1) {
  const out = [];
  out.push(path(`M${x - 6 * tip} ${y - h * 0.9} Q${x + w * 0.1} ${y - h * 0.2} ${x + w * 0.2} ${y - h} L${x + w * 0.8} ${y - h} Q${x + w * 0.9} ${y - h * 0.2} ${x + w + 6 * tip} ${y - h * 0.9} Q${x + w + 2} ${y} ${x + w - 4} ${y} L${x + 4} ${y} Q${x - 2} ${y} ${x - 6 * tip} ${y - h * 0.9} Z`, c));
  out.push(rect(x + w * 0.2, y - h - 1.4, w * 0.6, 2, cd), path(`M${x + w * 0.2} ${y - h} Q${x + w * 0.12} ${y - h * 0.3} ${x - 4 * tip} ${y - h * 0.85}`, 'none', st(cl, 1, { opacity: 0.8 })));
  for (let k = 1; k < Math.floor(w / 3); k++) out.push(rect(x + k * 3, y - h * 0.7, 0.6, h * 0.62, cd, { opacity: 0.35 }));
  out.push(rect(x + 2, y - 1.2, w - 4, 1.2, GOLD, { opacity: 0.8 }));
  return out.join('');
}
// 中国ふうの屋根なみと塔（かすんで見える）
bgLayer(NK, { f: 0.14, w: 1000, y: 70, h: 170 }, (defs, w) => {
  const r = rng(7301);
  const out = [];
  const K = 0.35;
  for (let x = -10; x < w;) {
    const bw = 30 + r() * 36, bh = 26 + r() * 34, top = 214 - bh;
    const wall = nhz(['#d2604e', '#e9d2b0', '#c9544a', '#f0dcc0'][Math.floor(r() * 4)], K);
    out.push(wrap(w, x - 8, bw + 16, xx => {
      const p = [rect(xx, top, bw, bh + 20, wall), rect(xx + bw - 4, top, 4, bh + 20, shade(wall, -0.1))];
      for (let y = top + 6; y < 208; y += 10) for (let wx = xx + 4; wx < xx + bw - 7; wx += 8) p.push(rect(wx, y, 5, 6, nhz('#6f5a52', K)), rect(wx, y, 5, 1.2, nhz(GOLD, K)));
      p.push(chinaRoof(xx - 2, top, bw + 4, 8, nhz(JADE, K), nhz(JADEL, K), nhz(JADED, K)));
      return p.join('');
    }));
    x += bw + 6 + r() * 14;
  }
  // 三重の塔
  const tx = 420;
  out.push(wrap(w, tx - 30, 60, xx => {
    const p = [];
    for (let i = 0; i < 3; i++) { const y = 200 - i * 24, ww = 40 - i * 9; p.push(rect(xx - ww / 2 + 4, y - 20, ww - 8, 20, nhz(RED, K)), rect(xx - ww / 2 + 7, y - 16, ww - 14, 8, nhz('#6f5a52', K)), chinaRoof(xx - ww / 2, y - 18, ww, 9, nhz(JADE, K), nhz(JADEL, K), nhz(JADED, K), 1.2)); }
    p.push(rect(xx - 0.8, 110, 1.6, 20, nhz(GOLD, K)), circ(xx, 110, 2, nhz(GOLD, K)));
    return p.join('');
  }));
  out.push(rect(0, 208, w, 32, nhz('#a8604c', K)));
  out.push(rect(0, 120, w, 120, defs.linU([[0, NHZ, 0.1], [1, NHZ, 0.25]], 0, 120, 0, 240)));
  return tr(0, -70, out.join(''));
});
// 南京町の店なみ（赤い柱・ベランダ・看板・ちょうちん）
function shophouse(x, w, h, r) {
  const out = [];
  const top = 206 - h;
  const pal = [['#f1dfc0', RED], ['#c8423a', GOLD], ['#efe4cf', JADE], ['#d65a44', '#f6e3b0']][Math.floor(r() * 4)];
  const wall = pal[0], acc = pal[1];
  out.push(rect(x, top, w, h, wall), rect(x + w - 4, top, 4, h, shade(wall, -0.12)));
  // 2階・3階の窓（格子）とベランダ
  const floors = Math.max(1, Math.floor((h - 36) / 26));
  for (let i = 0; i < floors; i++) {
    const y = top + 14 + i * 26;
    for (let wx = x + 5; wx < x + w - 14; wx += 17) {
      out.push(rect(wx, y, 12, 14, '#5a3a2e'), rect(wx + 1, y + 1, 10, 12, '#f6d7a0', { opacity: 0.55 }));
      out.push(path(`M${wx + 1} ${y + 5} L${wx + 11} ${y + 5} M${wx + 1} ${y + 9} L${wx + 11} ${y + 9} M${wx + 4.3} ${y + 1} L${wx + 4.3} ${y + 13} M${wx + 7.6} ${y + 1} L${wx + 7.6} ${y + 13}`, 'none', st('#8a4a32', 0.6)));
    }
    out.push(rect(x - 1, y + 16, w + 2, 1.6, REDD), rect(x - 1, y + 18, w + 2, 1, GOLD));
    for (let bx = x + 1; bx < x + w; bx += 3) out.push(rect(bx, y + 18, 0.8, 5, RED));
    out.push(rect(x - 1, y + 22.5, w + 2, 1.2, REDD));
  }
  // 屋根
  out.push(chinaRoof(x - 3, top + 1, w + 6, 10, JADE, JADEL, JADED));
  // たての看板
  const sx = x + w * (r() < 0.5 ? 0.12 : 0.72);
  out.push(rrect(sx - 1, top + 12, 8, 36, 1, GOLDD), rrect(sx, top + 13, 6, 34, acc === GOLD ? RED : acc), rect(sx + 1, top + 14, 1.2, 32, '#ffffff', { opacity: 0.3 }));
  // 1階：店（あたたかいあかり）
  const sy = 206 - 30;
  out.push(rect(x + 2, sy - 6, w - 4, 6, acc), rect(x + 2, sy - 6, w - 4, 1.4, '#ffffff', { opacity: 0.35 }));
  out.push(rect(x + 4, sy, w - 8, 30, '#ffdca0'), rect(x + 4, sy, w - 8, 30, defs0.lin([[0, '#000000', 0.35], [0.5, '#000000', 0.08], [1, '#000000', 0]])));
  for (const cx of [x + 1, x + w - 3]) out.push(rect(cx, sy - 6, 2.4, 36, RED), rect(cx, sy - 6, 0.8, 36, REDL));
  return out.join('');
}
let defs0 = null;
bgLayer(NK, { f: 0.3, w: 1100, y: 56, h: 184 }, (defs, w) => {
  defs0 = defs;
  const r = rng(7401);
  const out = [];
  for (let x = 0; x < w;) {
    const bw = 44 + r() * 30, bh = 58 + r() * 34;
    out.push(wrap(w, x - 6, bw + 12, xx => shophouse(xx, bw, bh, r)));
    x += bw + 3 + r() * 6;
  }
  out.push(rect(0, 206, w, 40, '#9a5a48'));
  out.push(rect(0, 56, w, 184, defs.linU([[0, NHZ, 0.22], [1, NHZ, 0.3]], 0, 56, 0, 240)));
  return tr(0, -56, out.join(''));
});

// ========================================================================
// 南京町：地面（赤とクリーム色の石だたみ＋灰色のレンガ）・ちょうちんの足場
// ========================================================================
{
  const greyBrick = (seed) => {
    const r = rng(seed);
    const out = [rect(0, 0, U, U, '#6d717a')];
    const cols = ['#9095a0', '#878c97', '#9a9ea8', '#8b8f99'];
    for (let row = 0; row < 4; row++) {
      const y = row * 40, off = row % 2 ? 40 : 0;
      for (let x = off - 80; x < U; x += 80) {
        const x0 = x + 3, x1 = x + 77;
        if (x1 <= 0 || x0 >= U) continue;
        const cross = x0 < 0 || x1 > U, c = cross ? cols[0] : cols[Math.floor(r() * cols.length)];
        const a = Math.max(0, x0), b = Math.min(U, x1);
        out.push(rect(a, y + 3, b - a, 34, c), rect(a, y + 4, b - a, 5, '#b3b7c0', { opacity: 0.7 }), rect(a, y + 30, b - a, 7, '#6f737c', { opacity: 0.6 }));
      }
    }
    return out.join('');
  };
  const body = (v) => greyBrick(7500 + v) + (v === 1 ? rect(0, 76, U, 8, REDD, { opacity: 0.55 }) : '');
  for (let v = 0; v < 3; v++) tileC(`t/${NK}/g/body${v}`, () => body(v));
  const top = (v) => [
    greyBrick(7510 + v),
    rect(0, 46, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 0, U, 48, '#7a5a4a'),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 9, 36, 30, (i + v) % 2 ? '#e6d2b2' : '#c0503e')),
    ...[0, 1, 2, 3].map(i => rect(i * 40 + 2, 9, 36, 5, '#ffffff', { opacity: 0.25 })),
    rect(0, 0, U, 8, '#f4e6cf'), rect(0, 39, U, 5, '#a0786a')
  ].join('');
  for (let v = 0; v < 2; v++) tileC(`t/${NK}/g/top${v}`, () => top(v));
  tileC(`t/${NK}/g/edgeL`, defs => rect(0, 0, 24, U, defs.lin([[0, '#000000', 0.3], [1, '#000000', 0]], 0, 0, 1, 0)));
  tileC(`t/${NK}/g/edgeR`, defs => rect(136, 0, 24, U, defs.lin([[0, '#000000', 0], [1, '#000000', 0.3]], 0, 0, 1, 0)));
  tileC(`t/${NK}/g/topL`, () => [rect(0, 0, 8, 48, '#7a5a4a'), rect(0, 0, 5, 42, '#e6d2b2')].join(''));
  tileC(`t/${NK}/g/topR`, () => [rect(152, 0, 8, 48, '#7a5a4a'), rect(155, 0, 5, 42, '#e6d2b2')].join(''));
  for (const k of Object.keys(SLOPES)) tileC(`t/${NK}/g/${k}`, defs => {
    const [yl, yr] = SLOPES[k];
    const cp = defs.clip(`<path d="M0 ${yl} L160 ${yr} L160 160 L0 160 Z"/>`);
    return [g(greyBrick(7520), { 'clip-path': cp }), path(`M0 ${yl} L160 ${yr} L160 ${yr + 44} L0 ${yl + 44} Z`, '#7a5a4a'), path(`M0 ${yl} L160 ${yr} L160 ${yr + 36} L0 ${yl + 36} Z`, '#c0503e'), path(`M0 ${yl + 2} L160 ${yr + 2}`, 'none', { stroke: '#f4e6cf', strokeWidth: 6 })].join('');
  });
  // 赤いうるしのブロック（金のわく）
  tileC(`t/${NK}/hard`, () => [rect(0, 0, U, U, REDD), rrect(6, 6, 148, 148, 6, RED), rrect(18, 18, 124, 124, 4, 'none', { stroke: GOLD, strokeWidth: 6 }), circ(80, 80, 16, GOLD), rect(6, 6, 148, 10, REDL, { opacity: 0.6 })].join(''));
  // すり抜け足場：緑の瓦の小さな屋根と赤いはり（ちょうちんは下げない）
  tileC(`t/${NK}/semi`, () => [
    rect(0, 62, U, 10, '#000000', { opacity: 0.22 }),
    rect(0, 34, U, 30, REDD), rect(0, 34, U, 24, RED), rect(0, 34, U, 6, REDL),
    ...[20, 60, 100, 140].map(x => circ(x, 47, 5, GOLD)),
    rect(0, 0, U, 38, JADED), rect(0, 0, U, 30, JADE),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => rect(k * 20 + 7, 9, 6, 19, JADEL, { opacity: 0.85 })),
    rect(0, 0, U, 7, '#fff4cc'), rect(0, 7, U, 3, GOLD),
    ...[40, 120].map(x => rect(x - 2, 64, 4, 14, GOLDD) + path(`M${x - 7} 78 L${x + 7} 78 L${x + 4} 102 L${x - 4} 102 Z`, GOLD))
  ].join(''));
}

// ========================================================================
// 南京町：飾り（s6 シート）
// ========================================================================
// 長安門（屋根のてっぺんが歩ける高さ。原点は屋根のむねの左はし）
sprite(SH, 's6/gate', 188, 110, 30, 12, defs => {
  const out = [];
  const L = -160, R = 1440;              // むね（歩けるところ）の左右
  const glaze = defs.lin([[0, JADEL], [0.4, JADE], [1, JADED]]);
  // 石のしし（左右）
  for (const [x, fl] of [[-220, 1], [1500, -1]]) out.push(tr(x, 960, [
    rect(-60, -60, 120, 60, '#cfc8bb'), rect(-60, -60, 120, 10, '#e9e4db'),
    ell(0, -110, 44, 52, '#e6e1d8'), circ(10 * fl, -170, 34, '#e6e1d8'), circ(10 * fl, -186, 26, '#d2cbbf'),
    ...[-20, 0, 20].map(dx => circ(dx * fl + 10 * fl, -198, 8, '#c4bcaf')), circ(22 * fl, -170, 5, '#3a3a40'), ell(-10 * fl, -80, 24, 16, '#d2cbbf')
  ].join('')));
  // 柱
  const cols = [0, 400, 880, 1280];
  for (const x of cols) {
    out.push(rect(x - 12, 880, 94, 80, '#e6e1d8'), rect(x - 12, 880, 94, 12, '#f6f3ee'), rect(x - 12, 948, 94, 12, '#b8b0a3'));
    out.push(rect(x, 360, 70, 520, defs.lin([[0, REDL], [0.45, RED], [1, REDD]], 0, 0, 1, 0)));
    out.push(rect(x - 6, 360, 82, 22, GOLD), rect(x - 6, 856, 82, 24, GOLD), rect(x - 6, 856, 82, 6, '#fff1c8'));
  }
  // わきの格子と、中央のかざり
  for (const [x0, x1] of [[70, 400], [950, 1280]]) {
    out.push(rect(x0, 380, x1 - x0, 90, REDD), rect(x0 + 8, 388, x1 - x0 - 16, 74, RED));
    for (let x = x0 + 20; x < x1 - 10; x += 34) out.push(rect(x, 392, 6, 66, GOLD, { opacity: 0.85 }));
    out.push(rect(x0 + 8, 420, x1 - x0 - 16, 6, GOLD, { opacity: 0.85 }));
  }
  out.push(path('M470 500 L810 500 L790 540 L490 540 Z', GOLD), ...[0, 1, 2, 3, 4, 5].map(k => circ(520 + k * 48, 552, 9, '#fff1c8')));
  // はり（青と緑のもよう）
  out.push(rect(-60, 290, 1560, 76, '#2f6f8f'), rect(-60, 290, 1560, 12, '#5a9fc0'), rect(-60, 354, 1560, 12, '#1f4a60'));
  for (let x = -40; x < 1480; x += 80) out.push(ell(x + 40, 328, 26, 16, JADEL), ell(x + 40, 328, 12, 7, GOLD), rect(x + 76, 300, 6, 54, GOLD, { opacity: 0.8 }));
  // 看板（金・文字はゲームで描く）
  out.push(rrect(446, 250, 388, 210, 12, REDD), rrect(460, 264, 360, 182, 8, GOLD), rrect(474, 278, 332, 154, 6, 'none', { stroke: '#fff1c8', strokeWidth: 5 }), rect(480, 284, 320, 12, '#ffffff', { opacity: 0.35 }));
  // 組物（のきの下の小さなかざり）
  out.push(rect(-120, 214, 1680, 76, REDD));
  for (let x = -110; x < 1540; x += 52) out.push(rect(x, 222, 40, 26, JADE), rect(x + 4, 226, 32, 6, JADEL), rect(x + 8, 250, 24, 32, '#2f6f8f'), rect(x + 14, 254, 12, 6, GOLD));
  // 屋根（緑の瓦・反った先）
  const eY = 200, tipY = 110;
  const roof = `M${L} 24 L${R} 24 Q${R + 60} ${eY - 60} ${R + 150} ${eY - 10} Q${R + 200} ${eY - 20} ${R + 230} ${tipY} Q${R + 190} ${eY + 20} ${R + 110} ${eY + 16} L${L - 110} ${eY + 16} Q${L - 190} ${eY + 20} ${L - 230} ${tipY} Q${L - 200} ${eY - 20} ${L - 150} ${eY - 10} Q${L - 60} ${eY - 60} ${L} 24 Z`;
  out.push(path(roof, JADED, { transform: 'translate(0 10)' }), path(roof, glaze));
  for (let x = L - 80; x < R + 80; x += 36) out.push(path(`M${x} 40 L${x + (x - 640) * 0.08} ${eY + 4}`, 'none', st(JADED, 6, { opacity: 0.55 })), path(`M${x + 12} 40 L${x + 12 + (x - 640) * 0.08} ${eY}`, 'none', st(JADEL, 3, { opacity: 0.5 })));
  out.push(path(`M${L - 150} ${eY + 6} L${R + 150} ${eY + 6}`, 'none', st(GOLD, 10)));
  for (let x = L - 120; x < R + 130; x += 40) out.push(circ(x, eY + 18, 11, JADED), circ(x, eY + 16, 7, GOLD));
  // むね（歩けるところ：明るいふち）
  out.push(rect(L, 0, R - L, 34, '#1f5f45'), rect(L, 0, R - L, 26, '#f5d36a'), rect(L, 0, R - L, 7, '#fffbe6'));
  for (let x = L + 40; x < R; x += 80) out.push(rect(x, 12, 30, 8, GOLDD, { opacity: 0.6 }));
  // むねのはしの飾り（小さな魚の形）
  for (const [x, fl] of [[L + 10, 1], [R - 10, -1]]) out.push(path(`M${x} 0 Q${x + 4 * fl} -60 ${x + 40 * fl} -80 Q${x + 26 * fl} -46 ${x + 44 * fl} -30 Q${x + 20 * fl} -20 ${x + 30 * fl} 0 Z`, GOLD));
  out.push(circ(640, -30, 26, GOLD), circ(640, -30, 12, '#fff1c8'), rect(632, -8, 16, 12, GOLDD));
  return tr(30, 12, out.join(''), 0.1);
});

// 屋台（0: 豚まん / 1: 餃子 / 2: ごま団子・杏仁豆腐）。看板の文字はゲームで描く
const STALL = [
  { roof: JADE, roofL: JADEL, roofD: JADED, body: RED, bodyL: REDL, bodyD: REDD, board: GOLD, boardE: REDD },
  { roof: '#c8342a', roofL: '#e8574a', roofD: '#8e1f1b', body: '#2f7a5a', bodyL: '#4f9a7a', bodyD: '#1f5a42', board: '#fff3d6', boardE: '#2f7a5a' },
  { roof: '#e89a2a', roofL: '#f6c05a', roofD: '#a8661a', body: '#b8452e', bodyL: '#d8654e', bodyD: '#7a2a1c', board: '#fff3d6', boardE: '#e0702a' }
];
for (let v = 0; v < 3; v++) sprite(SH, `s6/stall${v}`, 82, 70, 5, 69, defs => {
  const c = STALL[v], Gd = G(defs), r = rng(7600 + v), W = 720, out = [];
  // 奥（あたたかいあかり）
  out.push(rect(20, -470, W - 40, 470, '#ffd9a0'), rect(20, -470, W - 40, 470, Gd.inShade, { opacity: 0.7 }));
  out.push(rect(60, -440, W - 120, 8, '#8a5a3a'), rect(60, -350, W - 120, 8, '#8a5a3a'));
  for (let x = 80; x < W - 80; x += 60) out.push(rrect(x, -420, 36, 50, 6, ['#f6efe2', '#e8c07a', '#d8574a'][Math.floor(r() * 3)]), rrect(x + 4, -340 + 20, 30, 10, 3, '#c9a878'));
  // 柱
  for (const x of [0, W - 40]) out.push(rect(x, -560, 40, 560, c.body), rect(x, -560, 12, 560, c.bodyL));
  // 屋根（反った瓦）
  const ry = -560;
  out.push(path(`M-50 ${ry + 10} Q-30 ${ry - 40} 40 ${ry - 100} L${W - 40} ${ry - 100} Q${W + 30} ${ry - 40} ${W + 50} ${ry + 10} Q${W + 20} ${ry - 4} ${W} ${ry} L0 ${ry} Q-20 ${ry - 4} -50 ${ry + 10} Z`, c.roof));
  for (let x = 40; x < W - 30; x += 30) out.push(rect(x, ry - 96, 10, 90, c.roofL, { opacity: 0.55 }));
  out.push(rect(-10, ry - 6, W + 20, 12, GOLD), rect(40, ry - 110, W - 80, 16, c.roofD));
  // 看板
  out.push(rrect(120, -520, W - 240, 110, 10, c.boardE), rrect(134, -506, W - 268, 82, 6, c.board), rect(146, -500, W - 292, 8, '#ffffff', { opacity: 0.4 }));
  // 売り台
  out.push(rect(0, -250, W, 250, c.bodyD), rect(10, -240, W - 20, 230, c.body), rect(10, -240, W - 20, 14, c.bodyL));
  for (let x = 40; x < W - 40; x += 120) out.push(rrect(x, -190, 90, 140, 8, 'none', { stroke: GOLD, strokeWidth: 5 }), circ(x + 45, -120, 16, GOLD, { opacity: 0.9 }));
  out.push(rect(-10, -262, W + 20, 22, '#8a5a3a'), rect(-10, -262, W + 20, 6, '#b07a4a'));
  // 品物
  if (v === 0) {
    // せいろ（竹のむし器）と豚まん
    for (const [x, n] of [[110, 3], [300, 2], [490, 3]]) {
      for (let k = 0; k < n; k++) { const y = -262 - k * 44; out.push(rrect(x, y - 44, 150, 44, 8, '#d9b070'), rect(x, y - 36, 150, 6, '#b88a4a'), rect(x, y - 16, 150, 5, '#b88a4a')); }
      const ty = -262 - n * 44;
      out.push(ell(x + 75, ty, 78, 12, '#c9a060'));
      for (const dx of [-40, 0, 40]) out.push(ell(x + 75 + dx, ty - 14, 22, 18, '#fbf6ea'), path(`M${x + 69 + dx} ${ty - 28} q6 -8 12 0`, 'none', st('#e2d6bc', 3)));
    }
  } else if (v === 1) {
    // 焼き餃子の大きななべとお皿
    out.push(ell(220, -270, 150, 26, '#3a3a40'), ell(220, -276, 136, 20, '#5a5a62'));
    for (let k = 0; k < 7; k++) out.push(path(`M${120 + k * 30} -276 q15 -28 30 0 Z`, '#f3dcae'), path(`M${122 + k * 30} -278 q13 -8 26 0`, 'none', st('#d49a4a', 4)));
    for (const x of [470, 590]) { out.push(ell(x, -266, 56, 12, '#ffffff'), ell(x, -268, 46, 8, '#e8f0f6')); for (let k = 0; k < 4; k++) out.push(path(`M${x - 36 + k * 18} -270 q9 -18 18 0 Z`, '#f6e3bc')); }
  } else {
    // ごま団子のくし・杏仁豆腐のカップ
    for (let k = 0; k < 5; k++) { const x = 90 + k * 50; out.push(rect(x - 2, -400, 4, 140, '#c9a060')); for (let j = 0; j < 3; j++) out.push(circ(x, -300 - j * 34, 17, '#d89a4a'), circ(x - 5, -306 - j * 34, 5, '#fff1c8', { opacity: 0.8 }), ...[0, 1, 2].map(q => circ(x - 8 + q * 7, -296 - j * 34 + (q % 2) * 5, 1.8, '#fff8e8'))); }
    for (let k = 0; k < 4; k++) { const x = 400 + k * 70; out.push(path(`M${x} -262 L${x + 50} -262 L${x + 44} -320 L${x + 6} -320 Z`, '#ffffff', { opacity: 0.85 }), rect(x + 8, -312, 34, 30, k % 2 ? '#fbf3e0' : '#f6b24a'), circ(x + 25, -318, 7, '#e2453a')); }
  }
  return tr(5, 69, out.join(''), 0.1);
});

// 南京町広場のあずまや（赤い柱・緑と金の二重の屋根）
sprite(SH, 's6/pavilion', 104, 122, 52, 121, defs => {
  const out = [];
  const glaze = defs.lin([[0, JADEL], [0.5, JADE], [1, JADED]]);
  // 石の台と手すり
  out.push(rect(-470, -70, 940, 70, '#d8d2c6'), rect(-470, -70, 940, 10, '#f0ece5'), rect(-500, -20, 1000, 20, '#bdb6aa'));
  out.push(rect(-150, -70, 300, 70, '#e6e1d8'), rect(-150, -40, 300, 6, '#c9c2b6'));
  for (const [x0, x1] of [[-430, -170], [170, 430]]) { out.push(rect(x0, -170, x1 - x0, 16, '#f4efe6'), rect(x0, -86, x1 - x0, 14, '#f4efe6')); for (let x = x0 + 14; x < x1; x += 34) out.push(rrect(x, -156, 14, 72, 6, '#ece6da')); }
  // 柱
  for (const x of [-380, -130, 130, 380]) out.push(rect(x - 26, -640, 52, 570, defs.lin([[0, REDL], [0.45, RED], [1, REDD]], 0, 0, 1, 0)), rect(x - 30, -110, 60, 40, GOLD));
  // のきの下の格子
  out.push(rect(-420, -700, 840, 80, REDD), rect(-410, -692, 820, 64, RED));
  for (let x = -400; x < 400; x += 30) out.push(rect(x, -688, 5, 56, GOLD, { opacity: 0.8 }));
  out.push(rect(-420, -640, 840, 10, GOLD));
  // 下の屋根
  const roof = (y, w, h, tip) => `M${-w * 0.62} ${y - h} L${w * 0.62} ${y - h} Q${w * 0.82} ${y - 20} ${w + 40} ${y - tip} Q${w + 10} ${y + 16} ${w - 50} ${y + 10} L${-w + 50} ${y + 10} Q${-w - 10} ${y + 16} ${-w - 40} ${y - tip} Q${-w * 0.82} ${y - 20} ${-w * 0.62} ${y - h} Z`;
  out.push(path(roof(-700, 520, 150, 70), JADED, { transform: 'translate(0 10)' }), path(roof(-700, 520, 150, 70), glaze));
  for (let x = -440; x < 450; x += 34) out.push(path(`M${x * 0.72} -840 L${x} -694`, 'none', st(JADED, 5, { opacity: 0.5 })));
  out.push(path(`M-520 -694 L520 -694`, 'none', st(GOLD, 9)));
  // 上の段
  out.push(rect(-230, -900, 460, 60, RED), rect(-230, -900, 460, 12, REDL), ...[-170, -60, 50, 160].map(x => rect(x, -888, 20, 40, GOLD)));
  out.push(path(roof(-900, 330, 190, 60), JADED, { transform: 'translate(0 10)' }), path(roof(-900, 330, 190, 60), glaze));
  for (let x = -290; x < 300; x += 32) out.push(path(`M${x * 0.6} -1080 L${x} -896`, 'none', st(JADED, 5, { opacity: 0.5 })));
  out.push(path(`M-330 -894 L330 -894`, 'none', st(GOLD, 8)));
  // てっぺんの金のひょうたん
  out.push(circ(0, -1110, 40, GOLD), circ(0, -1170, 26, GOLD), rect(-4, -1220, 8, 40, GOLD), circ(-10, -1120, 12, '#fff1c8'), rect(-60, -1090, 120, 20, GOLDD));
  return tr(52, 121, out.join(''), 0.1);
});

// ちょうちん（ひもにつるす）
sprite(SH, 's6/lantern', 10, 18, 5, 0, () => tr(5, 0, [
  rect(-2, 0, 4, 14, '#5a3a2e'),
  rrect(-26, 12, 52, 14, 4, GOLDD), rrect(-26, 12, 52, 5, 3, GOLD),
  ell(0, 66, 46, 44, '#d8322a'), ell(0, 62, 40, 38, '#f0503e'), ell(-14, 50, 10, 20, '#ff9a86', { opacity: 0.7 }),
  ...[36, 52, 68, 84, 100].map(y => path(`M${-Math.sqrt(Math.max(0, 1 - ((y - 66) / 44) ** 2)) * 44} ${y} Q0 ${y + 5} ${Math.sqrt(Math.max(0, 1 - ((y - 66) / 44) ** 2)) * 44} ${y}`, 'none', st('#b8261e', 2.4, { opacity: 0.8 }))),
  rrect(-26, 104, 52, 14, 4, GOLDD), rrect(-26, 104, 52, 5, 3, GOLD),
  rect(-2, 118, 4, 14, GOLDD), path('M-10 130 L10 130 L8 176 L-8 176 Z', GOLD), rect(-8, 170, 16, 6, GOLDD)
], 0.1));
