"use client";

import { AzkarCard } from "@/components/shared/azkar-card";
import { AzkarProgress } from "@/components/shared/azkar-progress";
import { useEveningProgress } from "@/app/evening/hooks/use-evening-progress";
import type { Dhikr } from "@/types/azkar";

interface EveningAzkarViewProps {
  items: Dhikr[];
}

/** The route's one client boundary: owns the evening progress hook and
 *  threads counter state down into the (purely presentational, shared)
 *  AzkarProgress/AzkarCard components. */
export function EveningAzkarView({ items }: EveningAzkarViewProps) {
  const { getCount, increment, completedCount, totalCount } =
    useEveningProgress(items);

  return (
    <div className="flex flex-col gap-6">
      <AzkarProgress completedCount={completedCount} totalCount={totalCount} />
      <div className="flex flex-col gap-4">
        {items.map((dhikr) => (
          <AzkarCard
            key={dhikr.id}
            dhikr={dhikr}
            counter={{
              current: getCount(dhikr.id),
              onIncrement: () => increment(dhikr.id, dhikr.count),
            }}
          />
        ))}
      </div>
    </div>
  );
}
