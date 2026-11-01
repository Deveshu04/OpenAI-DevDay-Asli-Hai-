import { useCurrentFrame } from "remotion";
import { C, F } from "../lib/theme";
import { CallScreen } from "../ui/CallScreen";
import { Rise, Stage, Wipe } from "../ui/Overlays";
import { Phone } from "../ui/Phone";
import type { Cue } from "../ui/Soundtrack";

export const HOOK_FRAMES = 640;
export const HOOK_VO: readonly Cue[] = [
  { id: "hook_scam1", at: 66 },
  { id: "hook_scam2", at: 196 },
  { id: "hook_n1", at: 334 },
  { id: "hook_n2", at: 502 },
];

const quote: React.CSSProperties = { left: 120, width: 1000, fontFamily: F.display, color: C.paper, fontSize: 74, lineHeight: 1.12 };
const plain: React.CSSProperties = { left: 120, width: 940, fontFamily: F.ui, color: C.paper, fontSize: 44, lineHeight: 1.3, fontWeight: 600 };

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const answered = frame >= 54;
  return (
    <Stage dark>
      <Phone style={{ left: 1240, top: 100 }} screen={answered ? C.paper : C.phone}>
        <CallScreen
          frame={frame}
          state={answered ? "active" : "incoming"}
          name="अज्ञात नंबर"
          sub="+91 9XXXX XX421"
          avatar="?"
          avatarColor="#c7d2e3"
          connectedAt={54}
          speaking={frame >= 66 && frame < 323 ? "them" : null}
          bubbles={[
            { at: 66, who: "them", text: "मम्मी, मैं राहुल… मेरा एक्सीडेंट हो गया है।", en: "Mummy, it's Rahul… I've had an accident." },
            { at: 196, who: "them", text: "अभी ₹50,000 भेज दो। पापा को मत बताना।", en: "Send ₹50,000 right now. Don't tell Papa." },
          ]}
        />
      </Phone>
      <Wipe frame={frame} at={66} style={{ ...quote, top: 170 }}>
        “Mummy, accident ho gaya.”
      </Wipe>
      <Wipe frame={frame} at={196} style={{ ...quote, top: 280 }}>
        “₹50,000 bhejo. Papa ko mat batana.”
      </Wipe>
      <Rise frame={frame} at={332} style={{ ...plain, top: 520 }}>
        A scam like this works in the <span style={{ color: C.seal }}>two minutes</span> between the call and the transfer.
      </Rise>
      <Rise frame={frame} at={500} style={{ ...plain, top: 690, color: C.seal }}>
        Asli hai? is built for those two minutes.
      </Rise>
    </Stage>
  );
};
