// タイル（1マス）の絵。テーマ（場所）と素材（mat）で見た目が変わる
import { rr, starPath, drawCoin } from './sprites.js';

const circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); };

const SLOPE_KINDS = new Set(['sR', 'sL', 'sRa', 'sRb', 'sLa', 'sLb']);

// key の形: "素材|種類" 例 "brick|hard" "|gT" "|sR"
export function paintTile(ctx, P, key) {
  const [matRaw, kindRaw] = key.split('|');
  const frame = parseInt((kindRaw.match(/\d+$/) || ['0'])[0], 10);
  const kind = kindRaw.replace(/\d+$/, '');
  const variant = parseInt((matRaw.match(/\d+$/) || ['0'])[0], 10);
  const mat = matRaw.replace(/\d+$/, '');

  // 坂
  if (SLOPE_KINDS.has(kind)) {
    return paintSlope(ctx, P, kind, mat);
  }
  if (mat && MATS[mat]) {
    const done = MATS[mat](ctx, P, kind, variant, frame);
    if (done !== false) return;
  }
  switch (kind) {
    case 'g': case 'gT': case 'fg': case 'fgT':
      paintGround(ctx, P, kind.endsWith('T'));
      if (kind.startsWith('f')) paintCrack(ctx);
      break;
    case 'brick': paintBrick(ctx, P); break;
    case 'q': paintQ(ctx, frame); break;
    case 'used': paintUsed(ctx); break;
    case 'hard': paintHard(ctx, P); break;
    case 'fake': paintHard(ctx, P); paintCrack(ctx); break;
    case 'pipeTL': case 'pipeTR': case 'pipeL': case 'pipeR': paintPipe(ctx, P, kind); break;
    case 'semi': paintSemi(ctx, P); break;
    case 'spike': paintSpike(ctx); break;
    case 'lava': case 'lavaT': paintLava(ctx, kind === 'lavaT', frame); break;
    case 'water': case 'waterT': paintWater(ctx, P, kind === 'waterT', frame); break;
    case 'coin': drawCoin(ctx, 8, 8, frame * Math.PI / 8 / 3.5); break;
  }
}

// ===================== 地面 =====================
function specks(ctx, color, pts) {
  ctx.fillStyle = color;
  for (const [x, y, r] of pts) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
}
const SPECKS = [[2, 7, 1.2], [10, 4, 0.9], [12, 11, 1.2], [5, 13, 0.9], [7, 9, 0.6], [1, 2, 0.6], [14, 1, 0.6]];

function groundBody(ctx, P) {
  const st = P.bodyStyle || P.groundStyle;
  ctx.fillStyle = P.ground; ctx.fillRect(0, 0, 16, 16);
  switch (st) {
    case 'stone': case 'plaza':
      ctx.strokeStyle = P.groundDark; ctx.lineWidth = 0.8;
      ctx.strokeRect(0.4, 0.4, 7.6, 7.6); ctx.strokeRect(8, 0.4, 7.6, 7.6);
      ctx.strokeRect(-4, 8, 8, 7.6); ctx.strokeRect(4, 8, 8, 7.6); ctx.strokeRect(12, 8, 8, 7.6);
      break;
    case 'brickpave':
      ctx.fillStyle = P.groundDark;
      for (let y = 0; y < 16; y += 4) { ctx.fillRect(0, y, 16, 0.7); for (let x = (y / 4) % 2 ? 0 : 4; x < 16; x += 8) ctx.fillRect(x, y, 0.7, 4); }
      break;
    case 'girder':
      ctx.fillStyle = P.groundDark; ctx.fillRect(0, 0, 16, 2); ctx.fillRect(0, 14, 16, 2);
      ctx.strokeStyle = P.groundDark; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(8, 14); ctx.lineTo(16, 2); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(2, 14); ctx.lineTo(8, 5); ctx.lineTo(14, 14); ctx.fill();
      break;
    case 'concrete':
      ctx.fillStyle = P.groundDark; ctx.fillRect(0, 7.5, 16, 0.7); ctx.fillRect(7.5, 0, 0.7, 7.5);
      specks(ctx, P.groundDark, [[3, 12, 0.6], [12, 3, 0.5], [11, 12, 0.7]]);
      break;
    case 'sand':
      specks(ctx, P.groundDark, [[2, 5, 0.6], [9, 3, 0.5], [13, 10, 0.6], [5, 12, 0.5], [11, 14, 0.4], [7, 8, 0.4]]);
      break;
    case 'asphalt':
      specks(ctx, P.groundDark, [[3, 6, 0.6], [11, 4, 0.5], [13, 12, 0.7], [6, 13, 0.5], [8, 9, 0.4]]);
      break;
    default:
      specks(ctx, P.groundDark, SPECKS);
  }
}

