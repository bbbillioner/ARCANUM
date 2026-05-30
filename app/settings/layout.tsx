import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your ARCANUM profile, retake onboarding, and clear local data.",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
