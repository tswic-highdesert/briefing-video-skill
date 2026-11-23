#!/usr/bin/env bash
# Run in the project dir (on whatever machine rendered) after a render. Writes <render dir>/qa/: a frame strip around every cut,
# a contact sheet, loudness and a voice-sync spot check.
# Usage: qa.sh <project dir> <render.mp4> "<cut times, space separated>" "<contact sheet times>"
#   e.g. qa.sh ~/videos/q4-brief renders/q4-brief-v1.mp4 "9.95 20 55.9" "8 19 30 38 50"
set -euo pipefail
P="${1:?project}"; MP4="${2:?mp4}"; CUTS="${3:?cut times}"; SHEET="${4:?sheet times}"
cd "$P"; Q="$(dirname "$MP4")/qa"; rm -rf "$Q"; mkdir -p "$Q"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$MP4"
echo "--- loudness (target -14 to -16 LUFS integrated, true peak <= -1 dBTP)"
ffmpeg -nostats -i "$MP4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" 
echo "--- sync spot check: first long silence end should match in voice and render"
for f in assets/audio/voice.wav "$MP4"; do
  printf '%s: ' "$f"; ffmpeg -nostats -i "$f" -af silencedetect=n=-40dB:d=0.5 -f null - 2>&1 | grep -oE "silence_end: [0-9.]+" | head -3 | tr '\n' ' '; echo
done
n=0
for c in $CUTS; do
  n=$((n+1)); row=$(printf %02d $n)
  for k in -3 -2 -1 0 1 2 3; do
    t=$(python3 -c "print(max(0,round($c+$k/30,3)))")
    ffmpeg -v error -ss "$t" -i "$MP4" -frames:v 1 -vf scale=320:-1 "$Q/cut${row}_$((k+3)).png"
  done
done
ffmpeg -v error -y -pattern_type glob -i "$Q/cut*.png" -vf "tile=7x$n" -frames:v 1 "$Q/cuts.jpg"
i=0
for t in $SHEET; do
  ffmpeg -v error -ss "$t" -i "$MP4" -frames:v 1 -vf "scale=480:-1,drawtext=text='${t} s':x=10:y=10:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6" "$Q/cs_$(printf %02d $i).png"
  i=$((i+1))
done
rows=$(( (i + 3) / 4 ))
ffmpeg -v error -y -i "$Q/cs_%02d.png" -vf "tile=4x${rows}:padding=6:color=0x222725" -frames:v 1 -q:v 3 "$Q/contact.jpg"
echo "wrote $Q/cuts.jpg (one row per cut, 7 frames: -3..+3) and $Q/contact.jpg"
