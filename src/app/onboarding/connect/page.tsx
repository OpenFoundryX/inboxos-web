"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import StepShell from "@/components/onboarding/StepShell";
import { CheckIcon } from "@/components/app/icons";
import { backendConfigured } from "@/lib/session";
import {
  getConnectionState,
  getGoogleConnectUrl,
  type GoogleStatus,
} from "@/lib/connections";

/** The callback redirects back here with an outcome. Without reading it, a
 *  failed grant looks identical to a user who simply hasn't clicked yet — the
 *  page would sit there saying "not connected" with no reason given. */
const CALLBACK_ERRORS: Record<string, string> = {
  account_mismatch:
    "That's a different Google account from the one you signed in with. Pick the same account and try again.",
  // Retrying cannot help — the grant was given and the server failed to store
  // it. Saying "try again" would just loop the user through consent forever.
  server_error:
    "Google approved the connection but InboxOS couldn't save it. This is a server configuration problem, not something you did — check the API logs.",
};

export default function ConnectPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getConnectionState());
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
    if (params.get("connected") === "0") {
      setError(
        CALLBACK_ERRORS[params.get("reason") ?? ""] ??
          "Google didn't complete the connection. Please try again.",
      );
    }
    refresh();
  }, [router, refresh, params]);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const { redirect_url } = await getGoogleConnectUrl();
      window.location.href = redirect_url;
    } catch {
      setError("Couldn't start the Google connection.");
      setBusy(false);
    }
  }

  // Both scope sets are needed: mail without calendar can't schedule, calendar
  // without mail has nothing to act on.
  const ready = Boolean(status?.gmail && status?.calendar);

  return (
    <StepShell
      title="Connect your Google account"
      blurb="InboxOS needs Gmail to hold and sort your mail, and Google Calendar to handle scheduling. Both come from a single sign-in."
      error={error}
      busy={false}
      continueDisabled={!ready}
      onContinue={() => router.replace("/onboarding/mail")}
      secondaryLabel="Refresh status"
      onSecondary={refresh}
      footnote="You'll be sent to Google to grant access, then returned here."
    >
      <div className="space-y-2.5">
        <ConnectRow
          status={status}
          loading={loading}
          busy={busy}
          onConnect={connect}
        />
        {status?.connected && !ready ? (
          <p className="px-1 text-xs text-ink/50">
            Connected, but the grant is missing{" "}
            {!status.gmail ? "Gmail" : "Calendar"} access. Reconnect and make sure
            every permission stays ticked.
          </p>
        ) : null}
        {ready && !status?.listening ? (
          <p className="px-1 text-xs text-ink/50">
            Setting up your mailbox — this takes a few seconds. Hit Refresh
            status if it doesn&apos;t settle.
          </p>
        ) : null}
      </div>
    </StepShell>
  );
}

function ConnectRow({
  status,
  loading,
  busy,
  onConnect,
}: {
  status: GoogleStatus | null;
  loading: boolean;
  busy: boolean;
  onConnect: () => void;
}) {
  const connected = Boolean(status?.gmail && status?.calendar);
  const label = status?.needs_reconnect ? "Reconnect" : "Connect";

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition duration-200 ${
        connected
          ? "border-emerald-500/30 bg-emerald-500/[0.05]"
          : "border-black/[0.07] bg-card"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-sm font-bold text-accent">
          G
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">Google</div>
          <div className="truncate text-xs text-ink/50">
            {connected && status?.email
              ? status.email
              : "Gmail and Google Calendar"}
          </div>
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
          {busy ? "Opening…" : label}
        </Button>
      )}
    </div>
  );
}
