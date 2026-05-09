import { useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "primary",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const Icon = variant === "danger" ? Trash2 : AlertTriangle;
  const iconStyle =
    variant === "danger"
      ? "bg-red-500/15 ring-2 ring-red-500/30 text-red-400"
      : "bg-emerald-500/15 ring-2 ring-emerald-500/30 text-emerald-400";

  const confirmBtnStyle =
    variant === "danger"
      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 hover:from-red-400 hover:to-rose-500"
      : "bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-emerald-500/30 hover:from-emerald-300 hover:to-green-400";

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm duration-200 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl duration-200 animate-in zoom-in-95"
      >
        <div className="p-5">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconStyle}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{message}</p>
        </div>
        <div className="flex gap-2 border-t border-white/10 bg-black/30 p-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-white/15"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${confirmBtnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
