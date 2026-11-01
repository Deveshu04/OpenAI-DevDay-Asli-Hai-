import { interpolate, useCurrentFrame } from "remotion";
import { COPY } from "../data/copy";
import { CLAMP, GLIDE } from "../lib/anim";
import { C, F } from "../lib/theme";
import { CallScreen } from "../ui/CallScreen";
import { Caption, Chapter, EventLog, Stage } from "../ui/Overlays";
import { Phone, PHONE_W } from "../ui/Phone";
import { Sfx } from "../ui/Sfx";
import type { Cue } from "../ui/Soundtrack";

export const TWO_CALLS_FRAMES = 1560;

const MOM_X = 110;
const SON_X = 1920 - 110 - PHONE_W;
const TOP = 138;
const LINE_Y = 392;
// The film opens this scene six seconds after the tap, while both phones are already ringing.
const T0 = 6;
const VERDICT = 780;
export const TWO_CALLS_VO: readonly Cue[] = [
  { id: "two_n1", at: 12 },
  { id: "two_n2", at: 225 },
  { id: "two_n3", at: 445 },
  { id: "two_n4", at: 620 },
  { id: "two_n5", at: VERDICT + 20 },
  { id: "two_n6", at: 1025 },
  { id: "two_n7", at: 1170 },
  { id: "two_rahul", at: 1300 },
  { id: "two_sunita", at: 1437 },
];

const L = COPY.lines;
const S = COPY.saathi;

/** A dot that runs along the line between the phones while an event travels. */
const Pulse: React.FC<{ frame: number; from: number; to: number; dir: 1 | -1 }> = ({ frame, from, to, dir }) => {
  const p = interpolate(frame, [from, to], [0, 1], { ...CLAMP, easing: GLIDE });
  if (frame < from || frame > to + 6) return null;
  const x0 = MOM_X + PHONE_W + 10;
  const x1 = SON_X - 10;
  const x = dir === 1 ? x0 + (x1 - x0) * p : x1 - (x1 - x0) * p;
  return <div style={{ position: "absolute", left: x - 14, top: LINE_Y - 14, width: 28, height: 28, borderRadius: "50%", background: C.seal, boxShadow: `0 0 0 6px ${C.paper}, 0 0 0 8px ${C.ink}` }} />;
};

const Label: React.FC<{ x: number; name: string; place: string }> = ({ x, name, place }) => (
  <div style={{ position: "absolute", left: x, top: 70, width: PHONE_W, textAlign: "center", fontFamily: F.ui, fontSize: 30, color: C.ink }}>
    <span style={{ fontWeight: 800 }}>{name}</span> <span style={{ color: C.inkSoft }}>· {place}</span>
  </div>
);

