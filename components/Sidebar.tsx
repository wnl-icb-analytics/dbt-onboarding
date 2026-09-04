"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADVANCED, LEARN, PRACTICE } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

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

  return (
    <div>
      <p className="mb-1.5 px-3 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-faint">
        <Link href={`/${base}`} className="transition hover:text-flame-deep">
          {heading}
        </Link>
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, i) => {
          const href = `/${base}/${item.slug}`;
          const active = pathname === href;
          const done = ready && isDone(`${base}/${item.slug}`);
          return (
            <li key={item.slug}>
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13.5px] transition ${
                  active
                    ? "bg-flame-soft font-semibold text-flame-deep"
                    : "text-ink-soft hover:bg-paper-warm hover:text-ink"
                }`}
              >
                <span
                  className={`grid size-[18px] shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                    done
                      ? "border-layer-staging bg-layer-staging text-white"
                      : active
                        ? "border-flame text-flame"
                        : "border-line text-ink-faint"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-6">
      <div className="px-3">
        <div className="flex items-baseline justify-between font-mono text-[11px] text-ink-faint">
          <span>progress</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-flame transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <Section heading="Learn" base="learn" items={LEARN} />
      <Section heading="Field guides" base="practice" items={PRACTICE} />
      <Section heading="Going further" base="advanced" items={ADVANCED} />
      <div>
        <p className="mb-1.5 px-3 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-faint">
          Keep handy
        </p>
        <Link
          href="/reference"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13.5px] transition ${
            pathname === "/reference"
              ? "bg-flame-soft font-semibold text-flame-deep"
              : "text-ink-soft hover:bg-paper-warm hover:text-ink"
          }`}
        >
          <span className="grid size-[18px] shrink-0 place-items-center rounded-full border border-line font-mono text-[10px] text-ink-faint">
            ⌘
          </span>
          Command reference
        </Link>
        {[
          ["/reference/datasets", "Dataset directory"],
          ["/reference/operations", "Production reference"],
        ].map(([href, title]) => <Link key={href} href={href}
          className={`block rounded-lg px-3 py-1.5 text-[13.5px] transition ${pathname === href
            ? "bg-flame-soft font-semibold text-flame-deep"
            : "text-ink-soft hover:bg-paper-warm hover:text-ink"}`}>
          {title}
        </Link>)}
      </div>
    </nav>
  );
}
