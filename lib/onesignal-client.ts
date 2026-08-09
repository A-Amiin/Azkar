/**
 * Small shared helper for pushing a callback onto
 * `window.OneSignalDeferred` — the queue the OneSignal Web SDK drains once
 * it's ready (see components/providers/onesignal-init.tsx). Every
 * client-side hook that calls into the SDK (permission, tags) goes through
 * this one function, so there's a single place that knows about the
 * deferred-queue pattern. Client-only (no-ops during SSR).
 */

import type { OneSignalSDK } from "@/types/onesignal";

/** The OneSignal App ID is public (not a secret — see
 *  NOTIFICATIONS_PLAN.md section 14), read once here so every module that
 *  needs to know "is OneSignal configured at all" (components/providers/
 *  onesignal-init.tsx, hooks/use-notification-permission.ts) agrees. */
export const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function isOneSignalConfigured(): boolean {
  return Boolean(ONESIGNAL_APP_ID);
}

export function runOnOneSignal(
  callback: (oneSignal: OneSignalSDK) => void | Promise<void>
) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}

/** Same as runOnOneSignal, but rejects if the SDK never drains the queue
 *  within `timeoutMs` — covers both "NEXT_PUBLIC_ONESIGNAL_APP_ID isn't
 *  set" (OneSignalInit never loads the script at all) and "the script
 *  failed to load" (ad blocker, network issue, OneSignal outage), so a
 *  caller like requestPermission() never hangs indefinitely instead of
 *  showing an error. */
export function runOnOneSignalWithTimeout<T>(
  callback: (oneSignal: OneSignalSDK) => Promise<T>,
  timeoutMs = 8000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("OneSignal SDK did not respond in time"));
    }, timeoutMs);

    runOnOneSignal(async (oneSignal) => {
      try {
        resolve(await callback(oneSignal));
      } catch (error) {
        reject(error);
      } finally {
        clearTimeout(timer);
      }
    });
  });
}
