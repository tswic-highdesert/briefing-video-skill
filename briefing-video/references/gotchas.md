# Gotchas: what cost time on real builds

Each entry gives the symptom, the cause and the fix. Check new scenes against this list before the first render.

## Visual bugs caught in review

1. **Banner peeking in early.**
   - Symptom: a forest banner was visible along the bottom edge for the whole scene before its cue.
   - Cause: it was tweened `fromTo({y: 700})` from `top: 250px`, which parks it at 950 px, still inside a 1080 frame.
   - Fix: start any rise-from-below element at `top + y > 1080` (y 900 there). Check the scene's first frame, not only its cue.

2. **Floating quote marks.**
   - Symptom: the curly quotes showed on screen, hanging in space, before the quote's words faded in.
   - Cause: they were written outside the `{{W:...}}` braces, so they were not part of a word span.
   - Fix: put the quote marks inside the braces: `{{W:“Oh, we’d go backwards.”}}`.

3. **Stray dots from SVG round caps.**
   - Symptom: a hidden marker path still painted a dot at its end.
   - Cause: `stroke-dasharray="1"` with `stroke-dashoffset="1"` on `pathLength="1"` leaves a zero-length dash, and `stroke-linecap="round"` paints it.
   - Fix: use `stroke-dasharray="1 2"`, so the gap is longer than the path. `draw()` still goes from offset 1 to 0. Lint flags this as `svg_round_cap_hidden_dash`.

4. **Label wrap and overflow.**
   - A two-word bar label wrapped to two lines. `white-space: nowrap` alone is not enough: a centred, overflowing nowrap line spills to the right. Make the label box wider and shift its `left` so the text fits.
   - A "1.18 -> 1.42" pair at 110 px overflowed its 600 px card once the drift scale was added. Drop to 96 px and a 16 px gap.
   - A "$65-85K" range at 72 px wrapped in a 296 px column. Use 60 px and nowrap.
   - Size text for the box *including* the 1.03 drift.

5. **Note overlapping text.**
   - A Caveat "still filling in" note sat on a bar's value label. Check found it as `content_overlap` (an error).
   - A "real, but small. don't lead here" note sat on its card's title.
   - Give every hand note its own empty zone, usually top-right of the card or above the value, and make it 2 short lines at about 300 px wide.

6. **Heading cut off during zoom.** When the camera pushed to 1.3x on a card, the scene heading sat half out of frame at the top. Fade the eyebrow and heading out as the push starts, and back in on the pull-back.

7. **Role bar wrap.**
   - Symptom: two side-by-side 370 px segments ("Name / data · scoreboard · build") wrapped their text.
   - Fix: stack the segments as two full-width rows, each with a fixed 160 px name column (`flex: none`) and the duties inline.

8. **Card content overflowing card height.** A card's height must hold its number circle, a 2-line title, a 2-line sub and the rows, *plus* a pill or stamp pinned at the bottom. Add the heights up before writing the CSS. Shorten subs to one line ("Before leaving the site") rather than shrinking type below 28 px.

9. **A Caveat note's position inside a zoomed card.** It reads fine at 1.3x and becomes tiny in the wide shot. Make anything that must read in the wide shot at least 28 px *at scale 1*.

10. **Cramped or lopsided card padding.**
   - Symptom: a two-line step title sat 1 px above the bottom edge of its card, small tiles had 14-22 px around their bars, and a yellow card had 27 px under its label but 44 px above.
   - Cause: hand-rolled card classes with a fixed `height`, a padding chosen per scene (20-36 px), and text placed by fixed `top` offsets, so the padding did nothing and a wrapped line ran into the edge.
   - Fix: follow "Card padding" in `style.md`: `.card` with the `--pad` scale, content-driven height with `.stack`, and the `--padcheck` lint before render. The lint flagged every one of these cards and nothing on the cards that looked right.
