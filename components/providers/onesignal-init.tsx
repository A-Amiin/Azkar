"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  ONESIGNAL_APP_ID,
  isOneSignalConfigured,
  runOnOneSignal,
} from "@/lib/onesignal-client";

// Module-level, not component state: React's Strict Mode intentionally
// double-invokes effects in development (mount → cleanup → mount again) to
// surface exactly this kind of bug, and OneSignal.init() is not idempotent
// — calling it twice throws "SDK already initialized". A ref/state flag
// wouldn't help (it resets on the simulated remount too); this needs to
// survive across that remount, which only a module-scope variable does.
let hasInitialized = false;

/** Loads and initializes the OneSignal Web SDK, mirroring the pattern used
 *  by ServiceWorkerRegistration: a side-effect-only component rendered
 *  once from the root layout. This never requests notification permission
 *  itself — that only happens from an explicit user gesture in the
 *  customization page's notification settings (NOTIFICATIONS_PLAN.md
 *  section 8) — it only makes the SDK available so that page (and the
 *  "mark period seen" hook on /morning and /evening) can call it.
 *
 *  Progressive enhancement: if NEXT_PUBLIC_ONESIGNAL_APP_ID isn't
 *  configured (e.g. local development without an OneSignal app yet), this
 *  renders nothing and the rest of the app is unaffected. */
export function OneSignalInit() {
  useEffect(() => {
    // A OneSignal web App ID only works on the exact Site URL configured in
    // its dashboard. In particular, allowLocalhostAsSecureOrigin does not
    // make a production App ID valid on localhost. Skipping initialization
    // here keeps development and Vercel preview origins free of SDK errors.
    if (!ONESIGNAL_APP_ID || !isOneSignalConfigured() || hasInitialized) return;
    hasInitialized = true;
    // Captured locally: TS doesn't carry the guard's narrowing of an
    // imported binding across the closure below.
    const appId = ONESIGNAL_APP_ID;

    // Push the init call onto the deferred queue *before* the SDK script
    // necessarily finishes loading — this is OneSignal's documented
    // pattern: the queue is drained as soon as the SDK becomes ready,
    // regardless of the order these two things happen in.
    runOnOneSignal(async (OneSignal) => {
      await OneSignal.init({
        appId,
        // No serviceWorkerPath/serviceWorkerParam here — public/sw.js was
        // renamed to public/OneSignalSDKWorker.js precisely so none is
        // needed. An earlier version of this file passed
        // serviceWorkerPath: "sw.js" to keep a shorter custom filename;
        // that was confirmed NOT to work in production (OneSignal.init()
        // silently ignored it and requested the default filename anyway,
        // 404ing). Zero-config default naming is what's actually
        // reliable — see public/OneSignalSDKWorker.js and
        // NOTIFICATIONS_PLAN.md section 16.
        //
        // Per OneSignal's Web SDK setup docs: lets Web Push register over
        // plain HTTP on localhost during local development, where there's
        // no HTTPS. Never true in production.
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
      });
    });
  }, []);

  if (!ONESIGNAL_APP_ID) return null;

  return (
    <Script
      src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
      strategy="afterInteractive"
    />
  );
}
