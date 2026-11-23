# briefing-video

A [Claude Code](https://docs.claude.com/en/docs/claude-code) skill that turns raw notes, call transcripts and data into a **narrated, animated briefing video**: 1920x1080, a few minutes long, with numbers that count up, bars that draw, sparklines, hand-drawn marker notes, and every beat landing on the word that says it.

You hand Claude the inputs (an analysis doc, a transcript, a CSV export) and ask for "a video brief before Thursday's meeting". The skill walks it through the whole job: write and word-budget the script, record one ElevenLabs narration take with word timings, plan scenes from those timings, build the scenes in [HyperFrames](https://github.com/heygen-com/hyperframes), lint and review frame by frame, render, and run loudness and cut QA.

## Why a narrated brief

Long emails get skimmed and decks get clicked past. A 3-minute narrated brief:

- **Gets watched.** People will play a short video before a meeting when they won't read four pages.
- **Keeps the argument in order.** The voice sets the pace, so the hook, the data, the trap and the decision land in the sequence you meant.
- **Makes the numbers stick.** A figure that counts up while it is said, next to the one chart that proves it, is remembered. A table row is not.
- **Shows what to doubt.** Marker rings, strikes and "don't put this on a slide" stamps carry the nuance a slide loses.
- **Starts the meeting at the decision.** Everyone walks in with the same context, so the meeting spends its time on the choices.

## What you get

- `SKILL.md`: the workflow Claude follows, from source checking to delivery.
- `references/`: the theme (`style.md`), motion patterns and helpers (`motion.md`), voice and the one-take rule (`voice.md`), known bugs (`gotchas.md`), and an anonymized worked example (`example-structure.md`).
- `scripts/`: `take.py` (one-request ElevenLabs take with alignment), `cues.py` (find pauses and per-scene word cues), `qa.sh` (cut strips, contact sheet, loudness, sync check), `shoot.mjs` / `fonts.mjs` (capture a brand site to theme from), `sync.sh` (build, and optionally push to a remote render box).
- `template/`: a ready HyperFrames project with two exemplar scenes, shared CSS and GSAP helpers, a card-padding lint, open-licence fonts, placeholder brand marks and a small SFX set.

## Prerequisites

- **Claude Code**, with skills enabled.
- **HyperFrames CLI** (`hyperframes`): https://github.com/heygen-com/hyperframes. The companion HyperFrames skills for Claude Code are recommended but not required.
- **An ElevenLabs account and API key**, plus a voice to narrate with (your own voice clone or a library voice). Get the voice ID from the ElevenLabs voice library.
- **ffmpeg / ffprobe** on your PATH.
- **Python 3** (standard library only).
- Optional: **Node + Playwright** to capture a brand site, and **faster-whisper** to check the take against the script.

Rendering is CPU-heavy. A laptop works; a desktop or a remote Linux box is faster (see "Rendering elsewhere").

## Install

```bash
git clone https://github.com/tswic-highdesert/briefing-video-skill.git
mkdir -p ~/.claude/skills
cp -R briefing-video-skill/briefing-video ~/.claude/skills/briefing-video
```

Set your ElevenLabs credentials in the environment Claude Code runs in:

```bash
export ELEVENLABS_API_KEY=...      # never commit this
export ELEVENLABS_VOICE_ID=...     # the voice that narrates your briefs
# optional: export ELEVENLABS_MODEL_ID=eleven_v4
```

A secrets manager that injects variables at run time (`op run`, `doppler run`, a `.env` loader) is better than a plain export.

## Use it

Start Claude Code in a folder with your source material and ask, for example:

> Make a 2-minute video brief for the team from `FINDINGS.md` and the call transcript. Thursday's meeting is about whether to expand the pilot.

Claude will check every number against the sources, draft the script with a spoken-word count against the time budget, and wait for your OK before it spends any ElevenLabs characters. After the take, it plans scenes from the word timings, builds, reviews snapshots, renders to `renders/<slug>-v1.mp4` and reports runtime, loudness, characters billed and any number changes.

## Customize

### Voice

- Change `ELEVENLABS_VOICE_ID` (or pass `--voice` to `scripts/take.py`).
- Measure your narrator's pace once (spoken words / seconds) and update the 2.5 words-a-second budget in `SKILL.md` if it differs.
- `--stability` and `--similarity` tune delivery. The defaults (0.5 / 0.8) read calm and even.

### Brand

The default theme is a calm editorial look: Young Serif, Instrument Sans and Caveat; paper and forest-green grounds; honey-yellow highlights; a soft gradient hero. To make it yours:

1. **Colours:** edit the CSS variables on `#root` in `briefing-video/template/common.css`. Map your brand colours to roles (ink, light grounds, dark band, highlight, warning, upside, neutral); `references/style.md` explains what each role means on screen.
2. **Fonts:** drop your font files into `template/assets/fonts/` and update the three `@font-face` rules. Keep the family names `"YS"`, `"IS"` and `"Hand"`.
3. **Logo:** replace `template/assets/brand/brand-mark-dark.svg` and `brand-mark-light.svg` (418x90).
4. **Hero:** the opening and end card sit on a CSS gradient (`.hero`). To use a hero video, put it at `template/assets/media/hero.mp4` and follow "The hero" in `references/style.md`.
5. **From a website:** `node scripts/shoot.mjs https://your-site.example ref/live` captures screenshots, fonts, colours and type specs to theme from.

Edit the copy in `~/.claude/skills/briefing-video/template/` and every new brief starts from your brand.

### Rendering elsewhere

Everything runs locally by default. To iterate on a laptop and render on a bigger machine:

```bash
export BRIEF_HOST=user@render-box     # any host you can ssh and rsync to
scripts/sync.sh ./my-brief my-brief   # builds, then rsyncs sources to ~/videos/my-brief/ there
```

Copy `assets/` and the voice to the remote project once, then run `hyperframes check`, `snapshot`, `render` and `scripts/qa.sh` there.

## Credits and licences

- Skill, scripts and template code: MIT, see [LICENSE](LICENSE). Author: Tal Swicegood.
- Fonts: SIL Open Font License, see `briefing-video/template/assets/fonts/FONTS.md`.
- GSAP: GSAP Standard License, see `briefing-video/template/assets/vendor/VENDOR.md`.
- Sound effects: Pixabay Content License, see `briefing-video/template/assets/sfx/CREDITS.md`.
- HyperFrames and ElevenLabs are separate products with their own terms.
