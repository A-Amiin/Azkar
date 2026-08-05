import { ImageResponse } from "next/og";

// Every icon size shares one geometric crescent mark — deliberately no
// Arabic glyph inside generated icons, since Satori's Arabic text-shaping
// is unreliable at small sizes. `id` selects the size/variant; "maskable"
// keeps the mark within the ~70% safe zone platforms use for adaptive
// icons (Android, dark backdrop), the others use an opaque light backdrop
// (same recipe as app/apple-icon.tsx) so they also read well as a plain
// favicon/browser-tab icon — a transparent backdrop made the light cutout
// dominate the shape instead of the green crescent.
const ICONS = {
  "icon-32": { width: 32, height: 32 },
  "icon-192": { width: 192, height: 192 },
  "icon-512": { width: 512, height: 512 },
  "icon-512-maskable": { width: 512, height: 512 },
} as const;

type IconId = keyof typeof ICONS;

export function generateImageMetadata() {
  return (Object.keys(ICONS) as IconId[]).map((id) => ({
    id,
    size: ICONS[id],
    contentType: "image/png" as const,
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = (await id) as IconId;
  const size = ICONS[iconId];
  const isMaskable = iconId === "icon-512-maskable";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isMaskable ? "#2D6A4F" : "#D8F3DC",
        }}
      >
        <div
          style={{
            width: isMaskable ? "70%" : "62%",
            height: isMaskable ? "70%" : "62%",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #2D6A4F, #52B788)",
            display: "flex",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "85%",
              height: "85%",
              borderRadius: "9999px",
              background: isMaskable ? "#2D6A4F" : "#D8F3DC",
              top: "-8%",
              insetInlineEnd: "-8%",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
