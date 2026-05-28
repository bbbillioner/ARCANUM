import Link from "next/link";

const footerSections = [
  {
    heading: "Product",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/stocks", label: "Stocks" },
      { href: "/simulator", label: "Simulator" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/learn", label: "Concepts" },
      { href: "/brief", label: "Daily brief" },
      { href: "/onboarding", label: "Build your profile" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#05070a]">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-12">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-wide text-white">
              ARCANUM
            </p>
            <p className="max-w-sm text-sm leading-6 text-zinc-400">
              A beginner investor command center for portfolio structure,
              stock research, market context, and investing literacy.
            </p>
          </div>
          {footerSections.map((section) => (
            <div className="space-y-3" key={section.heading}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                {section.heading}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-sm text-zinc-300 transition hover:text-teal-200"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6">
          <p className="text-xs leading-6 text-zinc-500">
            <span className="font-semibold text-zinc-300">
              Educational use only.
            </span>{" "}
            ARCANUM is not a broker, advisor, or signal service. Nothing on this
            site is financial advice, a recommendation, or a prediction. Prices
            are historical snapshots from public sources and may be stale. Do
            your own research and consult a qualified professional before
            investing.
          </p>
        </div>
      </div>
    </footer>
  );
}
