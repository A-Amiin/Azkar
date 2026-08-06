"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFontPreference } from "@/hooks/use-font-preference";
import type { FontSizePreference } from "@/lib/storage";

const FONT_OPTIONS: Array<{
  value: FontSizePreference;
  label: string;
  pixels: number;
}> = [
  { value: "small", label: "صغير", pixels: 16 },
  { value: "medium", label: "متوسط", pixels: 18 },
  { value: "large", label: "كبير", pixels: 20 },
  { value: "xlarge", label: "كبير جدًا", pixels: 22 },
  { value: "xxlarge", label: "الأكبر", pixels: 24 },
];

export function FontSizePicker() {
  const { size, setSize } = useFontPreference();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="font-size-select" className="text-sm font-medium">
        اختر حجم الخط
      </label>
      <Select
        value={size}
        onValueChange={(value) => setSize(value as FontSizePreference)}
      >
        <SelectTrigger id="font-size-select" className="w-full sm:max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {FONT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label} — {option.pixels}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
