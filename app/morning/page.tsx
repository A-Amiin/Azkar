import type { Metadata } from "next";
import { MorningAzkarView } from "@/app/morning/components/morning-azkar-view";
import { PageHeading } from "@/components/shared/page-heading";
import { getMorningAzkar } from "@/data/azkar";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "أذكار الصباح",
  description: "اقرأ أذكار الصباح كاملة مع عداد تكرار تلقائي ومتابعة للتقدم اليومي",
  path: "/morning",
});

export default function MorningPage() {
  const { title, items } = getMorningAzkar();

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <PageHeading
        title={title}
        description="حافظ على أذكارك اليومية، واضغط على كل ذكر لعدّ التكرار."
      />
      <MorningAzkarView items={items} />
    </section>
  );
}
