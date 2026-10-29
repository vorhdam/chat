// START
import {
  AudioControlGroup,
  AudioControlLoop,
  AudioControlPlay,
  AudioControlPlaybackRate,
  AudioControlSeek,
  AudioControlTimer,
  AudioControlVolume,
  AudioPlayer,
  AudioProvider,
} from "@/components/ui/audio";

export default function AudioDemo() {
  return (
    <>
      <AudioProvider>
        <AudioPlayer src="/assets/audio.webm">
          <AudioControlPlay>Play</AudioControlPlay>
          <AudioControlSeek />
          <AudioControlGroup>
            <AudioControlTimer />
            <AudioControlPlaybackRate rates={[0.5, 0.75, 1, 1.25, 2]}>
              Playback rate
            </AudioControlPlaybackRate>
            <AudioControlVolume>Volume</AudioControlVolume>
            <AudioControlLoop>Loop</AudioControlLoop>
          </AudioControlGroup>
        </AudioPlayer>
      </AudioProvider>
      <span className="text-muted-foreground italic">
        Star Wars - A Galaxy Devided © Lucasfilm Ltd.
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
  "audio",
  "player",
  "waveform",
];
