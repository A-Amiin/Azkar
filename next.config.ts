import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: this used to be `output: "export"` (see git history / ARCHITECTURE.md
  // for the original static-export rationale). It was dropped to add the
  // OneSignal notification system: sending push safely requires a server that
  // can hold the OneSignal REST API key and run on a schedule (Vercel Cron +
  // Route Handlers), which static export cannot host. See
  // NOTIFICATIONS_PLAN.md for the full architecture decision. Every existing
  // page has no dynamic APIs in it, so Next.js still prerenders all of them
  // at build time exactly as before — only the new `app/api/*` routes are
  // dynamic.
  //
  // Every route resolves to a real .../index.html under a folder (e.g.
  // out/morning/index.html served at /morning/) instead of /morning.html —
  // keeps the service worker's precache URL list unambiguous regardless of
  // how the static host rewrites clean URLs.
  trailingSlash: true,
  // next/image's default loader needs a running server; nothing in this
  // app uses next/image today (icons are generated routes, not images),
  // but this prevents a silent future build failure if one ever is added.
  images: { unoptimized: true },
};

export default nextConfig;
