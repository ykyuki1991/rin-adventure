// 神戸の場所ごとの色と背景
// 背景は何枚かの層（遠く→近く）を横にくり返して描き、奥ほどゆっくり動かす（f が小さいほど遠い）

const base = {
  groundStyle: 'grass',
  ground: '#c98b4f', groundDark: '#a2642f', top: '#5fc644', topDark: '#3c9a27', topLight: '#9be878',
  brick: '#d9773a', brickLight: '#f09a5c', brickDark: '#9c4a1f', mortar: '#f3cfa6',
  hard: '#c58b57', hardLight: '#ebbd8d', hardDark: '#7d5231',
  pipe: '#3ecf6e', pipeLight: '#a7f3c0', pipeDark: '#1e8c46',
  semi: '#c9894a', semiDark: '#8a5a2b', semiStyle: 'plank',
  water: ['#6fd3f5', '#2a9fd6', '#146aa6'],
  bldg: '#aab4c2', rock: '#8a867b', rockDark: '#5d5a52',
  night: false, bird: 'chick', spiky: 'spiky', slime: 'green', heart: 'heart'
};
const theme = o => ({ ...base, ...o });

export const THEMES = {
  // 八雲通・春日野道（下町・商店街）
  yakumo: theme({
    sky: ['#62bff2', '#d4f0ff'], skyStops: [[0, '#3c9de6'], [0.55, '#86cdf4'], [1, '#dcf2fc']], groundStyle: 'asphalt',
    ground: '#7f838c', groundDark: '#6a6e76', top: '#d3cbbd', topDark: '#a99f90', topLight: '#ece6da',
    hard: '#b9b4ab', hardLight: '#dedad2', hardDark: '#86817a', semiStyle: 'arcade', bird: 'crow'
  }),
  // 王子動物園
  zoo: theme({
    sky: ['#6cc4f5', '#e2f6ff'], ground: '#c79a62', groundDark: '#a67a45', top: '#6cc95a', topDark: '#44a236', topLight: '#a8ec8e',
    hard: '#c9a06a', hardLight: '#e8c592', hardDark: '#8c6a3f', water: ['#8fd9e8', '#4bb3c9', '#2b879c'], bird: 'chick'
  }),
  // 新神戸駅
  shinkobe: theme({
    sky: ['#6ab9ec', '#dff3ff'], groundStyle: 'tile',
    ground: '#8c9097', groundDark: '#767a82', top: '#c9ccd1', topDark: '#9fa3aa', topLight: '#eceef0',
    hard: '#b8bcc4', hardLight: '#dfe2e6', hardDark: '#848891', bird: 'chick'
  }),
  // 布引の滝（渓谷）
  falls: theme({
    sky: ['#7fcbe0', '#e0f4ea'], groundStyle: 'rock',
    ground: '#76705f', groundDark: '#5c574a', top: '#5a9e4b', topDark: '#3d7a33', topLight: '#8fce7a',
    hard: '#8a867b', hardLight: '#b2ada1', hardDark: '#5d5a52', semiStyle: 'plank', semi: '#a87444', semiDark: '#6e4a2a',
    water: ['#bfeaf5', '#5fb8d6', '#2f86a8'], bird: 'chick', slime: 'teal'
  }),
  // 布引ロープウェイ・ハーブ園
  ropeway: theme({
    sky: ['#58a8f2', '#e9f6ff'], groundStyle: 'flower', bodyStyle: 'stone',
    ground: '#b9ad97', groundDark: '#948771', top: '#72cc5c', topDark: '#4ea63d', topLight: '#b1ee98',
    hard: '#8d99a6', hardLight: '#bcc6d0', hardDark: '#5c6873', steel: '#9aa5b1', steelDark: '#5f6b77', bird: 'bee'
  }),
  // 北野・異人館
  kitano: theme({
    sky: ['#7cc3ee', '#fdecd6'], skyStops: [[0, '#3f9fe8'], [0.5, '#8dd0f6'], [1, '#e9f7fb']], groundStyle: 'stone',
    ground: '#b09c82', groundDark: '#8d7a62', top: '#d6c5aa', topDark: '#b5a283', topLight: '#efe3cf',
    hard: '#b5543a', hardLight: '#d77a5e', hardDark: '#7c3422', semiStyle: 'plank', semi: '#f3efe6', semiDark: '#b9b1a1', bird: 'pigeon'
  }),
  // 三宮
  sannomiya: theme({
    sky: ['#5fb0ef', '#e2f0ff'], groundStyle: 'tile',
    ground: '#8e939c', groundDark: '#777c85', top: '#c4b8a8', topDark: '#9d917f', topLight: '#e6dccd',
    hard: '#aab4c2', hardLight: '#d3dae3', hardDark: '#7b8593', semiStyle: 'arcade', bldg: '#b6c0cc', bird: 'pigeon'
  }),
  // 南京町
  nankin: theme({
    sky: ['#ffae66', '#ffe6c9'], groundStyle: 'brickpave',
    ground: '#9c5846', groundDark: '#7a4133', top: '#c97a5f', topDark: '#a45b43', topLight: '#e8a58b',
    hard: '#c62828', hardLight: '#ef5350', hardDark: '#8e1b1b', semiStyle: 'lantern', bird: 'pigeon', heart: 'nikuman'
  }),
  // メリケンパーク（夕方）
  meriken: theme({
    sky: ['#3b4a8c', '#f7a36b'], skyStops: [[0, '#4e418e'], [0.35, '#9a5a9e'], [0.62, '#e98a66'], [0.8, '#ffb46a'], [1, '#ffcf80']], groundStyle: 'concrete',
    ground: '#7d828c', groundDark: '#686d77', top: '#aeb3bb', topDark: '#8b9098', topLight: '#d3d7dd',
    hard: '#7d828c', hardLight: '#a8adb5', hardDark: '#565b64', semiStyle: 'plank', semi: '#a47551', semiDark: '#6d4c33',
    water: ['#6e8fd6', '#34549e', '#1d326b'], bird: 'gull', spiky: 'urchin'
  }),
  // ハーバーランド（夜）
  harborland: theme({
    sky: ['#0b1233', '#34407a'], skyStops: [[0, '#060a24'], [0.55, '#142057'], [0.8, '#2b3478'], [1, '#4a4a88']], groundStyle: 'brickpave',
    ground: '#6e4a3f', groundDark: '#553830', top: '#916356', topDark: '#744c41', topLight: '#b58576',
    hard: '#8a4a3a', hardLight: '#b06a55', hardDark: '#5c2f24', semiStyle: 'plank', semi: '#8f6a4d', semiDark: '#5c4230',
    water: ['#3d5aa8', '#1c2f66', '#0e1a3d'], night: true, bird: 'gull', spiky: 'urchin', slime: 'purple'
  }),
  // 須磨海岸
  suma: theme({
    sky: ['#3fa9ff', '#cdefff'], groundStyle: 'sand',
    ground: '#e8cf93', groundDark: '#d4b777', top: '#f6e6bb', topDark: '#e0c98f', topLight: '#fff6dc',
    hard: '#c89a62', hardLight: '#e6bf8c', hardDark: '#8c6a3f', semiStyle: 'parasol',
    water: ['#7fe3f0', '#29b6d6', '#1283b0'], bird: 'gull', spiky: 'urchin'
  }),
  // 舞子公園
  maiko: theme({
    sky: ['#58aaf0', '#e0f3ff'], ground: '#b08a5a', groundDark: '#8d6a40', top: '#6cbf55', topDark: '#469a37', topLight: '#a6e38d',
    water: ['#6cc8ec', '#2a8fcc', '#155f99'], bird: 'gull'
  }),
  // 明石海峡大橋
  bridge: theme({
    sky: ['#4c9fe6', '#e3f3ff'], groundStyle: 'girder',
    ground: '#a9bbb5', groundDark: '#7d918a', top: '#8a8f95', topDark: '#5f646a', topLight: '#b6bbc1',
    hard: '#c7d6d0', hardLight: '#e6efec', hardDark: '#8fa39c', semiStyle: 'steel',
    water: ['#5bb4e6', '#1f6fb0', '#0f4478'], bird: 'gull'
  }),
  // 六甲山・摩耶山（夜）
  rokko: theme({
    sky: ['#050a1f', '#1c2452'], groundStyle: 'grass',
    ground: '#4b3a30', groundDark: '#3a2c24', top: '#2f7a45', topDark: '#1f5a31', topLight: '#57a86a',
    hard: '#6b6a75', hardLight: '#8e8d99', hardDark: '#44434d', semi: '#7a5a3c', semiDark: '#4f3a26',
    rock: '#6b6a75', rockDark: '#44434d', night: true, bird: 'bat', slime: 'purple'
  }),
  // 掬星台（ボスの広場）
  kikusei: theme({
    sky: ['#040818', '#1a2150'], groundStyle: 'plaza',
    ground: '#5d5f70', groundDark: '#474957', top: '#8a8ca0', topDark: '#6a6c7e', topLight: '#b0b2c4',
    hard: '#5d5f70', hardLight: '#8a8ca0', hardDark: '#3d3f4c', semiStyle: 'plank', semi: '#8a8ca0', semiDark: '#5d5f70',
    night: true, bird: 'bat', slime: 'purple'
  })
};

