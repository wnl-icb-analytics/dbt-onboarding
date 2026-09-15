"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ADVANCED, LEARN, PRACTICE } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

const HEADING =
  "font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint";

function TreeLink({
  href,
  active,
  done,
  children,
}: {
  href: string;
  active: boolean;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`-ml-px flex items-baseline gap-2 border-l py-[5px] pl-3 pr-2 text-[13.5px] leading-snug transition ${
          active
            ? "border-flame font-medium text-flame-deep"
            : "border-transparent text-ink-soft hover:border-ink-faint hover:text-ink"
        }`}
      >
        <span className="min-w-0 flex-1">{children}</span>
        {done ? (
          <span className="shrink-0 text-[11px] text-layer-staging" aria-label="completed">
            ✓
          </span>
        ) : null}
      </Link>
    </li>
  );
}

/** Collapsible group; the one holding the current page starts open. */
function Section({
  heading,
  base,
  items,
}: {
  heading: string;
  base: "learn" | "practice" | "advanced";
  items: { slug: string; title: string }[];
}) {
  const pathname = usePathname();
  const { isDone, ready } = useProgress();
  const current = pathname === `/${base}` || pathname.startsWith(`/${base}/`);

  return (
    <details open={current} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md py-1 pr-2 [&::-webkit-details-marker]:hidden">
        <span className={`${HEADING} group-open:text-ink-soft`}>{heading}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-faint transition group-open:rotate-90"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </summary>
      <ul className="mt-1 mb-2 border-l border-line">
        <TreeLink href={`/${base}`} active={pathname === `/${base}`}>
          Overview
        </TreeLink>
        {items.map((item) => {
          const href = `/${base}/${item.slug}`;
          return (
            <TreeLink
              key={item.slug}
              href={href}
              active={pathname === href}
              done={ready && isDone(`${base}/${item.slug}`)}
            >
              {item.title}
            </TreeLink>
          );
        })}
      </ul>
    </details>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { done, ready } = useProgress();
  const total = LEARN.length + PRACTICE.length + ADVANCED.length;
  const completed = ready
    ? done.filter(
        (d) =>
          d.startsWith("learn/") || d.startsWith("practice/") || d.startsWith("advanced/"),
      ).length
    : 0;
  const pct = Math.round((completed / total) * 100);

  return (
    <nav aria-label="Handbook" className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-6">
      <div>
        <div className="flex items-baseline justify-between font-mono text-[11px] text-ink-faint">
          <span>
            {completed} of {total} read
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-flame transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Section heading="Learn" base="learn" items={LEARN} />
        <Section heading="Field guides" base="practice" items={PRACTICE} />
        <Section heading="Going further" base="advanced" items={ADVANCED} />
      </div>
      <div>
        <p className={`${HEADING} py-1`}>Keep handy</p>
        <ul className="mt-1 border-l border-line">
          {[
            ["/reference", "Command reference"],
            ["/models", "Model docs"],
            ["/changelog", "Changelog"],
            ["/reference/datasets", "Dataset directory"],
            ["/reference/operations", "Production reference"],
          ].map(([href, title]) => (
            <TreeLink
              key={href}
              href={href}
              active={href === "/changelog" ? pathname.startsWith("/changelog") : pathname === href}
            >
              {title}
            </TreeLink>
          ))}
        </ul>
      </div>
    </nav>
  );
}
