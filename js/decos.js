// 飾り（家・看板・建物）、動く足場の見た目、滝や風の見た目、ゴール
import { TILE } from './config.js';
import { rr, starPath } from './sprites.js';
import { portTower, ferris } from './themes.js';
import { zoneActive, windDir } from './zones.js';
import { Art } from './art.js';

const TAU = Math.PI * 2;
const circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
const FONT = '"Hiragino Maru Gothic ProN", "Hiragino Sans", "Arial Rounded MT Bold", sans-serif';

function text(ctx, str, x, y, size, color, stroke, weight = 'bold') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = size * 0.28; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function tree(ctx, x, y, s, leaf, trunk = '#6d4a2d') {
  ctx.fillStyle = trunk; ctx.fillRect(x - 1.5 * s, y - 10 * s, 3 * s, 10 * s);
  ctx.fillStyle = leaf;
  ctx.beginPath(); ctx.arc(x, y - 15 * s, 8 * s, 0, TAU); ctx.arc(x - 6 * s, y - 10 * s, 6 * s, 0, TAU); ctx.arc(x + 6 * s, y - 10 * s, 6 * s, 0, TAU); ctx.fill();
}

// ===================== 飾り =====================
// はじめての人向けのヒント（ふきだし）。(x, y) がふきだしのしっぽの先
function drawHint(ctx, d, time) {
  const lines = String(d.text).split('\n');
  ctx.font = `bold 7px ${FONT}`;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 12, h = lines.length * 9 + 7;
  const bob = Math.sin(time * 2.2 + d.x * 0.01) * 1.2;
  const cx = d.x + 8, by = d.y - 5 + bob, bx = cx - w / 2, top = by - h;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; rr(ctx, bx + 1, top + 1.5, w, h, 5); ctx.fill();
  ctx.fillStyle = '#fffdf4'; rr(ctx, bx, top, w, h, 5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 3.5, by - 0.5); ctx.lineTo(cx, by + 5); ctx.lineTo(cx + 3.5, by - 0.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 1; rr(ctx, bx, top, w, h, 5); ctx.stroke();
  lines.forEach((l, i) => text(ctx, l, cx, top + 7.5 + i * 9, 7, '#3a2e2a'));
}

export function drawDeco(ctx, d, theme, time, night) {
  const x = d.x, y = d.y; // y はその飾りの足元（地面）の高さ
  if (d.type === 'hint') return drawHint(ctx, d, time);
  if (Art.ready && drawDecoArt(ctx, d, x, y, time, night)) return;
  switch (d.type) {
    case 'sign': return drawSign(ctx, d, night);
    case 'house': return drawHouse(ctx, x, y, d.text || 'りんの家', night);
    case 'shops': return drawShops(ctx, x, y, (d.w || 10) * TILE, d.names || ['やおや', 'パン', 'くすり', 'ほんや', 'おにく', 'さかな'], night);
    case 'viaduct': return drawViaduct(ctx, x, y, (d.w || 10) * TILE);
    case 'tree': return tree(ctx, x + 8, y, d.s || 1.2, d.leaf || (night ? '#1d3a2a' : '#4e9a5b'));
    case 'sakura': return tree(ctx, x + 8, y, d.s || 1.5, '#f7b6cf', '#7a5236');
    case 'pine': return drawPine(ctx, x + 8, y, d.s || 1.3);
    case 'zooGate': return drawZooGate(ctx, x, y);
    case 'elephant': return drawElephant(ctx, x, y, time);
    case 'flamingo': return drawFlamingo(ctx, x + 8, y, time + x);
    case 'wheel': return drawWheelFrame(ctx, d, night, time);
    case 'shinkansen': return drawShinkansen(ctx, x, y, d, time);
    case 'station': return drawStationRoof(ctx, x, y, (d.w || 6) * TILE, d.color || '#6b7b8c');
    case 'cable': return drawCable(ctx, d);
    case 'ropewayStation': return drawRopewayStation(ctx, x, y, d.text || '');
    case 'weathercock': return drawWeathercock(ctx, x + 8, y, time, d);
    case 'gate': return drawChinaGate(ctx, x, y, (d.w || 8) * TILE, d.text || '長安門');
    case 'lanterns': return drawLanternLine(ctx, x, y, (d.w || 8) * TILE);
    case 'stall': return drawStall(ctx, x, y, d.text || '豚まん');
    case 'portTower': return portTower(ctx, x, y, d.s || 1.6, night);
    case 'bekobe': return drawBeKobe(ctx, x, y);
    case 'crane': return drawCrane(ctx, x, y, time);
    case 'hut': return drawHut(ctx, x, y, d.text || '海の家');
    case 'pole': return drawPole(ctx, x + 8, y, (d.h || 3) * TILE);
    case 'parasol': return drawParasol(ctx, x, y, d.base * TILE, d.color || 0);
    case 'sandcastle': return drawSandcastle(ctx, x, y);
    case 'ijokaku': return drawIjokaku(ctx, x, y);
    case 'hangers': return drawHangers(ctx, d);
    case 'towerTop': return drawTowerTop(ctx, x, y);
    case 'track': return drawTrack(ctx, d);
    case 'sheep': return drawSheep(ctx, x + 8, y, time + x * 0.1);
    case 'monument': return drawStarMonument(ctx, x + 8, y, time);
    case 'lamp': return drawLamp(ctx, x + 8, y, night);
    case 'bench': return drawBench(ctx, x, y);
  }
}

// SVGの絵がある飾り（なければ false を返して、これまでの絵で描く）
function drawDecoArt(ctx, d, x, y, time, night) {
  switch (d.type) {
    case 'house':
      if (!Art.draw(ctx, 'deco/rinhouse', x, y)) return false;
      text(ctx, d.text || 'りんの家', x + 18, y - 14.8, 4.4, '#4a3a2a');
      return true;
    case 'tree': {
      const k = (d.s || 1.2) / 1.2;
      return Art.draw(ctx, night ? 'deco/treeN' : 'deco/tree', x + 8, y, false, k, k);
    }
    case 'bench': return Art.draw(ctx, 'deco/bench', x, y);
    case 'lamp':
      if (night) {
        const g = ctx.createRadialGradient(x + 8, y - 32, 1, x + 8, y - 32, 22);
        g.addColorStop(0, 'rgba(255,225,150,0.75)'); g.addColorStop(1, 'rgba(255,225,150,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 14, y - 54, 44, 44);
      }
      return Art.draw(ctx, 'deco/lamp', x + 8, y);
    case 'shops': {
      if (!Art.has('deco/shop0')) return false;
      const w = (d.w || 10) * TILE, names = d.names || ['やおや', 'パン', 'くすり', 'ほんや', 'おにく', 'さかな'];
      for (let i = 0; i * 48 < w; i++) {
        const sx = x + i * 48;
        Art.draw(ctx, 'deco/shop' + (i % 6), sx, y);
        text(ctx, names[i % names.length], sx + 23.5, y - 41.8, 6, '#ffffff', 'rgba(0,0,0,0.3)');
      }
      return true;
    }
    case 'station': {
      if (!Art.has('deco/stationRoof')) return false;
      const w = (d.w || 6) * TILE;
      for (let px = x; px < x + w - 4; px += 48) Art.draw(ctx, 'deco/stationRoof', px, y);
      return true;
    }
    case 'viaduct': {
      if (!Art.has('deco/viaduct')) return false;
      const w = (d.w || 10) * TILE;
      for (let px = x; px < x + w; px += 64) {
        if (px + 64 > x + w) {
          ctx.save(); ctx.beginPath(); ctx.rect(px, y - 10, x + w - px, 120); ctx.clip();
          Art.draw(ctx, 'deco/viaduct', px, y); ctx.restore();
        } else Art.draw(ctx, 'deco/viaduct', px, y);
      }
      return true;
    }
    case 'weathercock': return Art.draw(ctx, 'deco/weathercock', x + 8, y, (d.dir || 1) < 0);
    case 'bekobe': return Art.draw(ctx, 'deco/bekobe', x, y);
    case 'portTower': {
      const s = d.s || 1.6;
      if (night) {
        const g = ctx.createRadialGradient(x, y - 100 * s, 5, x, y - 100 * s, 60 * s);
        g.addColorStop(0, 'rgba(255,120,100,0.25)'); g.addColorStop(1, 'rgba(255,120,100,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 60 * s, y - 160 * s, 120 * s, 120 * s);
      }
      return Art.draw(ctx, 'deco/porttower', x, y, false, s, s);
    }
    case 'beam': {
      if (!Art.has('deco/beam')) return false;
      for (let i = 0; i < (d.w || 1); i++) Art.draw(ctx, 'deco/beam', x + i * TILE, y);
      return true;
    }
    // ---- 動物園 ----
    case 'zooGate':
      if (!Art.draw(ctx, 'deco/zooGate', x, y)) return false;
      text(ctx, '王子動物園', x + 56, y - 63, 11, '#2d6a1f');
      text(ctx, 'おうじどうぶつえん', x + 56, y - 55.2, 4.4, '#2d6a1f', null, 'normal');
      return true;
    case 'sakura': { const k = (d.s || 1.5) / 1.2; return Art.draw(ctx, 'deco/sakura', x + 8, y, false, k, k); }
    case 'elephant': return Art.draw(ctx, 'deco/elephant', x, y);
    case 'flamingo': return Art.draw(ctx, 'deco/flamingo', x + 8, y, x % 32 < 16);
    // ---- 新神戸・ロープウェイ ----
    case 'shinkansen': {
      if (!Art.has('deco/shinNose')) return false;
      const len = (d.w || 12) * TILE;
      for (let px = x; px < x + len - 80; px += 64) Art.draw(ctx, 'deco/shinCar', px, y);
      Art.draw(ctx, 'deco/shinNose', x + len - 80, y);
      return true;
    }
    case 'ropewayStation':
      if (!Art.draw(ctx, 'deco/ropewayStation', x, y)) return false;
      if (d.text) text(ctx, d.text, x + 48, y - 79.5, 7.5, '#1f4f7a');
      return true;
    case 'cable': {
      const x1 = d.x + 8, y1 = d.y - 34, x2 = d.x2 * TILE + 8, y2 = d.y2 * TILE - 34;
      ctx.lineCap = 'round';
      for (const [dy, c, w] of [[0, '#2f3640', 1.4], [-3.5, '#2f3640', 1.2], [-0.4, '#8a95a5', 0.5]]) {
        ctx.strokeStyle = night ? '#6b7482' : c; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x1, y1 + dy); ctx.lineTo(x2, y2 + dy); ctx.stroke();
      }
      return true;
    }
    // ---- 南京町 ----
    case 'gate': {
      if (!Art.has('deco/gateRoof')) return false;
      const w = (d.w || 8) * TILE, k = w / 128;
      for (const px of [x + 6, x + w - 14]) {
        const g = ctx.createLinearGradient(px, 0, px + 8, 0);
        g.addColorStop(0, '#ef5350'); g.addColorStop(0.5, '#c62828'); g.addColorStop(1, '#8e1b1b');
        ctx.fillStyle = g; ctx.fillRect(px, y + 30, 8, 240);
        ctx.fillStyle = '#ffd54f'; ctx.fillRect(px - 1, y + 34, 10, 2);
      }
      Art.draw(ctx, 'deco/gateRoof', x, y, false, k, 1);
      text(ctx, d.text || '長安門', x + w / 2, y + 22.6, 8.5, '#b71c1c');
      return true;
    }
    case 'lanterns': {
      if (!Art.has('deco/lantern')) return false;
      const w = (d.w || 8) * TILE;
      ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + 16, x + w, y); ctx.stroke();
      const n = Math.max(3, Math.floor(w / 18));
      for (let i = 1; i < n; i++) {
        const u = i / n, lx = x + w * u, ly = y + 8 * 4 * u * (1 - u);
        if (night) {
          const g = ctx.createRadialGradient(lx, ly + 6, 1, lx, ly + 6, 10);
          g.addColorStop(0, 'rgba(255,150,90,0.45)'); g.addColorStop(1, 'rgba(255,150,90,0)');
          ctx.fillStyle = g; ctx.fillRect(lx - 10, ly - 4, 20, 20);
        }
        Art.draw(ctx, 'deco/lantern', lx, ly);
      }
      return true;
    }
    case 'stall':
      if (!Art.draw(ctx, 'deco/stall', x, y)) return false;
      text(ctx, d.text || '豚まん', x + 32, y - 40.5, 8, '#ffe082');
      return true;
    // ---- 須磨 ----
    case 'hut':
      if (!Art.draw(ctx, 'deco/hut', x, y)) return false;
      text(ctx, d.text || '海の家', x + 48, y - 55.5, 8, '#1d6f86');
      return true;
    case 'parasol': {
      if (!Art.has('deco/parasol0')) return false;
      const cx = x + 16, gy = d.base * TILE;
      ctx.fillStyle = '#d9dde3'; ctx.fillRect(cx - 1, y, 2, gy - y);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 1, y, 0.8, gy - y);
      Art.draw(ctx, 'deco/parasol' + ((d.color || 0) % 4), x, y);
      return true;
    }
    case 'sandcastle': return Art.draw(ctx, 'deco/sandcastle', x, y);
    case 'pine': { const k = (d.s || 1.3) / 1.3; return Art.draw(ctx, 'deco/pine', x + 8, y, false, k, k); }
    // ---- 舞子・橋 ----
    case 'ijokaku': return Art.draw(ctx, 'deco/ijokaku', x, y);
    case 'towerTop': return Art.draw(ctx, 'deco/towerTop', x, y);
    case 'hangers': {
      ctx.lineWidth = 0.9;
      for (const [px, top, bottom] of d.lines) {
        ctx.strokeStyle = 'rgba(120,140,135,0.9)'; ctx.beginPath(); ctx.moveTo(px + 0.4, top); ctx.lineTo(px + 0.4, bottom); ctx.stroke();
        ctx.strokeStyle = 'rgba(235,245,242,0.95)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(px - 0.2, top); ctx.lineTo(px - 0.2, bottom); ctx.stroke();
        ctx.lineWidth = 0.9;
      }
      return true;
    }
    // ---- 六甲山・掬星台 ----
    case 'sheep': {
      const bob = Math.abs(Math.sin((time + x * 0.1) * 2)) * 0.8;
      return Art.draw(ctx, 'deco/sheep', x + 8, y - bob, x % 48 < 16);
    }
    case 'track': {
      const x1 = d.x, y1 = d.y, x2 = d.x2 * TILE, y2 = d.y2 * TILE;
      const n = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 7);
      ctx.strokeStyle = night ? '#5a4a3a' : '#8d6e63'; ctx.lineWidth = 1.6;
      for (let i = 0; i <= n; i++) { const u = i / n, px = x1 + (x2 - x1) * u, py = y1 + (y2 - y1) * u; ctx.beginPath(); ctx.moveTo(px - 1.5, py + 1); ctx.lineTo(px + 1.5, py + 7.5); ctx.stroke(); }
      for (const [dy, c] of [[2, '#8a93a6'], [6, '#8a93a6']]) {
        ctx.strokeStyle = c; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(x1, y1 + dy); ctx.lineTo(x2, y2 + dy); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(x1, y1 + dy - 0.4); ctx.lineTo(x2, y2 + dy - 0.4); ctx.stroke();
      }
      return true;
    }
    case 'monument': {
      if (!Art.has('deco/monument')) return false;
      const a = 0.5 + Math.sin(time * 3) * 0.2;
      const g = ctx.createRadialGradient(x + 8, y - 33, 1, x + 8, y - 33, 22);
      g.addColorStop(0, `rgba(255,230,120,${a})`); g.addColorStop(1, 'rgba(255,230,120,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 14, y - 55, 44, 44);
      return Art.draw(ctx, 'deco/monument', x + 8, y);
    }
    case 'crane': {
      if (!Art.draw(ctx, 'deco/crane', x, y)) return false;
      // 動くつり具とコンテナ
      const tx = x + 40 + Math.sin(time * 0.4) * 40, ty = y - 128;
      ctx.fillStyle = '#4b5361'; ctx.fillRect(tx - 6, ty - 2, 12, 6);
      ctx.strokeStyle = '#33373f'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(tx - 2, ty + 4); ctx.lineTo(tx - 2, ty + 40); ctx.moveTo(tx + 2, ty + 4); ctx.lineTo(tx + 2, ty + 40); ctx.stroke();
      ctx.fillStyle = '#2f6fb8'; ctx.fillRect(tx - 14, ty + 40, 28, 13);
      ctx.fillStyle = '#1f4d86'; for (let k = 0; k < 6; k++) ctx.fillRect(tx - 12 + k * 4.6, ty + 41, 1.4, 11);
      return true;
    }
  }
  return false;
}

