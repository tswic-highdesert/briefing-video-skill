---
name: briefing-video
description: Make a narrated, animated briefing video from raw notes, transcripts and data - an internal pre-meeting brief or a client-facing brief, 1920x1080, data-led scenes (count-ups, bar charts, sparklines, hand-drawn marker notes) in a calm editorial look (Young Serif, Instrument Sans, Caveat, paper and forest-green grounds, honey-yellow highlights, a gradient or video hero). Covers the script and word budget, the one-take ElevenLabs narration with word alignment, alignment-driven scene timing, the HyperFrames build, frame-by-frame QA and delivery. Use for "make a video brief", "animated briefing", "pre-meeting video", "brief me in a video", "explainer video for the team", "narrated walkthrough of these numbers", or any data-led narrated video.
---

# Briefing video

A recipe for short, narrated, animated briefing videos: the kind a team watches before a meeting instead of reading a long email or clicking through a deck. One voice take drives the whole timeline, and every number, chart and note lands on the word that says it.

Skill dir: `~/.claude/skills/briefing-video` (below: `$SK`).

`references/example-structure.md` has a worked, anonymized example: the cut plan, timings, number decisions and measurements of a 4-minute brief built with this skill. Read it before planning a new one. Every pattern in `references/motion.md` is used in the two exemplar scenes in `template/src/`.

## What a good brief is

A brief is for understanding, not selling. It is told operator-to-operator: numbers, traps and decisions. Nobody should need to pause it to read.

A cut structure that works for most pre-meeting briefs:

| Cut | Job | Typical length |
|---|---|---|
| 1. Hook | Title on the hero, then the client's own words about the core problem | 20 s |
| 2. The data | What we pulled (ticker cards counting up), then the one chart that proves the point | 35 s |
| 3. Where the money is vs. noise | 2x2 metric cards; strike the noise card; a dark banner for the big reframe | 45 s |
| 4. The trap | What is wrong with the current approach; three failure rows | 25 s |
| 5. The wedge | The proposal as a 3-step loop, with the camera pushing onto each card | 40 s |
| 6. The private flag | A sensitive number with a "don't put on a slide" stamp | 25 s |
| 7. How it becomes a win | Four rules on a 2x2, ending in a role split | 35 s |
| 8. Decisions | Checkbox agenda on a card over the hero; small brand mark; hold | 15 s |

Cut what the brief does not need. A 2-minute brief usually keeps cuts 1, 2, 3, 5 and 8.

### Word budget: the voice sets the length

A typical narration voice reads at about **150 spoken words a minute, or 2.5 words a second**. Measure your own voice once and update the number. Count *spoken* words: "2,824" is five words aloud ("two thousand eight hundred twenty-four"). A 567-word written script can become 615 spoken words once the numbers are spelled out. At 2.5 words a second that is 246 s, so a brief planned for 2:50 runs over 4 minutes. The rules say never speed up or trim the voice, so the only fix is a shorter script.

- Budget = target seconds x 2.5 spoken words. A 2:50 brief is about **420 spoken words**; a 2:00 brief is about 300.
- Count the words *after* spelling out numbers, before the take is generated, and tell the user if the script is over budget. That conversation is cheap before the take and expensive after it.
- Each cut needs at least one visual beat every 3 s or so. A 40-second cut needs 12 or more beats planned.

## Workflow

1. **Gather sources and verify every number.** Use the analysis files, call transcripts and data exports the user gives you. For each number on screen, find the source line. If the script and the analysis disagree, use the analysis and record it for the report. Quote people verbatim from the transcript, never from a paraphrase in the script. Drop any claim that was withdrawn.
2. **Write the script and get it approved in chat.** Write plain text the way it will be spoken: spell out numbers, use contractions, and spell out acronyms that must be said letter by letter ("P.O.s", "S.O.P.s", "U.X."). Use no audio tags. Show the word count against the budget. Wait for the user's OK; once approved, only read-aloud fixes are allowed. See `references/voice.md`.
3. **Set the look.** The template ships a neutral editorial theme (`references/style.md`). To match a brand, capture the brand's site with `scripts/shoot.mjs` and `scripts/fonts.mjs`, then update the tokens in `template/common.css`, the fonts in `template/assets/fonts/`, the marks in `template/assets/brand/` and, optionally, a hero video. If a capture URL cannot be reached, stop and report; do not guess.
4. **Generate the narration in one take** with `scripts/take.py` (`references/voice.md`). It reads `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` from the environment. One request carries the whole script, so pacing and tone stay continuous. You get `voice.wav` (loudnorm -16 LUFS) and `words.txt` (word timings). Check the take with faster-whisper (small.en is enough) against the script.
5. **Plan the cuts from the alignment.** Run `scripts/cues.py words.txt --gaps 0.45` to find the paragraph pauses, and cut each scene inside a pause. Then run `cues.py --from A --to B` per scene and write every animation cue at the word it belongs to. The voice leads and the picture follows.
6. **Build.** Copy `$SK/template/` to a project dir, copy `vo/voice.wav` to `assets/audio/voice.wav`, write `src/sN.html` per cut, then run `python3 build.py`. The template and the composition contract are covered in `references/motion.md`. (Optional: if you render on another machine, `scripts/sync.sh <project> <slug>` builds and, with `BRIEF_HOST` set, rsyncs the sources there.)
7. **Check and review:** `hyperframes check --json` until ok, then `hyperframes snapshot --review` plus your own `--at` list of settled moments (the review beats land at scene start + 0.3 s, which is mostly empty ground). Look at every sheet. `references/gotchas.md` lists what to look for.
   - **Padding lint:** run `python3 build.py --padcheck` (or `scripts/sync.sh <project> <slug> --padcheck`), then snapshot the same settled moments. Each card that is tight or lopsided gets a magenta outline and a label (`PAD t36 r48 b1 l40 >=28 tight:b`). Fix every flag, or mark an intentional overhang with `data-pad-ignore`. Then build again without the flag. Never render a `--padcheck` build. The rules are in `references/style.md` under "Card padding".
