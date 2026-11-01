import { Composition, Folder } from "remotion";
import { Film, FILM_FRAMES } from "./Film";
import { End, END_FRAMES } from "./scenes/End";
import { Hook, HOOK_FRAMES } from "./scenes/Hook";
import { MadeForHer, MADE_FOR_HER_FRAMES } from "./scenes/MadeForHer";
import { OtherPaths, OTHER_PATHS_FRAMES } from "./scenes/OtherPaths";
import { Press, PRESS_FRAMES } from "./scenes/Press";
import { Trust, TRUST_FRAMES } from "./scenes/Trust";
import { TwoCalls, TWO_CALLS_FRAMES } from "./scenes/TwoCalls";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AsliHaiFilm" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
      <Folder name="Scenes">
        <Composition id="Hook" component={Hook} durationInFrames={HOOK_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="OneTap" component={Press} durationInFrames={PRESS_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="TwoCalls" component={TwoCalls} durationInFrames={TWO_CALLS_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="OtherPaths" component={OtherPaths} durationInFrames={OTHER_PATHS_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="MadeForHer" component={MadeForHer} durationInFrames={MADE_FOR_HER_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Trust" component={Trust} durationInFrames={TRUST_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="End" component={End} durationInFrames={END_FRAMES} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
