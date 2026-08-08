"use client";

import type { QuestionDef } from "@/lib/scheduling";

/** Renders the host's custom booking questions.
 *
 *  Answers are held in one keyed object rather than as form fields, because
 *  the shape is decided by the host at runtime and `FormData` would need the
 *  same key-by-key reassembly on the way out anyway. */
export default function QuestionFields({
  questions,
  answers,
  onChange,
}: {
  questions: QuestionDef[];
  answers: Record<string, string | boolean>;
  onChange: (answers: Record<string, string | boolean>) => void;
}) {
  if (questions.length === 0) return null;

  const set = (key: string, value: string | boolean) =>
    onChange({ ...answers, [key]: value });

  const field =
    "mt-1.5 w-full rounded-xl border border-black/[0.08] bg-[#fdfdfb] px-3 py-2.5 text-sm font-normal outline-none transition focus:border-accent/40";

  return (
    <>
      {questions.map((question) => {
        const value = answers[question.key];

        if (question.type === "checkbox") {
          return (
            <label key={question.key} className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                required={question.required}
                checked={Boolean(value)}
                onChange={(e) => set(question.key, e.target.checked)}
                className="accent-accent"
              />
              {question.label}
              {question.required ? null : (
                <span className="font-normal text-ink/35">Optional</span>
              )}
            </label>
          );
        }

        return (
          <label key={question.key} className="block text-xs font-semibold">
            {question.label}
            {question.required ? null : (
              <span className="ml-1 font-normal text-ink/35">Optional</span>
            )}

            {question.type === "select" ? (
              <select
                required={question.required}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(question.key, e.target.value)}
                className={field}
              >
                <option value="">Select…</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : question.type === "textarea" ? (
              <textarea
                required={question.required}
                rows={2}
                maxLength={2000}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(question.key, e.target.value)}
                className={`${field} resize-none`}
              />
            ) : (
              <input
                required={question.required}
                type="text"
                maxLength={2000}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(question.key, e.target.value)}
                className={field}
              />
            )}
          </label>
        );
      })}
    </>
  );
}
