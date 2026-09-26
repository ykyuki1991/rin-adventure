// キャラ表（sheet.webp）から りん の各ポーズを切り出す（開発用・sharp が必要）
// 使い方: NODE_PATH=<sharp のある node_modules> node tools/art/rin/extract.cjs
//   → tools/art/rin/frames/*.png と frames.json を作る。そのあと node tools/art/build.mjs で art/chars.svg に入る
// ・背景（クリーム色）と足元のかげを消して、すきとおらせる
// ・ふだんの絵は胸の星を消す。パワーアップ（rinP/）は星をのこしてマントをつける
// ・まばたきは待機の絵の目を閉じて作る
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = __dirname, OUT = path.join(DIR, 'frames');
const SCALE = 0.09;   // キャラ表の1px → ゲームの何ドットか（待機の高さ 約23ドット）
const RES = 6;        // 書き出す画像は ゲーム1ドット = 6px

// キャラ表の中の位置 [左, 上, 右, 下]
const BOX = {
  front: [90, 78, 252, 341], wave: [358, 75, 523, 341], run0: [629, 80, 795, 341], run1: [881, 78, 1042, 341],
  runCape0: [1124, 80, 1318, 342], jump: [1411, 65, 1579, 339], run2: [76, 375, 222, 618], runCape1: [304, 375, 487, 619],
  fall: [573, 367, 720, 618], skid: [799, 383, 946, 619], back: [1026, 378, 1169, 623], backCape: [1237, 377, 1382, 624],
  climb0: [1446, 378, 1603, 623], climb1: [152, 645, 311, 883], win: [466, 644, 623, 883], dead: [749, 644, 906, 884], icon: [1073, 684, 1237, 846]
};
const BG = [250, 249, 238];

async function load(name, pad = 6) {
  const [x0, y0, x1, y1] = BOX[name];
  const left = x0 - pad, top = y0 - pad, width = x1 - x0 + 1 + pad * 2, height = y1 - y0 + 1 + pad * 2;
  const { data, info } = await sharp(path.join(DIR, 'sheet.webp')).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const img = { w: info.width, h: info.height, d: Buffer.from(data) };
  // 外がわからつながっている背景（と足元のかげ）だけを消す。白目やシャツの白い帯は中にあるので消えない
  const { w, h, d } = img, N = w * h;
  const diffOf = i => Math.abs(d[i * 4] - BG[0]) + Math.abs(d[i * 4 + 1] - BG[1]) + Math.abs(d[i * 4 + 2] - BG[2]);
  const floodable = i => {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    if (diffOf(i) < 18) return true;
    // かげ：うすいベージュ〜灰色（青みのある白や肌の色はふくめない）
    return r >= b + 5 && r - b < 40 && Math.abs(r - g) < 16 && r + g + b > 520;
  };
  const out = new Uint8Array(N), q = [];
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) q.push(y * w + x);
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) q.push(y * w + x);
  while (q.length) {
    const j = q.pop(); if (out[j] || !floodable(j)) continue; out[j] = 1;
    const x = j % w, y = (j / w) | 0;
    if (x > 0) q.push(j - 1); if (x < w - 1) q.push(j + 1); if (y > 0) q.push(j - w); if (y < h - 1) q.push(j + w);
  }
  for (let i = 0; i < N; i++) {
    if (out[i]) { d[i * 4 + 3] = 0; continue; }
    // ふち（背景のとなり）は色の差でうすくし、背景の色をぬく
    const x = i % w, y = (i / w) | 0;
    const edge = (x > 0 && out[i - 1]) || (x < w - 1 && out[i + 1]) || (y > 0 && out[i - w]) || (y < h - 1 && out[i + w]);
    if (!edge) continue;
    const a = Math.max(0.15, Math.min(1, (diffOf(i) - 12) / 60));
    d[i * 4 + 3] = Math.round(a * 255);
    if (a < 1) for (let k = 0; k < 3; k++) d[i * 4 + k] = Math.max(0, Math.min(255, Math.round((d[i * 4 + k] - BG[k] * (1 - a)) / a)));
  }
  keepBiggest(img);
  return img;
}
// いちばん大きなかたまり以外（かげ・ごみ）を消す。ただし大きなかたまりの近く（マントなど）はのこす
function keepBiggest(img) {
  const { w, h, d } = img, lab = new Int32Array(w * h).fill(-1), sizes = [];
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] < 40 || lab[i] >= 0) continue;
    const id = sizes.length; let n = 0; const q = [i]; lab[i] = id;
    while (q.length) { const j = q.pop(); n++; const x = j % w, y = (j / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const k = ny * w + nx; if (d[k * 4 + 3] >= 40 && lab[k] < 0) { lab[k] = id; q.push(k); } } }
    sizes.push(n);
  }
  const keep = new Set(sizes.map((n, i) => [n, i]).filter(([n]) => n > 400).map(([, i]) => i));
  for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 0 && !(lab[i] >= 0 && keep.has(lab[i]))) {
    // うすいふちは近くのかたまりにつながっていればのこす
    if (d[i * 4 + 3] < 40) { const x = i % w, y = (i / w) | 0; let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && keep.has(lab[ny * w + nx])) { near = true; break; } } if (near) continue; }
    d[i * 4 + 3] = 0;
  }
}
const at = (img, x, y) => { const i = (y * img.w + x) * 4; return [img.d[i], img.d[i + 1], img.d[i + 2], img.d[i + 3]]; };
function bbox(img, test) {
  let b = [1e9, 1e9, -1, -1];
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const p = at(img, x, y); if (p[3] > 128 && test(p)) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); } }
  return b;
}
const isTeal = ([r, g, b]) => g > 150 && b > 130 && r < 120;
const isStar = ([r, g, b]) => r > 200 && g > 175 && b < 120 && r - b > 100;
const isCape = ([r, g, b]) => r > 150 && r - g > 90 && r - b > 70 && b < 110;

