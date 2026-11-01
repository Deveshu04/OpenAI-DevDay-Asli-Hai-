import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { End, END_FRAMES, END_VO } from "./scenes/End";
import { Hook, HOOK_FRAMES, HOOK_VO } from "./scenes/Hook";
import { MadeForHer, MADE_FOR_HER_FRAMES, MADE_FOR_HER_VO } from "./scenes/MadeForHer";
import { OtherPaths, OTHER_PATHS_FRAMES, OTHER_PATHS_VO } from "./scenes/OtherPaths";
import { Press, PRESS_FRAMES, PRESS_VO } from "./scenes/Press";
import { Trust, TRUST_FRAMES, TRUST_VO } from "./scenes/Trust";
import { TwoCalls, TWO_CALLS_FRAMES, TWO_CALLS_VO } from "./scenes/TwoCalls";
import { type Cue, Score, Voices } from "./ui/Soundtrack";

export const CUT = 15;
export const FILM_FRAMES =
  HOOK_FRAMES + PRESS_FRAMES + TWO_CALLS_FRAMES + OTHER_PATHS_FRAMES + MADE_FOR_HER_FRAMES + TRUST_FRAMES + END_FRAMES - CUT * 6;

const SCENES: readonly [number, readonly Cue[]][] = [
  [HOOK_FRAMES, HOOK_VO],
  [PRESS_FRAMES, PRESS_VO],
  [TWO_CALLS_FRAMES, TWO_CALLS_VO],
  [OTHER_PATHS_FRAMES, OTHER_PATHS_VO],
  [MADE_FOR_HER_FRAMES, MADE_FOR_HER_VO],
  [TRUST_FRAMES, TRUST_VO],
  [END_FRAMES, END_VO],
];
// Cues are scene-local; each scene starts CUT frames before the previous one ends, because the fades overlap.
const CUES: readonly Cue[] = SCENES.flatMap(([, cues], i) => {
  const start = SCENES.slice(0, i).reduce((t, [frames]) => t + frames - CUT, 0);
  return cues.map((c) => ({ ...c, at: c.at + start }));
});

export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Score cues={CUES} />
      <Voices cues={CUES} />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={HOOK_FRAMES} premountFor={fps}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="One tap" durationInFrames={PRESS_FRAMES} premountFor={fps}>
          <Press />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="Two calls" durationInFrames={TWO_CALLS_FRAMES} premountFor={fps}>
          <TwoCalls />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="Other paths" durationInFrames={OTHER_PATHS_FRAMES} premountFor={fps}>
          <OtherPaths />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="Made for her" durationInFrames={MADE_FOR_HER_FRAMES} premountFor={fps}>
          <MadeForHer />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="Trust" durationInFrames={TRUST_FRAMES} premountFor={fps}>
          <Trust />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CUT })} />
        <TransitionSeries.Sequence name="End" durationInFrames={END_FRAMES} premountFor={fps}>
          <End />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
