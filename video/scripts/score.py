"""Composes the film's score in code (no samples, nothing to license) into public/score.mp3, timed to the scene lengths in src/."""
import ast
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, oaconvolve, sosfilt

VIDEO = Path(__file__).resolve().parents[1]
SR = 48000
FPS = 30
rng = np.random.default_rng(7)

# Scene-local frames that the music hits, matching the scenes' own timings.
ANSWERED = 54
HOPE = 502
TAP = 182
STORY = 440
REUNION = 1300
GENUINE_VERDICT = 220


def arith(node, env):
    if isinstance(node, ast.Constant) and isinstance(node.value, int):
        return node.value
    if isinstance(node, ast.Name):
        return env[node.id]
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](arith(node.left, env), arith(node.right, env))
    raise KeyError(ast.dump(node))


OPS = {ast.Add: lambda a, b: a + b, ast.Sub: lambda a, b: a - b, ast.Mult: lambda a, b: a * b}


def consts(name):
    """Integer constants from a .tsx file, like `const BEAT = 240;` or `GENUINE + BEAT * 4`."""
    env = {}
    text = (VIDEO / f"src/{name}.tsx").read_text(encoding="utf-8")
    for key, expr in re.findall(r"(?:export )?const ([A-Z_]+) = ([A-Za-z0-9_ +*-]+);", text):
        try:
            env[key] = arith(ast.parse(expr, mode="eval").body, env)
        except (KeyError, SyntaxError):
            pass
    return env


SCENES = ["Hook", "Press", "TwoCalls", "OtherPaths", "MadeForHer", "Trust", "End"]
C = {s: consts(f"scenes/{s}") for s in SCENES}
CUT = consts("Film")["CUT"]
LENGTH = {s: next(v for k, v in C[s].items() if k.endswith("_FRAMES")) for s in SCENES}
START, t = {}, 0
for s in SCENES:
    START[s] = t / FPS
    t += LENGTH[s] - CUT
TOTAL = (t + CUT) / FPS
N = int(TOTAL * SR) + SR
out = np.zeros((2, N))

NAMES = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "Bb": 10, "B": 11}


def hz(note):
    name, octave = re.fullmatch(r"([A-G][#b]?)(\d)", note).groups()
    return 440 * 2 ** ((12 * (int(octave) + 1) + NAMES[name] - 69) / 12)


def put(sig, at, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)])
    n = min(sig.shape[1], N - i)
    out[:, i : i + n] += sig[:, :n]


def lowpass(x, hz_, order=2):
    return sosfilt(butter(order, min(hz_, SR / 2 - 100), fs=SR, output="sos"), x)


def band(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def saws(freq, t, cents=(-7, 0, 7)):
    return [2 * ((freq * 2 ** (c / 1200) * t + rng.random()) % 1) - 1 for c in cents]


def pad(notes, t0, t1, amp=0.03, attack=1.5, release=2.5, cutoff=1400, tremolo=0.0):
    hold = max(t1 - t0, 0.05)
    t = np.arange(int((hold + release) * SR)) / SR
    env = np.minimum(1, t / max(attack, 0.01)) * np.clip(1 - (t - hold) / release, 0, 1)
    if tremolo:
        env = env * (1 - tremolo * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)))
    left, right = np.zeros_like(t), np.zeros_like(t)
    for note in notes:
        a, b, c = saws(hz(note), t)
        left += a + 0.6 * b
        right += c + 0.6 * b
    stereo = np.vstack([lowpass(left, cutoff), lowpass(right, cutoff)]) * env * amp / np.sqrt(len(notes))
    put(stereo, t0)


def swell(notes, t0, t1, amp=0.05):
    t = np.arange(int((t1 - t0) * SR)) / SR
    env = (t / (t1 - t0)) ** 3
    sig = sum(sum(saws(hz(n), t)) for n in notes)
    put(lowpass(sig, 2200) * env * amp / len(notes), t0)