function drawSign(ctx, d, night) {
  const cx = d.x + 8, by = d.y;
  const post = (px, top, w = 2.4, c = '#6f7680') => {
    ctx.fillStyle = c; ctx.fillRect(px - w / 2, top, w, by - top);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(px - w / 2, top, w * 0.35, by - top);
  };
  const board = (x, y, w, h, r, fill, stroke, sw = 1.2) => {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; rr(ctx, x + 1, y + 1.5, w, h, r); ctx.fill();
    ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; rr(ctx, x, y, w, h, r); ctx.stroke(); }
  };
  if (d.style === 'station') { // 駅名標
    const w = Math.max(56, d.text.length * 13 + 16);
    post(cx - w / 2 + 7, by - 30); post(cx + w / 2 - 7, by - 30);
    board(cx - w / 2, by - 50, w, 24, 3, '#ffffff', '#b8c0c9', 0.8);
    ctx.fillStyle = d.color || '#1f5fbf'; ctx.fillRect(cx - w / 2 + 0.5, by - 32.5, w - 1, 3);
    text(ctx, d.text, cx, by - 42, 11, '#1b1b1b');
    if (d.kana) text(ctx, d.kana, cx, by - 35.4, 4.6, '#444', null, 'normal');
    return;
  }
  if (d.style === 'wood') { // 木の案内板
    const w = Math.max(40, d.text.length * 10 + 12);
    post(cx, by - 30, 3, '#6d4a2d');
    board(cx - w / 2, by - 44, w, 18, 3, '#b07a45', '#6d4a2d', 1);
    text(ctx, d.text, cx, by - 37, 8.5, '#fff8e1', '#5a3a1f');
    if (d.kana) text(ctx, d.kana, cx, by - 29.5, 4.4, '#fff8e1', '#5a3a1f', 'normal');
    return;
  }
  if (d.style === 'street') { // 青い住所の板
    post(cx, by - 34, 2.4);
    board(cx - 19, by - 45, 38, 15, 2.5, '#1f4fa0', '#ffffff', 1);
    text(ctx, d.text, cx, by - 39.3, 7, '#ffffff');
    if (d.kana) text(ctx, d.kana, cx, by - 33.6, 3.6, '#dce7ff', null, 'normal');
    return;
  }
  // 看板（ふつう）
  const w = Math.max(44, d.text.length * 11 + 14);
  post(cx - w / 2 + 8, by - 26, 2.6, '#6d5140'); post(cx + w / 2 - 8, by - 26, 2.6, '#6d5140');
  board(cx - w / 2, by - 45, w, 21, 4, night ? '#2b3a5e' : '#fffaf2', d.color || (night ? '#ffcf7a' : '#e07a5a'), 1.6);
  text(ctx, d.text, cx, by - 36.8, 9, night ? '#ffe9a8' : '#3a2e2a');
  if (d.kana) text(ctx, d.kana, cx, by - 29.2, 4.4, night ? '#dfe7ff' : '#6a5a52', null, 'normal');
}

