"use client";

import { useCallback, useState } from "react";
import { runOnOneSignal } from "@/lib/onesignal-client";

interface UseSendTestNotificationResult {
  isSending: boolean;
  error: string | null;
  success: boolean;
  sendTestNotification: () => Promise<void>;
}

/** Sends a one-off test push to this device only, via
 *  app/api/notifications/test/route.ts. Reads the current OneSignal push
 *  subscription id client-side (never a segment/filter) so the request
 *  can only ever target the caller's own device — see
 *  NOTIFICATIONS_PLAN.md section 21. */
export function useSendTestNotification(): UseSendTestNotificationResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendTestNotification = useCallback(async () => {
    setError(null);
    setSuccess(false);
    setIsSending(true);

    try {
      const subscriptionId = await new Promise<string | null>((resolve) => {
        runOnOneSignal((OneSignal) => {
          resolve(OneSignal.User.PushSubscription.id);
        });
      });

      if (!subscriptionId) {
        setError("لا يوجد اشتراك إشعارات نشط على هذا الجهاز بعد.");
        return;
      }

      // Trailing slash matches this project's trailingSlash: true — calling
      // the non-slash path would still work (fetch() follows the 308
      // redirect automatically, unlike Vercel Cron), but this skips the
      // extra round trip.
      const response = await fetch("/api/notifications/test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        setError("تعذّر إرسال الإشعار التجريبي. حاول مرة أخرى لاحقًا.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت.");
    } finally {
      setIsSending(false);
    }
  }, []);

  return { isSending, error, success, sendTestNotification };
}
