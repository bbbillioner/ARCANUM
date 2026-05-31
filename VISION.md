# ARCANUM — Vision

> **The calm second brain for your investing.**
> ARCANUM lives beside your real broker (it is not one). It learns your full
> portfolio, filters the world to what affects you specifically, helps you
> think clearly before every decision, and grows with you from first share
> to confident investor. You open it daily for five minutes and leave
> informed. Brokers do execution. ARCANUM does understanding.

This document is the source of truth. Every PR, feature pitch, copy change,
or "should we build X?" question is answered from here. Drift from this
document = drift from the product.

---

## 1 · What ARCANUM is

A personal investing assistant that:

- **Learns your full portfolio** — real trades you log manually + paper
  trades from the simulator + tickers you watch.
- **Filters the world to you** — live news shows only stories that touch
  what you hold or watch. Each story is broken down to "what happened →
  why it matters → how it affects *your* holding."
- **Teaches in context** — every term, metric, and concept is explained
  inline at the user's depth. Same screen, two readings.
- **Surfaces the right next thought** — thesis on buy, pre-mortem of the
  bear case, 30-day review of past decisions, reflection on portfolio drift
  vs. stated goals.
- **Grows with the user** — beginner sees more hand-holding, experienced
  investor taps to expand into the raw signal. Never two separate apps.

## 2 · What ARCANUM is NOT

These are the hard "nots." Every feature must respect them.

- **Not a broker.** Never holds money. Never executes trades. Never
  partners with a single broker as the implied default.
- **Not an advisor.** Never recommends "buy X" or "sell Y." Uses
  *reflection / observation / prompt-to-consider* language, never *advice
  / recommendation / suggestion to act*.
- **Not a predictor.** Never gives a price forecast or numeric target.
  Frames the same insight as *factor analysis* / *scenario thinking* /
  *what to watch for*.
- **Not gamified.** No streaks. No leaderboards. No "you've made 10
  trades!" badges. The vibe is calm publication, not casino.
- **Not adversarial with brokers.** Robinhood, Public, Schwab, IBKR —
  these are partners in the user's life, not competitors. ARCANUM makes
  whichever broker they use more valuable.

## 3 · Two users, one product

ARCANUM is built for two kinds of person:

**The first-time investor.** About to open their first brokerage account
or just did. Knows almost nothing. Easily overwhelmed. Needs explanations,
guardrails, and the confidence that comes from practicing before risking
real money.

**The experienced investor.** Years of trades behind them. Doesn't need
explanations. Needs *organisation* their broker doesn't give them, *news
filtered* down to just what touches their book, *blindspots* surfaced, and
a calm second opinion against their own thinking.

**The product serves both via progressive disclosure, not two UIs.**
Every screen shows the same data. Beginners see definitions inline and
gentle prompts. Experienced users get the raw numbers by default with the
prompts collapsed. There is no "beginner mode" toggle anywhere. The depth
shows up where the user looks.

## 4 · The four questions

Every feature pitch must answer YES to at least one of these. If it
doesn't, it's chrome and we don't build it.

1. **Does this make the "your full portfolio in one place" promise more
   real?**
   (manual entry, multi-account, goals, benchmarks, visualisation)

2. **Does this make the "only news that matters to you" promise sharper?**
   (AI breakdowns, alerting on portfolio-impacting events, deeper filtering)

3. **Does this make the user think more clearly before / during / after a
   decision?**
   (thesis, pre-mortem, reflection, scenario thinking, journal review)

4. **Does it scale with the user instead of dumbing down for them?**
   (progressive disclosure, configurable density, growing complexity that
   reveals itself when the user is ready)

## 5 · Product pillars

### Pillar 1 — Your portfolio, in one place
Manual entry of real trades (30-second flow, smart defaults from current
quote + recent news). Aggregates: real holdings + paper trades + watchlist
+ goals. Visualises allocation, sector exposure, concentration, performance
vs. benchmark and personal goal. Multi-account support over time.

### Pillar 2 — News that actually matters to you
Live news filtered to your holdings + watchlist. Each article carries a
one-line "what happened", "why it matters", and "how this affects *your*
position specifically." Tap any article for an AI breakdown at your depth.
Email digest weekly. Optional alerts when something genuinely needs
attention.

### Pillar 3 — Decision quality
Thesis on every buy. Pre-mortem (imagined bear case) on every buy. 30-day
review prompts. Per-portfolio reflection: drift from goal, concentration
risk, sector tilt, blindspots. Time-machine backtest of decisions you
considered but didn't make.

### Pillar 4 — One small daily ritual
The `/today` briefing is the heart of the product. Open it once a day, five
minutes, leave informed. Portfolio glance, three filtered stories, one
concept, one prompt for today. With AI: an optional weekly summary of
"ARCANUM's read on your week."

## 6 · Principles for hard cases

These are the *set-aside-not-cancelled* rules. We will build features that
touch each of these — but only with the framing below.

| Tempting language / feature | We say / do instead |
|---|---|
| "Forecast for NVDA" | "Factors to watch · consensus thinking · what your thesis says" |
| "ARCANUM advises buying X" | "ARCANUM observes that X — worth considering" |
| "Sped-up live simulation" | "Time-machine backtest" — explicit historical replay, never framed as prediction |
| "Beginner mode / Pro mode toggle" | Progressive disclosure on the same screen. No toggle. |
| "Quick 1-click trade entry" | 30-second flow with smart defaults from current state |
| "Predicted performance" | "What the history says · what could go wrong" |
| "AI tells you what to do" | "AI helps you see what you're not seeing" |

