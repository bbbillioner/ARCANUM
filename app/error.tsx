"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className="page-hero">
        <div className="wrap" style={{ maxWidth: 680 }}>
          <span className="eyebrow">
            <span className="gem" />
            Recovery
          </span>
          <h1>
            Something did not <em>load correctly.</em>
          </h1>
          <p className="lede">
            Your local portfolio data has not been removed. Retry the page, or
            return to the command center and continue from there.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <button className="btn btn-primary" onClick={unstable_retry} type="button">
              Try again
            </button>
            <Link className="btn btn-ghost" href="/today">
              Return to Today
            </Link>
          </div>
          {error.digest && (
            <p
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.72rem",
                marginTop: 24,
              }}
            >
              Reference: {error.digest}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
