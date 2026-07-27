"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useQuotes } from "@/components/hooks/use-quotes";
import { ARCANUM_CLOUD_DATA_LOADED_EVENT } from "@/lib/cloud-sync";
import { derivePersonalization } from "@/lib/personalization";
import { getCurrentPrice } from "@/lib/prices";
import { loadOnboardingAnswers } from "@/lib/portfolio";
import { allProfiles } from "@/lib/stocks";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function RecommendedForYou() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [missingInterests, setMissingInterests] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function loadRecommendations() {
      if (cancelled) return;

      const answers = loadOnboardingAnswers();
      if (!answers) {
        setTickers([]);
        setInterests([]);
        setMissingInterests([]);
        setHydrated(true);
        return;
      }
      const personal = derivePersonalization(answers);
      setTickers(personal.topRecommendedTickers);
      setInterests(answers.interests);
      setMissingInterests(
        personal.recommendationGroups
          .filter((g) => !g.hasCoverage)
          .map((g) => g.interest),
      );
      setHydrated(true);
    }
    const timeoutId = window.setTimeout(loadRecommendations, 0);
    window.addEventListener(
      ARCANUM_CLOUD_DATA_LOADED_EVENT,
      loadRecommendations,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener(
        ARCANUM_CLOUD_DATA_LOADED_EVENT,
        loadRecommendations,
      );
    };
  }, []);

  const { quotes } = useQuotes(tickers);

  if (!hydrated) {
    return (
      <div
        style={{
          height: 160,
          background: "var(--surface)",
          border: "1px solid var(--stroke)",
          opacity: 0.5,
        }}
      />
    );
  }

  if (tickers.length === 0 && interests.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--stroke)",
          borderLeft: "2px solid var(--accent)",
          padding: "20px 24px",
          marginBottom: 18,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.66rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}
        >
          Personalise this page
        </p>
        <p
          style={{ color: "var(--foreground)", fontSize: "0.96rem", lineHeight: 1.6 }}
        >
          Complete{" "}
          <Link
            href="/onboarding"
            style={{
              color: "var(--accent)",
              borderBottom: "1px solid rgba(0,229,168,0.4)",
            }}
          >
            the 8-question onboarding
          </Link>{" "}
          and this section will surface the stocks and ETFs that match your
          interests and investment style.
        </p>
      </div>
    );
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <div className="sec-head" style={{ marginBottom: 22 }}>
        <span className="eyebrow">
          <span className="gem" />
          Recommended for you
        </span>
        <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
          Built from your <em>interests.</em>
        </h2>
        <p style={{ fontSize: "0.96rem" }}>
          You said you&apos;re interested in{" "}
          <span style={{ color: "var(--accent)" }}>
            {interests.join(", ")}
          </span>
          . Here are the tickers in our universe that match, with cached market
          prices in your preferred order.
        </p>
      </div>

      {tickers.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--stroke)",
            padding: 24,
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.65 }}>
            Your interests ({interests.join(", ")}) don&apos;t map to anything in
            our current curated universe. Coverage is still expanding, so use
            the broader research list to explore the assets available today.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1,
            background: "var(--stroke)",
            border: "1px solid var(--stroke)",
          }}
        >
          {tickers.map((ticker) => {
            const profile = allProfiles.find((p) => p.ticker === ticker);
            if (!profile) return null;
            const quote = quotes[ticker];
            const price = quote?.price ?? getCurrentPrice(ticker);
            const change = quote?.changePercent ?? 0;
            const positive = change >= 0;
            return (
              <Link
                className="reco-card"
                href={`/stocks/${ticker}`}
                key={ticker}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontWeight: 600,
                        fontSize: "1.15rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {ticker}
                    </p>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {profile.name}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      border: "1px solid var(--stroke)",
                      padding: "2px 6px",
                    }}
                  >
                    {profile.assetType}
                  </span>
                </div>
                <div style={{ marginTop: 14 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontWeight: 600,
                      fontSize: "1.05rem",
                      color: "var(--accent)",
                    }}
                  >
                    {formatCurrency(price)}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.72rem",
                      color: positive ? "var(--accent)" : "#ff6878",
                      marginTop: 2,
                    }}
                  >
                    {positive ? "+" : ""}
                    {change.toFixed(2)}% today
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {missingInterests.length > 0 && (
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            color: "var(--muted)",
            marginTop: 14,
          }}
        >
          We don&apos;t have coverage for: {missingInterests.join(", ")}. Coming
          as our universe grows.
        </p>
      )}

      <style>{`
        .reco-card {
          background: var(--surface);
          padding: 18px 20px;
          color: inherit;
          text-decoration: none;
          transition: background 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .reco-card:hover {
          background: var(--surface-2);
        }
      `}</style>
    </section>
  );
}
