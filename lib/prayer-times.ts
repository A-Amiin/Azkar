/**
 * Today's Asr time in Cairo, computed locally via the `adhan` astronomical
 * calculation library — deliberately not a third-party Prayer Times HTTP
 * API (no network dependency/uptime risk inside a time-sensitive Cron
 * handler) and not a fixed clock time (Asr drifts by roughly 90 minutes
 * across the year). See NOTIFICATIONS_PLAN.md section 12.
 *
 * Server-only.
 */

import { Coordinates, CalculationMethod, Madhab, PrayerTimes } from "adhan";
import { cairoPartsFor } from "@/lib/cairo-time";

// Cairo city center. The evening-azkar window is wide (Asr through 22:00),
// so the few minutes of variation across Egypt from using one fixed point
// rather than the user's real location is immaterial — see
// NOTIFICATIONS_PLAN.md section 4, assumption #2.
const CAIRO_COORDINATES = new Coordinates(30.0444, 31.2357);

/** Minutes since Cairo local midnight for today's Asr prayer, per the
 *  Egyptian General Authority of Survey calculation method (the
 *  conventional method for Egypt) and the standard/Shafi Asr shadow rule —
 *  see NOTIFICATIONS_PLAN.md section 4, assumption #1. */
export function getTodayAsrCairoMinutes(): number {
  const params = CalculationMethod.Egyptian();
  params.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(CAIRO_COORDINATES, new Date(), params);
  return cairoPartsFor(prayerTimes.asr).minutesSinceMidnight;
}
