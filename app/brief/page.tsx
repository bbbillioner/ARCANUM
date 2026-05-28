import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewsCard } from "@/components/ui/news-card";
import { SectionHeader } from "@/components/ui/section-header";
import { dailyBriefs } from "@/data/briefs";
import { stockProfiles } from "@/data/stocks";
import { fetchPortfolioNews } from "@/lib/news";

const beginnerTakeaways = [
  "News matters when it affects company earnings, interest rates, consumer demand, regulation, or investor sentiment.",
  "Do not react emotionally to every headline.",
  "Connect events back to your portfolio exposure.",
  "Use news to ask better questions, not to make instant trades.",
];

export default async function BriefPage() {
  const allTickers = stockProfiles.map((p) => p.ticker);
  const news = await fetchPortfolioNews(allTickers, 9);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>Daily Brief</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  What&apos;s moving today.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                  Live headlines on the stocks ARCANUM tracks, plus worked
                  examples of how to read a market event as a beginner.
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

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Latest market news"
            title="Fresh stories on what ARCANUM tracks."
            description="Real headlines from Yahoo Finance, deduped across tickers and sorted by recency. Refreshed every 30 minutes — open any story in its original source."
          />
          <p className="text-xs text-zinc-500">Updated continuously</p>
        </div>
        <div className="mt-8">
          {news.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-6 text-zinc-400">
                Could not load news right now. Refresh in a moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard item={item} key={item.id} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
          <Card title="How to read a story">
            <div className="grid gap-3">
              {beginnerTakeaways.map((takeaway, index) => (
                <div
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  key={takeaway}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-300 text-sm font-semibold text-zinc-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-zinc-300">{takeaway}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="How this connects to your portfolio">
            <p className="text-sm leading-7 text-zinc-400">
              ARCANUM links market events to sectors and holdings so you can see
              which parts of a portfolio may be sensitive to rates, earnings,
              consumer demand, regulation, and sentiment. The goal is not to
              trade every headline. The goal is to understand what your
              portfolio is exposed to and which questions deserve research.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="Worked examples"
          title="How a beginner reads a market event."
          description="Editorial breakdowns of real-style events. Each one connects the headline to sectors, holdings, and a plain-language investor translation. Use them as templates for reading live news."
        />

        <div className="mt-8 grid gap-4">
          {dailyBriefs.map((brief) => (
            <Card className="p-5 sm:p-6" key={brief.title}>
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <Badge className="mb-4">Worked example</Badge>
                  <h2 className="text-2xl font-semibold leading-tight text-white">
                    {brief.title}
                  </h2>
                  <div className="mt-5 grid gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Affected sectors
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {brief.affectedSectors.map((sector) => (
                          <span
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-200"
                            key={sector}
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Affected holdings
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {brief.affectedHoldings.map((ticker) => (
                          <span
                            className="rounded-full border border-teal-300/15 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100"
                            key={ticker}
                          >
                            {ticker}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      What happened
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      {brief.whatHappened}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Why it matters
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      {brief.whyItMatters}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-100/70">
                      Beginner translation
                    </p>
                    <p className="mt-3 text-sm leading-6 text-amber-50/85">
                      {brief.beginnerTranslation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
