// ゲームの進行（1ステージ分）
import { Art } from './art.js';
import { TILE, T, PHYS, STAR_TIME } from './config.js';
import { Level } from './level.js';
import { LEVELS } from './levels.js';
import { Player } from './player.js';
import { makeThing, PopCoin, PowerItem, Deco } from './entities.js';
import { zoneForce, buildZones } from './zones.js';
import { boxOverlap, moveBody } from './physics.js';

const COMBO = [100, 200, 400, 800, 1000, 2000, 4000, 8000];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

export class Game {
  constructor(app) {
    this.app = app;
    this.viewW = 480;
    this.runMedals = new Set();
    this.checkpointIdx = -1;
  }

  get session() { return this.app.session; }
  sfx(name) { this.app.sound.play(name); }
  // 滝・風などの力
  forceAt(box) { return this.zones.length ? zoneForce(this.zones, box, this.time) : null; }
  // その場所のテーマ（見た目）
  themeAt(px) { return this.level.themeAtPx(px); }

  // opts.respawn: ミスした後の再スタート（メダルと中間ポイントを引きつぐ）
  // opts.demo: タイトル画面の背景用
  start(stageIdx, opts = {}) {
    const def = LEVELS[stageIdx];
    // このステージで使う背景の絵を用意する（ほかの場所の背景は片付ける）
    Art.prepareBg([...new Set(def.themes.map(z => z.theme))], this.app && this.app.renderer ? this.app.renderer.K : 3);
    this.stageIdx = stageIdx;
    this.def = def;
    this.level = new Level(def);
    this.demo = !!opts.demo;
    if (!opts.respawn) { this.runMedals = new Set(); this.checkpointIdx = -1; }
    this.entities = [];
    this.platforms = [];
    this.particles = [];
    this.bumps = [];
    this.checkpoints = [];
    this.goal = null;
    this.boss = null;
    this.decos = (def.decos || []).map(d => new Deco(d));
    this.zones = buildZones(def, TILE);
    for (const s of def.spawns) {
      if (s.type === 'medal' && this.runMedals.has(s.id)) continue;
      const e = makeThing(s);
      if (!e) continue;
      if (e.kind === 'platform') this.platforms.push(e); else this.entities.push(e);
      if (e.kind === 'goal') this.goal = e;
      if (e.kind === 'boss') this.boss = e;
      if (e.kind === 'checkpoint') {
        this.checkpoints.push(e);
        if (e.idx <= this.checkpointIdx) e.active = true;
      }
    }
    const sp = this.checkpointIdx >= 0 ? def.checkpoints[this.checkpointIdx] : def.start;
    const p = new Player(0, 0);
    p.x = sp.x * TILE + (TILE - p.w) / 2;
    p.y = (sp.y + 1) * TILE - p.h;
    p.powered = !opts.respawn && !!this.session.powered;
    p.visible = !this.demo;
    this.player = p;
    this.state = this.demo ? 'demo' : 'play';
    this.stateT = 0;
    this.time = 0;
    this.shakeT = 0;
    this.banner = opts.respawn ? 1.6 : 3.0;
    this.starMusic = false;
    this.bossMusic = false;
    this.clearReported = false;
    // 最後のステージは、ボスをたおすまで夜景が暗い
    this.cityLight = stageIdx === LEVELS.length - 1 ? 0.35 : undefined;
    this.cam = 0;
    this.snapCamera();
    if (!this.demo) this.app.sound.playBgm(def.bgm);
  }

  // ===================== 更新 =====================
  update(dt, input) {
    this.time += dt;
    this.input = input;
    if (this.banner > 0) this.banner -= dt;
    if (this.shakeT > 0) this.shakeT -= dt;
    this.updateBumps(dt);
    if (this.state !== 'dying') for (const pf of this.platforms) pf.update(this, dt);
    switch (this.state) {
      case 'demo': this.updateDemo(dt); break;
      case 'play': this.updatePlay(dt, input); break;
      case 'dying': this.updateDying(dt); break;
      case 'goal': this.updateGoal(dt); break;
      case 'bossWin': this.updateBossWin(dt); break;
    }
    this.updateParticles(dt);
    this.platforms = this.platforms.filter(p => !p.remove);
  }