8. **Render:** `hyperframes render -q delivery -f 30 -o renders/<slug>-v1.mp4`. Rendering is CPU-heavy; a 4-minute brief takes a few minutes on a modern multi-core machine.
9. **QA the render** with `scripts/qa.sh`: frames -3..+3 around every cut, a contact sheet, loudness and a sync spot check. Open the cut strip and the contact sheet and look at them.
10. **Deliver.** Put the MP4 and the contact sheet JPG where the user asked (default: `renders/` in the project) and open the MP4. Write `REVIEW.md` in the project. Report the path, runtime, LUFS, number changes vs. the script, ElevenLabs characters billed, and anything unresolved. Do not publish, upload or email unless the user asks.

## Tooling

- **HyperFrames CLI** (`hyperframes`), from https://github.com/heygen-com/hyperframes. Record the CLI version you used in `REVIEW.md`. If `init` tries to install its own skills and you do not want them, prefix `HYPERFRAMES_SKIP_SKILLS=1`.
- **ffmpeg / ffprobe** for normalizing the take and for QA.
- **Python 3** for `take.py`, `cues.py` and `build.py` (standard library only).
- **Node + Playwright** only if you capture a brand site with `shoot.mjs` / `fonts.mjs`.
- **faster-whisper** (optional) to check the take against the script.

Everything runs locally by default. To render on a bigger machine, set `BRIEF_HOST=user@host` and use `scripts/sync.sh`; run `check`, `snapshot`, `render` and `qa.sh` there.

## Quality bar

- Real animated data: count-ups, bar draws, sparklines, numbers that land on the word that says them. Make it legible from a couch: 28 px is the floor for any text, and key numbers are 96-160 px.
- Every card has even padding on all four sides (40 px default, 28 small, 48 large) and passes the `--padcheck` lint.
- **No narrator text.** No muted captions restating the voice, no source footnotes, no burned-in full captions. Use designed on-screen words at key beats only. A Caveat marker note is the one place for an aside.
- No invented metrics, logos or UI mocks of real products. Abstract phones, rows and toggles are fine.
- No flicker at cuts. Use ground-continuity floods (`references/motion.md`) and check 7 frames around every cut.
- The brand mark appears only as a small bug or on the end card. No sales CTA in an internal brief.
- Loudness: -14 to -16 LUFS integrated, true peak at or below -1 dBTP. With the voice normalized to -16 and low-gain SFX, a delivery render lands around -14.0 / -1.0.
- Music is optional and must be licensed or royalty-free. A brief usually needs none; the voice carries it. SFX come from the bundled Pixabay set, used sparingly.

## Secrets

The ElevenLabs key is read from `ELEVENLABS_API_KEY` in the environment, and the voice from `ELEVENLABS_VOICE_ID`. Export them in your shell or inject them with your secrets manager (for example `op run`, `doppler run` or a `.env` loader). Never print the key, log it, write it to a file, or commit it. If the key is missing, stop and ask the user.

## Files

| Path | What |
|---|---|
| `references/style.md` | Theme tokens: fonts, palette, mesh grounds, hero, card system, marker notes, colour meaning; how to rebrand |
| `references/motion.md` | The helpers and moves: count-ups, bar draws, sparklines, flood transitions, camera zooms, eases, SFX placement and gains, scene contract |
| `references/voice.md` | Voice setup, the one-take rule, `take.py`, read-aloud spelling, alignment quirks |
| `references/gotchas.md` | Bugs that cost time on real builds, and the check and lint traps |
| `references/example-structure.md` | Anonymized worked example: scene plan, timings, number decisions, measurements |
| `scripts/take.py` | One-request ElevenLabs take with alignment; writes voice.wav, voice.json, words.txt |
| `scripts/cues.py` | Pauses and per-scene word cues from words.txt |
| `scripts/shoot.mjs`, `scripts/fonts.mjs` | Brand-site capture: screenshots, computed styles, font and video URLs |
| `scripts/sync.sh` | build.py, then (optionally) rsync sources and compositions to a remote render box |
| `scripts/qa.sh` | Cut strips, contact sheet, loudness, sync check on a render |
| `template/` | Scaffold: index.html, build.py, common.css/js, padcheck.js (padding lint), two exemplar scenes, fonts, placeholder brand SVGs, SFX (Pixabay licence in `assets/sfx/CREDITS.md`), gsap, hyperframes.json, an example script |
