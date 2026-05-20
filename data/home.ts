import type {
  AllocationSegment,
  FeatureCard,
  Holding,
  LearningLesson,
  MarketBrief,
  Metric,
} from "@/types/investing";

export const featureCards: FeatureCard[] = [
  {
    title: "Build your portfolio",
    description:
      "Start with simple allocation, diversification, and risk cues before you add more complexity.",
  },
  {
    title: "Understand your stocks",
    description:
      "See what a company does, why it matters, and which questions a beginner should ask next.",
  },
  {
    title: "Learn what matters daily",
    description:
      "Turn market headlines into short lessons without pretending the future is predictable.",
  },
];

export const metricsPreview: Metric[] = [
  { label: "Holdings", value: "6", detail: "starter set" },
  { label: "Cash plan", value: "20%", detail: "reserved" },
  { label: "Focus", value: "Core", detail: "long-term" },
];

export const allocationPreview: AllocationSegment[] = [
  { label: "Broad funds", percentage: 50, colorClass: "bg-teal-300" },
  { label: "Quality stocks", percentage: 30, colorClass: "bg-amber-300" },
  { label: "Cash", percentage: 20, colorClass: "bg-zinc-400" },
];

export const holdingPreview: Holding = {
  symbol: "MSFT",
  name: "Microsoft",
  summary:
    "A sample holding card for learning how business quality, valuation, and risk connect.",
  riskLevel: "moderate",
};

export const briefingPreview: MarketBrief = {
  category: "Daily brief",
  title: "Rates, earnings, and sentiment",
  summary:
    "A calm snapshot of the events a beginner investor might track before making portfolio changes.",
  readTime: "3 min read",
};

export const learningPreview: LearningLesson = {
  level: "Beginner lesson",
  title: "What is diversification?",
  summary:
    "Learn why owning different kinds of assets can make a portfolio easier to stay with.",
  progress: 64,
};
