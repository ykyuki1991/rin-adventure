// ステージ（マップ）のデータを扱うクラスと、ステージを組み立てるための道具
import { TILE, ROWS, T } from './config.js';

export class Level {
  constructor(def) {
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.bgm = def.bgm;
    this.w = def.w;
    this.h = ROWS;
    this.tiles = new Uint8Array(def.tiles);
    this.contents = new Map(def.contents);
    this.mats = new Map(def.mats);
    this.coinCounts = new Map();
    this.pxW = this.w * TILE;
    this.pxH = this.h * TILE;
    this.themes = def.themes; // [{ from: マス, theme }]
    // 列ごとのテーマ
    this.colTheme = new Array(this.w);
    for (let x = 0; x < this.w; x++) this.colTheme[x] = this.themeAtTile(x);
  }
  themeAtTile(tx) {
    let th = this.themes[0].theme;
    for (const z of this.themes) if (tx >= z.from) th = z.theme;
    return th;
  }
  themeAtPx(px) { return this.themeAtTile(Math.floor(px / TILE)); }
  get(tx, ty) {
    if (tx < 0 || tx >= this.w) return T.HARD; // ステージの左右の端は壁
    if (ty < 0 || ty >= this.h) return T.EMPTY;
    return this.tiles[ty * this.w + tx];
  }
  set(tx, ty, v) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return;
    this.tiles[ty * this.w + tx] = v;
  }
  key(tx, ty) { return ty * this.w + tx; }
  mat(tx, ty) { return this.mats.get(ty * this.w + tx); }
}

// ステージを作るためのビルダー
// x = 左から何マス目か、y = 上から何マス目か（0〜14、地面の表面はふつう13）
export class LevelBuilder {
  constructor({ id, name, kana, theme, bgm, w, goalLabel, night }) {
    this.id = id; this.name = name; this.kana = kana; this.bgm = bgm; this.w = w;
    this.goalLabel = goalLabel || '';
    this.night = !!night;
    this.themes = [{ from: 0, theme }];
    this.tiles = new Uint8Array(w * ROWS);
    this.contents = new Map();
    this.mats = new Map();
    this.spawns = [];
    this.decos = [];
    this.zones = [];
    this.checkpoints = [];
    this.medalCount = 0;
    this.medalHints = [];
    this.startPos = { x: 2, y: 12 };
    this.goalPos = null;
    this.curMat = null;
  }
  // x マス目から先のテーマ（背景・地面の見た目）を変える
  theme(from, theme) { this.themes.push({ from, theme }); return this; }

  set(x, y, t) {
    if (x < 0 || x >= this.w || y < 0 || y >= ROWS) return;
    this.tiles[y * this.w + x] = t;
    const k = y * this.w + x;
    if (this.curMat) this.mats.set(k, this.curMat); else this.mats.delete(k);
  }
  setContent(x, y, c) { this.contents.set(y * this.w + x, c); }
  tileAt(x, y) { return x < 0 || x >= this.w || y < 0 || y >= ROWS ? -1 : this.tiles[y * this.w + x]; }

  // 見た目（素材）を指定してから置く。例：b.mat('brick', () => b.rect(...))
  mat(name, fn) { const prev = this.curMat; this.curMat = name; fn(); this.curMat = prev; return this; }

