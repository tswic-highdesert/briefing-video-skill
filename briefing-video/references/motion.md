# Motion: the moves that make a brief work

Everything runs on one paused GSAP timeline per scene, and every cue is pinned to a word in the voice. The motion stays calm and site-like: expo and power eases, small rises, blur-to-sharp word reveals. Nothing bounces except pops.

## Project structure (the template)

```
src/sN.html        scene source: <template> with styles, markup and an IIFE script
common.css         fonts, tokens, .card/.mesh/.eyebrow/.hand/... (pasted in for /*COMMON_CSS*/)
common.js          timeline + helpers (pasted in for //COMMON_JS)
build.py           src/ -> compositions/, expands {{W:...}}; --padcheck adds the padding lint
padcheck.js        card padding lint (QA builds only)
index.html         root: one host per scene, the voice <audio>, SFX <audio>s
```

### Scene contract

These rules follow HyperFrames and were all hit at least once.

- The scene file wraps everything (styles, markup, scripts) in `<template>`. `#root` carries `data-composition-id="sN"`, `data-width`, `data-height` and `data-duration`.
- **The host in index.html also needs `data-composition-id="sN"`** next to `id="sN"`, `class="clip"`, `data-composition-src`, `data-start`, `data-duration`, `data-track-index` and `data-track-kind="graphics"`. Without it, check fails with "Composition host ... is missing `data-composition-id`".
- Give each host a z-index that rises with scene order, so the later scene paints on top at the seam.
- The script is `(function(){ const START = <host data-start>; //COMMON_JS ... window.__timelines["sN"] = tl; })();`, with `<script src="assets/vendor/gsap.min.js">` inside the template.
- All asset paths are root-relative (`assets/...`), even inside scene files.
- The root has `data-motion-blur="on"` and `data-duration` = voice length + about 3.5 s hold.
- Use `fromTo`, not `from`, so seeking to any frame is deterministic.
- **Never put a CSS `transform` on an element GSAP transforms.** Put a static tilt into the tween instead (`pop(sel, at, -5)` keeps `rotation: -5` at both ends). CSS rotate is fine on elements where only opacity or clip-path is tweened, such as Caveat notes.
- Never tween `visibility` or `display` on a `.clip`. Never animate a `<video>`; animate a wrapper.
- Write every timed element in the HTML with a stable id; don't create them from script.

## Timing from the voice

- Helpers take **absolute voice seconds**. `T(t) = t - START` converts to scene time, so cue numbers come straight from `cues.py`.
- Land a reveal on the word, or 0.05-0.2 s before it. A number that counts up should **start** as the voice starts saying it and finish within the word or just after.
- Exit a scene's content 0.3-0.35 s before the next scene's `data-start` (`exitAll` is 0.3 s). The next scene's flood then begins on a clean ground.
- Scene boundaries go inside paragraph pauses. ElevenLabs alignment shows paragraph pauses as only 0.45-0.75 s, so search with `--gaps 0.45`.

## Helpers (`template/common.js`)

| Helper | Does | Typical |
|---|---|---|
| `count(sel, from, to, at, dur, fmt)` | Numeric count-up writing `textContent` | `count("#n1", 0, 1240, 22.45, 1.6, fmtInt)`; decimals with `v => v.toFixed(1)` |
| `words(sel, at, stagger)` | Word-by-word reveal of `{{W:...}}` spans: opacity 0 to 1, blur 8 px to 0, 0.28 s each | Headings 0.1-0.12 stagger, quotes 0.09 |
| `rise(sel, at, {y, s, d, ease, stagger})` | Opacity and y rise, expo.out 0.7 s | Cards `{y: 40-60, d: 0.8}`, rows `{y: 14-24}` |
| `pop(sel, at, rot)` | Scale .6 to 1 with back.out(1.7), optional fixed rotation | Badges, chips, stamps, sparkline points |
| `draw(sel, at, dur)` | SVG stroke draw (dashoffset 1 to 0), power2.inOut | Underlines .45-.55 s, rings .5 s, arrows .4 s |
| `reveal(sel, at, dur)` | Left-to-right clip-path wipe | Caveat notes .6-.9 s |
| `flood(sel, dur)` | Fades the previous scene's ground layer out at scene start | Every scene but the first |
| `exitAll(sel, at)` | Opacity 0 + blur 10 px, 0.3 s power2.in | The scene's `#sN-all` container |
| `drift(sel, dur)` | Scale 1 to 1.03 linear over the whole scene | Every `#sN-all`; stops "dead stretch" warnings and keeps held frames alive |

`common.css` makes every `div[id$="-all"]` `position:absolute; inset:0; transform-origin:50% 50%`. Without that, the container has zero height and drift scales around its top edge.

## The moves

### Count-ups

