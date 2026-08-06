import { SITE_NAME } from "@/lib/constants";
import type { Dhikr } from "@/types/azkar";

/**
 * Renders a single dhikr as a shareable 1080×1920 (9:16) PNG image, drawn
 * entirely client-side via the Canvas API.
 *
 * Why canvas instead of the app's existing Satori/ImageResponse icons
 * (app/icon.tsx, app/opengraph-image.tsx)? Those only run at *build time*
 * on the server as Next.js metadata routes — this app has no backend and
 * no per-request server (output: "export"), so there is nowhere to
 * generate a per-dhikr image on demand except the browser itself. Canvas
 * is the only viable client-only image-generation primitive.
 *
 * The 9:16 aspect ratio is deliberate: Instagram Stories, Facebook/
 * Messenger Stories, and WhatsApp Status all expect vertical full-bleed
 * media — sharing this exact ratio avoids letterboxing when a recipient
 * app picks it up as a Story.
 */

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const COLORS = {
  frostedMint: "#D8F3DC",
  celadonLight: "#B7E4C7",
  celadon: "#95D5B2",
  mintLeafLight: "#74C69D",
  mintLeaf: "#52B788",
  seaGreen: "#40916C",
  darkEmerald: "#2D6A4F",
  pineTeal: "#1B4332",
  evergreen: "#081C15",
  surface: "#FFFFFF",
};

const CATEGORY_LABEL: Record<Dhikr["category"], string> = {
  quran: "قرآن",
  sunnah: "سنة",
};

/** Waits for the app's self-hosted Tajawal font to actually be loaded —
 *  canvas text silently falls back to a generic font (no error) if drawn
 *  before the webfont is ready. */
