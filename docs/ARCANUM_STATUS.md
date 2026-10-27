# ARCANUM — project status

**Audit date:** 2026-10-23 · **Commit audited:** `971dda1` (`main`, in sync with
`origin/main`) · **Repository:** https://github.com/bbbillioner/ARCANUM (public)

Evidence tags used throughout:

- **[RUNTIME]**: reproduced or observed by running the app (local production
  build) or by requesting the live site.
- **[CODE]**: confirmed by reading the source, with file:line.
- **[INFERENCE]**: a reasoned conclusion that is not directly verified.
- **[UNKNOWN]**: not verifiable without access we don't have (e.g. the Vercel
  dashboard).

---

## 1. Current project state

### Update 2026-10-25: P0 repair made locally (uncommitted, not deployed)

- **Supabase is now optional.** `lib/supabase/config.ts` decides whether
  accounts are configured. A missing key or malformed URL counts as
  unconfigured. In that case the client factories return `null`, `proxy.ts`
  passes requests through (and fails open on any Supabase error), and the
  sign-in/sync UI is hidden. A malformed `NEXT_PUBLIC_SITE_URL` can no longer
  crash the root layout either. [RUNTIME]
- **Verified locally in three configurations** (production builds):
  - **No env vars:** every route returns 200, with account features hidden.
  - **Valid-format test config pointing at an unreachable localhost
    Supabase:** every route returns 200, the original sign-in UI is back, and
    a failed sign-in shows an error instead of hanging.
  - **Malformed URLs:** treated as unconfigured, every route returns 200.
  - `/opengraph-image` is still broken in all three (pre-existing, unrelated).
- **Next.js 16.2.6 → 16.4.3** (+ `eslint-config-next`), then a non-forced
  `npm audit fix`. `npm audit` reports **0 vulnerabilities**. [RUNTIME]
- **Lockfile repaired:** `npm ci` passes with npm 10.8.2 and npm 11.6.2.
  CI now runs Node 24 / npm 11 (was Node 20, end of life). [RUNTIME]
- Production stays down until these changes are committed and pushed (§7).

The bullets below describe the state **at audit time (2026-10-23)**.

- **Production is down.** Every page and API route on
  https://arcanum-gilt.vercel.app returns `500 Internal Server Error`. Only
  static assets excluded from the proxy matcher (`/icon.svg`, `/*.svg`)
  load. [RUNTIME] Root cause in §7.
- **The code itself builds and runs.** Lint, typecheck, and `next build` pass.
  With Supabase env vars present, every route returns 200 locally except
  `/opengraph-image`. [RUNTIME]
- **CI has never passed.** `npm ci` fails on lockfile drift in both CI runs
  (2026-07-27). [RUNTIME: GitHub Actions log, local reproduction]
- **Security:** `next@16.2.6` has one critical and several high advisories;
  the fix is `16.4.3`. [RUNTIME: `npm audit`]
- **Activity:** 124 commits. 22 are human (Barsbek Barakov, 2026-05-21 →
  2026-07-27) and 102 are nightly price-snapshot bot commits (2026-06-01 →
  today). No human development since the 2026-07-27 "device transfer"
  commits.
- **Single branch:** `main`. No tags, no open feature branches.

### Repository history (human commits)

| Date | Milestone |
| --- | --- |
| 05-21 | Next.js scaffold, design system, typed static data, onboarding, dashboard, research pages |
| 05-29 | "Direction D": true black + jade + Fraunces/Inter/Mono, charts, news, nav |
| 05-30 | Live quote layer; nightly snapshot workflow; honest homepage copy |
| 05-31 | Thesis journal, compare, pre-mortem, `/today`, VISION.md, **Supabase auth + `middleware.ts`** |
| 07-13 | "Fix deployment blockers": `middleware.ts` → `proxy.ts` (Next 16 rename) |
| 07-27 | Cloud sync, CI workflow, account deletion, robots/sitemap, error pages, env docs |

### Relation to the original Python app

The predecessor is the private repo `bbbillioner/Stockxis` (Streamlit, Nov
2025). `bbbillioner/stock_analysis_tool` is a byte-identical re-import. It
had: single-stock analysis (SMA 20/50/200), compare, an MA-crossover backtest,
a rule-based "Prediction & Insights" page, a **Black-Litterman optimizer**, and
a disabled Magic Formula page.

