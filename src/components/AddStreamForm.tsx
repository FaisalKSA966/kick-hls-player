import { useState } from "react";
import { Plus, Sparkles, Link2 } from "lucide-react";

import { detectStreamMeta, isLikelyKickUrl } from "../lib/storage";

interface Props {
  onAdd: (url: string, name: string) => void;
}

const SAMPLE_URL =
  "https://d26yk4zpyhjeeq.cloudfront.net/v1/manifest/a837d8e4b9178bea1b3911d9b2fe01ff7553ef20/production-kick-vod/567e4cee-5310-460f-a6c8-c11275d10cd8/1.m3u8";

export function AddStreamForm({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = url.trim();
  const valid = trimmed.length > 0;
  const looksKick = valid && isLikelyKickUrl(trimmed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) {
      setError("الرجاء إدخال رابط M3U8");
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setError("الرابط غير صالح");
      return;
    }
    if (!trimmed.includes(".m3u8") && !trimmed.includes("manifest")) {
      setError("هذا لا يبدو رابط M3U8 صالح. تأكد أنه ينتهي بـ .m3u8 أو يحتوي على manifest");
      return;
    }
    setError(null);

    const auto = detectStreamMeta(trimmed);
    onAdd(trimmed, name.trim() || auto.name);
    setUrl("");
    setName("");
    setShowAdvanced(false);
  };

  const fillSample = () => {
    setUrl(SAMPLE_URL);
    setName("");
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-black/40 p-5 backdrop-blur-xl shadow-xl"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <h2 className="text-sm font-bold text-white">إضافة بث جديد</h2>
      </div>

      <div className="relative">
        <Link2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="ألصق رابط M3U8 (Kick stream أو CloudFront VOD)..."
          className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pr-10 pl-3 font-mono text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-black/60 focus:ring-2 focus:ring-emerald-400/20"
          dir="ltr"
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {valid && !error && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {looksKick ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-400 ring-1 ring-emerald-400/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              رابط صالح
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-400 ring-1 ring-amber-400/30">
              تحذير: قد لا يكون رابط M3U8
            </span>
          )}
        </div>
      )}

      {showAdvanced && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-white/60">اسم البث (اختياري)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: مباراة الكلاسيكو، سترييم الجمعة..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-black/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={!valid}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          تشغيل وحفظ
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
        >
          {showAdvanced ? "إخفاء الخيارات" : "خيارات متقدمة"}
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={fillSample}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="استخدم رابط VOD تجريبي من Kick"
        >
          مثال تجريبي
        </button>
      </div>
    </form>
  );
}
