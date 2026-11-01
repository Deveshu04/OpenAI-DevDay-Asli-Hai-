import { Audio } from "@remotion/media";
import { getInputProps, Sequence, useVideoConfig } from "remotion";

const SOUNDS = {
  tap: "https://remotion.media/mouse-click.wav",
  switch: "https://remotion.media/switch.wav",
  ding: "https://remotion.media/ding.wav",
};

/** A short UI sound placed at a scene frame. */
export const Sfx: React.FC<{ readonly at: number; readonly kind: keyof typeof SOUNDS; readonly volume?: number }> = ({ at, kind, volume = 0.5 }) => {
  const { fps } = useVideoConfig();
  // Rendering every Nth frame (GIFs) trips Remotion's audio mixing even with --muted, so those renders pass {"sfx": false}.
  if (getInputProps().sfx === false) return null;
  return (
    <Sequence from={at} durationInFrames={fps * 2} premountFor={fps} name={`sfx ${kind}`}>
      <Audio src={SOUNDS[kind]} volume={volume} />
    </Sequence>
  );
};
