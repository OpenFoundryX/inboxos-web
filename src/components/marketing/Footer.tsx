import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import { LEGAL } from "@/lib/legal";

/** `href: null` means the page doesn't exist yet. Those render as plain text
 *  rather than links — a link that lands somewhere unrelated is worse than no
 *  link, and pointing them all at /login was exactly that. */
type FooterLink = { label: string; href: string | null; external?: boolean };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "Compare plans", href: "/#compare" },
      { label: "Security", href: "/privacy#security" },
    ],
  },
  {
    title: "How it works",
    links: [
      { label: "Delivery schedule", href: "/#how" },
      { label: "Sorting", href: "/#how" },
      { label: "Drafting", href: "/#how" },
      { label: "Meeting notes", href: "/#how" },
      { label: "Scheduling agent", href: "/#how" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Book a call", href: LEGAL.bookingUrl, external: true },
      { label: "About", href: null },
      { label: "Blog", href: null },
      { label: "Careers", href: null },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/privacy#cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink/60">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm text-ink/70 hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : link.href ? (
                      <Link
                        href={link.href}
                        className="text-sm text-ink/70 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-ink/35">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-8 md:flex-row md:items-center">
          <Wordmark size="xl" />
          <div className="flex flex-col items-start gap-1 md:items-end">
            <p className="text-sm text-ink/50">
              © 2026 InboxOS, Inc. All rights reserved.
            </p>
            <p className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-ink/50 hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="text-ink/50 hover:text-ink">
                Terms
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
