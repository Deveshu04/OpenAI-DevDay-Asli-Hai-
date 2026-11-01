import type React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CLAMP, OUT, ramp, SNAP, window } from "../lib/anim";
import { C, F } from "../lib/theme";

/** The paper ground every UI scene sits on, with a faint dot grid so the frame never looks empty. */
export const Stage: React.FC<{ readonly dark?: boolean; readonly children?: React.ReactNode }> = ({ dark = false, children }) => (
  <AbsoluteFill
    style={{
      background: dark ? C.stage : C.paper,
      backgroundImage: `radial-gradient(${dark ? "rgba(228,237,245,0.07)" : "rgba(24,34,92,0.07)"} 1.5px, transparent 1.5px)`,
      backgroundSize: "36px 36px",
    }}
  >
    {children}
  </AbsoluteFill>
);

/** A headline that wipes in from the left on the snap curve, then holds. */
export const Wipe: React.FC<{
  readonly frame: number;
  readonly at: number;
  readonly out?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ frame, at, out, children, style }) => {
  const shown = interpolate(frame, [at, at + 16], [100, 0], { ...CLAMP, easing: SNAP });
  const gone = out === undefined ? 0 : interpolate(frame, [out, out + 12], [0, 100], { ...CLAMP, easing: SNAP });
  return <div style={{ position: "absolute", clipPath: `inset(0 ${shown}% 0 ${gone}%)`, ...style }}>{children}</div>;
};

/** Fades and lifts in at `at`. */
export const Rise: React.FC<{
  readonly frame: number;
  readonly at: number;
  readonly out?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ frame, at, out, children, style }) => (
  <div
    style={{
      position: "absolute",
      opacity: ramp(frame, at, 14) * (out === undefined ? 1 : 1 - ramp(frame, out, 10)),
      translate: `0 ${interpolate(frame, [at, at + 18], [26, 0], { ...CLAMP, easing: OUT })}px`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A caption pill. Text is held for its whole window, so short lines stay up long enough to read. */
export const Caption: React.FC<{
  readonly frame: number;
  readonly from: number;
  readonly to: number;
  readonly who?: string;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ frame, from, to, who, children, style }) => {
  const o = window(frame, from, to);
  if (o <= 0) return null;
  return (
    <div
      lang="en"
      style={{
        position: "absolute",
        opacity: o,
        background: "rgba(16,26,74,0.94)",
        color: C.field,
        fontFamily: F.ui,
        fontWeight: 600,
        fontSize: 38,
        lineHeight: 1.3,
        padding: "16px 26px",
        borderRadius: 16,
        textWrap: "balance",
        ...style,
      }}
    >
      {who ? <span style={{ color: C.seal, fontWeight: 700 }}>{who} </span> : null}
      {children}
    </div>
  );
};

/** The finger: a soft circle that slides to a target and squashes on the press frame. */
export const Finger: React.FC<{
  readonly frame: number;
  readonly path: readonly { at: number; x: number; y: number }[];
  readonly pressAt: number;
  readonly hideAt: number;
}> = ({ frame, path, pressAt, hideAt }) => {
  const xs = path.map((p) => p.x);
  const ys = path.map((p) => p.y);
  const ts = path.map((p) => p.at);
  const x = interpolate(frame, ts, xs, { ...CLAMP, easing: SNAP });
  const y = interpolate(frame, ts, ys, { ...CLAMP, easing: SNAP });
  const squash = interpolate(frame, [pressAt - 4, pressAt, pressAt + 6], [1, 0.78, 1], CLAMP);
  const o = interpolate(frame, [ts[0], ts[0] + 8, hideAt, hideAt + 10], [0, 1, 1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 36,
        top: y - 36,
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "rgba(24,34,92,0.28)",
        border: "4px solid rgba(255,255,255,0.95)",
        boxShadow: "0 8px 20px rgba(16,26,74,0.3)",
        opacity: o,
        scale: squash,
      }}
    />
  );
};

export type LogLine = { readonly at: number; readonly t: string; readonly text: string };

/** The under-the-hood log: what the backend and Bolna actually do, line by line. */
export const EventLog: React.FC<{
  readonly frame: number;
  readonly lines: readonly LogLine[];
  readonly style?: React.CSSProperties;
  readonly title?: string;
}> = ({ frame, lines, style, title = "Under the hood" }) => {
  const shown = lines.filter((l) => frame >= l.at);
  const newest = shown.length ? shown[shown.length - 1].at : -1;
  return (
    <div
      style={{
        position: "absolute",
        opacity: lines.length ? ramp(frame, lines[0].at, 10) : 1,
        background: C.ink,
        color: C.paper,
        borderRadius: 18,
        padding: "20px 24px",
        fontFamily: F.mono,
        fontSize: 21,
        lineHeight: 1.45,
        boxShadow: "0 30px 60px -30px rgba(16,26,74,0.7)",
        ...style,
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: "0.12em", textTransform: "uppercase", color: C.seal, marginBottom: 10 }}>{title}</div>
      {shown.map((l) => (
        <div
          key={l.at}
          style={{
            display: "flex",
            gap: 16,
            opacity: ramp(frame, l.at, 8) * (l.at === newest ? 1 : 0.62),
          }}
        >
          <span style={{ color: C.rule, flex: "none", fontVariantNumeric: "tabular-nums" }}>{l.t}</span>
          <span style={{ minWidth: 0 }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
};

/** Small chapter tag in the top-left corner. */
export const Chapter: React.FC<{ readonly frame: number; readonly n: string; readonly title: string; readonly dark?: boolean; readonly x?: number }> = ({ frame, n, title, dark, x = 80 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 54,
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: F.mono,
      fontSize: 22,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: dark ? C.paper : C.inkSoft,
      opacity: ramp(frame, 4, 12),
    }}
  >
    <span style={{ width: 14, height: 14, background: C.seal, borderRadius: 3 }} />
    <span>{n}</span>
    <span style={{ color: dark ? C.paper : C.ink }}>{title}</span>
  </div>
);
