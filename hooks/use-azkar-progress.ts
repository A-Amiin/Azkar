"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { progressKeyForPeriod, todayLocalDate } from "@/lib/storage";
import type { ProgressSchemaV1 } from "@/lib/storage";
import type { AzkarPeriod, Dhikr } from "@/types/azkar";

type ProgressTrackedDhikr = Pick<Dhikr, "id" | "count">;

interface UseAzkarProgressResult {
  getCount: (id: string) => number;
  /** Increments the given dhikr's count, clamped at `target` (its required
   *  repetition count). */
  increment: (id: string, target: number) => void;
  /** Marks one dhikr complete in a single write. */
  complete: (id: string, target: number) => void;
  /** Resets one dhikr without affecting the rest of today's progress. */
  reset: (id: string) => void;
  /** Clears every counter for this period so the sequence can be repeated. */
  resetAll: () => void;
  /** Number of dhikr whose count has reached its own required repetitions —
   *  not merely "started". */
  completedCount: number;
  /** Sum of each dhikr's completion fraction, used for smooth progress. */
  fractionalCompletedCount: number;
  totalCount: number;
  isComplete: boolean;
}

function emptyProgressForToday(): ProgressSchemaV1 {
  return { version: 1, date: todayLocalDate(), counts: {} };
}

/** Generic per-day, per-period repetition-counter engine behind
 *  `app/morning/hooks/use-morning-progress.ts` and
 *  `app/evening/hooks/use-evening-progress.ts`. Progress for a period is
 *  scoped to today's local date — a stored value from a previous day is
 *  treated as empty rather than persisted forever, so Azkar naturally
 *  "reset" each day with no history to prune.
 *
 *  Takes the period's full item list (id + required count) rather than a
 *  bare total, because "completed" means each dhikr individually reached
 *  *its own* target repetition count, not just that it was tapped once. */
export function useAzkarProgress(
  period: AzkarPeriod,
  items: ProgressTrackedDhikr[]
): UseAzkarProgressResult {
  const key = progressKeyForPeriod(period);
  const [stored, setStored] = useLocalStorage(key, emptyProgressForToday());

  // A previous day's snapshot is stale — read as empty without persisting
  // the reset until the next write (keeps reads pure). Memoized so
  // `getCount`/`increment`/`completedCount` below don't re-derive on every
  // render when the underlying stored value hasn't actually changed.
  const today = todayLocalDate();
  const counts = useMemo(
    () => (stored.date === today ? stored.counts : {}),
    [stored, today]
  );

  const getCount = useCallback((id: string) => counts[id] ?? 0, [counts]);

  const increment = useCallback(
    (id: string, target: number) => {
      setStored((previous) => {
        const base = previous.date === today ? previous.counts : {};
        const current = base[id] ?? 0;
        if (current >= target) return { version: 1, date: today, counts: base };
        return {
          version: 1,
          date: today,
          counts: { ...base, [id]: current + 1 },
        };
      });
    },
    [setStored, today]
  );

  const reset = useCallback(
    (id: string) => {
      setStored((previous) => {
        const base = previous.date === today ? previous.counts : {};
        if (!(id in base)) return { version: 1, date: today, counts: base };

        return {
          version: 1,
          date: today,
          counts: { ...base, [id]: 0 },
        };
      });
    },
    [setStored, today]
  );

  const complete = useCallback(
    (id: string, target: number) => {
      setStored((previous) => {
        const base = previous.date === today ? previous.counts : {};
        if ((base[id] ?? 0) >= target) {
          return { version: 1, date: today, counts: base };
        }

        return {
          version: 1,
          date: today,
          counts: { ...base, [id]: target },
        };
      });
    },
    [setStored, today]
  );

  const resetAll = useCallback(() => {
    setStored({ version: 1, date: today, counts: {} });
  }, [setStored, today]);

  const completedCount = useMemo(
    () =>
      items.filter((item) => (counts[item.id] ?? 0) >= item.count).length,
    [items, counts]
  );

  const totalCount = items.length;

  const fractionalCompletedCount = useMemo(
    () =>
      items.reduce((total, item) => {
        if (item.count <= 0) return total + 1;
        return total + Math.min(1, (counts[item.id] ?? 0) / item.count);
      }, 0),
    [items, counts]
  );

  return {
    getCount,
    increment,
    complete,
    reset,
    resetAll,
    completedCount,
    fractionalCompletedCount,
    totalCount,
    isComplete: totalCount > 0 && completedCount >= totalCount,
  };
}