  updateDemo(dt) {
    this.cam += 24 * dt;
    if (this.cam > this.level.pxW - this.viewW) this.cam = 0;
    for (const e of this.entities) if (!e.isEnemy) e.update(this, dt);
    for (const d of this.decos) d.update(this, dt);
  }

  updatePlay(dt, input) {
    const p = this.player;
    for (const d of this.decos) d.update(this, dt);
    // 動く足場に乗っていたら一緒に動く
    if (p.riding && !p.riding.remove) { p.x += p.riding.dx; p.y += p.riding.dy; }
    p.update(this, dt, input);
    this.landOnPlatforms(p);
    this.tileInteractions(p);
    if (this.state !== 'play') return;
    this.updateEntities(dt, true);
    if (this.state !== 'play') return;

    // 中間ポイント
    for (const c of this.checkpoints) {
      if (!c.active && p.cx >= c.x) {
        c.active = true;
        this.checkpointIdx = Math.max(this.checkpointIdx, c.idx);
        this.sfx('check');
        this.sparkle(c.x + 10, c.y + 6, 8);
      }
    }
    // スターが切れたら音楽をもどす
    if (this.starMusic && p.star <= 0) {
      this.starMusic = false;
      this.app.sound.playBgm(this.bossMusic ? 'boss' : this.def.bgm);
    }
    if (p.star > 0 && Math.random() < 0.35) {
      this.particles.push({ type: 'spark', x: p.x + rand(0, p.w), y: p.y + rand(0, p.h), vx: rand(-20, 20), vy: rand(-40, 0), life: 0.4, max: 0.4, hue: rand(0, 360) });
    }
    // ゴール
    if (this.goal && p.x + p.w >= this.goal.poleX - 1) this.startGoal();
    // 下に落ちた
    if (p.y > this.level.pxH + 8) this.killPlayer(true);
    this.updateCamera();
  }

  landOnPlatforms(p) {
    p.riding = null;
    if (p.vy < 0) return;
    for (const pf of this.platforms) {
      if (!pf.visible) continue;
      if (p.x + p.w <= pf.x + 1 || p.x >= pf.x + pf.w - 1) continue;
      const top = pf.y;
      if (p.prevBottom <= top + Math.abs(pf.dy) + 3 && p.bottom >= top) {
        p.y = top - p.h;
        p.vy = 0;
        if (!p.grounded) p.land();
        p.grounded = true;
        p.riding = pf;
        if (pf.move === 'fall') pf.touched = true;
        if (p.pose === 'fall' || p.pose === 'jump') p.pose = 'stand';
        break;
      }
    }
  }

  tileInteractions(p) {
    const L = this.level;
    const l = Math.floor(p.x / TILE), r = Math.floor((p.x + p.w - 0.01) / TILE);
    const t = Math.floor(p.y / TILE), b = Math.floor((p.y + p.h - 0.01) / TILE);
    for (let ty = t; ty <= b; ty++) {
      for (let tx = l; tx <= r; tx++) {
        const tile = L.get(tx, ty);
        if (tile === T.COIN) {
          L.set(tx, ty, T.EMPTY);
          this.addCoin();
          this.sparkle(tx * TILE + 8, ty * TILE + 8, 4);
        } else if (tile === T.SPIKE) {
          if (boxOverlap(p, { x: tx * TILE + 2, y: ty * TILE + 7, w: 12, h: 9 })) this.hurtPlayer();
        } else if (tile === T.LAVA) {
          if (boxOverlap(p, { x: tx * TILE, y: ty * TILE + 6, w: 16, h: 10 })) { this.killPlayer(false); return; }
        } else if (tile === T.WATER) {
          const surf = L.get(tx, ty - 1) !== T.WATER ? 7 : 0;
          if (boxOverlap(p, { x: tx * TILE, y: ty * TILE + surf, w: 16, h: 16 - surf })) { this.splash(p.cx, ty * TILE + surf); this.killPlayer(true); return; }
        }
      }
    }
  }

