/**
 * Small shared helper for pushing a callback onto
 * `window.OneSignalDeferred` — the queue the OneSignal Web SDK drains once
 * it's ready (see components/providers/onesignal-init.tsx). Every
 * client-side hook that calls into the SDK (permission, tags) goes through
 * this one function, so there's a single place that knows about the
 * deferred-queue pattern. Client-only (no-ops during SSR).
 */

import type { OneSignalSDK } from "@/types/onesignal";

export function runOnOneSignal(
  callback: (oneSignal: OneSignalSDK) => void | Promise<void>
) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}
