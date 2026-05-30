import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Two stocks or ETFs side by side. Live prices, intraday change, 1Y / 3Y / 5Y returns, sector, risk profile, and a normalised price overlay.",
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