  updateEntities(dt, collide) {
    const camL = this.cam - 96, camR = this.cam + this.viewW + 96;
    for (const e of this.entities) {
      if (e.isEnemy && !e.awake) {
        if (e.x < this.cam + this.viewW + 24 && e.x + e.w > this.cam - 24) e.awake = true;
        else continue;
      }
      const near = e.x + e.w > camL && e.x < camR;
      if (!near && !e.dead && e.kind !== 'boss') continue; // 画面から遠い敵は止めておく
      e.update(this, dt);
    }

    // 歩く敵どうしがぶつかったら向きを変える
    const walkers = this.entities.filter(e => e.walker && e.awake && !e.dead);
    for (let i = 0; i < walkers.length; i++) {
      for (let j = i + 1; j < walkers.length; j++) {
        const a = walkers[i], b = walkers[j];
        if (!boxOverlap(a, b)) continue;
        if ((a.dir > 0 && a.cx < b.cx) || (a.dir < 0 && a.cx > b.cx)) a.dir *= -1;
        if ((b.dir > 0 && b.cx < a.cx) || (b.dir < 0 && b.cx > a.cx)) b.dir *= -1;
      }
    }

    if (collide) this.playerCollisions();
    this.entities = this.entities.filter(e => !e.remove);
  }

  playerCollisions() {
    const p = this.player;
    const hb = { x: p.x + 1, y: p.y + 1, w: p.w - 2, h: p.h - 1 };
    const input = this.input || {};
    for (const e of this.entities) {
      if (e.remove) continue;
      if (e.isEnemy) {
        if (!e.awake || e.dead) continue;
        if (e.kind === 'boss' && e.hurtT > 0) continue;
        if (!boxOverlap(hb, e)) continue;
        // スター中は体当たりでたおせる
        if (p.star > 0 && !e.starImmune) {
          if (e.kill(this, p.cx < e.cx ? 1 : -1)) { this.addScore(e.score, e.cx, e.y); this.sfx('kick'); }
          continue;
        }
        // ふんだ？
        const stompLine = e.y + Math.max(6, e.h * 0.45);
        if (e.stompable && p.vy > 0 && p.prevBottom <= stompLine) {
          if (e.stomp(this)) {
            p.combo++;
            if (p.combo >= 9) this.oneUp(e.cx, e.y);
            else this.addScore(COMBO[Math.min(p.combo - 1, COMBO.length - 1)], e.cx, e.y);
            if (e.kind === 'boss') {
              p.vy = -430;
              p.vx = (p.cx < e.cx ? -1 : 1) * 110;
            } else {
              this.sfx('stomp');
              p.vy = -(input.jump ? PHYS.stompBounceHold : PHYS.stompBounce);
            }
            p.jumping = !!input.jump;
            p.y = Math.min(p.y, e.y - p.h + 2);
            this.dust(e.cx, e.y + 4, 4);
          }
          continue;
        }
        if (e.harmful) this.hurtPlayer();
        if (this.state !== 'play') return;
      } else if (e.kind === 'medal') {
        if (boxOverlap(hb, e)) {
          e.remove = true;
          this.runMedals.add(e.id);
          this.sfx('medal');
          this.addScore(2000, e.cx, e.y);
          this.sparkle(e.cx, e.y + 10, 14);
        }
      } else if (e.isItem && !e.behind) {
        if (boxOverlap(hb, e)) this.collectItem(e);
      }
    }
  }

