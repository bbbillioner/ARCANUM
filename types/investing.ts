export type RiskLevel = "low" | "moderate" | "elevated";

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
