"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/** Renders nothing unless the app is genuinely installable and not already
 *  installed. It lives inside AppHeader, using the native installation prompt
 *  where available and concise manual guidance on iOS. */
export function InstallPwaPrompt() {
  const { canInstall, isStandalone, isIOS, promptInstall } = usePwaInstall();

  if (isStandalone) return null;

  if (canInstall || isIOS) {
    return (
      <Button
        type="button"
        size="sm"
        aria-label="تثبيت التطبيق"
        onClick={() => {
          if (isIOS) {
            toast.info("لتثبيت التطبيق، اضغط زر المشاركة ثم اختر «إضافة إلى الشاشة الرئيسية».");
            return;
          }
          void promptInstall();
        }}
        className="gap-1.5"
      >
        <Download aria-hidden="true" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
      </Button>
    );
  }

  return null;
}
