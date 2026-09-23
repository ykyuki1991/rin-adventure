// ステージ1の飾り：完成イメージの商店街に合わせた店・アーケードの門・街灯・木・りんの家
// 座標は 0.1ドット単位。店は左下（地面）が原点で、上がマイナス。店の名前の文字はゲームの中で描く
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, poly, rng, shade, mix } from './svg.mjs';

const SH = 'yakumo';
const st = (c, w, o = {}) => ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', ...o });
const TAU = Math.PI * 2;

// スプライトごとに使い回すグラデーション
function G(defs) {
  return {
    glass: defs.lin([[0, '#d4edf8'], [0.55, '#a9d3ea'], [1, '#8cc0de']]),
    warm: defs.lin([[0, '#ffe7b8'], [1, '#f6c98a']]),
    inShade: defs.lin([[0, '#000000', 0.42], [0.45, '#000000', 0.12], [1, '#000000', 0]]),
    under: defs.lin([[0, '#000000', 0.26], [1, '#000000', 0]]),
    awnShade: defs.lin([[0, '#ffffff', 0.22], [0.45, '#ffffff', 0], [1, '#000000', 0.16]]),
    wallShade: defs.lin([[0, '#000000', 0.1], [0.25, '#000000', 0], [1, '#000000', 0.06]]),
    globe: defs.rad([[0, '#ffffff'], [0.6, '#fff6e2'], [1, '#ead9b4']], 0.4, 0.35, 0.65),
    steel: defs.lin([[0, '#e2d6bd'], [0.4, '#fbf6ec'], [1, '#cbbd9f']], 0, 0, 1, 0),
    iron: defs.lin([[0, '#2c2c31'], [0.45, '#55555e'], [1, '#232327']], 0, 0, 1, 0)
  };
}

// ---------- 部品 ----------
// 窓（わく・ガラス・うつりこみ・カーテン）
function win(G, x, y, w, h, o = {}) {
  const fr = o.frame || '#ffffff', fw = o.fw ?? 12;
  const out = [rect(x - fw, y - fw, w + fw * 2, h + fw * 2, fr), rect(x, y, w, h, o.glass || G.glass)];
  if (o.light) out.push(rect(x, y, w, h, G.warm, { opacity: 0.85 }));
  if (o.curtain) {
    const c = o.curtain;
    out.push(path(`M${x} ${y} L${x + w * 0.26} ${y} Q${x + w * 0.12} ${y + h * 0.55} ${x + w * 0.2} ${y + h} L${x} ${y + h} Z`, c));
    out.push(path(`M${x + w} ${y} L${x + w * 0.74} ${y} Q${x + w * 0.88} ${y + h * 0.55} ${x + w * 0.8} ${y + h} L${x + w} ${y + h} Z`, c));
    out.push(rect(x, y, w, h * 0.1, shade(c, -0.12)));
  }
  out.push(path(`M${x + w * 0.1} ${y} L${x + w * 0.38} ${y} L${x + w * 0.1} ${y + h * 0.62} Z`, '#ffffff', { opacity: 0.42 }));
  out.push(path(`M${x + w * 0.46} ${y} L${x + w * 0.56} ${y} L${x + w * 0.3} ${y + h} L${x + w * 0.2} ${y + h} Z`, '#ffffff', { opacity: 0.18 }));
  if (o.mull !== false) out.push(rect(x + w / 2 - fw * 0.35, y, fw * 0.7, h, fr));
  if (o.bar) out.push(rect(x, y + h * 0.45, w, fw * 0.6, fr));
  out.push(rect(x, y, w, fw * 0.8, '#000000', { opacity: 0.12 }));
  if (o.sill !== false) out.push(rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 1.3, shade(fr, -0.16)), rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 0.4, '#ffffff', { opacity: 0.5 }));
  return out.join('');
}
// ショーウィンドウのわく（中の品物の上に重ねる：わく・うつりこみ・まどわく）
function glassFrame(x, y, w, h, fr, fw = 12, o = {}) {
  const out = [
    path(`M${x + w * 0.06} ${y} L${x + w * 0.3} ${y} L${x + w * 0.06} ${y + h * 0.5} Z`, '#ffffff', { opacity: 0.3 }),
    path(`M${x + w * 0.4} ${y} L${x + w * 0.48} ${y} L${x + w * 0.22} ${y + h} L${x + w * 0.14} ${y + h} Z`, '#ffffff', { opacity: 0.14 }),
    rect(x - fw, y - fw, w + fw * 2, fw, fr), rect(x - fw, y + h, w + fw * 2, fw, fr),
    rect(x - fw, y, fw, h, fr), rect(x + w, y, fw, h, fr),
    rect(x - fw, y - fw, w + fw * 2, 3, '#ffffff', { opacity: 0.3 })
  ];
  if (o.mull) out.push(rect(x + w / 2 - fw * 0.35, y, fw * 0.7, h, fr));
  if (o.sill) out.push(rect(x - fw * 2, y + h + fw, w + fw * 4, fw * 1.3, shade(fr, -0.2)));
  return out.join('');
}
// 花のプランター
function flowerBox(x, y, w, r, cols = ['#ff6b7d', '#ffd24a', '#ffffff', '#ff9ac2']) {
  const out = [];
  for (let i = 0; i < w / 28; i++) {
    const fx = x + 14 + i * 28 + (r() - 0.5) * 8, fy = y - 18 - r() * 22;
    out.push(circ(fx, fy + 14, 16, i % 2 ? '#4f9a45' : '#5eac4f'));
  }
  for (let i = 0; i < w / 34; i++) {
    const fx = x + 18 + i * 34 + (r() - 0.5) * 10, fy = y - 26 - r() * 20, c = cols[i % cols.length];
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; out.push(circ(fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 5.5, c)); }
    out.push(circ(fx, fy, 3.5, '#f7b733'));
  }
  out.push(rrect(x, y - 4, w, 34, 6, '#a0603a'), rect(x, y - 4, w, 8, '#c07a4c'), rect(x + 6, y + 22, w - 12, 5, '#000000', { opacity: 0.15 }));
  return out.join('');
}
// しましまのひさし（下が波）
function awning(G, x, y, w, h, c1, c2, n) {
  const sw = w / n, out = [rect(x, y + h, w, h * 0.9, G.under)];
  for (let i = 0; i < n; i++) {
    const c = i % 2 ? c2 : c1, sx = x + i * sw;
    out.push(path(`M${sx} ${y} L${sx + sw + 0.6} ${y} L${sx + sw + 0.6} ${y + h} Q${sx + sw / 2} ${y + h + sw * 0.5} ${sx} ${y + h} Z`, c));
  }
  out.push(rect(x, y, w, h, G.awnShade));
  for (let i = 0; i < n; i++) { const sx = x + i * sw; out.push(path(`M${sx + 4} ${y + h + 2} Q${sx + sw / 2} ${y + h + sw * 0.46} ${sx + sw - 4} ${y + h + 2}`, 'none', st('#000000', 3, { opacity: 0.12 }))); }
  out.push(rrect(x - 8, y - 12, w + 16, 16, 5, shade(c1, -0.35)), rect(x - 8, y - 12, w + 16, 4, '#ffffff', { opacity: 0.25 }));
  return out.join('');
}
// レンガのかべ（パン屋の2階）
function bricks(x, y, w, h, c = '#d9a47a', m = '#efd9bf') {
  const out = [rect(x, y, w, h, m)];
  for (let row = 0, yy = y; yy < y + h; row++, yy += 28) {
    for (let xx = x - (row % 2 ? 36 : 0); xx < x + w; xx += 72) {
      const x0 = Math.max(x, xx + 3), x1 = Math.min(x + w, xx + 69);
      if (x1 - x0 > 6) out.push(rect(x0, yy + 3, x1 - x0, Math.min(22, y + h - yy - 3), (row * 7 + Math.floor(xx / 72)) % 5 === 0 ? shade(c, -0.08) : (row + Math.floor(xx / 72)) % 3 === 0 ? shade(c, 0.08) : c));
    }
  }
  return out.join('');
}
// 無地のひさし（カフェ：青にカップのマーク）
function solidAwning(G, x, y, w, h, c) {
  const cx = x + w / 2, cy = y + h / 2 + 4;
  return [
    rect(x, y + h, w, h * 0.9, G.under),
    path(`M${x} ${y} L${x + w} ${y} L${x + w + 6} ${y + h} L${x - 6} ${y + h} Z`, c),
    rect(x - 6, y + h - 12, w + 12, 12, shade(c, -0.25)),
    rect(x, y, w, h, G.awnShade),
    tr(cx, cy, [
      path('M-20 -16 L16 -16 L12 12 Q-2 20 -16 12 Z', '#ffffff'),
      path('M15 -10 q14 2 12 12 q-2 8 -14 8', 'none', st('#ffffff', 5)),
      path('M-8 -22 q4 -8 0 -14 M4 -22 q4 -8 0 -14', 'none', st('#ffffff', 3, { opacity: 0.8 })),
      ell(-2, 22, 28, 5, '#ffffff', { opacity: 0.9 })
    ], 1.5),
    rrect(x - 8, y - 12, w + 16, 16, 5, shade(c, -0.35))
  ].join('');
}
// 看板（文字はゲームで描く）
function board(x, y, w, h, c, edge, r = 12) {
  return [
    rrect(x, y + 8, w, h, r, '#000000', { opacity: 0.16 }),
    rrect(x, y, w, h, r, edge), rrect(x + 9, y + 9, w - 18, h - 18, r * 0.7, c),
    rect(x + 16, y + 12, w - 32, 7, '#ffffff', { opacity: 0.22 }),
    circ(x + 20, y + h / 2, 5, shade(edge, -0.3)), circ(x + w - 20, y + h / 2, 5, shade(edge, -0.3))
  ].join('');
}
// 店の中（奥が暗い）
const inside = (G, x, y, w, h, c) => rect(x, y, w, h, c) + rect(x, y, w, h, G.inShade);
// 瓦（いぶし銀）の小さい屋根
function tileRoof(x, y, w, h, c = '#5d6674') {
  const out = [path(`M${x} ${y + h} L${x + 30} ${y} L${x + w - 30} ${y} L${x + w} ${y + h} Z`, c)];
  const rows = Math.max(2, Math.round(h / 26));
  for (let i = 1; i < rows; i++) { const yy = y + (h / rows) * i; out.push(rect(x + 30 * (1 - i / rows), yy - 2, w - 60 * (1 - i / rows), 3, shade(c, 0.22), { opacity: 0.8 })); }
  for (let xx = x + 8; xx < x + w - 8; xx += 22) out.push(circ(xx + 11, y + h + 2, 9, shade(c, -0.25)), circ(xx + 11, y + h + 1, 6, shade(c, 0.12)));
  out.push(rect(x + 26, y - 6, w - 52, 10, shade(c, -0.3)), rect(x + 26, y - 6, w - 52, 3, shade(c, 0.3)));
  return out.join('');
}
// ちょうちん
function lantern(x, y, s = 1) {
  return tr(x, y, [
    rect(-3, -34, 6, 14, '#3a2a22'),
    rrect(-24, -22, 48, 8, 3, '#2a2220'),
    ell(0, 18, 30, 40, '#f6ead0'), ell(-8, 10, 10, 26, '#ffffff', { opacity: 0.7 }), path('M-10 8 Q0 -6 10 8 Q0 30 -10 8 Z', '#8a5a3a', { opacity: 0.85 }),
    ...[-18, -4, 10, 24, 38].map(yy => path(`M${-Math.sqrt(Math.max(0, 1 - ((yy - 18) / 40) ** 2)) * 30} ${yy} Q0 ${yy + 4} ${Math.sqrt(Math.max(0, 1 - ((yy - 18) / 40) ** 2)) * 30} ${yy}`, 'none', st('#d8c8a6', 2))),
    rrect(-24, 52, 48, 8, 3, '#2a2220'), rect(-2, 60, 4, 14, '#2a2220')
  ], s);
}

