import type { Metadata } from "next";
import { FavoritesList } from "@/app/favorites/components/favorites-list";
import { PageHeading } from "@/components/shared/page-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "الأذكار المفضلة",
  description: "أذكارك المحفوظة والمفضلة لديك في مكان واحد لسهولة الرجوع إليها",
  path: "/favorites/",
});

export default function FavoritesPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <PageHeading
        title="الأذكار المفضلة"
        description="الأذكار التي أضفتها إلى المفضلة من صفحتي الصباح والمساء."
      />
      <FavoritesList />
    </section>
  );
}
