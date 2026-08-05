"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AzkarCounterProps {
  current: number;
  target: number;
  onIncrement: () => void;
  /** Accessible label describing which dhikr this counts, e.g. the dhikr's
   *  own text — announced to screen readers, not shown visually (the count
   *  itself is already visible as text). */
  label: string;
}

/** Tap-to-increment repetition counter. The milestone announcement only
 *  fires once, on reaching the target — not on every tap — so screen reader
 *  users aren't interrupted dozens of times for a hundred-repetition dhikr. */
export function AzkarCounter({
  current,
  target,
  onIncrement,
  label,
}: AzkarCounterProps) {
  const isComplete = current >= target;

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant={isComplete ? "secondary" : "default"}
        onClick={onIncrement}
        disabled={isComplete}
        className="min-h-11 min-w-11"
        aria-label={`${label}، العدد ${current} من ${target}${isComplete ? "، اكتمل" : ""}`}
      >
        <span aria-hidden="true" className={cn("tabular-nums", "text-base")}>
          {current} / {target}
        </span>
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {isComplete ? `اكتمل: ${label}` : ""}
      </span>
    </div>
  );
}
