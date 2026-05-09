import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Space", "K"], label: "تشغيل / إيقاف" },
  { keys: ["←", "J"], label: "رجوع 10 ثواني" },
  { keys: ["→", "L"], label: "تقديم 10 ثواني" },
  { keys: ["↑"], label: "رفع الصوت" },
  { keys: ["↓"], label: "خفض الصوت" },
  { keys: ["M"], label: "كتم / إلغاء الكتم" },
  { keys: ["F"], label: "ملء الشاشة" },
  { keys: ["P"], label: "صورة داخل صورة" },
  { keys: [","], label: "تقليل السرعة" },
  { keys: ["."], label: "زيادة السرعة" },
];

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-base font-bold text-white">اختصارات لوحة المفاتيح</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-white/80">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={k}>
                    <kbd className="rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm">
                      {k}
                    </kbd>
                    {i < keys.length - 1 && <span className="mx-1 text-white/40">أو</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
