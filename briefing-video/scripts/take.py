#!/usr/bin/env python3
"""One-request ElevenLabs narration take with character alignment.

Usage:
  export ELEVENLABS_API_KEY=...   # or inject it with your secrets manager (op run, doppler run, ...)
  export ELEVENLABS_VOICE_ID=...  # the voice to narrate with
  python3 take.py <vo_dir> [--voice ID] [--model eleven_v4] [--stability 0.5] [--similarity 0.8] [--force]

Reads <vo_dir>/script.txt. Writes voice.mp3, alignment.json, voice.wav (loudnorm I=-16 TP=-1.5,
48 kHz mono), voice.json (meta + word timings) and words.txt (idx start end gap word).
Caches on a hash of text+model+settings+voice: an unchanged script never re-bills.
The key is read from ELEVENLABS_API_KEY and is never printed or written anywhere.
Defaults: --voice from ELEVENLABS_VOICE_ID, --model from ELEVENLABS_MODEL_ID (else eleven_v4).
"""
import argparse, base64, hashlib, json, os, subprocess, sys, urllib.error, urllib.request
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('vo_dir')
ap.add_argument('--voice', default=os.environ.get('ELEVENLABS_VOICE_ID'), help='ElevenLabs voice id (default: $ELEVENLABS_VOICE_ID)')
ap.add_argument('--model', default=os.environ.get('ELEVENLABS_MODEL_ID', 'eleven_v4'))
ap.add_argument('--stability', type=float, default=0.5)
ap.add_argument('--similarity', type=float, default=0.8)
ap.add_argument('--force', action='store_true', help='ignore the cache and bill a new take')
a = ap.parse_args()
if not a.voice:
    raise SystemExit('no voice: set ELEVENLABS_VOICE_ID or pass --voice')

d = Path(a.vo_dir)
text = (d / 'script.txt').read_text().strip()
settings = {'stability': a.stability, 'similarity_boost': a.similarity}
h = hashlib.sha256(json.dumps([text, a.model, settings, a.voice]).encode()).hexdigest()
meta_path = d / 'voice.json'
if not a.force and meta_path.exists() and json.loads(meta_path.read_text()).get('input_sha256') == h:
    print('cached take, nothing sent'); sys.exit(0)

key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    raise SystemExit('ELEVENLABS_API_KEY missing from the environment')

body = {'text': text, 'model_id': a.model, 'voice_settings': settings}
url = f'https://api.elevenlabs.io/v1/text-to-speech/{a.voice}/with-timestamps?output_format=mp3_44100_128'
req = urllib.request.Request(url, json.dumps(body).encode(), {'xi-api-key': key, 'Content-Type': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=600)
except urllib.error.HTTPError as e:
    raise SystemExit(f'ElevenLabs {e.code}: {e.read()[:400]!r}')
billed = resp.headers.get('character-cost')
data = json.loads(resp.read())
(d / 'voice.mp3').write_bytes(base64.b64decode(data['audio_base64']))
(d / 'alignment.json').write_text(json.dumps(data.get('alignment')))

# characters -> words (split on whitespace)
words, cur = [], None
al = data['alignment']
for ch, t0, t1 in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
    if ch.isspace():
        cur = None; continue
    if cur is None:
        cur = {'text': '', 'start': round(t0, 3), 'end': round(t1, 3)}; words.append(cur)
    cur['text'] += ch; cur['end'] = round(t1, 3)

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(d / 'voice.mp3'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                '-ar', '48000', '-ac', '1', str(d / 'voice.wav')], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                     '-of', 'default=nw=1:nk=1', str(d / 'voice.wav')], text=True))
meta_path.write_text(json.dumps({'input_sha256': h, 'engine': 'ElevenLabs ' + a.model, 'voice': a.voice,
    'voice_settings': settings, 'characters_billed': int(billed) if billed and billed.isdigit() else None,
    'text_chars': len(text), 'duration': dur, 'words': words}, indent=1))

with open(d / 'words.txt', 'w') as f:
    prev = 0.0
    for i, w in enumerate(words):
        f.write(f"{i:4d} {w['start']:8.2f} {w['end']:8.2f} {w['start'] - prev:5.2f} {w['text']}\n")
        prev = w['end']
print('take', round(dur, 2), 's; billed', billed, 'chars; text', len(text), 'chars;', len(words), 'words')
