"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import { CopyIcon } from "@/components/app/icons";

const FEATURES = [
  {
    title: "Customise your availability",
    desc: "Set your working hours so InboxOS only shows times that work for you.",
  },
  {
    title: "Configure scheduling drafts",
    desc: "Set your preferences for how InboxOS responds to meeting requests.",
  },
  {
    title: "Team scheduling",
    desc: "Browse availability across your team and book meetings with multiple attendees.",
  },
];

export default function SchedulingPage() {
  const [tab, setTab] = useState("Links");
  const [includeLink, setIncludeLink] = useState(true);
  const [proposeDrafts, setProposeDrafts] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(true);

  return (
    <>
      <Topbar title="Scheduling" />
      <div className="p-8">
        <Tabs
          tabs={["Links", "Drafts", "Availability", "Teams"]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === "Links" ? (
          <div className="space-y-6">
            <Card className="flex items-center justify-between p-5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">
                  Share this link so others can book time with you
                </div>
                <div className="mt-0.5 truncate text-xs text-ink/40">
                  inboxos.app/e/your-scheduling-link
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/70 hover:text-ink">
                <CopyIcon className="h-4 w-4" />
                Copy link
              </button>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <div className="mb-4 h-16 rounded-xl bg-cream" />
                  <div className="text-sm font-bold text-ink">{f.title}</div>
                  <div className="mt-2 text-xs text-ink/50">{f.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        ) : tab === "Drafts" ? (
          <Card className="max-w-2xl p-5">
            <div className="mb-4 text-sm font-bold text-ink">
              How InboxOS responds to meeting requests
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Include scheduling link in drafts</span>
                <Toggle checked={includeLink} onChange={setIncludeLink} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Generate drafts for proposed times</span>
                <Toggle checked={proposeDrafts} onChange={setProposeDrafts} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Confirmation email after proposal</span>
                <Toggle checked={confirmEmail} onChange={setConfirmEmail} />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="max-w-2xl p-10 text-center text-sm text-ink/50">
            {tab} settings are coming soon.
          </Card>
        )}
      </div>
    </>
  );
}
