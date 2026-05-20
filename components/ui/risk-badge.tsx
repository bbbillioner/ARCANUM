import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/investing";

type RiskBadgeProps = {
  level: RiskLevel;
};

const riskStyles: Record<RiskLevel, string> = {
  low: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  moderate: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  elevated: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  elevated: "Elevated risk",
};

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold",
        riskStyles[level],
      )}
    >
      {riskLabels[level]}
    </span>
  );
}
