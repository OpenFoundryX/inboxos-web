"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import PublicShell from "@/components/scheduling/PublicShell";
import QuestionFields from "@/components/scheduling/QuestionFields";
import SlotPicker from "@/components/scheduling/SlotPicker";
import { ApiError } from "@/lib/api";
import {
  createBooking,
  getAvailability,
  getPublicEvent,
  type Booking,
  type PublicEventDetail,
} from "@/lib/scheduling";
import { deviceTimezone, formatDateTime } from "@/lib/slots";

export default function BookingPage({
  params,
}: {
  params: { slug: string; event: string };
}) {
  const [detail, setDetail] = useState<PublicEventDetail | null>(null);
  const [slot, setSlot] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [inviteeDraft, setInviteeDraft] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [viewerTimezone, setViewerTimezone] = useState(deviceTimezone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getPublicEvent(params.slug, params.event)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : "Meeting type not found"));
  }, [params.slug, params.event]);

  const fetchRange = useCallback(
    (from: string, to: string) => getAvailability(params.slug, params.event, from, to),
    // `reloadKey` is not used in the body: it is here so that bumping it after
    // a lost slot produces a new function identity, which is what makes the
    // picker refetch rather than keep showing the time somebody else just took.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.slug, params.event, reloadKey],
  );

  function addInvitee() {
    const email = inviteeDraft.trim().toLowerCase();
    if (!email) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid invitee email address");
      return;
    }
    if (!invitees.includes(email)) setInvitees([...invitees, email]);
    setInviteeDraft("");
    setError("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      setBooking(
        await createBooking(params.slug, params.event, {
          starts_at: slot,
          name: String(data.get("name")),
          email: String(data.get("email")),
          notes: String(data.get("notes") || ""),
          attendee_emails: invitees,
          answers,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not book this meeting");
      // Somebody else took it while this form was open. Sending the guest back
      // to a refreshed list beats leaving a dead time on screen with an error
      // under it — the old page kept offering the slot that had just failed.
      if (e instanceof ApiError && e.status === 409) {
        setSlot("");
        setReloadKey((n) => n + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!detail) {
    return (
      <PublicShell>
        <p className="grid min-h-[200px] place-items-center text-sm text-ink/45">
          {error || "Loading scheduling link…"}
        </p>
      </PublicShell>
    );
  }

  const aside = (
    <div className="flex h-full flex-col">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
        {detail.host_name.slice(0, 2).toUpperCase()}
      </div>
      <p className="mt-4 text-xs font-medium text-ink/45">{detail.host_name}</p>
      <h1 className="mt-1 text-lg font-bold tracking-[-0.02em]">{detail.event.name}</h1>
      <p className="mt-1 text-xs text-ink/45">{detail.event.duration_minutes} minutes</p>
      {detail.event.description ? (
        <p className="mt-3 text-xs leading-5 text-ink/50">{detail.event.description}</p>
      ) : null}
      {slot ? (
        <button
          type="button"
          onClick={() => setSlot("")}
          className="mt-5 text-left text-xs leading-5 text-ink/50 hover:text-accent"
        >
          {formatDateTime(slot, viewerTimezone)}
          <br />
          <span className="font-semibold text-accent">Change time</span>
        </button>
      ) : null}
      <p className="mt-auto pt-7 text-[10px] leading-4 text-ink/30">
        The host&apos;s calendar uses {detail.host_timezone.replaceAll("_", " ")}.
      </p>
    </div>
  );

  if (booking) {
    return (
      <PublicShell aside={aside}>
        <div className="grid min-h-[300px] place-items-center p-4 text-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white shadow-lg shadow-accent/15">
              ✓
            </div>
            <h2 className="mt-5 text-xl font-bold">You&apos;re all set</h2>
            <p className="mt-2 text-sm text-ink/45">
              A calendar invite is on its way to everyone.
            </p>
            <p className="mt-5 text-sm font-semibold">
              {formatDateTime(booking.starts_at, viewerTimezone)}
            </p>
            {booking.meeting_url ? (
              <a
                className="mt-4 inline-block text-sm font-semibold text-accent"
                href={booking.meeting_url}
              >
                Open meeting link →
              </a>
            ) : null}
            <p className="mt-4 text-xs text-ink/35">
              Check your email for a link to reschedule or cancel.
            </p>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell aside={aside}>
      {!slot ? (
        <>
          <h2 className="mb-4 text-sm font-bold">Pick a date and time</h2>
          <SlotPicker
            fetchRange={fetchRange}
            durationMinutes={detail.event.duration_minutes}
            viewerTimezone={viewerTimezone}
            onTimezoneChange={setViewerTimezone}
            hostTimezone={detail.host_timezone}
            firstBookableDay={detail.first_bookable_day}
            lastBookableDay={detail.last_bookable_day}
            onPick={setSlot}
          />
          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>
          ) : null}
        </>
      ) : (
        <form onSubmit={submit} className="mx-auto max-w-md space-y-3.5">
          <h2 className="text-sm font-bold">Your details</h2>
          {[
            ["name", "Your name", "text"],
            ["email", "Email address", "email"],
          ].map(([name, label, type]) => (
            <label key={name} className="block text-xs font-semibold">
              {label}
              <input
                required
                name={name}
                type={type}
                maxLength={name === "name" ? 200 : undefined}
                className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-[#fdfdfb] px-3 py-2.5 text-sm font-normal outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/5"
              />
            </label>
          ))}

          <QuestionFields
            questions={detail.questions}
            answers={answers}
            onChange={setAnswers}
          />

          <div>
            <label className="text-xs font-semibold">
              Invite others <span className="font-normal text-ink/35">Optional</span>
            </label>
            {invitees.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {invitees.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1.5 rounded-full bg-accent/[0.07] px-2.5 py-1 text-[11px] font-medium text-accent"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => setInvitees(invitees.filter((x) => x !== email))}
                      className="text-accent/50 hover:text-accent"
                      aria-label={`Remove ${email}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-1.5 flex gap-2">
              <input
                value={inviteeDraft}
                onChange={(e) => setInviteeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInvitee();
                  }
                }}
                type="email"
                placeholder="teammate@company.com"
                className="min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-[#fdfdfb] px-3 py-2.5 text-sm font-normal outline-none focus:border-accent/40"
              />
              <button
                type="button"
                onClick={addInvitee}
                disabled={invitees.length >= 10}
                className="rounded-xl border border-black/[0.08] px-3 text-xs font-semibold text-ink/60 hover:bg-canvas disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>

          <label className="block text-xs font-semibold">
            Anything we should know?{" "}
            <span className="font-normal text-ink/35">Optional</span>
            <textarea
              name="notes"
              maxLength={2000}
              rows={2}
              className="mt-1.5 w-full resize-none rounded-xl border border-black/[0.08] bg-[#fdfdfb] px-3 py-2.5 text-sm font-normal outline-none focus:border-accent/40"
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>
          ) : null}

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark disabled:opacity-50"
          >
            {submitting
              ? "Scheduling…"
              : `Schedule for ${invitees.length + 1} attendee${invitees.length ? "s" : ""}`}
          </button>
        </form>
      )}
    </PublicShell>
  );
}
