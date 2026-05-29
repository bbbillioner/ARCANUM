"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { onboardingQuestions } from "@/data/onboarding";
import type {
  OnboardingAnswers,
  OnboardingQuestionId,
} from "@/types/investing";

const totalSteps = onboardingQuestions.length;

const initialAnswers: OnboardingAnswers = {
  budget: "",
  goal: "",
  timeHorizon: "",
  riskComfort: "",
  experience: "",
  interests: [],
  portfolioStyle: "",
  investmentApproach: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);

  const currentQuestion = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const selectedValue = answers[currentQuestion.id];
  const hasSelection = Array.isArray(selectedValue)
    ? selectedValue.length > 0
    : selectedValue.length > 0;
  const isFinalStep = currentStep === totalSteps - 1;

  const answeredCount = useMemo(
    () =>
      onboardingQuestions.filter((question) => {
        const answer = answers[question.id];
        return Array.isArray(answer) ? answer.length > 0 : answer.length > 0;
      }).length,
    [answers],
  );

  function selectSingleAnswer(
    id: Exclude<OnboardingQuestionId, "interests">,
    option: string,
  ) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [id]: option }));
  }

  function toggleInterest(option: string) {
    setAnswers((currentAnswers) => {
      const exists = currentAnswers.interests.includes(option);
      return {
        ...currentAnswers,
        interests: exists
          ? currentAnswers.interests.filter((interest) => interest !== option)
          : [...currentAnswers.interests, option],
      };
    });
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function goNext() {
    if (!hasSelection) return;
    if (!isFinalStep) {
      setCurrentStep((step) => step + 1);
      return;
    }
    localStorage.setItem("arcanum-onboarding", JSON.stringify(answers));
    router.push("/portfolio-suggestion");
  }

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="eyebrow">
                <span className="gem" />
                Onboarding
              </span>
              <h1>
                Build your <em>investor profile.</em>
              </h1>
              <p className="lede">
                Eight focused questions. ARCANUM uses them to assemble a starter
                portfolio direction and tune the rest of the terminal to you.
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.74rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                border: "1px solid var(--stroke)",
                padding: "12px 16px",
              }}
            >
              {answeredCount} / {totalSteps} answered
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(3rem, 6vw, 5rem) 0" }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              <span style={{ color: "var(--accent)" }}>
                Step {String(currentStep + 1).padStart(2, "0")} /{" "}
                {String(totalSteps).padStart(2, "0")}
              </span>
              <span>{currentQuestion.label}</span>
            </div>

            <div
              style={{
                height: 2,
                background: "var(--stroke)",
                marginBottom: 36,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${progress}%`,
                  background: "var(--accent)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 600,
                fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}
            >
              {currentQuestion.question}
            </h2>

            <div style={{ display: "grid", gap: 10 }}>
              {currentQuestion.options.map((option) => {
                const selected = Array.isArray(selectedValue)
                  ? selectedValue.includes(option)
                  : selectedValue === option;
                return (
                  <button
                    aria-pressed={selected}
                    className="onb-option"
                    data-selected={selected}
                    key={option}
                    onClick={() => {
                      if (currentQuestion.id === "interests") {
                        toggleInterest(option);
                        return;
                      }
                      selectSingleAnswer(currentQuestion.id, option);
                    }}
                    type="button"
                  >
                    <span>{option}</span>
                    <span className="dot" aria-hidden />
                  </button>
                );
              })}
            </div>

            {currentQuestion.multiple && (
              <p
                style={{
                  fontSize: "0.86rem",
                  color: "var(--muted)",
                  marginTop: 18,
                }}
              >
                Select one or more. You can change these later.
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 36,
                paddingTop: 22,
                borderTop: "1px solid var(--stroke)",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-ghost"
                disabled={currentStep === 0}
                onClick={goBack}
                style={{
                  opacity: currentStep === 0 ? 0.4 : 1,
                  cursor: currentStep === 0 ? "not-allowed" : "pointer",
                }}
                type="button"
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!hasSelection}
                onClick={goNext}
                style={{
                  marginLeft: "auto",
                  opacity: hasSelection ? 1 : 0.5,
                  cursor: hasSelection ? "pointer" : "not-allowed",
                }}
                type="button"
              >
                {isFinalStep ? "Build my starter portfolio" : "Next"}{" "}
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .onb-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          border: 1px solid var(--stroke);
          background: transparent;
          color: var(--foreground);
          font-family: var(--font-inter);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .onb-option:hover {
          border-color: var(--stroke-strong);
          background: var(--surface-2);
        }
        .onb-option[data-selected="true"] {
          border-color: var(--accent);
          background: rgba(0, 229, 168, 0.06);
        }
        .onb-option .dot {
          width: 8px;
          height: 8px;
          border: 1px solid var(--stroke-strong);
          transform: rotate(45deg);
          flex: none;
        }
        .onb-option[data-selected="true"] .dot {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(0, 229, 168, 0.5);
        }
      `}</style>
    </main>
  );
}
