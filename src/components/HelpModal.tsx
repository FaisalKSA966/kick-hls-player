import { useState } from "react";
import {
  X,
  HelpCircle,
  Globe,
  Code2,
  Network,
  Search,
  PlayCircle,
  Copy,
  ArrowLeftRight,
  Radio,
  Film,
  Sparkles,
  Lightbulb,
  Keyboard,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "how" | "live" | "vod" | "tips";

const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
  { id: "how", label: "نظرة عامة", icon: HelpCircle },
  { id: "live", label: "بث مباشر", icon: Radio },
  { id: "vod", label: "VOD مسجّل", icon: Film },
  { id: "tips", label: "نصائح", icon: Lightbulb },
];

export function HelpModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("how");

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black shadow-2xl duration-200 animate-in zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-green-600 shadow-lg shadow-emerald-500/30">
              <HelpCircle className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">دليل استخراج روابط M3U8</h2>
              <p className="text-xs text-white/50">طريقة الحصول على رابط البث من Kick</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-black/40 px-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-all ${
                tab === id
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="kp-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {tab === "how" && <HowItWorks />}
          {tab === "live" && <LiveGuide />}
          {tab === "vod" && <VodGuide />}
          {tab === "tips" && <TipsGuide />}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">ما هذا الموقع؟</h3>
        </div>
        <p className="text-sm leading-relaxed text-white/80">
          مشغّل HLS احترافي يقرأ روابط <strong className="text-emerald-400">.m3u8</strong> مباشرةً ويعرضها
          بواجهة أنيقة مع تحكم كامل. يحفظ تقدّم المشاهدة وكل الروابط في متصفحك،
          <strong className="text-emerald-400"> بدون أي خادم وبدون تخزين فيديو</strong>.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-white">الميزات الأساسية</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: PlayCircle, text: "مشغّل مخصص بدل واجهة المتصفح" },
            { icon: Network, text: "يدعم البث المباشر و VOD" },
            { icon: ArrowLeftRight, text: "استئناف من آخر مكان توقفت" },
            { icon: Keyboard, text: "اختصارات لوحة مفاتيح كاملة" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
            >
              <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-xs text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 text-sm font-bold text-white">كيف ابدأ؟</h3>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
              1
            </span>
            <span>افتح تبويب "بث مباشر" أو "VOD مسجّل" لتعرف كيف تستخرج الرابط</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
              2
            </span>
            <span>ألصق الرابط في المربع أعلى الصفحة</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
              3
            </span>
            <span>سيُحفظ تلقائيًا في مكتبتك ويبدأ التشغيل</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

interface Step {
  icon: typeof Globe;
  title: string;
  body: string | React.ReactNode;
  hint?: string;
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative space-y-1 ps-6 before:absolute before:right-2.5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-emerald-400/40 before:via-white/10 before:to-transparent">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <li key={i} className="relative pb-4">
            <div className="absolute -right-3.5 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/40 bg-zinc-900 text-xs font-bold text-emerald-400 shadow-lg shadow-emerald-500/20">
              {i + 1}
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/15 hover:bg-white/10">
              <div className="mb-1 flex items-center gap-2">
                <Icon className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
              </div>
              <div className="text-xs leading-relaxed text-white/70">{step.body}</div>
              {step.hint && (
                <p className="mt-2 rounded-md bg-amber-400/10 px-2 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/20">
                  💡 {step.hint}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function LiveGuide() {
  const steps: Step[] = [
    {
      icon: Globe,
      title: "افتح صفحة البث المباشر",
      body: (
        <>
          توجّه إلى <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-400">kick.com/&lt;اسم القناة&gt;</code> بينما البث شغّال مباشرةً.
        </>
      ),
    },
    {
      icon: Code2,
      title: "افتح أدوات المطور",
      body: (
        <>
          اضغط <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">F12</kbd>{" "}
          أو كليك يمين على الصفحة → <strong className="text-white">Inspect</strong>.
        </>
      ),
      hint: "في Mac: Cmd + Option + I",
    },
    {
      icon: Network,
      title: "اذهب إلى تبويب Network",
      body: "هذا التبويب يعرض لك جميع الطلبات الشبكية التي يقوم بها متصفحك.",
    },
    {
      icon: Search,
      title: "ابحث بكلمة m3u8",
      body: (
        <>
          في خانة الفلتر اكتب{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-400">m3u8</code>.
        </>
      ),
      hint: "في كثير من المتصفحات يفضل اختيار فلتر Fetch/XHR أيضاً",
    },
    {
      icon: PlayCircle,
      title: "أعد تحميل الصفحة (F5)",
      body: (
        <>
          سيظهر طلب اسمه{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-400">master.m3u8</code>{" "}
          من نطاق <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-white/80">stream.kick.com</code>.
        </>
      ),
    },
    {
      icon: Copy,
      title: "انسخ الرابط",
      body: (
        <>
          كليك يمين على الطلب → <strong className="text-white">Copy</strong> →{" "}
          <strong className="text-emerald-400">Copy URL</strong>.
        </>
      ),
    },
    {
      icon: ArrowLeftRight,
      title: "ألصق الرابط هنا",
      body: "ارجع إلى الموقع وألصق الرابط في مربع الإدخال — راح يبدأ البث فورًا.",
      hint: "الموقع راح يميّز تلقائيًا إنه بث مباشر ويعرض شارة LIVE حمراء",
    },
  ];
  return <StepList steps={steps} />;
}

function VodGuide() {
  const steps: Step[] = [
    {
      icon: Globe,
      title: "افتح صفحة الـ VOD",
      body: (
        <>
          توجّه إلى صفحة المقطع المسجل عادةً تكون{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-400">kick.com/video/&lt;ID&gt;</code>.
        </>
      ),
    },
    {
      icon: Code2,
      title: "افتح أدوات المطور",
      body: (
        <>
          اضغط <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">F12</kbd>.
        </>
      ),
    },
    {
      icon: Network,
      title: "افتح Network → Fetch/XHR",
      body: "هذا يقلل الضوضاء ويعرض فقط طلبات البيانات.",
    },
    {
      icon: Search,
      title: "اكتب في الفلتر: m3u8",
      body: "ستظهر أسماء مثل master.m3u8 أو 1.m3u8 أو manifest.",
    },
    {
      icon: PlayCircle,
      title: "ابدأ تشغيل الفيديو",
      body: (
        <>
          عند الضغط على Play أو F5 ستظهر طلبات من نطاق{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-white/80">cloudfront.net</code>.
        </>
      ),
      hint: "اختر الرابط الذي يحتوي على /manifest/ أو ينتهي بـ master.m3u8 لأعلى جودة",
    },
    {
      icon: Copy,
      title: "انسخ الرابط الكامل",
      body: (
        <>
          كليك يمين → <strong className="text-white">Copy</strong> →{" "}
          <strong className="text-emerald-400">Copy URL</strong>.
        </>
      ),
    },
    {
      icon: ArrowLeftRight,
      title: "ألصقه هنا للتشغيل",
      body: "سيتم حفظ تقدّم مشاهدتك تلقائيًا بحيث تستطيع الاستئناف لاحقًا من نفس المكان.",
      hint: "VOD يتم تخزين تقدّم المشاهدة كل 4 ثواني داخل متصفحك فقط",
    },
  ];
  return <StepList steps={steps} />;
}

function TipsGuide() {
  return (
    <div className="space-y-3">
      {[
        {
          title: "صلاحية الروابط المباشرة",
          body: "روابط البث المباشر من Kick غالبًا تنتهي صلاحيتها بعد ساعات قليلة. إذا توقّف البث، احصل على رابط جديد بنفس الخطوات.",
        },
        {
          title: "روابط VOD أكثر استقرارًا",
          body: "روابط VOD على CloudFront قد تستمر لأشهر. استخدمها لمكتبتك الدائمة من المقاطع المفضلة.",
        },
        {
          title: "بدائل أسرع للنسخ",
          body: "في Chrome/Edge: حدّد الرابط في Network ثم Ctrl+C، أو كليك يمين → Copy → Copy as cURL ثم استخرج الـ URL.",
        },
        {
          title: "حماية بيانات المكتبة",
          body: "كل بياناتك محفوظة في localStorage محليًا. صدّر مكتبتك من زر التصدير في القائمة لحفظ نسخة احتياطية.",
        },
        {
          title: "أداء أفضل",
          body: "في حال البث المباشر بطيء، اختر جودة أقل من قائمة الإعدادات داخل المشغّل (تبويب الجودة).",
        },
        {
          title: "لقطة شاشة سريعة",
          body: "اضغط زر صورة داخل صورة (P) لتشاهد الفيديو في نافذة عائمة أثناء التصفح.",
        },
      ].map((t, i) => (
        <div
          key={t.title}
          className="rounded-xl border border-white/5 bg-white/5 p-3 animate-kp-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-400" />
            <h4 className="text-sm font-bold text-white">{t.title}</h4>
          </div>
          <p className="text-xs leading-relaxed text-white/70">{t.body}</p>
        </div>
      ))}
    </div>
  );
}
