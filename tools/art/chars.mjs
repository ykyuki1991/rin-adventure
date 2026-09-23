// りん（主人公）。部品（頭・体・うで・あし）を組み合わせてポーズを作る
// 座標は 0.1ドット単位で、足元のまん中が (0,0)。上がマイナス
import { sprite } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, f } from './svg.mjs';

export const C = {
  skin: '#ffdcbc', skinS: '#f2bb94', skinL: '#fff0e0',
  hair: '#4a2b18', hairS: '#35190b', hairL: '#7a4a2c',
  teal: '#35c3b2', tealS: '#1f9f90', tealL: '#7ee0d3',
  white: '#fbfdff', whiteS: '#d6dde6',
  red: '#f25068', redS: '#cc3550',
  blue: '#3b6fd8', blueS: '#2a52aa', blueL: '#6d97ee',
  shoe: '#6a3a1e', shoeS: '#4a2610', shoeL: '#99603a',
  eye: '#2a1810', mouth: '#9a3526', tongue: '#ff7d86',
  cape: '#e8343f', capeS: '#b01f2c', capeL: '#ff6a70', gold: '#ffc83d'
};

// ---- あし ----
function leg(x, y, ang) {
  return tr(x, y, [
    rrect(-8.5, -3, 17, 15, 7, C.blue),
    rrect(-8.5, 6, 17, 6, 3, C.blueS, { opacity: 0.55 }),
    // くつ
    ell(3.5, 15.5, 11.5, 6, C.shoe),
    ell(3.5, 17.5, 11, 4, C.shoeS),
    ell(2, 13.2, 6.5, 2.4, C.shoeL, { opacity: 0.9 })
  ], 1, ang);
}

// ---- うで ---- （肩を中心に回す。0度で真下、マイナスで前）
function arm(x, y, ang, back) {
  const sk = back ? C.skinS : C.skin;
  return tr(x, y, [
    rrect(-5.2, 0, 10.4, 21, 5.2, sk),
    circ(0, 22, 7.6, sk),
    back ? '' : circ(-2.2, 20, 3, C.skinL, { opacity: 0.6 }),
    // そで
    circ(0, 1, 9.5, back ? C.tealS : C.teal),
    back ? '' : path('M-6 -5 Q0 -9 6 -5', 'none', { stroke: C.tealL, strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.7 })
  ], 1, ang);
}

// ---- 体 ----
function torso(defs) {
  const shape = 'M-24 -66 Q-30 -66 -30 -58 L-31 -34 Q-31 -26 -24 -26 L25 -26 Q32 -26 32 -34 L31 -58 Q31 -66 24 -66 Z';
  const cp = defs.clip(`<path d="${shape}"/>`);
  return [
    g([
      rect(-34, -70, 70, 26, C.teal),
      rect(-34, -45, 70, 7, C.white),
      rect(-34, -38.5, 70, 14, C.red),
      // 左側（背中側）のかげ
      rect(-34, -70, 12, 26, C.tealS),
      rect(-34, -45, 12, 7, C.whiteS),
      rect(-34, -38.5, 12, 14, C.redS),
      // えり
      path('M-12 -66 Q2 -58 16 -66', 'none', { stroke: C.tealS, strokeWidth: 3, strokeLinecap: 'round' }),
      ell(14, -60, 9, 3, C.tealL, { opacity: 0.55 })
    ], { 'clip-path': cp }),
    // 半ズボン
    path('M-29 -29 L31 -29 L31 -16 Q31 -11 26 -11 L-24 -11 Q-29 -11 -29 -16 Z', C.blue),
    rect(-29, -29, 60, 3, C.blueS, { opacity: 0.7 }),
    path('M1 -26 L1 -13', 'none', { stroke: C.blueS, strokeWidth: 1.6, opacity: 0.8 })
  ].join('');
}

