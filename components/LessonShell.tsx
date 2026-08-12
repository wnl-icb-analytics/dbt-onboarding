import type { ReactNode } from "react";
import { HeadingAnchors } from "@/components/HeadingAnchors";
import { PagerFooter } from "@/components/PagerFooter";
import type { Section } from "@/lib/curriculum";

export function LessonShell({
  section,
  slug,
  kicker,
  title,
  lede,
  minutes,
  children,
}: {
  section: Section;
  slug: string;
  kicker: string;
  title: string;
  lede: string;
  minutes: number;
  children: ReactNode;
}) {
  return (
    <article className="lesson mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="rise mb-8 border-b-2 border-ink pb-6">
        <p className="flex items-center gap-3 font-mono text-xs text-ink-faint">
          <span className="font-display font-extrabold uppercase tracking-[0.2em] text-flame">
            {kicker}
          </span>
          <span aria-hidden>·</span>
          <span>~{minutes} min</span>
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-soft">{lede}</p>
      </header>
      <div className="rise rise-2">{children}</div>
      <HeadingAnchors />
      <PagerFooter section={section} slug={slug} />
    </article>
  );
}
