"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useQuotes } from "@/components/hooks/use-quotes";
import { stockProfiles } from "@/data/stocks";
import { ARCANUM_CLOUD_DATA_LOADED_EVENT } from "@/lib/cloud-sync";
import { getCurrentPrice } from "@/lib/prices";
import { getWatchlist, removeFromWatchlist } from "@/lib/watchlist";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function WatchlistPage() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function loadWatchlist() {
      if (cancelled) return;
      setTickers(getWatchlist());
      setHydrated(true);
    }
    const timeoutId = window.setTimeout(loadWatchlist, 0);
    window.addEventListener(ARCANUM_CLOUD_DATA_LOADED_EVENT, loadWatchlist);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener(ARCANUM_CLOUD_DATA_LOADED_EVENT, loadWatchlist);
    };
  }, []);

  const knownTickers = useMemo(
    () =>
      tickers.filter((t) =>
        stockProfiles.some((p) => p.ticker.toUpperCase() === t),
      ),
    [tickers],
  );
  const { quotes } = useQuotes(knownTickers);

  function handleRemove(ticker: string) {
    const next = removeFromWatchlist(ticker);
    setTickers(next);
  }

  const rows = knownTickers
    .map((ticker) => {
      const profile = stockProfiles.find(
        (p) => p.ticker.toUpperCase() === ticker,
      );
      if (!profile) return null;
      const quote = quotes[ticker];
      const price = quote?.price ?? getCurrentPrice(ticker);
      const intraday = quote?.changePercent ?? 0;
      const isLive = quote?.source === "live";
      return { profile, price, intraday, isLive, ticker };
    })
    .filter(
      (r): r is {
        profile: (typeof stockProfiles)[number];
        price: number;
        intraday: number;
        isLive: boolean;
        ticker: string;
      } => r !== null,
    );

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Watchlist
          </span>
          <h1>
            Stocks you&apos;re <em>following.</em>
          </h1>
          <p className="lede">
            Add a stock from any research page. Watched tickers show live
            price, today&apos;s change, and a one-click jump to research.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="wrap" style={{ maxWidth: 920 }}>
          {!hydrated ? (
            <p style={{ color: "var(--muted)" }}>Loading…</p>
          ) : rows.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                padding: 40,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 14,
                }}
              >
                Empty watchlist
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  letterSpacing: "-0.01em",
                  marginBottom: 16,
                }}
              >
                Nothing followed <em>yet.</em>
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.96rem",
                  maxWidth: "44ch",
                  margin: "0 auto 24px",
                  lineHeight: 1.65,
                }}
              >
                Open any stock&apos;s research page and tap &quot;Add to
                watchlist&quot;. Followed stocks land here with cached market prices.
              </p>
              <Link className="btn btn-primary" href="/stocks">
                Browse stocks <span className="arrow">→</span>
              </Link>
            </div>
          ) : (
            <div
              style={{
                background: "var(--stroke)",
                border: "1px solid var(--stroke)",
                display: "grid",
                gap: 1,
              }}
            >
              {rows.map((row) => (
                <div
                  key={row.ticker}
                  style={{
                    background: "var(--surface)",
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr auto auto",
                    gap: 18,
                    alignItems: "center",
                  }}
                  className="wl-row-item"
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 600,
                        fontSize: "1.15rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {row.profile.ticker}
                    </p>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {row.profile.name}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "var(--accent)",
                      }}
                    >
                      {formatCurrency(row.price)}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.74rem",
                        color: row.intraday >= 0 ? "var(--accent)" : "#ff6878",
                        marginTop: 2,
                      }}
                    >
                      <span aria-hidden style={{ color: row.isLive ? "var(--accent)" : "var(--muted)" }}>
                        {row.isLive ? "●" : "○"}
                      </span>{" "}
                      {row.intraday >= 0 ? "+" : ""}
                      {row.intraday.toFixed(2)}% today
                    </p>
                  </div>
                  <Link
                    className="btn btn-ghost"
                    href={`/stocks/${row.profile.ticker}`}
                    style={{ padding: "0.6em 1em", fontSize: "0.82rem" }}
                  >
                    Research
                  </Link>
                  <button
                    aria-label={`Remove ${row.profile.ticker} from watchlist`}
                    onClick={() => handleRemove(row.profile.ticker)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--stroke)",
                      color: "var(--muted)",
                      cursor: "pointer",
                      width: 32,
                      height: 32,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#ff6878";
                      e.currentTarget.style.color = "#ff6878";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--stroke)";
                      e.currentTarget.style.color = "var(--muted)";
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .wl-row-item {
            grid-template-columns: 1fr auto !important;
          }
        }
      `}</style>
    </main>
  );
}
