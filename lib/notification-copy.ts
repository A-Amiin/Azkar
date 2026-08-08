/**
 * Arabic copy and delivery metadata for the four daily reminders — kept
 * out of the Route Handlers so the wording can be reviewed/edited without
 * touching any scheduling or filter logic. See NOTIFICATIONS_PLAN.md
 * "صياغة الإشعارات".
 */

import { SITE_URL } from "@/lib/constants";
import type { NotificationSlotId } from "@/lib/notification-schedule";

export interface NotificationCopy {
  title: string;
  body: string;
  url: string;
  /** OneSignal `web_push_topic` (collapse key): a second reminder replaces
   *  the first in the notification tray instead of stacking, if the user
   *  hasn't dismissed/clicked it yet. One topic per period. */
  topic: string;
  /** Custom data carried on the notification payload — not currently read
   *  by any client code, kept for future analytics/debugging. */
  data: { period: "morning" | "evening"; slot: NotificationSlotId };
}

const MORNING_URL = new URL("/morning/", SITE_URL).toString();
const EVENING_URL = new URL("/evening/", SITE_URL).toString();

export const NOTIFICATION_COPY: Record<NotificationSlotId, NotificationCopy> = {
  "morning-1": {
    title: "🌅 أذكار الصباح",
    body: "وقتٌ طيّب لأذكار الصباح، إن تيسّر لك.",
    url: MORNING_URL,
    topic: "azkar-morning",
    data: { period: "morning", slot: "morning-1" },
  },
  "morning-2": {
    title: "🌅 تذكير لطيف",
    body: "ما زال هناك وقتٌ لأذكار الصباح قبل انتهاء الفترة.",
    url: MORNING_URL,
    topic: "azkar-morning",
    data: { period: "morning", slot: "morning-2" },
  },
  "evening-1": {
    title: "🌇 أذكار المساء",
    body: "حان وقت أذكار المساء، بارك الله في وقتك.",
    url: EVENING_URL,
    topic: "azkar-evening",
    data: { period: "evening", slot: "evening-1" },
  },
  "evening-2": {
    title: "🌇 تذكير لطيف",
    body: "لا يزال بإمكانك قراءة أذكار المساء اليوم.",
    url: EVENING_URL,
    topic: "azkar-evening",
    data: { period: "evening", slot: "evening-2" },
  },
};
