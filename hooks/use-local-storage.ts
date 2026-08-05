"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStorage, subscribeToStorage, writeStorage, type StorageKey, type StorageSchemaMap } from "@/lib/storage";

type Updater<T> = T | ((previous: T) => T);

/**
 * Versioned, hydration-safe localStorage primitive. Built on
 * `useSyncExternalStore` so the server snapshot is always `defaultValue` —
 * server-rendered HTML never touches `localStorage`, which rules out
 * hydration mismatches structurally instead of needing a manual "mounted"
 * flag dance.
 */
export function useLocalStorage<K extends StorageKey>(
  key: K,
  defaultValue: StorageSchemaMap[K]
): [StorageSchemaMap[K], (updater: Updater<StorageSchemaMap[K]>) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToStorage(key, onStoreChange),
    [key]
  );

  const getSnapshot = useCallback(
    () => readStorage(key, defaultValue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (updater: Updater<StorageSchemaMap[K]>) => {
      const next =
        typeof updater === "function"
          ? (updater as (previous: StorageSchemaMap[K]) => StorageSchemaMap[K])(
              readStorage(key, defaultValue)
            )
          : updater;
      writeStorage(key, next);
    },
    [key, defaultValue]
  );

  return [value, setValue];
}