def piano(note, t0, amp=0.05, dur=3.5, pan=0.0):
    f = hz(note)
    t = np.arange(int(dur * SR)) / SR
    sig = sum((1 / k**1.4) * np.sin(2 * np.pi * f * k * np.sqrt(1 + 0.0003 * k * k) * t) * np.exp(-t * (0.7 + 0.45 * k)) for k in range(1, 10))
    put(sig * np.minimum(1, t / 0.004) * amp, t0, pan)


def chord_piano(notes, t0, amp=0.04, dur=4.0):
    for i, n in enumerate(notes):
        piano(n, t0 + i * 0.012, amp, dur, pan=-0.3 + 0.6 * i / max(len(notes) - 1, 1))


def bass(note, t0, amp=0.08, dur=0.5):
    f = hz(note)
    t = np.arange(int(dur * SR)) / SR
    sig = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 6) * np.minimum(1, t / 0.005)
    put(sig * amp, t0)


def thump(t0, amp=0.25, low=40, drop=45):
    t = np.arange(int(0.4 * SR)) / SR
    phase = 2 * np.pi * np.cumsum(low + drop * np.exp(-t * 25)) / SR
    put(np.sin(phase) * np.exp(-t * 13) * amp, t0)


def heart(t0, amp=0.25):
    thump(t0, amp)
    thump(t0 + 0.27, amp * 0.65)


def tick(t0, amp=0.02):
    t = np.arange(int(0.015 * SR)) / SR
    put(band(rng.standard_normal(len(t)), 2500, 6500) * np.exp(-t * 380) * amp * 4, t0, pan=0.25)


def riser(t0, t1, amp=0.05):
    t = np.arange(int((t1 - t0) * SR)) / SR
    x = t / (t1 - t0)
    noise = rng.standard_normal(len(t))
    sig = band(noise, 300, 1500) * (1 - x) + band(noise, 1500, 7000) * x
    sweep = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * x)) / SR) * 0.4
    put((sig + sweep) * x**2 * amp * np.minimum(1, (1 - x) * 60 + 0.02), t0)


def impact(t0, amp=0.3):
    t = np.arange(int(2.2 * SR)) / SR
    sub = np.sin(2 * np.pi * np.cumsum(30 + 55 * np.exp(-t * 8)) / SR) * np.exp(-t * 2.2)
    hit = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 9) * 0.35
    put((sub + hit) * amp, t0)


def shimmer(notes, t0, dur=5.0, amp=0.015):
    t = np.arange(int(dur * SR)) / SR
    for i, n in enumerate(notes):
        f = hz(n) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t + i))
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.6) * np.exp(-t * 0.6)
        put(sig * amp, t0, pan=-0.6 + 1.2 * i / max(len(notes) - 1, 1))


CHORDS = {
    "Dm": ["D3", "A3", "F4"], "Bb": ["Bb2", "F3", "D4"], "F": ["F2", "C4", "A4"], "C": ["C3", "G3", "E4"],
    "Gm": ["G2", "D3", "Bb3"], "A": ["A2", "E3", "C#4"], "D": ["D3", "A3", "F#4"], "A/C#": ["C#3", "A3", "E4"],
    "Bm": ["B2", "F#3", "D4"], "G": ["G2", "D3", "B3"], "D/F#": ["F#2", "D3", "A3"], "Em": ["E3", "B3", "G4"],
}
ROOT = {"Dm": "D2", "Bb": "Bb1", "F": "F2", "C": "C2", "Gm": "G1", "A": "A1", "D": "D2", "A/C#": "C#2", "Bm": "B1", "G": "G1", "D/F#": "F#1", "Em": "E2"}


def progression(names, t0, bar, end, amp=0.03, cutoff=1400, pulse=None, arp=None, attack=0.6):
    i, t = 0, t0
    while t < end - 0.05:
        name = names[i % len(names)]
        stop = min(t + bar, end)
        pad(CHORDS[name], t, stop, amp=amp, attack=attack, release=1.4, cutoff=cutoff)
        if pulse:
            for k in np.arange(t, stop - 0.01, pulse):
                bass(ROOT[name], k, 0.06, pulse * 0.9)
        if arp:
            notes = CHORDS[name] + [CHORDS[name][1][:-1] + str(int(CHORDS[name][1][-1]) + 1)]
            for j, k in enumerate(np.arange(t, stop - 0.01, arp)):
                piano(notes[j % len(notes)], k, 0.035, 2.2, pan=0.2 * (-1) ** j)
        i, t = i + 1, stop


