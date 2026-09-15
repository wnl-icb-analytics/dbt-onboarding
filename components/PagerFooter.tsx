"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { pager, type Section } from "@/lib/curriculum";

export function PagerFooter({
  section,
  slug,
}: {
  section: Section;
  slug: string;
}) {
  const { isDone, toggleDone, ready } = useProgress();
  const id = `${section}/${slug}`;
  const done = ready && isDone(id);
  const { prev, next } = pager(section, slug);

  return (
    <footer className="mt-14 max-w-[76ch] border-t border-line pt-6">
      <button
        type="button"
        onClick={() => toggleDone(id)}
        className={`w-full rounded-xl border-2 px-5 py-3.5 font-display text-sm font-extrabold uppercase tracking-widest transition ${
          done
            ? "border-layer-staging bg-layer-staging text-white"
            : "border-ink bg-paper text-ink hover:bg-flame hover:text-white hover:border-flame"
        }`}
      >
        {done ? "✓ Completed — select to undo" : "Mark as complete"}
      </button>
      <nav className="mt-4 flex items-stretch justify-between gap-3">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex-1 rounded-xl border border-line px-4 py-3 transition hover:border-flame"
          >
            <span className="font-mono text-[11px] text-ink-faint">← previous</span>
            <span className="block text-sm font-medium text-ink group-hover:text-flame-deep">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        <Link
          href={next.href}
          className="group flex-1 rounded-xl border border-line px-4 py-3 text-right transition hover:border-flame"
        >
          <span className="font-mono text-[11px] text-ink-faint">next →</span>
          <span className="block text-sm font-medium text-ink group-hover:text-flame-deep">
            {next.title}
          </span>
        </Link>
      </nav>
    </footer>
  );
}
