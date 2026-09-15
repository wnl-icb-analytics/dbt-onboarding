import Link from "next/link";
import { COURSES } from "@/lib/courses";
import { LEARN, PRACTICE, ADVANCED } from "@/lib/curriculum";

const AREAS = [
  {
    href: "/learn",
    title: "Handbook",
    body: `Concepts, working practice and going further. ${LEARN.length + PRACTICE.length + ADVANCED.length} pages.`,
  },
  {
    href: "/changelog",
    title: "Changelog",
    body: "What reached the warehouse, by day. Search a model or pull request.",
  },
  {
    href: "/courses",
    title: "Courses",
    body: "Interactive lessons if dbt or git is new. Progress stays in this browser.",
  },
  {
    href: "/reference",
    title: "Reference",
    body: "Commands, datasets and production schedules.",
  },
];

export default function Home() {
  return (
    <div id="main" className="px-4 py-12 sm:px-8">
      <section className="relative mx-auto max-w-4xl">
        <p className="font-mono text-xs tracking-wide text-ink-faint">
          WNL Analytics
        </p>
        <h1 className="mt-3 max-w-[18ch] font-display text-5xl font-black leading-[1.05] tracking-tighter text-ink sm:text-6xl">
          The warehouse handbook
        </h1>
        <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
          How this ICB team models data in dbt on Snowflake. Look up a page,
          check what changed, or take a course if you are new.
        </p>
      </section>

      <section className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
        {AREAS.map((area) => (
          <Link
            key={area.href}
            href={area.href}
            className="rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-ink"
          >
            <span className="font-display text-[15px] font-bold text-ink">
              {area.title}
            </span>
            <span className="mt-1 block text-sm text-ink-soft">{area.body}</span>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          Courses
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {COURSES.map((course, index) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-ink sm:flex-row sm:items-center"
            >
              <span className="font-mono text-xs text-ink-faint sm:w-6">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display text-lg font-extrabold tracking-tight text-ink">
                  {course.title}
                </span>
                <span className="mt-0.5 block text-sm text-ink-soft">
                  {course.tagline}
                </span>
              </span>
              <span className="font-mono text-xs text-ink-faint">
                {course.lessons.length} lessons · {course.hours}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
