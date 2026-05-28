import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartFull } from "@/components/ui/chart-full";
import { NewsCard } from "@/components/ui/news-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Term } from "@/components/ui/term";
import { stockProfiles } from "@/data/stocks";
import { fetchTickerNews } from "@/lib/news";
import {
  formatFetchedAt,
  getCurrentPrice,
  getFetchedAt,
  getPriceBars,
  getTimeframeChangePercent,
} from "@/lib/prices";

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

  const news = profile ? await fetchTickerNews(normalizedTicker, 6) : [];

  if (!profile) {
    return (
      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        <section className="relative flex min-h-screen items-center px-5 py-12">
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

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Price
              </p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-semibold text-white">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(getCurrentPrice(profile.ticker))}
                </p>
                {(() => {
                  const change = getTimeframeChangePercent(profile.ticker, "1Y");
                  const positive = change >= 0;
                  return (
                    <p
                      className={`text-sm font-semibold ${positive ? "text-teal-200" : "text-rose-200"}`}
                    >
                      {positive ? "+" : ""}
                      {change.toFixed(2)}%{" "}
                      <span className="text-zinc-500">1Y</span>
                    </p>
                  );
                })()}
              </div>
            </div>
            {(() => {
              const fetchedAt = getFetchedAt(profile.ticker);
              if (!fetchedAt) return null;
              return (
                <p className="text-xs text-zinc-500">
                  Prices as of {formatFetchedAt(fetchedAt)} (Yahoo Finance)
                </p>
              );
            })()}
          </div>
          <div className="mt-6">
            <ChartFull bars={getPriceBars(profile.ticker)} defaultTimeframe="1Y" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="In the news"
            title={`Recent stories on ${profile.ticker}.`}
            description="Fresh headlines from Yahoo Finance — refreshed every 30 minutes. Click through for the full article. Where the headline gives us a clear topic, we add a one-line beginner cue."
          />
          <p className="text-xs text-zinc-500">Updated continuously</p>
        </div>
        <div className="mt-8">
          {news.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-6 text-zinc-400">
                No recent news for {profile.ticker} from Yahoo Finance right now.
                Check back in a bit.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard
                  highlightTickers={[profile.ticker]}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
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
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
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
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Scenarios"
          title="Bull, base, and bear cases."
          description="A serious investor does not need to predict the future. They need to understand what different outcomes could look like."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card title={<Term>Bull case</Term>}>
            <p className="text-sm leading-7 text-zinc-400">{profile.bullCase}</p>
          </Card>
          <Card title={<Term>Base case</Term>}>
            <p className="text-sm leading-7 text-zinc-400">{profile.baseCase}</p>
          </Card>
          <Card title={<Term>Bear case</Term>}>
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

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Card title="What To Research Next">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </main>
  );
}
