import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";
import { APP_NAME } from "@/lib/app";

const SIZES = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
} as const;

type Props = {
  size?: keyof typeof SIZES;
  href?: string | null;
  /** Show the app icon beside the name. On for the surfaces a Google reviewer
   *  lands on — see the note below. */
  mark?: boolean;
  className?: string;
};

/** Two-tone lockup: "Inbox" in the UI sans, "OS" in the marketing serif. The
 *  split is the mark — it carries the brand without needing a colored bold
 *  word, so it stays legible at sidebar size and holds up at footer size.
 *
 *  The lockup used to set the name lowercase ("inboxOS") for design reasons,
 *  with the real `APP_NAME` tucked into an `sr-only` span alongside it. That
 *  cost more than it bought: Google's OAuth branding review compares the app
 *  name on the consent screen against the name shown on the home page, and a
 *  human reviewer reads the glyphs on screen, not the accessibility tree — so
 *  the page they saw said "inboxOS" while the consent screen said "InboxOS".
 *  Capitalising the I keeps the two-tone treatment and makes the visible text
 *  an exact match, which also lets the aria-hidden/sr-only pair go away. */
export default function Wordmark({
  size = "md",
  href = "/",
  mark = false,
  className = "",
}: Props) {
  const [head, tail] = [APP_NAME.slice(0, -2), APP_NAME.slice(-2)];

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      {mark && <LogoMark size={size} />}
      <span className={`${SIZES[size]} font-medium text-ink ${className}`}>
        {head}
        <span className="font-serif font-semibold text-accent">{tail}</span>
      </span>
    </span>
  );

  // Some surfaces (the onboarding wizard, the login card) show the mark as a
  // label rather than a way out, so linking has to be opt-out.
  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
