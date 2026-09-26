// SVGで描いた絵（art/*.svg）を、画面の細かさに合わせて一度だけ画像にして使う
// 絵が用意されていないものは、これまでのプログラムで描く絵のまま動きます
import { SHEETS, FRAMES, BGS } from './art-data.js';

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('load failed ' + url);
  return res.text();
}

// SVG の文字列を、指定した倍率の canvas にする
async function rasterize(text, w, h, S) {
  const W = Math.max(1, Math.ceil(w * S)), H = Math.max(1, Math.ceil(h * S));
  const svg = text.replace(/<svg([^>]*?)\swidth="[^"]*"([^>]*?)\sheight="[^"]*"/, `<svg$1 width="${W}"$2 height="${H}"`);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    return toCanvas(img, W, H);
  } finally {
    URL.revokeObjectURL(url);
  }
}
// 画像を W×H の canvas にする（iPhone で メモリが足りず canvas が作れないときはエラーにする）
function toCanvas(img, W, H) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx || c.width !== W) { free(c); throw new Error('canvas alloc failed ' + W + 'x' + H); }
  ctx.drawImage(img, 0, 0, W, H);
  return c;
}
// PNG のシート（キャラ表から切り出した りん）
async function loadPng(url, w, h, S) {
  const img = new Image();
  img.decoding = 'async';
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
  return toCanvas(img, Math.ceil(w * S), Math.ceil(h * S));
}
// canvas のメモリをすぐに返す（iPhone の Safari は、使わなくなった canvas もしばらくメモリを使いつづけるため）
export function free(c) { if (c && c.width) { c.width = 0; c.height = 0; } }

// キャラクター・敵・アイテム・乗り物には細いふちどりをつける（背景とまざらず、見分けやすくするため）
const OUTLINE = new Set(['chars', 'rin', 'enemies', 'items', 'pf']);
const OUTLINE_W = 0.6;                 // ふちの太さ（ゲームの1ドット単位）
const OUTLINE_COLOR = 'rgba(34,26,54,0.88)';
function outline(c, S) {
  const r = Math.max(1, OUTLINE_W * S);
  const o = document.createElement('canvas');
  o.width = c.width; o.height = c.height;
  const ctx = o.getContext('2d');
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    ctx.drawImage(c, Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r));
  }
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.fillRect(0, 0, o.width, o.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(c, 0, 0);
  free(c);
  return o;
}
// シートを1まい画像にする（SVG または PNG。ふちどりつき）
async function makeSheet(store, name, S) {
  const info = SHEETS[name];
  let c;
  if (info.png) c = await loadPng(info.file, info.w, info.h, S);
  else {
    if (!store.texts[name]) store.texts[name] = await loadText(info.file);
    c = await rasterize(store.texts[name], info.w, info.h, S);
  }
  return OUTLINE.has(name) ? outline(c, S) : c;
}

// ステージごとのシート。そのステージを遊ぶときだけ画像にして、ほかのステージのものはメモリから外す
const STAGE_SHEETS = { zoo: 's2', shinkobe: 's3', falls: 's3', ropeway: 's4', kitano: 's5', sannomiya: 's6', nankin: 's6', meriken: 's7', harborland: 's7', suma: 's8', maiko: 's9', bridge: 's9', rokko: 's10', kikusei: 's10' };
const LAZY = new Set(Object.values(STAGE_SHEETS));

class ArtStore {
  constructor() {
    this.S = 0;
    this.sheets = {};
    this.texts = {};
    this.ready = false;
    this.bg = new Map();        // theme -> [{canvas, f, w, h, y}]
    this.bgS = 0;
    this.bgLoading = new Map();
    this.version = 0;            // 絵が作り直されたら増える（タイルのキャッシュを捨てる合図）
    this.lazyWant = new Set();   // いま必要なステージのシート
    this.sheetLoading = new Map();
  }

  // 画面の倍率 K に合わせてシートを用意する（K が大きく変わったら作り直す）
  // iPhone は画面が細かい（K が 5 近く）が、canvas のメモリに上限があるので 倍率は 4 までにする
  async init(K) {
    const S = Math.max(1, Math.min(4, Math.ceil(K * 2) / 2));
    if (this.ready && Math.abs(S - this.S) < 0.5) return;
    if (this._busy) return this._busy;
    this._busy = (async () => {
      const names = Object.keys(SHEETS).filter(name => !LAZY.has(name));
      // 1まいずつ作る（1まいが失敗しても、ほかの絵は使えるように）
      const out = {};
      for (const name of names) {
        try { out[name] = await makeSheet(this, name, S); } catch (e) { console.warn('sheet', name, e); }
      }
      for (const [n, c] of Object.entries(this.sheets)) if (out[n] !== c) free(c);
      this.sheets = out;
      this.S = S;
      this.ready = true;
      this.version++;
      await Promise.all([...this.lazyWant].map(n => this.loadSheet(n)));
    })().catch(e => { console.warn('art', e); }).finally(() => { this._busy = null; });
    return this._busy;
  }

