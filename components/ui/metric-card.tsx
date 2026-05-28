import { Term } from "./term";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricCard({ detail, label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
      <p className="text-xs text-zinc-500">
        <Term>{label}</Term>
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail && <p className="mt-1 text-xs text-zinc-400">{detail}</p>}
    </div>
  );
}
