import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section
        style={{
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 48,
            padding: "clamp(4rem, 8vw, 7rem) 32px",
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow">
              <span className="gem" />
              404 · Route not found
            </span>
            <h1
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 600,
                fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                margin: "20px 0 24px",
              }}
            >
              The page you&apos;re looking for{" "}
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                isn&apos;t here.
              </em>
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "1.08rem",
                lineHeight: 1.65,
                maxWidth: "52ch",
              }}
            >
              Maybe the link is wrong, maybe we moved it, maybe a ticker we
              don&apos;t track yet. Try one of the live places below.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 32,
              }}
            >
              <Link className="btn btn-primary" href="/">
                Back to the homepage <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/dashboard">
                Open the terminal
              </Link>
            </div>

            <div
              style={{
                marginTop: 56,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 1,
                background: "var(--stroke)",
                border: "1px solid var(--stroke)",
              }}
            >
              {[
                { href: "/stocks", label: "Stocks & ETFs" },
                { href: "/brief", label: "Daily brief" },
                { href: "/learn", label: "Concepts" },
                { href: "/simulator", label: "Simulator" },
              ].map((link) => (
                <Link
                  className="nf-link"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                  <span className="arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .nf-link {
          background: var(--surface);
          padding: 20px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: var(--foreground);
          text-decoration: none;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .nf-link:hover {
          background: var(--surface-2);
          color: var(--accent);
        }
        .nf-link .arrow {
          transition: transform 0.25s ease;
        }
        .nf-link:hover .arrow {
          transform: translateX(3px);
        }
      `}</style>
    </main>
  );
}