// ===================== 背景の部品 =====================
const TAU = Math.PI * 2;
function ridge(ctx, w, baseY, amps, color, seed) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, 240);
  for (let x = 0; x <= w; x += 3) {
    let y = baseY;
    amps.forEach(([cyc, a], i) => { y -= Math.sin((x / w) * TAU * cyc + seed * (i + 1.3)) * a; });
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, 240); ctx.closePath(); ctx.fill();
}
// 端でつながるように2回描く
function wrap(w, x, width, fn) { fn(x); if (x + width > w) fn(x - w); if (x < 0) fn(x + w); }

function building(ctx, x, baseY, bw, bh, col, o) {
  ctx.fillStyle = col;
  ctx.fillRect(x, baseY - bh, bw, bh);
  if (o.win) {
    for (let yy = baseY - bh + 4; yy < baseY - 5; yy += 7) {
      for (let xx = x + 3; xx < x + bw - 4; xx += 6) {
        const lit = o.night ? (Math.sin(xx * 12.9898 + yy * 78.233) * 43758.5453 % 1 + 1) % 1 < 0.55 : true;
        ctx.fillStyle = o.night ? (lit ? o.winLit || '#ffd97a' : 'rgba(0,0,0,0)') : o.winColor || 'rgba(255,255,255,0.35)';
        ctx.fillRect(xx, yy, 3, 3.5);
      }
    }
  }
  if (o.roofline) { ctx.fillStyle = o.roofline; ctx.fillRect(x, baseY - bh, bw, 2); }
}
function skyline(ctx, w, baseY, rnd, o) {
  let x = 0;
  while (x < w) {
    const bw = o.minW + rnd() * (o.maxW - o.minW);
    const bh = o.minH + rnd() * (o.maxH - o.minH);
    const col = o.colors[Math.floor(rnd() * o.colors.length)];
    const bx = x;
    wrap(w, bx, bw, xx => building(ctx, xx, baseY, bw, bh, col, o));
    x += bw + (o.gap || 0) + rnd() * (o.gapR || 0);
  }
}
function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + 12 * s, y + 3 * s, 20 * s, 7 * s, 0, 0, TAU);
  ctx.moveTo(x + 9 * s, y); ctx.arc(x, y, 9 * s, 0, TAU);
  ctx.moveTo(x + 22 * s, y - 5 * s); ctx.arc(x + 11 * s, y - 5 * s, 11 * s, 0, TAU);
  ctx.moveTo(x + 33 * s, y); ctx.arc(x + 24 * s, y, 9 * s, 0, TAU);
  ctx.fill();
}
function clouds(ctx, w, rnd, n, y0, y1, color) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = y0 + rnd() * (y1 - y0), s = 0.6 + rnd() * 0.8;
    wrap(w, x - 10 * s, 44 * s, xx => cloud(ctx, xx + 10 * s, y, s, color));
  }
}
function tree(ctx, x, y, s, leaf, trunk = '#6d4a2d') {
  ctx.fillStyle = trunk; ctx.fillRect(x - 1.5 * s, y - 10 * s, 3 * s, 10 * s);
  ctx.fillStyle = leaf;
  ctx.beginPath(); ctx.arc(x, y - 14 * s, 8 * s, 0, TAU); ctx.arc(x - 6 * s, y - 9 * s, 6 * s, 0, TAU); ctx.arc(x + 6 * s, y - 9 * s, 6 * s, 0, TAU); ctx.fill();
}
function pine(ctx, x, y, s, leaf = '#2f6b3a') {
  ctx.fillStyle = '#6b4a2e';
  ctx.beginPath(); ctx.moveTo(x - 1.5 * s, y); ctx.quadraticCurveTo(x + 3 * s, y - 12 * s, x - 2 * s, y - 22 * s); ctx.lineTo(x + 1 * s, y - 22 * s); ctx.quadraticCurveTo(x + 6 * s, y - 12 * s, x + 1.5 * s, y); ctx.fill();
  ctx.fillStyle = leaf;
  for (const [dx, dy, rx] of [[-6, -22, 8], [5, -26, 7], [-1, -30, 6], [8, -18, 5]]) {
    ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, rx * s, 3 * s, 0, 0, TAU); ctx.fill();
  }
}
function sea(ctx, w, y, c1, c2) {
  const g = ctx.createLinearGradient(0, y, 0, 240);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, y, w, 240 - y);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = 4; x < w; x += 23) ctx.fillRect(x, y + 4 + (x % 5), 7, 0.8);
}
function stars(ctx, w, rnd, n, y1 = 150) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * y1, r = rnd() * 1.1 + 0.3;
    ctx.fillStyle = `rgba(255,255,${200 + Math.floor(rnd() * 55)},${0.5 + rnd() * 0.5})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}
function lights(ctx, w, y0, y1, rnd, n, colors = ['#ffd97a', '#ffb347', '#fff3c4', '#9fd8ff', '#ff8fa3']) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = y0 + Math.pow(rnd(), 0.7) * (y1 - y0);
    ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
    ctx.globalAlpha = 0.6 + rnd() * 0.4;
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;
}
export function portTower(ctx, x, baseY, s, lit = false) {
  // ポートタワー：赤いつづみ形
  const H = 110 * s, bw = 15 * s, ww = 5 * s, tw = 13 * s;
  const pts = [[-bw, 0], [-ww, -H * 0.5], [-tw, -H * 0.9], [tw, -H * 0.9], [ww, -H * 0.5], [bw, 0]];
  ctx.fillStyle = lit ? '#ff5e57' : '#e0443a';
  ctx.beginPath();
  ctx.moveTo(x - bw, baseY); ctx.quadraticCurveTo(x - ww * 0.6, baseY - H * 0.5, x - tw, baseY - H * 0.9);
  ctx.lineTo(x + tw, baseY - H * 0.9); ctx.quadraticCurveTo(x + ww * 0.6, baseY - H * 0.5, x + bw, baseY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = lit ? '#ffd0c9' : '#b3261e'; ctx.lineWidth = 0.8 * s;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * bw / 3.3, baseY); ctx.lineTo(x - i * tw / 3.3, baseY - H * 0.9); ctx.stroke();
  }
  ctx.fillStyle = lit ? '#fff3c4' : '#f4f1ea';
  ctx.fillRect(x - tw - 1 * s, baseY - H * 0.95, (tw + 1 * s) * 2, 6 * s);
  ctx.fillStyle = lit ? '#ff5e57' : '#e0443a';
  ctx.fillRect(x - 3 * s, baseY - H, 6 * s, 6 * s);
  ctx.fillRect(x - 0.6 * s, baseY - H - 8 * s, 1.2 * s, 8 * s);
  void pts;
}
function museum(ctx, x, baseY, s, lit) {
  // 海洋博物館：白い帆のような骨組み
  ctx.strokeStyle = lit ? '#e8f4ff' : '#ffffff'; ctx.lineWidth = 1.1 * s;
  for (let i = 0; i < 3; i++) {
    const ox = x + i * 26 * s;
    ctx.beginPath(); ctx.moveTo(ox, baseY); ctx.quadraticCurveTo(ox + 14 * s, baseY - 50 * s, ox + 40 * s, baseY - 36 * s); ctx.stroke();
    for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(ox + k * 6 * s, baseY); ctx.lineTo(ox + k * 7 * s + 6 * s, baseY - 20 * s - k * 4 * s); ctx.stroke(); }
  }
  ctx.fillStyle = lit ? '#9fb7d9' : '#dfe8f2'; ctx.fillRect(x - 4 * s, baseY - 8 * s, 96 * s, 8 * s);
}
export function ferris(ctx, cx, cy, r, color, lit, time = 0) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(cx - r * 0.5, cy + r * 1.2); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * 0.5, cy + r * 1.2); ctx.stroke();
  if (lit) {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      ctx.fillStyle = `hsl(${(i * 15 + time * 60) % 360},90%,65%)`;
      ctx.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2);
    }
  }
}
function akashi(ctx, x0, x1, deckY, towerH, color, lit) {
  // 明石海峡大橋（遠景）
  const t1 = x0 + (x1 - x0) * 0.3, t2 = x0 + (x1 - x0) * 0.7;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
  ctx.fillRect(x0, deckY, x1 - x0, 2);
  for (const t of [t1, t2]) { ctx.fillRect(t - 1.2, deckY - towerH, 2.4, towerH + 6); }
  ctx.beginPath();
  ctx.moveTo(x0, deckY - 2); ctx.quadraticCurveTo((x0 + t1) / 2, deckY - towerH * 0.3, t1, deckY - towerH);
  ctx.quadraticCurveTo((t1 + t2) / 2, deckY + towerH * 0.6, t2, deckY - towerH);
  ctx.quadraticCurveTo((t2 + x1) / 2, deckY - towerH * 0.3, x1, deckY - 2);
  ctx.stroke();
  if (lit) {
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, x = t1 + (t2 - t1) * u;
      const y = deckY - towerH + (towerH * 1.6) * 4 * u * (1 - u) * 0.62;
      ctx.fillStyle = `hsl(${(i * 9) % 360},80%,70%)`; ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
    }
  }
}
function island(ctx, x0, x1, y, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x0, y);
  for (let x = x0; x <= x1; x += 4) {
    const u = (x - x0) / (x1 - x0);
    ctx.lineTo(x, y - Math.sin(u * Math.PI) * h - Math.sin(u * 13) * 2);
  }
  ctx.lineTo(x1, y); ctx.closePath(); ctx.fill();
}
function anchorMark(ctx, x, y, s, color) {
  // 錨山の錨
  ctx.strokeStyle = color; ctx.lineWidth = 1.6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - 7 * s, 1.6 * s, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 5 * s); ctx.lineTo(x, y + 6 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 3.5 * s, y - 2 * s); ctx.lineTo(x + 3.5 * s, y - 2 * s); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y + 1 * s, 6 * s, 0.2, Math.PI - 0.2); ctx.stroke();
}
export function ijinkan(ctx, x, baseY, kind, s = 1) {
  const W = 56 * s, H = 40 * s;
  const wallC = kind === 'kazamidori' ? '#b5543a' : kind === 'uroko' ? '#8b9bb0' : '#b9dbb0';
  const roofC = kind === 'kazamidori' ? '#6b3b2e' : kind === 'uroko' ? '#4d5a6c' : '#4d8f6a';
  ctx.fillStyle = wallC; ctx.fillRect(x, baseY - H, W, H);
  ctx.fillStyle = roofC;
  ctx.beginPath(); ctx.moveTo(x - 4 * s, baseY - H); ctx.lineTo(x + W / 2, baseY - H - 18 * s); ctx.lineTo(x + W + 4 * s, baseY - H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 4; i++) { ctx.fillRect(x + 6 * s + i * 13 * s, baseY - H + 8 * s, 6 * s, 10 * s); ctx.fillRect(x + 6 * s + i * 13 * s, baseY - H + 24 * s, 6 * s, 10 * s); }
  if (kind === 'kazamidori') {
    ctx.fillStyle = roofC;
    ctx.beginPath(); ctx.moveTo(x + W / 2 - 6 * s, baseY - H - 12 * s); ctx.lineTo(x + W / 2, baseY - H - 40 * s); ctx.lineTo(x + W / 2 + 6 * s, baseY - H - 12 * s); ctx.fill();
    ctx.fillRect(x + W / 2 - 0.5 * s, baseY - H - 48 * s, 1 * s, 8 * s);
    ctx.beginPath(); ctx.moveTo(x + W / 2 - 4 * s, baseY - H - 46 * s); ctx.lineTo(x + W / 2 + 5 * s, baseY - H - 48 * s); ctx.lineTo(x + W / 2 + 2 * s, baseY - H - 43 * s); ctx.fill();
  }
}
function chinaHouse(ctx, x, baseY, s, lit) {
  const W = 50 * s, H = 34 * s;
  ctx.fillStyle = '#b3342e'; ctx.fillRect(x, baseY - H, W, H);
  ctx.fillStyle = '#2e7d5b';
  ctx.beginPath(); ctx.moveTo(x - 8 * s, baseY - H + 2 * s); ctx.quadraticCurveTo(x + W / 2, baseY - H - 6 * s, x + W + 8 * s, baseY - H + 2 * s);
  ctx.lineTo(x + W - 4 * s, baseY - H - 12 * s); ctx.lineTo(x + 4 * s, baseY - H - 12 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lit ? '#ffd97a' : '#ffe0a3';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 7 * s + i * 14 * s, baseY - H + 8 * s, 8 * s, 10 * s);
  ctx.fillStyle = '#ffd54f'; ctx.fillRect(x + 10 * s, baseY - H + 22 * s, 30 * s, 6 * s);
}
function lanternLine(ctx, x0, x1, y, sag, color = '#e53935') {
  ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); ctx.stroke();
  for (let i = 1; i < 8; i++) {
    const u = i / 8, x = x0 + (x1 - x0) * u, yy = y + sag * 4 * u * (1 - u);
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, yy + 4, 2.6, 3.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(x - 0.4, yy + 7, 0.8, 1.2);
  }
}
function train(ctx, x, y, cars, color, stripe, winLit) {
  for (let c = 0; c < cars; c++) {
    const cx = x + c * 42;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx, y - 14, 40, 14, 3) : ctx.rect(cx, y - 14, 40, 14); ctx.fill();
    ctx.fillStyle = winLit || '#bfe3f7';
    for (let k = 0; k < 5; k++) ctx.fillRect(cx + 3 + k * 7.5, y - 11, 5, 4.5);
    if (stripe) { ctx.fillStyle = stripe; ctx.fillRect(cx, y - 5, 40, 1.6); }
  }
}
// 背景の高架を走る電車（阪急マルーン）
function bgTrain(ctx, x, y, n) {
  for (let i = 0; i < n; i++) {
    const cx = x + i * 31;
    ctx.fillStyle = '#6e1a26'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx, y - 13, 30, 13, 2) : ctx.rect(cx, y - 13, 30, 13); ctx.fill();
    ctx.fillStyle = '#8a2433'; ctx.fillRect(cx + 1, y - 12, 28, 5);
    ctx.fillStyle = '#cfe6f2'; for (let k = 0; k < 4; k++) ctx.fillRect(cx + 3 + k * 7, y - 11, 4.5, 3.6);
    ctx.fillStyle = '#e9e1cf'; ctx.fillRect(cx, y - 13, 30, 1.4);
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(cx + 4, y - 1, 5, 1.5); ctx.fillRect(cx + 21, y - 1, 5, 1.5);
  }
  ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(x + 12, y - 13); ctx.lineTo(x + 15, y - 18); ctx.lineTo(x + 18, y - 13); ctx.stroke();
}
function ship(ctx, x, y, s, color = '#f4f1ea', lit = false) {
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath(); ctx.moveTo(x - 30 * s, y - 6 * s); ctx.lineTo(x + 34 * s, y - 6 * s); ctx.lineTo(x + 26 * s, y + 3 * s); ctx.lineTo(x - 26 * s, y + 3 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(x - 18 * s, y - 14 * s, 30 * s, 8 * s); ctx.fillRect(x - 10 * s, y - 20 * s, 16 * s, 6 * s);
  ctx.fillStyle = lit ? '#ffd97a' : '#5d8fb8';
  for (let i = 0; i < 6; i++) ctx.fillRect(x - 16 * s + i * 4.6 * s, y - 12 * s, 2.4 * s, 2.4 * s);
  ctx.fillStyle = '#e0443a'; ctx.fillRect(x - 2 * s, y - 25 * s, 4 * s, 5 * s);
}

// ===================== 場所ごとの背景 =====================
export const BG = {
  yakumo: {
    layers: [
      { f: 0.06, w: 512, seed: 11, paint(ctx, w, r) { clouds(ctx, w, r, 5, 20, 70, 'rgba(255,255,255,0.9)'); } },
      { f: 0.12, w: 512, seed: 12, paint(ctx, w) { ridge(ctx, w, 112, [[2, 14], [5, 7], [11, 3]], '#7fb89a', 0.4); ridge(ctx, w, 126, [[3, 8], [7, 4]], '#6aa888', 1.7); } },
      { f: 0.35, w: 512, seed: 13, paint(ctx, w, r) {
        skyline(ctx, w, 178, r, { minW: 22, maxW: 44, minH: 28, maxH: 70, colors: ['#e8e1d3', '#d9d2c3', '#cfd8e0', '#f0e4d0'], win: true, winColor: 'rgba(120,150,180,0.35)', gapR: 4 });
        // 高架
        ctx.fillStyle = '#b9b2a6'; ctx.fillRect(0, 150, w, 7);
        ctx.fillStyle = '#8f887c'; ctx.fillRect(0, 150, w, 1.5);
        for (let x = 10; x < w; x += 40) { ctx.fillStyle = '#a39c90'; ctx.fillRect(x, 157, 6, 28); }
      } },
      { f: 0.55, w: 384, seed: 14, paint(ctx, w, r) {
        // 電柱と電線
        for (let x = 30; x < w; x += 128) {
          ctx.fillStyle = '#8a7f73'; ctx.fillRect(x, 120, 3, 90);
          ctx.fillRect(x - 8, 128, 19, 2);
        }
        ctx.strokeStyle = 'rgba(60,60,60,0.55)'; ctx.lineWidth = 0.6;
        for (const dy of [0, 4]) { ctx.beginPath(); ctx.moveTo(0, 130 + dy); for (let x = 31; x <= w + 31; x += 128) ctx.quadraticCurveTo(x - 64, 140 + dy, x, 130 + dy); ctx.stroke(); }
      } }
    ],
    dyn(ctx, cam, vw, time) { // 高架を走る電車
      const P = vw + 400, x = ((time * 90 - cam * 0.35) % P + P) % P - 200;
      train(ctx, x, 150, 4, '#7a1f2b', null, null);
    },
    // SVGの背景のとき：3枚目（高架のある層）のすぐ後ろに電車を描く
    artDyn: { after: 3, draw(ctx, cam, vw, time) {
      const P = vw + 500, x = ((time * 70 - cam * 0.3) % P + P) % P - 250;
      bgTrain(ctx, x, 150, 5);
    } }
  },
  zoo: {
    layers: [
      { f: 0.06, w: 512, seed: 21, paint(ctx, w, r) { clouds(ctx, w, r, 5, 20, 70, 'rgba(255,255,255,0.9)'); } },
      { f: 0.14, w: 512, seed: 22, paint(ctx, w) { ridge(ctx, w, 110, [[2, 15], [5, 6], [9, 3]], '#86c0a2', 2.1); } },
      { f: 0.35, w: 512, seed: 23, paint(ctx, w, r) {
        ferris(ctx, 380, 120, 40, '#e57373', false);
        for (let i = 0; i < 10; i++) {
          const x = r() * w, y = 190 + r() * 20, s = 1 + r() * 0.5;
          wrap(w, x - 20, 40, xx => tree(ctx, xx + 20, y, s, r() < 0.6 ? '#f7b6cf' : '#f49ac1', '#7a5236'));
        }
      } },
      { f: 0.55, w: 256, seed: 24, paint(ctx, w) {
        ctx.fillStyle = '#8c6a3f';
        for (let x = 0; x < w; x += 16) ctx.fillRect(x, 198, 2, 20);
        ctx.fillRect(0, 200, w, 2); ctx.fillRect(0, 210, w, 2);
      } }
    ]
  },
  shinkobe: {
    layers: [
      { f: 0.06, w: 512, seed: 31, paint(ctx, w, r) { clouds(ctx, w, r, 4, 15, 50, 'rgba(255,255,255,0.9)'); } },
      { f: 0.2, w: 512, seed: 32, paint(ctx, w) { ridge(ctx, w, 80, [[2, 20], [4, 10], [9, 4]], '#5f9f7a', 0.9); } },
      { f: 0.4, w: 512, seed: 33, paint(ctx, w, r) {
        skyline(ctx, w, 185, r, { minW: 30, maxW: 60, minH: 30, maxH: 80, colors: ['#d8dde3', '#c7ced6', '#e4e6ea'], win: true, winColor: 'rgba(90,130,170,0.4)', gapR: 20 });
      } }
    ]
  },
  falls: {
    layers: [
      { f: 0.1, w: 512, seed: 41, paint(ctx, w) {
        ridge(ctx, w, 70, [[2, 26], [5, 12], [11, 5]], '#4f8a5e', 0.3);
        ridge(ctx, w, 110, [[3, 18], [7, 8]], '#3f7650', 2.2);
      } },
      { f: 0.3, w: 512, seed: 42, paint(ctx, w, r) {
        // 遠くの滝
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(300, 60, 6, 110);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(297, 60, 12, 110);
        for (let i = 0; i < 14; i++) { const x = r() * w; wrap(w, x - 15, 30, xx => tree(ctx, xx + 15, 200 + r() * 20, 1.2 + r() * 0.6, r() < 0.5 ? '#2f6b3a' : '#3d8048')); }
      } }
    ]
  },
  ropeway: {
    layers: [
      { f: 0.05, w: 512, seed: 51, paint(ctx, w, r) {
        // はるか下の神戸の街と海
        sea(ctx, w, 200, '#5aa7e0', '#2f7fc0');
        skyline(ctx, w, 200, r, { minW: 6, maxW: 14, minH: 6, maxH: 26, colors: ['#e4e8ee', '#d3dae3', '#f2efe8', '#c8d2de'], gapR: 2 });
        portTower(ctx, 260, 206, 0.28);
        ctx.fillStyle = '#c9d6e3'; ctx.fillRect(330, 204, 90, 5); // ポートアイランド
        clouds(ctx, w, r, 4, 20, 80, 'rgba(255,255,255,0.85)');
      } },
      { f: 0.25, w: 512, seed: 52, paint(ctx, w, r) {
        ridge(ctx, w, 214, [[2, 12], [5, 6]], '#4f9a5a', 1.2);
        for (let i = 0; i < 16; i++) { const x = r() * w; wrap(w, x - 12, 24, xx => tree(ctx, xx + 12, 232, 1 + r() * 0.5, '#3a8a47')); }
      } }
    ]
  },
  kitano: {
    layers: [
      { f: 0.06, w: 512, seed: 61, paint(ctx, w, r) { clouds(ctx, w, r, 4, 20, 60, 'rgba(255,255,255,0.85)'); } },
      { f: 0.12, w: 512, seed: 62, paint(ctx, w) { ridge(ctx, w, 96, [[2, 16], [5, 7]], '#7aae8c', 0.7); } },
      { f: 0.35, w: 640, seed: 63, paint(ctx, w, r) {
        ijinkan(ctx, 30, 200, 'kazamidori', 1); ijinkan(ctx, 250, 196, 'uroko', 0.9); ijinkan(ctx, 450, 200, 'moegi', 1);
        for (let i = 0; i < 8; i++) { const x = r() * w; wrap(w, x - 15, 30, xx => tree(ctx, xx + 15, 214, 1.2, '#4e9a5b')); }
      } }
    ]
  },
  sannomiya: {
    layers: [
      { f: 0.05, w: 512, seed: 71, paint(ctx, w, r) {
        ridge(ctx, w, 100, [[2, 14], [5, 6]], '#6fa68a', 1.1);
        anchorMark(ctx, 150, 88, 1.3, 'rgba(255,255,255,0.8)');
        clouds(ctx, w, r, 3, 20, 50, 'rgba(255,255,255,0.85)');
      } },
      { f: 0.25, w: 512, seed: 72, paint(ctx, w, r) {
        skyline(ctx, w, 190, r, { minW: 26, maxW: 52, minH: 50, maxH: 130, colors: ['#c6cfdb', '#b3bfcf', '#dfe4ea', '#9fb0c6'], win: true, winColor: 'rgba(80,120,170,0.45)', roofline: 'rgba(255,255,255,0.4)', gapR: 3 });
      } },
      { f: 0.45, w: 384, seed: 73, paint(ctx, w) {
        // ポートライナーの高架
        ctx.fillStyle = '#d7dbe0'; ctx.fillRect(0, 140, w, 6);
        for (let x = 20; x < w; x += 64) { ctx.fillStyle = '#c3c8cf'; ctx.fillRect(x, 146, 7, 60); }
      } }
    ],
    dyn(ctx, cam, vw, time) {
      const P = vw + 300, x = ((time * 70 - cam * 0.45) % P + P) % P - 150;
      train(ctx, x, 140, 3, '#f4f6f8', '#1f5fbf', null);
    }
  },
  nankin: {
    layers: [
      { f: 0.1, w: 512, seed: 81, paint(ctx, w, r) {
        skyline(ctx, w, 170, r, { minW: 30, maxW: 60, minH: 40, maxH: 90, colors: ['#e7c9a5', '#dcb58f', '#f0d9ba'], win: true, winColor: 'rgba(150,90,60,0.3)', gapR: 4 });
      } },
      { f: 0.35, w: 512, seed: 82, paint(ctx, w) {
        chinaHouse(ctx, 20, 205, 1.1); chinaHouse(ctx, 200, 205, 1); chinaHouse(ctx, 370, 205, 1.15);
        lanternLine(ctx, 0, 256, 60, 12); lanternLine(ctx, 256, 512, 60, 12);
      } }
    ]
  },
  meriken: {
    layers: [
      { f: 0.04, w: 512, seed: 91, paint(ctx, w, r) {
        const g = ctx.createRadialGradient(400, 150, 5, 400, 150, 90);
        g.addColorStop(0, 'rgba(255,220,150,0.95)'); g.addColorStop(1, 'rgba(255,190,120,0)');
        ctx.fillStyle = g; ctx.fillRect(300, 50, 200, 190);
        stars(ctx, w, r, 20, 60);
      } },
      { f: 0.12, w: 640, seed: 92, paint(ctx, w, r) {
        ridge(ctx, w, 120, [[2, 14], [5, 5]], '#3d4a7a', 0.5);
        skyline(ctx, w, 175, r, { minW: 14, maxW: 30, minH: 20, maxH: 55, colors: ['#4a4f7a', '#555a86', '#3f4470'], win: true, night: true, gapR: 3 });
        sea(ctx, w, 175, '#6e7fc0', '#2b3d7a');
        portTower(ctx, 140, 176, 0.9);
        museum(ctx, 250, 176, 0.9);
        ctx.fillStyle = '#e9edf2'; ctx.fillRect(420, 110, 40, 66); ctx.fillStyle = '#c7d0dc'; for (let y = 115; y < 170; y += 6) ctx.fillRect(424, y, 32, 2);
      } }
    ],
    dyn(ctx, cam, vw, time) {
      const P = vw + 500, x = ((time * 14 - cam * 0.2) % P + P) % P - 200;
      ship(ctx, x, 196, 0.7, '#f4f1ea', false);
    },
    artDyn: { after: 2, draw(ctx, cam, vw, time) {
      const P = vw + 600, x = ((time * 10 - cam * 0.12) % P + P) % P - 200;
      ship(ctx, x, 190, 0.8, '#f4eef0', true);
    } }
  },
  harborland: {
    layers: [
      { f: 0.04, w: 512, seed: 101, paint(ctx, w, r) { stars(ctx, w, r, 60, 120); } },
      { f: 0.12, w: 640, seed: 102, paint(ctx, w, r) {
        ridge(ctx, w, 115, [[2, 12], [5, 5]], '#151c3d', 0.9);
        lights(ctx, w, 100, 130, r, 90);
        skyline(ctx, w, 180, r, { minW: 16, maxW: 34, minH: 30, maxH: 80, colors: ['#1c2450', '#222b5c', '#171e45'], win: true, night: true, gapR: 3 });
        ferris(ctx, 420, 120, 42, '#6c7bb5', false);
      } },
      { f: 0.35, w: 512, seed: 103, paint(ctx, w) {
        for (const x of [20, 160, 300]) {
          ctx.fillStyle = '#5b2f28'; ctx.fillRect(x, 150, 110, 60);
          ctx.fillStyle = '#7a4034'; ctx.beginPath(); ctx.moveTo(x - 4, 150); ctx.lineTo(x + 55, 132); ctx.lineTo(x + 114, 150); ctx.fill();
          ctx.fillStyle = '#ffcf7a'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 8 + i * 17, 166, 8, 12);
        }
      } }
    ],
    dyn(ctx, cam, vw, time) {
      // 観覧車のイルミネーション
      const x = 420 - ((cam * 0.12) % 640);
      for (const xx of [x, x + 640, x - 640]) {
        if (xx < -60 || xx > vw + 60) continue;
        ferris(ctx, xx, 120, 42, 'rgba(0,0,0,0)', true, time);
      }
    }
  },
  suma: {
    layers: [
      { f: 0.05, w: 640, seed: 111, paint(ctx, w, r) {
        clouds(ctx, w, r, 4, 20, 60, 'rgba(255,255,255,0.9)');
        sea(ctx, w, 150, '#4fc3e8', '#2a93c8');
        island(ctx, 360, 640, 150, 18, '#7aa0b8'); // 淡路島
        akashi(ctx, 470, 640, 146, 22, '#e8eef2', false);
      } },
      { f: 0.2, w: 512, seed: 112, paint(ctx, w, r) {
        ridge(ctx, w, 150, [[1, 30], [3, 8]], '#4f8f5a', 2.6);
        for (let i = 0; i < 9; i++) { const x = r() * w; wrap(w, x - 20, 40, xx => pine(ctx, xx + 20, 200, 1.1 + r() * 0.4)); }
      } }
    ],
    dyn(ctx, cam, vw, time) {
      const P = vw + 500, x = ((time * 10 - cam * 0.05) % P + P) % P - 200;
      ship(ctx, x, 158, 0.45, '#ffffff', false);
    }
  },
  maiko: {
    layers: [
      { f: 0.05, w: 640, seed: 121, paint(ctx, w, r) {
        clouds(ctx, w, r, 4, 15, 50, 'rgba(255,255,255,0.9)');
        sea(ctx, w, 150, '#5fbde6', '#2b85c2');
        island(ctx, 250, 640, 150, 22, '#7aa0b8');
        akashi(ctx, 40, 600, 138, 58, '#eef3f5', false);
      } },
      { f: 0.25, w: 512, seed: 122, paint(ctx, w, r) {
        for (let i = 0; i < 9; i++) { const x = r() * w; wrap(w, x - 20, 40, xx => pine(ctx, xx + 20, 215, 1.3 + r() * 0.3)); }
      } }
    ]
  },
  bridge: {
    layers: [
      { f: 0.04, w: 640, seed: 131, paint(ctx, w, r) {
        clouds(ctx, w, r, 5, 15, 70, 'rgba(255,255,255,0.9)');
        ridge(ctx, w, 120, [[2, 10], [4, 5]], '#7fa6bf', 0.2); // 六甲の山なみ（遠く）
        sea(ctx, w, 150, '#4fa8dc', '#1d6aa8');
        island(ctx, 380, 640, 152, 26, '#6f97ad');
      } }
    ],
    dyn(ctx, cam, vw, time) {
      const P = vw + 600;
      const x1 = ((time * 16 - cam * 0.08) % P + P) % P - 250;
      const x2 = ((-time * 11 - cam * 0.08 + 300) % P + P) % P - 250;
      ship(ctx, x1, 200, 0.6, '#ffffff', false);
      ship(ctx, x2, 214, 0.8, '#f2d7a3', false);
    }
  },
  rokko: {
    layers: [
      { f: 0.03, w: 512, seed: 141, paint(ctx, w, r) { stars(ctx, w, r, 90, 150); } },
      { f: 0.1, w: 640, seed: 142, paint(ctx, w, r) {
        // 1000万ドルの夜景
        const g = ctx.createLinearGradient(0, 150, 0, 240);
        g.addColorStop(0, '#141a3d'); g.addColorStop(1, '#0b0f26');
        ctx.fillStyle = g; ctx.fillRect(0, 150, w, 90);
        lights(ctx, w, 158, 225, r, 700);
        ctx.fillStyle = '#081030'; ctx.fillRect(0, 214, w, 26); // 海
        lights(ctx, w, 214, 222, r, 40, ['#ffd97a', '#ff8fa3']);
        portTower(ctx, 320, 208, 0.22, true);
        akashi(ctx, 520, 640, 200, 10, '#3a4470', true);
      } },
      { f: 0.35, w: 512, seed: 143, paint(ctx, w, r) {
        ridge(ctx, w, 175, [[2, 16], [5, 6]], '#0d1428', 1.4);
        for (let i = 0; i < 12; i++) { const x = r() * w; wrap(w, x - 12, 24, xx => tree(ctx, xx + 12, 200, 1 + r() * 0.5, '#0a1224', '#0a1224')); }
      } }
    ]
  },
  kikusei: {
    layers: [
      { f: 0.03, w: 512, seed: 151, paint(ctx, w, r) { stars(ctx, w, r, 140, 170); } },
      { f: 0.08, w: 640, seed: 152, paint(ctx, w, r) {
        const g = ctx.createLinearGradient(0, 160, 0, 240);
        g.addColorStop(0, '#1a2250'); g.addColorStop(1, '#0b0f26');
        ctx.fillStyle = g; ctx.fillRect(0, 160, w, 80);
        lights(ctx, w, 166, 228, r, 900);
        ctx.fillStyle = '#060b24'; ctx.fillRect(0, 222, w, 18);
        portTower(ctx, 260, 216, 0.24, true);
        akashi(ctx, 500, 640, 206, 12, '#3a4470', true);
      } }
    ]
  }
};
