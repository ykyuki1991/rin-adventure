// SVG を組み立てるための小さな道具
// ここで作った絵は art/*.svg に書き出され、Penpot や Inkscape でそのまま開けます

export const f = n => (Math.round(n * 100) / 100).toString();

// グラデーションやクリップのIDを重ならないように管理する
export class Defs {
  constructor(prefix) { this.prefix = prefix; this.n = 0; this.items = []; }
  id() { return `${this.prefix}${(this.n++).toString(36)}`; }
  // 縦方向などの線形グラデーション（座標は 0〜1 の割合）
  lin(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    const id = this.id();
    this.items.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsSvg(stops)}</linearGradient>`);
    return `url(#${id})`;
  }
  // 絶対座標の線形グラデーション
  linU(stops, x1, y1, x2, y2) {
    const id = this.id();
    this.items.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}">${stopsSvg(stops)}</linearGradient>`);
    return `url(#${id})`;
  }
  rad(stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) {
    const id = this.id();
    const fxy = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
    this.items.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fxy}>${stopsSvg(stops)}</radialGradient>`);
    return `url(#${id})`;
  }
  radU(stops, cx, cy, r) {
    const id = this.id();
    this.items.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}">${stopsSvg(stops)}</radialGradient>`);
    return `url(#${id})`;
  }
  // 形で切り抜く（影を形の内側だけに描くときに使う）
  clip(shapeSvg) {
    const id = this.id();
    this.items.push(`<clipPath id="${id}">${shapeSvg}</clipPath>`);
    return `url(#${id})`;
  }
  svg() { return this.items.length ? `<defs>${this.items.join('')}</defs>` : ''; }
}

function stopsSvg(stops) {
  return stops.map(s => {
    const [o, c, a] = s;
    return `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`;
  }).join('');
}

const attrs = o => Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => `${k === 'textLength' || k === 'lengthAdjust' ? k : k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${typeof v === 'number' ? f(v) : v}"`).join(' ');

export const rect = (x, y, w, h, fill, o = {}) => `<rect ${attrs({ x, y, width: w, height: h, fill, ...o })}/>`;
export const rrect = (x, y, w, h, r, fill, o = {}) => `<rect ${attrs({ x, y, width: w, height: h, rx: r, ry: r, fill, ...o })}/>`;
export const circ = (cx, cy, r, fill, o = {}) => `<circle ${attrs({ cx, cy, r, fill, ...o })}/>`;
export const ell = (cx, cy, rx, ry, fill, o = {}) => {
  const rot = o.rot; const oo = { ...o }; delete oo.rot;
  return `<ellipse ${attrs({ cx, cy, rx, ry, fill, ...oo })}${rot ? ` transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"` : ''}/>`;
};
export const path = (d, fill, o = {}) => `<path ${attrs({ d, fill, ...o })}/>`;
export const line = (x1, y1, x2, y2, stroke, w, o = {}) => `<line ${attrs({ x1, y1, x2, y2, stroke, strokeWidth: w, strokeLinecap: 'round', ...o })}/>`;
export const poly = (pts, fill, o = {}) => `<polygon ${attrs({ points: pts.map(p => p.map(f).join(',')).join(' '), fill, ...o })}/>`;
export const pline = (pts, stroke, w, o = {}) => `<polyline ${attrs({ points: pts.map(p => p.map(f).join(',')).join(' '), fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', ...o })}/>`;
export const g = (content, o = {}) => `<g ${attrs(o)}>${Array.isArray(content) ? content.join('') : content}</g>`;
export const tr = (x, y, content, s = 1, rot = 0) => `<g transform="translate(${f(x)} ${f(y)})${rot ? ` rotate(${f(rot)})` : ''}${s !== 1 ? ` scale(${Array.isArray(s) ? s.map(f).join(' ') : f(s)})` : ''}">${Array.isArray(content) ? content.join('') : content}</g>`;
export const text = (x, y, str, size, fill, o = {}) => `<text ${attrs({ x, y, fontSize: size, fill, fontFamily: 'Hiragino Maru Gothic ProN, Arial Rounded MT Bold, sans-serif', fontWeight: 'bold', textAnchor: 'middle', ...o })}>${str}</text>`;

// 決まった乱数（毎回同じ絵になる）
export function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 色を明るく・暗くする
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; gg += (255 - gg) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; gg *= 1 + amt; b *= 1 + amt; }
  const h = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(gg) + h(b);
}
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + [16, 8, 0].map(s => c(s).toString(16).padStart(2, '0')).join('');
}

// 角の丸い多角形のパス（なめらかな石や建物のかどに使う）
export function roundPoly(pts, r) {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr];
    const b = [p1[0] + v2[0] / l2 * rr, p1[1] + v2[1] / l2 * rr];
    d += (i === 0 ? 'M' : 'L') + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(p1[0]) + ' ' + f(p1[1]) + ' ' + f(b[0]) + ' ' + f(b[1]) + ' ';
  }
  return d + 'Z';
}
