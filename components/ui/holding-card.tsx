import type { HomepageHolding } from "@/types/home";

import { Card } from "./card";
import { RiskBadge } from "./risk-badge";

type HoldingCardProps = {
  holding: HomepageHolding;
};

export function HoldingCard({ holding }: HoldingCardProps) {
  return (
    <Card eyebrow="Holding" title={holding.name}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-white">{holding.symbol}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {holding.summary}
          </p>
        </div>
        <RiskBadge level={holding.riskLevel} />
      </div>
    </Card>
  );
}
