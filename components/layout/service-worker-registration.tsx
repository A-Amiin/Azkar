"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const APP_VERSION_STORAGE_KEY = "azkar-app-version";
const UPDATE_TOAST_ID = "app-update-available";

interface AppVersionResponse {
  version?: unknown;
}

/** Registers the shared application/OneSignal service worker. Update notices
 * are based on a build identifier, not `ServiceWorker.updatefound`: the
 * imported OneSignal worker may change independently and must not announce a
 * new Azkar release. */
export function ServiceWorkerRegistration() {
  const hasReloaded = useRef(false);
  const hasAcceptedUpdate = useRef(false);

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

    function promptForUpdate(
      version: string,
      registration: ServiceWorkerRegistration
    ) {
      toast("نسخة جديدة من التطبيق متاحة", {
        id: UPDATE_TOAST_ID,
        action: {
          label: "تحديث",
          onClick: () => {
            // Save first: after the reload this exact release is already
            // acknowledged, so its toast cannot appear for a second time.
            localStorage.setItem(APP_VERSION_STORAGE_KEY, version);
            hasAcceptedUpdate.current = true;
            toast.dismiss(UPDATE_TOAST_ID);

            if (registration.waiting) {
              registration.waiting.postMessage({ type: "SKIP_WAITING" });
            } else {
              window.location.reload();
            }
          },
        },
        duration: Infinity,
      });
    }

    async function checkDeployedAppVersion(
      registration: ServiceWorkerRegistration
    ) {
      const response = await fetch(`/app-version.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return;

      const payload = (await response.json()) as AppVersionResponse;
      if (typeof payload.version !== "string" || !payload.version) return;

      const storedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);

      // The first visit establishes a baseline silently. Only a later build
      // is an update from this device's point of view.
      if (!storedVersion) {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, payload.version);
        return;
      }

      if (storedVersion !== payload.version) {
        promptForUpdate(payload.version, registration);
      }
    }

    let cancelled = false;

    navigator.serviceWorker
      .register("/OneSignalSDKWorker.js", { updateViaCache: "none" })
      .then((registration) => {
        if (cancelled) return;

        // OneSignal's imported worker may trigger `updatefound` even when this
        // app did not deploy. Only our generated build version drives the UI.
        void checkDeployedAppVersion(registration).catch(() => {
          // Progressive enhancement: offline/version-check failures never
          // interfere with the rest of the application.
        });
      })
      .catch(() => {
        // The application remains usable if PWA registration is unavailable.
      });

    const onControllerChange = () => {
      // A worker can change for OneSignal's own reasons. Reload automatically
      // only when this user explicitly accepted an Azkar application update.
      if (!hasAcceptedUpdate.current || hasReloaded.current) return;
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
