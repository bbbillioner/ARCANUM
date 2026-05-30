import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Practice with fake money against live prices. Buy and sell to learn allocation, cost basis, and portfolio behaviour before any real money is on the line.",
};

export default function SimulatorLayout({ children }: { children: ReactNode }) {
  return children;
}
