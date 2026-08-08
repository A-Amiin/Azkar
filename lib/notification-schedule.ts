/**
 * Shared definition of the four daily reminder slots and the Cairo-local
 * time windows that gate them. Imported by both the Cron Route Handlers
 * (server) and the "mark period seen" hook (client) so the two sides can
 * never disagree about what "within the period" means — see
 * NOTIFICATIONS_PLAN.md sections 9–11.
 */

import type { AzkarPeriod } from "@/types/azkar";
import { isWithinCairoWindow } from "@/lib/cairo-time";
import { getTodayAsrCairoMinutes } from "@/lib/prayer-times";

export type NotificationSlotId =
  | "morning-1"
  | "morning-2"
  | "evening-1"
  | "evening-2";

/** The single OneSignal Data Tag that carries both the enabled/disabled
 *  state and the "last seen" date for a period — see NOTIFICATIONS_PLAN.md
 *  section 11 for why one compact tag per period instead of two. */
export const TAG_KEY: Record<AzkarPeriod, string> = {
  morning: "morning_state",
  evening: "evening_state",
};

/** Sentinel tag value meaning "user explicitly disabled this period's
 *  reminders." Never a valid YYYY-MM-DD date, so it can't collide with a
 *  "seen" value. */
export const TAG_DISABLED_VALUE = "off";

// 05:00–11:00 Cairo — fixed, does not depend on prayer times.
const MORNING_START_MINUTES = 5 * 60;
const MORNING_END_MINUTES = 11 * 60;

// Evening ends at 22:00 Cairo (see NOTIFICATIONS_PLAN.md section 4,
// assumption #3); it starts at today's actual Asr time, computed fresh on
// every check rather than assumed.
const EVENING_END_MINUTES = 22 * 60;

export interface NotificationSlot {
  id: NotificationSlotId;
  period: AzkarPeriod;
  /** True for the second reminder of each period: its filter must also
   *  exclude users whose tag already equals today's date. */
  excludeSeenToday: boolean;
}

export const NOTIFICATION_SLOTS: Record<NotificationSlotId, NotificationSlot> =
  {
    "morning-1": { id: "morning-1", period: "morning", excludeSeenToday: false },
    "morning-2": { id: "morning-2", period: "morning", excludeSeenToday: true },
    "evening-1": { id: "evening-1", period: "evening", excludeSeenToday: false },
    "evening-2": { id: "evening-2", period: "evening", excludeSeenToday: true },
  };

/** Is "now" (Cairo local) currently inside the given period's window?
 *  This is the source of truth for both "should a Cron invocation actually
 *  send" and "does this page visit count as an in-period interaction" —
 *  see NOTIFICATIONS_PLAN.md sections 9–11. */
export function isWithinPeriodWindow(period: AzkarPeriod): boolean {
  if (period === "morning") {
    return isWithinCairoWindow(MORNING_START_MINUTES, MORNING_END_MINUTES);
  }
  const asrMinutes = getTodayAsrCairoMinutes();
  return isWithinCairoWindow(asrMinutes, EVENING_END_MINUTES);
}

/** Convenience wrapper for the Cron Route Handlers. */
export function isSlotWithinWindow(slotId: NotificationSlotId): boolean {
  return isWithinPeriodWindow(NOTIFICATION_SLOTS[slotId].period);
}
