import type { Metadata } from "next";
import { CounterStylePicker } from "@/app/customization/components/counter-style-picker";
import { FontSizePicker } from "@/app/customization/components/font-size-picker";
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
    </section>
  );
}
