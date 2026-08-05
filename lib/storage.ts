import type { AzkarPeriod } from "@/types/azkar";

/**
 * A single, versioned localStorage layer. Every read/write in the app goes
 * through here so a future schema change has one place to migrate from,
 * instead of scattering `JSON.parse(localStorage.getItem(...))` everywhere.
 */

export const STORAGE_KEYS = {
  favorites: "azkar:favorites",
  morningProgress: "azkar:progress:morning",
  eveningProgress: "azkar:progress:evening",
  counterPreference: "azkar:counter-preference",
  fontPreference: "azkar:font-preference",
  themePreference: "azkar:theme-preference",
  uiState: "azkar:ui-state",
} as const;

export interface FavoritesSchemaV1 {
  version: 1;
  ids: string[];
}

export interface ProgressSchemaV1 {
  version: 1;
  /** Local YYYY-MM-DD. A stored value whose date doesn't match "today" is
   *  treated as stale and overwritten — progress resets once per day by
   *  construction, with no array/history to prune. */
  date: string;
  counts: Record<string, number>;
}

export interface UiStateSchemaV1 {
  version: 1;
  installTipDismissed: boolean;
}

export type CounterStyle = "compact" | "balanced";

export interface CounterPreferenceSchemaV1 {
  version: 1;
  style: CounterStyle;
}

export type FontSizePreference = "small" | "medium" | "large";

export interface FontPreferenceSchemaV1 {
  version: 1;
  size: FontSizePreference;
}

export type ThemePreference = "light" | "dark";

export interface ThemePreferenceSchemaV1 {
  version: 1;
  theme: ThemePreference;
}

export interface StorageSchemaMap {
  [STORAGE_KEYS.favorites]: FavoritesSchemaV1;
  [STORAGE_KEYS.morningProgress]: ProgressSchemaV1;
  [STORAGE_KEYS.eveningProgress]: ProgressSchemaV1;
  [STORAGE_KEYS.counterPreference]: CounterPreferenceSchemaV1;
  [STORAGE_KEYS.fontPreference]: FontPreferenceSchemaV1;
  [STORAGE_KEYS.themePreference]: ThemePreferenceSchemaV1;
  [STORAGE_KEYS.uiState]: UiStateSchemaV1;
}

export type StorageKey = keyof StorageSchemaMap;
type SchemaMap = StorageSchemaMap;

const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

/** Subscribes to changes for one storage key, both from writes made in this
 *  tab (via `writeStorage`, which the native `storage` event never reports
 *  in the tab that made the change) and from other tabs (native `storage`
 *  event). Returns an unsubscribe function. */
export function subscribeToStorage(key: StorageKey, listener: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);

  const onStorageEvent = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorageEvent);

  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener("storage", onStorageEvent);
  };
}

// `useSyncExternalStore` requires `getSnapshot` to return a referentially
// stable value when nothing has changed (otherwise React re-renders in a
// loop). `JSON.parse`-ing on every call would always return a new object,
// so parsed values are cached here, keyed by the raw string currently in
// localStorage — the cached object is only replaced when the raw string
// actually changes (same-tab write, or another tab's write reflected via
// the native `storage` event).
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

export function readStorage<K extends StorageKey>(
  key: K,
  fallback: SchemaMap[K]
): SchemaMap[K] {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as SchemaMap[K];
  }

  let value: SchemaMap[K] = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SchemaMap[K];
      if (parsed?.version === fallback.version) value = parsed;
    } catch {
      value = fallback;
    }
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

export function writeStorage<K extends StorageKey>(
  key: K,
  value: SchemaMap[K]
): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(value);
  window.localStorage.setItem(key, raw);
  snapshotCache.set(key, { raw, value });
  notify(key);
}

export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function progressKeyForPeriod(
  period: AzkarPeriod
): typeof STORAGE_KEYS.morningProgress | typeof STORAGE_KEYS.eveningProgress {
  return period === "morning"
    ? STORAGE_KEYS.morningProgress
    : STORAGE_KEYS.eveningProgress;
}