function drawHouse(ctx, x, y, label, night) {
  const w = 5 * TILE, h = 3 * TILE;
  ctx.fillStyle = '#f7ecd9'; ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = '#d14a3a';
  ctx.beginPath(); ctx.moveTo(x - 6, y - h); ctx.lineTo(x + w / 2, y - h - 26); ctx.lineTo(x + w + 6, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9d2f24'; ctx.fillRect(x - 6, y - h - 2, w + 12, 3);
  ctx.fillStyle = '#7a4a2a'; rr(ctx, x + 32, y - 26, 14, 26, 3); ctx.fill();
  ctx.fillStyle = '#ffd23f'; circle(ctx, x + 43, y - 13, 1); ctx.fill();
  ctx.fillStyle = night ? '#ffd97a' : '#9fd6f2';
  ctx.fillRect(x + 8, y - 34, 14, 12); ctx.fillRect(x + 56, y - 34, 14, 12);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 14.5, y - 34, 1, 12); ctx.fillRect(x + 62.5, y - 34, 1, 12);
  // 表札
  ctx.fillStyle = '#ffffff'; rr(ctx, x + 8, y - 18, 20, 9, 1.5); ctx.fill();
  ctx.strokeStyle = '#9d7b5a'; ctx.lineWidth = 0.6; ctx.stroke();
  text(ctx, label, x + 18, y - 13.5, 4.6, '#333');
  // 植木ばち
  ctx.fillStyle = '#c0703a'; ctx.fillRect(x + 52, y - 7, 8, 7);
  ctx.fillStyle = '#e63946'; circle(ctx, x + 56, y - 10, 3); ctx.fill();
}

function drawShops(ctx, x, y, w, names, night) {
  const shopW = 3 * TILE;
  const cols = ['#e76f51', '#2a9d8f', '#e9c46a', '#8ab17d', '#f4a261', '#6d8bbf'];
  for (let i = 0; i * shopW < w; i++) {
    const sx = x + i * shopW, c = cols[i % cols.length];
    ctx.fillStyle = '#efe6d8'; ctx.fillRect(sx, y - 80, shopW - 2, 80);
    ctx.fillStyle = night ? '#ffe8a8' : '#ffffff'; ctx.fillRect(sx + 4, y - 42, shopW - 10, 30);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(sx + 4, y - 20, shopW - 10, 8);
    // ひさし
    for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#ffffff' : c; ctx.fillRect(sx + k * (shopW - 2) / 6, y - 50, (shopW - 2) / 6, 8); }
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(sx, y - 42); for (let k = 0; k <= 6; k++) ctx.arc(sx + (k + 0.5) * (shopW - 2) / 6, y - 42, (shopW - 2) / 12, 0, Math.PI); ctx.fill();
    // 看板
    ctx.fillStyle = c; rr(ctx, sx + 6, y - 72, shopW - 14, 14, 2); ctx.fill();
    text(ctx, names[i % names.length], sx + shopW / 2 - 1, y - 65, 7.5, '#ffffff', 'rgba(0,0,0,0.25)');
  }
}

function drawViaduct(ctx, x, y, w) {
  // 高架（電車の線路）: y は線路の上の面
  ctx.fillStyle = '#c9c2b6'; ctx.fillRect(x, y + 12, w, 9);
  ctx.fillStyle = '#8f887c'; ctx.fillRect(x, y + 20, w, 2);
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(x, y + 10, w, 2);
  for (let px = x + 24; px < x + w - 10; px += 64) { ctx.fillStyle = '#b3ac9f'; ctx.fillRect(px, y + 22, 10, 240); }
}

function drawPine(ctx, x, y, s) {
  ctx.fillStyle = '#6b4a2e';
  ctx.beginPath(); ctx.moveTo(x - 2 * s, y); ctx.quadraticCurveTo(x + 4 * s, y - 14 * s, x - 2 * s, y - 26 * s); ctx.lineTo(x + 1.5 * s, y - 26 * s); ctx.quadraticCurveTo(x + 7 * s, y - 14 * s, x + 2 * s, y); ctx.fill();
  ctx.fillStyle = '#2f6b3a';
  for (const [dx, dy, rx] of [[-7, -26, 9], [6, -30, 8], [-1, -35, 7], [9, -21, 6], [-9, -18, 5]]) {
    ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, rx * s, 3.4 * s, 0, 0, TAU); ctx.fill();
  }
}

function drawZooGate(ctx, x, y) {
  const w = 7 * TILE;
  ctx.fillStyle = '#6aa84f'; ctx.fillRect(x, y - 54, 10, 54); ctx.fillRect(x + w - 10, y - 54, 10, 54);
  ctx.fillStyle = '#ffffff'; rr(ctx, x - 4, y - 70, w + 8, 20, 4); ctx.fill();
  ctx.strokeStyle = '#6aa84f'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, '王子動物園', x + w / 2, y - 62, 11, '#2d6a1f');
  text(ctx, 'おうじどうぶつえん', x + w / 2, y - 53.5, 4.6, '#2d6a1f', null, 'normal');
  // 動物のシルエット
  ctx.fillStyle = '#f4a261'; circle(ctx, x - 2, y - 72, 6); ctx.fill();
  ctx.fillStyle = '#ffd166'; circle(ctx, x + w + 2, y - 72, 6); ctx.fill();
  ctx.fillStyle = '#333'; circle(ctx, x - 4, y - 73, 0.8); ctx.fill(); circle(ctx, x, y - 73, 0.8); ctx.fill();
  circle(ctx, x + w, y - 73, 0.8); ctx.fill(); circle(ctx, x + w + 4, y - 73, 0.8); ctx.fill();
}

