import type { ReactNode } from "react";

export function LessonQuote({
  children,
  attribution,
  work,
  href,
}: {
  children: ReactNode;
  attribution: string;
  work: string;
  href: string;
}) {
  return (
    <figure className="my-8 max-w-[68ch]">
      <blockquote className="text-[1.05rem] italic leading-[1.75] text-ink">
        “{children}”
      </blockquote>
      <figcaption className="mt-2 font-display text-xs font-normal leading-relaxed text-ink-soft">
        — {attribution}, in{" "}
        <a href={href}>
          <cite>{work}</cite>
        </a>
      </figcaption>
    </figure>
  );
}
