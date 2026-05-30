import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portfolio suggestion",
  description:
    "Your starter portfolio reveal — the asset mix, sector exposure, and holdings ARCANUM picked from your onboarding answers, with the reasoning behind each.",
};

export default function PortfolioSuggestionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
