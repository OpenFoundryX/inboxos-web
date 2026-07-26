"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <span className="mb-3 text-xl font-extrabold tracking-tight text-accent">InboxOS</span>
      <h1 className="text-2xl font-extrabold tracking-tight">Connect your accounts</h1>
      <p className="mt-2 text-sm text-ink/60">
        InboxOS needs access to your Gmail and Google Calendar to organize your inbox and help you
        schedule meetings.
      </p>

      {error ? (
        <Card className="mt-6 border border-accent/30 p-4 text-sm text-accent-dark">{error}</Card>
      ) : null}

      <div className="mt-8 space-y-4">
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

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={refresh}
          className="text-sm font-medium text-ink/50 hover:text-ink"
        >
          Refresh status
        </button>
        <Button variant="dark" disabled={!bothConnected} onClick={() => router.replace("/dashboard")}>
          Continue to dashboard
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-ink/40">
        You&apos;ll be sent to grant access, then returned here.
      </p>
    </div>
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
    <Card className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${badgeClass}`}>
          {letter}
        </div>
        <div>
          <div className="text-sm font-bold text-ink">{title}</div>
          <div className="text-xs text-ink/50">{desc}</div>
        </div>
      </div>
      {loading ? (
        <span className="text-xs text-ink/40">…</span>
      ) : connected ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <CheckIcon className="h-4 w-4" />
          Connected
        </span>
      ) : (
        <Button variant="dark" onClick={onConnect} disabled={busy}>
          {busy ? "Opening…" : "Connect"}
        </Button>
      )}
    </Card>
  );
}
