"use client";

import { MenuTrigger } from "@base-ui/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "cn";
import {
  Check,
  Gauge,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Kbd } from "./kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

type AudioContext = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  graphRef: React.RefObject<globalThis.AudioContext | null>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: (val: number) => void;
  muted: boolean;
  setMuted: (val: boolean) => void;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: (val: number) => void;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
};

const DefaultAudioContext: AudioContext = {
  audioRef: { current: null },
  containerRef: { current: null },
  analyserRef: { current: null },
  graphRef: { current: null },
  paused: true,
  setPaused: () => {},
  progress: 0,
  setProgress: () => {},
  volume: 1,
  setVolume: () => {},
  muted: false,
  setMuted: () => {},
  loop: false,
  setLoop: () => {},
  playbackRate: 1,
  setPlaybackRate: () => {},
  duration: 0,
  setDuration: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
};

const WaveformCache = new WeakMap<
  HTMLAudioElement,
  { ctx: globalThis.AudioContext; analyser: AnalyserNode }
>();

const Context = React.createContext<AudioContext>(DefaultAudioContext);

type AudioProviderProps = {
  defaultVolume?: number;
  defaultMuted?: boolean;
  defaultLoop?: boolean;
  defaultRate?: number;
  children: React.ReactNode;
};

function AudioProvider({
  defaultVolume = 0.5,
  defaultMuted = false,
  defaultLoop = false,
  defaultRate = 1,
  children,
}: AudioProviderProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const analyserRef = React.useRef<AnalyserNode>(null);
  const graphRef = React.useRef<globalThis.AudioContext>(null);

  const [paused, setPaused] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<number>(0);
  const [volume, setVolumeState] = React.useState<number>(defaultVolume);
  const [muted, setMutedState] = React.useState<boolean>(defaultMuted);
  const [loop, setLoop] = React.useState<boolean>(defaultLoop);
  const [playbackRate, setPlaybackRateState] =
    React.useState<number>(defaultRate);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  const setVolume = React.useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const setMuted = React.useCallback((val: boolean) => {
    setMutedState(val);
    if (audioRef.current) audioRef.current.muted = val;
  }, []);

  const setPlaybackRate = React.useCallback((val: number) => {
    setPlaybackRateState(val);
    if (audioRef.current) audioRef.current.playbackRate = val;
  }, []);

  React.useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = loop;
    setDuration(audioRef.current.duration);

    if (WaveformCache.has(audioRef.current)) {
      const cached = WaveformCache.get(audioRef.current)!;
      analyserRef.current = cached.analyser;
      graphRef.current = cached.ctx;
      return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;
    graphRef.current = ctx;
    WaveformCache.set(audioRef.current, { ctx, analyser });
  }, [volume, muted, playbackRate, loop]);

  const values = React.useMemo(
    () => ({
      audioRef,
      containerRef,
      analyserRef,
      graphRef,
      paused,
      setPaused,
      progress,
      setProgress,
      volume,
      setVolume,
      muted,
      setMuted,
      loop,
      setLoop,
      playbackRate,
      setPlaybackRate,
      duration,
      setDuration,
      currentTime,
      setCurrentTime,
    }),
    [
      paused,
      progress,
      volume,
      setVolume,
      muted,
      setMuted,
      loop,
      setLoop,
      playbackRate,
      setPlaybackRate,
      duration,
      currentTime,
    ],
  );

  return <Context.Provider value={values}>{children}</Context.Provider>;
}