function groundTop(ctx, P) {
  const st = P.groundStyle;
  switch (st) {
    case 'asphalt': // 歩道
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4.8);
      ctx.fillStyle = P.topDark; ctx.fillRect(7.6, 0, 0.6, 4.8);
      ctx.fillStyle = P.topLight; ctx.fillRect(0, 0, 16, 0.8);
      return;
    case 'tile':
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = P.top; ctx.fillRect(0.3, 0, 7.4, 5); ctx.fillRect(8.3, 0, 7.4, 5);
      ctx.fillStyle = P.topLight; ctx.fillRect(0, 0, 16, 0.8);
      return;
    case 'stone': case 'plaza':
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 0, 16, 5);
      ctx.fillStyle = P.top; rr(ctx, 0.4, 0.2, 7.2, 4, 1); ctx.fill(); rr(ctx, 8.4, 0.2, 7.2, 4, 1); ctx.fill();
      return;
    case 'brickpave':
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4.5);
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 4.5, 16, 1); ctx.fillRect(5, 0, 0.7, 4.5); ctx.fillRect(12, 0, 0.7, 4.5);
      return;
    case 'concrete':
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4);
      ctx.fillStyle = P.topLight; ctx.fillRect(0, 0, 16, 1);
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 4, 16, 1);
      return;
    case 'sand':
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4);
      for (const x of [2, 8, 14]) { ctx.beginPath(); ctx.arc(x, 4, 2.4, 0, Math.PI); ctx.fill(); }
      specks(ctx, '#ffffff', [[4, 1.5, 0.5], [12, 2, 0.4]]);
      return;
    case 'girder': // 道路
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(2, 1.6, 6, 0.8);
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 4, 16, 1);
      return;
    case 'rock':
      ctx.fillStyle = P.topDark; ctx.fillRect(0, 0, 16, 5);
      ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 3.6);
      for (const x of [1, 6, 11]) { ctx.beginPath(); ctx.arc(x + 1.5, 4, 1.8, 0, Math.PI); ctx.fillStyle = P.top; ctx.fill(); }
      return;
    case 'flower':
      grassTop(ctx, P);
      specks(ctx, '#ff6fa8', [[3, 2, 1], [11, 1.6, 1]]);
      specks(ctx, '#ffe066', [[7, 2.2, 0.9], [14.5, 2.6, 0.8]]);
      specks(ctx, '#b388ff', [[0.8, 3, 0.7]]);
      return;
    default:
      grassTop(ctx, P);
  }
}
function grassTop(ctx, P) {
  ctx.fillStyle = P.topDark; ctx.fillRect(0, 0, 16, 5.5);
  ctx.fillStyle = P.top; ctx.fillRect(0, 0, 16, 4.2);
  for (const x of [1.5, 5.5, 9.5, 13.5]) {
    ctx.fillStyle = P.topDark; ctx.beginPath(); ctx.arc(x, 5.2, 1.7, 0, Math.PI); ctx.fill();
    ctx.fillStyle = P.top; ctx.beginPath(); ctx.arc(x, 4, 1.7, 0, Math.PI); ctx.fill();
  }
  ctx.fillStyle = P.topLight; ctx.fillRect(0, 0.6, 16, 1);
}

function paintGround(ctx, P, top) {
  groundBody(ctx, P);
  if (top) groundTop(ctx, P);
}

function paintCrack(ctx) {
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(7, 8.5); ctx.lineTo(6, 11); ctx.lineTo(9, 13); ctx.stroke();
}

