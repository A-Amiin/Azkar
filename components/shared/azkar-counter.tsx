"use client";

import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CounterStyle } from "@/lib/storage";

interface AzkarCounterProps {
  current: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
  style?: CounterStyle;
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
  onReset,
  style = "compact",
  label,
}: AzkarCounterProps) {
  const isComplete = current >= target;

  if (style === "balanced") {
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={current === 0}
          aria-label={`إعادة عداد ${label} إلى صفر`}
        >
          <RotateCcw aria-hidden="true" />
        </Button>

        <output
          className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-md bg-secondary px-4 text-base font-medium tabular-nums text-secondary-foreground"
          aria-label={`العدد ${current} من ${target}`}
        >
          {current} / {target}
        </output>

        <Button
          type="button"
          size="icon"
          onClick={onIncrement}
          disabled={isComplete}
          aria-label={`زيادة عداد ${label}`}
        >
          <Plus aria-hidden="true" />
        </Button>

        <span role="status" aria-live="polite" className="sr-only">
          {isComplete ? `اكتمل: ${label}` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
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
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onReset}
        disabled={current === 0}
        aria-label={`إعادة عداد ${label} إلى صفر`}
      >
        <RotateCcw aria-hidden="true" />
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {isComplete ? `اكتمل: ${label}` : ""}
      </span>
    </div>
  );
}
