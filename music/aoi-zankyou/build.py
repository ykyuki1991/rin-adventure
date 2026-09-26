"""song.py から MIDI・伴奏・仮歌を生成する。

必要なもの（すべて無料）:
  pip install mido numpy scipy soundfile
  apt install fluidsynth fluid-soundfont-gm mbrola mbrola-jp1 lame
出力は out/ 以下。
"""
import math
import os
import random
import subprocess

import mido
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve, resample_poly

import song

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
TMP = os.path.join(OUT, "tmp")
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
MBROLA_VOICE = "/usr/share/mbrola/jp1/jp1"
SR = 44100
TPB = 480                 # ticks per quarter
E = TPB // 2              # 8分音符の tick 数
BAR = 8 * E
SEC_PER_8TH = 60 / song.BPM / 2

random.seed(7)

# ================================================================ コード
ROOTS = song.NOTE


def parse_chord(name):
    """'F#m' -> (root_pc, minor, bass_pc)"""
    body, _, bass = name.partition("/")
    minor = body.endswith("m")
    root = body[:-1] if minor else body
    rpc = ROOTS[root]
    return rpc, minor, ROOTS[bass] if bass else rpc


def in_range(pc, lo):
    """pc を lo 以上の最低の音に"""
    n = lo + (pc - lo) % 12
    return n


def triad(name):
    r, minor, _ = parse_chord(name)
    return [r, (r + (3 if minor else 4)) % 12, (r + 7) % 12]


# ================================================================ MIDI 組み立て
class Track:
    def __init__(self, name, program, channel):
        self.name, self.program, self.channel = name, program, channel
        self.notes = []   # (start_tick, dur_tick, note, vel)

    def add(self, start, dur, note, vel):
        vel = max(1, min(127, int(vel + random.randint(-6, 6))))
        self.notes.append((int(start), max(1, int(dur)), int(note), vel))

    def to_midi_track(self):
        t = mido.MidiTrack()
        t.append(mido.MetaMessage("track_name", name=self.name, time=0))
        if self.channel != 9:
            t.append(mido.Message("program_change", program=self.program,
                                  channel=self.channel, time=0))
        ev = []
        for s, d, n, v in self.notes:
            ev.append((s, 1, n, v))
            ev.append((s + d, 0, n, 0))
        ev.sort(key=lambda x: (x[0], x[1]))
        now = 0
        for tick, on, n, v in ev:
            t.append(mido.Message("note_on" if on else "note_off", note=n,
                                  velocity=v if on else 0,
                                  channel=self.channel, time=tick - now))
            now = tick
        return t


def build_tracks():
    vocal = Track("Vocal Guide (Melody)", 54, 0)
    lead = Track("Lead Guitar", 29, 1)
    rhythm = Track("Rhythm Guitar", 30, 2)
    clean = Track("Clean Guitar", 27, 3)
    bass = Track("Bass", 34, 4)
    strings = Track("Strings", 48, 5)
    drums = Track("Drums", 0, 9)

    # --- メロディ
    t = 0
    for mora, p, d in song.MELODY:
        if p != "r":
            vocal.add(t, d * E * 0.95, song.midi(p), 96)
        t += d * E

    # --- セクションごとの伴奏
    bar_i = 0
    sections = []
    for sec, chords in song.FORM:
        sections.append((sec, bar_i, len(chords)))
        for j, ch in enumerate(chords):
            start = (bar_i + j) * BAR
            last_of_sec = j == len(chords) - 1
            accompany(sec, j, ch, start, last_of_sec, len(chords),
                      rhythm, clean, bass, strings, drums)
        bar_i += len(chords)

    # --- リードギター（イントロ・間奏・ソロ）
    def play_line(line, start, vel=100):
        t = start
        for p, d in line:
            if p != "r":
                lead.add(t, d * E * 0.95, song.midi(p), vel)
            t += d * E

    for sec, b0, n in sections:
        if sec == "Intro":
            play_line(song.INTRO_RIFF, b0 * BAR)
        elif sec == "Interlude":
            play_line(song.INTRO_RIFF[:18], b0 * BAR, 95)   # 前半4小節
        elif sec == "Solo":
            play_line(song.SOLO_LINE, b0 * BAR, 108)
        elif sec == "Outro":
            play_line([("F#5", 8), ("E5", 8), ("D5", 16)], b0 * BAR, 95)

    return [vocal, lead, rhythm, clean, bass, strings, drums], sections


