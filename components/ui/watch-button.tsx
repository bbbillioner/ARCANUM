"use client";

import { useEffect, useState } from "react";

import {
  addToWatchlist,
  isWatched,
  removeFromWatchlist,
} from "@/lib/watchlist";

type WatchButtonProps = {
  ticker: string;
  className?: string;
};

export function WatchButton({ ticker, className }: WatchButtonProps) {
  const [watched, setWatched] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatched(isWatched(ticker));
    setHydrated(true);
  }, [ticker]);

  function handleToggle() {
    if (watched) {
      removeFromWatchlist(ticker);
      setWatched(false);
    } else {
      addToWatchlist(ticker);
      setWatched(true);
    }
  }

  return (
    <button
      aria-pressed={watched}
      className={`watch-button${className ? ` ${className}` : ""}`}
      data-active={watched}
      onClick={handleToggle}
      type="button"
    >
      <span aria-hidden className="watch-diamond" />
      <span>
        {hydrated ? (watched ? "Following" : "Add to watchlist") : "Add to watchlist"}
      </span>
      <style>{`
        .watch-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: transparent;
          color: var(--foreground);
          font-family: var(--font-inter);
          font-size: 0.88rem;
          font-weight: 500;
          border: 1px solid var(--stroke);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .watch-button:hover {
          border-color: var(--stroke-strong);
          background: var(--surface-2);
        }
        .watch-button[data-active="true"] {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(0, 229, 168, 0.06);
        }
        .watch-diamond {
          width: 8px;
          height: 8px;
          background: transparent;
          border: 1px solid var(--muted);
          transform: rotate(45deg);
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .watch-button[data-active="true"] .watch-diamond {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(0, 229, 168, 0.55);
        }
      `}</style>
    </button>
  );
}
