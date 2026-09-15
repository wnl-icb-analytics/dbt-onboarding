"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchDialog } from "@/components/SearchDialog";

const LINKS = [
  {
    href: "/learn",
    label: "Handbook",
    match: (path: string) =>
      path.startsWith("/learn") ||
      path.startsWith("/practice") ||
      path.startsWith("/advanced"),
  },
  {
    href: "/changelog",
    label: "Changelog",
    match: (path: string) => path.startsWith("/changelog"),
  },
  {
    href: "/courses",
    label: "Courses",
    match: (path: string) => path.startsWith("/courses"),
  },
  {
    href: "/reference",
    label: "Reference",
    match: (path: string) => path.startsWith("/reference"),
  },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-40 border-b border-line bg-paper md:sticky md:top-0 md:bg-paper/85 md:backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-display text-[17px] font-extrabold tracking-tight text-ink"
        >
          WNL handbook
        </Link>
        <nav className="ml-2 flex min-w-0 items-center gap-3 overflow-x-auto sm:ml-4 sm:gap-4">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-display text-xs font-bold uppercase tracking-wider transition ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <a
            href="https://github.com/wnl-icb-analytics/dbt-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink hover:text-ink sm:block"
          >
            dbt-analytics
          </a>
        </div>
      </div>
    </header>
  );
}
