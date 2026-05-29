import Link from "next/link";

import { ChartFull } from "@/components/ui/chart-full";
import { NewsCard } from "@/components/ui/news-card";
import { stockProfiles } from "@/data/stocks";
import { fetchTickerNews } from "@/lib/news";
import {
  formatFetchedAt,
  getCurrentPrice,
  getFetchedAt,
  getPriceBars,
  getTimeframeChangePercent,
} from "@/lib/prices";

type StockPageProps = {
  params: Promise<{ ticker: string }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function generateStaticParams() {
  return stockProfiles.map((profile) => ({ ticker: profile.ticker }));
}

export default async function StockResearchPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const normalizedTicker = ticker.toUpperCase();
  const profile = stockProfiles.find(
    (p) => p.ticker.toUpperCase() === normalizedTicker,
  );

  if (!profile) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap" style={{ maxWidth: 640 }}>
            <span className="eyebrow">
              <span className="gem" />
              Not found
            </span>
            <h1>
              No research <em>profile.</em>
            </h1>
            <p className="lede">
              ARCANUM does not have a static profile for {normalizedTicker} yet.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href="/stocks">
                Back to all stocks <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const news = await fetchTickerNews(normalizedTicker, 6);
  const currentPrice = getCurrentPrice(profile.ticker);
  const change1Y = getTimeframeChangePercent(profile.ticker, "1Y");
  const fetchedAt = getFetchedAt(profile.ticker);
  const positive = change1Y >= 0;

  return (
    <main>
      {/* HERO */}
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Research · {profile.assetType}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 32,
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  letterSpacing: "0.18em",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                {profile.ticker}
              </p>
              <h1 style={{ marginBottom: 14 }}>{profile.name}</h1>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {profile.sector}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                Last close
              </p>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontWeight: 600,
                  fontSize: "2.4rem",
                  letterSpacing: "-0.02em",
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                {formatCurrency(currentPrice)}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.92rem",
                  color: positive ? "var(--accent)" : "#ff6878",
                  marginTop: 8,
                }}
              >
                {positive ? "+" : ""}
                {change1Y.toFixed(2)}%{" "}
                <span style={{ color: "var(--muted)" }}>1Y</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHART */}
      <section className="block" style={{ paddingTop: "clamp(2rem,4vw,3rem)" }}>
        <div className="wrap">
          <ChartFull bars={getPriceBars(profile.ticker)} defaultTimeframe="1Y" />
          {fetchedAt && (
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: 14,
                textAlign: "right",
              }}
            >
              Prices via Yahoo Finance · {formatFetchedAt(fetchedAt)}
            </p>
          )}
        </div>
      </section>

      {/* NEWS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              In the news
            </span>
            <h2>
              Recent stories on <em>{profile.ticker}.</em>
            </h2>
            <p>
              Fresh headlines from Yahoo Finance, updated every 30 minutes. When
              we can read a clear topic, a one-line beginner cue is added.
            </p>
          </div>
          {news.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                padding: 24,
              }}
            >
              <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
                No recent news for {profile.ticker} right now. Check back in a
                bit.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {news.map((item) => (
                <NewsCard
                  highlightTickers={[profile.ticker]}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COMPANY + BUSINESS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
            className="sd-2col"
          >
            <div className="card-line">
              <h3>Company / Fund Summary</h3>
              <p>{profile.companySummary}</p>
            </div>
            <div className="card-line">
              <h3>Business Model</h3>
              <p>{profile.businessModel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY + RISKS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
            className="sd-2col"
          >
            <div className="card-line">
              <h3>Why people invest</h3>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "16px 0 0",
                  display: "grid",
                  gap: 12,
                }}
              >
                {profile.whyPeopleInvest.map((reason, index) => (
                  <li
                    key={reason}
                    style={{
                      display: "flex",
                      gap: 14,
                      paddingTop: 10,
                      borderTop: index === 0 ? "none" : "1px solid var(--stroke)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        color: "var(--accent)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      0{index + 1}
                    </span>
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontSize: "0.92rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {reason}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-line">
              <h3>Key risks</h3>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "16px 0 0",
                  display: "grid",
                  gap: 12,
                }}
              >
                {profile.keyRisks.map((risk, index) => (
                  <li
                    key={risk}
                    style={{
                      display: "flex",
                      gap: 14,
                      paddingTop: 10,
                      borderTop: index === 0 ? "none" : "1px solid var(--stroke)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        color: "#ff6878",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      0{index + 1}
                    </span>
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontSize: "0.92rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {risk}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* SCENARIOS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Scenarios
            </span>
            <h2>
              Bull, base, and <em>bear cases.</em>
            </h2>
            <p>
              A serious investor doesn&apos;t need to predict the future. They
              need to understand what different outcomes could look like.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              background: "var(--stroke)",
              border: "1px solid var(--stroke)",
            }}
          >
            <div style={{ background: "var(--surface)", padding: 28 }}>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 14,
                }}
              >
                Bull case
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.94rem",
                  lineHeight: 1.65,
                }}
              >
                {profile.bullCase}
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: 28 }}>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 14,
                }}
              >
                Base case
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.94rem",
                  lineHeight: 1.65,
                }}
              >
                {profile.baseCase}
              </p>
            </div>
            <div style={{ background: "var(--surface)", padding: 28 }}>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#ff6878",
                  marginBottom: 14,
                }}
              >
                Bear case
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.94rem",
                  lineHeight: 1.65,
                }}
              >
                {profile.bearCase}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BEGINNER METRICS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Beginner metrics
            </span>
            <h2>
              Signals worth <em>understanding.</em>
            </h2>
            <p>
              These are not buy or sell signals. They are prompts for learning
              how the holding behaves.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {profile.beginnerMetrics.map((metric) => (
              <div className="card-line" key={metric.label}>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {metric.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "var(--accent)",
                    marginTop: 10,
                  }}
                >
                  {metric.value}
                </p>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    marginTop: 12,
                  }}
                >
                  {metric.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH NEXT */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              What to research next
            </span>
            <h2>
              The next <em>checkpoints.</em>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {profile.whatToResearchNext.map((item, index) => (
              <div className="card-line" key={item}>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    color: "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  Checkpoint 0{index + 1}
                </p>
                <p style={{ color: "var(--foreground)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .sd-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
