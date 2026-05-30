import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms · ARCANUM",
  description:
    "The terms of use for ARCANUM, an educational beginner-investor tool.",
};

export default function TermsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Terms of use
          </span>
          <h1>
            Plain-language <em>rules</em> for using ARCANUM.
          </h1>
          <p className="lede">
            By using ARCANUM you accept the points below. This is an
            educational early-access product — not a brokerage, advisor, or
            signal service.
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
            <h2>1 · What ARCANUM is</h2>
            <p>
              ARCANUM is an educational web tool that helps beginners learn how
              investing works. It includes a starter-portfolio suggestion based
              on your answers, research pages on a small set of stocks and
              ETFs, live news, a glossary, and a paper-trading simulator.
            </p>
            <p>
              ARCANUM is not a broker. ARCANUM does not hold or move money.
              ARCANUM does not place trades on your behalf and is not connected
              to any brokerage account.
            </p>

            <h2>2 · What ARCANUM is not</h2>
            <p>
              Nothing in ARCANUM is financial advice, investment advice, tax
              advice, or a recommendation to buy, sell, or hold any security.
              The portfolio templates, research notes, bull/base/bear cases,
              and learning concepts are illustrative and educational.
            </p>
            <p>
              The simulator uses fake money. No real trades are placed and no
              real returns are generated. Past performance of any displayed
              security does not predict future performance.
            </p>

            <h2>3 · Eligible users</h2>
            <p>
              You must be at least 18 years old to use ARCANUM. By using the
              site you confirm that you meet this requirement.
            </p>

            <h2>4 · Accuracy of information</h2>
            <p>
              ARCANUM displays price and news data from Yahoo Finance.
              Historical prices are stored as periodic snapshots; live quotes
              are fetched in near-real-time but may be delayed by 15–20
              minutes, which is standard for free public quote feeds. Yahoo
              data is not guaranteed, and ARCANUM is not responsible for
              errors, delays, or interruptions in third-party data.
            </p>

            <h2>5 · Your own decisions</h2>
            <p>
              You are responsible for your own financial decisions. Before
              acting on anything you read or practice on ARCANUM, consult a
              qualified financial professional and read official prospectuses
              and filings.
            </p>

            <h2>6 · Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use ARCANUM to misrepresent yourself or to mislead other users.
              </li>
              <li>
                Scrape, crawl, or extract data at high volume — the live data
                we serve comes from rate-limited upstream sources.
              </li>
              <li>
                Reverse-engineer, copy, or republish ARCANUM&apos;s content
                without permission.
              </li>
              <li>Use the site for any unlawful purpose.</li>
            </ul>

            <h2>7 · Disclaimers and liability</h2>
            <p>
              ARCANUM is provided &quot;as is&quot; with no warranties of any
              kind. To the maximum extent permitted by law, ARCANUM Labs, its
              owners and contributors disclaim liability for any losses,
              damages, or claims arising from your use of the site or reliance
              on its content.
            </p>

            <h2>8 · Changes</h2>
            <p>
              ARCANUM is in active development. Features may change, be added,
              or be removed. Significant changes to these terms will be noted
              at the top of this page.
            </p>

            <h2>9 · Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a className="legal-link" href="mailto:hello@arcanum.example">
                hello@arcanum.example
              </a>
              .
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
