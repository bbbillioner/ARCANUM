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

export type StockProfile = {
  ticker: string;
  name: string;
  sector: string;
  beginnerRiskLevel: RiskLevel;
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

export type Holding = {
  symbol: string;
  name: string;
  summary: string;
  riskLevel: RiskLevel;
};

export type MarketBrief = {
  category: string;
  title: string;
  summary: string;
  readTime: string;
};

export type LearningLesson = {
  level: string;
  title: string;
  summary: string;
  progress: number;
};
