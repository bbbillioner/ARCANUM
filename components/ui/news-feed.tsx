"use client";

import { useEffect, useState } from "react";

import { NewsCard } from "./news-card";
import type { NewsItem } from "@/types/news";

type NewsFeedProps = {
  tickers: string[];
  emptyMessage?: string;
};

type FetchState = "loading" | "ready" | "empty" | "error";

export function NewsFeed({
  tickers,
  emptyMessage = "No fresh news for your portfolio in the last day. Check back soon.",
}: NewsFeedProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (tickers.length === 0) {
        if (!cancelled) setState("empty");
        return;
      }

      try {
        const query = tickers.join(",");
        const response = await fetch(
          `/api/news?tickers=${encodeURIComponent(query)}`,
        );

        if (!response.ok) {
          if (!cancelled) setState("error");
          return;
        }

        const json = (await response.json()) as { news?: NewsItem[] };
        const news = json.news ?? [];

        if (cancelled) return;

        setItems(news);
        setState(news.length > 0 ? "ready" : "empty");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tickers.join(",")]);

  if (state === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
            key={i}
          />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.04] p-5">
        <p className="text-sm leading-6 text-rose-100">
          Could not load news right now. Try refreshing in a moment.
        </p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm leading-6 text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <NewsCard highlightTickers={tickers} item={item} key={item.id} />
      ))}
    </div>
  );
}
