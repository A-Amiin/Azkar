"use client";

import { Check, Plus, RotateCcw } from "lucide-react";
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
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const milestoneAnnouncement = (
    <span role="status" aria-live="polite" className="sr-only">
      {isComplete ? `اكتمل: ${label}` : ""}
    </span>
  );

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

        {milestoneAnnouncement}
      </div>
    );
  }

  // "compact" — a tappable circular progress ring: the fill grows with
  // every tap, so progress is visible at a glance instead of only as text,
  // and a checkmark badge replaces the number once complete. Centered as a
  // group with its reset button, sized well above the 44px touch-target
  // minimum for comfortable one-handed use.
  return (
    <div className="flex w-full items-center justify-center gap-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onReset}
        disabled={current === 0}
        aria-label={`إعادة عداد ${label} إلى صفر`}
      >
        <RotateCcw aria-hidden="true" />
      </Button>

      <button
        type="button"
        onClick={onIncrement}
        disabled={isComplete}
        aria-label={`${label}، العدد ${current} من ${target}${isComplete ? "، اكتمل" : ""}`}
        className={cn(
          "relative flex size-16 shrink-0 items-center justify-center rounded-full",
          "transition-transform duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-default"
        )}
        style={{
          background: `conic-gradient(var(--primary) ${percentage}%, var(--secondary) ${percentage}% 100%)`,
        }}
      >
        <span className="absolute inset-[3px] flex items-center justify-center rounded-full bg-card">
          {isComplete ? (
            <Check aria-hidden="true" className="size-6 text-primary" />
          ) : (
            <span className="flex flex-col items-center leading-none">
              <span className="text-lg font-bold tabular-nums text-foreground">{current}</span>
              <span className="text-[10px] text-muted-foreground">من {target}</span>
            </span>
          )}
        </span>
      </button>

      {milestoneAnnouncement}
    </div>
  );
}
