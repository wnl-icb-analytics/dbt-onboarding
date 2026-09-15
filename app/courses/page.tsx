import type { Metadata } from "next";
import Link from "next/link";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <article id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b-2 border-ink pb-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          Courses
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-soft">
          Interactive lessons for analysts joining dbt-analytics. Start with Git
          essentials if version control is new. Progress is saved in this
          browser.
        </p>
      </header>
      <ul className="grid gap-3">
        {COURSES.map((course, index) => (
          <li key={course.slug}>
            <Link
              href={`/courses/${course.slug}`}
              className="block rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-ink"
            >
              <span className="font-mono text-xs text-ink-faint">
                {index + 1} · {course.hours} · {course.lessons.length} lessons
              </span>
              <span className="mt-1 block font-display text-xl font-extrabold tracking-tight text-ink">
                {course.title}
              </span>
              <span className="mt-1 block text-sm text-ink-soft">
                {course.tagline}
              </span>
              <span className="mt-2 block text-xs text-ink-faint">
                {course.audience}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
