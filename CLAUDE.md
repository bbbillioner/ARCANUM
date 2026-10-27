@AGENTS.md

# ARCANUM — project instructions

ARCANUM ("Investing, made legible.") is an educational investing web app for
beginners: investor-profile onboarding → starter portfolio template, a
fake-money simulator with a thesis journal, research pages for a curated
30-ticker universe, compare, watchlist, daily brief, and a glossary.
It is **not** a broker, adviser, or predictor. `VISION.md` §2 and §6 define the
language rules every feature and copy change must follow.

Before starting work, read `docs/ARCANUM_STATUS.md` (current state, known
bugs) and `docs/ARCANUM_ROADMAP.md` (P0–P3 priorities). Update both when you
change something they describe.

## Stack

- Next.js 16.4 App Router (Turbopack), React 19, TypeScript (strict), Tailwind 4.
  Next 16 differs from older versions: middleware lives in `proxy.ts` and runs
  on the Node runtime. Check `node_modules/next/dist/docs/` before using an
  unfamiliar API (see AGENTS.md).
- Supabase magic-link auth + Postgres with RLS (`supabase/schema.sql`). Auth is
  meant to be optional: anonymous users keep all state in `localStorage`.
- Charts: `lightweight-charts`. Vercel Analytics + Speed Insights.
- Market data: unofficial Yahoo Finance endpoints — live quotes
  (`lib/quote.ts`, 5-min cache, falls back to snapshot) and news
  (`lib/news.ts`). Five-year daily OHLC snapshots in `data/prices/*.json` are
  refreshed by `.github/workflows/refresh-prices.yml` (weekdays 22:00 UTC),
  which commits to `main` as `github-actions[bot]`.
- Hosting: Vercel project `arcanum2/arcanum`, production URL
  https://arcanum-gilt.vercel.app. Every push to `main`, including the nightly
  bot commit, deploys production.

## Layout

```text
app/                 routes; route handlers app/api/{quote,news,account}; app/auth/*
components/ui/       product + design-system components; components/hooks/
lib/prices.ts        snapshot access, timeframe slicing, % change
lib/quote.ts         live quote + snapshot fallback (source: "live" | "historical")
lib/simulator.ts     fake-money trades, holdings, P&L
lib/portfolio.ts     template selection from onboarding answers
lib/cloud-sync.ts    localStorage <-> Supabase sync
lib/api/tickers.ts   ticker allow-list validation for API routes
lib/supabase/        config.ts (is Supabase configured?) + browser, server, and
                     admin (service-role) clients; each returns null when unconfigured
data/                stocks.ts (5 deep profiles), stocks-lite.ts (25), portfolios.ts,
                     onboarding.ts, learning-cards.ts, briefs.ts, prices/
scripts/fetch-prices.mjs   snapshot refresh (Yahoo, 30 tickers)
proxy.ts             Supabase session refresh on every non-static request (no-op
                     when unconfigured; fails open, protects no routes)
```

## Commands

```bash
npm ci                   # clean install from the lockfile (CI: Node 24 / npm 11)
npm run dev              # http://localhost:3000
npm run lint             # eslint
npm run typecheck        # tsc --noEmit
npm run check            # lint + typecheck
npm run build && npm run start
node scripts/fetch-prices.mjs   # rewrites data/prices/*.json from Yahoo
```

npm test                 # Vitest unit tests (lib/*.test.ts); also runs in CI

Money math lives in `lib/simulator-math.ts` (pure, unit-tested). Add tests for
any new financial calculation. Also verify UI changes by building and
exercising the affected routes in a browser.

## Environment

Variable names are in `.env.example`; details in `docs/ENVIRONMENT.md`. Never
print, commit, or paste real values.

Supabase is optional. `lib/supabase/config.ts` is the single source of truth:
when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing
or the URL is malformed, the Supabase client factories return `null`, the
proxy passes requests through, and sign-in/sync UI is hidden. Every new
Supabase call site must handle the `null` client. Never call
`createServerClient`/`createBrowserClient` directly with raw env vars; that is
what caused the 2026 site-wide 500 outage. You can run locally with no `.env.local` at all.

## Financial data and accuracy rules

- Always make it clear whether a number is live, from the snapshot, or
  illustrative. Show as-of dates. Label sample and template numbers.
- Snapshot bars: `close` is split-adjusted price only; `adjClose` also includes
  dividends. Any return shown to users must say "price return" or
  "total return". Use `adjClose` for performance comparisons.
- A simulator fill price and the price used to value that holding must come
  from the same source. Record the quote source and as-of time on trades.
- Never present forecasts, targets, or advice. Follow VISION.md §6
  ("observes", "worth considering", "what could go wrong").
- Don't hardcode time-sensitive market facts (market caps, yields, "largest
  X") without a review date. Don't publish unverifiable claims
  (user counts, features that don't exist).
- When Yahoo fails, fall back to the snapshot and label it. Never show a
  fallback value under a "LIVE" badge.

## Deployment and Git precautions

- Do not commit, push, or deploy unless the user explicitly asks. A push to
  `main` deploys production.
- `NEXT_PUBLIC_*` values are inlined at build time. Redeploy after changing
  them in Vercel.
- A green Vercel deployment does not mean the site works. Smoke-test `/`,
  `/stocks/AAPL`, and `/api/quote?tickers=AAPL` after any deploy.
- The service-role key is server-only (`lib/supabase/admin.ts`, used only by
  `app/api/account`). Never import it into client code.
- No force-push, hard reset, or branch deletion.

## Design system

Preserve it. True black background, jade accent `#00e5a8`, square edges,
Fraunces (display) + Inter (body) + JetBrains Mono (data). Tokens live at the
top of `app/globals.css`. Do not change the logo/wordmark
(`components/ui/wordmark.tsx`, `app/icon.svg`) or the ARCANUM name without an
explicit request. Match existing styling idioms (inline style objects plus
globals.css classes).
