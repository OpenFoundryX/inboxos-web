import Link from "next/link";

const COLS: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Pricing", "Features", "Security"] },
  { title: "How it works", links: ["Inbox organizer", "Draft writer", "Meeting companion"] },
  { title: "Company", links: ["About", "Blog", "Careers"] },
  { title: "Legal", links: ["Privacy policy", "Terms of service", "Cookie policy"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="/login" className="text-sm text-ink/70 hover:text-ink">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-8 md:flex-row md:items-center">
          <span className="text-4xl font-extrabold tracking-tight text-accent">
            InboxOS
          </span>
          <p className="text-sm text-ink/50">
            © 2026 InboxOS, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
