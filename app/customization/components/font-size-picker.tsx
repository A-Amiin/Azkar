"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFontPreference } from "@/hooks/use-font-preference";
import type { FontSizePreference } from "@/lib/storage";
import { cn } from "@/lib/utils";

const FONT_OPTIONS: Array<{
  value: FontSizePreference;
  label: string;
  pixels: number;
}> = [
  { value: "small", label: "صغير", pixels: 14 },
  { value: "medium", label: "متوسط", pixels: 16 },
  { value: "large", label: "كبير", pixels: 18 },
];

export function FontSizePicker() {
  const { size, setSize } = useFontPreference();

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      role="radiogroup"
      aria-label="حجم خط التطبيق"
    >
      {FONT_OPTIONS.map((option) => {
        const selected = size === option.value;

        return (
          <Card
            key={option.value}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => setSize(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSize(option.value);
              }
            }}
            className={cn(
              "cursor-pointer transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
              selected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.pixels}px</p>
              </div>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border",
                  selected && "border-primary bg-primary text-primary-foreground"
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="size-4" /> : null}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
