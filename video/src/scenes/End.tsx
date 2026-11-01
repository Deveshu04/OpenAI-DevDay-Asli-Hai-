import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, OUT, ramp } from "../lib/anim";
import { C, F } from "../lib/theme";
import { Chapter, Rise, Stage, Wipe } from "../ui/Overlays";
import type { Cue } from "../ui/Soundtrack";

export const END_FRAMES = 450;
const CARD_AT = 240;
export const END_VO: readonly Cue[] = [
  { id: "end_n1", at: 10 },
  { id: "end_n2", at: CARD_AT + 30 },
];

const NODES = [
  { at: 20, title: "Parent's phone", sub: "one tap" },
  { at: 50, title: "Saathi", sub: "Bolna graph agent" },
  { at: 80, title: "Backend", sub: "FastAPI · SQLite" },
  { at: 110, title: "Family check", sub: "Bolna graph agent" },
  { at: 140, title: "Family's phone", sub: "rescue call" },
];
const CHIPS = ["Sarvam saaras:v4 · bulbul:v4", "12 languages + Hinglish", "Events pushed into live calls", "Two calls at once"];

export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const card = ramp(frame, CARD_AT, 20);
  return (
    <Stage dark={frame >= CARD_AT}>
      {frame < CARD_AT ? (
        <>
          <Chapter frame={frame} n="06" title="Under the hood" />
          <Wipe frame={frame} at={6} style={{ left: 110, top: 170, width: 1700, fontFamily: F.display, fontSize: 84, color: C.ink }}>
            Two Bolna agents and a small backend.
          </Wipe>
          {NODES.map((n, i) => (
            <Rise
              key={n.title}
              frame={frame}
              at={n.at}
              style={{
                left: 110 + i * 350,
                top: 380,
                width: 300,
                height: 190,
                borderRadius: 22,
                border: `3px solid ${C.ink}`,
                background: i === 0 || i === 4 ? C.sealTint : C.field,
                display: "grid",
                placeContent: "center",
                textAlign: "center",
                gap: 8,
              }}
            >
              <div style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 36, color: C.ink }}>{n.title}</div>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: C.inkSoft }}>{n.sub}</div>
            </Rise>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 410 + i * 350,
                top: 472,
                width: 50,
                height: 6,
                background: C.ink,
                scale: `${interpolate(frame, [NODES[i + 1].at - 6, NODES[i + 1].at + 8], [0, 1], { ...CLAMP, easing: OUT })} 1`,
                transformOrigin: "left",
              }}
            />
          ))}
          <div style={{ position: "absolute", left: 110, top: 650, width: 1700, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {CHIPS.map((c, i) => (
              <span
                key={c}
                style={{
                  fontFamily: F.mono,
                  fontSize: 26,
                  padding: "10px 22px",
                  borderRadius: 40,
                  background: C.ink,
                  color: C.paper,
                  opacity: ramp(frame, 170 + i * 10, 10),
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", gap: 18, opacity: card }}>
          <div style={{ fontFamily: F.display, fontSize: 210, color: C.paper, lineHeight: 1 }}>असली है?</div>
          <div style={{ fontFamily: F.display, fontSize: 64, color: C.seal }}>Asli hai?</div>
          <div style={{ fontFamily: F.ui, fontSize: 52, fontWeight: 600, color: C.paper, marginTop: 10 }}>One tap before a parent pays.</div>
          <div style={{ justifySelf: "center", marginTop: 34, fontFamily: F.mono, fontSize: 40, color: C.ink, background: C.seal, padding: "14px 30px", borderRadius: 14 }}>
            github.com/Deveshu04/OpenAI-DevDay-Asli-Hai-
          </div>
          <div style={{ fontFamily: F.ui, fontSize: 34, color: C.rule }}>Run it with your own Bolna key · built on Bolna</div>
        </div>
      )}
    </Stage>
  );
};
