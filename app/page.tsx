import Link from "next/link";
import Image from "next/image";
import { COURSES, UPCOMING } from "@/lib/courses";
import { LEARN, PRACTICE, ADVANCED } from "@/lib/curriculum";

const PILLARS = [
  {
    title: "Reused",
    body: "Hundreds of tested models already exist. Most analyses start from another model, not a blank worksheet.",
    color: "var(--layer-reporting)",
  },
  {
    title: "Ordered",
    body: "dbt reads your SQL and builds a dependency graph. Upstream always runs first — nobody schedules anything by hand.",
    color: "var(--layer-staging)",
  },
  {
    title: "Tested",
    body: "Grain, nulls, row counts: assertions run nightly. Bad data is caught by the pipeline, not discovered on a dashboard.",
    color: "var(--layer-modelling)",
  },
  {
    title: "Versioned",
    body: "Every change is a reviewed pull request with history. “Who changed this and why” is always one click away.",
    color: "var(--layer-published)",
  },
];

export default function Home() {
  return (
    <div className="px-4 py-12 sm:px-8">
      {/* hero */}
      <section className="relative mx-auto max-w-4xl">
        <p className="rise font-mono text-xs tracking-wide text-ink-faint">
          WNL Analytics · for SQL analysts new to dbt
        </p>
        <h1 className="rise rise-1 mt-4 max-w-[16ch] font-display text-5xl font-black leading-[1.02] tracking-tighter text-ink sm:text-7xl">
          You already write the{" "}
          <span className="relative whitespace-nowrap text-flame">
            SELECT
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
          </span>
          .
        </h1>
        <h2 className="rise rise-2 mt-3 font-display text-2xl font-bold tracking-tight text-ink-soft sm:text-3xl">
          dbt handles everything around it.
        </h2>
        <p className="rise rise-3 mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
          Interactive courses for analysts joining the{" "}
          <a
            href="https://github.com/wnl-icb-analytics/dbt-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-flame-deep underline decoration-flame/40 underline-offset-2 hover:decoration-flame"
          >
            dbt-analytics
          </a>{" "}
          project — small steps, real commands, a certificate at the end of each.
          Plus a handbook for looking things up later.
        </p>
        <Image
          src="/logos/dbt.svg"
          alt=""
          width={340}
          height={340}
          className="pointer-events-none absolute -right-20 -top-10 -z-10 hidden opacity-[0.06] lg:block"
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
              className={`rise rise-${i + 2} group flex flex-col gap-3 rounded-2xl border-2 bg-paper p-6 transition hover:-translate-y-0.5 sm:flex-row sm:items-center`}
              style={{ borderColor: c.accent, boxShadow: `5px 5px 0 0 ${c.accent}` }}
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
          Start with Git essentials if version control is new — everything else
          assumes it. Already fluent in git? Start with Understanding dbt, then use
          Your first PR as the practical capstone. Progress and certificates are saved
          in your browser.
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
          It is still SQL against Snowflake. What changes is the starting point:
          instead of rebuilding demographics, registers
          and lookups for every piece of work, you join models that already exist, are
          already tested, and refresh themselves every night. The setup is a one-off;
          the everyday loop — edit, build, PR — takes minutes.
        </p>
      </section>

      {/* handbook */}
      <section className="mx-auto mt-20 max-w-4xl">
        <h2 className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-faint">
          The handbook · reference for later
        </h2>
        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-soft">
          Longer-form reference pages on every topic the courses introduce — for when
          you need the full story on layers, sources, materialisations or snapshots,
          months after onboarding.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <Link
            href={`/learn/${LEARN[0].slug}`}
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Concepts
            </span>
            <span className="block text-sm text-ink-soft">
              Why dbt, layers, model design, naming, refs, tests, git & PRs — {LEARN.length} pages
            </span>
          </Link>
          <Link
            href={`/practice/${PRACTICE[0].slug}`}
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Working practice
            </span>
            <span className="block text-sm text-ink-soft">
              Setup, sources, models, building, PRs, changing models, git recovery
              — {PRACTICE.length} pages
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
              The dbt extension, macros, materialisations, clustering, snapshots,
              semantic views, Python — {ADVANCED.length} pages
            </span>
          </Link>
          <Link
            href="/reference"
            className="group rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-flame"
          >
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-flame-deep">
              Command reference
            </span>
            <span className="block text-sm text-ink-soft">
              Every dbt and git command, searchable and copy-paste ready
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
