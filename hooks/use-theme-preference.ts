"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  STORAGE_KEYS,
  type ThemePreference,
  type ThemePreferenceSchemaV1,
} from "@/lib/storage";

const DEFAULT_PREFERENCE: ThemePreferenceSchemaV1 = {
  version: 1,
  theme: "light",
};

export function useThemePreference() {
  const [preference, setPreference] = useLocalStorage(
    STORAGE_KEYS.themePreference,
    DEFAULT_PREFERENCE
  );

  const setTheme = (theme: ThemePreference) => {
    setPreference({ version: 1, theme });
  };

  return { theme: preference.theme, setTheme };
}
