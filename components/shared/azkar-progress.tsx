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
  const progressPercentage =
    totalCount > 0
      ? Math.min(100, (fractionalCompletedCount / totalCount) * 100)
      : 0;
  const formattedPercentage = progressPercentage.toFixed(1);

  return (
    <Progress
      value={progressPercentage}
      max={100}
      getAriaValueText={() =>
        `${formattedPercentage} بالمئة، أُكمل ${completedCount} من ${totalCount} ذكر`
      }
      className="flex-col items-stretch gap-2"
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">التقدّم اليوم</span>
          <bdi dir="ltr" className="font-medium tabular-nums text-foreground">
            %{formattedPercentage}
          </bdi>
        </div>
        <span dir="ltr" className="tabular-nums text-muted-foreground">
          {completedCount} / {totalCount} ذكر
        </span>
      </div>
    </Progress>
  );
}
