import type { AllocationSegment } from "@/types/investing";

type AllocationBarProps = {
  segments: AllocationSegment[];
};

export function AllocationBar({ segments }: AllocationBarProps) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {segments.map((segment) => (
          <div
            className={segment.colorClass}
            key={segment.label}
            style={{ width: `${segment.percentage}%` }}
            title={`${segment.label}: ${segment.percentage}%`}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
        {segments.map((segment) => (
          <div className="flex items-center gap-2" key={segment.label}>
            <span className={`h-2 w-2 rounded-full ${segment.colorClass}`} />
            <span>
              {segment.label} {segment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
