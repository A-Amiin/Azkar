"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/** Registers /OneSignalSDKWorker.js after mount (never during SSR/build)
 *  and surfaces a "new version available" toast when an update is
 *  waiting — the worker itself never calls skipWaiting() on its own (see
 *  public/OneSignalSDKWorker.js), so nothing swaps under the user without
 *  this explicit confirmation. Renders nothing; this is a pure
 *  side-effect component.
 *
 *  Filename note: this used to be /sw.js, renamed to OneSignal's default
 *  expected filename after `serviceWorkerPath` in OneSignal.init() proved
 *  unreliable in production — see public/OneSignalSDKWorker.js. */
export function ServiceWorkerRegistration() {
  const hasReloaded = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Never keep a production PWA worker active against the development
    // server. Turbopack can reuse chunk URLs while their module graph changes.
    if (process.env.NODE_ENV === "development") {
      void Promise.all([
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister()))
          ),
        "caches" in window
          ? caches
              .keys()
              .then((keys) =>
                Promise.all(
                  keys
                    .filter((key) => key.startsWith("azkar-"))
                    .map((key) => caches.delete(key))
                )
              )
          : Promise.resolve([]),
      ]).then(() => {
        if (!navigator.serviceWorker.controller) return;

        const reloadKey = "azkar-dev-sw-cleanup";
        if (sessionStorage.getItem(reloadKey)) return;
        sessionStorage.setItem(reloadKey, "done");
        window.location.reload();
      });

      return;
    }

    function promptForUpdate(worker: ServiceWorker) {
      // A stable id makes sonner update the existing toast instead of
      // stacking a new one — this can fire more than once per session
      // (registration.waiting on load, then updatefound/statechange
      // later, or across several reloads before the user acts on it).
      toast("نسخة جديدة من التطبيق متاحة", {
        id: "sw-update-available",
        action: {
          label: "تحديث",
          onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
        },
        duration: Infinity,
      });
    }

    let cancelled = false;

    navigator.serviceWorker
      .register("/OneSignalSDKWorker.js", { updateViaCache: "none" })
      .then((registration) => {
      if (cancelled) return;

      if (registration.waiting && navigator.serviceWorker.controller) {
        promptForUpdate(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            promptForUpdate(installingWorker);
          }
        });
      });
      })
      .catch(() => {
        // The application remains usable if PWA registration is unavailable.
      });

    const onControllerChange = () => {
      if (hasReloaded.current) return;
      hasReloaded.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