def accompany(sec, j, ch, start, last, n, rhythm, clean, bass, strings, drums):
    rpc, minor, bpc = parse_chord(ch)
    kind = ''.join(c for c in sec if not c.isdigit())   # Chorus1 -> Chorus
    final = sec == "Outro" and j >= 2

    # ---- ベース：8分ルート
    bnote = in_range(bpc, 35)            # B1..A#2
    if final:
        if j == 2:
            bass.add(start, BAR * 2, bnote, 105)
    else:
        for k in range(8):
            vel = 100 if k % 2 == 0 else 88
            note = bnote
            if kind == "Chorus" and k == 7:
                note = bnote + 12           # 最後の裏でオクターブ
            bass.add(start + k * E, E * 0.85, note, vel if kind != "A" else vel - 12)

    # ---- リズムギター：パワーコード
    root = in_range(rpc, 40)                 # E2..D#3
    power = [root, root + 7, root + 12]
    if final:
        if j == 2:
            for nn in power:
                rhythm.add(start, BAR * 2, nn, 110)
    elif kind == "A":                      # Aメロはブリッジミュート
        for k in range(8):
            for nn in power[:2]:
                rhythm.add(start + k * E, E * 0.35, nn, 70 if k % 2 else 82)
    else:
        for k in range(8):
            for nn in power:
                rhythm.add(start + k * E, E * 0.9, nn, 100 if k % 2 == 0 else 90)

    # ---- クリーンギター：アルペジオ（Aメロ・Bメロ・間奏）
    if kind in ("A", "B", "Interlude"):
        tri = triad(ch)
        r = in_range(tri[0], 52)
        voicing = [r, in_range(tri[2], r), in_range(tri[0], r + 1),
                   in_range((tri[0] + 2) % 12, r + 12), in_range(tri[1], r + 12)]
        voicing.sort()
        pat = [0, 1, 2, 3, 4, 3, 2, 1]
        for k, idx in enumerate(pat):
            clean.add(start + k * E, E * 1.8, voicing[idx], 72)

    # ---- ストリングス：サビ・ソロ・アウトロ
    if kind in ("Chorus", "Solo", "Outro"):
        tri = triad(ch)
        notes = sorted(in_range(pc, 57) for pc in tri)
        dur = BAR * 2 if final else BAR
        if not final or j == 2:
            for nn in notes + [notes[0] + 12]:
                strings.add(start, dur * 0.98, nn, 62 if kind != "Outro" else 70)

    # ---- ドラム
    KICK, SNARE, HH, OHH, CRASH, RIDE = 36, 38, 42, 46, 49, 51
    TOMS = [50, 48, 47, 45, 43, 41]
    if final:
        if j == 2:
            drums.add(start, E, KICK, 120)
            drums.add(start, E, CRASH, 120)
            drums.add(start, E, 57, 110)
        return
    first = j == 0
    if first or (kind in ("Chorus", "Solo") and j % 4 == 0) or (kind == "Intro" and j == 4):
        drums.add(start, E, CRASH, 112)
    cym = RIDE if kind == "Solo" else (OHH if kind == "Chorus" else HH)
    for k in range(8):
        if first and k == 0:
            continue
        drums.add(start + k * E, E / 2, cym, (85 if k % 2 == 0 else 65) - (10 if kind == "A" else 0))
    kicks = {"A": [0, 4, 5], "B": [0, 3, 4, 7], "Chorus": [0, 3, 4, 6]}.get(kind, [0, 3, 4])
    for k in kicks:
        drums.add(start + k * E, E / 2, KICK, 110)
    fill = last and sec != "Outro"
    for k in (2, 6):
        if fill and k == 6:
            continue
        drums.add(start + k * E, E / 2, SNARE, 112 - (12 if kind == "A" else 0))
    if kind == "B" and j == n - 1:              # Bメロ最後：スネア連打で盛り上げ
        for k in range(8):
            drums.add(start + k * E, E / 2, SNARE, 70 + k * 6)
    elif fill:                                   # フィル（3拍目裏から16分でタム回し）
        for k in range(8):
            drums.add(start + 4 * E + k * E // 2, E / 2, TOMS[k // 2 + (1 if k > 3 else 0)] if k < 7 else TOMS[5], 95 + k * 3)


def write_midi(tracks, path, only=None, exclude=()):
    mf = mido.MidiFile(ticks_per_beat=TPB)
    meta = mido.MidiTrack()
    meta.append(mido.MetaMessage("track_name", name="Aoi Zankyou", time=0))
    meta.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(song.BPM), time=0))
    meta.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
    meta.append(mido.MetaMessage("key_signature", key="Bm", time=0))
    mf.tracks.append(meta)
    for t in tracks:
        if only and t.name not in only:
            continue
        if t.name in exclude:
            continue
        mf.tracks.append(t.to_midi_track())
    mf.save(path)


