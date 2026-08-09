"use client";

import { useEffect } from "react";
import Script from "next/script";
import { ONESIGNAL_APP_ID, runOnOneSignal } from "@/lib/onesignal-client";

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
    if (!ONESIGNAL_APP_ID) return;
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
        // Our service worker lives at /sw.js, not OneSignal's default
        // OneSignalSDKWorker.js — see public/sw.js and
        // NOTIFICATIONS_PLAN.md section 16. Requires "Customize service
        // worker paths and filenames" enabled in the OneSignal dashboard.
        serviceWorkerPath: "sw.js",
        serviceWorkerParam: { scope: "/" },
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
