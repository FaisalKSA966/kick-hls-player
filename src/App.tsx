import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Film, Sparkles, X, Clock, MousePointerClick, Radio, Library } from "lucide-react";

import { VideoPlayer } from "./components/VideoPlayer";
import { StreamLibrary } from "./components/StreamLibrary";
import { AddStreamForm } from "./components/AddStreamForm";
import { Header } from "./components/Header";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { HelpModal } from "./components/HelpModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastProvider, useToast } from "./components/Toast";

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

  useEffect(() => {
    const list = loadStreams();
    setStreams(list);
    const id = loadActiveId();
    if (id && list.some((s) => s.id === id)) {
      setActiveId(id);
      const s = list.find((x) => x.id === id)!;
      if (!s.isLive && s.lastPosition > 10 && s.lastPosition < (s.duration || Infinity) - 5) {
        setResumePosition(s.lastPosition);
      }
    }
  }, []);

  const active = useMemo(
    () => streams.find((s) => s.id === activeId) || null,
    [streams, activeId],
  );

  const handleAdd = useCallback(
    (url: string, name: string) => {
      const meta = detectStreamMeta(url);
      const existing = loadStreams().find((s) => s.url === url);
      if (existing) {
        saveActiveId(existing.id);
        setActiveId(existing.id);
        if (!existing.isLive && existing.lastPosition > 10) {
          setResumePosition(existing.lastPosition);
        } else {
          setResumePosition(0);
        }
        toast.info(`موجود مسبقًا — جاري التشغيل: ${existing.name}`);
        return;
      }
      const stream: SavedStream = {
        id: generateId(),
        name,
        url,
        addedAt: Date.now(),
        lastPlayedAt: Date.now(),
        lastPosition: 0,
        duration: 0,
        isLive: meta.isLive,
      };
      const next = upsertStream(stream);
      setStreams(next);
      setActiveId(stream.id);
      saveActiveId(stream.id);
      setResumePosition(0);
      toast.success(`تمت الإضافة وحفظ في المكتبة: ${name}`);
    },
    [toast],
  );

  const handlePlay = useCallback((s: SavedStream) => {
    setActiveId(s.id);
    saveActiveId(s.id);
    if (!s.isLive && s.lastPosition > 10 && s.lastPosition < (s.duration || Infinity) - 5) {
      setResumePosition(s.lastPosition);
    } else {
      setResumePosition(0);
    }
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
    toast.success(`تم حذف "${confirmRemove.name}" من المكتبة`);
    setConfirmRemove(null);
  }, [confirmRemove, activeId, toast]);

  const handleRename = useCallback(
    (id: string, name: string) => {
      const target = streams.find((s) => s.id === id);
      if (!target) return;
      const next = upsertStream({ ...target, name });
      setStreams(next);
      toast.success("تم تحديث الاسم");
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
        toast.success(nowFav ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة");
      }
    },
    [streams, toast],
  );

  const handleCopyUrl = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط");
      } catch {
        toast.error("تعذّر النسخ — حاول يدويًا");
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
        toast.success(`تم الاستيراد — ${added > 0 ? `+${added} جديد` : "بدون عناصر جديدة"}`);
      } catch {
        toast.error("ملف غير صالح — تأكد من تصديره من نفس التطبيق");
      }
    },
    [streams, toast],
  );

  const lastSaveRef = useRef<number>(0);
  const onProgress = useCallback(
    (cur: number, dur: number, isLive: boolean) => {
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

  const onSettingsChange = useCallback((volume: number, muted: boolean, speed: number) => {
    const next: PlayerSettings = { volume, muted, speed, preferredQuality: -1 };
    setSettings(next);
    saveSettings(next);
  }, []);

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

  return (
    <div dir="rtl" className="kp-root min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />
      </div>

      <Header
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowHelp={() => setShowHelp(true)}
        streamCount={streams.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <AddStreamForm
              onAdd={handleAdd}
              onOpenHelp={() => setShowHelp(true)}
              onError={(msg) => toast.error(msg)}
            />

            {active ? (
              <div className="space-y-3">
                {resumeOffer && resumeOffer > 10 && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 backdrop-blur-md">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20">
                      <Clock className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-white">
                        تم الاستئناف من {formatTime(resumeOffer)}
                      </p>
                      <p className="text-xs text-white/60">آخر مكان توقفت فيه في هذا البث</p>
                    </div>
                    <button
                      onClick={dismissResume}
                      className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      title="إخفاء"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

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
                />

                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-white">{active.name}</h3>
                      <p
                        className="mt-1 truncate font-mono text-xs text-white/40"
                        dir="ltr"
                        title={active.url}
                      >
                        {truncateUrl(active.url, 80)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {active.isLive ? (
                        <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400 ring-1 ring-red-400/30">
                          مباشر
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-400 ring-1 ring-violet-400/30">
                          VOD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState onOpenHelp={() => setShowHelp(true)} />
            )}
          </div>

          <div className="lg:sticky lg:top-20 lg:h-screen">
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
        </div>

        <Footer />
      </main>

      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      <ConfirmDialog
        open={!!confirmRemove}
        title="حذف البث من المكتبة؟"
        message={
          confirmRemove
            ? `سيتم حذف "${confirmRemove.name}" نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`
            : ""
        }
        confirmLabel="نعم، احذف"
        cancelLabel="تراجع"
        variant="danger"
        onConfirm={performRemove}
        onCancel={() => setConfirmRemove(null)}
      />
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
    <div className="relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/60 to-black/40 px-6 py-16 text-center backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-2xl" />
        <div className="relative flex h-20 w-20 animate-kp-float items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-green-600 shadow-2xl shadow-emerald-500/40">
          <Film className="h-10 w-10 text-black" />
        </div>
      </div>

      <div>
        <h3 className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-2xl font-extrabold text-transparent">
          ابدأ بإضافة رابط M3U8
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
          ألصق رابط بث Kick أو رابط VOD من CloudFront في المربع أعلاه — سيتم حفظه تلقائيًا في مكتبتك
          مع آخر مكان توقفت فيه.
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-3">
        <FeaturePill icon={<Radio className="h-3.5 w-3.5 text-red-400" />} label="بث مباشر" />
        <FeaturePill icon={<Film className="h-3.5 w-3.5 text-violet-400" />} label="VOD مسجّل" />
        <FeaturePill
          icon={<Library className="h-3.5 w-3.5 text-emerald-400" />}
          label="مكتبة محلية"
        />
      </div>

      <button
        onClick={onOpenHelp}
        className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-400/20 active:scale-95"
      >
        <MousePointerClick className="h-4 w-4 transition-transform group-hover:-rotate-12" />
        كيف أحصل على رابط M3U8 من Kick؟
      </button>

      <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span>التشغيل يتم مباشرة عبر HLS.js — بدون أي تحميل أو تخزين للفيديو</span>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/5 pb-4 pt-6 text-center text-xs text-white/40">
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
      <p className="mt-1">
        جميع الروابط محفوظة محليًا في متصفحك — لا يتم رفع أي بيانات إلى أي خادم
      </p>
    </footer>
  );
}

export default App;
