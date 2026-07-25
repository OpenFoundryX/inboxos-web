"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import { setOnboarded } from "@/lib/auth";

export default function NotesStep() {
  const router = useRouter();
  const [summarize, setSummarize] = useState(true);

  function finish() {
    setOnboarded();
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Never write meeting notes again</h1>
        <p className="mt-3 text-sm text-ink/60">
          After every meeting you&rsquo;ll find actionable notes in your inbox and a follow-up email ready
          to send.
        </p>
        <div className="mt-6 h-40 rounded-xl bg-cream" />
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-ink">Summarize my meetings</div>
            <div className="mt-1 text-xs text-ink/50">
              InboxOS will join your meetings and handle the notes so you can focus on the
              conversation.
            </div>
          </div>
          <Toggle checked={summarize} onChange={setSummarize} label="Summarize my meetings" />
        </div>
      </Card>
      <Button variant="dark" onClick={finish} className="mt-6 w-full">
        Finish setup
      </Button>
    </div>
  );
}
