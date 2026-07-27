import { apiFetch } from "./api";

export type ChatSource = {
  kind: string;
  title: string | null;
  sender: string | null;
  date: string | null;
  link: string | null;
  text: string;
  ref_id: string | null;
  thread_id: string | null;
  attachment_count: number;
};

export type ChatAction = { type: string; label: string; detail: string };

export type ActionStatus = "none" | "pending" | "confirmed" | "rejected";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
  actions: ChatAction[];
  action_status: ActionStatus;
  action_results: string[];
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  last_message_at: string | null;
};

export type ConversationDetail = Conversation & { messages: ChatMessage[] };

export const listConversations = () => apiFetch<Conversation[]>("/chat/conversations");

export const getConversation = (id: string) =>
  apiFetch<ConversationDetail>(`/chat/conversations/${id}`);

export const deleteConversation = (id: string) =>
  apiFetch<void>(`/chat/conversations/${id}`, { method: "DELETE" });

export const confirmActions = (messageId: string, approve: boolean) =>
  apiFetch<ChatMessage>(`/chat/messages/${messageId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ approve }),
  });

export type StreamHandlers = {
  onConversation?: (c: { id: string; title: string }) => void;
  onStage?: (label: string) => void;
  onToken?: (text: string) => void;
  onSources?: (sources: ChatSource[]) => void;
  onActions?: (actions: ChatAction[], summary: string) => void;
  onDone?: (messageId: string) => void;
  onError?: (message: string) => void;
};

/**
 * POST a question and consume the SSE response.
 *
 * `EventSource` can only GET, so this reads the body stream directly and
 * splits on the blank line that terminates each SSE frame.
 */
export async function streamAsk(
  body: { conversationId?: string | null; message: string },
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: body.conversationId ?? null,
        message: body.message,
      }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    handlers.onError?.("Couldn't reach the server.");
    return;
  }

  if (!res.ok || !res.body) {
    handlers.onError?.(
      res.status === 401 ? "Your session expired — please sign in again." : "Request failed.",
    );
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let seenTerminal = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let split = buffer.indexOf("\n\n");
      while (split !== -1) {
        const event = dispatch(buffer.slice(0, split), handlers);
        if (event === "done" || event === "error") seenTerminal = true;
        buffer = buffer.slice(split + 2);
        split = buffer.indexOf("\n\n");
      }
    }

    // Flush the decoder to capture any remaining bytes
    buffer += decoder.decode();

    // Drain any remaining complete frames from the buffer
    let split = buffer.indexOf("\n\n");
    while (split !== -1) {
      const event = dispatch(buffer.slice(0, split), handlers);
      if (event === "done" || event === "error") seenTerminal = true;
      buffer = buffer.slice(split + 2);
      split = buffer.indexOf("\n\n");
    }

    // If no terminal event was seen and the request was not aborted,
    // report an unexpected end
    if (!seenTerminal && !signal?.aborted) {
      handlers.onError?.("The answer ended unexpectedly. Please try again.");
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      handlers.onError?.("The connection dropped mid-answer.");
    }
  }
}

function dispatch(frame: string, handlers: StreamHandlers): string | null {
  let event = "";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!event || dataLines.length === 0) return null;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataLines.join("\n"));
  } catch {
    return null;
  }

  switch (event) {
    case "conversation":
      handlers.onConversation?.({ id: String(data.id), title: String(data.title) });
      break;
    case "stage":
      handlers.onStage?.(String(data.label));
      break;
    case "token":
      handlers.onToken?.(String(data.text));
      break;
    case "sources":
      handlers.onSources?.((data.sources as ChatSource[]) ?? []);
      break;
    case "actions":
      handlers.onActions?.((data.actions as ChatAction[]) ?? [], String(data.summary ?? ""));
      break;
    case "done":
      handlers.onDone?.(String(data.message_id));
      return "done";
    case "error":
      handlers.onError?.(String(data.message));
      return "error";
  }

  return event;
}