  // 1文字 = 1マス
  // G 地面 / X かたいブロック / B レンガ / K コインがたくさん出るレンガ
  // ? コイン / P パワーアップ / S スター / L 1UP（？ブロック） / H かくし1UP / h かくしコイン / U 使用済み
  // = すり抜け足場 / - 見えないすり抜け足場 / # 見えないかべ / ^ トゲ / ~ マグマ / w 水
  // / 右上がりの坂 / \ 左上がりの坂 / 1 2 右上がりのゆるい坂（下・上） / 3 4 左上がりのゆるい坂（上・下）
  // Z ニセブロック / z ニセ地面 / o コイン / M ひみつのメダル / _ 空白にする / . 何もしない
  put(x, y, ch) {
    switch (ch) {
      case '.': case ' ': return;
      case '_': this.set(x, y, T.EMPTY); return;
      case 'G': this.set(x, y, T.GROUND); return;
      case 'X': this.set(x, y, T.HARD); return;
      case 'B': this.set(x, y, T.BRICK); return;
      case 'K': this.set(x, y, T.BRICK); this.setContent(x, y, 'coins'); return;
      case '?': this.set(x, y, T.QBLOCK); this.setContent(x, y, 'coin'); return;
      case 'P': this.set(x, y, T.QBLOCK); this.setContent(x, y, 'power'); return;
      case 'S': this.set(x, y, T.QBLOCK); this.setContent(x, y, 'star'); return;
      case 'J': this.set(x, y, T.QBLOCK); this.setContent(x, y, 'boots'); return;
      case 'L': this.set(x, y, T.QBLOCK); this.setContent(x, y, 'heart'); return;
      case 'H': this.set(x, y, T.HIDDEN); this.setContent(x, y, 'heart'); return;
      case 'h': this.set(x, y, T.HIDDEN); this.setContent(x, y, 'coin'); return;
      case 'U': this.set(x, y, T.USED); return;
      case '=': this.set(x, y, T.SEMI); return;
      case '-': this.set(x, y, T.ISEMI); return;
      case '#': this.set(x, y, T.ISOLID); return;
      case '^': this.set(x, y, T.SPIKE); return;
      case '~': this.set(x, y, T.LAVA); return;
      case 'w': this.set(x, y, T.WATER); return;
      case '/': this.set(x, y, T.SLOPE_R); return;
      case '\\': this.set(x, y, T.SLOPE_L); return;
      case '1': this.set(x, y, T.SLOPE_R1); return;
      case '2': this.set(x, y, T.SLOPE_R2); return;
      case '3': this.set(x, y, T.SLOPE_L2); return;
      case '4': this.set(x, y, T.SLOPE_L1); return;
      case 'Z': this.set(x, y, T.FAKE); return;
      case 'z': this.set(x, y, T.FAKEG); return;
      case 'o': this.set(x, y, T.COIN); return;
      case 'M': this.spawns.push({ type: 'medal', x, y, id: this.medalCount++ }); return;
      default: throw new Error('unknown tile char: ' + ch);
    }
  }
  // 横一列に並べる
  row(x, y, str) { [...str].forEach((ch, i) => this.put(x + i, y, ch)); return this; }
  // 四角く埋める
  rect(x0, y0, x1, y1, ch) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.put(x, y, ch);
    return this;
  }
  // 地面（x0〜x1、表面の高さ top）
  ground(x0, x1, top = 13) { return this.rect(x0, top, x1, ROWS - 1, 'G'); }
  // 水（海・川・池）
  water(x0, x1, top = 13) { return this.rect(x0, top, x1, ROWS - 1, 'w'); }
  lava(x0, x1, top = 13) { return this.rect(x0, top, x1, ROWS - 1, '~'); }
  // 上り坂：x から、地面の高さ base から n マス上がる（gentle=true でゆるい坂。幅は2倍）
  // 終わったあとの地面の高さは base - n
  rampUp(x, base, n, gentle = false) {
    for (let i = 0; i < n; i++) {
      const row = base - 1 - i;
      if (gentle) {
        this.put(x + 2 * i, row, '1'); this.put(x + 2 * i + 1, row, '2');
        this.rect(x + 2 * i, row + 1, x + 2 * i + 1, ROWS - 1, 'G');
      } else {
        this.put(x + i, row, '/');
        this.rect(x + i, row + 1, x + i, ROWS - 1, 'G');
      }
    }
    return this;
  }
  // 下り坂：x から、地面の高さ top から n マス下がる（終わったあとの高さは top + n）
  rampDown(x, top, n, gentle = false) {
    for (let i = 0; i < n; i++) {
      const row = top + i;
      if (gentle) {
        this.put(x + 2 * i, row, '3'); this.put(x + 2 * i + 1, row, '4');
        this.rect(x + 2 * i, row + 1, x + 2 * i + 1, ROWS - 1, 'G');
      } else {
        this.put(x + i, row, '\\');
        this.rect(x + i, row + 1, x + i, ROWS - 1, 'G');
      }
    }
    return this;
  }
  // 土管（幅2マス、高さh）
  pipe(x, h, base = 13) {
    for (let y = base - h; y < base; y++) { this.set(x, y, T.PIPE); this.set(x + 1, y, T.PIPE); }
    return this;
  }
  // 階段（dir=1 で右上がり、-1 で右下がり）
  stairs(x, n, dir = 1, base = 13) {
    for (let i = 0; i < n; i++) {
      const hgt = dir > 0 ? i + 1 : n - i;
      for (let k = 0; k < hgt; k++) this.set(x + i, base - 1 - k, T.HARD);
    }
    return this;
  }
  // 三角屋根（x0〜x1 の上に、row から上へ）。坂なので屋根の上を歩ける
  gable(x0, x1, row, mat) {
    return this.mat(mat, () => {
      for (let k = 0; ; k++) {
        const l = x0 + k, r = x1 - k, y = row - k;
        if (l > r) break;
        if (l === r) { this.put(l, y, 'X'); break; }
        this.put(l, y, '/'); this.put(r, y, '\\');
        for (let x = l + 1; x < r; x++) this.put(x, y, 'X');
        if (r === l + 1) break;
      }
    });
  }
  // 建物のかべ（窓つき）
  walls(x0, x1, y0, y1, mat, winMat, step = 2) {
    this.mat(mat, () => this.rect(x0, y0, x1, y1, 'X'));
    if (winMat) this.mat(winMat, () => {
      for (let y = y0; y <= y1; y++) for (let x = x0 + 1; x < x1; x += step) this.put(x, y, 'X');
    });
    return this;
  }
  // 空中の道（ケーブル・橋のアーチなど）。row は歩く面の高さ
  // segs: [['flat', n], ['up', n], ['up2', n], ['down', n], ['down2', n]]（2 がつくとゆるい坂）
  path(x, row, segs, mat) {
    let cx = x, s = row;
    this.mat(mat, () => {
      for (const [kind, n] of segs) {
        for (let i = 0; i < n; i++) {
          if (kind === 'flat') { this.put(cx++, s, '='); }
          else if (kind === 'up') { this.put(cx++, s - 1, '/'); s--; }
          else if (kind === 'up2') { this.put(cx++, s - 1, '1'); this.put(cx++, s - 1, '2'); s--; }
          else if (kind === 'down') { this.put(cx++, s, '\\'); s++; }
          else if (kind === 'down2') { this.put(cx++, s, '3'); this.put(cx++, s, '4'); s++; }
        }
      }
    });
    return { x: cx, row: s };
  }
  // ビーチパラソル（上に乗れる。x〜x+1 の2マス）
  parasol(x, y, color = 0, base = 13) {
    this.row(x, y, '--');
    return this.deco('parasol', x, y, { base, color });
  }
  // 敵・しかけ
  enemy(type, x, y = 12, opts = {}) { this.spawns.push({ type, x, y, ...opts }); return this; }
  // 動く足場
  // move: 'h'(左右) 'v'(上下) 'line'(ななめ: dx,dy) 'circle'(観覧車) 'rail'(電車) 'loop'(ロープウェイ)
  //       'bob'(波にゆれる) 'arc'(シャチのジャンプ) 'fall'(乗ると落ちる)
  // look: 見た目（'lift' 'train' 'gondola' 'wheel' 'giraffe' 'ship' 'ring' 'orca' 'lotus' 'log' 'cablecar' 'portliner' 'crate'）
  platform(x, y, opts = {}) {
    this.spawns.push({ type: 'platform', x, y, move: 'h', range: 3, speed: 1, width: 3, phase: 0, look: 'lift', ...opts });
    return this;
  }
  // 観覧車（中心 cx,cy・半径 r マス・ゴンドラ n こ）
  wheel(cx, cy, r, n = 6, speed = 0.35, opts = {}) {
    this.decos.push({ type: 'wheel', x: cx, y: cy, r, base: opts.base ?? 13, lit: !!opts.lit, layer: 'back' });
    for (let i = 0; i < n; i++) {
      this.spawns.push({ type: 'platform', move: 'circle', cx, cy, r, speed, phase: i / n, width: 2, x: cx, y: cy, look: 'wheel', color: i });
    }
    return this;
  }
  // ロープウェイ（(x1,y1) から (x2,y2) へ、ゴンドラが n こ）。y はゴンドラの床の高さ（マス）
  ropeway(x1, y1, x2, y2, n = 3, speed = 45) {
    this.decos.push({ type: 'cable', x: x1, y: y1, x2, y2, layer: 'back' });
    for (let i = 0; i < n; i++) {
      this.spawns.push({ type: 'platform', move: 'loop', x: x1, y: y1, dx: x2 - x1, dy: y2 - y1, speed, phase: i / n, width: 2, look: 'gondola' });
    }
    return this;
  }
  // 電車（x から range マスのあいだを行ったり来たり。y は床の高さ）
  train(x, y, range, opts = {}) {
    this.spawns.push({ type: 'platform', move: 'rail', x, y, range, speed: opts.speed ?? 70, dwell: opts.dwell ?? 1.6, width: opts.width ?? 5, look: opts.look ?? 'train', phase: opts.phase ?? 0 });
    return this;
  }
  // 力のエリア（滝・風・シャワー）
  zone(kind, x, y, w, h, opts = {}) { this.zones.push({ kind, x, y, w, h, ...opts }); return this; }
  // 飾り（家・看板・建物など）。layer: 'back'（タイルの後ろ）/ 'mid'（タイルの前）
  deco(type, x, y, opts = {}) { this.decos.push({ type, x, y, layer: 'back', ...opts }); return this; }
  // 駅名や地名の看板
  sign(x, text, kana = '', base = 13, style = 'station') { return this.deco('sign', x, base, { text, kana, style }); }
  // はじめての人向けのヒント（ふきだし）。y はふきだしのしっぽの先のマス
  hint(x, y, text) { return this.deco('hint', x, y, { text, layer: 'mid' }); }
  // コインを山なりに並べる（x0 から x1 まで、いちばん高いところが h マス上）。かべの中には置かない
  coinArc(x0, x1, y, h) {
    for (let x = x0; x <= x1; x++) {
      const u = (x - x0) / Math.max(1, x1 - x0);
      const yy = Math.round(y - h * 4 * u * (1 - u));
      if (this.tileAt(x, yy) === T.EMPTY && !this.medalAt(x, yy)) this.put(x, yy, 'o');
    }
    return this;
  }
  // コインを線の上に並べる（(x0,y0) から (x1,y1) へ、step マスおき）
  coinLine(x0, y0, x1, y1, step = 3) {
    for (let x = x0; x <= x1; x += step) {
      const yy = Math.round(y0 + (y1 - y0) * (x - x0) / Math.max(1, x1 - x0));
      if (this.tileAt(x, yy) === T.EMPTY && !this.medalAt(x, yy)) this.put(x, yy, 'o');
    }
    return this;
  }
  // 足場（地面・ケーブルなど）のすぐ上にコインを並べる（上から探して最初に見つかった足場の上）
  coinsAbove(x0, x1, step = 2, fromRow = 0) {
    for (let x = x0; x <= x1; x += step) {
      for (let y = fromRow + 1; y < ROWS; y++) {
        if (this.tileAt(x, y) !== T.EMPTY) {
          if (this.tileAt(x, y - 1) === T.EMPTY && !this.medalAt(x, y - 1)) this.put(x, y - 1, 'o');
          break;
        }
      }
    }
    return this;
  }
  medalAt(x, y) { return this.spawns.some(s => s.type === 'medal' && s.x === x && s.y === y); }
  // hint: ステージ選択の画面に出すヒント（まだ取っていないメダルだけ）
  medal(x, y, hint = '') { this.medalHints.push(hint); this.put(x, y, 'M'); return this; }
  checkpoint(x, base = 13) {
    const idx = this.checkpoints.length;
    this.checkpoints.push({ x, y: base - 1 });
    this.spawns.push({ type: 'checkpoint', x, y: base - 1, idx });
    return this;
  }
  goal(x, base = 13) {
    this.goalPos = { x, base };
    this.spawns.push({ type: 'goal', x, y: base - 1, base, label: this.goalLabel });
    return this;
  }
  start(x, y = 12) { this.startPos = { x, y }; return this; }
  // ジャンプ台（x マス目、base は乗っている地面の高さ）
  spring(x, base = 13) { this.spawns.push({ type: 'spring', x, base }); return this; }
  // コインチャレンジ：リング（x, y）と、出てくる赤コインの場所 [[x, y], ...]（8まい）。limit 秒以内に全部取ると 1UP
  ring(x, y, coins, limit = 10) { this.spawns.push({ type: 'ring', x, y, coins, limit }); return this; }

  build() {
    return {
      id: this.id, name: this.name, kana: this.kana, bgm: this.bgm, w: this.w, night: this.night,
      themes: this.themes, goalLabel: this.goalLabel,
      tiles: this.tiles, contents: [...this.contents.entries()], mats: [...this.mats.entries()],
      spawns: this.spawns, decos: this.decos, zones: this.zones, checkpoints: this.checkpoints,
      start: this.startPos, goal: this.goalPos, medalCount: this.medalCount, medalHints: this.medalHints
    };
  }
}

export { TILE };
