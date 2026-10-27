# ARCANUM — roadmap to V1.0 and beyond

Last updated: 2026-10-23. Evidence and file references for every item are in
`docs/ARCANUM_STATUS.md`. Product direction is set by `VISION.md`. Each item
should answer one of its "four questions" (VISION §4).

Mark items `[x]` when done and note the commit.

> **2026-10-27:** P0-1/2/3 done and verified in production and CI. Done and
> deployed: P1-1, P1-2, P1-3, P1-4 (simulator tests; prices/tickers tests
> still to add), P1-5, P1-6 (confirm the next nightly `lastBarDate`), P1-7,
> P1-8, P1-9, P1-10, P1-13, P1-14, P1-15, P1-16, P1-17, P1-18, P1-19 code
> parts, P2-1 for `/stocks` and `/compare` HTML, P2-4. P1-11 softened to
> "$0 during early access" (owner to confirm). P1-12 superlatives reworded;
> `reviewedAt` not added. New top item: split `lib/prices.ts` so client pages
> stop loading all 30 price files (4.2 MB chunk).

**Effort scale:** S < half a day · M ≈ 1 day · L = several days.

---

## P0 — Critical blockers

Problems that keep the product from working or from being deployed safely.

- [ ] **P0-1 Restore production (site-wide 500).** · M
  - [x] Add `isSupabaseConfigured()`, then make `proxy.ts` skip the session
        refresh when Supabase is unconfigured and catch errors (fail open).
        *(2026-10-25, `lib/supabase/config.ts`, uncommitted)*
  - [x] Make `lib/supabase/{client,server,admin}.ts` callers handle the
        unconfigured case. This covers `auth-indicator`, `cloud-sync`,
        `sign-in`, `settings`, `/auth/*`, and `/api/account`. Hide sign-in
        and sync UI when Supabase is unconfigured. Also guarded the layout
        against a malformed `NEXT_PUBLIC_SITE_URL`.
  - [x] Verify locally with **no** env vars: every route returns 200, and
        anonymous mode works end to end. Also verified with a valid-format
        test config and with malformed URLs.
  - [ ] *(User)* Approve, then commit and push to `main`. This deploys
        production; then run the smoke test below.
  - [ ] *(User, in the Vercel dashboard)* Set `NEXT_PUBLIC_SITE_URL` to the
        production URL (recommended now, not secret).
  - [ ] *(User, in the Vercel dashboard, only when accounts are wanted)*
        Confirm the Supabase project exists.
        Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
        `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` to
        **Production** (and Preview), then redeploy. Check the runtime logs.
  - [ ] Post-deploy smoke test: `/`, `/stocks/AAPL`,
        `/api/quote?tickers=AAPL`. Check whether quotes are
        `source: "live"` from Vercel.
- [ ] **P0-2 Patch the Next.js security advisories.** · S *(done locally,
      awaiting commit)*
  - [x] Upgrade `next` and `eslint-config-next` 16.2.6 → 16.4.3, then run
        `npm audit fix` (non-forced). `npm audit` reports 0 vulnerabilities.
  - [x] Rebuild, lint, typecheck, and click through the main routes. Read the
        Next 16.4 proxy and upgrade notes in `node_modules/next/dist/docs/`.
- [ ] **P0-3 Make CI pass.** · S *(done locally, confirm on first CI run
      after push)*
  - [x] Regenerate `package-lock.json` so `npm ci` succeeds. Verified with
        npm 10.8.2 and npm 11.6.2.
  - [x] Bump CI Node from 20 (end of life) to 24, so CI uses npm 11 like
        local development. Any `npm install`/`audit fix` run with npm 11
        strips lock entries that npm 10 requires, so CI on Node 20 would
        break again on the next dependency change.
  - [ ] Bump `refresh-prices.yml` (Node 20, installs nothing, low risk) and
        check the Vercel project's Node setting (22.x or 24.x).
  - [ ] Optional: make the price-refresh workflow trigger CI, or run
        `npm run build` in it before committing.

## P1 — Essential for V1.0

### Financial accuracy

- [ ] **P1-1 Simulator price consistency.** · M
  - [ ] One price source for fills *and* valuation.
  - [ ] Store `priceSource` and `quoteAsOf` on each trade.
  - [ ] Align all copy (homepage, simulator, Today, Journal, Help) with the
        chosen rule.
