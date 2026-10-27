import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
  description:
    "How ARCANUM works, what each section does, and what to do when something looks wrong.",
};

const faqs = [
  {
    question: "Is ARCANUM a real broker?",
    answer:
      "No. ARCANUM is an educational tool. It does not hold money, does not place trades, and is not connected to any brokerage account. The simulator uses fake money so you can practice without risk.",
  },
  {
    question: "Where do the prices come from?",
    answer:
      "Prices and news headlines currently come from Yahoo Finance. Historical charts use repository snapshots, while current quotes use a 5-minute cache and fall back to the latest stored close. Data can be delayed, stale, incomplete, or unavailable and should not be used for real trade execution.",
  },
  {
    question: "Why is the stock universe limited?",
    answer:
      "ARCANUM deliberately uses a curated early-access universe. A small set has full hand-written research, while additional stocks and ETFs have concise profiles, charts, quotes, and comparison support. Coverage will expand after the core learning workflow is validated.",
  },
  {
    question: "Will my portfolio follow me to another device?",
    answer:
      "Yes, if you sign in. Anonymous data stays in your browser. Passwordless sign-in synchronizes your investor profile, watchlist, simulator, transactions, theses, and journal reviews through your account. A first sign-in also migrates existing local data when appropriate.",
  },
  {
    question: "What does the diamond marker mean?",
    answer:
      "It's our wordmark and section marker. The little jade diamond appears next to eyebrows on every section so you can scan the page structure at a glance.",
  },
  {
    question: "What's the difference between the dashboard and the simulator?",
    answer:
      "The dashboard is the read-only command center for the starter portfolio ARCANUM picked for you: allocation, holdings, news, and a learning anchor. The simulator is a separate practice environment with fake cash where you can buy and sell and watch cost basis and gains evolve.",
  },
  {
    question: "What price do simulator trades use?",
    answer:
      "Trades settle at the latest available quote: the live Yahoo Finance price when available (cached up to 5 minutes), otherwise the most recent daily close, labeled with its date. Simulator trades use fake money and never reach a real market.",
  },
  {
    question: "Where can I look up a term?",
    answer:
      "The Learn page explains core concepts such as ETFs, diversification, allocation, concentration risk, and the P/E ratio in plain English. Pages don't show pop-up definitions yet, so keep Learn open in another tab while you read research or the daily brief.",
  },
  {
    question: "What if news doesn't load?",
    answer:
      "ARCANUM currently relies on Yahoo Finance endpoints. If they are blocked, slow, or unavailable, news shows an empty state and quotes fall back to the most recent stored close. Retry later and verify important information with an official source.",
  },
  {
    question: "Is this safe to use? Is my data shared?",
    answer:
      "You can use ARCANUM anonymously, in which case product data remains in your browser. If you sign in, Supabase stores your email and synchronized product data. Vercel provides hosting, analytics, and performance measurement. See Privacy for the complete breakdown and Settings for export or deletion controls.",
  },
  {
    question: "How can I protect my account?",
    answer:
      "ARCANUM uses passwordless email links, so protect the email account you use to sign in. Never share a sign-in link. You can sign out, export product data, clear synchronized data, or permanently delete the account from Settings.",
  },
];

const quickLinks = [
  { href: "/onboarding", label: "Build your investor profile" },
  { href: "/dashboard", label: "Open the command center" },
  { href: "/stocks", label: "Browse stocks and ETFs" },
  { href: "/brief", label: "Read the daily brief" },
  { href: "/learn", label: "Browse all concepts" },
  { href: "/simulator", label: "Practice with fake money" },
];

export default function HelpPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Help
          </span>
          <h1>
            How ARCANUM <em>works.</em>
          </h1>
          <p className="lede">
            A short FAQ for early-access users, including account sync, market
            data behavior, privacy controls, and the difference between the
            dashboard and simulator.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              Where things live
            </span>
            <h2>
              The whole product in <em>six links.</em>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              background: "var(--stroke)",
              border: "1px solid var(--stroke)",
            }}
          >
            {quickLinks.map((link) => (
              <Link
                className="help-link"
                href={link.href}
                key={link.href}
              >
                <span className="help-link-label">{link.label}</span>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="sec-head">
            <span className="eyebrow">
              <span className="gem" />
              FAQ
            </span>
            <h2>
              Common <em>questions.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details className="faq-item" key={faq.question} open={index === 0}>
                <summary>
                  <span className="faq-q">{faq.question}</span>
                  <span className="faq-toggle">+</span>
                </summary>
                <div className="faq-a">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .help-link {
          background: var(--surface);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          color: var(--foreground);
          text-decoration: none;
          font-family: var(--font-inter);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .help-link:hover {
          background: var(--surface-2);
          color: var(--accent);
        }
        .help-link-label {
          font-weight: 500;
          font-size: 0.98rem;
        }
        .help-link .arrow {
          font-family: var(--font-jetbrains-mono);
          color: var(--muted);
          transition: transform 0.25s ease, color 0.2s ease;
        }
        .help-link:hover .arrow {
          color: var(--accent);
          transform: translateX(3px);
        }
        .faq-list {
          display: grid;
          gap: 0;
          background: var(--stroke);
          border: 1px solid var(--stroke);
        }
        .faq-item {
          background: var(--surface);
          border: none;
        }
        .faq-item summary {
          list-style: none;
          padding: 22px 24px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          transition: background 0.2s ease;
        }
        .faq-item summary::-webkit-details-marker {
          display: none;
        }
        .faq-item summary:hover {
          background: var(--surface-2);
        }
        .faq-q {
          font-family: var(--font-fraunces);
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: -0.01em;
          color: var(--foreground);
        }
        .faq-toggle {
          font-family: var(--font-jetbrains-mono);
          font-weight: 500;
          font-size: 1.4rem;
          color: var(--accent);
          line-height: 1;
          transition: transform 0.25s ease;
        }
        .faq-item[open] .faq-toggle {
          transform: rotate(45deg);
        }
        .faq-a {
          padding: 0 24px 22px;
          color: var(--muted);
          font-size: 0.96rem;
          line-height: 1.7;
        }
      `}</style>
    </main>
  );
}
