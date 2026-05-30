import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help · ARCANUM",
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
      "All prices and news headlines come from Yahoo Finance. Historical charts are snapshots refreshed nightly. The 'live' price you see in the top-right of each stock is fetched with a 5-minute cache. Yahoo's free feed is typically delayed 15–20 minutes from the actual market.",
  },
  {
    question: "Why do I only see five stocks?",
    answer:
      "We deliberately ship a small, curated set during early access so every stock has a hand-written research page. The next release expands the universe and adds search for any ticker.",
  },
  {
    question: "Will my portfolio follow me to another device?",
    answer:
      "Not yet. Your onboarding answers and simulator portfolio live in your browser's local storage. If you switch devices or clear browser data, ARCANUM forgets you. Account sync is on the roadmap.",
  },
  {
    question: "What does the diamond marker mean?",
    answer:
      "It's our wordmark and section marker. The little jade diamond appears next to eyebrows on every section so you can scan the page structure at a glance.",
  },
  {
    question: "What's the difference between the dashboard and the simulator?",
    answer:
      "The dashboard is the read-only command center for the starter portfolio ARCANUM picked for you — your allocation, holdings, news, and a learning anchor. The simulator is a separate practice environment with fake cash where you can buy and sell at live prices and watch cost basis and gains evolve.",
  },
  {
    question: "Hover the underlined words?",
    answer:
      "Yes. Any word with a dotted underline (P/E ratio, allocation, concentration risk, etc.) has a plain-English definition. Hover on desktop, tap on mobile.",
  },
  {
    question: "What if news doesn't load?",
    answer:
      "ARCANUM relies on Yahoo's public endpoints. If they're temporarily blocked or throttled, the news panel shows an empty state and the live price falls back to the most recent close (you'll see a hollow circle ○ instead of the solid ● live indicator).",
  },
  {
    question: "Is this safe to use? Is my data shared?",
    answer:
      "We don't ask for personal info and there's no account to create. Everything you enter is stored in your browser. See the privacy page for the full breakdown.",
  },
  {
    question: "I found a bug or have feedback.",
    answer:
      "Email hello@arcanum.example with what you saw and what you expected. Including a screenshot helps a lot.",
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
            A short FAQ for early-access users. If your question isn&apos;t
            answered here, email{" "}
            <a className="legal-link" href="mailto:hello@arcanum.example">
              hello@arcanum.example
            </a>
            .
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
