import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PICKER, type TapLang } from "../data/copy";
import { CLAMP, GLIDE, OUT, ramp } from "../lib/anim";
import { C, F } from "../lib/theme";
import { Chapter, Finger, Rise, Stage, Wipe } from "../ui/Overlays";
import { Phone } from "../ui/Phone";
import { SignupScreen, type SignupStep } from "../ui/Screens";
import { Sfx } from "../ui/Sfx";
import { TapScreen } from "../ui/TapScreen";
import type { Cue } from "../ui/Soundtrack";

// Beats, in scene frames: one button, languages, larger text, screen readers, the family's signup.
const A = 0;
const B = 300;
const CC = 720;
const D = 1000;
const E = 1320;
export const MADE_FOR_HER_FRAMES = 1860;
export const MADE_FOR_HER_VO: readonly Cue[] = [
  { id: "mfh_n1", at: A + 15 },
  { id: "mfh_n2", at: B + 15 },
  { id: "mfh_n3", at: CC + 15 },
  { id: "mfh_n4", at: D + 15 },
  { id: "mfh_n5", at: E + 15 },
];

const PX = 300;
const PY = 100;
const SX = PX + 14;
const SY = PY + 14 + 54;

const head: React.CSSProperties = { position: "relative", fontFamily: F.display, fontSize: 80, lineHeight: 1.1, color: C.ink, textWrap: "balance" };
const body: React.CSSProperties = { position: "relative", fontFamily: F.ui, fontSize: 38, lineHeight: 1.38, color: C.ink };

// Headline, text and any extra stack in one column, so a two-line headline pushes the rest down instead of overlapping it.
const Beat: React.FC<{ readonly title: string; readonly text: string; readonly children?: React.ReactNode }> = ({ title, text, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 940, top: 210, width: 860, display: "flex", flexDirection: "column", gap: 26 }}>
      <Wipe frame={frame} at={4} style={head}>
        {title}
      </Wipe>
      <Rise frame={frame} at={18} style={body}>
        {text}
      </Rise>
      <Rise frame={frame} at={30} style={{ position: "relative", marginTop: 14 }}>
        {children}
      </Rise>
    </div>
  );
};

const Said: React.FC<{ readonly frame: number; readonly from: number; readonly to: number; readonly role: string; readonly children: React.ReactNode }> = ({ frame, from, to, role, children }) => {
  if (frame < from || frame >= to) return null;
  return (
    <div style={{ padding: "22px 28px", borderRadius: 18, background: C.ink, color: C.paper, opacity: ramp(frame, from, 8) }}>
      <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: C.seal }}>Screen reader says</div>
      <div style={{ fontFamily: F.ui, fontSize: 40, fontWeight: 600, marginTop: 8 }}>
        {children} <span style={{ color: C.rule, fontWeight: 400 }}>· {role}</span>
      </div>
    </div>
  );
};

const langAt = (f: number): TapLang => {
  if (f < B + 182) return "hi";
  if (f < B + 250) return "ta";
  if (f < B + 310) return "bn";
  if (f < B + 370) return "pa";
  if (f < CC) return "en";
  return "hi";
};

const stepAt = (f: number): { step: SignupStep; typed: number } => {
  const s = f - E;
  const plan: [number, SignupStep][] = [[0, "intro"], [50, "parentName"], [110, "parentPhone"], [170, "language"], [230, "first"], [290, "word"], [370, "review"], [430, "done"]];
  let current = plan[0];
  for (const p of plan) if (s >= p[0]) current = p;
  return { step: current[1], typed: interpolate(s, [current[0] + 8, current[0] + 40], [0, 1], CLAMP) };
};

