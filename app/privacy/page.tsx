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
            Last updated · 2026-07-13
          </p>
        </div>
      </section>

      <section
        className="block"
        style={{ paddingTop: "clamp(3rem, 6vw, 5rem)" }}
      >
        <div className="wrap" style={{ maxWidth: 760 }}>
          <article className="legal-prose">
            <h2>1 · Data stored on your device</h2>
            <p>
              ARCANUM uses your browser&apos;s <code>localStorage</code> for your
              onboarding answers, watchlist, fake-money simulator, transaction
              theses, journal reviews, and synchronization status. This lets
              the anonymous product work without an account and survive page
              reloads.
            </p>
            <p>
              You can export or clear this data from Settings. Clearing browser
              storage may also remove the local copy.
            </p>

            <h2>2 · Account and synchronized data</h2>
            <p>
              If you choose passwordless sign-in, ARCANUM and its authentication
              provider receive your email address and maintain an authentication
              session. Your investor profile, watchlist, simulator transactions,
              fake-cash balance, theses, and journal reviews are synchronized to
              your account so they can appear on another device.
            </p>
            <p>
              Supabase stores this account data. Database Row Level Security is
              configured so an authenticated user can access only their own rows.
              You can permanently delete your account and associated cloud data
              from Settings.
            </p>

            <h2>3 · Hosting and analytics</h2>
            <p>
              Vercel hosts ARCANUM and may process standard request information
              such as IP address, browser details, requested URLs, and timestamps
              for delivery, security, and debugging. ARCANUM also uses Vercel
              Analytics and Speed Insights to understand aggregate usage and
              performance. ARCANUM does not include advertising or social-media
              tracking pixels.
            </p>

            <h2>4 · Market data and external links</h2>
            <p>
              ARCANUM&apos;s server requests quote and news information from Yahoo
              Finance and caches responses. News links open publisher websites,
              whose own privacy policies apply after you leave ARCANUM.
            </p>

            <h2>5 · Cookies</h2>
            <p>
              Signed-in users receive essential Supabase authentication cookies
              used to maintain and refresh the session. These are functional
              cookies, not advertising cookies. Hosting and analytics providers
              may use limited technical storage according to their own policies.
            </p>

            <h2>6 · Retention and your controls</h2>
            <ul>
              <li>Export the current local copy of your ARCANUM data in Settings.</li>
              <li>Clear product data while keeping your account.</li>
              <li>Delete your account and associated cloud rows permanently.</li>
              <li>Use ARCANUM anonymously without providing an email address.</li>
            </ul>

            <h2>7 · Financial information</h2>
            <p>
              ARCANUM is not connected to a broker and does not collect brokerage
              credentials, bank information, payment-card details, or real-money
              transaction instructions. Simulator balances and trades are fake.
            </p>

            <h2>8 · Children</h2>
            <p>
              ARCANUM is intended for users aged 18 and older. We do not knowingly
              collect account data from children.
            </p>

            <h2>9 · Changes</h2>
            <p>
              ARCANUM is in early access. This notice will be updated when data
              practices or providers materially change, and the revision date
              will appear above.
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
