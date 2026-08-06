"use client";

import { BookOpenText, Heart } from "lucide-react";
import { UssunnahIcon } from "@/components/icons/ussunnah-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AzkarCounter } from "@/components/shared/azkar-counter";
import { useFavorites } from "@/hooks/use-favorites";
import { useCounterPreference } from "@/hooks/use-counter-preference";
import { cn } from "@/lib/utils";
import type { Dhikr } from "@/types/azkar";

const CATEGORY_LABEL: Record<Dhikr["category"], string> = {
  quran: "قرآن",
  sunnah: "سنة",
};

interface AzkarCardCounter {
  current: number;
  onIncrement: () => void;
  onFill: () => void;
  onReset: () => void;
}

interface AzkarCardProps {
  dhikr: Dhikr;
  /** Present on /morning and /evening (owned by that route's progress
   *  hook and threaded down as a prop) to show a tappable counter. Absent
   *  on /favorites, where the required repetition count is shown as a
   *  static badge instead — favorites is a reference list, not a counting
   *  surface. Keeping this a plain prop (rather than the card calling a
   *  progress hook itself) is what makes this component reusable across
   *  all three routes without knowing which period it's in. */
  counter?: AzkarCardCounter;
}

export function AzkarCard({ dhikr, counter }: AzkarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(dhikr.id);
  const { style: counterStyle } = useCounterPreference();

  const verses = dhikr.text.split("*").map((verse) => verse.trim());

  return (
    <Card className="h-[520px] w-full scroll-mt-20 sm:h-[440px]">
      {/* `contents` removes this element from the box model so CardHeader/
          CardContent/CardFooter remain direct flex participants of Card's
          own flex/gap layout, while keeping <article> in the DOM/a11y tree
          as the card's semantic boundary. */}
      <article
        aria-label={`${CATEGORY_LABEL[dhikr.category]}: ${dhikr.text.slice(0, 40)}...`}
        className="contents"
      >
        <CardHeader className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1">
            {dhikr.category === "quran" ? (
              <BookOpenText aria-hidden="true" />
            ) : (
              <UssunnahIcon aria-hidden="true" className="size-5" />
            )}
            {CATEGORY_LABEL[dhikr.category]}
          </Badge>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={favorite}
                  aria-label={favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  onClick={() => toggleFavorite(dhikr.id)}
                />
              }
            >
              <Heart
                aria-hidden="true"
                className={cn(favorite && "fill-current text-destructive")}
              />
            </TooltipTrigger>
            <TooltipContent>
              {favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            </TooltipContent>
          </Tooltip>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col justify-center gap-3">
            <p className="text-center text-lg leading-loose text-foreground [html[data-theme=dark]_&]:text-white sm:text-xl">
              <span aria-hidden="true">﴿ </span>
              {verses.map((verse, index) => (
                <span key={index}>
                  {verse}
                  {index < verses.length - 1 ? (
                    <span className="mx-1 text-primary" aria-hidden="true">
                      ۝
                    </span>
                  ) : null}
                </span>
              ))}
              <span aria-hidden="true"> ﴾</span>
            </p>

            {dhikr.hadith ? (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground [html[data-theme=dark]_&]:text-white">
                {dhikr.hadith}
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className={cn(counter ? "justify-center" : "justify-end")}>
          {counter ? (
            <AzkarCounter
              current={counter.current}
              target={dhikr.count}
              onIncrement={counter.onIncrement}
              onFill={counter.onFill}
              onReset={counter.onReset}
              style={counterStyle}
              label={dhikr.text.slice(0, 40)}
            />
          ) : (
            <Badge variant="outline" aria-label={`عدد التكرار: ${dhikr.count}`}>
              ×{dhikr.count}
            </Badge>
          )}
        </CardFooter>
      </article>
    </Card>
  );
}
