import Link from "next/link";

import { Wordmark } from "./wordmark";

const footerCols = [
  {
    heading: "Product",
    links: [
      { href: "/dashboard", label: "Terminal" },
      { href: "/stocks", label: "Watchlist" },
      { href: "/learn", label: "Lessons" },
      { href: "/simulator", label: "Paper trading" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/#method", label: "Method" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/brief", label: "Daily brief" },
      { href: "/onboarding", label: "Begin" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/", label: "Disclosures" },
      { href: "/", label: "Terms" },
      { href: "/", label: "Privacy" },
      { href: "/", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/">
              <Wordmark />
            </Link>
            <p>
              A beginner investor command center. Built so your first decade is
              calmer than everyone else&apos;s first year.
            </p>
          </div>
          {footerCols.map((col) => (
            <div className="fcol" key={col.heading}>
              <h5>{col.heading}</h5>
              {col.links.map((link) => (
                <Link href={link.href} key={`${col.heading}-${link.label}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <p className="fine">
            ARCANUM is an educational tool in early access — not a broker,
            advisor, or signal service. Investing involves risk, including the
            possible loss of principal. Past performance is not indicative of
            future results. Prices come from public sources and may be delayed.
            Nothing on this site is financial advice.
          </p>
          <span className="cc">© 2026 ARCANUM LABS</span>
        </div>
      </div>
    </footer>
  );
}
