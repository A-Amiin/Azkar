import type { Metadata } from "next";
import { EveningAzkarView } from "@/app/evening/components/evening-azkar-view";
import { PageHeading } from "@/components/shared/page-heading";
import { getEveningAzkar } from "@/data/azkar";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "أذكار المساء",
  description: "اقرأ أذكار المساء كاملة مع عداد تكرار تلقائي ومتابعة للتقدم اليومي",
  path: "/evening/",
});

export default function EveningPage() {
  const { title, items } = getEveningAzkar();

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <PageHeading
        title={title}
        description="حافظ على أذكارك اليومية، واضغط على كل ذكر لعدّ التكرار."
      />
      <EveningAzkarView items={items} />
    </section>
  );
}
