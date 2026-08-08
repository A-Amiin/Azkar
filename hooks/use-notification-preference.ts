"use client";

import { useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { runOnOneSignal } from "@/lib/onesignal-client";
import { TAG_DISABLED_VALUE, TAG_KEY } from "@/lib/notification-schedule";
import { STORAGE_KEYS, type NotificationPreferenceSchemaV1 } from "@/lib/storage";
import type { AzkarPeriod } from "@/types/azkar";

const DEFAULT_PREFERENCE: NotificationPreferenceSchemaV1 = {
  version: 1,
  morningEnabled: true,
  eveningEnabled: true,
};

interface UseNotificationPreferenceResult {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  setMorningEnabled: (enabled: boolean) => void;
  setEveningEnabled: (enabled: boolean) => void;
}

/** Reads/writes the enabled half of the morning_state / evening_state
 *  OneSignal tags (NOTIFICATIONS_PLAN.md section 11): disabling a period
 *  writes "off" (overwriting any date value), re-enabling removes the tag
 *  entirely — which the Cron filters treat identically to "never
 *  interacted," i.e. eligible. The localStorage mirror
 *  (STORAGE_KEYS.notificationPreference) is not the source of truth; it
 *  only lets the UI render instantly instead of waiting on an async
 *  getTags() call, and is reconciled from the real tags once on mount. */
export function useNotificationPreference(): UseNotificationPreferenceResult {
  const [preference, setPreference] = useLocalStorage(
    STORAGE_KEYS.notificationPreference,
    DEFAULT_PREFERENCE
  );

  useEffect(() => {
    runOnOneSignal(async (OneSignal) => {
      try {
        const tags = await OneSignal.User.getTags();
        setPreference({
          version: 1,
          morningEnabled: tags[TAG_KEY.morning] !== TAG_DISABLED_VALUE,
          eveningEnabled: tags[TAG_KEY.evening] !== TAG_DISABLED_VALUE,
        });
      } catch {
        // No subscription yet, or a transient SDK/network error — leave the
        // localStorage mirror (or its default) as the best available guess.
      }
    });
    // Reconcile once per mount only; every subsequent change goes through
    // setPeriodEnabled below, which keeps the mirror in sync itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPeriodEnabled = useCallback(
    (period: AzkarPeriod, enabled: boolean) => {
      runOnOneSignal((OneSignal) => {
        if (enabled) {
          OneSignal.User.removeTag(TAG_KEY[period]);
        } else {
          OneSignal.User.addTag(TAG_KEY[period], TAG_DISABLED_VALUE);
        }
      });

      setPreference((previous) => ({
        ...previous,
        ...(period === "morning"
          ? { morningEnabled: enabled }
          : { eveningEnabled: enabled }),
      }));
    },
    [setPreference]
  );

  return {
    morningEnabled: preference.morningEnabled,
    eveningEnabled: preference.eveningEnabled,
    setMorningEnabled: (enabled: boolean) => setPeriodEnabled("morning", enabled),
    setEveningEnabled: (enabled: boolean) => setPeriodEnabled("evening", enabled),
  };
}
