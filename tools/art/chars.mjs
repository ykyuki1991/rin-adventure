// りん（主人公）。部品（頭・体・うで・あし）を組み合わせてポーズを作る
// 座標は 0.1ドット単位で、足元のまん中が (0,0)。上がマイナス
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sprite, dropSprites } from './registry.mjs';
import { tr, g, path, ell, circ, rrect, rect, f } from './svg.mjs';

export const C = {
  skin: '#fdd9b8', skinS: '#f0b894', skinL: '#fff0e0',
  hair: '#4a2b18', hairS: '#35190b', hairL: '#7a4a2c',
  teal: '#3cc8c0', tealS: '#22a39c', tealL: '#86e4dc',
  white: '#fbfdff', whiteS: '#d6dde6',
  red: '#f0647a', redS: '#cc4058',
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
  const shape = 'M-24 -78 Q-31 -78 -31 -70 L-32 -34 Q-32 -26 -24 -26 L25 -26 Q33 -26 33 -34 L32 -70 Q32 -78 24 -78 Z';
  const cp = defs.clip(`<path d="${shape}"/>`);
  return [
    g([
      rect(-34, -82, 70, 38, C.teal),
      rect(-34, -46, 70, 8, C.white),
      rect(-34, -38.5, 70, 14, C.red),
      // 左側（背中側）のかげ
      rect(-34, -82, 12, 38, C.tealS),
      rect(-34, -45, 12, 7, C.whiteS),
      rect(-34, -38.5, 12, 14, C.redS),
      // えり
      path('M-12 -78 Q2 -70 16 -78', 'none', { stroke: C.tealS, strokeWidth: 3, strokeLinecap: 'round' }),
      ell(14, -70, 10, 3.5, C.tealL, { opacity: 0.55 })
    ], { 'clip-path': cp }),
    // 半ズボン
    path('M-29 -29 L31 -29 L31 -16 Q31 -11 26 -11 L-24 -11 Q-29 -11 -29 -16 Z', C.blue),
    rect(-29, -29, 60, 3, C.blueS, { opacity: 0.7 }),
    path('M1 -26 L1 -13', 'none', { stroke: C.blueS, strokeWidth: 1.6, opacity: 0.8 })
  ].join('');
}

