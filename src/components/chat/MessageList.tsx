"use client";

import { useEffect, useRef } from "react";
import Markdown from "./Markdown";
import MessageBubble from "./MessageBubble";
import SourceList from "./SourceList";
import StageIndicator from "./StageIndicator";
import UsageBadge from "./UsageBadge";
import type {
  ActionStatus,
  ChatMessage,
  ChatSource,
  ChatUsage,
} from "@/lib/chat";

export default function MessageList({
  messages,
  streaming,
  stage,
  streamedText,
  streamedSources,
  streamedUsage,
  error,
  onRetry,
  onActionsResolved,
}: {
  messages: ChatMessage[];
  streaming: boolean;
  stage: string | null;
  streamedText: string;
  streamedSources: ChatSource[];
  streamedUsage: ChatUsage | null;
  error: string | null;
  onRetry: () => void;
  onActionsResolved: (
    messageId: string,
    status: ActionStatus,
    results: string[],
  ) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  // Follow the answer as it streams in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, streamedText, stage, error]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onActionsResolved={onActionsResolved}
        />
      ))}

      {streaming ? (
        <div className="max-w-[85%] space-y-2">
          {/* Not gated on `stage`: the wait before the server's first event is
              exactly the gap that used to render as nothing at all. */}
          {streamedText ? null : <StageIndicator label={stage} />}
          {streamedText ? (
            <div className="rounded-2xl bg-card px-4 py-3">
              <Markdown text={streamedText} />
              <SourceList sources={streamedSources} />
              <UsageBadge usage={streamedUsage} />
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="max-w-[85%] rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-sm text-ink">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-accent hover:text-accent-dark"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
}
