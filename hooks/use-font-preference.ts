"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  STORAGE_KEYS,
  type FontPreferenceSchemaV1,
  type FontSizePreference,
} from "@/lib/storage";

const DEFAULT_PREFERENCE: FontPreferenceSchemaV1 = {
  version: 1,
  size: "medium",
};

export function useFontPreference() {
  const [preference, setPreference] = useLocalStorage(
    STORAGE_KEYS.fontPreference,
    DEFAULT_PREFERENCE
  );

  const setSize = (size: FontSizePreference) => {
    setPreference({ version: 1, size });
  };

  return { size: preference.size, setSize };
}
