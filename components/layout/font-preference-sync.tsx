"use client";

import { useEffect } from "react";
import { useFontPreference } from "@/hooks/use-font-preference";

/** Keeps the selected root font size active on every route. All Tailwind
 * rem-based typography and spacing then scale proportionally, preserving
 * the visual hierarchy between body text, labels, and headings. */
export function FontPreferenceSync() {
  const { size } = useFontPreference();

  useEffect(() => {
    document.documentElement.dataset.fontSize = size;
  }, [size]);

  return null;
}
