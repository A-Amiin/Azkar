# العمارة التقنية — أذكار الصباح والمساء

هذا الملف يوثّق قرارات العمارة الأساسية للتطبيق، ليبقى السجل مرتبطًا بالكود
نفسه. للخطة التفصيلية الكاملة (بما فيها جدول الألوان الدقيق وأسباب كل قرار)
راجع سجل المحادثة التي أنشأت هذا التطبيق؛ هذا الملف ملخّص عملي يُحدَّث كلما
تغيّر قرار معماري.

## استراتيجية العرض (Rendering)

**Hybrid** — كان `output: "export"` (static export بحت) حتى إضافة نظام
إشعارات OneSignal؛ أُزيل لأن إرسال push بأمان يحتاج خادمًا يحمل
`ONESIGNAL_REST_API_KEY` ويعمل وفق جدول (Vercel Cron + Route Handlers) —
انظر `NOTIFICATIONS_PLAN.md` للقرار الكامل والبدائل التي قُورنت به.

كل صفحات المحتوى (`/`, `/morning`, `/evening`, `/favorites`, `/customization`,
`/offline`) لا تزال **ثابتة تمامًا** كما كانت — إزالة `output: "export"` لا
تفرض ديناميكية على أي مسار لا يستخدمها فعليًا؛ فقط المسارات الجديدة تحت
`app/api/*` ديناميكية (`ƒ` في مخرجات `next build`) لأنها تقرأ
`request.headers`. لا يحتوي التطبيق على أي بيانات تعتمد على الطلب في صفحاته
(لا Server Actions، لا كوكيز)؛ كل المحتوى (`data/azkar.json`) يُستورد وقت
البناء عبر `resolveJsonModule`. React Server Components هي الافتراضي في كل
مكان؛ توجيه `"use client"` يقتصر على الجزر التفاعلية فقط: العدّادات،
التقدّم، المفضّلة، اقتراح التثبيت، مؤشر الاتصال، قائمة الجوال، تسجيل
الـ Service Worker، وتهيئة OneSignal SDK.

## استراتيجية العمل بدون إنترنت (PWA / Offline)

**Service Worker مكتوب يدويًا** في `public/sw.js` — بدون Serwist أو
next-pwa أو Workbox. توثيق Next.js 16 المرفق (`progressive-web-apps.md`)
يذكر Serwist كـ"خيار واحد" فقط وليس إلزاميًا، وإضافة إضافة بناء (build
plugin) فوق تقنية حديثة أصلًا (Next 16.3 + Turbopack + Tailwind v4 +
base-ui) مخاطرة غير ضرورية لحاجة تخزين مؤقت بسيطة نسبيًا.

- **install**: تخزين مسبق (precache) لِـ `/`, `/morning/`, `/evening/`,
  `/favorites/`, `/offline/`, `/manifest.webmanifest` فقط. لا يُستدعى
  `skipWaiting()` — يبقى العامل الجديد في حالة `waiting` حتى يوافق المستخدم
  على التحديث عبر إشعار (Sonner toast).
- **fetch**: طلبات التصفّح (navigation) → الشبكة أولًا ثم التخزين المؤقت
  كبديل ثم `/offline/` كحل أخير. الأصول الثابتة (`/_next/static/*`، الخطوط)
  → التخزين المؤقت أولًا مع تعبئة وقت التشغيل (لا حاجة لقائمة أسماء ملفات
  مُجزّأة (hashed) يدوية).
- **activate**: حذف أي تخزين مؤقت لا يطابق إصدار `CACHE_VERSION` الحالي.
- محتوى الأذكار نفسه لا يحتاج تخزينًا مؤقتًا مخصصًا لأنه مُضمَّن أصلًا داخل
  HTML/JS وقت البناء.
- سكربت OneSignal Web SDK (`importScripts("https://cdn.onesignal.com/.../
  OneSignalSDK.sw.js")`) مُدمَج في نفس الملف بدل تسجيل service worker ثانٍ
  (نطاق واحد لا يسمح إلا بعامل نشط واحد) — يعمل جنبًا إلى جنب مع منطق
  التخزين المؤقت أعلاه، لا يستبدله.

## الإشعارات (OneSignal)

نظام تذكيرات push (صباح×2، مساء×2) بدون قاعدة بيانات — القرار الكامل، مقارنة
البدائل، وتصميم OneSignal Tags موثّق بالتفصيل في `NOTIFICATIONS_PLAN.md`
(يُقرأ قبل تعديل أي شيء متعلق بالإشعارات). ملخّص:

- **الجدولة**: 4 مهام Vercel Cron (`vercel.json`) تستدعي Route Handlers تحت
  `app/api/cron/*`، كل واحدة محمية بـ`CRON_SECRET`. الإرسال يحدث فورًا وقت
  الاستدعاء (لا جدولة داخل OneSignal نفسه)، بعد حارس زمني بـ`Intl`
  (`lib/cairo-time.ts`) يمنع الإرسال خارج نافذة الفترة الفعلية بصرف النظر عن
  دقة توقيت Cron.
