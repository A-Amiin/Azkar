# خطة: نظام إشعارات OneSignal لتطبيق أذكار

## Context

المطلوب هو **خطة تنفيذ فقط** (لا تعديل كود الآن) لإضافة نظام تذكيرات push بأربعة إشعارات يوميًا (صباح×2، مساء×2) لتطبيق أذكار عربي مبني بـ Next.js 16.3، باستخدام OneSignal، بدون قاعدة بيانات، مع قاعدة عمل أساسية: لا يُرسَل التذكير الثاني لمن تفاعل بالفعل مع أذكار الفترة. هذا الملف هو **الناتج النهائي المطلوب**. تم فحص المشروع فعليًا (3 وكلاء استكشاف + قراءة مباشرة للملفات الحرجة) وتم التحقق من توثيق OneSignal وVercel وGitHub الرسمي بتاريخ **2026-08-08** (روابط المصادر في القسم 27).

---

## 1. Executive Summary

المشروع حاليًا **static export بالكامل** (`output: "export"` في `next.config.ts`) بدون أي Route Handler. لا يمكن تنفيذ إرسال آمن عبر OneSignal REST API (الذي يتطلب سرًا لا يجوز كشفه للمتصفح) بدون خادم يشغّل كودًا وقت التشغيل. **القرار المعماري الموصى به: التحول إلى Next.js Full-Stack على Vercel (إزالة `output: "export"`)** مع Route Handlers محمية بـ`CRON_SECRET` تستدعيها 4 مهام Vercel Cron يوميًا، بدون قاعدة بيانات — الحالة الوحيدة المطلوب حفظها (تفعيل/تعطيل + "تمت المشاهدة اليوم") تُخزَّن في **OneSignal Data Tags**، لكن خطة الـFree Plan تسمح بتاجين (2) فقط لكل مستخدم — لذلك صُمم ترميز مضغوط: تاج واحد لكل فترة (`morning_state` / `evening_state`) يحمل إما `"off"` (معطّل) أو تاريخ آخر مشاهدة `YYYY-MM-DD`. لتفادي الاعتماد على توقيت غير موثّق لإعادة تقييم الفلاتر في الرسائل المجدولة داخل OneSignal، **لن نستخدم `send_after`/الجدولة الداخلية لـOneSignal إطلاقًا** — بدلاً من ذلك، Vercel Cron يستدعي Route Handler في اللحظة المطلوبة فعليًا، والذي يبني `filters` من قيمة التاج الحالية عندئذ ويرسل فورًا. موعد العصر يُحسب يوميًا بمكتبة محلية (`adhan`) بدون أي API خارجي.

---

## 2. وصف الوضع الحالي (من الفحص الفعلي)

- **Next.js 16.3.0**، App Router، TypeScript، React 19.2.8، Tailwind CSS v4 (بدون ملف config، عبر `@theme inline` في [app/globals.css](app/globals.css)). لا next-pwa/serwist/workbox.
- **`next.config.ts`** (المحتوى الكامل):
  ```ts
  const nextConfig: NextConfig = {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  };
  ```
- **لا يوجد `app/api/` ولا أي `route.ts`** في المشروع بالكامل. لا `vercel.json`. لا ملفات `.env*`.
- **شجرة المسارات الفعلية**: `/`، `/morning/`، `/evening/`، `/favorites/`، `/customization/`، `/offline/` (جميعها مسارات حقيقية بـ`trailingSlash: true`).
- **البيانات**: [data/azkar.json](data/azkar.json) + [data/azkar.ts](data/azkar.ts)، مُستوردة وقت البناء فقط. النوع `AzkarPeriod = "morning" | "evening"` معرّف في [types/azkar.ts](types/azkar.ts).
- **صفحات الصباح/المساء**: [app/morning/page.tsx](app/morning/page.tsx) و[app/evening/page.tsx](app/evening/page.tsx) — Server Components، تُحمّل client view واحد لكل منهما ([app/morning/components/morning-azkar-view.tsx](app/morning/components/morning-azkar-view.tsx)، [app/evening/components/evening-azkar-view.tsx](app/evening/components/evening-azkar-view.tsx)) الذي يستخدم [hooks/use-azkar-progress.ts](hooks/use-azkar-progress.ts) لتتبّع عدّاد التكرار (مخزّن يوميًا حسب التاريخ المحلي في localStorage) — هذا **تتبّع تكرار تفصيلي وليس نفس المطلوب** (نحتاج إشارة أبسط: "دخل الصفحة خلال الفترة").
- **صفحة التخصيص** [app/customization/page.tsx](app/customization/page.tsx): Server Component، 4 أقسام بنمط ثابت (عنوان `h2` + وصف + مكوّن client)، مفصولة بـ`<Separator />`: حجم الخط، المظهر، الانتقال التلقائي، شكل العداد. **لا يوجد قسم إشعارات حاليًا.**
- **طبقة التخزين المحلي**: [lib/storage.ts](lib/storage.ts) — طبقة واحدة مركزية بـ`STORAGE_KEYS` وschemas مُرقّمة بالإصدار (`version`)، وHook عام [hooks/use-local-storage.ts](hooks/use-local-storage.ts) مبني على `useSyncExternalStore`. كل ميزة إعداد لها Hook خاص بنفس النمط (`use-theme-preference.ts` إلخ). لا Redux/Zustand/Context للحالة.
- **PWA**: [app/manifest.ts](app/manifest.ts) (يُصدَّر عبر file convention، `dynamic = "force-static"`)، الأيقونات مولَّدة بـ[app/icon.tsx](app/icon.tsx)/[app/apple-icon.tsx](app/apple-icon.tsx) وليست ملفات ثابتة (تُخدَّم على `/icon/icon-32`, `/icon/icon-192`, `/icon/icon-512`, `/icon/icon-512-maskable`, `/apple-icon`). لا يوجد badge icon.
- **Service Worker**: [public/sw.js](public/sw.js) مكتوب يدويًا (لا Serwist/next-pwa) — **لا يحتوي أي `push` أو `notificationclick` listener حاليًا**، فقط `install`/`activate`/`fetch`/`message` (SKIP_WAITING). مُسجَّل عبر [components/layout/service-worker-registration.tsx](components/layout/service-worker-registration.tsx) الذي **يُلغي تسجيل الـSW في وضع dev** (يمنع اختبار push محليًا).
- **الرابط الإنتاجي**: `SITE_URL = "https://azkkar.vercel.app/"` في [lib/constants.ts](lib/constants.ts).
- **RTL**: `<html lang="ar" dir="rtl">` في [app/layout.tsx](app/layout.tsx)، بدون مكتبة RTL إضافية.
- **لا يوجد أي كود إشعارات/OneSignal/Push حاليًا في المشروع** (تم التأكد بالبحث الشامل).

