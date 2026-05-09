import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Space", "K"], label: "شغّل / وقّف" },
  { keys: ["←", "J"], label: "رجّع 10 ثواني" },
  { keys: ["→", "L"], label: "قدّم 10 ثواني" },
  { keys: ["↑"], label: "ارفع الصوت" },
  { keys: ["↓"], label: "نزّل الصوت" },
  { keys: ["M"], label: "اكتم / فكّ الكتم" },
  { keys: ["F"], label: "ملء الشاشة" },
  { keys: ["T"], label: "وضع المسرح (Theatre)" },
  { keys: ["P"], label: "صورة داخل صورة" },
  { keys: [","], label: "نقّص السرعة" },
  { keys: ["."], label: "زوّد السرعة" },
  { keys: ["0–9"], label: "اقفز لنسبة من المدة (0%..90%)" },
];

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="kp-glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="text-lg font-black text-white">اختصارات الكيبورد</h3>
            <p className="text-sm font-medium text-white/55">تحكّم بسرعة بدون ما تستخدم الماوس</p>
          </div>
          <button
            onClick={onClose}
            className="kp-btn-glass kp-focus-ring rounded-xl p-2.5 text-white/75 hover:text-white"
            aria-label="سكر"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative divide-y divide-white/5">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-base font-semibold text-white/85">{label}</span>
              <div className="flex items-center gap-1.5">
                {keys.map((k, i) => (
                  <span key={k} className="flex items-center">
                    <kbd className="rounded-lg border border-white/18 bg-white/10 px-2.5 py-1.5 font-mono text-xs font-black text-white shadow-sm">
                      {k}
                    </kbd>
                    {i < keys.length - 1 && <span className="mx-1.5 text-white/40">أو</span>}
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