- **موعد العصر**: يُحسب يوميًا محليًا عبر مكتبة `adhan` (`lib/prayer-
  times.ts`) — بدون API خارجي وبدون حساب DST يدوي.
- **منع التذكير الثاني**: تاج OneSignal واحد لكل فترة (`morning_state` /
  `evening_state`، `lib/notification-schedule.ts`) يحمل إما `"off"` أو تاريخ
  آخر مشاهدة — ترميز مضغوط بسبب حد الـ2 Data Tags في خطة OneSignal المجانية.
- **الأمان**: `ONESIGNAL_REST_API_KEY` سرّي server-only
  (`lib/onesignal-server.ts`, موسوم بـ`import "server-only"`)؛
  `NEXT_PUBLIC_ONESIGNAL_APP_ID` عام. لا Database — الحالة الوحيدة (تفعيل/
  تعطيل + "شوهد اليوم") محفوظة في تاجات OneSignal نفسها.

## طبقة البيانات

مصدر واحد للحقيقة: `data/azkar.json` + `data/azkar.ts` (دوال
`getMorningAzkar` / `getEveningAzkar` / `getAzkarByPeriod` / `getDhikrById`).
تم حذف `public/azkar.json` القديم لتفادي ازدواجية المصدر.

## طبقة التخزين المحلي (localStorage)

