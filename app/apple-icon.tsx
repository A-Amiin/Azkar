import { ImageResponse } from "next/og";

// Required under output: "export" — without generateImageMetadata's
// implicit static params, this route needs an explicit static marker.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same crescent mark as app/icon.tsx (a dark circle with a bite the same
// color as the background, reading as a crescent), but on an opaque
// Frosted Mint background — iOS applies its own rounded-corner mask, and a
// transparent apple-touch-icon renders as black on iOS, so this must be
// edge-to-edge opaque.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D8F3DC",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "62%",
            height: "62%",
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
