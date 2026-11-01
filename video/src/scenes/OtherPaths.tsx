import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY } from "../data/copy";
import { C, F } from "../lib/theme";
import { type Bubble, CallScreen } from "../ui/CallScreen";
import { Chapter, Rise, Stage, Wipe } from "../ui/Overlays";
import { Phone, PHONE_W } from "../ui/Phone";
import type { Cue } from "../ui/Soundtrack";

export const BEAT = 240;
const GENUINE = 360;
export const OTHER_PATHS_FRAMES = GENUINE + BEAT * 4;
export const OTHER_PATHS_VO: readonly Cue[] = [
  { id: "other_n1", at: 15 },
  { id: "other_n2", at: GENUINE + 10 },
  { id: "other_n3", at: GENUINE + BEAT + 8 },
  { id: "other_n4", at: GENUINE + BEAT * 2 + 10 },
  { id: "other_n5", at: GENUINE + BEAT * 3 + 10 },
];

const S = COPY.saathi;
const L = COPY.lines;
const fixed = { tag: "Fixed line", tone: "fixed" as const };
const SCALE = 0.95;
const MOM_X = 860;
const SON_X = 1350;

type BeatProps = {
  readonly title: string;
  readonly sub: string;
  readonly mom: readonly Bubble[];
  readonly son: readonly Bubble[];
  readonly momName?: string;
  readonly momSub?: string;
  readonly momAvatar?: string;
  readonly sonIncomingAt?: number;
  readonly toast?: string;
};

const PathBeat: React.FC<BeatProps> = ({ title, sub, mom, son, momName = "असली है? · साथी", momSub = "Saathi", momAvatar = "स", sonIncomingAt, toast }) => {
  const frame = useCurrentFrame();
  const speakingOf = (list: readonly Bubble[]) => {
    const live = list.filter((b) => frame >= b.at && frame < b.at + 70);
    return live.length ? live[live.length - 1].who : null;
  };
  const label = (x: number, name: string) => (
    <div style={{ position: "absolute", left: x, top: 52, width: PHONE_W * SCALE, textAlign: "center", fontFamily: F.ui, fontSize: 28, fontWeight: 800, color: C.ink }}>{name}</div>
  );
  const sonIncoming = sonIncomingAt !== undefined && frame >= sonIncomingAt;

  return (
    <>
      <div style={{ position: "absolute", left: 110, top: 300, width: 680, display: "flex", flexDirection: "column", gap: 28 }}>
        <Wipe frame={frame} at={6} style={{ position: "relative", fontFamily: F.display, fontSize: 80, lineHeight: 1.1, color: C.ink, textWrap: "balance" }}>
          {title}
        </Wipe>
        <Rise frame={frame} at={20} style={{ position: "relative", fontFamily: F.ui, fontSize: 40, lineHeight: 1.36, color: C.ink }}>
          {sub}
        </Rise>
      </div>
      {label(MOM_X, "सुनीता")}
      {label(SON_X, "राहुल")}
      <Phone style={{ left: MOM_X, top: 100, scale: SCALE, transformOrigin: "top left" }}>
        <CallScreen frame={frame} state="active" name={momName} sub={momSub} avatar={momAvatar} connectedAt={-300} bubbles={mom} speaking={speakingOf(mom)} />
        {toast ? (
          <div style={{ position: "absolute", top: 104, left: 16, right: 16, padding: "12px 16px", borderRadius: 14, background: C.ink, color: C.field, fontFamily: F.ui, fontSize: 19, fontWeight: 600, opacity: frame >= 30 ? 1 : 0 }}>
            {toast}
          </div>
        ) : null}
      </Phone>
      <Phone style={{ left: SON_X, top: 100, scale: SCALE, transformOrigin: "top left" }} screen={sonIncoming ? C.phone : C.paper}>
        {sonIncoming ? (
          <CallScreen frame={frame} state="incoming" name="असली है? · साथी" sub="Saathi · कॉल आ रहा है" avatar="स" />
        ) : (
          <CallScreen frame={frame} state="active" name="असली है? · साथी" sub="Rescue call" avatar="स" connectedAt={-400} bubbles={son} speaking={speakingOf(son)} />
        )}
      </Phone>
    </>
  );
};

