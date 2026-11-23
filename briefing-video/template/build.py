#!/usr/bin/env python3
"""Expand src/*.html into compositions/*.html.

- {{W:some words}}  -> each word wrapped in <span class="w"> (for words() reveals).
                       Put quote marks INSIDE the braces, or they float before the words appear.
- /*COMMON_CSS*/    -> contents of common.css
- //COMMON_JS       -> contents of common.js (timeline + helpers)

`python3 build.py --padcheck` also appends padcheck.js, which outlines cards with poor padding in
magenta. Snapshot that build to review padding, then rebuild without the flag before rendering.
"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent
css = (root / 'common.css').read_text()
js = (root / 'common.js').read_text()
if '--padcheck' in sys.argv:
    js += '\n' + (root / 'padcheck.js').read_text()
out = root / 'compositions'; out.mkdir(exist_ok=True)

def W(text):
    return ' '.join(f'<span class="w">{w}</span>' for w in text.split(' '))

for src in sorted((root / 'src').glob('*.html')):
    s = src.read_text()
    s = re.sub(r'\{\{W:(.*?)\}\}', lambda m: W(m.group(1)), s)
    s = s.replace('/*COMMON_CSS*/', css).replace('//COMMON_JS', js)
    (out / src.name).write_text(s)
    print('built', src.name)
