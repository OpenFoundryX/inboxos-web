"use client";

import Card from "@/components/ui/Card";
import TagListEditor from "@/components/ui/TagListEditor";
import type { Vip } from "@/lib/mailman";

type Props = {
  vip: Vip;
  disabled?: boolean;
  onChange: (patch: Partial<Vip>) => void;
};

export default function VipCard({ vip, disabled, onChange }: Props) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <div className="text-sm font-bold text-ink">VIP list</div>
        <div className="text-xs text-ink/50">
          These always break through batching and Do Not Disturb. Saving rebuilds your
          server-side Gmail filter, so it takes a few seconds.
        </div>
      </div>
      <TagListEditor label="Domains" placeholder="acme.com" values={vip.domains} disabled={disabled} onChange={(v) => onChange({ domains: v })} />
      <TagListEditor label="Addresses" placeholder="ceo@acme.com" values={vip.addresses} disabled={disabled} onChange={(v) => onChange({ addresses: v })} />
      <TagListEditor label="Keywords" placeholder="urgent" values={vip.keywords} disabled={disabled} onChange={(v) => onChange({ keywords: v })} />
    </Card>
  );
}
