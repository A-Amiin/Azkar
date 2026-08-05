"use client";

import { HeartOff } from "lucide-react";
import { AzkarCard } from "@/components/shared/azkar-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getDhikrById } from "@/data/azkar";
import { useFavorites } from "@/hooks/use-favorites";

/** Client boundary for /favorites: the set of favorited ids only exists in
 *  localStorage, so which dhikr to render can't be known at build/server
 *  time — this reads the ids and resolves each back to its full content via
 *  `getDhikrById` (the same typed data module every other route uses). */
export function FavoritesList() {
  const { ids } = useFavorites();

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={HeartOff}
        title="لا توجد أذكار مفضّلة بعد"
        description="أضف أذكارًا إلى المفضلة من صفحتي الصباح والمساء لتظهر هنا."
        actionHref="/morning"
        actionLabel="تصفّح أذكار الصباح"
      />
    );
  }

  const favoriteDhikr = ids
    .map((id) => getDhikrById(id))
    .filter((dhikr) => dhikr !== undefined);

  return (
    <div className="flex flex-col gap-4">
      {favoriteDhikr.map((dhikr) => (
        <AzkarCard key={dhikr.id} dhikr={dhikr} />
      ))}
    </div>
  );
}
