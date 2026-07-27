# ARCANUM

ARCANUM is a beginner investor simulator and command center. It gives new
investors a structured place to build an investor profile, explore starter
portfolio ideas, research stocks and ETFs, follow relevant market news, and
practice investing with fake money before risking real money.

The product is educational. It does not place trades, connect to brokerage
accounts, predict prices, or provide financial advice.

## Product vision

Most investing products are designed for people who already know what they are
doing. ARCANUM is designed for the period before that: learning how allocation,
risk, diversification, company research, and investment theses fit together.

The long-term goal is a calm, technically serious workspace that helps a
beginner develop a repeatable research process and make more informed decisions.

## Current product

- Eight-step investor onboarding and personalized starter portfolio direction
- Investor dashboard with allocation, exposure, holdings, news, and learning
- Paper-trading simulator with fractional, amount-based fake-money trades
- Required buy thesis, optional pre-mortem, and follow-up journal reviews
- Research pages for a curated stock and ETF universe
- Historical price charts, quote snapshots, comparisons, and watchlists
- Market-news feed connected to the user's holdings and interests
- Investing glossary, learning cards, daily brief, and Today view
- Passwordless email authentication through Supabase
- Anonymous local storage with authenticated cross-device cloud synchronization
- Data export and permanent account deletion from Settings
- Vercel Analytics and Speed Insights

Market quotes and news currently come from Yahoo Finance endpoints with local
historical snapshots as a quote fallback. This is suitable for an early-access
educational release, but it is not an exchange-grade market data feed.

## What ARCANUM is not

- Not a brokerage or broker connection
- Not a trading bot or automated adviser
- Not a stock predictor or signal service
- Not financial, tax, or legal advice
- No real-money deposits, withdrawals, or trades
- No payments or subscriptions in the current version
- No AI-generated recommendations in the current version

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth and Postgres with Row Level Security
- `lightweight-charts` for interactive market charts
- Vercel Analytics and Speed Insights
- Browser `localStorage` for anonymous/offline-first product state
- GitHub Actions for quality checks and scheduled price snapshots

## Project structure

```text
app/                    Pages, layouts, auth callbacks, and route handlers
components/             Shared client components and product UI
components/hooks/       Reusable React data hooks
components/ui/          Design-system and product components
data/                   Curated educational content and price snapshots
lib/                    Portfolio, simulator, sync, quote, and news logic
lib/api/                Shared route-handler input validation
lib/supabase/           Browser, server, and admin Supabase clients
scripts/                Price-snapshot maintenance scripts
supabase/               Database schema and setup instructions
types/                  Shared TypeScript domain models
.github/workflows/      CI and scheduled data refresh workflows
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Product home |
| `/today` | Personalized daily command center |
| `/onboarding` | Investor-profile questionnaire |
| `/portfolio-suggestion` | Starter portfolio direction |
| `/dashboard` | Portfolio health and exposure dashboard |
| `/simulator` | Fake-money investing simulator |
| `/journal` | Thesis and review journal |
| `/watchlist` | Followed stocks and ETFs |
| `/stocks` | Searchable research universe |
| `/stocks/[ticker]` | Individual asset research |
| `/compare` | Side-by-side asset comparison |
| `/brief` | Beginner market brief |
| `/learn` | Investing concepts and glossary |
| `/sign-in` | Passwordless email sign-in |
| `/settings` | Account, sync, export, and reset controls |
| `/privacy` | Privacy disclosure |
| `/terms` | Terms of use |

## Run locally

Requirements:

- Node.js 20 or newer
- npm
- A Supabase project for authentication and cloud sync

Install dependencies:

```bash
npm install
```

Create `.env.local` using `.env.example` as the template:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit `.env.local` or share the service-role key. Run the database schema
and configure authentication using [supabase/SETUP.md](supabase/SETUP.md).
For exact variable sources, laptop migration steps, and rules for developers
and AI assistants, see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

The same checks run in GitHub Actions for pushes to `main` and pull requests.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Add all four variables from `.env.example` to the appropriate Vercel
   environments.
3. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS production URL.
4. Run `supabase/schema.sql` in the Supabase SQL Editor.
5. Add the production `/auth/callback` URL in Supabase Authentication settings.
6. Deploy using Vercel's standard Next.js settings.
7. Verify sign-in, cloud sync, account deletion, quotes, and news in production.

See [supabase/SETUP.md](supabase/SETUP.md) for dashboard steps that cannot be
performed from this repository.

## Data behavior

Anonymous users keep onboarding, simulator, journal, and watchlist state in
their browser. Signed-in users retain that local copy and synchronize it with
their own Supabase rows. Row Level Security limits each user to their own data.

On first sign-in, ARCANUM migrates existing local data when no newer cloud copy
exists. Watchlists are merged; timestamped onboarding and simulator records use
last-write-wins conflict resolution.

## Educational disclaimer

ARCANUM is for education and simulation only. Portfolio templates, research
notes, scenarios, metrics, market data, and explanations are not personalized
financial advice or recommendations to buy, sell, or hold a security. Market
data may be delayed, incomplete, or unavailable. Users should verify important
information through official filings, fund documents, and qualified
professionals before making real financial decisions.

## Roadmap

- Replace unofficial market-data endpoints with a documented licensed provider
- Add automated unit and end-to-end coverage for critical product workflows
- Add explicit stale-market and provider-outage states throughout the UI
- Expand research coverage and display content review dates
- Add portfolio benchmarks and historical simulator performance
- Complete accessibility and cross-browser audits
- Run a closed beginner-investor beta before a wider public launch
