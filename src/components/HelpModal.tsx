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
  { id: "how", label: "فكرة الموقع", icon: HelpCircle },
  { id: "live", label: "بث مباشر", icon: Radio },
  { id: "vod", label: "بث مسجل", icon: Film },
  { id: "tips", label: "نصائح سريعة", icon: Lightbulb },
];

export function HelpModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("how");

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="kp-glass-strong relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl duration-200 animate-in zoom-in-95"
      >
        <span
          className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center justify-between border-b border-white/10 px-7 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-green-600 shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
              <HelpCircle className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white md:text-xl">دليل سريع للجلب</h2>
              <p className="text-sm font-medium text-white/55">وش سويته بعريضة؟ اقرأ تحت وبنجيب الرابط بدقيقتين</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="kp-btn-glass kp-focus-ring rounded-xl p-2.5 text-white/75 hover:text-white"
            aria-label="سكر"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex border-b border-white/8 bg-black/30 px-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition-all ${
                tab === id
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="kp-scrollbar relative flex-1 overflow-y-auto px-7 py-6">
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
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-emerald-400/8 to-transparent p-5">
        <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
        <div className="relative mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-300" />
          <h3 className="text-base font-black text-white">وش هذا الموقع؟</h3>
        </div>
        <p className="relative text-base leading-relaxed text-white/80">
          مشغّل HLS احترافي يفتح روابط <strong className="text-emerald-300">.m3u8</strong> عالطاير، ويعطيك تجربة أجمل بكثير من المتصفح العادي. يحفظ لك وين وقفت وكل روابطك في الجهاز حقك، <strong className="text-emerald-300">بدون سيرفر وبدون تخزين فيديو</strong>.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-base font-black text-white">الميزات الرئيسية</h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { icon: PlayCircle, text: "مشغّل كاستوم بدل بلاير المتصفح" },
            { icon: Network, text: "يدعم البث المباشر والمسجل (VOD)" },
            { icon: ArrowLeftRight, text: "استئناف تلقائي من آخر ثانية وقفت فيها" },
            { icon: Keyboard, text: "اختصارات كيبورد كاملة زي اليوتيوب" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3.5 transition-colors hover:border-white/15 hover:bg-white/8"
            >
              <Icon className="h-5 w-5 shrink-0 text-emerald-300" />
              <span className="text-sm font-medium text-white/85">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-3 text-base font-black text-white">بدايتك بـ٣ خطوات</h3>
        <ol className="space-y-3 text-base text-white/80">
          <li className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40">
              1
            </span>
            <span className="pt-0.5 leading-relaxed">خش تبويب "بث مباشر" أو "بث مسجل" واتبع الخطوات</span>
          </li>
          <li className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40">
              2
            </span>
            <span className="pt-0.5 leading-relaxed">صفّ الرابط في الخانة فوق (أو اسحبه وجرّه في أي مكان بالصفحة)</span>
          </li>
          <li className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40">
              3
            </span>
            <span className="pt-0.5 leading-relaxed">بينحفظ تلقائي في مكتبتك ويبدأ يشتغل على طول</span>
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
    <ol className="relative space-y-1 ps-7 before:absolute before:right-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-emerald-400/45 before:via-white/10 before:to-transparent">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <li key={i} className="relative pb-4">
            <div className="absolute -right-4 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/45 bg-zinc-950 text-sm font-black text-emerald-300 shadow-lg shadow-emerald-500/30">
              {i + 1}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4 transition-colors hover:border-white/18 hover:bg-white/10">
              <div className="mb-1.5 flex items-center gap-2">
                <Icon className="h-4 w-4 text-emerald-300" />
                <h4 className="text-base font-black text-white">{step.title}</h4>
              </div>
              <div className="text-sm leading-relaxed text-white/75">{step.body}</div>
              {step.hint && (
                <p className="mt-2.5 rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/25">
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
      title: "ادخل على صفحة البث",
      body: (
        <>
          افتح <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-300">kick.com/&lt;اسم القناة&gt;</code> والبث لازم يكون شغال الحين.
        </>
      ),
    },
    {
      icon: Code2,
      title: "فتح أدوات المطور",
      body: (
        <>
          اضغط <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">F12</kbd>{" "}
          أو كليك يمين → <strong className="text-white">Inspect</strong>.
        </>
      ),
      hint: "في الماك: Cmd + Option + I",
    },
    {
      icon: Network,
      title: "خش تبويب Network",
      body: "هو اللي يعرض كل الطلبات اللي يسويها المتصفح.",
    },
    {
      icon: Search,
      title: "فلتر بـ m3u8",
      body: (
        <>
          في خانة الفلتر اكتب{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-300">m3u8</code>.
        </>
      ),
      hint: "فعّل فلتر Fetch/XHR عشان تحصل الطلبات بسرعة",
    },
    {
      icon: PlayCircle,
      title: "ريفرش الصفحة (F5)",
      body: (
        <>
          بيطلع لك طلب اسمه{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-300">master.m3u8</code>{" "}
          من <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-white/80">stream.kick.com</code>.
        </>
      ),
    },
    {
      icon: Copy,
      title: "انسخ الرابط",
      body: (
        <>
          كليك يمين على الطلب → <strong className="text-white">Copy</strong> →{" "}
          <strong className="text-emerald-300">Copy URL</strong>.
        </>
      ),
    },
    {
      icon: ArrowLeftRight,
      title: "صفّه عندنا",
      body: "ارجع للموقع وصفّ الرابط في خانة الإدخال — دغري بيبدأ البث.",
      hint: "الموقع بيعرف تلقائي إنه لايف وبيعرض لك شارة LIVE حمراء",
    },
  ];
  return <StepList steps={steps} />;
}

function VodGuide() {
  const steps: Step[] = [
    {
      icon: Globe,
      title: "ادخل على صفحة الـ VOD",
      body: (
        <>
          عادة الرابط يكون{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-emerald-300">kick.com/video/&lt;ID&gt;</code>.
        </>
      ),
    },
    {
      icon: Code2,
      title: "فتح أدوات المطور",
      body: (
        <>
          اضغط <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">F12</kbd>.
        </>
      ),
    },
    {
      icon: Network,
      title: "خش Network → فلتر Fetch/XHR",
      body: "عشان تقل الضوضاء وتبين لك بس طلبات البيانات.",
    },
    {
      icon: Search,
      title: "فلتر بـ m3u8",
      body: "بتطلع أسماء مثل master.m3u8 أو 1.m3u8 أو manifest.",
    },
    {
      icon: PlayCircle,
      title: "شغّل الفيديو",
      body: (
        <>
          أول ما تضغط Play أو تعمل ريفرش، بتطلع لك طلبات من{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-white/80">cloudfront.net</code>.
        </>
      ),
      hint: "خذ الرابط اللي فيه /manifest/ أو ينتهي بـ master.m3u8 — هذا أعلى جودة",
    },
    {
      icon: Copy,
      title: "انسخ الرابط الكامل",
      body: (
        <>
          كليك يمين → <strong className="text-white">Copy</strong> →{" "}
          <strong className="text-emerald-300">Copy URL</strong>.
        </>
      ),
    },
    {
      icon: ArrowLeftRight,
      title: "صفّه وشغّل",
      body: "بنحفظ لك تقدم المشاهدة تلقائي، ولمّا تفتح الموقع بعدين بتلقى البث واقف على نفس الثانية.",
      hint: "بنحفظ وقت المشاهدة كل ـ٤ ثواني داخل جهازك بس (مو على سيرفر)",
    },
  ];
  return <StepList steps={steps} />;
}

function TipsGuide() {
  return (
    <div className="space-y-3">
      {[
        {
          title: "روابط اللايف تنتهي بسرعة",
          body: "روابط البث المباشر من كيك تعيش ساعات بس وتتعطّل. لو وقف البث، ارجع جيب رابط جديد بنفس الخطوات.",
        },
        {
          title: "روابط الـ VOD تعيش أطول",
          body: "روابط CloudFront تعيش لأشهر. خلّي مكتبتك فيها مقاطعك المفضلة وعدّل عليها لمّا تحب.",
        },
        {
          title: "أسرع طريقة للنسخ",
          body: "في كروم/إدج: حدد الطلب في Network واضغط Ctrl+C على طول، أو كليك يمين → Copy → Copy URL.",
        },
        {
          title: "بياناتك عندك بس",
          body: "كل شي محفوظ في متصفحك (localStorage). سوي باك أب لمكتبتك من زر التحميل عشان ما تروح عليك.",
        },
        {
          title: "لو البث بطيء",
          body: "ادخل إعدادات البلاير وخفّض الجودة شوي — بتحس بالفرق على طول.",
        },
        {
          title: "بالوراء وأنت تتصفّح",
          body: "اضغط P أو زر صورة داخل صورة عشان تفتح الفيديو في نافذة عائمة وتدور في باقي التبويبات.",
        },
      ].map((t, i) => (
        <div
          key={t.title}
          className="rounded-2xl border border-white/8 bg-white/5 p-4 animate-kp-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-300" />
            <h4 className="text-base font-black text-white">{t.title}</h4>
          </div>
          <p className="text-sm leading-relaxed text-white/75">{t.body}</p>
        </div>
      ))}
    </div>
  );
}
