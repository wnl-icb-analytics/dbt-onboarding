import type { Metadata } from "next";
import Link from "next/link";
import { LEARN } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Handbook learning paths" };

const PATHS = [
  {
    title: "I am new to dbt",
    body: "Read the handbook at your own pace, or use the guided course for shorter interactive lessons. You do not need to complete both.",
    links: [
      ["Start with Why dbt?", "/learn/why-dbt"],
      ["Or take Understanding dbt", "/courses/understanding-dbt"],
    ],
  },
  {
    title: "I need to answer a new question",
    body: "Begin with the request, discover what the project already knows, then design and test the missing change.",
    links: [
      ["Find and reuse models", "/learn/finding-models"],
      ["Design the change", "/learn/model-design"],
    ],
  },
  {
    title: "I need to make a safe PR",
    body: "Use the practical route for setup, local builds, evidence, review and changing models that already have consumers.",
    links: [
      ["Take Your first PR", "/courses/first-pr"],
      ["Change an existing model", "/practice/change-a-model"],
    ],
  },
  {
    title: "I am responsible for production",
    body: "Understand the project workflows, then use the shared run history to investigate health, impact and recovery.",
    links: [
      ["Follow merge to production", "/learn/merge-to-production"],
      ["Observe production", "/learn/observing-production"],
    ],
  },
];

export default function LearnIndex() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-9 border-b-2 border-ink pb-7">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-flame">
          Handbook
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Choose the route you need
        </h1>
        <p className="mt-3 max-w-[66ch] text-lg leading-relaxed text-ink-soft">
          This handbook explains how and why the project works. It assumes you
          have written SQL, but not that you know dbt, Git or dimensional
          modelling. You can read the examples without installing anything. The
          field guides provide the steps when you are ready to work in the
          project.
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
          The complete learning sequence
        </h2>
        <p className="mt-2 max-w-[66ch] text-ink-soft">
          Read in order for the full explanation. Take a break after the
          foundations, after model design, or after local validation. Times
          allow for reading and examples; hands-on practice and revisiting
          unfamiliar ideas take longer.
        </p>
        <p className="mt-3 max-w-[66ch] text-ink-soft">
          Begin with purpose, data and analytical tables. Then follow
          dependencies, layers, discovery and design. Finish with testing, local
          validation, review and production. Use the{" "}
          <Link href="/reference/datasets">dataset directory</Link> and{" "}
          <Link href="/reference/operations">production reference</Link> for
          details you need to look up rather than remember.
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
