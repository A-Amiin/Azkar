import { BrandMark } from "@/components/shared/brand-mark";
import { SITE_NAME } from "@/lib/constants";

/**
 * A brief branded overlay shown while the page settles in. No timer and no
 * client JavaScript at all: the fade-out is a pure CSS animation that starts
 * the instant this paints (see `.splash-screen` in globals.css), so it
 * reflects "the page is ready" rather than gating on an arbitrary delay.
 * `pointer-events-none` from the very first frame means it can never trap
 * interaction even if something else goes wrong. Under
 * `prefers-reduced-motion` it's hidden outright instead of animated.
 */
export function SplashScreen() {
  return (
    <div aria-hidden="true" className="splash-screen">
      <BrandMark size={56} />
      <span className="text-lg font-semibold">{SITE_NAME}</span>
    </div>
  );
}
