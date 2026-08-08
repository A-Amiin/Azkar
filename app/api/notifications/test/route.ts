import type { NextRequest } from "next/server";
import { sendTestNotification } from "@/lib/onesignal-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Deliberately public (no CRON_SECRET): a caller can only ever target their
// own OneSignal push subscription id (never a segment or filter), so the
// worst-case abuse is a user spamming their own device — see
// NOTIFICATIONS_PLAN.md section 21.
//
// Note: this project has trailingSlash: true, so /api/notifications/test
// 308-redirects to .../test/ — fetch() follows that automatically (unlike
// Vercel Cron, see app/api/cron/morning-1/route.ts), but the client hook
// calls the trailing-slash URL directly to skip the extra round trip.
export async function POST(request: NextRequest) {
  let subscriptionId: unknown;
  try {
    ({ subscriptionId } = await request.json());
  } catch {
    return Response.json(
      { ok: false, error: "طلب غير صالح." },
      { status: 400 }
    );
  }

  if (typeof subscriptionId !== "string" || !UUID_PATTERN.test(subscriptionId)) {
    return Response.json(
      { ok: false, error: "معرّف الاشتراك غير صالح." },
      { status: 400 }
    );
  }

  try {
    const result = await sendTestNotification(subscriptionId);
    if (!result.ok) {
      return Response.json(
        { ok: false, error: "تعذّر إرسال الإشعار التجريبي." },
        { status: 502 }
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "حدث خطأ غير متوقع أثناء الإرسال." },
      { status: 500 }
    );
  }
}
