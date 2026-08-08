/**
 * Minimal hand-written typings for the OneSignal Web SDK v16 (loaded from
 * the CDN, not an npm package — see components/providers/onesignal-init.tsx).
 * Only covers the surface this app actually calls. Property names verified
 * against OneSignal's public docs/examples as of 2026-08-08; the exact
 * shape of `PushSubscription` should be double-checked against a real
 * OneSignal app during initial testing (NOTIFICATIONS_PLAN.md section 23).
 */

export {};

interface OneSignalTags {
  [key: string]: string;
}

interface OneSignalPushSubscription {
  id: string | null;
  optedIn: boolean;
}

interface OneSignalUserNamespace {
  addTag(key: string, value: string): void;
  addTags(tags: OneSignalTags): void;
  removeTag(key: string): void;
  removeTags(keys: string[]): void;
  getTags(): Promise<OneSignalTags>;
  PushSubscription: OneSignalPushSubscription;
}

interface OneSignalNotificationsNamespace {
  /** Whether the user is currently opted in (permission granted AND
   *  subscribed). */
  permission: boolean;
  requestPermission(): Promise<boolean>;
}

export interface OneSignalSDK {
  init(options: {
    appId: string;
    serviceWorkerPath?: string;
    serviceWorkerParam?: { scope: string };
  }): Promise<void>;
  User: OneSignalUserNamespace;
  Notifications: OneSignalNotificationsNamespace;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<
      (oneSignal: OneSignalSDK) => void | Promise<void>
    >;
    OneSignal?: OneSignalSDK;
  }
}
