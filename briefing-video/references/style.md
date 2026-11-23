# Style: the default editorial theme

The template ships a calm, editorial look: a serif for headlines and numbers, a clean sans for labels, a handwriting face for asides, warm paper grounds, a forest-green dark band and honey-yellow highlights. It reads well on a TV from a couch and keeps data front and centre.

To match a brand instead, change the tokens in `template/common.css`, swap the fonts in `template/assets/fonts/`, replace the marks in `template/assets/brand/` and, optionally, drop in a hero video (see "Rebranding" at the end of this file). Keep the colour *meanings* below even when the hex values change.

## Type

| Role | Family | Local file | CSS name in template |
|---|---|---|---|
| Headlines, big numbers, chart values | Young Serif 400 | `assets/fonts/YoungSerif.woff2` | `"YS"` |
| Body, labels, eyebrows, chips | Instrument Sans 400-700 (variable) | `assets/fonts/InstrumentSans.ttf` | `"IS"` |
| Hand-drawn notes and stamps | Caveat 700 | `assets/fonts/Caveat.woff2` | `"Hand"` |

- All three are Google Fonts under the SIL Open Font License (see `assets/fonts/FONTS.md`).
- Some sites serve Instrument Sans as a latin-ext-only woff2 subset, so basic Latin falls back to another font. The template uses the full variable TTF from github.com/google/fonts.
- Type scale used at 1920x1080:
  - Title: 172 px.
  - Hero facts: 130-160 px.
  - Scene headings: 84-96 px.
  - Card numbers: 96-112 px.
  - Card titles: 44-50 px.
  - Labels: 28-34 px.
  - Eyebrows: IS 600, 28 px, letter-spacing .14em, uppercase, muted.
  - Never go below 28 px.
- Use `font-variant-numeric: lining-nums tabular-nums` (`.num`) on every counting number, so count-ups don't jitter sideways.

## Palette

Defined as CSS variables on `#root` in `template/common.css`:

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#222725` | Text. Headlines can go to `#1C211F` |
| `--paper` | `#F7F7F2` | Main light ground |
| `--paper2` | `#EFEDE3` | Second light ground; base under the mesh |
| `--forest` | `#1F2621` | Dark band ground (the "trap" scene, the reframe banner, the role bar) |
| `--forest2` | `#28392E` | Lighter dark green |
| `--moss` | `#596A51` | Positive hand notes, toggles turned on, outline stamps |
| `--yellow` | `#F0D15A` | Honey yellow: number circles, the key badge, highlights on forest |
| `--marker` | `#C84028` | Red marker ink: rings, underlines, strikes, warning stamps, bad numbers |
| `--sage` | `#B8C79D` | Upside chips ("Zero extra work") |
| `--sky` | `#B9D3E2` | Neutral series, the "before" bar, info chips |
| `--lilac` | `#C9B4CE` | Mesh only |
| `--clay` | `#DDA286` | Warm warning series, the "bad era" bar, failure-row accents |
| `--oat` | `#E9D9A9` | Neutral series; the oat ground used for a private-flag scene |
| `--muted` | `rgba(34,39,37,.66)` | Secondary text |

### Colour meaning (keep it consistent)

- **Warning, leak, risk:** marker red for the ink and clay for fills. Examples: a struck old number, a red "-58%", a "PASSIVE AI TRAP" pill, the falling half of a sparkline.
- **Upside, unlock, the win:** sage, moss and honey yellow. Examples: the real range in yellow on forest, sage "Zero extra work" chips, moss toggles, yellow active number circles.
- **Neutral data:** sky and oat.
- **Noise or "don't lead here":** dim the card to about .45 opacity with a grey rule, then strike it in marker red.

## Grounds

- **Paper** (`--paper`), flat. Used for the hook, the rules and the end card.
- **Mesh** (`.mesh`): pastel radial gradients (sky top-left, lilac top-right, sage bottom-right, clay bottom-left, oat centre) over `#EFEDE3`. White cards floating on it are the main motif. Use it for data scenes.
- **Forest** (`--forest`): the dark band. Text is paper and eyebrows are yellow. Use it for the gut-check or trap scene, and as a rising banner for the big reframe.
- **Oat** (`--oat`): a warm flat ground. It sets a private or sensitive scene apart from everything else.
- Change ground between neighbouring scenes so each cut reads as a new section, and always with a flood (`references/motion.md`).

## The hero

The brief opens on a hero behind the title and closes on it behind the decision card. The template's default hero is `.hero` in `common.css`: a soft painted-sky gradient (sky, lilac, sage, a warm yellow glow) that the dark title reads on, slowly drifted by GSAP so the held frames stay alive. It needs no media file. Its colours come from the palette, so a rebrand changes it too.

To use a hero video instead (a brand reel, a painted landscape, a slow product loop):

1. Put it at `assets/media/hero.mp4`. 1920x1080, 24-30 fps, 8-12 s, no audio needed. Use footage you own or have a licence for.
2. In `src/s1.html` (and the end scene), replace the `.hero` div with:
   `<video id="s1-video" class="clip" src="assets/media/hero.mp4" muted playsinline data-start="0" data-duration="6.6" data-playback-rate="0.5" data-track-index="0"></video>`
3. Play it slow with `data-playback-rate="0.5"` to `0.6`. At 0.5, 10 s of source covers about 20 s.
4. Never animate the `<video>` itself. Keep it inside a wrapper (`.cam`) and move the wrapper.

Either way:

- **Opening:** a paper sheet slides up over the hero (y 1080 to 0, 0.65 s, power3.inOut) while the hero wrapper parallaxes to y -420, like a page scroll.
- **Ending:** a full paper sheet over the hero shrinks by clip-path to a centred 1240x720 card with 32 px rounded corners, revealing the hero around it.