  collectItem(e) {
    const p = this.player;
    e.remove = true;
    if (e.kind === 'apple') {
      if (!p.powered) { p.powered = true; p.powerFlash = 0.8; }
      this.sfx('power');
      this.addScore(1000, e.cx, e.y);
      this.sparkle(p.cx, p.y + 6, 10);
    } else if (e.kind === 'heart') {
      this.oneUp(e.cx, e.y);
    } else if (e.kind === 'star') {
      p.star = STAR_TIME;
      this.sfx('power');
      this.addScore(1000, e.cx, e.y);
      this.starMusic = true;
      this.app.sound.playBgm('star');
    }
  }

  hurtPlayer() {
    if (this.player.hurt(this)) this.killPlayer(false);
  }

  killPlayer(fell) {
    if (this.state !== 'play') return;
    const p = this.player;
    this.state = 'dying';
    this.stateT = 0;
    this.fellDeath = fell;
    p.pose = 'dead'; p.vx = 0; p.vy = 0; p.powered = false; p.star = 0; p.inv = 0;
    p.deathJump = false;
    this.session.powered = false;
    this.app.sound.stopBgm();
    this.sfx('die');
  }

  updateDying(dt) {
    const p = this.player;
    this.stateT += dt;
    if (!this.fellDeath && this.stateT > 0.5) {
      if (!p.deathJump) { p.deathJump = true; p.vy = -360; }
      p.vy += 1100 * dt;
      p.y += p.vy * dt;
    }
    if (this.stateT > 2.8 && this.state === 'dying') {
      this.state = 'dead';
      this.app.onPlayerDied();
    }
  }

  // ===================== ブロック =====================
  onHeadBump(r, p) {
    let best = r.ceilTiles[0], bd = Infinity;
    for (const tx of r.ceilTiles) {
      const d = Math.abs((tx + 0.5) * TILE - p.cx);
      if (d < bd) { bd = d; best = tx; }
    }
    this.bumpTile(best, r.ceilRow, p);
  }

  bumpTile(tx, ty, p) {
    const L = this.level;
    const t = L.get(tx, ty);
    const key = L.key(tx, ty);
    if (t === T.QBLOCK || t === T.HIDDEN) {
      const c = L.contents.get(key) || 'coin';
      L.set(tx, ty, T.USED);
      this.addBump(tx, ty);
      this.spawnContent(c, tx, ty);
    } else if (t === T.BRICK) {
      const c = L.contents.get(key);
      if (c === 'coins') {
        const n = (L.coinCounts.has(key) ? L.coinCounts.get(key) : 8) - 1;
        L.coinCounts.set(key, n);
        this.spawnContent('coin', tx, ty);
        if (n <= 0) L.set(tx, ty, T.USED);
        this.addBump(tx, ty);
      } else if (c) {
        L.set(tx, ty, T.USED);
        this.addBump(tx, ty);
        this.spawnContent(c, tx, ty);
      } else if (p.powered) {
        L.set(tx, ty, T.EMPTY);
        this.breakBrick(tx, ty);
      } else {
        this.addBump(tx, ty);
        this.sfx('bump');
      }
    } else {
      this.sfx('bump');
    }
    this.hitAbove(tx, ty);
  }

  // たたいたブロックの上にいる敵やアイテム
  hitAbove(tx, ty) {
    const top = ty * TILE, x0 = tx * TILE, x1 = x0 + TILE;
    for (const e of this.entities) {
      const over = e.x < x1 && e.x + e.w > x0 && Math.abs(e.bottom - top) < 3;
      if (!over) continue;
      if (e.isEnemy && e.awake && !e.dead) {
        if (e.kill(this, e.cx < x0 + 8 ? -1 : 1)) { this.addScore(e.score, e.cx, e.y); this.sfx('kick'); }
      } else if (e.isItem && !e.behind) {
        e.vy = -260;
        e.dir = e.cx < x0 + 8 ? -1 : 1;
      }
    }
    if (this.level.get(tx, ty - 1) === T.COIN) {
      this.level.set(tx, ty - 1, T.EMPTY);
      this.addCoin();
      this.entities.push(new PopCoin(tx, ty));
    }
  }