// 胸の星を消す（星のまわりの四角を、左右のシャツの色でなめらかにうめる）
function removeStar(img) {
  const t = bbox(img, isTeal);
  const sb = [1e9, 1e9, -1, -1];
  for (let y = t[1]; y <= t[3]; y++) for (let x = t[0]; x <= t[2]; x++) { const p = at(img, x, y); if (p[3] > 200 && isStar(p)) { sb[0] = Math.min(sb[0], x); sb[1] = Math.min(sb[1], y); sb[2] = Math.max(sb[2], x); sb[3] = Math.max(sb[3], y); } }
  if (sb[2] < 0 || sb[2] - sb[0] > 40 || sb[3] - sb[1] > 40) { console.log('star not found', sb); return; }
  const P = 4, x0 = sb[0] - P, x1 = sb[2] + P, y0 = sb[1] - P, y1 = sb[3] + P;
  for (let y = y0; y <= y1; y++) {
    const L = at(img, x0 - 1, y), R = at(img, x1 + 1, y);
    for (let x = x0; x <= x1; x++) { const u = (x - x0 + 1) / (x1 - x0 + 2), i = (y * img.w + x) * 4; for (let c = 0; c < 3; c++) img.d[i + c] = Math.round(L[c] * (1 - u) + R[c] * u); }
  }
}
const isTealish = ([r, g, b, a]) => a > 0 && g > 140 && r < 220 && !(isTeal([r, g, b]));

