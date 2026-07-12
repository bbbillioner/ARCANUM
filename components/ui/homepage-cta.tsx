"use client";

import { useEffect, useState } from "react";

import { ButtonLink } from "./button";

export function HomepageCta() {
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      const stored = window.localStorage.getItem("arcanum-onboarding");
      if (stored) setHasOnboarded(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (hasOnboarded) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/dashboard">Continue to my dashboard</ButtonLink>
        <ButtonLink href="/onboarding" variant="secondary">
          Redo onboarding
        </ButtonLink>
      </div>
    );
  }

  return (
    <ButtonLink className="w-full sm:w-auto" href="/onboarding">
      Start building my portfolio
    </ButtonLink>
  );
}
