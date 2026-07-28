import { statusDisplay, type StatusTone } from "@/lib/meetings";

const TONES: Record<StatusTone, string> = {
  neutral: "border-ink/10 bg-cream text-ink/70",
  live: "border-transparent bg-ink text-cream",
  done: "border-ink/10 bg-cream text-ink",
  error: "border-transparent bg-accent text-white",
  muted: "border-transparent bg-cream text-ink/35",
};

export default function StatusPill({ status }: { status: string }) {
  const { label, tone } = statusDisplay(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONES[tone]}`}
    >
      {tone === "live" ? (
        <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-cream" />
      ) : null}
      {label}
    </span>
  );
}