---

## 3. المتطلبات المؤكدة

- 4 إشعارات يوميًا (صباح×2، مساء×2)، بدون حساب مستخدم، بدون قاعدة بيانات.
- التذكير الثاني لكل فترة يُلغى تلقائيًا إذا تفاعل المستخدم (فتح صفحة الفترة عبر الإشعار أو مباشرة) خلال الفترة.
- توقيت Africa/Cairo، بدون حساب يدوي للتوقيت الصيفي، موعد المساء مرتبط بالعصر الفعلي.
- إدارة كاملة من صفحة التخصيص: تفعيل/تعطيل عام، صباح، مساء، حالة الصلاحية، تعليمات iOS، إشعار تجريبي، رسائل خطأ عربية، لا طلب صلاحية تلقائي.
- عدم كشف REST API Key، حماية أي endpoint إرسال، idempotency، لا Database إلا لو أثبتنا الحاجة.

---

## 4. الافتراضات والأسئلة التي تحتاج قرارًا

| # | السؤال | الافتراض المُعتمد في هذه الخطة | لماذا |
|---|---|---|---|
| 1 | مذهب حساب العصر (شافعي/حنفي) | **شافعي/قياسي (`Shafi`)** عبر `adhan` مع `CalculationMethod.Egyptian()` | التوقيت الرسمي المصري يعتمد عادة على الحساب القياسي؛ قابل للتغيير بمعامل واحد |
| 2 | إحداثيات مرجعية للعصر | **القاهرة (30.0444° شمالاً، 31.2357° شرقًا)** ثابتة | لا حاجة لموقع المستخدم؛ التطبيق لا يجمع بيانات جغرافية، والفرق داخل مصر لا يتجاوز دقائق |
| 3 | نهاية فترة المساء | **22:00 بتوقيت القاهرة** (وسط النطاق 9–11م المذكور) | قابل للتعديل بسهولة في `lib/notification-schedule.ts` |
| 4 | مذهب/مدرسة إظهار "off" عند إعادة التفعيل | حذف التاج (`removeTag`) بدل تعيينه لقيمة "فارغة" | التاج غير الموجود يُفسَّر كـ"مفعّل وغير مُشاهَد" افتراضيًا — سلوك آمن |
| 5 | رمز "Icon" الإشعار | استخدام مسارات الأيقونات المولَّدة حاليًا (`/icon/icon-192`, `/icon/icon-512-maskable`) بدل إضافة ملفات جديدة | تجنّب تكرار أصول الأيقونة (YAGNI) |
| 6 | استضافة الفرونت إند لا تتغير | **يبقى Vercel**، فقط يزول `output: "export"` | لا داعي لنقل الاستضافة |
| 7 | حد أدنى لإصدار iOS/iPadOS | **Safari 16.4+ فقط** (إصدار الربيع 2023) يدعم Web Push على iOS إطلاقًا؛ ما دونه **غير مدعوم مهما فعل المستخدم** (ليس فقط "غير مثبَّت") | يجب تمييز هذه الحالة عن حالة "لم يثبّت بعد" في واجهة التخصيص برسالة مختلفة |

### تغطية الأجهزة المستهدفة (تأكيد صريح)
الخطة مصمَّمة أصلًا لتعمل على ثلاث فئات أجهزة عبر آلية واحدة (Web Push API القياسي + OneSignal Web SDK كطبقة فوقه) **بدون أي فرع معماري منفصل لكل فئة**:

| الفئة | المتصفحات المدعومة | شرط التثبيت كـPWA؟ |
|---|---|---|
| **PC (Desktop)** — Windows/macOS/Linux | Chrome, Edge, Firefox (بلا حد أدنى إصدار عملي)، Safari macOS 16+ | **غير مطلوب** — يعمل من تبويب متصفح عادي أو من التطبيق المثبَّت كـDesktop App سيّان |
| **Android** — هاتف/تابلت | Chrome, Samsung Internet, Firefox | **غير مطلوب** — يعمل من تبويب المتصفح مباشرة؛ التثبيت يحسّن تجربة الفتح فقط (standalone) |
| **iPhone / iPad** — هاتف/تابلت | Safari **16.4 فما فوق** فقط | **مطلوب إلزاميًا** — لا يعمل Web Push مطلقًا من تبويب Safari عادي، بصرف النظر عن إصدار iOS |

**الأثر على التصميم**: لا تغيير معماري مطلوب — هذا هو بالضبط سبب استخدام OneSignal Web SDK (طبقة موحدة فوق Push API القياسي) بدل حل خاص بكل منصة. التعديل الوحيد اللازم: منطق كشف "الدعم" في `hooks/use-notification-permission.ts` يجب أن يفرّق بين 3 حالات على iOS تحديدًا بدل حالتين:
1. iOS/iPadOS < 16.4 → **"غير مدعوم على هذا الإصدار"** (رسالة نهائية، لا حل متاح سوى تحديث النظام).
2. iOS/iPadOS ≥ 16.4 لكن يعمل من تبويب Safari عادي (ليس standalone) → **"يتطلب التثبيت على الشاشة الرئيسية أولًا"** (تعليمات iOS الحالية في القسم 8/17).
3. iOS/iPadOS ≥ 16.4 ومثبَّت standalone → المسار الطبيعي (نفس Android/Desktop).

