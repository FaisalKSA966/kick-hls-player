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

interface AddPayload {
  url: string;
  name: string;
  channel?: string;
  videoId?: string;
}

interface Props {
  onAdd: (payload: AddPayload) => void;
  onOpenHelp?: () => void;
  onError?: (msg: string) => void;
}

const SAMPLE_URL =
  "https://d26yk4zpyhjeeq.cloudfront.net/v1/manifest/a837d8e4b9178bea1b3911d9b2fe01ff7553ef20/production-kick-vod/567e4cee-5310-460f-a6c8-c11275d10cd8/1.m3u8";

export function AddStreamForm({ onAdd, onOpenHelp, onError }: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [videoId, setVideoId] = useState("");
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
      const msg = "حط رابط M3U8 الأول";
      setError(msg);
      onError?.(msg);
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      const msg = "الرابط مش مظبوط، تأكد منه";
      setError(msg);
      onError?.(msg);
      return;
    }
    if (!trimmed.includes(".m3u8") && !trimmed.includes("manifest")) {
      const msg = "هذا ما يبان رابط M3U8 — لازم ينتهي بـ .m3u8 أو يحتوي على manifest";
      setError(msg);
      onError?.(msg);
      return;
    }
    setError(null);
    const auto = detectStreamMeta(trimmed);
    onAdd({
      url: trimmed,
      name: name.trim() || auto.name,
      channel: channel.trim() || undefined,
      videoId: videoId.trim() || undefined,
    });
    setUrl("");
    setName("");
    setChannel("");
    setVideoId("");
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
      const msg = "ما قدرنا نقرأ الحافظة، الصقه يدوي";
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
      className={`kp-glass kp-glass-shine relative overflow-hidden rounded-3xl p-6 transition-all duration-300 md:p-7 ${
        dragOver
          ? "ring-2 ring-emerald-400/50"
          : ""
      }`}
    >
      <span
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
        aria-hidden
      />

      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-emerald-400/15 backdrop-blur-md duration-150 animate-in fade-in">
          <Wand2 className="mb-3 h-10 w-10 animate-kp-float text-emerald-300" />
          <p className="text-base font-bold text-emerald-200">طب الرابط هنا، يا ذيب</p>
        </div>
      )}

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-600/20 ring-1 ring-emerald-400/30">
            <Sparkles className="h-4 w-4 text-emerald-300" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">ضيف بث جديد</h2>
            <p className="text-xs text-white/55">الصق الرابط وخلّنا نشغّله لك</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenHelp}
          className="kp-btn-glass kp-focus-ring group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white/80 hover:text-emerald-200"
        >
          <HelpCircle className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
          وش طريقة جلب الرابط؟
        </button>
      </div>

      <div className="relative">
        <Link2 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrlAndClear(e.target.value)}
          placeholder="ألصق رابط M3U8 (بث Kick أو CloudFront)..."
          className={`w-full rounded-2xl border-2 bg-black/45 py-4 pe-12 ps-28 font-mono text-base text-white placeholder-white/45 outline-none transition-all focus:bg-black/65 focus:ring-2 ${
            error
              ? "border-red-400/50 focus:border-red-400/70 focus:ring-red-400/20"
              : pasted
                ? "border-emerald-400/70 ring-2 ring-emerald-400/30"
                : "border-white/10 focus:border-emerald-400/55 focus:ring-emerald-400/25"
          }`}
          dir="ltr"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="kp-focus-ring absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-white/8 px-3 py-2 text-sm font-bold text-white/85 ring-1 ring-white/15 transition-all hover:bg-emerald-400/20 hover:text-emerald-200 hover:ring-emerald-400/40"
          title="ألصق من الحافظة"
        >
          <ClipboardPaste className="h-4 w-4" />
          ألصق
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-400 duration-150 animate-in slide-in-from-top-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
          {error}
        </p>
      )}

      {valid && !error && meta && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm duration-150 animate-in fade-in">
          {looksKick ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              الرابط مرتب وزِين
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-amber-300 ring-1 ring-amber-400/30">
              يحتمل ما يكون M3U8 — تأكد منه
            </span>
          )}
          {meta.isLive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 font-semibold text-red-300 ring-1 ring-red-400/30">
              <Radio className="h-3.5 w-3.5" />
              بث مباشر
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 font-semibold text-sky-300 ring-1 ring-sky-400/30">
              <Film className="h-3.5 w-3.5" />
              مقطع مسجّل
            </span>
          )}
          <span className="text-white/45">بنحفظه باسم: {meta.name}</span>
        </div>
      )}

      {showAdvanced && (
        <div className="mt-4 space-y-3 duration-200 animate-in slide-in-from-top-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">سمّ البث (اختياري)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مباراة الكلاسيكو، سترييم ليلة الجمعة..."
              className="w-full rounded-2xl border-2 border-white/10 bg-black/45 px-4 py-3 text-base text-white placeholder-white/45 outline-none transition-all focus:border-emerald-400/55 focus:bg-black/65 focus:ring-2 focus:ring-emerald-400/25"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">اسم قناة كيك (اختياري)</label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="مثال: xqc"
                dir="ltr"
                className="w-full rounded-2xl border-2 border-white/10 bg-black/45 px-4 py-3 font-mono text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/55 focus:bg-black/65 focus:ring-2 focus:ring-emerald-400/25"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Video ID (للـ VOD)</label>
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="مثال: 567e4cee-5310-460f-..."
                dir="ltr"
                className="w-full rounded-2xl border-2 border-white/10 bg-black/45 px-4 py-3 font-mono text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/55 focus:bg-black/65 focus:ring-2 focus:ring-emerald-400/25"
              />
            </div>
          </div>
          <p className="text-xs text-white/45">
            هذي البيانات تُستخدم لاحقًا لجلب شات الـ VOD المتزامن — اختياري بالكامل
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="submit"
          disabled={!valid}
          className="kp-focus-ring group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-400 to-green-500 px-6 py-3 text-base font-black text-black shadow-xl shadow-emerald-500/40 transition-all hover:scale-[1.02] hover:shadow-emerald-500/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
          شغّل واحفظ
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="kp-btn-glass kp-focus-ring rounded-2xl px-4 py-3 text-sm font-bold text-white/80 hover:text-white"
        >
          {showAdvanced ? "إخفاء التفاصيل" : "تفاصيل أكثر"}
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={fillSample}
          className="kp-btn-glass kp-focus-ring rounded-2xl px-4 py-3 text-sm font-bold text-white/80 hover:text-white"
          title="جرّب رابط VOD تجريبي من Kick"
        >
          جرّب مثال
        </button>
      </div>
    </form>
  );
}
