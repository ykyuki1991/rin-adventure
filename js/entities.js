// 敵・アイテム・しかけ
import { TILE } from './config.js';
import { moveBody, isGroundAt } from './physics.js';

const G = 1800;

export class Entity {
  constructor(kind, x, y, w, h) {
    this.kind = kind;
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.t = 0;
    this.remove = false;
  }
  get cx() { return this.x + this.w / 2; }
  get bottom() { return this.y + this.h; }
  update() {}
}

// ===================== 敵 =====================
export class Enemy extends Entity {
  constructor(kind, tx, ty, w, h) {
    super(kind, tx * TILE + (TILE - w) / 2, (ty + 1) * TILE - h, w, h);
    this.isEnemy = true;
    this.awake = false;
    this.dead = false;
    this.flipped = false;
    this.squash = 0;
    this.stompable = true;   // ふんでたおせる
    this.harmful = true;     // さわるとダメージ
    this.starImmune = false; // スターでもたおせない
    this.grounded = false;
    this.walker = false;     // 歩く敵（ぶつかると向きを変える）
    this.dir = -1;
    this.score = 100;
  }
  // スターやブロックの下からの攻撃でたおれる
  kill(game, dir = 1) {
    if (this.dead || this.starImmune) return false;
    this.dead = true; this.flipped = true;
    this.vy = -240; this.vx = 50 * dir;
    return true;
  }
  // ふまれた
  stomp() {
    this.dead = true; this.squash = 0.45; this.vx = 0; this.vy = 0;
    return true;
  }
  updateDead(game, dt) {
    if (this.flipped) {
      this.vy += G * dt; this.x += this.vx * dt; this.y += this.vy * dt;
      if (this.y > game.level.pxH + 40) this.remove = true;
    } else {
      this.squash -= dt;
      if (this.squash <= 0) this.remove = true;
    }
  }
  fallCheck(game) { if (this.y > game.level.pxH + 32) this.remove = true; }
}

// ぷにスライム：歩くだけ。ふめる
export class Slime extends Enemy {
  constructor(tx, ty) { super('slime', tx, ty, 14, 12); this.speed = 30; this.walker = true; }
  update(game, dt) {
    this.t += dt;
    if (this.dead) return this.updateDead(game, dt);
    this.vx = this.dir * this.speed;
    this.vy = Math.min(this.vy + G * dt, 480);
    const r = moveBody(this, game.level, dt);
    if (r.wallL) this.dir = 1; else if (r.wallR) this.dir = -1;
    this.grounded = r.ground;
    this.fallCheck(game);
  }
}

// トゲぼう：ふめない。足場のはしで引き返す
export class Spiky extends Enemy {
  constructor(tx, ty) {
    super('spiky', tx, ty, 14, 14);
    this.speed = 24; this.walker = true; this.stompable = false; this.score = 200;
  }
  update(game, dt) {
    this.t += dt;
    if (this.dead) return this.updateDead(game, dt);
    this.vx = this.dir * this.speed;
    this.vy = Math.min(this.vy + G * dt, 480);
    const r = moveBody(this, game.level, dt);
    if (r.wallL) this.dir = 1; else if (r.wallR) this.dir = -1;
    this.grounded = r.ground;
    if (r.ground) {
      const aheadX = this.dir > 0 ? this.x + this.w + 1 : this.x - 1;
      if (!isGroundAt(game.level, Math.floor(aheadX / TILE), Math.floor((this.y + this.h + 2) / TILE))) this.dir *= -1;
    }
    this.fallCheck(game);
  }
}

