"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import RadioGroup from "@/components/ui/RadioGroup";
import { PlusIcon } from "@/components/app/icons";

const MOVE_OUT = [
  { id: "comment", label: "Comment", desc: "Document comments & chats", color: "bg-amber-400" },
  { id: "notification", label: "Notification", desc: "Automated tool notifications", color: "bg-emerald-400" },
  { id: "meeting", label: "Meeting update", desc: "Calendar & meeting invites", color: "bg-blue-400" },
  { id: "followup", label: "To follow up", desc: "Waiting for their reply", color: "bg-violet-400" },
  { id: "marketing", label: "Marketing", desc: "Sales & marketing emails", color: "bg-rose-400" },
];

const KEEP_IN = [
  { id: "respond", label: "To respond", desc: "Need your response", color: "bg-accent" },
  { id: "fyi", label: "FYI", desc: "Important, no reply needed", color: "bg-amber-400" },
];

const MARKETING_OPTIONS = [
  { value: "obvious", label: "Just obvious sales outreach" },
  { value: "cold", label: "Cold emails and unknown senders" },
  { value: "newsletters", label: "Cold emails, unknown senders and newsletters" },
  { value: "anything", label: "Anything that's not directly useful to my work" },
];

function Row({
  label,
  desc,
  color,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  color: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-4">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 rounded-full ${color}`} />
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          <div className="text-xs text-ink/50">{desc}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function CategorizationPage() {
  const [tab, setTab] = useState("General");
  const [dirty, setDirty] = useState(false);

  const [moveOut, setMoveOut] = useState<Record<string, boolean>>(
    Object.fromEntries(MOVE_OUT.map((c) => [c.id, true])),
  );
  const [keepIn, setKeepIn] = useState<Record<string, boolean>>(
    Object.fromEntries(KEEP_IN.map((c) => [c.id, false])),
  );
  const [respect, setRespect] = useState(true);

  const [enabled, setEnabled] = useState(true);
  const [archive, setArchive] = useState(true);
  const [marketing, setMarketing] = useState("cold");

  function toggleMoveOut(id: string) {
    setMoveOut((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  }

  function toggleKeepIn(id: string) {
    setKeepIn((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  }

  return (
    <>
      <Topbar title="Categorization">
        <Button variant="dark" disabled={!dirty} onClick={() => setDirty(false)}>
          Update preferences
        </Button>
      </Topbar>
      <div className="p-8">
        <Tabs tabs={["General", "Advanced"]} active={tab} onChange={setTab} className="mb-8" />

        {tab === "General" ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink/60">Move these out of my Inbox</h3>
                <div className="space-y-2">
                  {MOVE_OUT.map((c) => (
                    <Row
                      key={c.id}
                      {...c}
                      checked={moveOut[c.id]}
                      onChange={() => toggleMoveOut(c.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink/60">Keep these in my Inbox</h3>
                <div className="space-y-2">
                  {KEEP_IN.map((c) => (
                    <Row
                      key={c.id}
                      {...c}
                      checked={keepIn[c.id]}
                      onChange={() => toggleKeepIn(c.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-ink/60">Existing categories</h3>
              <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-4 lg:max-w-[calc(50%-0.75rem)]">
                <div>
                  <div className="text-sm font-medium text-ink">Respect my categories</div>
                  <div className="text-xs text-ink/50">We won&apos;t sort emails already labeled</div>
                </div>
                <Toggle
                  checked={respect}
                  onChange={(v) => {
                    setRespect(v);
                    setDirty(true);
                  }}
                  label="Respect my categories"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable categorization</div>
                  <div className="text-xs text-ink/50">Turn categorization on or off globally.</div>
                </div>
                <Toggle checked={enabled} onChange={(v) => { setEnabled(v); setDirty(true); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Archive threads after sending</div>
                  <div className="text-xs text-ink/50">
                    Move threads out of your inbox after you reply.
                  </div>
                </div>
                <Toggle checked={archive} onChange={(v) => { setArchive(v); setDirty(true); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-4 text-sm font-bold text-ink">
                Which emails should InboxOS filter as marketing?
              </div>
              <RadioGroup
                options={MARKETING_OPTIONS}
                value={marketing}
                onChange={(v) => { setMarketing(v); setDirty(true); }}
              />
            </Card>
            <Card className="p-5">
              <div className="mb-1 text-sm font-bold text-ink">Custom rules</div>
              <div className="mb-4 text-xs text-ink/50">
                Choose which addresses, domains, or subjects go to each category.
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink">
                <PlusIcon className="h-4 w-4" />
                Add email, domain, or subject
              </button>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
