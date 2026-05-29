import Link from "next/link";

import { learningCards } from "@/data/learning-cards";
import type { LearningCard } from "@/types/investing";

type LearningSection = {
  eyebrow: string;
  title: string;
  italicWord: string;
  description: string;
  terms: string[];
};

const sections: LearningSection[] = [
  {
    eyebrow: "Portfolio foundations",
    title: "How a portfolio is",
    italicWord: "structured.",
    description:
      "Start with the ideas that shape every holding decision: what you own, how much, and how exposed you really are.",
    terms: ["ETF", "Diversification", "Allocation", "Concentration Risk"],
  },
  {
    eyebrow: "Reading a company",
    title: "Signals to investigate, not signals to",
    italicWord: "trade.",
    description:
      "Beginner-friendly metrics that help you ask better questions about a company before assuming you understand it.",
    terms: ["P/E Ratio", "Market Cap", "Revenue Growth"],
  },
  {
    eyebrow: "Framing the decision",
    title: "Investing is a story you can",
    italicWord: "defend.",
    description:
      "A thesis, a bull case, and a bear case turn a ticker into a real position with reasoning, sizing, and review.",
    terms: ["Portfolio Thesis", "Bull Case", "Bear Case"],
  },
];

const cardByTerm = new Map(learningCards.map((c) => [c.term, c]));

function getCardsForSection(section: LearningSection): LearningCard[] {
  return section.terms
    .map((term) => cardByTerm.get(term))
    .filter((card): card is LearningCard => card !== undefined);
}

export default function LearnPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Learn
          </span>
          <h1>
            Investing concepts, <em>explained plainly.</em>
          </h1>
          <p className="lede">
            Short lessons that help beginners understand what their portfolio is
            doing, not what the market will do next.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginTop: 36,
              maxWidth: 720,
            }}
          >
            <div className="metric-line">
              <div className="label">Concepts</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {learningCards.length}
              </div>
            </div>
            <div className="metric-line">
              <div className="label">Sections</div>
              <div className="value">{sections.length}</div>
            </div>
            <div className="metric-line">
              <div className="label">Goal</div>
              <div className="value" style={{ fontSize: "1.15rem" }}>
                Understand
              </div>
              <div className="detail">Don&apos;t predict</div>
            </div>
          </div>
        </div>
      </section>

      {sections.map((section) => {
        const cards = getCardsForSection(section);
        return (
          <section className="block" key={section.eyebrow} style={{ paddingTop: "clamp(3rem,6vw,5rem)", paddingBottom: "clamp(3rem,6vw,5rem)" }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="eyebrow">
                  <span className="gem" />
                  {section.eyebrow}
                </span>
                <h2>
                  {section.title} <em>{section.italicWord}</em>
                </h2>
                <p>{section.description}</p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 1,
                  background: "var(--stroke)",
                  border: "1px solid var(--stroke)",
                }}
              >
                {cards.map((card) => (
                  <div
                    key={card.term}
                    style={{ background: "var(--surface)", padding: 30 }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.68rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        marginBottom: 12,
                      }}
                    >
                      Concept
                    </p>
                    <h3
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontWeight: 600,
                        fontSize: "1.6rem",
                        letterSpacing: "-0.01em",
                        marginBottom: 22,
                      }}
                    >
                      {card.term}
                    </h3>
                    <div style={{ display: "grid", gap: 16 }}>
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.62rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                            marginBottom: 8,
                          }}
                        >
                          Simple meaning
                        </p>
                        <p
                          style={{
                            fontSize: "0.92rem",
                            color: "var(--foreground)",
                            lineHeight: 1.6,
                          }}
                        >
                          {card.simpleMeaning}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.62rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                            marginBottom: 8,
                          }}
                        >
                          Why it matters
                        </p>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--muted)",
                            lineHeight: 1.6,
                          }}
                        >
                          {card.whyItMatters}
                        </p>
                      </div>
                      <div
                        style={{
                          borderLeft: "2px solid var(--accent)",
                          background: "var(--surface-2)",
                          padding: "10px 14px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--accent)",
                            marginBottom: 6,
                          }}
                        >
                          Example
                        </p>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--foreground)",
                            lineHeight: 1.55,
                          }}
                        >
                          {card.example}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="final">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Next step
          </span>
          <h2>
            See these concepts in your own <em>portfolio.</em>
          </h2>
          <p>
            ARCANUM applies these ideas to a starter portfolio shaped by your
            onboarding answers. Read the dashboard with this language in mind.
          </p>
          <Link className="btn btn-primary" href="/dashboard">
            Open dashboard <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
