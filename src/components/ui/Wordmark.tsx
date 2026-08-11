import Link from "next/link";
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
  className?: string;
};

/** Two-tone lockup: "inbox" in the UI sans, "OS" in the marketing serif. The
 *  split is the mark — it carries the brand without needing a colored bold
 *  word, so it stays legible at sidebar size and holds up at footer size.
 *
 *  The lockup is lowercase for design reasons, but the registered application
 *  name is `APP_NAME` ("InboxOS") — that is what the Google OAuth consent screen
 *  says, and screen readers and crawlers should agree with it. So the styled
 *  glyphs are hidden from the accessibility tree and the real name is exposed
 *  alongside them. */
export default function Wordmark({ size = "md", href = "/", className = "" }: Props) {
  const inner = (
    <span className={`${SIZES[size]} font-medium text-ink ${className}`}>
      <span aria-hidden="true">
        inbox<span className="font-serif font-semibold text-accent">OS</span>
      </span>
      <span className="sr-only">{APP_NAME}</span>
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
