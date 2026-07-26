export default function StageIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink/50">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      {label}
    </div>
  );
}
