<div dir="rtl">

# Kick Player — مشغّل HLS احترافي

مشغّل ويب احترافي لروابط M3U8 (HLS) من Kick — يدعم البثوث المباشرة (`stream.kick.com`) و VODs (`cloudfront.net`) — مع واجهة فاخرة، استئناف تلقائي من آخر مكان توقفت فيه، ومكتبة بثوث محفوظة محليًا. لا يتم تحميل أو تخزين أي فيديو على السيرفر — كل التشغيل يحدث مباشرة من الرابط عبر [HLS.js](https://github.com/video-dev/hls.js).

</div>

---

## ✨ Features (المميزات)

<div dir="rtl">

- **مشغّل مخصص بالكامل** — مش مشغّل المتصفح الافتراضي، مبني من الصفر بـ React + HLS.js.
- **يدعم البثوث المباشرة و VOD** — يكتشف نوع البث تلقائيًا.
- **استئناف تلقائي** — يحفظ آخر مكان توقفت فيه لكل بث ويستأنف منه عند العودة.
- **مكتبة محلية** — تحفظ الروابط فقط (مش الفيديوهات) في `localStorage`، بدون أي سيرفر.
- **اختصارات لوحة المفاتيح الكاملة** — `Space`, `← →`, `↑ ↓`, `M`, `F`, `P`, `,` `.`.
- **تحكم متقدم** — تشغيل/إيقاف، تقديم/تأخير 10 ثواني، شريط seek بدقيق مع معاينة الوقت، صوت، سرعة (0.25x → 2x)، اختيار الجودة، Picture-in-Picture، ملء الشاشة.
- **تصميم خرافي** — Glassmorphism + Gradients + Neon glow + RTL.
- **متجاوب** — يعمل على الموبايل، التابلت، والديسكتوب.
- **بدون باكند** — كل البيانات محفوظة محليًا، الموقع شغّال 100% من المتصفح.

</div>

---

## 🚀 Quick Start (تشغيل سريع على لوكل هوست)

<div dir="rtl">

### المتطلبات

- [Node.js](https://nodejs.org/) **v18 أو أحدث** (يفضّل v20+)
- npm (يجي مع Node.js) أو pnpm/yarn

### الخطوات

</div>

```bash
# 1) استنسخ المستودع
git clone https://github.com/FaisalKSA966/kick-hls-player.git
cd kick-hls-player

# 2) ثبّت الاعتماديات
npm install

# 3) شغّل سيرفر التطوير
npm run dev
```

<div dir="rtl">

بعدها افتح المتصفح على:

</div>

```
http://localhost:5173
```

<div dir="rtl">

> الموقع راح يعيد التحميل تلقائيًا (HMR) كل ما تعدّل أي ملف.

### للنسخة النهائية (Production Build)

</div>

```bash
npm run build      # يبني نسخة جاهزة للنشر داخل مجلد dist/
npm run preview    # يشغّل النسخة المبنية محليًا للتجربة
```

---

## 📦 Project Structure (هيكل المشروع)

```
kick-hls-player/
├── index.html                 # HTML الجذري + خطوط Cairo + Inter
├── src/
│   ├── App.tsx                # التطبيق الرئيسي (orchestrator)
│   ├── App.css                # تصميم الخلفية + scrollbar مخصص
│   ├── index.css              # Tailwind base + خط افتراضي
│   ├── main.tsx               # نقطة الدخول
│   ├── components/
│   │   ├── VideoPlayer.tsx    # مشغّل HLS مخصص بالكامل + جميع التحكمات
│   │   ├── StreamLibrary.tsx  # قائمة البثوث المحفوظة + بحث + ترتيب
│   │   ├── AddStreamForm.tsx  # نموذج إضافة رابط جديد
│   │   ├── Header.tsx         # رأس الصفحة
│   │   └── ShortcutsModal.tsx # نافذة اختصارات لوحة المفاتيح
│   └── lib/
│       ├── types.ts           # تعريفات TypeScript
│       ├── storage.ts         # حفظ/استرجاع البثوث من localStorage
│       └── format.ts          # دوال تنسيق الوقت + النصوص
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🎮 Keyboard Shortcuts (اختصارات لوحة المفاتيح)

| المفتاح       | الوظيفة                  |
| ------------- | ------------------------ |
| `Space` / `K` | تشغيل / إيقاف            |
| `←` / `J`     | رجوع 10 ثواني            |
| `→` / `L`     | تقديم 10 ثواني           |
| `↑`           | رفع الصوت                |
| `↓`           | خفض الصوت                |
| `M`           | كتم / إلغاء الكتم        |
| `F`           | ملء الشاشة               |
| `P`           | Picture-in-Picture       |
| `,`           | تقليل السرعة (0.25x)     |
| `.`           | زيادة السرعة (0.25x)     |

---

## 🎬 Sample URLs (روابط للتجربة)

<div dir="rtl">

النوع الأول — بث Kick مباشر (Live):

</div>

```
https://stream.kick.com/3c81249a5ce0/ivs/v1/196233775518/6dnIogEqVa8m/2026/5/6/19/42/skuNjs35UPdT/media/hls/master.m3u8
```

<div dir="rtl">

النوع الثاني — Kick VOD (مقطع مسجل):

</div>

```
https://d26yk4zpyhjeeq.cloudfront.net/v1/manifest/a837d8e4b9178bea1b3911d9b2fe01ff7553ef20/production-kick-vod/567e4cee-5310-460f-a6c8-c11275d10cd8/1.m3u8
```

<div dir="rtl">

> ⚠️ روابط البثوث المباشرة تنتهي صلاحيتها بعد فترة. إذا واجهت خطأ، احصل على رابط جديد.

</div>

---

## 💾 Data Storage (تخزين البيانات)

<div dir="rtl">

كل البيانات تُحفظ في `localStorage` الخاص بمتصفحك — **ولا يتم رفع أي شيء لأي خادم**:

- `kick-player.streams.v1` — قائمة البثوث (الاسم + الرابط + آخر موقع + المدة).
- `kick-player.settings.v1` — إعدادات المشغل (الصوت، السرعة، إلخ).
- `kick-player.active.v1` — البث الحالي المشغّل.

> هذا يعني أن البيانات محصورة في متصفحك فقط (إذا فتحت متصفح آخر مش راح تشوف نفس المكتبة). إذا مسحت بيانات الموقع، راح تختفي المكتبة.

</div>

---

## 🛠 Tech Stack (التقنيات المستخدمة)

- [**React 18**](https://react.dev/) — UI library
- [**Vite 6**](https://vitejs.dev/) — build tool & dev server (HMR)
- [**TypeScript**](https://www.typescriptlang.org/) — type safety
- [**HLS.js**](https://github.com/video-dev/hls.js) — M3U8/HLS playback engine
- [**Tailwind CSS 3**](https://tailwindcss.com/) — utility-first styling
- [**Lucide React**](https://lucide.dev/) — icon set
- **localStorage** — persistence (no backend!)

---

## 📜 Scripts (الأوامر)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | تشغيل سيرفر التطوير على `:5173`      |
| `npm run build`   | بناء نسخة Production في `dist/`      |
| `npm run preview` | معاينة نسخة Production محليًا        |
| `npm run lint`    | فحص الكود بـ ESLint                  |

---

## ⚠️ Troubleshooting (حل المشاكل الشائعة)

<div dir="rtl">

### الفيديو لا يعمل / خطأ شبكة

</div>

- تأكد أن الرابط ينتهي بـ `.m3u8` أو يحتوي على `manifest`.
- روابط Kick المباشرة لها صلاحية محدودة — جرّب رابط جديد.
- بعض الروابط محمية بـ CORS — لو فتحتها مباشرة في تبويب جديد ولم تعمل، فإنها لن تعمل في المشغل أيضًا.

<div dir="rtl">

### المكتبة فاضية بعد فتح المتصفح

</div>

- تأكد أنك تستخدم نفس المتصفح ونفس البروفايل.
- في وضع التصفح المتخفي (Incognito) البيانات لا تُحفظ.

<div dir="rtl">

### أزرار الصوت / السرعة لا تستجيب

</div>

- بعض المتصفحات تتطلب تفاعل المستخدم قبل تشغيل الصوت — اضغط على الفيديو مرة واحدة.

---

## 📄 License

MIT — استخدمه كيفما شئت.