// ===================== 坂 =====================
function slopeLine(kind) {
  // [左端の高さ, 右端の高さ]（タイルの上からの y）
  switch (kind) {
    case 'sR': return [16, 0];
    case 'sL': return [0, 16];
    case 'sRa': return [16, 8];
    case 'sRb': return [8, 0];
    case 'sLb': return [0, 8];
    case 'sLa': return [8, 16];
  }
  return [16, 16];
}
function paintSlope(ctx, P, kind, mat) {
  const [yl, yr] = slopeLine(kind);
  const path = (off = 0) => { ctx.beginPath(); ctx.moveTo(0, yl + off); ctx.lineTo(16, yr + off); ctx.lineTo(16, 16); ctx.lineTo(0, 16); ctx.closePath(); };
  if (mat === 'wood' || mat === 'grating') { // 木の橋・鉄の通路の坂
    ctx.strokeStyle = mat === 'wood' ? '#7a4f2a' : '#3f4a50'; ctx.lineWidth = 5; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(0, yl + 2.6); ctx.lineTo(16, yr + 2.6); ctx.stroke();
    ctx.strokeStyle = mat === 'wood' ? '#b37a45' : '#8fa1aa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, yl + 1.8); ctx.lineTo(16, yr + 1.8); ctx.stroke();
    return;
  }
  if (mat === 'cable') { // つり橋のケーブル
    ctx.strokeStyle = '#6f807b'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, yl + 1.5); ctx.lineTo(16, yr + 1.5); ctx.stroke();
    ctx.strokeStyle = '#d3e0dc'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, yl + 0.8); ctx.lineTo(16, yr + 0.8); ctx.stroke();
    return;
  }
  if (mat && mat.startsWith('roof')) {
    const c = ROOF_COLORS[mat] || ROOF_COLORS.roof;
    ctx.save(); path(); ctx.clip();
    ctx.fillStyle = c[0]; ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = c[1]; ctx.lineWidth = 0.8;
    for (let k = -16; k < 32; k += 4) { ctx.beginPath(); ctx.moveTo(0, yl + k); ctx.lineTo(16, yr + k); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = c[2]; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, yl + 0.6); ctx.lineTo(16, yr + 0.6); ctx.stroke();
    return;
  }
  ctx.save(); path(); ctx.clip();
  groundBody(ctx, P);
  ctx.restore();
  // 上のふち
  const thick = 5;
  ctx.fillStyle = P.topDark;
  ctx.beginPath(); ctx.moveTo(0, yl); ctx.lineTo(16, yr); ctx.lineTo(16, yr + thick + 1); ctx.lineTo(0, yl + thick + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.top;
  ctx.beginPath(); ctx.moveTo(0, yl); ctx.lineTo(16, yr); ctx.lineTo(16, yr + thick - 0.5); ctx.lineTo(0, yl + thick - 0.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.topLight; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(0, yl + 0.7); ctx.lineTo(16, yr + 0.7); ctx.stroke();
}

// ===================== ブロック =====================
function paintBrick(ctx, P) {
  ctx.fillStyle = P.mortar; ctx.fillRect(0, 0, 16, 16);
  const b = (x, y, w, h) => {
    ctx.fillStyle = P.brick; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = P.brickLight; ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = P.brickDark; ctx.fillRect(x, y + h - 1, w, 1);
  };
  b(0, 0.5, 7.5, 7); b(8.5, 0.5, 7.5, 7);
  b(0, 8.5, 3.5, 7); b(4.5, 8.5, 7, 7); b(12.5, 8.5, 3.5, 7);
}

function paintQ(ctx, frame) {
  const light = ['#ffc93c', '#ffd966', '#ffe699'][frame] || '#ffc93c';
  ctx.fillStyle = '#b8720a'; rr(ctx, 0.3, 0.3, 15.4, 15.4, 2.2); ctx.fill();
  ctx.fillStyle = light; rr(ctx, 1.2, 1.2, 13.6, 13.1, 1.6); ctx.fill();
  ctx.fillStyle = '#b8720a';
  for (const [x, y] of [[2.8, 2.8], [13.2, 2.8], [2.8, 12.6], [13.2, 12.6]]) { circle(ctx, x, y, 0.8); ctx.fill(); }
  ctx.font = 'bold 11px "Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8a4b00'; ctx.fillText('?', 8.8, 8.9);
  ctx.fillStyle = '#fff'; ctx.fillText('?', 8, 8.2);
}

function paintUsed(ctx) {
  ctx.fillStyle = '#6b4226'; rr(ctx, 0.3, 0.3, 15.4, 15.4, 2); ctx.fill();
  ctx.fillStyle = '#a0714f'; rr(ctx, 1.2, 1.2, 13.6, 13.1, 1.5); ctx.fill();
  ctx.fillStyle = '#6b4226';
  for (const [x, y] of [[3, 3], [13, 3], [3, 12.8], [13, 12.8]]) { circle(ctx, x, y, 0.9); ctx.fill(); }
}

function paintHard(ctx, P) {
  ctx.fillStyle = P.hardDark; ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = P.hardLight;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 0); ctx.lineTo(13, 3); ctx.lineTo(3, 3); ctx.lineTo(3, 13); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.hard; ctx.fillRect(3, 3, 10, 10);
}

