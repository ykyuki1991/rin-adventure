// 全ステージ（または指定したステージ）がクリアできるか・メダルとコインが全部取れるかを、ゲームと同じ物理で総当たりして調べる
// 使い方: node tools/dev/reach.mjs 5   （「つみ=」のうちゴール付近のものは気にしなくてよい）
import { LEVELS } from '../../js/levels.js';
import { Level } from '../../js/level.js';
import { Player } from '../../js/player.js';
import { TILE, T, STEP } from '../../js/config.js';
import { zoneForce, buildZones } from '../../js/zones.js';
import { Spring, springBounce } from '../../js/entities.js';

const ONLY = process.argv[2] ? parseInt(process.argv[2]) - 1 : null;
const VERBOSE = process.argv.includes('-v');

function sweepPlatforms(L, def) {
  const put = (px, py, w) => {
    const row = Math.floor((py + 8) / TILE);
    for (let x = Math.floor(px / TILE); x <= Math.floor((px + w - 1) / TILE); x++) {
      if (L.get(x, row) === T.EMPTY) L.set(x, row, T.SEMI);
    }
  };
  for (const s of def.spawns) {
    if (s.type !== 'platform') continue;
    const w = (s.width || 3) * TILE;
    const x0 = s.x * TILE, y0 = s.y * TILE;
    const range = (s.range || 0) * TILE;
    const move = s.move || 'h';
    let dx = s.dx !== undefined ? s.dx * TILE : (move === 'h' || move === 'rail' || move === 'bob' ? range : 0);
    let dy = s.dy !== undefined ? s.dy * TILE : (move === 'v' ? range : 0);
    if (move === 'circle') {
      const cx = s.cx * TILE, cy = s.cy * TILE, r = s.r * TILE;
      for (let a = 0; a < 360; a += 8) { const t = a * Math.PI / 180; put(cx + Math.cos(t) * r - w / 2, cy + Math.sin(t) * r + 17, w); }
    } else if (move === 'arc') {
      const H = (s.height || 4) * TILE;
      for (let u = 0; u <= 1; u += 0.03) put(x0 + u * dx, y0 - 4 * H * u * (1 - u), w);
    } else if (move === 'loop') {
      const n = Math.ceil(Math.hypot(dx, dy) / 6);
      for (let i = 1; i < n; i++) { const u = i / n; put(x0 + u * dx - w / 2 + 8, y0 + u * dy, w); }
    } else if (move === 'fall') {
      put(x0, y0, w);
    } else {
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
      for (let i = 0; i <= n; i++) { const u = i / n; put(x0 + u * dx, y0 + u * dy, w); }
    }
  }
}

function hazard(L, p) {
  const l = Math.floor(p.x / TILE), r = Math.floor((p.x + p.w - 0.01) / TILE);
  const t = Math.floor(p.y / TILE), b = Math.floor((p.y + p.h - 0.01) / TILE);
  for (let ty = t; ty <= b; ty++) for (let tx = l; tx <= r; tx++) {
    const k = L.get(tx, ty);
    if (k === T.SPIKE) {
      const bx = tx * TILE + 2, by = ty * TILE + 7;
      if (p.x < bx + 12 && p.x + p.w > bx && p.y < by + 9 && p.y + p.h > by) return true;
    } else if (k === T.LAVA) {
      if (p.y + p.h > ty * TILE + 6) return true;
    } else if (k === T.WATER) {
      const surf = L.get(tx, ty - 1) !== T.WATER ? 7 : 0;
      if (p.y + p.h > ty * TILE + surf) return true;
    }
  }
  return false;
}

const HOLDS = [0, 0.1, 0.2, 1.0];
const PATTERNS = ['hold', 'apex', 'none', 'back'];
const RUNS = [0, 0.12, 0.55];

function makeGame(L, zones) {
  const g = { level: L, sfx() {}, onHeadBump() {}, t: 0, springs: [] };
  g.forceAt = box => zones.length ? zoneForce(zones, box, g.t) : null;
  return g;
}

// 1回の行動をシミュレーション
function simulate(g, sx, sy, dir, runT, jump, hold, pattern, walkOnly, onStep) {
  const L = g.level;
  const p = new Player(sx, sy);
  p.grounded = true; p.coyote = 0.1; p.facing = dir;
  let jumped = false, apex = false, jumpT = 0, left = false;
  for (let f = 0; f < 240; f++) {
    const t = f * STEP;
    g.t = t;
    let h = 0, jp = false, jh = false;
    if (walkOnly) {
      h = t < runT ? dir : 0;
    } else if (t < runT) {
      h = dir;
    } else {
      if (!jumped) { jumped = true; jp = jump; jumpT = t; }
      const since = t - jumpT;
      jh = jump && (since === 0 || since < hold);
      if (p.vy >= 0 && since > 0.05) apex = true;
      h = dir;
      if (pattern === 'apex' && apex) h = 0;
      if (pattern === 'none' && since > 0) h = 0;
      if (pattern === 'back' && apex) h = -dir;
    }
    p.update(g, STEP, { left: h < 0, right: h > 0, jump: jh, jumpPressed: jp });
    for (const sp of g.springs) springBounce(p, sp, jump && hold >= 0.2);
    if (onStep) onStep(p);
    if (hazard(L, p) || p.y > L.pxH) return null;
    if (!p.grounded) left = true;
    const done = walkOnly ? (t >= runT && p.grounded && Math.abs(p.vx) < 1) : (jumped && left && p.grounded && t - jumpT > 0.05);
    if (done) return { x: p.x, y: p.y };
    if (!walkOnly && t < runT && !p.grounded) { left = true; if (!jumped) { jumped = true; jumpT = t; } }
  }
  return p.grounded ? { x: p.x, y: p.y } : null;
}

