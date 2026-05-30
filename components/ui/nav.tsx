"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Wordmark } from "./wordmark";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stocks", label: "Stocks" },
  { href: "/brief", label: "Brief" },
  { href: "/learn", label: "Learn" },
  { href: "/simulator", label: "Simulator" },
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
            <Link className="signin" href="/learn">
              Learn
            </Link>
            <Link className="btn btn-primary" href="/dashboard">
              Open Terminal
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
