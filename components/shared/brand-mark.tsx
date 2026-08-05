interface BrandMarkProps {
  size?: number;
  className?: string;
}

/** The app's mark: a simple geometric crescent, hand-authored as inline SVG
 *  (kept visually consistent with, but not code-shared with, the Satori-
 *  rendered icon routes in app/icon.tsx — Satori's JSX/CSS subset differs
 *  from regular DOM SVG). No Arabic glyph is used here either, for the same
 *  small-size legibility reason as the generated icons. */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="brand-mark-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#2D6A4F" />
          <stop offset="1" stopColor="#52B788" />
        </linearGradient>
        <mask id="brand-mark-crescent">
          <rect width="32" height="32" fill="white" />
          <circle cx="20" cy="10" r="14" fill="black" />
        </mask>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="16"
        fill="url(#brand-mark-gradient)"
        mask="url(#brand-mark-crescent)"
      />
    </svg>
  );
}