- Ticker cards: rise the card, then 0.15-0.2 s later count from 0 over 1.6-2.6 s, with bigger numbers taking longer. Use `fmtInt` for thousands separators.
- Before/after pair: show the old value, slide in an arrow and the new value, then count from old to new (1.18 to 1.42 in 0.8 s), then pop the delta badge in yellow ("+20%").
- Percentages: count the number inside a span and keep the "%" or the minus sign static outside it.

### Bar charts

- Bars are absolutely positioned divs with `transform-origin: 50% 100%`, tweened `scaleY` 0 to 1 with expo.out over 0.8-0.9 s. Each bar is cued on its spoken number, and its value label counts up at the same moment.
- Height is proportional to the value (for example, 23/55/34 drew at 134/320/198 px).
- "Still filling in" can be shown as a dashed ghost cap on top of the last bar, with a moss Caveat note.
- Mini bars inside a metric card work the same way: three 78 px bars, with the worst in marker red.

### Sparklines

- Use an SVG with one `<path>` per segment, so each segment draws on its own spoken value. Each point is a `<g>` (dot plus value label) popped on its word.
- Draw the flat or good part in ink and the falling part in marker red. Fade in a light clay area under the line after the last point.
- Label a partial period honestly on the axis ("Nov 1-17").

### Ground-continuity flood transitions

This is the main cut technique and the reason there were no flicker frames.

- Each scene starts by showing the **previous scene's ground** full-frame, then floods to its own.
- The base layer is the new ground. On top of it sits a `#sN-prev` layer painted like the old ground, and `flood("#sN-prev", 0.55-0.6)` fades it out at scene time 0.02.
- If the previous ground was the mesh, make `#sN-prev` carry `class="fill mesh"`. Do **not** also give it an id rule with `background:`, because that overrides the mesh gradient.
- Going from paper into the mesh: fade the mesh layer *in* over the paper base instead.
- Pair the cut with a whoosh-short SFX starting 0.12 s before the cut.

### Camera zoom across cards (the loop scene)

- Wrap the scene content in a `.cam` div and tween its `scale`, `x` and `y`. To centre a card whose centre is at (cx, cy) at scale s, use `x = (960 - cx) * s` and `y = (540 - cy) * s`.
- At 1.3x, push to card 1 on its cue, pan (`x` only) to card 2 and card 3 on theirs, then pull back to scale 1 for the wide shot that shows the loop closing (arrows into a "library / history" strip).
- **Fade the scene heading and eyebrow out when the zoom starts and back in on the pull-back.** Otherwise they sit half cut off at the top edge of every zoomed frame.
- Draw the connecting arrow just before each pan, so the eye follows it.

### Entrances and exits

- Cards rise 40-60 px over 0.8 s with expo.out. Rows rise 14-24 px. Eyebrows fade in over 0.5 s.
- Notes wipe in (`reveal`), stamps pop with a tilt, and rings and underlines draw.
- Dimming something already on screen: tween opacity to .35-.45, then draw a marker ring or strike on it.
- Recede for a reframe: the grid goes to scale .92, y -30, opacity .18 and blur 6 px while a forest banner rises from below the frame. The banner must start fully off-frame; see gotchas.
- Struck-then-replaced numbers: show the old number ("$39 saved"), draw a strike, then count up the replacement in yellow YS 130 px.
- Toggles: fade the "on" fill in and slide the knob x 34 px with power3.out.
- Number circles: put a yellow layer inside each gray circle and fade it in when that step becomes active, and out when the next one does.

### End card

- At the start of the last scene, clip-path the paper sheet from `inset(0)` to `inset(180px 340px round 32px)` over 0.9 s with power3.inOut, revealing the hero (a hero video plays at rate 0.6).
- Then: eyebrow, heading words, checkbox rows on their words, a Caveat sign-off, and the brand mark fading in. Hold about 3.5 s past the last word.

## SFX

Use the bundled Pixabay set in `template/assets/sfx/` (licence in `CREDITS.md`; the Pixabay Content License allows commercial use with no attribution required).

| Sound | When | Gain (`data-volume`) |
|---|---|---|
| `whoosh-short.mp3` (0.57 s) | Every scene cut and the opening scroll, starting 0.12 s before the cut | 0.16 |
| `click-soft.mp3` (0.37 s) | A stamp or badge landing (the trap badge, the "unvetted" stamp) | 0.22 |
| `pop.mp3` (0.72 s) | The single most important number badge | 0.16 |

- Every `<audio>` needs an `id`, `class="clip"`, `data-start`, `data-duration` and `data-track-index`, or it is left out of the mix.
- Use no more than about a dozen SFX in a 4-minute brief. Never stack two at once. No booms or impacts.
- With the voice normalized to -16 LUFS and these gains, a HyperFrames delivery render comes out at -14.0 LUFS integrated and -1.0 dBTP. No extra mastering pass is needed.
