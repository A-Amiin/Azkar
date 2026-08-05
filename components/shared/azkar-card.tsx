"use client";

import { BookOpenText, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AzkarCounter } from "@/components/shared/azkar-counter";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import type { Dhikr } from "@/types/azkar";

const CATEGORY_LABEL: Record<Dhikr["category"], string> = {
  quran: "قرآن",
  sunnah: "سنة",
};

interface AzkarCardCounter {
  current: number;
  onIncrement: () => void;
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

  const CategoryIcon = dhikr.category === "quran" ? BookOpenText : MessageCircle;
  const verses = dhikr.text.split("*").map((verse) => verse.trim());

  return (
    <Card className="scroll-mt-20">
      {/* `contents` removes this element from the box model so CardHeader/
          CardContent/CardFooter remain direct flex participants of Card's
          own flex/gap layout, while keeping <article> in the DOM/a11y tree
          as the card's semantic boundary. */}
      <article
        aria-label={`${CATEGORY_LABEL[dhikr.category]}: ${dhikr.text.slice(0, 40)}...`}
        className="contents"
      >
        <CardHeader className="flex-row items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1">
            <CategoryIcon aria-hidden="true" />
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

        <CardContent className="flex flex-col gap-3">
          <p className="text-lg leading-loose text-foreground sm:text-xl">
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
          </p>

          {dhikr.hadith ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {dhikr.hadith}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="justify-end">
          {counter ? (
            <AzkarCounter
              current={counter.current}
              target={dhikr.count}
              onIncrement={counter.onIncrement}
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