// ---------- お店ごとの品物 ----------
const GOODS = {
  // やおや：木の箱に野菜と果物
  yaoya(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#6b5240')];
    // 奥のたな
    out.push(rect(30, -330, W - 60, 8, '#8a6446'), rect(30, -250, W - 60, 8, '#8a6446'));
    for (let x = 50; x < W - 60; x += 46) out.push(ell(x + 20, -348, 20, 16, ['#e2a33a', '#c9d86a', '#e8563f'][Math.floor(x / 46) % 3]), rect(x + 8, -268, 26, 18, ['#a57a50', '#b98a5a'][Math.floor(x / 46) % 2]));
    // 手前の台（2段）
    const crate = (x, y, w, h) => [rect(x, y, w, h, '#b9834f'), rect(x, y, w, 8, '#d6a26c'), rect(x, y + h * 0.5, w, 4, '#8f6038', { opacity: 0.7 }), rect(x, y + h - 6, w, 6, '#7a4f2e')].join('');
    out.push(crate(30, -210, W - 60, 70), crate(40, -120, W - 80, 90));
    const pile = (x0, x1, y, rad, c, hi, dx) => { const o = []; for (let x = x0; x < x1; x += dx) o.push(circ(x, y, rad, c), circ(x - rad * 0.35, y - rad * 0.35, rad * 0.32, hi, { opacity: 0.8 })); for (let x = x0 + dx / 2; x < x1 - dx / 2; x += dx) o.push(circ(x, y - rad * 1.1, rad, c), circ(x - rad * 0.35, y - rad * 1.45, rad * 0.32, hi, { opacity: 0.8 })); return o.join(''); };
    const seg = (W - 80) / 4;
    out.push(pile(56, 40 + seg, -214, 17, '#e8453a', '#ff9a86', 30));                 // トマト
    out.push(pile(60 + seg, 40 + seg * 2, -214, 18, '#f39a2a', '#ffd08a', 32));       // みかん
    for (let i = 0; i < 3; i++) { const cx = 70 + seg * 2 + i * seg / 3; out.push(circ(cx, -232, 30, '#8cc85a'), path(`M${cx - 24} ${-232} Q${cx} ${-262} ${cx + 24} ${-232}`, 'none', st('#6aa844', 4)), circ(cx - 8, -244, 9, '#b8e28a', { opacity: 0.8 })); } // キャベツ
    for (let i = 0; i < 4; i++) { const cx = 60 + seg * 3 + i * 20; out.push(ell(cx, -226, 11, 26, '#6a3a8a', { rot: 20 }), ell(cx - 4, -234, 3, 12, '#b08ad0', { rot: 20, opacity: 0.8 }), rect(cx + 4, -256, 7, 10, '#5a8a3a')); } // なす
    // 下の段：にんじん・バナナ・りんご
    for (let i = 0; i < 6; i++) { const cx = 60 + i * 18; out.push(path(`M${cx - 8} -126 L${cx + 8} -126 L${cx + 2} -180 Z`, '#f07a2a'), path(`M${cx - 4} -126 l-6 -14 M${cx + 4} -126 l6 -14`, 'none', st('#4f9a3a', 4))); }
    for (let i = 0; i < 4; i++) { const cx = 190 + i * 30; out.push(path(`M${cx - 20} -140 Q${cx} -110 ${cx + 22} -150 Q${cx + 4} -128 ${cx - 20} -140 Z`, '#f4d03f'), path(`M${cx + 18} -150 l6 -4`, 'none', st('#6a5a2a', 3))); }
    out.push(pile(330, W - 50, -140, 16, '#d8303a', '#ff8a8a', 30));
    // ねふだ
    for (let x = 70; x < W - 60; x += 110) out.push(rrect(x, -206, 44, 30, 4, '#ffffff'), rect(x, -206, 44, 8, '#e84a3a'), rect(x + 8, -190, 28, 4, '#444444', { opacity: 0.6 }));
    return out.join('');
  },
  // さかな：ななめの氷の台に魚、明石のタコ
  sakana(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#4d6470')];
    for (const x of [W * 0.3, W * 0.7]) out.push(path(`M${x} -400 L${x} -360`, 'none', st('#333', 2)), circ(x, -346, 14, '#fff3c0'), circ(x, -346, 26, '#fff3c0', { opacity: 0.25 }));
    out.push(path(`M30 -230 L${W - 30} -230 L${W - 20} -130 L20 -130 Z`, '#e9f7fb'), path(`M30 -230 L${W - 30} -230 L${W - 28} -214 L28 -214 Z`, '#ffffff'));
    for (let x = 40; x < W - 40; x += 22) out.push(circ(x + r() * 10, -150 - r() * 60, 5 + r() * 4, '#ffffff', { opacity: 0.8 }));
    const fish = (x, y, l, c, belly, rot) => tr(x, y, [
      ell(0, 0, l, l * 0.3, c), path(`M${l * 0.85} 0 L${l * 1.3} ${-l * 0.28} L${l * 1.24} 0 L${l * 1.3} ${l * 0.28} Z`, c),
      ell(-l * 0.1, l * 0.1, l * 0.8, l * 0.14, belly, { opacity: 0.8 }), circ(-l * 0.66, -l * 0.06, l * 0.09, '#ffffff'), circ(-l * 0.66, -l * 0.06, l * 0.05, '#222222'),
      path(`M${-l * 0.45} ${-l * 0.26} Q${-l * 0.38} 0 ${-l * 0.45} ${l * 0.24}`, 'none', st(shade(c, -0.25), 3))
    ], 1, rot);
    const n = Math.floor((W - 120) / 70);
    for (let i = 0; i < n; i++) {
      const x = 80 + i * 70, cols = [['#9fb2c0', '#e6eef3'], ['#e0604a', '#ffd0c0'], ['#6f93b8', '#dfe9f1'], ['#b8c4cc', '#f2f6f8']][i % 4];
      out.push(fish(x, -196 + (i % 2) * 34, 36, cols[0], cols[1], -8));
    }
    // タコ
    const tx = W - 110;
    out.push(ell(tx, -200, 34, 30, '#d9483f'), circ(tx - 10, -210, 9, '#ff8a7a', { opacity: 0.7 }));
    for (let k = 0; k < 5; k++) out.push(path(`M${tx - 30 + k * 15} -176 q${-10 + k * 5} 30 ${4 + k * 3} 38`, 'none', st('#d9483f', 9)));
    // 発泡スチロールの箱
    out.push(rect(30, -120, W * 0.45, 90, '#f7f9fa'), rect(30, -120, W * 0.45, 10, '#ffffff'), rect(48, -84, W * 0.3, 8, '#3a78c0', { opacity: 0.7 }));
    out.push(rect(W * 0.52, -110, W * 0.4, 80, '#eef3f5'), rect(W * 0.52 + 16, -80, W * 0.22, 8, '#e0604a', { opacity: 0.7 }));
    return out.join('');
  },
  // コロッケ（お肉屋さん）：ガラスのショーケース
  korokke(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#f3dcc0')];
    // 奥のメニュー
    for (let i = 0; i < 4; i++) out.push(rrect(50 + i * (W - 100) / 4, -380, (W - 100) / 4 - 14, 70, 6, i % 2 ? '#fff6e6' : '#ffe2c4'), rect(64 + i * (W - 100) / 4, -356, (W - 100) / 4 - 42, 6, '#c0503a', { opacity: 0.7 }), rect(64 + i * (W - 100) / 4, -338, (W - 100) / 4 - 60, 5, '#555555', { opacity: 0.5 }));
    out.push(rect(40, -290, W - 80, 16, '#c9a27a'));
    // ショーケース
    out.push(rect(30, -250, W - 60, 220, '#e9e3da'), rect(30, -250, W - 60, 14, '#ffffff'));
    out.push(rect(46, -226, W - 92, 120, '#dff0f6'), rect(46, -226, W - 92, 120, G.glass, { opacity: 0.35 }));
    for (let row = 0; row < 2; row++) {
      out.push(rect(52, -170 + row * 56 - 50, W - 104, 6, '#c8c0b4'));
      for (let x = 72; x < W - 70; x += 42) {
        const y = -190 + row * 56 - 50 + 34, c = row ? '#c97a36' : '#dd9a44';
        out.push(ell(x, y, 18, 12, c), ell(x - 4, y - 4, 10, 5, '#f4c77a', { opacity: 0.8 }));
        for (let k = 0; k < 4; k++) out.push(circ(x - 10 + r() * 20, y - 6 + r() * 12, 1.8, '#9a5a20'));
      }
    }
    out.push(path(`M50 -224 L90 -224 L50 -150 Z`, '#ffffff', { opacity: 0.5 }));
    out.push(rect(30, -96, W - 60, 66, '#cfc6b8'), rect(30, -96, W - 60, 6, '#ffffff', { opacity: 0.6 }));
    // 紙ぶくろ
    out.push(rect(W - 120, -278, 34, 28, '#e8d6b8'), rect(W - 80, -284, 30, 34, '#f2e4c8'));
    return out.join('');
  },
  // ほんや：本だな＋外に雑誌のラック
  honya(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#f1e6d2')];
    const cols = ['#d84a4a', '#3f72c8', '#e8c24a', '#5aa85a', '#8a5ad8', '#e87a4a', '#4ab8c8', '#f4f0e6', '#2f3a5a'];
    for (let row = 0; row < 3; row++) {
      const y = -380 + row * 100;
      out.push(rect(34, y + 86, W - 68, 10, '#8a6446'));
      for (let x = 40; x < W - 44;) { const bw = 12 + r() * 8, bh = 60 + r() * 24; out.push(rect(x, y + 86 - bh, bw, bh, cols[Math.floor(r() * cols.length)]), rect(x + 2, y + 86 - bh + 8, bw - 4, 3, '#ffffff', { opacity: 0.45 })); x += bw + 1.5; }
    }
    out.push(glassFrame(34, -396, W - 68, 296, '#5b3f2c', 10, { mull: true }));
    // 雑誌ラック
    out.push(rect(40, -150, 150, 120, '#6b4a32'));
    for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) out.push(rrect(48 + i * 46, -144 + k * 56, 40, 48, 3, cols[(i * 2 + k + 2) % cols.length]), rect(52 + i * 46, -138 + k * 56, 32, 10, '#ffffff', { opacity: 0.7 }));
    out.push(rect(30, -40, 170, 10, '#4a3322'));
    return out.join('');
  },
  // はなや：バケツの花
  hanaya(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#5d6b52')];
    const fl = ['#ff6b8a', '#ffd24a', '#ffffff', '#c86ad8', '#ff8a3a', '#f7a8c8', '#e8384a'];
    const bucket = (x, y, s) => {
      const o = [];
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.28, len = 70 * s + r() * 20; const ex = x + Math.cos(a) * len * 0.5, ey = y - 30 - Math.abs(Math.sin(a)) * len; o.push(path(`M${x} ${y - 20} L${ex} ${ey}`, 'none', st('#4f8a3a', 3))); o.push(circ(ex, ey, 9 * s + 2, '#4f9a45', { opacity: 0.7 })); }
      const c = fl[Math.floor(r() * fl.length)];
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.22, len = 60 * s + r() * 30; const ex = x + Math.cos(a) * len * 0.55, ey = y - 36 - Math.abs(Math.sin(a)) * len; o.push(circ(ex, ey, 10 * s, c), circ(ex - 2, ey - 2, 4 * s, '#ffffff', { opacity: 0.5 })); }
      o.push(path(`M${x - 26 * s} ${y - 40 * s} L${x + 26 * s} ${y - 40 * s} L${x + 20 * s} ${y} L${x - 20 * s} ${y} Z`, '#8f9aa4'), rect(x - 26 * s, y - 40 * s, 52 * s, 6, '#c3ccd4'));
      return o.join('');
    };
    out.push(rect(30, -190, W - 60, 12, '#7a5a40'), rect(40, -178, 10, 148, '#6a4a32'), rect(W - 50, -178, 10, 148, '#6a4a32'));
    for (let x = 70; x < W - 50; x += 70) out.push(bucket(x, -190, 0.9));
    for (let x = 60; x < W - 40; x += 62) out.push(bucket(x + 10, -36, 1.05));
    return out.join('');
  },
  // おもちゃ：ショーウィンドウとふうせん
  omocha(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#fff1dc')];
    out.push(rect(40, -300, W - 80, 10, '#c98a4a'), rect(40, -190, W - 80, 10, '#c98a4a'));
    // くまのぬいぐるみ
    const bear = (x, y) => [circ(x, y - 30, 26, '#b07a4a'), circ(x - 20, y - 52, 10, '#b07a4a'), circ(x + 20, y - 52, 10, '#b07a4a'), circ(x, y - 22, 10, '#e8c8a0'), circ(x - 8, y - 34, 3, '#222'), circ(x + 8, y - 34, 3, '#222'), ell(x, y, 30, 14, '#a06a3a')].join('');
    out.push(bear(90, -198));
    // ロボット
    out.push(rect(170, -250, 44, 48, '#a9b4c0'), rect(176, -290, 32, 36, '#c3ccd6'), circ(184, -274, 5, '#4ab8f0'), circ(200, -274, 5, '#4ab8f0'), rect(190, -304, 4, 14, '#777'), circ(192, -306, 5, '#e84a4a'));
    // 箱
    for (let x = 250; x < W - 60; x += 56) out.push(rect(x, -250, 46, 50, ['#e84a5a', '#3a7ad8', '#f4c030', '#4ab86a'][Math.floor(x / 56) % 4]), rect(x + 6, -240, 34, 16, '#ffffff', { opacity: 0.6 }));
    // 上の段：ボール・電車
    out.push(circ(90, -326, 22, '#f4f4f4'), path('M68 -326 A22 22 0 0 1 112 -326 Z', '#e84a4a'), rect(150, -340, 110, 34, '#e8564a'), rect(160, -334, 24, 14, '#bfe3f5'), rect(196, -334, 24, 14, '#bfe3f5'), circ(170, -304, 9, '#333'), circ(240, -304, 9, '#333'));
    out.push(glassFrame(34, -396, W - 68, 286, '#e0873a', 10, { mull: true }));
    out.push(rect(30, -110, W - 60, 80, '#e7c79a'), rect(30, -110, W - 60, 8, '#ffffff', { opacity: 0.4 }));
    return out.join('');
  },
  // お茶屋：茶づつと大きな壺
  ocha(G, W, r) {
    const out = [inside(G, 24, -400, W - 48, 380, '#6a5a40')];
    for (let row = 0; row < 2; row++) {
      const y = -300 + row * 100;
      out.push(rect(34, y, W - 68, 10, '#8a6446'));
      for (let x = 48; x < W - 60; x += 40) { const c = ['#3f7a3a', '#2a2a2a', '#c9a23a', '#8a3a2a'][Math.floor(r() * 4)]; out.push(rrect(x, y - 56, 30, 56, 4, c), rect(x, y - 44, 30, 16, '#f2ead8'), rect(x + 4, y - 56, 6, 56, '#ffffff', { opacity: 0.2 })); }
    }
    out.push(ell(90, -80, 52, 50, '#5b4a3a'), ell(90, -128, 30, 8, '#3a2e24'), ell(76, -92, 14, 26, '#8a7a6a', { opacity: 0.5 }));
    out.push(rect(170, -110, W - 210, 80, '#8a6446'), rect(170, -110, W - 210, 10, '#b08a64'));
    for (let x = 190; x < W - 60; x += 48) out.push(ell(x + 16, -120, 18, 10, '#6aa84a'), ell(x + 16, -124, 12, 5, '#9ad07a'));
    return out.join('');
  },
  // パン屋：ガラスのたなにパン、木のドア
  pan(G, W, r) {
    const out = [];
    const ww = Math.round(W * 0.6);
    out.push(inside(G, 40, -380, ww, 300, '#fbe6c6'));
    for (let row = 0; row < 3; row++) {
      const y = -300 + row * 86;
      out.push(rect(44, y, ww - 8, 8, '#a8744c'));
      for (let x = 64; x < ww + 20; x += 44) {
        const k = (row + Math.floor(x / 44)) % 3;
        if (k === 0) out.push(ell(x, y - 18, 20, 16, '#d8914a'), ell(x - 4, y - 24, 10, 6, '#f0c080', { opacity: 0.8 }));
        else if (k === 1) out.push(path(`M${x - 22} ${y - 8} Q${x} ${y - 40} ${x + 22} ${y - 8} Q${x} ${y - 20} ${x - 22} ${y - 8} Z`, '#c9782f'), path(`M${x - 10} ${y - 24} L${x - 6} ${y - 12} M${x} ${y - 28} L${x} ${y - 14} M${x + 10} ${y - 24} L${x + 6} ${y - 12}`, 'none', st('#8a4a1a', 2)));
        else out.push(rrect(x - 22, y - 26, 44, 24, 10, '#b86e30'), path(`M${x - 14} ${y - 22} l8 14 M${x - 2} ${y - 22} l8 14 M${x + 10} ${y - 22} l8 14`, 'none', st('#f0c080', 3)));
      }
    }
    out.push(glassFrame(40, -380, ww, 300, '#6b4430', 12, { sill: true }));
    // ドア
    const dx = ww + 70, dw = W - dx - 30;
    out.push(rect(dx - 10, -370, dw + 20, 340, '#6b4430'), rect(dx, -360, dw, 330, '#9a6844'), rect(dx + 14, -340, dw - 28, 160, G.glass), path(`M${dx + 18} -336 L${dx + 38} -336 L${dx + 18} -290 Z`, '#ffffff', { opacity: 0.5 }), circ(dx + dw - 16, -190, 6, '#f2c94c'));
    out.push(rrect(dx + dw / 2 - 26, -300, 52, 26, 4, '#f6ead2'), path(`M${dx + dw / 2 - 18} -300 L${dx + dw / 2} -318 L${dx + dw / 2 + 18} -300`, 'none', st('#6b4430', 2)));
    // 外のかご
    out.push(path(`M${30} -70 L${30 + 110} -70 L${30 + 100} -30 L${40} -30 Z`, '#c8914a'), ell(85, -74, 56, 10, '#a86e30'));
    for (let i = 0; i < 4; i++) out.push(rrect(44 + i * 24, -100, 16, 50, 7, '#d49a52', { rot: -12 + i * 8 }));
    return out.join('');
  },
  // カフェ：あたたかい光の大きな窓、黒板
  cafe(G, W, r) {
    const out = [];
    const ww = Math.round(W * 0.62);
    out.push(rect(36, -380, ww, 300, '#ffe4b4'), rect(36, -380, ww, 300, G.inShade, { opacity: 0.5 }));
    // 中：ペンダントライト・カウンター・カップ
    for (const x of [36 + ww * 0.3, 36 + ww * 0.72]) out.push(path(`M${x} -380 L${x} -330`, 'none', st('#3a2a22', 2)), path(`M${x - 22} -310 Q${x} -348 ${x + 22} -310 Z`, '#2f3a3a'), circ(x, -306, 8, '#fff2c0'), circ(x, -300, 30, '#fff2c0', { opacity: 0.35 }));
    out.push(rect(36, -170, ww, 90, '#8a5a3a'), rect(36, -170, ww, 12, '#b07a4a'));
    for (let x = 70; x < ww; x += 64) out.push(rrect(x, -196, 22, 22, 5, '#ffffff'), path(`M${x + 22} -190 q12 4 0 12`, 'none', st('#ffffff', 4)));
    out.push(glassFrame(36, -380, ww, 300, '#1f3f5f', 12, { mull: true, sill: true }));
    // ドア
    const dx = ww + 64, dw = W - dx - 30;
    out.push(rect(dx - 10, -370, dw + 20, 340, '#1f3f5f'), rect(dx, -360, dw, 330, '#2f5a80'), rect(dx + 12, -344, dw - 24, 200, '#ffe4b4'), path(`M${dx + 16} -340 L${dx + 36} -340 L${dx + 16} -290 Z`, '#ffffff', { opacity: 0.5 }), rect(dx + dw - 18, -210, 6, 40, '#d8c090'));
    // 黒板（A型）
    const bx = 60;
    out.push(path(`M${bx} -30 L${bx + 18} -160 L${bx + 92} -160 L${bx + 110} -30`, 'none', st('#8a5a3a', 8)));
    out.push(rect(bx + 20, -152, 70, 96, '#2e3b36'), rect(bx + 20, -152, 70, 96, 'none', { stroke: '#a8744c', strokeWidth: 6 }));
    out.push(rect(bx + 32, -136, 40, 4, '#ffffff', { opacity: 0.8 }), rect(bx + 32, -120, 46, 3, '#ffe08a', { opacity: 0.8 }), rect(bx + 32, -106, 30, 3, '#ffffff', { opacity: 0.7 }), circ(bx + 70, -84, 9, 'none', { stroke: '#ffffff', strokeWidth: 3, opacity: 0.8 }));
    return out.join('');
  },
  // 和菓子（町家）：格子・のれん・ちょうちん・赤い毛せんの長いす
  wagashi(G, W, r) {
    const out = [rect(20, -420, W - 40, 400, '#5b3a28')];
    const lx = 36, lw = Math.round(W * 0.46);
    out.push(rect(lx, -380, lw, 330, '#f1e3c8'), rect(lx, -380, lw, 330, G.inShade, { opacity: 0.6 }));
    for (let x = lx; x < lx + lw; x += 22) out.push(rect(x, -380, 10, 330, '#6a4430'), rect(x, -380, 3, 330, '#8a6048'));
    out.push(rect(lx, -380, lw, 12, '#4a2e20'), rect(lx, -62, lw, 12, '#4a2e20'));
    // 入口とのれん
    const ex = lx + lw + 40, ew = W - ex - 36;
    out.push(inside(G, ex, -380, ew, 350, '#3a2a20'));
    out.push(rect(ex - 6, -386, ew + 12, 14, '#3a2418'));
    const nw = ew / 3;
    for (let i = 0; i < 3; i++) out.push(rect(ex + i * nw + 2, -372, nw - 4, 150, '#2d4f8a'), rect(ex + i * nw + 2, -372, nw - 4, 20, '#243f70'));
    out.push(circ(ex + ew / 2, -300, 26, '#ffffff'), circ(ex + ew / 2, -300, 16, '#2d4f8a'), circ(ex + ew / 2, -300, 7, '#ffffff'));
    // 長いす
    out.push(rect(lx + 10, -110, lw - 20, 20, '#d83a3a'), rect(lx + 10, -110, lw - 20, 6, '#ff6a5a'), rect(lx + 22, -90, 10, 60, '#6a4430'), rect(lx + lw - 32, -90, 10, 60, '#6a4430'));
    out.push(rrect(lx + 30, -138, 60, 26, 10, '#f7ead2'), circ(lx + 48, -142, 9, '#ff9ac2'), circ(lx + 66, -142, 9, '#8ac86a'), circ(lx + 84, -142, 9, '#fff8e8'));
    return out.join('');
  }
};

