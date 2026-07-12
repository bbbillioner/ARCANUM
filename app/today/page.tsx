"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useQuotes } from "@/components/hooks/use-quotes";
import { NewsCard } from "@/components/ui/news-card";
import { learningCards } from "@/data/learning-cards";
import { derivePersonalization } from "@/lib/personalization";
import { getCurrentPrice } from "@/lib/prices";
import {
  isOnboardingAnswers,
  selectPortfolioTemplate,
} from "@/lib/portfolio";
import {
  calculateSimulatorSummary,
  getSimulator,
} from "@/lib/simulator";
import { getWatchlist } from "@/lib/watchlist";
import type {
  LearningCard,
  OnboardingAnswers,
  SimulatorState,
  SimulatorTransaction,
} from "@/types/investing";
import type { NewsItem } from "@/types/news";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Tonight";
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// US market state — naive but useful. Eastern time, weekdays 9:30–16:00.
type MarketState = "pre" | "open" | "after" | "closed";
function marketStateNow(date: Date): MarketState {
  // Convert to ET-ish via UTC offset assumption (-4 EDT). Crude but fine for a label.
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const etHours = (utcHours - 4 + 24) % 24;
  const dow = (date.getUTCDay() + (utcHours - 4 < 0 ? 6 : 0)) % 7;
  if (dow === 0 || dow === 6) return "closed";
  if (etHours < 4) return "closed";
  if (etHours < 9.5) return "pre";
  if (etHours < 16) return "open";
  if (etHours < 20) return "after";
  return "closed";
}

const MARKET_LABEL: Record<MarketState, { text: string; color: string }> = {
  pre: { text: "Pre-market", color: "var(--muted)" },
  open: { text: "Markets open", color: "var(--accent)" },
  after: { text: "After-hours", color: "var(--muted)" },
  closed: { text: "Markets closed", color: "var(--muted)" },
};

