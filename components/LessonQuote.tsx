import type { ReactNode } from "react";

export function LessonQuote({
  children,
  source,
  href,
}: {
  children: ReactNode;
  source: string;
  href: string;
}) {
  return (
    <figure className="my-8 max-w-[68ch]">
      <blockquote className="text-[1.05rem] italic leading-[1.75] text-ink">
        “{children}”
      </blockquote>
      <figcaption className="mt-2 font-display text-xs text-ink-faint">
        — <a href={href}>{source}</a>
      </figcaption>
    </figure>
  );
}
