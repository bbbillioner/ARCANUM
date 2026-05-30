import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Every paper trade you've made, with the one-line thesis you wrote when you bought. Review old theses 30 days later — the only investing skill that compounds.",
};

export default function JournalLayout({ children }: { children: ReactNode }) {
  return children;
}