function drawElephant(ctx, x, y, time) {
  // ゾウ（右向き）。鼻の先は x+56 あたり
  const bob = Math.sin(time * 2) * 0.6;
  ctx.fillStyle = '#9aa3ad';
  rr(ctx, x, y - 34 + bob, 44, 26, 12); ctx.fill();          // 体
  ctx.fillRect(x + 4, y - 14, 8, 14); ctx.fillRect(x + 30, y - 14, 8, 14); // 足
  circle(ctx, x + 44, y - 34 + bob, 13); ctx.fill();          // 頭
  ctx.fillStyle = '#b8c0c8';
  ctx.beginPath(); ctx.ellipse(x + 38, y - 32 + bob, 8, 11, -0.3, 0, TAU); ctx.fill(); // 耳
  // 鼻（上に向ける）
  ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 54, y - 30 + bob); ctx.quadraticCurveTo(x + 62, y - 36, x + 60, y - 50); ctx.stroke();
  ctx.fillStyle = '#1b1b1b'; circle(ctx, x + 50, y - 38 + bob, 1.4); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x + 52, y - 28 + bob); ctx.lineTo(x + 57, y - 24 + bob); ctx.lineTo(x + 52, y - 25 + bob); ctx.fill();
}

function drawFlamingo(ctx, x, y, t) {
  ctx.strokeStyle = '#f48fb1'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 14); ctx.stroke();
  ctx.fillStyle = '#f48fb1';
  ctx.beginPath(); ctx.ellipse(x + 1, y - 17, 6, 4, -0.2, 0, TAU); ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x + 5, y - 18); ctx.quadraticCurveTo(x + 9, y - 26, x + 5, y - 30 + Math.sin(t) * 0.8); ctx.stroke();
  circle(ctx, x + 6, y - 30, 2.2); ctx.fill();
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(x + 7.5, y - 30); ctx.lineTo(x + 10, y - 28); ctx.lineTo(x + 7.5, y - 28.5); ctx.fill();
}

function drawWheelFrame(ctx, d, night, time) {
  const cx = d.x, cy = d.y, r = d.r * TILE;
  const base = d.base * TILE;
  if (Art.ready) {
    // 支柱
    ctx.fillStyle = night ? '#5a6490' : '#d9dee6';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 2, cy); ctx.lineTo(cx + s * r * 0.62, base); ctx.lineTo(cx + s * (r * 0.62 - 5), base); ctx.lineTo(cx + s * -1, cy + 4); ctx.closePath(); ctx.fill(); }
    ctx.lineWidth = 1; ctx.strokeStyle = night ? '#7d88c0' : '#eef1f5';
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + time * 0.35; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); }
    ctx.lineWidth = 2.2; ctx.strokeStyle = night ? '#9aa6e6' : '#ffffff';
    circle(ctx, cx, cy, r); ctx.stroke();
    ctx.lineWidth = 1; circle(ctx, cx, cy, r * 0.92); ctx.stroke();
    if (night) {
      const cols = ['#ff7a9a', '#ffd36b', '#7ad7ff', '#9aff9a', '#ff9a5a', '#d59aff'];
      for (let k = 0; k < 32; k++) {
        const a = k / 32 * TAU + time * 0.35;
        ctx.fillStyle = cols[(k + Math.floor(time * 4)) % cols.length];
        circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.3); ctx.fill();
      }
    }
    ctx.fillStyle = night ? '#ffd97a' : '#ffffff'; circle(ctx, cx, cy, 5); ctx.fill();
    ctx.fillStyle = night ? '#ff8fa3' : '#e57373'; circle(ctx, cx, cy, 2.5); ctx.fill();
    return;
  }
  ctx.strokeStyle = night ? '#8a93c9' : '#e57373'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - r * 0.55, base); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * 0.55, base); ctx.stroke();
  ferris(ctx, cx, cy, r, night ? '#aab3e6' : '#ef9a9a', d.lit, time);
  ctx.fillStyle = night ? '#ffd97a' : '#ffffff'; circle(ctx, cx, cy, 5); ctx.fill();
  ctx.fillStyle = night ? '#ff8fa3' : '#e57373'; circle(ctx, cx, cy, 2.5); ctx.fill();
}

function drawShinkansen(ctx, x, y, d, time) {
  // 新幹線（ホームに止まっている）: y はレールの高さ
  const len = (d.w || 12) * TILE;
  ctx.fillStyle = '#f4f6f8';
  ctx.beginPath();
  ctx.moveTo(x, y - 4); ctx.lineTo(x, y - 26); ctx.lineTo(x + len - 40, y - 26);
  ctx.quadraticCurveTo(x + len - 6, y - 24, x + len, y - 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1f4fb4'; ctx.fillRect(x, y - 10, len - 10, 2.5); ctx.fillRect(x, y - 13, len - 22, 1);
  ctx.fillStyle = '#28344a';
  for (let wx = x + 10; wx < x + len - 50; wx += 11) ctx.fillRect(wx, y - 21, 7, 5);
  ctx.beginPath(); ctx.moveTo(x + len - 44, y - 22); ctx.lineTo(x + len - 26, y - 22); ctx.lineTo(x + len - 36, y - 16); ctx.lineTo(x + len - 44, y - 16); ctx.fill();
  ctx.fillStyle = '#6c757d'; ctx.fillRect(x - 10, y - 3, len + 20, 3);
}

function drawStationRoof(ctx, x, y, w, color) {
  ctx.fillStyle = color; ctx.fillRect(x, y - 58, w, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, y - 53, w, 3);
  for (let px = x + 10; px < x + w; px += 48) { ctx.fillStyle = '#9aa3ad'; ctx.fillRect(px, y - 53, 3, 53); }
}

function drawCable(ctx, d) {
  // ロープウェイのワイヤー（ゴンドラの床より上）
  const x1 = d.x + 8, y1 = d.y - 34, x2 = d.x2 * TILE + 8, y2 = d.y2 * TILE - 34;
  ctx.strokeStyle = '#3d4450'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1 - 3); ctx.lineTo(x2, y2 - 3); ctx.stroke();
}

function drawRopewayStation(ctx, x, y, label) {
  const w = 6 * TILE;
  ctx.fillStyle = '#e8edf2'; ctx.fillRect(x, y - 64, w, 64);
  ctx.fillStyle = '#3d7ea6'; ctx.fillRect(x - 4, y - 70, w + 8, 8);
  ctx.fillStyle = '#9fd3ef'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 8 + i * 22, y - 54, 14, 18);
  ctx.fillStyle = '#5b6470'; ctx.fillRect(x + 36, y - 30, 24, 30);
  if (label) { ctx.fillStyle = '#ffffff'; rr(ctx, x + 10, y - 86, w - 20, 14, 2); ctx.fill(); text(ctx, label, x + w / 2, y - 79, 7.5, '#1f4f7a'); }
}

