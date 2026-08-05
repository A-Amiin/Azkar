"use client";

import { AzkarCard } from "@/components/shared/azkar-card";
import { AzkarProgress } from "@/components/shared/azkar-progress";
import { useMorningProgress } from "@/app/morning/hooks/use-morning-progress";
import type { Dhikr } from "@/types/azkar";

interface MorningAzkarViewProps {
  items: Dhikr[];
}

/** The route's one client boundary: owns the morning progress hook and
 *  threads counter state down into the (purely presentational, shared)
 *  AzkarProgress/AzkarCard components. */
export function MorningAzkarView({ items }: MorningAzkarViewProps) {
  const { getCount, increment, reset, completedCount, totalCount } =
    useMorningProgress(items);

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
              onReset: () => reset(dhikr.id),
            }}
          />
        ))}
      </div>
    </div>
  );
}
