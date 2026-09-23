// 主人公「りん」の動き
import { PHYS, HURT_INVINCIBLE } from './config.js';
import { moveBody } from './physics.js';

export class Player {
  constructor(x, y) {
    this.w = 12; this.h = 14;
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.facing = 1;
    this.grounded = false;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.jumping = false;
    this.runCharge = 0;
    this.airMax = PHYS.walkSpeed;
    this.powered = false;   // パワーアップ中（1回ダメージOK・レンガをこわせる）
    this.inv = 0;           // ダメージ後のむてき時間
    this.star = 0;          // スターのむてき時間
    this.boots = 0;         // ジャンプぐつの時間（高くとべて、空中でもう1回ジャンプできる）
    this.airJumps = 0;
    this.sq = 0;            // つぶれ・のび（+ でつぶれる、- でのびる）
    this.walkPhase = 0;
    this.pose = 'stand';
    this.riding = null;     // 乗っている動く足場
    this.prevBottom = y + this.h;
    this.combo = 0;         // 連続でふんだ数
    this.visible = true;
    this.t = 0;
    this.powerFlash = 0;
  }
  get cx() { return this.x + this.w / 2; }
  get bottom() { return this.y + this.h; }

  update(game, dt, input) {
    const P = PHYS;
    this.t += dt;
    if (this.inv > 0) this.inv -= dt;
    if (this.star > 0) this.star -= dt;
    if (this.boots > 0) this.boots -= dt;
    this.sq *= Math.exp(-dt * 12);
    if (this.powerFlash > 0) this.powerFlash -= dt;

    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    // --- 横の動き ---
    if (dir !== 0) {
      const reversing = this.vx * dir < 0;
      let accel = this.grounded ? P.accelGround : P.accelAir;
      if (reversing) accel *= this.grounded ? P.turnBoost : 1.3;
      let max;
      if (this.grounded) {
        if (!reversing && Math.abs(this.vx) >= P.walkSpeed - 2) this.runCharge += dt;
        else if (reversing) this.runCharge = 0;
        max = this.runCharge > P.runDelay ? P.runSpeed : P.walkSpeed;
      } else {
        max = this.airMax;
      }
      const along = this.vx * dir;
      if (along < max) {
        const a = (!reversing && Math.abs(this.vx) >= P.walkSpeed) ? P.accelRun : accel;
        this.vx += dir * a * dt;
        if (this.vx * dir > max) this.vx = dir * max;
      } else if (this.grounded) {
        this.vx -= dir * P.friction * 0.4 * dt;
        if (this.vx * dir < max) this.vx = dir * max;
      }
      this.facing = dir;
    } else {
      this.runCharge = 0;
      const f = this.grounded ? P.friction : P.airDrag;
      if (this.vx > 0) this.vx = Math.max(0, this.vx - f * dt);
      else if (this.vx < 0) this.vx = Math.min(0, this.vx + f * dt);
    }

    // --- ジャンプ ---
    if (input.jumpPressed) this.jumpBuf = P.jumpBuffer; else this.jumpBuf -= dt;
    if (this.grounded) this.coyote = P.coyote; else this.coyote -= dt;
    if (!input.jump) this.jumping = false;
    if (this.jumpBuf > 0 && this.coyote > 0) {
      const running = Math.abs(this.vx) > P.walkSpeed + 15;
      this.vy = -(running ? P.jumpVelRun : P.jumpVel) * (this.boots > 0 ? 1.1 : 1);
      this.jumpBuf = 0; this.coyote = 0;
      this.grounded = false; this.jumping = true; this.riding = null;
      this.airMax = Math.max(P.walkSpeed, Math.abs(this.vx));
      this.airJumps = 1;
      this.sq = -0.2;
      game.sfx('jump');
    } else if (this.jumpBuf > 0 && this.boots > 0 && this.airJumps > 0 && !this.grounded) {
      // ジャンプぐつ：空中でもう1回ジャンプ
      this.vy = -P.jumpVel;
      this.jumpBuf = 0; this.airJumps--;
      this.jumping = true; this.riding = null;
      game.sfx('jump');
      this.sq = -0.25;
      if (game.dust) game.dust(this.cx, this.y + this.h + 2, 5);
    }

    // --- 重力（滝・シャワーなどの力も足す） ---
    const f = game.forceAt ? game.forceAt(this) : null;
    let g;
    if (this.vy < 0) g = this.jumping ? P.gravityUpHold : P.gravityUp;
    else g = P.gravityDown;
    if (f) g += f.ay;
    this.vy = Math.min(this.vy + g * dt, P.maxFall + (f && f.ay > 0 ? 150 : 0));
    if (f && f.capUp !== null && this.vy < f.capUp) this.vy = f.capUp;
    this.inForce = !!(f && (f.ay || f.ext));

    // --- 移動と当たり判定（風で横に流される分も足す） ---
    const ext = f ? f.ext : 0;
    this.vx += ext;
    this.prevBottom = this.y + this.h;
    const fallV = this.vy, wasGround = this.grounded;
    const r = moveBody(this, game.level, dt, { player: true, corner: true });
    if (!r.wallL && !r.wallR) this.vx -= ext;
    if (r.ceil) { this.jumping = false; game.onHeadBump(r, this); }
    this.grounded = r.ground;
    if (r.ground) {
      // 着地：高いところからほど大きくつぶれて、土けむりが出る
      if (!wasGround && fallV > 180) {
        this.sq = Math.min(0.28, fallV / 1500);
        if (fallV > 300 && game.dust) game.dust(this.cx, this.y + this.h, 4);
      }
      this.land();
    }

    this.updatePose(dir, dt);
    // 切り返しの土けむり
    if (this.pose === 'skid' && Math.random() < dt * 20 && game.dust) game.dust(this.cx - this.facing * 4, this.y + this.h, 1);
  }

  land() {
    this.jumping = false;
    this.airJumps = 1;
    this.combo = 0;
    this.airMax = PHYS.walkSpeed;
  }

  updatePose(dir, dt) {
    if (!this.grounded) {
      this.pose = this.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.vx) > 4) {
      this.pose = (dir !== 0 && this.vx * dir < 0) ? 'skid' : 'walk';
      this.walkPhase += Math.abs(this.vx) * dt * 0.22;
    } else {
      this.pose = 'stand';
      this.walkPhase = 0;
    }
  }

  // ダメージを受けたとき。true を返したらミス
  hurt(game) {
    if (this.star > 0 || this.inv > 0) return false;
    if (this.powered) {
      this.powered = false;
      this.inv = HURT_INVINCIBLE;
      game.sfx('shrink');
      return false;
    }
    return true;
  }
}
