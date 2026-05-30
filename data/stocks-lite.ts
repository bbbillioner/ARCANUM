import type { AssetType, RiskLevel } from "@/types/investing";

export type LiteStockProfile = {
  ticker: string;
  name: string;
  assetType: AssetType;
  sector: string;
  beginnerRiskLevel: RiskLevel;
  beginnerSummary: string;
};

export const liteStockProfiles: LiteStockProfile[] = [
  // ETFs
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    assetType: "ETF",
    sector: "U.S. large-cap equities",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "The oldest and most widely-traded S&P 500 ETF. Mirrors the same index as VOO but with a slightly higher expense ratio.",
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetType: "ETF",
    sector: "Total U.S. equities",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "A single fund that owns essentially every public U.S. company — small, mid, and large cap. Maximum domestic diversification in one ticker.",
  },
  {
    ticker: "VEA",
    name: "Vanguard FTSE Developed Markets ETF",
    assetType: "ETF",
    sector: "Developed international equities",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "International exposure outside the U.S. — Europe, Japan, Australia, Canada. Pairs with VTI for a global core.",
  },
  {
    ticker: "SCHD",
    name: "Schwab U.S. Dividend Equity ETF",
    assetType: "ETF",
    sector: "Dividend-focused U.S. equities",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Holds U.S. companies with strong dividend histories. Popular for income-tilted beginner portfolios.",
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetType: "ETF",
    sector: "U.S. investment-grade bonds",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Broad U.S. bond exposure — Treasuries, corporates, mortgage-backed. Usually held to dampen stock volatility.",
  },

  // Mega-cap tech
  {
    ticker: "AAPL",
    name: "Apple",
    assetType: "Stock",
    sector: "Consumer technology",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Maker of the iPhone, Mac, and services like the App Store. One of the most-held individual stocks in beginner portfolios.",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    assetType: "Stock",
    sector: "Search & advertising",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Google's parent company. Earns most of its revenue from search advertising, with growing cloud and YouTube businesses.",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    assetType: "Stock",
    sector: "E-commerce & cloud",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Online retail at massive scale plus AWS, the largest cloud-computing platform. Two very different businesses under one ticker.",
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    assetType: "Stock",
    sector: "Social media & advertising",
    beginnerRiskLevel: "elevated",
    beginnerSummary:
      "Owner of Facebook, Instagram, WhatsApp. High-margin advertising business with significant investments in AI infrastructure.",
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    assetType: "Stock",
    sector: "Electric vehicles & energy",
    beginnerRiskLevel: "elevated",
    beginnerSummary:
      "Electric vehicle pioneer with energy storage and self-driving software bets. Highly volatile and narrative-driven.",
  },

  // Consumer
  {
    ticker: "WMT",
    name: "Walmart",
    assetType: "Stock",
    sector: "Mass-market retail",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "The largest retailer in the world. Defensive business that tends to hold up in weaker economies.",
  },
  {
    ticker: "HD",
    name: "Home Depot",
    assetType: "Stock",
    sector: "Home improvement retail",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Dominant U.S. home-improvement retailer. Sensitive to housing market and consumer spending cycles.",
  },
  {
    ticker: "MCD",
    name: "McDonald's",
    assetType: "Stock",
    sector: "Quick-service restaurants",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Global fast-food franchise with steady cash flow. Often held as a defensive dividend stock.",
  },
  {
    ticker: "KO",
    name: "Coca-Cola",
    assetType: "Stock",
    sector: "Beverages",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Classic dividend-paying consumer-staples company. Slow-growing but historically very stable.",
  },
  {
    ticker: "DIS",
    name: "Disney",
    assetType: "Stock",
    sector: "Media & entertainment",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Theme parks, streaming, and a deep library of franchises. Transitioning from cable to streaming-first business.",
  },

  // Finance
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    assetType: "Stock",
    sector: "Money-center banks",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "The largest U.S. bank. Often used as a bellwether for the broader financial sector.",
  },
  {
    ticker: "V",
    name: "Visa",
    assetType: "Stock",
    sector: "Payment networks",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Operates one of the two dominant card networks. Earns a tiny cut of nearly every credit/debit swipe globally.",
  },
  {
    ticker: "MA",
    name: "Mastercard",
    assetType: "Stock",
    sector: "Payment networks",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "The other dominant card network. Similar business model to Visa, often analyzed as a duopoly.",
  },

  // Healthcare
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    assetType: "Stock",
    sector: "Pharmaceuticals & devices",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Diversified healthcare giant — pharmaceuticals, medical devices, and consumer health. Defensive dividend payer.",
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group",
    assetType: "Stock",
    sector: "Health insurance & services",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Largest U.S. health insurer plus a growing services business (Optum). Sensitive to regulation and medical-cost trends.",
  },
  {
    ticker: "LLY",
    name: "Eli Lilly",
    assetType: "Stock",
    sector: "Pharmaceuticals",
    beginnerRiskLevel: "elevated",
    beginnerSummary:
      "Drug maker with leading GLP-1 weight-loss franchise. High growth, high expectations baked into the price.",
  },

  // Other
  {
    ticker: "BRK-B",
    name: "Berkshire Hathaway",
    assetType: "Stock",
    sector: "Diversified conglomerate",
    beginnerRiskLevel: "low",
    beginnerSummary:
      "Warren Buffett's holding company — insurance, energy, railroads, plus a giant stock portfolio (Apple, Coke, etc.).",
  },
  {
    ticker: "BA",
    name: "Boeing",
    assetType: "Stock",
    sector: "Aerospace & defense",
    beginnerRiskLevel: "elevated",
    beginnerSummary:
      "One of two major commercial aircraft makers. Cyclical and execution-sensitive with significant defense exposure.",
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil",
    assetType: "Stock",
    sector: "Integrated energy",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Largest U.S. integrated oil major. Earnings rise and fall with oil and gas prices; pays a meaningful dividend.",
  },
  {
    ticker: "NKE",
    name: "Nike",
    assetType: "Stock",
    sector: "Athletic apparel",
    beginnerRiskLevel: "moderate",
    beginnerSummary:
      "Dominant athletic footwear and apparel brand. Sensitive to consumer trends and global supply chains.",
  },
];