  spawnContent(c, tx, ty) {
    switch (c) {
      case 'coin': this.entities.push(new PopCoin(tx, ty)); this.addCoin(); break;
      case 'power': this.entities.push(new PowerItem('apple', tx, ty)); this.sfx('sprout'); break;
      case 'heart': this.entities.push(new PowerItem('heart', tx, ty)); this.sfx('sprout'); break;
      case 'star': this.entities.push(new PowerItem('star', tx, ty)); this.sfx('sprout'); break;
    }
  }

  addBump(tx, ty) { this.bumps.push({ tx, ty, t: 0 }); }
  updateBumps(dt) {
    for (const b of this.bumps) b.t += dt;
    this.bumps = this.bumps.filter(b => b.t < 0.2);
  }
  bumpOffset(tx, ty) {
    for (const b of this.bumps) if (b.tx === tx && b.ty === ty) return -Math.sin(b.t / 0.2 * Math.PI) * 5;
    return 0;
  }

  breakBrick(tx, ty) {
    const cx = tx * TILE + 8, cy = ty * TILE + 8;
    for (const [vx, vy] of [[-70, -330], [70, -330], [-55, -220], [55, -220]]) {
      this.particles.push({ type: 'brick', x: cx, y: cy, vx, vy, life: 1.2, max: 1.2, rot: 0 });
    }
    this.sfx('break');
    this.addScore(50);
  }

  // ===================== スコアなど =====================
  addCoin() {
    const s = this.session;
    s.coins++;
    this.sfx('coin');
    this.addScore(100);
    if (s.coins >= 100) { s.coins -= 100; this.oneUp(this.player.cx, this.player.y); }
  }
  addScore(n, x, y) {
    this.session.score += n;
    if (x !== undefined) this.popup(String(n), x, y);
  }
  oneUp(x, y) {
    this.session.lives = Math.min(99, this.session.lives + 1);
    this.sfx('oneup');
    this.popup('1UP', x, y);
  }
  popup(text, x, y) { this.particles.push({ type: 'text', text, x, y, vy: -30, life: 0.9, max: 0.9 }); }
  sparkle(x, y, n = 5) {
    for (let i = 0; i < n; i++) {
      this.particles.push({ type: 'spark', x, y, vx: rand(-70, 70), vy: rand(-90, 20), life: 0.5, max: 0.5, hue: 48 });
    }
  }
  splash(x, y) {
    this.sfx('splash');
    for (let i = 0; i < 12; i++) {
      this.particles.push({ type: 'drop', x: x + rand(-6, 6), y, vx: rand(-60, 60), vy: rand(-220, -80), life: 0.7, max: 0.7 });
    }
  }
  dust(x, y, n = 4) {
    for (let i = 0; i < n; i++) {
      this.particles.push({ type: 'dust', x: x + rand(-6, 6), y: y - 2, vx: rand(-40, 40), vy: rand(-30, -5), life: 0.4, max: 0.4 });
    }
  }
  shake(t) { this.shakeT = Math.max(this.shakeT, t); }

  updateParticles(dt) {
    for (const q of this.particles) {
      q.life -= dt;
      q.x += (q.vx || 0) * dt;
      q.y += (q.vy || 0) * dt;
      if (q.type === 'brick') { q.vy += 1100 * dt; q.rot += dt * 12; }
      if (q.type === 'spark') { q.vy += 100 * dt; }
      if (q.type === 'drop') { q.vy += 900 * dt; }
    }
    this.particles = this.particles.filter(q => q.life > 0);
  }

