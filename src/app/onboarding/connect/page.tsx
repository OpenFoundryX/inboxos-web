"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StepShell from "@/components/onboarding/StepShell";
import { CheckIcon } from "@/components/app/icons";
import { backendConfigured } from "@/lib/session";
import {
  getCalendarConnectUrl,
  getCalendarStatus,
  getGmailConnectUrl,
  getGmailStatus,
} from "@/lib/connections";

type Service = "gmail" | "calendar";

export default function ConnectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gmail, setGmail] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [busy, setBusy] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [g, c] = await Promise.all([getGmailStatus(), getCalendarStatus()]);
      setGmail(g.connected);
      setCalendar(c.connected);
      setError(null);
    } catch {
      setError("Couldn't reach the InboxOS backend. Make sure it's running and you're signed in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!backendConfigured()) {
      router.replace("/dashboard");
      return;
    }
    refresh();
  }, [router, refresh]);

  async function connect(service: Service) {
    setBusy(service);
    setError(null);
    try {
      const { redirect_url } =
        service === "gmail" ? await getGmailConnectUrl() : await getCalendarConnectUrl();
      window.location.href = redirect_url;
    } catch {
      setError(`Couldn't start the ${service === "gmail" ? "Gmail" : "Calendar"} connection.`);
      setBusy(null);
    }
  }

  const bothConnected = gmail && calendar;

  // StepShell, like steps 2-4 — but with the skip swapped for "Refresh status"
  // (nothing works without both grants) and Continue held until they land.
  return (
    <StepShell
      title="Connect your accounts"
      blurb="InboxOS needs access to your Gmail and Google Calendar to organize your inbox and help you schedule meetings."
      error={error}
      busy={false}
      continueDisabled={!bothConnected}
      onContinue={() => router.replace("/onboarding/mail")}
      secondaryLabel="Refresh status"
      onSecondary={refresh}
      footnote="You'll be sent to grant access, then returned here."
    >
      <div className="space-y-2.5">
        <ServiceRow
          title="Gmail"
          desc="Read, organize, and draft replies."
          letter="M"
          badgeClass="bg-accent/15 text-accent"
          connected={gmail}
          busy={busy === "gmail"}
          loading={loading}
          onConnect={() => connect("gmail")}
        />
        <ServiceRow
          title="Google Calendar"
          desc="Suggest availability and schedule meetings."
          letter="C"
          badgeClass="bg-blue-500/15 text-blue-600"
          connected={calendar}
          busy={busy === "calendar"}
          loading={loading}
          onConnect={() => connect("calendar")}
        />
      </div>
    </StepShell>
  );
}

function ServiceRow({
  title,
  desc,
  letter,
  badgeClass,
  connected,
  busy,
  loading,
  onConnect,
}: {
  title: string;
  desc: string;
  letter: string;
  badgeClass: string;
  connected: boolean;
  busy: boolean;
  loading: boolean;
  onConnect: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition duration-200 ${
        connected
          ? "border-emerald-500/30 bg-emerald-500/[0.05]"
          : "border-black/[0.07] bg-card"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${badgeClass}`}
        >
          {letter}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="truncate text-xs text-ink/50">{desc}</div>
        </div>
      </div>
      {loading ? (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink/15 border-t-ink/40" />
      ) : connected ? (
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <CheckIcon className="h-3.5 w-3.5" />
          Connected
        </span>
      ) : (
        <Button variant="dark" onClick={onConnect} disabled={busy} className="shrink-0">
          {busy ? "Opening…" : "Connect"}
        </Button>
      )}
    </div>
  );
}
