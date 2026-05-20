import type { PortfolioTemplate } from "@/types/investing";

const standardDisclaimer =
  "Educational example only. This is not financial advice, a recommendation, or a prediction. Investors should consider their own goals, timeline, risk tolerance, and research before making decisions.";

export const portfolioTemplates: PortfolioTemplate[] = [
  {
    id: "conservative-beginner",
    name: "Conservative Beginner",
    description:
      "A steadier starter template for investors who want broad exposure and lower single-stock concentration.",
    riskLevel: "low",
    timeHorizon: "3-7 years",
    assetMix: [
      {
        assetClass: "Broad U.S. market ETF",
        percentage: 55,
        rationale:
          "Keeps the core diversified across many companies instead of relying on a few names.",
      },
      {
        assetClass: "Cash or short-term reserves",
        percentage: 25,
        rationale:
          "Reduces the chance that a beginner is forced to sell during a market decline.",
      },
      {
        assetClass: "Quality large-cap stocks",
        percentage: 20,
        rationale:
          "Adds a small learning sleeve for studying individual businesses.",
      },
    ],
    sectorExposure: [
      { sector: "Broad market", percentage: 55 },
      { sector: "Technology", percentage: 15 },
      { sector: "Consumer staples", percentage: 10 },
      { sector: "Cash", percentage: 20 },
    ],
    holdings: [
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        allocation: 55,
        role: "Core diversified U.S. equity exposure",
      },
      {
        ticker: "CASH",
        name: "Cash reserve",
        allocation: 25,
        role: "Volatility buffer and future buying power",
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        allocation: 10,
        role: "High-quality large-cap technology exposure",
      },
      {
        ticker: "COST",
        name: "Costco Wholesale",
        allocation: 10,
        role: "Defensive consumer business for learning",
      },
    ],
    explanation:
      "This template prioritizes staying power. The broad ETF does most of the work, cash lowers emotional pressure, and the individual stocks create a small research sandbox.",
    disclaimer: standardDisclaimer,
  },
  {
    id: "balanced-growth",
    name: "Balanced Growth",
    description:
      "A middle-ground template for beginners who want diversified growth with some focused company exposure.",
    riskLevel: "moderate",
    timeHorizon: "7+ years",
    assetMix: [
      {
        assetClass: "Broad U.S. market ETF",
        percentage: 45,
        rationale:
          "Provides a diversified base across profitable large U.S. companies.",
      },
      {
        assetClass: "Growth ETF",
        percentage: 25,
        rationale:
          "Adds exposure to innovation-led companies while staying diversified.",
      },
      {
        assetClass: "Quality large-cap stocks",
        percentage: 20,
        rationale:
          "Supports company-level learning without dominating the portfolio.",
      },
      {
        assetClass: "Cash or short-term reserves",
        percentage: 10,
        rationale:
          "Leaves room for rebalancing and reduces all-in timing risk.",
      },
    ],
    sectorExposure: [
      { sector: "Broad market", percentage: 45 },
      { sector: "Technology and communication", percentage: 35 },
      { sector: "Consumer staples", percentage: 10 },
      { sector: "Cash", percentage: 10 },
    ],
    holdings: [
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        allocation: 45,
        role: "Core market exposure",
      },
      {
        ticker: "QQQ",
        name: "Invesco QQQ Trust",
        allocation: 25,
        role: "Diversified growth tilt",
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        allocation: 10,
        role: "Durable software and cloud exposure",
      },
      {
        ticker: "COST",
        name: "Costco Wholesale",
        allocation: 10,
        role: "Quality consumer compounder",
      },
      {
        ticker: "CASH",
        name: "Cash reserve",
        allocation: 10,
        role: "Flexibility and rebalancing reserve",
      },
    ],
    explanation:
      "This template balances broad diversification with a clear growth tilt. It is built to teach allocation, concentration, and portfolio roles without becoming a stock-picking exercise.",
    disclaimer: standardDisclaimer,
  },
  {
    id: "aggressive-growth",
    name: "Aggressive Growth",
    description:
      "A higher-volatility starter template for long time horizons and investors learning about concentration risk.",
    riskLevel: "elevated",
    timeHorizon: "7+ years",
    assetMix: [
      {
        assetClass: "Growth ETF",
        percentage: 40,
        rationale:
          "Creates broad exposure to companies expected to reinvest heavily for growth.",
      },
      {
        assetClass: "Broad U.S. market ETF",
        percentage: 30,
        rationale:
          "Keeps a diversified anchor under the higher-growth sleeve.",
      },
      {
        assetClass: "Focused growth stocks",
        percentage: 25,
        rationale:
          "Adds higher upside and higher downside through individual company exposure.",
      },
      {
        assetClass: "Cash or short-term reserves",
        percentage: 5,
        rationale:
          "Provides a small buffer while keeping the portfolio mostly invested.",
      },
    ],
    sectorExposure: [
      { sector: "Technology and semiconductors", percentage: 45 },
      { sector: "Broad market", percentage: 30 },
      { sector: "Consumer staples", percentage: 10 },
      { sector: "Communication and growth", percentage: 10 },
      { sector: "Cash", percentage: 5 },
    ],
    holdings: [
      {
        ticker: "QQQ",
        name: "Invesco QQQ Trust",
        allocation: 40,
        role: "Primary growth exposure",
      },
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        allocation: 30,
        role: "Diversified market anchor",
      },
      {
        ticker: "NVDA",
        name: "NVIDIA",
        allocation: 15,
        role: "Semiconductor and AI infrastructure exposure",
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        allocation: 10,
        role: "Large-cap software and cloud quality",
      },
      {
        ticker: "CASH",
        name: "Cash reserve",
        allocation: 5,
        role: "Small volatility buffer",
      },
    ],
    explanation:
      "This template accepts larger drawdowns in exchange for more growth exposure. Beginners should use it to understand volatility, valuation risk, and the discipline needed to hold concentrated positions.",
    disclaimer: standardDisclaimer,
  },
];
