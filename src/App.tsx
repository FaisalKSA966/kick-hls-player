import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Film,
  Sparkles,
  X,
  Clock,
  MousePointerClick,
  Radio,
  Library,
  MessageSquare,
  Play as PlayIcon,
} from "lucide-react";
// Note: ChatPanelPlaceholder removed; replaced by KickChatPanel.

import { VideoPlayer } from "./components/VideoPlayer";
import { StreamLibrary } from "./components/StreamLibrary";
import { AddStreamForm } from "./components/AddStreamForm";
import { Header } from "./components/Header";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { HelpModal } from "./components/HelpModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastProvider, useToast } from "./components/Toast";
import { KickChatPanel } from "./components/KickChatPanel";

import {
  detectStreamMeta,
  exportStreamsAsJson,
  generateId,
  importStreamsFromJson,
  loadActiveId,
  loadSettings,
  loadStreams,
  removeStream as removeStreamLS,
  saveActiveId,
  saveSettings,
  toggleFavorite as toggleFavoriteLS,
  updateStreamProgress,
  upsertStream,
} from "./lib/storage";
import type { PlayerSettings, SavedStream } from "./lib/types";
import { formatTime, truncateUrl } from "./lib/format";
import "./App.css";

interface AddPayload {
  url: string;
  name: string;
  channel?: string;
  videoId?: string;
}