// カニ：横歩き。足場のはしで引き返す。ふめる
export class Crab extends Enemy {
  constructor(tx, ty) { super('crab', tx, ty, 14, 10); this.speed = 30; this.walker = true; }
  update(game, dt) {
    this.t += dt;
    if (this.dead) return this.updateDead(game, dt);
    this.vx = this.dir * this.speed;
    this.vy = Math.min(this.vy + G * dt, 480);
    const r = moveBody(this, game.level, dt);
    if (r.wallL) this.dir = 1; else if (r.wallR) this.dir = -1;
    this.grounded = r.ground;
    if (r.ground) {
      const aheadX = this.dir > 0 ? this.x + this.w + 1 : this.x - 1;
      if (!isGroundAt(game.level, Math.floor(aheadX / TILE), Math.floor((this.y + this.h + 2) / TILE))) this.dir *= -1;
    }
    this.fallCheck(game);
  }
}

// パタパタ（どうくつ・おしろではコウモリ）：空中をゆらゆら飛ぶ
export class Bird extends Enemy {
  constructor(tx, ty) {
    super('bird', tx, ty, 14, 12);
    this.x0 = this.x; this.y0 = this.y;
    this.phase = (tx * 0.7) % (Math.PI * 2);
    this.score = 200;
  }
  kill(game, dir) { const k = super.kill(game, dir); return k; }
  stomp() { this.dead = true; this.flipped = true; this.vy = 0; this.vx = 0; return true; }
  update(game, dt) {
    this.t += dt;
    if (this.dead) return this.updateDead(game, dt);
    const px = this.x;
    this.x = this.x0 + Math.sin(this.t * 0.9 + this.phase) * 28;
    this.y = this.y0 + Math.sin(this.t * 2.2 + this.phase) * 18;
    this.dir = this.x < px ? -1 : 1;
  }
}

// ぴょんカエル：りんの方へとびはねる
export class Frog extends Enemy {
  constructor(tx, ty) { super('frog', tx, ty, 14, 12); this.wait = 1.0; this.score = 200; }
  update(game, dt) {
    this.t += dt;
    if (this.dead) return this.updateDead(game, dt);
    if (this.grounded) {
      this.vx = 0;
      this.wait -= dt;
      this.dir = game.player.cx < this.cx ? -1 : 1;
      if (this.wait <= 0) {
        this.vy = -330; this.vx = this.dir * 70; this.wait = 1.3; this.grounded = false;
      }
    }
    this.vy = Math.min(this.vy + G * dt, 480);
    const r = moveBody(this, game.level, dt);
    this.grounded = r.ground;
    this.fallCheck(game);
  }
}

// ゴロいわ：真下に来ると落ちてくる。たおせない
export class Rock extends Enemy {
  constructor(tx, ty) {
    super('rock', tx, ty, 24, 24);
    this.x = tx * TILE + (TILE - 24) / 2;
    this.y = ty * TILE;
    this.y0 = this.y;
    this.state = 'idle';
    this.timer = 0;
    this.stompable = false;
    this.starImmune = true;
    this.angry = false;
  }
  update(game, dt) {
    this.t += dt;
    const p = game.player;
    const near = Math.abs(p.cx - this.cx) < 40 && p.y > this.y;
    this.angry = near || this.state !== 'idle';
    switch (this.state) {
      case 'idle':
        this.timer -= dt;
        if (this.timer <= 0 && Math.abs(p.cx - this.cx) < 30 && p.y > this.y) this.state = 'fall';
        break;
      case 'fall': {
        this.vy = Math.min(this.vy + 2400 * dt, 540);
        this.vx = 0;
        const r = moveBody(this, game.level, dt);
        if (r.ground) {
          this.state = 'land'; this.timer = 0.9; this.vy = 0;
          game.shake(0.25); game.sfx('thud');
          game.dust(this.cx, this.bottom, 6);
        }
        if (this.y > game.level.pxH) this.remove = true;
        break;
      }
      case 'land':
        this.timer -= dt;
        if (this.timer <= 0) this.state = 'rise';
        break;
      case 'rise':
        this.y -= 55 * dt;
        if (this.y <= this.y0) { this.y = this.y0; this.state = 'idle'; this.timer = 0.5; }
        break;
    }
  }
}

