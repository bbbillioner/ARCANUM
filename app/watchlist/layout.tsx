import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Watchlist",
  description:
    "Stocks you're following on ARCANUM — live prices, intraday change, and quick links to research.",
};

export default function WatchlistLayout({ children }: { children: ReactNode }) {
  return children;
}
