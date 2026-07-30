"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

type InstructionsCardProps = {
  enabled: boolean;
  text: string | null;
  onPatch: (patch: {
    custom_instructions_enabled?: boolean;
    custom_instructions?: string | null;
  }) => void;
  disabled?: boolean;
};

/** Free-text drafting instructions. The toggle is separate from the text so
 *  switching them off keeps them for later instead of making the user retype. */
export default function InstructionsCard({
  enabled,
  text,
  onPatch,
  disabled,
}: InstructionsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-ink">
            Enable custom instructions
          </div>
          <div className="text-xs text-ink/50">
            Personal rules for how drafts are written. These override the tone
            and length settings where they conflict.
          </div>
        </div>
        <Toggle
          checked={enabled}
          disabled={disabled}
          onChange={(v) => onPatch({ custom_instructions_enabled: v })}
        />
      </div>

      {enabled && (
        <div className="mt-4">
          <textarea
            value={text ?? ""}
            disabled={disabled}
            // Empty string is sent as null so clearing the box erases the stored
            // value rather than saving a blank one.
            onChange={(e) =>
              onPatch({ custom_instructions: e.target.value || null })
            }
            placeholder={
              "e.g. Always offer two meeting times rather than asking for theirs.\n" +
              "Never commit to a deadline — say I'll confirm and follow up.\n" +
              "Sign off as Nilesh, not my full name."
            }
            className="h-36 w-full resize-none rounded-xl border border-black/10 bg-canvas p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-60"
          />
          <div className="mt-1 text-xs text-ink/40">
            One instruction per line works best.
          </div>
        </div>
      )}
    </Card>
  );
}