When in doubt, the test is: would a regulator reading this think we're
practising investment advice? If yes, rewrite.

## 7 · Roadmap

### Phase 0 — MVP launch (current)
*Goal: a defensible educational MVP that demonstrates the vision, even if
the "real portfolio brain" half isn't built yet.*

**Built.**
- Editorial design system (true black, jade accent, Fraunces serif + Inter
  + JetBrains Mono)
- 8-question onboarding → starter portfolio template
- 30 tickers (5 deep profiles + 25 lite) with research, news, charts
- Live Yahoo prices (5-min cache + nightly snapshot refresh)
- Personalised news per holding with topic-based beginner cues
- Simulator with thesis + pre-mortem + journal + 30-day review
- /today briefing (portfolio glance + 3 stories + 1 concept + 1 prompt)
- /compare side-by-side normalised chart
- Watchlist, settings, help, privacy, terms, 404, OG image
- 6 of 8 onboarding answers actually used (interests, goal, budget, approach)

**Still needed for launch.**
- 🟡 Mobile audit on real phones
- 🟡 Sentry error tracking
- 🟡 *(optional)* Cloud accounts via Supabase

### Phase 1 — Deliver the "second brain" promise (3–6 months post-launch)
*Goal: stop being a learning toy. Start being where someone's real
portfolio lives.*

- **Cloud accounts** (Supabase). Sync across devices. Magic-link auth.
  Migrate localStorage on first login.
- **Manual real-trade entry.** 30-second flow. Pre-fills ticker, current
  price, suggests common share counts. Distinguishes real positions from
  simulator positions in the UI.
- **AI breakdown layer** (Anthropic key). On any news article: "explain
  this · how it affects MY NVDA · explain like I'm 12 / like a pro". On
  any glossary term: same. On portfolio: "what are my blindspots?"
- **Goals + benchmarks.** "Saving for a house in 3 years at $200/mo."
  ARCANUM checks if the portfolio matches the goal and tracks vs. S&P.
- **Email digest.** Weekly "ARCANUM's read on your week" — retention loop
  that respects the user's inbox.

### Phase 2 — Become the tool users build identity around (6–12 months)
- **Multi-account support.** Brokerage + Roth IRA + 401k + crypto under
  one ARCANUM view.
- **Tax awareness.** Cost basis tracking, realised gains, wash-sale
  detection, tax-loss harvesting prompts.
- **Time-machine backtest.** "What if I'd bought NVDA on the day I first
  considered it?" — explicit historical replay framed as backtesting.
- **100+ tickers with full research depth** (not the lite-stub approach).
- **Strategy entity.** "My approach is X." ARCANUM reflects against it
  whenever you act.
- **Soft community.** Share an anonymised thesis. See how others approached
  a similar position. Never gamified.

### Phase 3 — Irreplaceable (12+ months)
- Real broker integrations via Plaid / SnapTrade. Only once user pull is
  proven.
- Native mobile app (or PWA install with full notifications).
- Voice mode for portfolio questions on a walk.
- Multi-user (couples, families investing together).

## 8 · Monetisation

- **Free forever core.** Portfolio entry, basic AI breakdowns, news
  filtering, journal, daily briefing. Always free.
- **Operator subscription (~$8–12/month).** Unlimited AI calls,
  multi-account, tax features, weekly editorial reflection, priority
  support, time-machine backtest depth.
- **No ads. Ever.** Ads would destroy the trust ARCANUM is built on.
- **No selling user data. Ever.**
- **Later, maybe:** anonymised aggregate insights as a paid data product
  for finance educators and institutions. Never tied to identifiable users.

## 9 · Brand voice

- **Calm.** No urgency, no neon, no countdown timers.
- **Editorial.** Reads like a thoughtful publication, not an app.
- **Honest.** We say "early access," "fake money," "may be delayed,"
  "educational only" — out loud, not in fine print.
- **Respectful of the user's intelligence.** No preaching. No
  oversimplification. The reader is an adult learning a skill.
- **Anti-gamification.** No streaks, no XP, no "trades made this week!" —
  investing is not a game.
- **Direct.** Short sentences. No marketing fluff. The product speaks for
  itself.

## 10 · Hard decisions still open

These need explicit calls before we move past Phase 0.

1. **Anthropic API key.** AI is load-bearing for Phase 1. Need a key set
   as `ANTHROPIC_API_KEY` env var. ~$0–50/mo at MVP scale.

2. **Supabase signup.** Cloud accounts are load-bearing for the
   "second brain" promise. Free tier covers up to 50K users. One service
   for auth + Postgres.

3. **Geography at launch.** US-only first (matches our data + content)?
   Or open from day one?

4. **Pricing for Operator tier.** $8, $10, $12 — when do we charge, what
   exactly unlocks?

5. **"Real trade" entry data model.** Per-position only, or per-transaction
   with full history? Per-transaction is more honest about how investing
   actually unfolds and enables tax tracking later.

---

## Appendix — How this document is used

- **Every PR description references one of the four questions** in
  Section 4. If the PR doesn't answer one, it shouldn't merge.
- **Every "should we build X?" decision starts here.** If the feature
  doesn't fit a pillar (Section 5) or answer a question (Section 4),
  the answer is no.
- **Every copy change touching forecasts / advice / sim-replay /
  beginner-vs-pro** consults Section 6 before shipping.
- **This document is updated as the product evolves**, but only with
  intent — not as a record of what we shipped. It describes the
  destination.

— Last updated 2026-05-31
