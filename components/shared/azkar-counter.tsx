"use client";

import { Check, CheckCheck, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CounterStyle } from "@/lib/storage";
import { useFontPreference } from "@/hooks/use-font-preference";

interface AzkarCounterProps {
  current: number;
  target: number;
  onIncrement: () => void;
  onFill: () => void;
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
  onFill,
  onReset,
  style = "compact",
  label,
}: AzkarCounterProps) {
  const isComplete = current >= target;
  const { size: fontSize } = useFontPreference();
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const milestoneAnnouncement = (
    <span role="status" aria-live="polite" className="sr-only">
      {isComplete ? `اكتمل: ${label}` : ""}
    </span>
  );

  const fillButton = target > 1 ? (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onFill}
            disabled={isComplete}
            aria-label="إكمال العدد دفعة واحدة"
          />
        }
      >
        <CheckCheck aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>إكمال العدد دفعة واحدة</TooltipContent>
    </Tooltip>
  ) : null;

  if (style === "balanced") {
    return (
      <div className="flex w-full items-center justify-center gap-3">
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

        {fillButton}

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
      <div
        className={cn(
          "flex items-center gap-1.5",
          fontSize === "large" ? "flex-row" : "flex-col"
        )}
      >
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
              <span className="text-xl font-bold tabular-nums text-foreground">
                {current}
              </span>
            )}
          </span>
        </button>

        <span
          className="text-base font-semibold tabular-nums text-foreground"
          aria-hidden="true"
        >
          من {target}
        </span>
      </div>

      {fillButton}

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

      {milestoneAnnouncement}
    </div>
  );
}
