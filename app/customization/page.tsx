import type { Metadata } from "next";
import { CounterStylePicker } from "@/app/customization/components/counter-style-picker";

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

      <CounterStylePicker />
    </section>
  );
}