// 2階の形
function upper(G, W, kind, wall, r) {
  const out = [];
  if (kind === 'twin') {
    const ww = W / 2 - 110;
    for (const x of [70, W / 2 + 40]) out.push(win(G, x, -870, ww, 170, { frame: '#ffffff', curtain: r() < 0.5 ? '#f3d9c2' : '#dfeaf2', bar: true }), flowerBox(x - 14, -672, ww + 28, r));
  } else if (kind === 'arched') {
    const ww = W / 2 - 120;
    for (const x of [74, W / 2 + 46]) {
      out.push(path(`M${x - 14} -690 L${x - 14} -820 A${ww / 2 + 14} ${ww / 2 + 14} 0 0 1 ${x + ww + 14} -820 L${x + ww + 14} -690 Z`, '#ffffff'));
      out.push(path(`M${x} -690 L${x} -820 A${ww / 2} ${ww / 2} 0 0 1 ${x + ww} -820 L${x + ww} -690 Z`, G.glass));
      out.push(path(`M${x + ww * 0.15} -820 L${x + ww * 0.45} -${820 + ww * 0.4} L${x + ww * 0.15} -740 Z`, '#ffffff', { opacity: 0.4 }), rect(x + ww / 2 - 4, -890, 8, 200, '#ffffff'), rect(x, -772, ww, 8, '#ffffff'));
      out.push(rect(x - 24, -690, ww + 48, 18, shade(wall, -0.2)));
    }
  } else if (kind === 'wide') {
    out.push(win(G, 70, -860, W - 140, 150, { frame: '#e9edf0', curtain: '#f6e7cf', mull: true }));
    out.push(rect(70 + (W - 140) / 3, -860, 8, 150, '#e9edf0'), rect(70 + (W - 140) * 2 / 3, -860, 8, 150, '#e9edf0'));
    out.push(rrect(W - 210, -690, 130, 70, 6, '#eef0f2'), rect(W - 200, -680, 70, 50, '#d3d8dc'), circ(W - 110, -655, 22, '#c3c9ce'), circ(W - 110, -655, 12, '#aab1b7'));
  } else if (kind === 'lattice') {
    out.push(rect(40, -900, W - 80, 240, '#efe4d0'));
    for (const x of [90, W / 2 + 30]) { out.push(rect(x, -860, W / 2 - 120, 150, '#3a2a20')); for (let k = x + 8; k < x + W / 2 - 120; k += 22) out.push(rect(k, -860, 12, 150, '#e9dcc4')); }
    out.push(rect(40, -910, W - 80, 16, '#5b3a28'), rect(40, -666, W - 80, 14, '#5b3a28'));
  } else if (kind === 'siding') {
    for (let y = -950; y < -600; y += 26) out.push(rect(16, y, W - 32, 3, shade(wall, -0.12)));
    out.push(win(G, W / 2 - 150, -860, 300, 160, { frame: '#ffffff', curtain: '#cfe3d4', bar: true }), flowerBox(W / 2 - 170, -672, 340, r, ['#ffffff', '#ff8a3a', '#ffd24a']));
  }
  return out.join('');
}