// キングスライム（ボス）：3回ふむとたおせる
export class Boss extends Enemy {
  constructor(tx, ty) {
    super('boss', tx, ty, 36, 30);
    this.hp = 3; this.maxHp = 3;
    this.state = 'sleep';
    this.timer = 0;
    this.hurtT = 0;
    this.starImmune = true;
    this.score = 5000;
    this.minX = this.x - 17 * TILE;
    this.maxX = this.x + 8 * TILE;
    this.reported = false;
  }
  stomp(game) {
    if (this.hurtT > 0 || this.dead) return false;
    this.hp--;
    this.hurtT = 1.2;
    game.sfx('bossHit');
    game.shake(0.3);
    if (this.hp <= 0) {
      this.dead = true; this.flipped = true;
      this.vy = -320; this.vx = 0;
      game.onBossDying(this);
    } else {
      // ふまれたらはね上がって少し間をあける
      this.state = 'wait'; this.timer = 0.6;
    }
    return true;
  }
  update(game, dt) {
    this.t += dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.dead) {
      this.vy += G * dt; this.y += this.vy * dt;
      if (this.y > game.level.pxH + 60 && !this.reported) { this.reported = true; game.onBossDefeated(); }
      return;
    }
    const p = game.player;
    switch (this.state) {
      case 'sleep':
        if (game.cam + game.viewW > this.x + 24) { this.state = 'wait'; this.timer = 1.4; game.onBossWake(); }
        break;
      case 'wait':
        if (this.grounded) {
          this.vx = 0;
          this.timer -= dt;
          if (this.timer <= 0) {
            this.dir = p.cx < this.cx ? -1 : 1;
            const lvl = this.maxHp - this.hp; // 0,1,2
            this.vy = -(380 + lvl * 50);
            this.vx = this.dir * (60 + lvl * 35);
            this.state = 'air';
            this.grounded = false;
            game.sfx('bossJump');
          }
        }
        break;
      case 'air':
        break;
    }
    this.vy = Math.min(this.vy + G * dt, 520);
    const r = moveBody(this, game.level, dt);
    if (this.x < this.minX) { this.x = this.minX; this.vx = 0; }
    if (this.x > this.maxX) { this.x = this.maxX; this.vx = 0; }
    const was = this.grounded;
    this.grounded = r.ground;
    if (r.ground && !was && this.state === 'air') {
      this.state = 'wait';
      this.timer = [0.45, 0.75, 1.05][this.hp - 1] ?? 1;
      game.shake(0.3); game.sfx('thud');
      game.dust(this.cx, this.bottom, 10);
    }
  }
}

export function makeEnemy(s) {
  switch (s.type) {
    case 'slime': return new Slime(s.x, s.y);
    case 'spiky': return new Spiky(s.x, s.y);
    case 'bird': return new Bird(s.x, s.y);
    case 'frog': return new Frog(s.x, s.y);
    case 'crab': return new Crab(s.x, s.y);
    case 'rock': return new Rock(s.x, s.y);
    case 'boss': return new Boss(s.x, s.y);
  }
  return null;
}

// ===================== アイテム =====================

// ブロックから飛び出すコイン
export class PopCoin extends Entity {
  constructor(tx, ty) {
    super('popcoin', tx * TILE + 2, (ty - 1) * TILE, 12, 14);
    this.vy = -280; this.life = 0.5;
  }
  update(game, dt) {
    this.t += dt;
    this.vy += 1000 * dt; this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) { this.remove = true; game.sparkle(this.cx, this.y + 7, 4); }
  }
}

