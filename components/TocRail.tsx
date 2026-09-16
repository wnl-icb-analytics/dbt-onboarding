"use client";

import { useEffect, useState } from "react";

/** Sticky "On this page" rail for wide screens; highlights the section in view. */
export function TocRail({ headings }: { headings: { id: string; title: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    // a heading counts as current once it passes the top fifth of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -80% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label="On this page"
      data-toc
      className="fixed top-24 hidden max-h-[calc(100vh-8rem)] w-52 overflow-y-auto xl:block"
      style={{ right: "max(1.5rem, calc((100vw - 88rem) / 2 + 1.5rem))" }}
    >
      <p className="!m-0 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
        On this page
      </p>
      <ol className="!m-0 mt-3 !list-none space-y-0.5 border-l border-line !pl-0 text-[13px]">
        {headings.map(({ id, title }) => (
          <li key={id} className="!m-0 !p-0">
            <a
              href={`#${id}`}
              className={`-ml-px block border-l py-1 pl-3 leading-snug !no-underline transition ${
                active === id
                  ? "border-flame font-medium !text-flame-deep"
                  : "border-transparent !text-ink-faint hover:!text-ink"
              }`}
            >
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