## Card system

- `.card`: background `#FCFCF9`, radius 24 px, shadow `0 34px 70px -34px rgba(34,39,37,.42), 0 2px 8px rgba(34,39,37,.06)`.
- Ticker cards are 396 px wide in a row of four at top 140: a YS number with an IS label underneath, height from content (about 166 px).

### Card padding

Every card-shaped box gets the same breathing room on all four sides. Cramped and lopsided cards were the most common flaw across the first briefs (one shipped a step card with 1 px under a two-line title).

- **Use `.card` for every card**, including dark, yellow and dashed ones: override the background, keep the class. `.card` sets `padding: var(--pad)`.
- **Padding scale:** `--pad` is 40 px by default. Use `.card.sm` (28 px) for cards under about 300 px wide or 160 px tall, and `.card.lg` (48 px) for cards wider than about 1000 px. Set `--pad` itself for an uneven pair (`--pad: 28px 34px`), never a bare `padding` with a smaller number.
- **Top and bottom match.** The last line of text (descenders included) or the lowest bar sits at least `--pad` above the bottom edge, the same as the first line sits below the top.
- **Let content set the height.** Leave out `height` on text cards and lay the content out in flow with `.stack` (flex column, `--gap` 14 px). When cards in a row must match, give them one height and either centre the content (`.stack.mid`) or pin the last item to the bottom padding with `.end`.
- **Don't place text by fixed `top` offsets inside a fixed-height card.** That is how a title that wraps to two lines lands on the bottom edge. If a child must be absolute (a chart bar, a check mark), offset it from the card's padding (a single length; `var(--pad)` only works there when `--pad` is one value), and add the heights up for the longest label first.
- Badges that hang over a corner on purpose carry `data-pad-ignore`. So do overlays that are not content (a sweep), and empty placeholder cards (a dashed "Underway" slot with only a chip). The lint already skips a plain fill layer that covers the whole card (a glow, a "lit" overlay).
- Check padding with the lint before every render: `python3 build.py --padcheck`, snapshot the settled moments, and look for magenta outlines (see SKILL.md step 7).
- Metric cards are 830x320-330 in a 2x2 grid, left 110-120 and 980, top 270 and 630-640. Each has an 8 px coloured rule on the left edge: clay for leaks, grey for noise.
- Chart cards are about 1040x620, with the title in YS 44 px.
- Numbered steps use 62-68 px circles. Yellow means active; `rgba(34,39,37,.1)` means done or inactive. The number is in YS.
- Chips and pills are radius 100 px, IS 600, 28-30 px, in sage, sky or oat fills.
- Abstract phone: 420x780, radius 56, `#2B332E` with a faint border, a notch pill, chat bubbles at `rgba(247,247,242,.12)` and an input pill. Never mock a real product's UI.
- Agenda rows have 56 px empty checkboxes with a 4 px ink border and 12 px radius.

## Hand-drawn layer (Caveat and marker ink)

This layer gives the brief its voice. Use it for asides, not as captions.

- Caveat notes are 44-72 px, in marker red by default and moss for positive or neutral notes. Rotate each one -2 to -5 degrees **in CSS** (safe, because only `clip-path` is tweened on them). Reveal left to right with `reveal()`.
- Marker shapes are SVG paths with `pathLength="1"`, `stroke-dasharray="1 2"` and `stroke-dashoffset="1"`, drawn with `draw()`. Examples: underlines under a title or key number, strike-throughs across a dead number, rings (an ellipse rotated a few degrees) around the thing to distrust, and arrows.
- Stamps:
  - Outline: a 4-5 px marker or moss border, radius 14, a Caveat or IS 800 caps label, popped in at a -4 degree tilt (rotation goes in the tween). Examples: "callbacks die here", "DON'T PUT ON A SLIDE UNVETTED".
  - Filled: a marker pill with paper text, such as "THE PASSIVE AI TRAP".

## Brand

`assets/brand/brand-mark-dark.svg` (for light grounds) and `brand-mark-light.svg` (for dark grounds) are generic placeholders at 418x90. Replace them with your own logo lockup at the same aspect ratio, or adjust the `<img>` size where they are used. In a brief, show the mark only as a small bug on the end card, about 40 px tall. Use no sales CTA in an internal brief.

## Rebranding

1. **Capture the brand site** (optional, needs Node and Playwright):

   ```bash
   mkdir -p ref && cd ref
   node $SK/scripts/shoot.mjs https://example.com live   # screenshots + computed fonts, colours, videos, h1-h3 specs
   node $SK/scripts/fonts.mjs https://example.com        # loaded font faces + font/video/lottie URLs
   ```

   - `shoot.mjs` scrolls in 900 px steps and waits 1.2 s per step, so scroll-triggered animations land.
   - Tile the shots into a contact sheet to look at them: `ffmpeg -pattern_type glob -i 'live/s*.png' -vf scale=480:-1,tile=4x3 live-sheet.jpg`.
   - If Playwright is not resolvable from the current dir, set `PLAYWRIGHT_MJS` to its `index.mjs`. Set `CHROMIUM` to use a system browser.

2. **Map the brand onto the tokens.** Edit the variables on `#root` in `common.css`. Map the brand's colours to roles (ink, light grounds, dark band, highlight, warning, upside, neutral) rather than copying hex values in order.
3. **Swap fonts.** Drop the files into `assets/fonts/` and update the three `@font-face` rules in `common.css`. Keep the CSS names (`"YS"`, `"IS"`, `"Hand"`) so scene files keep working. Use fonts you are licensed to embed.
4. **Swap marks and the hero** as described above.
5. Render one scene and look at it before building the rest.
