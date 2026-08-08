"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import type { EventType, QuestionDef } from "@/lib/scheduling";

const DURATIONS = [15, 30, 45, 60, 90, 120];
const BUFFERS = [0, 5, 10, 15, 30, 45, 60];

const FIELD =
  "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent/40";

function blank(): Partial<EventType> {
  return {
    name: "",
    description: "",
    enabled: true,
    duration_minutes: 30,
    slot_interval_minutes: 15,
    minimum_notice_minutes: 120,
    booking_horizon_days: 60,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    max_bookings_per_day: null,
    questions: [],
  };
}

export default function EventTypeEditor({
  event,
  busy,
  onSave,
  onDelete,
  onCancel,
}: {
  event: EventType | null;
  busy: boolean;
  onSave: (values: Partial<EventType>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Partial<EventType>>(event ?? blank());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<EventType>) => setDraft({ ...draft, ...patch });

  const questions = draft.questions ?? [];
  const setQuestions = (next: QuestionDef[]) => set({ questions: next });

  function addQuestion() {
    setQuestions([
      ...questions,
      { key: "", label: "", type: "text", required: false, options: [] },
    ]);
  }

  function patchQuestion(index: number, patch: Partial<QuestionDef>) {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">
          {event ? `Edit ${event.name}` : "New meeting type"}
        </h2>
        <button onClick={onCancel} className="text-sm text-ink/50 hover:text-ink">
          ← Back
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-canvas px-5 py-4 text-sm font-bold">Basics</div>
        <div className="space-y-4 p-5">
          <label className="block text-sm font-semibold">
            Name
            <input
              value={draft.name ?? ""}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="30 Minute Meeting"
              className={FIELD}
            />
          </label>
          <label className="block text-sm font-semibold">
            Description <span className="font-normal text-ink/35">Optional</span>
            <textarea
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="What guests should expect from this meeting."
              className={`${FIELD} resize-none`}
            />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-black/5 p-4">
            <div>
              <span className="text-sm font-semibold">Accepting bookings</span>
              <p className="text-xs text-ink/45">
                Turning this off hides the link without deleting it.
              </p>
            </div>
            <Toggle
              checked={draft.enabled ?? true}
              onChange={(enabled) => set({ enabled })}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-canvas px-5 py-4 text-sm font-bold">Timing</div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Duration
            <select
              value={draft.duration_minutes}
              onChange={(e) => set({ duration_minutes: +e.target.value })}
              className={FIELD}
            >
              {DURATIONS.map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Start times every
            <select
              value={draft.slot_interval_minutes}
              onChange={(e) => set({ slot_interval_minutes: +e.target.value })}
              className={FIELD}
            >
              {[5, 10, 15, 20, 30, 60].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Buffer before
            <select
              value={draft.buffer_before_minutes}
              onChange={(e) => set({ buffer_before_minutes: +e.target.value })}
              className={FIELD}
            >
              {BUFFERS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "None" : `${n} minutes`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Buffer after
            <select
              value={draft.buffer_after_minutes}
              onChange={(e) => set({ buffer_after_minutes: +e.target.value })}
              className={FIELD}
            >
              {BUFFERS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "None" : `${n} minutes`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Minimum notice (minutes)
            <input
              type="number"
              min={0}
              value={draft.minimum_notice_minutes ?? 0}
              onChange={(e) => set({ minimum_notice_minutes: +e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="text-sm font-semibold">
            Bookable up to (days ahead)
            <input
              type="number"
              min={1}
              max={365}
              value={draft.booking_horizon_days ?? 60}
              onChange={(e) => set({ booking_horizon_days: +e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Maximum per day{" "}
            <span className="font-normal text-ink/35">Blank means no limit</span>
            <input
              type="number"
              min={1}
              max={100}
              value={draft.max_bookings_per_day ?? ""}
              onChange={(e) =>
                set({
                  max_bookings_per_day: e.target.value ? +e.target.value : null,
                })
              }
              className={FIELD}
            />
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-canvas px-5 py-4">
          <div className="text-sm font-bold">Booking questions</div>
          <button onClick={addQuestion} className="text-xs font-semibold text-accent">
            + Add question
          </button>
        </div>
        <div className="space-y-3 p-5">
          {questions.length === 0 ? (
            <p className="text-sm text-ink/45">
              Guests are asked for their name and email. Add questions to collect
              anything else before the meeting.
            </p>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="rounded-xl border border-black/5 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <label className="text-xs font-semibold">
                    Question
                    <input
                      value={question.label}
                      onChange={(e) => patchQuestion(index, { label: e.target.value })}
                      placeholder="What would you like to cover?"
                      className={FIELD}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Type
                    <select
                      value={question.type}
                      onChange={(e) =>
                        patchQuestion(index, {
                          type: e.target.value as QuestionDef["type"],
                        })
                      }
                      className={FIELD}
                    >
                      <option value="text">Short text</option>
                      <option value="textarea">Long text</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </label>
                </div>

                {question.type === "select" ? (
                  <label className="mt-3 block text-xs font-semibold">
                    Options <span className="font-normal text-ink/35">One per line</span>
                    <textarea
                      rows={3}
                      value={question.options.join("\n")}
                      onChange={(e) =>
                        patchQuestion(index, {
                          options: e.target.value.split("\n"),
                        })
                      }
                      className={`${FIELD} resize-none`}
                    />
                  </label>
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        patchQuestion(index, { required: e.target.checked })
                      }
                      className="accent-ink"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                    className="text-xs font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {onDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink/50">
                  Delete this type? Booked meetings are kept.
                </span>
                <button
                  onClick={onDelete}
                  disabled={busy}
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-ink/45"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            )
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={busy || !draft.name?.trim()}
            onClick={() => onSave(draft)}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save meeting type"}
          </button>
        </div>
      </div>
    </div>
  );
}