// お店の種類
const SHOPS = {
  yaoya: { w: 72, wall: '#f4ecdc', up: 'wide', awn: ['#3f9a4a', '#f3f8ea'], n: 8, sign: ['#ffffff', '#3f8a45'] },
  sakana: { w: 72, wall: '#e8f0f4', up: 'twin', awn: ['#2a86c6', '#ffffff'], n: 8, sign: ['#ffffff', '#2a6aa6'] },
  korokke: { w: 64, wall: '#f7e9d8', up: 'arched', awn: ['#d4473a', '#fff1e0'], n: 7, sign: ['#fff6e6', '#c0392b'] },
  honya: { w: 72, wall: '#efe6d6', up: 'siding', awn: ['#e3a93a', '#fff7e3'], n: 8, sign: ['#2f4f7f', '#1f355a'] },
  hanaya: { w: 64, wall: '#fbeef2', up: 'twin', awn: ['#e56f9a', '#fff0f5'], n: 7, sign: ['#ffffff', '#d85a88'] },
  omocha: { w: 72, wall: '#fff3df', up: 'arched', awn: ['#f08a3a', '#fff3e0'], n: 8, sign: ['#fff3df', '#e0702a'] },
  wagashi: { w: 72, wall: '#efe4d0', up: 'lattice', awn: null, n: 0, sign: ['#6a4430', '#3a2418'] },
  ocha: { w: 64, wall: '#f2eedc', up: 'wide', awn: ['#6e8f3a', '#f5f1dc'], n: 7, sign: ['#f5f1dc', '#5a7a2a'] },
  pan: { w: 72, wall: '#f6e4c8', up: 'arched', awn: ['#d94a3f', '#fff4e6'], n: 8, sign: ['#6b4430', '#4a2e20'] },
  cafe: { w: 72, wall: '#f1f0ea', up: 'twin', awn: ['#2f6fb8', '#ffffff'], n: 8, sign: ['#23466e', '#172f4c'] }
};
export const SHOP_KINDS = Object.keys(SHOPS);

