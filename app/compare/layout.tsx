import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Two stocks or ETFs side by side. Live prices, 1M to 5Y total returns with dividends reinvested, sector, risk profile, and a growth-of-$100 overlay.",
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
