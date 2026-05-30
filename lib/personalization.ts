import { learningCards } from "@/data/learning-cards";
import { allProfiles } from "@/lib/stocks";
import type { LearningCard, OnboardingAnswers } from "@/types/investing";

// Map each onboarding interest to the tickers in our universe that fit.
// Tickers we don't yet cover (e.g. "China / emerging markets") map to []
// and surface as a "no coverage yet" note in the UI.
const INTEREST_TICKERS: Record<string, string[]> = {
  "AI / Technology": ["NVDA", "MSFT", "GOOGL", "META", "AAPL", "AMZN", "QQQ"],
  Healthcare: ["JNJ", "UNH", "LLY"],
  Energy: ["XOM"],
  "Consumer brands": ["COST", "WMT", "KO", "MCD", "DIS", "NKE"],
  Finance: ["JPM", "V", "MA", "BRK-B"],
  "ETFs / diversified investing": ["VOO", "VTI", "SPY", "QQQ", "VEA", "SCHD", "BND"],
  "China / emerging markets": [],
  Sustainability: [],
};

const GOAL_LEARNING_TERM: Record<string, string> = {
  "Learn investing": "ETF",
  "Grow long-term wealth": "Diversification",
  "Build a balanced portfolio": "Allocation",
  "Prepare for finance club / competition": "Bull Case",
  "Explore stocks I'm interested in": "Portfolio Thesis",
};

const BUDGET_TO_CASH: Record<string, number> = {
  "Under $100": 100,
  "$100-$500": 500,
  "$500-$1,000": 1000,
  "$1,000-$5,000": 1000,
  "$5,000+": 5000,
};

export type RecommendationGroup = {
  interest: string;
  tickers: string[];
  hasCoverage: boolean;
};

export type Personalization = {
  recommendationGroups: RecommendationGroup[];
  topRecommendedTickers: string[];
  learningCard: LearningCard;
  defaultSimulatorCash: number;
  preferEtfs: boolean;
};

export function derivePersonalization(
  answers: OnboardingAnswers,
): Personalization {
  const groups: RecommendationGroup[] = answers.interests.map((interest) => {
    const tickers = INTEREST_TICKERS[interest] ?? [];
    const coveredTickers = tickers.filter((t) =>
      allProfiles.some((p) => p.ticker === t),
    );
    return {
      interest,
      tickers: coveredTickers,
      hasCoverage: coveredTickers.length > 0,
    };
  });

  // Build a deduped, ordered list of recommended tickers.
  // If user prefers ETFs, surface ETF tickers first across all interests.
  const preferEtfs =
    answers.investmentApproach === "Mostly ETFs" ||
    answers.investmentApproach === "I want to learn before deciding";
  const preferStocks =
    answers.investmentApproach === "Mostly individual companies";

  const ranked: string[] = [];
  const seen = new Set<string>();

  function pushTicker(t: string) {
    if (seen.has(t)) return;
    seen.add(t);
    ranked.push(t);
  }

  const isEtf = (t: string) =>
    allProfiles.find((p) => p.ticker === t)?.assetType === "ETF";

  if (preferEtfs) {
    for (const g of groups) for (const t of g.tickers) if (isEtf(t)) pushTicker(t);
    for (const g of groups) for (const t of g.tickers) pushTicker(t);
  } else if (preferStocks) {
    for (const g of groups) for (const t of g.tickers) if (!isEtf(t)) pushTicker(t);
    for (const g of groups) for (const t of g.tickers) pushTicker(t);
  } else {
    for (const g of groups) for (const t of g.tickers) pushTicker(t);
  }

  const learningTerm = GOAL_LEARNING_TERM[answers.goal] ?? "ETF";
  const learningCard =
    learningCards.find((c) => c.term === learningTerm) ?? learningCards[0];

  const defaultSimulatorCash = BUDGET_TO_CASH[answers.budget] ?? 1000;

  return {
    recommendationGroups: groups,
    topRecommendedTickers: ranked.slice(0, 8),
    learningCard,
    defaultSimulatorCash,
    preferEtfs,
  };
}

export function tickerMatchesInterests(
  ticker: string,
  interests: string[],
): boolean {
  const upper = ticker.toUpperCase();
  for (const interest of interests) {
    if ((INTEREST_TICKERS[interest] ?? []).includes(upper)) return true;
  }
  return false;
}
