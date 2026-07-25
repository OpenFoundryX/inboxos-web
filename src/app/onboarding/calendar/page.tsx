"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CalendarIcon } from "@/components/app/icons";

export default function CalendarStep() {
  const router = useRouter();
  const next = () => router.push("/onboarding/inbox");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">How InboxOS uses your calendar</h1>
        <ul className="mt-6 space-y-4 text-sm text-ink/70">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            We use meeting context to draft sharper follow-ups.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            We help you schedule meetings faster.
          </li>
        </ul>
        <p className="mt-10 text-xs text-ink/40">
          InboxOS never sends emails on your behalf · disconnect anytime
        </p>
      </div>
      <Card className="flex flex-col items-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600">
          <CalendarIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold">Connect your calendar</h2>
        <p className="mt-2 text-sm text-ink/60">
          InboxOS syncs with your calendar to suggest your availability in draft emails.
        </p>
        <Button variant="dark" onClick={next} className="mt-6 w-full">
          Continue with Google
        </Button>
        <button onClick={next} className="mt-3 text-sm font-medium text-ink/50 hover:text-ink">
          Continue with Outlook
        </button>
      </Card>
    </div>
  );
}
