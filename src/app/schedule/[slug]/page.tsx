"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicShell from "@/components/scheduling/PublicShell";
import { getPublicProfile, type PublicProfile } from "@/lib/scheduling";

/** The host's index page: pick which kind of meeting to book.
 *
 *  Before event types existed this route *was* the booking flow, because a
 *  host had exactly one bookable thing. It is now a chooser, and the flow
 *  itself lives one level deeper at `/schedule/[slug]/[event]`.
 */
export default function ProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicProfile(params.slug)
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : "Scheduling link not found"));
  }, [params.slug]);

  if (!profile) {
    return (
      <PublicShell>
        <p className="grid min-h-[200px] place-items-center text-sm text-ink/45">
          {error || "Loading scheduling link…"}
        </p>
      </PublicShell>
    );
  }

  return (
    <PublicShell
      aside={
        <div className="flex h-full flex-col">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
            {profile.host_name.slice(0, 2).toUpperCase()}
          </div>
          <p className="mt-4 text-xs font-medium text-ink/45">{profile.host_name}</p>
          <h1 className="mt-1 text-lg font-bold tracking-[-0.02em]">Book a meeting</h1>
          <p className="mt-auto pt-7 text-[10px] leading-4 text-ink/30">
            Times are shown in your own zone once you pick a meeting. The host&apos;s
            calendar uses {profile.timezone.replaceAll("_", " ")}.
          </p>
        </div>
      }
    >
      <h2 className="text-sm font-bold">Choose a meeting type</h2>
      {profile.event_types.length === 0 ? (
        <p className="mt-6 text-sm text-ink/45">
          {profile.host_name} isn&apos;t taking bookings right now.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {profile.event_types.map((event) => (
            <li key={event.slug}>
              <Link
                href={`/schedule/${encodeURIComponent(profile.slug)}/${encodeURIComponent(event.slug)}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.07] bg-[#fdfdfb] p-4 transition hover:border-accent/40 hover:bg-accent/[0.03]"
              >
                <span className="min-w-0">
                  <b className="block text-sm">{event.name}</b>
                  <span className="mt-0.5 block text-xs text-ink/45">
                    {event.duration_minutes} minutes
                    {event.description ? ` · ${event.description}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-accent">Select →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PublicShell>
  );
}