export const TwoCalls: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = T0 + Math.min(frame, VERDICT) / 30;
  const done = frame >= VERDICT;
  const momAnswered = frame >= 40;
  const sonAnswered = frame >= 70;
  const sonCallsBack = frame >= 1160;
  const momHearsSon = frame >= 1200;
  const momTalksToSon = frame >= 1290;

  const momSpeaking = (frame >= 55 && frame < 200) || (frame >= 370 && frame < 460) || (frame >= 780 && frame < 960) ? "them" : frame >= 230 && frame < 340 ? "me" : null;
  const sonSpeaking = (frame >= 90 && frame < 300) || (frame >= 450 && frame < 590) || (frame >= 800 && frame < 900) ? "them" : frame >= 620 && frame < 690 ? "me" : null;

  return (
    <Stage>
      <Chapter frame={frame} n="02" title="Two calls at once" x={772} />
      <Sfx at={VERDICT} kind="ding" volume={0.45} />
      <Label x={MOM_X} name="सुनीता" place="Lucknow" />
      <Label x={SON_X} name="राहुल" place="Bengaluru" />

      <div style={{ position: "absolute", left: MOM_X + PHONE_W + 10, width: SON_X - MOM_X - PHONE_W - 20, top: LINE_Y - 2, height: 4, backgroundImage: `repeating-linear-gradient(90deg, ${C.rule} 0 14px, transparent 14px 26px)` }} />
      <Pulse frame={frame} from={380} to={440} dir={1} />
      <Pulse frame={frame} from={700} to={766} dir={-1} />

      <div style={{ position: "absolute", left: 600, width: 720, top: 150, textAlign: "center", fontFamily: F.ui, color: C.ink }}>
        <div style={{ fontFamily: F.mono, fontSize: 132, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: done ? C.ok : C.ink }}>{seconds.toFixed(1)}</div>
        <div style={{ fontSize: 28, marginTop: 8, fontWeight: 600 }}>{done ? "seconds from tap to verdict" : "seconds since the tap"}</div>
        <div style={{ fontSize: 18, marginTop: 4, color: C.inkSoft }}>Answer times shortened for the film</div>
      </div>

      <EventLog
        frame={frame}
        style={{ left: 610, top: 440, width: 700 }}
        lines={[
          { at: 0, t: "00:06", text: "both phones ringing" },
          { at: 380, t: "00:18", text: "start_verification · “Rahul”, ₹50,000" },
          { at: 432, t: "00:20", text: "event rescue_verify → Rahul's call" },
          { at: 700, t: "00:29", text: "report_verdict · did_call: No" },
          { at: 760, t: "00:31", text: "event child_safe → Sunita's call" },
          { at: 1160, t: "00:40", text: "Rahul calls his mother" },
        ]}
      />

      <Phone style={{ left: MOM_X, top: TOP }} screen={momAnswered && !(momHearsSon && !momTalksToSon) ? C.paper : C.phone}>
        {momHearsSon && !momTalksToSon ? (
          <CallScreen frame={frame} state="incoming" name="राहुल" sub="बेटा · कॉल आ रहा है" avatar="र" />
        ) : momTalksToSon ? (
          <CallScreen
            frame={frame}
            state="active"
            name="राहुल"
            sub="बेटा"
            avatar="र"
            connectedAt={1290}
            speaking={frame >= 1300 && frame < 1430 ? "them" : frame >= 1437 && frame < 1490 ? "me" : null}
            bubbles={[
              { at: 1300, who: "them", text: "माँ, मैं बिल्कुल ठीक हूँ। वो कॉल मेरा नहीं था।", en: "Ma, I'm completely fine. That call wasn't me." },
              { at: 1437, who: "me", text: "भगवान का शुक्र है।", en: "Thank God." },
            ]}
          />
        ) : momAnswered ? (
          <CallScreen
            frame={frame}
            state="active"
            name="असली है? · साथी"
            sub="Saathi"
            avatar="स"
            connectedAt={40}
            speaking={momSpeaking}
            bubbles={[
              { at: 55, who: "them", text: L.hi.parent_greeting, en: L.en.parent_greeting },
              { at: 230, who: "me", text: "राहुल का फ़ोन आया था। बोला एक्सीडेंट हो गया है, ₹50,000 चाहिए।", en: "Rahul called. He said he's had an accident and needs ₹50,000." },
              { at: 370, who: "them", text: S.calling_family.hi, en: S.calling_family.en },
              { at: VERDICT, who: "them", tone: "ok", tag: "Fixed line · event", text: S.verdict_fake.hi, en: S.verdict_fake.en },
            ]}
          />
        ) : (
          <CallScreen frame={frame} state="incoming" name="असली है? · साथी" sub="Saathi · कॉल आ रहा है" avatar="स" />
        )}
      </Phone>

      <Phone style={{ left: SON_X, top: TOP }} screen={sonAnswered && !(sonCallsBack && !momTalksToSon) ? C.paper : C.phone}>
        {sonCallsBack && momTalksToSon ? (
          <CallScreen
            frame={frame}
            state="active"
            name="माँ"
            sub="Ma"
            avatar="म"
            connectedAt={1290}
            speaking={frame >= 1300 && frame < 1430 ? "me" : frame >= 1437 && frame < 1490 ? "them" : null}
            bubbles={[
              { at: 1300, who: "me", text: "माँ, मैं बिल्कुल ठीक हूँ। वो कॉल मेरा नहीं था।", en: "Ma, I'm completely fine. That call wasn't me." },
              { at: 1437, who: "them", text: "भगवान का शुक्र है।", en: "Thank God." },
            ]}
          />
        ) : sonCallsBack ? (
          <CallScreen frame={frame} state="outgoing" name="माँ" sub="कॉल किया जा रहा है…" avatar="म" />
        ) : sonAnswered ? (
          <CallScreen
            frame={frame}
            state="active"
            name="असली है? · साथी"
            sub="Rescue call"
            avatar="स"
            connectedAt={70}
            speaking={sonSpeaking}
            bubbles={[
              { at: 90, who: "them", text: L.hi.rescue_greeting, en: L.en.rescue_greeting },
              { at: 450, who: "them", tag: "Story arrives · event", text: L.hi.verify, en: L.en.verify },
              { at: 620, who: "me", text: "नहीं! मैंने कोई कॉल नहीं किया।", en: "No! I didn't call her." },
              { at: 800, who: "them", tag: "Fixed line", text: COPY.check.rescue_thanks.hi, en: COPY.check.rescue_thanks.en },
            ]}
          />
        ) : (
          <CallScreen frame={frame} state="incoming" name="असली है? · साथी" sub="Saathi · कॉल आ रहा है" avatar="स" />
        )}
      </Phone>

      {[
        { from: 10, to: 210, text: "Saathi calls Sunita. Rahul's phone rings at the same moment." },
        { from: 220, to: 430, text: "Sunita tells Saathi what happened, in her own words." },
        { from: 440, to: 610, text: "Her story is pushed straight into Rahul's live call." },
        { from: 620, to: 770, text: "Rahul says he never called." },
        { from: 780, to: 1010, text: "The verdict lands in Sunita's call, word for word, in about 30 seconds." },
        { from: 1020, to: 1160, text: "Rahul is asked to call her too." },
        { from: 1170, to: 1545, text: "So he does. The scammer gets nothing." },
      ].map((c) => (
        <Caption key={c.from} frame={frame} from={c.from} to={c.to} style={{ left: 610, width: 700, top: 820, textAlign: "center" }}>
          {c.text}
        </Caption>
      ))}
    </Stage>
  );
};
