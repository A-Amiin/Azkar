# العمارة التقنية — أذكار الصباح والمساء

هذا الملف يوثّق قرارات العمارة الأساسية للتطبيق، ليبقى السجل مرتبطًا بالكود
نفسه. للخطة التفصيلية الكاملة (بما فيها جدول الألوان الدقيق وأسباب كل قرار)
راجع سجل المحادثة التي أنشأت هذا التطبيق؛ هذا الملف ملخّص عملي يُحدَّث كلما
تغيّر قرار معماري.

## استراتيجية العرض (Rendering)

**Static Export** — `output: "export"` في `next.config.ts`.

لا يحتوي التطبيق على أي بيانات تعتمد على الطلب (لا Server Actions، لا مسارات
ديناميكية، لا كوكيز)؛ كل المحتوى (`data/azkar.json`) يُستورد وقت البناء عبر
`resolveJsonModule`، فتُصبح مكوّنات الخادم (Server Components) HTML ثابتًا
تمامًا بدون أي طلب شبكة وقت التشغيل. React Server Components هي الافتراضي في
كل مكان؛ توجيه `"use client"` يقتصر على الجزر التفاعلية فقط: العدّادات،
التقدّم، المفضّلة، اقتراح التثبيت، مؤشر الاتصال، قائمة الجوال، وتسجيل
الـ Service Worker.

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

## طبقة البيانات

مصدر واحد للحقيقة: `data/azkar.json` + `data/azkar.ts` (دوال
`getMorningAzkar` / `getEveningAzkar` / `getAzkarByPeriod` / `getDhikrById`).
تم حذف `public/azkar.json` القديم لتفادي ازدواجية المصدر.

## طبقة التخزين المحلي (localStorage)

`lib/storage.ts` يوفر مخططًا مُرقّمًا بالإصدار (`{ version: 1, ... }») لكل
مفتاح (`azkar:favorites`, `azkar:progress:morning`, `azkar:progress:evening`,
`azkar:ui-state`)، مع نشر/اشتراك (pub-sub) داخلي لمزامنة اللحظية بين
المكوّنات في نفس التبويب (حدث `storage` المتصفحي لا يُطلَق في التبويب الذي
أجرى التغيير). تقدّم كل فترة (صباح/مساء) يُخزَّن ليوم واحد فقط
(`{ date, counts }`) ويُعاد تصفيره تلقائيًا عند تغيّر التاريخ المحلي — بلا
حاجة لمنطق تقليم (pruning) لأن لا ميزة سجل عبر الأيام موجودة بعد.

`hooks/use-local-storage.ts` مبني على `useSyncExternalStore` بحيث تكون
اللقطة من جهة الخادم (`getServerSnapshot`) القيمة الافتراضية دائمًا — يمنع
هذا عدم تطابق الترطيب (hydration mismatch) بنيويًا دون الحاجة لعلم "mounted"
يدوي.

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
                morning/ · evening/ · favorites/
components/     layout/ (header · footer · mobile-nav · splash ·
                sw-registration) · shared/ (azkar-card · azkar-counter ·
                azkar-progress · page-heading · empty-state ·
                install-pwa-prompt · offline-indicator · brand-mark) · ui/
hooks/          use-local-storage · use-online-status · use-pwa-install ·
                use-favorites · use-azkar-progress
lib/            utils · constants · metadata · storage
data/           azkar.json · azkar.ts
types/          azkar.ts
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
