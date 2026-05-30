import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "Build your investor profile in eight focused questions. ARCANUM uses your answers to assemble a starter portfolio and tune the rest of the terminal to you.",
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return children;
}