الكشف عمليًا: فحص `navigator.userAgent`/`navigator.standalone` (نمط موجود بالفعل في [hooks/use-pwa-install.ts](hooks/use-pwa-install.ts)) + فحص وجود `window.safari`/دعم `PushManager` كإشارة غير مباشرة على إصدار Safari (لا توجد طريقة رسمية لقراءة رقم إصدار iOS من JS مباشرة؛ الاعتماد الفعلي هو على `"PushManager" in window` كاختبار قدرة (feature detection) لا كاختبار إصدار — وهو الأسلوب المُوصى به فعليًا: **إن كان `PushManager` غير موجود في `window` على أي منصة (بما فيها iOS القديم)، تُعرض حالة "غير مدعوم" مباشرة بغضّ النظر عن سبب عدم الدعم** — هذا يبسّط الكشف لحالتين فعليتين بدل ثلاث، ويُغني عن استنتاج رقم إصدار iOS يدويًا.

> **تناقض صريح بين المطلوب والخطة المجانية**: طلب المستخدم الأصلي اقترح تاجين لكل فترة (`morning_seen_date` + قد يلزم `morning_enabled` منفصل) = **4 تاجات محتملة**. لكن التحقّق من [onesignal.com/pricing](https://onesignal.com/pricing) (2026-08-08) يؤكد: **خطة Free = تاجان (2 Data Tags) فقط**. الحل: ترميز الحالتين (مفعّل/معطّل + تاريخ آخر مشاهدة) في **تاج واحد لكل فترة** (انظر القسم 11). هذا يعمل ضمن الحد المجاني تمامًا لكن يقلّل المرونة المستقبلية (لا مجال لتاج ثالث بدون ترقية الخطة).

---

## 5. مقارنة الحلول المعمارية

| المعيار | الحل 1: Next.js Full-Stack + Vercel Cron | الحل 2: Static PWA + GitHub Actions |
|---|---|---|
| كشف REST API Key | آمن (env var على Vercel، Route Handler فقط) | آمن (GitHub Secrets) |
| زر "إشعار تجريبي" في الواجهة | ✅ طبيعي (Route Handler يستدعيه المتصفح مباشرة) | ❌ يحتاج خادمًا صغيرًا منفصلًا على أي حال (GH Actions لا يُستدعى من زر متصفح بأمان) — يُبطل فكرة "بدون backend" |
| دقة التوقيت | Vercel Cron (Hobby): مرة/يوم لكل مهمة، **UTC فقط**، انزياح حتى 59 دقيقة داخل الساعة المحددة | GitHub Actions: تكرار أعلى ممكن، لكن تأخير موثّق 5–30 دقيقة (وأحيانًا أكثر وقت الذروة) |
| دعم DST/Africa/Cairo | يُعالَج داخل كود Route Handler بـ`Intl` (IANA-aware)، مستقل عن دقة الجدولة الخارجية | نفس المنطق ممكن لكنه يعيش في سكربت منفصل عن التطبيق |
| عدد الأدوات/الأنظمة | نظام واحد (Vercel) | نظامان (Vercel للاستضافة + GitHub للجدولة) — تعقيد تشغيلي أعلى |
| البقاء Static Export | ❌ يُزال | ✅ يبقى |
| الموثوقية العامة | جيدة (best-effort، موثّقة رسميًا مع توصية بالـidempotency) | جيدة لكن أقل قابلية للمراقبة من داخل نفس المشروع |
| Vendor lock-in | منخفض (Vercel مستضدم أصلًا للمشروع) | يضيف اعتمادًا تشغيليًا على GitHub Actions |
| Second-reminder المشروط | ممكن بنفس الطريقة (استدعاء REST API وقت الإرسال الفعلي بفلتر حديث) في كلا الحلين | نفس الإمكانية |

**القرار**: الحل 1. السبب الحاسم: **الحل 2 لا يستطيع تلبية متطلب "إشعار تجريبي آمن من الواجهة" بدون إضافة خادم صغير على أي حال**، مما يُبطل فائدته الرئيسية (البقاء بلا backend). بما أننا سنحتاج Route Handler واحدًا كحد أدنى، فمن الأبسط أن يكون هو نفسه المسؤول عن الإرسال المجدول، ضمن نفس المستودع ونفس بيئة الـdeploy، دون إدارة نظامين منفصلين.

**الحل 3 (مرفوض)**: استخدام مزود Cron خارجي مجاني (مثل cron-job.org) لاستدعاء Route Handler بدل Vercel Cron — يحل مشكلة دقة التوقيت لكنه يضيف vendor ثالث بلا داعٍ بينما Vercel Cron (4 مهام/يوم فقط، بعيدًا عن حد الـ100) كافٍ تمامًا نظرًا لاتساع نوافذ الفترات (الصباح 6 ساعات، المساء عدة ساعات) — انزياح حتى 59 دقيقة **لا يشكّل مشكلة عملية** هنا.

---

## 6. الـArchitecture الموصى بها

**Next.js Full-Stack على Vercel، بدون قاعدة بيانات، حالة التذكير الثاني محفوظة في OneSignal Data Tags (تاج واحد مضغوط لكل فترة).**

- إزالة `output: "export"` من [next.config.ts](next.config.ts) — باقي الصفحات تظل مُحسَّنة ثابتًا تلقائيًا (Next.js لا يفرض ديناميكية إلا على المسارات التي تستخدمها فعليًا، وهي فقط `app/api/*` الجديدة).
- 4 Route Handlers (GET) تحت `app/api/cron/*` تُستدعى من 4 إدخالات Vercel Cron في `vercel.json`، محمية بـ`CRON_SECRET` (نمط Vercel الرسمي).
- Route Handler خامس (POST) `app/api/notifications/test` للإشعار التجريبي، يستهدف اشتراك المتصفح المُستدعي فقط.
- لا جدولة داخل OneSignal نفسه (`send_after`) — الإرسال يحدث فورًا وقت استدعاء الـCron، بفلتر مبني من قيمة التاج **في تلك اللحظة**.
- التفاعل مع الصفحة (فتح `/morning/` أو `/evening/` خلال الفترة) يُحدّث التاج مباشرة من العميل عبر OneSignal Web SDK (`OneSignal.User.addTag`) — لا حاجة لـRoute Handler وسيط لهذه الخطوة لأن SDK يتواصل مع OneSignal مباشرة بمعرّف الـApp ID العام (غير سري).

---

## 7. رسم نصي لتدفق النظام

```
                     ┌─────────────────────────┐
                     │   Vercel Cron (×4/day)   │  UTC-fixed schedules
                     └───────────┬─────────────┘
                                 │ GET + Authorization: Bearer CRON_SECRET
                                 ▼
        ┌────────────────────────────────────────────────┐
        │  app/api/cron/{morning-1,morning-2,             │
        │               evening-1,evening-2}/route.ts     │
        │  1) تحقق CRON_SECRET                             │
        │  2) احسب الوقت المحلي الحالي بالقاهرة (Intl)      │
        │  3) (مساء فقط) احسب العصر اليوم عبر adhan          │
        │  4) تحقق أن الوقت داخل نافذة الفترة (وإلا: توقّف)   │
        │  5) ابنِ filters من نمط التاج المطلوب               │
        │  6) استدعِ OneSignal REST API /notifications       │
        │     مع idempotency_key فريد لهذا اليوم+الفتحة        │
        └───────────────────────┬──────────────────────────┘
                                 │ HTTPS + REST API Key (server-only)
                                 ▼
                     ┌─────────────────────────┐
                     │   OneSignal Platform      │
                     │  يقيّم filters على تاج      │
                     │  morning_state/evening_state│
                     │  لحظة الإرسال (فوري، ليس    │
                     │  مجدولًا داخليًا)             │
                     └───────────┬─────────────┘
                                 │ Web Push
                                 ▼
                     ┌─────────────────────────┐
                     │  متصفح المستخدم /OneSignalSDKWorker.js│
                     │  (يستورد OneSignal SW script) │
                     └───────────┬─────────────┘
                                 │ click → فتح/تركيز /morning أو /evening
                                 ▼
        ┌────────────────────────────────────────────────┐
        │  app/morning (أو evening) — عند التحميل:          │
        │  useMarkPeriodSeen(period):                       │
        │   - هل الوقت المحلي داخل نافذة الفترة؟              │
        │   - هل يوجد اشتراك OneSignal فعّال؟                 │
        │   - إن لم يكن التاج = "off": عيّن التاج = تاريخ اليوم │
        └────────────────────────────────────────────────┘
```

---

## 8. تدفق الاشتراك وطلب الصلاحية

1. المستخدم يفتح `/customization/` (لا يُطلب أي إذن تلقائيًا).
2. يرى قسم "الإشعارات" بحالة الصلاحية الحالية (`Notification.permission`: `default` / `granted` / `denied`، أو "غير مدعوم" إن لم يكن `"Notification" in window` أو `"serviceWorker" in navigator`).
3. عند الضغط على مفتاح "تفعيل الإشعارات" (user gesture صريح):
   - إن لم يكن OneSignal SDK محمّلًا بعد، يُحمَّل الآن (lazy).
   - `OneSignal.Notifications.requestPermission()` (يُظهر Native Prompt).
   - عند `granted`: يُنشأ اشتراك Web Push تلقائيًا داخل OneSignal SDK؛ لا حاجة لتاج فوري (التاج يُكتب لاحقًا فقط عند دخول صفحة الفترة).
   - عند `denied`: رسالة عربية واضحة + توضيح أن التفعيل يتطلب تغيير الإذن من إعدادات المتصفح.
4. iOS Safari: يُعرض تنبيه أن Web Push على iOS يتطلب **تثبيت التطبيق على الشاشة الرئيسية أولًا** (PWA installed/standalone) — يُكتشف عبر نفس منطق [hooks/use-pwa-install.ts](hooks/use-pwa-install.ts) الموجود بالفعل (كشف iOS + standalone)، وإن لم يكن مثبتًا يُعرض شرح الخطوات بدل زر التفعيل.
5. مفتاحا "تذكيرات الصباح" و"تذكيرات المساء" الفرعيان يظهران فقط بعد منح الصلاحية، ويتحكمان بكتابة/حذف قيمة `"off"` في التاج المعني.

---

## 9. تدفق إشعارات الصباح

- **الفترة**: 05:00–11:00 بتوقيت القاهرة (ثابتة، لا تعتمد على العصر).
- **صباح-1**: Cron يوميًا في نافذة UTC مبكرة (تغطي ~05:xx–06:xx القاهرة بغضّ النظر عن أوفست +2/+3) → فلتر: `morning_state != "off"` (مع معالجة "غير موجود" كـ"يمر"، القسم 11) → إرسال للجميع تقريبًا (فقط من عطّل مستبعد).
- **صباح-2**: Cron لاحقًا في نفس الفترة (~08:xx–09:xx القاهرة) → فلتر: `morning_state != "off"` **و** `morning_state != today` → لا يصل لمن دخل صفحة الصباح بالفعل اليوم أو عطّل التذكير.
- **حارس زمني إضافي داخل الكود**: إن كان الوقت المحلي الحالي وقت التنفيذ **خارج 05:00–11:00** (بسبب انزياح Vercel Cron أو تغيّر أوفست القاهرة)، Route Handler **يتوقف بدون إرسال** — يمنع وصول إشعار "صباحي" متأخر بعد الظهر.

---

## 10. تدفق إشعارات المساء

- **الفترة**: من موعد العصر الفعلي اليوم (محسوب عبر `adhan`) حتى 22:00 بتوقيت القاهرة.
- **مساء-1**: Cron يوميًا في نافذة UTC متأخرة بما يكفي لتغطية **أقصى وقت عصر محتمل في القاهرة طوال السنة (~16:20 محليًا تقريبًا) بأي من الأوفستين +2/+3** → عند التنفيذ: يُحسب العصر الفعلي لليوم عبر `adhan`، إن كان الوقت الحالي ≥ العصر المحسوب ويقع ضمن الفترة → إرسال فورًا بفلتر `evening_state != "off"`.
- **مساء-2**: Cron لاحقًا (بفارق ساعتين إلى ثلاث تقريبًا عن مساء-1، ما زال ضمن 21:00–23:00 القاهرة) → فلتر: `evening_state != "off"` **و** `evening_state != today`.
- **حارس زمني**: إن كان الوقت الحالي قبل العصر المحسوب فعليًا (نادر، لكن ممكن لو تغيّر أوفست القاهرة بشكل غير متوقع) أو بعد نهاية الفترة → توقّف بدون إرسال.

---

## 11. آلية منع الإشعار الثاني (تصميم OneSignal Tags)

### القيد المكتشف
خطة OneSignal Free تسمح بـ**تاجين (2 Data Tags)** فقط لكل مستخدم ([onesignal.com/pricing](https://onesignal.com/pricing)، تحقّق 2026-08-08). توثيق OneSignal العام **لا يوضّح صراحة** ما إذا كانت الرسائل المجدولة (`send_after`) تُعيد تقييم فلاتر الجمهور وقت الإنشاء أم وقت الإرسال الفعلي — لذلك **لن نعتمد على `send_after` إطلاقًا** لهذا القرار؛ الإرسال يتم فورًا وقت استدعاء الـCron بفلتر حديث (القسم 6/7)، مما يُلغي المشكلة كليًا بدل الاعتماد على سلوك غير موثّق.

### الترميز
تاج واحد لكل فترة، بدل 4 تاجات منفصلة (seen×2 + enabled×2):

| التاج | القيم الممكنة | المعنى |
|---|---|---|
| `morning_state` | غير موجود (absent) | مفعّل، لم يُشاهَد اليوم بعد (الحالة الافتراضية) |
| | `"off"` | المستخدم عطّل تذكيرات الصباح يدويًا |
| | `"YYYY-MM-DD"` | آخر تاريخ محلي (Africa/Cairo) دخل فيه المستخدم صفحة الصباح خلال فترتها |
| `evening_state` | نفس الأنماط الثلاثة لفترة المساء |

### الكتابة (من العميل عبر Web SDK، بدون خادم وسيط)
- **تعطيل الفترة** من صفحة التخصيص → `OneSignal.User.addTag("morning_state", "off")` (يُستبدل أي تاريخ محفوظ).
- **إعادة التفعيل** → `OneSignal.User.removeTag("morning_state")` (يعود للحالة الافتراضية "مفعّل وغير مُشاهَد").
- **دخول صفحة الفترة خلال نافذتها الزمنية** (عبر ضغط الإشعار أو تصفّح مباشر — كلاهما معتبر تفاعلًا حسب المتطلبات) → إن كانت القيمة الحالية **ليست** `"off"` ولا تساوي تاريخ اليوم، عيّن `addTag("morning_state", todayCairoDate())`. **لا تكتب فوق `"off"`** — دخول الصفحة لا يُعيد تفعيل تذكيرات عطّلها المستخدم صراحة.

### القراءة (فلاتر REST API وقت الإرسال الفعلي)
- **الإشعار الأول** لأي فترة: يشمل الجميع باستثناء من عطّل:
  ```
  [{field:"tag", key:"morning_state", relation:"not_exists"},
   {operator:"OR"},
   {field:"tag", key:"morning_state", relation:"!=", value:"off"}]
  ```
- **الإشعار الثاني**: نفس الشرط أعلاه **مع** استبعاد من شاهد اليوم (تقييم متسلسل من اليسار لليمين: `(not_exists OR !=off) AND !=today`):
  ```
  [...نفس الشرطين أعلاه...,
   {operator:"AND"},
   {field:"tag", key:"morning_state", relation:"!=", value:"<today-cairo-date>"}]
  ```

> ⚠️ **افتراض يحتاج تحقّقًا عمليًا (مذكور في القسم 23)**: سلوك OneSignal مع تاج غير موجود (`not_exists`) عند دمجه بـ`OR`/`AND` متتاليين غير موثّق بالتفصيل الكافي في الصفحات التي تم فحصها. يجب اختبار المجموعة الكاملة (تاج غائب/`"off"`/تاريخ قديم/تاريخ اليوم) على أجهزة اختبار حقيقية قبل الإطلاق.

### سباق الحالة (Race Condition) قرب موعد الإرسال الثاني
بما أن الفلتر يُبنى ويُقيَّم لحظة استدعاء REST API (وليس مسبقًا)، فإن أي تحديث تاج يحدث **قبل** تلك اللحظة (حتى لو بثوانٍ) سيُقرأ صحيحًا. الخطر الوحيد المتبقي: تحديث تاج يصل لخوادم OneSignal بعد إرسال الطلب مباشرة (نافذة سباق ضيقة جدًا، من رتبة أجزاء الثانية) — نتيجته أسوأ الأحوال: وصول إشعار ثانٍ زائد نادر جدًا، وهو مقبول (fail-safe نحو "إرسال زائد نادر" أفضل من "عدم إرسال" في تطبيق تذكير).

---

## 12. استراتيجية التوقيت وAfrica/Cairo وموعد العصر

- **القرار**: حساب العصر يوميًا عبر **مكتبة `adhan` (npm)** محليًا داخل Route Handler — وليس عبر Prayer Times API خارجي ولا تواريخ ثابتة ولا حساب يدوي.
- **لماذا لا مواعيد ثابتة**: العصر يتحرك فعليًا نحو ساعة ونصف تقريبًا بين الصيف والشتاء في القاهرة؛ موعد ثابت سيكون خاطئًا لأشهر كثيرة من السنة.
- **لماذا لا Prayer Times API خارجي**: يضيف اعتمادًا شبكيًا خارجيًا (uptime، rate limits، زمن استجابة) داخل Route Handler حساس التوقيت، بلا داعٍ حين توجد مكتبة حسابية حتمية موثوقة تعمل offline بالكامل ومجانًا بلا حدود استدعاء.
- **لماذا لا حساب يدوي/DST يدوي**: ممنوع صراحة في المتطلبات؛ كما أن التوقيت الصيفي في مصر تاريخه غير مستقر (أُلغي ثم أُعيد جزئيًا في سنوات سابقة) فالاعتماد على أوفست يدوي هش وخطر.
- **آلية عملية**: `adhan` يُعيد كائنات `Date` بتوقيت UTC مطلق؛ نستخدم `Intl.DateTimeFormat` مع `timeZone: "Africa/Cairo"` (بدون أي حساب أوفست يدوي) لقراءة/مقارنة الوقت المحلي — هذا يتعامل تلقائيًا مع أي تغيّر مستقبلي في قاعدة IANA لتوقيت مصر دون تعديل كود.
- **قيد Vercel Cron المكتشف**: الجدولة نفسها **UTC ثابت فقط** (لا يدعم IANA timezone في `vercel.json`)، وHobby plan يسمح بانزياح حتى 59 دقيقة داخل الساعة المحددة. الحل: نختار قيم UTC للجدولة بهامش أمان يغطي **كلا الاحتمالين** (+2/+3 أوفست القاهرة) بدل الاعتماد على دقة الساعة، ثم **الحارس الزمني داخل الكود نفسه** (وليس توقيت الـCron) هو مصدر الحقيقة النهائي لصحة الإرسال من عدمه.

---

## 13. تصميم OneSignal Tags وSegments وFilters

- **لا حاجة لإنشاء Segments يدوية في لوحة OneSignal** — الفلاتر تُبنى ديناميكيًا في الكود وتُرسَل مباشرة ضمن جسم طلب `POST /notifications` (حقل `filters`)، وهذا يتوافق مع حد الـ6 Segments المجانية (لا نستهلك منه شيئًا أصلًا).
- **التاجات**: `morning_state`, `evening_state` فقط (القسم 11) — يستهلكان كامل حد الـ2 Data Tags المجاني. **لا مجال لتاج ثالث مستقبلًا بدون ترقية الخطة** (نقطة يجب توثيقها للمستخدم كقيد معروف).
- **idempotency_key**: UUID (RFC 9562) مُشتق حتميًا من مفتاح منطقي مثل `"morning-1:2026-08-08"` عبر UUID v5 (مكتبة `uuid`)، صالح 30 يومًا حسب توثيق OneSignal — يضمن أن إعادة محاولة نفس الطلب (بسبب retry) لا تُنتج إشعارًا مكررًا.

---

## 14. Environment Variables والأسرار

| المتغير | النوع | أين يُستخدم |
|---|---|---|
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | عام (public) | Web SDK في المتصفح — App ID ليس سرًا حسب اصطلاح OneSignal المعروف |
| `ONESIGNAL_REST_API_KEY` | **سري — server-only** | داخل Route Handlers فقط، لا يبدأ بـ`NEXT_PUBLIC_` أبدًا، لا يُطبع في أي log |
| `CRON_SECRET` | **سري — server-only** | يقارن مع هيدر `Authorization: Bearer <value>` الذي يُرسله Vercel تلقائيًا لكل استدعاء Cron |

كل الأسرار تُضاف عبر Vercel Project Settings → Environment Variables (وليست في أي ملف مُلتزَم بالمستودع؛ `.gitignore` الحالي يستثني `.env*` بالفعل).

---

## 15. Route Handlers / Cron المطلوبة

`vercel.json` (جديد، جذر المشروع) — 4 إدخالات، كل واحدة **مرة واحدة يوميًا** (يفي بقيد Hobby):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    { "path": "/api/cron/morning-1", "schedule": "0 3 * * *" },
    { "path": "/api/cron/morning-2", "schedule": "0 6 * * *" },
    { "path": "/api/cron/evening-1", "schedule": "0 14 * * *" },
    { "path": "/api/cron/evening-2", "schedule": "0 17 * * *" }
  ]
}
```
(القيم توضيحية أولية بهامش أمان حسب القسم 12؛ تُضبط نهائيًا بعد المراجعة.)

Route Handlers (كلها `export const runtime = "nodejs"` صراحة لضمان توفر `Intl`/الحزم):
- `app/api/cron/morning-1/route.ts`, `.../morning-2/route.ts`, `.../evening-1/route.ts`, `.../evening-2/route.ts` — كل ملف: تحقق `CRON_SECRET` → حارس زمني → بناء filters → استدعاء REST API.
- `app/api/notifications/test/route.ts` (POST) — إشعار تجريبي يستهدف اشتراك المستدعي فقط (`include_subscription_ids`)، بدون سر (محمي ذاتيًا لأنه يستهدف مُرسِله فقط).

---

## 16. التغييرات المطلوبة في Service Worker والـPWA

- **[public/OneSignalSDKWorker.js](public/OneSignalSDKWorker.js)** (اسمه كان `public/sw.js`، اتغيّر — انظر أسفل): إضافة سطر واحد أعلى الملف:
  ```js
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
  ```
  يدمج منطق push/notificationclick الخاص بـOneSignal داخل نفس الملف الحالي دون استبدال listeners الموجودة (install/activate/fetch/message تبقى كما هي وتعمل بالتوازي — المتصفح يدعم عدة listeners لنفس الحدث). **لا حاجة لكتابة `push`/`notificationclick` يدويًا** — سكربت OneSignal المستورد يوفرهما، بما في ذلك تركيز نافذة مفتوحة بدل فتح نافذة مكررة (سلوك افتراضي عام لـSDK، يُتحقق منه عمليًا في القسم 23).
- **⚠️ تصحيح موثَّق بعد اختبار حقيقي على الإنتاج (2026-08-09)**: الخطة الأصلية هنا كانت تفترض — بناءً على توثيق OneSignal العام ومتتبّع مشاكل الـSDK — أن تمرير `serviceWorkerPath: "sw.js"` وحده داخل `OneSignal.init()` كافٍ لاستخدام اسم ملف مخصّص بدل `OneSignalSDKWorker.js` الافتراضي. **ثبت خطأ هذا الافتراض عمليًا**: ظهر خطأ حقيقي في console الإنتاج (`A bad HTTP response code (404)`) يوضّح أن `OneSignal.init()` **يتجاهل** هذا الخيار فعليًا ويطلب دائمًا `/OneSignalSDKWorker.js` بصرف النظر عن القيمة الممرَّرة. **الحل المُطبَّق فعليًا**: إعادة تسمية الملف إلى `public/OneSignalSDKWorker.js` (اسم OneSignal الافتراضي بالضبط) وحذف `serviceWorkerPath`/`serviceWorkerParam` من `OneSignal.init()` نهائيًا — الاعتماد على السلوك الافتراضي بدون أي إعداد هو المسار الموثوق الوحيد المؤكَّد عمليًا. **الدرس المستفاد**: توثيق OneSignal العام وتتبّع المشاكل على GitHub لا يُغنيان عن اختبار حي فعلي قبل اعتماد سلوك غير افتراضي.
- **[components/layout/service-worker-registration.tsx](components/layout/service-worker-registration.tsx)**: لا تغيير في المنطق، لكن **قيد معروف**: هذا الملف يُلغي تسجيل الـSW بالكامل في وضع dev، مما يمنع اختبار push محليًا على `localhost` — الحل: الاختبار يتم على Vercel Preview Deployment (قسم 22/23).
- **[app/manifest.ts](app/manifest.ts)**: لا تغيير مطلوب (لا حقول يتطلبها Web Push الحديث القائم على VAPID/OneSignal).

---

## 17. التغييرات المطلوبة في واجهة التخصيص

قسم خامس جديد في [app/customization/page.tsx](app/customization/page.tsx)، بنفس نمط الأقسام الأربعة الحالية (`h2` + وصف + `<Separator />` + مكوّن client جديد `<NotificationSettings />`)، يغطي:
- حالة الصلاحية (badge/نص: غير مطلوبة بعد / مسموح بها / مرفوضة / غير مدعومة) بالعربية.
- مفتاح تفعيل/تعطيل عام (يُشغّل `requestPermission` بضغطة مستخدم صريحة فقط).
- مفتاحان فرعيان (صباح/مساء) يظهران بعد المنح فقط.
- تعليمات iOS الشرطية (تُعرض فقط عند iOS + عدم standalone، بإعادة استخدام كشف [hooks/use-pwa-install.ts](hooks/use-pwa-install.ts)).
- زر "إرسال إشعار تجريبي" (يستدعي `/api/notifications/test`).
- رسائل خطأ عربية واضحة لكل حالة فشل (رفض الصلاحية، فشل الشبكة، متصفح غير مدعوم).

---

## 18. قائمة الملفات الحالية التي ستتغير

| الملف | سبب التعديل |
|---|---|
| [next.config.ts](next.config.ts) | إزالة `output: "export"` لتفعيل Route Handlers الديناميكية |
| [package.json](package.json) | إضافة `adhan` و`uuid` كاعتماديات server-side |
| [public/OneSignalSDKWorker.js](public/OneSignalSDKWorker.js) (كان `public/sw.js`) | دمج سكربت OneSignal (`importScripts`) + إعادة تسمية للاسم الافتراضي (انظر التصحيح في القسم 16) |
| [app/customization/page.tsx](app/customization/page.tsx) | إضافة قسم "الإشعارات" الخامس |
| [app/layout.tsx](app/layout.tsx) | تحميل مزوّد تهيئة OneSignal SDK (بجانب `<ServiceWorkerRegistration />`) |
| [app/morning/components/morning-azkar-view.tsx](app/morning/components/morning-azkar-view.tsx) | استدعاء `useMarkPeriodSeen("morning")` عند التحميل |
| [app/evening/components/evening-azkar-view.tsx](app/evening/components/evening-azkar-view.tsx) | استدعاء `useMarkPeriodSeen("evening")` عند التحميل |
| [lib/storage.ts](lib/storage.ts) | إضافة `STORAGE_KEYS.notificationPreference` + schema جديد (مرآة محلية فقط) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | توثيق التحول من static export بحت إلى hybrid + سبب ذلك |

## 19. قائمة الملفات الجديدة المقترحة

| الملف | المسؤولية |
|---|---|
| `vercel.json` | تعريف 4 مهام Cron |
| `app/api/cron/morning-1/route.ts` (+`morning-2`, `evening-1`, `evening-2`) | نقاط دخول الجدولة، كل واحدة لفتحة إرسال واحدة |
| `app/api/notifications/test/route.ts` | إشعار تجريبي ذاتي الاستهداف |
| `lib/onesignal-server.ts` | عميل REST API (بناء filters، الإرسال، معالجة 429/5xx وretries) — **server-only، لا يُستورَد من أي client component** |
| `lib/prayer-times.ts` | غلاف حول `adhan` لحساب عصر اليوم بالقاهرة |
| `lib/cairo-time.ts` | أدوات وقت القاهرة المبنية على `Intl` (تاريخ اليوم، هل الوقت داخل نافذة) |
| `lib/notification-schedule.ts` | تعريف نوافذ الفترات (بداية/نهاية) وربطها بأربع الفتحات |
| `lib/notification-copy.ts` | نصوص الإشعارات الأربعة + العناوين + الروابط + topic |
| `components/providers/onesignal-init.tsx` | تحميل/تهيئة OneSignal Web SDK (نمط مطابق لـ`ServiceWorkerRegistration`) |
| `hooks/use-notification-permission.ts` | حالة الصلاحية + الدعم + طلبها بإيماءة المستخدم |
| `hooks/use-notification-preference.ts` | تفعيل/تعطيل الفترتين (يكتب/يحذف التاجات) + مرآة localStorage |
| `hooks/use-mark-period-seen.ts` | منطق "تسجيل المشاهدة" عند دخول صفحة فترة |
| `app/customization/components/notification-settings.tsx` | واجهة القسم الخامس بالكامل |

---

## 20. Pseudocode / Code Skeleton للأجزاء الحرجة

**`lib/cairo-time.ts`**
```ts
const TZ = "Africa/Cairo";
export function nowCairoParts(): { date: string; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: +parts.hour, minute: +parts.minute };
}
export function isWithinWindow(startMin: number, endMin: number): boolean {
  const { hour, minute } = nowCairoParts();
  const nowMin = hour * 60 + minute;
  return nowMin >= startMin && nowMin <= endMin;
}
```

**`lib/prayer-times.ts`**
```ts
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
const CAIRO = new Coordinates(30.0444, 31.2357);
export function getAsrCairoMinutes(): number {
  const params = CalculationMethod.Egyptian();
  const times = new PrayerTimes(CAIRO, new Date(), params);
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(times.asr).map(p => [p.type, p.value]));
  return (+parts.hour) * 60 + (+parts.minute);
}
```

**`app/api/cron/evening-1/route.ts`**
```ts
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { date, hour, minute } = nowCairoParts();
  const nowMin = hour * 60 + minute;
  const asrMin = getAsrCairoMinutes();
  const EVENING_END_MIN = 22 * 60;
  if (nowMin < asrMin || nowMin > EVENING_END_MIN) {
    return Response.json({ skipped: true, reason: "outside-window", nowMin, asrMin });
  }
  await sendNotification({
    ...EVENING_1_COPY,
    filters: buildFilters("evening_state", { excludeToday: false }),
    idempotencyKey: uuidv5(`evening-1:${date}`, NAMESPACE),
  });
  return Response.json({ sent: true, date });
}
```

**`lib/onesignal-server.ts`**
```ts
export function buildFilters(tagKey: string, opts: { excludeToday: boolean }) {
  const filters: unknown[] = [
    { field: "tag", key: tagKey, relation: "not_exists" },
    { operator: "OR" },
    { field: "tag", key: tagKey, relation: "!=", value: "off" },
  ];
  if (opts.excludeToday) {
    filters.push({ operator: "AND" }, { field: "tag", key: tagKey, relation: "!=", value: nowCairoParts().date });
  }
  return filters;
}

