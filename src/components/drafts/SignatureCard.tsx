"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

type SignatureCardProps = {
  enabled: boolean;
  signature: string | null;
  onPatch: (patch: {
    signature_enabled?: boolean;
    signature?: string | null;
  }) => void;
  disabled?: boolean;
};

export default function SignatureCard({
  enabled,
  signature,
  onPatch,
  disabled,
}: SignatureCardProps) {
  return (
    <>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-ink">
              Include a signature in drafts
            </div>
            <div className="text-xs text-ink/50">
              Turn this off if your organization already appends one
              automatically — otherwise you&apos;ll get two.
            </div>
          </div>
          <Toggle
            checked={enabled}
            disabled={disabled}
            onChange={(v) => onPatch({ signature_enabled: v })}
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-1 text-sm font-bold text-ink">Your signature</div>
        <div className="mb-3 text-xs text-ink/50">
          Appended to every draft exactly as written. When this is set, drafts
          are written without their own sign-off, so include one here.
        </div>
        <textarea
          value={signature ?? ""}
          disabled={disabled || !enabled}
          onChange={(e) => onPatch({ signature: e.target.value || null })}
          placeholder={"Best,\nNilesh\n\nInboxOS · nilesh@example.com"}
          className="h-32 w-full resize-none rounded-xl border border-black/10 bg-canvas p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-60"
        />
        {!enabled && (
          <div className="mt-2 text-xs text-ink/40">
            Signatures are switched off, so this isn&apos;t used right now.
          </div>
        )}
      </Card>
    </>
  );
}
