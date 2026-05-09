import { Github, Keyboard, PlayCircle, HelpCircle, Sparkles, Library } from "lucide-react";

interface Props {
  onShowShortcuts: () => void;
  onShowHelp: () => void;
  streamCount: number;
}

export function Header({ onShowShortcuts, onShowHelp, streamCount }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <span
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 md:gap-5 md:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/50 blur-xl transition-all group-hover:bg-emerald-400/70 group-hover:blur-2xl" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-green-600 shadow-2xl shadow-emerald-500/50 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <PlayCircle className="h-7 w-7 fill-black text-black" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-xl font-black leading-tight text-transparent md:text-2xl">
                Kick Player
              </h1>
              <span className="hidden items-center gap-0.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                Pro
              </span>
            </div>
            <p className="truncate text-sm font-medium text-white/60">
              مشغّل HLS احترافي — حياك الله
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-sm font-semibold text-white/80 backdrop-blur-md">
            <Library className="h-4 w-4 text-emerald-300" />
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              {streamCount}
            </span>
            <span className="text-white/70">بث محفوظ</span>
          </div>
        </div>

        <button
          onClick={onShowHelp}
          className="kp-btn-glass kp-focus-ring group flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:text-emerald-200"
          title="وش طريقة جلب الرابط؟"
        >
          <HelpCircle className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span className="hidden md:inline">وش طريقة جلب الرابط؟</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="kp-btn-glass kp-focus-ring flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:text-white"
          title="اختصارات الكيبورد"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline">اختصارات</span>
        </button>

        <a
          href="https://github.com/video-dev/hls.js"
          target="_blank"
          rel="noopener noreferrer"
          className="kp-btn-glass kp-focus-ring rounded-xl p-2.5 text-white/85 hover:text-white"
          title="HLS.js على GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
