"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import AvailabilityTab from "@/components/app/scheduling/AvailabilityTab";
import BookingsTab from "@/components/app/scheduling/BookingsTab";
import DraftsTab from "@/components/app/scheduling/DraftsTab";
import EventTypesTab from "@/components/app/scheduling/EventTypesTab";
import Tabs from "@/components/ui/Tabs";
import {
  getSchedulingSettings,
  updateSchedulingSettings,
  type SchedulingSettings,
} from "@/lib/scheduling";

const TABS = ["Event types", "Availability", "Bookings", "Drafts"];

/**
 * Owns the profile and nothing else.
 *
 * Each tab loads and saves its own resource — event types, overrides,
 * bookings — because they are independent endpoints and hoisting all of them
 * here made one page-level `save()` that shipped every field on every edit.
 * The profile is the exception: three of the four tabs read the host's time
 * zone, so it is fetched once here and passed down.
 */
export default function SchedulingPage() {
  const [tab, setTab] = useState(TABS[0]);
  const [settings, setSettings] = useState<SchedulingSettings | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSchedulingSettings()
      .then(setSettings)
      .catch((e) =>
        setMessage(e instanceof Error ? e.message : "Could not load scheduling"),
      );
  }, []);

  const saveSettings = useCallback(async (patch: Partial<SchedulingSettings>) => {
    const next = await updateSchedulingSettings(patch);
    setSettings(next);
    return next;
  }, []);

  if (!settings) {
    return (
      <>
        <Topbar title="Scheduling" />
        <div className="p-8 text-sm text-ink/50">
          {message || "Loading scheduling preferences…"}
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Scheduling">
        {message ? <span className="text-sm text-ink/50">{message}</span> : null}
      </Topbar>
      <div className="p-5 md:p-8">
        <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />
        {tab === "Event types" ? (
          <EventTypesTab settings={settings} onSaveSettings={saveSettings} onNotify={setMessage} />
        ) : tab === "Availability" ? (
          <AvailabilityTab settings={settings} onSaveSettings={saveSettings} onNotify={setMessage} />
        ) : tab === "Bookings" ? (
          <BookingsTab timezone={settings.timezone} onNotify={setMessage} />
        ) : (
          <DraftsTab settings={settings} onSaveSettings={saveSettings} onNotify={setMessage} />
        )}
      </div>
    </>
  );
}