function drawWeathercock(ctx, x, y, time, d) {
  // 風見鶏（風の向きでくるっと回る）
  const dir = d.dir || 1;
  ctx.fillStyle = '#5b3a2a'; ctx.fillRect(x - 0.8, y - 22, 1.6, 22);
  ctx.fillRect(x - 6, y - 12, 12, 1); ctx.fillRect(x - 0.5, y - 17, 1, 10);
  text(ctx, 'N', x, y - 19, 3.5, '#5b3a2a');
  ctx.save(); ctx.translate(x, y - 26); ctx.scale(dir, 1);
  ctx.fillStyle = '#c9a227';
  ctx.beginPath(); ctx.moveTo(-8, 2); ctx.quadraticCurveTo(-10, -6, -4, -5); ctx.lineTo(-2, -2); ctx.lineTo(3, -4);
  ctx.quadraticCurveTo(6, -10, 8, -6); ctx.lineTo(10, -5); ctx.lineTo(7, -3); ctx.quadraticCurveTo(7, 3, 0, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d32f2f'; circle(ctx, 7.5, -8, 1.2); ctx.fill();
  ctx.restore();
}

function drawChinaGate(ctx, x, y, w, label) {
  // 長安門：y は屋根の上の面（すり抜け足場）
  const top = y;
  ctx.fillStyle = '#c62828';
  for (const px of [x + 6, x + w - 14]) ctx.fillRect(px, top + 12, 8, 240);
  ctx.fillStyle = '#b71c1c'; ctx.fillRect(x + 4, top + 26, w - 8, 6);
  ctx.fillStyle = '#ffd54f'; rr(ctx, x + w / 2 - 26, top + 14, 52, 14, 2); ctx.fill();
  text(ctx, label, x + w / 2, top + 21.5, 8.5, '#b71c1c');
  // 屋根
  ctx.fillStyle = '#2e7d5b';
  ctx.beginPath(); ctx.moveTo(x - 10, top + 6); ctx.quadraticCurveTo(x + w / 2, top - 2, x + w + 10, top + 6);
  ctx.lineTo(x + w, top + 12); ctx.lineTo(x, top + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4caf82'; ctx.fillRect(x, top, w, 3);
  ctx.fillStyle = '#ffd54f'; ctx.fillRect(x + 2, top + 10, w - 4, 2);
  // 龍のかざり
  ctx.fillStyle = '#ffd54f'; circle(ctx, x - 6, top + 2, 2.4); ctx.fill(); circle(ctx, x + w + 6, top + 2, 2.4); ctx.fill();
}

function drawLanternLine(ctx, x, y, w) {
  ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + 16, x + w, y); ctx.stroke();
  const n = Math.max(3, Math.floor(w / 18));
  for (let i = 1; i < n; i++) {
    const u = i / n, lx = x + w * u, ly = y + 8 * 4 * u * (1 - u);
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.ellipse(lx, ly + 5, 3.4, 4.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(lx - 2, ly + 0.6, 4, 1); ctx.fillRect(lx - 2, ly + 8.6, 4, 1);
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(lx - 0.4, ly + 9.6, 0.8, 1.6);
  }
}

function drawStall(ctx, x, y, label) {
  const w = 4 * TILE;
  ctx.fillStyle = '#8d2a1e'; ctx.fillRect(x, y - 30, w, 30);
  ctx.fillStyle = '#e8d4a8'; ctx.fillRect(x + 4, y - 26, w - 8, 14);
  // せいろと豚まん
  ctx.fillStyle = '#c8a26a'; ctx.fillRect(x + 8, y - 22, 20, 6); ctx.fillRect(x + 34, y - 22, 20, 6);
  ctx.fillStyle = '#fffaf0'; for (const px of [12, 18, 24, 38, 44, 50]) { ctx.beginPath(); ctx.arc(x + px, y - 23, 3, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = '#c62828'; ctx.fillRect(x - 4, y - 46, w + 8, 12);
  text(ctx, label, x + w / 2, y - 40, 8, '#ffe082');
  // 湯気
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
  for (const px of [16, 44]) { ctx.beginPath(); ctx.moveTo(x + px, y - 28); ctx.quadraticCurveTo(x + px - 3, y - 33, x + px, y - 36); ctx.stroke(); }
}

function drawBeKobe(ctx, x, y) {
  ctx.fillStyle = '#ffffff';
  rr(ctx, x, y - 22, 70, 22, 2); ctx.fill();
  ctx.fillStyle = '#9aa3ad'; ctx.fillRect(x, y - 3, 70, 3);
  text(ctx, 'BE KOBE', x + 35, y - 11, 11, '#e0443a');
}

function drawCrane(ctx, x, y, time) {
  ctx.fillStyle = '#e0892b';
  ctx.fillRect(x, y - 120, 6, 120); ctx.fillRect(x + 34, y - 120, 6, 120);
  ctx.fillRect(x - 30, y - 126, 120, 7);
  ctx.strokeStyle = '#b86a1c'; ctx.lineWidth = 1;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x, y - k * 20); ctx.lineTo(x + 40, y - k * 20 - 20); ctx.stroke(); }
  const tx = x + 30 + Math.sin(time * 0.4) * 30;
  ctx.fillStyle = '#5b6470'; ctx.fillRect(tx - 5, y - 122, 10, 5);
  ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(tx, y - 117); ctx.lineTo(tx, y - 80); ctx.stroke();
}

function drawHut(ctx, x, y, label) {
  const w = 6 * TILE;
  ctx.fillStyle = '#d9b27c'; ctx.fillRect(x, y - 40, w, 40);
  ctx.fillStyle = '#b5874d'; for (let px = x; px < x + w; px += 8) ctx.fillRect(px, y - 40, 1, 40);
  ctx.fillStyle = '#2a9d8f'; ctx.fillRect(x - 4, y - 46, w + 8, 8);
  ctx.fillStyle = '#ffffff'; for (let px = x - 4; px < x + w + 4; px += 12) ctx.fillRect(px, y - 46, 6, 8);
  ctx.fillStyle = '#ffffff'; rr(ctx, x + w / 2 - 22, y - 62, 44, 14, 3); ctx.fill();
  text(ctx, label, x + w / 2, y - 55, 8, '#1d6f86');
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x + 12, y - 26, 20, 26);
}

function drawPole(ctx, x, y, h) {
  ctx.fillStyle = '#e9ecef'; ctx.fillRect(x - 1, y - h, 2, h);
}

function drawParasol(ctx, x, y, groundY, color) {
  // ビーチパラソル：y は乗れる面の高さ
  const cols = [['#ff5a5f', '#ffffff'], ['#2ec4b6', '#ffffff'], ['#ffb703', '#ffffff'], ['#3a86ff', '#ffe066']][color % 4];
  const cx = x + 16;
  ctx.fillStyle = '#e9ecef'; ctx.fillRect(cx - 1, y, 2, groundY - y);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 6); ctx.quadraticCurveTo(cx, y - 10, x + 36, y + 6); ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(cx, y - 6); ctx.lineTo(x - 4 + i * 6.7, y + 7); ctx.lineTo(x - 4 + (i + 1) * 6.7, y + 7); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = cols[0];
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x - 0.5 + i * 8, y + 5.5, 4, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = '#ffffff'; circle(ctx, cx, y - 2.5, 1.5); ctx.fill();
}

function drawSandcastle(ctx, x, y) {
  ctx.fillStyle = '#e8c887';
  ctx.fillRect(x, y - 14, 28, 14); ctx.fillRect(x + 4, y - 24, 8, 10); ctx.fillRect(x + 16, y - 24, 8, 10);
  ctx.fillRect(x + 9, y - 32, 10, 8);
  ctx.fillStyle = '#d4ae68'; ctx.fillRect(x + 11, y - 8, 6, 8);
  ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(x + 14, y - 40); ctx.lineTo(x + 20, y - 37); ctx.lineTo(x + 14, y - 35); ctx.fill();
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x + 13.5, y - 40, 1, 8);
}

function drawIjokaku(ctx, x, y) {
  // 移情閣（六角形の建物）
  const w = 5 * TILE;
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x, y - 44, w, 44);
  ctx.fillStyle = '#2f8a6a';
  ctx.beginPath(); ctx.moveTo(x - 8, y - 44); ctx.quadraticCurveTo(x + w / 2, y - 52, x + w + 8, y - 44); ctx.lineTo(x + w - 6, y - 56); ctx.lineTo(x + 6, y - 56); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x + 10, y - 76, w - 20, 20);
  ctx.fillStyle = '#2f8a6a';
  ctx.beginPath(); ctx.moveTo(x + 2, y - 76); ctx.quadraticCurveTo(x + w / 2, y - 82, x + w - 2, y - 76); ctx.lineTo(x + w / 2, y - 96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c62828'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 8 + i * 18, y - 36, 8, 14);
  ctx.fillStyle = '#c62828'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 16 + i * 16, y - 72, 6, 10);
}

function drawHangers(ctx, d) {
  // つり橋のハンガーロープ（ケーブルから道路へ）
  ctx.strokeStyle = 'rgba(210,225,220,0.9)'; ctx.lineWidth = 0.8;
  for (const [px, top, bottom] of d.lines) { ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke(); }
}

