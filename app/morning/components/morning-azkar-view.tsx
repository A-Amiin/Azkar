"use client";

import { AzkarProgress } from "@/components/shared/azkar-progress";
import { AzkarSequence } from "@/components/shared/azkar-sequence";
import { useMorningProgress } from "@/app/morning/hooks/use-morning-progress";
import type { Dhikr } from "@/types/azkar";

interface MorningAzkarViewProps {
  items: Dhikr[];
}

/** The route's one client boundary: owns the morning progress hook and
 *  threads counter state down into the (purely presentational, shared)
 *  AzkarProgress/AzkarCard components. */
export function MorningAzkarView({ items }: MorningAzkarViewProps) {
  const {
    getCount,
    increment,
    complete,
    reset,
    completedCount,
    fractionalCompletedCount,
    totalCount,
  } =
    useMorningProgress(items);

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
        completedCount={completedCount}
        totalCount={totalCount}
      />
    </div>
  );
}
