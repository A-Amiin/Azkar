import type { Metadata } from "next";
import { AutoAdvanceToggle } from "@/app/customization/components/auto-advance-toggle";
import { CounterStylePicker } from "@/app/customization/components/counter-style-picker";
import { FontSizePicker } from "@/app/customization/components/font-size-picker";
import { NotificationSettings } from "@/app/customization/components/notification-settings";
import { ThemePicker } from "@/app/customization/components/theme-picker";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "التخصيص",
  description: "تخصيص شكل عداد أذكار الصباح والمساء.",
};

export default function CustomizationPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">التخصيص</h1>
        <p className="text-muted-foreground">
          اختر شكل عداد التكرار الأنسب لك. يُحفظ اختيارك تلقائيًا على هذا الجهاز.
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="font-size-heading">
        <div className="space-y-1">
          <h2 id="font-size-heading" className="font-heading text-xl font-bold">
            حجم الخط
          </h2>
          <p className="text-sm text-muted-foreground">
            يتغير حجم جميع النصوص والعناوين نسبيًا مع الحفاظ على التدرج بينها.
          </p>
        </div>
        <FontSizePicker />
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="theme-heading">
        <div className="space-y-1">
          <h2 id="theme-heading" className="font-heading text-xl font-bold">
            المظهر
          </h2>
          <p className="text-sm text-muted-foreground">
            اختر المظهر الفاتح أو الداكن باستخدام ألوان Fresh Greens.
          </p>
        </div>
        <ThemePicker />
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="auto-advance-heading">
        <div className="space-y-1">
          <h2 id="auto-advance-heading" className="font-heading text-xl font-bold">
            الانتقال التلقائي
          </h2>
          <p className="text-sm text-muted-foreground">
            انتقل إلى الذكر التالي تلقائيًا بعد إكمال العدد المطلوب.
          </p>
        </div>
        <AutoAdvanceToggle />
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="counter-style-heading">
        <div className="space-y-1">
          <h2 id="counter-style-heading" className="font-heading text-xl font-bold">
            شكل العداد
          </h2>
          <p className="text-sm text-muted-foreground">
            اختر طريقة عرض عداد التكرار داخل كروت الأذكار.
          </p>
        </div>
        <CounterStylePicker />
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="notifications-heading">
        <div className="space-y-1">
          <h2 id="notifications-heading" className="font-heading text-xl font-bold">
            الإشعارات
          </h2>
          <p className="text-sm text-muted-foreground">
            فعّل تذكيرات أذكار الصباح والمساء على هذا الجهاز. لن يُطلب إذن
            الإشعارات إلا بعد ضغطك على زر التفعيل.
          </p>
        </div>
        <NotificationSettings />
      </section>
    </section>
  );
}
