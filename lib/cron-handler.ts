/**
 * Shared GET handler factory for the four notification Cron Route
 * Handlers (app/api/cron/*). All four do exactly the same thing —
 * check CRON_SECRET, check the time window, build filters, send — and
 * only differ in which slot they're for, so this is the one place that
 * logic lives rather than four near-identical copies.
 */

import "server-only";
import type { NextRequest } from "next/server";
import { todayCairoDate } from "@/lib/cairo-time";
import {
  NOTIFICATION_SLOTS,
  TAG_KEY,
  isSlotWithinWindow,
  type NotificationSlotId,
} from "@/lib/notification-schedule";
import { NOTIFICATION_COPY } from "@/lib/notification-copy";
import {
  buildFilters,
  idempotencyKeyFor,
  sendNotification,
} from "@/lib/onesignal-server";

export function createCronGetHandler(slotId: NotificationSlotId) {
  const slot = NOTIFICATION_SLOTS[slotId];

  return async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Vercel Cron on the Hobby plan can fire up to 59 minutes off its
    // nominal hour, and Africa/Cairo's UTC offset could change in the
    // future — this check is the actual source of truth for whether a
    // send should happen right now, independent of why the function was
    // invoked. See NOTIFICATIONS_PLAN.md sections 9/10/12.
    if (!isSlotWithinWindow(slot.id)) {
      return Response.json({ sent: false, reason: "outside-window" });
    }

    const date = todayCairoDate();
    const result = await sendNotification({
      copy: NOTIFICATION_COPY[slot.id],
      filters: buildFilters(TAG_KEY[slot.period], {
        excludeSeenToday: slot.excludeSeenToday,
      }),
      idempotencyKey: idempotencyKeyFor(slot.id, date),
    });

    return Response.json({ sent: result.ok, status: result.status, date });
  };
}