export const MadeForHer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lang = langAt(frame);
  const b = frame - B;

  const pickerOpen = interpolate(b, [48, 60, 172, 182], [0, 1, 1, 0], CLAMP);
  const pickerActive = Math.min(6, Math.max(0, Math.floor((b - 70) / 15)));
  const focus: "picker" | "size" | "seal" | null =
    (b >= 20 && b < 190) ? "picker" : frame >= CC + 30 && frame < CC + 120 ? "size" :
    frame >= D + 20 && frame < D + 110 ? "picker" : frame >= D + 110 && frame < D + 200 ? "size" : frame >= D + 200 && frame < E ? "seal" : null;
  const largeOn = frame >= CC + 60 && frame < D;
  const textScale = frame >= CC && frame < D ? interpolate(frame, [CC + 60, CC + 90], [1, 1.25], { ...CLAMP, easing: OUT }) : 1;
  const srPressed = frame >= D + 250;
  const signup = frame >= E;
  const { step, typed } = stepAt(frame);
  const swap = interpolate(frame, [E - 12, E, E + 12], [1, 0.0, 1], CLAMP);
  const nudge = interpolate(frame, [A, A + 300], [1.04, 1], { ...CLAMP, easing: GLIDE });

  return (
    <Stage>
      <Chapter frame={frame} n="04" title="Made for her" />
      <Sfx at={B + 44} kind="tap" />
      <Sfx at={B + 176} kind="tap" />
      <Sfx at={CC + 60} kind="switch" volume={0.4} />
      <Sfx at={D + 242} kind="tap" />
      <div style={{ position: "absolute", inset: 0, scale: frame < B ? nudge : 1, transformOrigin: `${SX + 201}px ${SY + 400}px` }}>
        <Phone style={{ left: PX, top: PY, opacity: swap }}>
          {signup ? (
            <SignupScreen step={step} typed={typed} profiles={["Sunita", "Ramesh", "Priya"].slice(0, Math.max(1, Math.min(3, Math.floor((frame - E - 440) / 30) + 1)))} />
          ) : (
            <TapScreen
              lang={lang}
              pickerOpen={pickerOpen}
              pickerActive={pickerActive}
              focus={focus}
              largeOn={largeOn}
              textScale={textScale}
              calling={srPressed}
              press={interpolate(frame, [D + 236, D + 242, D + 252], [0, 1, 0], CLAMP)}
            />
          )}
        </Phone>
        <Finger frame={frame} pressAt={B + 44} hideAt={B + 52} path={[{ at: B + 20, x: 820, y: 360 }, { at: B + 38, x: SX + 262, y: SY + 39 }]} />
        <Finger frame={frame} pressAt={B + 176} hideAt={B + 186} path={[{ at: B + 150, x: 800, y: 760 }, { at: B + 168, x: SX + 230, y: SY + 74 + 6 + 6 * 45 + 22 }]} />
        <Finger frame={frame} pressAt={CC + 60} hideAt={CC + 70} path={[{ at: CC + 30, x: 820, y: 360 }, { at: CC + 52, x: SX + 359, y: SY + 39 }]} />
      </div>

      <Sequence name="One button" from={A} durationInFrames={B - A} premountFor={fps}>
        <Beat title="One button." text="No forms, no menus, nothing to learn. Pressing it is the only thing she ever has to do. Everything else happens on a phone call, in her language." />
      </Sequence>
      <Sequence name="Her language" from={B} durationInFrames={CC - B} premountFor={fps}>
        <Beat title="Her language, her script." text="Hindi, English, Hinglish and ten more Indian languages, each in its own script. The family picks hers once at signup; the button remembers it.">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {PICKER.map((p) => {
              const on = p.code === lang;
              return (
                <span key={p.code} lang={p.code === "od" ? "or" : p.code} style={{ fontFamily: F.ui, fontSize: 30, fontWeight: 700, padding: "6px 16px", borderRadius: 30, border: `2px solid ${on ? C.ink : C.rule}`, background: on ? C.seal : "transparent", color: C.ink }}>
                  {p.native}
                </span>
              );
            })}
          </div>
        </Beat>
      </Sequence>
      <Sequence name="Larger text" from={CC} durationInFrames={D - CC} premountFor={fps}>
        <Beat title="Bigger text, in one tap." text="A+ makes every word on her screen larger, and her phone remembers the setting. The button itself never gets smaller than a palm." />
      </Sequence>
      <Sequence name="Screen readers" from={D} durationInFrames={E - D} premountFor={fps}>
        <Beat title="Every control has a name." text="Screen readers hear what each control is and what it does, and every change of state is announced as it happens.">
          <Said frame={frame - D} from={20} to={110} role="combo box">{COPY.i18n.en["prefs.language"]}, हिंदी</Said>
          <Said frame={frame - D} from={110} to={200} role="toggle button, not pressed">{COPY.i18n.en["prefs.larger"]}</Said>
          <Said frame={frame - D} from={200} to={250} role="button">{COPY.tap.hi.press}</Said>
          <Said frame={frame - D} from={250} to={320} role="status">{COPY.tap.hi.ringing}</Said>
        </Beat>
      </Sequence>
      <Sequence name="Family signup" from={E} durationInFrames={MADE_FOR_HER_FRAMES - E} premountFor={fps}>
        <Beat title="The family sets it up." text="One question per screen, big inputs, a review before anything is saved. And one phone can protect a mother, a father and a sister, each with their own button." />
      </Sequence>
    </Stage>
  );
};