function shopFront(defs, key, standalone) {
  const c = SHOPS[key], W = c.w * 10, Gd = G(defs), r = rng(8800 + SHOP_KINDS.indexOf(key) * 17);
  const out = [];
  // かべ
  out.push(rect(0, -960, W, 960, c.wall), rect(0, -960, W, 960, Gd.wallShade));
  if (key === 'pan') out.push(bricks(16, -960, W - 32, 330));
  out.push(upper(Gd, W, c.up, c.wall, r));
  // はしら（となりの店とのさかい）
  out.push(rect(0, -960, 16, 960, shade(c.wall, -0.14)), rect(W - 16, -960, 16, 960, shade(c.wall, -0.24)), rect(16, -960, 4, 960, '#ffffff', { opacity: 0.35 }));
  // 看板
  if (key === 'wagashi') {
    out.push(tileRoof(-10, -560, W + 20, 90));
    out.push(board(W / 2 - 170, -640, 340, 100, '#7a5236', '#3a2418', 6));
  } else {
    out.push(board(40, -610, W - 80, 110, c.sign[0], c.sign[1]));
  }
  // ひさし
  if (key === 'cafe') out.push(solidAwning(Gd, 20, -488, W - 40, 100, c.awn[0]));
  else if (c.awn) out.push(awning(Gd, 20, -484, W - 40, 70, c.awn[0], c.awn[1], c.n));
  // 1階
  out.push(GOODS[key](Gd, W, r));
  // かざり：カフェのカップの看板、和菓子のちょうちん
  if (key === 'cafe') {
    out.push(path('M30 -760 L150 -760 M60 -760 L30 -730', 'none', st('#2a2a2a', 7)));
    out.push(path('M130 -760 L130 -742', 'none', st('#2a2a2a', 4)), circ(130, -690, 50, '#ffffff'), circ(130, -690, 50, 'none', { stroke: '#2f6fb8', strokeWidth: 8 }));
    out.push(path('M106 -712 L154 -712 L148 -668 Q130 -656 112 -668 Z', '#8a5a3a'), path('M154 -702 q16 4 0 22', 'none', st('#8a5a3a', 6)), path('M118 -722 q6 -12 0 -22 M132 -722 q6 -12 0 -22', 'none', st('#b8a58a', 4)));
  }
  if (key === 'wagashi') out.push(lantern(W * 0.5 + 20, -470, 1.1));
  // 足もと（石の段）
  out.push(rect(0, -34, W, 34, '#cfc8bb'), rect(0, -34, W, 6, '#e8e3da'), rect(0, -6, W, 6, '#a9a296'));
  if (standalone) out.push(roofTop(defs, key, W, c));
  return out.join('');
}
// 1本だちの建物の屋根（アーケードの外）
function roofTop(defs, key, W, c) {
  const out = [];
  if (key === 'wagashi') {
    out.push(rect(0, -1060, W, 110, c.wall), rect(0, -1060, 16, 110, shade(c.wall, -0.14)), rect(W - 16, -1060, 16, 110, shade(c.wall, -0.24)));
    out.push(tileRoof(-30, -1150, W + 60, 110, '#56606e'));
  } else if (key === 'cafe') {
    out.push(rect(0, -1060, W, 110, c.wall), rect(0, -1060, 16, 110, shade(c.wall, -0.14)), rect(W - 16, -1060, 16, 110, shade(c.wall, -0.24)));
    out.push(tileRoof(-40, -1170, W + 80, 120, '#3f4a5c'));
  } else {
    out.push(rect(0, -1080, W, 130, c.wall), key === 'pan' ? bricks(16, -1080, W - 32, 130) : '', rect(0, -1080, 16, 130, shade(c.wall, -0.14)), rect(W - 16, -1080, 16, 130, shade(c.wall, -0.24)));
    out.push(rect(-10, -1100, W + 20, 30, shade(c.wall, -0.3)), rect(-10, -1100, W + 20, 8, '#ffffff', { opacity: 0.35 }), rect(-4, -1070, W + 8, 10, '#000000', { opacity: 0.12 }));
    for (let x = 30; x < W - 30; x += 50) out.push(rect(x, -1060, 30, 12, shade(c.wall, -0.1)));
  }
  return out.join('');
}

