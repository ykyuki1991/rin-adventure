// BGM（ファイルを使わず、その場で演奏する）
// 曲は「コード進行」と「メロディ」だけを書き、ベース・和音・アルペジオ・ドラムは曲ごとの「スタイル」から自動で編曲する
//
// 書き方
//   chords: 1小節ごとにコードをならべる。「,」で区切ると1小節に2つ（前半・後半）  例 'C F Dm7,G7 C'
//   lead  : 1文字 = 8分音符。「-」は前の音をのばす、「.」は休み（ワルツは1小節6つ、ほかは8つ）
//   form  : セクションの順番。名前のうしろに「+」をつけると、2回目用にハーモニー（和声）がつく
//
// スタイルのパターン（16分音符1つ = 1文字。4/4 は16文字、3/4 は12文字）
//   bass : R=根音 F=5度 O=1オクターブ上 T=3度 S=7度 A=次のコードへの経過音 -=のばす .=休み
//   arp  : 数字 = コードの音の何番目か（0=根音、上へ）
//   comp : x=和音をきざむ -=のばす
//   drums: k=キック s=スネア h=ハイハット o=オープンハイハット c=クラップ r=リム t=ロータム m=ミドルタム z=シェイカー y=シンバル

const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
export const midiOf = n => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return m ? NOTE[m[1]] + (parseInt(m[2], 10) + 1) * 12 : null; };
export const hz = m => 440 * Math.pow(2, (m - 69) / 12);