def render_midi(mid, wav):
    subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.5", "-r", str(SR),
                    "-F", wav, SF2, mid], check=True)
    d, sr = sf.read(wav)
    assert sr == SR
    return d


# ================================================================ 仮歌（mbrola）
CONS = {"k": "k", "g": "g", "s": "s", "z": "z", "t": "t", "d": "d", "n": "n",
        "h": "h", "b": "b", "p": "p", "m": "m", "j": "j", "r": "rr", "w": "w"}
KANA = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o", "を": "o",
    "か": "k a", "き": "k i", "く": "k u", "け": "k e", "こ": "k o",
    "が": "g a", "ぎ": "g i", "ぐ": "g u", "げ": "g e", "ご": "g o",
    "さ": "s a", "し": "S i", "す": "s u", "せ": "s e", "そ": "s o",
    "ざ": "z a", "じ": "dZ i", "ず": "z u", "ぜ": "z e", "ぞ": "z o",
    "た": "t a", "ち": "tS i", "つ": "ts u", "て": "t e", "と": "t o",
    "だ": "d a", "づ": "z u", "で": "d e", "ど": "d o",
    "な": "n a", "に": "n i", "ぬ": "n u", "ね": "n e", "の": "n o",
    "は": "h a", "ひ": "h i", "ふ": "f u", "へ": "h e", "ほ": "h o",
    "ば": "b a", "び": "b i", "ぶ": "b u", "べ": "b e", "ぼ": "b o",
    "ま": "m a", "み": "m i", "む": "m u", "め": "m e", "も": "m o",
    "や": "j a", "ゆ": "j u", "よ": "j o",
    "ら": "rr a", "り": "rr i", "る": "rr u", "れ": "rr e", "ろ": "rr o",
    "わ": "w a", "ん": "N",
    "きょ": "k j o", "じゃ": "dZ a",
}
# 子音の長さ(ms)。拍の少し前から発音し、母音を拍に合わせる。
CONS_MS = {"k": 70, "g": 55, "s": 95, "S": 100, "z": 70, "dZ": 70, "t": 60,
           "tS": 90, "ts": 90, "d": 45, "n": 55, "h": 75, "f": 85, "b": 45,
           "p": 60, "m": 60, "j": 55, "rr": 35, "w": 55}


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def build_pho():
    """全曲分の .pho。時刻は絶対 ms で計算し、差分で長さを出すのでズレない"""
    notes = []
    t = 0.0
    for mora, p, d in song.MELODY:
        if p != "r":
            notes.append((t * SEC_PER_8TH * 1000, d * SEC_PER_8TH * 1000,
                          song.midi(p), KANA[mora].split()))
        t += d
    total_ms = t * SEC_PER_8TH * 1000

    segs = []   # (phoneme, start_ms, end_ms, pitch_points[(pct, hz)])
    prev_end = 0.0
    prev_pitch = None
    for i, (st, du, n, ph) in enumerate(notes):
        cons, vowel = ph[:-1], ph[-1]
        cons_len = [CONS_MS[c] for c in cons]
        c_total = sum(cons_len)
        # 次の音符の子音ぶん早めに母音を切る
        nxt_start = notes[i + 1][0] if i + 1 < len(notes) else total_ms
        legato = nxt_start - (st + du) < 1
        v_end = st + du
        if i + 1 < len(notes):
            nc = sum(CONS_MS[c] for c in notes[i + 1][3][:-1])
            if legato:
                v_end = st + du - nc
            else:
                v_end = min(st + du * 0.92, nxt_start - nc - 20)
        else:
            v_end = st + du * 0.95
        c_start = st - c_total
        if c_start > prev_end + 1:
            segs.append(("_", prev_end, c_start, []))
        elif c_start < prev_end:     # 前の母音と重なる → 前を縮める
            ph_, s_, e_, pp = segs[-1]
            segs[-1] = (ph_, s_, c_start, pp)
        cur = c_start
        for c, L in zip(cons, cons_len):
            segs.append((c, cur, cur + L, [(50, hz(n))]))
            cur += L
        segs.append((vowel, cur, v_end, pitch_curve(v_end - cur, n, prev_pitch if legato_prev(segs) else None)))
        prev_end = v_end
        prev_pitch = n
    segs.append(("_", prev_end, total_ms + 2000, []))

    lines = []
    for ph, s, e, pp in segs:
        dur = round(e) - round(s)
        if dur <= 0:
            continue
        pts = " ".join(f"{int(p)} {h:.1f}" for p, h in pp)
        lines.append(f"{ph} {dur} {pts}".strip())
    return "\n".join(lines) + "\n"


