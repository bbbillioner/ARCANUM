import Link from "next/link";

export default function Home() {
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
                  Watch the 2-min tour
                </Link>
              </div>
              <div className="trust reveal d5">
                <span>No fees to start</span>
                <span className="dot">·</span>
                <span>Paper-trade first</span>
                <span className="dot">·</span>
                <span>40,000 first-timers aboard</span>
              </div>
            </div>

            {/* Terminal card */}
            <div className="terminal reveal d4">
              <div className="term-bar">
                <span className="label">Portfolio · Live</span>
                <span className="live">
                  <span className="pulse" />
                  MARKETS OPEN
                </span>
              </div>
              <div className="term-body">
                <div className="pf-label">Total balance</div>
                <div className="pf-value">$24,310.88</div>
                <div className="pf-change">
                  Today <b>+$571.40 · +2.41%</b>
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
                    <path
                      d="M0 50 L26 46 L52 52 L78 40 L104 44 L130 30 L156 34 L182 24 L208 28 L234 16 L260 22 L286 10 L320 6 L320 64 L0 64 Z"
                      fill="url(#g)"
                    />
                    <path
                      d="M0 50 L26 46 L52 52 L78 40 L104 44 L130 30 L156 34 L182 24 L208 28 L234 16 L260 22 L286 10 L320 6"
                      stroke="#00E5A8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>

                <div className="holdings">
                  <div className="hrow">
                    <span className="tkr">VOO</span>
                    <span className="hname">S&amp;P 500 ETF</span>
                    <span className="hchg up">+1.21%</span>
                  </div>
                  <div className="hrow">
                    <span className="tkr">AAPL</span>
                    <span className="hname">Apple Inc.</span>
                    <span className="hchg up">+0.84%</span>
                  </div>
                  <div className="hrow">
                    <span className="tkr">BTC</span>
                    <span className="hname">Bitcoin</span>
                    <span className="hchg flat">−0.62%</span>
                  </div>
                  <div className="hrow">
                    <span className="tkr">MSFT</span>
                    <span className="hname">Microsoft</span>
                    <span className="hchg up">+0.39%</span>
                  </div>
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
              <div className="num">9 min</div>
              <div className="cap">Median time to first informed trade</div>
            </div>
            <div className="stat">
              <div className="num">312</div>
              <div className="cap">Plain-English term breakdowns</div>
            </div>
            <div className="stat">
              <div className="num">$0</div>
              <div className="cap">To open, learn, and paper-trade</div>
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
            <div className="method">
              <div className="idx">01 / DECODE</div>
              <h3>Read the market in plain English</h3>
              <p>
                Hover any ticker, term, or candle and ARCANUM explains it like a
                patient friend — no acronyms left unexplained, no chart left
                mysterious.
              </p>
              <div className="line" />
            </div>
            <div className="method">
              <div className="idx">02 / GUIDE</div>
              <h3>Guardrails for the first decade</h3>
              <p>
                Gentle prompts flag concentration, panic-selling, and fee traps
                before you commit — the seatbelt you&apos;ll outgrow but want on
                day one.
              </p>
              <div className="line" />
            </div>
            <div className="method">
              <div className="idx">03 / COMMAND</div>
              <h3>One screen, fully in your hands</h3>
              <p>
                Watchlist, lessons, and orders live in a single calm terminal.
                Everything you need, nothing screaming for attention.
              </p>
              <div className="line" />
            </div>
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
              Watch, learn, and act without ever switching context. This is the
              whole product — not a teaser.
            </p>
          </div>
          <div className="showcase">
            {/* Watchlist */}
            <div className="panel">
              <div className="ptitle">
                <span className="gem" />
                Watchlist
              </div>
              <div className="wl-row">
                <span className="t">VOO</span>
                <span className="p up">▲ 1.21%</span>
              </div>
              <div className="wl-row">
                <span className="t">QQQ</span>
                <span className="p up">▲ 0.94%</span>
              </div>
              <div className="wl-row">
                <span className="t">AAPL</span>
                <span className="p up">▲ 0.84%</span>
              </div>
              <div className="wl-row">
                <span className="t">TSLA</span>
                <span className="p">▼ 1.07%</span>
              </div>
              <div className="wl-row">
                <span className="t">BTC</span>
                <span className="p">▼ 0.62%</span>
              </div>
              <div className="wl-row">
                <span className="t">SCHD</span>
                <span className="p up">▲ 0.33%</span>
              </div>
            </div>

            {/* Lesson */}
            <div className="panel">
              <div className="ptitle">
                <span className="gem" />
                Today&apos;s lesson
              </div>
              <div className="lesson">
                <span className="tag">Fundamentals · 3 min</span>
                <h4>What an ETF actually is</h4>
                <p>
                  One ticker, hundreds of companies. Why your first buy is
                  probably a fund — not a single stock.
                </p>
                <div className="progress">
                  <span />
                </div>
              </div>
              <div className="lesson">
                <span className="tag">Up next · 4 min</span>
                <h4>Why fees quietly compound</h4>
                <p>
                  A 1% fee doesn&apos;t cost 1%. See the 30-year math before it
                  costs you.
                </p>
              </div>
            </div>

            {/* Order ticket */}
            <div className="panel ticket">
              <div className="ptitle">
                <span className="gem" />
                Order ticket
              </div>
              <div className="field">
                <div className="fl">Buy</div>
                <div className="fv">
                  <span className="big">VOO</span>
                  <span style={{ color: "var(--muted)" }}>S&amp;P 500 ETF</span>
                </div>
              </div>
              <div className="field">
                <div className="fl">Amount</div>
                <div className="fv accent">
                  <span className="big">$250.00</span>
                  <span style={{ color: "var(--muted)" }}>≈ 0.46 sh</span>
                </div>
              </div>
              <div className="field">
                <div className="fl">Schedule</div>
                <div className="fv">
                  <span className="big">Every Friday</span>
                  <span style={{ color: "var(--muted)" }}>recurring</span>
                </div>
              </div>
              <Link className="btn btn-primary submit" href="/simulator">
                Review buy <span className="arrow">→</span>
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

      {/* PRICING */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Pricing
            </span>
            <h2>
              Start free. Stay <em>only if it helps.</em>
            </h2>
            <p>
              No card to begin. The terminal, the lessons, and paper trading are
              free for as long as you&apos;re learning.
            </p>
          </div>
          <div className="price-grid">
            <div className="plan">
              <div className="pname">Apprentice</div>
              <div className="pp free">
                $0<span> / forever</span>
              </div>
              <ul>
                <li>
                  <span className="ck">+</span>Full command terminal &amp;
                  watchlist
                </li>
                <li>
                  <span className="ck">+</span>312 plain-English breakdowns
                </li>
                <li>
                  <span className="ck">+</span>Unlimited paper trading
                </li>
                <li>
                  <span className="ck">+</span>Guardrail prompts on every order
                </li>
              </ul>
              <Link className="btn btn-ghost" href="/onboarding">
                Create free account
              </Link>
            </div>
            <div className="plan featured">
              <div className="pname">Operator</div>
              <div className="pp">
                $12<span> / month</span>
              </div>
              <ul>
                <li>
                  <span className="ck">+</span>Everything in Apprentice
                </li>
                <li>
                  <span className="ck">+</span>Live brokerage &amp; real
                  fractional buys
                </li>
                <li>
                  <span className="ck">+</span>Recurring auto-invest schedules
                </li>
                <li>
                  <span className="ck">+</span>Portfolio health &amp;
                  concentration alerts
                </li>
              </ul>
              <Link className="btn btn-primary" href="/dashboard">
                Open the terminal <span className="arrow">→</span>
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
            Open the terminal, place a paper trade, and decode your first ticker
            in under ten minutes.
          </p>
          <Link className="btn btn-primary" href="/onboarding">
            Open the terminal <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
