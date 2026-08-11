"use client";

import type { ChatUsage } from "@/lib/chat";

/** Token counts for one answer, as reported by the model provider.
 *
 *  These are exact rather than estimated — the API returns them with the
 *  response, so nothing here has to agree with a local tokenizer.
 *
 *  Deliberately understated: it sits under the answer in small muted text, so
 *  it is there when someone wants to know why a reply was slow or expensive,
 *  and easy to ignore the rest of the time. `prompt` is the interesting half —
 *  it is the retrieved mail corpus, and it is what moves when retrieval
 *  settings change.
 */
export default function UsageBadge({ usage }: { usage: ChatUsage | null }) {
  if (!usage || !usage.total_tokens) return null;

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/35"
      title={`${usage.prompt_tokens.toLocaleString()} prompt + ${usage.completion_tokens.toLocaleString()} completion tokens on ${usage.model}`}
    >
      <span className="font-medium text-ink/45">
        {usage.total_tokens.toLocaleString()} tokens
      </span>
      <span aria-hidden>·</span>
      <span>{usage.prompt_tokens.toLocaleString()} in</span>
      <span aria-hidden>·</span>
      <span>{usage.completion_tokens.toLocaleString()} out</span>
      {usage.model ? (
        <>
          <span aria-hidden>·</span>
          <span className="font-mono">{usage.model}</span>
        </>
      ) : null}
    </div>
  );
}
