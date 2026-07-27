// Stands in for the assistant's bubble until its first token arrives, so a turn
// in flight never looks dropped. It shows from the moment the question is sent —
// before any `stage` event has come back — hence the fallback label.
const DEFAULT_LABEL = "Thinking…";

// Staggered so the three dots read as one travelling shimmer rather than a
// blink. Inline delays: Tailwind can't see a class name built at runtime.
const DOT_DELAYS = ["0ms", "200ms", "400ms"];

export default function StageIndicator({ label }: { label?: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3"
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        {DOT_DELAYS.map((delay) => (
          <span
            key={delay}
            style={{ animationDelay: delay }}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          />
        ))}
      </span>
      <span className="text-xs text-ink/50">{label ?? DEFAULT_LABEL}</span>
    </div>
  );
}
