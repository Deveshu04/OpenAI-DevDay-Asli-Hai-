import type React from "react";
import { interpolate } from "remotion";
import { bar, CLAMP, OUT, ramp } from "../lib/anim";
import { C, F } from "../lib/theme";
import { SCREEN_H, SCREEN_W } from "./Phone";

export type Bubble = {
  /** Frame (scene-local) at which the line is spoken. */
  readonly at: number;
  readonly who: "them" | "me";
  readonly text: string;
  /** English line shown under the Hindi, for viewers who don't read it. */
  readonly en?: string;
  readonly tag?: string;
  readonly tone?: "fixed" | "ok" | "warn";
};

type Props = {
  readonly frame: number;
  readonly name: string;
  readonly sub: string;
  readonly avatar: string;
  readonly state: "incoming" | "outgoing" | "active";
  readonly connectedAt?: number;
  readonly bubbles?: readonly Bubble[];
  readonly speaking?: "them" | "me" | null;
  readonly avatarColor?: string;
};

const tones = {
  fixed: { background: C.field, border: C.ink, color: C.ink },
  ok: { background: C.okTint, border: C.ok, color: C.ok },
  warn: { background: C.warnTint, border: C.warn, color: C.warn },
};

const timer = (frames: number) => {
  const s = Math.max(0, Math.floor(frames / 30));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const CallScreen: React.FC<Props> = ({
  frame,
  name,
  sub,
  avatar,
  state,
  connectedAt = 0,
  bubbles = [],
  speaking = null,
  avatarColor = C.seal,
}) => {
  if (state !== "active") {
    const pulse = (frame % 40) / 40;
    const buttons = state === "incoming" ? [{ c: "#c0392b", r: 135 }, { c: C.ok, r: 0 }] : [{ c: "#c0392b", r: 135 }];
    return (
      <div style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, background: C.phone, color: C.field, fontFamily: F.ui, textAlign: "center" }}>
        <div style={{ position: "absolute", top: 150, left: SCREEN_W / 2 - 80, width: 160, height: 160 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${avatarColor}`, opacity: 1 - pulse, scale: 1 + pulse * 0.6 }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: avatarColor, display: "grid", placeItems: "center", fontSize: 70, fontWeight: 800, color: C.ink }}>{avatar}</div>
        </div>
        <div style={{ position: "absolute", top: 350, left: 20, right: 20, fontSize: 36, fontWeight: 700 }}>{name}</div>
        <div style={{ position: "absolute", top: 404, left: 20, right: 20, fontSize: 21, opacity: 0.75 }}>{sub}</div>
        <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {buttons.map((b) => (
            <div key={b.c} style={{ width: 86, height: 86, borderRadius: "50%", background: b.c, display: "grid", placeItems: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill={C.field} style={{ rotate: `${b.r}deg` }} aria-hidden>
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const shown = bubbles.filter((b) => frame >= b.at);
  return (
    <div style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, background: C.paper, fontFamily: F.ui, color: C.ink }}>
      <div style={{ position: "absolute", top: 12, left: 20, right: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, flex: "none", borderRadius: "50%", background: avatarColor, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 30 }}>{avatar}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1.15 }}>{name}</div>
          <div style={{ fontSize: 17, color: C.inkSoft }}>
            {sub} · <span style={{ fontVariantNumeric: "tabular-nums" }}>{timer(frame - connectedAt)}</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 92, left: 20, right: 20, height: 2, background: C.rule }} />

      <div
        style={{
          position: "absolute",
          top: 96,
          left: 16,
          right: 16,
          bottom: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 14,
          overflow: "hidden",
          maskImage: "linear-gradient(to bottom, transparent 0, black 70px)",
        }}
      >
        {shown.map((b) => {
          const tone = b.tone ? tones[b.tone] : null;
          const mine = b.who === "me";
          return (
            <div
              key={`${b.at}-${b.text.slice(0, 12)}`}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: 336,
                padding: "12px 16px",
                borderRadius: mine ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                background: tone ? tone.background : mine ? C.ink : C.field,
                color: tone ? tone.color : mine ? C.field : C.ink,
                border: `2px solid ${tone ? tone.border : mine ? C.ink : C.rule}`,
                fontSize: 21,
                lineHeight: 1.38,
                fontWeight: b.tone ? 600 : 400,
                opacity: ramp(frame, b.at, 10),
                translate: `0 ${interpolate(frame, [b.at, b.at + 14], [24, 0], { ...CLAMP, easing: OUT })}px`,
                flex: "none",
              }}
            >
              {b.tag ? (
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8, marginBottom: 4, fontFamily: F.mono }}>{b.tag}</div>
              ) : null}
              {b.text}
              {b.en ? (
                <div lang="en" style={{ marginTop: 6, fontSize: 16, lineHeight: 1.35, fontStyle: "italic", fontWeight: 400, opacity: 0.78 }}>
                  {b.en}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", bottom: 92, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, height: 40 }}>
        {Array.from({ length: 22 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              borderRadius: 3,
              height: 40 * bar(frame, i, speaking !== null),
              background: speaking === "me" ? C.inkSoft : C.ink,
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34 }}>
        {[C.paperDeep, C.paperDeep, "#c0392b"].map((c, i) => (
          <div key={i} style={{ width: 58, height: 58, borderRadius: "50%", background: c, display: "grid", placeItems: "center" }}>
            {i === 2 ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill={C.field} style={{ rotate: "135deg" }} aria-hidden>
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
              </svg>
            ) : (
              <div style={{ width: 22, height: 22, borderRadius: i ? 4 : "50%", border: `3px solid ${C.ink}` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
