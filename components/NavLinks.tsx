"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Courses", match: (p: string) => p === "/" || p.startsWith("/courses") },
  {
    href: "/learn",
    label: "Handbook",
    match: (p: string) => /^\/(learn|practice|advanced)(\/|$)/.test(p),
  },
  { href: "/models", label: "Models", match: (p: string) => p.startsWith("/models") },
  { href: "/changelog", label: "Changelog", match: (p: string) => p.startsWith("/changelog") },
  { href: "/reference", label: "Reference", match: (p: string) => p.startsWith("/reference") },
];

export function NavLinks({ className = "" }: { className?: string }) {
  return <NavLinksView pathname={usePathname()} className={className} />;
}

/** Suspense fallback on routes whose path is only known at request time. */
export function NavLinksView({
  pathname,
  className = "",
}: {
  pathname: string | null;
  className?: string;
}) {
  return (
    <nav aria-label="Primary" className={`flex items-center sm:gap-1 ${className}`}>
      {NAV.map((item) => {
        const active = pathname !== null && item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative shrink-0 rounded-md px-1.5 py-1.5 font-display text-[13px] font-semibold transition sm:px-2.5 sm:text-[13.5px] ${
              active
                ? "text-ink after:absolute after:inset-x-1.5 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-flame sm:after:inset-x-2.5"
                : "text-ink-soft hover:bg-paper-warm hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