**None of these analytics exist in the current Next.js app.** [CODE: no
volatility/Sharpe/drawdown/correlation/optimizer code anywhere in the repo]
The legacy Black-Litterman implementation has several correctness defects, so
it should not be ported as-is:

- daily Π/Σ mixed with annual views
- the "confidence" setting cancels out (τ appears in both Ω and τΣ)
- equal weights instead of market caps
- clip-and-rescale instead of a true long-only optimum
- possible ticker-order misalignment
- a view parser that breaks on `BRK-B`

(Static review of `strategies/black_litterman.py` and `streamlit_app.py`.)

---

## 2. Architecture overview

| Layer | Implementation |
| --- | --- |
| Framework | Next.js 16.4.3 App Router (upgraded from 16.2.6 on 2026-10-25), Turbopack, React 19.2.4, TypeScript strict |
| Styling | Tailwind 4 + large `app/globals.css` (tokens + component classes) + inline styles |
| Fonts | Fraunces (display), Inter (body), JetBrains Mono (data) via `next/font` (`app/layout.tsx`) |
| State | `localStorage` keys `arcanum-onboarding`, `arcanum-onboarding-updated-at`, `arcanum-simulator`, `arcanum-watchlist`, `arcanum-sync-status`, `arcanum-cloud-user` |
| Persistence | Supabase Postgres: `profiles`, `watchlist`, `transactions`, `thesis_reviews`, `simulator_state`, `goals` (unused), all with RLS (`supabase/schema.sql`) |
| Auth | Supabase magic link: `/sign-in` → `/auth/callback` → `/today`; `proxy.ts` refreshes the session on every request |
| Sync | `lib/cloud-sync.ts` + `components/cloud-sync.tsx`: migrate on first sign-in, merge watchlists, last-write-wins on timestamps, full sync on tab focus |
| Market data | Yahoo `v8/finance/chart` (quotes, 300 s revalidate, 6 s timeout, snapshot fallback); Yahoo search API (news, 30 min) |
| Historical data | `data/prices/*.json`: 30 tickers × ~1,253 daily bars (5 y), with `close` and `adjClose`; imported statically into the bundle via `lib/prices.ts` |
| Scheduled jobs | `refresh-prices.yml` (weekdays 22:00 UTC; 96 succeeded, 2 failed in July) |
| CI | `ci.yml`: `npm ci` → lint → typecheck → build, on push to `main` and on PRs. **Never passed.** Bot commits don't trigger it (GITHUB_TOKEN pushes don't trigger workflows). |
| Hosting | Vercel `arcanum2/arcanum`; every `main` commit deploys production (confirmed via GitHub deployment records) |
| Security headers | `next.config.ts`: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy. No CSP. |
| Env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (see `.env.example`) |

API routes:

- `GET /api/quote?tickers=` (≤20, allow-list)
- `GET /api/news?tickers=` (≤10, allow-list)
- `DELETE /api/account` (verifies the user, then admin-deletes that user)
- `GET /auth/callback`
- `POST /auth/sign-out`

There is no SSRF exposure: the upstream host is fixed and tickers are
allow-listed and encoded. [CODE: `lib/api/tickers.ts`]

---

## 3. Feature inventory

Status vocabulary: WORKING · PARTIALLY WORKING · BROKEN · UI PLACEHOLDER ·
DISABLED · NOT IMPLEMENTED · UNKNOWN / NOT TESTED.

All features are **BROKEN in production** because of the outage. The statuses
below describe the code when it runs (local production build with
placeholder Supabase env vars).