export async function sendNotification(payload: NotificationPayload) {
  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      idempotency_key: payload.idempotencyKey,
      filters: payload.filters,
      headings: { ar: payload.title },
      contents: { ar: payload.body },
      url: payload.url,
      web_push_topic: payload.topic,
    }),
  });
  if (res.status === 429 || res.status >= 500) {
    // retry once with backoff — never log the API key or Authorization header
  }
  if (!res.ok) throw new Error(`OneSignal ${res.status}`);
  return res.json();
}
```

**`hooks/use-mark-period-seen.ts` (تبسيط)**
```ts
export function useMarkPeriodSeen(period: AzkarPeriod) {
  useEffect(() => {
    if (!isWithinCurrentWindow(period)) return; // نفس منطق النوافذ من lib/notification-schedule
    if (!window.OneSignal) return; // SDK لم يُحمَّل / لا اشتراك
    const tagKey = period === "morning" ? "morning_state" : "evening_state";
    window.OneSignalDeferred.push(async (OneSignal) => {
      const current = await OneSignal.User.getTags();
      const value = current?.[tagKey];
      if (value === "off") return; // احترام التعطيل الصريح
      const today = todayCairoDate();
      if (value === today) return; // مسجّل بالفعل
      OneSignal.User.addTag(tagKey, today);
    });
  }, [period]);
}
```

---

## 21. Security Checklist

- [ ] `ONESIGNAL_REST_API_KEY` موجود فقط في Vercel Environment Variables، غير مُستورَد من أي ملف `"use client"`.
- [ ] كل Route Handler تحت `app/api/cron/*` يتحقق من `Authorization: Bearer ${CRON_SECRET}` قبل أي منطق آخر، ويُعيد 401 عند الفشل.
- [ ] `app/api/notifications/test` لا يقبل استهداف أي `subscription_id` غير الذي أرسله المتصفح نفسه (لا `include_segments`/`filters` عامة).
- [ ] لا `console.log` لأي متغير بيئة أو هيدر `Authorization` في أي مسار كود.
- [ ] `idempotency_key` فريد وحتمي لكل (فتحة × تاريخ) لمنع الإرسال المزدوج عند إعادة محاولة Vercel للطلب.
- [ ] معالجة صريحة لـ429 (تراجع/إعادة محاولة محدودة) و5xx (إعادة محاولة واحدة، ثم فشل صامت مسجَّل في logs وليس للمستخدم).
- [ ] `NEXT_PUBLIC_ONESIGNAL_APP_ID` وحده هو ما يظهر في bundle العميل — تأكيد بعد البناء بفحص `out`/`.next` (لا وجود لـ`ONESIGNAL_REST_API_KEY` أو `CRON_SECRET` في أي ملف JS مُصدَّر للعميل).

---

## 22. Error Handling وObservability

- كل Route Handler يُعيد JSON واضح (`{ sent: boolean, reason?: string }`) يظهر في Vercel Runtime Logs — كافٍ للتشخيص بدون أي نظام مراقبة خارجي إضافي (تجنّب إضافة أداة مراقبة مدفوعة/معقدة لتطبيق مجاني صغير — YAGNI).
- فشل استدعاء OneSignal (شبكة/5xx) لا يُسقط الطلب بصمت: يُسجَّل في logs برسالة تتضمن الفتحة والتاريخ (بدون أي سر).
- تكرار تشغيل نفس الـCron (موثّق رسميًا كسلوك ممكن لدى Vercel) **غير ضار** بفضل `idempotency_key`.
- تأخر الـCron (حتى 59 دقيقة) **غير ضار** بفضل الحارس الزمني (القسم 9/10) الذي يمنع الإرسال خارج نافذة الفترة الفعلية.

---

## 23. Test Plan

- **Unit tests**: `lib/cairo-time.ts` (حدود النوافذ، تحويل التاريخ)، `lib/prayer-times.ts` (قيمة عصر معقولة لعدة تواريخ عبر السنة)، `buildFilters()` (المخرجات لكل تركيبة تاج).
- **Integration tests**: استدعاء كل Route Handler محليًا بـmock لـ`fetch` نحو OneSignal، بتغطية: تاج غائب / `"off"` / تاريخ قديم / تاريخ اليوم، والتحقق من الفلتر المُرسَل ومن تخطي الإرسال خارج النافذة.
- **Browser tests**: تدفق طلب الصلاحية كامل (Chrome desktop + Android)، رفض الصلاحية، تعطيل/تفعيل فترة والتحقق من قيمة التاج عبر OneSignal Dashboard.
- **PWA tests**: تثبيت على Android (Chrome) وiOS (Add to Home Screen) والتحقق من استلام push في وضع standalone؛ تحديث `OneSignalSDKWorker.js` (SKIP_WAITING) ما زال يعمل بعد دمج `importScripts`.
- **OneSignal sandbox/test-device**: إنشاء عدة اشتراكات اختبار بقيم تاج مختلفة يدويًا من لوحة OneSignal، وتشغيل الفلترين يدويًا (Postman/REST) للتحقق الفعلي من **الافتراض غير الموثّق في القسم 11** (تعامل `not_exists` مع `OR`/`AND` المتسلسل) قبل الإطلاق.
- **Mobile/Desktop**: التحقق من ظهور نص عربي RTL صحيح في الإشعار على Android وWindows/macOS Chrome.

---

## 24. خطة تنفيذ مرحلية

1. إزالة `output: "export"`، إضافة `vercel.json` فارغ الجدولة مبدئيًا، التأكد أن كل الصفحات الحالية تُبنى وتعمل كما هي (لا رجعة وظيفية).
2. إضافة `lib/cairo-time.ts` و`lib/prayer-times.ts` واختبارهما بمعزل عن أي شيء آخر.
3. إضافة `lib/onesignal-server.ts` + متغيرات البيئة + Route Handler واحد فقط (`morning-1`) خلف `CRON_SECRET`، اختبار يدوي عبر curl.
4. إضافة `components/providers/onesignal-init.tsx` + تدفق الاشتراك في `/customization/` (بدون تاجات بعد) — التحقق من ظهور الاشتراك في لوحة OneSignal.
5. إضافة منطق التاجات (`use-notification-preference.ts`, `use-mark-period-seen.ts`) وربطه بصفحتي الصباح/المساء.
6. تفعيل باقي الفتحات الأربع + جدول `vercel.json` النهائي.
7. زر الإشعار التجريبي + رسائل الخطأ العربية + تعليمات iOS.
8. مراجعة أمان نهائية (القسم 21) + اختبار end-to-end على Preview Deployment.

---

## 25. Definition of Done

- المستخدم يستطيع تفعيل/تعطيل الإشعارات وكل فترة على حدة من `/customization/`، بلغة عربية، بدون طلب صلاحية تلقائي.
- 4 إشعارات تصل فعليًا خلال يوم اختبار كامل على جهاز حقيقي (Android + iOS مثبّت كـPWA)، بنصوص صحيحة وروابط صحيحة.
- التذكير الثاني **لا يصل** فعليًا لمستخدم اختبار دخل صفحة الفترة قبل موعده.
- لا وجود لـ`ONESIGNAL_REST_API_KEY` أو `CRON_SECRET` في أي ملف مبني (bundle) قابل للفحص من العميل.
- إعادة تشغيل أي Route Handler cron يدويًا مرتين متتاليتين لا تُنتج إشعارًا مضاعفًا.

---

## 26. Rollback Plan

- كل تغيير معماري محصور في: `next.config.ts`، `vercel.json`، مسارات `app/api/*` جديدة بالكامل، وقسم UI جديد بالكامل — لا تعديل هدمي على أي مسار/مكوّن موجود.
- التراجع الفوري: تعطيل الـ4 مهام Cron من Vercel Dashboard (زر Disable، بدون حذف/redeploy) يوقف الإرسال فورًا دون التأثير على باقي التطبيق.
- التراجع الكامل: git revert للـcommit(s) المعنية يعيد `output: "export"` ويُزيل مسارات `api/*` — التطبيق يعود static بالكامل كما كان.

---

## 27. حدود OneSignal وVercel/GitHub المجانية (مصادر رسمية، تحقّق 2026-08-08)

- OneSignal Free: 6 Segments، **2 Data Tags**، Web push حتى 10,000 مشترك لكل إرسال، mobile push غير محدود — [onesignal.com/pricing](https://onesignal.com/pricing)
- OneSignal idempotency_key: UUID، صالح 30 يومًا — [documentation.onesignal.com/reference/idempotent-notification-requests](https://documentation.onesignal.com/reference/idempotent-notification-requests)
- Vercel Cron (Hobby): مرة/يوم لكل مهمة، حتى 100 مهمة/مشروع، انزياح حتى 59 دقيقة داخل الساعة، UTC فقط، `CRON_SECRET` — [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)، [vercel.com/docs/cron-jobs/manage-cron-jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- GitHub Actions cron: تأخير موثّق 5–30 دقيقة (أحيانًا أكثر) — غير معتمَد في هذه الخطة، مذكور للمقارنة فقط.

---

## 28. المخاطر والبدائل المستقبلية

- **حد الـ2 Data Tags**: أي ميزة مستقبلية تحتاج تاجًا ثالثًا (مثل تفضيل توقيت مخصّص لكل مستخدم) تتطلب ترقية خطة OneSignal المدفوعة أو دمج قيم إضافية داخل نفس التاجين الحاليين (تعقيد ترميز متزايد).
- **دقة Vercel Cron**: إن احتاج التطبيق مستقبلًا دقة على مستوى الدقيقة، الترقية لـVercel Pro تُزيل قيد الـ59 دقيقة وتفتح جدولة كل دقيقة.
- **نمو عدد المشتركين فوق 10,000 web push**: يتطلب مراجعة خطة OneSignal (Growth) عند تجاوز الحد.