  // ===================== ゴール =====================
  startGoal() {
    const g = this.goal, p = this.player;
    this.state = 'goal';
    this.goalPhase = 'slide';
    this.stateT = 0;
    p.vx = 0; p.vy = 0; p.star = 0; p.inv = 0;
    p.x = g.poleX - p.w + 1;
    p.pose = 'climb'; p.facing = 1;
    const h = g.groundY - p.bottom;
    const sc = h > 120 ? 5000 : h > 90 ? 2000 : h > 60 ? 800 : h > 30 ? 400 : 100;
    this.addScore(sc, g.poleX + 12, p.y);
    this.app.sound.stopBgm();
    this.sfx('flag');
  }

  updateGoal(dt) {
    const g = this.goal, p = this.player;
    this.stateT += dt;
    this.updateEntities(dt, false);
    if (this.goalPhase === 'slide') {
      p.y = Math.min(p.y + 140 * dt, g.groundY - p.h);
      g.flagY = Math.min(g.flagY + 140 * dt, g.groundY - 22);
      if (p.bottom >= g.groundY - 0.5 && g.flagY >= g.groundY - 22 && this.stateT > 0.6) {
        this.goalPhase = 'walk';
        this.stateT = 0;
        p.x = g.poleX + 2;
        p.pose = 'stand';
        this.app.sound.playJingle('clear');
      }
    } else if (this.goalPhase === 'walk') {
      if (this.stateT > 0.35) {
        p.vx = 70;
        p.vy = Math.min(p.vy + 1800 * dt, 480);
        const r = moveBody(p, this.level, dt);
        p.grounded = r.ground;
        p.updatePose(1, dt);
        if (p.cx >= g.doorX + 8) { p.visible = false; this.goalPhase = 'done'; this.stateT = 0; }
      }
    } else if (this.goalPhase === 'done') {
      if (this.stateT > 1.6 && !this.clearReported) {
        this.clearReported = true;
        this.session.powered = p.powered;
        this.app.onStageClear();
      }
    }
    this.updateCamera();
  }

  // ===================== ボス =====================
  onBossWake() {
    this.bossMusic = true;
    if (!this.starMusic) this.app.sound.playBgm('boss');
  }
  onBossDying(b) {
    this.addScore(5000, b.cx, b.y);
    this.app.sound.stopBgm();
    this.sparkle(b.cx, b.y + 10, 20);
  }
  onBossDefeated() {
    if (this.state !== 'play') return;
    this.state = 'bossWin';
    this.stateT = 0;
    this.app.sound.playJingle('ending');
  }
  updateBossWin(dt) {
    const p = this.player;
    this.stateT += dt;
    if (this.cityLight !== undefined) this.cityLight = Math.min(1, this.cityLight + dt * 0.35);
    p.vx *= 0.9;
    p.vy = Math.min(p.vy + 1800 * dt, 480);
    const r = moveBody(p, this.level, dt);
    p.grounded = r.ground;
    p.updatePose(0, dt);
    if (this.stateT > 0.5 && Math.random() < 0.3) {
      this.particles.push({ type: 'spark', x: this.cam + rand(0, this.viewW), y: rand(20, 150), vx: 0, vy: 30, life: 0.8, max: 0.8, hue: rand(0, 360) });
    }
    if (this.stateT > 4.5 && !this.clearReported) {
      this.clearReported = true;
      this.app.onGameComplete();
    }
  }

  // ===================== カメラ =====================
  updateCamera() {
    const p = this.player, vw = this.viewW;
    const left = this.cam + vw * 0.35, right = this.cam + vw * 0.45;
    if (p.cx > right) this.cam = p.cx - vw * 0.45;
    else if (p.cx < left) this.cam = p.cx - vw * 0.35;
    this.cam = clamp(this.cam, 0, Math.max(0, this.level.pxW - vw));
  }
  snapCamera() {
    this.cam = clamp(this.player.cx - this.viewW * 0.4, 0, Math.max(0, this.level.pxW - this.viewW));
  }
}
