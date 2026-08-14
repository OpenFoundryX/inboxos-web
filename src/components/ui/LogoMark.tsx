const SIZES = {
  sm: 24,
  md: 28,
  lg: 34,
  xl: 44,
} as const;

type Props = {
  size?: keyof typeof SIZES;
  className?: string;
};

/** The app icon, inline. Kept byte-for-byte in step with `public/logo.svg` —
 *  that file is what the favicon and the Google OAuth consent screen upload are
 *  cut from, and Google's branding review checks the uploaded logo against the
 *  logo actually shown on the home page. Until this component existed the mark
 *  only ever appeared as a favicon, so there was nothing on the page for a
 *  reviewer to match it to.
 *
 *  Inline rather than an `<img src="/logo.svg">` so it paints with the first
 *  HTML response: the nav is the first thing above the fold and a mark that
 *  pops in a request later reads as a layout bug. It also keeps `next/image`
 *  out of the picture, which would need `dangerouslyAllowSVG` to serve this. */
export default function LogoMark({ size = "md", className = "" }: Props) {
  const px = SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Full-bleed rounded square rather than a floating glyph: the consent
       *  screen, favicons and app tiles all crop to a square, and a mark that
       *  already fills one survives every one of those without a second asset. */}
      <rect width="512" height="512" rx="116" fill="#1F6F5C" />
      {/* Strokes rather than fills: a filled glyph of this shape closes its
       *  counters and goes solid at favicon size. */}
      <g
        stroke="#FFFFFF"
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <rect x="104" y="128" width="304" height="256" rx="48" />
        {/* The dipped divider is what makes this an inbox rather than a box. */}
        <path d="M104 284 H180 L206 332 H306 L332 284 H408" />
      </g>
    </svg>
  );
}