  has(name) { const fr = FRAMES[name]; return this.ready && fr !== undefined && !!this.sheets[fr[0]]; }

  // ステージのシートを用意する（names 以外のステージのシートは外す）
  async prepareSheets(names) {
    this.lazyWant = new Set(names.filter(n => SHEETS[n]));
    for (const n of Object.keys(this.sheets)) if (LAZY.has(n) && !this.lazyWant.has(n)) { free(this.sheets[n]); delete this.sheets[n]; }
    if (this._busy) await this._busy;
    if (!this.ready) return;
    await Promise.all([...this.lazyWant].filter(n => !this.sheets[n]).map(n => this.loadSheet(n)));
  }

  loadSheet(name) {
    const S = this.S, key = name + '@' + S;
    if (this.sheetLoading.has(key)) return this.sheetLoading.get(key);
    const p = (async () => {
      const c = await makeSheet(this, name, S);
      if (this.S === S && this.lazyWant.has(name)) {
        free(this.sheets[name]);
        this.sheets[name] = c;
        this.version++; // 絵がそろったので、先に描いておいたタイルを作り直す
      } else free(c);
    })().catch(e => console.warn('sheet', name, e)).finally(() => this.sheetLoading.delete(key));
    this.sheetLoading.set(key, p);
    return p;
  }
  frame(name) { return FRAMES[name]; }

  // 基準点が (x, y) にくるように描く（ctx はゲーム内の座標）
  draw(ctx, name, x, y, flip = false, sx = 1, sy = 1) {
    const fr = FRAMES[name];
    if (!fr || !this.ready) return false;
    let [sheet, fx, fy, fw, fh, ax, ay] = fr;
    const c = this.sheets[sheet];
    if (!c) return false;
    const S = this.S;
    // ふちどりのあるシートは、はみ出したふちの分だけ1ドット広く切り出す
    if (OUTLINE.has(sheet)) { fx -= 1; fy -= 1; fw += 2; fh += 2; ax += 1; ay += 1; }
    if (!flip && sx === 1 && sy === 1) {
      ctx.drawImage(c, fx * S, fy * S, fw * S, fh * S, x - ax, y - ay, fw, fh);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip ? -sx : sx, sy);
      ctx.drawImage(c, fx * S, fy * S, fw * S, fh * S, -ax, -ay, fw, fh);
      ctx.restore();
    }
    return true;
  }

  // タイル用: 絵を (0,0)〜(16,16) にそのまま描く
  drawTile(ctx, name) {
    const fr = FRAMES[name];
    if (!fr || !this.ready) return false;
    const [sheet, fx, fy, fw, fh, ax, ay] = fr;
    const c = this.sheets[sheet];
    if (!c) return false;
    const S = this.S;
    ctx.drawImage(c, fx * S, fy * S, fw * S, fh * S, -ax, -ay, fw, fh);
    return true;
  }

  hasBg(theme) { return !!BGS[theme]; }
  getBg(theme) { return this.bg.get(theme) || null; }

  // 背景の層を用意する（使う場所の分だけ。ほかの場所の背景はメモリから外す）
  async prepareBg(themes, K) {
    const sheets = this.prepareSheets([...new Set(themes.map(t => STAGE_SHEETS[t]).filter(Boolean))]);
    const S = Math.max(1, Math.min(2.5, Math.ceil(K * 2) / 2));
    const drop = t => { for (const L of this.bg.get(t) || []) free(L.canvas); this.bg.delete(t); };
    if (S !== this.bgS) { for (const t of [...this.bg.keys()]) drop(t); this.bgS = S; }
    for (const t of [...this.bg.keys()]) if (!themes.includes(t)) drop(t);
    await Promise.all([sheets, ...themes.filter(t => BGS[t] && !this.bg.has(t)).map(t => this.loadBg(t, S))]);
  }

  loadBg(theme, S) {
    const key = theme + '@' + S;
    if (this.bgLoading.has(key)) return this.bgLoading.get(key);
    const p = (async () => {
      const layers = [];
      for (const L of BGS[theme]) {
        const text = await loadText(L.file);
        const t0 = performance.now();
        // 1まい失敗しても、ほかの層は使う
        try { layers.push({ canvas: await rasterize(text, L.w, L.h, S), f: L.f, w: L.w, h: L.h, y: L.y, dim: L.dim, fg: L.fg }); } catch (e) { console.warn('bg', L.file, e); }
        if (window.__artDebug) console.log('bg', L.file, (performance.now() - t0).toFixed(0));
      }
      if (this.bgS === S && !this.bg.has(theme)) this.bg.set(theme, layers);
      else for (const L of layers) free(L.canvas);
    })().catch(e => console.warn('bg', theme, e)).finally(() => this.bgLoading.delete(key));
    this.bgLoading.set(key, p);
    return p;
  }
}

export const Art = new ArtStore();
