// 画面の描画
import { TILE, T, VIEW_H, MIN_VIEW_W, MAX_VIEW_W, isSlope } from './config.js';
import * as S from './sprites.js';
import { THEMES, BG } from './themes.js';
import { paintTile } from './tiles.js';
import { drawDeco, drawPlatformLook, drawZone, drawGoal } from './decos.js';
import { zoneActive, windDir } from './zones.js';
import { Art } from './art.js';
import { tileArt } from './tileart.js';

const VARIANT_MATS = new Set(['container', 'parasol']);
const FONT = '"Hiragino Maru Gothic ProN", "Hiragino Sans", "Arial Rounded MT Bold", sans-serif';

function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.tileCache = new Map();
    this.bgCache = new Map();
    this.safe = { l: 0, r: 0, t: 0, b: 0 };
    this.debug = false;
    this.resize();
  }

  resize() {
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let scale = cssH / VIEW_H;
    let viewW = cssW / scale;
    let offX = 0, offY = 0;
    if (viewW > MAX_VIEW_W) {
      viewW = MAX_VIEW_W;
      offX = (cssW - viewW * scale) / 2;
    } else if (viewW < MIN_VIEW_W) {
      viewW = MIN_VIEW_W;
      scale = cssW / MIN_VIEW_W;
      offY = (cssH - VIEW_H * scale) / 2;
    }
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.cssW = cssW; this.cssH = cssH;
    this.dpr = dpr;
    this.scale = scale;
    this.K = scale * dpr;
    this.viewW = viewW;
    this.offX = offX * dpr;
    this.offY = offY * dpr;
    this.tileCache.clear();
    this.bgCache.clear();
    Art.init(this.K);
    // セーフエリア（iPhoneのノッチ）をゲーム内の大きさに変換
    const probe = document.getElementById('safeProbe');
    if (probe) {
      const cs = getComputedStyle(probe);
      const px = v => parseFloat(v) || 0;
      this.safe = {
        l: Math.max(0, px(cs.paddingLeft) - offX) / scale,
        r: Math.max(0, px(cs.paddingRight) - offX) / scale,
        t: Math.max(0, px(cs.paddingTop) - offY) / scale,
        b: Math.max(0, px(cs.paddingBottom) - offY) / scale
      };
    }
  }

  // ===================== タイル =====================
  getTile(theme, key) {
    if (this.artVersion !== Art.version) { this.tileCache.clear(); this.artVersion = Art.version; }
    const ck = theme + '#' + key;
    let c = this.tileCache.get(ck);
    if (c) return c;
    const size = Math.max(1, Math.ceil(TILE * this.K));
    c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.scale(size / TILE, size / TILE);
    // SVGの絵があればそれを重ねて描く（なければこれまでの絵）
    const layers = Art.ready ? tileArt(theme, key) : null;
    if (layers) for (const nm of layers) { if (Array.isArray(nm)) Art.draw(ctx, nm[0], nm[1], nm[2]); else Art.drawTile(ctx, nm); }
    else paintTile(ctx, THEMES[theme], key.split(':')[0]);
    this.tileCache.set(ck, c);
    return c;
  }

  tileKey(L, t, tx, ty, time) {
    let k;
    const solid = a => a !== T.EMPTY && a !== T.WATER && a !== T.COIN && a !== T.SEMI && a !== T.ISEMI && a !== T.SPIKE && a !== T.LAVA && a !== T.HIDDEN;
    let extra = '';
    switch (t) {
      case T.GROUND: case T.FAKEG: {
        const a = L.get(tx, ty - 1);
        const top = !(a === T.GROUND || a === T.FAKEG || isSlope(a)) && ty > 0;
        k = (t === T.FAKEG ? 'fg' : 'g') + (top ? 'T' : '');
        const le = L.get(tx - 1, ty), ri = L.get(tx + 1, ty);
        // 地面の深さ（上に何マス地面が続くか）
        let depth = 0;
        while (depth < 4 && ty - depth - 1 >= 0) { const u = L.get(tx, ty - depth - 1); if (u === T.GROUND || u === T.FAKEG || isSlope(u)) depth++; else break; }
        // まわりの様子（はしが切れているか）とばらつき
        extra = ':' + (tx > 0 && !solid(le) ? 'l' : '') + (tx < L.w - 1 && !solid(ri) ? 'r' : '') + (tx % 6 === 3 ? 'c' : '') + depth + ':' + (((tx * 7 + ty * 13) ^ (tx >> 2)) & 7);
        break;
      }
      case T.BRICK: k = 'brick'; break;
      case T.QBLOCK: return '|q' + [0, 1, 2, 1, 0, 0][Math.floor(time * 6) % 6];
      case T.USED: return '|used';
      case T.HARD: {
        k = 'hard';
        const a = L.get(tx, ty - 1);
        extra = ':' + (solid(a) ? '' : 'T');
        break;
      }
      case T.FAKE: k = 'fake'; break;
      case T.PIPE: {
        const left = L.get(tx - 1, ty) !== T.PIPE;
        const top = L.get(tx, ty - 1) !== T.PIPE;
        k = 'pipe' + (top ? 'T' : '') + (left ? 'L' : 'R');
        break;
      }
      case T.SEMI: k = 'semi'; break;
      case T.SPIKE: k = 'spike'; break;
      case T.LAVA: k = 'lava' + (L.get(tx, ty - 1) !== T.LAVA ? 'T' : '') + (Math.floor(time * 5 + tx * 0.5) % 4); break;
      case T.WATER: k = 'water' + (L.get(tx, ty - 1) !== T.WATER ? 'T' : '') + (Math.floor(time * 4 + tx * 0.7) % 4); break;
      case T.COIN: return '|coin' + (Math.floor(time * 8) % 8);
      case T.SLOPE_R: k = 'sR'; break;
      case T.SLOPE_L: k = 'sL'; break;
      case T.SLOPE_R1: k = 'sRa'; break;
      case T.SLOPE_R2: k = 'sRb'; break;
      case T.SLOPE_L2: k = 'sLb'; break;
      case T.SLOPE_L1: k = 'sLa'; break;
      default: return null;
    }
    let mat = L.mat(tx, ty) || '';
    if (mat === 'container') {
      // コンテナは3マスで1個。はしに枠をつける
      const same = (x, y) => L.mat(x, y) === 'container' && L.get(x, y) === T.HARD;
      const g = Math.floor(tx / 3);
      mat += (g % 4);
      extra = ':' + (tx % 3 === 0 || !same(tx - 1, ty) ? 'L' : '') + (tx % 3 === 2 || !same(tx + 1, ty) ? 'R' : '') +
        (!same(tx, ty - 1) ? 'T' : '') + (!same(tx, ty + 1) ? 'B' : '');
    } else if (VARIANT_MATS.has(mat)) mat += (tx % 4);
    return mat + '|' + k + extra;
  }

  drawTiles(game, camX, time) {
    const ctx = this.ctx, L = game.level, K = this.K;
    const tx0 = Math.max(0, Math.floor(camX / TILE));
    const tx1 = Math.min(L.w - 1, Math.floor((camX + this.viewW) / TILE));
    for (let ty = 0; ty < L.h; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = L.tiles[ty * L.w + tx];
        if (t === T.EMPTY || t === T.ISEMI || t === T.ISOLID) {
          if (this.debug && t !== T.EMPTY) {
            ctx.strokeStyle = 'rgba(0,255,255,0.6)';
            ctx.strokeRect(this.offX + (tx * TILE - camX) * K, this.offY + ty * TILE * K, TILE * K, TILE * K);
          }
          continue;
        }
        if (t === T.HIDDEN) {
          if (this.debug) {
            ctx.strokeStyle = 'rgba(255,0,255,0.7)';
            ctx.strokeRect(this.offX + (tx * TILE - camX) * K, this.offY + ty * TILE * K, TILE * K, TILE * K);
          }
          continue;
        }
        const key = this.tileKey(L, t, tx, ty, time);
        if (!key) continue;
        const img = this.getTile(L.colTheme[tx], key);
        const yo = (t === T.BRICK || t === T.QBLOCK || t === T.USED) ? game.bumpOffset(tx, ty) : 0;
        const x0 = Math.round(this.offX + (tx * TILE - camX) * K);
        const x1 = Math.round(this.offX + ((tx + 1) * TILE - camX) * K);
        const y0 = Math.round(this.offY + (ty * TILE + yo) * K);
        const y1 = Math.round(this.offY + ((ty + 1) * TILE + yo) * K);
        ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0);
      }
    }
  }

  // ===================== 背景 =====================
  getBackground(theme) {
    const art = Art.getBg(theme);
    if (!art && Art.hasBg(theme)) {
      // SVGの背景を準備しているあいだは、空の色だけ（古い絵が一瞬見えないように）
      const g = this.ctx.createLinearGradient(0, this.offY, 0, this.offY + VIEW_H * this.K);
      const stops = THEMES[theme].skyStops || [[0, THEMES[theme].sky[0]], [1, THEMES[theme].sky[1]]];
      for (const [o, c] of stops) g.addColorStop(o, c);
      return { layers: [], fg: [], grad: g, art: true };
    }
    if (art) {
      let bg = this.bgCache.get('art:' + theme);
      if (bg && bg.src === art) return bg;
      const g = this.ctx.createLinearGradient(0, this.offY, 0, this.offY + VIEW_H * this.K);
      const stops = THEMES[theme].skyStops || [[0, THEMES[theme].sky[0]], [1, THEMES[theme].sky[1]]];
      for (const [o, c] of stops) g.addColorStop(o, c);
      bg = { layers: art.filter(l => !l.fg), fg: art.filter(l => l.fg), grad: g, dyn: BG[theme] && BG[theme].artDyn, src: art, art: true };
      this.bgCache.set('art:' + theme, bg);
      return bg;
    }
    let bg = this.bgCache.get(theme);
    if (bg) return bg;
    const kb = Math.min(this.K, 2);
    const def = BG[theme];
    const layers = def.layers.map(ld => {
      const c = document.createElement('canvas');
      c.width = Math.ceil(ld.w * kb); c.height = Math.ceil(VIEW_H * kb);
      const ctx = c.getContext('2d');
      ctx.scale(kb, kb);
      ld.paint(ctx, ld.w, mulberry(ld.seed));
      return { canvas: c, f: ld.f, w: ld.w, dim: !!ld.dim };
    });
    const g = this.ctx.createLinearGradient(0, this.offY, 0, this.offY + VIEW_H * this.K);
    const pal = THEMES[theme].sky;
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    bg = { layers, grad: g, dyn: def.dyn };
    this.bgCache.set(theme, bg);
    return bg;
  }

  drawBackground(theme, camX, time, alpha, cityLight) {
    const ctx = this.ctx, K = this.K;
    const bg = this.getBackground(theme);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = bg.grad;
    ctx.fillRect(this.offX, this.offY, this.viewW * K, VIEW_H * K);
    const runDyn = () => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.setTransform(K, 0, 0, K, this.offX, this.offY);
      bg.dyn.draw(ctx, camX, this.viewW, time);
      ctx.restore();
    };
    bg.layers.forEach((layer, i) => {
      // 夜の街の明かり（最後のステージでは、ボスをたおすまで暗い）
      const dim = bg.art ? layer.dim : i === 1;
      ctx.globalAlpha = alpha * (dim && THEMES[theme].night && cityLight !== undefined ? cityLight : 1);
      this.drawLayer(layer, camX);
      if (bg.art && bg.dyn && bg.dyn.after === i) runDyn();
    });
    ctx.globalAlpha = alpha;
    if (bg.dyn && !bg.art) {
      ctx.save();
      ctx.setTransform(K, 0, 0, K, this.offX, this.offY);
      bg.dyn(ctx, camX, this.viewW, time);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // 背景の1枚を横にくり返して描く
  drawLayer(layer, camX) {
    const ctx = this.ctx, K = this.K, w = layer.w;
    const h = layer.h || VIEW_H, y = layer.y || 0;
    const sx = -((((camX * layer.f) % w) + w) % w);
    const y0 = Math.round(this.offY + y * K), y1 = Math.round(this.offY + (y + h) * K);
    for (let x = sx; x < this.viewW; x += w) {
      const x0 = Math.round(this.offX + x * K);
      const x1 = Math.round(this.offX + (x + w) * K);
      ctx.drawImage(layer.canvas, x0, y0, x1 - x0 + 1, y1 - y0);
    }
  }

  // いちばん手前の植え込みなど（キャラクターより前）
  drawForegrounds(L, camX) {
    const center = camX + this.viewW / 2;
    const theme = L.themeAtPx(center);
    const bg = this.getBackground(theme);
    if (!bg.fg || !bg.fg.length) return;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const layer of bg.fg) this.drawLayer(layer, camX);
  }

  // テーマが切りかわる場所では、背景をふわっと入れかえる
  drawBackgrounds(L, camX, time, cityLight) {
    const center = camX + this.viewW / 2;
    const zones = L.themes;
    let idx = 0;
    for (let i = 0; i < zones.length; i++) if (center >= zones[i].from * TILE) idx = i;
    const cur = zones[idx].theme;
    this.drawBackground(cur, camX, time, 1, cityLight);
    const fade = this.viewW * 0.5;
    const next = zones[idx + 1];
    if (next) {
      const d = next.from * TILE - center;
      if (d < fade) this.drawBackground(next.theme, camX, time, 1 - Math.max(0, d) / fade * 1, cityLight);
    }
  }

  // ===================== 全体 =====================
  draw(game, app) {
    const ctx = this.ctx, K = this.K;
    this.app = app;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (!game || !game.level) return;
    game.viewW = this.viewW;
    const L = game.level;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.offX, this.offY, this.viewW * K, VIEW_H * K);
    ctx.clip();

    let camX = game.cam;
    let shakeY = 0;
    if (game.shakeT > 0) { camX += (Math.random() - 0.5) * 3; shakeY = (Math.random() - 0.5) * 3; }
    camX = Math.round(camX * K) / K;
    const time = game.time;
    const night = !!game.def.night || THEMES[L.themeAtPx(camX + this.viewW / 2)].night;

    this.drawBackgrounds(L, camX, time, game.cityLight);

    const world = () => ctx.setTransform(K, 0, 0, K, this.offX - camX * K, this.offY + shakeY * K);
    const inView = (x, w = 0) => x + w > camX - 200 && x < camX + this.viewW + 200;

    // 飾り（タイルの後ろ）
    world();
    this.updateWeathercocks(game);
    for (const d of game.decos) if (d.layer === 'back' && inView(d.x, d.wpx || 400)) drawDeco(ctx, d, L.themeAtPx(d.x), time, night);
    // ブロックから出てくる途中のアイテム（ブロックの後ろ）
    for (const e of game.entities) if (e.behind) this.drawEntity(ctx, e, time, L);

    ctx.setTransform(1, 0, 0, 1, 0, Math.round(shakeY * K));
    this.drawTiles(game, camX, time);

    world();
    for (const d of game.decos) if (d.layer === 'mid' && inView(d.x, d.wpx || 400)) drawDeco(ctx, d, L.themeAtPx(d.x), time, night);
    for (const z of game.zones) drawZone(ctx, z, time, camX, this.viewW);
    for (const pf of game.platforms) if (inView(pf.x, pf.w)) drawPlatformLook(ctx, pf, L.themeAtPx(pf.x), time, night);
    // 奥のもの → 手前のもの
    for (const e of game.entities) {
      if (e.kind === 'goal') drawGoal(ctx, e, time, night);
      else if (e.kind === 'checkpoint') S.drawCheckpoint(ctx, e, time);
    }
    for (const e of game.entities) if (!e.behind && e.kind !== 'goal' && e.kind !== 'checkpoint' && !e.isEnemy) this.drawEntity(ctx, e, time, L);
    for (const e of game.entities) if (e.isEnemy && (e.awake || game.demo) && inView(e.x, e.w)) this.drawEntity(ctx, e, time, L);

    const p = game.player;
    if (p && p.visible) {
      const blink = p.inv > 0 && Math.floor(p.inv * 20) % 2 === 0;
      if (!blink) {
        if (p.powerFlash > 0 && Math.floor(p.powerFlash * 15) % 2 === 0) ctx.globalAlpha = 0.6;
        S.drawRin(ctx, p, time);
        ctx.globalAlpha = 1;
      }
    }
    for (const q of game.particles) S.drawParticle(ctx, q);
    this.drawForegrounds(L, camX);
    world();

    if (this.debug) this.drawDebug(ctx, game);

    // ダメージを受けたときの赤いフラッシュ（画面のふちが赤くなる）
    if (game.flashT > 0) {
      ctx.setTransform(K, 0, 0, K, this.offX, this.offY);
      const a = Math.min(1, game.flashT / 0.3);
      const g = ctx.createRadialGradient(this.viewW / 2, VIEW_H / 2, VIEW_H * 0.35, this.viewW / 2, VIEW_H / 2, this.viewW * 0.7);
      g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(1, `rgba(255,40,60,${0.55 * a})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, this.viewW, VIEW_H);
    }

    ctx.restore();

    if (!game.demo) {
      ctx.setTransform(K, 0, 0, K, this.offX, this.offY);
      this.drawHUD(ctx, game, app);
    }
  }

  // 風見鶏は風の向きを向く
  updateWeathercocks(game) {
    for (const d of game.decos) {
      if (d.type !== 'weathercock') continue;
      for (const z of game.zones) {
        if (z.kind !== 'wind') continue;
        if (d.x + 8 < z.x - 64 || d.x > z.x + z.w + 64) continue;
        if (zoneActive(z, game.time)) d.dir = windDir(z, game.time) > 0 ? 1 : -1;
      }
    }
  }

  drawEntity(ctx, e, time, L) {
    const P = THEMES[L.themeAtPx(e.x)];
    switch (e.kind) {
      case 'slime': return S.drawSlime(ctx, e, P, time);
      case 'spiky': return S.drawSpiky(ctx, e, P, time);
      case 'bird': return S.drawBird(ctx, e, P, time);
      case 'frog': return S.drawFrog(ctx, e, P, time);
      case 'crab': return S.drawCrab(ctx, e, P, time);
      case 'rock': return S.drawRock(ctx, e, P, time);
      case 'boss': return S.drawBoss(ctx, e, P, time);
      case 'boar': return S.drawBoar(ctx, e, P, time);
      case 'wave': return S.drawWave(ctx, e, time);
      case 'penguin': return S.drawPenguin(ctx, e, P, time);
      case 'jelly': return S.drawJelly(ctx, e, P, time);
      case 'lantern': return S.drawLantern(ctx, e, P, time);
      case 'tako': return S.drawTako(ctx, e, P, time);
      case 'boots': return S.drawBoots(ctx, e.cx, e.y + 7, e.t);
      case 'popcoin': return S.drawCoin(ctx, e.cx, e.y + 7, e.t * 3);
      case 'apple': return S.drawApple(ctx, e.cx, e.y + 7, e.t);
      case 'heart': return S.drawHeart(ctx, e.cx, e.y + 7, e.t, 1, P.heart);
      case 'star': return S.drawStar(ctx, e.cx, e.y + 7, e.t);
      case 'medal': {
        // 前に取ったことがあるメダルは半透明
        const saved = this.app && this.app.save.medals[this.app.game.def.id];
        if (saved && saved.includes(e.id)) ctx.globalAlpha = 0.45;
        S.drawMedal(ctx, e.cx, e.y + 10 + Math.sin(e.t * 3) * 1.5, e.t);
        ctx.globalAlpha = 1;
        return;
      }
    }
  }

  drawDebug(ctx, game) {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#0f0';
    const p = game.player;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = '#f00';
    for (const e of game.entities) if (e.isEnemy) ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = '#ff0';
    for (const z of game.zones) ctx.strokeRect(z.x, z.y, z.w, z.h);
  }

  // ===================== HUD =====================
  drawHUD(ctx, game, app) {
    const s = app.session;
    const L = Math.max(6, this.safe.l + 4), Tp = Math.max(5, this.safe.t + 3);
    ctx.font = `bold 10px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const text = (str, x, y, color = '#fff') => {
      ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(20,20,40,0.85)'; ctx.lineJoin = 'round';
      ctx.strokeText(str, x, y);
      ctx.fillStyle = color; ctx.fillText(str, x, y);
    };
    // 白い丸いふだ（地図の画面と同じ見た目）
    const pill = (x, yy, w, h = 16) => {
      ctx.fillStyle = 'rgba(28,48,84,0.22)'; S.rr(ctx, x, yy - h / 2 + 1.3, w, h, h / 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.94)'; S.rr(ctx, x, yy - h / 2, w, h, h / 2); ctx.fill();
    };
    const ink = (str, x, yy, color = '#3a3452') => { ctx.fillStyle = color; ctx.fillText(str, x, yy); };
    ctx.font = `bold 9.5px ${FONT}`;
    // 残り人数
    const y = Tp + 8;
    pill(L, y, 38);
    if (Art.has('rin/icon')) Art.draw(ctx, 'rin/icon', L + 8.5, y);
    else {
    ctx.fillStyle = '#ffd9b5';
    ctx.beginPath(); ctx.arc(L + 8.5, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2a14';
    ctx.beginPath(); ctx.ellipse(L + 8.5, y - 1.5, 5.4, 3.8, 0, Math.PI, Math.PI * 2); ctx.fill();
    }
    ink('×' + s.lives, L + 16, y + 0.5);
    // コイン（ふえたときに少しはねる）
    if (this.lastCoins !== s.coins) { if (this.lastCoins !== undefined && s.coins > this.lastCoins) this.coinPulse = 1; this.lastCoins = s.coins; }
    const cp = (this.coinPulse || 0);
    this.coinPulse = Math.max(0, cp - 0.08);
    const cx0 = L + 42;
    pill(cx0, y, 42);
    ctx.save(); ctx.translate(cx0 + 8.5, y); ctx.scale(0.9 + cp * 0.35, 0.9 + cp * 0.35);
    S.drawCoin(ctx, 0, 0, 0);
    ctx.restore();
    ink('×' + String(s.coins).padStart(2, '0'), cx0 + 16, y + 0.5 - cp * 1.5);
    // スコア
    const sx0 = cx0 + 46;
    pill(sx0, y, 50);
    ink(String(s.score).padStart(7, '0'), sx0 + 7, y + 0.5, '#5a5470');
    // ジャンプぐつ（のこり時間のゲージ）
    const pb = game.player && game.player.boots;
    if (pb > 0) {
      const gx = L + 5, gy = y + 16;
      ctx.save(); ctx.translate(gx, gy); ctx.scale(0.62, 0.62);
      if (pb < 3 && Math.floor(game.time * 8) % 2) ctx.globalAlpha = 0.4;
      S.drawBoots(ctx, 0, 0, 0);
      ctx.restore();
      ctx.fillStyle = 'rgba(20,20,40,0.6)'; ctx.fillRect(gx + 8, gy - 2, 34, 4);
      ctx.fillStyle = '#9ad7ff'; ctx.fillRect(gx + 8.5, gy - 1.5, 33 * Math.min(1, pb / 20), 3);
    }
    // メダル
    const mc = game.def.medalCount;
    const saved = app.save.medals[game.def.id] || [];
    const mx = this.viewW / 2 - (mc - 1) * 9;
    if (mc) pill(mx - 10, y, (mc - 1) * 18 + 20);
    for (let i = 0; i < mc; i++) {
      const now = game.runMedals.has(i), before = saved.includes(i);
      ctx.save();
      ctx.translate(mx + i * 18, y);
      ctx.scale(0.6, 0.6);
      if (!now && before) ctx.globalAlpha = 0.45;
      S.drawMedal(ctx, 0, 0, now ? game.time : 0, now || before);
      ctx.restore();
    }
    // ボスの体力
    const b = game.boss;
    if (b && b.state !== 'sleep' && !b.dead) {
      const bx = this.viewW / 2;
      text('キングスライム', bx - 42, y + 16, '#ffd6ff');
      for (let i = 0; i < b.maxHp; i++) S.drawHeart(ctx, bx + 36 + i * 11, y + 16, 0, i < b.hp ? 0.7 : 0.35);
    }
    // ステージ名（ふりがなつき）
    // お知らせ（おたすけ・ボス登場など）
    const m = game.message;
    if (m && !(game.banner > 0.3)) {
      const a = Math.min(1, m.t / 0.4, (m.max - m.t) / 0.2);
      ctx.globalAlpha = Math.max(0, a);
      ctx.textAlign = 'center';
      ctx.font = `bold 10px ${FONT}`;
      const tw = ctx.measureText(m.text).width + 28;
      ctx.fillStyle = 'rgba(20,24,48,0.6)';
      S.rr(ctx, this.viewW / 2 - tw / 2, 44, tw, 20, 10); ctx.fill();
      text(m.text, this.viewW / 2, 54.5, m.color);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
    if (game.banner > 0) {
      const a = Math.min(1, game.banner / 0.5);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      const cx = this.viewW / 2, cy = 86;
      const name = game.def.name;
      ctx.font = `bold 16px ${FONT}`;
      const tw = Math.max(170, ctx.measureText(name).width + 44);
      ctx.fillStyle = 'rgba(28,48,84,0.28)';
      S.rr(ctx, cx - tw / 2, cy - 24 + 2.5, tw, 50, 14); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      S.rr(ctx, cx - tw / 2, cy - 24, tw, 50, 14); ctx.fill();
      // 「ステージ 1」の札
      ctx.font = `bold 8px ${FONT}`;
      const lw = ctx.measureText('ステージ ' + game.def.id).width + 16;
      ctx.fillStyle = '#2fb5ad';
      S.rr(ctx, cx - lw / 2, cy - 31, lw, 13, 6.5); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillText('ステージ ' + game.def.id, cx, cy - 24.2);
      ctx.font = `bold 16px ${FONT}`;
      ctx.fillStyle = '#35304a'; ctx.fillText(name, cx, cy + 1);
      if (game.def.kana) {
        ctx.font = `bold 7px ${FONT}`;
        ctx.fillStyle = '#8a84a0'; ctx.fillText(game.def.kana, cx, cy + 15);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }
}
