import { useMemo, useState } from "react";
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
} from "lucide-react";

import type { SavedStream } from "../lib/types";
import { formatRelative, formatTime, truncateUrl } from "../lib/format";

interface Props {
  streams: SavedStream[];
  activeId: string | null;
  onPlay: (stream: SavedStream) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

type SortKey = "recent" | "added" | "name";

export function StreamLibrary({ streams, activeId, onPlay, onRemove, onRename }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = streams;
    if (q) {
      list = streams.filter(
        (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
    else if (sort === "added") sorted.sort((a, b) => b.addedAt - a.addedAt);
    else sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    return sorted;
  }, [streams, query, sort]);

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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
            <ListVideo className="h-5 w-5 text-black" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">المكتبة</h2>
            <p className="text-xs text-white/50">
              {streams.length} {streams.length === 1 ? "بث" : "بث"} محفوظ
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في المكتبة..."
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pr-9 pl-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-black/50 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <div className="mt-3 flex gap-1">
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
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                sort === k
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 kp-scrollbar">
        {filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Film className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-sm font-medium text-white/60">
              {streams.length === 0 ? "لا توجد بثوث محفوظة بعد" : "لا توجد نتائج للبحث"}
            </p>
            {streams.length === 0 && (
              <p className="text-xs text-white/40">أضف رابط M3U8 أعلاه للبدء</p>
            )}
          </div>
        )}

        {filtered.map((s) => {
          const isActive = activeId === s.id;
          const progress = s.duration > 0 ? Math.min(100, (s.lastPosition / s.duration) * 100) : 0;
          const isFinished = s.duration > 0 && s.lastPosition >= s.duration - 5;
          return (
            <div
              key={s.id}
              className={`group/item mb-2 cursor-pointer overflow-hidden rounded-xl border p-3 transition-all ${
                isActive
                  ? "border-emerald-400/50 bg-emerald-400/10 shadow-lg shadow-emerald-500/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
              }`}
              onClick={() => editingId !== s.id && onPlay(s)}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      s.isLive
                        ? "bg-gradient-to-br from-red-500 to-rose-600"
                        : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    }`}
                  >
                    {s.isLive ? (
                      <Radio className="h-4 w-4 text-white" />
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
                          className="rounded-md p-1 text-emerald-400 hover:bg-white/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md p-1 text-white/60 hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="truncate text-sm font-semibold text-white" title={s.name}>
                        {s.name}
                      </p>
                    )}
                    <p className="truncate font-mono text-[11px] text-white/40" title={s.url}>
                      {truncateUrl(s.url, 50)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/item:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(s);
                    }}
                    title="تعديل الاسم"
                    className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("حذف هذا البث من المكتبة؟")) onRemove(s.id);
                    }}
                    title="حذف"
                    className="rounded-md p-1.5 text-white/60 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress + meta */}
              {!s.isLive && progress > 0 && (
                <div className="mb-2">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
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
