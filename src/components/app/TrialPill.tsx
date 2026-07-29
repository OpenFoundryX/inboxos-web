import Link from "next/link";

export default function TrialPill() {
  return (
    <Link
      href="/#pricing"
      className="flex items-center justify-between rounded-xl border border-black/5 bg-canvas px-3 py-2 text-xs font-medium text-ink/70 hover:text-ink"
    >
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        14 days left of trial
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
