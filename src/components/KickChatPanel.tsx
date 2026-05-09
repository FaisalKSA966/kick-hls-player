import { useEffect, useMemo, useRef } from "react";
import {
  MessageSquare,
  X,
  Radio,
  Circle,
  Save,
  Square,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useKickChat, type DisplayChatMessage } from "../hooks/useKickChat";
import { formatTime } from "../lib/format";

interface Props {
  streamId: string;
  channel?: string;
  isLive: boolean;
  currentTime: number;
  onClose: () => void;
}

export function KickChatPanel({
  streamId,
  channel,
  isLive,
  currentTime,
  onClose,
}: Props) {
  const chat = useKickChat({
    streamId,
    channel,
    isLive,
    currentTime,
    active: true,
  });

  const listRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (chat.messages.length > prevLenRef.current) {
      // Auto-scroll if user is near the bottom (within 80px).
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (nearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevLenRef.current = chat.messages.length;
  }, [chat.messages.length]);

  const headerStatus = useMemo(() => {
    if (chat.mode === "off") return null;
    if (chat.mode === "live" || chat.mode === "record") {
      if (chat.status === "connected") return { label: "متصل بالشات", tone: "ok" as const };
      if (chat.status === "loading") return { label: "جاري الاتصال…", tone: "warn" as const };
      if (chat.status === "error") return { label: "تعذّر الاتصال", tone: "err" as const };
      return { label: "غير متصل", tone: "warn" as const };
    }
    if (chat.mode === "replay") {
      if (chat.status === "no_recording") return { label: "ما فيه تسجيل", tone: "warn" as const };
      return { label: "إعادة من التسجيل", tone: "ok" as const };
    }
    return null;
  }, [chat.mode, chat.status]);

  const showRecordButton = !!channel && (chat.mode === "live" || chat.mode === "record");
  const replayDisabled = !channel && chat.sessions.length === 0;

  return (
    <aside className="kp-glass kp-glass-shine relative flex h-[640px] flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20 ring-1 ring-emerald-400/30">
            <MessageSquare className="h-4 w-4 text-emerald-300" />
          </span>
          <div>
            <p className="text-sm font-black text-white">شات كيك</p>
            <p className="text-[11px] font-semibold text-white/55">
              {channel ? <span dir="ltr">@{channel}</span> : "بدون قناة"}
              {headerStatus && (
                <>
                  {" • "}
                  <span
                    className={
                      headerStatus.tone === "ok"
                        ? "text-emerald-300"
                        : headerStatus.tone === "warn"
                          ? "text-amber-300"
                          : "text-red-300"
                    }
                  >
                    {headerStatus.label}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="kp-btn-glass kp-focus-ring rounded-xl p-2 text-white/70 hover:text-white"
          aria-label="سكر"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <ModeButton
          active={chat.mode === "live"}
          onClick={() => chat.setMode("live")}
          icon={<Radio className="h-3.5 w-3.5" />}
          label="مباشر"
          disabled={!channel}
        />
        <ModeButton
          active={chat.mode === "replay"}
          onClick={() => chat.setMode("replay")}
          icon={<Clock className="h-3.5 w-3.5" />}
          label="إعادة"
          disabled={replayDisabled}
        />
        {showRecordButton &&
          (chat.recording ? (
            <button
              onClick={() => void chat.stopRecording()}
              className="kp-focus-ring inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-black text-red-200 ring-1 ring-red-400/40 transition-all hover:bg-red-500/30"
            >
              <Square className="h-3.5 w-3.5" />
              وقّف التسجيل ({chat.recordedCount})
            </button>
          ) : (
            <button
              onClick={() => void chat.startRecording()}
              className="kp-focus-ring inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-black text-rose-200 ring-1 ring-rose-400/30 transition-all hover:bg-rose-500/25"
            >
              <Circle className="h-3.5 w-3.5 fill-current" />
              سجّل الشات
            </button>
          ))}
      </div>

      {chat.error && (
        <div className="mx-3 mt-2 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{chat.error}</span>
        </div>
      )}

      {chat.mode === "replay" && chat.sessions.length > 1 && (
        <div className="border-b border-white/5 px-3 py-2">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/45">
            اختر تسجيل
          </label>
          <select
            value={chat.selectedSession?.id ?? ""}
            onChange={(e) => {
              const s = chat.sessions.find((x) => x.id === e.target.value);
              chat.setSelectedSession(s ?? null);
            }}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white outline-none focus:border-emerald-400/50"
          >
            {chat.sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startedAt).toLocaleString("ar-SA")} · {s.messageCount} رسالة
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 py-2"
        style={{ overflowAnchor: "none" }}
      >
        {chat.mode === "off" && <PanelHint title="اختر طريقة عرض الشات" sub="مباشر أو إعادة" />}

        {chat.mode === "replay" && chat.status === "no_recording" && (
          <NoRecordingState channel={channel} />
        )}

        {chat.mode === "live" && !channel && <NeedsChannelState />}

        {chat.messages.length === 0 &&
          (chat.mode === "live" || chat.mode === "record") &&
          chat.status !== "error" && (
            <PanelHint title="جاري انتظار الرسائل…" sub="بمجرد ما تنزل أول رسالة بتطلع هنا" />
          )}

        {chat.messages.length > 0 && (
          <ul className="space-y-1.5">
            {chat.messages.map((m) => (
              <ChatLine key={m.id} m={m} />
            ))}
          </ul>
        )}
      </div>

      {chat.mode === "replay" && chat.selectedSession && (
        <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 text-[11px] font-semibold text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <Save className="h-3 w-3" />
            {chat.selectedSession.messageCount.toLocaleString("ar-SA")} رسالة
          </span>
          <span dir="ltr" className="font-mono text-emerald-300">
            t = {formatTime(currentTime)}
          </span>
        </div>
      )}

      {chat.recording && (
        <div className="flex items-center justify-between border-t border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[11px] font-black text-rose-200">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
            جاري التسجيل
          </span>
          <span>{chat.recordedCount.toLocaleString("ar-SA")} رسالة</span>
        </div>
      )}
    </aside>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`kp-focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-all ${
        active
          ? "bg-emerald-400/25 text-emerald-100 ring-1 ring-emerald-400/45"
          : "kp-btn-glass text-white/75 hover:text-white"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ChatLine({ m }: { m: DisplayChatMessage }) {
  const color = m.color || "#22d3ee";
  return (
    <li className="rounded-lg px-2 py-1 text-sm leading-relaxed transition-colors hover:bg-white/5">
      {m.badges && m.badges.length > 0 && (
        <span className="mr-1.5 inline-flex items-center gap-1 align-middle">
          {m.badges.slice(0, 3).map((b, i) => (
            <BadgeChip key={i} type={b.type} text={b.text} />
          ))}
        </span>
      )}
      <span
        className="font-extrabold"
        style={{ color }}
        dir="ltr"
      >
        {m.username}
      </span>
      <span className="mx-1 text-white/40">:</span>
      <span className="font-medium text-white/85">{m.content}</span>
    </li>
  );
}

function BadgeChip({ type, text }: { type: string; text?: string }) {
  const map: Record<string, { color: string; label: string }> = {
    broadcaster: { color: "bg-red-500", label: "بث" },
    moderator: { color: "bg-emerald-500", label: "Mod" },
    sub_gifter: { color: "bg-amber-500", label: "Gift" },
    subscriber: { color: "bg-violet-500", label: "Sub" },
    vip: { color: "bg-fuchsia-500", label: "VIP" },
    og: { color: "bg-amber-400", label: "OG" },
    founder: { color: "bg-cyan-500", label: "F" },
    verified: { color: "bg-sky-500", label: "✓" },
    staff: { color: "bg-rose-500", label: "Staff" },
  };
  const meta = map[type] ?? { color: "bg-white/15", label: text ?? type.slice(0, 3) };
  return (
    <span
      className={`inline-flex h-4 items-center rounded px-1 text-[9px] font-black uppercase tracking-tight text-white ${meta.color}`}
      title={text ?? type}
    >
      {meta.label}
    </span>
  );
}

function PanelHint({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      <RefreshCw className="h-6 w-6 text-white/30" />
      <p className="text-sm font-black text-white/80">{title}</p>
      <p className="text-xs font-medium text-white/45">{sub}</p>
    </div>
  );
}

function NeedsChannelState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30">
        <AlertTriangle className="h-7 w-7 text-amber-300" />
      </div>
      <div>
        <p className="text-sm font-black text-white">يحتاج اسم قناة كيك</p>
        <p className="mt-1 text-xs font-medium text-white/55">
          عدّل تفاصيل البث وضيف "اسم قناة كيك" عشان نقدر نتصل بالشات
        </p>
      </div>
    </div>
  );
}

function NoRecordingState({ channel }: { channel?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30">
        <Clock className="h-7 w-7 text-amber-300" />
      </div>
      <div>
        <p className="text-sm font-black text-white">ما فيه تسجيل لهذا البث</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-white/55">
          كيك ما يحفظ شات الـ VOD رسميًا. عشان نطلّع لك شات متزامن مع الفيديو، لازم تسجّله أنت
          وقت البث المباشر
          {channel ? <> (لقناة @{channel})</> : ""}، وبعدين يصير متاح هنا في الإعادة.
        </p>
      </div>
    </div>
  );
}
