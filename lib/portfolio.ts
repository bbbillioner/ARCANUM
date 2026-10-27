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

/** Under five years: shorter than the growth templates are designed for. */
function hasShortHorizon(answers: OnboardingAnswers) {
  return answers.timeHorizon !== "5+ years";
}

/** Under three years: money that usually shouldn't depend on stocks. */
export function hasVeryShortHorizon(answers: OnboardingAnswers) {
  return (
    answers.timeHorizon === "Less than 1 year" ||
    answers.timeHorizon === "1-3 years"
  );
}

function wantsLowRisk(answers: OnboardingAnswers) {
  return (
    answers.riskComfort === "Low" ||
    answers.portfolioStyle === "Safe and diversified"
  );
}

function wantsHighGrowth(answers: OnboardingAnswers) {
  return (
    answers.riskComfort === "High" ||
    answers.portfolioStyle === "High-growth companies" ||
    answers.portfolioStyle === "Thematic portfolio"
  );
}

/**
 * Time horizon decides first: each template states the holding period it is
 * designed for, and a template is never chosen for a shorter horizon than
 * that. Risk comfort and style decide among what's left.
 */
export function selectPortfolioTemplate(
  answers: OnboardingAnswers,
): PortfolioTemplate {
  if (hasShortHorizon(answers) || wantsLowRisk(answers)) {
    return getTemplateById("conservative-beginner");
  }

  if (wantsHighGrowth(answers)) {
    return getTemplateById("aggressive-growth");
  }

  return getTemplateById("balanced-growth");
}

/** Plain-language reason for the template choice, citing the deciding answers. */
export function explainTemplateChoice(
  answers: OnboardingAnswers,
  template: PortfolioTemplate,
): string {
  const horizon = answers.timeHorizon.toLowerCase();
  let reason: string;

  if (hasVeryShortHorizon(answers)) {
    reason = `You plan to hold for ${horizon}. Stocks can fall sharply and take years to recover, so ARCANUM starts with its steadiest template, ${template.name}. Money you'll need within about three years is usually kept out of the stock market entirely: treat this template as practice, not a plan for that money.`;
  } else if (hasShortHorizon(answers)) {
    reason = `You plan to hold for ${horizon}, shorter than the growth templates are designed for, so ARCANUM starts with ${template.name}.`;
  } else if (wantsLowRisk(answers)) {
    reason = `You plan to hold for ${horizon} and prefer lower risk, so ARCANUM starts with ${template.name}.`;
  } else if (wantsHighGrowth(answers)) {
    reason = `You plan to hold for ${horizon} and are comfortable with bigger swings in exchange for growth, so ARCANUM starts with ${template.name}.`;
  } else {
    reason = `You plan to hold for ${horizon} with ${answers.riskComfort.toLowerCase()} risk comfort, so ARCANUM starts with the middle-ground ${template.name}.`;
  }

  return `${reason} ${template.explanation}`;
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