for (const key of SHOP_KINDS) {
  const w = SHOPS[key].w;
  sprite(SH, `y/shop/${key}`, w, 97, 0, 96, defs => tr(0, 96, shopFront(defs, key, false), 0.1));
}
for (const key of ['pan', 'cafe', 'wagashi']) {
  const w = SHOPS[key].w;
  sprite(SH, `y/bld/${key}`, w + 6, 124, 3, 123, defs => tr(3, 123, shopFront(defs, key, true), 0.1));
}

// ---------- アーケード（屋根の下のはり・たれまく・ぼんぼり） ----------
sprite(SH, 'y/girder', 32, 8, 0, 0, defs => tr(0, 0, [
  rect(0, 0, 320, 18, '#e3d7bf'), rect(0, 0, 320, 5, '#fffaf0'),
  rect(0, 62, 320, 12, '#d8cbb0'),
  ...[0, 1, 2, 3].map(i => path(`M${i * 80} 18 L${i * 80 + 40} 62 L${i * 80 + 80} 18`, 'none', st('#cdbfa3', 7))),
  rect(0, 74, 320, 6, '#000000', { opacity: 0.12 })
], 0.1));
// たれまく（完成イメージのように 赤・緑・黄・青）
[['#e2453a', '#ffd24a'], ['#3f9a4a', '#ffffff'], ['#f2b632', '#e2453a'], ['#2f6fb8', '#ffd24a']].forEach(([c, c2], i) => sprite(SH, `y/banner${i}`, 14, 34, 7, 0, defs => tr(7, 0, [
  path('M0 0 L0 30', 'none', st('#6b6258', 6)), rect(-60, 26, 120, 10, '#8a7a66'),
  rect(-54, 36, 108, 250, c), rect(-54, 36, 108, 250, defs.lin([[0, '#ffffff', 0.2], [0.5, '#ffffff', 0], [1, '#000000', 0.15]], 0, 0, 1, 0)),
  rect(-54, 60, 108, 16, '#ffffff', { opacity: 0.9 }), rect(-54, 250, 108, 12, c2),
  circ(0, 150, 34, '#ffffff'), circ(0, 150, 22, c), path('M-12 150 L0 132 L12 150 L0 168 Z', '#ffffff'),
  path('M-54 286 L-54 318 L-27 300 L0 318 L27 300 L54 318 L54 286 Z', c)
], 0.1)));
sprite(SH, 'y/pendant', 12, 24, 6, 0, defs => tr(6, 0, [
  path('M0 0 L0 120', 'none', st('#6b6258', 4)), rrect(-20, 116, 40, 14, 4, '#b8a888'),
  circ(0, 170, 46, '#fff4d6', { opacity: 0.35 }), circ(0, 164, 36, defs.rad([[0, '#ffffff'], [0.6, '#fff6e2'], [1, '#ead9b4']], 0.4, 0.35, 0.65)),
  ell(-12, 152, 9, 12, '#ffffff', { opacity: 0.9 })
], 0.1));

// ---------- アーケードの門（春日野道商店街） ----------
sprite(SH, 'y/gate', 96, 166, 0, 165, defs => {
  const Gd = G(defs);
  const cx = 480, cy = -1100, R = 440;
  const out = [];
  // はしら
  for (const x of [40, 840]) {
    out.push(rect(x, -1120, 80, 1120, Gd.steel), rect(x + 10, -1120, 6, 1120, '#ffffff', { opacity: 0.7 }));
    for (let y = -1000; y < -100; y += 220) out.push(rect(x - 6, y, 92, 18, '#d8cbb0'), rect(x - 6, y, 92, 5, '#fffaf0'));
    out.push(rrect(x - 20, -90, 120, 90, 10, '#bdb6aa'), rect(x - 20, -90, 120, 14, '#dcd6cb'));
  }
  // アーチ（正面から見たガラスのかまぼこ屋根）
  out.push(path(`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z`, '#efe5d0'), path(`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`, 'none', st('#fffaf0', 10)));
  out.push(path(`M${cx - R + 50} ${cy} A${R - 50} ${R - 50} 0 0 1 ${cx + R - 50} ${cy} Z`, defs.lin([[0, '#e8f7fc', 0.95], [1, '#b5dcec', 0.95]])));
  for (let k = 1; k < 8; k++) { const a = Math.PI + k / 8 * Math.PI; out.push(path(`M${cx} ${cy} L${cx + Math.cos(a) * (R - 40)} ${cy + Math.sin(a) * (R - 40)}`, 'none', st('#ffffff', 10))); }
  out.push(path(`M${cx - 250} ${cy} A250 250 0 0 1 ${cx + 250} ${cy}`, 'none', st('#ffffff', 10)), path(`M${cx - R + 50} ${cy} A${R - 50} ${R - 50} 0 0 1 ${cx + R - 50} ${cy}`, 'none', st('#d8cbb0', 8)));
  out.push(path(`M${cx - R + 90} ${cy - 40} A${R - 90} ${R - 90} 0 0 1 ${cx - 120} ${cy - R + 110}`, 'none', st('#ffffff', 14, { opacity: 0.55 })));
  // 電球
  for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; out.push(circ(cx + Math.cos(a) * (R - 25), cy + Math.sin(a) * (R - 25), 11, k % 2 ? '#ffe08a' : '#ffffff')); }
  // てっぺんのかざり
  out.push(circ(cx, cy - R - 20, 44, '#d8cbb0'), circ(cx, cy - R - 20, 32, '#f2c94c'), path(`M${cx} ${cy - R - 44} L${cx + 9} ${cy - R - 26} L${cx + 28} ${cy - R - 24} L${cx + 14} ${cy - R - 11} L${cx + 18} ${cy - R + 8} L${cx} ${cy - R - 2} L${cx - 18} ${cy - R + 8} L${cx - 14} ${cy - R - 11} L${cx - 28} ${cy - R - 24} L${cx - 9} ${cy - R - 26} Z`, '#ffffff'));
  // 看板（文字はゲームで描く）
  out.push(rrect(70, -1440, 820, 250, 30, '#000000', { opacity: 0.18 }));
  out.push(rrect(60, -1454, 840, 250, 30, '#c8423a'), rrect(80, -1434, 800, 210, 20, '#fff8ea'), rrect(94, -1420, 772, 182, 14, 'none', { stroke: '#e8b84a', strokeWidth: 5 }));
  out.push(rect(110, -1414, 740, 14, '#ffffff', { opacity: 0.7 }));
  // はしらの上の旗
  for (const x of [80, 880]) out.push(path(`M${x} -1190 L${x} -1330`, 'none', st('#2a3a3a', 8)));
  return tr(0, 165, out.join(''), 0.1);
});

// ---------- 街灯（すずらん形・2つの玉） ----------
sprite(SH, 'y/lamp', 24, 62, 12, 61, defs => {
  const Gd = G(defs);
  return tr(12, 61, [
    rrect(-46, -70, 92, 70, 12, '#2a2a30'), rect(-46, -70, 92, 12, '#56565f'),
    path('M-16 -70 L-11 -500 L11 -500 L16 -70 Z', '#34343a'), path('M-10 -70 L-6 -500 L-1 -500 L-3 -70 Z', '#6e6e78', { opacity: 0.7 }),
    rrect(-24, -150, 48, 24, 8, '#2a2a30'), rrect(-22, -410, 44, 20, 8, '#2a2a30'),
    // うで
    path('M0 -500 C-20 -540 -60 -540 -86 -520 C-104 -506 -100 -482 -84 -480', 'none', st('#34343a', 10)),
    path('M0 -500 C20 -540 60 -540 86 -520 C104 -506 100 -482 84 -480', 'none', st('#34343a', 10)),
    path('M0 -500 L0 -560', 'none', st('#34343a', 10)), circ(0, -570, 14, '#34343a'),
    // 玉
    ...[-84, 84].map(x => [rrect(x - 16, -482, 32, 18, 5, '#2a2a30'), circ(x, -432, 46, '#fff6de', { opacity: 0.35 }), circ(x, -432, 38, Gd.globe), ell(x - 13, -446, 9, 13, '#ffffff', { opacity: 0.9 }), rrect(x - 14, -398, 28, 12, 4, '#2a2a30')].join('')),
    // 商店街の小さな旗
    path('M16 -360 L96 -360', 'none', st('#34343a', 5)),
    rect(30, -356, 60, 150, '#e2453a'), rect(30, -330, 60, 12, '#ffffff'), rect(30, -236, 60, 10, '#ffd24a'), circ(60, -280, 14, '#ffffff')
  ], 0.1);
});

