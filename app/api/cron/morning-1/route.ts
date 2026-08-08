import { createCronGetHandler } from "@/lib/cron-handler";

// Invoked once daily by Vercel Cron (see vercel.json). GET per Vercel's
// Cron convention. Reading `request.headers` (inside createCronGetHandler)
// opts this route out of static prerendering automatically — no route
// segment config needed.
//
// IMPORTANT: this project has `trailingSlash: true`, so
// /api/cron/morning-1 308-redirects to /api/cron/morning-1/ — and Vercel
// Cron does not follow redirects (confirmed via local smoke test: the
// no-slash URL never reaches this handler). vercel.json's cron `path`
// must include the trailing slash for all four of these routes, or the
// job silently never fires.
export const GET = createCronGetHandler("morning-1");
