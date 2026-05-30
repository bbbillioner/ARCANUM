import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ARCANUM · Investing, made legible.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(900px 600px at 82% -10%, rgba(0,229,168,0.25), transparent 60%), radial-gradient(700px 700px at 0% 100%, rgba(0,229,168,0.10), transparent 55%)",
          }}
        />

        {/* Top: wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#00E5A8",
              transform: "rotate(45deg)",
              position: "relative",
              boxShadow: "0 0 24px rgba(0,229,168,0.6)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                width: 16,
                height: 16,
                background: "#000000",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            Arcanum
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 20,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#00E5A8",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                background: "#00E5A8",
                transform: "rotate(45deg)",
              }}
            />
            The beginner&apos;s command center
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Investing,</span>
            <span>
              made{" "}
              <span style={{ color: "#00E5A8", fontStyle: "italic" }}>
                legible.
              </span>
            </span>
          </div>
        </div>

        {/* Bottom: tagline strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8a8a92",
            fontSize: 22,
            fontWeight: 400,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>Live prices</span>
            <span style={{ color: "#2a2a2f" }}>·</span>
            <span>Calm research</span>
            <span style={{ color: "#2a2a2f" }}>·</span>
            <span>Paper-trading lab</span>
          </div>
          <div style={{ color: "#00E5A8", fontWeight: 600 }}>arcanum.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
