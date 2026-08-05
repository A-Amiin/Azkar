"use client";

import { Check, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useThemePreference } from "@/hooks/use-theme-preference";
import type { ThemePreference } from "@/lib/storage";
import { cn } from "@/lib/utils";

const THEMES: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
  colors: string[];
}> = [
  {
    value: "light",
    label: "فاتح",
    description: "خلفية فاتحة ونصوص خضراء داكنة.",
    icon: Sun,
    colors: ["#d8f3dc", "#ffffff", "#52b788", "#081c15"],
  },
  {
    value: "dark",
    label: "داكن",
    description: "خلفية Evergreen وبطاقات Pine Teal.",
    icon: Moon,
    colors: ["#081c15", "#1b4332", "#52b788", "#d8f3dc"],
  },
];

export function ThemePicker() {
  const { theme, setTheme } = useThemePreference();

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="مظهر التطبيق">
      {THEMES.map((option) => {
        const selected = theme === option.value;
        const Icon = option.icon;

        return (
          <Card
            key={option.value}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => setTheme(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setTheme(option.value);
              }
            }}
            className={cn(
              "cursor-pointer transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
              selected && "ring-2 ring-primary"
            )}
          >
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    selected && "border-primary bg-primary text-primary-foreground"
                  )}
                  aria-hidden="true"
                >
                  {selected ? <Check className="size-4" /> : null}
                </span>
              </div>

              <div className="flex overflow-hidden rounded-full" aria-hidden="true">
                {option.colors.map((color) => (
                  <span key={color} className="h-5 flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
