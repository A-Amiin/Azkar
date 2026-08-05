"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  STORAGE_KEYS,
  type CounterPreferenceSchemaV1,
  type CounterStyle,
} from "@/lib/storage";

const DEFAULT_PREFERENCE: CounterPreferenceSchemaV1 = {
  version: 1,
  style: "compact",
};

export function useCounterPreference() {
  const [preference, setPreference] = useLocalStorage(
    STORAGE_KEYS.counterPreference,
    DEFAULT_PREFERENCE
  );

  const setStyle = (style: CounterStyle) => {
    setPreference({ version: 1, style });
  };

  return { style: preference.style, setStyle };
}
