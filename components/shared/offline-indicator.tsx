"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/** A quiet connectivity banner — renders nothing while online, and a
 *  non-interactive status badge while offline. `role="status"` (not
 *  `aria-live="assertive"`) so screen readers announce the transition
 *  politely rather than interrupting whatever the user is doing. */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
    >
      <WifiOff aria-hidden="true" className="size-3.5" />
      غير متصل
    </div>
  );
}
