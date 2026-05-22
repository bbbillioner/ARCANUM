"use client";

import { useEffect, useMemo, useState } from "react";

import { AllocationBar } from "@/components/ui/allocation-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { portfolioTemplates } from "@/data/portfolios";
import { stockProfiles } from "@/data/stocks";
import type {
  AllocationSegment,
  OnboardingAnswers,
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

function getHoldingFallback(ticker: string) {
  if (ticker === "CASH") {
    return {
      sector: "Cash reserve",
      beginnerRiskLevel: "low" as RiskLevel,
      companySummary:
        "Cash is included as a buffer, not as a return engine. It can reduce pressure to sell during volatility and gives room to rebalance.",
    };
  }

  return {
    sector: "Research needed",
    beginnerRiskLevel: "moderate" as RiskLevel,
    companySummary:
      "This holding needs a dedicated profile before it can be analyzed in detail.",
  };
}

function getPersonalizedExplanation(
  answers: OnboardingAnswers,
  template: PortfolioTemplate,
) {
  const interests =
    answers.interests.length > 0
      ? answers.interests.join(", ")
      : "broad market learning";

  return `Based on your ${answers.riskComfort.toLowerCase()} risk comfort, ${answers.timeHorizon.toLowerCase()} time horizon, and interest in ${interests}, ARCANUM is starting with ${template.name}. ${template.explanation}`;
}

export default function PortfolioSuggestionPage() {
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
          <p className="text-sm text-zinc-400">Loading portfolio suggestion...</p>
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
            <Badge>Portfolio suggestion</Badge>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Start with onboarding first
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              ARCANUM needs your budget, goals, risk comfort, and interests
              before it can prepare a starter portfolio direction.
            </p>
            <ButtonLink className="mt-7 w-full sm:w-auto" href="/onboarding">
              Start building my portfolio
            </ButtonLink>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_48%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>Suggested starter portfolio</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  {selectedPortfolio.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                  {selectedPortfolio.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80">
              <Card className="p-4">
                <p className="text-xs text-zinc-500">Risk level</p>
                <div className="mt-3">
                  <RiskBadge level={selectedPortfolio.riskLevel} />
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-zinc-500">Time horizon</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {selectedPortfolio.timeHorizon}
                </p>
              </Card>
            </div>
          </div>

          <Card className="border-amber-200/15 bg-amber-200/[0.045]">
            <p className="text-sm leading-6 text-amber-50/80">
              {selectedPortfolio.disclaimer}
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <Card title="Asset Mix">
          <AllocationBar segments={allocationSegments} />
          <div className="mt-6 grid gap-3">
            {selectedPortfolio.assetMix.map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                key={item.assetClass}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white">{item.assetClass}</h3>
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
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Suggested Holdings"
            title="The building blocks and why they are here."
            description="Each holding has a portfolio role. The point is to understand the job it does, not to chase a ticker."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {selectedPortfolio.holdings.map((holding) => {
              const profile: StockProfile | undefined = stockProfileByTicker.get(
                holding.ticker,
              );
              const fallback = getHoldingFallback(holding.ticker);
              const sector = profile?.sector ?? fallback.sector;
              const riskLevel =
                profile?.beginnerRiskLevel ?? fallback.beginnerRiskLevel;
              const explanation =
                profile?.companySummary ?? fallback.companySummary;

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
                    {holding.role}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {explanation}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <Card title="Why this portfolio fits you">
          <p className="text-sm leading-7 text-zinc-400">
            {getPersonalizedExplanation(answers, selectedPortfolio)}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">Goal</p>
              <p className="mt-2 text-sm font-medium text-white">{answers.goal}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">Approach</p>
              <p className="mt-2 text-sm font-medium text-white">
                {answers.investmentApproach}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">Risk</p>
              <p className="mt-2 text-sm font-medium text-white">
                {answers.riskComfort} comfort
              </p>
            </div>
          </div>
        </Card>

        <Card title="What to do next">
          <div className="space-y-3">
            {[
              "Review your dashboard",
              "Study each holding",
              "Read today's brief",
            ].map((step, index) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                key={step}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-300 text-sm font-semibold text-zinc-950">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-zinc-200">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="w-full sm:w-auto" href="/dashboard">
              Continue to dashboard
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href="/onboarding"
              variant="secondary"
            >
              Retake onboarding
            </ButtonLink>
          </div>
        </Card>
      </section>
    </main>
  );
}
