import Link from "next/link";
import type { ReactNode } from "react";

/** A miniature of a meeting note, standing in for the notetaker. */
function MeetingNotePreview() {
  return (
    <div className="flex w-full max-w-[15rem] items-center gap-3 rounded-xl border border-black/5 bg-card px-3 py-2.5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-canvas">
        <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-ink/40">Jan</span>
        <span className="text-sm font-bold leading-none text-ink">16</span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-bold text-ink">Weekly Team Sync</div>
        <div className="text-[0.65rem] text-ink/45">09:30 - 10:00</div>
      </div>
    </div>
  );
}

const LABELS = [
  { text: "To respond", tone: "bg-accent/15 text-accent", bar: "w-24" },
  { text: "FYI", tone: "bg-ink/10 text-ink/55", bar: "w-16" },
  { text: "Meeting", tone: "bg-accent/10 text-accent/80", bar: "w-20" },
  { text: "Newsletter", tone: "bg-ink/[0.07] text-ink/45", bar: "w-14" },
];

/** A miniature of a labelled inbox, standing in for categorization. */
function InboxPreview() {
  return (
    <div className="w-full max-w-[15rem] space-y-1.5 rounded-xl border border-black/5 bg-card p-3 shadow-sm">
      {LABELS.map((l) => (
        <div key={l.text} className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[0.55rem] font-semibold ${l.tone}`}
          >
            {l.text}
          </span>
          <span className={`h-1.5 rounded-full bg-ink/[0.07] ${l.bar}`} />
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  href,
  title,
  preview,
}: {
  href: string;
  title: string;
  preview: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-black/5 bg-card transition-colors hover:border-ink/15"
    >
      <div
        aria-hidden="true"
        className="flex h-36 items-center justify-center bg-canvas/60 px-5"
      >
        {preview}
      </div>
      <div className="px-5 py-3.5 text-sm font-semibold text-ink group-hover:underline">
        {title}
      </div>
    </Link>
  );
}

export default function DoMorePanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FeatureCard
        href="/dashboard/notetaker"
        title="Browse your meeting notes"
        preview={<MeetingNotePreview />}
      />
      <FeatureCard
        href="/dashboard/categorization"
        title="Customize your inbox"
        preview={<InboxPreview />}
      />
    </div>
  );
}