// ---- 頭 ---- mouth: smile/open/o/grin, eyes: normal/blink/x/happy
function head(defs, mouth = 'smile', eyes = 'normal') {
  const faceD = 'M-40 -104 C-40 -134 -14 -152 12 -152 C40 -152 62 -134 62 -106 C62 -78 42 -58 12 -58 C-16 -58 -40 -76 -40 -104 Z';
  const faceClip = defs.clip(`<path d="${faceD}"/>`);
  // 前髪の下のふち（ギザギザの前髪）
  const bangs = 'M-66 -96 C-72 -132 -50 -168 -6 -174 C34 -178 64 -158 70 -128 C73 -114 70 -100 66 -92 ' +
    'C62 -104 58 -112 52 -116 C50 -108 46 -102 40 -98 C40 -110 36 -120 30 -124 C24 -112 16 -106 6 -104 ' +
    'C10 -114 10 -122 6 -128 C-4 -116 -18 -110 -32 -110 C-38 -104 -40 -96 -40 -88 C-50 -90 -60 -92 -66 -96 Z';
  const parts = [];
  // 後ろ髪
  parts.push(path('M-68 -104 C-70 -148 -40 -172 -2 -172 C30 -172 56 -154 62 -126 L60 -96 C44 -84 20 -80 0 -80 C-20 -76 -40 -70 -52 -64 C-66 -72 -68 -88 -68 -104 Z', C.hairS));
  parts.push(path('M-58 -70 C-64 -64 -64 -58 -58 -54 C-54 -60 -50 -64 -46 -66 Z', C.hairS));
  // 顔
  parts.push(path(faceD, C.skin));
  // 前髪のかげ（顔の上）
  parts.push(g([path(bangs, C.skinS, { transform: 'translate(2 6)' }), ell(-36, -86, 12, 22, C.skinS, { opacity: 0.6 })], { 'clip-path': faceClip }));
  // 耳
  parts.push(ell(-30, -94, 7, 9, C.skin), ell(-30, -94, 3.5, 5, C.skinS));
  // 前髪
  parts.push(path(bangs, C.hair));
  // 髪のつや
  parts.push(path('M-44 -138 C-30 -160 0 -166 22 -160 C4 -158 -20 -152 -36 -132 Z', C.hairL, { opacity: 0.85 }));
  parts.push(path('M36 -150 C46 -144 54 -136 58 -126 C52 -130 44 -138 36 -146 Z', C.hairL, { opacity: 0.6 }));
  // アホ毛
  parts.push(path('M-8 -170 C-10 -186 0 -198 16 -196 C8 -192 4 -184 6 -172 Z', C.hair));
  // 目
  const ex = [20, 46], ey = -97;
  for (const [i, x] of ex.entries()) {
    const rx = i === 0 ? 7.2 : 7.8, ry = 11;
    if (eyes === 'blink') {
      parts.push(path(`M${x - 7} ${ey + 2} Q${x} ${ey + 6} ${x + 7} ${ey + 2}`, 'none', { stroke: C.eye, strokeWidth: 2.6, strokeLinecap: 'round' }));
    } else if (eyes === 'happy') {
      parts.push(path(`M${x - 7} ${ey + 3} Q${x} ${ey - 7} ${x + 7} ${ey + 3}`, 'none', { stroke: C.eye, strokeWidth: 3, strokeLinecap: 'round' }));
    } else if (eyes === 'x') {
      parts.push(path(`M${x - 6} ${ey - 6} L${x + 6} ${ey + 6} M${x + 6} ${ey - 6} L${x - 6} ${ey + 6}`, 'none', { stroke: C.eye, strokeWidth: 3, strokeLinecap: 'round' }));
    } else {
      parts.push(ell(x, ey, rx, ry, C.eye));
      parts.push(ell(x, ey + 5, rx * 0.72, ry * 0.36, '#6b3a22', { opacity: 0.9 }));
      parts.push(circ(x + 2.4, ey - 4.2, 3.3, '#ffffff'));
      parts.push(circ(x - 2.6, ey + 3.4, 1.5, '#ffffff', { opacity: 0.9 }));
    }
  }
  // ほっぺ
  parts.push(ell(58, -80, 6, 3.6, '#ff8f9c', { opacity: 0.45 }), ell(4, -80, 6, 3.4, '#ff8f9c', { opacity: 0.35 }));
  // 口
  const mx = 34, my = -76;
  if (mouth === 'smile') parts.push(path(`M${mx - 5} ${my - 1} Q${mx} ${my + 4} ${mx + 5} ${my - 1}`, 'none', { stroke: C.mouth, strokeWidth: 2.4, strokeLinecap: 'round' }));
  else if (mouth === 'open') parts.push(path(`M${mx - 6} ${my - 2} Q${mx} ${my - 3} ${mx + 7} ${my - 2} Q${mx + 5} ${my + 8} ${mx} ${my + 8} Q${mx - 5} ${my + 7} ${mx - 6} ${my - 2} Z`, C.mouth), ell(mx + 0.5, my + 4.6, 4, 2.4, C.tongue));
  else if (mouth === 'o') parts.push(ell(mx, my + 1, 3.6, 4.4, C.mouth));
  else if (mouth === 'grin') parts.push(path(`M${mx - 7} ${my - 2} Q${mx} ${my + 10} ${mx + 7} ${my - 2} Z`, C.mouth), path(`M${mx - 6} ${my - 1.5} L${mx + 6} ${my - 1.5} L${mx + 5} ${my + 1} L${mx - 5} ${my + 1} Z`, '#ffffff'));
  return parts.join('');
}

