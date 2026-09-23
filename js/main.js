// りんの大冒険：全体のまとめ役（画面の切りかえ・ゲームループ）
import { Art } from './art.js';
import { STEP, START_LIVES } from './config.js';
import { LEVELS } from './levels.js';
import { Game } from './game.js';
import { Renderer } from './render.js';
import { Input, preventBrowserGestures, onTap } from './input.js';
import { Sound } from './audio.js';
import { loadSave, writeSave } from './storage.js';

const $ = id => document.getElementById(id);
const SCREENS = ['title', 'help', 'select', 'pause', 'clear', 'over', 'ending'];
// 神戸の地図の上のステージの位置（左が西・上が山側）と、地図にのせる短い名前
const MAP_NODES = [
  { x: 655, y: 262, label: '八雲通', color: '#f4a261' },
  { x: 728, y: 200, label: '王子動物園', color: '#8ac926', lx: 30, ly: 6, la: 'start' },
  { x: 610, y: 178, label: '布引の滝', color: '#4cc9f0' },
  { x: 560, y: 108, label: 'ロープウェイ', color: '#ff70a6' },
  { x: 510, y: 205, label: '北野', color: '#e76f51' },
  { x: 565, y: 272, label: '三宮・南京町', color: '#e63946' },
  { x: 470, y: 322, label: 'メリケンパーク', color: '#3a86ff' },
  { x: 268, y: 296, label: '須磨海岸', color: '#ffb703' },
  { x: 112, y: 262, label: '明石海峡大橋', color: '#2ec4b6' },
  { x: 790, y: 88, label: '摩耶山', color: '#9b5de5' }
];

