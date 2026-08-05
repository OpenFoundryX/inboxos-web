"use client";

import { createContext, useContext } from "react";
import type { SlashCommandInfo } from "@/lib/chat";

type Prefill = {
  commands: SlashCommandInfo[];
  onPrefill: ((text: string) => void) | null;
};

const Ctx = createContext<Prefill>({ commands: [], onPrefill: null });

/**
 * Carries the command list and the input's setter down to Markdown, which
 * renders three levels below the page and would otherwise need both drilled
 * through MessageList and MessageBubble.
 */
export function PrefillProvider({
  commands,
  onPrefill,
  children,
}: Prefill & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ commands, onPrefill }}>{children}</Ctx.Provider>;
}

export const usePrefill = () => useContext(Ctx);
