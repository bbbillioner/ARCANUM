import Link from "next/link";

import { ChartPanel } from "@/components/ui/chart-panel";
import { stockProfiles } from "@/data/stocks";
import {
  formatFetchedAt,
  getCurrentPrice,
  getFetchedAt,
  getPriceBars,
  getTimeframeChangePercent,
  sliceByTimeframe,
} from "@/lib/prices";
import type { StockProfile } from "@/types/investing";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function StockRow({ profile }: { profile: StockProfile }) {
  const currentPrice = getCurrentPrice(profile.ticker);
  const change1Y = getTimeframeChangePercent(profile.ticker, "1Y");
  const change6M = getTimeframeChangePercent(profile.ticker, "6M");
  const change1M = getTimeframeChangePercent(profile.ticker, "1M");
  const panelBars = sliceByTimeframe(getPriceBars(profile.ticker), "1Y");
  const positive = change1Y >= 0;

  return (
    <Link className="stock-row" href={`/stocks/${profile.ticker}`}>
      <div className="sr-header">
        <div>
          <p className="sr-ticker">{profile.ticker}</p>
          <p className="sr-name">{profile.name}</p>
        </div>
        <div className="sr-meta">
          <span className="sr-type">{profile.assetType}</span>
          <span className="sr-price">{formatCurrency(currentPrice)}</span>
        </div>
      </div>

      <div className="sr-sector">{profile.sector}</div>

      <div className="sr-chart">
        <ChartPanel bars={panelBars} height={110} positive={positive} />
      </div>

      <div className="sr-changes">
        {[
          { label: "1M", value: change1M },
          { label: "6M", value: change6M },
          { label: "1Y", value: change1Y },
        ].map((tf) => (
          <div className="sr-tf" key={tf.label}>
            <p className="sr-tf-label">{tf.label}</p>
            <p className={`sr-tf-value ${tf.value >= 0 ? "up" : "down"}`}>
              {tf.value >= 0 ? "+" : ""}
              {tf.value.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      <p className="sr-summary">{profile.beginnerSummary}</p>

      <p className="sr-cta">
        Open research <span className="arrow">→</span>
      </p>

      <style>{`
        .stock-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          padding: 26px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .stock-row:hover {
          border-color: var(--accent);
          background: var(--surface-2);
        }
        .stock-row:hover .arrow {
          transform: translateX(3px);
        }
        .sr-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }
        .sr-ticker {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 1.9rem;
          letter-spacing: 0.03em;
          line-height: 1;
          color: var(--foreground);
        }
        .sr-name {
          font-size: 0.92rem;
          color: var(--muted);
          margin-top: 6px;
        }
        .sr-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .sr-type {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--stroke);
          padding: 3px 8px;
        }
        .sr-price {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--accent);
        }
        .sr-sector {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .sr-changes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--stroke);
          border-bottom: 1px solid var(--stroke);
        }
        .sr-tf {
          padding: 12px 8px;
          text-align: center;
          border-right: 1px solid var(--stroke);
        }
        .sr-tf:last-child {
          border-right: none;
        }
        .sr-tf-label {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .sr-tf-value {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 4px;
        }
        .sr-tf-value.up { color: var(--accent); }
        .sr-tf-value.down { color: #ff6878; }
        .sr-summary {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sr-cta {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: auto;
        }
        .arrow {
          display: inline-block;
          transition: transform 0.25s ease;
        }
      `}</style>
    </Link>
  );
}

export default function StocksPage() {
  const etfs = stockProfiles.filter((p) => p.assetType === "ETF");
  const stocks = stockProfiles.filter((p) => p.assetType === "Stock");
  const firstTicker = stockProfiles[0]?.ticker;
  const fetchedAt = firstTicker ? getFetchedAt(firstTicker) : null;

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Research
          </span>
          <h1>
            Stock and ETF <em>research.</em>
          </h1>
          <p className="lede">
            Browse the stocks and ETFs ARCANUM uses to teach portfolio
            decisions. Real five-year prices from Yahoo Finance.
          </p>
          {fetchedAt && (
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: 18,
              }}
            >
              Prices as of {formatFetchedAt(fetchedAt)}
            </p>
          )}
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              ETFs
            </span>
            <h2>
              Diversified <em>building blocks.</em>
            </h2>
            <p>
              Exchange-traded funds give exposure to many companies in one
              holding. ARCANUM uses these as the structural foundation of
              starter portfolios.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {etfs.map((profile) => (
              <StockRow key={profile.ticker} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Individual stocks
            </span>
            <h2>
              Single companies, <em>single theses.</em>
            </h2>
            <p>
              Owning one company concentrates outcome on that company&apos;s
              decisions, market, and execution. Each profile explains the thesis
              and the risk.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {stocks.map((profile) => (
              <StockRow key={profile.ticker} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Next move
          </span>
          <h2>
            Practice these in a <em>portfolio.</em>
          </h2>
          <p>
            The simulator lets you allocate fake cash across any of these assets
            and watch cost basis, market value, and gain or loss update against
            real historical prices.
          </p>
          <Link className="btn btn-primary" href="/simulator">
            Open simulator <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
