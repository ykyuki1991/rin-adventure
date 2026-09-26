// 絵の書き出し: node tools/art/build.mjs
// art/*.svg（絵のシート）と js/art-data.js（どの絵がシートのどこにあるか）を作ります
import { writeFileSync, readFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Defs, f } from './svg.mjs';
import { SPRITES, BACKGROUNDS, PICTURES } from './registry.mjs';

import './chars.mjs';
import './enemies.mjs';
import './enemies2.mjs';
import './items.mjs';
import './tiles.mjs';
import './tiles2.mjs';
import './decos.mjs';
import './decos2.mjs';
import './bgs.mjs';
import './bgs2.mjs';
import './yakumo.mjs';
import './yakumo2.mjs';
import './map.mjs';

// ステージごとの絵（tools/art/stages/*.mjs）は、名前の順にすべて読みこむ
{
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'stages');
  for (const fn of readdirSync(dir).filter(f => f.endsWith('.mjs')).sort()) await import('./stages/' + fn);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'art');
mkdirSync(join(OUT, 'bg'), { recursive: true });
for (const d of [OUT, join(OUT, 'bg')]) for (const fn of readdirSync(d)) if (fn.endsWith('.svg')) unlinkSync(join(d, fn));

const PAD = 2;
const SHEET_W = 512;

// シートごとに棚詰めで並べる
const sheets = {};
for (const s of SPRITES) (sheets[s.sheet] ||= []).push(s);

const frames = {};
const sheetInfo = {};
for (const [name, list] of Object.entries(sheets)) {
  const sorted = [...list].sort((a, b) => b.h - a.h || b.w - a.w);
  let x = PAD, y = PAD, rowH = 0;
  const defs = new Defs(name.replace(/[^a-z0-9]/gi, '') + '_');
  const parts = [];
  for (const s of sorted) {
    const w = Math.ceil(s.w), h = Math.ceil(s.h);
    if (x + w + PAD > SHEET_W) { x = PAD; y += rowH + PAD * 2; rowH = 0; }
    parts.push(`<g id="${s.name.replace(/[^a-z0-9_-]/gi, '_')}" transform="translate(${x} ${y})">${s.draw(defs)}</g>`);
    frames[s.name] = [name, x, y, s.w, s.h, s.ax, s.ay];
    x += w + PAD * 2;
    rowH = Math.max(rowH, h);
  }
  const H = Math.ceil(y + rowH + PAD);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET_W} ${H}" width="${SHEET_W}" height="${H}">${defs.svg()}${parts.join('\n')}</svg>`;
  writeFileSync(join(OUT, name + '.svg'), svg);
  sheetInfo[name] = { file: `art/${name}.svg`, w: SHEET_W, h: H };
}

// 画像（PNG）のシート：キャラ表から切り出した りん（tools/art/rin/extract.cjs で作る）
{
  const meta = join(ROOT, 'tools', 'art', 'rin', 'frames.json');
  if (existsSync(meta)) {
    const { sheet, frames: fr } = JSON.parse(readFileSync(meta, 'utf8'));
    sheetInfo.rin = { ...sheet, png: true };
    for (const [n, v] of Object.entries(fr)) frames[n] = ['rin', v.sx, v.sy, v.w, v.h, v.ax, v.ay];
  }
}

// 背景（層ごとに1枚）
const bgInfo = {};
for (const [theme, layers] of Object.entries(BACKGROUNDS)) {
  bgInfo[theme] = layers.map((L, i) => {
    const defs = new Defs(`bg${theme}${i}_`);
    const H = L.h || 240;
    const body = L.draw(defs, L.w, H);
    const file = `art/bg/${theme}-${i}.svg`;
    writeFileSync(join(ROOT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.w} ${H}" width="${L.w}" height="${H}">${defs.svg()}${body}</svg>`);
    return { file, f: L.f, w: L.w, h: H, y: L.y || 0, dim: !!L.dim, fg: !!L.fg };
  });
}

// 1枚絵
const picFiles = [];
for (const P of PICTURES) {
  const defs = new Defs(`pic${P.name}_`);
  const body = P.draw(defs);
  const file = `art/${P.name}.svg`;
  writeFileSync(join(ROOT, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.w} ${P.h}" width="${P.w}" height="${P.h}">${defs.svg()}${body}</svg>`);
  picFiles.push(file);
}

const js = `// 自動生成ファイル（tools/art/build.mjs）。手で書きかえないでください
export const SHEETS = ${JSON.stringify(sheetInfo)};
export const FRAMES = {
${Object.entries(frames).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v.map(n => typeof n === 'number' ? +f(n) : n))}`).join(',\n')}
};
export const BGS = ${JSON.stringify(bgInfo)};
`;
writeFileSync(join(ROOT, 'js', 'art-data.js'), js);
// オフライン用に sw.js の ASSETS に絵のファイルを書きこむ
{
  const swPath = join(ROOT, 'sw.js');
  const sw = readFileSync(swPath, 'utf8');
  const files = [...Object.values(sheetInfo).map(s => s.file), ...Object.values(bgInfo).flat().map(l => l.file), ...picFiles];
  const block = '  // ART-START（tools/art/build.mjs が自動で書きかえます）\n' + files.map(f => `  './${f}',`).join('\n') + '\n  // ART-END';
  writeFileSync(swPath, sw.replace(/  \/\/ ART-START[\s\S]*?\/\/ ART-END/, block));
}
console.log('sheets:', Object.entries(sheetInfo).map(([k, v]) => `${k} ${v.w}x${v.h}`).join(', '));
console.log('frames:', Object.keys(frames).length, ' bg themes:', Object.keys(bgInfo).join(','));
