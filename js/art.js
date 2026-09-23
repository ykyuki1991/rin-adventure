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
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
  }

  // 画面の倍率 K に合わせてシートを用意する（K が大きく変わったら作り直す）
  async init(K) {
    const S = Math.max(1, Math.min(5, Math.ceil(K * 2) / 2));
    if (this.ready && Math.abs(S - this.S) < 0.5) return;
    if (this._busy) return this._busy;
    this._busy = (async () => {
      const entries = Object.entries(SHEETS);
      await Promise.all(entries.map(async ([name, info]) => {
        if (!this.texts[name]) this.texts[name] = await loadText(info.file);
      }));
      const out = {};
      for (const [name, info] of entries) { const t0 = performance.now(); out[name] = await rasterize(this.texts[name], info.w, info.h, S); if (window.__artDebug) console.log('sheet', name, (performance.now() - t0).toFixed(0)); }
      this.sheets = out;
      this.S = S;
      this.ready = true;
      this.version++;
      this.bg.clear();
    })().catch(e => { console.warn('art', e); }).finally(() => { this._busy = null; });
    return this._busy;
  }

  has(name) { return this.ready && FRAMES[name] !== undefined; }
  frame(name) { return FRAMES[name]; }

  // 基準点が (x, y) にくるように描く（ctx はゲーム内の座標）
  draw(ctx, name, x, y, flip = false, sx = 1, sy = 1) {
    const fr = FRAMES[name];
    if (!fr || !this.ready) return false;
    const [sheet, fx, fy, fw, fh, ax, ay] = fr;
    const c = this.sheets[sheet];
    if (!c) return false;
    const S = this.S;
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
    const S = this.S;
    ctx.drawImage(this.sheets[sheet], fx * S, fy * S, fw * S, fh * S, -ax, -ay, fw, fh);
    return true;
  }

  hasBg(theme) { return !!BGS[theme]; }
  getBg(theme) { return this.bg.get(theme) || null; }

  // 背景の層を用意する（使う場所の分だけ。ほかの場所の背景はメモリから外す）
  async prepareBg(themes, K) {
    const S = Math.max(1, Math.min(3, Math.ceil(K * 2) / 2));
    if (S !== this.bgS) { this.bg.clear(); this.bgS = S; }
    for (const t of [...this.bg.keys()]) if (!themes.includes(t)) this.bg.delete(t);
    await Promise.all(themes.filter(t => BGS[t] && !this.bg.has(t)).map(t => this.loadBg(t, S)));
  }

  loadBg(theme, S) {
    const key = theme + '@' + S;
    if (this.bgLoading.has(key)) return this.bgLoading.get(key);
    const p = (async () => {
      const layers = [];
      for (const L of BGS[theme]) {
        const text = await loadText(L.file);
        const t0 = performance.now();
        layers.push({ canvas: await rasterize(text, L.w, L.h, S), f: L.f, w: L.w, h: L.h, y: L.y, dim: L.dim, fg: L.fg });
        if (window.__artDebug) console.log('bg', L.file, (performance.now() - t0).toFixed(0));
      }
      if (this.bgS === S) this.bg.set(theme, layers);
    })().catch(e => console.warn('bg', theme, e)).finally(() => this.bgLoading.delete(key));
    this.bgLoading.set(key, p);
    return p;
  }
}

export const Art = new ArtStore();