function paintPipe(ctx, P, k) {
  const left = k.endsWith('L');
  const top = k.startsWith('pipeT');
  if (top) {
    ctx.fillStyle = P.pipeDark; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = P.pipe; ctx.fillRect(left ? 1 : 0, 1, 15, 12);
    if (left) { ctx.fillStyle = P.pipeLight; ctx.fillRect(3, 1, 3, 12); }
    else { ctx.fillStyle = P.pipeDark; ctx.fillRect(11, 1, 3, 12); }
    ctx.fillStyle = P.pipeDark; ctx.fillRect(0, 13, 16, 3);
  } else {
    ctx.fillStyle = P.pipeDark;
    if (left) ctx.fillRect(1.5, 0, 14.5, 16); else ctx.fillRect(0, 0, 14.5, 16);
    ctx.fillStyle = P.pipe;
    if (left) ctx.fillRect(2.5, 0, 13.5, 16); else ctx.fillRect(0, 0, 13.5, 16);
    if (left) { ctx.fillStyle = P.pipeLight; ctx.fillRect(4.5, 0, 3, 16); }
    else { ctx.fillStyle = P.pipeDark; ctx.fillRect(9.5, 0, 3, 16); }
  }
}

function paintSemi(ctx, P) {
  switch (P.semiStyle) {
    case 'arcade': return MATS.arcade(ctx, P, 'semi');
    case 'lantern': return MATS.lantern(ctx, P, 'semi');
    case 'parasol': return MATS.parasol(ctx, P, 'semi', 0);
    case 'steel': return MATS.grating(ctx, P, 'semi');
  }
  ctx.fillStyle = P.semiDark; ctx.fillRect(0, 0, 16, 6);
  ctx.fillStyle = P.semi; ctx.fillRect(0, 0, 16, 4.5);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, 0.5, 16, 1);
  ctx.fillStyle = P.semiDark; ctx.fillRect(7.5, 0, 1, 4.5);
}

