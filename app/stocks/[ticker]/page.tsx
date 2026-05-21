import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { stockProfiles } from "@/data/stocks";

type StockPageProps = {
  params: Promise<{
    ticker: string;
  }>;
};

export function generateStaticParams() {
  return stockProfiles.map((profile) => ({
    ticker: profile.ticker,
  }));
}

export default async function StockResearchPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const normalizedTicker = ticker.toUpperCase();
  const profile = stockProfiles.find(
    (stockProfile) => stockProfile.ticker.toUpperCase() === normalizedTicker,
  );

  if (!profile) {
    return (
      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        <section className="relative flex min-h-screen items-center px-5 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.14),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(245,158,11,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_46%)]" />
          <Card className="relative mx-auto w-full max-w-xl p-7 text-center">
            <Badge>Stock research</Badge>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Stock profile not found
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-400">
              ARCANUM does not have a static research profile for{" "}
              <span className="font-semibold text-zinc-200">
                {normalizedTicker}
              </span>{" "}
              yet.
            </p>
            <ButtonLink className="mt-7 w-full sm:w-auto" href="/dashboard">
              Back to dashboard
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
              <Badge>Stock research</Badge>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-teal-100">
                    {profile.ticker}
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight text-white sm:text-6xl">
                    {profile.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge level={profile.beginnerRiskLevel} />
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-300">
                    {profile.sector}
                  </span>
                </div>
                <p className="max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                  {profile.portfolioRole}
                </p>
              </div>
            </div>

            <ButtonLink
              className="w-full sm:w-auto"
              href="/dashboard"
              variant="secondary"
            >
              Back to dashboard
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
        <Card title="Company / Fund Summary">
          <p className="text-sm leading-7 text-zinc-400">
            {profile.companySummary}
          </p>
        </Card>

        <Card title="Business Model">
          <p className="text-sm leading-7 text-zinc-400">
            {profile.businessModel}
          </p>
        </Card>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
          <Card title="Why People Invest">
            <div className="grid gap-3">
              {profile.whyPeopleInvest.map((reason, index) => (
                <div
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  key={reason}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-300 text-xs font-semibold text-zinc-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-zinc-300">{reason}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Key Risks">
            <div className="grid gap-3">
              {profile.keyRisks.map((risk, index) => (
                <div
                  className="flex gap-3 rounded-2xl border border-rose-200/10 bg-rose-200/[0.035] p-4"
                  key={risk}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-200 text-xs font-semibold text-zinc-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-zinc-300">{risk}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Scenarios"
          title="Bull, base, and bear cases."
          description="A serious investor does not need to predict the future. They need to understand what different outcomes could look like."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card title="Bull case">
            <p className="text-sm leading-7 text-zinc-400">{profile.bullCase}</p>
          </Card>
          <Card title="Base case">
            <p className="text-sm leading-7 text-zinc-400">{profile.baseCase}</p>
          </Card>
          <Card title="Bear case">
            <p className="text-sm leading-7 text-zinc-400">{profile.bearCase}</p>
          </Card>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Beginner Metrics"
            title="Signals worth understanding."
            description="These are not buy or sell signals. They are prompts for learning how the holding behaves."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.beginnerMetrics.map((metric) => (
              <Card className="p-5" key={metric.label}>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {metric.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {metric.explanation}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.7fr] lg:px-10">
        <Card title="What To Research Next">
          <div className="grid gap-3">
            {profile.whatToResearchNext.map((item, index) => (
              <div
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                key={item}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-semibold text-zinc-950">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    Research checkpoint
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-amber-200/15 bg-amber-200/[0.045]" title="Disclaimer">
          <p className="text-sm leading-7 text-amber-50/80">
            Educational research only. This is not financial advice, a
            recommendation, or a prediction. Use this page to learn what to
            investigate before making your own decisions.
          </p>
        </Card>
      </section>
    </main>
  );
}
