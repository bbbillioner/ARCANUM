"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useQuotes } from "@/components/hooks/use-quotes";
import { NewsFeed } from "@/components/ui/news-feed";
import { learningCards } from "@/data/learning-cards";
import {
  getHoldingFallback,
  isOnboardingAnswers,
  selectPortfolioTemplate,
  stockProfileByTicker,
} from "@/lib/portfolio";
import type {
  OnboardingAnswers,
  PortfolioHolding,
  PortfolioTemplate,
  RiskLevel,
  StockProfile,
} from "@/types/investing";

function getRiskLabel(riskLevel: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    low: "Low",
    moderate: "Moderate",
    elevated: "Elevated",
  };
  return labels[riskLevel];
}

function getMainExposure(template: PortfolioTemplate) {
  return template.sectorExposure.reduce((largest, sector) =>
    sector.percentage > largest.percentage ? sector : largest,
  );
}

function getEtfAllocation(holdings: PortfolioHolding[]) {
  return holdings
    .filter((h) => ["VOO", "QQQ"].includes(h.ticker))
    .reduce((t, h) => t + h.allocation, 0);
}

function getStockAllocation(holdings: PortfolioHolding[]) {
  return holdings
    .filter((h) => !["VOO", "QQQ", "CASH"].includes(h.ticker))
    .reduce((t, h) => t + h.allocation, 0);
}

function getConcentrationRisk(template: PortfolioTemplate) {
  const largest = Math.max(...template.holdings.map((h) => h.allocation));
  if (largest >= 40) return "Elevated";
  if (largest >= 25) return "Moderate";
  return "Low";
}

function getDiversificationScore(template: PortfolioTemplate) {
  const holdingCount = template.holdings.length;
  const largest = Math.max(...template.holdings.map((h) => h.allocation));
  const sectorCount = template.sectorExposure.length;
  if (holdingCount >= 5 && sectorCount >= 4 && largest <= 45) return "Strong";
  if (holdingCount >= 4 && sectorCount >= 3 && largest <= 55) return "Balanced";
  return "Focused";
}

