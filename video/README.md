# The Asli hai? demo film

A 3 minute 49 second narrated film of the product, made with [Remotion](https://www.remotion.dev). It's a "living UI" film: the real screens are rebuilt in React with the site's own palette and fonts, so the camera can move through them and the buttons can be pressed on screen. Every line on screen is the product's own wording, copied from `web/`, `agents/` and `backend/languages.py`.

The rendered film is in [`media/asli-hai-demo.mp4`](../media/asli-hai-demo.mp4).

| Scene | File | What it shows |
| --- | --- | --- |
| Hook | `src/scenes/Hook.tsx` | The scam call |
| One tap | `src/scenes/Press.tsx` | The home-screen button and the press |
| Two calls at once | `src/scenes/TwoCalls.tsx` | Saathi and the rescue call side by side, with the live event log |
| Every other path | `src/scenes/OtherPaths.tsx` | A genuine call, police claims, money already sent, a parent still on the scam call, a retry |
| Made for her | `src/scenes/MadeForHer.tsx` | One button, 13 languages, larger text, screen readers, the family's signup |
| Safe by design | `src/scenes/Trust.tsx` | The family word, guardrails, fixed lines, official facts |
| Under the hood | `src/scenes/End.tsx` | The architecture and the end card |

## Build it

```bash
npm i
npx remotion studio
```

`npx remotion studio` opens the editable preview. To render the film:

```bash
npx remotion render AsliHaiFilm out/asli-hai-demo-raw.mp4 --codec=h264 --crf=20 --color-space=bt709
npx remotion ffmpeg -i out/asli-hai-demo-raw.mp4 -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/asli-hai-demo.mp4
```

The second step evens the loudness out to the usual level for online video.

To render the README teaser:

```bash
npx remotion render AsliHaiFilm out/asli-hai-teaser.gif --codec=gif --frames=685-925 --every-nth-frame=3 --scale=0.4 --number-of-gif-loops=0 --props='{"sfx":false}'
```

Rendering every Nth frame trips Remotion's audio mixing, so GIF renders switch the sound off.

## Voice and music

The narration and the two phone voices are made with OpenAI's `gpt-4o-mini-tts` from `scripts/narration.json`. The score is composed in code by `scripts/score.py`, with no samples or licensed music, and follows the scene lengths in `src/`.

```bash
python scripts/voice.py
python scripts/score.py
```

`voice.py` needs `OPENAI_API_KEY` in the repo's `.env`; pass line ids (`python scripts/voice.py hook_n1`) to redo only those. Each scene lists when its lines start (`HOOK_VO` and the rest), and `src/ui/Soundtrack.tsx` plays them and lowers the music under every voice. Run `score.py` again after changing a scene's length.

## Keep the wording in sync

```bash
python scripts/extract_copy.py
```

This rewrites `src/data/copy.json` from the product. Run it after changing any user-facing line.

## Review before rendering

```bash
node scripts/contact-sheet.mjs 60 0.3
python scripts/tile.py 60
```

This writes one small frame every 2 seconds into `out/sheet-*.png`, which is enough to spot clipped or overlapping text without a full render.
