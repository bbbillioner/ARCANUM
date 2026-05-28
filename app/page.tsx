import { AllocationBar } from "@/components/ui/allocation-bar";
import { Badge } from "@/components/ui/badge";
import { BriefCard } from "@/components/ui/brief-card";
import { Card } from "@/components/ui/card";
import { HoldingCard } from "@/components/ui/holding-card";
import { HomepageCta } from "@/components/ui/homepage-cta";
import { LearningCard } from "@/components/ui/learning-card";
import { MetricCard } from "@/components/ui/metric-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import {
  allocationPreview,
  briefingPreview,
  featureCards,
  holdingPreview,
  learningPreview,
  metricsPreview,
} from "@/data/home";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_48%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:px-10 lg:py-16">
          <div className="flex flex-1 flex-col items-start gap-7">
            <Badge>ARCANUM</Badge>
            <div className="max-w-3xl space-y-5">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-normal text-white sm:text-6xl">
                Your beginner investor command center.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                Build your portfolio. Understand your stocks. Learn what matters
                in the market.
              </p>
            </div>
            <HomepageCta />
          </div>

          <div className="w-full max-w-xl lg:flex-1">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#070a10]/90 p-4">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Starter portfolio</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      Core watchlist
                    </h2>
                  </div>
                  <RiskBadge level="moderate" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {metricsPreview.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                  ))}
                </div>
                <div className="mt-5">
                  <AllocationBar segments={allocationPreview} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Foundation"
          title="Designed for the first serious portfolio decisions."
          description="ARCANUM keeps the first version intentionally focused: starter portfolio structure, plain-language context, and calm daily learning."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} title={feature.title}>
              <p className="text-sm leading-6 text-zinc-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:px-10">
          <HoldingCard holding={holdingPreview} />
          <BriefCard brief={briefingPreview} />
          <LearningCard lesson={learningPreview} />
        </div>
      </section>
    </main>
  );
}