// ---- 頭 ---- mouth: smile/open/o/grin, eyes: normal/blink/x/happy
// キャラ表に合わせて：まんまるの頭・おかっぱの前髪・くるんとしたアホ毛・大きなたて長の目
function head(defs, mouth = 'smile', eyes = 'normal') {
  const parts = [];
  const hairG = defs.radU([[0, '#6b4128'], [0.55, C.hair], [1, C.hairS]], -10, -150, 90);
  const skinG = defs.radU([[0, '#fff1e2'], [0.6, C.skin], [1, '#f6c9a2']], 30, -108, 64);
  // 後ろ髪（まるいかたまり）
  parts.push(circ(-6, -112, 64, C.hairS));
  parts.push(circ(-4, -114, 61, hairG));
  // 顔
  const faceD = 'M-30 -108 C-30 -134 -6 -148 22 -148 C52 -148 72 -130 72 -104 C72 -74 50 -54 20 -54 C-8 -54 -30 -74 -30 -100 Z';
  parts.push(path(faceD, skinG));
  const faceClip = defs.clip(`<path d="${faceD}"/>`);
  // 耳
  parts.push(ell(-26, -96, 8, 10, C.skin), ell(-25, -96, 4, 5.5, C.skinS));
  // 前髪（まっすぐなおかっぱ・少しだけ切れこみ）
  const bangs = 'M-46 -136 C-36 -166 0 -178 28 -175 C56 -172 74 -152 76 -124 C76 -116 74 -110 72 -106 ' +
    'C66 -112 60 -116 52 -118 C48 -112 42 -110 36 -110 C34 -116 30 -120 24 -122 C14 -116 0 -114 -12 -116 ' +
    'C-20 -112 -26 -104 -30 -96 C-38 -108 -44 -122 -46 -136 Z';
  parts.push(g([path(bangs, '#e9b48c', { transform: 'translate(1 5)', opacity: 0.8 })], { 'clip-path': faceClip }));
  parts.push(path(bangs, hairG));
  // 髪のつや（やわらかい光の輪）
  parts.push(path('M-22 -150 C-8 -166 16 -172 38 -168 C18 -162 -2 -156 -16 -142 Z', '#8a5a3a', { opacity: 0.55 }));
  // アホ毛（くるん）
  parts.push(path('M2 -170 C-2 -186 8 -198 22 -196 C31 -194 32 -185 26 -182', 'none', { stroke: C.hair, strokeWidth: 7.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  // 目（大きなたて長・ハイライト2つ）
  const ey = -98;
  for (const [x, rx] of [[22, 10], [50, 9]]) {
    const ry = 13.5;
    if (eyes === 'blink') {
      parts.push(path(`M${x - 8} ${ey + 3} Q${x} ${ey + 8} ${x + 8} ${ey + 3}`, 'none', { stroke: C.eye, strokeWidth: 3, strokeLinecap: 'round' }));
    } else if (eyes === 'happy') {
      parts.push(path(`M${x - 8} ${ey + 4} Q${x} ${ey - 8} ${x + 8} ${ey + 4}`, 'none', { stroke: C.eye, strokeWidth: 3.4, strokeLinecap: 'round' }));
    } else if (eyes === 'x') {
      parts.push(path(`M${x - 6} ${ey - 6} L${x + 6} ${ey + 6} M${x + 6} ${ey - 6} L${x - 6} ${ey + 6}`, 'none', { stroke: C.eye, strokeWidth: 3.2, strokeLinecap: 'round' }));
    } else {
      parts.push(ell(x, ey, rx, ry, C.eye));
      parts.push(ell(x, ey + 5.5, rx * 0.7, ry * 0.38, '#7a4a2a', { opacity: 0.85 }));
      parts.push(circ(x + rx * 0.28, ey - ry * 0.36, rx * 0.46, '#ffffff'));
      parts.push(circ(x - rx * 0.34, ey + ry * 0.34, rx * 0.2, '#ffffff', { opacity: 0.9 }));
    }
  }
  // ほっぺ
  parts.push(ell(4, -78, 8, 4.5, '#ff9aa6', { opacity: 0.45 }), ell(64, -78, 6, 4, '#ff9aa6', { opacity: 0.4 }));
  // 口
  const mx = 37, my = -73;
  if (mouth === 'smile') parts.push(path(`M${mx - 5.5} ${my - 1} Q${mx} ${my + 4.5} ${mx + 5.5} ${my - 1}`, 'none', { stroke: C.mouth, strokeWidth: 2.6, strokeLinecap: 'round' }));
  else if (mouth === 'open') parts.push(path(`M${mx - 6} ${my - 2} Q${mx} ${my - 3} ${mx + 7} ${my - 2} Q${mx + 5} ${my + 9} ${mx} ${my + 9} Q${mx - 5} ${my + 8} ${mx - 6} ${my - 2} Z`, C.mouth), ell(mx + 0.5, my + 5, 4, 2.6, C.tongue));
  else if (mouth === 'o') parts.push(ell(mx, my + 1, 3.8, 4.6, C.mouth));
  else if (mouth === 'grin') parts.push(path(`M${mx - 8} ${my - 2} Q${mx} ${my + 11} ${mx + 8} ${my - 2} Z`, C.mouth), path(`M${mx - 7} ${my - 1.5} L${mx + 7} ${my - 1.5} L${mx + 6} ${my + 1.2} L${mx - 6} ${my + 1.2} Z`, '#ffffff'));
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
  if (p.cape !== undefined) body.push(tr(0, -10, cape(p.cape)));
  body.push(arm(-20, -68, p.armB ?? 10, true));
  body.push(leg(-11, -20, p.legB ?? 0));
  body.push(torso(defs));
  if (p.badge) body.push(tr(14, -58, path('M0 -6 L1.8 -1.9 6.3 -1.9 2.7 0.9 4 5.4 0 2.7 -4 5.4 -2.7 0.9 -6.3 -1.9 -1.8 -1.9 Z', C.gold)));
  body.push(leg(11, -20, p.legF ?? 0));
  // 頭は首のところを中心に少し小さくして、体とのバランスをキャラ表に合わせる
  const headG = tr(0, (p.headBob || 0) - 12, tr(8, -62, tr(-8, 62, head(defs, p.mouth, p.eyes)), 0.9), 1, p.headTilt || 0);
  body.push(headG);
  body.push(arm(25, -68, p.armF ?? -8, false));
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

// ========================================================================
// キャラ表から切り出した絵（tools/art/rin/extract.cjs で作る）があれば、りん はそちらを使う
// 上の SVG の りん は、切り出した絵がないときの予備
// ========================================================================
{
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'rin');
  const meta = join(dir, 'frames.json');
  if (existsSync(meta)) {
    const frames = JSON.parse(readFileSync(meta, 'utf8'));
    dropSprites(n => /^rinP?\//.test(n));
    for (const [name, fr] of Object.entries(frames)) {
      const b64 = readFileSync(join(dir, 'frames', fr.file)).toString('base64');
      sprite('rin', name, fr.w, fr.h, fr.ax, fr.ay, () => `<image x="0" y="0" width="${fr.w}" height="${fr.h}" preserveAspectRatio="none" href="data:image/png;base64,${b64}"/>`);
    }
  }
}
