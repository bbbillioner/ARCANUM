import type { RiskLevel } from "./investing";

export type HomepageHolding = {
  symbol: string;
  name: string;
  summary: string;
  riskLevel: RiskLevel;
};

export type HomepageBrief = {
  category: string;
  title: string;
  summary: string;
  readTime: string;
};

export type HomepageLesson = {
  level: string;
  title: string;
  summary: string;
  progress: number;
};
