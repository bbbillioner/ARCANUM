"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import type {
  OnboardingAnswers,
  OnboardingQuestion,
  OnboardingQuestionId,
} from "@/types/investing";

const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "budget",
    label: "Budget",
    question: "How much are you planning to invest?",
    options: [
      "Under $100",
      "$100-$500",
      "$500-$1,000",
      "$1,000-$5,000",
      "$5,000+",
    ],
  },
  {
    id: "goal",
    label: "Goal",
    question: "What is your main investing goal?",
    options: [
      "Learn investing",
      "Grow long-term wealth",
      "Build a balanced portfolio",
      "Prepare for finance club / competition",
      "Explore stocks I'm interested in",
    ],
  },
  {
    id: "timeHorizon",
    label: "Time horizon",
    question: "How long do you plan to hold investments?",
    options: ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
  },
  {
    id: "riskComfort",
    label: "Risk comfort",
    question: "How much risk are you comfortable with?",
    options: ["Low", "Medium", "High", "Not sure"],
  },
  {
    id: "experience",
    label: "Experience",
    question: "How experienced are you?",
    options: [
      "Complete beginner",
      "I know basic terms",
      "I have bought stocks before",
      "I'm in a finance/investment competition",
    ],
  },
  {
    id: "interests",
    label: "Interests",
    question: "What sectors interest you?",
    options: [
      "AI / Technology",
      "Healthcare",
      "Energy",
      "Consumer brands",
      "Finance",
      "ETFs / diversified investing",
      "China / emerging markets",
      "Sustainability",
    ],
    multiple: true,
  },
  {
    id: "portfolioStyle",
    label: "Portfolio style",
    question: "What type of portfolio do you want to build?",
    options: [
      "Safe and diversified",
      "Balanced growth",
      "High-growth companies",
      "Dividend/income focused",
      "Thematic portfolio",
      "Not sure",
    ],
  },
  {
    id: "investmentApproach",
    label: "Investment approach",
    question: "How do you want to choose investments?",
    options: [
      "Mostly ETFs",
      "ETFs + a few stocks",
      "Mostly individual companies",
      "I want to learn before deciding",
    ],
  },
];

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

  function selectSingleAnswer(id: Exclude<OnboardingQuestionId, "interests">, option: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [id]: option,
    }));
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
    if (!hasSelection) {
      return;
    }

    if (!isFinalStep) {
      setCurrentStep((step) => step + 1);
      return;
    }

    localStorage.setItem("arcanum-onboarding", JSON.stringify(answers));
    router.push("/portfolio-suggestion");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.14),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(245,158,11,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_46%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-5">
              <Badge>ARCANUM onboarding</Badge>
              <SectionHeader
                title="Build your beginner investor profile."
                description="Answer a few focused questions so ARCANUM can prepare a starter portfolio direction in the next step."
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {answeredCount} of {totalSteps} answered
            </div>
          </div>

          <Card className="mx-auto w-full max-w-3xl p-5 sm:p-7">
            <div className="mb-7 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-teal-100">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-zinc-500">{currentQuestion.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-teal-300 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {currentQuestion.question}
              </h1>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = Array.isArray(selectedValue)
                    ? selectedValue.includes(option)
                    : selectedValue === option;

                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "min-h-14 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-background sm:text-base",
                        selected
                          ? "border-teal-300/60 bg-teal-300/12 text-teal-50 shadow-lg shadow-teal-950/20"
                          : "border-white/10 bg-white/[0.035] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
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
                      <span className="flex items-center justify-between gap-4">
                        <span>{option}</span>
                        <span
                          className={cn(
                            "h-3 w-3 shrink-0 rounded-full border",
                            selected
                              ? "border-teal-200 bg-teal-200"
                              : "border-zinc-600",
                          )}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              {currentQuestion.multiple && (
                <p className="text-sm leading-6 text-zinc-500">
                  Select one or more sectors. You can change these later.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                className="w-full sm:w-auto"
                disabled={currentStep === 0}
                onClick={goBack}
                variant="secondary"
              >
                Back
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={!hasSelection}
                onClick={goNext}
              >
                {isFinalStep ? "Build my starter portfolio" : "Next"}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
