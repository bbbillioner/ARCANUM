import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · ARCANUM",
  description:
    "How ARCANUM handles your data. Educational tool in early access.",
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Privacy
          </span>
          <h1>
            What we <em>collect</em>, what we don&apos;t.
          </h1>
          <p className="lede">
            ARCANUM is an educational tool in early access. We are not a broker
            and we do not hold customer funds. This page explains, in plain
            language, what data the product touches.
          </p>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 22,
            }}
          >
            Last updated · 2026-05-30
          </p>
        </div>
      </section>

      <section
        className="block"
        style={{ paddingTop: "clamp(3rem, 6vw, 5rem)" }}
      >
        <div className="wrap" style={{ maxWidth: 760 }}>
          <article className="legal-prose">
            <h2>1 · What we store on your device</h2>
            <p>
              ARCANUM uses your browser&apos;s <code>localStorage</code> to
              remember three things:
            </p>
            <ul>
              <li>
                Your <strong>onboarding answers</strong> (budget, goal, time
                horizon, risk comfort, experience, interests, portfolio style,
                approach) — so the dashboard can build a starter portfolio
                around you.
              </li>
              <li>
                Your <strong>simulator state</strong> (cash balance, fake
                holdings, transaction history) — so your practice ledger
                survives reloads.
              </li>
              <li>
                Optional UI preferences (e.g. theme, watchlist additions) once
                those features ship.
              </li>
            </ul>
            <p>
              All of this lives in your browser. We do not see it, we cannot
              recover it, and it does not leave your device. Clearing your
              browser data resets ARCANUM.
            </p>

            <h2>2 · What we receive on our servers</h2>
            <p>
              When you visit ARCANUM, our hosting provider (Vercel) records
              standard server logs — IP address, user-agent, the URLs you
              request. These are used for security and operational debugging
              and are not used to build a profile of you.
            </p>
            <p>
              We do not ask for your name, email, or any financial credentials.
              We have no account system to sign up for at this time.
            </p>

            <h2>3 · Third-party services we call</h2>
            <p>When you load certain pages, ARCANUM fetches data from:</p>
            <ul>
              <li>
                <strong>Yahoo Finance</strong> — historical price data, live
                quotes, and news headlines for the tickers we track. These
                requests go server-side from our caches; Yahoo does not see
                your IP.
              </li>
            </ul>
            <p>
              We do not embed analytics, advertising, or social pixels in this
              version. If that changes, we will update this page and tell users
              in the product.
            </p>

            <h2>4 · Cookies</h2>
            <p>
              ARCANUM does not set tracking cookies. The Next.js framework may
              set a minimal session cookie for routing purposes. There is no
              advertising cookie and no cross-site tracking.
            </p>

            <h2>5 · Children</h2>
            <p>
              ARCANUM is intended for users aged 18 and older. We do not
              knowingly collect data from minors.
            </p>

            <h2>6 · Changes to this policy</h2>
            <p>
              ARCANUM is in active development. When we add account features,
              this page will be updated to describe how stored account data is
              handled. We will note the change date at the top of this page.
            </p>

            <h2>7 · Contact</h2>
            <p>
              Privacy questions: write to{" "}
              <a className="legal-link" href="mailto:hello@arcanum.example">
                hello@arcanum.example
              </a>
              .
            </p>
          </article>
        </div>
      </section>

      <style>{`
        .legal-prose h2 {
          font-family: var(--font-fraunces);
          font-weight: 600;
          font-size: 1.5rem;
          letter-spacing: -0.01em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: var(--foreground);
        }
        .legal-prose h2:first-child {
          margin-top: 0;
        }
        .legal-prose p {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .legal-prose strong {
          color: var(--foreground);
          font-weight: 500;
        }
        .legal-prose code {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.9em;
          color: var(--accent);
          background: var(--surface);
          padding: 1px 6px;
          border: 1px solid var(--stroke);
        }
        .legal-prose ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1.2rem;
          display: grid;
          gap: 10px;
        }
        .legal-prose li {
          color: var(--muted);
          font-size: 0.96rem;
          line-height: 1.65;
          padding-left: 22px;
          position: relative;
        }
        .legal-prose li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          width: 6px;
          height: 6px;
          background: var(--accent);
          transform: rotate(45deg);
        }
        .legal-link {
          color: var(--accent);
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 229, 168, 0.4);
        }
        .legal-link:hover {
          border-bottom-color: var(--accent);
        }
      `}</style>
    </main>
  );
}
