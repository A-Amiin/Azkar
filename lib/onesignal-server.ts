/**
 * Server-only OneSignal REST API client. Never import this from a
 * "use client" file — it reads `ONESIGNAL_REST_API_KEY`, which must never
 * reach the browser bundle. See NOTIFICATIONS_PLAN.md sections 14 and 21.
 */

import "server-only";
import { v4 as uuidv4, v5 as uuidv5 } from "uuid";
import { todayCairoDate } from "@/lib/cairo-time";
import { TAG_DISABLED_VALUE } from "@/lib/notification-schedule";
import type { NotificationCopy } from "@/lib/notification-copy";

const ONESIGNAL_API_URL = "https://api.onesignal.com/notifications";

// Fixed namespace for deriving deterministic idempotency keys (UUID v5).
// Not a secret — it only needs to be stable so the same logical send
// (slot + date) always maps to the same idempotency_key.
const IDEMPOTENCY_NAMESPACE = "0109111b-4a3b-431b-b9d7-88c997a34f6a";

type OneSignalFilter =
  | { field: "tag"; key: string; relation: "not_exists" }
  | { field: "tag"; key: string; relation: "!="; value: string }
  | { operator: "OR" | "AND" };

/**
 * Builds the `filters` array for one reminder slot's send.
 *
 * First reminder of a period: exclude only users who explicitly disabled
 * it (`tag == "off"`); a missing tag or any date value still passes.
 *   (not_exists) OR (!= "off")
 *
 * Second reminder: same, AND also exclude users already marked as having
 * seen the period today.
 *   ((not_exists) OR (!= "off")) AND (!= today)
 *
 * Evaluated by OneSignal left-to-right (no parentheses support), which
 * naturally produces the grouping above — see NOTIFICATIONS_PLAN.md
 * section 11 for the caveat that this must be verified against real test
 * devices before going live (OneSignal's docs don't fully spell out
 * `not_exists` interaction with chained OR/AND).
 */
export function buildFilters(
  tagKey: string,
  options: { excludeSeenToday: boolean }
): OneSignalFilter[] {
  const filters: OneSignalFilter[] = [
    { field: "tag", key: tagKey, relation: "not_exists" },
    { operator: "OR" },
    { field: "tag", key: tagKey, relation: "!=", value: TAG_DISABLED_VALUE },
  ];

  if (options.excludeSeenToday) {
    filters.push(
      { operator: "AND" },
      { field: "tag", key: tagKey, relation: "!=", value: todayCairoDate() }
    );
  }

  return filters;
}

/** Deterministic idempotency key for a given slot on a given Cairo date —
 *  retrying the same Cron invocation (e.g. after a network error) never
 *  produces a duplicate notification. Valid per OneSignal for 30 days. */
export function idempotencyKeyFor(slotId: string, date: string): string {
  return uuidv5(`${slotId}:${date}`, IDEMPOTENCY_NAMESPACE);
}

/** OneSignal rejects a notification with "Message Notifications must have
 *  Any/English language content" unless an "en" key is present in
 *  headings/contents — confirmed via a live 400 response, not
 *  documentation (which didn't mention this requirement at all). This app
 *  is Arabic-only by design, so "en" duplicates the same Arabic text
 *  rather than an actual translation — it exists purely to satisfy
 *  OneSignal's required fallback locale; real delivery still prioritizes
 *  "ar" for Arabic-locale devices. */
function localizedText(text: string): { en: string; ar: string } {
  return { en: text, ar: text };
}

/** Posts one notification create request to the OneSignal REST API.
 *  Retries once on 429/5xx with a short backoff. Never logs the
 *  Authorization header, the API key, or anything from the outgoing
 *  request body. On failure, DOES log OneSignal's own JSON error body
 *  (e.g. `{"errors":["..."]}`) — that's a validation message describing
 *  what's wrong with the request shape, not a secret, and it's the only
 *  practical way to diagnose a 400 without guessing at field names again
 *  (see the 2026-08-09 service-worker-filename incident in
 *  NOTIFICATIONS_PLAN.md section 16 — OneSignal's own docs were wrong
 *  once already today). Shared by both sendNotification() (the scheduled
 *  reminders, targeted by `filters`) and sendTestNotification() (targeted
 *  at exactly one subscription). */
async function postToOneSignal(
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number }> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY"
    );
  }

  const payload = JSON.stringify({ app_id: appId, ...body });

  const attempt = async () =>
    fetch(ONESIGNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: payload,
    });

  let response = await attempt();

  if (response.status === 429 || response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    response = await attempt();
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "<unreadable body>");
    console.error(
      `OneSignal notification send failed: HTTP ${response.status} — ${errorBody}`
    );
  }

  return { ok: response.ok, status: response.status };
}

export interface SendNotificationOptions {
  copy: NotificationCopy;
  filters: OneSignalFilter[];
  idempotencyKey: string;
}

/** Sends one scheduled reminder immediately via the OneSignal REST API —
 *  never via `send_after`/internal scheduling (see NOTIFICATIONS_PLAN.md
 *  section 11 for why). */
export async function sendNotification({
  copy,
  filters,
  idempotencyKey,
}: SendNotificationOptions): Promise<{ ok: boolean; status: number }> {
  return postToOneSignal({
    idempotency_key: idempotencyKey,
    filters,
    headings: localizedText(copy.title),
    contents: localizedText(copy.body),
    url: copy.url,
    web_push_topic: copy.topic,
    data: copy.data,
  });
}

/** Sends a one-off test notification to exactly one OneSignal push
 *  subscription — never a segment/filter, so the worst-case abuse of this
 *  (publicly reachable, no CRON_SECRET) endpoint is a user spamming their
 *  own device. See app/api/notifications/test/route.ts and
 *  NOTIFICATIONS_PLAN.md section 21. */
export async function sendTestNotification(
  subscriptionId: string
): Promise<{ ok: boolean; status: number }> {
  return postToOneSignal({
    idempotency_key: uuidv4(),
    include_subscription_ids: [subscriptionId],
    headings: localizedText("🔔 إشعار تجريبي"),
    contents: localizedText("وصلك هذا الإشعار بنجاح — كل شيء يعمل كما هو متوقع."),
  });
}
