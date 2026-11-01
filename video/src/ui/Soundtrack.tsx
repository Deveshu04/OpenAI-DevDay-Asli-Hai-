import { Audio } from "@remotion/media";
import { getInputProps, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import LENGTHS from "../data/vo.json";

/** A voice clip from public/vo/ (made by scripts/voice.py), starting at a frame. */
export type Cue = { readonly id: keyof typeof LENGTHS; readonly at: number };

const FULL = 0.66;
const DUCKED = 0.15;

// GIF renders pass {"sfx": false}: every-Nth-frame renders trip Remotion's audio mixing.
const audible = () => getInputProps().sfx !== false;

export const Voices: React.FC<{ readonly cues: readonly Cue[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  if (!audible()) return null;
  return (
    <>
      {cues.map((c) => (
        <Sequence key={c.id} from={c.at} durationInFrames={Math.ceil(LENGTHS[c.id] * fps) + 6} premountFor={fps} name={`vo ${c.id}`}>
          <Audio src={staticFile(`vo/${c.id}.mp3`)} />
        </Sequence>
      ))}
    </>
  );
};

/** The score from scripts/score.py, pulled down under every voice. */
export const Score: React.FC<{ readonly cues: readonly Cue[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  if (!audible()) return null;
  const volume = (f: number) =>
    cues.reduce((v, c) => {
      const end = c.at + LENGTHS[c.id] * fps;
      return Math.min(v, interpolate(f, [c.at - 10, c.at, end, end + 16], [FULL, DUCKED, DUCKED, FULL], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    }, FULL);
  return <Audio src={staticFile("score.mp3")} volume={volume} />;
};
