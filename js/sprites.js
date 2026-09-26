// キャラクター・敵・アイテムの絵（今は図形で描いた仮の絵）
// デザイン構築のときは、ここを画像の描画に置きかえればOK

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); }

export function starPath(ctx, cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = rot + (i * Math.PI) / n;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

import { Art } from './art.js';
import { picto } from './picto.js';

// 足元のかげ
export function shadow(ctx, cx, by, w, a = 0.2) {
  ctx.fillStyle = `rgba(20,20,40,${a})`;
  ctx.beginPath(); ctx.ellipse(cx, by - 0.3, w, w * 0.22, 0, 0, Math.PI * 2); ctx.fill();
}

function rinFrame(p, time) {
  const pre = p.powered ? 'rinP/' : 'rin/';
  switch (p.pose) {
    case 'dead': return 'rin/dead';
    case 'walk': return pre + 'run' + (Math.floor((((p.walkPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2)) % 4);
    case 'jump': return pre + 'jump';
    case 'fall': return pre + 'fall';
    case 'skid': return pre + 'skid';
    case 'climb': return pre + 'climb' + (Math.floor(p.y / 6) & 1);
    case 'win': return pre + 'win';
  }
  if ((Math.floor(time * 10) % 37) === 0) return pre + 'blink';
  return pre + (Math.floor(time * 1.6) % 2 ? 'idle1' : 'idle0');
}

// ===================== りん =====================
export function drawRin(ctx, p, time) {
  if (Art.has('rin/idle0')) {
    const x = p.x + p.w / 2, y = p.y + p.h;
    if (p.grounded && p.pose !== 'dead') shadow(ctx, x, y, 6.5);
    if (p.star > 0) {
      const hue = (time * 500) % 360;
      const gr = ctx.createRadialGradient(x, y - 9, 2, x, y - 9, 16);
      gr.addColorStop(0, `hsla(${hue},100%,70%,0.75)`); gr.addColorStop(1, `hsla(${(hue + 60) % 360},100%,60%,0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y - 9, 16, 0, Math.PI * 2); ctx.fill();
    }
    // ジャンプぐつ：かかとに小さな羽（のこり3秒でちかちか）
    const wings = p.boots > 0 && p.pose !== 'dead' && (p.boots > 3 || Math.floor(time * 10) % 2 === 0);
    const wf = 'bootwing/' + (p.grounded ? 0 : Math.floor(time * 12) % 2);
    if (wings) Art.draw(ctx, wf, x - p.facing * 2.5, y - 2.5, p.facing < 0);
    const sq = p.pose === 'dead' ? 0 : (p.sq || 0);
    const sx = sq > 0 ? 1 + sq * 0.9 : 1 + sq * 0.55, sy = sq > 0 ? 1 - sq * 0.8 : 1 - sq * 0.8;
    Art.draw(ctx, rinFrame(p, time), x, y, p.pose !== 'dead' && p.facing < 0, sx, sy);
    if (wings) Art.draw(ctx, wf, x + p.facing * 0.5, y - 1.5, p.facing < 0);
    if (p.star > 0) {
      for (let i = 0; i < 3; i++) {
        const a = time * 7 + i * 2.1;
        ctx.fillStyle = `hsl(${(time * 600 + i * 120) % 360},100%,75%)`;
        starPath(ctx, x + Math.cos(a) * 10, y - 9 + Math.sin(a * 1.3) * 10, 2.2, 0.8, 4); ctx.fill();
      }
    }
    return;
  }
  const x = p.x + p.w / 2, y = p.y + p.h;
  const pose = p.pose;
  ctx.save();
  ctx.translate(x, y);
  if (pose === 'dead') {
    drawRinDead(ctx);
    ctx.restore();
    return;
  }
  ctx.scale(p.facing, 1);

  const star = p.star > 0;
  const skin = '#ffd9b5', hair = '#4a2a14', pants = '#3867d6', shoe = '#6d3a1c';
  let shirt = p.powered ? '#ff9f1c' : '#ff5a5f';
  if (star) shirt = `hsl(${(time * 900) % 360},90%,60%)`;
  const scarf = p.powered ? '#ffd23f' : '#2ec4b6';
  const walk = pose === 'walk' ? Math.sin(p.walkPhase) : 0;
  const bob = pose === 'walk' ? Math.abs(Math.cos(p.walkPhase)) * -0.7 : 0;
  const air = pose === 'jump' || pose === 'fall';

  // マント（パワーアップ中）
  if (p.powered) {
    const flap = Math.sin(time * 12) * 1.2 + (air ? -2 : 0) - Math.min(3, Math.abs(p.vx) / 40);
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(-2.5, -6.2 + bob);
    ctx.quadraticCurveTo(-7 + flap, -3, -8 + flap, 0.2);
    ctx.lineTo(-2, -0.5);
    ctx.closePath();
    ctx.fill();
  }

  // マフラーのしっぽ
  {
    const sway = Math.sin(time * 10) * 1.2 - Math.min(2.5, Math.abs(p.vx) / 50);
    ctx.fillStyle = scarf;
    ctx.beginPath();
    ctx.moveTo(-2.5, -6.4 + bob);
    ctx.lineTo(-7 + sway, -7.4 + bob + (air ? -1.5 : 0));
    ctx.lineTo(-6.5 + sway, -5.2 + bob);
    ctx.lineTo(-2.5, -4.8 + bob);
    ctx.closePath();
    ctx.fill();
  }

  // 足
  ctx.fillStyle = pants;
  if (air) {
    rr(ctx, -3.6, -3.2, 2.7, 2.8, 0.8); ctx.fill();          // 後ろ足
    rr(ctx, 0.9, -4.4, 2.7, 2.6, 0.8); ctx.fill();           // 前足（曲げる）
    ctx.fillStyle = shoe;
    rr(ctx, -4.3, -1.2, 3.4, 1.7, 0.7); ctx.fill();
    rr(ctx, 1.2, -2.6, 3.4, 1.7, 0.7); ctx.fill();
  } else if (pose === 'climb') {
    rr(ctx, -2.6, -3, 2.6, 3, 0.8); ctx.fill();
    rr(ctx, 0.2, -3, 2.6, 3, 0.8); ctx.fill();
    ctx.fillStyle = shoe;
    rr(ctx, -2.8, -1.3, 6, 1.6, 0.7); ctx.fill();
  } else {
    const s = walk * 2.2;
    rr(ctx, -3.3 - s, -3, 2.6, 3, 0.8); ctx.fill();
    rr(ctx, 0.7 + s, -3, 2.6, 3, 0.8); ctx.fill();
    ctx.fillStyle = shoe;
    rr(ctx, -3.6 - s, -1.4, 3.4, 1.7, 0.7); ctx.fill();
    rr(ctx, 0.5 + s, -1.4, 3.4, 1.7, 0.7); ctx.fill();
  }

  // 体
  ctx.save();
  ctx.translate(0, bob);
  ctx.fillStyle = shirt;
  rr(ctx, -3.6, -6.3, 7.2, 4.2, 1.5); ctx.fill();
  ctx.fillStyle = pants;
  ctx.fillRect(-3.6, -3.1, 7.2, 1.1);
  if (p.powered) {
    ctx.fillStyle = '#fff3b0';
    starPath(ctx, 0.8, -4.4, 1.5, 0.7); ctx.fill();
  }
  // 腕
  ctx.fillStyle = skin;
  if (air) {
    circle(ctx, 3.6, -8.2, 1.2); ctx.fill();   // 前の手をあげる
    circle(ctx, -3.9, -4.8, 1.1); ctx.fill();
  } else if (pose === 'climb') {
    circle(ctx, 3.8, -7.4, 1.2); ctx.fill();
    circle(ctx, 3.4, -4.6, 1.1); ctx.fill();
  } else {
    circle(ctx, 3.3 + walk * -1.4, -4.3, 1.1); ctx.fill();
    circle(ctx, -3.5 + walk * 1.4, -4.3, 1.1); ctx.fill();
  }
  // マフラー
  ctx.fillStyle = scarf;
  rr(ctx, -3.9, -7, 7.8, 1.7, 0.8); ctx.fill();

  // 頭
  const hx = 0.6, hy = -11;
  ctx.fillStyle = hair;
  ellipse(ctx, hx - 4.3, hy + 0.8, 2.3, 3.4); ctx.fill();          // うしろ髪
  ctx.fillStyle = skin;
  circle(ctx, hx, hy, 5.5); ctx.fill();
  // 前髪
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(hx - 0.3, hy - 1.4, 6, 4.4, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(hx + 5.7, hy - 0.6);
  ctx.lineTo(hx + 4.6, hy - 0.2);
  ctx.lineTo(hx + 3.6, hy - 1.3);
  ctx.lineTo(hx + 2.4, hy + 0.1);
  ctx.lineTo(hx + 1.2, hy - 1.2);
  ctx.lineTo(hx - 0.2, hy - 0.4);
  ctx.lineTo(hx - 1.6, hy - 1.4);
  ctx.lineTo(hx - 6.2, hy - 1.2);
  ctx.closePath();
  ctx.fill();
  // アホ毛
  ctx.strokeStyle = hair; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hx - 0.5, hy - 5.6); ctx.quadraticCurveTo(hx + 0.5, hy - 8.5, hx + 2.6, hy - 7.6); ctx.stroke();
  // 目
  const blink = (Math.floor(time * 10) % 37) === 0;
  ctx.fillStyle = '#1b1b1b';
  if (blink) {
    ctx.fillRect(hx + 1.1, hy + 0.9, 1.6, 0.5);
    ctx.fillRect(hx + 3.6, hy + 0.9, 1.6, 0.5);
  } else {
    ellipse(ctx, hx + 1.9, hy + 0.9, 0.8, 1.25); ctx.fill();
    ellipse(ctx, hx + 4.3, hy + 0.9, 0.75, 1.2); ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, hx + 2.1, hy + 0.5, 0.35); ctx.fill();
    circle(ctx, hx + 4.5, hy + 0.5, 0.33); ctx.fill();
  }
  // ほっぺと口
  ctx.fillStyle = 'rgba(255,120,130,0.55)';
  ellipse(ctx, hx + 4.4, hy + 2.8, 1.1, 0.7); ctx.fill();
  ctx.strokeStyle = '#8a3b2a'; ctx.lineWidth = 0.55;
  ctx.beginPath(); ctx.arc(hx + 3.1, hy + 2.6, 0.9, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawRinDead(ctx) {
  const skin = '#ffd9b5', hair = '#4a2a14';
  ctx.fillStyle = '#ff5a5f';
  rr(ctx, -3.6, -6.3, 7.2, 4.2, 1.5); ctx.fill();
  ctx.fillStyle = '#3867d6';
  rr(ctx, -3.3, -3, 2.6, 3, 0.8); ctx.fill();
  rr(ctx, 0.7, -3, 2.6, 3, 0.8); ctx.fill();
  ctx.fillStyle = skin;
  circle(ctx, -5, -8.5, 1.2); ctx.fill();
  circle(ctx, 5, -8.5, 1.2); ctx.fill();
  circle(ctx, 0, -11, 5.5); ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(0, -12.6, 6, 4.2, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 0.7;
  for (const ex of [-2, 2]) {
    ctx.beginPath();
    ctx.moveTo(ex - 0.9, -11); ctx.lineTo(ex + 0.9, -9.2);
    ctx.moveTo(ex + 0.9, -11); ctx.lineTo(ex - 0.9, -9.2);
    ctx.stroke();
  }
  ctx.beginPath(); ellipse(ctx, 0, -7.6, 1, 0.8); ctx.fillStyle = '#8a3b2a'; ctx.fill();
}

// ===================== 敵 =====================
function flipIfDead(ctx, e) {
  if (e.flipped) {
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.scale(1, -1);
    ctx.translate(-(e.x + e.w / 2), -(e.y + e.h / 2));
  }
}

function eyes(ctx, cx, cy, dir, gap, rx, ry, angry = false) {
  for (const s of [-1, 1]) {
    const ex = cx + s * gap + dir * 0.8;
    ctx.fillStyle = '#fff';
    ellipse(ctx, ex, cy, rx, ry); ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    ellipse(ctx, ex + dir * rx * 0.35, cy + ry * 0.15, rx * 0.55, ry * 0.6); ctx.fill();
    if (angry) {
      ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(ex - rx * 1.1, cy - ry * 1.5 + (s < 0 ? -0.8 : 0.8) * 0);
      ctx.lineTo(ex + rx * 1.1, cy - ry * 1.5 + (s * dir < 0 ? -1 : 1) * 0.9);
      ctx.stroke();
    }
  }
}

// 敵をSVGの絵で描く（やっつけてひっくり返ったときは上下さかさま）
function enemyArt(ctx, name, e, flipX, shadowW = 0) {
  if (!Art.has(name)) return false;
  const cx = e.x + e.w / 2, by = e.y + e.h;
  if (e.flipped) {
    ctx.save(); ctx.translate(cx, e.y + e.h / 2); ctx.scale(1, -1);
    Art.draw(ctx, name, 0, e.h / 2, flipX);
    ctx.restore();
    return true;
  }
  if (shadowW && e.grounded !== false) shadow(ctx, cx, by, shadowW, 0.18);
  return Art.draw(ctx, name, cx, by, flipX);
}

const SLIME_COLORS = { green: ['#70d255', '#3f9e2c'], teal: ['#48cae4', '#0096c7'], purple: ['#9b5de5', '#6a2fb3'] };
export function drawSlime(ctx, e, P, time) {
  {
    const c = SLIME_COLORS[P.slime] ? P.slime : 'green';
    const nm = e.dead && !e.flipped ? `slime/${c}/flat` : `slime/${c}/${Math.floor(e.t * 4) % 2}`;
    if (enemyArt(ctx, nm, e, e.dir < 0, 7)) return;
  }
  const cx = e.x + e.w / 2, by = e.y + e.h;
  const [body, dark] = SLIME_COLORS[P.slime] || SLIME_COLORS.green;
  ctx.save();
  if (e.dead && !e.flipped) {
    ctx.fillStyle = body;
    ellipse(ctx, cx, by - 2, 8.5, 2.6); ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(cx - 4, by - 3, 2, 0.8); ctx.fillRect(cx + 2, by - 3, 2, 0.8);
    ctx.restore();
    return;
  }
  flipIfDead(ctx, e);
  const wob = Math.sin(e.t * 9) * 0.7;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(cx - 8, by);
  ctx.bezierCurveTo(cx - 8.5, by - 13 + wob, cx + 8.5, by - 13 + wob, cx + 8, by);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(cx - 7, by - 0.6);
  ctx.bezierCurveTo(cx - 7.5, by - 12 + wob, cx + 7.5, by - 12 + wob, cx + 7, by - 0.6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ellipse(ctx, cx - 3, by - 7.5 + wob * 0.5, 1.8, 1.1, -0.5); ctx.fill();
  eyes(ctx, cx, by - 5.5, e.dir, 2.4, 1.5, 1.9);
  ctx.restore();
}

export function drawSpiky(ctx, e, P, time) {
  if (enemyArt(ctx, (P.spiky === 'urchin' ? 'urchin/' : 'spiky/') + (Math.floor(e.t * 5) % 2), e, e.dir < 0, 7)) return;
  const cx = e.x + e.w / 2, by = e.y + e.h;
  const cy = by - 6.5;
  ctx.save();
  flipIfDead(ctx, e);
  if (P.spiky === 'urchin') { // ウニ
    ctx.strokeStyle = '#2b1740'; ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.sin(e.t * 3 + i) * 0.08;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4); ctx.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); ctx.stroke();
    }
    ctx.fillStyle = '#3c1f5c'; circle(ctx, cx, cy, 5.5); ctx.fill();
    ctx.fillStyle = '#5a3285'; circle(ctx, cx - 1.2, cy - 1.2, 3.5); ctx.fill();
    eyes(ctx, cx, cy + 0.5, e.dir, 2.1, 1.3, 1.6, true);
    ctx.restore();
    return;
  }
  // トゲ
  ctx.fillStyle = '#f1f1f1';
  ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const bx = cx + Math.cos(a) * 5.5, byy = cy + Math.sin(a) * 5.5;
    const tx = cx + Math.cos(a) * 9, ty = cy + Math.sin(a) * 9;
    const px = Math.cos(a + Math.PI / 2) * 1.8, py = Math.sin(a + Math.PI / 2) * 1.8;
    ctx.beginPath(); ctx.moveTo(bx + px, byy + py); ctx.lineTo(tx, ty); ctx.lineTo(bx - px, byy - py); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  // 足
  const step = Math.sin(e.t * 12) * 1.2;
  ctx.fillStyle = '#3c096c';
  ellipse(ctx, cx - 3 + step, by - 1, 2.4, 1.3); ctx.fill();
  ellipse(ctx, cx + 3 - step, by - 1, 2.4, 1.3); ctx.fill();
  // 体
  ctx.fillStyle = '#7b2cbf';
  circle(ctx, cx, cy, 6.3); ctx.fill();
  ctx.fillStyle = '#9d4edd';
  circle(ctx, cx - 1.2, cy - 1.2, 4.5); ctx.fill();
  eyes(ctx, cx, cy + 0.2, e.dir, 2.3, 1.4, 1.7, true);
  ctx.restore();
}

export function drawBird(ctx, e, P, time) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  const kind = P.bird || 'chick';
  {
    const nm = `bird/${kind}/${Math.floor(e.t * 7) % 2}`;
    if (Art.has(nm)) {
      if (e.flipped) { ctx.save(); ctx.translate(cx, cy); ctx.scale(1, -1); Art.draw(ctx, nm, 0, 0, e.dir < 0); ctx.restore(); }
      else Art.draw(ctx, nm, cx, cy, e.dir < 0);
      return;
    }
  }
  ctx.save();
  flipIfDead(ctx, e);
  ctx.translate(cx, cy);
  ctx.scale(e.dir, 1);
  const flap = Math.sin(e.t * 18);
  if (kind === 'bat') {
    ctx.fillStyle = '#3c1361';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -1); ctx.lineTo(s * 9, -4 - flap * 3); ctx.lineTo(s * 7.5, 0.5 - flap * 1.5);
      ctx.lineTo(s * 5.5, -0.5); ctx.lineTo(s * 4, 2); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#5a189a'; circle(ctx, 0, 0, 4.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3.5, -3); ctx.lineTo(-2.5, -6.5); ctx.lineTo(-1, -3.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(3.5, -3); ctx.lineTo(2.5, -6.5); ctx.lineTo(1, -3.5); ctx.fill();
    ctx.fillStyle = '#ff4d6d'; circle(ctx, -1.6, -0.6, 1); ctx.fill(); circle(ctx, 1.9, -0.6, 1); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-0.8, 2); ctx.lineTo(-0.3, 3.4); ctx.lineTo(0.2, 2); ctx.fill();
  } else if (kind === 'bee') { // ハチ
    ctx.fillStyle = 'rgba(220,240,255,0.85)';
    ellipse(ctx, -1, -5 - flap, 4, 2.6, -0.4); ctx.fill(); ellipse(ctx, 2, -5 + flap, 3.5, 2.3, 0.4); ctx.fill();
    ctx.fillStyle = '#ffc300'; ellipse(ctx, 0, 0, 6.5, 5); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.fillRect(-2.5, -4.6, 1.8, 9.2); ctx.fillRect(1, -4.8, 1.8, 9.6);
    ctx.beginPath(); ctx.moveTo(-6.5, 0); ctx.lineTo(-9.5, 0.8); ctx.lineTo(-6.5, 1.8); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; circle(ctx, 4, -1.2, 1); ctx.fill();
  } else {
    const col = { crow: ['#2b2d42', '#1b1c2b', '#f4a100'], gull: ['#f5f7fa', '#b9c2cc', '#f4a100'], pigeon: ['#9aa5b8', '#6f7a8f', '#e8b04a'], chick: ['#ffd166', '#f4a100', '#ff7b00'] }[kind] || ['#ffd166', '#f4a100', '#ff7b00'];
    ctx.fillStyle = col[0]; ellipse(ctx, 0, 0, 6.5, 5.5); ctx.fill();
    if (kind === 'pigeon') { ctx.fillStyle = '#7fc8a9'; ellipse(ctx, 3, 1, 2.5, 2); ctx.fill(); }
    if (kind === 'chick') { ctx.fillStyle = '#fff1c1'; ellipse(ctx, 1, 2, 3.5, 2.6); ctx.fill(); }
    ctx.fillStyle = col[1];
    if (kind === 'gull') {
      ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(-11, -5 - flap * 4); ctx.lineTo(-2, 2); ctx.fill();
      ctx.fillStyle = '#4a5360'; ctx.beginPath(); ctx.moveTo(-9, -4 - flap * 4); ctx.lineTo(-11, -5 - flap * 4); ctx.lineTo(-8, -2.5 - flap * 3); ctx.fill();
    } else {
      ellipse(ctx, -2, -0.5 - flap * 1.5, 3.8, 2.3 + flap * 0.8, -0.3); ctx.fill();
    }
    ctx.fillStyle = col[2];
    ctx.beginPath(); ctx.moveTo(5.5, -0.8); ctx.lineTo(8.8, 0.4); ctx.lineTo(5.5, 1.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = kind === 'crow' ? '#ffffff' : '#1b1b1b';
    circle(ctx, 2.9, -1.8, 1); ctx.fill();
    if (kind === 'crow') { ctx.fillStyle = '#1b1b1b'; circle(ctx, 3.1, -1.7, 0.5); ctx.fill(); }
    if (kind === 'chick') { ctx.fillStyle = '#f4a100'; ctx.beginPath(); ctx.moveTo(-1, -5.5); ctx.lineTo(0.5, -8.5); ctx.lineTo(1.5, -5.6); ctx.fill(); }
  }
  ctx.restore();
}

// カニ
export function drawCrab(ctx, e, P, time) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  if (enemyArt(ctx, e.dead && !e.flipped ? 'crab/flat' : 'crab/' + (Math.floor(e.t * 6) % 2), e, false, 8)) return;
  ctx.save();
  if (e.dead && !e.flipped) {
    ctx.fillStyle = '#e4572e'; ellipse(ctx, cx, by - 2, 8, 2.5); ctx.fill();
    ctx.restore(); return;
  }
  flipIfDead(ctx, e);
  const step = Math.sin(e.t * 16) * 1.2;
  ctx.strokeStyle = '#b8341b'; ctx.lineWidth = 1.2;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    ctx.beginPath(); ctx.moveTo(cx + s * 4, by - 4); ctx.lineTo(cx + s * (7 + k * 1.5), by - 1 + (k % 2 ? step : -step) * 0.5); ctx.stroke();
  }
  ctx.fillStyle = '#e4572e'; ellipse(ctx, cx, by - 5, 7, 4.5); ctx.fill();
  ctx.fillStyle = '#ff8a65'; ellipse(ctx, cx - 1.5, by - 6.5, 3, 1.6); ctx.fill();
  // はさみ
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#e4572e'; circle(ctx, cx + s * 8, by - 9 + Math.sin(e.t * 6 + s) * 0.8, 2.6); ctx.fill();
    ctx.fillStyle = '#b8341b'; ctx.fillRect(cx + s * 8 - 0.4, by - 11.5, 0.8, 2.5);
  }
  // 目
  ctx.fillStyle = '#e4572e'; ctx.fillRect(cx - 2.8, by - 11, 1.2, 3); ctx.fillRect(cx + 1.6, by - 11, 1.2, 3);
  ctx.fillStyle = '#fff'; circle(ctx, cx - 2.2, by - 11.5, 1.4); ctx.fill(); circle(ctx, cx + 2.2, by - 11.5, 1.4); ctx.fill();
  ctx.fillStyle = '#1b1b1b'; circle(ctx, cx - 2.2 + e.dir * 0.4, by - 11.4, 0.7); ctx.fill(); circle(ctx, cx + 2.2 + e.dir * 0.4, by - 11.4, 0.7); ctx.fill();
  ctx.restore();
}

export function drawFrog(ctx, e, P, time) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  if (enemyArt(ctx, e.grounded ? 'frog/sit' : 'frog/jump', e, e.dir < 0, e.grounded ? 7 : 0)) return;
  ctx.save();
  flipIfDead(ctx, e);
  ctx.translate(cx, by);
  ctx.scale(e.dir, 1);
  const air = !e.grounded;
  const body = P.night ? '#4d9e7a' : '#52b788';
  const dark = '#2d6a4f';
  ctx.fillStyle = dark;
  if (air) {
    rr(ctx, -6, -3, 3, 5, 1); ctx.fill();
    rr(ctx, 2.5, -3, 3, 5, 1); ctx.fill();
  } else {
    ellipse(ctx, -5, -1.2, 3, 1.5); ctx.fill();
    ellipse(ctx, 5, -1.2, 3, 1.5); ctx.fill();
  }
  ctx.fillStyle = body;
  ellipse(ctx, 0, -4.8, 7, air ? 5 : 4.6); ctx.fill();
  ctx.fillStyle = '#d8f3dc';
  ellipse(ctx, 1.5, -3.2, 3.8, 2.2); ctx.fill();
  for (const s of [-1, 1]) {
    ctx.fillStyle = body;
    circle(ctx, s * 3.2 + 0.8, -9.2, 2.6); ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, s * 3.2 + 0.8, -9.4, 1.8); ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    circle(ctx, s * 3.2 + 1.4, -9.4, 0.95); ctx.fill();
  }
  ctx.strokeStyle = dark; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(1, -5.2); ctx.quadraticCurveTo(4, -4.2, 6.2, -5.6); ctx.stroke();
  ctx.restore();
}

export function drawRock(ctx, e, P, time) {
  const x = e.x, y = e.y;
  const shakeX = e.state === 'land' && e.timer > 0.6 ? Math.sin(e.t * 60) * 0.6 : 0;
  if (Art.has('rock/calm')) { Art.draw(ctx, e.angry ? 'rock/angry' : 'rock/calm', x + shakeX, y); return; }
  ctx.save();
  ctx.translate(shakeX, 0);
  // 下のトゲ
  ctx.fillStyle = '#d9d9d9';
  for (let i = 0; i < 4; i++) {
    const bx = x + 2 + i * 5.5;
    ctx.beginPath(); ctx.moveTo(bx, y + 22); ctx.lineTo(bx + 2.7, y + 26); ctx.lineTo(bx + 5.4, y + 22); ctx.fill();
  }
  ctx.fillStyle = '#5c677d';
  rr(ctx, x, y, 24, 24, 4); ctx.fill();
  ctx.fillStyle = '#8d99ae';
  rr(ctx, x + 1.5, y + 1.5, 21, 20, 3.5); ctx.fill();
  ctx.fillStyle = '#adb5bd';
  rr(ctx, x + 3, y + 2.5, 9, 4, 2); ctx.fill();
  ctx.strokeStyle = '#5c677d'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x + 17, y + 3); ctx.lineTo(x + 15, y + 7); ctx.lineTo(x + 18, y + 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 4, y + 17); ctx.lineTo(x + 7, y + 19); ctx.stroke();
  // 顔
  const cx = x + 12, cy = y + 12;
  if (e.angry) {
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#fff';
      ellipse(ctx, cx + s * 4.5, cy, 2.6, 2.3); ctx.fill();
      ctx.fillStyle = '#d00000';
      circle(ctx, cx + s * 4.5, cy + 0.4, 1.2); ctx.fill();
      ctx.strokeStyle = '#212529'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx + s * 7.5, cy - 4.5); ctx.lineTo(cx + s * 2, cy - 2.5); ctx.stroke();
    }
    ctx.fillStyle = '#212529';
    rr(ctx, cx - 4, cy + 4.5, 8, 2.4, 1); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) ctx.fillRect(cx - 3.2 + i * 2.6, cy + 4.5, 1.2, 1);
  } else {
    ctx.strokeStyle = '#212529'; ctx.lineWidth = 1;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(cx + s * 4.5, cy - 0.5, 2, 0.2, Math.PI - 0.2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx - 2, cy + 5); ctx.lineTo(cx + 2, cy + 5); ctx.stroke();
  }
  ctx.restore();
}

export function drawBoss(ctx, e, P, time) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  ctx.save();
  if (e.flipped) {
    ctx.translate(cx, e.y + e.h / 2); ctx.scale(1, -1); ctx.translate(-cx, -(e.y + e.h / 2));
  }
  const flash = e.hurtT > 0 && Math.floor(e.hurtT * 16) % 2 === 0;
  const squish = e.grounded && e.state === 'wait' ? Math.max(0, 1 - e.timer * 3) * 2 : 0;
  if (Art.has('boss/0')) {
    if (!e.flipped && e.grounded) shadow(ctx, cx, by, 20, 0.22);
    // ジャンプ中は、着地する場所に大きなかげ（にげる合図）
    if (!e.flipped && !e.grounded && e.groundY) {
      const h = Math.max(0, e.groundY - by), k = Math.max(0.35, 1 - h / 160);
      const land = cx + (e.vx || 0) * Math.max(0, (-(e.vy || 0) + Math.sqrt(Math.max(0, (e.vy || 0) ** 2 + 2 * 1800 * h))) / 1800);
      ctx.fillStyle = `rgba(40,0,60,${0.18 + 0.2 * k})`;
      ctx.beginPath(); ctx.ellipse(land, e.groundY - 1, 22 * k, 4 * k, 0, 0, Math.PI * 2); ctx.fill();
    }
    Art.draw(ctx, flash ? 'boss/flash' : 'boss/0', cx, by, false, 1 + squish * 0.03, 1 - squish * 0.05);
    ctx.restore();
    return;
  }
  const body = flash ? '#ffffff' : '#6a4c93';
  const light = flash ? '#ffffff' : '#8f6ec5';
  ctx.fillStyle = flash ? '#dddddd' : '#45306a';
  ctx.beginPath();
  ctx.moveTo(cx - 19, by);
  ctx.bezierCurveTo(cx - 20, by - 36 + squish, cx + 20, by - 36 + squish, cx + 19, by);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(cx - 17.5, by - 1);
  ctx.bezierCurveTo(cx - 18.5, by - 34 + squish, cx + 18.5, by - 34 + squish, cx + 17.5, by - 1);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = light;
  ellipse(ctx, cx - 7, by - 20 + squish * 0.5, 4.5, 2.6, -0.5); ctx.fill();
  // 王冠
  const cy = by - 27 + squish;
  ctx.fillStyle = '#ffc300';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 9, cy - 9); ctx.lineTo(cx - 4.5, cy - 4); ctx.lineTo(cx, cy - 10);
  ctx.lineTo(cx + 4.5, cy - 4); ctx.lineTo(cx + 9, cy - 9); ctx.lineTo(cx + 8, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ef233c';
  circle(ctx, cx, cy - 3, 1.5); ctx.fill();
  ctx.fillStyle = '#4cc9f0';
  circle(ctx, cx - 5, cy - 2, 1); ctx.fill();
  circle(ctx, cx + 5, cy - 2, 1); ctx.fill();
  // 顔
  const dir = e.dir || -1;
  for (const s of [-1, 1]) {
    const ex = cx + s * 6 + dir * 1.5, ey = by - 14 + squish * 0.5;
    ctx.fillStyle = '#fff';
    ellipse(ctx, ex, ey, 3.4, 3.8); ctx.fill();
    ctx.fillStyle = '#d00000';
    circle(ctx, ex + dir * 1.1, ey + 0.6, 1.8); ctx.fill();
    ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ex - s * 4, ey - 6.5); ctx.lineTo(ex + s * 3.5, ey - 3.8); ctx.stroke();
  }
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath(); ctx.ellipse(cx + dir * 1.5, by - 6.5, 6, 2.6, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(cx - 3 + dir * 1.5, by - 6.5); ctx.lineTo(cx - 2 + dir * 1.5, by - 4.8); ctx.lineTo(cx - 1 + dir * 1.5, by - 6.5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 1 + dir * 1.5, by - 6.5); ctx.lineTo(cx + 2 + dir * 1.5, by - 4.8); ctx.lineTo(cx + 3 + dir * 1.5, by - 6.5); ctx.fill();
  ctx.restore();
}

// ===================== アイテム =====================
// ===================== 新しい敵（SVGの絵） =====================
// 絵がまだ読みこめていないときは、色つきの丸で代わりに描く
function blob(ctx, e, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, Math.PI * 2); ctx.fill();
}
export function drawBoar(ctx, e, P, time) {
  let nm;
  if (e.dead && !e.flipped) nm = 'boar/flat';
  else if (e.state === 'charge') nm = 'boar/run' + (Math.floor(e.t * 12) % 2);
  else if (e.state === 'ready') nm = 'boar/ready';
  else if (e.state === 'rest') nm = 'boar/rest';
  else nm = 'boar/' + (Math.floor(e.t * 5) % 2);
  const jit = e.state === 'ready' && !e.dead ? Math.sin(time * 60) * 0.5 : 0;
  ctx.save(); ctx.translate(jit, 0);
  if (!enemyArt(ctx, nm, e, e.dir < 0, 9)) blob(ctx, e, '#7a583f');
  ctx.restore();
}
export function drawPenguin(ctx, e, P, time) {
  const nm = e.dead && !e.flipped ? 'penguin/flat' : e.slideT > 0 ? 'penguin/slide' : 'penguin/' + (Math.floor(e.t * 4) % 2);
  if (!enemyArt(ctx, nm, e, e.dir < 0, 7)) blob(ctx, e, '#2b3350');
}
export function drawJelly(ctx, e, P, time) {
  if (!enemyArt(ctx, 'jelly/' + (e.rising ? 1 : 0), e, false)) blob(ctx, e, '#f2b3e4');
}
export function drawLantern(ctx, e, P, time) {
  if (!enemyArt(ctx, 'lantern/' + (Math.floor(e.t * 5 + Math.sin(e.t * 13)) % 2 ? 1 : 0), e, e.dir < 0)) blob(ctx, e, '#e8473c');
}
export function drawTako(ctx, e, P, time) {
  if (e.hidden && !e.dead) return;
  if (!enemyArt(ctx, 'tako/' + (e.vy < 0 ? 0 : 1), e, false)) blob(ctx, e, '#e5533c');
}
// ボスのしょうげき波
export function drawWave(ctx, e, time) {
  const x = e.x + e.w / 2, by = e.y + e.h, d = e.dir;
  const a = Math.min(1, e.life / 0.4);
  ctx.globalAlpha = a;
  for (let i = 0; i < 3; i++) {
    const w = 7 - i * 1.6, h = 10 - i * 2.4, ox = -d * i * 3.5;
    ctx.fillStyle = ['#b388ff', '#d6c2ff', '#ffffff'][i];
    ctx.beginPath();
    ctx.moveTo(x + ox - w, by); ctx.quadraticCurveTo(x + ox + d * w * 0.6, by - h * 1.2, x + ox + d * w, by);
    ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
export function drawBoots(ctx, cx, cy, t) {
  const s = 1 + Math.sin(t * 6) * 0.05;
  if (Art.draw(ctx, 'boots', cx, cy, false, s, s)) return;
  ctx.fillStyle = '#ef4a3e'; ctx.fillRect(cx - 6, cy - 4, 12, 8);
}

export function drawCoin(ctx, cx, cy, t) {
  if (Art.draw(ctx, 'coin/' + (Math.floor(t * 2.2) % 6), cx, cy)) return;
  const w = Math.abs(Math.cos(t * 3.5)) * 4.6 + 0.8;
  ctx.fillStyle = '#d18a00';
  ellipse(ctx, cx, cy, w + 0.9, 6.9); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ellipse(ctx, cx, cy, w, 6); ctx.fill();
  if (w > 2) {
    ctx.fillStyle = '#ffe98a';
    ellipse(ctx, cx - w * 0.3, cy - 1.5, w * 0.3, 2.5); ctx.fill();
    ctx.fillStyle = '#e0a100';
    ctx.fillRect(cx - 0.6, cy - 3, 1.2, 6);
  }
}

export function drawApple(ctx, cx, cy, t) {
  if (Art.draw(ctx, 'apple', cx, cy, false, 1 + Math.sin(t * 6) * 0.04, 1 + Math.sin(t * 6) * 0.04)) return;
  const glow = 0.5 + Math.sin(t * 6) * 0.2;
  ctx.fillStyle = `rgba(255,230,120,${glow * 0.5})`;
  circle(ctx, cx, cy + 0.5, 8.5); ctx.fill();
  ctx.fillStyle = '#e0a800';
  circle(ctx, cx, cy + 1, 6.4); ctx.fill();
  ctx.fillStyle = '#ffcf33';
  circle(ctx, cx - 0.4, cy + 0.6, 5.6); ctx.fill();
  ctx.fillStyle = '#fff6c9';
  ellipse(ctx, cx - 2.4, cy - 1.2, 1.5, 2.2, 0.4); ctx.fill();
  ctx.strokeStyle = '#6b3a1c'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(cx, cy - 4.5); ctx.lineTo(cx + 0.6, cy - 7.2); ctx.stroke();
  ctx.fillStyle = '#52b788';
  ellipse(ctx, cx + 2.8, cy - 6.5, 2.6, 1.3, -0.4); ctx.fill();
}

// ご当地の1UP（場所ごとに見た目がかわる）
const HEART_ART = ['nikuman', 'pudding', 'akashiyaki'];
export function drawHeart(ctx, cx, cy, t, size = 1, kind = 'heart') {
  const s = size * (1 + Math.sin(t * 8) * 0.05);
  if (Art.draw(ctx, HEART_ART.includes(kind) ? kind : 'heart', cx, cy, false, s, s)) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (kind === 'nikuman') { // 豚まん
    ctx.fillStyle = '#f3e6cf'; ctx.beginPath(); ctx.ellipse(0, 1.5, 7, 5.2, 0, Math.PI, 0); ctx.lineTo(7, 3); ctx.quadraticCurveTo(0, 5, -7, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(-1.5, -1.5, 3, 1.6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8c3a0'; ctx.lineWidth = 0.6;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, -3.2); ctx.lineTo(i * 2.2, 0.5); ctx.stroke(); }
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#ff4d8d';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-8, 0, -6.5, -7, 0, -3);
  ctx.bezierCurveTo(6.5, -7, 8, 0, 0, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ellipse(ctx, -3, -2.5, 1.5, 1, -0.6); ctx.fill();
  ctx.restore();
}

export function drawStar(ctx, cx, cy, t, r = 7) {
  if (Art.has('star')) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 5) * 0.25);
    const k = r / 7;
    Art.draw(ctx, 'star', 0, 0, false, k, k);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * 5) * 0.25);
  ctx.fillStyle = `hsl(${(t * 400) % 360},95%,62%)`;
  starPath(ctx, 0, 0, r, r * 0.48); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  starPath(ctx, -1, -1, r * 0.35, r * 0.17); ctx.fill();
  ctx.restore();
}

export function drawMedal(ctx, cx, cy, t, collected = true) {
  if (Art.has('medal/0')) {
    if (!collected) { Art.draw(ctx, 'medal/empty', cx, cy); return; }
    Art.draw(ctx, 'medal/0', cx, cy, false, 0.8 + Math.abs(Math.cos(t * 1.8)) * 0.2, 1);
    return;
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.8 + Math.abs(Math.cos(t * 1.8)) * 0.2, 1);
  if (!collected) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4;
    circle(ctx, 0, 0, 8); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    circle(ctx, 0, 0, 7.2); ctx.fill();
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#c77d00';
  circle(ctx, 0, 0, 9.5); ctx.fill();
  ctx.fillStyle = '#ffcc00';
  circle(ctx, 0, 0, 8.3); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  circle(ctx, 0, 0, 6); ctx.fill();
  ctx.fillStyle = `hsl(${(t * 200) % 360},90%,58%)`;
  starPath(ctx, 0, 0.3, 4.6, 2.1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ellipse(ctx, -4, -4.5, 2, 1.1, -0.7); ctx.fill();
  ctx.restore();
}

// ===================== しかけ =====================
export function drawCheckpoint(ctx, c, time) {
  const px = c.x + 1, top = c.y, bottom = c.y + c.h;
  if (Art.draw(ctx, c.active ? 'cp/on' + (Math.floor(time * 5) % 2) : 'cp/off', px + 1, bottom)) return;
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(px, top + 2, 2, bottom - top - 2);
  ctx.fillStyle = c.active ? '#ffd23f' : '#adb5bd';
  circle(ctx, px + 1, top + 2, 2.2); ctx.fill();
  const wave = Math.sin(time * 6) * 1.2;
  ctx.fillStyle = c.active ? '#38b000' : '#e9ecef';
  ctx.beginPath();
  ctx.moveTo(px + 2, top + 4);
  ctx.quadraticCurveTo(px + 8, top + 5 + wave, px + 14, top + 7);
  ctx.quadraticCurveTo(px + 8, top + 9 + wave, px + 2, top + 11);
  ctx.closePath(); ctx.fill();
  if (c.active) {
    ctx.fillStyle = '#fff';
    starPath(ctx, px + 7, top + 7.5, 2.2, 1); ctx.fill();
  }
  ctx.fillStyle = '#495057';
  ctx.fillRect(px - 2, bottom - 3, 6, 3);
}

export function drawGoal(ctx, g, theme, time) {
  // おうち
  const hx = g.houseX, gy = g.groundY;
  ctx.fillStyle = '#f8edeb';
  ctx.fillRect(hx, gy - 40, 64, 40);
  ctx.fillStyle = '#e8d5cf';
  ctx.fillRect(hx, gy - 8, 64, 8);
  ctx.fillStyle = '#d62828';
  ctx.beginPath(); ctx.moveTo(hx - 8, gy - 38); ctx.lineTo(hx + 32, gy - 66); ctx.lineTo(hx + 72, gy - 38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9d0208';
  ctx.fillRect(hx - 8, gy - 40, 80, 3);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(hx + 44, gy - 72, 8, 14);
  ctx.fillStyle = '#5d3a1a';
  rr(ctx, hx + 25, gy - 24, 14, 24, 6); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  circle(ctx, hx + 36, gy - 12, 1.2); ctx.fill();
  ctx.fillStyle = '#ffe66d';
  rr(ctx, hx + 6, gy - 30, 12, 10, 2); ctx.fill();
  rr(ctx, hx + 46, gy - 30, 12, 10, 2); ctx.fill();
  ctx.strokeStyle = '#5d3a1a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(hx + 12, gy - 30); ctx.lineTo(hx + 12, gy - 20); ctx.moveTo(hx + 52, gy - 30); ctx.lineTo(hx + 52, gy - 20); ctx.stroke();
  // ポール
  const px = g.poleX;
  ctx.fillStyle = '#e9f5db';
  ctx.fillRect(px - 1, g.topY, 2, gy - g.topY);
  ctx.fillStyle = '#95d5b2';
  ctx.fillRect(px, g.topY, 1, gy - g.topY);
  ctx.fillStyle = '#ffc300';
  circle(ctx, px, g.topY - 2, 3.4); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  circle(ctx, px - 1, g.topY - 3, 1.1); ctx.fill();
  // 旗
  const fy = g.flagY, wave = Math.sin(time * 7) * 1.3;
  ctx.fillStyle = '#ef476f';
  ctx.beginPath();
  ctx.moveTo(px - 1, fy);
  ctx.quadraticCurveTo(px - 8, fy + 3 + wave, px - 16, fy + 7);
  ctx.quadraticCurveTo(px - 8, fy + 11 + wave, px - 1, fy + 14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  starPath(ctx, px - 6, fy + 7, 3, 1.3); ctx.fill();
  // 土台
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(px - 4, gy - 4, 8, 4);
}

export function drawPlatform(ctx, pf, theme, time) {
  let x = pf.x, y = pf.y;
  if (pf.move === 'fall' && pf.touched && !pf.falling) x += Math.sin(time * 70) * 0.7;
  const w = pf.w;
  if (pf.move === 'fall') {
    ctx.fillStyle = '#7f4f24';
    rr(ctx, x, y, w, 8, 2); ctx.fill();
    ctx.fillStyle = '#b08968';
    rr(ctx, x + 1, y + 1, w - 2, 4, 1.5); ctx.fill();
    ctx.strokeStyle = '#7f4f24'; ctx.lineWidth = 0.8;
    for (let i = 12; i < w; i += 12) { ctx.beginPath(); ctx.moveTo(x + i, y + 1); ctx.lineTo(x + i, y + 7); ctx.stroke(); }
    return;
  }
  if (theme === 'sky') {
    ctx.fillStyle = '#dbe9ff';
    rr(ctx, x, y + 1, w, 7, 3.5); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 5; i < w; i += 9) { circle(ctx, x + i, y + 2.5, 4.2); ctx.fill(); }
    return;
  }
  const base = theme === 'castle' ? '#6c757d' : theme === 'cave' ? '#4d908e' : '#f4a261';
  const lite = theme === 'castle' ? '#adb5bd' : theme === 'cave' ? '#76c7c0' : '#ffd6a5';
  ctx.fillStyle = base;
  rr(ctx, x, y, w, 8, 2); ctx.fill();
  ctx.fillStyle = lite;
  rr(ctx, x + 1, y + 1, w - 2, 3, 1.5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 4; i < w; i += 10) { circle(ctx, x + i, y + 5.5, 0.9); ctx.fill(); }
}

export function drawParticle(ctx, q) {
  const a = Math.max(0, q.life / q.max);
  if (q.type === 'spark') {
    ctx.globalAlpha = a;
    ctx.fillStyle = `hsl(${q.hue},100%,70%)`;
    starPath(ctx, q.x, q.y, 2.6 * a + 0.8, 0.7, 4); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (q.type === 'drop') {
    ctx.globalAlpha = Math.min(1, a * 1.5);
    ctx.fillStyle = '#cfefff';
    circle(ctx, q.x, q.y, 1.6); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (q.type === 'dust') {
    ctx.globalAlpha = a * 0.7;
    ctx.fillStyle = '#e9ecef';
    circle(ctx, q.x, q.y, 2.5 * (1.5 - a)); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (q.type === 'bubble') {
    ctx.globalAlpha = Math.min(1, a * 2);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.7;
    circle(ctx, q.x, q.y, q.r); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (q.type === 'brick') {
    ctx.save();
    ctx.translate(q.x, q.y); ctx.rotate(q.rot);
    ctx.fillStyle = '#c8553d';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.fillStyle = '#f4c7a1';
    ctx.fillRect(-3, -0.5, 6, 1);
    ctx.restore();
  } else if (q.type === 'text') {
    ctx.globalAlpha = Math.min(1, a * 2);
    // 文字のかわりの絵（中間ポイントの旗・ボスののこりのハート）
    if (q.hearts) {
      for (let i = 0; i < q.hearts; i++) drawHeart(ctx, q.x + (i - (q.hearts - 1) / 2) * 10, q.y - 3, 0, 0.75);
      ctx.globalAlpha = 1; return;
    }
    if (q.icon) {
      const ix = q.text ? q.x - 7 : q.x;
      picto(ctx, q.icon, ix + 0.6, q.y - 2.4, 12, 'rgba(27,27,27,0.55)');
      picto(ctx, q.icon, ix, q.y - 3, 12, q.color || '#ffffff');
      if (!q.text) { ctx.globalAlpha = 1; return; }
    }
    ctx.font = 'bold 8px "Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#1b1b1b';
    const tx = q.icon ? q.x + 5 : q.x;
    ctx.strokeText(q.text, tx, q.y);
    ctx.fillStyle = q.text === '1UP' ? '#7dff7a' : (q.color || '#ffffff');
    ctx.fillText(q.text, tx, q.y);
    ctx.globalAlpha = 1;
  }
}