- [ ] **P1-2 Simulator sell math and P&L.** · M
  - [ ] Validate sells against shares × fill price.
  - [ ] Add a "sell all" option.
  - [ ] Track realized P&L.
  - [ ] Make "Total gain/loss" = value − starting cash.
  - [ ] Unify the average-cost rounding between the simulator and cloud-sync.
- [ ] **P1-3 Simulator safety.** · S
  - [ ] Reset and "Clear simulator" need confirmation and must warn that they
        erase the journal.
  - [ ] Reset must restore the session's own starting cash.
- [ ] **P1-4 Unit tests for the money math** (add Vitest). · M
  - [ ] Cover the simulator buy/sell/P&L, `lib/prices.ts` return
        calculations, and `lib/api/tickers.ts`.
- [ ] **P1-5 Price vs total return.** · M
  - [ ] Use `adjClose` for performance figures and the Compare overlay,
        labeled "total return (dividends reinvested)".
  - [ ] Where `close` is kept, label it "price return".
- [ ] **P1-6 Snapshot freshness.** · S
  - [ ] Fix the one-session lag in `scripts/fetch-prices.mjs`.
  - [ ] Record the real `fetchedAt` and a separate `lastBarDate`.
  - [ ] Show the bar date honestly.
- [ ] **P1-7 Starter template logic.** · S
  - [ ] Use time horizon (and income style) in `selectPortfolioTemplate`.
  - [ ] Remove the "7+ years vs your 1–3 years" contradiction.
  - [ ] Render each template's disclaimer.
  - [ ] Fix the sector-exposure vs holdings mismatches in
        `data/portfolios.ts`.
- [ ] **P1-8 Market-hours logic.** · S
  - [ ] Use America/New_York via `Intl` (DST-correct) for `/today`.
  - [ ] Add a basic NYSE holiday list.

### Honesty, copy, and dead features

- [ ] **P1-9 Remove false or unverifiable claims.** · S
  - [ ] Remove or verify "220+ in the first cohort".
  - [ ] Fix "32 concepts explained inline".
  - [ ] Remove "Hover any ticker/term/metric" and the Help FAQ about dotted
        underlines, or wire up the existing `Term`/`Tooltip` components.
  - [ ] Fix the Method "Guide" claims about concentration, panic, and fee
        prompts.
  - [ ] Pricing roadmap: stop listing already-built features as future.
- [ ] **P1-10 "LIVE" badges** only when `source === "live"`; otherwise show
      "as of <date>". · S
- [ ] **P1-11 Pricing section decision.** "Free during early access" vs
      "$0 forever". *(Product owner decides.)* · S
- [ ] **P1-12 Content review dates.**
  - [ ] Add a `reviewedAt` to stock profiles.
  - [ ] Fix stale or time-bound lines (`stocks-lite.ts` superlatives, Berkshire
        leadership wording, "compounding through 2026").
  - [ ] Date the brief examples.
  - · S

### Defects

- [ ] **P1-13 Fix `/opengraph-image`.** · S
  - [ ] Fix the Satori error (`display: flex` on multi-child divs).
  - [ ] Replace the hardcoded `arcanum.app` with `NEXT_PUBLIC_SITE_URL`.
- [ ] **P1-14 Watchlist shows all watched tickers.** Filter against the full
      30-ticker universe, not the 5 deep profiles. · S
- [ ] **P1-15 Today news.** · S
  - [ ] Cap tickers at 10 (prioritize holdings, then watchlist, then template).
  - [ ] Handle `!response.ok` as an error state.
- [ ] **P1-16 `/stocks/[ticker]`.** Unknown ticker → `notFound()` (real 404). · S
- [ ] **P1-17 `/terms` styling.** Move `.legal-prose` into `globals.css`.
      Fix the doubled "· ARCANUM" titles. · S
- [ ] **P1-18 Responsive nav.** · S
  - [ ] Fix "Open Terminal" clipping at 375 px and crowding at ~1024 px.
  - [ ] Unify where the two "Open terminal" CTAs go (`/onboarding` vs
        `/dashboard`).
