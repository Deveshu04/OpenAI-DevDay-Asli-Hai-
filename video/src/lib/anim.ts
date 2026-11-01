import { Easing, interpolate } from "remotion";

// The film's motion rules, as numbers: snaps, camera glides and entrances. No overshoot anywhere.
export const SNAP = Easing.bezier(0.7, 0, 0.2, 1);
export const GLIDE = Easing.bezier(0.65, 0, 0.35, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 between `start` and `start + duration`, held at either end. */
export const ramp = (frame: number, start: number, duration: number, easing = OUT) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing });

/** Visible from `start` to `end`, with short fades in and out. */
export const window = (frame: number, start: number, end: number, fade = 8) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], CLAMP);

/** A deterministic speaking waveform: bar heights from fixed sines of the frame. */
export const bar = (frame: number, i: number, active: boolean) =>
  active ? 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.35 + i * 1.7) * Math.cos(frame * 0.13 + i)) : 0.12;
