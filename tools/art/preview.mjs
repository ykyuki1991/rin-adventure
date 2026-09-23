// 絵の確認用: node tools/art/preview.mjs <出力.png> <倍率> <背景色> <名前の前方一致...>
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp'); // NODE_PATH の sharp を使う
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [out, scaleS, bg, ...prefixes] = process.argv.slice(2);
const S = parseFloat(scaleS || '6');
const { SHEETS, FRAMES } = await import(join(ROOT, 'js', 'art-data.js') + '?t=' + Date.now());

const names = Object.keys(FRAMES).filter(n => prefixes.length === 0 || prefixes.some(p => n.startsWith(p)));
const cache = {};
async function sheetImg(name) {
  if (!cache[name]) {
    const svg = readFileSync(join(ROOT, SHEETS[name].file));
    cache[name] = await sharp(svg, { density: 72 * S }).png().toBuffer();
  }
  return cache[name];
}
const cells = [];
for (const n of names) {
  const [sh, x, y, w, h] = FRAMES[n];
  const img = await sheetImg(sh);
  const meta = await sharp(img).metadata();
  const left = Math.max(0, Math.floor(x * S)), top = Math.max(0, Math.floor(y * S));
  const width = Math.min(meta.width - left, Math.ceil(w * S)), height = Math.min(meta.height - top, Math.ceil(h * S));
  const buf = await sharp(img).extract({ left, top, width, height }).png().toBuffer();
  cells.push({ n, buf, width, height });
}
const gap = 12, maxW = 1800;
let cx = gap, cy = gap, rowH = 0;
const comps = [];
for (const c of cells) {
  if (cx + c.width + gap > maxW) { cx = gap; cy += rowH + gap; rowH = 0; }
  comps.push({ input: c.buf, left: cx, top: cy });
  cx += c.width + gap; rowH = Math.max(rowH, c.height);
}
const W = maxW, H = cy + rowH + gap;
await sharp({ create: { width: W, height: H, channels: 4, background: bg || '#dfe6ee' } }).composite(comps).png().toFile(out);
console.log(out, names.length, 'frames');