function check(def) {
  const out = {};
  for (const mode of ['complete', 'medals']) {
    const L = new Level(def);
    sweepPlatforms(L, def);
    if (mode === 'medals') for (let i = 0; i < L.tiles.length; i++) if (L.tiles[i] === T.HIDDEN) L.tiles[i] = T.USED;
    const zones = buildZones(def, TILE);
    const g = makeGame(L, zones);
    g.springs = def.spawns.filter(s => s.type === 'spring').map(s => new Spring(s.x, s.base));
    const goalX = def.goal ? def.goal.x * TILE + 8 : 170 * TILE;
    const medals = def.spawns.filter(s => s.type === 'medal').map(s => ({ id: s.id, x: s.x * TILE - 2, y: s.y * TILE - 2, w: 20, h: 20 }));
    const got = new Set();
    const coinsAll = new Set(); for (let i = 0; i < L.tiles.length; i++) if (L.tiles[i] === T.COIN) coinsAll.add(i);
    const coinsGot = new Set();
    // コインチャレンジの赤いコインも、取れる場所にあるか調べる
    const red = new Set();
    for (const r of def.spawns.filter(s => s.type === 'ring')) for (const [x, y] of r.coins) { const k = y * L.w + x; red.add(k); coinsAll.add(k); }
    let reached = false, farX = 0;
    const onStep = p => {
      const hb = { x: p.x + 1, y: p.y + 1, w: p.w - 2, h: p.h - 1 };
      for (let ty = Math.floor(hb.y / TILE); ty <= Math.floor((hb.y + hb.h) / TILE); ty++) for (let tx = Math.floor(hb.x / TILE); tx <= Math.floor((hb.x + hb.w) / TILE); tx++) { const k = ty * L.w + tx; if (coinsAll.has(k)) coinsGot.add(k); }
      for (const m of medals) if (hb.x < m.x + m.w && hb.x + hb.w > m.x && hb.y < m.y + m.h && hb.y + hb.h > m.y) got.add(m.id);
      if (p.x + p.w >= goalX - 1) reached = true;
      if (p.x > farX) farX = p.x;
    };
    // スタート地点に立たせる
    const st = simulate(g, def.start.x * TILE + 2, (def.start.y + 1) * TILE - 14 - 1, 1, 0.01, false, 0, 'none', true, onStep);
    const seen = new Set();
    const queue = [];
    const key = s => Math.round(s.x / 7) + ',' + Math.round(s.y / 4);
    const push = s => { const k = key(s); if (!seen.has(k)) { seen.add(k); queue.push(s); } };
    push(st);
    let sims = 0;
    const edges = new Map(), goalStates = new Set();
    while (queue.length) {
      const s = queue.shift();
      const sk = key(s); const out = []; edges.set(sk, out);
      const wasReached = reached; reached = false;
      onStep({ x: s.x, y: s.y, w: 12, h: 14 });
      const add = r => { if (r) { out.push(key(r)); push(r); } };
      for (const dir of [-1, 1]) {
        for (const wt of [0.15, 0.5]) { sims++; add(simulate(g, s.x, s.y, dir, wt, false, 0, 'none', true, onStep)); }
        for (const rt of RUNS) for (const hold of HOLDS) for (const pat of PATTERNS) {
          sims++;
          add(simulate(g, s.x, s.y, dir, rt, true, hold, pat, false, onStep));
        }
      }
      if (reached) goalStates.add(sk);
      reached = reached || wasReached;
      if (reached && mode === 'complete') break;
    }
    if (VERBOSE && mode === 'medals') { const ys = [...seen].filter(k => { const [a,b]=k.split(',').map(Number); return a*7 > 1700 && a*7 < 2400 && b > 32; }); console.log('deck/catwalk states:', ys.length, ys.slice(0,60).join(' ')); }
    if (mode === 'complete') {
      // ゴールにたどりつけない場所（つみ）をさがす
      const rev = new Map(); for (const [a, bs] of edges) for (const b of bs) { if (!rev.has(b)) rev.set(b, []); rev.get(b).push(a); }
      const good = new Set(goalStates), q = [...goalStates];
      while (q.length) { const k = q.pop(); for (const a of rev.get(k) || []) if (!good.has(a)) { good.add(a); q.push(a); } }
      const stuck = [...seen].filter(k => !good.has(k)).map(k => { const [a, b] = k.split(',').map(Number); return Math.round(a * 7 / TILE) + ':' + Math.round(b * 4 / TILE); });
      out.stuck = [...new Set(stuck)];
    }
    if (mode === 'complete') { out.complete = reached; out.farTile = Math.floor(farX / TILE); out.states = seen.size; out.sims = sims; }
    else { out.medals = [...got].sort(); out.coinMiss = [...coinsAll].filter(k => !coinsGot.has(k)).map(k => `${k % L.w},${Math.floor(k / L.w)}`); out.coinN = coinsAll.size; }
  }
  return out;
}

LEVELS.forEach((def, i) => {
  if (ONLY !== null && ONLY !== i) return;
  const t0 = Date.now();
  const r = check(def);
  const ok = r.complete && r.medals.length === def.medalCount;
  console.log(`${ok ? 'OK ' : 'NG '} stage ${def.id} ${def.name}: クリア=${r.complete}${r.complete ? '' : '（最遠 ' + r.farTile + 'マス / ゴール ' + (def.goal ? def.goal.x : 170) + '）'} メダル=${JSON.stringify(r.medals)}/${def.medalCount} コイン取れない=${r.coinMiss.length}/${r.coinN} ${r.coinMiss.slice(0, 6).join(' ')} つみ=${r.stuck.length} ${r.stuck.slice(0, 30).join(' ')} states=${r.states} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
});