| Feature / route | Status | Evidence | Key files | Notes |
| --- | --- | --- | --- | --- |
| Landing page `/` | PARTIALLY WORKING | RUNTIME | `app/page.tsx` | Renders well. Sample portfolio card uses live quotes and is labeled "Sample/Illustrative". Contains false or unverifiable claims (see §5). |
| Onboarding `/onboarding` | WORKING | RUNTIME | `app/onboarding/page.tsx`, `data/onboarding.ts` | Completed all 8 steps; answers saved; redirects to the suggestion page. |
| Starter portfolio `/portfolio-suggestion` | PARTIALLY WORKING | RUNTIME | `lib/portfolio.ts:81-100`, `data/portfolios.ts` | Template choice ignores time horizon and income style. A 1–3 year profile is shown a "7+ years" template "based on your 1-3 years time horizon". Template disclaimer is never rendered. Weights sum to 100%. |
| Dashboard `/dashboard` | WORKING (with copy issues) | RUNTIME | `app/dashboard/page.tsx` | Template health metrics and live filtered news work. "Hover any metric" tooltips don't exist; same horizon contradiction. |
| Simulator `/simulator` | PARTIALLY WORKING | RUNTIME + CODE | `app/simulator/page.tsx`, `lib/simulator.ts` | Buy works. **Fills at the live price, values holdings at the snapshot close, so it shows a phantom gain** (bought $100 VOO at $700.59; immediately showed +$1.45). Sell can over-credit cash (CODE `lib/simulator.ts:380-412`). No realized P&L. Reset has no confirmation and erases the journal. Only 5 tickers are tradable. |
| Journal `/journal` | PARTIALLY WORKING | RUNTIME | `app/journal/page.tsx` | Thesis and pre-mortem shown. Header "Unrealised P&L $1.45" contradicts the card's "+0.00% since buy" (price-source mismatch). 30-day review flow: NOT TESTED. |
| Watchlist `/watchlist` | PARTIALLY WORKING | CODE | `app/watchlist/page.tsx:40-46` | Watch button appears on all 30 research pages, but the page only shows the 5 deep-profile tickers. |
| Stock universe `/stocks` | WORKING (heavy) | RUNTIME | `app/stocks/page.tsx` | 30 cards with live prices. **1.3 MB HTML** (full price histories embedded). |
| Asset research `/stocks/[ticker]` | WORKING | RUNTIME | `app/stocks/[ticker]/page.tsx`, `components/ui/chart-full.tsx` | Live quote with LIVE/fallback label, OHLC chart with timeframes, news, "History as of" date. Unknown tickers return HTTP 200 instead of 404. Returns are price-only and unlabeled (§6). |
| Compare `/compare` | WORKING | RUNTIME (render) + CODE | `app/compare/page.tsx`, `components/ui/compare-*.tsx` | Normalized 5-year overlay uses price-only `close`. Picker dropdowns show stale values after Swap (uncontrolled). |
| Daily brief `/brief` | WORKING | RUNTIME (render) | `app/brief/page.tsx`, `data/briefs.ts` | Live news for 5 tickers plus 5 static "worked examples" (labeled, but undated). |
| Today `/today` | PARTIALLY WORKING | CODE | `app/today/page.tsx` | News request can exceed the API's 10-ticker cap; a 400 shows as "Nothing fresh" (`:166-173`). Market-open logic hardcodes UTC−4 (wrong in winter, no holidays). Mixes snapshot total with live daily change. |
| Learn `/learn` | WORKING | RUNTIME (render) | `app/learn/page.tsx`, `data/learning-cards.ts`, `lib/glossary.ts` | 10 concepts. Homepage claims "32 concepts explained inline". |
| Inline term tooltips | NOT IMPLEMENTED | CODE | `components/ui/term.tsx`, `tooltip.tsx`, `metric-card.tsx` | Components exist but no page uses them, though Home and Help advertise them. |
| Ticker search (⌘K) | WORKING | CODE | `components/ui/ticker-search.tsx` | Not exercised at runtime. |
| Sign-in (magic link) | UNKNOWN / NOT TESTED end to end | CODE + RUNTIME (partial) | `app/sign-in/page.tsx`, `app/auth/*`, `lib/supabase/config.ts` | Needs a real Supabase project for a full test. Hidden, with a "No account needed" notice, when Supabase is unconfigured. Against an unreachable backend it now shows an error instead of hanging (2026-10-25). Ignores `?error=callback`. Open-redirect gap in `next` guard (`/\evil.com`), low severity. |
| Cloud sync | UNKNOWN / NOT TESTED | CODE | `lib/cloud-sync.ts` | Delete-then-insert with no transaction (`:296-305`, `:483-541`); a failure in between can empty the cloud copy. |
| Settings (export, clear, delete account) | UNKNOWN / NOT TESTED | CODE | `app/settings/page.tsx`, `app/api/account/route.ts` | Delete verifies the user first. "Clear simulator" has no confirmation and silently erases the journal. |
| Help / Privacy / Terms | WORKING / PARTIAL | CODE | `app/{help,privacy,terms}` | `/terms` is unstyled (`.legal-prose` CSS only in privacy page). Titles get a doubled "· ARCANUM" suffix. Help FAQ describes dotted-underline definitions that don't exist. |
| 404 / error pages | WORKING | RUNTIME | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` | No `loading.tsx` anywhere. |
| Open Graph image | BROKEN | RUNTIME | `app/opengraph-image.tsx` | Satori error: "Expected <div> to have explicit display: flex". Also hardcodes the domain "arcanum.app". |
| robots.txt / sitemap.xml | WORKING | RUNTIME | `app/robots.ts`, `app/sitemap.ts` | — |
| Live quotes API | WORKING (locally) | RUNTIME | `lib/quote.ts`, `app/api/quote` | Returns `source: "live"` from this machine. **[UNKNOWN]** whether Yahoo serves Vercel's server IPs; the fallback would mask a block. |
| News API | WORKING (locally) | RUNTIME | `lib/news.ts`, `app/api/news` | Real headlines. Same Vercel-IP caveat. |
| Nightly snapshot refresh | PARTIALLY WORKING | RUNTIME | `scripts/fetch-prices.mjs`, `refresh-prices.yml` | Runs reliably, but the latest bar is always one session behind (§6). |
| Pricing / subscriptions | NOT IMPLEMENTED (marketing only) | CODE | `app/page.tsx:363-430` | "$0 / forever for the first cohort" section with a "MOST CHOSEN" badge; no payment code. |
| Portfolio optimization (Black-Litterman) | NOT IMPLEMENTED | CODE | — | Legacy Python only. |
| Risk analytics (volatility, drawdown, Sharpe, correlation, benchmark) | NOT IMPLEMENTED | CODE | — | `adjClose` is stored but unused. |
| Paper trading on real-money brokers / AI / goals / digest | NOT IMPLEMENTED | — | — | VISION Phase 1+. |
| Mobile layout | PARTIALLY WORKING | RUNTIME | `components/ui/nav.tsx` | No horizontal page overflow at 375px. "Open Terminal" button clipped at 375px; nav crowded at ~1024px. |

---

## 4. Working functionality (verified at runtime, local build)

- Every page renders (HTTP 200) when the Supabase env vars are set.
- Full onboarding → portfolio suggestion → dashboard flow, persisted in
  `localStorage`.
- Simulator start and buy with thesis + pre-mortem; the journal shows the
  entry.
- Live Yahoo quotes and news through the API routes, including allow-list
  validation (unknown ticker → 400).
- Stock research pages with an interactive chart, LIVE/fallback labeling, and
  as-of dates.
- Lint, typecheck, and production build all pass.

---

## 5. Broken or misleading functionality

**Blocking**

1. Production 500 on every route: the proxy throws without the Supabase env
   vars. [RUNTIME] **Fixed locally 2026-10-25; awaiting commit + deploy.**
2. CI fails at `npm ci`. [RUNTIME] **Fixed locally 2026-10-25** (lockfile
   valid for npm 10 and 11); confirm on the first CI run after push.

**Financial accuracy**

3. Simulator fill price and valuation price come from different sources.
   This causes phantom P&L, and the journal contradicts itself. [RUNTIME]
4. Simulator sell can credit more cash than the position is worth, or leave
   an unsellable remainder. There is no realized P&L, and "Total gain/loss"
   is actually unrealized only. [CODE `lib/simulator.ts:174-177`, `:380-412`]
5. All return figures and the compare chart use price-only `close` without
   saying so (§6). [RUNTIME + CODE]
6. Snapshot is always one trading session stale. `fetchedAt` is synthesized
   as `<lastBarDate>T20:00:00Z` rather than the real fetch time. [RUNTIME + CODE]
7. Starter template ignores time horizon and contradicts itself on screen.
   [RUNTIME]
8. Portfolio template data is internally inconsistent: the conservative
   template's sector exposure says Tech 15 / Cash 20, but its holdings say
   MSFT 10 / CASH 25; the aggressive template lists "Consumer staples 10"
   with no such holding. [CODE `data/portfolios.ts`]

**Product and copy honesty** (VISION §9 says "Honest")

9. "220+ in the first cohort" is hardcoded (`app/page.tsx:131`).
10. "32 concepts explained inline", "Hover any ticker, term…", and "Hover any
    metric" describe features that don't exist. The Method "Guide" card
    claims prompts for concentration, panic-selling, and fees that are not
    implemented.
11. Fill-price copy contradicts itself. The homepage says "Settles at Live
    close" and "paper trading at live prices"; the simulator says "settle at
    the last close"; Today, Journal, and Help say "latest cached price". The
    code uses the live quote when available.
12. The homepage "LIVE QUOTES" badge shows even when the values are snapshot
    fallbacks.
13. The pricing section promises "$0 / forever for the first cohort", a
    commitment that needs an explicit product decision.
14. Time-sensitive content has no review dates:
    - superlatives in `data/stocks-lite.ts` (e.g. "largest U.S. bank")
    - `:220` "Warren Buffett's holding company" (verify against current
      leadership)
    - simulator placeholder "compounding through 2026"

**Other defects**

15. `/opengraph-image` crashes, so link previews are broken.
16. Watchlist hides 25 of 30 tickers.
17. Today news silently fails for users with more than 10 relevant tickers.
18. `/terms` is unstyled.
19. Unknown `/stocks/XYZ` returns a soft 404 (HTTP 200).
20. The `next` redirect guard in `/auth/callback` can be bypassed with
    `/\host`. Low severity: only reachable after a successful code exchange.

---

## 6. Financial data accuracy notes

| Topic | Finding | Evidence |
| --- | --- | --- |
| Data source | Unofficial Yahoo Finance endpoints, no license or SLA. Disclosed in Help, Terms, and the footer. Fine for an educational early release; risky for a public product at scale. | CODE |
| Price vs total return | `close` is split-adjusted only. 5-year price vs total return (`adjClose`) as of the 2026-10-21 bar: **BND −16.8% vs −1.5%**, **SCHD +33.0% vs +59.0%**, VOO +69.7% vs +82.1%, AAPL +131.4% vs +137.3%. The UI never says "price return". For income ETFs this badly understates performance, and it skews VOO-vs-BND style comparisons. | RUNTIME (computed from snapshots) |
| Snapshot lag | Each nightly commit's last bar is the previous session. The 2026-10-23 00:26Z run stored up to 10-21, while Yahoo has 10-22. Likely cause: the in-progress day's bar has null fields at fetch time and is dropped (`fetch-prices.mjs:63-71`). | RUNTIME (lag); INFERENCE (cause) |
| `fetchedAt` | Synthesized as `<lastBar>T20:00:00Z`: not the fetch time, and 20:00Z is only 4 pm ET during daylight time. | CODE `fetch-prices.mjs:86-89` |
| Quote fallback | Returns the last snapshot bar with `source: "historical"`. Most pages label it; the homepage badge does not. | CODE |
| Corporate actions | Each nightly run re-fetches the full 5-year window, so splits are reflected retroactively. Dividends only appear in `adjClose`, which is unused. | CODE |
| Currency | All 30 tickers are USD; `currency` is stored but not displayed. No FX handling needed for the current universe. | RUNTIME |
| Market hours | `/today` "market open" uses fixed UTC−4 and ignores holidays. | CODE `app/today/page.tsx:56-58` |
| Mock vs real | Homepage showcase sections (practice ticket, lessons progress 64%) are hardcoded illustrations. The sample card's balance is derived from real live quotes but is hypothetical. | CODE |
| Analytics math | No volatility, drawdown, Sharpe, beta, correlation, or optimizer exists in this codebase. The only calculations are % change between two closes and simulator bookkeeping. | CODE |

---

## 7. Deployment status

**Production (https://arcanum-gilt.vercel.app): DOWN.** Every route matched by
the proxy returns `500` with the body `Internal Server Error`. [RUNTIME,
2026-10-23]

- Latest production deployment: commit `971dda1` (the bot's price refresh),
  reported "success" by Vercel at 2026-10-23T00:27Z. Production matches the
  latest GitHub code. [RUNTIME: GitHub deployment records]
- **Root cause (high confidence):** the Supabase public env vars are not set
  for Vercel's Production environment, so `proxy.ts:11-14` calls
  `createServerClient(undefined, undefined, …)`, which throws `Your project's
  URL and Key are required to create a Supabase client!` on every request.
  Evidence:
  1. In the production JS bundle, `process.env.NEXT_PUBLIC_SUPABASE_URL` and
     `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` are left as unreplaced
     references. Next inlines them as literals when they are defined at
     build time, so they were undefined at build time.
  2. A local build without these vars reproduces production byte-for-byte:
     500/21-byte bodies on proxied routes, 200 on `/icon.svg`, and a 34,424-byte
     404 on `/favicon.ico`. The server log shows the Supabase error above.
  3. The same build with placeholder values serves every route with 200.
  4. On production, paths excluded from the proxy matcher render the full
     app shell, so only the proxy fails.
- **[UNKNOWN]** whether the vars were never added, were added only to
  Preview/Development, or were removed. This needs the Vercel dashboard
  (Project → Settings → Environment Variables) or runtime logs (Project →
  Logs, filter by status 500). The user should also confirm whether a
  Supabase project exists for ARCANUM.
- **Why the error text changed [INFERENCE]:** `middleware.ts` (added
  2026-05-31) ran on the Edge runtime, where Vercel reports
  `MIDDLEWARE_INVOCATION_FAILED`. Commit `9d2fdb1` (2026-07-13) renamed it to
  `proxy.ts`, which Next 16 runs on the Node runtime, so the same throw now
  surfaces as a plain 500. The site has likely been down since 2026-05-31.
- **Fix:** two parts.
  - Code: make Supabase optional. Fail-open proxy, guarded clients, and sign-in
    hidden when unconfigured, so a missing env var can never take the site
    down again. **Done locally 2026-10-25** (see §1 update); not yet
    committed or deployed.
  - Ops (user action, only when accounts are wanted): add all four vars to
    the Vercel Production environment and redeploy. The site works without
    them once the code fix is deployed. Setting `NEXT_PUBLIC_SITE_URL` alone
    is recommended either way: without it, canonical URLs, `robots.txt`, and
    `sitemap.xml` fall back to `http://localhost:3000`.