def compose():
    f = lambda scene, frame: START[scene] + frame / FPS  # noqa: E731

    # Hook: the scam call. A drone, a heartbeat that stops when the narrator names the answer, then a first warm chord.
    ans, hope = f("Hook", ANSWERED), f("Hook", HOPE)
    pad(["D1", "A1", "D2"], 0, START["Press"] - 0.5, amp=0.06, attack=2.5, release=2.5, cutoff=320)
    for k, t in enumerate(np.arange(ans, hope - 0.4, 60 / 76)):
        heart(t, 0.16 + 0.1 * min(k / 10, 1))
    pad(["D5", "Eb5", "A5"], ans + 0.4, hope, amp=0.012, attack=9, release=1.2, cutoff=4200, tremolo=0.6)
    swell(["Bb2", "F3", "D4", "A4"], hope - 1.6, hope, 0.05)
    pad(["Bb2", "F3", "D4", "A4"], hope, START["Press"] + 1.5, amp=0.035, attack=0.3, release=3, cutoff=1800)
    for i, n in enumerate(["D5", "A4", "F4", "A4"]):
        piano(n, hope + 0.9 * i, 0.04, 3.2)

    # One tap: a quiet arpeggio, a swell into the press, then a driving pulse.
    p, tap = START["Press"], f("Press", TAP)
    pad(["D2", "A2", "F3"], p, tap, amp=0.025, cutoff=900)
    for j, k in enumerate(np.arange(p + 0.6, tap - 1.0, 60 / 84 / 2)):
        piano(["D3", "A3", "E4", "F4", "A4", "F4", "E4", "A3"][j % 8], k, 0.03, 2.0)
    swell(["D3", "A3", "D4", "F4"], tap - 1.2, tap, 0.07)
    impact(tap, 0.32)
    shimmer(["D5", "A5", "E6"], tap, 4.5)
    progression(["Bb", "F", "C", "Dm"], tap, 60 / 84 * 4, START["TwoCalls"] + 0.3, amp=0.03, pulse=60 / 84 / 2, arp=60 / 84 / 2)

    # Two calls: a clock and a low pulse until the verdict, which resolves into D major; then warmth, and a swell for "Ma, I'm fine".
    w = START["TwoCalls"]
    verdict, story, reunion = f("TwoCalls", C["TwoCalls"]["VERDICT"]), f("TwoCalls", STORY), f("TwoCalls", REUNION)
    for t in np.arange(w + 0.3, verdict - 0.05, 0.5):
        tick(t, 0.006 + 0.007 * (t - w) / (verdict - w))
    for t in np.arange(w, verdict - 0.2, 1.0):
        bass("D2", t, 0.07, 0.7)
    progression(["Dm", "Bb", "Gm", "A"], w, 6.5, verdict, amp=0.026, cutoff=800, attack=1.0)
    riser(story - 1.0, story, 0.025)
    pad(["A4", "Bb4", "D5"], verdict - 8, verdict, amp=0.011, attack=7, release=0.2, cutoff=3500, tremolo=0.5)
    riser(verdict - 3, verdict, 0.05)
    impact(verdict, 0.22)
    pad(["D2", "A2", "D3", "F#3", "A3", "D4"], verdict, verdict + 4.3, amp=0.04, attack=0.05, release=2, cutoff=2200)
    chord_piano(["D3", "F#3", "A3", "D4", "F#4"], verdict, 0.035, 5)
    shimmer(["F#5", "A5", "D6"], verdict, 6)
    progression(["D", "A/C#", "Bm", "G"], verdict + 4.3, 4.3, reunion - 1.0, amp=0.032, cutoff=1600, arp=0.72)
    swell(["G2", "D3", "B3", "G4"], reunion - 1.5, reunion, 0.05)
    progression(["G", "D/F#", "Em", "A"], reunion, 2.1, START["OtherPaths"], amp=0.042, cutoff=2600, arp=0.525)
    shimmer(["B5", "D6", "G6"], reunion, 6, 0.012)

    # Every other path: a steady, lighter pulse, one chord per path.
    o, g, b = START["OtherPaths"], C["OtherPaths"]["GENUINE"] / FPS, C["OtherPaths"]["BEAT"] / FPS
    q = 60 / 96
    progression(["D", "G"], o, g / 2, o + g, amp=0.03, cutoff=1500, pulse=q, arp=q)
    for i, name in enumerate(["Bm", "G", "Em", "A"]):
        progression([name], o + g + i * b, b, o + g + (i + 1) * b, amp=0.03, cutoff=1300, pulse=q, arp=q)
    for t in np.arange(o, START["MadeForHer"] - 0.1, q):
        tick(t + q / 2, 0.005)
    shimmer(["F#5", "A5", "D6"], f("OtherPaths", GENUINE_VERDICT), 4, 0.012)

    # Made for her: tender and slow, lifting at the family-signup beat.
    m = START["MadeForHer"]
    progression(["D", "Bm", "G", "A"], m, 60 / 66 * 8, START["Trust"] + 0.3, amp=0.03, cutoff=1200, arp=60 / 66, attack=1.2)
    lift = f("MadeForHer", C["MadeForHer"]["E"])
    pad(["D4", "F#4", "A4", "D5"], lift, START["Trust"], amp=0.016, attack=4, release=2, cutoff=3000)

    # Safe by design: firmer, with a low hit on each chord.
    tr = START["Trust"]
    progression(["Bm", "G", "D", "A"], tr, 5.0, START["End"] + 0.3, amp=0.032, cutoff=1500, pulse=60 / 90 / 2)
    for t in np.arange(tr, START["End"], 5.0):
        thump(t, 0.22, low=55, drop=60)

    # End: build into the title card, one final D major chord, then let it ring out.
    e, card = START["End"], f("End", C["End"]["CARD_AT"])
    progression(["G", "A"], e, (card - e) / 2, card, amp=0.035, cutoff=1800, pulse=60 / 100 / 2)
    riser(card - 3, card, 0.06)
    impact(card, 0.26)
    pad(["D1", "D2", "A2", "D3", "F#3", "A3", "D4", "F#4"], card, TOTAL - 3.5, amp=0.034, attack=0.05, release=3.5, cutoff=2400)
    chord_piano(["D2", "A2", "D3", "F#3", "A3", "D4"], card, 0.032, 6)
    shimmer(["D6", "F#6", "A6"], card, 7, 0.014)


