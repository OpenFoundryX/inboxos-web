import Card from "@/components/ui/Card";

export default function SubscribeBanner() {
  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="text-2xl">
          🔒
        </span>
        <div>
          <div className="text-sm font-bold text-ink">Subscribe for full access</div>
          <div className="mt-0.5 text-xs text-ink/50">
            Start a subscription to keep your automations running after your trial.
          </div>
        </div>
      </div>
      <a
        href="/#pricing"
        className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
      >
        View plans →
      </a>
    </Card>
  );
}
