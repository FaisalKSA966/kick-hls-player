import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls, { type Level } from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  Loader2,
  AlertTriangle,
  Radio,
  Gauge,
  Cog,
  Check,
} from "lucide-react";

import { formatTime } from "../lib/format";

interface QualityLevel {
  height: number;
  bitrate: number;
  index: number;
}

interface Props {
  url: string;
  initialPosition?: number;
  onProgress?: (currentTime: number, duration: number, isLive: boolean) => void;
  onReady?: (duration: number, isLive: boolean) => void;
  onEnded?: () => void;
  initialVolume?: number;
  initialMuted?: boolean;
  initialSpeed?: number;
  onSettingsChange?: (vol: number, muted: boolean, speed: number) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_STEP = 10;
const VOLUME_STEP = 0.05;

export function VideoPlayer({
  url,
  initialPosition = 0,
  onProgress,
  onReady,
  onEnded,
  initialVolume = 1,
  initialMuted = false,
  initialSpeed = 1,
  onSettingsChange,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const initialPositionRef = useRef<number>(initialPosition);
  const isDraggingSeek = useRef<boolean>(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(initialMuted);
  const [speed, setSpeed] = useState(initialSpeed);
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"speed" | "quality">("speed");
  const [seekHover, setSeekHover] = useState<{ x: number; time: number } | null>(null);
  const [showCenterIcon, setShowCenterIcon] = useState<"play" | "pause" | null>(null);

  useEffect(() => {
    initialPositionRef.current = initialPosition;
  }, [initialPosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setLoading(true);
    setError(null);
    setLevels([]);
    setCurrentLevel(-1);
    setDuration(0);
    setCurrentTime(0);
    setBuffered(0);

    const seekToInitial = () => {
      const pos = initialPositionRef.current;
      if (pos > 0 && isFinite(video.duration) && video.duration > 0 && pos < video.duration - 5) {
        video.currentTime = pos;
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        const live = hls.levels.some((l) => (l.details ? l.details.live : false)) || !isFinite(video.duration);
        setIsLive(live);
        const ql: QualityLevel[] = hls.levels.map((l: Level, i: number) => ({
          height: l.height || 0,
          bitrate: l.bitrate || 0,
          index: i,
        }));
        setLevels(ql);
        setCurrentLevel(hls.currentLevel);
        seekToInitial();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("خطأ في الشبكة — جاري إعادة المحاولة...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("خطأ في الوسائط — محاولة الاسترداد...");
              hls.recoverMediaError();
              break;
            default:
              setError("تعذّر تشغيل البث. تأكد من صلاحية الرابط.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      const onLoaded = () => {
        setLoading(false);
        setIsLive(!isFinite(video.duration));
        seekToInitial();
      };
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
    } else {
      setError("متصفحك لا يدعم تشغيل HLS.");
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    onSettingsChange?.(volume, muted, speed);
  }, [volume, muted, speed, onSettingsChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!isDraggingSeek.current) setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      onProgress?.(video.currentTime, video.duration || 0, !isFinite(video.duration));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onLoadedMeta = () => {
      setDuration(video.duration);
      const live = !isFinite(video.duration);
      setIsLive(live);
      onReady?.(video.duration || 0, live);
    };
    const onDurChange = () => setDuration(video.duration);
    const onEnd = () => {
      setPlaying(false);
      onEnded?.();
    };
    const onEnterPip = () => setPip(true);
    const onLeavePip = () => setPip(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("durationchange", onDurChange);
    video.addEventListener("ended", onEnd);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("durationchange", onDurChange);
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [onProgress, onReady, onEnded]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setShowCenterIcon("play");
    } else {
      video.pause();
      setShowCenterIcon("pause");
    }
    window.setTimeout(() => setShowCenterIcon(null), 600);
  }, []);

  const seek = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min((video.duration || 0) - 0.1, video.currentTime + delta));
    video.currentTime = next;
    setCurrentTime(next);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration)) return;
    const t = Math.max(0, Math.min(video.duration - 0.1, time));
    video.currentTime = t;
    setCurrentTime(t);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    setVolume((v) => Math.max(0, Math.min(1, v + delta)));
    setMuted(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // ignore
    }
  }, []);