// ---------- クローバーの葉の木（大きく、明るい） ----------
function cloverBlob(x, y, r, c, light) {
  const k = r * 0.52;
  return [circ(x - k, y, r * 0.62, c), circ(x + k, y, r * 0.62, c), circ(x, y - k, r * 0.62, c), circ(x, y + k * 0.7, r * 0.58, c),
    light ? circ(x - k * 0.9, y - k * 0.6, r * 0.28, light, { opacity: 0.9 }) : ''].join('');
}
sprite(SH, 'y/tree', 52, 70, 26, 69, () => {
  const r = rng(9101), out = [];
  out.push(ell(0, -4, 150, 22, '#000000', { opacity: 0.12 }));
  out.push(path('M-26 0 C-18 -120 -30 -190 -70 -260 L-50 -270 C-22 -224 -8 -200 2 -290 L22 -286 C18 -200 26 -120 26 0 Z', '#7a5a3f'));
  out.push(path('M8 0 C10 -110 12 -180 12 -280 L20 -282 C18 -190 22 -110 24 0 Z', '#9a7654', { opacity: 0.8 }));
  out.push(path('M-4 -200 C30 -230 60 -250 90 -300 L100 -290 C70 -240 40 -220 4 -186 Z', '#7a5a3f'));
  const blobs = [];
  for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([Math.cos(a) * 190 * d, -420 + Math.sin(a) * 150 * d, 60 + r() * 30]); }
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, br] of blobs) out.push(cloverBlob(bx, by + 14, br, '#3a7f3c'));
  for (const [bx, by, br] of blobs) { const t = (by + 560) / 300; out.push(cloverBlob(bx, by, br * 0.9, t > 0.6 ? '#4f9a45' : r() < 0.5 ? '#5dab4f' : '#66b556', t < 0.5 ? '#a6dc84' : null)); }
  for (let i = 0; i < 14; i++) out.push(circ(-150 + r() * 300, -560 + r() * 250, 8 + r() * 8, '#c2eca0', { opacity: 0.55 }));
  return tr(26, 69, out.join(''), 0.1);
});

// ---------- 植木ばち ----------
sprite(SH, 'y/pots', 34, 22, 0, 21, () => {
  const r = rng(9201), out = [];
  const pot = (x, w, h, c) => [path(`M${x} ${-h} L${x + w} ${-h} L${x + w - 12} 0 L${x + 12} 0 Z`, c), rect(x - 4, -h - 14, w + 8, 18, shade(c, 0.12)), rect(x + 10, -h + 6, 10, h - 14, '#ffffff', { opacity: 0.18 })].join('');
  // 丸い木
  out.push(cloverBlob(60, -150, 70, '#3f8a3f'), cloverBlob(60, -160, 62, '#5dab4f', '#9ad47c'), rect(56, -110, 8, 30, '#6a4a32'));
  out.push(pot(20, 80, 80, '#c0703a'));
  // 赤い花
  for (let i = 0; i < 7; i++) out.push(circ(150 + r() * 70, -130 + r() * 40, 18, '#4f9a45'));
  for (let i = 0; i < 6; i++) { const fx = 150 + r() * 70, fy = -150 + r() * 40; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; out.push(circ(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 6.5, '#ff5a6e')); } out.push(circ(fx, fy, 4, '#ffd24a')); }
  out.push(pot(140, 90, 70, '#d98a5a'));
  // 背の高い葉
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.25; out.push(path(`M${290} -70 Q${290 + Math.cos(a) * 40} ${-70 + Math.sin(a) * 90} ${290 + Math.cos(a) * 70} ${-70 + Math.sin(a) * 140}`, 'none', st(k % 2 ? '#4f9a45' : '#6ab85a', 12))); }
  out.push(pot(250, 80, 70, '#8a9aa6'));
  return tr(0, 21, out.join(''), 0.1);
});

// ---------- りんの家（2階建て・瓦屋根・ベランダ） ----------
sprite(SH, 'y/rinhouse', 100, 104, 4, 103, defs => {
  const Gd = G(defs), r = rng(9301), out = [];
  const W = 880, wall = '#f7eddc';
  out.push(rect(0, -760, W, 760, wall), rect(0, -760, W, 760, Gd.wallShade));
  for (let y = -740; y < -40; y += 30) out.push(rect(0, y, W, 3, '#e6d8c2'));
  out.push(rect(W - 50, -760, 50, 760, '#e3d3bb'));
  // 屋根（瓦）
  out.push(path(`M-70 -740 L180 -960 L${W - 180} -960 L${W + 70} -740 Z`, '#57616f'));
  for (let i = 1; i < 7; i++) { const t = i / 7, y = -960 + 220 * t; out.push(rect(180 - 250 * t, y - 3, W - 360 + 500 * t, 4, '#7a8494', { opacity: 0.8 })); }
  out.push(rect(-80, -752, W + 160, 26, '#3f4854'), rect(-80, -752, W + 160, 6, '#8a94a4'), rect(150, -976, W - 300, 22, '#3f4854'));
  out.push(rect(-60, -726, W + 120, 16, '#000000', { opacity: 0.12 }));
  // 2階：ベランダ・窓
  out.push(win(Gd, 90, -680, 260, 190, { frame: '#ffffff', curtain: '#ffd9e0', bar: true }));
  out.push(win(Gd, 500, -680, 290, 220, { frame: '#ffffff', curtain: '#d6ecf0' }));
  out.push(rect(440, -470, 400, 16, '#e9e4dc'), rect(440, -590, 400, 10, '#ffffff'));
  for (let x = 450; x < 840; x += 26) out.push(rect(x, -582, 8, 114, '#ffffff'));
  out.push(path('M470 -588 L480 -500 L560 -500 L570 -588 Z', '#3cc8c0'), rect(470, -588, 100, 12, '#22a39c'));
  out.push(path('M600 -588 L604 -520 L660 -520 L664 -588 Z', '#ffd24a'));
  out.push(rect(440, -470, 400, 20, '#000000', { opacity: 0.1 }));
  // 1階：げんかん・窓
  out.push(path('M300 -420 L560 -420 L540 -380 L320 -380 Z', '#57616f'), rect(300, -426, 260, 10, '#3f4854'));
  out.push(rect(350, -380, 160, 380, '#8a5a3a'), rect(362, -368, 136, 356, '#a8744c'), rect(418, -350, 22, 250, '#d9eef8'), circ(480, -200, 8, '#f2c94c'));
  out.push(win(Gd, 60, -360, 220, 170, { frame: '#ffffff', mull: true }));
  for (let x = 70; x < 280; x += 22) out.push(rect(x, -360, 6, 170, '#ffffff', { opacity: 0.55 }));
  out.push(win(Gd, 610, -340, 180, 150, { frame: '#ffffff', curtain: '#f3e3c8' }));
  // 表札（文字はゲームで描く）
  out.push(rrect(540, -150, 240, 70, 8, '#ffffff'), rrect(540, -150, 240, 70, 8, 'none', { stroke: '#a8744c', strokeWidth: 6 }));
  // ブロックべい・ポスト・植木
  out.push(rect(-10, -110, 300, 110, '#d8d2c6'), rect(-10, -110, 300, 14, '#ece8e0'));
  for (let x = 0; x < 290; x += 60) out.push(rect(x, -96, 3, 96, '#c3bcae'));
  out.push(rect(-10, -56, 300, 3, '#c3bcae'));
  out.push(rrect(180, -210, 70, 80, 8, '#d83a3a'), rect(190, -190, 50, 8, '#8a1f1f'), rect(210, -130, 10, 22, '#555555'));
  out.push(cloverBlob(60, -150, 70, '#3f8a3f'), cloverBlob(60, -160, 62, '#5dab4f', '#9ad47c'), cloverBlob(130, -140, 50, '#4f9a45', '#9ad47c'));
  out.push(path(`M${W - 70} 0 L${W - 60} -70 L${W + 10} -70 L${W + 20} 0 Z`, '#c0703a'), cloverBlob(W - 25, -100, 44, '#5aac52', '#9ad47c'), circ(W - 30, -118, 10, '#ff6a7a'), circ(W - 8, -96, 8, '#ffd24a'));
  out.push(rect(0, -20, W, 20, '#cfc8bb'));
  return tr(4, 103, out.join(''), 0.1);
});