// ---- マント（パワーアップ） ----
function cape(flow) {
  // flow: 0 = たれている, 1 = うしろへなびく（マイナスは上へふわっと）
  const ax = -44 - flow * 46, ay = -8 - flow * 34;      // すその外側
  const bx = -14 - flow * 30, by = -4 - flow * 20;      // すその内側
  const w1 = Math.sin(flow * 3) * 6;
  return [
    path(`M-20 -66 C-34 -60 ${ax + 8} ${ay - 30} ${ax} ${ay} Q${(ax + bx) / 2} ${ay + 10 + w1} ${bx} ${by} C${bx + 8} ${by - 20} 0 -40 14 -64 Z`, C.capeS),
    path(`M-18 -66 C-30 -60 ${ax + 12} ${ay - 30} ${ax + 5} ${ay - 3} Q${(ax + bx) / 2 + 2} ${ay + 5 + w1} ${bx + 2} ${by - 4} C${bx + 10} ${by - 22} 0 -42 12 -65 Z`, C.cape),
    path(`M-14 -63 C-24 -56 ${ax + 16} ${ay - 26} ${ax + 10} ${ay - 6}`, 'none', { stroke: C.capeL, strokeWidth: 3, strokeLinecap: 'round', opacity: 0.75 }),
    // えりもと
    ell(-3, -65, 17, 5, C.gold), ell(-3, -66.5, 13, 2.4, '#fff1a8', { opacity: 0.8 })
  ].join('');
}

// ポーズからりん1枚を組み立てる
function rin(defs, p) {
  const bob = p.bob || 0, lean = p.lean || 0;
  const body = [];
  if (p.cape !== undefined) body.push(cape(p.cape));
  body.push(arm(-20, -59, p.armB ?? 10, true));
  body.push(leg(-11, -20, p.legB ?? 0));
  body.push(torso(defs));
  if (p.badge) body.push(tr(14, -52, path('M0 -6 L1.8 -1.9 6.3 -1.9 2.7 0.9 4 5.4 0 2.7 -4 5.4 -2.7 0.9 -6.3 -1.9 -1.8 -1.9 Z', C.gold)));
  body.push(leg(11, -20, p.legF ?? 0));
  const headG = tr(0, (p.headBob || 0), head(defs, p.mouth, p.eyes), 1, p.headTilt || 0);
  body.push(headG);
  body.push(arm(25, -59, p.armF ?? -8, false));
  return tr(0, bob, body.join(''), 1, lean);
}

