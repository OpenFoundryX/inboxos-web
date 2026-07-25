"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

export default function NotetakerPage() {
  const [summarize, setSummarize] = useState(true);

  return (
    <>
      <Topbar title="Notetaker" />
      <div className="p-8">
        <PageHeader
          title="Never write meeting notes again"
          subtitle="InboxOS joins your meetings and turns them into actionable notes and follow-ups."
        />
        <Card className="mb-6 flex items-center justify-between p-5">
          <div>
            <div className="text-sm font-bold text-ink">Summarize my meetings</div>
            <div className="text-xs text-ink/50">
              InboxOS will join your meetings and handle the notes.
            </div>
          </div>
          <Toggle checked={summarize} onChange={setSummarize} label="Summarize my meetings" />
        </Card>
        <Card className="p-10 text-center text-sm text-ink/50">
          No meeting notes yet — they&apos;ll appear here after your first summarized meeting.
        </Card>
      </div>
    </>
  );
}