function paintSpike(ctx) {
  ctx.fillStyle = '#6c757d'; ctx.fillRect(0, 13, 16, 3);
  for (let i = 0; i < 3; i++) {
    const x = i * 16 / 3;
    ctx.fillStyle = '#ced4da';
    ctx.beginPath(); ctx.moveTo(x + 0.3, 13); ctx.lineTo(x + 8 / 3, 5); ctx.lineTo(x + 16 / 3 - 0.3, 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath(); ctx.moveTo(x + 1.2, 13); ctx.lineTo(x + 8 / 3, 5.5); ctx.lineTo(x + 8 / 3, 13); ctx.closePath(); ctx.fill();
  }
}

function paintLava(ctx, top, frame) {
  if (!top) {
    ctx.fillStyle = '#d64000'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ff6d00';
    for (const [x, y, r] of [[4, 5, 2.4], [11, 10, 2.8], [6, 13, 1.8]]) { circle(ctx, x, (y + frame * 2) % 16, r); ctx.fill(); }
    return;
  }
  ctx.fillStyle = '#d64000'; ctx.fillRect(0, 6, 16, 10);
  ctx.fillStyle = '#ffbe0b';
  ctx.beginPath(); ctx.moveTo(0, 16);
  for (let x = 0; x <= 16; x += 1) ctx.lineTo(x, 6 + Math.sin((x / 16) * Math.PI * 2 + frame * Math.PI / 2) * 1.5);
  ctx.lineTo(16, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff6d00'; ctx.fillRect(0, 9, 16, 7);
}

function paintWater(ctx, P, top, frame) {
  const [c1, c2, c3] = P.water || ['#4cc9f0', '#1e88c7', '#0b5d99'];
  if (!top) {
    const g = ctx.createLinearGradient(0, 0, 0, 16);
    g.addColorStop(0, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(((frame * 4) % 16), 6, 5, 0.8);
    ctx.fillRect(((frame * 4 + 9) % 16), 12, 4, 0.8);
    return;
  }
  ctx.fillStyle = c2; ctx.fillRect(0, 7, 16, 9);
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.moveTo(0, 16);
  for (let x = 0; x <= 16; x += 1) ctx.lineTo(x, 6 + Math.sin((x / 16) * Math.PI * 2 + frame * Math.PI / 2) * 1.3);
  ctx.lineTo(16, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.fillRect(0, 10, 16, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let x = 0; x <= 16; x += 4) {
    const y = 6 + Math.sin((x / 16) * Math.PI * 2 + frame * Math.PI / 2) * 1.3;
    ctx.fillRect(x, y - 0.3, 2, 0.7);
  }
}

// ===================== 素材 =====================
const ROOF_COLORS = {
  roof: ['#a8452f', '#7e2f1f', '#d9765c'],
  roofG: ['#4d8f6a', '#2f6649', '#86c79f'],
  roofK: ['#566173', '#3b4452', '#8a96a8'],
  roofO: ['#d1813f', '#9c5a24', '#f0ae6f']
};

function wall(ctx, base, dark) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, 16, 16);
  if (dark) { ctx.fillStyle = dark; ctx.fillRect(0, 15, 16, 1); }
}
function windowPane(ctx, frame = '#f7f1e3', glass = '#6ec1e4', arch = false, lit = false) {
  ctx.fillStyle = frame;
  if (arch) { ctx.beginPath(); ctx.moveTo(3.5, 14); ctx.lineTo(3.5, 6); ctx.arc(8, 6, 4.5, Math.PI, 0); ctx.lineTo(12.5, 14); ctx.closePath(); ctx.fill(); }
  else ctx.fillRect(3.5, 3, 9, 11);
  ctx.fillStyle = lit ? '#ffd97a' : glass;
  if (arch) { ctx.beginPath(); ctx.moveTo(4.8, 13); ctx.lineTo(4.8, 6.3); ctx.arc(8, 6.3, 3.2, Math.PI, 0); ctx.lineTo(11.2, 13); ctx.closePath(); ctx.fill(); }
  else ctx.fillRect(4.8, 4.3, 6.4, 8.4);
  ctx.fillStyle = frame; ctx.fillRect(7.5, arch ? 3 : 4, 1, 10); ctx.fillRect(4.5, 8.5, 7, 0.8);
}

const MATS = {
  brick(ctx, P, kind) {
    ctx.fillStyle = '#e8d2c0'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#b5543a';
    for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 16; x += 8) ctx.fillRect(x + 0.4, y + 0.4, 7.2, 3.2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 12, 16, 4);
  },
  brickwin(ctx, P, kind, v) { MATS.brick(ctx, P); windowPane(ctx, '#f4efe6', '#5aa9d6', true, P.night); },
  uroko(ctx) {
    ctx.fillStyle = '#7d8ea3'; ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 18; y += 3.2) for (let x = ((y / 3.2) % 2) * 2; x < 18; x += 4) {
      ctx.fillStyle = '#9fb0c4'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI); ctx.fill();
      ctx.strokeStyle = '#5f6f84'; ctx.lineWidth = 0.4; ctx.stroke();
    }
  },
  urokowin(ctx, P) { MATS.uroko(ctx, P); windowPane(ctx, '#ffffff', '#5aa9d6', false, P.night); },
  moegi(ctx) {
    ctx.fillStyle = '#b9dbb0'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#97c18c'; for (let y = 3; y < 16; y += 4) ctx.fillRect(0, y, 16, 0.8);
  },
  moegiwin(ctx, P) { MATS.moegi(ctx, P); windowPane(ctx, '#ffffff', '#6fb6d9', false, P.night); },
  white(ctx) {
    ctx.fillStyle = '#f3efe6'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ddd6c6'; ctx.fillRect(0, 15, 16, 1);
  },
  whitewin(ctx, P) { MATS.white(ctx, P); windowPane(ctx, '#6c7a89', '#8ecae6', false, P.night); },
  roof(ctx, P, kind) { roofFill(ctx, 'roof'); },
  roofG(ctx) { roofFill(ctx, 'roofG'); },
  roofK(ctx) { roofFill(ctx, 'roofK'); },
  roofO(ctx) { roofFill(ctx, 'roofO'); },
  bldg(ctx, P) {
    ctx.fillStyle = P.bldg || '#aab4c2'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = P.night ? '#ffd97a' : '#5f7a99';
    ctx.fillRect(2, 2.5, 5, 4.5); ctx.fillRect(9, 2.5, 5, 4.5);
    ctx.fillRect(2, 9.5, 5, 4.5); ctx.fillRect(9, 9.5, 5, 4.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(2, 2.5, 1.5, 4.5); ctx.fillRect(9, 9.5, 1.5, 4.5);
  },
  roofTop(ctx, P) { // ビルの屋上のふち
    ctx.fillStyle = P.bldg || '#aab4c2'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#e6eaef'; ctx.fillRect(0, 0, 16, 3);
    ctx.fillStyle = '#7d8896'; ctx.fillRect(0, 3, 16, 1);
    ctx.fillStyle = P.night ? '#ffd97a' : '#5f7a99'; ctx.fillRect(2, 8, 5, 5); ctx.fillRect(9, 8, 5, 5);
  },
  container(ctx, P, kind, v) {
    const cols = [['#d64545', '#9e2a2a'], ['#2f6fb5', '#1f4d80'], ['#3c9a5f', '#276b41'], ['#e0892b', '#a8611a']][v % 4];
    ctx.fillStyle = cols[0]; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = cols[1];
    for (let x = 1.5; x < 16; x += 3) ctx.fillRect(x, 1, 1, 14);
    ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 15, 16, 1);
  },
  steel(ctx, P) { lattice(ctx, P.steel || '#8d99a6', P.steelDark || '#5c6873', P.sky ? null : null); },
  redsteel(ctx) { lattice(ctx, '#e0443a', '#9c2a22'); },
  bridgeTower(ctx) {
    ctx.fillStyle = '#c7d6d0'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#a9bcb5'; ctx.fillRect(0, 0, 2, 16); ctx.fillRect(14, 0, 2, 16);
    ctx.fillStyle = '#e6efec'; ctx.fillRect(3, 0, 2, 16);
    ctx.fillStyle = '#9bb0a9'; ctx.fillRect(0, 7.5, 16, 1);
  },
  girder(ctx) {
    ctx.fillStyle = '#b3c4be'; ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#7f948d'; ctx.lineWidth = 1.6;
    ctx.strokeRect(0.8, 0.8, 14.4, 14.4);
    ctx.beginPath(); ctx.moveTo(1, 1); ctx.lineTo(15, 15); ctx.moveTo(15, 1); ctx.lineTo(1, 15); ctx.stroke();
  },
  platform(ctx, P, kind) { // 駅のホーム（黄色い点字ブロック）
    ctx.fillStyle = '#b8b4ab'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#8f8a80'; ctx.fillRect(0, 5, 16, 1); ctx.fillRect(0, 15, 16, 1);
    ctx.fillStyle = '#f2c230'; ctx.fillRect(0, 1.5, 16, 2.6);
    ctx.fillStyle = '#d9a816';
    for (let x = 1; x < 16; x += 2.5) { circle(ctx, x, 2.8, 0.5); ctx.fill(); }
    ctx.fillStyle = '#e8e4db'; ctx.fillRect(0, 0, 16, 1.2);
  },
  rail(ctx) { // 高架
    ctx.fillStyle = '#b9b2a6'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#6d6a64'; ctx.fillRect(0, 0, 16, 2);
    ctx.fillStyle = '#9a9388'; ctx.fillRect(0, 12, 16, 4);
  },
  lantern(ctx, P, kind) { // ちょうちん
    ctx.strokeStyle = '#5b3a1a'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, 2); ctx.stroke();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(4.5, 1.6, 7, 1.4); ctx.fillRect(4.5, 12.6, 7, 1.4);
    ctx.fillStyle = '#e53935'; rr(ctx, 2.5, 2.8, 11, 10, 4.5); ctx.fill();
    ctx.fillStyle = '#ff7a6e'; rr(ctx, 4, 4, 3, 7.5, 1.5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.5;
    for (const y of [5.5, 8, 10.5]) { ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(13, y); ctx.stroke(); }
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(7.5, 14, 1, 2);
  },
  chinaRoof(ctx, P, kind) {
    ctx.fillStyle = '#2e7d5b'; ctx.fillRect(0, 0, 16, 10);
    ctx.fillStyle = '#4caf82'; for (let x = 0; x < 16; x += 3) ctx.fillRect(x, 0, 1.6, 9);
    ctx.fillStyle = '#c62828'; ctx.fillRect(0, 9, 16, 3);
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(0, 12, 16, 1.2);
    if (kind === 'semi') return;
    ctx.fillStyle = '#b71c1c'; ctx.fillRect(0, 13, 16, 3);
  },
  pillar(ctx) {
    ctx.fillStyle = '#c62828'; ctx.fillRect(2, 0, 12, 16);
    ctx.fillStyle = '#e57373'; ctx.fillRect(4, 0, 2, 16);
    ctx.fillStyle = '#8e1b1b'; ctx.fillRect(12, 0, 2, 16);
  },
  rock(ctx, P) {
    ctx.fillStyle = P.rockDark || '#5d5a52'; rr(ctx, 0, 0.5, 16, 15.5, 4); ctx.fill();
    ctx.fillStyle = P.rock || '#8a867b'; rr(ctx, 1, 1, 14, 13, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(ctx, 3, 2.5, 6, 3, 1.5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(10, 5); ctx.lineTo(8, 9); ctx.lineTo(11, 12); ctx.stroke();
  },
  wood(ctx, P, kind) {
    if (kind === 'semi') {
      ctx.fillStyle = '#7a4f2a'; ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = '#b37a45'; ctx.fillRect(0, 0, 16, 4.5);
      ctx.fillStyle = '#7a4f2a'; ctx.fillRect(5, 0, 0.7, 4.5); ctx.fillRect(11, 0, 0.7, 4.5);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, 0.4, 16, 0.8);
      return;
    }
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#b37a45'; ctx.fillRect(1, 1, 14, 14);
    ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(1, 1); ctx.lineTo(15, 15); ctx.moveTo(15, 1); ctx.lineTo(1, 15); ctx.stroke();
  },
  deck(ctx, P, kind) {
    ctx.fillStyle = '#6d4c33'; ctx.fillRect(0, 0, 16, kind === 'semi' ? 6 : 16);
    ctx.fillStyle = '#a47551'; ctx.fillRect(0, 0, 16, 4.4);
    ctx.fillStyle = '#6d4c33'; ctx.fillRect(3.5, 0, 0.6, 4.4); ctx.fillRect(9.5, 0, 0.6, 4.4);
    if (kind !== 'semi') { ctx.fillStyle = '#5a3d28'; ctx.fillRect(2, 5, 2, 11); ctx.fillRect(12, 5, 2, 11); }
  },
  arcade(ctx, P, kind) { // 商店街のアーケード屋根
    ctx.fillStyle = 'rgba(200,235,240,0.75)'; ctx.fillRect(0, 0, 16, 5);
    ctx.fillStyle = '#6b8a92'; ctx.fillRect(0, 5, 16, 1.4); ctx.fillRect(0, 0, 16, 0.8);
    ctx.fillStyle = '#6b8a92'; ctx.fillRect(7.5, 0, 1, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(1.5, 1.4, 4, 0.8); ctx.fillRect(9.5, 1.4, 4, 0.8);
  },
  parasol(ctx, P, kind, v) { // ビーチパラソル
    const cols = [['#ff5a5f', '#ffffff'], ['#2ec4b6', '#ffffff'], ['#ffb703', '#ffffff'], ['#3a86ff', '#ffe066']][v % 4];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i % 2]; ctx.fillRect(i * 4, 0, 4, 4.5); }
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 4.5, 16, 1);
  },
  grating(ctx) {
    ctx.fillStyle = '#5c6b73'; ctx.fillRect(0, 0, 16, 5);
    ctx.fillStyle = '#8fa1aa'; for (let x = 0.5; x < 16; x += 2) ctx.fillRect(x, 0.5, 1, 4);
    ctx.fillStyle = '#3f4a50'; ctx.fillRect(0, 4.5, 16, 1);
  },
  hedge(ctx) {
    ctx.fillStyle = '#2f7a3c'; rr(ctx, 0, 0, 16, 16, 3); ctx.fill();
    ctx.fillStyle = '#48a357';
    for (const [x, y] of [[4, 4], [11, 3], [7, 9], [13, 11], [3, 12]]) { circle(ctx, x, y, 3); ctx.fill(); }
  },
  glass(ctx) { // 温室のガラス
    ctx.fillStyle = 'rgba(190,235,245,0.9)'; ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.strokeRect(0.6, 0.6, 14.8, 14.8);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(3, 13); ctx.lineTo(9, 3); ctx.lineTo(11, 3); ctx.lineTo(5, 13); ctx.fill();
  },
  star(ctx) { // 掬星台の石
    ctx.fillStyle = '#5b5f73'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ffe066'; starPath(ctx, 8, 8.5, 5.5, 2.4); ctx.fill();
    ctx.fillStyle = '#fff6c2'; starPath(ctx, 7.5, 8, 2.5, 1.1); ctx.fill();
  },
  torii(ctx) {
    ctx.fillStyle = '#d7322b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ef6a5b'; ctx.fillRect(0, 0, 16, 2);
    ctx.fillStyle = '#9d1f1a'; ctx.fillRect(0, 14, 16, 2);
  },
  cable(ctx, P, kind) {
    ctx.strokeStyle = '#6f807b'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(16, 1.5); ctx.stroke();
    ctx.strokeStyle = '#d3e0dc'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, 0.8); ctx.lineTo(16, 0.8); ctx.stroke();
  },
  sandcastle(ctx) {
    ctx.fillStyle = '#e8c887'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#d4ae68'; for (let y = 4; y < 16; y += 4) ctx.fillRect(0, y, 16, 0.8);
    ctx.fillStyle = '#c29a55'; ctx.fillRect(6, 9, 4, 7);
  }
};

function roofFill(ctx, name) {
  const c = ROOF_COLORS[name];
  ctx.fillStyle = c[0]; ctx.fillRect(0, 0, 16, 16);
  ctx.strokeStyle = c[1]; ctx.lineWidth = 0.8;
  for (let y = 2; y < 16; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(16, y); ctx.stroke(); }
}

function lattice(ctx, c, dark) {
  ctx.fillStyle = dark; ctx.fillRect(0, 0, 2, 16); ctx.fillRect(14, 0, 2, 16);
  ctx.fillStyle = c; ctx.fillRect(0.4, 0, 1.2, 16); ctx.fillRect(14.4, 0, 1.2, 16);
  ctx.strokeStyle = c; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(15, 16); ctx.moveTo(15, 0); ctx.lineTo(1, 16); ctx.stroke();
  ctx.fillStyle = c; ctx.fillRect(0, 0, 16, 1.2);
}