async function ensureFontsReady() {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.load("700 52px Tajawal");
      await document.fonts.load("400 32px Tajawal");
      await document.fonts.ready;
    } catch {
      // Best-effort — drawing still proceeds with whatever font is available.
    }
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && ctx.measureText(candidate).width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawCrescent(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  const gradient = ctx.createLinearGradient(
    centerX - radius,
    centerY - radius,
    centerX + radius,
    centerY + radius
  );
  gradient.addColorStop(0, COLORS.darkEmerald);
  gradient.addColorStop(1, COLORS.mintLeaf);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // "Cut" a crescent by painting a second circle in the background color —
  // same trick used by app/icon.tsx (no canvas clip needed, since the
  // background behind it is a flat known color).
  ctx.beginPath();
  ctx.arc(centerX + radius * 0.32, centerY - radius * 0.32, radius * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.frostedMint;
  ctx.fill();
}

interface ContentLayout {
  fontSize: {
    dhikr: number;
    hadith: number;
  };
  dhikrLines: string[];
  hadithLines: string[];
  contentHeight: number;
}

/** Picks the largest font size (within a sensible range) whose wrapped
 *  text still fits the card's available height, so long duas shrink to
 *  fit instead of ever being truncated. */
function fitContent(
  ctx: CanvasRenderingContext2D,
  dhikrText: string,
  hadithText: string | null,
  maxWidth: number,
  maxHeight: number
): ContentLayout {
  const sizes = [52, 48, 44, 40, 36, 32, 28];

  for (const dhikrSize of sizes) {
    const hadithSize = Math.round(dhikrSize * 0.62);
    const dhikrLineHeight = dhikrSize * 1.5;
    const hadithLineHeight = hadithSize * 1.5;

    ctx.font = `700 ${dhikrSize}px Tajawal, sans-serif`;
    const dhikrLines = wrapText(ctx, dhikrText, maxWidth);

    let hadithLines: string[] = [];
    if (hadithText) {
      ctx.font = `400 ${hadithSize}px Tajawal, sans-serif`;
      hadithLines = wrapText(ctx, hadithText, maxWidth);
    }

    const dividerGap = hadithText ? 56 : 0;
    const contentHeight =
      dhikrLines.length * dhikrLineHeight +
      dividerGap +
      hadithLines.length * hadithLineHeight;

    if (contentHeight <= maxHeight || dhikrSize === sizes[sizes.length - 1]) {
      return {
        fontSize: { dhikr: dhikrSize, hadith: hadithSize },
        dhikrLines,
        hadithLines,
        contentHeight,
      };
    }
  }

  // Unreachable (loop always returns on its last iteration), but keeps TS happy.
  throw new Error("fitContent: no size resolved");
}

export async function generateDhikrShareImage(dhikr: Dhikr): Promise<Blob> {
  await ensureFontsReady();

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذّر إنشاء صورة المشاركة");

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Background wash.
  const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGradient.addColorStop(0, COLORS.frostedMint);
  bgGradient.addColorStop(1, COLORS.celadonLight);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Brand header.
  const brandCenterX = CANVAS_WIDTH / 2;
  drawCrescent(ctx, brandCenterX, 190, 64);
  ctx.fillStyle = COLORS.evergreen;
  ctx.font = "700 40px Tajawal, sans-serif";
  ctx.fillText(SITE_NAME, brandCenterX, 320);

  // Card geometry.
  const cardX = 80;
  const cardWidth = CANVAS_WIDTH - cardX * 2;
  const cardTop = 400;
  const cardBottomLimit = CANVAS_HEIGHT - 220;
  const cardPaddingX = 64;
  const cardPaddingY = 80;
  const textMaxWidth = cardWidth - cardPaddingX * 2;
  const maxContentHeight = cardBottomLimit - cardTop - cardPaddingY * 2 - 70; // reserve for badge

  const layout = fitContent(
    ctx,
    dhikr.text.replace(/\*/g, " "),
    dhikr.hadith,
    textMaxWidth,
    maxContentHeight
  );

  const cardHeight = Math.min(
    cardBottomLimit - cardTop,
    layout.contentHeight + cardPaddingY * 2 + 70
  );
  const cardY = cardTop + Math.max(0, (cardBottomLimit - cardTop - cardHeight) / 2);

  // Card background with a soft shadow.
  ctx.save();
  ctx.shadowColor = "rgba(8, 28, 21, 0.18)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
  ctx.fillStyle = COLORS.surface;
  ctx.fill();
  ctx.restore();

  // Category badge.
  const badgeText = CATEGORY_LABEL[dhikr.category];
  ctx.font = "700 28px Tajawal, sans-serif";
  const badgePaddingX = 28;
  const badgeWidth = ctx.measureText(badgeText).width + badgePaddingX * 2;
  const badgeHeight = 56;
  const badgeX = brandCenterX - badgeWidth / 2;
  const badgeY = cardY + 44;
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fillStyle = COLORS.celadonLight;
  ctx.fill();
  ctx.fillStyle = COLORS.pineTeal;
  ctx.fillText(badgeText, brandCenterX, badgeY + badgeHeight / 2 + 10);

  // Dhikr + hadith text, vertically centered in the remaining card space.
  let cursorY =
    badgeY +
    badgeHeight +
    40 +
    Math.max(0, (cardHeight - (badgeHeight + 40 + layout.contentHeight) - 40) / 2);

  ctx.font = `700 ${layout.fontSize.dhikr}px Tajawal, sans-serif`;
  ctx.fillStyle = COLORS.evergreen;
  const dhikrLineHeight = layout.fontSize.dhikr * 1.5;
  for (const line of layout.dhikrLines) {
    cursorY += dhikrLineHeight;
    ctx.fillText(line, brandCenterX, cursorY - dhikrLineHeight * 0.28);
  }

  if (layout.hadithLines.length > 0) {
    cursorY += 24;
    ctx.strokeStyle = COLORS.celadonLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(brandCenterX - 80, cursorY);
    ctx.lineTo(brandCenterX + 80, cursorY);
    ctx.stroke();
    cursorY += 40;

    ctx.font = `400 ${layout.fontSize.hadith}px Tajawal, sans-serif`;
    ctx.fillStyle = COLORS.seaGreen;
    const hadithLineHeight = layout.fontSize.hadith * 1.5;
    for (const line of layout.hadithLines) {
      cursorY += hadithLineHeight;
      ctx.fillText(line, brandCenterX, cursorY - hadithLineHeight * 0.28);
    }
  }

  // Footer.
  ctx.font = "400 30px Tajawal, sans-serif";
  ctx.fillStyle = COLORS.darkEmerald;
  ctx.fillText("أذكار الصباح والمساء • اقرأ وتابع تقدّمك اليومي", brandCenterX, CANVAS_HEIGHT - 90);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("تعذّر إنشاء صورة المشاركة"))),
      "image/png",
      0.95
    );
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
