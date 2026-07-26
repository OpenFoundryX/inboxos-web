"use client";

import ActionConfirm from "./ActionConfirm";
import Markdown from "./Markdown";
import SourceList from "./SourceList";
import type { ActionStatus, ChatMessage } from "@/lib/chat";

export default function MessageBubble({
  message,
  onActionsResolved,
}: {
  message: ChatMessage;
  onActionsResolved: (messageId: string, status: ActionStatus, results: string[]) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-ink px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[85%] space-y-3">
      {message.content ? (
        <div className="rounded-2xl bg-card px-4 py-3">
          <Markdown text={message.content} />
          <SourceList sources={message.sources} />
        </div>
      ) : null}

      {message.actions.length > 0 ? (
        <ActionConfirm
          messageId={message.id}
          actions={message.actions}
          status={message.action_status}
          results={message.action_results}
          onResolved={(status, results) => onActionsResolved(message.id, status, results)}
        />
      ) : null}
    </div>
  );
}
