"use client";

import { BellRing, CheckCircle2, Send, ShieldAlert, ShieldX, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { useNotificationPreference } from "@/hooks/use-notification-preference";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useSendTestNotification } from "@/hooks/use-send-test-notification";

/** Notification settings section for /customization/ — permission status
 *  and request flow, per-period enable/disable toggles, iOS install
 *  instructions, and a test-notification button. Never requests
 *  permission on mount — only in response to the button's onClick. See
 *  NOTIFICATIONS_PLAN.md sections 8 and 17. */
export function NotificationSettings() {
  const { status, isRequesting, error, requestPermission } =
    useNotificationPermission();
  const { isIOS, isStandalone } = usePwaInstall();
  const {
    morningEnabled,
    eveningEnabled,
    setMorningEnabled,
    setEveningEnabled,
  } = useNotificationPreference();
  const {
    isSending: isSendingTest,
    error: testError,
    success: testSucceeded,
    sendTestNotification,
  } = useSendTestNotification();

  // iOS Safari has no Web Push API at all outside an installed, standalone
  // PWA — regardless of iOS version. Show install instructions instead of
  // a permission button that would silently do nothing.
  const needsIOSInstall = isIOS && !isStandalone;

  return (
    <div className="space-y-4">
      {needsIOSInstall ? (
        <Alert>
          <Smartphone />
          <AlertTitle>مطلوب تثبيت التطبيق أولًا على آيفون/آيباد</AlertTitle>
          <AlertDescription>
            <p>
              يفرض نظام iOS تثبيت التطبيق على الشاشة الرئيسية قبل السماح
              بالإشعارات. الخطوات:
            </p>
            <p>
              اضغط على زر المشاركة (Share) في Safari، ثم اختر
              &quot;Add to Home Screen&quot; (إضافة إلى الشاشة الرئيسية)، ثم
              افتح التطبيق من الأيقونة الجديدة على شاشتك الرئيسية وارجع إلى
              هذه الصفحة.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <p className="text-sm text-muted-foreground">
              {statusDescription(status)}
            </p>
          </div>

          {status === "default" && (
            <Button onClick={() => void requestPermission()} disabled={isRequesting}>
              <BellRing />
              {isRequesting ? "جارٍ التفعيل..." : "تفعيل الإشعارات"}
            </Button>
          )}
        </div>
      )}

      {status === "granted" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <label htmlFor="morning-reminders" className="cursor-pointer font-medium">
              تذكيرات الصباح
            </label>
            <Switch
              id="morning-reminders"
              checked={morningEnabled}
              onCheckedChange={setMorningEnabled}
              aria-label="تفعيل تذكيرات أذكار الصباح"
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <label htmlFor="evening-reminders" className="cursor-pointer font-medium">
              تذكيرات المساء
            </label>
            <Switch
              id="evening-reminders"
              checked={eveningEnabled}
              onCheckedChange={setEveningEnabled}
              aria-label="تفعيل تذكيرات أذكار المساء"
            />
          </div>
        </div>
      )}

      {status === "granted" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => void sendTestNotification()}
            disabled={isSendingTest}
          >
            <Send />
            {isSendingTest ? "جارٍ الإرسال..." : "إرسال إشعار تجريبي"}
          </Button>
          {testSucceeded && (
            <p className="text-sm text-muted-foreground">
              تم الإرسال — تحقّق من إشعارات هذا الجهاز.
            </p>
          )}
        </div>
      )}

      {testError && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>تعذّر الإرسال التجريبي</AlertTitle>
          <AlertDescription>{testError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>تعذّر التفعيل</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === "denied" && !needsIOSInstall && (
        <p className="text-sm text-muted-foreground">
          تم رفض إذن الإشعارات مسبقًا من هذا المتصفح. لتفعيلها، غيّر إذن
          الإشعارات لهذا الموقع من إعدادات المتصفح ثم أعد تحميل الصفحة.
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ReturnType<typeof useNotificationPermission>["status"];
}) {
  switch (status) {
    case "granted":
      return (
        <Badge>
          <CheckCircle2 />
          مفعّلة
        </Badge>
      );
    case "denied":
      return (
        <Badge variant="destructive">
          <ShieldX />
          مرفوضة
        </Badge>
      );
    case "unsupported":
      return <Badge variant="outline">غير مدعومة على هذا المتصفح</Badge>;
    case "default":
    default:
      return <Badge variant="secondary">لم يُطلب الإذن بعد</Badge>;
  }
}

function statusDescription(
  status: ReturnType<typeof useNotificationPermission>["status"]
): string {
  switch (status) {
    case "granted":
      return "ستصلك تذكيرات الأذكار على هذا الجهاز.";
    case "denied":
      return "لن تصل تذكيرات لهذا الجهاز حتى تُغيّر الإذن من إعدادات المتصفح.";
    case "unsupported":
      return "هذا المتصفح أو الجهاز لا يدعم إشعارات الويب حاليًا.";
    case "default":
    default:
      return "لم تفعّل الإشعارات على هذا الجهاز بعد.";
  }
}