// ---------- 駅のホームの屋根（阪急の駅：クリーム色の屋根・えんじ色のふち） ----------
for (let v = 0; v < 3; v++) sprite(SH, `y/station${v}`, 48, 66, 0, 65, defs => {
  const out = [];
  // 柱
  out.push(rect(206, -520, 28, 520, '#e6e1d8'), rect(206, -520, 8, 520, '#ffffff', { opacity: 0.6 }), rect(226, -520, 8, 520, '#c9c3b8'));
  out.push(rect(198, -60, 44, 60, '#6e1826'), rect(198, -60, 44, 8, '#8c2433'));
  out.push(path('M220 -500 L120 -540 L130 -548 L220 -516 L310 -548 L320 -540 Z', '#d9d3c8'));
  // 屋根
  out.push(rect(0, -560, 480, 40, '#f4efe6'), rect(0, -528, 480, 8, '#000000', { opacity: 0.1 }));
  out.push(rect(0, -620, 480, 64, '#6e1826'), rect(0, -620, 480, 10, '#9a3040'), rect(0, -566, 480, 6, '#4a0f1a'));
  out.push(rect(0, -640, 480, 22, '#efe5d2'), rect(0, -640, 480, 6, '#ffffff'));
  // 蛍光灯
  out.push(rrect(60, -520, 100, 10, 4, '#ffffff'), rrect(300, -520, 100, 10, 4, '#ffffff'), rect(60, -510, 100, 12, '#fffbe8', { opacity: 0.4 }), rect(300, -510, 100, 12, '#fffbe8', { opacity: 0.4 }));
  if (v === 0) {
    // 発車案内（黒い板にオレンジの文字の点）
    out.push(path('M320 -520 L320 -480 M420 -520 L420 -480', 'none', st('#555555', 4)));
    out.push(rrect(290, -482, 160, 70, 6, '#23252b'), rect(302, -470, 136, 20, '#101114'), rect(302, -444, 136, 20, '#101114'));
    for (let i = 0; i < 9; i++) out.push(rect(306 + i * 14, -466, 9, 12, i < 3 ? '#ff9a2a' : '#ffd24a', { opacity: 0.9 }), rect(306 + i * 14, -440, 9, 12, i < 3 ? '#5ad07a' : '#ffffff', { opacity: i === 8 ? 0 : 0.85 }));
  } else if (v === 1) {
    // 時計
    out.push(path('M100 -520 L100 -490', 'none', st('#555555', 5)), circ(100, -440, 50, '#3a3a40'), circ(100, -440, 42, '#ffffff'), path('M100 -440 L100 -470 M100 -440 L122 -432', 'none', st('#23252b', 6)), circ(100, -440, 5, '#e2453a'));
    // ベンチ
    out.push(rect(300, -110, 150, 10, '#8a8f96'));
    for (let i = 0; i < 4; i++) out.push(rrect(306 + i * 36, -150, 32, 44, 8, '#2f74c8'), rect(310 + i * 36, -146, 24, 8, '#6aa5ea'));
    out.push(rect(316, -100, 8, 100, '#6b7078'), rect(426, -100, 8, 100, '#6b7078'));
  } else {
    // ごみ箱と植木
    out.push(rrect(320, -130, 70, 130, 10, '#6b7b8c'), rect(320, -130, 70, 18, '#8a9aab'), rect(334, -104, 42, 6, '#2a2a2a'));
    out.push(rect(60, -70, 80, 70, '#c0703a'), circ(100, -110, 44, '#5aac52'), circ(84, -124, 16, '#9ad47c'));
  }
  return tr(0, 65, out.join(''), 0.1);
});

// ---------- 異人館ふうの洋館（北野へ向かう坂の家） ----------
sprite(SH, 'y/house2', 90, 104, 4, 103, defs => {
  const Gd = G(defs), out = [];
  const W = 820, wall = '#f6f4ee';
  out.push(rect(0, -700, W, 700, wall), rect(0, -700, W, 700, Gd.wallShade));
  for (let y = -690; y < -20; y += 26) out.push(rect(0, y, W, 3, '#dedad0'));
  out.push(rect(W - 40, -700, 40, 700, '#e4e0d6'));
  // 屋根とえんとつ
  out.push(rect(620, -1000, 70, 220, '#a8543a'), rect(610, -1012, 90, 22, '#8a4030'));
  for (let y = -990; y < -790; y += 26) out.push(rect(620, y, 70, 3, '#8a4030', { opacity: 0.6 }));
  out.push(path(`M-60 -690 L${W / 2} -960 L${W + 60} -690 Z`, '#d0613f'), path(`M-60 -690 L${W / 2} -960 L${W / 2} -930 L-20 -690 Z`, '#e57a55'));
  for (let i = 1; i < 6; i++) { const t = i / 6; out.push(path(`M${-60 + (W / 2 + 60) * t} ${-690 - 270 * t} L${W + 60 - (W / 2 + 60) * t} ${-690 - 270 * t}`, 'none', st('#b84e32', 5, { opacity: 0.5 }))); }
  out.push(rect(-70, -700, W + 140, 22, '#8a3a26'));
  // 屋根の丸い窓
  out.push(circ(W / 2, -800, 48, '#ffffff'), circ(W / 2, -800, 38, Gd.glass), path(`M${W / 2 - 38} -800 L${W / 2 + 38} -800 M${W / 2} -838 L${W / 2} -762`, 'none', st('#ffffff', 6)));
  // 窓（緑のよろい戸）
  const shut = (x, y, w, h) => [rect(x - 50, y, 40, h, '#3f8a64'), rect(x + w + 10, y, 40, h, '#3f8a64'), ...Array.from({ length: Math.floor(h / 22) }, (_, k) => rect(x - 46, y + 8 + k * 22, 32, 5, '#2f6a4c')).join(''), ...Array.from({ length: Math.floor(h / 22) }, (_, k) => rect(x + w + 14, y + 8 + k * 22, 32, 5, '#2f6a4c')).join('')].join('');
  out.push(shut(110, -620, 170, 200), win(Gd, 110, -620, 170, 200, { frame: '#ffffff', curtain: '#f6e2e6', bar: true }));
  out.push(shut(520, -620, 170, 200), win(Gd, 520, -620, 170, 200, { frame: '#ffffff', curtain: '#f6e2e6', bar: true }));
  out.push(flowerBox(96, -390, 200, rng(9401)), flowerBox(506, -390, 200, rng(9402), ['#ffffff', '#ff6b7d', '#c86ad8']));
  // げんかん（ポーチ）
  out.push(rect(300, -330, 220, 330, '#e9e4da'), path('M280 -330 L410 -400 L540 -330 Z', '#d0613f'), rect(276, -336, 268, 12, '#8a3a26'));
  out.push(rect(350, -290, 120, 290, '#2f6a4c'), rect(362, -276, 96, 110, '#bfe3f5'), rect(362, -150, 96, 130, '#3f7a5a'), circ(446, -140, 7, '#f2c94c'));
  out.push(rect(300, -330, 20, 330, '#ffffff'), rect(500, -330, 20, 330, '#ffffff'));
  out.push(win(Gd, 80, -300, 170, 170, { frame: '#ffffff', curtain: '#fff3d6' }), win(Gd, 580, -300, 170, 170, { frame: '#ffffff', curtain: '#fff3d6' }));
  // 白いさく
  out.push(rect(-20, -90, W + 40, 10, '#ffffff'), rect(-20, -50, W + 40, 8, '#ffffff'));
  for (let x = -10; x < W + 20; x += 34) if (x < 300 || x > 520) out.push(path(`M${x} 0 L${x} -110 L${x + 9} -124 L${x + 18} -110 L${x + 18} 0 Z`, '#ffffff'), rect(x + 12, -110, 6, 110, '#dedad0'));
  out.push(rect(-20, -16, W + 40, 16, '#cfc8bb'));
  return tr(4, 103, out.join(''), 0.1);
});

// ---------- 石垣にたれるツタ（タイルの前に描く） ----------
for (let v = 0; v < 2; v++) sprite(SH, `y/ivy${v}`, 44, 64, 22, 0, () => {
  const r = rng(9500 + v), out = [];
  const len = v ? 560 : 420;
  for (let s = 0; s < 4; s++) {
    const x0 = -150 + s * 100 + r() * 40, l = len * (0.5 + r() * 0.5);
    out.push(path(`M${x0} 20 Q${x0 + (r() - 0.5) * 80} ${l * 0.5} ${x0 + (r() - 0.5) * 40} ${l}`, 'none', st('#3e7a34', 6)));
    for (let k = 0; k < l / 34; k++) {
      const yy = 30 + k * 34 + r() * 10, xx = x0 + (r() - 0.5) * 50 * (yy / l);
      out.push(cloverBlob(xx, yy + 5, 34 + r() * 14, '#2f6a2c'), cloverBlob(xx, yy, 30 + r() * 12, r() < 0.5 ? '#4f9a45' : '#5dab4f', r() < 0.5 ? '#9ad67a' : null));
    }
  }
  for (let k = 0; k < 9; k++) { const xx = -190 + k * 48 + r() * 20; out.push(cloverBlob(xx, 30 + r() * 20, 40 + r() * 16, '#3f8a3f'), cloverBlob(xx, 24 + r() * 16, 36 + r() * 14, '#5dab4f', '#a6dc84')); }
  return tr(22, 0, out.join(''), 0.1);
});
// 石垣の水ぬきパイプ
sprite(SH, 'y/drain', 12, 10, 6, 5, () => tr(6, 5, [
  circ(0, 0, 44, '#8a8f96'), circ(0, 0, 34, '#3a3e45'), path('M-30 -8 A30 30 0 0 1 20 -24', 'none', st('#b8bcc2', 6)),
  path('M-6 34 Q-10 60 -4 90', 'none', st('#6d7279', 10, { opacity: 0.5 }))
], 0.1));
