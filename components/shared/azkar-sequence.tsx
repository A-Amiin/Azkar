"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AzkarCard } from "@/components/shared/azkar-card";
import { Button } from "@/components/ui/button";
import type { Dhikr } from "@/types/azkar";

interface AzkarSequenceProps {
  items: Dhikr[];
  getCount: (id: string) => number;
  increment: (id: string, target: number) => void;
  reset: (id: string) => void;
}

/** One-dhikr-at-a-time reading flow. Navigation stays independent from
 * repetition progress so users can freely browse without completing counts. */
export function AzkarSequence({
  items,
  getCount,
  increment,
  reset,
}: AzkarSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (items.length === 0) return null;

  const currentDhikr = items[currentIndex];
  const currentCount = getCount(currentDhikr.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  const goNext = () => {
    if (isLast) return;
    setCurrentIndex((index) => Math.min(index + 1, items.length - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  return (
    <div className="flex flex-col gap-4">
      <AzkarCard
        key={currentDhikr.id}
        dhikr={currentDhikr}
        counter={{
          current: currentCount,
          onIncrement: () => increment(currentDhikr.id, currentDhikr.count),
          onReset: () => reset(currentDhikr.id),
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goPrevious}
          disabled={isFirst}
          className="min-w-28"
        >
          <ArrowRight aria-hidden="true" />
          السابق
        </Button>

        <Button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="min-w-28"
        >
          التالي
          <ArrowLeft aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
