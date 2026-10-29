"use client";

import * as MenuPrimitive from "@base-ui/react/menu";
import * as SliderPrimitive from "@base-ui/react/slider";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "cn";
import {
  Check,
  Gauge,
  Maximize,
  Minimize,
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

type VideoContext = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: (val: number) => void;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  muted: boolean;
  setMuted: (val: boolean) => void;
  fullscreen: boolean;
  playbackRate: number;
  setPlaybackRate: (val: number) => void;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: (val: number) => void;
};

const DefaultVideoContext: VideoContext = {
  videoRef: { current: null },
  containerRef: { current: null },
  paused: true,
  setPaused: () => {},
  volume: 1,
  setVolume: () => {},
  loop: false,
  setLoop: () => {},
  muted: false,
  setMuted: () => {},
  fullscreen: false,
  playbackRate: 1,
  setPlaybackRate: () => {},
  duration: 0,
  setDuration: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
};

const Context = React.createContext<VideoContext>(DefaultVideoContext);

type VideoProviderProps = {
  defaultVolume?: number;
  defaultMuted?: boolean;
  defaultLoop?: boolean;
  defaultRate?: number;
  children: React.ReactNode;
};

function VideoProvider({
  defaultVolume = 0.5,
  defaultMuted = false,
  defaultLoop = false,
  defaultRate = 1,
  children,
}: VideoProviderProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [paused, setPaused] = React.useState<boolean>(true);
  const [volume, setVolumeState] = React.useState<number>(defaultVolume);
  const [muted, setMutedState] = React.useState<boolean>(defaultMuted);
  const [loop, setLoop] = React.useState<boolean>(defaultLoop);
  const [playbackRate, setPlaybackRateState] =
    React.useState<number>(defaultRate);
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = muted;
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.loop = loop;
  }, [loop, muted, playbackRate, volume]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const setVolume = React.useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (videoRef.current) videoRef.current.volume = clamped;
  }, []);

  const setMuted = React.useCallback((val: boolean) => {
    setMutedState(val);
    if (videoRef.current) videoRef.current.muted = val;
  }, []);

  const setPlaybackRate = React.useCallback((val: number) => {
    setPlaybackRateState(val);
    if (videoRef.current) videoRef.current.playbackRate = val;
  }, []);

  const values = React.useMemo(
    () => ({
      videoRef,
      containerRef,
      paused,
      setPaused,
      volume,
      setVolume,
      loop,
      setLoop,
      muted,
      setMuted,
      fullscreen,
      playbackRate,
      setPlaybackRate,
      duration,
      setDuration,
      currentTime,
      setCurrentTime,
    }),
    [
      paused,
      volume,
      setVolume,
      loop,
      muted,
      setMuted,
      fullscreen,
      playbackRate,
      setPlaybackRate,
      duration,
      currentTime,
    ],
  );

  return <Context.Provider value={values}>{children}</Context.Provider>;
}

