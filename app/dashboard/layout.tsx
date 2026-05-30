import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your starter portfolio's command center. Allocation, holdings, live news on what you hold, and a learning anchor every visit.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
