"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemePreference } from "@/hooks/use-theme-preference";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="default"
      size="icon-sm"
      onClick={() => setTheme(nextTheme)}
      aria-label={isDark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن"}
      title={isDark ? "المظهر الفاتح" : "المظهر الداكن"}
      className="relative shrink-0 overflow-hidden text-primary-foreground"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "scale-0 -rotate-180 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-180 opacity-0"
        )}
      />
    </Button>
  );
}
