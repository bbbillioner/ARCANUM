"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070a]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        <Link
          className="text-sm font-semibold tracking-wide text-white transition hover:text-teal-200"
          href="/"
        >
          ARCANUM
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:px-3",
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 -bottom-[15px] h-[2px] rounded-full bg-teal-300 sm:inset-x-3"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
