#!/bin/sh
# Mac 用：このファイルと同じフォルダに aoi-zankyou.mid と demo_vocal.mp3 を置いてダブルクリック。
# ・GarageBand で MIDI を開く（7トラックのプロジェクトができる）
# ・ミュージック.app に仮歌デモを追加して再生する
cd "$(dirname "$0")"
[ -f out/aoi-zankyou.mid ] && cd out
open -a GarageBand aoi-zankyou.mid
open -a Music demo_vocal.mp3
