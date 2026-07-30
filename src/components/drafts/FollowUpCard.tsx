"use client";

import Card from "@/components/ui/Card";
import Stepper from "@/components/ui/Stepper";
import Toggle from "@/components/ui/Toggle";

type FollowUpCardProps = {
  enabled: boolean;
  days: number;
  onPatch: (patch: {
    follow_up_enabled?: boolean;
    follow_up_days?: number;
  }) => void;
  disabled?: boolean;
};

export default function FollowUpCard({
  enabled,
  days,
  onPatch,
  disabled,
}: FollowUpCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-ink">
            Enable follow-up drafts
          </div>
          <div className="text-xs text-ink/50">
            Drafts a nudge for mail you sent that never got a reply.
          </div>
        </div>
        <Toggle
          checked={enabled}
          disabled={disabled}
          onChange={(v) => onPatch({ follow_up_enabled: v })}
        />
      </div>

      {enabled && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-ink/70">
            Days to wait before following up
          </div>
          <Stepper
            value={days}
            onChange={(v) => onPatch({ follow_up_days: v })}
            min={1}
            max={30}
            suffix="days"
          />
          <div className="mt-2 text-xs text-ink/40">
            Checked once a day. Threads where the other person replied are
            skipped.
          </div>
        </div>
      )}
    </Card>
  );
}