const QUAL = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], sus4: [0, 5, 7], dim: [0, 3, 6], aug: [0, 4, 8], add9: [0, 4, 7, 14] };
function chordOf(sym) {
  const m = /^([A-G][#b]?)(.*)$/.exec(sym);
  const q = QUAL[m[2]] || QUAL[''];
  return { root: NOTE[m[1]], tones: q, sym };
}

// ===================== スタイル =====================
const STYLES = {
  pop: { // ステージ1：明るい商店街
    lead: 'leadPulse', harm: 'bell', arpInst: 'pluck', arpOct: 5, padInst: 'pad', bassInst: 'bass',
    bass: 'R..R..R.F..F..O.', arp: '..0...1...2...1.', pad: true,
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', z: '' },
    fill: { k: 'x.......x.......', s: '....x...x.xxx.xx', m: '..........x.....', t: '............x...' }
  },
  march: { // 動物園：マリンバがはずむ
    lead: 'marimba', harm: 'leadSoft', padInst: 'pad', bassInst: 'bassSub', compInst: 'organ', vol: 1.45,
    bass: 'R.......F.......', comp: '....x.......x...', arp: '', arpInst: 'bell', arpOct: 6, pad: false,
    drums: { k: 'x.......x.......', s: '....x.......x...', z: 'x.xxx.xxx.xxx.xx' },
    fill: { k: 'x.......x.......', s: '....x...x.x.x.xx', t: '..........x.x...' }
  },
  mystic: { // 布引の滝：ハープとしずく
    lead: 'leadSoft', harm: 'bell', arpInst: 'harp', arpOct: 4, padInst: 'strings', bassInst: 'bassSub',
    bass: 'R---------------', arp: '0.1.2.3.4.3.2.1.', pad: true, drops: true,
    drums: { k: 'x.........x.....', r: '........x.......', z: '....x.......x...' },
    fill: { k: 'x.........x.....', t: '........x...x...', m: '..........x...x.' }
  },
  airy: { // ロープウェイ・タイトル：空の散歩
    lead: 'leadSoft', harm: 'bell', arpInst: 'harp', arpOct: 5, padInst: 'pad', bassInst: 'bassSub',
    bass: 'R.....F.R.....O.', arp: '0.1.2.3.4.3.2.1.', pad: true,
    drums: { k: 'x.........x.....', s: '....x.......x...', z: 'x.x.x.x.x.x.x.x.' },
    fill: { k: 'x.........x.....', s: '....x.......x.xx', z: 'x.x.x.x.x.x.x.x.' }
  },
  waltz: { // 北野：アコーディオンのワルツ
    lead: 'accordion', harm: 'bell', padInst: 'pad', bassInst: 'bassSub', compInst: 'pizz', vol: 1.55,
    bass: 'R.......F...', comp: '....x...x...', arp: '', pad: false,
    drums: { z: '....x...x...', k: 'x...........' },
    fill: { z: '....x.x.x.x.', k: 'x...........' }
  },
  funk: { // 三宮・南京町：ファンク
    lead: 'leadPulse', harm: 'brass', padInst: 'pad', bassInst: 'bass', compInst: 'clav',
    bass: 'R..R..O.R.F..R.O', comp: '..x..x....x..x..', arp: '', pad: false,
    drums: { k: 'x..x......x..x..', s: '....x.......x...', h: 'xxxxxxxxxxxxxx.x', o: '..............x.' },
    fill: { k: 'x..x......x.....', s: '....x..x.xx.xxxx', h: 'xxxxxxxx........' }
  },
  jazz: { // 夜のメリケンパーク：スウィング
    lead: 'leadSoft', harm: 'ep', padInst: 'ep', bassInst: 'bassSub', compInst: 'ep', swing: 0.3,
    bass: 'R...T...F...A...', comp: '......x.......x.', arp: '', pad: false, delay: 0.35,
    drums: { h: 'x...x.x.x...x.x.', r: '....x.......x...', k: 'x.........x.....' },
    fill: { h: 'x...x.x.x...x.x.', r: '....x...x.x.xxx.', k: 'x.........x.....' }
  },
  calypso: { // 須磨海岸：スチールドラム
    lead: 'steel', harm: 'marimba', padInst: 'pad', bassInst: 'bass', compInst: 'guitar',
    bass: 'R..R..F.R..R..F.', comp: '..x...x...x...x.', arp: '', pad: false,
    drums: { k: 'x.......x.......', r: '...x..x....x..x.', z: 'xxxxxxxxxxxxxxxx', t: '......x.......x.' },
    fill: { k: 'x.......x.......', t: '......x.x.x.xx..', m: '........x.x.x.xx', z: 'xxxxxxxxxxxxxxxx' }
  },
  rock: { // 明石海峡大橋：疾走
    lead: 'leadPulse', harm: 'strings', arpInst: 'pluck', arpOct: 5, padInst: 'strings', bassInst: 'bass', delay: 0.3,
    bass: 'R.R.R.R.R.R.O.R.', arp: '0.1.2.1.0.1.2.1.', pad: true,
    drums: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    fill: { k: 'x.....x.x.......', s: '....x...xxxxxxxx', t: '............x.x.' }
  },
  epic: { // 六甲山：夜の山
    lead: 'leadPulse', harm: 'brass', arpInst: 'pluck', arpOct: 4, padInst: 'strings', bassInst: 'bass',
    bass: 'R.R.R.R.R.R.R.R.', arp: '0120120120120121', pad: true,
    drums: { k: 'x.......x.......', s: '....x.......x...', t: '......x.......x.', z: 'x.x.x.x.x.x.x.x.' },
    fill: { k: 'x.......x.......', t: '........x.x.x.x.', m: '....x.x.........', s: '............xxxx' }
  },
  boss: { // キングスライム
    lead: 'leadPulse', harm: 'brass', padInst: 'strings', bassInst: 'bass', compInst: 'brass',
    bass: 'R.O.R.O.R.O.R.O.', comp: 'x..x..x.........', arp: '', pad: true,
    drums: { k: 'x.x...x.x.x...x.', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx' },
    fill: { k: 'x.x...x.x.......', t: '........x.x.x.x.', m: '.........x.x.x.x', s: '....x...........' }
  },
  star: { // むてき
    lead: 'leadPulse', harm: 'bell', arpInst: 'pluck', arpOct: 5, padInst: 'pad', bassInst: 'bass',
    bass: 'R.O.R.O.R.O.R.O.', arp: '0123012301230123', pad: false,
    drums: { k: 'x...x...x...x...', c: '....x.......x...', h: '..x...x...x...x.' },
    fill: { k: 'x...x...x...x...', s: '....x...xxxxxxxx', h: '..x...x.........' }
  },
  jingle: {
    lead: 'leadPulse', harm: 'bell', arpInst: 'harp', arpOct: 5, padInst: 'pad', bassInst: 'bassSub',
    bass: 'R---------------', arp: '0.1.2.3.4.3.2.1.', pad: true, drums: {}, fill: {}
  }
};

// ===================== 曲 =====================
export const SONGS = {
  // タイトル・ステージ選択
  title: {
    bpm: 112, style: 'airy', form: ['A', 'B', 'A+'],
    A: { chords: 'Cmaj7 Am7 Dm7 G7 Cmaj7 Em7,A7 Dm7,G7 C',
      lead: 'E5 - G5 - C6 - - B5 | A5 - - G5 - - E5 - | F5 - - E5 - - D5 - | G5 - - - - - . . | E5 - G5 - C6 - - D6 | E6 - - D6 - - C6 - | A5 - C6 - B5 - G5 - | C6 - - - - - . .' },
    B: { chords: 'Fmaj7 Em7 Dm7 Am7 Fmaj7 E7 Am7,D7 G7',
      lead: 'A5 - - - C6 - - - | B5 - - A5 G5 - - - | A5 - - - F5 - - - | G5 - - - E5 - - - | F5 - A5 - C6 - - - | B5 - - - G#5 - - - | A5 - - - B5 - - - | C6 - - - B5 - - -' }
  },
  field: {
    bpm: 150, style: 'pop', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'C F Dm7,G7 C C Am,F G7 C',
      lead: 'G4 C5 E5 G5 - E5 C5 E5 | F5 - A5 - G5 - E5 - | D5 E5 F5 D5 - B4 C5 D5 | E5 - C5 - G4 - . . | G4 C5 E5 G5 - E5 C5 E5 | A5 - G5 - F5 - E5 - | D5 - G5 - F5 E5 D5 B4 | C5 - - - . . . .' },
    B: { chords: 'F C Dm7 Am F C,E7 Dm7 G7',
      lead: 'A5 - A5 G5 F5 - E5 F5 | G5 - - E5 C5 - - - | D5 - D5 E5 F5 - A5 G5 | E5 - - - C5 - - - | A5 - A5 G5 F5 - E5 F5 | G5 - C6 - B5 - G#5 - | A5 - F5 - D5 - E5 F5 | G5 - - - . . G4 -' }
  },
  zoo: {
    bpm: 140, style: 'march', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'G C D G G D7 C,D7 G',
      lead: 'G4 . B4 D5 G5 - D5 . | E5 . C5 . A4 - . . | F#4 . A4 D5 F#5 - D5 . | G5 - - - . . . . | B4 . D5 G5 B5 - G5 . | C6 . A5 . F#5 - D5 . | E5 . D5 . C5 . A4 . | G4 - - - . . . .' },
    B: { chords: 'Em Am D G C D Em,C D7',
      lead: 'E5 - D5 E5 - B4 . . | C5 - B4 C5 - A4 . . | D5 - C5 D5 - F#4 . . | G4 - A4 B4 - D5 . . | E5 - D5 E5 - G5 . . | F#5 - E5 F#5 - A5 . . | G5 - F#5 - E5 - D5 C5 | B4 - A4 - D5 . . .' }
  },
  cave: {
    bpm: 108, style: 'mystic', form: ['A', 'B', 'A+'],
    A: { chords: 'Am G F E Am G F E',
      lead: 'E5 - - - D5 - C5 - | B4 - - - G4 - - - | A4 - C5 - F5 - E5 - | E5 - - - - - . . | E5 - - D5 C5 - B4 - | A4 - - - . . . . | F5 - E5 - D5 - C5 - | B4 - - - G#4 - - -' },
    B: { chords: 'F G Em Am Dm E Am E',
      lead: 'A5 - - - G5 - F5 - | G5 - - - D5 - - - | E5 - - - B4 - C5 - | A4 - - - - - . . | D5 - F5 - A5 - G5 - | G#5 - - - E5 - - - | A5 - - - B5 - C6 - | B5 - - - G#5 - - -' }
  },
  sky: {
    bpm: 132, style: 'airy', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'F C Gm7 F F Bb C7 F',
      lead: 'C5 - F5 - A5 - G5 F5 | G5 - - - C5 - - - | D5 - G5 - A#5 - A5 G5 | A5 - - - F5 - - - | C5 - F5 - A5 - C6 - | D6 - C6 A#5 A5 - F5 - | G5 - A5 - A#5 - E5 - | F5 - - - . . . .' },
    B: { chords: 'Bb F Dm C Bb Am Gm7 C7',
      lead: 'A#5 - - A5 G5 - F5 - | A5 - - - F5 - C5 - | D5 - E5 - F5 - G5 - | A5 - - - G5 - - - | A#5 - - A5 G5 - F5 - | A5 - - - C6 - - - | D6 - C6 - A#5 - A5 - | G5 - - - C5 - E5 -' }
  },
  kitano: {
    bpm: 132, style: 'waltz', meter: 3, form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'F Gm C7 F Dm C C7 F',
      lead: 'F5 - - A5 - C6 | A#5 - - G5 - - | E5 - - G5 - A#5 | A5 - - F5 - - | D5 - - F5 - A5 | G5 - - E5 - C5 | F5 - - E5 - G5 | F5 - - - - -' },
    B: { chords: 'Dm A7 Dm F Gm F C7 F',
      lead: 'A5 - - G5 - F5 | E5 - - D5 - C#5 | D5 - - F5 - A5 | C6 - - A#5 - A5 | A#5 - - A5 - G5 | A5 - - G5 - F5 | E5 - - G5 - A#5 | A5 - - - - -' }
  },
  city: {
    bpm: 138, style: 'funk', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'D A7 D A G F#m Em7,A7 D',
      lead: 'D5 . F#5 A5 . F#5 B5 A5 | G5 . E5 . C#5 . E5 . | D5 . F#5 A5 . D6 C#6 B5 | A5 - - - . . . . | B5 . A5 G5 . F#5 E5 . | A5 . G5 F#5 . E5 D5 . | E5 . F#5 G5 . A5 B5 C#6 | D6 - - - . . . .' },
    B: { chords: 'Bm Gmaj7 Em7 A Bm G Em7 A7',
      lead: 'A5 - F#5 - E5 - D5 E5 | F#5 - - - . . E5 D5 | B4 - D5 - E5 - F#5 A5 | F#5 - - - . . . . | A5 - B5 - A5 F#5 E5 D5 | E5 - F#5 - A5 - - - | B5 - A5 - F#5 - E5 - | D5 - - - . . A4 -' }
  },
  night: {
    bpm: 100, style: 'jazz', form: ['A', 'B', 'A+'],
    A: { chords: 'Am7 Fmaj7 Dm7 G7 Am7 Fmaj7 Dm7,G7 Cmaj7',
      lead: 'E5 - - G5 A5 - - . | C6 - B5 A5 G5 - - . | F5 - - A5 G5 - E5 . | D5 - - - - - . . | E5 - - G5 A5 - - . | C6 - D6 C6 A5 - G5 . | F5 - E5 - D5 - B4 . | C5 - - - - - . .' },
    B: { chords: 'Fmaj7 Em7 Dm7 Am7 Fmaj7 Em7,A7 Dm7 G7',
      lead: 'A5 - - G5 - - E5 - | G5 - - - - - . . | F5 - - E5 - - D5 - | E5 - - - C5 - . . | A5 - - G5 - - E5 - | B5 - - - G5 - A5 . | A5 - G5 - F5 - D5 - | B4 - - - D5 - G5 -' }
  },
  beach: {
    bpm: 144, style: 'calypso', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'F C Bb C F Bb C7 F',
      lead: 'C5 . F5 . A5 . G5 F5 | G5 . . . A5 . . . | A#5 . A5 . G5 . F5 . | G5 - - - . . . . | C5 . F5 . A5 . C6 A5 | D6 . C6 . A#5 . A5 . | G5 . A5 . A#5 . E5 . | F5 - - - . . . .' },
    B: { chords: 'Dm Am Bb F Gm7 F Bb,C7 F',
      lead: 'A5 - A5 - G5 - F5 - | A5 - - - . . . . | A#5 - A#5 - A5 - G5 - | A5 - - - . . . . | G5 - G5 - F5 - E5 - | F5 - G5 - A5 - C6 - | D6 - C6 - A#5 - G5 - | F5 - - - . . C5 -' }
  },
  bridge: {
    bpm: 150, style: 'rock', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'D G Em A D Bm,G Em7,A7 D',
      lead: 'A4 . D5 . F#5 . A5 - | - . G5 F#5 E5 . D5 . | B4 . E5 . G5 . B5 - | - . A5 G5 F#5 . E5 . | F#5 . A5 . D6 . C#6 . | B5 . A5 . G5 . F#5 . | E5 . F#5 . G5 . A5 . | D5 - - - . . . .' },
    B: { chords: 'Bm G Em A G F#m Em7,A7 D',
      lead: 'B5 - - - A5 - F#5 - | G5 - - - F#5 - D5 - | E5 - F#5 - G5 - B5 - | A5 - - - - - . . | B5 - - - D6 - C#6 - | B5 - A5 - F#5 - A5 - | G5 - F#5 - E5 - C#5 - | D5 - - - A4 - - -' }
  },
  castle: {
    bpm: 144, style: 'epic', form: ['A', 'A+', 'B', 'A+'],
    A: { chords: 'Dm C Bb A Dm C Gm,A7 Dm',
      lead: 'D5 - - F5 E5 - D5 - | C5 - - - A4 - - - | A#4 - - D5 C5 - A#4 - | A4 - - - C#5 - - - | D5 - - F5 A5 - G5 F5 | E5 - - - C5 - E5 - | F5 - E5 - D5 - C#5 - | D5 - - - . . . .' },
    B: { chords: 'Bb C Dm F Gm Bb A7 Dm',
      lead: 'F5 - - - E5 - D5 - | C5 - - - D5 - E5 - | F5 - - - G5 - A5 - | A5 - - - - - . . | A#5 - - - A5 - G5 - | F5 - - - E5 - D5 - | E5 - - - C#5 - A4 - | D5 - - - A4 - - -' }
  },
  boss: {
    bpm: 176, style: 'boss', form: ['A', 'B', 'A+', 'B'],
    A: { chords: 'Em Em,B7 Em,C B7',
      lead: 'E5 . E5 G5 . E5 B5 A5 | G5 . F#5 . E5 . D#5 . | E5 . E5 G5 . B5 D6 C6 | B5 - - - D#5 - - -' },
    B: { chords: 'Am D C B7',
      lead: 'C6 - B5 - A5 - G5 - | F#5 - G5 - A5 - B5 - | C6 - B5 - A5 - G5 A5 | B5 - - - D#6 - - -' }
  },
  star: {
    bpm: 200, style: 'star', form: ['A'],
    A: { chords: 'C Dm C G',
      lead: 'C5 E5 G5 C6 G5 E5 C5 E5 | D5 F5 A5 D6 A5 F5 D5 F5 | C5 E5 G5 C6 G5 E5 C5 E5 | B4 D5 G5 B5 G5 D5 B4 D5' }
  }
};

