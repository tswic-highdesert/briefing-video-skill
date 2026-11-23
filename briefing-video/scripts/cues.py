#!/usr/bin/env python3
"""Print voice cues for planning scenes.

  python3 cues.py <vo_dir>/words.txt                 # every word, one line: "t word"
  python3 cues.py <vo_dir>/words.txt --gaps 0.45     # pauses >= 0.45 s: natural scene cuts (paragraph breaks read as only 0.45-0.75 s)
  python3 cues.py <vo_dir>/words.txt --from 166 --to 194   # one scene's window, compact

Cut each scene ~0.15-0.35 s before the first word of its section, inside a pause.
"""
import argparse
ap = argparse.ArgumentParser()
ap.add_argument('words'); ap.add_argument('--gaps', type=float); ap.add_argument('--from', dest='t0', type=float, default=0)
ap.add_argument('--to', dest='t1', type=float, default=1e9)
a = ap.parse_args()
rows = []
for line in open(a.words):
    p = line.split(None, 4)
    if len(p) == 5: rows.append((float(p[1]), float(p[2]), float(p[3]), p[4].strip()))
if a.gaps:
    for s, e, g, w in rows:
        if g >= a.gaps: print(f'{s - g:8.2f} -> {s:8.2f}  pause {g:.2f}s  next: {w}')
else:
    print('  '.join(f'{s:.2f} {w}' for s, e, g, w in rows if a.t0 <= s <= a.t1))
