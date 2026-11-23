# Voice: one take, word-aligned

## The voice

| Setting | Value |
|---|---|
| Voice | Your ElevenLabs voice: a professional or instant voice clone of the narrator, or a library voice. Set `ELEVENLABS_VOICE_ID`. |
| Model | `eleven_v4` by default (`ELEVENLABS_MODEL_ID` or `--model` to change it). A voice's `fine_tuning.state` may list only older models; newer models can still work, so try before giving up. |
| Endpoint | `POST /v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128` |
| Settings | `voice_settings: {stability: 0.5, similarity_boost: 0.8}` and nothing else |
| Audio tags | None. A brief is read straight. |
| Pace | About 150 spoken words a minute for a calm narrator (one real take: 615 spoken words in 243.3 s = 152 wpm). Measure yours. |

## The one-take rule

- Send the **whole script in one request**. Separate requests per section drift in tone, pace and room sound, and the joins can be heard.
- **The voice leads and the picture follows.** Never time-stretch, trim, speed up or splice the voice to fit a target length or a scene. If it runs long, shorten the script and take again.
- Normalize the take once: `loudnorm=I=-16:TP=-1.5:LRA=11`, 48 kHz mono, which writes `voice.wav`. (A take can measure about -17 LUFS after this one pass. The final render still lands near -14, which is fine.)

## Running a take

In your project's `vo/` dir, with the approved `script.txt`:

```bash
export ELEVENLABS_API_KEY=...        # or inject it with your secrets manager
export ELEVENLABS_VOICE_ID=...       # the voice to narrate with
python3 $SK/scripts/take.py .
cp voice.wav ../assets/audio/voice.wav
```

- Prefer injecting the key at run time (`op run`, `doppler run`, `dotenv run`, ...) over exporting it in a shared shell.
- `take.py` reads the key from the environment only. It never prints, logs or writes it. Keep it that way in any edit.
- To check that the key exists without revealing it, check its length only, never the value.
- `--voice`, `--model`, `--stability` and `--similarity` override the defaults.
- `take.py` caches on a hash of the text, model, settings and voice. Re-running with an unchanged script sends nothing and bills nothing. `--force` bills a new take.
- Outputs:
  - `voice.mp3`: raw.
  - `alignment.json`: character timings.
  - `voice.wav`: normalized.
  - `voice.json`: meta, billed characters, duration, words.
  - `words.txt`: `idx start end gap word`, the file `cues.py` reads.
- **Billing:** the `character-cost` response header is what ElevenLabs actually charged, and it can be well below the text length. Report the billed number and the text length separately.

## Writing for the ear

Make these read-aloud fixes after approval. They change no meaning and no number:

- **Spell out numbers the way the narrator would say them:**
  - "two thousand eight hundred twenty-four"
  - "thirty-nine percent"
  - "ten a.m."
  - "a hundred percent"
  - "thirty to forty rows"
- Money: "a two hundred thousand dollar a year pool". You can round in the voice ("over thirteen thousand time entries") and keep the exact number on screen (13,182). Report that you did.
- **Acronyms said letter by letter need periods:** "P.O.s", "S.O.P.s", "U.X.". Without them, the model may try to read "POs" and "SOPs" as words.
- Use contractions and short sentences. Use a colon before a list of three; the model gives it a natural pause.
- Use no em dashes in the spoken text. Use commas, colons or full stops instead.
- A small clarifying word is fine when the original wording would mislead a listener. "Thirty-nine percent of their revenue in August" became "in our August numbers" when the figure came from an analysis done in August, not from August revenue.

## Checking the take

- Run faster-whisper on `voice.wav` (`small.en` is enough for a check) and diff it against the script. Listen for mispronounced names and acronyms, and for every number.
- Look at the gaps: `python3 $SK/scripts/cues.py words.txt --gaps 0.45` should list the paragraph breaks. If a section boundary shows no pause, the scene cut has nowhere clean to land; add a full stop or a paragraph break and take again.

## Alignment quirks

- ElevenLabs character end times stretch through short pauses, so word "gaps" read small. Paragraph breaks show as 0.45-0.75 s, not the 1 s or more you'd expect.
- Hyphenated spoken numbers ("thirty-nine", "day-one") come back as one word. Punctuation stays attached ("Tuesday:", "fire.").
- Cue to the word's **start** time. Whisper timings are not needed; the alignment is the timeline.
