"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { allProfiles } from "@/lib/stocks";

type ComparePickerProps = {
  initialA: string;
  initialB: string;
};

export function ComparePicker({ initialA, initialB }: ComparePickerProps) {
  const router = useRouter();
  const params = useSearchParams();

  function update(side: "a" | "b", value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(side, value);
    router.push(`/compare?${next.toString()}`);
  }

  function swap() {
    const a = params.get("a") ?? initialA;
    const b = params.get("b") ?? initialB;
    const next = new URLSearchParams();
    next.set("a", b);
    next.set("b", a);
    router.push(`/compare?${next.toString()}`);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 10,
        alignItems: "center",
      }}
      className="cmp-picker"
    >
      <select
        aria-label="First ticker"
        className="cmp-select"
        defaultValue={initialA}
        onChange={(e) => update("a", e.target.value)}
      >
        {allProfiles.map((p) => (
          <option key={p.ticker} value={p.ticker}>
            {p.ticker} · {p.name}
          </option>
        ))}
      </select>

      <button
        aria-label="Swap"
        className="cmp-swap"
        onClick={swap}
        type="button"
      >
        ⇄
      </button>

      <select
        aria-label="Second ticker"
        className="cmp-select"
        defaultValue={initialB}
        onChange={(e) => update("b", e.target.value)}
      >
        {allProfiles.map((p) => (
          <option key={p.ticker} value={p.ticker}>
            {p.ticker} · {p.name}
          </option>
        ))}
      </select>

      <style>{`
        .cmp-select {
          width: 100%;
          height: 48px;
          background: var(--surface-2);
          border: 1px solid var(--stroke);
          color: var(--foreground);
          padding: 0 14px;
          font-family: var(--font-inter);
          font-size: 0.96rem;
          font-weight: 500;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .cmp-select:hover { border-color: var(--stroke-strong); }
        .cmp-select:focus { border-color: var(--accent); background: var(--surface); }
        .cmp-swap {
          width: 48px;
          height: 48px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          color: var(--accent);
          font-family: var(--font-jetbrains-mono);
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .cmp-swap:hover { background: var(--surface-2); border-color: var(--accent); }
        @media (max-width: 640px) {
          .cmp-picker {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