function drawTowerTop(ctx, x, y) {
  ctx.fillStyle = '#e8f0ed'; ctx.fillRect(x - 4, y - 6, 40, 6);
  ctx.fillStyle = '#e0443a'; circle(ctx, x + 16, y - 9, 2.5); ctx.fill();
}

function drawTrack(ctx, d) {
  // ケーブルカーの線路（ななめ）
  const x1 = d.x, y1 = d.y, x2 = d.x2 * TILE, y2 = d.y2 * TILE;
  ctx.strokeStyle = '#6c757d'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x1, y1 + 2); ctx.lineTo(x2, y2 + 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1 + 6); ctx.lineTo(x2, y2 + 6); ctx.stroke();
  const n = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 8);
  ctx.strokeStyle = '#8d6e63';
  for (let i = 0; i <= n; i++) { const u = i / n, px = x1 + (x2 - x1) * u, py = y1 + (y2 - y1) * u; ctx.beginPath(); ctx.moveTo(px - 2, py + 1); ctx.lineTo(px + 2, py + 7); ctx.stroke(); }
}

function drawSheep(ctx, x, y, t) {
  const bob = Math.abs(Math.sin(t * 2)) * 0.8;
  ctx.fillStyle = '#3b3b3b'; ctx.fillRect(x - 5, y - 5, 2, 5); ctx.fillRect(x + 3, y - 5, 2, 5);
  ctx.fillStyle = '#f5f1e6';
  for (const [dx, dy] of [[-5, -9], [0, -11], [5, -9], [-2, -7], [3, -7]]) { circle(ctx, x + dx, y + dy - bob, 4); ctx.fill(); }
  ctx.fillStyle = '#3b3b3b'; ctx.beginPath(); ctx.ellipse(x + 9, y - 10 - bob, 3, 3.6, 0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; circle(ctx, x + 10, y - 11 - bob, 0.8); ctx.fill();
}

function drawStarMonument(ctx, x, y, t) {
  ctx.fillStyle = '#8a8ca0'; ctx.fillRect(x - 2, y - 26, 4, 26);
  ctx.fillStyle = `rgba(255,230,120,${0.7 + Math.sin(t * 3) * 0.3})`;
  starPath(ctx, x, y - 30, 8, 3.5); ctx.fill();
}

function drawLamp(ctx, x, y, night) {
  ctx.fillStyle = '#3d3d46'; ctx.fillRect(x - 1, y - 30, 2, 30);
  ctx.fillRect(x - 4, y - 33, 8, 3);
  if (night) {
    const g = ctx.createRadialGradient(x, y - 30, 1, x, y - 30, 16);
    g.addColorStop(0, 'rgba(255,230,160,0.8)'); g.addColorStop(1, 'rgba(255,230,160,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 16, y - 46, 32, 32);
  }
  ctx.fillStyle = night ? '#fff3c4' : '#e9ecef'; circle(ctx, x, y - 29, 2.5); ctx.fill();
}

function drawBench(ctx, x, y) {
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(x, y - 8, 22, 2.5); ctx.fillRect(x, y - 14, 22, 2);
  ctx.fillStyle = '#4e4e56'; ctx.fillRect(x + 2, y - 8, 2, 8); ctx.fillRect(x + 18, y - 8, 2, 8);
}

// ===================== 動く足場の見た目 =====================
export function drawPlatformLook(ctx, pf, theme, time, night) {
  if (!pf.visible) return;
  let x = pf.x, y = pf.y;
  const w = pf.w;
  if (pf.move === 'fall' && pf.touched && !pf.falling) x += Math.sin(time * 70) * 0.7;
  if (Art.ready) {
    if (pf.look === 'train' && Art.draw(ctx, 'pf/train', x, y, false, w / 80, 1)) return;
    if (pf.look === 'ship' && Art.draw(ctx, 'pf/ship', x, y, false, w / 96, 1)) return;
    if (pf.look === 'portliner' && Art.draw(ctx, 'pf/portliner', x, y, false, w / 80, 1)) return;
    if (pf.look === 'gondola' && Art.draw(ctx, night ? 'pf/rgondolaL' : 'pf/rgondola', x, y, false, w / 32, 1)) return;
    if (pf.look === 'cablecar' && Art.draw(ctx, 'pf/cablecar', x, y, false, w / 48, 1)) return;
    if (pf.look === 'lotus' && Art.draw(ctx, 'pf/lotus', x, y, false, w / 32, 1)) return;
    if (pf.look === 'log' && Art.draw(ctx, 'pf/log', x, y, false, w / 32, 1)) return;
    if (pf.look === 'ring' && Art.draw(ctx, 'pf/ring' + ((pf.color || 0) % 4), x, y, false, w / 32, 1)) return;
    if (pf.look === 'orca' && Art.has('pf/orca')) {
      ctx.save(); ctx.translate(x + w / 2, y + 6);
      ctx.rotate(Math.atan2(pf.vyNow || 0, 120 * (pf.facing || 1)) * 0.6);
      Art.draw(ctx, 'pf/orca', 0, 0, (pf.facing || 1) < 0, w / 48, 1);
      ctx.restore();
      return;
    }
    if (pf.look === 'giraffe' && Art.has('pf/giraffeHead')) {
      const gy = (pf.base ?? 13) * TILE, cx = x + w / 2;
      Art.draw(ctx, 'pf/giraffeBody', cx, gy);
      const neckBottom = gy - 30;
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 8, y + 4, 16, Math.max(0, neckBottom - y - 4)); ctx.clip();
      for (let yy = y + 4; yy < neckBottom; yy += 16) Art.draw(ctx, 'pf/giraffeNeck', cx, yy);
      ctx.restore();
      Art.draw(ctx, 'pf/giraffeHead', x, y, false, w / 32, 1);
      return;
    }
    if (pf.look === 'wheel' && Art.has('pf/gondola0')) {
      ctx.strokeStyle = night ? '#cfd6ff' : '#b9c0cc'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(pf.ax, pf.ay); ctx.lineTo(pf.ax, pf.y - 20); ctx.stroke();
      Art.draw(ctx, `pf/gondola${pf.color % 6}${night ? 'L' : ''}`, x, y, false, w / 32, 1);
      return;
    }
  }
  switch (pf.look) {
    case 'train': return drawTrainCar(ctx, x, y, w, '#7a1f2b', '#f2e6c9', pf.facing, night);
    case 'portliner': return drawTrainCar(ctx, x, y, w, '#f4f6f8', '#1f5fbf', pf.facing, night, true);
    case 'gondola': return drawGondola(ctx, x, y, w, '#e53935', night);
    case 'wheel': return drawWheelGondola(ctx, pf, night);
    case 'cablecar': return drawCableCar(ctx, x, y, w);
    case 'giraffe': return drawGiraffe(ctx, pf, time);
    case 'ship': return drawShipDeck(ctx, x, y, w, night);
    case 'ring': return drawRing(ctx, x, y, w, pf.color);
    case 'orca': return drawOrca(ctx, pf);
    case 'lotus': return drawLotus(ctx, x, y, w);
    case 'log': return drawLog(ctx, x, y, w);
    case 'crate': case 'fall': return drawCrate(ctx, x, y, w);
    case 'cloud': return drawCloudPf(ctx, x, y, w);
  }
  if (pf.move === 'fall') return drawCrate(ctx, x, y, w);
  // ふつうのリフト
  const baseC = night ? '#6c7bb5' : theme === 'castle' ? '#6c757d' : '#f4a261';
  const lite = night ? '#aab3e6' : '#ffd6a5';
  ctx.fillStyle = baseC; rr(ctx, x, y, w, 8, 2); ctx.fill();
  ctx.fillStyle = lite; rr(ctx, x + 1, y + 1, w - 2, 3, 1.5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 4; i < w; i += 10) { circle(ctx, x + i, y + 5.5, 0.9); ctx.fill(); }
}

function drawTrainCar(ctx, x, y, w, body, stripe, facing, night, rounded) {
  // 床(y) の上に車体。中に乗っているように見える
  const h = 26;
  ctx.fillStyle = body;
  rr(ctx, x - 2, y - h, w + 4, h + 10, rounded ? 6 : 3); ctx.fill();
  ctx.fillStyle = night ? '#ffe8a8' : '#d8eef8';
  ctx.fillRect(x + 2, y - h + 5, w - 4, 13);           // 大きな窓（中が見える）
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let wx = x + 6; wx < x + w - 4; wx += 16) ctx.fillRect(wx, y - h + 6, 3, 11);
  ctx.fillStyle = body;
  for (let wx = x + 16; wx < x + w - 4; wx += 16) ctx.fillRect(wx, y - h + 5, 2, 13);
  ctx.fillStyle = stripe; ctx.fillRect(x - 2, y - 6, w + 4, 2);
  ctx.fillStyle = '#b8b4ab'; ctx.fillRect(x, y, w, 3);  // 床
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, x + 10, y + 11, 3.2); ctx.fill(); circle(ctx, x + w - 10, y + 11, 3.2); ctx.fill();
  // パンタグラフ / 屋根
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, y - h, w, 2);
  if (!rounded) {
    ctx.strokeStyle = '#444'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x + w / 2 - 6, y - h); ctx.lineTo(x + w / 2, y - h - 7); ctx.lineTo(x + w / 2 + 6, y - h); ctx.stroke();
  }
  // ライト
  ctx.fillStyle = '#fff3b0';
  const fx = facing > 0 ? x + w - 1 : x - 1;
  ctx.fillRect(fx, y - 8, 2, 2);
}

