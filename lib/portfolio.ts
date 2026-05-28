import { portfolioTemplates } from "@/data/portfolios";
import { stockProfiles } from "@/data/stocks";
import type {
  AllocationSegment,
  AssetMixItem,
  OnboardingAnswers,
  PortfolioTemplate,
  RiskLevel,
} from "@/types/investing";

export const allocationColors = [
  "bg-teal-300",
  "bg-amber-300",
  "bg-sky-300",
  "bg-zinc-400",
  "bg-emerald-300",
];

export const stockProfileByTicker = new Map(
  stockProfiles.map((profile) => [profile.ticker, profile]),
);

export type HoldingFallback = {
  sector: string;
  beginnerRiskLevel: RiskLevel;
  companySummary: string;
  keyRisks: string[];
};

export function getHoldingFallback(ticker: string): HoldingFallback {
  if (ticker === "CASH") {
    return {
      sector: "Cash reserve",
      beginnerRiskLevel: "low",
      companySummary:
        "Cash lowers portfolio pressure and gives room to rebalance when markets move.",
      keyRisks: [
        "Cash can lag inflation and does not compound like productive assets.",
      ],
    };
  }

  return {
    sector: "Research needed",
    beginnerRiskLevel: "moderate",
    companySummary:
      "This holding needs a dedicated profile before it can be analyzed in detail.",
    keyRisks: ["The main risk is not yet classified in the static research data."],
  };
}

export function isOnboardingAnswers(value: unknown): value is OnboardingAnswers {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answers = value as Partial<OnboardingAnswers>;

  return (
    typeof answers.budget === "string" &&
    typeof answers.goal === "string" &&
    typeof answers.timeHorizon === "string" &&
    typeof answers.riskComfort === "string" &&
    typeof answers.experience === "string" &&
    Array.isArray(answers.interests) &&
    typeof answers.portfolioStyle === "string" &&
    typeof answers.investmentApproach === "string"
  );
}

export function getTemplateById(id: string): PortfolioTemplate {
  const template = portfolioTemplates.find((portfolio) => portfolio.id === id);

  if (!template) {
    throw new Error(`Missing portfolio template: ${id}`);
  }

  return template;
}

export function selectPortfolioTemplate(
  answers: OnboardingAnswers,
): PortfolioTemplate {
  if (
    answers.riskComfort === "Low" ||
    answers.portfolioStyle === "Safe and diversified"
  ) {
    return getTemplateById("conservative-beginner");
  }

  if (
    answers.riskComfort === "High" ||
    answers.portfolioStyle === "High-growth companies" ||
    answers.portfolioStyle === "Thematic portfolio"
  ) {
    return getTemplateById("aggressive-growth");
  }

  return getTemplateById("balanced-growth");
}

export function buildAllocationSegments(
  assetMix: AssetMixItem[],
): AllocationSegment[] {
  return assetMix.map((item, index) => ({
    label: item.assetClass,
    percentage: item.percentage,
    colorClass: allocationColors[index % allocationColors.length],
  }));
}

export function loadOnboardingAnswers(): OnboardingAnswers | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("arcanum-onboarding");

  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    return isOnboardingAnswers(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
