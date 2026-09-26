// アプリのアイコンと共有用画像（LINE などで出る画像）を作る（開発用・playwright が必要）
// 使い方: node tools/icons/make-icons.cjs <作業フォルダ> <出力フォルダ>
//   作業フォルダには hires/rinP_jump.png（HIRES=<作業フォルダ>/hires node tools/art/rin/extract.cjs で作る）と
//   fonts/MPLUSRounded1c-ExtraBold.ttf（Google Fonts の M PLUS Rounded 1c）を置く
//   出力: icon-1024.png（ふつうのアイコン）/ mask-1024.png（Android の丸などに切られても大丈夫な版）/ og.png（1200×630）
//   そのあと 180・192・512 に縮めて icons/ に入れる。og.png は icons/og2.jpg に（LINE は画像を長く覚えているので、作り直したら名前を変える）
const { chromium } = require('playwright');
const fs = require('fs');
const SP = process.argv[2], OUT = process.argv[3];
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const RIN = b64(SP + '/hires/rinP_jump.png');
const FONT = 'data:font/ttf;base64,' + fs.readFileSync(SP + '/fonts/MPLUSRounded1c-ExtraBold.ttf').toString('base64');

// 神戸の景色（viewBox 0 0 1000 1000 の下のほう）
const scene = (W, H, TX, og) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;inset:0">
 <defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb4f2"/><stop offset="0.62" stop-color="#9fdcfa"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>
  <radialGradient id="sun" cx="0.8" cy="0.2" r="0.5"><stop offset="0" stop-color="#fff8d8" stop-opacity="0.95"/><stop offset="1" stop-color="#fff8d8" stop-opacity="0"/></radialGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b9e8"/><stop offset="1" stop-color="#2a86c8"/></linearGradient>
  <linearGradient id="pt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6b5b"/><stop offset="0.5" stop-color="#e63b30"/><stop offset="1" stop-color="#b8261f"/></linearGradient>
 </defs>
 <rect width="${W}" height="${H}" fill="url(#sky)"/>
 <rect width="${W}" height="${H}" fill="url(#sun)"/>
 ${cloud(W * 0.14, H * 0.16, W / 1000)}${cloud(W * 0.62, H * 0.1, W / 1300)}
 <!-- 六甲の山なみ -->
 <path d="M0 ${H * 0.66} C ${W * 0.12} ${H * 0.55} ${W * 0.25} ${H * 0.52} ${W * 0.38} ${H * 0.58} S ${W * 0.62} ${H * 0.5} ${W * 0.78} ${H * 0.56} S ${W * 0.95} ${H * 0.55} ${W} ${H * 0.6} L ${W} ${H} L 0 ${H} Z" fill="#8cc9a4"/>
 <path d="M0 ${H * 0.7} C ${W * 0.2} ${H * 0.63} ${W * 0.35} ${H * 0.66} ${W * 0.5} ${H * 0.64} S ${W * 0.8} ${H * 0.66} ${W} ${H * 0.64} L ${W} ${H} L 0 ${H} Z" fill="#6fb88e"/>
 <!-- 街 -->
 ${city(W, H, TX, og)}
 <!-- 海 -->
 <rect y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="url(#sea)"/>
 ${[0.83, 0.87, 0.92, 0.96].map((y, i) => `<path d="M${(i * 137) % 200 - 100} ${H * y} ${Array.from({ length: 14 }, (_, k) => `q ${W / 28} ${-H * 0.008} ${W / 14} 0`).join(' ')}" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="${W / 220}" stroke-linecap="round"/>`).join('')}