export const JINGLES = {
  clear: { bpm: 200, style: 'jingle', form: ['A'], A: { chords: 'C C Bb,C C', lead: 'G4 C5 E5 G5 C6 E6 G6 - | - - E6 - - - C6 D6 | E6 - - - - - - - | . . . . . . . .' }, drums: { s: 'xxxxxxxxxxxxxxxx|................|y...............|................' } },
  ending: { bpm: 150, style: 'jingle', form: ['A'], A: { chords: 'C F G C', lead: 'C5 E5 G5 C6 - - A5 - | F5 - A5 - C6 - - - | D6 - C6 - B5 - G5 - | C6 - - - - - - -' }, drums: { y: 'y...............|y...............|y...............|y...............' } },
  die: { bpm: 180, style: 'jingle', form: ['A'], A: { chords: 'C Am', lead: 'E5 D#5 D5 C#5 C5 - - - | B4 - - - A4 - - -' } },
  gameover: { bpm: 120, style: 'jingle', form: ['A'], A: { chords: 'Dm Bb,A Dm', lead: 'A4 - F4 - D4 - - - | E4 F4 E4 D4 C#4 - - - | D4 - - - - - . .' } }
};

// ===================== 曲を音のならびにする =====================
function tokens(str) { return str.trim().split(/\s+/).filter(t => t !== '|'); }

