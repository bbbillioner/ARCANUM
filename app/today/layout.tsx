import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Your five-minute briefing. Portfolio glance, three stories you should know, one concept to anchor the day, and one small action.",
};

export default function TodayLayout({ children }: { children: ReactNode }) {
  return children;
}