def legato_prev(segs):
    # 直前が無音でなければ「つながっている」とみなす
    return len(segs) >= 2 and segs[-2][0] != "_"


def pitch_curve(L, n, prev):
    """しゃくり（前の音から滑らかに）＋ 長い音にはビブラート"""
    target = hz(n)
    pts = []
    if prev is not None and prev != n:
        pts.append((0, hz(prev + (n - prev) * 0.4)))
        pts.append((min(99, 60 / max(L, 1) * 100), target))
    else:
        pts.append((0, target * 2 ** (-0.4 / 12)))
        pts.append((min(99, 50 / max(L, 1) * 100), target))
    if L > 450:
        ms = 250
        while ms < L - 30:
            depth = min(1.0, (ms - 250) / 300) * 0.35  # 半音の35%
            val = target * 2 ** (depth * math.sin(2 * math.pi * 5.5 * (ms - 250) / 1000) / 12)
            pts.append((ms / L * 100, val))
            ms += 30
    pts.append((100, target))
    return pts


def render_vocal():
    pho = os.path.join(TMP, "vocal.pho")
    raw = os.path.join(TMP, "vocal_raw.wav")
    with open(pho, "w") as f:
        f.write(build_pho())
    subprocess.run(["mbrola", "-e", MBROLA_VOICE, pho, raw], check=True)
    d, sr = sf.read(raw)
    g = math.gcd(sr, SR)
    d = resample_poly(d, SR // g, sr // g)
    return d


def reverb(x, seconds=1.6, mix=0.22):
    n = int(SR * seconds)
    rng = np.random.default_rng(1)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir[: int(SR * 0.02)] = 0                     # プリディレイ 20ms
    ir /= np.sqrt((ir ** 2).sum())
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix * 1.5


def to_stereo(x):
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def fit(a, n):
    a = to_stereo(a)
    if len(a) < n:
        a = np.vstack([a, np.zeros((n - len(a), 2))])
    return a[:n]


def save(name, x, peak=0.89):
    x = x / (np.abs(x).max() + 1e-9) * peak
    wav = os.path.join(OUT, name + ".wav")
    sf.write(wav, x, SR, subtype="PCM_16")
    return wav


def mp3(wav):
    subprocess.run(["lame", "--quiet", "-V2", wav, wav[:-4] + ".mp3"], check=True)


def main():
    os.makedirs(TMP, exist_ok=True)
    tracks, sections = build_tracks()
    guide = "Vocal Guide (Melody)"

    write_midi(tracks, os.path.join(OUT, "aoi-zankyou.mid"))
    write_midi(tracks, os.path.join(TMP, "band.mid"), exclude=(guide,))
    write_midi(tracks, os.path.join(TMP, "guide.mid"), only=(guide,))

    band = render_midi(os.path.join(TMP, "band.mid"), os.path.join(TMP, "band.wav"))
    guide_audio = render_midi(os.path.join(TMP, "guide.mid"), os.path.join(TMP, "guide.wav"))
    vox = render_vocal()
    vox = vox / (np.abs(vox).max() + 1e-9)
    vox_wet = reverb(vox)

    n = max(len(band), len(vox_wet))
    band = fit(band, n)
    band = band / (np.abs(band).max() + 1e-9)
    guide_audio = fit(guide_audio, n)
    guide_audio = guide_audio / (np.abs(guide_audio).max() + 1e-9)
    v = fit(vox_wet, n)

    outs = {
        "demo_vocal": band * 0.7 + v * 0.95,      # 仮歌入りデモ
        "guide_melody": band * 0.75 + guide_audio * 0.45,  # メロ確認用
        "karaoke": band,                           # 自分で歌う用
        "vocal_only": v,                           # 仮歌だけ
    }
    for name, x in outs.items():
        mp3(save(name, x))

    print("sections:")
    for sec, b0, n_ in sections:
        s = b0 * 8 * SEC_PER_8TH
        print(f"  {sec:10s} bar {b0 + 1:3d}  {int(s // 60)}:{s % 60:05.2f}")


if __name__ == "__main__":
    main()
