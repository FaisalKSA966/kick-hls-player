import { useMemo, useRef, useState } from "react";
import {
  Trash2,
  Pencil,
  Search,
  Radio,
  Film,
  Play,
  Clock,
  Check,
  X,
  History,
  ListVideo,
  CheckCircle2,
  Star,
  Copy,
  Download,
  Upload,
  Filter,
} from "lucide-react";

import type { SavedStream } from "../lib/types";
import { formatRelative, formatTime, truncateUrl } from "../lib/format";

interface Props {
  streams: SavedStream[];
  activeId: string | null;
  onPlay: (stream: SavedStream) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleFavorite?: (id: string) => void;
  onCopyUrl?: (url: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

type SortKey = "recent" | "added" | "name";
type FilterKey = "all" | "favorites" | "live" | "vod";

export function StreamLibrary({
  streams,
  activeId,
  onPlay,
  onRemove,
  onRename,
  onToggleFavorite,
  onCopyUrl,
  onExport,
  onImport,
}: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = streams;
    if (filter === "favorites") list = list.filter((s) => s.isFavorite);
    else if (filter === "live") list = list.filter((s) => s.isLive);
    else if (filter === "vod") list = list.filter((s) => !s.isLive);
    if (q) {
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
    else if (sort === "added") sorted.sort((a, b) => b.addedAt - a.addedAt);
    else sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    sorted.sort((a, b) => Number(!!b.isFavorite) - Number(!!a.isFavorite));
    return sorted;
  }, [streams, query, sort, filter]);

  const counts = useMemo(
    () => ({
      all: streams.length,
      favorites: streams.filter((s) => s.isFavorite).length,
      live: streams.filter((s) => s.isLive).length,
      vod: streams.filter((s) => !s.isLive).length,
    }),
    [streams],
  );

  const startEdit = (s: SavedStream) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const commitEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) onImport(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      <div className="border-b border-white/5 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
              <ListVideo className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">المكتبة</h2>
              <p className="text-xs text-white/50">
                {streams.length} بث محفوظ{counts.favorites > 0 && ` • ${counts.favorites} مفضّل`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              disabled={streams.length === 0}
              title="تصدير المكتبة (JSON)"
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleImportClick}
              title="استيراد مكتبة (JSON)"
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في المكتبة..."
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pe-9 ps-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-black/50 focus:ring-2 focus:ring-emerald-400/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
              title="مسح البحث"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {(
            [
              { k: "all", label: "الكل", count: counts.all },
              { k: "favorites", label: "المفضلة", count: counts.favorites },
              { k: "live", label: "مباشر", count: counts.live },
              { k: "vod", label: "VOD", count: counts.vod },
            ] as { k: FilterKey; label: string; count: number }[]
          ).map(({ k, label, count }) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                filter === k
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                  : "bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {k === "favorites" && <Star className="h-3 w-3" />}
              {label}
              <span className="rounded-full bg-black/30 px-1 text-[10px] tabular-nums">
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <Filter className="h-3 w-3 text-white/30" />
          {(
            [
              { k: "recent", label: "الأحدث مشاهدة", icon: History },
              { k: "added", label: "الأحدث إضافة", icon: Clock },
              { k: "name", label: "الاسم", icon: Film },
            ] as { k: SortKey; label: string; icon: typeof History }[]
          ).map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              title={label}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                sort === k
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="kp-scrollbar flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-16 w-16 animate-kp-float items-center justify-center rounded-2xl bg-white/5">
              <Film className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-sm font-medium text-white/60">
              {streams.length === 0
                ? "لا توجد بثوث محفوظة بعد"
                : filter !== "all"
                  ? "لا توجد نتائج بهذا الفلتر"
                  : "لا توجد نتائج للبحث"}
            </p>
            {streams.length === 0 && (
              <p className="text-xs text-white/40">أضف رابط M3U8 أعلاه للبدء</p>
            )}
          </div>
        )}

        {filtered.map((s, i) => {
          const isActive = activeId === s.id;
          const progress = s.duration > 0 ? Math.min(100, (s.lastPosition / s.duration) * 100) : 0;
          const isFinished = s.duration > 0 && s.lastPosition >= s.duration - 5;
          return (
            <div
              key={s.id}
              style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
              className={`group/item relative mb-2 cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-300 animate-kp-fade-up hover:translate-y-[-1px] ${
                isActive
                  ? "border-emerald-400/50 bg-emerald-400/10 shadow-lg shadow-emerald-500/15"
                  : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05] hover:shadow-md"
              }`}
              onClick={() => editingId !== s.id && onPlay(s)}
            >
              {isActive && (
                <span className="pointer-events-none absolute inset-y-0 right-0 w-1 animate-pulse bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600" />
              )}

              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md transition-transform group-hover/item:scale-105 ${
                      s.isLive
                        ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30"
                        : "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/30"
                    }`}
                  >
                    {s.isLive ? (
                      <>
                        <Radio className="h-4 w-4 text-white" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                      </>
                    ) : (
                      <Film className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {editingId === s.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="min-w-0 flex-1 rounded-md border border-emerald-400/40 bg-black/40 px-2 py-1 text-sm text-white outline-none"
                        />
                        <button
                          onClick={commitEdit}
                          className="rounded-md p-1 text-emerald-400 transition-colors hover:bg-white/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {s.isFavorite && (
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                        )}
                        <p className="truncate text-sm font-semibold text-white" title={s.name}>
                          {s.name}
                        </p>
                      </div>
                    )}
                    <p className="truncate font-mono text-[11px] text-white/40" title={s.url}>
                      {truncateUrl(s.url, 50)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(s.id);
                    }}
                    title={s.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    className={`rounded-md p-1.5 transition-all hover:scale-110 ${
                      s.isFavorite
                        ? "text-amber-400 hover:bg-amber-400/10"
                        : "text-white/60 hover:bg-white/10 hover:text-amber-300"
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${s.isFavorite ? "fill-amber-400" : "fill-transparent"}`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyUrl?.(s.url);
                    }}
                    title="نسخ الرابط"
                    className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(s);
                    }}
                    title="تعديل الاسم"
                    className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(s.id);
                    }}
                    title="حذف"
                    className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {!s.isLive && progress > 0 && (
                <div className="mb-2">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? "bg-white/30"
                          : "bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-white/50">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelative(s.lastPlayedAt || s.addedAt)}</span>
                  {!s.isLive && s.duration > 0 && (
                    <span className="font-mono text-white/40">
                      • {formatTime(s.lastPosition)} / {formatTime(s.duration)}
                    </span>
                  )}
                </div>
                {isFinished ? (
                  <span className="flex items-center gap-1 font-semibold text-white/40">
                    <CheckCircle2 className="h-3 w-3" />
                    مكتمل
                  </span>
                ) : isActive ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <Play className="h-3 w-3 fill-emerald-400" />
                    قيد التشغيل
                  </span>
                ) : s.lastPosition > 5 && !s.isLive ? (
                  <span className="font-semibold text-emerald-400">استئناف</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
