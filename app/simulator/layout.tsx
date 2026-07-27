import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Practice with fake money using cached market prices. Learn allocation, cost basis, and portfolio behaviour before any real money is on the line.",
};

export default function SimulatorLayout({ children }: { children: ReactNode }) {
  return children;
}
