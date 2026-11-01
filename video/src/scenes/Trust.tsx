import { useCurrentFrame } from "remotion";
import { C, F } from "../lib/theme";
import { Chapter, Rise, Stage, Wipe } from "../ui/Overlays";
import type { Cue } from "../ui/Soundtrack";

export const TRUST_FRAMES = 600;
export const TRUST_VO: readonly Cue[] = [
  { id: "trust_n1", at: 8 },
  { id: "trust_n2", at: 85 },
  { id: "trust_n3", at: 375 },
];

const CARDS = [
  { at: 40, title: "The family word stays secret.", text: "Stored only as a keyed hash. Never in a prompt, a log line or a message.", code: "HMAC-SHA256(normalize(word))" },
  { at: 100, title: "Saathi can't be talked into it.", text: "She never asks for an OTP, never promises money back, and every call is audited after it ends.", code: "guardrail_breach · Safety_Audit" },
  { at: 160, title: "Safety lines are fixed.", text: "Verdicts and warnings are pre-written in all 12 languages and can't be talked over.", code: "static nodes · ~50 ms" },
  { at: 220, title: "The official facts.", text: "There is no “digital arrest” in Indian law. If money went, call 1930 right away.", code: "1930 · cybercrime.gov.in" },
];

export const Trust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Chapter frame={frame} n="05" title="Safe by design" />
      <Wipe frame={frame} at={6} style={{ left: 120, top: 130, fontFamily: F.display, fontSize: 84, color: C.ink }}>
        It can't be talked into paying.
      </Wipe>
      {CARDS.map((card, i) => (
        <Rise
          key={card.title}
          frame={frame}
          at={card.at}
          style={{
            left: 120 + (i % 2) * 850,
            top: 300 + Math.floor(i / 2) * 340,
            width: 810,
            height: 300,
            padding: "34px 38px",
            borderRadius: 22,
            background: C.field,
            border: `2px solid ${C.rule}`,
            display: "grid",
            alignContent: "start",
            gap: 14,
          }}
        >
          <div style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 42, color: C.ink, lineHeight: 1.15 }}>{card.title}</div>
          <div style={{ fontFamily: F.ui, fontSize: 31, color: C.ink, lineHeight: 1.38 }}>{card.text}</div>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.inkSoft }}>{card.code}</div>
        </Rise>
      ))}
    </Stage>
  );
};
