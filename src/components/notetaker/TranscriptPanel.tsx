"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { CheckIcon, CopyIcon, SearchIcon } from "@/components/app/icons";

type Turn = { speaker: string | null; at: string | null; text: string };

/** "Ada:", "Ada [00:04]:" and "Ada (00:04:12):" — the shapes providers emit.
 *  Capped at 40 characters so a sentence that merely contains a colon isn't
 *  mistaken for a speaker label. */
const SPEAKER = /^([^:[(]{1,40}?)\s*(?:[[(](\d{1,2}:\d{2}(?::\d{2})?)[\])])?\s*:\s*(.*)$/;

function parseTurns(transcript: string): Turn[] {
  const turns: Turn[] = [];

  for (const raw of transcript.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const m = SPEAKER.exec(line);
    if (m) {
      turns.push({ speaker: m[1].trim(), at: m[2] ?? null, text: m[3].trim() });
      continue;
    }

    // A continuation of whoever is speaking, not a new turn.
    const last = turns[turns.length - 1];
    if (last) last.text = last.text ? `${last.text} ${line}` : line;
    else turns.push({ speaker: null, at: null, text: line });
  }

  return turns;
}

export default function TranscriptPanel({ transcript }: { transcript: string | null }) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const turns = useMemo(() => (transcript ? parseTurns(transcript) : []), [transcript]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return turns;
    return turns.filter(
      (t) => t.text.toLowerCase().includes(q) || (t.speaker?.toLowerCase().includes(q) ?? false),
    );
  }, [turns, query]);

  if (!transcript) {
    return (
      <Card className="px-5 py-12 text-center text-sm text-ink/50">
        No transcript yet — it appears once the recording finishes processing.
      </Card>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(transcript ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; nothing useful to say about it.
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the transcript"
            aria-label="Search the transcript"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label="Copy the transcript"
          title={copied ? "Copied" : "Copy transcript"}
          className="shrink-0 rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-ink/50">
          Nothing in the transcript matches &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <div className="space-y-4 px-5 py-5">
          {visible.map((turn, i) => (
            <div key={i}>
              {turn.speaker ? (
                <div className="mb-0.5 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-ink">{turn.speaker}</span>
                  {turn.at ? <span className="text-xs text-ink/35">{turn.at}</span> : null}
                </div>
              ) : null}
              <p className="text-sm leading-relaxed text-ink/70">{turn.text}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
