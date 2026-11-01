import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, GLIDE, OUT, ramp } from "../lib/anim";
import { C, F } from "../lib/theme";
import { Chapter, EventLog, Finger, Rise, Stage, Wipe } from "../ui/Overlays";
import { Phone } from "../ui/Phone";
import { HomeScreen } from "../ui/Screens";
import { Sfx } from "../ui/Sfx";
import { TapScreen } from "../ui/TapScreen";
import type { Cue } from "../ui/Soundtrack";

export const PRESS_FRAMES = 540;
export const PRESS_VO: readonly Cue[] = [
  { id: "press_n1", at: 20 },
  { id: "press_n2", at: 270 },
];

// Phone at left 420, top 100: the screen's top-left corner sits at (434, 168) on the stage.
const SX = 434;
const SY = 168;
const ICON = { x: 245, y: 416 };
const SEAL = { x: 201, y: 405 };

export const Press: React.FC = () => {
  const frame = useCurrentFrame();
  const opened = frame >= 64;
  const pressed = frame >= 184;
  const zoom = interpolate(frame, [96, 140, 330, 380], [1, 1.16, 1.16, 1], { ...CLAMP, easing: GLIDE });
  const body: React.CSSProperties = { left: 1010, width: 800, fontFamily: F.ui, fontSize: 40, lineHeight: 1.35, color: C.ink };

  return (
    <Stage>
      <Chapter frame={frame} n="01" title="One tap" />
      <Sfx at={52} kind="tap" />
      <Sfx at={182} kind="tap" />
      <div style={{ position: "absolute", inset: 0, scale: zoom, transformOrigin: "635px 600px" }}>
        <Phone style={{ left: 420, top: 100 }}>
          {opened ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: `${ICON.x}px ${ICON.y}px`,
                scale: interpolate(frame, [64, 82], [0.18, 1], { ...CLAMP, easing: OUT }),
                opacity: ramp(frame, 64, 8),
              }}
            >
              <TapScreen
                lang="hi"
                calling={pressed}
                press={interpolate(frame, [176, 182, 192], [0, 1, 0], CLAMP)}
                ripple={interpolate(frame, [184, 214], [0, 1], CLAMP)}
              />
            </div>
          ) : (
            <HomeScreen highlight={interpolate(frame, [20, 40, 50, 60], [0, 1, 1, 0.6], CLAMP)} />
          )}
        </Phone>
        <Finger frame={frame} pressAt={52} hideAt={60} path={[{ at: 18, x: 860, y: 930 }, { at: 46, x: SX + ICON.x, y: SY + ICON.y }]} />
        <Finger frame={frame} pressAt={182} hideAt={196} path={[{ at: 146, x: 860, y: 960 }, { at: 174, x: SX + SEAL.x, y: SY + SEAL.y }]} />
      </div>

      <Wipe frame={frame} at={96} style={{ left: 1010, top: 190, fontFamily: F.display, fontSize: 96, color: C.ink, lineHeight: 1.1 }}>
        One tap.
      </Wipe>
      <Rise frame={frame} at={112} style={{ ...body, top: 320 }}>
        Sunita opens the button her son added to her home screen and presses it. Nothing to read, nothing to fill in.
      </Rise>
      <Rise frame={frame} at={265} style={{ ...body, top: 530, fontWeight: 600 }}>
        Two calls start at the same moment: <span style={{ background: C.sealTint, padding: "0 8px" }}>Saathi calls Sunita</span>, and her son Rahul gets a rescue call.
      </Rise>
      <EventLog
        frame={frame}
        style={{ left: 1010, top: 760, width: 780 }}
        lines={[
          { at: 236, t: "00.0", text: "tap → POST /trigger" },
          { at: 262, t: "00.6", text: "Bolna call → Sunita · parent line (Saathi)" },
          { at: 288, t: "00.9", text: "Bolna call → Rahul · rescue call" },
        ]}
      />
    </Stage>
  );
};