function drawGondola(ctx, x, y, w, color, night) {
  const cx = x + w / 2, h = 22;
  ctx.strokeStyle = '#3d4450'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cx, y - h - 12); ctx.lineTo(cx, y - h); ctx.stroke();
  ctx.fillStyle = '#3d4450'; ctx.fillRect(cx - 4, y - h - 14, 8, 3);
  ctx.fillStyle = color; rr(ctx, x - 2, y - h, w + 4, h + 6, 5); ctx.fill();
  ctx.fillStyle = night ? '#ffe8a8' : '#d8eef8'; rr(ctx, x + 1, y - h + 4, w - 2, 11, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 3, y - h + 5, 2, 9);
  ctx.fillStyle = '#b8b4ab'; ctx.fillRect(x, y, w, 2);
}

function drawWheelGondola(ctx, pf, night) {
  const cols = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043'];
  const c = cols[pf.color % cols.length];
  ctx.strokeStyle = night ? '#aab3e6' : '#9e9e9e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pf.ax, pf.ay); ctx.lineTo(pf.ax, pf.y - 18); ctx.stroke();
  drawGondola(ctx, pf.x, pf.y, pf.w, c, night);
}

function drawCableCar(ctx, x, y, w) {
  ctx.fillStyle = '#f4a100'; rr(ctx, x - 2, y - 24, w + 4, 30, 4); ctx.fill();
  ctx.fillStyle = '#d8eef8'; ctx.fillRect(x + 2, y - 20, w - 4, 11);
  ctx.fillStyle = '#c1121f'; ctx.fillRect(x - 2, y - 6, w + 4, 2);
  ctx.fillStyle = '#b8b4ab'; ctx.fillRect(x, y, w, 3);
}

function drawGiraffe(ctx, pf, time) {
  // キリン：頭が足場。首は地面までのびる
  const x = pf.x, y = pf.y, w = pf.w;
  const groundY = (pf.base ?? 13) * TILE;
  const nx = x + w / 2 - 4;
  ctx.fillStyle = '#f2c14e'; ctx.fillRect(nx, y + 6, 8, groundY - y - 22);
  ctx.fillStyle = '#b5652b';
  for (let yy = y + 12; yy < groundY - 24; yy += 12) { rr(ctx, nx + 1, yy, 3, 4, 1); ctx.fill(); rr(ctx, nx + 4.5, yy + 6, 3, 4, 1); ctx.fill(); }
  // 体
  ctx.fillStyle = '#f2c14e'; rr(ctx, nx - 18, groundY - 26, 30, 16, 6); ctx.fill();
  ctx.fillStyle = '#b5652b'; circle(ctx, nx - 10, groundY - 20, 2.5); ctx.fill(); circle(ctx, nx + 2, groundY - 17, 2.2); ctx.fill();
  ctx.fillStyle = '#f2c14e';
  for (const lx of [nx - 16, nx - 8, nx + 2, nx + 8]) ctx.fillRect(lx, groundY - 12, 3, 12);
  // 頭
  ctx.fillStyle = '#f2c14e'; rr(ctx, x, y, w, 9, 4); ctx.fill();
  ctx.fillStyle = '#e0a93b'; rr(ctx, x + w - 8, y + 3, 9, 6, 3); ctx.fill();
  ctx.fillStyle = '#6d4a2d'; ctx.fillRect(x + 6, y - 4, 1.4, 4); ctx.fillRect(x + 11, y - 4, 1.4, 4);
  circle(ctx, x + 6.7, y - 4, 1.3); ctx.fill(); circle(ctx, x + 11.7, y - 4, 1.3); ctx.fill();
  ctx.fillStyle = '#1b1b1b'; circle(ctx, x + w - 12, y + 3.5, 1.1); ctx.fill();
  void time;
}

