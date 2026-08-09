"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { isOneSignalConfigured, runOnOneSignalWithTimeout } from "@/lib/onesignal-client";

export type NotificationSupportStatus =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

function isNotificationApiSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function getPermission(): NotificationSupportStatus {
  if (!isNotificationApiSupported()) return "unsupported";
  return Notification.permission;
}

// The Notification API has no standard "permission changed" event — a user
// can flip the permission from the browser's own site settings while this
// tab stays open. Re-reading on focus/visibility is a pragmatic way to
// pick that up without polling on a timer.
function subscribeToPermissionChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  document.addEventListener("visibilitychange", onStoreChange);
  window.addEventListener("focus", onStoreChange);
  return () => {
    document.removeEventListener("visibilitychange", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}

// Server-rendered HTML can't know Notification support/permission — default
// to "unsupported" so there's no mismatch before hydration reconciles (same
// pattern as hooks/use-pwa-install.ts).
function getServerSnapshot(): NotificationSupportStatus {
  return "unsupported";
}

interface UseNotificationPermissionResult {
  status: NotificationSupportStatus;
  isRequesting: boolean;
  /** Arabic, user-facing error from the last requestPermission() call. */
  error: string | null;
  /** Must be called from a user gesture (e.g. a button's onClick) — never
   *  automatically. Loads/initializes the OneSignal SDK if needed and
   *  shows the native permission prompt. Resolves to whether permission
   *  ended up granted. */
  requestPermission: () => Promise<boolean>;
}

export function useNotificationPermission(): UseNotificationPermissionResult {
  const status = useSyncExternalStore(
    subscribeToPermissionChanges,
    getPermission,
    getServerSnapshot
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setError(null);

    if (!isNotificationApiSupported()) {
      setError("متصفحك الحالي لا يدعم الإشعارات.");
      return false;
    }

    // Fails fast with a clear message instead of hanging forever waiting
    // on a queue that will never drain — see the incident that prompted
    // this: without NEXT_PUBLIC_ONESIGNAL_APP_ID, components/providers/
    // onesignal-init.tsx never loads the SDK script at all, so the old
    // code (no config check, no timeout) spun on "جارٍ التفعيل..." with
    // no way out.
    if (!isOneSignalConfigured()) {
      setError(
        "نظام الإشعارات غير مُفعَّل على هذا الموقع بعد. إن كنت المطوّر، راجع NOTIFICATIONS_PLAN.md لإعداد OneSignal."
      );
      return false;
    }

    setIsRequesting(true);
    try {
      const granted = await runOnOneSignalWithTimeout((OneSignal) =>
        OneSignal.Notifications.requestPermission()
      );

      if (!granted) {
        setError(
          "لم يتم تفعيل الإشعارات. يمكنك المحاولة مرة أخرى، أو تفعيلها لاحقًا من إعدادات المتصفح."
        );
      }
      return granted;
    } catch {
      setError(
        "تعذّر الاتصال بخدمة الإشعارات. تحقّق من اتصالك بالإنترنت (أو أنّ أداة حظر الإعلانات لا تمنع cdn.onesignal.com) وحاول مرة أخرى."
      );
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return { status, isRequesting, error, requestPermission };
}
