import type { Metadata } from "next";

import { NewsCard } from "@/components/ui/news-card";
import { dailyBriefs } from "@/data/briefs";
import { stockProfiles } from "@/data/stocks";
import { fetchPortfolioNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "Daily brief",
  description:
    "Live market headlines on the stocks ARCANUM tracks, plus editorial breakdowns of how to read a market event as a beginner.",
};

const beginnerTakeaways = [
  "News matters when it affects earnings, rates, demand, regulation, or sentiment.",
  "Don't react emotionally to every headline.",
  "Connect events back to your portfolio exposure.",
  "Use news to ask better questions, not to make instant trades.",
];

export default async function BriefPage() {
  const allTickers = stockProfiles.map((p) => p.ticker);
  const news = await fetchPortfolioNews(allTickers, 9);

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Daily brief
          </span>
          <h1>
            What&apos;s <em>moving</em> today.
          </h1>
          <p className="lede">
            Live headlines on the stocks ARCANUM tracks, plus worked examples of
            how to read a market event as a beginner.
          </p>
        </div>
      </section>

      {/* LIVE NEWS */}
      <section className="block">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">
                <span className="gem" />
                Latest market news
              </span>
              <h2>
                Fresh stories on <em>what we track.</em>
              </h2>
              <p>
                Real headlines from Yahoo Finance, deduped across tickers and
                sorted by recency. Refreshed every 30 minutes — open any story
                in its original source.
              </p>
            </div>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Updated continuously
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
                Could not load news right now. Refresh in a moment.
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
                <NewsCard item={item} key={item.id} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW TO READ */}
      <section
        className="block"
        style={{
          paddingTop: 0,
        }}
      >
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.8fr",
              gap: 18,
            }}
            className="brief-2col"
          >
            <div className="card-line">
              <h3>How to read a story</h3>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "16px 0 0",
                  display: "grid",
                  gap: 10,
                }}
              >
                {beginnerTakeaways.map((takeaway, index) => (
                  <li
                    key={takeaway}
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
                      {takeaway}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-line">
              <h3>How this connects to your portfolio</h3>
              <p>
                ARCANUM links market events to sectors and holdings so you can
                see which parts of a portfolio may be sensitive to rates,
                earnings, demand, regulation, and sentiment. The goal is not to
                trade every headline. The goal is to understand what your
                portfolio is exposed to and which questions deserve research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKED EXAMPLES */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Worked examples
            </span>
            <h2>
              How a beginner <em>reads a market event.</em>
            </h2>
            <p>
              Editorial breakdowns of real-style events. Each one connects the
              headline to sectors, holdings, and a plain-language investor
              translation. Use them as templates for reading live news.
            </p>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {dailyBriefs.map((brief) => (
              <div
                key={brief.title}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--stroke)",
                  padding: 30,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "0.9fr 1.1fr",
                    gap: 32,
                  }}
                  className="brief-2col"
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.68rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        marginBottom: 16,
                      }}
                    >
                      Worked example
                    </p>
                    <h3
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontWeight: 600,
                        fontSize: "1.6rem",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.15,
                      }}
                    >
                      {brief.title}
                    </h3>
                    <div style={{ marginTop: 22 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        Affected sectors
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {brief.affectedSectors.map((s) => (
                          <span
                            key={s}
                            className="ticker-tag"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 18 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        Affected holdings
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {brief.affectedHoldings.map((t) => (
                          <span
                            key={t}
                            className="ticker-tag strong"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        border: "1px solid var(--stroke)",
                        padding: 16,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        What happened
                      </p>
                      <p style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {brief.whatHappened}
                      </p>
                    </div>
                    <div
                      style={{
                        border: "1px solid var(--stroke)",
                        padding: 16,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        Why it matters
                      </p>
                      <p style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {brief.whyItMatters}
                      </p>
                    </div>
                    <div
                      style={{
                        borderLeft: "2px solid var(--accent)",
                        background: "var(--surface-2)",
                        padding: "12px 16px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--accent)",
                          marginBottom: 8,
                        }}
                      >
                        Beginner translation
                      </p>
                      <p style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {brief.beginnerTranslation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .ticker-tag {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 3px 9px;
          border: 1px solid var(--stroke);
          color: var(--muted);
        }
        .ticker-tag.strong {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(0, 229, 168, 0.06);
        }
        @media (max-width: 880px) {
          .brief-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
