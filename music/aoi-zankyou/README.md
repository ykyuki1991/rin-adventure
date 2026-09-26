# 蒼い残響（あおいざんきょう）

90年代J-ROCK（L'Arc〜en〜Ciel／GLAY の系統）を意識したオリジナル曲。男性キー。

- テンポ：BPM 140（8ビート）
- キー：Aメロ・Bメロは B マイナー、サビは D メジャー（同じ調号・シャープ2つ）
- 音域：F#3（Aメロの低い所）〜 A4（サビ「さがす」「ひかる」の一番高い所）
- 長さ：約3分（104小節）

## ファイル

| ファイル | 中身 |
| --- | --- |
| `out/demo_vocal.mp3` | 仮歌（音声合成）＋バンド。曲の雰囲気確認用 |
| `out/guide_melody.mp3` | 歌メロを楽器で鳴らした版。**メロディを覚えるならこれ** |
| `out/karaoke.mp3` | カラオケ（歌なし）。自分で歌う・録音する用 |
| `out/vocal_only.mp3` | 仮歌だけ |
| `out/aoi-zankyou.mid` | **GarageBand 用 MIDI**（7トラック：歌メロ／リードG／リズムG／クリーンG／ベース／ストリングス／ドラム） |
| `lyrics.md` | 歌詞・コード・メロディの音名 |
| `song.py` | 曲データ（歌詞・メロディ・コード）。ここを書き換えて作り直せる |
| `build.py` | MIDI・伴奏・仮歌を生成するスクリプト |

仮歌は無料の音声合成（mbrola の日本語男性ボイス）で歌わせているので、ロボットっぽい声です。音程とリズムの確認用として使ってください。

## GarageBand（Mac）への取り込み

1. GarageBand で「空のプロジェクト」を作る（最初のトラックは何でもOK）
2. Finder から `aoi-zankyou.mid` を GarageBand のトラック領域にドラッグ＆ドロップ
   - 「テンポ情報を読み込みますか？」と聞かれたら **読み込む**（BPM 140 になります）
   - 7本のソフトウェア音源トラックとして並びます。音色は各トラックのライブラリから好きなものに差し替え（例：Rhythm Guitar → 「Crunchy Rock」系アンプ、Drums → Drummer に置き換えても可）
3. 歌の録音
   - 新規トラック →「マイクまたはライン入力」でオーディオトラックを作って録音
   - 「Vocal Guide (Melody)」トラックは練習用。本番ではミュート（M ボタン）
4. MIDI ではなく音で並べたい場合は、`karaoke.mp3` や `vocal_only.mp3` をドラッグすればオーディオトラックとして入ります（小節線ぴったりに置くには、プロジェクトのテンポを 140 にして先頭に置く）

**iPhone/iPad 版 GarageBand** の場合：MIDI ファイルは「ファイル」アプリ経由で読み込めます（ループブラウザ →「ファイル」→ 他の場所から読み込む）。

## 作り直し方（全部無料）

```sh
pip install mido numpy scipy soundfile
sudo apt install fluidsynth fluid-soundfont-gm mbrola mbrola-jp1 lame   # Linux の場合
python3 build.py
```

キーを変えたいとき・歌詞を変えたいときは `song.py` を編集して再実行。
Mac 上でキーだけ変えるなら、GarageBand の「キー」を変えれば MIDI トラックは自動で移調されます（自分の声に合わせて ±1〜2 で調整してください）。
