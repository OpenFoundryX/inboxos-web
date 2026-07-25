"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Stepper from "@/components/ui/Stepper";

const RESPONSE_STYLES = [
  "I reply to almost everything, even just to be polite",
  "I reply when a response is needed",
  "I only reply to important emails",
];

export default function DraftsPage() {
  const [tab, setTab] = useState("General");
  const [dirty, setDirty] = useState(false);

  const [enableDrafts, setEnableDrafts] = useState(true);
  const [retention, setRetention] = useState(14);
  const [style, setStyle] = useState(RESPONSE_STYLES[0]);
  const [followUps, setFollowUps] = useState(true);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [customTone, setCustomTone] = useState(false);
  const [includeSig, setIncludeSig] = useState(true);

  const mark = () => setDirty(true);

  return (
    <>
      <Topbar title="Drafts">
        <Button variant="dark" disabled={!dirty} onClick={() => setDirty(false)}>
          Update preferences
        </Button>
      </Topbar>
      <div className="p-8">
        <Tabs
          tabs={["General", "Signatures", "Custom Files"]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === "General" ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable draft replies</div>
                  <div className="text-xs text-ink/50">
                    Automatically generate draft replies for incoming emails.
                  </div>
                </div>
                <Toggle checked={enableDrafts} onChange={(v) => { setEnableDrafts(v); mark(); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-medium text-ink/70">Unused drafts are deleted after</div>
              <Stepper value={retention} onChange={(v) => { setRetention(v); mark(); }} min={1} max={90} suffix="days" />
            </Card>
            <Card className="p-5">
              <div className="mb-2 text-sm font-bold text-ink">Response style</div>
              <div className="mb-3 text-xs text-ink/50">How often do you like to reply?</div>
              <select
                value={style}
                onChange={(e) => { setStyle(e.target.value); mark(); }}
                className="w-full rounded-xl border border-black/10 bg-card px-3 py-2.5 text-sm text-ink focus:outline-none"
              >
                {RESPONSE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable follow-up drafts</div>
                  <div className="text-xs text-ink/50">
                    Draft follow-ups when you haven&apos;t received a response.
                  </div>
                </div>
                <Toggle checked={followUps} onChange={(v) => { setFollowUps(v); mark(); }} />
              </div>
              {followUps ? (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-ink/70">Days before following up</div>
                  <Stepper value={followUpDays} onChange={(v) => { setFollowUpDays(v); mark(); }} min={1} max={30} suffix="days" />
                </div>
              ) : null}
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable custom instructions</div>
                  <div className="text-xs text-ink/50">
                    Add personalized instructions to guide how drafts are written.
                  </div>
                </div>
                <Toggle checked={customTone} onChange={(v) => { setCustomTone(v); mark(); }} />
              </div>
            </Card>
          </div>
        ) : tab === "Signatures" ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Include email signatures in drafts</div>
                  <div className="text-xs text-ink/50">
                    Disable if your organization already adds signatures automatically.
                  </div>
                </div>
                <Toggle checked={includeSig} onChange={(v) => { setIncludeSig(v); mark(); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold text-ink">Default signature</div>
              <textarea
                onChange={mark}
                placeholder="Write your default signature…"
                className="h-32 w-full resize-none rounded-xl border border-black/10 bg-cream p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </Card>
          </div>
        ) : (
          <Card className="max-w-2xl p-10 text-center text-sm text-ink/50">
            Custom files let InboxOS reference your documents when drafting. Coming soon.
          </Card>
        )}
      </div>
    </>
  );
}
