"use client";

import { useAzkarProgress } from "@/hooks/use-azkar-progress";
import type { Dhikr } from "@/types/azkar";

/** Period-locked convenience wrapper around the generic progress engine —
 *  keeps "morning" as a single literal in one place rather than repeated
 *  wherever this route needs progress state. */
export function useMorningProgress(items: Pick<Dhikr, "id" | "count">[]) {
  return useAzkarProgress("morning", items);
}
