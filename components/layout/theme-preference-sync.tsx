"use client";

import { useEffect } from "react";
import { useThemePreference } from "@/hooks/use-theme-preference";

export function ThemePreferenceSync() {
  const { theme } = useThemePreference();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
