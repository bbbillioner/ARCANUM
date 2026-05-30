import Link from "next/link";

import { CompareChart } from "@/components/ui/compare-chart";
import { ComparePicker } from "@/components/ui/compare-picker";
import {
  getCurrentPrice,
  getPriceBars,
  getTimeframeChangePercent,
} from "@/lib/prices";
import { fetchQuotes } from "@/lib/quote";
import { allProfiles, getAnyProfile, type AnyProfile } from "@/lib/stocks";
import type { Quote } from "@/types/quote";

type CompareSearchParams = {
  searchParams: Promise<{ a?: string; b?: string }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function pctColor(value: number) {
  return value >= 0 ? "var(--accent)" : "#ff6878";
}

function CompareColumn({
  profile,
  quote,
}: {
  profile: AnyProfile;
  quote: Quote | undefined;
}) {
  const price = quote?.price ?? getCurrentPrice(profile.ticker);
  const today = quote?.changePercent ?? 0;
  const change1M = getTimeframeChangePercent(profile.ticker, "1M");
  const change6M = getTimeframeChangePercent(profile.ticker, "6M");
  const change1Y = getTimeframeChangePercent(profile.ticker, "1Y");
  const change5Y = getTimeframeChangePercent(profile.ticker, "5Y");
  const riskLabel = {
    low: "Low",
    moderate: "Moderate",
    elevated: "Elevated",
  }[profile.beginnerRiskLevel];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--stroke)",
        padding: 26,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <Link
            href={`/stocks/${profile.ticker}`}
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontWeight: 600,
              fontSize: "2rem",
              letterSpacing: "0.03em",
              color: "var(--foreground)",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            {profile.ticker}
          </Link>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              border: "1px solid var(--stroke)",
              padding: "3px 8px",
            }}
          >
            {profile.assetType}
          </span>
        </div>
        <p style={{ fontSize: "0.96rem", color: "var(--muted)", marginTop: 8 }}>
          {profile.name}
        </p>
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Price
        </p>
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontWeight: 600,
            fontSize: "1.8rem",
            color: "var(--accent)",
            marginTop: 6,
            lineHeight: 1,
          }}
        >
          {formatCurrency(price)}
        </p>
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.86rem",
            color: pctColor(today),
            marginTop: 4,
          }}
        >
          {formatPercent(today)} today
        </p>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          margin: 0,
        }}
      >
        {[
          { label: "1M", value: change1M },
          { label: "6M", value: change6M },
          { label: "1Y", value: change1Y },
          { label: "5Y", value: change5Y },
        ].map((tf) => (
          <div
            key={tf.label}
            style={{
              border: "1px solid var(--stroke)",
              padding: "10px 12px",
            }}
          >
            <dt
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {tf.label}
            </dt>
            <dd
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: pctColor(tf.value),
                marginTop: 4,
                margin: 0,
              }}
            >
              {formatPercent(tf.value)}
            </dd>
          </div>
        ))}
      </dl>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div style={{ border: "1px solid var(--stroke)", padding: "10px 12px" }}>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Sector
          </p>
          <p
            style={{ fontSize: "0.86rem", marginTop: 4, color: "var(--foreground)" }}
          >
            {profile.sector}
          </p>
        </div>
        <div style={{ border: "1px solid var(--stroke)", padding: "10px 12px" }}>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Risk
          </p>
          <p
            style={{
              fontSize: "0.86rem",
              marginTop: 4,
              color: profile.beginnerRiskLevel === "low" ? "var(--accent)" : "var(--foreground)",
            }}
          >
            {riskLabel}
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--muted)",
          lineHeight: 1.6,
          marginTop: "auto",
        }}
      >
        {profile.beginnerSummary}
      </p>
    </div>
  );
}

export default async function ComparePage({ searchParams }: CompareSearchParams) {
  const sp = await searchParams;
  const aTicker = (sp.a ?? "VOO").toUpperCase();
  const bTicker = (sp.b ?? "QQQ").toUpperCase();

  const a = getAnyProfile(aTicker) ?? allProfiles[0];
  const b =
    getAnyProfile(bTicker === aTicker ? "" : bTicker) ??
    allProfiles.find((p) => p.ticker !== a.ticker) ??
    allProfiles[1];

  const quotes = await fetchQuotes([a.ticker, b.ticker]);
  const aBars = getPriceBars(a.ticker);
  const bBars = getPriceBars(b.ticker);

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Compare
          </span>
          <h1>
            Two tickers, <em>side by side.</em>
          </h1>
          <p className="lede">
            Beginners learn ETFs and stocks by comparing them. Pick any two
            from the dropdowns — the normalised chart shows percent growth
            from the same starting point, so dollar prices don&apos;t mislead.
          </p>
          <div style={{ marginTop: 26, maxWidth: 720 }}>
            <ComparePicker initialA={a.ticker} initialB={b.ticker} />
          </div>
        </div>
      </section>

      {/* COLUMNS */}
      <section className="block">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
            className="cmp-cols"
          >
            <CompareColumn profile={a} quote={quotes[a.ticker]} />
            <CompareColumn profile={b} quote={quotes[b.ticker]} />
          </div>
        </div>
      </section>

      {/* OVERLAY CHART */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Five-year normalised
            </span>
            <h2>
              Same start, <em>true comparison.</em>
            </h2>
            <p>
              Both lines start at <span style={{ color: "var(--accent)" }}>100</span>{" "}
              on the leftmost date. From there, each line shows the percent
              growth of $100 invested at that moment. Higher = grown more.
            </p>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 22,
                marginBottom: 14,
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.78rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    width: 12,
                    height: 2,
                    background: "rgba(0, 229, 168, 1)",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {a.ticker}
                </span>
                <span style={{ color: "var(--muted)" }}>{a.name}</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    width: 12,
                    height: 2,
                    background: "rgba(240, 183, 110, 1)",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "rgba(240, 183, 110, 1)", fontWeight: 600 }}>
                  {b.ticker}
                </span>
                <span style={{ color: "var(--muted)" }}>{b.name}</span>
              </span>
            </div>
            <CompareChart
              aBars={aBars}
              aTicker={a.ticker}
              bBars={bBars}
              bTicker={b.ticker}
            />
          </div>
        </div>
      </section>

      {/* HOW TO READ */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              How to read this
            </span>
            <h2>
              What a comparison <em>tells you</em> and what it doesn&apos;t.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                label: "What it shows",
                body:
                  "Relative percent growth over the same window. A line ending at 180 means $100 invested at the start would be $180 now.",
              },
              {
                label: "What it hides",
                body:
                  "Volatility along the way. Two assets can end at the same point but take very different paths. Look at the chart shape, not just the endpoints.",
              },
              {
                label: "What it ignores",
                body:
                  "Dividends, fees, and taxes. These charts use unadjusted close prices, so a dividend-heavy ETF actually returned more than this overlay suggests.",
              },
            ].map((item) => (
              <div key={item.label} className="card-line">
                <h3>{item.label}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .cmp-cols {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
