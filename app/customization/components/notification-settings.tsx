"use client";

import { BellRing, CheckCircle2, ShieldAlert, ShieldX, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/** Notification settings section for /customization/. This first version
 *  covers only the browser permission flow — enable/disable per-period
 *  reminders (morning_state/evening_state tags) is added on top of this
 *  once lib/use-notification-preference.ts lands, per
 *  NOTIFICATIONS_PLAN.md's phased rollout (section 24). Never requests
 *  permission on mount — only in response to the button's onClick. */
export function NotificationSettings() {
  const { status, isRequesting, error, requestPermission } =
    useNotificationPermission();
  const { isIOS, isStandalone } = usePwaInstall();

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