- **Unverified in production:** whether Yahoo serves requests from Vercel's
  server IPs. Check `/api/quote` `source` values once the site is back up.
- Vercel deployment previews are reported back to GitHub as deployment
  statuses. No `vercel.json` exists; Vercel uses Next.js defaults
  (`npm install`, which is why the lockfile drift doesn't break Vercel
  builds).

---

## 8. Technical debt and code health

| Area | State |
| --- | --- |
| Lint | Passes (`npm run lint`), 0 errors. Since the 16.4.3 upgrade, 1 warning: `@next/next/no-location-assign-relative-destination` on the intentional full reload after account deletion (`app/settings/page.tsx`). [RUNTIME] |
| Typecheck | Passes (`tsc --noEmit`). [RUNTIME] |
| Build | Passes (`next build`, 57 static pages) on 16.4.3, with and without Supabase env vars. [RUNTIME] |
| `npm ci` | **Fixed 2026-10-25.** It used to fail with `Missing: @emnapi/runtime@1.11.3 / @emnapi/core … from lock file`: npm 10 and 11 disagree about the `bundleDependencies` of the WASM-only `@tailwindcss/oxide-wasm32-wasi`. The lock now includes the entries npm 10 expects (all inside the never-installed `cpu: wasm32` subtree). `npm ci` passes on npm 10.8.2 and 11.6.2. [RUNTIME] |
| Tests | **None.** No test runner, no unit tests, no e2e tests. |
| Vulnerabilities | **0** (`npm audit`, prod + dev, 2026-10-25). Before: 1 critical + 4 high + 1 moderate in prod deps. `next` ≤16.4.0 had advisories including proxy bypass, RCE in `next/og` ImageResponse (used by `app/opengraph-image.tsx`), and SSRF/cache poisoning. Fixed by `next`/`eslint-config-next` 16.4.3 plus a non-forced `npm audit fix` (patch bumps of `sharp`, `postcss`, `nanoid`, `source-map-js`, `baseline-browser-mapping`, and dev-only babel/browserslist/js-yaml/brace-expansion/zod). |
| Node versions | CI bumped Node 20 → 24 on 2026-10-25, so CI uses npm 11 like local development (Node 24.13 / npm 11.6). The price-refresh workflow still pins Node 20 (end of life April 2026); it installs nothing, so the risk is low. The Vercel Node setting is unknown. Next 16.4.3 requires ≥20.9. |
| Dependencies | `@supabase/ssr` 0.10.3 (latest 0.12.7). Otherwise current. |
| Performance | `/stocks` HTML is 1.3 MB and `/compare` 384 KB, because full 5-year bar arrays for 30 tickers are serialized into the page payload. All price JSON is bundled via static imports. |
| Dead code | `data/home.ts`, `types/home.ts`, and these components: `homepage-cta`, `button`, `card`, `badge`, `allocation-bar`, `learning-card`, `brief-card`, `holding-card`, `section-header`, `risk-badge`, `metric-card`, `term`, `tooltip`. Helpers `getCurrentUser`, `getDeepProfile`, `buildAllocationSegments`, `tickerMatchesInterests`. The `goals` table is unused. |
| Styling drift | `chart-full.tsx` / `chart-panel.tsx` reference the never-loaded `--font-geist-sans`. Some rounded pills and `rounded-3xl` cards break the square-edge system. Loss red `#ff6878` is hardcoded, not a token. |
| Sync robustness | Non-transactional delete+insert. A full sync runs on every tab focus. The `thesis_reviews` RLS policy checks only `user_id`, not transaction ownership. |
| Missing | Loading states (`loading.tsx`), CSP header, API rate limiting, error monitoring (Sentry was a VISION launch item), `prefers-reduced-motion` handling. |
| Docs | README, VISION.md, `docs/ENVIRONMENT.md`, and `supabase/SETUP.md` are good and current. README's feature list overstates a few items (see §5). |

