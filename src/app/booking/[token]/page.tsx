"use client";

import { useCallback, useEffect, useState } from "react";
import PublicShell from "@/components/scheduling/PublicShell";
import SlotPicker from "@/components/scheduling/SlotPicker";
import { ApiError } from "@/lib/api";
import {
  cancelOwnBooking,
  getManagedBooking,
  getRescheduleAvailability,
  rescheduleOwnBooking,
  type ManagedBooking,
} from "@/lib/scheduling";
import { deviceTimezone, formatDateTime } from "@/lib/slots";

/** Where the link in every confirmation email lands.
 *
 *  The token in the URL is the whole credential — see the API's public router
 *  for why that is the right trust model for a single meeting. */
export default function ManageBookingPage({ params }: { params: { token: string } }) {
  const [managed, setManaged] = useState<ManagedBooking | null>(null);
  const [viewerTimezone, setViewerTimezone] = useState(deviceTimezone);
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel" | "moved">("view");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingSlot, setPendingSlot] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getManagedBooking(params.token)
      .then(setManaged)
      .catch((e) => setError(e instanceof Error ? e.message : "Booking not found"));
  }, [params.token]);

  const fetchRange = useCallback(
    (from: string, to: string) => getRescheduleAvailability(params.token, from, to),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.token, reloadKey],
  );

  async function doCancel() {
    setBusy(true);
    setError("");
    try {
      const booking = await cancelOwnBooking(params.token, reason);
      setManaged((m) => (m ? { ...m, booking, can_reschedule: false } : m));
      setMode("view");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel this meeting");
    } finally {
      setBusy(false);
    }
  }

  async function doReschedule(startsAt: string) {
    setPendingSlot(startsAt);
    setError("");
    try {
      const booking = await rescheduleOwnBooking(params.token, startsAt);
      setManaged((m) => (m ? { ...m, booking } : m));
      // Land on an explicit confirmation rather than dropping back to the
      // details view. Returning silently left the guest unsure whether the
      // click had done anything — the only difference was one date deep in
      // the panel, which is not an acknowledgement.
      setMode("moved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not move this meeting");
      if (e instanceof ApiError && e.status === 409) setReloadKey((n) => n + 1);
    } finally {
      setPendingSlot("");
    }
  }

  if (!managed) {
    return (
      <PublicShell>
        <p className="grid min-h-[200px] place-items-center text-sm text-ink/45">
          {error || "Loading your booking…"}
        </p>
      </PublicShell>
    );
  }

  const { booking, host_name: host } = managed;
  const cancelled = booking.status === "cancelled";

  const aside = (
    <div className="flex h-full flex-col">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
        {host.slice(0, 2).toUpperCase()}
      </div>
      <p className="mt-4 text-xs font-medium text-ink/45">{host}</p>
      <h1 className="mt-1 text-lg font-bold tracking-[-0.02em]">{booking.title}</h1>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        {formatDateTime(booking.starts_at, viewerTimezone)}
      </p>
      <p className="mt-auto pt-7 text-[10px] leading-4 text-ink/30">
        Times shown in {viewerTimezone.replaceAll("_", " ")}.
      </p>
    </div>
  );

  return (
    <PublicShell aside={aside}>
      {cancelled ? (
        <div className="grid min-h-[240px] place-items-center text-center">
          <div>
            <h2 className="text-lg font-bold">This meeting was cancelled</h2>
            <p className="mt-2 text-sm text-ink/45">
              {booking.cancelled_by === "host"
                ? `${host} cancelled it.`
                : "You cancelled it."}
            </p>
            {booking.cancel_reason ? (
              <p className="mt-2 text-xs text-ink/40">{booking.cancel_reason}</p>
            ) : null}
            <a
              href={`/schedule/${encodeURIComponent(managed.profile_slug)}`}
              className="mt-5 inline-block text-sm font-semibold text-accent"
            >
              Book a new time →
            </a>
          </div>
        </div>
      ) : mode === "moved" ? (
        <div className="grid min-h-[280px] place-items-center p-4 text-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white shadow-lg shadow-accent/15">
              ✓
            </div>
            <h2 className="mt-5 text-xl font-bold">Your meeting has moved</h2>
            <p className="mt-2 text-sm text-ink/45">
              {host} has been notified and everyone&apos;s calendar is updated.
            </p>
            <p className="mt-5 text-sm font-semibold">
              {formatDateTime(booking.starts_at, viewerTimezone)}
            </p>
            <p className="mt-1 text-xs text-ink/35">
              {viewerTimezone.replaceAll("_", " ")}
            </p>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="mt-6 text-sm font-semibold text-accent"
            >
              Back to booking details
            </button>
          </div>
        </div>
      ) : mode === "reschedule" ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold">Pick a new time</h2>
            <button
              type="button"
              disabled={Boolean(pendingSlot)}
              onClick={() => setMode("view")}
              className="text-xs font-semibold text-ink/45 hover:text-ink disabled:opacity-40"
            >
              Keep current time
            </button>
          </div>
          <SlotPicker
            fetchRange={fetchRange}
            durationMinutes={Math.round(
              (new Date(booking.ends_at).getTime() -
                new Date(booking.starts_at).getTime()) /
                60000,
            )}
            viewerTimezone={viewerTimezone}
            onTimezoneChange={setViewerTimezone}
            hostTimezone={managed.host_timezone}
            firstBookableDay={new Date().toISOString().slice(0, 10)}
            lastBookableDay={new Date(Date.now() + 365 * 86400000)
              .toISOString()
              .slice(0, 10)}
            onPick={(slot) => void doReschedule(slot)}
            pendingSlot={pendingSlot}
          />
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>
          ) : null}
        </>
      ) : mode === "cancel" ? (
        <div className="mx-auto max-w-md">
          <h2 className="text-sm font-bold">Cancel this meeting?</h2>
          <p className="mt-2 text-sm text-ink/50">
            {host} will be notified and the time will be released.
          </p>
          <label className="mt-4 block text-xs font-semibold">
            Reason <span className="font-normal text-ink/35">Optional</span>
            <textarea
              rows={2}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border border-black/[0.08] bg-[#fdfdfb] px-3 py-2.5 text-sm font-normal outline-none focus:border-accent/40"
            />
          </label>
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void doCancel()}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Cancelling…" : "Cancel meeting"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-md">
          <h2 className="text-sm font-bold">Your booking</h2>
          <dl className="mt-4 space-y-2.5 rounded-2xl border border-black/[0.06] bg-[#fdfdfb] p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/45">When</dt>
              <dd className="text-right font-semibold">
                {formatDateTime(booking.starts_at, viewerTimezone)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/45">With</dt>
              <dd className="text-right">{host}</dd>
            </div>
            {booking.meeting_url ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/45">Link</dt>
                <dd className="truncate text-right">
                  <a className="font-semibold text-accent" href={booking.meeting_url}>
                    Join meeting
                  </a>
                </dd>
              </div>
            ) : null}
            {booking.rescheduled_at ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/45">Note</dt>
                <dd className="text-right text-xs text-ink/40">
                  This meeting was moved from its original time.
                </dd>
              </div>
            ) : null}
          </dl>

          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {managed.can_reschedule ? (
              <button
                type="button"
                onClick={() => setMode("reschedule")}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white"
              >
                Reschedule
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setMode("cancel")}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold"
            >
              Cancel meeting
            </button>
          </div>
        </div>
      )}
    </PublicShell>
  );
}
