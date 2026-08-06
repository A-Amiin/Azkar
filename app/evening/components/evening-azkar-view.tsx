"use client";

import { AzkarProgress } from "@/components/shared/azkar-progress";
import { AzkarSequence } from "@/components/shared/azkar-sequence";
import { useEveningProgress } from "@/app/evening/hooks/use-evening-progress";
import type { Dhikr } from "@/types/azkar";

interface EveningAzkarViewProps {
  items: Dhikr[];
}

/** The route's one client boundary: owns the evening progress hook and
 *  threads counter state down into the (purely presentational, shared)
 *  AzkarProgress/AzkarCard components. */
export function EveningAzkarView({ items }: EveningAzkarViewProps) {
  const {
    getCount,
    increment,
    complete,
    reset,
    resetAll,
    completedCount,
    fractionalCompletedCount,
    totalCount,
  } =
    useEveningProgress(items);

  return (
    <div className="flex flex-col gap-6">
      <AzkarProgress
        completedCount={completedCount}
        fractionalCompletedCount={fractionalCompletedCount}
        totalCount={totalCount}
      />
      <AzkarSequence
        items={items}
        getCount={getCount}
        increment={increment}
        complete={complete}
        reset={reset}
        resetAll={resetAll}
        completedCount={completedCount}
        totalCount={totalCount}
        periodLabel="المسائية"
      />
    </div>
  );
}
