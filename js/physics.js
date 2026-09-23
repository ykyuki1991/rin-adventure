// タイルとの当たり判定（坂道にも対応）
import { TILE, T, isSolidTile, isSemiTile, isSlope, slopeSurface } from './config.js';

function overlapsSolid(level, x, y, w, h) {
  const l = Math.floor(x / TILE), r = Math.floor((x + w - 0.01) / TILE);
  const t = Math.floor(y / TILE), b = Math.floor((y + h - 0.01) / TILE);
  for (let ty = t; ty <= b; ty++) {
    for (let tx = l; tx <= r; tx++) {
      if (isSolidTile(level.get(tx, ty))) return true;
    }
  }
  return false;
}

// 上に坂が乗っているブロックは、その上面ではなく坂の面を地面として使う
function solidTopAt(level, tx, ty) {
  return isSolidTile(level.get(tx, ty)) && !isSlope(level.get(tx, ty - 1));
}

// 体(b)を速度に合わせて動かし、タイルにぶつかったら止める
// opt.player: かくしブロックに下から当たる
// opt.corner: 頭がブロックの角に少しだけ当たったときは横にずらしてあげる
export function moveBody(b, level, dt, opt = {}) {
  const res = { ground: false, wallL: false, wallR: false, ceil: false, ceilTiles: [], ceilRow: 0, onSlope: false };
  const prevBottom = b.y + b.h;
  const prevTop = b.y;
  const wasGround = !!b.grounded;
  const wasSlope = !!b.onSlope;
  // 地面にいるときは足元の数ピクセルを横の判定から外す（坂の上り口で引っかからないように）
  const feet = wasGround ? 6 : 0;

  // --- 横方向 ---
  b.x += b.vx * dt;
  {
    const top = Math.floor(b.y / TILE);
    const bot = Math.floor((b.y + b.h - feet - 0.01) / TILE);
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w - 0.01) / TILE);
      for (let ty = top; ty <= bot; ty++) {
        if (isSolidTile(level.get(tx, ty))) { b.x = tx * TILE - b.w; b.vx = 0; res.wallR = true; break; }
      }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x / TILE);
      for (let ty = top; ty <= bot; ty++) {
        if (isSolidTile(level.get(tx, ty))) { b.x = (tx + 1) * TILE; b.vx = 0; res.wallL = true; break; }
      }
    }
  }

  // --- 縦方向 ---
  b.y += b.vy * dt;
  const l = Math.floor(b.x / TILE);
  const r = Math.floor((b.x + b.w - 0.01) / TILE);
  if (b.vy > 0) {
    const ty = Math.floor((b.y + b.h) / TILE);
    for (let tx = l; tx <= r; tx++) {
      const t = level.get(tx, ty);
      if (solidTopAt(level, tx, ty) || (isSemiTile(t) && prevBottom <= ty * TILE + 0.5)) {
        b.y = ty * TILE - b.h; b.vy = 0; res.ground = true; res.groundTile = t; break;
      }
    }
  } else if (b.vy < 0) {
    const ty = Math.floor(b.y / TILE);
    const blocked = (tx) => {
      const t = level.get(tx, ty);
      return isSolidTile(t) || (opt.player && t === T.HIDDEN && prevTop >= (ty + 1) * TILE - 0.5);
    };
    for (let tx = l; tx <= r; tx++) if (blocked(tx)) res.ceilTiles.push(tx);
    if (res.ceilTiles.length && opt.corner && l !== r) {
      // 角に少しだけ当たった場合はずらす（かくしブロックは出したいので、ふつうのブロックのときだけ）
      const overlapL = (l + 1) * TILE - b.x;
      const overlapR = (b.x + b.w) - r * TILE;
      const onlyL = res.ceilTiles.length === 1 && res.ceilTiles[0] === l && isSolidTile(level.get(l, ty));
      const onlyR = res.ceilTiles.length === 1 && res.ceilTiles[0] === r && isSolidTile(level.get(r, ty));
      if (onlyL && overlapL <= 5 && !overlapsSolid(level, (l + 1) * TILE, b.y, b.w, b.h)) {
        b.x = (l + 1) * TILE; res.ceilTiles.length = 0;
      } else if (onlyR && overlapR <= 5 && !overlapsSolid(level, r * TILE - b.w, b.y, b.w, b.h)) {
        b.x = r * TILE - b.w; res.ceilTiles.length = 0;
      }
    }
    if (res.ceilTiles.length) {
      b.y = (ty + 1) * TILE; b.vy = 0; res.ceil = true; res.ceilRow = ty;
    }
  }

  // --- 坂道 ---（体のまん中の真下の坂に乗る。下からはすり抜けられる）
  if (b.vy >= 0) {
    const cx = b.x + b.w / 2;
    const tx = Math.floor(cx / TILE);
    const bottom = b.y + b.h;
    const ty0 = Math.floor((bottom - 0.01) / TILE);
    const tol = 4 + Math.abs(b.vx * dt) * 1.2 + (wasGround ? 6 : 0);
    let best = Infinity;
    for (let ty = ty0 - 1; ty <= ty0 + 1; ty++) {
      const t = level.get(tx, ty);
      if (!isSlope(t)) continue;
      const s = slopeSurface(t, tx, ty, cx);
      if (bottom >= s - 0.01 && prevBottom <= s + tol) best = Math.min(best, s);
      // 下り坂をおりるときは地面にくっつく
      else if (!res.ground && (wasGround || wasSlope) && bottom < s && s - bottom <= 10) best = Math.min(best, s);
    }
    if (best < Infinity) {
      b.y = best - b.h; b.vy = 0; res.ground = true; res.onSlope = true;
    }
  }
  b.onSlope = res.onSlope;
  return res;
}

export function boxOverlap(a, b, shrink = 0) {
  return a.x + shrink < b.x + b.w && a.x + a.w - shrink > b.x &&
         a.y + shrink < b.y + b.h && a.y + a.h - shrink > b.y;
}

// そこに立てるか（敵が足場のはしで引き返すときに使う）
export function isGroundAt(level, tx, ty) {
  const t = level.get(tx, ty);
  return isSolidTile(t) || isSemiTile(t) || isSlope(t) || isSlope(level.get(tx, ty - 1));
}
