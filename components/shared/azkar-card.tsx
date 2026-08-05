"use client";

import { BookOpenText, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AzkarCounter } from "@/components/shared/azkar-counter";
import { useAzkarProgress } from "@/hooks/use-azkar-progress";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import type { AzkarPeriod, Dhikr } from "@/types/azkar";

const CATEGORY_LABEL: Record<Dhikr["category"], string> = {
  quran: "قرآن",
  sunnah: "سنة",
};

interface AzkarCardProps {
  dhikr: Dhikr;
  /** When set, renders a tappable repetition counter (morning/evening
   *  reading views). When omitted (e.g. the favorites list), the required
   *  repetition count is shown as a static badge instead — favorites is a
   *  reference list, not a counting surface. */
  period?: AzkarPeriod;
}

export function AzkarCard({ dhikr, period }: AzkarCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(dhikr.id);

  // Only `getCount`/`increment` are used here — the single-item `items`
  // array means this call's own completedCount/totalCount are unused, but
  // it shares the same underlying storage key (and therefore live sync)
  // with the period's <AzkarProgress> aggregate bar.
  const { getCount, increment } = useAzkarProgress(
    period ?? "morning",
    period ? [{ id: dhikr.id, count: dhikr.count }] : []
  );

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
          {period ? (
            <AzkarCounter
              current={getCount(dhikr.id)}
              target={dhikr.count}
              onIncrement={() => increment(dhikr.id, dhikr.count)}
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
