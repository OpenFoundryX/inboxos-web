"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Markdown from "@/components/chat/Markdown";
import StageIndicator from "@/components/chat/StageIndicator";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { ArrowRightIcon, ChevronDownIcon, PlusIcon, SendIcon, SparkleIcon } from "@/components/app/icons";
import { backendConfigured } from "@/lib/session";
import {
  getConversation,
  listConversations,
  streamAsk,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat";

/** Identifies the meeting a question is about, so the assistant answers from
 *  the right call rather than the whole calendar. */
export type InsightsScope = { title: string; when: string };

export default function InsightsPanel({
  scope = null,
  headline,
  subhead,
  suggestions,
}: {
  scope?: InsightsScope | null;
  headline: ReactNode;
  subhead: string;
  suggestions: string[];
}) {
  const configured = backendConfigured();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [streaming, setStreaming] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch {
      // The history menu going stale isn't worth an error state.
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    void refreshConversations();
  }, [configured, refreshConversations]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Follow the answer as it streams, the way a chat should.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, streamedText, stage]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setStage(null);
    setStreamedText("");
    setError(null);
  }, []);

  function startNew() {
    reset();
    setActiveId(null);
    setMessages([]);
  }

  async function openConversation(id: string) {
    reset();
    setActiveId(id);
    try {
      const detail = await getConversation(id);
      setMessages(detail.messages);
    } catch {
      setError("Couldn't load that conversation.");
      setMessages([]);
    }
  }

  const ask = useCallback(
    async (text: string) => {
      if (!configured) {
        setError("Insights need the InboxOS API. Set NEXT_PUBLIC_API_URL and reload.");
        return;
      }
      if (streaming) return;

      setError(null);
      setStreaming(true);
      setStage(null);
      setStreamedText("");

      setMessages((ms) => [
        ...ms,
        {
          id: `local-${Date.now()}`,
          role: "user",
          content: text,
          sources: [],
          actions: [],
          action_status: "none",
          action_results: [],
          created_at: new Date().toISOString(),
        },
      ]);

      // Name the meeting only when opening a conversation — once it's in the
      // transcript the assistant carries it, and repeating it on every turn
      // reads like the user keeps reintroducing the same call.
      const message =
        scope && activeId === null
          ? `About my meeting "${scope.title}" (${scope.when}): ${text}`
          : text;

      const controller = new AbortController();
      abortRef.current = controller;

      let conversationId = activeId;
      let answer = "";

      await streamAsk(
        { conversationId, message },
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
          // A terminal event can land after the user has already switched
          // conversations or left; applying it would write into a thread that
          // is no longer on screen.
          onError: (m) => {
            if (controller.signal.aborted) return;
            setStreaming(false);
            setStage(null);
            setStreamedText("");
            setError(m);
          },
          onDone: async () => {
            if (controller.signal.aborted) return;
            // Reload the persisted transcript: it carries real message ids and
            // the server's copy of the answer. The streamed text stays visible
            // until it lands, so the reply never blinks out.
            if (conversationId) {
              try {
                const detail = await getConversation(conversationId);
                if (controller.signal.aborted) return;
                setMessages(detail.messages);
              } catch {
                if (controller.signal.aborted) return;
                setError("Answer saved, but the transcript couldn't be reloaded.");
              }
            }
            setStreaming(false);
            setStage(null);
            setStreamedText("");
            void refreshConversations();
          },
        },
        controller.signal,
      );

      if (!controller.signal.aborted) setStreaming(false);
    },
    [activeId, configured, refreshConversations, scope, streaming],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    void ask(text);
  }

  const empty = messages.length === 0 && !streaming;

  return (
    <aside className="flex h-full w-full flex-col border-l border-black/5 bg-card">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <h2 className="text-sm font-bold text-ink">Insights</h2>
        <div className="flex items-center gap-1">
          {!empty ? (
            <button
              type="button"
              onClick={startNew}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New
            </button>
          ) : null}
          <Menu
            trigger={(open) => (
              <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink">
                Past conversations
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </span>
            )}
            panelClassName="max-h-80 w-72 overflow-y-auto"
          >
            {(close) =>
              conversations.length === 0 ? (
                <p className="px-3.5 py-2 text-xs text-ink/40">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <MenuItem
                    key={c.id}
                    onSelect={() => {
                      close();
                      void openConversation(c.id);
                    }}
                  >
                    {c.title}
                  </MenuItem>
                ))
              )
            }
          </Menu>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col justify-center px-6 py-8">
            <h3 className="text-2xl font-bold tracking-tight text-ink">{headline}</h3>
            <p className="mt-1.5 text-sm text-ink/50">{subhead}</p>

            <p className="mt-8 text-xs text-ink/40">Try asking:</p>
            <div className="mt-2.5 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="group flex w-full items-center gap-2.5 rounded-xl border border-black/5 bg-card px-3.5 py-3 text-left text-sm text-ink/70 transition-colors hover:border-accent/25 hover:bg-accent/5 hover:text-ink"
                >
                  <SparkleIcon className="h-4 w-4 shrink-0 text-ink/25 transition-colors group-hover:text-accent" />
                  <span className="min-w-0 flex-1">{s}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink/25 transition-colors group-hover:text-accent" />
                </button>
              ))}
            </div>

            {error ? <p className="mt-6 text-sm text-accent">{error}</p> : null}
          </div>
        ) : (
          <div className="space-y-4 px-5 py-5">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent/10 px-3.5 py-2 text-sm text-ink">
                    {m.content}
                  </p>
                </div>
              ) : (
                <Markdown key={m.id} text={m.content} />
              ),
            )}

            {streamedText ? <Markdown text={streamedText} /> : null}
            {streaming && !streamedText ? <StageIndicator label={stage} /> : null}
            {error ? <p className="text-sm text-accent">{error}</p> : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-black/5 p-4">
        <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-card py-2 pl-4 pr-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={scope ? "Ask about this meeting…" : "Ask about your meetings…"}
            aria-label="Ask about your meetings"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            type="submit"
            aria-label={streaming ? "Waiting for an answer" : "Send"}
            disabled={streaming || !draft.trim()}
            className={`shrink-0 rounded-full bg-accent p-2 text-white transition-colors hover:bg-accent-dark ${
              streaming ? "" : "disabled:opacity-30"
            }`}
          >
            {streaming ? (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </aside>
  );
}