---

## 9. V1.0 launch requirements

Definition of done: publicly accessible, reliably deployed, main journeys
work, visually consistent, responsive, stable, financially accurate within
stated limits, no false claims or dead features.

### Proposed V1.0 scope

**In:**

- Landing page
- Onboarding → starter template (fixed)
- Dashboard
- Stocks universe and research pages
- Compare
- Simulator + Journal (accounting fixed)
- Watchlist (fixed)
- Learn
- Today and Brief
- Help, Privacy, Terms
- **One new analytic:** a risk & return panel built from `adjClose`. It shows
  total return, CAGR, annualized volatility, max drawdown, and growth of
  $1,000, on research pages and in Compare.

**Conditional:** Supabase sign-in + cloud sync. Ship it only if a Supabase
project exists and the `supabase/SETUP.md` §5–6 checks pass. Otherwise ship
local-only and keep auth hidden behind configuration.

**Out (postpone):** Black-Litterman, pricing/subscriptions, AI breakdowns,
real-trade entry, goals, email digest, Magic Formula, licensed data provider.

The full checklist is in `docs/ARCANUM_ROADMAP.md` (P0 + P1).

---

## 10. Recommended priorities

1. **Restore production safely.** Make the proxy and Supabase clients
   fail-open when unconfigured, then (user) set the Vercel env vars and
   redeploy. Upgrade Next to 16.4.3 in the same pass, and fix the lockfile so
   CI goes green. *Code done locally 2026-10-25; next is commit, push, and a
   production smoke test.*
2. **Fix financial accuracy:**
   - simulator price consistency + sell math
   - price vs total return labeling/adjClose
   - snapshot lag
   - template horizon logic
3. **Remove false or unverifiable claims** and align copy with reality.
4. **Fix remaining defects:** OG image, watchlist, Today news cap, terms
   styling, 404s, mobile nav.
5. **Add the risk & return panel**, plus unit tests for simulator and return
   math.
6. Production verification pass on real devices, then launch.

---

## Open decisions for the product owner

1. Does a Supabase project for ARCANUM exist, and should auth/sync be in
   V1.0?
2. Keep, soften ("Free during early access"), or remove the "$0 / forever for
   the first cohort" pricing section?
3. Remove the "220+ in the first cohort" figure, or replace it with a
   verifiable number?
4. Canonical domain. The OG image hardcodes `arcanum.app`, while production
   is `arcanum-gilt.vercel.app`.
5. Should the simulator settle at the live quote (with as-of time) or at the
   last close? Either is defensible; it must be consistent.
6. Should the simulator allow all 30 tickers or stay at 5?
