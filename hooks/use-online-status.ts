"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

// Server-rendered HTML has no concept of connectivity — default to "online"
// so there's no false offline flash before hydration reconciles.
function getServerSnapshot() {
  return true;
}

/** Live `navigator.onLine` status, reactive to `online`/`offline` events. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
