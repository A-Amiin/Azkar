import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shared across every route as the default Open Graph / Twitter card image.
// No text overlay: Satori (which ImageResponse renders through) needs an
// explicitly loaded font file to shape Arabic glyphs at all — without one,
// Arabic text silently renders as blank tofu — and each page's own
// title/description already carry the specific context in link previews,
// so the mark alone is enough here.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#D8F3DC",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #2D6A4F, #52B788)",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "85%",
              height: "85%",
              borderRadius: "9999px",
              background: "#D8F3DC",
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