// まばたき：目を肌の色でぬって、とじた目の線をかく
async function closeEyes(img) {
  // 顔の中の黒っぽいかたまり（目）をさがす
  const { w, h } = img, dark = [];
  for (let y = Math.round(h * 0.3); y < h * 0.62; y++) for (let x = Math.round(w * 0.2); x < w * 0.85; x++) { const [r, g, b, a] = at(img, x, y); if (a > 200 && r + g + b < 110) dark.push([x, y]); }
  const eyes = [];
  for (const [x, y] of dark) { let e = eyes.find(e => x >= e.x0 - 4 && x <= e.x1 + 4 && y >= e.y0 - 4 && y <= e.y1 + 4); if (!e) { e = { x0: x, x1: x, y0: y, y1: y, n: 0, cx: x, cy: y }; eyes.push(e); } e.x0 = Math.min(e.x0, x); e.x1 = Math.max(e.x1, x); e.y0 = Math.min(e.y0, y); e.y1 = Math.max(e.y1, y); e.n++; e.cx = (e.x0 + e.x1) / 2; e.cy = (e.y0 + e.y1) / 2; }
  const two = eyes.sort((a, b) => b.n - a.n).slice(0, 2);
  const skin = at(img, Math.round(two[0].cx), Math.min(h - 1, two[0].y1 + 6));
  const col = `rgb(${skin[0]},${skin[1]},${skin[2]})`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${two.map(e => {
    const rx = (e.x1 - e.x0) / 2 + 7, ry = (e.y1 - e.y0) / 2 + 6, y = e.cy + ry * 0.35;
    return `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${rx}" ry="${ry}" fill="${col}"/><path d="M${e.cx - rx * 0.8} ${y - 1} Q${e.cx} ${y + ry * 0.45} ${e.cx + rx * 0.8} ${y - 1}" fill="none" stroke="#3a2418" stroke-width="3" stroke-linecap="round"/>`;
  }).join('')}</svg>`;
  const buf = await sharp(img.d, { raw: { width: w, height: h, channels: 4 } }).composite([{ input: Buffer.from(svg), blend: 'atop' }]).raw().toBuffer();
  return { w, h, d: Buffer.from(buf) };
}

// マントだけを取り出す
function capeOf(img, maxX = Infinity) {
  const out = { w: img.w, h: img.h, d: Buffer.alloc(img.d.length) };
  for (let y = 0; y < img.h; y++) for (let x = 0; x < Math.min(img.w, maxX); x++) { const p = at(img, x, y); if (p[3] > 0 && isCape(p)) { const i = (y * img.w + x) * 4; img.d.copy(out.d, i, i, i + 4); } }
  return out;
}
// 2まいを重ねる（下の絵を ox,oy ずらして置き、大きなキャンバスにする）
function stack(under, over, ox, oy) {
  const x0 = Math.min(0, ox), y0 = Math.min(0, oy), x1 = Math.max(over.w, ox + under.w), y1 = Math.max(over.h, oy + under.h);
  const w = x1 - x0, h = y1 - y0, d = Buffer.alloc(w * h * 4);
  const put = (img, px, py) => {
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
      const s = (y * img.w + x) * 4, a = img.d[s + 3] / 255; if (!a) continue;
      const t = ((y + py) * w + x + px) * 4, b = d[t + 3] / 255, o = a + b * (1 - a);
      for (let c = 0; c < 3; c++) d[t + c] = Math.round((img.d[s + c] * a + d[t + c] * b * (1 - a)) / o);
      d[t + 3] = Math.round(o * 255);
    }
  };
  put(under, ox - x0, oy - y0); put(over, -x0, -y0);
  return { w, h, d, shiftX: -x0, shiftY: -y0 };
}
const clone = img => ({ w: img.w, h: img.h, d: Buffer.from(img.d) });

async function save(name, img, frames, opt = {}) {
  // 足元（いちばん下の不透明な行）とシャツのまん中を基準点にする
  let bottom = 0;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.d[(y * img.w + x) * 4 + 3] > 128) bottom = Math.max(bottom, y);
  const t = bbox(img, isTeal);
  const ax = opt.ax ?? (t[0] + t[2]) / 2, ay = opt.ay ?? bottom + 1;
  // 書き出す大きさ
  const k = SCALE * RES, W = Math.round(img.w * k), H = Math.round(img.h * k);
  const file = name.replace('/', '_') + '.png';
  await sharp(img.d, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(W, H, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(OUT, file));
  frames[name] = { file, w: +(W / RES).toFixed(3), h: +(H / RES).toFixed(3), ax: +(ax * SCALE).toFixed(3), ay: +(ay * SCALE).toFixed(3) };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
  const I = {};
  for (const n of Object.keys(BOX)) I[n] = await load(n);
  const frames = {};
  // マント：横向き（走り）と うしろ向き
  const sideSrc = I.runCape0, sideT = bbox(sideSrc, isTeal);
  const sideCape = capeOf(sideSrc, sideT[0] + 12);
  const backT = bbox(I.backCape, isTeal), backCape = capeOf(I.backCape);
  const backCapeT = bbox(backCape, () => true);
  const withSide = (img) => { const t = bbox(img, isTeal); const s = stack(sideCape, img, t[0] - sideT[0] + 2, t[1] - sideT[1] + 4); return s; };
  const withBack = (img, over) => {
    const t = bbox(img, isTeal);
    const ox = Math.round((t[0] + t[2]) / 2 - (backCapeT[0] + backCapeT[2]) / 2 - backCapeT[0] + backCapeT[0]), oy = t[1] - backCapeT[1] + 6;
    return over ? stack(img, backCape, -ox, -oy) : stack(backCape, img, ox, oy);
  };
  const plain = img => { const c = clone(img); removeStar(c); return c; };
  // 基準点は「マントなし」の絵にそろえる（マントつきはキャンバスがずれたぶんを足す）
  const pair = async (name, src, capeFn) => {
    const p = plain(src); await save('rin/' + name, p, frames);
    const t = bbox(src, isTeal);
    const s = capeFn(src);
    let bottom = 0; for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) if (src.d[(y * src.w + x) * 4 + 3] > 128) bottom = Math.max(bottom, y);
    await save('rinP/' + name, s, frames, { ax: (t[0] + t[2]) / 2 + s.shiftX, ay: bottom + 1 + s.shiftY });
  };
  await pair('idle0', I.front, i => withBack(i));
  // 待機2：少しだけ息をすう（たてに 3% のばす）
  const breathe = async (img) => { const h2 = Math.round(img.h * 1.03); const buf = await sharp(img.d, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(img.w, h2, { fit: 'fill' }).raw().toBuffer(); return { w: img.w, h: h2, d: Buffer.from(buf) }; };
  await pair('idle1', await breathe(I.front), i => withBack(i));
  const blink = await closeEyes(I.front);
  await pair('blink', blink, i => withBack(i));
  const runs = [I.run0, I.run1, I.run2, I.run1];
  for (let k = 0; k < 4; k++) {
    await save('rin/run' + k, plain(runs[k]), frames);
    await save('rinP/run' + k, clone(k % 2 ? I.runCape1 : I.runCape0), frames);
  }
  // マントつきの走りも、マントなしと同じ基準点の高さにそろえる（シャツのまん中が基準）
  await pair('jump', I.jump, withSide);
  await pair('fall', I.fall, withSide);
  await pair('skid', I.skid, withSide);
  await pair('climb0', I.climb0, i => withBack(i, true));
  await pair('climb1', I.climb1, i => withBack(i, true));
  await pair('win', I.win, i => withBack(i));
  await save('rin/dead', plain(I.dead), frames);
  // 顔アイコン（丸の中だけ）
  {
    const img = I.icon, t = bbox(img, () => true), cx = (t[0] + t[2]) / 2, cy = (t[1] + t[3]) / 2, r = Math.min(t[2] - t[0], t[3] - t[1]) / 2;
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const dd = Math.hypot(x - cx, y - cy), i = (y * img.w + x) * 4; const a = Math.max(0, Math.min(1, r - dd)); img.d[i + 3] = Math.round(255 * a); if (a > 0) { const src = at(I.icon, x, y); } }
    // 丸の中は元の色で（背景をぬいた色ではなく）
    const { data } = await sharp(path.join(DIR, 'sheet.webp')).extract({ left: BOX.icon[0] - 6, top: BOX.icon[1] - 6, width: img.w, height: img.h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < img.w * img.h; i++) for (let c = 0; c < 3; c++) img.d[i * 4 + c] = data[i * 4 + c];
    const k = 16 / (r * 2) , W = Math.round(img.w * k * RES), H = Math.round(img.h * k * RES);
    await sharp(img.d, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(W, H, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'rin_icon.png'));
    frames['rin/icon'] = { file: 'rin_icon.png', w: +(W / RES).toFixed(3), h: +(H / RES).toFixed(3), ax: +(cx * k).toFixed(3), ay: +(cy * k).toFixed(3) };
  }
  fs.writeFileSync(path.join(DIR, 'frames.json'), JSON.stringify(frames, null, 1));
  console.log(Object.keys(frames).length, 'frames');
})();