function pickDailyLesson(answers: OnboardingAnswers | null, day: number): LearningCard {
  // Pick by goal first, then rotate so users get variety day-to-day.
  if (answers) {
    const seeded = derivePersonalization(answers).learningCard;
    // 70% of the time stick with goal-aligned card; otherwise rotate
    if (day % 3 !== 0) return seeded;
  }
  const i = day % learningCards.length;
  return learningCards[i];
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [simulator, setSimulator] = useState<SimulatorState | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "empty">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;

      setNow(new Date());
      const raw = localStorage.getItem("arcanum-onboarding");
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (isOnboardingAnswers(parsed)) setAnswers(parsed);
        } catch {
          /* noop */
        }
      }
      setSimulator(getSimulator());
      setWatchlist(getWatchlist());
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  // News tickers: union of holdings + watchlist + template tickers (fallback)
  const newsTickers = useMemo(() => {
    const set = new Set<string>();
    simulator?.holdings.forEach((h) => {
      if (h.ticker !== "CASH") set.add(h.ticker);
    });
    watchlist.forEach((t) => set.add(t));
    if (answers) {
      selectPortfolioTemplate(answers).holdings.forEach((h) => {
        if (h.ticker !== "CASH") set.add(h.ticker);
      });
    }
    return Array.from(set);
  }, [simulator, watchlist, answers]);

  useEffect(() => {
    let cancelled = false;
    if (newsTickers.length === 0) {
      const timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setNews([]);
        setNewsState("empty");
      }, 0);

      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setNewsState("loading");
    }, 0);

    async function loadNews() {
      try {
        const response = await fetch(
          `/api/news?tickers=${encodeURIComponent(newsTickers.join(","))}`,
        );
        const json = (await response.json()) as { news?: NewsItem[] };
        if (cancelled) return;
        const top = (json.news ?? []).slice(0, 3);
        setNews(top);
        setNewsState(top.length > 0 ? "ready" : "empty");
      } catch {
        if (!cancelled) setNewsState("empty");
      }
    }

    loadNews();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [newsTickers]);

  // Live quotes for portfolio glance
  const portfolioTickers = useMemo(
    () =>
      simulator
        ? simulator.holdings
            .filter((h) => h.ticker !== "CASH")
            .map((h) => h.ticker)
        : [],
    [simulator],
  );
  const { quotes } = useQuotes(portfolioTickers);

  if (!now) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <span className="eyebrow">
              <span className="gem" />
              Today
            </span>
            <h1>Loading…</h1>
          </div>
        </section>
      </main>
    );
  }

  const market = marketStateNow(now);
  const nowTime = now.getTime();
  const marketLabel = MARKET_LABEL[market];
  const lesson = pickDailyLesson(answers, dayOfYear(now));

  // Portfolio glance
  let portfolioValue = 0;
  let todayChange = 0;
  let biggestMover: { ticker: string; pct: number } | null = null;
  if (simulator) {
    const summary = calculateSimulatorSummary(simulator);
    portfolioValue = summary.totalPortfolioValue;
    simulator.holdings.forEach((h) => {
      if (h.ticker === "CASH") return;
      const q = quotes[h.ticker];
      const px = q?.price ?? getCurrentPrice(h.ticker);
      const prevValue = h.shares * (q?.previousClose ?? px);
      const nowValue = h.shares * px;
      todayChange += nowValue - prevValue;
      const pct = q?.changePercent ?? 0;
      if (!biggestMover || Math.abs(pct) > Math.abs(biggestMover.pct)) {
        biggestMover = { ticker: h.ticker, pct };
      }
    });
  }

  // Theses needing review
  const reviewable = simulator
    ? simulator.transactions.filter(
        (t: SimulatorTransaction) =>
          t.type === "buy" &&
          t.thesis &&
          nowTime - new Date(t.createdAt).getTime() >
            30 * 24 * 60 * 60 * 1000 &&
          (t.reviews?.length ?? 0) === 0,
      )
    : [];

  // Pick one prompt for the user — first applicable from the list
  let prompt: { label: string; body: string; href: string; cta: string } | null =
    null;
  if (!answers) {
    prompt = {
      label: "Step zero",
      body: "Build your investor profile in 8 questions. Everything else in ARCANUM is built around your answers.",
      href: "/onboarding",
      cta: "Start onboarding",
    };
  } else if (reviewable.length > 0) {
    const oldest = reviewable[reviewable.length - 1];
    prompt = {
      label: "Review a thesis",
      body: `You bought ${oldest.ticker} more than 30 days ago. Was your reasoning right? Add a follow-up note — even one line.`,
      href: "/journal",
      cta: "Open journal",
    };
  } else if (!simulator || simulator.transactions.length === 0) {
    prompt = {
      label: "First paper trade",
      body: "Open the simulator and place one practice buy with a real thesis. The simulator settles at live prices — no real money.",
      href: "/simulator",
      cta: "Open simulator",
    };
  } else if (watchlist.length === 0) {
    prompt = {
      label: "Start a watchlist",
      body: "Add a stock you're curious about but don't own. The watchlist is a low-stakes way to learn what moves it.",
      href: "/stocks",
      cta: "Browse stocks",
    };
  } else {
    prompt = {
      label: "Compare two tickers",
      body: "Side-by-side comparison is the fastest way to learn what makes two similar securities actually different.",
      href: "/compare",
      cta: "Open compare",
    };
  }

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="eyebrow">
                <span className="gem" />
                Today · {formatTime(now)}
              </span>
              <h1>
                {greetingFor(now)}.{" "}
                <em>Five minutes</em> well spent.
              </h1>
              <p className="lede">
                Your portfolio in one glance, three stories you should know, one
                concept to anchor today, and one small action.
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                border: "1px solid var(--stroke)",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: marketLabel.color,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: marketLabel.color,
                }}
              />
              {marketLabel.text}
            </div>
          </div>
        </div>
      </section>

      {/* 1. PORTFOLIO GLANCE */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">
              <span className="gem" />
              01 · Portfolio glance
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
              Where you <em>stand.</em>
            </h2>
          </div>
          {simulator && simulator.holdings.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <div className="metric-line">
                <div className="label">Total value</div>
                <div className="value" style={{ color: "var(--accent)" }}>
                  {formatCurrency(portfolioValue)}
                </div>
              </div>
              <div className="metric-line">
                <div className="label">Today</div>
                <div
                  className="value"
                  style={{ color: todayChange >= 0 ? "var(--accent)" : "#ff6878" }}
                >
                  {todayChange >= 0 ? "+" : ""}
                  {formatCurrency(todayChange)}
                </div>
              </div>
              {biggestMover && (
                <div className="metric-line">
                  <div className="label">Biggest move</div>
                  <div
                    className="value"
                    style={{
                      color:
                        (biggestMover as { ticker: string; pct: number }).pct >= 0
                          ? "var(--accent)"
                          : "#ff6878",
                    }}
                  >
                    {(biggestMover as { ticker: string; pct: number }).ticker}{" "}
                    {(biggestMover as { ticker: string; pct: number }).pct >= 0
                      ? "+"
                      : ""}
                    {(biggestMover as { ticker: string; pct: number }).pct.toFixed(2)}%
                  </div>
                </div>
              )}
              {reviewable.length > 0 && (
                <div className="metric-line">
                  <div className="label">Theses to review</div>
                  <div className="value" style={{ color: "#ff6878" }}>
                    {reviewable.length}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                padding: "20px 24px",
              }}
            >
              <p
                style={{ color: "var(--muted)", fontSize: "0.96rem", lineHeight: 1.6 }}
              >
                You don&apos;t have any paper-trade positions yet. The portfolio
                glance comes alive once you place a first practice buy in the{" "}
                <Link
                  href="/simulator"
                  style={{
                    color: "var(--accent)",
                    borderBottom: "1px solid rgba(0,229,168,0.4)",
                  }}
                >
                  simulator
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. THREE STORIES */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="sec-head"
            style={{
              marginBottom: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              flexWrap: "wrap",
              maxWidth: "none",
            }}
          >
            <div>
              <span className="eyebrow">
                <span className="gem" />
                02 · Three stories
              </span>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
                What&apos;s <em>moving</em> your watchlist.
              </h2>
            </div>
            <Link className="btn btn-ghost" href="/brief">
              See all news
            </Link>
          </div>
          {newsState === "loading" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 160,
                    background: "var(--surface)",
                    border: "1px solid var(--stroke)",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          )}
          {newsState === "empty" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                padding: "20px 24px",
              }}
            >
              <p
                style={{ color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.6 }}
              >
                Nothing fresh on what you hold or watch right now. Quiet days
                happen — and they&apos;re usually a good time to read a concept.
              </p>
            </div>
          )}
          {newsState === "ready" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {news.map((item) => (
                <NewsCard
                  highlightTickers={newsTickers}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. ONE CONCEPT */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">
              <span className="gem" />
              03 · One concept
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
              <em>{lesson.term}.</em>
            </h2>
          </div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 28,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 10,
                }}
              >
                Simple meaning
              </p>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--foreground)",
                  lineHeight: 1.65,
                }}
              >
                {lesson.simpleMeaning}
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
                Why it matters
              </p>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                {lesson.whyItMatters}
              </p>
            </div>
            <div
              style={{
                borderLeft: "2px solid var(--accent)",
                background: "var(--surface-2)",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 6,
                }}
              >
                Example
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--foreground)",
                  lineHeight: 1.55,
                }}
              >
                {lesson.example}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ONE PROMPT */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">
              <span className="gem" />
              04 · One small action
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
              Today&apos;s <em>prompt.</em>
            </h2>
          </div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              borderLeft: "2px solid var(--accent)",
              padding: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 22,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 10,
                }}
              >
                {prompt.label}
              </p>
              <p
                style={{
                  fontSize: "1.02rem",
                  color: "var(--foreground)",
                  lineHeight: 1.6,
                  maxWidth: "60ch",
                }}
              >
                {prompt.body}
              </p>
            </div>
            <Link className="btn btn-primary" href={prompt.href}>
              {prompt.cta} <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Done badge */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            That&apos;s the briefing. Come back tomorrow.
          </p>
        </div>
      </section>
    </main>
  );
}
