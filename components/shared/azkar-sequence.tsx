"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, House, Info, PartyPopper } from "lucide-react";
import { AzkarCard } from "@/components/shared/azkar-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAutoAdvancePreference } from "@/hooks/use-auto-advance-preference";
import type { Dhikr } from "@/types/azkar";

interface AzkarSequenceProps {
  items: Dhikr[];
  getCount: (id: string) => number;
  increment: (id: string, target: number) => void;
  complete: (id: string, target: number) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  completedCount: number;
  totalCount: number;
  periodLabel: "الصباحية" | "المسائية";
}

/** One-dhikr-at-a-time reading flow. Navigation stays independent from
 * repetition progress so users can freely browse without completing counts. */
export function AzkarSequence({
  ...props
}: AzkarSequenceProps) {
  if (props.items.length === 0) return null;
  return <AzkarSequenceContent {...props} />;
}

function AzkarSequenceContent({
  items,
  getCount,
  increment,
  complete,
  reset,
  resetAll,
  completedCount,
  totalCount,
  periodLabel,
}: AzkarSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [completionOpen, setCompletionOpen] = useState(false);
  const completionRef = useRef<{ id: string; complete: boolean } | null>(null);
  const sequenceComplete = totalCount > 0 && completedCount >= totalCount;
  const sequenceCompletionRef = useRef(sequenceComplete);
  const { enabled: autoAdvanceEnabled } = useAutoAdvancePreference();
  const router = useRouter();

  const currentDhikr = items[currentIndex];
  const currentCount = getCount(currentDhikr.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;
  const currentIsComplete = currentCount >= currentDhikr.count;
  const remainingCount = totalCount - completedCount;
  const firstIncompleteIndex = items.findIndex(
    (item) => getCount(item.id) < item.count
  );

  useEffect(() => {
    const previous = completionRef.current;
    completionRef.current = {
      id: currentDhikr.id,
      complete: currentIsComplete,
    };

    const justCompleted =
      previous?.id === currentDhikr.id &&
      !previous.complete &&
      currentIsComplete;

    if (!justCompleted || !autoAdvanceEnabled || isLast) return;

    const timeoutId = window.setTimeout(() => {
      setAnnouncement("تم الانتقال إلى الذكر التالي");
      setCurrentIndex((index) => Math.min(index + 1, items.length - 1));
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [autoAdvanceEnabled, currentDhikr.id, currentIsComplete, isLast, items.length]);

  useEffect(() => {
    const wasComplete = sequenceCompletionRef.current;
    sequenceCompletionRef.current = sequenceComplete;

    if (!wasComplete && sequenceComplete) {
      setCompletionOpen(true);
    }
  }, [sequenceComplete]);

  const returnHomeAndReset = () => {
    resetAll();
    setCompletionOpen(false);
    router.push("/");
  };

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
          onFill: () => complete(currentDhikr.id, currentDhikr.count),
          onReset: () => reset(currentDhikr.id),
        }}
      />

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      {isLast && remainingCount > 0 ? (
        <Alert>
          <Info aria-hidden="true" />
          <AlertTitle>لسه في {remainingCount} ذكر ناقص</AlertTitle>
          <AlertDescription className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex(firstIncompleteIndex)}
              disabled={firstIncompleteIndex < 0}
            >
              الانتقال إلى أول ذكر ناقص
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PartyPopper aria-hidden="true" className="size-7" />
            </span>
            <DialogTitle>تهانينا لك!</DialogTitle>
            <DialogDescription className="text-base">
              لقد أتممت جميع الأذكار {periodLabel}. تقبّل الله منك.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={returnHomeAndReset} className="w-full sm:w-auto">
              <House aria-hidden="true" />
              الانتقال إلى الرئيسية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
