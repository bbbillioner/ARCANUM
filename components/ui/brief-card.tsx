import type { MarketBrief } from "@/types/investing";

import { Card } from "./card";

type BriefCardProps = {
  brief: MarketBrief;
};

export function BriefCard({ brief }: BriefCardProps) {
  return (
    <Card eyebrow={brief.category} title={brief.title}>
      <p className="text-sm leading-6 text-zinc-400">{brief.summary}</p>
      <p className="mt-5 text-xs font-medium text-teal-200">{brief.readTime}</p>
    </Card>
  );
}
