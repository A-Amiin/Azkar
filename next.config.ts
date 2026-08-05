import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static content (all Azkar data is inlined at build time, no
  // Server Actions/cookies/dynamic routes anywhere), so a static export is
  // both sufficient and the simplest, most offline-friendly deploy target.
  // See ARCHITECTURE.md for the full rationale.
  output: "export",
  // Every route resolves to a real .../index.html under a folder (e.g.
  // out/morning/index.html served at /morning/) instead of /morning.html —
  // keeps the service worker's precache URL list unambiguous regardless of
  // how the static host rewrites clean URLs.
  trailingSlash: true,
  // next/image's default loader needs a running server; nothing in this
  // app uses next/image today (icons are generated routes, not images),
  // but this prevents a silent future build failure if one ever is added
  // under output: "export".
  images: { unoptimized: true },
};

export default nextConfig;
