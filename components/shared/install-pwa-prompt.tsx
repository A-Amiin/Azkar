"use client";

import { Download, Share, X } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { STORAGE_KEYS, type UiStateSchemaV1 } from "@/lib/storage";

const DEFAULT_UI_STATE: UiStateSchemaV1 = { version: 1, installTipDismissed: false };

/** Renders nothing unless the app is genuinely installable and not already
 *  installed: a native install button where `beforeinstallprompt` fired, or
 *  a dismissible manual-instructions Alert on iOS Safari (which never fires
 *  that event at all). */
export function InstallPwaPrompt() {
  const { canInstall, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [uiState, setUiState] = useLocalStorage(STORAGE_KEYS.uiState, DEFAULT_UI_STATE);

  if (isStandalone) return null;

  if (canInstall) {
    return (
      <Button type="button" size="sm" onClick={() => promptInstall()} className="gap-1.5">
        <Download aria-hidden="true" />
        تثبيت التطبيق
      </Button>
    );
  }

  if (isIOS && !uiState.installTipDismissed) {
    return (
      <Alert className="mx-4 mt-4 max-w-3xl sm:mx-auto">
        <Share aria-hidden="true" />
        <AlertTitle>ثبّت التطبيق على شاشتك الرئيسية</AlertTitle>
        <AlertDescription>
          اضغط على زر المشاركة في المتصفح، ثم اختر «إضافة إلى الشاشة الرئيسية».
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="إغلاق"
            onClick={() =>
              setUiState((previous) => ({ ...previous, installTipDismissed: true }))
            }
          >
            <X aria-hidden="true" />
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  return null;
}