// 1つのセクションを 16分音符ごとのイベントにする
function compileSection(song, sec, withHarm, stepOffset, out, isFirst, isLast) {
  const st = STYLES[song.style];
  const meter = song.meter || 4, bar = meter * 4;
  const bars = sec.chords.split(/\s+/);
  const chordAt = []; // 16分ごとのコード
  bars.forEach((b, i) => {
    const parts = b.split(',');
    const each = bar / parts.length;
    parts.forEach((p, j) => { for (let k = 0; k < each; k++) chordAt[i * bar + j * each + k] = chordOf(p); });
  });
  const len = bars.length * bar;
  const add = (step, ev) => { (out[stepOffset + step] ||= []).push(ev); };
  // メロディ（8分音符 → 16分2つ）
  const lt = tokens(sec.lead);
  let cur = null;
  lt.forEach((t, i) => {
    if (t === '-') { if (cur) cur.len += 2; return; }
    if (t === '.') { cur = null; return; }
    cur = { part: 'lead', inst: st.lead, m: midiOf(t), len: 2, vel: 1 };
    add(i * 2, cur);
    // ハーモニー：メロディの少し下にあるコードの音（3度・6度などの気持ちいい音）
    if (withHarm) {
      const ch = chordAt[i * 2];
      const hm = harmonyNote(cur.m, ch);
      if (hm) { const h = { part: 'harm', inst: st.harm, m: hm, len: 2, vel: 0.8 }; add(i * 2, h); cur.h = h; }
    }
  });
  // のびた長さをハーモニーにも反映
  for (let s = 0; s < len; s++) for (const ev of out[stepOffset + s] || []) if (ev.part === 'lead' && ev.h) ev.h.len = ev.len;

  for (let b = 0; b < bars.length; b++) {
    const b0 = b * bar;
    // パッド（コードが変わるたびに）
    if (st.pad) {
      let s = b0;
      while (s < b0 + bar) {
        const ch = chordAt[s]; let e = s; while (e < b0 + bar && chordAt[e] === ch) e++;
        voicing(ch, 55).forEach(m => add(s, { part: 'pad', inst: st.padInst, m, len: e - s, vel: 1 }));
        s = e;
      }
    }
    // ベース
    pattern(st.bass, bar).forEach(([i, c, l]) => {
      const ch = chordAt[b0 + i], next = chordAt[b0 + bar] || chordAt[0];
      const m = bassNote(c, ch, next);
      if (m !== null) add(b0 + i, { part: 'bass', inst: st.bassInst, m, len: l, vel: 1 });
    });
    // アルペジオ
    if (st.arp) pattern(st.arp, bar).forEach(([i, c]) => {
      const ch = chordAt[b0 + i], n = parseInt(c, 10);
      if (Number.isNaN(n)) return;
      const tones = ch.tones.slice(0, 4), base = 12 * (st.arpOct + 1) + ch.root;
      const m = base + tones[n % tones.length] + 12 * Math.floor(n / tones.length);
      add(b0 + i, { part: 'arp', inst: st.arpInst, m, len: 2, vel: 0.7 + (i % 4 === 0 ? 0.3 : 0) });
    });
    // きざみ
    if (st.comp) pattern(st.comp, bar).forEach(([i, c, l]) => {
      if (c !== 'x') return;
      voicing(chordAt[b0 + i], 60).forEach(m => add(b0 + i, { part: 'comp', inst: st.compInst, m, len: Math.max(1, l), vel: 1 }));
    });
    // しずく（高いベルの音をときどき）
    if (st.drops) for (let i = 0; i < bar; i++) {
      const h = ((stepOffset + b0 + i) * 2654435761) >>> 0;
      if (h % 23 === 0) { const ch = chordAt[b0 + i]; add(b0 + i, { part: 'drop', inst: 'bell', m: 84 + ch.root % 12 + ch.tones[h % ch.tones.length], len: 4, vel: 0.5 }); }
    }
    // ドラム（セクションの最後の小節はフィルイン、はじめの小節にシンバル）
    const lastBar = b === bars.length - 1;
    const dr = song.drums ? null : (lastBar && !isLast ? st.fill : st.drums);
    const drumRows = song.drums ? Object.fromEntries(Object.entries(song.drums).map(([k, v]) => [k, v.split('|')[b] || ''])) : dr;
    for (const [k, pat] of Object.entries(drumRows || {})) {
      for (let i = 0; i < Math.min(bar, pat.length); i++) if (pat[i] !== '.') add(b0 + i, { part: 'drum', kind: k === 'y' ? 'y' : k, vel: i % 4 === 0 ? 1 : 0.75 });
    }
    if (b === 0 && !isFirst && st.drums && Object.keys(st.drums).length) add(b0, { part: 'drum', kind: 'y', vel: 0.8 });
  }
  return len;
}
// 16分のパターンを [位置, 文字, 長さ] にする
function pattern(p, bar) {
  const out = [];
  for (let i = 0; i < bar; i++) {
    const c = p[i % p.length];
    if (c === '.' || c === '-' || c === undefined) continue;
    let l = 1; while (i + l < bar && p[(i + l) % p.length] === '-') l++;
    out.push([i, c, l]);
  }
  return out;
}
function bassNote(c, ch, next) {
  const root = 36 + ch.root; // C2〜B2
  switch (c) {
    case 'R': return root;
    case 'F': return root + 7;
    case 'O': return root + 12;
    case 'T': return root + ch.tones[1];
    case 'S': return root + (ch.tones[3] ?? 10);
    case 'A': { const t = 36 + next.root; return t + (t > root ? -1 : 1); }
  }
  return null;
}
// 和音の並べ方（low 以上の近いところに3〜4音）
function voicing(ch, low) {
  return ch.tones.slice(0, 4).map(t => { let m = ch.root + t; while (m < low) m += 12; while (m >= low + 12) m -= 12; return m; }).sort((a, b) => a - b);
}
function harmonyNote(m, ch) {
  if (!ch) return null;
  for (let d = 3; d <= 9; d++) { const n = m - d; if (ch.tones.some(t => (n - ch.root - t) % 12 === 0)) return n; }
  return null;
}