function AudioPlayer({
  src,
  className,
  children,
  ...props
}: React.ComponentProps<"audio">) {
  const {
    audioRef,
    containerRef,
    setPaused,
    setCurrentTime,
    setProgress,
    setDuration,
    graphRef,
    setMuted,
    muted,
    setLoop,
    loop,
    volume,
    setVolume,
  } = React.useContext(Context);

  const handlePlayToggle = React.useCallback(async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await graphRef.current?.resume();
      audioRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      audioRef.current.pause();
      setPaused(true);
    }
  }, [audioRef, graphRef, setPaused]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;
      e.preventDefault();

      if (e.code === "Space" || e.code === "KeyK") {
        handlePlayToggle();
      } else if (e.code === "KeyM") {
        setMuted(!muted);
      } else if (e.code === "KeyR") {
        setLoop(!loop);
      } else if (e.code === "ArrowUp") {
        setVolume(volume + 0.1);
        if (muted && volume + 0.1 > 0) setMuted(false);
      } else if (e.code === "ArrowDown") {
        setVolume(volume - 0.1);
      } else if (e.code === "ArrowLeft") {
        if (!audioRef.current) return;
        const newTime = Math.max(0, audioRef.current.currentTime - 10);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress((newTime / audioRef.current.duration) * 100);
      } else if (e.code === "ArrowRight") {
        if (!audioRef.current || !audioRef.current.duration) return;
        const newTime = Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + 10,
        );
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress((newTime / audioRef.current.duration) * 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePlayToggle,
    muted,
    setMuted,
    loop,
    setLoop,
    audioRef,
    volume,
    setVolume,
    setCurrentTime,
    setProgress,
  ]);

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100,
    );
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleEnded = () => {
    setPaused(true);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative flex items-center gap-3 bg-secondary rounded-xl px-3 py-2 min-h-14 dark:bg-secondary/50 outline-none",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        {...props}
      />
      <div className="flex items-center justify-between w-full gap-2">
        {children}
      </div>
    </div>
  );
}

function AudioControlSeek({ className }: { className?: string }) {
  const { audioRef, setProgress, setCurrentTime } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const newTime = ratio * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(ratio * 100);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("flex-1 flex items-center", className)}
      onClick={handleClick}
    >
      <Waveform className="w-full" />
    </div>
  );
}

function AudioControlGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