const POSES = {
  idle0: { armB: 10, armF: -8 },
  idle1: { armB: 12, armF: -10, bob: -1.5, headBob: -1.5 },
  blink: { armB: 10, armF: -8, eyes: 'blink' },
  run0: { lean: 9, legF: -50, legB: 42, armF: 70, armB: -70, bob: -2, mouth: 'open' },
  run1: { lean: 9, legF: -14, legB: 12, armF: 24, armB: -26, bob: -7, mouth: 'open' },
  run2: { lean: 9, legF: 42, legB: -50, armF: -72, armB: 68, bob: -2, mouth: 'open' },
  run3: { lean: 9, legF: 12, legB: -14, armF: -26, armB: 24, bob: -7, mouth: 'open' },
  jump: { lean: 5, legF: -66, legB: 30, armF: -112, armB: 55, mouth: 'open', headTilt: -4 },
  fall: { lean: -2, legF: -18, legB: 24, armF: -128, armB: 128, mouth: 'o' },
  skid: { lean: -11, legF: -42, legB: 4, armF: -84, armB: -52, mouth: 'o' },
  climb0: { legF: -34, legB: 12, armF: -100, armB: -78, mouth: 'smile' },
  climb1: { legF: 12, legB: -34, armF: -80, armB: -98, mouth: 'smile' },
  win: { legF: -10, legB: 10, armF: -150, armB: 150, mouth: 'grin', eyes: 'happy' }
};

const W = 32, H = 26, AX = 15, AY = 23;
for (const [name, pose] of Object.entries(POSES)) {
  sprite('chars', `rin/${name}`, W, H, AX, AY, defs => tr(AX, AY, rin(defs, pose), 0.1));
  const capeFlow = name.startsWith('run') ? 0.85 + (name === 'run1' || name === 'run3' ? 0.1 : 0) : name === 'jump' ? 0.45 : name === 'fall' ? -0.35 : name === 'skid' ? 0.2 : name === 'idle1' ? 0.05 : 0;
  sprite('chars', `rinP/${name}`, W, H, AX, AY, defs => tr(AX, AY, rin(defs, { ...pose, cape: capeFlow, badge: true }), 0.1));
}

// やられたとき（正面）
sprite('chars', 'rin/dead', W, H, AX, AY, defs => tr(AX, AY, [
  tr(0, 0, [
    arm(-24, -60, 150, false), arm(24, -60, -150, false),
    leg(-11, -20, 8), leg(11, -20, -8),
    torso(defs),
    // 正面の顔
    path('M-62 -104 C-62 -150 -34 -172 0 -172 C34 -172 62 -150 62 -104 L56 -84 C40 -76 -40 -76 -56 -84 Z', C.hairS),
    ell(0, -104, 50, 46, C.skin),
    path('M-58 -104 C-60 -150 -30 -170 0 -170 C30 -170 60 -150 58 -104 C50 -118 40 -126 30 -128 C22 -118 10 -114 0 -114 C-10 -114 -22 -118 -30 -128 C-40 -126 -50 -118 -58 -104 Z', C.hair),
    path('M-4 -168 C-6 -184 4 -196 20 -194 C12 -190 8 -182 10 -170 Z', C.hair),
    path('M-24 -104 L-12 -92 M-12 -104 L-24 -92 M12 -104 L24 -92 M24 -104 L12 -92', 'none', { stroke: C.eye, strokeWidth: 3.2, strokeLinecap: 'round' }),
    ell(0, -76, 5, 6, C.mouth),
    ell(-32, -82, 6, 3.4, '#ff8f9c', { opacity: 0.45 }), ell(32, -82, 6, 3.4, '#ff8f9c', { opacity: 0.45 })
  ].join(''))
], 0.1));

// HUD の顔アイコン
sprite('chars', 'rin/icon', 16, 15, 8, 7.5, defs => tr(7.2, 20, head(defs, 'smile', 'normal'), 0.1));
