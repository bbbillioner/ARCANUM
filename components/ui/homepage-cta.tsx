"use client";

import { useEffect, useState } from "react";

import { ARCANUM_CLOUD_DATA_LOADED_EVENT } from "@/lib/cloud-sync";
import { ButtonLink } from "./button";

export function HomepageCta() {
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function loadOnboardingState() {
      if (cancelled) return;
      const stored = window.localStorage.getItem("arcanum-onboarding");
      setHasOnboarded(Boolean(stored));
    }
    const timeoutId = window.setTimeout(loadOnboardingState, 0);
    window.addEventListener(
      ARCANUM_CLOUD_DATA_LOADED_EVENT,
      loadOnboardingState,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener(
        ARCANUM_CLOUD_DATA_LOADED_EVENT,
        loadOnboardingState,
      );
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