function drawShipDeck(ctx, x, y, w, night) {
  // 船：甲板が足場
  ctx.fillStyle = '#1d3557';
  ctx.beginPath(); ctx.moveTo(x - 6, y + 2); ctx.lineTo(x + w + 10, y + 2); ctx.lineTo(x + w, y + 22); ctx.lineTo(x + 4, y + 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e63946'; ctx.fillRect(x, y + 17, w, 3);
  ctx.fillStyle = '#ffffff'; for (let px = x + 6; px < x + w - 4; px += 10) { circle(ctx, px, y + 10, 1.8); ctx.fill(); }
  ctx.fillStyle = '#a47551'; ctx.fillRect(x - 4, y, w + 12, 3);
  // 船室
  ctx.fillStyle = '#f4f1ea'; ctx.fillRect(x + w * 0.35, y - 16, w * 0.4, 16);
  ctx.fillStyle = night ? '#ffd97a' : '#5d8fb8'; for (let i = 0; i < 3; i++) ctx.fillRect(x + w * 0.38 + i * 9, y - 12, 5, 4);
  ctx.fillStyle = '#e0443a'; ctx.fillRect(x + w * 0.5, y - 26, 6, 10);
}

function drawRing(ctx, x, y, w, color) {
  const cols = ['#ff5a5f', '#ffb703', '#2ec4b6', '#3a86ff'];
  const cx = x + w / 2;
  ctx.fillStyle = cols[(color || 0) % 4];
  ctx.beginPath(); ctx.ellipse(cx, y + 4, w / 2 + 2, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * (w / 2 - 1), y + 4 + Math.sin(a) * 4, 3, 2.6, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(40,120,180,0.9)'; ctx.beginPath(); ctx.ellipse(cx, y + 4, w / 2 - 6, 2.5, 0, 0, TAU); ctx.fill();
}

function drawOrca(ctx, pf) {
  // シャチ：背中が足場
  const x = pf.x, y = pf.y, w = pf.w, cx = x + w / 2;
  ctx.save(); ctx.translate(cx, y + 6);
  const ang = Math.atan2(pf.vyNow || 0, 120 * pf.facing) * 0.6;
  ctx.rotate(ang); ctx.scale(pf.facing || 1, 1);
  ctx.fillStyle = '#1b1f2a';
  ctx.beginPath(); ctx.ellipse(0, 2, w / 2 + 6, 8, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(0, -16); ctx.lineTo(5, -5); ctx.fill(); // 背びれ
  ctx.beginPath(); ctx.moveTo(-w / 2 - 4, 2); ctx.lineTo(-w / 2 - 14, -5); ctx.lineTo(-w / 2 - 12, 8); ctx.fill(); // 尾
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(w / 2 - 6, 5, 7, 3.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w / 2 - 10, -2, 3.5, 1.8, -0.2, 0, TAU); ctx.fill(); // 目の上の白
  ctx.restore();
}

function drawLotus(ctx, x, y, w) {
  ctx.fillStyle = '#3f9e56'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3, w / 2 + 2, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#68c07c'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 2, w / 2, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f48fb1'; circle(ctx, x + w / 2 + 4, y, 2.4); ctx.fill();
}

function drawLog(ctx, x, y, w) {
  ctx.fillStyle = '#7a4f2a'; rr(ctx, x - 2, y, w + 4, 9, 4.5); ctx.fill();
  ctx.fillStyle = '#a0703f'; rr(ctx, x, y + 1, w, 3, 1.5); ctx.fill();
  ctx.fillStyle = '#d9b27c'; circle(ctx, x + w + 1, y + 4.5, 3.5); ctx.fill();
  ctx.strokeStyle = '#a0703f'; ctx.lineWidth = 0.5; circle(ctx, x + w + 1, y + 4.5, 2); ctx.stroke();
}

function drawCrate(ctx, x, y, w) {
  ctx.fillStyle = '#7f4f24'; rr(ctx, x, y, w, 8, 2); ctx.fill();
  ctx.fillStyle = '#b08968'; rr(ctx, x + 1, y + 1, w - 2, 4, 1.5); ctx.fill();
  ctx.strokeStyle = '#7f4f24'; ctx.lineWidth = 0.8;
  for (let i = 12; i < w; i += 12) { ctx.beginPath(); ctx.moveTo(x + i, y + 1); ctx.lineTo(x + i, y + 7); ctx.stroke(); }
}

function drawCloudPf(ctx, x, y, w) {
  ctx.fillStyle = '#dbe9ff'; rr(ctx, x, y + 1, w, 7, 3.5); ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (let i = 5; i < w; i += 9) { circle(ctx, x + i, y + 2.5, 4.2); ctx.fill(); }
}

// ===================== 滝・風・シャワーの見た目 =====================
export function drawZone(ctx, z, time, camX, viewW) {
  if (z.x > camX + viewW + 40 || z.x + z.w < camX - 40) return;
  if (z.kind === 'fall') {
    // 水の帯（まん中が明るい）
    const g = ctx.createLinearGradient(z.x - 1, 0, z.x + z.w + 1, 0);
    g.addColorStop(0, 'rgba(150,212,238,0.8)'); g.addColorStop(0.35, 'rgba(236,250,255,0.93)');
    g.addColorStop(0.7, 'rgba(214,242,252,0.9)'); g.addColorStop(1, 'rgba(140,204,232,0.8)');
    ctx.fillStyle = g; ctx.fillRect(z.x - 1, z.y, z.w + 2, z.h);
    // 下へ流れるすじ（2種類の速さ）
    for (const [col, sp, len, step] of [['rgba(110,188,226,0.55)', 300, 16, 2.4], ['rgba(255,255,255,0.85)', 380, 10, 3.6]]) {
      ctx.fillStyle = col;
      for (let i = 0; i * step < z.w; i++) {
        const sx = z.x + i * step + (i % 2) * 0.7;
        const off = (time * sp + i * 53) % 44;
        for (let yy = z.y - 44 + off; yy < z.y + z.h; yy += 44) {
          const y0 = Math.max(z.y, yy), h = Math.min(len, z.y + z.h - y0);
          if (h > 0) ctx.fillRect(sx, y0, 0.8, h);
        }
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(z.x - 1, z.y, 0.8, z.h); ctx.fillRect(z.x + z.w + 0.2, z.y, 0.8, z.h);
    // 滝つぼのもやとしぶき
    const bx = z.x + z.w / 2, by = z.y + z.h;
    const mg = ctx.createRadialGradient(bx, by, 2, bx, by, z.w + 16);
    mg.addColorStop(0, 'rgba(255,255,255,0.55)'); mg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = mg; ctx.fillRect(bx - z.w - 16, by - z.w - 16, (z.w + 16) * 2, z.w + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let i = 0; i < 9; i++) {
      const a = time * 5 + i * 1.7;
      circle(ctx, bx + Math.sin(a * 1.3 + i) * (z.w / 2 + 5), by - 2 - Math.abs(Math.sin(a)) * 8, 1.8 + (i % 3) * 0.8); ctx.fill();
    }
  } else if (z.kind === 'spray') {
    ctx.fillStyle = 'rgba(160,220,255,0.35)'; ctx.fillRect(z.x + 2, z.y, z.w - 4, z.h);
    ctx.fillStyle = 'rgba(210,240,255,0.95)';
    for (let i = 0; i < 18; i++) {
      const u = ((time * 1.4 + i / 18) % 1);
      const px = z.x + z.w / 2 + Math.sin(i * 7.3) * (z.w / 2 - 3) * u;
      const py = z.y + z.h - u * z.h;
      circle(ctx, px, py, 1.6 + (1 - u)); ctx.fill();
    }
  } else if (z.kind === 'wind') {
    if (!zoneActive(z, time)) return;
    const dir = windDir(z, time);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    for (let i = 0; i < Math.max(5, z.w * z.h / 3500); i++) {
      const sy = z.y + ((i * 53) % z.h);
      const sx = z.x + (((time * 160 * dir + i * 97) % z.w) + z.w) % z.w;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx - dir * 8, sy - 3, sx - dir * 18, sy); ctx.stroke();
    }
    ctx.fillStyle = '#7cb342';
    for (let i = 0; i < 5; i++) {
      const sy = z.y + ((i * 71 + 20) % z.h) + Math.sin(time * 5 + i) * 6;
      const sx = z.x + (((time * 120 * dir + i * 131) % z.w) + z.w) % z.w;
      ctx.beginPath(); ctx.ellipse(sx, sy, 2.4, 1.2, time * 5 + i, 0, TAU); ctx.fill();
    }
  }
}

// ===================== ゴール =====================
export function drawGoal(ctx, g, time, night) {
  // 次の場所への看板アーチ
  const hx = g.houseX, gy = g.groundY, W = 4 * TILE;
  for (const px of [hx + 2, hx + W - 8]) {
    ctx.fillStyle = '#7a5236'; ctx.fillRect(px, gy - 58, 6, 58);
    ctx.fillStyle = '#a0714a'; ctx.fillRect(px, gy - 58, 2, 58);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ctx, hx - 9, gy - 74, W + 20, 22, 5); ctx.fill();
  ctx.fillStyle = night ? '#2b3a6e' : '#fffaf0'; rr(ctx, hx - 10, gy - 76, W + 20, 22, 5); ctx.fill();
  ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 2; ctx.stroke();
  const label = g.label || 'ゴール';
  const size = Math.min(10, (W + 12) / (label.length * 0.95));
  text(ctx, label, hx + W / 2, gy - 65, size, night ? '#ffe9a8' : '#c1440e');
  // 矢印
  ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.moveTo(hx + W / 2 - 8, gy - 48); ctx.lineTo(hx + W / 2 + 4, gy - 48); ctx.lineTo(hx + W / 2 + 4, gy - 52); ctx.lineTo(hx + W / 2 + 12, gy - 45); ctx.lineTo(hx + W / 2 + 4, gy - 38); ctx.lineTo(hx + W / 2 + 4, gy - 42); ctx.lineTo(hx + W / 2 - 8, gy - 42); ctx.closePath(); ctx.fill();
  // ポール
  const px = g.poleX;
  if (Art.has('goalflag/0')) {
    const gr = ctx.createLinearGradient(px - 1.5, 0, px + 1.5, 0);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#b9c3cf');
    ctx.fillStyle = gr; ctx.fillRect(px - 1.3, g.topY, 2.6, gy - g.topY);
    Art.draw(ctx, 'goalball', px, g.topY - 2);
    Art.draw(ctx, 'goalflag/' + (Math.floor(time * 4) % 2), px - 1, g.flagY);
    ctx.fillStyle = '#5b6472'; rr(ctx, px - 5, gy - 5, 10, 5, 1.5); ctx.fill();
    return;
  }
  ctx.fillStyle = '#e9f5db'; ctx.fillRect(px - 1, g.topY, 2, gy - g.topY);
  ctx.fillStyle = '#95d5b2'; ctx.fillRect(px, g.topY, 1, gy - g.topY);
  ctx.fillStyle = '#ffc300'; circle(ctx, px, g.topY - 2, 3.4); ctx.fill();
  ctx.fillStyle = '#fff3b0'; circle(ctx, px - 1, g.topY - 3, 1.1); ctx.fill();
  const fy = g.flagY, wave = Math.sin(time * 7) * 1.3;
  ctx.fillStyle = '#ef476f';
  ctx.beginPath(); ctx.moveTo(px - 1, fy); ctx.quadraticCurveTo(px - 8, fy + 3 + wave, px - 16, fy + 7); ctx.quadraticCurveTo(px - 8, fy + 11 + wave, px - 1, fy + 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; starPath(ctx, px - 6, fy + 7, 3, 1.3); ctx.fill();
  ctx.fillStyle = '#6c757d'; ctx.fillRect(px - 4, gy - 4, 8, 4);
}
