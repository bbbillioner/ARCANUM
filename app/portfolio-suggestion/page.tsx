"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getHoldingFallback,
  isOnboardingAnswers,
  selectPortfolioTemplate,
  stockProfileByTicker,
} from "@/lib/portfolio";
import type {
  OnboardingAnswers,
  PortfolioTemplate,
  StockProfile,
} from "@/types/investing";

function getPersonalizedExplanation(
  answers: OnboardingAnswers,
  template: PortfolioTemplate,
) {
  const interests =
    answers.interests.length > 0
      ? answers.interests.join(", ")
      : "broad market learning";

  return `Based on your ${answers.riskComfort.toLowerCase()} risk comfort, ${answers.timeHorizon.toLowerCase()} time horizon, and interest in ${interests}, ARCANUM is starting with ${template.name}. ${template.explanation}`;
}

export default function PortfolioSuggestionPage() {
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const storedAnswers = localStorage.getItem("arcanum-onboarding");
      if (!storedAnswers) {
        if (!cancelled) setHasLoaded(true);
        return;
      }
      try {
        const parsedAnswers: unknown = JSON.parse(storedAnswers);
        if (!cancelled && isOnboardingAnswers(parsedAnswers)) {
          setAnswers(parsedAnswers);
        }
      } catch {
        if (!cancelled) setAnswers(null);
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const selectedPortfolio = useMemo(
    () => (answers ? selectPortfolioTemplate(answers) : null),
    [answers],
  );

  if (!hasLoaded) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <span className="eyebrow">
              <span className="gem" />
              Loading
            </span>
            <h1>Reading your profile…</h1>
          </div>
        </section>
      </main>
    );
  }

  if (!answers || !selectedPortfolio) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap" style={{ maxWidth: 640 }}>
            <span className="eyebrow">
              <span className="gem" />
              Portfolio
            </span>
            <h1>
              Start with <em>onboarding</em> first.
            </h1>
            <p className="lede">
              ARCANUM needs your budget, goals, risk comfort, and interests
              before it can prepare a starter portfolio direction.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href="/onboarding">
                Open the 9-minute setup <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* HERO */}
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Suggested starter portfolio
          </span>
          <h1>{selectedPortfolio.name}</h1>
          <p className="lede">{selectedPortfolio.description}</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginTop: 32,
              maxWidth: 720,
            }}
          >
            <div className="metric-line">
              <div className="label">Risk level</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {selectedPortfolio.riskLevel}
              </div>
            </div>
            <div className="metric-line">
              <div className="label">Time horizon</div>
              <div className="value">{selectedPortfolio.timeHorizon}</div>
            </div>
            <div className="metric-line">
              <div className="label">Holdings</div>
              <div className="value">{selectedPortfolio.holdings.length}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ASSET MIX + SECTOR EXPOSURE */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Asset mix
            </span>
            <h2>
              The blocks your portfolio is <em>built from.</em>
            </h2>
            <p>
              Each asset class plays a role — growth, stability, diversification,
              or cash buffer. The mix decides how the portfolio behaves more than
              any individual ticker.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 32,
            }}
            className="ps-grid"
          >
            <div style={{ display: "grid", gap: 14 }}>
              {selectedPortfolio.assetMix.map((item) => (
                <div className="card-line" key={item.assetClass}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 10,
                    }}
                  >
                    <h3 style={{ marginBottom: 0 }}>{item.assetClass}</h3>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 600,
                        fontSize: "1.2rem",
                        color: "var(--accent)",
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 2,
                      background: "var(--stroke)",
                      marginBottom: 14,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: `${item.percentage}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                  <p>{item.rationale}</p>
                </div>
              ))}
            </div>

            <div className="card-line">
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 20,
                }}
              >
                Sector exposure
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {selectedPortfolio.sectorExposure.map((sector) => (
                  <div key={sector.sector}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.88rem",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "var(--foreground)" }}>
                        {sector.sector}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          color: "var(--accent)",
                        }}
                      >
                        {sector.percentage}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 2,
                        background: "var(--stroke)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: `${sector.percentage}%`,
                          background: "var(--accent)",
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOLDINGS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Holdings
            </span>
            <h2>
              The building blocks, and <em>why they&apos;re here.</em>
            </h2>
            <p>
              Each holding has a job. The point is to understand the job it
              does, not to chase a ticker.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 1,
              background: "var(--stroke)",
              border: "1px solid var(--stroke)",
            }}
          >
            {selectedPortfolio.holdings.map((holding) => {
              const profile: StockProfile | undefined =
                stockProfileByTicker.get(holding.ticker);
              const fallback = getHoldingFallback(holding.ticker);
              const sector = profile?.sector ?? fallback.sector;
              const explanation =
                profile?.companySummary ?? fallback.companySummary;
              return (
                <div
                  key={holding.ticker}
                  style={{
                    background: "var(--surface)",
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontWeight: 600,
                          fontSize: "1.8rem",
                          letterSpacing: "0.03em",
                          color: "var(--foreground)",
                          lineHeight: 1,
                        }}
                      >
                        {holding.ticker}
                      </p>
                      <p
                        style={{
                          fontSize: "0.92rem",
                          color: "var(--muted)",
                          marginTop: 6,
                        }}
                      >
                        {holding.name}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "1rem",
                        color: "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      {holding.allocation}%
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      fontFamily: "var(--font-jetbrains-mono)",
                      marginBottom: 6,
                    }}
                  >
                    {sector}
                  </p>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                      marginTop: 14,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontWeight: 500,
                      }}
                    >
                      Role.{" "}
                    </span>
                    {holding.role}
                  </p>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                      marginTop: 12,
                    }}
                  >
                    {explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY + NEXT */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 24,
            }}
            className="ps-grid"
          >
            <div className="card-line">
              <h3>Why this fits you</h3>
              <p style={{ lineHeight: 1.75, marginBottom: 22 }}>
                {getPersonalizedExplanation(answers, selectedPortfolio)}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div className="metric-line" style={{ padding: 14 }}>
                  <div className="label">Goal</div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--foreground)",
                      marginTop: 6,
                    }}
                  >
                    {answers.goal}
                  </div>
                </div>
                <div className="metric-line" style={{ padding: 14 }}>
                  <div className="label">Approach</div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--foreground)",
                      marginTop: 6,
                    }}
                  >
                    {answers.investmentApproach}
                  </div>
                </div>
                <div className="metric-line" style={{ padding: 14 }}>
                  <div className="label">Risk</div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--foreground)",
                      marginTop: 6,
                    }}
                  >
                    {answers.riskComfort}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-line">
              <h3>What to do next</h3>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "18px 0",
                  display: "grid",
                  gap: 10,
                }}
              >
                {[
                  "Open the dashboard and read each holding's job",
                  "Read today's brief for news that touches your holdings",
                  "Practice a buy in the simulator before any real money",
                ].map((step, index) => (
                  <li
                    key={step}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--stroke)",
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
                    <span style={{ color: "var(--foreground)", fontSize: "0.92rem" }}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <div
                style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}
              >
                <Link className="btn btn-primary" href="/dashboard">
                  Open dashboard <span className="arrow">→</span>
                </Link>
                <Link className="btn btn-ghost" href="/onboarding">
                  Retake onboarding
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .ps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
