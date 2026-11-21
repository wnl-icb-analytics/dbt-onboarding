import type { Metadata } from "next";
import Link from "next/link";
import { LEARN } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Guide learning paths" };

const PATHS = [
  {
    title: "I'm new to dbt",
    body: "Read the guide at your own pace, or take the interactive course if you prefer shorter lessons. You don't need to do both.",
    links: [
      ["Start with Why dbt?", "/learn/why-dbt"],
      ["Or take Understanding dbt", "/courses/understanding-dbt"],
    ],
  },
  {
    title: "I need to answer a new question",
    body: "Start from the request, find out what the project already has, then design and test the piece that's missing.",
    links: [
      ["Find and reuse models", "/learn/finding-models"],
      ["Design the change", "/learn/model-design"],
    ],
  },
  {
    title: "I need to get a change reviewed",
    body: "The hands-on route covers setup, local builds, evidence and review, plus changing a model that people already use.",
    links: [
      ["Take Your first PR", "/courses/first-pr"],
      ["Change an existing model", "/practice/change-a-model"],
    ],
  },
  {
    title: "I'm responsible for production",
    body: "Learn what the workflows do after a merge, then use the shared run history to investigate failures, impact and recovery.",
    links: [
      ["Follow a change to production", "/learn/merge-to-production"],
      ["Observe production", "/learn/observing-production"],
    ],
  },
];

export default function LearnIndex() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-9 border-b border-line pb-7">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-flame">
          Guide
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Choose the route you need
        </h1>
        <p className="mt-3 max-w-[66ch] text-lg leading-relaxed text-ink-soft">
          This guide explains how our team uses dbt to build NHS data into
          tables for analysis, and why the project is organised the way it is.
          It&apos;s for people who know SQL but are new to dbt, Git or
          dimensional modelling. You can read every example without installing
          anything. When you&apos;re ready to work in the project, the
          walkthroughs give you the steps.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {PATHS.map((path) => (
          <div
            key={path.title}
            className="rounded-2xl border-2 border-line bg-paper p-5"
          >
            <h2 className="!my-0 font-display text-xl font-extrabold tracking-tight text-ink">
              {path.title}
            </h2>
            <p className="!mb-3 !mt-2 text-sm leading-relaxed text-ink-soft">
              {path.body}
            </p>
            <ul className="!my-0 flex list-none flex-col gap-1 !pl-0">
              {path.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-display text-sm font-bold text-flame-deep hover:underline"
                  >
                    {label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          The guide in order
        </h2>
        <p className="mt-2 max-w-[66ch] text-ink-soft">
          Each chapter builds on the ones before it. Good places to pause are
          after the foundations, after model design, and after local
          validation. The times cover reading and the examples. Practising, or
          going back over an unfamiliar idea, takes longer.
        </p>
        <p className="mt-3 max-w-[66ch] text-ink-soft">
          The early chapters cover why dbt exists, the data we model and how
          analytical tables behave. The middle ones cover dependencies, layers,
          finding models and design. The last ones take a change through
          testing, local checks, review and production. For details you&apos;ll
          look up, not memorise, use the{" "}
          <Link href="/reference/datasets">dataset directory</Link> and the{" "}
          <Link href="/reference/operations">production reference</Link>.
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {LEARN.map((item, index) => (
            <li key={item.slug} className="list-none">
              <Link
                href={`/learn/${item.slug}`}
                className="group flex h-full gap-3 rounded-xl border border-line bg-paper px-4 py-3 transition hover:border-flame"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line font-mono text-[11px] text-ink-faint group-hover:border-flame group-hover:text-flame-deep">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-ink group-hover:text-flame-deep">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                    {item.blurb} · ~{item.minutes} min
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