// きんのりんご（パワーアップ）・ハート（1UP）・にじいろスター（むてき）
export class PowerItem extends Entity {
  constructor(kind, tx, ty) {
    super(kind, tx * TILE + 1, ty * TILE + 2, 14, 14);
    this.baseY = ty * TILE;
    this.emerge = 0.6;
    this.behind = true;  // 出てくる途中はブロックの後ろに描く
    this.dir = 1;
    this.isItem = true;
  }
  update(game, dt) {
    this.t += dt;
    if (this.emerge > 0) {
      this.emerge -= dt;
      const k = 1 - Math.max(0, this.emerge) / 0.6;
      this.y = this.baseY + 2 - k * 16;
      if (this.emerge <= 0) { this.behind = false; this.y = this.baseY - this.h; }
      return;
    }
    const speed = this.kind === 'star' ? 75 : 50;
    this.vx = this.dir * speed;
    this.vy = Math.min(this.vy + G * dt, 480);
    const r = moveBody(this, game.level, dt);
    if (r.wallL) this.dir = 1; else if (r.wallR) this.dir = -1;
    if (this.kind === 'star' && r.ground) this.vy = -330;
    if (this.y > game.level.pxH + 20) this.remove = true;
  }
}

// ひみつのメダル
export class Medal extends Entity {
  constructor(tx, ty, id) {
    super('medal', tx * TILE - 2, ty * TILE - 2, 20, 20);
    this.id = id;
  }
  update(game, dt) { this.t += dt; }
}

// 中間ポイント
export class Checkpoint extends Entity {
  constructor(tx, ty, idx) {
    super('checkpoint', tx * TILE + 6, (ty - 2) * TILE, 4, 3 * TILE);
    this.idx = idx;
    this.active = false;
  }
  update(game, dt) { this.t += dt; }
}

// ゴール（旗と、次の場所への看板）
export class Goal extends Entity {
  constructor(tx, base, label) {
    const poleTiles = Math.min(10, base - 1);
    super('goal', tx * TILE + 6, (base - poleTiles) * TILE, 4, poleTiles * TILE);
    this.label = label || '';
    this.poleX = tx * TILE + 8;
    this.topY = (base - poleTiles) * TILE;
    this.groundY = base * TILE;
    this.flagY = this.topY + 8;
    this.houseX = (tx + 4) * TILE;
    this.doorX = this.houseX + 2 * TILE;
  }
  update(game, dt) { this.t += dt; }
}

// 飾り（家・看板・建物など。当たり判定はない）
export class Deco extends Entity {
  constructor(d) {
    super('deco', d.x * TILE, d.y * TILE, 0, 0);
    Object.assign(this, d, { kind: 'deco', x: d.x * TILE, y: d.y * TILE });
    this.t = 0;
  }
  update(game, dt) { this.t += dt; }
}

