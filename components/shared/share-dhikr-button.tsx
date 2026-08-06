"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Link2, Loader2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateDhikrShareImage } from "@/lib/share-image";
import { SITE_URL } from "@/lib/constants";
import { siteConfig } from "@/lib/metadata";
import type { Dhikr } from "@/types/azkar";

interface ShareDhikrButtonProps {
  dhikr: Dhikr;
}

/** Renders a shareable 9:16 image of the dhikr (see lib/share-image.ts) and
 *  hands it to the OS share sheet via the Web Share API — the only way a
 *  backend-less static site can reach WhatsApp/Instagram/Messenger Stories,
 *  since those "Stories" targets only pick up image shares, not plain text.
 *  Falls back to a manual sheet (download the image / copy the link / open
 *  WhatsApp directly) on browsers without file-sharing support (desktop). */
export function ShareDhikrButton({ dhikr }: ShareDhikrButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const shareText = `${dhikr.text.replace(/\*/g, " ").slice(0, 120)}\n\n${siteConfig.name}`;
  // Every dhikr shares the public app homepage. Individual dhikr routes do
  // not exist yet, so generating a per-item URL would create broken links.
  const shareUrl = SITE_URL;

  const openFallback = (blob: Blob) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setFallbackImageUrl(url);
    setFallbackOpen(true);
  };

  const handleShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const blob = await generateDhikrShareImage(dhikr);
      const file = new File([blob], "zekr.png", { type: "image/png" });
      const shareData = { title: siteConfig.name, text: shareText, url: shareUrl, files: [file] };

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.share) {
        // Level-1 Web Share (no file support): still reaches WhatsApp/
        // Messenger as a text share, just not Instagram/Messenger Stories.
        await navigator.share({ title: siteConfig.name, text: shareText, url: shareUrl });
        return;
      }

      openFallback(blob);
    } catch (error) {
      // AbortError = the user closed the native share sheet — not an error.
      if (error instanceof Error && error.name === "AbortError") return;

      toast.error("تعذّرت المشاركة المباشرة، جرّب الخيارات اليدوية");
      try {
        const blob = await generateDhikrShareImage(dhikr);
        openFallback(blob);
      } catch {
        // Image generation itself failed — nothing more we can offer.
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ الرابط");
    } catch {
      toast.error("تعذّر نسخ الرابط");
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              disabled={isGenerating}
              aria-label="مشاركة هذا الذكر"
              onClick={handleShare}
              className="absolute bottom-3 left-3 z-10 rounded-full shadow-sm"
            />
          }
        >
          {isGenerating ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <Share2 aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent>مشاركة هذا الذكر</TooltipContent>
      </Tooltip>

      <Sheet open={fallbackOpen} onOpenChange={setFallbackOpen}>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>مشاركة الذكر</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 pb-4">
            {fallbackImageUrl ? (
              <a
                href={fallbackImageUrl}
                download="zekr.png"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => setFallbackOpen(false)}
              >
                <Download aria-hidden="true" className="size-4" />
                تنزيل الصورة
              </a>
            ) : null}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium"
              onClick={() => setFallbackOpen(false)}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              مشاركة عبر واتساب
            </a>

            <Button type="button" variant="outline" onClick={handleCopyLink} className="gap-2">
              <Link2 aria-hidden="true" className="size-4" />
              نسخ الرابط
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