</svg>`;
function cloud(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff"><ellipse cx="0" cy="20" rx="110" ry="34"/><circle cx="-40" cy="0" r="46"/><circle cx="20" cy="-18" r="58"/><circle cx="72" cy="8" r="40"/></g>`;
}
function city(W, H, TX, og) {
  const base = H * 0.8, out = [];
  // ビル
  let x = 0, i = 0;
  const hs = [0.1, 0.16, 0.12, 0.2, 0.09, 0.14, 0.11, 0.18, 0.08, 0.13, 0.1, 0.15];
  while (x < W) { const w = W * (0.045 + (i % 3) * 0.012), h = H * hs[i % hs.length] * 0.9; out.push(`<rect x="${x}" y="${base - h}" width="${w - W * 0.006}" height="${h}" rx="${W * 0.004}" fill="${i % 2 ? '#f4f8fb' : '#dfe9f1'}"/>`); for (let yy = base - h + H * 0.02; yy < base - H * 0.015; yy += H * 0.03) out.push(`<rect x="${x + W * 0.008}" y="${yy}" width="${w - W * 0.022}" height="${H * 0.008}" fill="#a9c3d8" opacity="0.8"/>`); x += w; i++; }
  // 海洋博物館（白い帆の屋根）
  const mx = W * (og ? 0.04 : 0.46), mw = W * (og ? 0.22 : 0.24);
  out.push(`<path d="M${mx} ${base} L${mx} ${base - H * 0.05} Q ${mx + mw * 0.3} ${base - H * 0.08} ${mx + mw * 0.45} ${base - H * 0.17} Q ${mx + mw * 0.62} ${base - H * 0.07} ${mx + mw} ${base - H * 0.12} Q ${mx + mw * 0.85} ${base - H * 0.05} ${mx + mw} ${base - H * 0.04} L ${mx + mw} ${base} Z" fill="#ffffff" stroke="#b8d2e4" stroke-width="${W * 0.003}"/>`);
  for (let k = 1; k < 9; k++) out.push(`<path d="M${mx + mw * k / 9} ${base - H * 0.045} L ${mx + mw * 0.45 + (k - 4.5) * W * 0.006} ${base - H * 0.16 + Math.abs(k - 4.5) * H * 0.012}" stroke="#c5d9e8" stroke-width="${W * 0.002}"/>`);
  // ポートタワー（上と下が広がった つづみ形・赤い格子）
  const tx = W * TX, th = H * 0.46, tw = W * 0.07, top = base - th, neck = base - th * 0.42;
  const shape = `M${tx - tw} ${base} C ${tx - tw * 0.3} ${base - th * 0.2} ${tx - tw * 0.22} ${neck + th * 0.05} ${tx - tw * 0.22} ${neck} C ${tx - tw * 0.22} ${neck - th * 0.2} ${tx - tw * 0.55} ${top + th * 0.14} ${tx - tw * 0.8} ${top + th * 0.08} L ${tx + tw * 0.8} ${top + th * 0.08} C ${tx + tw * 0.55} ${top + th * 0.14} ${tx + tw * 0.22} ${neck - th * 0.2} ${tx + tw * 0.22} ${neck} C ${tx + tw * 0.22} ${neck + th * 0.05} ${tx + tw * 0.3} ${base - th * 0.2} ${tx + tw} ${base} Z`;
  out.push(`<clipPath id="ptc"><path d="${shape}"/></clipPath><path d="${shape}" fill="url(#pt)"/>`);
  const lat = [];
  for (let k = -14; k <= 14; k++) { const x0 = tx + k * tw * 0.22; lat.push(`M${x0 - th * 0.35} ${base} L ${x0 + th * 0.35} ${top}`, `M${x0 + th * 0.35} ${base} L ${x0 - th * 0.35} ${top}`); }
  out.push(`<g clip-path="url(#ptc)"><path d="${lat.join(' ')}" stroke="#ffb3a6" stroke-opacity="0.55" stroke-width="${W * 0.0025}"/></g>`);
  out.push(`<rect x="${tx - tw * 0.95}" y="${top + th * 0.035}" width="${tw * 1.9}" height="${th * 0.065}" rx="${W * 0.006}" fill="#fbfbf6" stroke="#d9d4c8" stroke-width="${W * 0.002}"/>`);
  out.push(`<rect x="${tx - tw * 0.7}" y="${top}" width="${tw * 1.4}" height="${th * 0.045}" rx="${W * 0.005}" fill="#e63b30"/>`);
  out.push(`<rect x="${tx - W * 0.004}" y="${top - th * 0.09}" width="${W * 0.008}" height="${th * 0.1}" fill="#e63b30"/>`);
  // 岸壁
  out.push(`<rect y="${base - H * 0.004}" width="${W}" height="${H * 0.014}" fill="#d9cdb6"/>`);
  return out.join('');
}

