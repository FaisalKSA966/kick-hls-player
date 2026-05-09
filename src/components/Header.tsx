import { Github, Keyboard, PlayCircle, HelpCircle, Sparkles } from "lucide-react";

interface Props {
  onShowShortcuts: () => void;
  onShowHelp: () => void;
  streamCount: number;
}

export function Header({ onShowShortcuts, onShowHelp, streamCount }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
      <span
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-lg transition-all group-hover:bg-emerald-400/60 group-hover:blur-xl" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-green-600 shadow-lg shadow-emerald-500/40 transition-transform group-hover:scale-105">
              <PlayCircle className="h-6 w-6 fill-black text-black" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-lg font-black leading-tight text-transparent">
                Kick Player
              </h1>
              <span className="hidden items-center gap-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 sm:inline-flex">
                <Sparkles className="h-2.5 w-2.5" />
                Pro
              </span>
            </div>
            <p className="truncate text-xs font-medium text-white/50">
              مشغّل HLS احترافي للبثوث
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              {streamCount}
            </span>
            <span className="ms-1 text-white/60">بث محفوظ</span>
          </div>
        </div>

        <button
          onClick={onShowHelp}
          className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
          title="كيف أحصل على رابط M3U8؟"
        >
          <HelpCircle className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span className="hidden md:inline">كيف أحصل على الرابط؟</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="اختصارات لوحة المفاتيح"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline">اختصارات</span>
        </button>

        <a
          href="https://github.com/video-dev/hls.js"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="HLS.js على GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
