"""Voices the film's script with gpt-4o-mini-tts into public/vo/, and writes each clip's length to src/data/vo.json."""
import io
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from openai import OpenAI
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

VIDEO = Path(__file__).resolve().parents[1]
ROOT = VIDEO.parent
OUT = VIDEO / "public/vo"
FFMPEG = [str(VIDEO / "node_modules/.bin/remotion.cmd" if sys.platform == "win32" else VIDEO / "node_modules/.bin/remotion"), "ffmpeg"]


def api_key():
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$", line)
        if m:
            return m.group(1).strip("'\"")
    sys.exit("Add OPENAI_API_KEY to the repo's .env first")


def trim(x, rate, floor=0.01):
    loud = np.flatnonzero(np.abs(x) > floor)
    if not len(loud):
        return x
    pad = int(0.04 * rate)
    return x[max(loud[0] - pad, 0) : loud[-1] + pad]


def phone_line(x, rate):
    # Telephone band plus soft clipping, so the call voices sound like they come through a handset.
    x = sosfilt(butter(4, [320, 3400], btype="band", fs=rate, output="sos"), x)
    return np.tanh(2.2 * x) / np.tanh(2.2)


def main(only=None):
    script = json.loads((VIDEO / "scripts/narration.json").read_text(encoding="utf-8"))
    client = OpenAI(api_key=api_key())
    OUT.mkdir(parents=True, exist_ok=True)
    lengths_path = VIDEO / "src/data/vo.json"
    lengths = json.loads(lengths_path.read_text(encoding="utf-8")) if lengths_path.exists() else {}
    for line in script["lines"]:
        if only and line["id"] not in only:
            continue
        who = script["voices"][line["who"]]
        instructions = who["base"] + (" Emotion: " + line["mood"] if line.get("mood") else "")
        audio = client.audio.speech.create(model="gpt-4o-mini-tts", voice=who["voice"], input=line["text"], instructions=instructions, response_format="wav")
        rate, data = wavfile.read(io.BytesIO(audio.read()))
        x = data.astype(np.float32) / 32768.0
        if x.ndim > 1:
            x = x.mean(axis=1)
        x = trim(x, rate)
        x = sosfilt(butter(2, 80, btype="high", fs=rate, output="sos"), x)
        if line["who"] != "narrator":
            x = phone_line(x, rate)
        x = x / (np.sqrt(np.mean(x**2)) + 1e-9) * 0.12
        x = np.clip(x, -0.98, 0.98)
        wav = OUT / f"{line['id']}.wav"
        wavfile.write(wav, rate, (x * 32767).astype(np.int16))
        subprocess.run([*FFMPEG, "-y", "-v", "error", "-i", str(wav), "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "160k", str(OUT / f"{line['id']}.mp3")], check=True, shell=sys.platform == "win32")
        wav.unlink()
        lengths[line["id"]] = round(len(x) / rate, 2)
        print(f"{line['id']}: {lengths[line['id']]} s")
    lengths_path.write_text(json.dumps(lengths, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
