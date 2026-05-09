import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Sparkles,
  Link2,
  ClipboardPaste,
  HelpCircle,
  Wand2,
  Radio,
  Film,
} from "lucide-react";

import { detectStreamMeta, isLikelyKickUrl } from "../lib/storage";

interface Props {
  onAdd: (url: string, name: string) => void;
  onOpenHelp?: () => void;
  onError?: (msg: string) => void;
}

const SAMPLE_URL =
  "https://d26yk4zpyhjeeq.cloudfront.net/v1/manifest/a837d8e4b9178bea1b3911d9b2fe01ff7553ef20/production-kick-vod/567e4cee-5310-460f-a6c8-c11275d10cd8/1.m3u8";

export function AddStreamForm({ onAdd, onOpenHelp, onError }: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasted, setPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = url.trim();
  const valid = trimmed.length > 0;
  const looksKick = valid && isLikelyKickUrl(trimmed);
  const meta = valid ? detectStreamMeta(trimmed) : null;

  useEffect(() => {
    if (pasted) {
      const t = window.setTimeout(() => setPasted(false), 1200);
      return () => window.clearTimeout(t);
    }
  }, [pasted]);

  const setUrlAndClear = (v: string) => {
    setUrl(v);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) {
      const msg = "الرجاء إدخال رابط M3U8";
      setError(msg);
      onError?.(msg);
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      const msg = "الرابط غير صالح";
      setError(msg);
      onError?.(msg);
      return;
    }
    if (!trimmed.includes(".m3u8") && !trimmed.includes("manifest")) {
      const msg = "هذا لا يبدو رابط M3U8 صالح. تأكد أنه ينتهي بـ .m3u8 أو يحتوي على manifest";
      setError(msg);
      onError?.(msg);
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
    inputRef.current?.focus();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setUrl(text.trim());
      setError(null);
      setPasted(true);
      inputRef.current?.focus();
    } catch {
      const msg = "تعذّر قراءة الحافظة. الصق الرابط يدويًا.";
      setError(msg);
      onError?.(msg);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text");
    if (text) {
      setUrl(text.trim());
      setError(null);
      setPasted(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative rounded-2xl border bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-black/40 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 ${
        dragOver
          ? "border-emerald-400/60 ring-2 ring-emerald-400/30"
          : "border-white/10 hover:border-white/15"
      }`}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-emerald-400/10 backdrop-blur-sm duration-150 animate-in fade-in">
          <Wand2 className="mb-2 h-7 w-7 animate-kp-float text-emerald-400" />
          <p className="text-sm font-bold text-emerald-300">أفلِت الرابط هنا</p>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">إضافة بث جديد</h2>
        </div>
        <button
          type="button"
          onClick={onOpenHelp}
          className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
        >
          <HelpCircle className="h-3 w-3 transition-transform group-hover:rotate-12" />
          كيف أحصل على الرابط؟
        </button>
      </div>

      <div className="relative">
        <Link2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrlAndClear(e.target.value)}
          placeholder="ألصق رابط M3U8 (Kick stream أو CloudFront VOD)..."
          className={`w-full rounded-xl border bg-black/40 py-3 pe-10 ps-24 font-mono text-sm text-white placeholder-white/40 outline-none transition-all focus:bg-black/60 focus:ring-2 ${
            error
              ? "border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20"
              : pasted
                ? "border-emerald-400/60 ring-2 ring-emerald-400/30"
                : "border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20"
          }`}
          dir="ltr"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70 ring-1 ring-white/10 transition-all hover:bg-emerald-400/15 hover:text-emerald-300 hover:ring-emerald-400/30"
          title="ألصق من الحافظة"
        >
          <ClipboardPaste className="h-3 w-3" />
          ألصق
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400 duration-150 animate-in slide-in-from-top-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}

      {valid && !error && meta && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs duration-150 animate-in fade-in">
          {looksKick ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-400 ring-1 ring-emerald-400/30">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              رابط صالح
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-400 ring-1 ring-amber-400/30">
              تحذير: قد لا يكون رابط M3U8
            </span>
          )}
          {meta.isLive ? (
            <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-400 ring-1 ring-red-400/30">
              <Radio className="h-3 w-3" />
              بث مباشر
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 font-semibold text-blue-400 ring-1 ring-blue-400/30">
              <Film className="h-3 w-3" />
              VOD مسجّل
            </span>
          )}
          <span className="text-white/40">سيُحفظ باسم: {meta.name}</span>
        </div>
      )}

      {showAdvanced && (
        <div className="mt-3 duration-200 animate-in slide-in-from-top-2">
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
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
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