export default function DashboardPage() {
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const stored = localStorage.getItem("arcanum-onboarding");
      if (!stored) {
        if (!cancelled) setHasLoaded(true);
        return;
      }
      try {
        const parsed: unknown = JSON.parse(stored);
        if (!cancelled && isOnboardingAnswers(parsed)) {
          setAnswers(parsed);
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

  const quoteTickers = useMemo(
    () =>
      selectedPortfolio
        ? selectedPortfolio.holdings
            .map((h) => h.ticker)
            .filter((t) => t !== "CASH")
        : [],
    [selectedPortfolio],
  );
  const { quotes, status: quoteStatus } = useQuotes(quoteTickers);

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
              Dashboard
            </span>
            <h1>
              Build your <em>investor profile</em> first.
            </h1>
            <p className="lede">
              Complete onboarding so ARCANUM can choose a starter portfolio and
              organize your command center around it.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href="/onboarding">
                Start onboarding <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const mainExposure = getMainExposure(selectedPortfolio);
  const etfAllocation = getEtfAllocation(selectedPortfolio.holdings);
  const stockAllocation = getStockAllocation(selectedPortfolio.holdings);
  const cashAllocation = selectedPortfolio.holdings.find(
    (h) => h.ticker === "CASH",
  )?.allocation;
  const learningCard =
    learningCards.find((c) => c.term === "Concentration Risk") ??
    learningCards[0];

  return (
    <main>
      {/* HERO */}
      <section className="page-hero">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <span className="eyebrow">
                <span className="gem" />
                Command center
              </span>
              <h1>{selectedPortfolio.name}</h1>
              <p className="lede">
                Built from your{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {answers.riskComfort.toLowerCase()}
                </strong>{" "}
                risk comfort,{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {answers.timeHorizon.toLowerCase()}
                </strong>{" "}
                time horizon, and{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {answers.investmentApproach.toLowerCase()}
                </strong>{" "}
                approach. {selectedPortfolio.explanation}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/simulator">
                Open simulator <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/onboarding">
                Retake onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO HEALTH */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Portfolio health
            </span>
            <h2>
              A read on your portfolio&apos;s <em>structure.</em>
            </h2>
            <p>
              Hover any metric to see what it means. These are educational
              signals derived from the selected template.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            <div className="metric-line">
              <div className="label">Risk level</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {getRiskLabel(selectedPortfolio.riskLevel)}
              </div>
              <div className="detail">Template profile</div>
            </div>
            <div className="metric-line">
              <div className="label">Time horizon</div>
              <div className="value">{selectedPortfolio.timeHorizon}</div>
              <div className="detail">Suggested holding period</div>
            </div>
            <div className="metric-line">
              <div className="label">Main exposure</div>
              <div className="value" style={{ fontSize: "1.2rem" }}>
                {mainExposure.sector}
              </div>
              <div className="detail">{mainExposure.percentage}% of template</div>
            </div>
            <div className="metric-line">
              <div className="label">Diversification</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {getDiversificationScore(selectedPortfolio)}
              </div>
              <div className="detail">
                {selectedPortfolio.holdings.length} holdings ·{" "}
                {selectedPortfolio.sectorExposure.length} sectors
              </div>
            </div>
            <div className="metric-line">
              <div className="label">ETF / Stock</div>
              <div className="value">
                {etfAllocation}% / {stockAllocation}%
              </div>
              <div className="detail">
                {typeof cashAllocation === "number"
                  ? `${cashAllocation}% cash`
                  : "No cash reserve"}
              </div>
            </div>
            <div className="metric-line">
              <div className="label">Concentration</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {getConcentrationRisk(selectedPortfolio)}
              </div>
              <div className="detail">Largest holding weight</div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO IN THE NEWS */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">
                <span className="gem" />
                Your portfolio · in the news
              </span>
              <h2>
                Live stories on <em>what you hold.</em>
              </h2>
              <p>
                Real headlines from Yahoo Finance, filtered to the tickers in
                your starter portfolio. Refreshed every 30 minutes.
              </p>
            </div>
            <Link className="btn btn-ghost" href="/brief">
              Open full brief
            </Link>
          </div>
          <NewsFeed
            emptyMessage="No fresh stories on your holdings right now. Check back later."
            tickers={quoteTickers}
          />
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
              Each position has <em>a job.</em>
            </h2>
            <p>
              A beginner portfolio becomes easier to manage when every holding
              has a role, a thesis, and a risk to watch.
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
              const thesis = profile?.companySummary ?? fallback.companySummary;
              const keyRisk = profile?.keyRisks[0] ?? fallback.keyRisks[0];
              const quote = quotes[holding.ticker];
              const intraday = quote?.changePercent ?? 0;
              return (
                <div
                  key={holding.ticker}
                  style={{ background: "var(--surface)", padding: 28 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontWeight: 600,
                          fontSize: "1.8rem",
                          letterSpacing: "0.03em",
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
                    <div style={{ textAlign: "right" }}>
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
                      {quote && (
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.78rem",
                            color: intraday >= 0 ? "var(--accent)" : "#ff6878",
                            marginTop: 6,
                          }}
                        >
                          {intraday >= 0 ? "+" : ""}
                          {intraday.toFixed(2)}%{" "}
                          <span style={{ color: "var(--muted)" }}>today</span>
                        </p>
                      )}
                      {quoteStatus === "loading" && !quote && holding.ticker !== "CASH" && (
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.72rem",
                            color: "var(--muted)",
                            marginTop: 6,
                          }}
                        >
                          —
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-jetbrains-mono)",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 16,
                    }}
                  >
                    {sector}
                  </p>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                      Role.{" "}
                    </span>
                    {holding.role}
                  </p>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                      marginTop: 10,
                    }}
                  >
                    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                      Thesis.{" "}
                    </span>
                    {thesis}
                  </p>
                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                      marginTop: 10,
                      paddingTop: 12,
                      borderTop: "1px solid var(--stroke)",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>Key risk.</span>{" "}
                    {keyRisk}
                  </p>
                  {profile && (
                    <Link
                      className="btn btn-ghost"
                      href={`/stocks/${encodeURIComponent(holding.ticker)}`}
                      style={{
                        marginTop: 18,
                        fontSize: "0.85rem",
                        padding: "0.6em 1.1em",
                      }}
                    >
                      Open research <span className="arrow">→</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEARNING CARD */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">
                <span className="gem" />
                Learning anchor
              </span>
              <h2>
                One concept to <em>anchor today.</em>
              </h2>
              <p>
                Each card explains an investing idea in plain terms and ties it
                back to portfolio decisions.
              </p>
            </div>
            <Link className="btn btn-ghost" href="/learn">
              Browse all concepts
            </Link>
          </div>

          <div
            className="card-line"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 28,
              padding: 32,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 10,
                }}
              >
                Concept
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {learningCard.term}
              </h3>
            </div>
            <div>
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
                Simple meaning
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                }}
              >
                {learningCard.simpleMeaning}
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
                  marginBottom: 10,
                }}
              >
                Example
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                }}
              >
                {learningCard.example}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
