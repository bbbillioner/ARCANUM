"use client";

import { useEffect, useMemo, useState } from "react";

import { AllocationBar } from "@/components/ui/allocation-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { dailyBriefs } from "@/data/briefs";
import { learningCards } from "@/data/learning-cards";
import { portfolioTemplates } from "@/data/portfolios";
import { stockProfiles } from "@/data/stocks";
import type {
  AllocationSegment,
  OnboardingAnswers,
  PortfolioHolding,
  PortfolioTemplate,
  RiskLevel,
  StockProfile,
} from "@/types/investing";

const allocationColors = [
  "bg-teal-300",
  "bg-amber-300",
  "bg-sky-300",
  "bg-zinc-400",
  "bg-emerald-300",
];

const stockProfileByTicker = new Map(
  stockProfiles.map((profile) => [profile.ticker, profile]),
);

function isOnboardingAnswers(value: unknown): value is OnboardingAnswers {
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

function getTemplateById(id: string) {
  const template = portfolioTemplates.find((portfolio) => portfolio.id === id);

  if (!template) {
    throw new Error(`Missing portfolio template: ${id}`);
  }

  return template;
}

function selectPortfolioTemplate(answers: OnboardingAnswers): PortfolioTemplate {
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

function getRiskLabel(riskLevel: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    low: "Low",
    moderate: "Moderate",
    elevated: "Elevated",
  };

  return labels[riskLevel];
}

function getHoldingFallback(ticker: string) {
  if (ticker === "CASH") {
    return {
      sector: "Cash reserve",
      beginnerRiskLevel: "low" as RiskLevel,
      companySummary:
        "Cash lowers portfolio pressure and gives room to rebalance when markets move.",
      keyRisks: ["Cash can lag inflation and does not compound like productive assets."],
    };
  }

  return {
    sector: "Research needed",
    beginnerRiskLevel: "moderate" as RiskLevel,
    companySummary:
      "This holding needs a dedicated profile before it can be analyzed in detail.",
    keyRisks: ["The main risk is not yet classified in the static research data."],
  };
}

function getMainExposure(template: PortfolioTemplate) {
  return template.sectorExposure.reduce((largest, sector) =>
    sector.percentage > largest.percentage ? sector : largest,
  );
}

function getEtfAllocation(holdings: PortfolioHolding[]) {
  return holdings
    .filter((holding) => ["VOO", "QQQ"].includes(holding.ticker))
    .reduce((total, holding) => total + holding.allocation, 0);
}

function getStockAllocation(holdings: PortfolioHolding[]) {
  return holdings
    .filter((holding) => !["VOO", "QQQ", "CASH"].includes(holding.ticker))
    .reduce((total, holding) => total + holding.allocation, 0);
}

function getConcentrationRisk(template: PortfolioTemplate) {
  const largestHolding = Math.max(
    ...template.holdings.map((holding) => holding.allocation),
  );

  if (largestHolding >= 40) {
    return "Elevated";
  }

  if (largestHolding >= 25) {
    return "Moderate";
  }

  return "Low";
}

function getDiversificationScore(template: PortfolioTemplate) {
  const holdingCount = template.holdings.length;
  const largestHolding = Math.max(
    ...template.holdings.map((holding) => holding.allocation),
  );
  const sectorCount = template.sectorExposure.length;

  if (holdingCount >= 5 && sectorCount >= 4 && largestHolding <= 45) {
    return "Strong";
  }

  if (holdingCount >= 4 && sectorCount >= 3 && largestHolding <= 55) {
    return "Balanced";
  }

  return "Focused";
}

function getHeaderExplanation(
  answers: OnboardingAnswers,
  template: PortfolioTemplate,
) {
  return `Built from your ${answers.riskComfort.toLowerCase()} risk comfort, ${answers.timeHorizon.toLowerCase()} time horizon, and ${answers.investmentApproach.toLowerCase()} approach. ${template.explanation}`;
}

export default function DashboardPage() {
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      const storedAnswers = localStorage.getItem("arcanum-onboarding");

      if (!storedAnswers) {
        if (!cancelled) {
          setHasLoaded(true);
        }
        return;
      }

      try {
        const parsedAnswers: unknown = JSON.parse(storedAnswers);

        if (!cancelled && isOnboardingAnswers(parsedAnswers)) {
          setAnswers(parsedAnswers);
        }
      } catch {
        if (!cancelled) {
          setAnswers(null);
        }
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const selectedPortfolio = useMemo(
    () => (answers ? selectPortfolioTemplate(answers) : null),
    [answers],
  );

  const allocationSegments: AllocationSegment[] = useMemo(
    () =>
      selectedPortfolio
        ? selectedPortfolio.assetMix.map((item, index) => ({
            label: item.assetClass,
            percentage: item.percentage,
            colorClass: allocationColors[index % allocationColors.length],
          }))
        : [],
    [selectedPortfolio],
  );

  if (!hasLoaded) {
    return (
      <main className="min-h-screen bg-background px-5 py-12 text-foreground">
        <Card className="mx-auto max-w-xl">
          <p className="text-sm text-zinc-400">Loading dashboard...</p>
        </Card>
      </main>
    );
  }

  if (!answers || !selectedPortfolio) {
    return (
      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        <section className="relative flex min-h-screen items-center px-5 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.14),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(245,158,11,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_46%)]" />
          <Card className="relative mx-auto w-full max-w-xl p-7 text-center">
            <Badge>ARCANUM dashboard</Badge>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Build your investor profile first
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              Complete onboarding so ARCANUM can choose a starter portfolio and
              organize your command center around it.
            </p>
            <ButtonLink className="mt-7 w-full sm:w-auto" href="/onboarding">
              Start onboarding
            </ButtonLink>
          </Card>
        </section>
      </main>
    );
  }

  const mainExposure = getMainExposure(selectedPortfolio);
  const etfAllocation = getEtfAllocation(selectedPortfolio.holdings);
  const stockAllocation = getStockAllocation(selectedPortfolio.holdings);
  const cashAllocation = selectedPortfolio.holdings.find(
    (holding) => holding.ticker === "CASH",
  )?.allocation;
  const learningCard =
    learningCards.find((card) => card.term === "Concentration Risk") ??
    learningCards[0];
  const briefPreview = dailyBriefs.slice(0, 3);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_48%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>ARCANUM</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Your investor command center
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xl font-semibold text-teal-100">
                    {selectedPortfolio.name}
                  </p>
                  <RiskBadge level={selectedPortfolio.riskLevel} />
                </div>
                <p className="max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                  {getHeaderExplanation(answers, selectedPortfolio)}
                </p>
              </div>
            </div>

            <ButtonLink
              className="w-full sm:w-auto"
              href="/onboarding"
              variant="secondary"
            >
              Retake onboarding
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Portfolio Health"
          title="A quick read on your portfolio structure."
          description="These are static signals derived from the selected template, designed to teach what to watch before adding complexity."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Risk level"
            value={getRiskLabel(selectedPortfolio.riskLevel)}
            detail="Template profile"
          />
          <MetricCard
            label="Time horizon"
            value={selectedPortfolio.timeHorizon}
            detail="Suggested holding period"
          />
          <MetricCard
            label="Main exposure"
            value={mainExposure.sector}
            detail={`${mainExposure.percentage}% of template`}
          />
          <MetricCard
            label="Diversification score"
            value={getDiversificationScore(selectedPortfolio)}
            detail={`${selectedPortfolio.holdings.length} holdings across ${selectedPortfolio.sectorExposure.length} exposures`}
          />
          <MetricCard
            label="ETF vs stock balance"
            value={`${etfAllocation}% / ${stockAllocation}%`}
            detail={
              typeof cashAllocation === "number"
                ? `${cashAllocation}% cash reserve`
                : "No cash reserve"
            }
          />
          <MetricCard
            label="Concentration risk"
            value={getConcentrationRisk(selectedPortfolio)}
            detail="Based on largest holding weight"
          />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <Card title="Allocation">
            <AllocationBar segments={allocationSegments} />
            <div className="mt-6 grid gap-3">
              {selectedPortfolio.assetMix.map((item) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  key={item.assetClass}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">
                      {item.assetClass}
                    </h3>
                    <span className="text-sm font-semibold text-teal-100">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Sector Exposure">
            <div className="space-y-4">
              {selectedPortfolio.sectorExposure.map((sector) => (
                <div key={sector.sector}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-zinc-200">
                      {sector.sector}
                    </span>
                    <span className="text-zinc-500">{sector.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-300"
                      style={{ width: `${sector.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Holdings"
          title="Know what each position is supposed to do."
          description="A beginner portfolio becomes easier to manage when every holding has a role, a thesis, and a risk to watch."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {selectedPortfolio.holdings.map((holding) => {
            const profile: StockProfile | undefined = stockProfileByTicker.get(
              holding.ticker,
            );
            const fallback = getHoldingFallback(holding.ticker);
            const sector = profile?.sector ?? fallback.sector;
            const thesis = profile?.companySummary ?? fallback.companySummary;
            const keyRisk = profile?.keyRisks[0] ?? fallback.keyRisks[0];
            const riskLevel =
              profile?.beginnerRiskLevel ?? fallback.beginnerRiskLevel;

            return (
              <Card className="p-5" key={holding.ticker}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-white">
                      {holding.ticker}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-zinc-100">
                      {holding.name}
                    </h3>
                  </div>
                  <RiskBadge level={riskLevel} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs text-zinc-500">Allocation</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {holding.allocation}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2">
                    <p className="text-xs text-zinc-500">Sector</p>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {sector}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-zinc-400">
                  <span className="font-semibold text-zinc-200">Role: </span>
                  {holding.role}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  <span className="font-semibold text-zinc-200">Thesis: </span>
                  {thesis}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  <span className="font-semibold text-zinc-300">Key risk: </span>
                  {keyRisk}
                </p>
                <ButtonLink
                  className="mt-6 w-full sm:w-auto"
                  href={`/stocks/${encodeURIComponent(holding.ticker)}`}
                  variant="secondary"
                >
                  View research
                </ButtonLink>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Today's Brief Preview"
              title="What matters today."
              description="A market brief should connect events to sectors, holdings, and plain-language investor implications."
            />
            <ButtonLink className="w-full sm:w-auto" href="/brief">
              View full daily brief
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {briefPreview.map((brief) => (
              <Card key={brief.title} title={brief.title}>
                <p className="text-sm leading-6 text-zinc-400">
                  {brief.whyItMatters}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {brief.affectedHoldings.map((ticker) => (
                    <span
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-teal-100"
                      key={ticker}
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-zinc-500">
                  {brief.beginnerTranslation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Card eyebrow="Learning Card" title={learningCard.term}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Simple meaning
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {learningCard.simpleMeaning}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Why it matters
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {learningCard.whyItMatters}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Example
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {learningCard.example}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
