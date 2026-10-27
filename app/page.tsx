import Link from "next/link";

import { learningCards } from "@/data/learning-cards";
import { stockProfiles } from "@/data/stocks";
import {
  getCurrentPrice,
  getPriceBars,
  sliceByTimeframe,
} from "@/lib/prices";
import { fetchQuotes } from "@/lib/quote";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChangePercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

const methodCards = [
  {
    number: "01",
    label: "Decode",
    title: "Read the market in plain English",
    body: "Every research page explains what a company or fund does, what could go wrong, and what its chart shows — in plain English, with a concept library for the jargon.",
  },
  {
    number: "02",
    label: "Guide",
    title: "Think before you click buy",
    body: "Every practice buy asks why you're buying and what could go wrong. Thirty days later, the journal asks how it played out — the habit that outlasts any tip.",
  },
  {
    number: "03",
    label: "Command",
    title: "One screen, fully in your hands",
    body: "Watchlist, lessons, and a practice ledger live in a single calm terminal. Everything you need, nothing screaming for attention.",
  },
];

const heroTickers = ["VOO", "QQQ", "NVDA", "MSFT"];

function buildSparkPath(bars: number[]): { line: string; area: string } {
  if (bars.length === 0) return { line: "", area: "" };
  const min = Math.min(...bars);
  const max = Math.max(...bars);
  const range = max - min || 1;
  const width = 320;
  const height = 64;
  const step = width / (bars.length - 1);
  const points = bars.map(
    (v, i) =>
      `${(i * step).toFixed(1)},${(height - ((v - min) / range) * (height - 6) - 3).toFixed(1)}`,
  );
  const line = `M${points.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

export default async function Home() {
  const quotes = await fetchQuotes(heroTickers);

  // Illustrative portfolio: equal-weight across hero tickers
  const portfolioRows = heroTickers
    .map((ticker) => {
      const profile = stockProfiles.find((p) => p.ticker === ticker);
      const quote = quotes[ticker];
      if (!profile) return null;
      const change = quote?.changePercent ?? 0;
      const price = quote?.price ?? getCurrentPrice(ticker);
      return { ticker, name: profile.name, change, price };
    })
    .filter(
      (row): row is { ticker: string; name: string; change: number; price: number } =>
        row !== null,
    );

  const sparklineBars = sliceByTimeframe(getPriceBars("VOO"), "1M").map(
    (b) => b.close,
  );
  const sparkPath = buildSparkPath(sparklineBars);

  // Illustrative balance: $10K split equally across the tickers at the
  // previous close, moved by today's changes.
  const startingBalance = 10000;
  const portfolioChange =
    portfolioRows.reduce((sum, r) => sum + r.change, 0) /
    Math.max(portfolioRows.length, 1);
  const todayDelta = (startingBalance * portfolioChange) / 100;
  const totalBalance = startingBalance + todayDelta;
  const allLive = heroTickers.every((t) => quotes[t]?.source === "live");

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow reveal d1">
                <span className="gem" />
                The beginner&apos;s command center
              </span>
              <h1 className="reveal d2">
                Investing,
                <br />
                made <em>legible.</em>
              </h1>
              <p className="lede reveal d3">
                ARCANUM turns the noise of tickers, charts, and jargon into{" "}
                <strong>one calm, guided screen</strong> — built for the person
                buying their first share, not their thousandth.
              </p>
              <div className="cta-row reveal d4">
                <Link className="btn btn-primary" href="/onboarding">
                  Open the terminal <span className="arrow">→</span>
                </Link>
                <Link className="btn btn-ghost" href="/learn">
                  Learn the method
                </Link>
              </div>
              <div className="trust reveal d5">
                <span>Free during early access</span>
                <span className="dot">·</span>
                <span>Paper-trade first</span>
                <span className="dot">·</span>
                <span>No sign-up needed</span>
              </div>
            </div>

            {/* Terminal card */}
            <div className="terminal reveal d4">
              <div className="term-bar">
                <span className="label">Portfolio · Sample</span>
                {allLive ? (
                  <span className="live">
                    <span className="pulse" />
                    LIVE QUOTES
                  </span>
                ) : (
                  <span className="live" style={{ color: "var(--muted)" }}>
                    LAST CLOSE
                  </span>
                )}
              </div>
              <div className="term-body">
                <div className="pf-label">Illustrative balance</div>
                <div className="pf-value">{formatCurrency(totalBalance)}</div>
                <div className="pf-change">
                  Today{" "}
                  <b>
                    {todayDelta >= 0 ? "+" : ""}
                    {formatCurrency(todayDelta)} ·{" "}
                    {formatChangePercent(portfolioChange)}
                  </b>
                </div>

                <div className="spark">
                  <svg
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 320 64"
                  >
                    <defs>
                      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#00E5A8" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#00E5A8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {sparkPath.area && (
                      <path d={sparkPath.area} fill="url(#g)" />
                    )}
                    {sparkPath.line && (
                      <path
                        d={sparkPath.line}
                        stroke="#00E5A8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    )}
                  </svg>
                </div>
                <div className="pf-label" style={{ marginTop: 6 }}>
                  VOO · past month
                </div>

                <div className="holdings">
                  {portfolioRows.map((row) => (
                    <div className="hrow" key={row.ticker}>
                      <span className="tkr">{row.ticker}</span>
                      <span className="hname">{row.name}</span>
                      <span
                        className={`hchg ${row.change >= 0 ? "up" : "flat"}`}
                        style={row.change < 0 ? { color: "#ff6878" } : undefined}
                      >
                        {formatChangePercent(row.change)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS BAND */}
      <div className="band">
        <div className="wrap">
          <div className="band-grid">
            <div className="stat">
              <div className="num">8</div>
              <div className="cap">Questions to your starter portfolio</div>
            </div>
            <div className="stat">
              <div className="num">{learningCards.length}</div>
              <div className="cap">Core concepts in plain English</div>
            </div>
            <div className="stat">
              <div className="num">$0</div>
              <div className="cap">Free during early access</div>
            </div>
          </div>
        </div>
      </div>

      {/* METHOD */}
      <section className="block" id="method">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              The method
            </span>
            <h2>
              Three moves between <em>lost</em> and confident.
            </h2>
            <p>
              Most platforms hand a beginner a thousand buttons and wish them
              luck. ARCANUM is built backwards — from the question, not the
              chart.
            </p>
          </div>
          <div className="methods">
            {methodCards.map((card) => (
              <div className="method" key={card.number}>
                <div className="idx">
                  {card.number} / {card.label.toUpperCase()}
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className="line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMINAL SHOWCASE */}
      <section className="block" id="terminal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              The terminal
            </span>
            <h2>
              A desk that fits in one <em>glance.</em>
            </h2>
            <p>
              Watch, learn, and practice without switching context. A preview
              of the three things you&apos;ll do most.
            </p>
          </div>
          <div className="showcase">
            {/* Watchlist */}
            <div className="panel">
              <div className="ptitle">
                <span className="gem" />
                Watchlist
              </div>
              {portfolioRows.map((row) => (
                <div className="wl-row" key={row.ticker}>
                  <span className="t">{row.ticker}</span>
                  <span className={`p ${row.change >= 0 ? "up" : ""}`}>
                    {row.change >= 0 ? "▲" : "▼"} {Math.abs(row.change).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Lesson */}
            <div className="panel">
              <div className="ptitle">
                <span className="gem" />
                Today&apos;s lesson
              </div>
              <div className="lesson">
                <span className="tag">Learn · Fundamentals</span>
                <h4>What an ETF actually is</h4>
                <p>
                  One ticker, hundreds of companies. Why your first buy is
                  probably a fund — not a single stock.
                </p>
              </div>
              <div className="lesson">
                <span className="tag">Learn · Risk</span>
                <h4>Concentration risk in plain words</h4>
                <p>
                  When too much of your portfolio leans on one story. How to
                  spot it before it bites.
                </p>
              </div>
            </div>

            {/* Practice ticket */}
            <div className="panel ticket">
              <div className="ptitle">
                <span className="gem" />
                Practice ticket
              </div>
              <div className="field">
                <div className="fl">Asset</div>
                <div className="fv">
                  <span className="big">VOO</span>
                  <span style={{ color: "var(--muted)" }}>S&amp;P 500 ETF</span>
                </div>
              </div>
              <div className="field">
                <div className="fl">Amount</div>
                <div className="fv accent">
                  <span className="big">$250.00</span>
                  <span style={{ color: "var(--muted)" }}>fake money</span>
                </div>
              </div>
              <div className="field">
                <div className="fl">Settles at</div>
                <div className="fv">
                  <span className="big">Latest quote</span>
                  <span style={{ color: "var(--muted)" }}>live or last close</span>
                </div>
              </div>
              <Link className="btn btn-primary submit" href="/simulator">
                Try the simulator <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <div className="quote-band">
        <div className="wrap">
          <div className="inner">
            <blockquote>
              Confidence isn&apos;t more data. It&apos;s the{" "}
              <em>right amount</em>, explained well.
            </blockquote>
            <div className="by">— The ARCANUM design principle</div>
          </div>
        </div>
      </div>

      {/* PRICING — honest version */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Pricing
            </span>
            <h2>
              Free during <em>early access.</em>
            </h2>
            <p>
              No card. No paywall. The full terminal, lessons, news, and
              practice ledger are free while ARCANUM is in early access.
            </p>
          </div>
          <div className="price-grid">
            <div className="plan featured">
              <div className="pname">Early access</div>
              <div className="pp free">
                $0<span> · during early access</span>
              </div>
              <ul>
                <li>
                  <span className="ck">+</span>Personalised starter portfolio
                </li>
                <li>
                  <span className="ck">+</span>Live prices &amp; news on what you
                  hold
                </li>
                <li>
                  <span className="ck">+</span>Plain-English research &amp; concept
                  library
                </li>
                <li>
                  <span className="ck">+</span>Unlimited paper trading with a
                  thesis journal
                </li>
                <li>
                  <span className="ck">+</span>5-year price history on every
                  research page
                </li>
              </ul>
              <Link className="btn btn-primary" href="/onboarding">
                Join early access <span className="arrow">→</span>
              </Link>
            </div>
            <div className="plan">
              <div className="pname">On the roadmap</div>
              <div className="pp" style={{ color: "var(--muted)" }}>
                Later<span> · pricing TBD</span>
              </div>
              <ul>
                <li>
                  <span className="ck">·</span>Real brokerage connection
                </li>
                <li>
                  <span className="ck">·</span>Your practice portfolio vs. the
                  S&amp;P 500
                </li>
                <li>
                  <span className="ck">·</span>Manual entry of real trades
                </li>
                <li>
                  <span className="ck">·</span>Concentration &amp; drift alerts
                </li>
                <li>
                  <span className="ck">·</span>Multi-device sync &amp; accounts
                </li>
              </ul>
              <Link className="btn btn-ghost" href="/onboarding">
                Get on the list
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Your first move
          </span>
          <h2>
            The market stops feeling <em>arcane</em> today.
          </h2>
          <p>
            Eight questions tell ARCANUM how you think about money. The
            terminal is built around the answers — your portfolio, your news,
            your practice ledger.
          </p>
          <Link className="btn btn-primary" href="/onboarding">
            Open the terminal <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
