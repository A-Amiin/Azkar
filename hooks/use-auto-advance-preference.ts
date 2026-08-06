"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  STORAGE_KEYS,
  type AutoAdvancePreferenceSchemaV1,
} from "@/lib/storage";

const DEFAULT_PREFERENCE: AutoAdvancePreferenceSchemaV1 = {
  version: 1,
  enabled: true,
};

export function useAutoAdvancePreference() {
  const [preference, setPreference] = useLocalStorage(
    STORAGE_KEYS.autoAdvance,
    DEFAULT_PREFERENCE
  );

  const setEnabled = (enabled: boolean) => {
    setPreference({ version: 1, enabled });
  };

  return { enabled: preference.enabled, setEnabled };
}
