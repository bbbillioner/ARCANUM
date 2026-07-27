"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#050706",
          color: "#f2f5f3",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 620 }}>
          <p
            style={{
              color: "#00e5a8",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            ARCANUM recovery
          </p>
          <h1 style={{ fontSize: 42, lineHeight: 1.05, margin: "18px 0" }}>
            The application hit an unexpected error.
          </h1>
          <p style={{ color: "#9aa39f", fontSize: 17, lineHeight: 1.65 }}>
            Your browser data remains on this device. Retry the application to
            restore the workspace.
          </p>
          <button
            onClick={unstable_retry}
            style={{
              background: "#00e5a8",
              border: 0,
              color: "#03100c",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              marginTop: 28,
              padding: "13px 20px",
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
