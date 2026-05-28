import type { OnboardingQuestion } from "@/types/investing";

export const onboardingQuestions: OnboardingQuestion[] = [
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
