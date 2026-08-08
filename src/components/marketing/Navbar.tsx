import Link from "next/link";
import Button from "@/components/ui/Button";
import Wordmark from "@/components/ui/Wordmark";
import { LEGAL } from "@/lib/legal";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#compare", label: "Compare plans" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/5 bg-card px-5 py-3 shadow-sm mt-4">
        <Wordmark size="md" />
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-ink/80 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {/* Goes to the calendar rather than to #talk. The section sits below
           *  the last scrollable position on a tall window, so a fragment link
           *  to it does nothing there — and the bar also renders on /privacy
           *  and /terms, where no #talk exists at all. A direct link works
           *  from every page and every viewport. */}
          <a
            href={LEGAL.bookingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-medium text-ink/80 hover:text-ink"
          >
            Book a call
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" href="/login">
            Log in
          </Button>
          <Button variant="primary" href="/login">
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
}