function AppShell() {
  const toast = useToast();
  const [streams, setStreams] = useState<SavedStream[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlayerSettings>(loadSettings);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<number | null>(null);
  const [resumePosition, setResumePosition] = useState<number>(0);
  const [confirmRemove, setConfirmRemove] = useState<SavedStream | null>(null);
  const [theatre, setTheatre] = useState<boolean>(loadSettings().theatre ?? false);
  const [ambient, setAmbient] = useState<boolean>(loadSettings().ambient ?? true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [autoResumePending, setAutoResumePending] = useState<{
    stream: SavedStream;
    position: number;
  } | null>(null);

  useEffect(() => {
    const list = loadStreams();
    setStreams(list);
    const id = loadActiveId();
    if (id && list.some((s) => s.id === id)) {
      const s = list.find((x) => x.id === id)!;
      const canResume =
        !s.isLive && s.lastPosition > 10 && s.lastPosition < (s.duration || Infinity) - 10;
      if (canResume) {
        setAutoResumePending({ stream: s, position: s.lastPosition });
      } else {
        setActiveId(id);
        setResumePosition(0);
      }
    }
  }, []);

  const active = useMemo(
    () => streams.find((s) => s.id === activeId) || null,
    [streams, activeId],
  );

  const handleAdd = useCallback(
    (payload: AddPayload) => {
      const meta = detectStreamMeta(payload.url);
      const existing = loadStreams().find((s) => s.url === payload.url);
      if (existing) {
        const updated: SavedStream = {
          ...existing,
          channel: payload.channel || existing.channel,
          videoId: payload.videoId || existing.videoId,
        };
        const next = upsertStream(updated);
        setStreams(next);
        saveActiveId(updated.id);
        setActiveId(updated.id);
        if (!updated.isLive && updated.lastPosition > 10) {
          setResumePosition(updated.lastPosition);
        } else {
          setResumePosition(0);
        }
        setAutoResumePending(null);
        toast.info(`موجود عندك أصلاً — قاعد نشغّله: ${updated.name}`);
        return;
      }
      const stream: SavedStream = {
        id: generateId(),
        name: payload.name,
        url: payload.url,
        addedAt: Date.now(),
        lastPlayedAt: Date.now(),
        lastPosition: 0,
        duration: 0,
        isLive: meta.isLive,
        channel: payload.channel,
        videoId: payload.videoId,
      };
      const next = upsertStream(stream);
      setStreams(next);
      setActiveId(stream.id);
      saveActiveId(stream.id);
      setResumePosition(0);
      setAutoResumePending(null);
      toast.success(`تمام — انحفظ في المكتبة: ${payload.name}`);
    },
    [toast],
  );

  const handlePlay = useCallback((s: SavedStream) => {
    setActiveId(s.id);
    saveActiveId(s.id);
    setAutoResumePending(null);
    if (!s.isLive && s.lastPosition > 10 && s.lastPosition < (s.duration || Infinity) - 5) {
      setResumePosition(s.lastPosition);
    } else {
      setResumePosition(0);
    }
  }, []);

  const handleConfirmAutoResume = useCallback(() => {
    if (!autoResumePending) return;
    const { stream, position } = autoResumePending;
    setActiveId(stream.id);
    saveActiveId(stream.id);
    setResumePosition(position);
    setAutoResumePending(null);
  }, [autoResumePending]);

  const handleStartFromBeginning = useCallback(() => {
    if (!autoResumePending) return;
    const { stream } = autoResumePending;
    setActiveId(stream.id);
    saveActiveId(stream.id);
    setResumePosition(0);
    setAutoResumePending(null);
  }, [autoResumePending]);

  const dismissAutoResume = useCallback(() => {
    setAutoResumePending(null);
  }, []);

  const requestRemove = useCallback(
    (id: string) => {
      const target = streams.find((s) => s.id === id) || null;
      setConfirmRemove(target);
    },
    [streams],
  );

  const performRemove = useCallback(() => {
    if (!confirmRemove) return;
    const id = confirmRemove.id;
    const next = removeStreamLS(id);
    setStreams(next);
    if (activeId === id) {
      setActiveId(null);
      saveActiveId(null);
    }
    toast.success(`انحذف "${confirmRemove.name}" من المكتبة`);
    setConfirmRemove(null);
  }, [confirmRemove, activeId, toast]);

  const handleRename = useCallback(
    (id: string, name: string) => {
      const target = streams.find((s) => s.id === id);
      if (!target) return;
      const next = upsertStream({ ...target, name });
      setStreams(next);
      toast.success("الاسم انعدّل");
    },
    [streams, toast],
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      const target = streams.find((s) => s.id === id);
      const next = toggleFavoriteLS(id);
      setStreams(next);
      const nowFav = next.find((s) => s.id === id)?.isFavorite;
      if (target) {
        toast.success(nowFav ? "انضاف للمفضلة" : "انشال من المفضلة");
      }
    },
    [streams, toast],
  );

  const handleCopyUrl = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("الرابط انتسخ");
      } catch {
        toast.error("ما قدرنا ننسخ — انسخه يدوي");
      }
    },
    [toast],
  );

  const handleExport = useCallback(() => {
    if (streams.length === 0) return;
    const json = exportStreamsAsJson(streams);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kick-player-library-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير ${streams.length} بث`);
  }, [streams, toast]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const before = streams.length;
        const merged = importStreamsFromJson(text, streams);
        setStreams(merged);
        const added = merged.length - before;
        toast.success(`الاستيراد تم — ${added > 0 ? `+${added} جديد` : "بدون عناصر جديدة"}`);
      } catch {
        toast.error("الملف مش مظبوط — تأكد إنه مصدّر من نفس التطبيق");
      }
    },
    [streams, toast],
  );

  const lastSaveRef = useRef<number>(0);
  const onProgress = useCallback(
    (cur: number, dur: number, isLive: boolean) => {
      setCurrentTime(cur);
      if (!activeId || isLive) return;
      const now = Date.now();
      if (now - lastSaveRef.current < 4000) return;
      lastSaveRef.current = now;
      const next = updateStreamProgress(activeId, cur, dur);
      setStreams(next);
    },
    [activeId],
  );

  const onReady = useCallback(
    (dur: number, isLive: boolean) => {
      if (!activeId) return;
      const next = updateStreamProgress(activeId, active?.lastPosition || 0, dur);
      const updated = next.find((s) => s.id === activeId);
      if (updated && updated.isLive !== isLive) {
        upsertStream({ ...updated, isLive });
        setStreams(loadStreams());
      } else {
        setStreams(next);
      }
      if (isLive) setResumeOffer(null);
    },
    [activeId, active],
  );

  const onSettingsChange = useCallback(
    (volume: number, muted: boolean, speed: number) => {
      const next: PlayerSettings = {
        ...settings,
        volume,
        muted,
        speed,
        preferredQuality: settings.preferredQuality ?? -1,
        theatre,
        ambient,
      };
      setSettings(next);
      saveSettings(next);
    },
    [settings, theatre, ambient],
  );

  const toggleTheatre = useCallback(() => {
    setTheatre((v) => {
      const nv = !v;
      const ns = { ...settings, theatre: nv };
      setSettings(ns);
      saveSettings(ns);
      toast.info(nv ? "وضع المسرح: ON" : "وضع المسرح: OFF");
      return nv;
    });
  }, [settings, toast]);

  const toggleAmbient = useCallback(() => {
    setAmbient((v) => {
      const nv = !v;
      const ns = { ...settings, ambient: nv };
      setSettings(ns);
      saveSettings(ns);
      return nv;
    });
  }, [settings]);

  useEffect(() => {
    if (resumePosition > 0) {
      setResumeOffer(resumePosition);
    } else {
      setResumeOffer(null);
    }
  }, [resumePosition, activeId]);

  const dismissResume = () => {
    setResumeOffer(null);
    setResumePosition(0);
  };

  const showChatToggle = !!active;

  return (
    <div dir="rtl" className="kp-root min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="kp-mesh-blob -top-40 -right-40 h-[28rem] w-[28rem] bg-emerald-500/30" />
        <div className="kp-mesh-blob -bottom-40 -left-40 h-[28rem] w-[28rem] bg-violet-500/25" />
        <div className="kp-mesh-blob top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 bg-fuchsia-500/15" />
      </div>

      <Header
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowHelp={() => setShowHelp(true)}
        streamCount={streams.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        {autoResumePending && (
          <AutoResumeBanner
            stream={autoResumePending.stream}
            position={autoResumePending.position}
            onResume={handleConfirmAutoResume}
            onStart={handleStartFromBeginning}
            onDismiss={dismissAutoResume}
          />
        )}

        <div
          className={`grid gap-7 ${
            theatre && active ? "lg:grid-cols-1" : "lg:grid-cols-3"
          }`}
        >
          <div
            className={`space-y-6 ${
              theatre && active ? "lg:col-span-1" : "lg:col-span-2"
            }`}
          >
            <AddStreamForm
              onAdd={handleAdd}
              onOpenHelp={() => setShowHelp(true)}
              onError={(msg) => toast.error(msg)}
            />

            {active ? (
              <div className="space-y-4">
                {resumeOffer && resumeOffer > 10 && (
                  <div className="kp-glass kp-glass-shine flex items-center gap-3 rounded-2xl px-4 py-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 ring-1 ring-emerald-400/30">
                      <Clock className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div className="flex-1 text-base">
                      <p className="font-bold text-white">
                        كمّلنا من {formatTime(resumeOffer)}
                      </p>
                      <p className="text-sm text-white/55">آخر مكان وقّفت عليه في هذا البث</p>
                    </div>
                    <button
                      onClick={dismissResume}
                      className="kp-btn-glass kp-focus-ring rounded-xl p-2 text-white/70 hover:text-white"
                      title="سكر"
                      aria-label="سكر"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div
                  className={`grid gap-4 ${
                    showChatToggle && showChat ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"
                  }`}
                >
                  <VideoPlayer
                    key={active.id}
                    url={active.url}
                    initialPosition={resumePosition}
                    onProgress={onProgress}
                    onReady={onReady}
                    initialVolume={settings.volume}
                    initialMuted={settings.muted}
                    initialSpeed={settings.speed}
                    onSettingsChange={onSettingsChange}
                    theatre={theatre}
                    onToggleTheatre={toggleTheatre}
                    ambient={ambient}
                    onToggleAmbient={toggleAmbient}
                  />

                  {showChatToggle && showChat && (
                    <KickChatPanel
                      streamId={active.id}
                      channel={active.channel}
                      isLive={active.isLive}
                      currentTime={currentTime}
                      onClose={() => setShowChat(false)}
                    />
                  )}
                </div>

                <div className="kp-glass kp-glass-shine relative overflow-hidden rounded-2xl p-5">
                  <span
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl"
                    aria-hidden
                  />
                  <div className="relative flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-black text-white">{active.name}</h3>
                      <p
                        className="mt-1 truncate font-mono text-xs text-white/45"
                        dir="ltr"
                        title={active.url}
                      >
                        {truncateUrl(active.url, 80)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {active.isLive ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-sm font-black text-red-300 ring-1 ring-red-400/30">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                          مباشر
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-500/15 px-3 py-1.5 text-sm font-black text-violet-300 ring-1 ring-violet-400/30">
                          VOD
                        </span>
                      )}
                      {showChatToggle && (
                        <button
                          onClick={() => setShowChat((v) => !v)}
                          className={`kp-focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all ${
                            showChat
                              ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/40"
                              : "kp-btn-glass text-white/80 hover:text-white"
                          }`}
                          title={active.isLive ? "شات مباشر + سجّله للـ VOD" : "شات الـ VOD المتزامن"}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {showChat ? "اخفي الشات" : "افتح الشات"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState onOpenHelp={() => setShowHelp(true)} />
            )}
          </div>

          {!(theatre && active) && (
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
              <StreamLibrary
                streams={streams}
                activeId={activeId}
                onPlay={handlePlay}
                onRemove={requestRemove}
                onRename={handleRename}
                onToggleFavorite={handleToggleFavorite}
                onCopyUrl={handleCopyUrl}
                onExport={handleExport}
                onImport={handleImport}
              />
            </div>
          )}
        </div>

        <Footer />
      </main>

      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      <ConfirmDialog
        open={!!confirmRemove}
        title="نحذف البث من المكتبة؟"
        message={
          confirmRemove
            ? `راح يتشال "${confirmRemove.name}" من عندك. ما فيه رجوع.`
            : ""
        }
        confirmLabel="أيوه احذف"
        cancelLabel="تراجع"
        variant="danger"
        onConfirm={performRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}

function AutoResumeBanner({
  stream,
  position,
  onResume,
  onStart,
  onDismiss,
}: {
  stream: SavedStream;
  position: number;
  onResume: () => void;
  onStart: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="kp-glass kp-glass-shine relative mb-6 overflow-hidden rounded-3xl p-5 md:p-6">
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 ring-1 ring-emerald-400/30">
          <Clock className="h-7 w-7 text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-black text-white">تكمّل من وين وقفت؟</p>
          <p className="mt-0.5 text-sm font-medium text-white/65">
            <span className="text-white/85">{stream.name}</span> — وقفت عند{" "}
            <span className="font-mono font-bold text-emerald-300">{formatTime(position)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onResume}
            className="kp-focus-ring group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-3 text-base font-black text-black shadow-xl shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlayIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            كمّل
          </button>
          <button
            onClick={onStart}
            className="kp-btn-glass kp-focus-ring rounded-2xl px-4 py-3 text-sm font-bold text-white/85 hover:text-white"
          >
            من البداية
          </button>
          <button
            onClick={onDismiss}
            className="kp-btn-glass kp-focus-ring rounded-2xl p-3 text-white/70 hover:text-white"
            aria-label="سكر"
            title="سكر"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

function EmptyState({ onOpenHelp }: { onOpenHelp: () => void }) {
  return (
    <div className="kp-glass kp-glass-shine relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-emerald-400/30 blur-2xl" />
        <div className="relative flex h-24 w-24 animate-kp-float items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-300 to-green-600 shadow-2xl shadow-emerald-500/40">
          <Film className="h-12 w-12 text-black" />
        </div>
      </div>

      <div>
        <h3 className="bg-gradient-to-r from-white via-white to-white/55 bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          ابدأ بإضافة رابط M3U8
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-white/65">
          ألصق رابط بث Kick أو رابط VOD من CloudFront فوق — راح ينحفظ في مكتبتك مع آخر مكان
          وقّفت عليه.
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-3">
        <FeaturePill icon={<Radio className="h-4 w-4 text-red-400" />} label="بث مباشر" />
        <FeaturePill icon={<Film className="h-4 w-4 text-violet-400" />} label="VOD مسجّل" />
        <FeaturePill
          icon={<Library className="h-4 w-4 text-emerald-400" />}
          label="مكتبة محلية"
        />
      </div>

      <button
        onClick={onOpenHelp}
        className="kp-focus-ring group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400/20 to-emerald-400/10 px-5 py-3 text-base font-black text-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40 transition-all hover:scale-[1.02] hover:bg-emerald-400/25 active:scale-95"
      >
        <MousePointerClick className="h-5 w-5 transition-transform group-hover:-rotate-12" />
        وش طريقة جلب رابط M3U8 من كيك؟
      </button>

      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/45">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <span>التشغيل عبر HLS.js — بدون تحميل ولا تخزين للفيديو</span>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="kp-btn-glass flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-white/75">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 pb-6 pt-7 text-center text-sm text-white/45">
      <p>
        مبني بـ{" "}
        <a
          href="https://github.com/video-dev/hls.js"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-400 hover:underline"
        >
          HLS.js
        </a>
        {" • "}
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-400 hover:underline"
        >
          React
        </a>
        {" • "}
        <a
          href="https://tailwindcss.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-400 hover:underline"
        >
          Tailwind
        </a>
      </p>
      <p className="mt-1.5 text-xs text-white/40">
        كل الروابط محفوظة عندك في المتصفح — ما يطلع شي لأي سيرفر
      </p>
    </footer>
  );
}

export default App;
