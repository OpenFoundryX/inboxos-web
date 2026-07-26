"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AskBar from "@/components/app/AskBar";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import { backendConfigured } from "@/lib/session";
import {
  getConversation,
  listConversations,
  streamAsk,
  type ActionStatus,
  type ChatMessage,
  type ChatSource,
  type Conversation,
} from "@/lib/chat";

const NOT_CONFIGURED =
  "Chat needs the InboxPilot API. Set NEXT_PUBLIC_API_URL and reload.";

export default function ChatPage() {
  const configured = backendConfigured();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [streaming, setStreaming] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamedSources, setStreamedSources] = useState<ChatSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastQuestion = useRef<string>("");

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch {
      // Sidebar staying stale is not worth surfacing.
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    void refreshConversations();
  }, [configured, refreshConversations]);

  // Cancel any in-flight answer when the page unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function openConversation(id: string) {
    abortRef.current?.abort();
    setStreaming(false);
    setStreamedText("");
    setStreamedSources([]);
    setStage(null);
    setError(null);
    setActiveId(id);
    try {
      const detail = await getConversation(id);
      setMessages(detail.messages);
    } catch {
      setError("Couldn't load that conversation.");
      setMessages([]);
    }
  }

  function startNew() {
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setStreamedText("");
    setStreamedSources([]);
    setStage(null);
    setError(null);
    setStreaming(false);
  }

  function handleDeleted(id: string) {
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (id === activeId) startNew();
  }

  function resolveActions(messageId: string, status: ActionStatus, results: string[]) {
    setMessages((ms) =>
      ms.map((m) =>
        m.id === messageId ? { ...m, action_status: status, action_results: results } : m,
      ),
    );
  }

  const ask = useCallback(
    async (text: string) => {
      if (!configured) {
        setError(NOT_CONFIGURED);
        return;
      }

      lastQuestion.current = text;
      setError(null);
      setStreaming(true);
      setStage(null);
      setStreamedText("");
      setStreamedSources([]);

      // Optimistic user bubble; replaced by the server copy on reload.
      const localId = `local-${Date.now()}`;
      setMessages((ms) => [
        ...ms,
        {
          id: localId,
          role: "user",
          content: text,
          sources: [],
          actions: [],
          action_status: "none",
          action_results: [],
          created_at: new Date().toISOString(),
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      let conversationId = activeId;
      let answer = "";

      await streamAsk(
        { conversationId, message: text },
        {
          onConversation: (c) => {
            conversationId = c.id;
            setActiveId(c.id);
          },
          onStage: setStage,
          onToken: (t) => {
            answer += t;
            setStreamedText(answer);
          },
          onSources: (s) => setStreamedSources(s),
          onError: (m) => setError(m),
          onDone: async () => {
            setStreaming(false);
            setStage(null);
            setStreamedText("");
            setStreamedSources([]);
            // Reload the authoritative transcript: it carries real message ids
            // (needed to confirm actions) and the persisted assistant turn.
            if (conversationId) {
              try {
                const detail = await getConversation(conversationId);
                setMessages(detail.messages);
              } catch {
                setError("Answer saved, but the transcript couldn't be reloaded.");
              }
            }
            void refreshConversations();
          },
        },
        controller.signal,
      );

      // If the stream ended without `done` (network drop), stop the spinner.
      setStreaming(false);
    },
    [activeId, configured, refreshConversations],
  );

  const empty = messages.length === 0 && !streaming;

  return (
    <div className="flex h-screen">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => void openConversation(id)}
        onNew={startNew}
        onDeleted={handleDeleted}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <span className="mb-8 text-3xl font-extrabold tracking-tight text-accent">
              InboxOS
            </span>
            <div className="w-full max-w-2xl">
              <AskBar
                onSubmit={(t) => void ask(t)}
                disabled={streaming}
                placeholder="Ask me anything about your emails…"
              />
              {error ? <p className="mt-4 text-center text-sm text-accent">{error}</p> : null}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageList
                messages={messages}
                streaming={streaming}
                stage={stage}
                streamedText={streamedText}
                streamedSources={streamedSources}
                error={error}
                onRetry={() => void ask(lastQuestion.current)}
                onActionsResolved={resolveActions}
              />
            </div>
            <div className="border-t border-black/5 bg-cream px-4 py-4">
              <div className="mx-auto w-full max-w-3xl">
                <AskBar
                  onSubmit={(t) => void ask(t)}
                  disabled={streaming}
                  showChips={false}
                  placeholder="Ask a follow-up…"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
