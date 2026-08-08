import { createCronGetHandler } from "@/lib/cron-handler";

// See app/api/cron/morning-1/route.ts for the trailing-slash caveat that
// applies to all four of these routes.
export const GET = createCronGetHandler("morning-2");