export const OtherPaths: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Chapter frame={frame} n="03" title="Every other path" />
      <Sequence name="Really him" durationInFrames={GENUINE} premountFor={fps}>
        <PathBeat
          title="Really him?"
          sub="Rahul says yes and gives the family word. The backend checks it, then Saathi tells her it's real."
          mom={[
            { at: 12, who: "me", text: "राहुल बोल रहा है कि उसका बटुआ खो गया, ₹5,000 चाहिए।", en: "Rahul says he's lost his wallet and needs ₹5,000." },
            {
              at: 220,
              who: "them",
              tone: "ok",
              tag: "Event · child_confirmed",
              text: "राहुल ने ख़ुद पुष्टि की है और फ़ैमिली वर्ड भी सही बताया। यह कॉल असली है। पैसे सिर्फ़ उसी खाते में भेजिए जो राहुल ख़ुद बताए, और पहले उनके सेव किए नंबर पर वापस कॉल कर लीजिए।",
              en: "Rahul confirmed it himself and gave the family word. This call is real. Pay only into the account Rahul gives you, after calling him back on his saved number.",
            },
          ]}
          son={[
            { at: 30, who: "them", tag: "Story arrives · event", text: L.hi.verify, en: L.en.verify },
            { at: 100, who: "me", text: "हाँ, वो मैं ही था।", en: "Yes, that was me." },
            { at: 140, who: "them", text: "ठीक है। कृपया फ़ैमिली वर्ड बताइए।", en: "All right. Please say the family word." },
            { at: 178, who: "me", tag: "Only the backend checks it", text: "● ● ● ● ●", en: "(family word hidden)" },
          ]}
        />
      </Sequence>
      <Sequence name="Police or CBI" from={GENUINE} durationInFrames={BEAT} premountFor={fps}>
        <PathBeat
          title="Police or CBI?"
          sub="Saathi plays the fixed warning, and Rahul hears what happened straight away."
          mom={[
            { at: 14, who: "me", text: "CBI वाले बोल रहे हैं कि मैं डिजिटल अरेस्ट में हूँ।", en: "They say they're from CBI and I'm under digital arrest." },
            { at: 60, who: "them", ...fixed, text: S.authority_scam.hi, en: S.authority_scam.en },
          ]}
          son={[
            { at: 40, who: "them", text: `${L.hi.rescue_greeting.split("।")[0]}।`, en: `${L.en.rescue_greeting.split(". ")[0]}.` },
            { at: 96, who: "them", tag: "Story arrives · event", text: L.hi.update_authority, en: L.en.update_authority },
          ]}
        />
      </Sequence>
      <Sequence name="Money already sent" from={GENUINE + BEAT} durationInFrames={BEAT} premountFor={fps}>
        <PathBeat
          title="Money already sent?"
          sub="1930, the cybercrime helpline, right away. Rahul is told to call her."
          mom={[
            { at: 14, who: "me", text: "मैंने तो पाँच हज़ार भेज भी दिए…", en: "I've already sent five thousand…" },
            { at: 56, who: "them", ...fixed, text: S.already_paid.hi, en: S.already_paid.en },
          ]}
          son={[{ at: 96, who: "them", tag: "Story arrives · event", text: L.hi.update_paid, en: L.en.update_paid }]}
        />
      </Sequence>
      <Sequence name="Can't take the call" from={GENUINE + BEAT * 2} durationInFrames={BEAT} premountFor={fps}>
        <PathBeat
          title="Still on the scam call?"
          sub="If she can't take Saathi's call, Rahul is told to call her himself."
          momName="अज्ञात नंबर"
          momSub="+91 9XXXX XX421"
          momAvatar="?"
          toast="मिस्ड कॉल · असली है? साथी"
          mom={[{ at: 10, who: "them", text: "पैसे भेजो, जल्दी! फ़ोन मत काटना।", en: "Send the money, quickly! Don't hang up." }]}
          son={[
            { at: 60, who: "them", tag: "Story arrives · event", text: L.hi.update_unreachable, en: L.en.update_unreachable },
            { at: 130, who: "them", ...fixed, text: COPY.check.alert_done.hi, en: COPY.check.alert_done.en },
          ]}
        />
      </Sequence>
      <Sequence name="Couldn't confirm" from={GENUINE + BEAT * 3} durationInFrames={BEAT} premountFor={fps}>
        <PathBeat
          title="Couldn't reach the family?"
          sub="She can ask Saathi to call them again, and Saathi does."
          mom={[
            { at: 10, who: "them", ...fixed, text: S.verdict_unconfirmed.hi, en: S.verdict_unconfirmed.en },
            { at: 86, who: "me", text: "क्या आप उन्हें दोबारा कॉल कर सकती हैं?", en: "Can you call them again?" },
            { at: 128, who: "them", text: S.calling_family.hi, en: S.calling_family.en },
          ]}
          son={[]}
          sonIncomingAt={140}
        />
      </Sequence>
    </Stage>
  );
};