class App {
  constructor() {
    this.params = new URLSearchParams(location.search);
    this.debug = this.params.has('debug');
    preventBrowserGestures();
    this.renderer = new Renderer($('game'));
    this.renderer.debug = this.debug;
    this.input = new Input();
    this.sound = new Sound();
    this.save = loadSave();
    this.sound.setMuted(!!this.save.muted);
    this.session = this.newSession();
    this.game = new Game(this);
    this.isTouch = matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    this.mode = 'title';
    this.acc = 0;
    this.last = performance.now();

    this.setupUI();
    // 絵の準備ができたら画面を表示する（遅いときも3秒で表示）
    const cv = $('game');
    cv.classList.add('art-loading');
    const show = () => cv.classList.remove('art-loading');
    Promise.all([Art.init(this.renderer.K), Art.prepareBg(['yakumo'], this.renderer.K)]).then(show, show);
    setTimeout(show, 3000);
    this.goTitle();

    const onResize = () => { this.renderer.resize(); this.checkOrientation(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 250));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (this.mode === 'play') this.pause(true); this.sound.suspend(); }
      else if (this.mode !== 'pause') this.sound.resume();
    });
    // iPhone は画面にさわったときに音を出せるようになる
    const unlock = () => { this.sound.unlock(); if (this.mode === 'pause') this.sound.suspend(); };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);

    this.input.onPause = () => { if (this.mode === 'play') this.pause(); else if (this.mode === 'pause') this.resume(); };

    requestAnimationFrame(t => this.frame(t));

    // 開発用：?stage=2 でステージ2から始まる
    const st = parseInt(this.params.get('stage'), 10);
    if (st >= 1 && st <= LEVELS.length) this.startStage(st - 1, true);

    window.__rin = this;
  }

  newSession() { return { lives: START_LIVES, coins: 0, score: 0, powered: false }; }

  // ===================== 画面 =====================
  setupUI() {
    this.input.bindTouch({
      dpadZone: $('dpadZone'), dpad: $('dpad'), btnL: $('btnL'), btnR: $('btnR'),
      jumpZone: $('jumpZone'), jumpBtn: $('jumpBtn')
    });
    const tap = (id, fn) => onTap($(id), () => { this.sound.unlock(); fn(); });

    tap('btnStart', () => { this.sound.play('select'); this.goSelect(); });
    tap('btnGo', () => { if (this.selIdx !== undefined && this.selIdx + 1 <= this.save.unlocked) { this.sound.play('select'); this.startStage(this.selIdx, true); } });
    tap('btnHelp', () => { this.sound.play('select'); this.showScreen('help'); this.mode = 'help'; });
    tap('btnHelpBack', () => { this.sound.play('select'); this.showScreen('title'); this.mode = 'title'; });
    tap('btnSelBack', () => { this.sound.play('select'); this.goTitle(); });
    tap('pauseBtn', () => this.pause());
    tap('btnResume', () => this.resume());
    tap('btnRetry', () => { this.sound.resume(); this.startStage(this.game.stageIdx, false, true); });
    tap('btnPauseSel', () => { this.sound.resume(); this.goSelect(); });
    tap('btnNext', () => {
      const next = this.game.stageIdx + 1;
      if (next < LEVELS.length) this.startStage(next, false); else this.goSelect();
    });
    tap('btnClearSel', () => this.goSelect());
    tap('btnOverRetry', () => this.startStage(this.game.stageIdx, true));
    tap('btnOverSel', () => this.goSelect());
    tap('btnEndTitle', () => this.goTitle());
    for (const id of ['btnSound1', 'btnSound2']) {
      tap(id, () => {
        this.save.muted = !this.save.muted;
        this.sound.setMuted(this.save.muted);
        writeSave(this.save);
        this.updateSoundLabels();
        this.sound.play('select');
      });
    }
    this.updateSoundLabels();

    // iPhone の Safari で開いているときは「ホーム画面に追加」をおすすめ
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
    if (isIOS && !standalone) $('installHint').classList.remove('hidden');
  }

  updateSoundLabels() {
    for (const el of document.querySelectorAll('.sound-btn')) el.textContent = this.save.muted ? '音：オフ' : '音：オン';
  }

  showScreen(name) {
    for (const s of SCREENS) $('scr-' + s).classList.toggle('hidden', s !== name);
    const playing = name === null;
    $('controls').classList.toggle('hidden', !(playing && this.isTouch));
    $('pauseBtn').classList.toggle('hidden', !playing);
  }

  goTitle() {
    this.mode = 'title';
    this.startDemo();
    this.showScreen('title');
    this.sound.playBgm('sky');
  }

  goSelect() {
    this.mode = 'select';
    this.startDemo();
    this.renderSelect();
    this.showScreen('select');
    this.sound.playBgm('sky');
  }

  startDemo() {
    if (!this.game.demo) this.game.start(0, { demo: true });
  }

  // 神戸の地図のステージ選択
  renderSelect() {
    const unlocked = this.save.unlocked;
    let total = 0, max = 0;
    for (const def of LEVELS) { total += (this.save.medals[def.id] || []).length; max += def.medalCount; }
    $('medalTotal').textContent = `メダル ${total} / ${max}`;
    const route = MAP_NODES.map(n => `${n.x},${n.y}`).join(' ');
    const nodes = MAP_NODES.map((n, i) => {
      const def = LEVELS[i];
      const locked = i + 1 > unlocked;
      const got = (this.save.medals[def.id] || []).length;
      const cleared = !!this.save.cleared[def.id];
      return `<g class="map-node" data-i="${i}">
        <circle cx="${n.x}" cy="${n.y + 10}" r="38" fill="transparent"/>
        <circle class="ring" cx="${n.x}" cy="${n.y}" r="22" fill="${locked ? '#9aa3ad' : n.color}" stroke="#fff" stroke-width="4"/>
        <text x="${n.x}" y="${n.y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">${locked ? '？' : i + 1}</text>
        <text x="${n.x + (n.lx || 0)}" y="${n.y + (n.ly ?? 44)}" text-anchor="${n.la || 'middle'}" font-size="16" font-weight="800" fill="#1d3557" stroke="#fff" stroke-width="5" paint-order="stroke">${locked ? '？？？' : n.label}</text>
        ${cleared ? `<text x="${n.x + 24}" y="${n.y - 14}" text-anchor="middle" font-size="15" font-weight="900" fill="#ffb703" stroke="#fff" stroke-width="3" paint-order="stroke">★${got}</text>` : ''}
      </g>`;
    }).join('');
    $('kobeMap').innerHTML = `
      <svg viewBox="50 0 880 440" preserveAspectRatio="xMidYMid meet" aria-label="神戸の地図">
        <defs>
          <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0f5"/><stop offset="1" stop-color="#3a9ad9"/></linearGradient>
          <linearGradient id="landG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc47a"/><stop offset="1" stop-color="#cfe8b0"/></linearGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="440" fill="url(#seaG)"/>
        <path d="M0,0 L1000,0 L1000,288 C930,292 860,294 790,298 C720,302 660,300 610,304 C560,308 520,330 480,336 C450,340 430,326 400,318 C360,308 320,300 280,292 C230,284 190,278 150,270 C110,262 60,256 0,252 Z" fill="url(#landG)"/>
        <path d="M130,236 C200,150 260,170 320,120 C380,80 430,110 480,70 C540,30 600,70 660,40 C720,20 790,30 850,20 C900,15 950,30 1000,20 L1000,150 C920,165 850,160 790,170 C700,180 640,160 580,175 C500,190 440,170 380,190 C300,210 220,230 130,236 Z" fill="#4f9a5a" opacity="0.85"/>
        <text x="880" y="60" font-size="15" font-weight="800" fill="#e9f5db" text-anchor="middle">六甲山</text>
        <path d="M565,338 L640,338 L646,388 L570,392 Z" fill="#cfe8b0" stroke="#9fc98a" stroke-width="2"/>
        <text x="606" y="370" font-size="12" font-weight="700" fill="#4a6b3a" text-anchor="middle">ポートアイランド</text>
        <path d="M0,330 C40,322 90,330 140,352 C170,368 160,400 150,440 L0,440 Z" fill="#a9d18e"/>
        <text x="100" y="405" font-size="15" font-weight="800" fill="#4a6b3a" text-anchor="middle">淡路島</text>
        <line x1="108" y1="266" x2="72" y2="340" stroke="#ffffff" stroke-width="5"/>
        <rect x="95" y="278" width="5" height="16" fill="#fff"/><rect x="80" y="312" width="5" height="16" fill="#fff"/>
        <text x="300" y="390" font-size="18" font-weight="800" fill="#e6f6ff" text-anchor="middle">大阪湾</text>
        <polyline points="${route}" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="10 9" stroke-linecap="round" opacity="0.9"/>
        ${nodes}
      </svg>`;
    for (const g of $('kobeMap').querySelectorAll('.map-node')) {
      onTap(g, () => { this.sound.unlock(); this.sound.play('select'); this.selectNode(parseInt(g.dataset.i, 10)); });
    }
    this.selectNode(Math.min(unlocked, LEVELS.length) - 1);
  }

  selectNode(i) {
    this.selIdx = i;
    const def = LEVELS[i];
    // 選んだ場所の背景を先に用意しておく
    Art.prepareBg([...new Set(['yakumo', ...def.themes.map(z => z.theme)])], this.renderer.K);
    const locked = i + 1 > this.save.unlocked;
    for (const g of $('kobeMap').querySelectorAll('.map-node')) g.classList.toggle('sel', parseInt(g.dataset.i, 10) === i);
    $('stageInfo').classList.remove('hidden');
    $('siNo').textContent = `ステージ ${def.id}`;
    $('siName').textContent = locked ? '？？？' : def.name;
    $('siName').classList.toggle('long', !locked && def.name.length > 9);
    $('siKana').textContent = locked ? 'まだ行けないよ' : def.kana;
    const got = this.save.medals[def.id] || [];
    $('siMedals').innerHTML = Array.from({ length: def.medalCount }, (_, m) => `<span class="medal${got.includes(m) ? ' got' : ''}"></span>`).join('');
    $('btnGo').classList.toggle('hidden', locked);
  }

  // ===================== ゲームの進行 =====================
  // fresh: 残り人数などをリセットして始める / retry: ポーズから「さいしょから」
  startStage(idx, fresh, retry = false) {
    if (fresh) this.session = this.newSession();
    if (retry) this.session.powered = false;
    this.input.clear();
    this.game.start(idx);
    this.mode = 'play';
    this.acc = 0;
    this.showScreen(null);
    this.checkOrientation();
  }

  pause(silent = false) {
    if (this.mode !== 'play') return;
    this.mode = 'pause';
    this.input.clear();
    this.showScreen('pause');
    if (!silent) this.sound.play('pause');
    setTimeout(() => { if (this.mode === 'pause') this.sound.suspend(); }, 300);
  }

  resume() {
    if (this.mode !== 'pause') return;
    this.sound.resume();
    this.input.clear();
    this.mode = 'play';
    this.acc = 0;
    this.last = performance.now();
    this.showScreen(null);
  }

  checkOrientation() {
    const portrait = this.isTouch && window.innerHeight > window.innerWidth;
    if (portrait && this.mode === 'play') this.pause(true);
  }

  // ミスしたとき（game.js から呼ばれる）
  onPlayerDied() {
    this.session.lives--;
    if (this.session.lives > 0) {
      this.game.start(this.game.stageIdx, { respawn: true });
    } else {
      this.mode = 'over';
      this.showScreen('over');
      this.sound.playJingle('gameover');
    }
  }

  recordClear() {
    const g = this.game, def = g.def;
    const all = new Set(this.save.medals[def.id] || []);
    for (const m of g.runMedals) all.add(m);
    this.save.medals[def.id] = [...all].sort();
    this.save.cleared[def.id] = true;
    this.save.best[def.id] = Math.max(this.save.best[def.id] || 0, this.session.score);
    this.save.unlocked = Math.max(this.save.unlocked, Math.min(LEVELS.length, g.stageIdx + 2));
    writeSave(this.save);
  }

  medalHtml(def, set) {
    return Array.from({ length: def.medalCount }, (_, m) => `<span class="medal${set.has(m) ? ' got' : ''}"></span>`).join('');
  }

  // ゴールしたとき
  onStageClear() {
    this.recordClear();
    const g = this.game, def = g.def, s = this.session;
    $('clearStats').innerHTML = `
      <span>メダル <span class="medals">${this.medalHtml(def, g.runMedals)}</span></span>
      <span>コイン ${s.coins}</span>
      <span>スコア ${String(s.score).padStart(7, '0')}</span>`;
    $('btnNext').classList.toggle('hidden', g.stageIdx + 1 >= LEVELS.length);
    this.mode = 'clear';
    this.showScreen('clear');
  }

  // ボスをたおしたとき
  onGameComplete() {
    this.recordClear();
    let total = 0, max = 0;
    for (const def of LEVELS) { total += (this.save.medals[def.id] || []).length; max += def.medalCount; }
    $('endStats').innerHTML = `
      <span>スコア ${String(this.session.score).padStart(7, '0')}</span>
      <span>ひみつのメダル ${total} / ${max}</span>
      ${total === max ? '<span style="color:#ffe66d">メダルを全部集めた！ すごい！</span>' : ''}`;
    this.mode = 'ending';
    this.showScreen('ending');
  }

  // ===================== ゲームループ =====================
  frame(now) {
    requestAnimationFrame(t => this.frame(t));
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) dt = 0;
    if (dt > 0.1) dt = 0.1;
    const running = this.mode === 'play' || this.mode === 'title' || this.mode === 'select' || this.mode === 'help';
    if (running) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < 5) {
        this.game.update(STEP, this.input);
        this.input.endStep();
        this.acc -= STEP;
        n++;
      }
      if (n >= 5) this.acc = 0;
    }
    this.renderer.draw(this.game, this);
  }
}

// オフラインでも遊べるようにする（GitHub Pages などの https で動く）
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}

new App();
