/**
 * Africa/Cairo wall-clock helpers built on `Intl`, deliberately with no
 * manual UTC-offset arithmetic anywhere. `Intl.DateTimeFormat` resolves the
 * IANA "Africa/Cairo" zone at call time, so this keeps working correctly
 * even if Egypt's DST rules change again in the future — see
 * NOTIFICATIONS_PLAN.md section 12 for why that matters here.
 *
 * Server-only: used by the notification Cron Route Handlers to decide
 * "is it currently a valid moment to send this reminder" independently of
 * exactly when Vercel Cron happened to invoke the function.
 */

const CAIRO_TZ = "Africa/Cairo";

export interface CairoNow {
  /** Local calendar date in Africa/Cairo, YYYY-MM-DD. */
  date: string;
  hour: number;
  minute: number;
  /** Minutes since local midnight — convenient for window comparisons. */
  minutesSinceMidnight: number;
}

/** Reads the current Cairo local date/time via Intl (no offset math). */
export function nowInCairo(): CairoNow {
  return cairoPartsFor(new Date());
}

/** Same as `nowInCairo`, but for an arbitrary instant — used to convert an
 *  `adhan` prayer-time `Date` (absolute UTC instant) into Cairo wall-clock
 *  parts for comparison against `nowInCairo()`. */
export function cairoPartsFor(instant: Date): CairoNow {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value])
  ) as Record<string, string>;

  const hour = Number(parts.hour) % 24; // Intl can format midnight as "24"
  const minute = Number(parts.minute);

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    minute,
    minutesSinceMidnight: hour * 60 + minute,
  };
}

/** Today's Africa/Cairo calendar date, YYYY-MM-DD — the value written into
 *  the `morning_state` / `evening_state` OneSignal tags. */
export function todayCairoDate(): string {
  return nowInCairo().date;
}

/** Whether the current Cairo local time falls within [startMinutes,
 *  endMinutes] (inclusive), both expressed as minutes since local
 *  midnight. Used as the final, code-level guard against sending a
 *  reminder outside its period — independent of Vercel Cron's own timing
 *  (which can be off by up to 59 minutes on the Hobby plan). */
export function isWithinCairoWindow(
  startMinutes: number,
  endMinutes: number
): boolean {
  const { minutesSinceMidnight } = nowInCairo();
  return (
    minutesSinceMidnight >= startMinutes && minutesSinceMidnight <= endMinutes
  );
}
