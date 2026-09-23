// 効果音とBGM（ファイルを使わず、その場で音を作っています）

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(n) {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return 0;
  const midi = NOTE[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 1文字 = 8分音符1つ。「-」は前の音をのばす、「.」は休み
// ドラム: k=キック s=スネア h=ハイハット
function parse(str) {
  const toks = str.trim().split(/\s+/).filter(t => t !== '|');
  const events = [];
  let cur = null;
  toks.forEach((t, i) => {
    if (t === '-') { if (cur) cur.len++; return; }
    if (t === '.') { cur = null; return; }
    cur = { step: i, len: 1, note: t };
    events.push(cur);
  });
  return { events, length: toks.length };
}

const SONGS = {
  field: {
    bpm: 150,
    voices: [
      { wave: 'pulse25', gain: 0.075, notes: `
        G4 C5 E5 G5 - E5 C5 E5 | F5 - A5 - G5 - E5 - | D5 E5 F5 D5 - B4 C5 D5 | E5 - C5 - G4 - . . |
        G4 C5 E5 G5 - E5 C5 E5 | A5 - G5 - F5 - E5 - | D5 - G5 - F5 E5 D5 B4 | C5 - - - . . . . ` },
      { wave: 'triangle', gain: 0.16, notes: `
        C3 . G3 . C3 . G3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 . | C3 . G3 . C3 . E3 . |
        C3 . G3 . C3 . G3 . | A2 . E3 . F2 . C3 . | G2 . D3 . G2 . B2 . | C3 . G2 . C3 . . . ` },
      { wave: 'drum', gain: 0.05, notes: `
        k . h . s . h . | k . h . s . h h | k . h . s . h . | k . h . s . h h |
        k . h . s . h . | k . h . s . h h | k . h . s . h . | k . k . s . . . ` }
    ]
  },
  cave: {
    bpm: 112,
    voices: [
      { wave: 'triangle', gain: 0.12, notes: `
        A4 . C5 . E5 . C5 . | G4 . B4 . D5 . B4 . | F4 . A4 . C5 . A4 . | E4 . G#4 . B4 . E5 . |
        A4 . C5 . E5 . C5 . | G4 . B4 . D5 . B4 . | F4 . A4 . C5 . A4 . | E4 . G#4 . B4 . E5 . ` },
      { wave: 'pulse12', gain: 0.05, notes: `
        . . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . |
        E5 - - D5 C5 - B4 - | A4 - - - . . . . | F5 - E5 - D5 - C5 - | B4 - - - G#4 - - - ` },
      { wave: 'triangle', gain: 0.14, notes: `
        A2 - - - - - - - | G2 - - - - - - - | F2 - - - - - - - | E2 - - - - - - - |
        A2 - - - - - - - | G2 - - - - - - - | F2 - - - - - - - | E2 - - - E2 - - - ` },
      { wave: 'drum', gain: 0.035, notes: `
        k . . . h . . . | k . . . h . . . | k . . . h . . . | k . . . h . h . |
        k . . . h . . . | k . . . h . . . | k . . . h . . . | k . . . h . h . ` }
    ]
  },
  sky: {
    bpm: 132,
    voices: [
      { wave: 'pulse25', gain: 0.07, notes: `
        C5 - F5 - A5 - G5 F5 | G5 - - - C5 - - - | D5 - G5 - A#5 - A5 G5 | A5 - - - F5 - - - |
        C5 - F5 - A5 - C6 - | D6 - C6 A#5 A5 - F5 - | G5 - A5 - A#5 - E5 - | F5 - - - . . . . ` },
      { wave: 'triangle', gain: 0.15, notes: `
        F2 . C3 . F3 . C3 . | C3 . G3 . C3 . G3 . | A#2 . F3 . D3 . A3 . | F2 . C3 . F3 . A3 . |
        F2 . C3 . F3 . C3 . | A#2 . F3 . D3 . A3 . | C3 . G3 . C3 . E3 . | F2 . C3 . F3 . . . ` },
      { wave: 'drum', gain: 0.04, notes: `
        k . h h s . h . | k . h h s . h . | k . h h s . h . | k . h h s . h h |
        k . h h s . h . | k . h h s . h . | k . h h s . h . | k . s . s . s . ` }
    ]
  },
  castle: {
    bpm: 150,
    voices: [
      { wave: 'pulse25', gain: 0.065, notes: `
        D5 - - F5 E5 - D5 - | C5 - - - A4 - - - | A#4 - - D5 C5 - A#4 - | A4 - - - C#5 - - - |
        D5 - - F5 A5 - G5 F5 | E5 - - - C5 - E5 - | F5 - E5 - D5 - C#5 - | D5 - - - . . . . ` },
      { wave: 'sawtooth', gain: 0.045, notes: `
        D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | A#1 A#2 A#1 A#2 A#1 A#2 A#1 A#2 | A1 A2 A1 A2 A1 A2 A1 A2 |
        D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | A#1 A#2 A#1 A#2 A#1 A#2 A#1 A#2 | A1 A2 A1 A2 A1 A2 A1 A2 ` },
      { wave: 'drum', gain: 0.045, notes: `
        k . h . s . h . | k . h . s . h . | k . h . s . h . | k . h . s . s s |
        k . h . s . h . | k . h . s . h . | k . h . s . h . | k . s . s . s s ` }
    ]
  },
  zoo: {
    bpm: 140,
    voices: [
      { wave: 'pulse25', gain: 0.07, notes: `
        G4 . B4 D5 G5 - D5 . | E5 . C5 . A4 - . . | F#4 . A4 D5 F#5 - D5 . | G5 - - - . . . . |
        B4 . D5 G5 B5 - G5 . | C6 . A5 . F#5 - D5 . | E5 . D5 . C5 . A4 . | G4 - - - . . . . ` },
      { wave: 'triangle', gain: 0.16, notes: `
        G2 . D3 . G2 . D3 . | C3 . G3 . A2 . E3 . | D3 . A3 . D3 . A3 . | G2 . D3 . G2 . . . |
        G2 . D3 . G2 . D3 . | A2 . E3 . D3 . A3 . | C3 . G3 . D3 . A3 . | G2 . D3 . G2 . . . ` },
      { wave: 'drum', gain: 0.045, notes: `
        k . h . s . h . | k . h . s . h . | k . h . s . h . | k . h . s . s . |
        k . h . s . h . | k . h . s . h . | k . h . s . h . | k . k . s . . . ` }
    ]
  },
  kitano: {
    bpm: 132,
    voices: [
      { wave: 'pulse12', gain: 0.07, notes: `
        F5 - - A5 - C6 | A#5 - - G5 - - | E5 - - G5 - A#5 | A5 - - F5 - - |
        D5 - - F5 - A5 | G5 - - E5 - C5 | F5 - - E5 - G5 | F5 - - - - - ` },
      { wave: 'triangle', gain: 0.15, notes: `
        F3 - C4 A3 - C4 | G3 - D4 A#3 - D4 | C3 - G3 E3 - G3 | F3 - C4 A3 - C4 |
        D3 - A3 F3 - A3 | C3 - G3 E3 - G3 | C3 - G3 E3 - A#3 | F3 - C4 A3 - C4 ` },
      { wave: 'drum', gain: 0.03, notes: `
        k . h . h . | k . h . h . | k . h . h . | k . h . h . |
        k . h . h . | k . h . h . | k . h . h . | k . h . h . ` }
    ]
  },
  city: {
    bpm: 138,
    voices: [
      { wave: 'pulse25', gain: 0.065, notes: `
        D5 . F#5 A5 . F#5 B5 A5 | G5 . E5 . C#5 . E5 . | D5 . F#5 A5 . D6 C#6 B5 | A5 - - - . . . . |
        B5 . A5 G5 . F#5 E5 . | A5 . G5 F#5 . E5 D5 . | E5 . F#5 G5 . A5 B5 C#6 | D6 - - - . . . . ` },
      { wave: 'triangle', gain: 0.16, notes: `
        D3 D3 . D3 A2 . D3 . | E3 E3 . E3 A2 . E3 . | D3 D3 . D3 A2 . D3 . | A2 A2 . A2 E3 . A2 . |
        G2 G2 . G2 D3 . G2 . | F#2 F#2 . F#2 C#3 . F#2 . | E2 E2 . E2 B2 . A2 . | D3 . A2 . D3 . . . ` },
      { wave: 'drum', gain: 0.05, notes: `
        k h s h k k s h | k h s h k k s h | k h s h k k s h | k h s h k s s s |
        k h s h k k s h | k h s h k k s h | k h s h k k s h | k . s . k s s s ` }
    ]
  },
  night: {
    bpm: 104,
    voices: [
      { wave: 'triangle', gain: 0.14, notes: `
        E5 - - G5 A5 - - . | C6 - B5 A5 G5 - - . | F5 - - A5 G5 - E5 . | D5 - - - - - . . |
        E5 - - G5 A5 - - . | C6 - D6 C6 A5 - G5 . | F5 - E5 - D5 - B4 . | C5 - - - - - . . ` },
      { wave: 'pulse12', gain: 0.03, notes: `
        C5 . E5 . C5 . E5 . | A4 . C5 . A4 . C5 . | F4 . A4 . F4 . A4 . | G4 . B4 . G4 . B4 . |
        C5 . E5 . C5 . E5 . | A4 . C5 . A4 . C5 . | F4 . A4 . G4 . B4 . | E4 . G4 . C5 . . . ` },
      { wave: 'triangle', gain: 0.13, notes: `
        A2 . E3 . A2 . E3 . | F2 . C3 . F2 . C3 . | D2 . A2 . D2 . A2 . | G2 . D3 . G2 . B2 . |
        A2 . E3 . A2 . E3 . | F2 . C3 . F2 . C3 . | D2 . A2 . G2 . D3 . | C3 . G2 . C3 . . . ` },
      { wave: 'drum', gain: 0.025, notes: `
        h . h s h . h . | h . h s h . h . | h . h s h . h . | h . h s h . h h |
        h . h s h . h . | h . h s h . h . | h . h s h . h . | h . h s h . . . ` }
    ]
  },
  beach: {
    bpm: 144,
    voices: [
      { wave: 'pulse25', gain: 0.07, notes: `
        C5 . F5 . A5 . G5 F5 | G5 . . . A5 . . . | A#5 . A5 . G5 . F5 . | G5 - - - . . . . |
        C5 . F5 . A5 . C6 A5 | D6 . C6 . A#5 . A5 . | G5 . A5 . A#5 . E5 . | F5 - - - . . . . ` },
      { wave: 'triangle', gain: 0.16, notes: `
        F2 . . F3 C3 . A2 . | C3 . . C3 G2 . E2 . | A#2 . . A#2 F2 . D3 . | C3 . . C3 G2 . C3 . |
        F2 . . F3 C3 . A2 . | A#2 . . A#2 F2 . D3 . | C3 . . C3 G2 . E2 . | F2 . C3 . F2 . . . ` },
      { wave: 'drum', gain: 0.045, notes: `
        k . h s . h s h | k . h s . h s h | k . h s . h s h | k . h s . h s s |
        k . h s . h s h | k . h s . h s h | k . h s . h s h | k . s . s . . . ` }
    ]
  },
  bridge: {
    bpm: 150,
    voices: [
      { wave: 'pulse25', gain: 0.07, notes: `
        A4 . D5 . F#5 . A5 - | - . G5 F#5 E5 . D5 . | B4 . E5 . G5 . B5 - | - . A5 G5 F#5 . E5 . |
        F#5 . A5 . D6 . C#6 . | B5 . A5 . G5 . F#5 . | E5 . F#5 . G5 . A5 . | D5 - - - . . . . ` },
      { wave: 'triangle', gain: 0.16, notes: `
        D3 . A3 . D3 . A3 . | D3 . A3 . D3 . A3 . | G2 . D3 . G2 . D3 . | A2 . E3 . A2 . E3 . |
        D3 . A3 . B2 . F#3 . | G2 . D3 . E2 . B2 . | A2 . E3 . A2 . C#3 . | D3 . A2 . D3 . . . ` },
      { wave: 'drum', gain: 0.05, notes: `
        k . h . s . h h | k . h . s . h h | k . h . s . h h | k . h . s . s s |
        k . h . s . h h | k . h . s . h h | k . h . s . h h | k . s . s s s s ` }
    ]
  },
  boss: {
    bpm: 176,
    voices: [
      { wave: 'pulse25', gain: 0.065, notes: `
        E5 . E5 G5 . E5 B5 A5 | G5 . F#5 . E5 . D#5 . | E5 . E5 G5 . B5 D6 C6 | B5 - - - D#5 - - - ` },
      { wave: 'sawtooth', gain: 0.05, notes: `
        E2 E3 E2 E3 G2 G3 G2 G3 | A2 A3 A2 A3 B2 B3 B2 B3 | E2 E3 E2 E3 G2 G3 G2 G3 | B1 B2 B1 B2 B1 B2 B1 B2 ` },
      { wave: 'drum', gain: 0.05, notes: `
        k h s h k h s h | k h s h k h s s | k h s h k h s h | k k s h k k s s ` }
    ]
  },
  star: {
    bpm: 200,
    voices: [
      { wave: 'pulse25', gain: 0.06, notes: `
        C5 E5 G5 C6 G5 E5 C5 E5 | D5 F5 A5 D6 A5 F5 D5 F5 | C5 E5 G5 C6 G5 E5 C5 E5 | B4 D5 G5 B5 G5 D5 B4 D5 ` },
      { wave: 'triangle', gain: 0.15, notes: `
        C3 . C3 . C3 . C3 . | D3 . D3 . D3 . D3 . | C3 . C3 . C3 . C3 . | G2 . G2 . G2 . G2 . ` },
      { wave: 'drum', gain: 0.045, notes: `
        k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k s s s ` }
    ]
  }
};

const JINGLES = {
  clear: {
    bpm: 200,
    voices: [
      { wave: 'pulse25', gain: 0.08, notes: `G4 C5 E5 G5 C6 E6 G6 - - - E6 - - - C6 D6 E6 - - - - - - - . .` },
      { wave: 'triangle', gain: 0.16, notes: `C3 - - - E3 - - - G3 - - - C4 - - - A#3 - - - C4 - - - - - . .` }
    ]
  },
  ending: {
    bpm: 150,
    voices: [
      { wave: 'pulse25', gain: 0.08, notes: `C5 E5 G5 C6 - - A5 - F5 - A5 - C6 - - - D6 - C6 - B5 - G5 - C6 - - - - - - - . .` },
      { wave: 'triangle', gain: 0.16, notes: `C3 - - - - - F3 - - - - - - - - - G3 - - - - - - - C3 - - - - - - - . .` }
    ]
  },
  die: {
    bpm: 180,
    voices: [
      { wave: 'pulse25', gain: 0.08, notes: `E5 D#5 D5 C#5 C5 - - - B4 - - - A4 - - - . .` },
      { wave: 'triangle', gain: 0.14, notes: `C3 - - - B2 - - - A#2 - - - A2 - - - . .` }
    ]
  },
  gameover: {
    bpm: 120,
    voices: [
      { wave: 'pulse25', gain: 0.08, notes: `A4 - F4 - D4 - - - E4 F4 E4 D4 C#4 - D4 - - - . .` },
      { wave: 'triangle', gain: 0.14, notes: `D3 - - - A#2 - - - A2 - - - D2 - - - - - . .` }
    ]
  }
};
for (const s of [...Object.values(SONGS), ...Object.values(JINGLES)]) {
  for (const v of s.voices) Object.assign(v, parse(v.notes));
}

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
  play(name) {
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
      case 'stomp':
        this.osc('square', 320, t, 0.12, 0.09, d, { to: 90, slide: 0.1 });
        break;
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
    this.startSong(SONGS[name], name, true);
  }
  playJingle(name) {
    if (!this.ctx) return;
    this.startSong(JINGLES[name], name, false);
  }
  stopBgm() {
    this.pendingSong = null;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.songOut) {
      const g = this.songOut;
      try { g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02); setTimeout(() => g.disconnect(), 300); } catch (_) {}
      this.songOut = null;
    }
    this.song = null; this.songName = null;
  }
  startSong(song, name, loop) {
    this.stopBgm();
    if (!song || !this.ctx) return;
    const out = this.ctx.createGain();
    out.gain.value = 1;
    out.connect(this.musicGain);
    this.songOut = out;
    this.song = { def: song, loop, step: 0, next: this.ctx.currentTime + 0.06, stepDur: 60 / song.bpm / 2,
      length: Math.max(...song.voices.map(v => v.length)) };
    this.songName = name;
    const tick = () => this.schedule();
    tick();
    this.timer = setInterval(tick, 25);
  }
  schedule() {
    const s = this.song;
    if (!s || !this.ctx) return;
    const ahead = this.ctx.currentTime + 0.15;
    while (s.next < ahead) {
      if (s.step >= s.length) {
        if (!s.loop) { this.stopAfter(s.next); return; }
        s.step = 0;
      }
      for (const v of s.def.voices) {
        for (const ev of v.events) {
          if (ev.step !== s.step) continue;
          if (v.wave === 'drum') this.drum(ev.note, s.next, v.gain, this.songOut);
          else this.osc(v.wave, freq(ev.note), s.next, ev.len * s.stepDur * 0.95, v.gain, this.songOut, { pluck: v.wave === 'triangle' && s.def.bpm < 120 });
        }
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
