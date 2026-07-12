"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { allProfiles, searchProfiles, type AnyProfile } from "@/lib/stocks";

export function TickerSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const results: AnyProfile[] = useMemo(
    () => (query ? searchProfiles(query, 10) : allProfiles.slice(0, 10)),
    [query],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  function handleSelect(profile: AnyProfile) {
    router.push(`/stocks/${profile.ticker}`);
    close();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) handleSelect(target);
    }
  }

  return (
    <>
      <button
        aria-label="Search tickers"
        className="ticker-search-trigger"
        onClick={() => setOpen(true)}
        type="button"
      >
        <svg
          aria-hidden
          fill="none"
          height="14"
          viewBox="0 0 24 24"
          width="14"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 21l-4.5-4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
        <span className="ticker-search-label">Search</span>
        <span className="ticker-search-kbd">⌘K</span>
      </button>

      {open && (
        <div
          aria-label="Ticker search"
          className="ticker-search-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
        >
          <div className="ticker-search-panel">
            <div className="ticker-search-input-wrap">
              <svg
                aria-hidden
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                />
                <path
                  d="M21 21l-4.5-4.5"
                  stroke="var(--muted)"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
              <input
                aria-label="Search by ticker or company name"
                className="ticker-search-input"
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search a ticker or company…"
                ref={inputRef}
                type="text"
                value={query}
              />
              <button
                aria-label="Close search"
                className="ticker-search-close"
                onClick={close}
                type="button"
              >
                ESC
              </button>
            </div>

            <div className="ticker-search-results">
              {results.length === 0 ? (
                <div className="ticker-search-empty">
                  No match in our universe yet — try VOO, AAPL, NVDA, BRK-B…
                </div>
              ) : (
                results.map((profile, i) => (
                  <Link
                    className="ticker-search-row"
                    data-active={i === activeIndex}
                    href={`/stocks/${profile.ticker}`}
                    key={profile.ticker}
                    onClick={close}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="ts-ticker">{profile.ticker}</span>
                    <span className="ts-name">{profile.name}</span>
                    <span className="ts-meta">
                      <span className="ts-type">{profile.assetType}</span>
                      {profile.deep && <span className="ts-deep">Deep</span>}
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className="ticker-search-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ticker-search-trigger {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          color: var(--muted);
          font-family: var(--font-inter);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ticker-search-trigger:hover {
          border-color: var(--stroke-strong);
          color: var(--foreground);
        }
        .ticker-search-kbd {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          padding: 1px 5px;
          border: 1px solid var(--stroke);
          color: var(--muted);
          margin-left: 4px;
        }
        @media (max-width: 720px) {
          .ticker-search-label { display: none; }
          .ticker-search-kbd { display: none; }
          .ticker-search-trigger { padding: 8px; }
        }

        .ticker-search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 80px 20px 20px;
        }
        .ticker-search-panel {
          width: 100%;
          max-width: 600px;
          background: var(--surface);
          border: 1px solid var(--stroke-strong);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.8);
        }
        .ticker-search-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--stroke);
        }
        .ticker-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--foreground);
          font-family: var(--font-inter);
          font-size: 1.05rem;
          outline: none;
          font-weight: 400;
        }
        .ticker-search-input::placeholder { color: var(--muted); }
        .ticker-search-close {
          background: transparent;
          border: 1px solid var(--stroke);
          color: var(--muted);
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          padding: 4px 8px;
          cursor: pointer;
        }
        .ticker-search-close:hover {
          color: var(--foreground);
          border-color: var(--stroke-strong);
        }

        .ticker-search-results {
          max-height: 420px;
          overflow-y: auto;
        }
        .ticker-search-empty {
          padding: 32px 24px;
          color: var(--muted);
          font-size: 0.92rem;
          text-align: center;
        }
        .ticker-search-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 12px 18px;
          color: var(--foreground);
          text-decoration: none;
          border-bottom: 1px solid var(--stroke);
          transition: background 0.1s ease;
        }
        .ticker-search-row:last-child { border-bottom: none; }
        .ticker-search-row[data-active="true"] {
          background: var(--surface-2);
        }
        .ts-ticker {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 0.92rem;
          letter-spacing: 0.04em;
          color: var(--accent);
          min-width: 56px;
        }
        .ts-name {
          font-size: 0.9rem;
          color: var(--foreground);
        }
        .ts-meta {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .ts-type {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--stroke);
          padding: 2px 6px;
        }
        .ts-deep {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          border: 1px solid rgba(0, 229, 168, 0.4);
          padding: 2px 6px;
        }

        .ticker-search-footer {
          display: flex;
          gap: 18px;
          padding: 12px 18px;
          border-top: 1px solid var(--stroke);
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: var(--muted);
        }
        .ticker-search-footer kbd {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.65rem;
          padding: 1px 5px;
          border: 1px solid var(--stroke);
          margin-right: 3px;
          color: var(--foreground);
        }
      `}</style>
    </>
  );
}
