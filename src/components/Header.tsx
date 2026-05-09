import { Github, Keyboard, PlayCircle } from "lucide-react";

interface Props {
  onShowShortcuts: () => void;
  streamCount: number;
}

export function Header({ onShowShortcuts, streamCount }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-lg" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-green-600 shadow-lg shadow-emerald-500/40">
              <PlayCircle className="h-6 w-6 fill-black text-black" />
            </div>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-lg font-black leading-tight text-transparent">
              Kick Player
            </h1>
            <p className="text-xs font-medium text-white/50">مشغّل HLS احترافي للبثوث</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
            {streamCount} بث محفوظ
          </div>
        </div>

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
          title="HLS.js"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
