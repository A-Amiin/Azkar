"use client";

import { Switch } from "@/components/ui/switch";
import { useAutoAdvancePreference } from "@/hooks/use-auto-advance-preference";

export function AutoAdvanceToggle() {
  const { enabled, setEnabled } = useAutoAdvancePreference();

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <label htmlFor="auto-advance" className="cursor-pointer font-medium">
        الانتقال تلقائيًا بعد اكتمال العد
      </label>
      <Switch
        id="auto-advance"
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="الانتقال تلقائيًا إلى الذكر التالي"
      />
    </div>
  );
}