`lib/storage.ts` يوفر مخططًا مُرقّمًا بالإصدار (`{ version: 1, ... }») لكل
مفتاح (`azkar:favorites`, `azkar:progress:morning`, `azkar:progress:evening`,
`azkar:ui-state`, `azkar:notification-preference`)، مع نشر/اشتراك (pub-sub) داخلي لمزامنة اللحظية بين
المكوّنات في نفس التبويب (حدث `storage` المتصفحي لا يُطلَق في التبويب الذي
أجرى التغيير). تقدّم كل فترة (صباح/مساء) يُخزَّن ليوم واحد فقط
(`{ date, counts }`) ويُعاد تصفيره تلقائيًا عند تغيّر التاريخ المحلي — بلا
حاجة لمنطق تقليم (pruning) لأن لا ميزة سجل عبر الأيام موجودة بعد.

`hooks/use-local-storage.ts` مبني على `useSyncExternalStore` بحيث تكون
اللقطة من جهة الخادم (`getServerSnapshot`) القيمة الافتراضية دائمًا — يمنع
هذا عدم تطابق الترطيب (hydration mismatch) بنيويًا دون الحاجة لعلم "mounted"
يدوي.

استثناء واحد على مبدأ "localStorage هو مصدر الحقيقة": `azkar:notification-
preference` **مرآة فقط** — التاجات الفعلية على OneSignal هي ما يقرأه Route
Handlers الجدولة فعليًا؛ هذا المفتاح موجود لعرض حالة المفاتيح فورًا في
الواجهة بلا انتظار `getTags()` غير المتزامن (انظر `hooks/use-notification-
preference.ts`).

## نظام الألوان (Fresh Greens)

الألوان الأساسية التسعة (`--frosted-mint` … `--evergreen`) ثابتة كما هي.
تم فقط إعادة ربط الرموز الدلالية لـ shadcn (`--primary`, `--background`,
`--card`, `--border`, `--ring`, وإضافة `--destructive-foreground` المفقود)
بهذه الألوان مع التحقق من تباين WCAG AA لكل زوج نص/خلفية رئيسي. يبقى
`--destructive` أحمر حقيقيًا (لا أخضر لحالات الخطأ). الوضع الداكن مفعّل
تلقائيًا حسب تفضيل النظام (`prefers-color-scheme`) دون مفتاح تبديل يدوي في
هذه النسخة.

الخط: **Tajawal** (عبر `next/font/google`, `subsets: ["arabic"]`), يحل محل
Inter الذي لا يدعم العربية أصلًا.

## الأيقونات

مولّدة بالكامل عبر `ImageResponse` (`app/icon.tsx` بأحجام 32/192/512/512
قابل للقناع، و`app/apple-icon.tsx`، و`app/opengraph-image.tsx`) — بدون أي
ملفات تصميم خارجية. الشعار هلال هندسي بسيط (تدرّج Evergreen→Mint Leaf)، بلا
حروف عربية داخل الأيقونات المولّدة لأن تشكيل الحروف العربية عبر Satori غير
موثوق بالأحجام الصغيرة.

## شجرة المجلدات النهائية (مختصرة)

```
app/            layout.tsx · page.tsx · loading.tsx · not-found.tsx ·
                manifest.ts · robots.ts · sitemap.ts · icon.tsx ·
                apple-icon.tsx · opengraph-image.tsx · offline/ ·
                morning/ · evening/ · favorites/ · customization/ ·
                api/cron/{morning-1,morning-2,evening-1,evening-2}/ ·
                api/notifications/test/
components/     layout/ (header · footer · mobile-nav · splash ·
                sw-registration) · shared/ (azkar-card · azkar-counter ·
                azkar-progress · page-heading · empty-state ·
                install-pwa-prompt · offline-indicator · brand-mark) ·
                providers/ (onesignal-init) · ui/
hooks/          use-local-storage · use-online-status · use-pwa-install ·
                use-favorites · use-azkar-progress ·
                use-notification-permission · use-notification-preference ·
                use-mark-period-seen · use-send-test-notification
lib/            utils · constants · metadata · storage ·
                cairo-time · prayer-times · notification-schedule ·
                notification-copy · onesignal-client (client) ·
                onesignal-server · cron-handler (server-only)
data/           azkar.json · azkar.ts
types/          azkar.ts · onesignal.d.ts
public/         sw.js
```

مجلدات لم تُنشأ عمدًا (لتفادي مجلدات فارغة): `app/favorites/hooks/`
(صفحة المفضلة تستخدم `hooks/use-favorites.ts` المشترك مباشرة، ولا تحتاج
خطّاف تقدّم خاصًا بها)، `public/icons/`، `public/screenshots/`.

ملاحظة تصحيح: تحتوي `app/morning/components/` و`app/evening/components/`
على مكوّن عرض واحد لكل مسار (`morning-azkar-view.tsx` / 
`evening-azkar-view.tsx`) — وهذا مقصود: مكوّنات `AzkarCard`/`AzkarProgress`
المشتركة أصبحت عرضية بحتة (تستقبل حالة العدّاد كخاصية prop)، وخطّاف التقدّم
الخاص بكل فترة (`use-morning-progress` / `use-evening-progress`) يحتاج
حدًّا عميلًا (client boundary) يستدعيه فعليًا — وإلا كان سيبقى كودًا ميتًا.

## نتائج التحقق (تم تنفيذها فعليًا، وليست تقديرًا)

- `npx eslint .` و`npx tsc --noEmit`: بلا أخطاء ولا تحذيرات.
- `npm run build` (Turbopack، `output: "export"`): نجاح كامل، 16 مسارًا
  ثابتًا بما فيها الأيقونات المولَّدة و`robots.txt`/`sitemap.xml`.
- فُحص مجلد `out/` الفعلي: كل صفحة HTML بها `<h1>` واحد بالضبط، النص
  العربي للأذكار موجود داخل HTML المُولَّد من الخادم (وليس معتمدًا على
  JavaScript جانب العميل)، `<html lang="ar" dir="rtl">` صحيح، `sw.js`
  موجود في جذر الإخراج، `manifest.webmanifest` صالح (تحقّق منه عبر `cat`
  فعليًا)، وسمة `rel="canonical"` تطابق الرابط الفعلي بعد إصلاح مشكلة
  الشرطة المائلة الزائدة.
- تشغيل حقيقي عبر `npx serve out` (وليس `next start`، غير المتوافق مع
  `output: "export"`) مع فحوصات `curl` لكل مسار رئيسي: جميعها 200 بأنواع
  محتوى صحيحة.
- **Lighthouse حقيقي** (عبر Chrome المثبَّت محليًا، ليس تقديرًا) على
  `/morning/`: **الأداء 99، إمكانية الوصول 100، أفضل الممارسات 100،
  تحسين محركات البحث 100**. فئة "PWA" المخصصة أُزيلت من Lighthouse
  الحديث؛ صلاحية التثبيت (manifest + service worker + الأيقونات) تم
  التحقق منها يدويًا كما سبق بدلًا من ذلك.
- `node --check public/sw.js`: صياغة JavaScript صحيحة (لا يمكن تشغيل
  Service Worker فعليًا خارج متصفح حقيقي في هذه البيئة — الاختبار الحي
  الكامل لسيناريو عدم الاتصال وتدفّق تحديث النسخة يحتاج تنفيذًا يدويًا
  عبر DevTools قبل الإطلاق).
- لا يوجد `console.log`، ولا `any` صريح، ولا محتوى Next.js الافتراضي
  المتبقي، ولا علامات `TODO`/`FIXME` في الكود المصدري.

**تحديث بعد إضافة الإشعارات**: النتائج أعلاه (بما فيها `out/` وLighthouse)
تعود لمرحلة الـstatic export البحت قبل إزالته؛ لم تُعَد بعد على النسخة
الهجينة (لا يوجد `out/` بعد الآن). ما تحقّق فعليًا بعد كل تغيير في هذه
المرحلة: `npx tsc --noEmit` و`npx eslint .` بلا أخطاء بعد كل كوميت،
`npm run build` ناجح مع تقسيم صحيح بين المسارات الثابتة (`○`) والديناميكية
(`ƒ`، تحديدًا الخمسة الجديدة تحت `app/api/*` فقط)، واختبار يدوي حي عبر
`next dev` لكل الخمسة Route Handlers (CRON_SECRET/رفض بلا مصادقة، بناء
الفلاتر، حساب العصر عبر `adhan` وقت التشغيل الفعلي). لم يُختبَر بعد على
جهاز حقيقي مع حساب OneSignal فعلي — ينتظر إنشاء التطبيق على OneSignal
وقيم `NEXT_PUBLIC_ONESIGNAL_APP_ID`/`ONESIGNAL_REST_API_KEY` الحقيقية،
حسب خطة الاختبار في `NOTIFICATIONS_PLAN.md` القسم 23.
