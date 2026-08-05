"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { AzkarCounter } from "@/components/shared/azkar-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounterPreference } from "@/hooks/use-counter-preference";
import type { CounterStyle } from "@/lib/storage";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: CounterStyle;
  title: string;
  description: string;
}> = [
  {
    value: "compact",
    title: "العداد الدائري",
    description: "حلقة تقدّم دائرية تمتلئ مع كل ضغطة، وعلامة صح عند الاكتمال، وزر إعادة تصفير مجاور.",
  },
  {
    value: "balanced",
    title: "العداد المتوازن",
    description: "العدد في المنتصف، وبين زر مستقل للزيادة وزر لإعادة التصفير.",
  },
];

export function CounterStylePicker() {
  const { style, setStyle } = useCounterPreference();
  const [previewCounts, setPreviewCounts] = useState<Record<CounterStyle, number>>({
    compact: 3,
    balanced: 3,
  });

  const setPreview = (value: CounterStyle, count: number) => {
    setPreviewCounts((previous) => ({ ...previous, [value]: count }));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="شكل عداد التكرار">
      {OPTIONS.map((option) => {
        const selected = style === option.value;

        return (
          <Card
            key={option.value}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => setStyle(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setStyle(option.value);
              }
            }}
            className={cn(
              "cursor-pointer transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
              selected && "ring-2 ring-primary"
            )}
          >
            <CardHeader className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>{option.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{option.description}</p>
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
            </CardHeader>

            <CardContent onClick={(event) => event.stopPropagation()}>
              <div className="rounded-lg bg-muted p-4">
                <AzkarCounter
                  current={previewCounts[option.value]}
                  target={10}
                  style={option.value}
                  label={`معاينة ${option.title}`}
                  onIncrement={() =>
                    setPreview(option.value, Math.min(previewCounts[option.value] + 1, 10))
                  }
                  onReset={() => setPreview(option.value, 0)}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