  const setQuality = useCallback((index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
    }
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (playing && !showSettings) {
      hideTimerRef.current = window.setTimeout(() => setShowControls(false), 2800);
    }
  }, [playing, showSettings]);

  useEffect(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seek(-SEEK_STEP);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seek(SEEK_STEP);
          break;
        case "arrowup":
          e.preventDefault();
          adjustVolume(VOLUME_STEP);
          break;
        case "arrowdown":
          e.preventDefault();
          adjustVolume(-VOLUME_STEP);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          void toggleFullscreen();
          break;
        case "p":
          e.preventDefault();
          void togglePip();
          break;
        case ",":
          e.preventDefault();
          setSpeed((s) => Math.max(0.25, s - 0.25));
          break;
        case ".":
          e.preventDefault();
          setSpeed((s) => Math.min(2, s + 0.25));
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seek, adjustVolume, toggleMute, toggleFullscreen, togglePip]);

  const handleSeekBarPointer = useCallback(
    (clientX: number) => {
      const bar = seekBarRef.current;
      if (!bar || !isFinite(duration) || duration <= 0) return null;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = ratio * duration;
      return { ratio, time, x: clientX - rect.left };
    },
    [duration],
  );

  const onSeekClick = (e: React.MouseEvent) => {
    const r = handleSeekBarPointer(e.clientX);
    if (r) seekTo(r.time);
  };

  const onSeekMove = (e: React.MouseEvent) => {
    const r = handleSeekBarPointer(e.clientX);
    if (r) setSeekHover({ x: r.x, time: r.time });
    if (isDraggingSeek.current && r) {
      setCurrentTime(r.time);
    }
  };

  const onSeekDown = (e: React.MouseEvent) => {
    isDraggingSeek.current = true;
    const r = handleSeekBarPointer(e.clientX);
    if (r) setCurrentTime(r.time);

    const onMove = (ev: MouseEvent) => {
      const rr = handleSeekBarPointer(ev.clientX);
      if (rr) {
        setCurrentTime(rr.time);
        setSeekHover({ x: rr.x, time: rr.time });
      }
    };
    const onUp = (ev: MouseEvent) => {
      isDraggingSeek.current = false;
      const rr = handleSeekBarPointer(ev.clientX);
      if (rr) seekTo(rr.time);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const progressPct = useMemo(() => {
    if (!duration || !isFinite(duration)) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  const bufferedPct = useMemo(() => {
    if (!duration || !isFinite(duration)) return 0;
    return (buffered / duration) * 100;
  }, [buffered, duration]);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className="group relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/5"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full bg-black"
        playsInline
        onClick={togglePlay}
        onDoubleClick={() => void toggleFullscreen()}
      />

      {/* Loading overlay */}
      {loading && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
            <p className="text-sm font-medium text-white/80">جاري التحميل...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6">
          <div className="max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur-md">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-base font-semibold text-white">{error}</p>
          </div>
        </div>
      )}

      {/* Center play/pause icon flash */}
      {showCenterIcon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-6 backdrop-blur-md duration-300 animate-in fade-in zoom-in">
            {showCenterIcon === "play" ? (
              <Play className="h-12 w-12 fill-white text-white" />
            ) : (
              <Pause className="h-12 w-12 fill-white text-white" />
            )}
          </div>
        </div>
      )}

      {/* Top gradient + live badge */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      />
      {isLive && (
        <div
          className={`absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          LIVE
        </div>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek bar */}
        {!isLive && duration > 0 && (
          <div
            ref={seekBarRef}
            className="group/seek relative mb-2 h-2 cursor-pointer rounded-full bg-white/15 transition-all hover:h-3"
            onClick={onSeekClick}
            onMouseMove={onSeekMove}
            onMouseLeave={() => setSeekHover(null)}
            onMouseDown={onSeekDown}
          >
            {/* buffered */}
            <div
              className="absolute inset-y-0 right-auto rounded-full bg-white/30"
              style={{ left: 0, width: `${bufferedPct}%` }}
            />
            {/* progress */}
            <div
              className="absolute inset-y-0 right-auto rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              style={{ left: 0, width: `${progressPct}%` }}
            />
            {/* thumb */}
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-emerald-400 opacity-0 shadow-lg ring-2 ring-white/80 transition-opacity group-hover/seek:opacity-100"
              style={{ left: `calc(${progressPct}% - 8px)` }}
            />
            {/* hover preview */}
            {seekHover && (
              <div
                className="pointer-events-none absolute -top-9 -translate-x-1/2 rounded-md bg-black/90 px-2 py-1 text-xs font-mono text-white shadow-lg ring-1 ring-white/10"
                style={{ left: `${seekHover.x}px` }}
              >
                {formatTime(seekHover.time)}
              </div>
            )}
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center gap-1 text-white" dir="ltr">
          <button
            onClick={togglePlay}
            className="rounded-full p-2 transition-all hover:bg-white/15 hover:scale-110"
            aria-label={playing ? "إيقاف" : "تشغيل"}
          >
            {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
          </button>

          {!isLive && (
            <>
              <button
                onClick={() => seek(-SEEK_STEP)}
                className="rounded-full p-2 transition-all hover:bg-white/15"
                aria-label="رجوع 10 ثواني"
                title="رجوع 10 ثواني (←)"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={() => seek(SEEK_STEP)}
                className="rounded-full p-2 transition-all hover:bg-white/15"
                aria-label="تقديم 10 ثواني"
                title="تقديم 10 ثواني (→)"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Volume */}
          <div className="group/vol flex items-center">
            <button
              onClick={toggleMute}
              className="rounded-full p-2 transition-all hover:bg-white/15"
              aria-label={muted ? "إلغاء الكتم" : "كتم"}
            >
              <VolumeIcon className="h-5 w-5" />
            </button>
            <div className="w-0 overflow-hidden transition-all duration-300 group-hover/vol:w-24">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (muted) setMuted(false);
                }}
                className="kp-volume-slider mx-2 h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20"
                style={{
                  background: `linear-gradient(to right, rgb(52 211 153) 0%, rgb(52 211 153) ${
                    (muted ? 0 : volume) * 100
                  }%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="ml-2 select-none font-mono text-sm text-white/90">
            {isLive ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                LIVE
              </span>
            ) : (
              <>
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span className="text-white/60">{formatTime(duration)}</span>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Speed quick */}
          <button
            onClick={() => {
              setSettingsTab("speed");
              setShowSettings((s) => !s);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all hover:bg-white/15 ${
              speed !== 1 ? "text-emerald-400" : "text-white"
            }`}
            title="السرعة (، أو .)"
          >
            <Gauge className="h-4 w-4" />
            {speed}x
          </button>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => {
                setSettingsTab("quality");
                setShowSettings((s) => !s);
              }}
              className="rounded-full p-2 transition-all hover:bg-white/15"
              aria-label="الإعدادات"
            >
              <Settings className={`h-5 w-5 transition-transform ${showSettings ? "rotate-90" : ""}`} />
            </button>
            {showSettings && (
              <div className="absolute bottom-12 right-0 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setSettingsTab("speed")}
                    className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                      settingsTab === "speed"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Gauge className="mx-auto mb-1 h-4 w-4" />
                    السرعة
                  </button>
                  <button
                    onClick={() => setSettingsTab("quality")}
                    className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                      settingsTab === "quality"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Cog className="mx-auto mb-1 h-4 w-4" />
                    الجودة
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto p-1">
                  {settingsTab === "speed" &&
                    SPEED_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSpeed(opt);
                          setShowSettings(false);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <span>{opt === 1 ? "عادي" : `${opt}x`}</span>
                        {speed === opt && <Check className="h-4 w-4 text-emerald-400" />}
                      </button>
                    ))}
                  {settingsTab === "quality" && (
                    <>
                      <button
                        onClick={() => {
                          setQuality(-1);
                          setShowSettings(false);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <span>تلقائي</span>
                        {currentLevel === -1 && <Check className="h-4 w-4 text-emerald-400" />}
                      </button>
                      {levels.length === 0 && (
                        <p className="px-3 py-2 text-xs text-white/50">لا توجد جودات إضافية</p>
                      )}
                      {levels
                        .slice()
                        .sort((a, b) => b.height - a.height)
                        .map((lvl) => (
                          <button
                            key={lvl.index}
                            onClick={() => {
                              setQuality(lvl.index);
                              setShowSettings(false);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                          >
                            <span>{lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}kbps`}</span>
                            {currentLevel === lvl.index && <Check className="h-4 w-4 text-emerald-400" />}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => void togglePip()}
            className={`rounded-full p-2 transition-all hover:bg-white/15 ${pip ? "text-emerald-400" : ""}`}
            aria-label="صورة داخل صورة"
            title="Picture in Picture (P)"
          >
            <PictureInPicture2 className="h-5 w-5" />
          </button>

          <button
            onClick={() => void toggleFullscreen()}
            className="rounded-full p-2 transition-all hover:bg-white/15"
            aria-label="ملء الشاشة"
            title="ملء الشاشة (F)"
          >
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
