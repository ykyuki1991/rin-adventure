// 効果音とBGM（ファイルを使わず、その場で音を作っています）
// BGM の曲と楽器は js/music.js
import { SONGS, JINGLES, compileSong, INST, MIX, drumHit, makeImpulse } from './music.js';

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(n) {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return 0;
  const midi = NOTE[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const COMPILED = {};
const compiled = (name, def, loop) => (COMPILED[name] ||= compileSong({ ...def, loop }));

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.song = null;
    this.songName = null;
    this.timer = null;
  }

  // 最初のタップのときに呼ぶ（iPhone は操作しないと音が出せないため）
  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.8;
        this.musicGain.connect(this.master);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 1;
        this.sfxGain.connect(this.master);
        this.makeWaves();
        this.makeFx();
        const buf = this.ctx.createBuffer(1, 1, 22050);
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.connect(this.ctx.destination); src.start(0);
        if (this.pendingSong) { const n = this.pendingSong; this.pendingSong = null; this.playBgm(n); }
      }
      if (this.ctx.state !== 'running') this.ctx.resume();
    } catch (_) { /* 音が出せなくてもゲームは続ける */ }
  }

  makeWaves() {
    const c = this.ctx;
    const pulse = duty => {
      const n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
      return c.createPeriodicWave(re, im);
    };
    this.waves = { pulse25: pulse(0.25), pulse12: pulse(0.125) };
    const len = c.sampleRate;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  // リバーブとディレイ（曲の音に ひろがりをつける）
  makeFx() {
    const c = this.ctx;
    try {
      this.reverb = c.createConvolver(); this.reverb.buffer = makeImpulse(c, 1.8);
      const rg = c.createGain(); rg.gain.value = 0.55; this.reverb.connect(rg); rg.connect(this.musicGain);
      this.delay = c.createDelay(1.5); this.delay.delayTime.value = 0.3;
      const fb = c.createGain(); fb.gain.value = 0.32; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
      this.delay.connect(lp); lp.connect(fb); fb.connect(this.delay);
      const dg = c.createGain(); dg.gain.value = 0.5; lp.connect(dg); dg.connect(this.musicGain); dg.connect(this.reverb);
    } catch (_) { this.reverb = null; this.delay = null; }
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.02);
  }

  suspend() { try { this.ctx && this.ctx.suspend(); } catch (_) {} }
  resume() { try { this.ctx && this.ctx.state !== 'running' && this.ctx.resume(); } catch (_) {} }

  // ---------- 音の部品 ----------
  osc(type, f, t0, dur, gain, dest, opts = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    if (this.waves[type]) o.setPeriodicWave(this.waves[type]); else o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + (opts.slide || dur));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
    if (opts.pluck) g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    else {
      g.gain.setValueAtTime(gain, t0 + Math.max(0.01, dur - 0.03));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    }
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  noiseHit(t0, dur, gain, dest, hp = 1000, lp = 12000) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f1 = c.createBiquadFilter(); f1.type = 'highpass'; f1.frequency.value = hp;
    const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f1); f1.connect(f2); f2.connect(g); g.connect(dest);
    s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
  }
  drum(kind, t0, gain, dest) {
    if (kind === 'k') this.osc('sine', 150, t0, 0.14, gain * 3, dest, { to: 40, slide: 0.12, pluck: true });
    else if (kind === 's') this.noiseHit(t0, 0.12, gain * 1.6, dest, 1200, 9000);
    else if (kind === 'h') this.noiseHit(t0, 0.035, gain * 0.9, dest, 7000, 16000);
  }

  // ---------- 効果音 ----------
  play(name, v = 0) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + 0.005, d = this.sfxGain;
    const seq = (notes, step, type = 'pulse25', gain = 0.1) =>
      notes.forEach((n, i) => this.osc(type, freq(n), t + i * step, step * 1.1, gain, d));
    switch (name) {
      case 'jump': this.osc('pulse25', 280, t, 0.16, 0.08, d, { to: 720, slide: 0.12 }); break;
      case 'coin':
        this.osc('pulse25', freq('B5'), t, 0.07, 0.08, d);
        this.osc('pulse25', freq('E6'), t + 0.07, 0.3, 0.08, d, { pluck: true });
        break;
      case 'stomp': {
        // れんぞくでふむほど 音が高くなる
        const k = Math.pow(1.12, Math.min(8, Math.max(0, v - 1)));
        this.osc('square', 320 * k, t, 0.12, 0.09, d, { to: 90 * k, slide: 0.1 });
        this.osc('triangle', 660 * k, t + 0.02, 0.08, 0.06, d);
        break;
      }
      case 'kick':
        this.osc('square', 500, t, 0.1, 0.07, d, { to: 150, slide: 0.08 });
        this.noiseHit(t, 0.08, 0.1, d, 1500);
        break;
      case 'bump': this.osc('triangle', 140, t, 0.1, 0.25, d, { to: 70, slide: 0.08 }); break;
      case 'break':
        this.noiseHit(t, 0.25, 0.25, d, 300, 4000);
        this.osc('square', 180, t, 0.12, 0.06, d, { to: 60 });
        break;
      case 'sprout': this.osc('pulse25', 300, t, 0.35, 0.07, d, { to: 900, slide: 0.35 }); break;
      case 'power': seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'], 0.05, 'pulse25', 0.07); break;
      case 'shrink': seq(['G5', 'D5', 'G4', 'D4', 'G3'], 0.06, 'pulse25', 0.08); break;
      case 'oneup': seq(['E6', 'G6', 'E7', 'C7', 'D7', 'G7'], 0.08, 'pulse25', 0.07); break;
      case 'medal':
        seq(['C6', 'G6', 'E6', 'C7'], 0.07, 'triangle', 0.18);
        seq(['E6', 'B6', 'G6', 'E7'], 0.07, 'pulse12', 0.04);
        break;
      case 'check': seq(['C6', 'E6', 'G6'], 0.07, 'pulse25', 0.07); break;
      case 'thud':
        this.osc('sine', 120, t, 0.25, 0.4, d, { to: 35, slide: 0.2, pluck: true });
        this.noiseHit(t, 0.15, 0.15, d, 100, 900);
        break;
      case 'bossHit':
        this.osc('square', 200, t, 0.3, 0.1, d, { to: 60, slide: 0.3 });
        this.noiseHit(t, 0.2, 0.2, d, 200, 3000);
        break;
      case 'bossJump': this.osc('triangle', 90, t, 0.25, 0.25, d, { to: 220, slide: 0.2 }); break;
      case 'flag': this.osc('pulse25', 900, t, 0.8, 0.06, d, { to: 200, slide: 0.8 }); break;
      case 'pause': seq(['E6', 'C6', 'E6', 'C6'], 0.06, 'pulse25', 0.06); break;
      case 'select': this.osc('pulse25', freq('A5'), t, 0.06, 0.06, d); this.osc('pulse25', freq('E6'), t + 0.05, 0.1, 0.06, d); break;
      case 'splash':
        this.noiseHit(t, 0.35, 0.3, d, 300, 3000);
        this.osc('sine', 500, t, 0.25, 0.12, d, { to: 120, slide: 0.25 });
        break;
      case 'die': this.playJingle('die'); break;
    }
  }

  // ---------- BGM ----------
  playBgm(name) {
    if (!this.ctx) { this.pendingSong = name; return; }
    if (this.songName === name && this.song && this.song.loop) return;
    if (!SONGS[name]) return;
    this.startSong(compiled(name, SONGS[name], true), SONGS[name].bpm, name, true);
  }
  playJingle(name) {
    if (!this.ctx || !JINGLES[name]) return;
    this.startSong(compiled('j:' + name, JINGLES[name], false), JINGLES[name].bpm, name, false);
  }
  stopBgm() {
    this.pendingSong = null;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.songBus) {
      const bus = this.songBus;
      try {
        for (const g of bus.fades) g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
        setTimeout(() => { for (const n of bus.all) try { n.disconnect(); } catch (_) {} }, 400);
      } catch (_) {}
      this.songBus = null;
    }
    this.song = null; this.songName = null;
  }
  // 曲ごとの音の通り道：パートごとに 音量→左右→(そのまま / リバーブ / ディレイ)
  makeBus(stepDur, vol = 1) {
    const c = this.ctx, out = c.createGain(), rev = c.createGain(), dly = c.createGain();
    out.gain.value = vol; rev.gain.value = vol; dly.gain.value = vol;
    out.connect(this.musicGain);
    if (this.reverb) rev.connect(this.reverb);
    if (this.delay) { dly.connect(this.delay); this.delay.delayTime.setValueAtTime(Math.min(1.4, stepDur * 3), c.currentTime); }
    const bus = { out, parts: {}, fades: [out, rev, dly], all: [out, rev, dly] };
    for (const [name, mx] of Object.entries(MIX)) {
      const g = c.createGain(); g.gain.value = mx.gain;
      let node = g;
      if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = mx.pan; g.connect(p); node = p; bus.all.push(p); }
      node.connect(out);
      if (mx.rev) { const s = c.createGain(); s.gain.value = mx.rev; node.connect(s); s.connect(rev); bus.all.push(s); }
      if (mx.dly) { const s = c.createGain(); s.gain.value = mx.dly; node.connect(s); s.connect(dly); bus.all.push(s); }
      bus.parts[name] = g; bus.all.push(g);
    }
    return bus;
  }
  startSong(song, bpm, name, loop) {
    this.stopBgm();
    if (!song || !this.ctx) return;
    const stepDur = 60 / bpm / 4;
    this.songBus = this.makeBus(stepDur, song.style.vol || 1);
    this.song = { def: song, loop, step: 0, next: this.ctx.currentTime + 0.06, stepDur, length: song.length };
    this.songName = name;
    const tick = () => this.schedule();
    tick();
    this.timer = setInterval(tick, 25);
  }
  schedule() {
    const s = this.song;
    if (!s || !this.ctx || !this.songBus) return;
    const ahead = this.ctx.currentTime + 0.2;
    // 画面がかくれて時間がとんだときは、追いつこうとせずに今から続ける
    if (s.next < this.ctx.currentTime - 0.5) s.next = this.ctx.currentTime + 0.05;
    const swing = s.def.style.swing || 0;
    while (s.next < ahead) {
      if (s.step >= s.length) {
        if (!s.loop) { this.stopAfter(s.next); return; }
        s.step = 0;
      }
      const t = s.next + (swing && s.step % 4 === 2 ? swing * 2 * s.stepDur : 0);
      for (const ev of s.def.events[s.step] || []) {
        const dest = this.songBus.parts[ev.part];
        try {
          if (ev.part === 'drum') drumHit(this, ev.kind, t, ev.vel, dest);
          else if (ev.m !== null && INST[ev.inst]) INST[ev.inst](this, t, ev.m, ev.len * s.stepDur * 0.95, ev.vel, dest);
        } catch (_) { /* 音が出せなくてもゲームは続ける */ }
      }
      s.step++;
      s.next += s.stepDur;
    }
  }
  stopAfter(t) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.song = null; this.songName = null;
  }
}
