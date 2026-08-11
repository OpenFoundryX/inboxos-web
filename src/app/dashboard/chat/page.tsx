"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AskBar from "@/components/app/AskBar";
import ConversationList from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import { PrefillProvider } from "@/components/chat/PrefillContext";
import { backendConfigured } from "@/lib/session";
import {
  getConversation,
  listCommands,
  listConversations,
  streamAsk,
  type ActionStatus,
  type ChatMessage,
  type ChatSource,
  type ChatUsage,
  type Conversation,
  type SlashCommandInfo,
} from "@/lib/chat";

const NOT_CONFIGURED =
  "Chat needs the InboxPilot API. Set NEXT_PUBLIC_API_URL and reload.";

export default function ChatPage() {
  const configured = backendConfigured();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [commands, setCommands] = useState<SlashCommandInfo[]>([]);

  const [streaming, setStreaming] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamedSources, setStreamedSources] = useState<ChatSource[]>([]);
  // Arrives once, after the final token, so it renders under a finished answer.
  const [streamedUsage, setStreamedUsage] = useState<ChatUsage | null>(null);
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

  // Fetched once: the surface only changes when the server ships a new one.
  useEffect(() => {
    if (!configured) return;
    void (async () => {
      try {
        setCommands(await listCommands());
      } catch {
        // No menu is a degraded input, not a broken one — typed commands
        // still work, so this is not worth an error banner.
      }
    })();
  }, [configured]);

  // Cancel any in-flight answer when the page unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function openConversation(id: string) {
    abortRef.current?.abort();
    setStreaming(false);
    setStreamedText("");
    setStreamedSources([]);
    setStreamedUsage(null);
    setStage(null);
    setError(null);
    setDraft("");
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
    setStreamedUsage(null);
    setStage(null);
    setError(null);
    setDraft("");
    setStreaming(false);
  }

  function handleDeleted(id: string) {
    setConversations((cs) => cs.filter((c) => c.id !== id));
    if (id === activeId) startNew();
  }

  function resolveActions(
    messageId: string,
    status: ActionStatus,
    results: string[],
  ) {
    setMessages((ms) =>
      ms.map((m) =>
        m.id === messageId
          ? { ...m, action_status: status, action_results: results }
          : m,
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
      setDraft("");
      setError(null);
      setStreaming(true);
      setStage(null);
      setStreamedText("");
      setStreamedSources([]);
      setStreamedUsage(null);

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
          onUsage: (u) => setStreamedUsage(u),
          onError: (m) => {
            // A stale error from a turn the user already navigated away from
            // (via startNew/openConversation aborting this controller) must
            // not touch state that now belongs to a different conversation.
            if (controller.signal.aborted) return;
            setStreaming(false);
            setStage(null);
            setStreamedText("");
            setStreamedSources([]);
            setStreamedUsage(null);
            const cid = conversationId;
            if (!cid) {
              setError(m);
              return;
            }
            // The backend commits the user turn before streaming, and on a
            // mid-stream failure persists whatever partial assistant reply
            // it produced — reload so the optimistic bubble is reconciled
            // against that instead of just showing an error over nothing.
            void (async () => {
              try {
                const detail = await getConversation(cid);
                if (controller.signal.aborted) return;
                setMessages(detail.messages);
              } catch {
                // Best effort — the error message below still gets shown.
              } finally {
                if (!controller.signal.aborted) setError(m);
              }
            })();
          },
          onDone: async () => {
            // Same guard as onError: this turn may have been aborted (new
            // chat / conversation switch) while `done` was already in
            // flight. Applying its reload now would clobber whatever the
            // user has since switched to.
            if (controller.signal.aborted) return;
            // Reload the authoritative transcript: it carries real message ids
            // (needed to confirm actions) and the persisted assistant turn.
            // The streamed answer stays on screen until that lands — clearing
            // it up front blanked the reply for the whole round-trip, which
            // read as the answer being thrown away.
            const cid = conversationId;
            if (cid) {
              try {
                const detail = await getConversation(cid);
                // Re-check after the await: the abort could have happened
                // while this request was in flight, which is the case that
                // actually matters (a check only before the await misses it).
                if (controller.signal.aborted) return;
                setMessages(detail.messages);
              } catch {
                if (controller.signal.aborted) return;
                setError(
                  "Answer saved, but the transcript couldn't be reloaded.",
                );
              }
            }
            // Batched with the setMessages above, so the streamed bubble is
            // swapped for the persisted one in a single paint.
            setStreaming(false);
            setStage(null);
            setStreamedText("");
            setStreamedSources([]);
            setStreamedUsage(null);
            void refreshConversations();
          },
        },
        controller.signal,
      );

      // Defensive fallback: onDone/onError already clear `streaming` on every
      // non-abort path, and streamAsk guarantees exactly one terminal
      // callback, so this is normally a no-op. Guarded the same way as
      // every other terminal write in this function so a stale settle from
      // an aborted turn A can't clobber a genuinely in-flight turn B.
      if (!controller.signal.aborted) setStreaming(false);
    },
    [activeId, configured, refreshConversations],
  );

  const empty = messages.length === 0 && !streaming;

  return (
    <PrefillProvider commands={commands} onPrefill={setDraft}>
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
              <span className="mb-8 text-3xl font-semibold tracking-tight text-accent">
                InboxOS
              </span>
              <div className="w-full max-w-2xl">
                <AskBar
                  onSubmit={(t) => void ask(t)}
                  disabled={streaming}
                  busy={streaming}
                  placeholder="Ask me anything about your emails…"
                  commands={commands}
                  value={draft}
                  onValueChange={setDraft}
                />
                <p className="mt-3 text-center text-xs text-ink/40">
                  Type <span className="font-mono text-ink/60">/</span> for
                  commands
                </p>
                {error ? (
                  <p className="mt-4 text-center text-sm text-accent">
                    {error}
                  </p>
                ) : null}
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
                  streamedUsage={streamedUsage}
                  error={error}
                  onRetry={() => void ask(lastQuestion.current)}
                  onActionsResolved={resolveActions}
                />
              </div>
              <div className="border-t border-black/5 bg-canvas px-4 py-4">
                <div className="mx-auto w-full max-w-3xl">
                  <AskBar
                    onSubmit={(t) => void ask(t)}
                    disabled={streaming}
                    busy={streaming}
                    showChips={false}
                    placeholder="Ask a follow-up, or / for commands…"
                    commands={commands}
                    value={draft}
                    onValueChange={setDraft}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </PrefillProvider>
  );
}