// 曲ぜんたい（form の順）をつなげる
export function compileSong(song) {
  const events = [];
  let pos = 0;
  song.form.forEach((name, i) => {
    const withHarm = name.endsWith('+');
    const sec = song[name.replace('+', '')];
    pos += compileSection(song, sec, withHarm, pos, events, i === 0, i === song.form.length - 1 && !song.loop);
  });
  return { events, length: pos, meter: song.meter || 4, style: STYLES[song.style] };
}

// ===================== 楽器 =====================
// part ごとの音量・左右・リバーブとディレイの量
export const MIX = {
  lead: { gain: 0.22, pan: 0.05, rev: 0.22, dly: 0.18 },
  harm: { gain: 0.12, pan: -0.35, rev: 0.3, dly: 0 },
  pad: { gain: 0.05, pan: 0, rev: 0.4, dly: 0 },
  bass: { gain: 0.3, pan: 0, rev: 0.03, dly: 0 },
  arp: { gain: 0.07, pan: 0.4, rev: 0.3, dly: 0.2 },
  comp: { gain: 0.08, pan: -0.25, rev: 0.2, dly: 0 },
  drop: { gain: 0.08, pan: 0.5, rev: 0.6, dly: 0.3 },
  drum: { gain: 0.32, pan: 0, rev: 0.08, dly: 0 }
};

