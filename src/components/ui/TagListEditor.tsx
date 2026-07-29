"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/app/icons";

type TagListEditorProps = {
  label: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

export default function TagListEditor({
  label,
  placeholder,
  values,
  onChange,
  disabled,
}: TagListEditorProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-ink/70">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs text-ink">
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              disabled={disabled}
              className="text-ink/40 hover:text-ink disabled:opacity-50"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 ? <span className="text-xs text-ink/40">None yet</span> : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink hover:bg-ink/5 disabled:opacity-50"
          aria-label="Add"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