- [ ] **P1-19 Auth hardening** (only if auth ships in V1). · M
  - [ ] Make the callback `next` guard reject backslashes and control
        characters.
  - [ ] Show the `?error=callback` state on sign-in.
  - [ ] Add try/catch around account delete.
  - [ ] Run the `supabase/SETUP.md` §5–6 verification with two users and
        two devices.

### The one new V1 analytic

- [ ] **P1-20 Risk & return panel.** · L
  - [ ] Pure functions over `adjClose`:
    - total return
    - CAGR
    - annualized volatility (√252)
    - max drawdown with dates
    - growth of $1,000
  - [ ] Show it on `/stocks/[ticker]` (timeframe-aware) and side by side on
        `/compare`.
  - [ ] Plain-language explanations, no forecasts. Unit-tested.
  - Reuses the correct parts of the legacy Python analytics.

### Launch checklist

- [ ] **P1-21 Launch verification.**
  - [ ] Real-device mobile pass (iOS Safari, Android Chrome).
  - [ ] Production smoke test of every route.
  - [ ] Error monitoring decision (Sentry or Vercel logs + alerts).
  - [ ] Update README and these docs.

## P2 — Product polish

- [ ] **P2-1 Page weight.** · M
  - [ ] Stop serializing full 5-year bar arrays into `/stocks` (1.3 MB) and
        `/compare`.
  - [ ] Send pre-sliced or downsampled series.
  - [ ] Lazy-load chart data.
- [ ] **P2-2 Loading states.** Add `loading.tsx` for routes that wait on Yahoo. · S
- [ ] **P2-3 Simulator universe.** Allow all 30 tickers; the `/stocks` copy
      already promises "any of these assets". · S
- [ ] **P2-4 Compare picker.** Controlled selects so Swap updates them. · S
- [ ] **P2-5 Design-system consistency.** · S
  - [ ] Remove `--font-geist-sans` refs, rounded pills, and `rounded-3xl`.
  - [ ] Tokenize the loss red. Show homepage losses in red, not grey.
- [ ] **P2-6 Dead-code cleanup.** Unused components, data, helpers, and the
      `goals` table, or wire them up. · S
- [ ] **P2-7 Accessibility pass.**
  - [ ] Labels on icon-only buttons.
  - [ ] Focus states and contrast.
  - [ ] `prefers-reduced-motion` for `.reveal` animations.
  - · M
- [ ] **P2-8 Security hardening.** · M
  - [ ] CSP header.
  - [ ] Rate limiting on `/api/quote` and `/api/news`.
  - [ ] `thesis_reviews` RLS policy must check transaction ownership.
  - [ ] Upgrade `@supabase/ssr` to 0.12.x.
- [ ] **P2-9 Cloud-sync robustness.** · M
  - [ ] Upsert or an RPC transaction instead of delete+insert.
  - [ ] Throttle sync-on-focus.
- [ ] **P2-10 Post-deploy health check.** A GitHub Action or Vercel check that
      fails if `/` or `/api/quote` returns ≥500 after a deploy. · S
- [ ] **P2-11 E2E smoke tests** (Playwright). Onboarding → suggestion →
      simulator buy/sell → journal. · M

## P3 — Future expansion (after V1.0)

- **Portfolio optimization.** Black-Litterman, re-implemented correctly, with:
  - consistent annualization
  - meaningful view confidence (Idzorek or user-set Ω)
  - market-cap equilibrium weights
  - a true long-only QP optimizer
  - safe ticker alignment and a robust view parser
- **Benchmarks.** Simulator portfolio vs SPY/VOO; historical simulator
  performance.
- **Licensed market-data provider.** Replace the unofficial Yahoo endpoints.
- **VISION Phase 1:**
  - AI breakdowns (Anthropic API)
  - manual real-trade entry
  - goals + benchmarks
  - weekly email digest
- **Broader research.** More tickers, more deep profiles, and fundamentals
  (which would also enable a fixed Magic Formula screen).
- **Monetization.** Operator tier and payments, per VISION §8, only after
  traction.
- **Later phases:** multi-account, tax awareness, time-machine backtest, broker
  integrations (Plaid/SnapTrade), PWA/native app.
- **Custom domain** and brand assets. The logo is not finalized; change it
  only on explicit request.
- **Move snapshots out of Git** (Blob storage + ISR) so nightly data refreshes
  stop creating commits and production redeploys.