function AudioControlPlay({
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { children?: React.ReactNode }) {
  const { audioRef, graphRef, paused, setPaused } = React.useContext(Context);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    if (paused) {
      await graphRef.current?.resume();
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
    setPaused(!paused);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            aria-label={paused ? "Play" : "Pause"}
            className={cn(
              "text-card-foreground rounded-full aspect-square h-8",
              className,
            )}
            {...props}
          >
            {paused ? (
              <Play className="fill-current stroke-0" />
            ) : (
              <Pause className="fill-current stroke-0" />
            )}
          </Button>
        }
      />
      <TooltipContent>
        {children}
        <Kbd>K</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function AudioControlTimer({ className }: React.ComponentProps<"button">) {
  const { currentTime, duration } = React.useContext(Context);
  const [reverse, setReverse] = React.useState<boolean>(false);

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "0:00";
    const minutes = Math.floor(timeInSecs / 60);
    const seconds = Math.floor(timeInSecs % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const displayTime = reverse
    ? `-${formatTime(duration - currentTime)}`
    : formatTime(currentTime);

  return (
    <button
      type="button"
      aria-label="Toggle remaining time"
      className={cn(
        "text-card-foreground text-sm cursor-pointer bg-transparent border-none mx-1.5",
        className,
      )}
      onClick={() => setReverse((prev) => !prev)}
    >
      {displayTime}
      <span className="text-card-foreground/50 mx-1">/</span>
      {formatTime(duration)}
    </button>
  );
}

function AudioControlPlaybackRate({
  rates,
  className,
  children,
  ...props
}: MenuTrigger.Props & { rates: number[]; children?: React.ReactNode }) {
  const { playbackRate, setPlaybackRate } = React.useContext(Context);

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label="Playback speed"
              className={cn(
                "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
                className,
              )}
              {...props}
            >
              <Gauge className="size-4" />
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="bg-card text-card-foreground border-border"
      >
        {rates.map((rate) => (
          <DropdownMenuItem
            key={rate}
            onClick={() => handlePlaybackRate(rate)}
            className="flex items-center justify-between focus:bg-accent focus:text-card-foreground cursor-pointer"
          >
            {rate}x{playbackRate === rate && <Check className="size-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AudioControlLoop({
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { children?: React.ReactNode }) {
  const { loop, setLoop } = React.useContext(Context);

  const handleLoop = () => {
    setLoop(!loop);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLoop}
            aria-label="Toggle loop"
            className={cn(
              "text-card-foreground rounded-full aspect-square h-8",
              className,
            )}
            {...props}
          >
            {loop ? <Repeat1 /> : <Repeat />}
          </Button>
        }
      />
      <TooltipContent>
        {children}
        <Kbd>R</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function AudioControlVolume({
  className,
  children,
  ...props
}: MenuTrigger.Props & { children?: React.ReactNode }) {
  const { muted, volume, setMuted, setVolume } = React.useContext(Context);

  const value = React.useMemo(
    () => [muted ? 0 : (Number(volume) || 0) * 100],
    [muted, volume],
  );

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleVolume = (newVolume: number | readonly number[]) => {
    const nextValue = Array.isArray(newVolume) ? newVolume[0] : newVolume;
    setVolume(nextValue / 100);
    if (nextValue > 0 && muted) setMuted(false);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label="Volume settings"
              className={cn(
                "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
                className,
              )}
              {...props}
            >
              <VolumeIcon className="size-4" muted={muted} volume={volume} />
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>
          {children}
          <Kbd>M</Kbd>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-40">
        <div className="flex flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-accent-foreground/80 hover:bg-accent/20 rounded-full"
            onClick={handleMute}
          >
            <VolumeIcon muted={muted} volume={volume} />
          </Button>
          <Slider
            value={value}
            max={100}
            step={1}
            aria-label="Volume slider"
            className="w-20 transition-all mr-1.5"
            onValueChange={(v) => handleVolume(v)}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Waveform({
  className,
  playedClassName = "bg-primary",
  unplayedClassName = "bg-primary/20",
}: {
  className?: string;
  playedClassName?: string;
  unplayedClassName?: string;
}) {
  const BAR_W = 3;
  const BAR_GAP = 2;
  const TRANSITION_SPEED = 0.08;

  const { analyserRef, paused, progress } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const playedStateRef = React.useRef<boolean[]>([]);
  const rafRef = React.useRef<number>(0);
  const blendRef = React.useRef<number>(paused ? 1 : 0);
  const [barCount, setBarCount] = React.useState(0);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => {
      setBarCount(Math.floor(wrapper.clientWidth / (BAR_W + BAR_GAP)));
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  const staticHeights = React.useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => {
        const t = i / barCount;
        return (
          0.15 +
          0.35 * Math.abs(Math.sin(t * Math.PI * 6)) +
          0.2 * Math.abs(Math.sin(t * Math.PI * 13.7 + 1))
        );
      }),
    [barCount],
  );

  React.useEffect(() => {
    if (barCount === 0) return;

    const target = paused ? 1 : 0;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      blendRef.current += (target - blendRef.current) * TRANSITION_SPEED;
      if (Math.abs(blendRef.current - target) < 0.001)
        blendRef.current = target;
      const blend = blendRef.current;

      const analyser = analyserRef.current;
      let freqData: Uint8Array<ArrayBuffer> | null = null;
      if (analyser) {
        freqData = new Uint8Array(
          analyser.frequencyBinCount,
        ) as Uint8Array<ArrayBuffer>;
        analyser.getByteFrequencyData(freqData);
      }
      const step = freqData ? Math.floor(freqData.length / barCount) : 1;

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        const t = i / barCount;
        const liveValue = freqData ? freqData[i * step]! / 255 : 0;
        const value = liveValue * (1 - blend) + staticHeights[i]! * blend;

        // Ensure height is properly assigned as a percentage string
        bar.style.height = `${Math.max(15, value * 100)}%`;

        const played = t * 100 < progress;
        if (played !== playedStateRef.current[i]) {
          playedStateRef.current[i] = played;
          bar.className = cn(
            "shrink-0 rounded-full transition-colors",
            played ? playedClassName : unplayedClassName,
          );
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    analyserRef,
    paused,
    progress,
    barCount,
    staticHeights,
    playedClassName,
    unplayedClassName,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex-1 h-8 flex items-center overflow-hidden cursor-pointer",
        className,
      )}
      style={{ gap: `${BAR_GAP}px` }}
    >
      {Array.from({ length: barCount }, (_, index) => {
        const initialValue = staticHeights[index]
          ? staticHeights[index] * 100
          : 20;
        return (
          <div
            key={index}
            ref={(element) => {
              barsRef.current[index] = element;
            }}
            className={cn("shrink-0 rounded-full", unplayedClassName)}
            style={{
              width: `${BAR_W}px`,
              height: `${Math.max(15, initialValue)}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function VolumeIcon({
  className,
  muted,
  volume,
}: {
  className?: string;
  muted: boolean;
  volume: number;
}) {
  if (muted || volume === 0) return <VolumeX className={className} />;
  if (volume > 0.66) return <Volume2 className={className} />;
  if (volume > 0.33) return <Volume1 className={className} />;
  return <Volume className={className} />;
}

export {
  AudioControlGroup,
  AudioControlLoop,
  AudioControlPlay,
  AudioControlPlaybackRate,
  AudioControlSeek,
  AudioControlTimer,
  AudioControlVolume,
  AudioPlayer,
  AudioProvider,
};
