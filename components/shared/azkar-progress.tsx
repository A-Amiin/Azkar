"use client";

import { Progress } from "@/components/ui/progress";

interface AzkarProgressProps {
  completedCount: number;
  fractionalCompletedCount: number;
  totalCount: number;
}

/** Purely presentational — the period's progress hook (owned by the route,
 *  e.g. `app/morning/hooks/use-morning-progress.ts`) computes these counts
 *  so this component stays reusable without knowing which period it's in.
 *  `Progress` (components/ui/progress.tsx) renders its own track/indicator
 *  after its children, so only the label row is passed as children here. */
export function AzkarProgress({
  completedCount,
  fractionalCompletedCount,
  totalCount,
}: AzkarProgressProps) {
  return (
    <Progress
      value={fractionalCompletedCount}
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
