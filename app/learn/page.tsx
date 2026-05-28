import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { learningCards } from "@/data/learning-cards";
import type { LearningCard } from "@/types/investing";

type LearningSection = {
  eyebrow: string;
  title: string;
  description: string;
  terms: string[];
};

const sections: LearningSection[] = [
  {
    eyebrow: "Portfolio foundations",
    title: "How a portfolio is structured.",
    description:
      "Start with the ideas that shape every holding decision: what you own, how much, and how exposed you really are.",
    terms: ["ETF", "Diversification", "Allocation", "Concentration Risk"],
  },
  {
    eyebrow: "Reading a company",
    title: "Signals to investigate, not signals to trade.",
    description:
      "Beginner-friendly metrics that help you ask better questions about a company before assuming you understand it.",
    terms: ["P/E Ratio", "Market Cap", "Revenue Growth"],
  },
  {
    eyebrow: "Framing the decision",
    title: "Investing is a story you can defend.",
    description:
      "A thesis, a bull case, and a bear case turn a ticker into a real position with reasoning, sizing, and review.",
    terms: ["Portfolio Thesis", "Bull Case", "Bear Case"],
  },
];

const cardByTerm = new Map(learningCards.map((card) => [card.term, card]));

function getCardsForSection(section: LearningSection): LearningCard[] {
  return section.terms
    .map((term) => cardByTerm.get(term))
    .filter((card): card is LearningCard => card !== undefined);
}

export default function LearnPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>Learn</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Investing concepts, explained plainly.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                  Short lessons that help beginners understand what their
                  portfolio is doing, not what the market will do next.
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Concepts
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {learningCards.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Core ideas every beginner portfolio depends on.
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Sections
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {sections.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Grouped so related concepts reinforce each other.
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Goal
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              Understand, don&apos;t predict.
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Every card connects back to portfolio decisions, not market calls.
            </p>
          </Card>
        </div>
      </section>

      {sections.map((section, sectionIndex) => {
        const cards = getCardsForSection(section);
        const isShaded = sectionIndex % 2 === 0;

        return (
          <section
            className={
              isShaded ? "border-y border-white/10 bg-white/[0.025]" : ""
            }
            key={section.eyebrow}
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
              <SectionHeader
                description={section.description}
                eyebrow={section.eyebrow}
                title={section.title}
              />
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {cards.map((card) => (
                  <Card className="p-5" eyebrow="Concept" key={card.term} title={card.term}>
                    <div className="grid gap-5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                          Simple meaning
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          {card.simpleMeaning}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                          Why it matters
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          {card.whyItMatters}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-100/70">
                          Example
                        </p>
                        <p className="mt-3 text-sm leading-6 text-amber-50/85">
                          {card.example}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <Card className="p-7 text-center" variant="primary">
          <Badge>Next step</Badge>
          <h2 className="mt-6 text-3xl font-semibold text-white">
            See these concepts in your own portfolio.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            ARCANUM applies these ideas to a starter portfolio shaped by your
            onboarding answers. Read the dashboard with this language in mind.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard">Open the dashboard</ButtonLink>
            <ButtonLink href="/brief" variant="secondary">
              Read today&apos;s brief
            </ButtonLink>
          </div>
        </Card>
      </section>
    </main>
  );
}