def master():
    t = np.arange(int(3.0 * SR)) / SR
    ir = np.vstack([lowpass(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.55) for _ in range(2)])
    ir /= np.sqrt((ir**2).sum(axis=1, keepdims=True))
    wet = np.vstack([oaconvolve(out[ch], ir[ch])[:N] for ch in range(2)])
    mix = out + 0.45 * wet * np.sqrt((out**2).mean()) / (np.sqrt((wet**2).mean()) + 1e-12)
    mix = sosfilt(butter(2, 30, btype="high", fs=SR, output="sos"), mix)
    end = int(TOTAL * SR)
    mix = mix[:, :end] * np.minimum(1, (end - np.arange(end)) / (2.5 * SR))
    mix = np.tanh(mix / np.abs(mix).max() * 1.3) / np.tanh(1.3) * 0.89
    return mix


if __name__ == "__main__":
    compose()
    mix = master()
    wav = VIDEO / "public/score.wav"
    wavfile.write(wav, SR, (mix.T * 32767).astype(np.int16))
    remotion = VIDEO / ("node_modules/.bin/remotion.cmd" if sys.platform == "win32" else "node_modules/.bin/remotion")
    subprocess.run([str(remotion), "ffmpeg", "-y", "-v", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(VIDEO / "public/score.mp3")], check=True, shell=sys.platform == "win32")
    wav.unlink()
    print(f"score: {TOTAL:.2f} s; scenes start at", {k: round(v, 2) for k, v in START.items()})
