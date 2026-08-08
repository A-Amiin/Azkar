"use client";

import { useEffect } from "react";
import { runOnOneSignal } from "@/lib/onesignal-client";
import {
  TAG_DISABLED_VALUE,
  TAG_KEY,
  isWithinPeriodWindow,
} from "@/lib/notification-schedule";
import { todayCairoDate } from "@/lib/cairo-time";
import type { AzkarPeriod } from "@/types/azkar";

/** Marks a period "seen" for today — the interaction that cancels that
 *  period's second reminder (NOTIFICATIONS_PLAN.md section 11). Call once
 *  from the morning/evening page's client view. Counts both "opened via
 *  the reminder notification" and "navigated here directly," matching the
 *  plan's requirement — a page visit during the period's window is enough,
 *  regardless of how the user got here. Deliberately does NOT overwrite an
 *  explicit "off" (a user who disabled this period's reminders isn't
 *  silently re-subscribed by visiting the page). Never touches
 *  notification permission — only writes a tag, and only if a push
 *  subscription already exists. */
export function useMarkPeriodSeen(period: AzkarPeriod) {
  useEffect(() => {
    if (!isWithinPeriodWindow(period)) return;

    runOnOneSignal(async (OneSignal) => {
      if (!OneSignal.Notifications.permission) return;

      const tagKey = TAG_KEY[period];
      let currentValue: string | undefined;
      try {
        currentValue = (await OneSignal.User.getTags())[tagKey];
      } catch {
        return; // Offline/transient SDK error — nothing to mark, safely skip.
      }

      if (currentValue === TAG_DISABLED_VALUE) return;

      const today = todayCairoDate();
      if (currentValue === today) return;

      OneSignal.User.addTag(tagKey, today);
    });
  }, [period]);
}
