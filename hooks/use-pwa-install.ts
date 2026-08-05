"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** The `beforeinstallprompt` event isn't in the DOM lib types yet — this is
 *  the standard shape browsers dispatch it with. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's legacy standalone flag
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function subscribeToDisplayMode(onStoreChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onStoreChange);
  window.addEventListener("appinstalled", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("appinstalled", onStoreChange);
  };
}

// Server-rendered HTML can't know the display mode — default to "not
// standalone" so there's no mismatch before hydration reconciles.
function getServerSnapshot() {
  return false;
}

interface UsePwaInstallResult {
  /** True once the browser has signaled the app is installable and the
   *  prompt hasn't been used/dismissed yet. */
  canInstall: boolean;
  /** True when already launched as an installed, standalone PWA. */
  isStandalone: boolean;
  /** Shows the native install prompt. Resolves to the user's choice, or
   *  `null` if no prompt was available (e.g. iOS Safari, which has no
   *  `beforeinstallprompt` — callers should fall back to manual instructions). */
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
}

export function usePwaInstall(): UsePwaInstallResult {
  const isStandalone = useSyncExternalStore(
    subscribeToDisplayMode,
    isStandaloneDisplay,
    getServerSnapshot
  );

  const [deferredEvent, setDeferredEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return null;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    setDeferredEvent(null);
    return outcome;
  }, [deferredEvent]);

  return {
    canInstall: deferredEvent !== null,
    isStandalone,
    promptInstall,
  };
}
