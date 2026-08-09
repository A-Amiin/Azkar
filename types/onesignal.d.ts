/**
 * Minimal hand-written typings for the OneSignal Web SDK v16 (loaded from
 * the CDN, not an npm package — see components/providers/onesignal-init.tsx).
 * Only covers the surface this app actually calls. Verified directly
 * against the SDK's own TypeScript source
 * (OneSignal/OneSignal-Website-SDK, NotificationsNamespace.ts /
 * UserNamespace.ts) as of 2026-08-08 — notably getTags() is synchronous
 * (returns `{ [key: string]: string }` directly, not a Promise), unlike
 * an earlier version of this file assumed.
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
  /** Synchronous — returns the SDK's local cached copy of the tags, not a
   *  Promise. */
  getTags(): OneSignalTags;
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
    /** Lets Web Push register over plain HTTP on localhost/127.0.0.1 for
     *  local development — per OneSignal's official Web SDK setup guide.
     *  Never set true outside development. */
    allowLocalhostAsSecureOrigin?: boolean;
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