const page = (mode, W, H) => `<!doctype html><html><head><style>
@font-face { font-family: R; src: url(${FONT}); }
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
.wrap{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.rin{position:absolute;filter: url(#stk) drop-shadow(0 ${W * 0.01}px 0 rgba(20,40,80,0.25))}
.outline{position:absolute}
.coin{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a6 0 12%,#ffd23f 13% 58%,#e5a100 59% 100%);box-shadow:inset 0 0 0 ${W*0.008}px #c98800, 0 ${W*0.008}px 0 rgba(0,0,0,0.15)}
.coin:after{content:'';position:absolute;left:44%;top:24%;width:12%;height:52%;border-radius:40%;background:#d99a00}
.logo{position:absolute;font-family:R;font-weight:800;white-space:nowrap;letter-spacing:0.02em}
.logo span{display:inline-block;-webkit-text-stroke: ${H*0.018}px #ffffff;paint-order: stroke fill;text-shadow:0 ${H*0.012}px 0 #1d3557, 0 ${H*0.02}px ${H*0.02}px rgba(0,0,0,0.25)}
.star{position:absolute;color:#ffd23f;-webkit-text-stroke:0.06em #ffffff;paint-order:stroke fill;text-shadow:0 0.05em 0 rgba(200,120,0,0.6);line-height:1}
.sub{position:absolute;font-family:R;font-weight:800;color:#1d3557;background:rgba(255,255,255,0.92);border-radius:999px;white-space:nowrap}
</style></head><body><svg width="0" height="0" style="position:absolute"><filter id="stk"><feMorphology in="SourceAlpha" operator="dilate" radius="${Math.round(W * 0.007)}" result="d"/><feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><div class="wrap">${scene(W, H, mode === 'og' ? 0.88 : 0.8, mode === 'og')}
${mode === 'og' ? `
  <div class="logo" style="left:50%;transform:translateX(-50%);top:${H*0.05}px;font-size:${H*0.135}px">${[['り','#ff5a5f'],['ん','#ffb703'],['の','#8ac926'],['大','#4cc9f0'],['冒','#9b5de5'],['険','#ff70a6']].map(([c,col],i)=>`<span style="color:${col};transform:translateY(${i%2?-H*0.01:H*0.01}px) rotate(${i%2?3:-3}deg)">${c}</span>`).join('')}</div>
  <img class="rin" src="${RIN}" style="left:50%;transform:translateX(-46%);top:${H*0.3}px;height:${H*0.68}px">
  <div class="star" style="left:${W*0.3}px;top:${H*0.36}px;font-size:${H*0.1}px">★</div>
  <div class="star" style="left:${W*0.64}px;top:${H*0.33}px;font-size:${H*0.07}px">★</div>
` : `
  <div class="star" style="left:${W*0.7}px;top:${H*0.1}px;font-size:${W*0.13}px">★</div>
  <div class="star" style="left:${W*0.86}px;top:${H*0.22}px;font-size:${W*0.07}px">★</div>
  <img class="rin" src="${RIN}" style="left:${mode==='mask'?W*0.14:W*0.07}px;top:${mode==='mask'?H*0.17:H*0.1}px;height:${mode==='mask'?H*0.68:H*0.8}px">
`}
</div></body></html>`;

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const jobs = [['icon', 1024, 1024, 'icon-1024.png'], ['mask', 1024, 1024, 'mask-1024.png'], ['og', 1200, 630, 'og.png']];
  for (const [mode, W, H, file] of jobs) {
    await p.setViewportSize({ width: W, height: H });
    await p.setContent(page(mode, W, H)); await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + '/' + file });
  }
  await b.close();
})();
