"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TickerSearch } from "./ticker-search";
import { Wordmark } from "./wordmark";

const navLinks = [
  { href: "/today", label: "Today" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stocks", label: "Stocks" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/learn", label: "Learn" },
  { href: "/simulator", label: "Simulator" },
  { href: "/journal", label: "Journal" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="wrap">
        <nav className="site-nav">
          <Link aria-label="Arcanum home" href="/">
            <Wordmark />
          </Link>

          <div className="nav-links">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="nav-right">
            <TickerSearch />
            <Link className="btn btn-primary nav-cta" href="/dashboard">
              Open Terminal
            </Link>
          </div>
        </nav>

        {/* Mobile nav strip — only visible on smaller widths */}
        <div className="nav-mobile">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className="nav-mobile-link"
                data-active={active}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .nav-mobile {
          display: none;
        }
        @media (max-width: 880px) {
          .nav-cta {
            padding: 0.65em 1.1em;
            font-size: 0.85rem;
          }
          .nav-mobile {
            display: flex;
            gap: 4px;
            overflow-x: auto;
            padding: 8px 16px 10px;
            border-top: 1px solid var(--stroke);
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .nav-mobile::-webkit-scrollbar {
            display: none;
          }
          .nav-mobile-link {
            white-space: nowrap;
            padding: 6px 10px;
            font-family: var(--font-inter);
            font-size: 0.82rem;
            font-weight: 500;
            color: var(--muted);
            text-decoration: none;
            transition: color 0.15s ease, background 0.15s ease;
            border: 1px solid transparent;
          }
          .nav-mobile-link:hover,
          .nav-mobile-link[data-active="true"] {
            color: var(--foreground);
          }
          .nav-mobile-link[data-active="true"] {
            border-color: var(--stroke);
            background: var(--surface);
          }
        }
      `}</style>
    </header>
  );
}
