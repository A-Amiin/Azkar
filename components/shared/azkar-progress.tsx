"use client";

import { useAzkarProgress } from "@/hooks/use-azkar-progress";
import { Progress } from "@/components/ui/progress";
import type { AzkarPeriod, Dhikr } from "@/types/azkar";

interface AzkarProgressProps {
  period: AzkarPeriod;
  items: Pick<Dhikr, "id" | "count">[];
}

/** Reads the same per-day, per-period storage key as every AzkarCounter on
 *  the page, so it live-updates in sync as the user taps through the list.
 *  `Progress` (components/ui/progress.tsx) renders its own track/indicator
 *  after its children, so only the label row is passed as children here. */
export function AzkarProgress({ period, items }: AzkarProgressProps) {
  const { completedCount, totalCount } = useAzkarProgress(period, items);

  return (
    <Progress
      value={completedCount}
      max={Math.max(totalCount, 1)}
      getAriaValueText={() => `${completedCount} من ${totalCount}`}
      className="flex-col items-stretch gap-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">التقدّم اليوم</span>
        <span className="tabular-nums text-muted-foreground">
          {completedCount} / {totalCount}
        </span>
      </div>
    </Progress>
  );
}
