# ARCANUM

ARCANUM is a beginner investor command center. It helps new investors build a starter portfolio, understand their holdings, connect market events to portfolio exposure, and learn investing concepts inside one focused app.

The MVP is intentionally static and educational. It is built to demonstrate the product flow before adding accounts, live data, AI, or backend services.

## Product Vision

ARCANUM is designed for beginners who want to become more informed investors without jumping straight into trading tools or prediction dashboards. The long-term vision is a calm, serious workspace where users can:

- Build and compare starter portfolio structures
- Understand what each holding does and why it belongs in a portfolio
- Track relevant market and world events through a portfolio lens
- Learn key investing concepts while using the app
- Develop a repeatable research process before making decisions

## Current MVP Features

- Premium dark fintech homepage
- 8-step onboarding questionnaire stored in `localStorage`
- Static portfolio suggestion based on risk comfort and portfolio style
- Dashboard command center with portfolio health, allocation, sector exposure, holdings, brief preview, and learning card
- Static stock research pages for `VOO`, `QQQ`, `MSFT`, `NVDA`, and `COST`
- Static daily market brief page
- Typed static data for portfolios, stocks, briefs, and learning cards

## What ARCANUM Is Not

- Not a trading bot
- Not a stock predictor
- Not financial advice
- No broker connection
- No payments
- No authentication or user accounts yet
- No live stock APIs yet
- No AI API yet
- No backend database yet

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Static local data
- Browser `localStorage` for onboarding answers

## Project Structure

```txt
app/
  brief/
  dashboard/
  onboarding/
  portfolio-suggestion/
  stocks/[ticker]/
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
data/
  briefs.ts
  home.ts
  learning-cards.ts
  portfolios.ts
  stocks.ts
lib/
  utils.ts
types/
  investing.ts
public/
```

## Routes

- `/` - Homepage
- `/onboarding` - Beginner investor questionnaire
- `/portfolio-suggestion` - Static portfolio suggestion after onboarding
- `/dashboard` - Main investor command center
- `/stocks/[ticker]` - Static research pages for supported tickers
- `/brief` - Daily market brief

Supported stock research routes:

- `/stocks/VOO`
- `/stocks/QQQ`
- `/stocks/MSFT`
- `/stocks/NVDA`
- `/stocks/COST`

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

The project is ready for a standard Vercel deployment:

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js build settings.
4. Deploy.

No environment variables are required for the current static MVP.

## Educational Disclaimer

ARCANUM is an educational product prototype. The portfolio templates, stock profiles, market briefs, metrics, and explanations are static examples for learning. They are not financial advice, investment recommendations, trading signals, or predictions. Users should do their own research and consider their personal goals, time horizon, and risk tolerance before making financial decisions.

## Roadmap

- Add dashboard persistence with accounts and authentication
- Add editable portfolios and watchlists
- Add richer stock and ETF research pages
- Add daily brief archives and topic filters
- Add live market data after the static UX is validated
- Add AI-assisted explanations after core workflows are stable
- Add more learning paths and quizzes
- Add portfolio review and rebalance education
