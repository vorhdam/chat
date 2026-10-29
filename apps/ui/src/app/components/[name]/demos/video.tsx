// START
import {
  VideoControlFullscreen,
  VideoControlGroup,
  VideoControlList,
  VideoControlLoop,
  VideoControlPlay,
  VideoControlPlaybackRate,
  VideoControlSeek,
  VideoControlTimer,
  VideoControlVolume,
  VideoPlayer,
  VideoProvider,
} from "@/components/ui/video";

export default function VideoDemo() {
  return (
    <>
      <VideoProvider>
        <VideoPlayer src="/assets/video.webm">
          <VideoControlSeek />
          <VideoControlList>
            <VideoControlGroup>
              <VideoControlPlay>Play</VideoControlPlay>
              <VideoControlTimer />
            </VideoControlGroup>
            <VideoControlGroup>
              <VideoControlLoop>Loop</VideoControlLoop>
              <VideoControlPlaybackRate rates={[0.5, 0.75, 1, 1.25, 2]}>
                Playback Rate
              </VideoControlPlaybackRate>
              <VideoControlVolume>Volume</VideoControlVolume>
              <VideoControlFullscreen>Fullscreen</VideoControlFullscreen>
            </VideoControlGroup>
          </VideoControlList>
        </VideoPlayer>
      </VideoProvider>
      <span className="text-muted-foreground italic">
        Porsche 911 - The one and always. © Porsche
      </span>
    </>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "video",
  "player",
  "controls",
];
