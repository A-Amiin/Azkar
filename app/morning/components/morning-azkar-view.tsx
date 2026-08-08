"use client";

import { AzkarProgress } from "@/components/shared/azkar-progress";
import { AzkarSequence } from "@/components/shared/azkar-sequence";
import { useMorningProgress } from "@/app/morning/hooks/use-morning-progress";
import { useMarkPeriodSeen } from "@/hooks/use-mark-period-seen";
import type { Dhikr } from "@/types/azkar";

interface MorningAzkarViewProps {
  items: Dhikr[];
}

/** The route's one client boundary: owns the morning progress hook and
 *  threads counter state down into the (purely presentational, shared)
 *  AzkarProgress/AzkarCard components. Also marks the morning period
 *  "seen" for notification purposes (cancels the second reminder) —
 *  see hooks/use-mark-period-seen.ts. */
export function MorningAzkarView({ items }: MorningAzkarViewProps) {
  useMarkPeriodSeen("morning");

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
        resetAll={resetAll}
        completedCount={completedCount}
        totalCount={totalCount}
        periodLabel="الصباحية"
      />
    </div>
  );
}