// 動く足場（上に乗れる。下からはすり抜け）
const smooth = u => u * u * (3 - 2 * u);
export class Platform extends Entity {
  constructor(s) {
    const w = (s.width || 3) * TILE;
    super('platform', s.x * TILE, s.y * TILE, w, 8);
    this.move = s.move || 'h';
    this.look = s.look || 'lift';
    this.color = s.color || 0;
    this.speed = s.speed ?? 1;
    this.phase = s.phase || 0;
    this.x0 = this.x; this.y0 = this.y;
    const range = (s.range || 0) * TILE;
    this.ddx = (s.dx !== undefined ? s.dx * TILE : (this.move === 'h' || this.move === 'rail' || this.move === 'bob' ? range : 0));
    this.ddy = (s.dy !== undefined ? s.dy * TILE : (this.move === 'v' ? range : 0));
    this.base = s.base;             // キリンの首の根もと（マス）
    this.pcx = (s.cx || 0) * TILE; this.pcy = (s.cy || 0) * TILE; this.r = (s.r || 0) * TILE;
    this.dwell = s.dwell ?? 1.6;
    this.height = (s.height || 4) * TILE; // シャチのジャンプの高さ
    this.dur = s.dur || 1.6;
    this.wait = s.wait ?? 1.4;
    this.dx = 0; this.dy = 0;
    this.visible = true;
    this.touched = false;
    this.fallT = 0;
    this.falling = false;
    this.facing = 1;
    this.place(0);
  }
  place(t) {
    switch (this.move) {
      case 'h': case 'v': case 'line': {
        const f = (1 - Math.cos((t * this.speed + this.phase) * Math.PI)) / 2;
        this.x = this.x0 + f * this.ddx; this.y = this.y0 + f * this.ddy;
        break;
      }
      case 'circle': {
        const a = t * this.speed + this.phase * Math.PI * 2;
        this.ax = this.pcx + Math.cos(a) * this.r; this.ay = this.pcy + Math.sin(a) * this.r;
        this.x = this.ax - this.w / 2; this.y = this.ay + 17;
        break;
      }
      case 'rail': {
        const L = Math.abs(this.ddx), T1 = L / this.speed, cyc = 2 * (T1 + this.dwell);
        const tau = ((t + this.phase * cyc) % cyc + cyc) % cyc;
        let pos;
        if (tau < this.dwell) pos = 0;
        else if (tau < this.dwell + T1) pos = smooth((tau - this.dwell) / T1);
        else if (tau < 2 * this.dwell + T1) pos = 1;
        else pos = 1 - smooth((tau - 2 * this.dwell - T1) / T1);
        const nx = this.x0 + pos * this.ddx;
        if (nx !== this.x) this.facing = nx > this.x ? 1 : -1;
        this.x = nx;
        break;
      }
      case 'loop': {
        const len = Math.hypot(this.ddx, this.ddy) || 1;
        const u = ((t * this.speed / len + this.phase) % 1 + 1) % 1;
        this.x = this.x0 + u * this.ddx - this.w / 2 + TILE / 2;
        this.y = this.y0 + u * this.ddy;
        this.u = u;
        this.visible = u > 0.01 && u < 0.99;
        break;
      }
      case 'bob': {
        const f = this.ddx ? (1 - Math.cos((t * this.speed + this.phase) * Math.PI)) / 2 : 0;
        this.x = this.x0 + f * this.ddx;
        this.y = this.y0 + Math.sin(t * 1.8 + this.phase * 6.28) * 2.5;
        break;
      }
      case 'arc': {
        const cyc = this.wait + this.dur;
        const tau = ((t + this.phase * cyc) % (2 * cyc) + 2 * cyc) % (2 * cyc);
        const back = tau >= cyc;
        const k = back ? tau - cyc : tau;
        if (k < this.wait) { this.visible = false; this.u = 0; this.x = back ? this.x0 : this.x0 + this.ddx; }
        else {
          const u = (k - this.wait) / this.dur;
          this.u = u;
          this.visible = true;
          const from = back ? this.x0 + this.ddx : this.x0, to = back ? this.x0 : this.x0 + this.ddx;
          this.facing = to > from ? 1 : -1;
          this.x = from + (to - from) * u;
          this.y = this.y0 - 4 * this.height * u * (1 - u);
          this.vyNow = -4 * this.height * (1 - 2 * u) / this.dur;
        }
        break;
      }
    }
  }
  update(game, dt) {
    const px = this.x, py = this.y;
    this.t += dt;
    if (this.move === 'fall') {
      if (this.touched && !this.falling) {
        this.fallT += dt;
        if (this.fallT > 0.45) this.falling = true;
      }
      if (this.falling) {
        this.vy = Math.min(this.vy + 900 * dt, 320);
        this.y += this.vy * dt;
        if (this.y > game.level.pxH + 20) this.remove = true;
      }
    } else {
      this.place(this.t);
    }
    this.dx = this.x - px; this.dy = this.y - py;
    // ワープしたときは乗っている人を運ばない
    if (Math.abs(this.dx) > 40 || Math.abs(this.dy) > 40) { this.dx = 0; this.dy = 0; }
  }
}

export function makeThing(s) {
  switch (s.type) {
    case 'medal': return new Medal(s.x, s.y, s.id);
    case 'checkpoint': return new Checkpoint(s.x, s.y, s.idx);
    case 'goal': return new Goal(s.x, s.base, s.label);
    case 'platform': return new Platform(s);
  }
  return makeEnemy(s);
}