// 音の形（アタック・減衰・持続・余韻）
function env(g, t, dur, peak, a = 0.01, d = 0.1, s = 0.7, r = 0.08) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(peak * s, t + a, d / 3);
  const end = t + Math.max(a + 0.01, dur);
  g.gain.setTargetAtTime(0.0001, end, r / 3);
  return end + r * 1.5;
}
function pluckEnv(g, t, peak, decay) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.setTargetAtTime(0.0001, t + 0.004, decay / 3);
  return t + decay * 1.6;
}

// 楽器ごとの鳴らし方。A は audio.js の Sound（ctx・waves・noise）
export const INST = {
  // 8bit っぽいメロディ（ビブラートつき）
  leadPulse(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.setPeriodicWave(A.waves.pulse25); o.frequency.value = hz(m);
    vibrato(A, o, t, dur, 5.5, 0.35);
    f.type = 'lowpass'; f.frequency.value = 3200;
    const end = env(g, t, dur, v, 0.008, 0.12, 0.65, 0.07);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  // フルートのようなやわらかいメロディ
  leadSoft(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
    o.type = 'triangle'; o.frequency.value = hz(m);
    o2.type = 'sine'; o2.frequency.value = hz(m) * 2; g2.gain.value = 0.18;
    vibrato(A, o, t, dur, 5, 0.3); vibrato(A, o2, t, dur, 5, 0.3);
    const end = env(g, t, dur, v * 1.25, 0.035, 0.15, 0.8, 0.12);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(dest);
    o.start(t); o2.start(t); o.stop(end); o2.stop(end);
  },
  marimba(A, t, m, dur, v, dest) {
    const c = A.ctx;
    for (const [mul, amp, dec] of [[1, 1, 0.35], [4, 0.25, 0.06], [10, 0.08, 0.02]]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = hz(m) * mul;
      const end = pluckEnv(g, t, v * amp * 1.3, dec);
      o.connect(g); g.connect(dest); o.start(t); o.stop(end);
    }
  },
  steel(A, t, m, dur, v, dest) { // スチールドラム
    const c = A.ctx;
    for (const [mul, amp, dec] of [[1, 1, 0.5], [2, 0.5, 0.3], [3.01, 0.25, 0.18], [4.02, 0.12, 0.1]]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(hz(m) * mul * 1.012, t); o.frequency.exponentialRampToValueAtTime(hz(m) * mul, t + 0.05);
      const end = pluckEnv(g, t, v * amp * 1.1, dec + Math.min(0.4, dur * 0.3));
      o.connect(g); g.connect(dest); o.start(t); o.stop(end);
    }
  },
  bell(A, t, m, dur, v, dest) { // オルゴール・グロッケン
    const c = A.ctx;
    for (const [mul, amp, dec] of [[1, 1, 1.1], [2.76, 0.35, 0.4], [5.4, 0.15, 0.15]]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = hz(m) * mul;
      const end = pluckEnv(g, t, v * amp * 0.9, dec);
      o.connect(g); g.connect(dest); o.start(t); o.stop(end);
    }
  },
  harp(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = hz(m);
    f.type = 'lowpass'; f.frequency.setValueAtTime(4000, t); f.frequency.setTargetAtTime(900, t, 0.15);
    const end = pluckEnv(g, t, v * 1.1, 0.9);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  pluck(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.setPeriodicWave(A.waves.pulse12); o.frequency.value = hz(m);
    f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(3500, t); f.frequency.setTargetAtTime(500, t, 0.06);
    const end = pluckEnv(g, t, v * 0.9, 0.22);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  accordion(A, t, m, dur, v, dest) {
    const c = A.ctx, g = c.createGain(), f = c.createBiquadFilter(), trem = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    f.type = 'lowpass'; f.frequency.value = 2400;
    const oscs = [-7, 7].map(cents => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cents; o.connect(f); return o; });
    lfo.frequency.value = 6; lg.gain.value = 0.18; lfo.connect(lg); lg.connect(trem.gain); trem.gain.value = 0.82;
    const end = env(g, t, dur, v * 0.55, 0.03, 0.1, 0.85, 0.08);
    f.connect(trem); trem.connect(g); g.connect(dest);
    for (const o of [...oscs, lfo]) { o.start(t); o.stop(end); }
  },
  ep(A, t, m, dur, v, dest) { // エレピ
    const c = A.ctx;
    for (const [mul, amp, dec] of [[1, 1, 1.4], [2, 0.3, 0.5], [7, 0.05, 0.05]]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = hz(m) * mul;
      const end = Math.min(pluckEnv(g, t, v * amp * 0.9, dec), t + dur + 0.3);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.08);
      o.connect(g); g.connect(dest); o.start(t); o.stop(end + 0.3);
    }
  },
  pad(A, t, m, dur, v, dest) {
    const c = A.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1300;
    const oscs = [-9, 9].map(cents => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cents; o.connect(f); return o; });
    const end = env(g, t, dur, v, 0.25, 0.4, 0.8, 0.35);
    f.connect(g); g.connect(dest);
    for (const o of oscs) { o.start(t); o.stop(end); }
  },
  strings(A, t, m, dur, v, dest) {
    const c = A.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 2200;
    const oscs = [-12, 0, 12].map(cents => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cents; o.connect(f); return o; });
    vibrato(A, oscs[1], t, dur, 5, 0.15);
    const end = env(g, t, dur, v * 0.8, 0.12, 0.3, 0.85, 0.3);
    f.connect(g); g.connect(dest);
    for (const o of oscs) { o.start(t); o.stop(end); }
  },
  brass(A, t, m, dur, v, dest) {
    const c = A.ctx, g = c.createGain(), f = c.createBiquadFilter(), o = c.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = hz(m);
    f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(2600, t + 0.05); f.frequency.setTargetAtTime(1400, t + 0.05, 0.1);
    const end = env(g, t, Math.min(dur, 0.6), v * 0.7, 0.02, 0.1, 0.7, 0.08);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  organ(A, t, m, dur, v, dest) {
    const c = A.ctx, g = c.createGain();
    const end = env(g, t, Math.min(dur, 0.18) , v * 0.5, 0.005, 0.05, 0.8, 0.04);
    for (const [mul, amp] of [[1, 1], [2, 0.5], [3, 0.3]]) { const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = hz(m) * mul; og.gain.value = amp; o.connect(og); og.connect(g); o.start(t); o.stop(end); }
    g.connect(dest);
  },
  pizz(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = hz(m);
    f.type = 'lowpass'; f.frequency.setValueAtTime(2500, t); f.frequency.setTargetAtTime(400, t, 0.05);
    const end = pluckEnv(g, t, v * 0.7, 0.25);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  clav(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.setPeriodicWave(A.waves.pulse12); o.frequency.value = hz(m);
    f.type = 'bandpass'; f.Q.value = 1.5; f.frequency.value = 1600;
    const end = pluckEnv(g, t, v * 1.2, 0.12);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  guitar(A, t, m, dur, v, dest) { // カッティング
    const c = A.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = hz(m);
    f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.value = 2000;
    const end = pluckEnv(g, t, v * 0.9, 0.1);
    o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end);
  },
  bass(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = hz(m);
    o2.type = 'sine'; o2.frequency.value = hz(m);
    f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(1400, t); f.frequency.setTargetAtTime(380, t, 0.06);
    const end = env(g, t, dur, v * 0.8, 0.005, 0.12, 0.6, 0.05);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(dest);
    o.start(t); o2.start(t); o.stop(end); o2.stop(end);
  },
  bassSub(A, t, m, dur, v, dest) {
    const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
    o.type = 'triangle'; o.frequency.value = hz(m);
    o2.type = 'sine'; o2.frequency.value = hz(m) * 2; g2.gain.value = 0.25; // スマホのスピーカーでも聞こえるように倍音をたす
    const end = env(g, t, dur, v, 0.01, 0.2, 0.75, 0.08);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(dest);
    o.start(t); o2.start(t); o.stop(end); o2.stop(end);
  }
};
function vibrato(A, o, t, dur, rate, cents) {
  if (dur < 0.25) return;
  const c = A.ctx, l = c.createOscillator(), lg = c.createGain();
  l.frequency.value = rate; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(cents * 30, t + Math.min(0.35, dur * 0.6));
  l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.3);
}

