import Link from "next/link";
import Image from "next/image";
import { COURSES, UPCOMING } from "@/lib/courses";
import { LEARN, PRACTICE, ADVANCED } from "@/lib/curriculum";

const PILLARS = [
  {
    title: "Reused",
    body: "Thousands of tested models already exist. Most analyses start from one of them, not a blank worksheet.",
    color: "var(--layer-reporting)",
  },
  {
    title: "Ordered",
    body: "dbt reads your SQL to work out which models depend on which. A build runs them in that order, so you don't sequence them by hand.",
    color: "var(--layer-staging)",
  },
  {
    title: "Tested",
    body: "Tests for grain, nulls and row counts run with the models. A failure shows up in the pipeline, along with every model it affects.",
    color: "var(--layer-modelling)",
  },
  {
    title: "Versioned",
    body: "Every change is a reviewed pull request. The history shows who changed what, and why.",
    color: "var(--layer-published)",
  },
];

export default function Home() {
  return (
    <div className="px-4 py-12 sm:px-8">
      {/* hero */}
      <section className="relative mx-auto max-w-4xl">
        <div className="rise flex items-center gap-4">
          <Image
            src="/logos/logo-wnl-ics.svg"
            alt="West and North London Integrated Care System"
            width={145}
            height={106}
            className="h-12 w-auto dark:hidden"
          />
          <Image
            src="/logos/logo-wnl-ics-white.svg"
            alt="West and North London Integrated Care System"
            width={145}
            height={106}
            className="hidden h-12 w-auto dark:block"
          />
          <span aria-hidden className="h-9 w-px bg-line" />
          <p className="font-mono text-xs tracking-wide text-ink-faint">
            WNL Analytics · for SQL analysts new to dbt
          </p>
        </div>
        <h1 className="rise rise-1 mt-4 max-w-[16ch] font-display text-5xl font-black leading-[1.02] tracking-tighter text-ink sm:text-7xl">
          Working with{" "}
          <span className="relative whitespace-nowrap text-flame">
            dbt
            <svg
              viewBox="0 0 220 12"
              className="absolute -bottom-1.5 left-0 w-full"
              aria-hidden
            >
              <path
                d="M3 9 C 60 2, 160 2, 217 7"
                fill="none"
                stroke="var(--flame)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          at WNL Analytics
        </h1>
        <h2 className="rise rise-2 mt-3 font-display text-2xl font-bold tracking-tight text-ink-soft sm:text-3xl">
          You write SQL models. dbt builds them in Snowflake and runs the
          tests you define.
        </h2>
        <p className="rise rise-3 mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
          Courses, a guide and reference pages for analysts joining the{" "}
          <a
            href="https://github.com/wnl-icb-analytics/dbt-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-flame-deep underline decoration-flame/40 underline-offset-2 hover:decoration-flame"
          >
            dbt-analytics
          </a>{" "}
          project. Start with a course. Turn to the guide when you want the
          full reasoning, and to the reference pages when you need a command or
          a name.
        </p>
        <Image
          src="/logos/dbt.svg"
          alt=""
          width={340}
          height={340}
          className="pointer-events-none absolute -right-20 -top-10 -z-10 hidden opacity-[0.06] dark:opacity-[0.02] lg:block"
          priority
        />
      </section>

      {/* courses */}
      <section className="mx-auto mt-14 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          The courses · in order
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {COURSES.map((c, i) => (
            <Link
              key={c.slug}
              href={`/courses/${c.slug}`}
              className={`rise rise-${i + 2} group flex flex-col gap-3 rounded-2xl border-[1.5px] bg-paper p-6 transition hover:-translate-y-0.5 sm:flex-row sm:items-center`}
              style={{ borderColor: c.accent, boxShadow: `3px 3px 0 0 ${c.accent}` }}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-lg font-black">
                {i}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                    {c.title}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">
                    {c.lessons.length} lessons · {c.hours}
                  </span>
                </span>
                <span className="mt-0.5 block text-[15px] text-ink-soft">{c.tagline}</span>
                <span className="mt-1 block text-xs text-ink-faint">{c.audience}</span>
              </span>
              <span
                className="shrink-0 font-display text-sm font-extrabold uppercase tracking-widest group-hover:underline"
                style={{ color: c.accent }}
              >
                Open →
              </span>
            </Link>
          ))}
          {UPCOMING.map((c) => (
            <div
              key={c.slug}
              className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-line bg-paper-warm/50 p-6 sm:flex-row sm:items-center"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-line font-display text-lg font-black text-ink-faint">
                ?
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-xl font-extrabold tracking-tight text-ink-faint">
                    {c.title}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">{c.hours}</span>
                </span>
                <span className="mt-0.5 block text-[15px] text-ink-faint">{c.tagline}</span>
              </span>
              <span className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-faint">
                coming soon
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-ink-faint">
          Start with Git essentials if you&apos;re new to version control,
          because everything else assumes it. If you already use Git, start
          with Understanding dbt.
          Your first PR comes last. In it you set up your machine and merge a
          real change. Each course ends with a certificate, and your progress
          stays in this browser.
        </p>
      </section>

      {/* the case */}
      <section className="mx-auto mt-20 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          Why dbt
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border-2 bg-paper p-5"
              style={{ borderColor: p.color }}
            >
              <h3
                className="font-display text-lg font-extrabold tracking-tight"
                style={{ color: p.color }}
              >
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[64ch] text-[15px] leading-relaxed text-ink-soft">
          If a report needs demographics, you join the team&apos;s existing
          model. Its tests and scheduled builds are already in place, and the
          same goes for registers and lookups. You still write SQL against
          Snowflake, but you don&apos;t rebuild those for each piece of work.
          Setup happens once. After that, the everyday loop of edit, build and
          pull request takes minutes.
        </p>
      </section>

      {/* guide */}
      <section className="mx-auto mt-20 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          The guide · the full story
        </h2>
        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-soft">
          The guide covers the same ground as the courses at greater length,
          with the reasoning and examples from the project itself. Read it
          instead of a course, or come back months later when a topic matters
          to your work. You don&apos;t need to do both.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <Link
            href="/learn"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Learn
            </span>
            <span className="block text-sm text-ink-soft">
              How the project works and why: the data, layers, naming, design,
              testing and production. {LEARN.length} chapters.
            </span>
          </Link>
          <Link
            href={`/practice/${PRACTICE[0].slug}`}
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Walkthroughs
            </span>
            <span className="block text-sm text-ink-soft">
              The steps for one task at a time, from setup to a merged PR, plus
              changing a model and undoing mistakes in Git.{" "}
              {PRACTICE.length} walkthroughs.
            </span>
          </Link>
          <Link
            href={`/advanced/${ADVANCED[0].slug}`}
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Going further
            </span>
            <span className="block text-sm text-ink-soft">
              The dbt extension, macros, materialisations, snapshots, semantic
              views and more, for when the basics are routine.{" "}
              {ADVANCED.length} pages.
            </span>
          </Link>
        </div>
      </section>

      {/* look up */}
      <section className="mx-auto mt-14 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          Look things up
        </h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <Link
            href="/reference"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Command reference
            </span>
            <span className="block text-sm text-ink-soft">
              The dbt and Git commands you&apos;ll use most, and the naming
              rules, ready to search and copy
            </span>
          </Link>
          <Link
            href="/models"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Model docs
            </span>
            <span className="block text-sm text-ink-soft">
              Every model, source, column and test, with lineage. Rebuilt when a
              merge to main changes models, macros, seeds, snapshots, analyses or project
              config.
            </span>
          </Link>
          <Link
            href="/reference/datasets"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Dataset directory
            </span>
            <span className="block text-sm text-ink-soft">
              Source families and folders, and the main models in each
            </span>
          </Link>
          <Link
            href="/reference/operations"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Production reference
            </span>
            <span className="block text-sm text-ink-soft">
              Workflows, build schedules and the records behind each run
            </span>
          </Link>
          <Link
            href="/changelog"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Changelog
            </span>
            <span className="block text-sm text-ink-soft">
              What changed in the warehouse each day, from merged pull requests
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
