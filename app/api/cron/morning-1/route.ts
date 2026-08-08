import type { NextRequest } from "next/server";
import { todayCairoDate } from "@/lib/cairo-time";
import {
  NOTIFICATION_SLOTS,
  TAG_KEY,
  isSlotWithinWindow,
} from "@/lib/notification-schedule";
import { NOTIFICATION_COPY } from "@/lib/notification-copy";
import {
  buildFilters,
  idempotencyKeyFor,
  sendNotification,
} from "@/lib/onesignal-server";

// Invoked once daily by Vercel Cron (see vercel.json). GET per Vercel's
// Cron convention. Reading `request.headers` opts this route out of
// static prerendering automatically — no route segment config needed.
//
// IMPORTANT: this project has `trailingSlash: true`, so
// /api/cron/morning-1 308-redirects to /api/cron/morning-1/ — and Vercel
// Cron does not follow redirects (confirmed via local smoke test: the
// no-slash URL never reaches this handler). vercel.json's cron `path`
// must include the trailing slash, or the job silently never fires.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const slot = NOTIFICATION_SLOTS["morning-1"];

  // Vercel Cron on the Hobby plan can fire up to 59 minutes off its
  // nominal hour, and Africa/Cairo's UTC offset could change in the
  // future — this check is the actual source of truth for whether a send
  // should happen right now, independent of why the function was invoked.
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
}