// ドラム
export function drumHit(A, kind, t, v, dest) {
  const c = A.ctx;
  const noise = (dur, g0, type, fq, q = 1) => {
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = A.noise; f.type = type; f.frequency.value = fq; f.Q.value = q;
    g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  };
  const tone = (f0, f1, dur, g0, type = 'sine') => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
    g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  };
  switch (kind) {
    case 'k': tone(160, 42, 0.22, 1.0 * v); noise(0.02, 0.25 * v, 'highpass', 3000); break;
    case 's': noise(0.16, 0.55 * v, 'bandpass', 1900, 0.7); tone(220, 160, 0.08, 0.35 * v, 'triangle'); break;
    case 'h': noise(0.04, 0.22 * v, 'highpass', 8000); break;
    case 'o': noise(0.28, 0.2 * v, 'highpass', 7000); break;
    case 'c': for (const d of [0, 0.012, 0.024]) { const tt = t + d; const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = A.noise; f.type = 'bandpass'; f.frequency.value = 1400; g.gain.setValueAtTime(0.4 * v, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.09); s.connect(f); f.connect(g); g.connect(dest); s.start(tt, Math.random() * 0.5); s.stop(tt + 0.1); } break;
    case 'r': tone(900, 700, 0.04, 0.3 * v, 'triangle'); noise(0.03, 0.15 * v, 'bandpass', 3000); break;
    case 't': tone(190, 110, 0.3, 0.7 * v); break;
    case 'm': tone(260, 170, 0.25, 0.6 * v); break;
    case 'z': noise(0.05, 0.1 * v, 'highpass', 5500); break;
    case 'y': noise(1.3, 0.22 * v, 'highpass', 4500); break;
  }
}

// リバーブ用のひびき（ノイズを減衰させた左右べつべつの波形）
export function makeImpulse(c, sec = 1.8) {
  const len = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  return b;
}
