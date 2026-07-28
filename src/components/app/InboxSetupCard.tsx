import Card from "@/components/ui/Card";
import ProgressRing from "@/components/app/ProgressRing";
import { DraftsIcon, EnvelopeIcon } from "@/components/app/icons";
import type { DashboardSetup, DashboardStats } from "@/lib/dashboard";

function StatRow({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink/50">
        {icon}
      </span>
      <span className="text-xl font-extrabold text-ink">{value}</span>
      <span className="text-sm text-ink/60">{label}</span>
    </div>
  );
}

export default function InboxSetupCard({
  setup,
  stats,
}: {
  setup: DashboardSetup;
  stats: DashboardStats;
}) {
  const ready = setup.state === "ready";

  return (
    <section>
      <h2 className="text-lg font-extrabold tracking-tight text-ink">
        {ready ? "Your inbox is set up" : "Setting up your inbox"}
      </h2>
      <p className="mt-1 text-sm text-ink/50">
        {ready
          ? "InboxOS has categorized your emails and created reply drafts. Head to Gmail to review them."
          : "We're categorizing the mail already in your inbox. This usually takes a few minutes."}
      </p>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center justify-center bg-cream/60 p-8 sm:w-56">
            <ProgressRing percent={ready ? 100 : 60} label={ready ? "complete" : "working"} />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 p-8">
            <StatRow
              icon={<EnvelopeIcon className="h-4 w-4" />}
              value={stats.emails_categorized}
              label="Emails categorized"
            />
            <StatRow
              icon={<DraftsIcon className="h-4 w-4" />}
              value={stats.drafts_created}
              label="Drafts created"
            />
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Open Gmail
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </Card>
    </section>
  );
}
