import type { ReactNode } from "react";
import Link from "next/link";
import { LessonBody } from "@/components/LessonBody";

export function ReferenceShell({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className="lesson mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b-2 border-ink pb-6">
        <Link href="/reference" className="font-display text-sm font-bold">
          Reference
        </Link>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{lede}</p>
      </header>
      <LessonBody>{children}</LessonBody>
    </article>
  );
}
