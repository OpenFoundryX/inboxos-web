"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import { cancelBookingAsHost, listBookings, type Booking } from "@/lib/scheduling";
import { formatDateTime } from "@/lib/slots";

export default function BookingsTab({
  timezone,
  onNotify,
}: {
  timezone: string;
  onNotify: (message: string) => void;
}) {
  const [view, setView] = useState("Upcoming");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    setBookings(null);
    listBookings(view === "Upcoming")
      .then(setBookings)
      .catch((e) => onNotify(e instanceof Error ? e.message : "Could not load bookings"));
  }, [view, onNotify]);

  async function cancel(booking: Booking) {
    setBusy(booking.id);
    try {
      const updated = await cancelBookingAsHost(booking.id);
      setBookings((rows) =>
        view === "Upcoming"
          ? (rows ?? []).filter((b) => b.id !== booking.id)
          : (rows ?? []).map((b) => (b.id === updated.id ? updated : b)),
      );
      onNotify(`Cancelled. ${booking.booker_name} has been emailed.`);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not cancel that meeting");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Tabs tabs={["Upcoming", "All"]} active={view} onChange={setView} />

      {bookings === null ? (
        <p className="text-sm text-ink/45">Loading…</p>
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink/45">
          {view === "Upcoming" ? "Nothing booked yet." : "No bookings to show."}
        </Card>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => {
            const live = booking.status === "pending" || booking.status === "confirmed";
            return (
              <Card key={booking.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm">{booking.title}</b>
                      {booking.status === "cancelled" ? (
                        <span className="rounded-full bg-red-600/10 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Cancelled
                        </span>
                      ) : booking.status === "failed" ? (
                        <span
                          className="rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                          title="The slot was reserved but the calendar event could not be created."
                        >
                          Needs attention
                        </span>
                      ) : null}
                      {booking.rescheduled_at ? (
                        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/45">
                          Moved
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-ink/70">
                      {formatDateTime(booking.starts_at, timezone)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {booking.booker_name} · {booking.booker_email}
                      {booking.attendee_emails.length
                        ? ` · +${booking.attendee_emails.length} invited`
                        : ""}
                    </p>
                    {booking.notes ? (
                      <p className="mt-2 text-xs text-ink/50">{booking.notes}</p>
                    ) : null}
                    {Object.keys(booking.answers).length > 0 ? (
                      <dl className="mt-2 space-y-0.5 text-xs text-ink/50">
                        {Object.entries(booking.answers).map(([label, value]) => (
                          <div key={label} className="flex gap-1.5">
                            <dt className="font-semibold">{label}:</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {booking.meeting_url ? (
                      <a
                        href={booking.meeting_url}
                        className="text-xs font-semibold text-accent"
                      >
                        Join →
                      </a>
                    ) : null}
                    {live ? (
                      <button
                        disabled={busy === booking.id}
                        onClick={() => void cancel(booking)}
                        className="text-xs font-semibold text-ink/45 hover:text-red-600 disabled:opacity-40"
                      >
                        {busy === booking.id ? "Cancelling…" : "Cancel"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
