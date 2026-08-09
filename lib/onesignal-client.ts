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

/** OneSignal web apps are bound to the exact Site URL configured in their
 * dashboard. The production App ID therefore must not be initialized on
 * localhost or on a Vercel preview deployment. A separate OneSignal app can
 * opt into local testing explicitly. */
const ONESIGNAL_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_ONESIGNAL_SITE_ORIGIN ??
  "https://azkkar.vercel.app";
const ONESIGNAL_ENABLE_LOCALHOST =
  process.env.NEXT_PUBLIC_ONESIGNAL_ENABLE_LOCALHOST === "true";

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function isOneSignalOriginAllowed(): boolean {
  if (typeof window === "undefined") return false;

  if (isLocalhost(window.location.hostname)) {
    return ONESIGNAL_ENABLE_LOCALHOST;
  }

  try {
    return window.location.origin === new URL(ONESIGNAL_SITE_ORIGIN).origin;
  } catch {
    return false;
  }
}

export function isOneSignalConfigured(): boolean {
  return Boolean(ONESIGNAL_APP_ID) && isOneSignalOriginAllowed();
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
