export type RiskLevel = "low" | "moderate" | "elevated";

export type TimeHorizon = "1-3 years" | "3-7 years" | "7+ years";

export type AssetMixItem = {
  assetClass: string;
  percentage: number;
  rationale: string;
};

export type SectorExposureItem = {
  sector: string;
  percentage: number;
};

export type PortfolioHolding = {
  ticker: string;
  name: string;
  allocation: number;
  role: string;
};

export type PortfolioTemplate = {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  timeHorizon: TimeHorizon;
  assetMix: AssetMixItem[];
  sectorExposure: SectorExposureItem[];
  holdings: PortfolioHolding[];
  explanation: string;
  disclaimer: string;
};

export type BeginnerMetric = {
  label: string;
  value: string;
  explanation: string;
};

export type AssetType = "ETF" | "Stock";

export type StockProfile = {
  ticker: string;
  name: string;
  assetType: AssetType;
  sector: string;
  beginnerRiskLevel: RiskLevel;
  beginnerSummary: string;
  portfolioRole: string;
  companySummary: string;
  businessModel: string;
  whyPeopleInvest: string[];
  keyRisks: string[];
  bullCase: string;
  baseCase: string;
  bearCase: string;
  beginnerMetrics: BeginnerMetric[];
  whatToResearchNext: string[];
};

export type DailyBriefCard = {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  affectedSectors: string[];
  affectedHoldings: string[];
  beginnerTranslation: string;
};

export type LearningCard = {
  term: string;
  simpleMeaning: string;
  whyItMatters: string;
  example: string;
};

export type OnboardingQuestionId =
  | "budget"
  | "goal"
  | "timeHorizon"
  | "riskComfort"
  | "experience"
  | "interests"
  | "portfolioStyle"
  | "investmentApproach";

export type OnboardingAnswers = {
  budget: string;
  goal: string;
  timeHorizon: string;
  riskComfort: string;
  experience: string;
  interests: string[];
  portfolioStyle: string;
  investmentApproach: string;
};

export type OnboardingQuestion = {
  id: OnboardingQuestionId;
  label: string;
  question: string;
  options: string[];
  multiple?: boolean;
};

export type FeatureCard = {
  title: string;
  description: string;
};

export type Metric = {
  label: string;
  value: string;
  detail?: string;
};

export type AllocationSegment = {
  label: string;
  percentage: number;
  colorClass: string;
};


export type SimulatorTransactionType = "buy" | "sell";

/** Where a trade's price came from: a live quote or the latest daily close. */
export type PriceSource = "live" | "historical";

export type SimulatorHolding = {
  ticker: string;
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  investedAmount: number;
  marketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  allocationPercent: number;
};

export type ThesisReview = {
  note: string;
  createdAt: string;
};

export type SimulatorTransaction = {
  id: string;
  type: SimulatorTransactionType;
  ticker: string;
  shares: number;
  price: number;
  amount: number;
  createdAt: string;
  /** Source of `price`. Absent on trades recorded before 2026-10. */
  priceSource?: PriceSource;
  /** When `price` was observed (ISO). Absent on older trades. */
  priceAsOf?: string;
  /** Sells only: proceeds minus the average cost of the shares sold. */
  realizedGainLoss?: number;
  thesis?: string;
  preMortem?: string;
  reviews?: ThesisReview[];
};

export type SimulatorState = {
  startingCash: number;
  cashBalance: number;
  holdings: SimulatorHolding[];
  transactions: SimulatorTransaction[];
  createdAt: string;
  updatedAt: string;
};

export type SimulatorSummary = {
  totalPortfolioValue: number;
  cashBalance: number;
  investedValue: number;
  /** Total value minus starting cash: realized + unrealized. */
  totalGainLoss: number;
  totalGainLossPercent: number;
  unrealizedGainLoss: number;
  realizedGainLoss: number;
  cashAllocationPercent: number;
  investedAllocationPercent: number;
};

export type SimulatorActionResult = {
  success: boolean;
  message: string;
  state: SimulatorState | null;
};
