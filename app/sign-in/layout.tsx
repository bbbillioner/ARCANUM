import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to ARCANUM. Magic-link email — no password to remember.",
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