function VideoPlayer({
  src,
  className,
  children,
  ...props
}: React.ComponentProps<"video">) {
  const {
    videoRef,
    containerRef,
    paused,
    fullscreen,
    setPaused,
    setCurrentTime,
    setDuration,
    setMuted,
    muted,
    volume,
    setVolume,
    setLoop,
    loop,
  } = React.useContext(Context);

  const showControlRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [showControl, setShowControl] = React.useState<boolean>(false);

  const revealControls = React.useCallback(() => {
    setShowControl(true);
    if (showControlRef.current) clearTimeout(showControlRef.current);
    showControlRef.current = setTimeout(() => {
      setShowControl(false);
    }, 3000);
  }, []);

  const handlePlayToggle = React.useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [videoRef]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;
      e.preventDefault();

      if (e.code === "Space" || e.code === "KeyK") {
        handlePlayToggle();
      } else if (e.code === "KeyM") {
        setMuted(!muted);
      } else if (e.code === "KeyF") {
        if (!document.fullscreenElement)
          containerRef.current?.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      } else if (e.code === "KeyR") {
        setLoop(!loop);
        if (videoRef.current) videoRef.current.loop = !loop;
      } else if (e.code === "ArrowUp") {
        setVolume(volume + 0.1);
        if (muted && volume + 0.1 > 0) setMuted(false);
      } else if (e.code === "ArrowDown") {
        setVolume(volume - 0.1);
      } else if (e.code === "ArrowLeft" || e.code === "KeyJ") {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(
          0,
          videoRef.current.currentTime - 10,
        );
      } else if (e.code === "ArrowRight" || e.code === "KeyL") {
        if (!videoRef.current || !videoRef.current.duration) return;
        videoRef.current.currentTime = Math.min(
          videoRef.current.duration,
          videoRef.current.currentTime + 10,
        );
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
    containerRef,
    videoRef,
    volume,
    setVolume,
  ]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      className={cn(
        "relative group overflow-hidden bg-secondary flex items-center justify-center transition-all dark",
        fullscreen ? "w-screen h-screen" : "rounded-xl aspect-video",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain transition-transform cursor-pointer m-0"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onClick={handlePlayToggle}
        playsInline
        {...props}
      />
      <div
        className={cn(
          "absolute inset-0 bg-background/20 transition-opacity flex flex-col justify-end p-2 bg-linear-to-t from-background/80 via-transparent to-transparent pointer-events-none",
          "opacity-0 group-hover:opacity-100",
          showControl && "opacity-100",
          paused && "opacity-100",
        )}
      >
        <div className="size-full mb-3 pointer-events-auto" />
        <div className="pointer-events-auto">{children}</div>
      </div>
    </div>
  );
}

function VideoControlSeek({
  className,
  ...props
}: SliderPrimitive.SliderRoot.Props) {
  const { videoRef, currentTime, duration } = React.useContext(Context);

  const value = React.useMemo(
    () => [duration > 0 ? (currentTime / duration) * 100 : 0],
    [currentTime, duration],
  );

  const handleSeek = (val: number | readonly number[]) => {
    if (!videoRef.current?.duration) return;
    const nextValue = Array.isArray(val) ? val[0] : val;
    const newTime = (nextValue / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  return (
    <div className="px-1 pb-2">
      <Slider
        value={value}
        max={100}
        step={0.1}
        onValueChange={handleSeek}
        className={cn("cursor-pointer", className)}
        {...props}
      />
    </div>
  );
}

function VideoControlList({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function VideoControlGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function VideoControlPlay({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { videoRef, paused } = React.useContext(Context);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
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
              "text-white rounded-full aspect-square h-8",
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

function VideoControlTimer({ className }: React.ComponentProps<"button">) {
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
        "text-white text-sm cursor-pointer bg-transparent border-none",
        className,
      )}
      onClick={() => setReverse((prev) => !prev)}
    >
      {displayTime}
      <span className="text-white/50 mx-1">/</span>
      {formatTime(duration)}
    </button>
  );
}

function VideoControlPlaybackRate({
  rates,
  className,
  children,
  ...props
}: MenuPrimitive.MenuTrigger.Props & { rates: number[] }) {
  const { playbackRate, setPlaybackRate } = React.useContext(Context);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label="Playback speed"
              className={cn(
                "inline-flex items-center justify-center text-white rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
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
      <DropdownMenuContainer
        align="end"
        className="bg-zinc-900 text-white border-zinc-800"
      >
        {rates.map((rate) => (
          <DropdownMenuItem
            key={rate}
            onClick={() => setPlaybackRate(rate)}
            className="flex items-center justify-between focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <span>{rate}x</span>
            {playbackRate === rate && <Check className="size-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContainer>
    </DropdownMenu>
  );
}

function VideoControlLoop({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { videoRef, loop, setLoop } = React.useContext(Context);

  const handleLoop = () => {
    if (!videoRef.current) return;
    const nextLoop = !loop;
    setLoop(nextLoop);
    videoRef.current.loop = nextLoop;
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
              "text-white rounded-full aspect-square h-8",
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

function VideoControlVolume({
  className,
  children,
  ...props
}: MenuPrimitive.MenuTrigger.Props) {
  const { muted, volume, setMuted, setVolume } = React.useContext(Context);

  const sliderValue = React.useMemo(
    () => [muted ? 0 : (Number(volume) || 0) * 100],
    [muted, volume],
  );

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (newVolume: number | readonly number[]) => {
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
                "inline-flex items-center justify-center text-white rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
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
      <DropdownMenuContainer align="end" className="min-w-40">
        <div className="flex flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-accent-foreground/80 hover:bg-accent/20 rounded-full"
            onClick={handleMuteToggle}
          >
            <VolumeIcon muted={muted} volume={volume} />
          </Button>
          <Slider
            value={sliderValue}
            max={100}
            step={1}
            aria-label="Volume slider"
            className="w-20 transition-all mr-1.5"
            onValueChange={handleVolumeChange}
          />
        </div>
      </DropdownMenuContainer>
    </DropdownMenu>
  );
}

function VideoControlFullscreen({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { containerRef, fullscreen } = React.useContext(Context);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Video: Fullscreen toggle failed:", err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className={cn(
              "text-white rounded-full aspect-square h-8",
              className,
            )}
            {...props}
          >
            {fullscreen ? <Minimize /> : <Maximize />}
          </Button>
        }
      />
      <TooltipContent>
        {children}
        <Kbd>F</Kbd>
      </TooltipContent>
    </Tooltip>
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

function DropdownMenuContainer({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  children,
}: {
  align?: MenuPrimitive.MenuPositioner.Props["align"];
  alignOffset?: number;
  side?: MenuPrimitive.MenuPositioner.Props["side"];
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { fullscreen, containerRef } = React.useContext(Context);
  const container = fullscreen ? containerRef : { current: undefined };

  return (
    <MenuPrimitive.Menu.Portal container={container.current}>
      <MenuPrimitive.Menu.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
        >
          {children}
        </MenuPrimitive.Menu.Popup>
      </MenuPrimitive.Menu.Positioner>
    </MenuPrimitive.Menu.Portal>
  );
}

export {
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
};
