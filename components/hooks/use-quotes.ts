"use client";

import { useEffect, useRef, useState } from "react";

import type { QuoteMap } from "@/types/quote";

const REFRESH_MS = 5 * 60 * 1000;

type State = {
  quotes: QuoteMap;
  status: "loading" | "ready" | "error";
};

export function useQuotes(tickers: string[]): State {
  const [state, setState] = useState<State>({ quotes: {}, status: "loading" });
  const tickersKey = tickers.slice().sort().join(",");
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    const list = tickersKey ? tickersKey.split(",") : [];
    if (list.length === 0) {
      const timeoutId = window.setTimeout(() => {
        if (!cancelled.current) {
          setState({ quotes: {}, status: "ready" });
        }
      }, 0);

      return () => {
        cancelled.current = true;
        window.clearTimeout(timeoutId);
      };
    }

    async function load() {
      try {
        const res = await fetch(
          `/api/quote?tickers=${encodeURIComponent(tickersKey)}`,
        );
        if (!res.ok) {
          if (!cancelled.current) {
            setState((prev) => ({ ...prev, status: "error" }));
          }
          return;
        }
        const json = (await res.json()) as { quotes?: QuoteMap };
        if (cancelled.current) return;
        setState({ quotes: json.quotes ?? {}, status: "ready" });
      } catch {
        if (!cancelled.current) {
          setState((prev) => ({ ...prev, status: "error" }));
        }
      }
    }

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled.current = true;
      window.clearInterval(id);
    };
  }, [tickersKey]);

  return state;
}
