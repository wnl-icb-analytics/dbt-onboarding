export type NavItem = {
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
};

export const LEARN: NavItem[] = [
  {
    slug: "why-dbt",
    title: "Why dbt?",
    blurb: "From SQL scripts in folders to a tested, versioned pipeline",
    minutes: 8,
  },
  {
    slug: "analysts-and-dbt",
    title: "Analysts and dbt",
    blurb: "Engineering practices, analytical authority and the hats people wear",
    minutes: 10,
  },
  {
    slug: "the-data",
    title: "The data we model",
    blurb: "The datasets, the person spine, legal bases and the core models built from them",
    minutes: 11,
  },
  {
    slug: "data-layers",
    title: "Data layers",
    blurb: "Where source cleaning, domain logic, marts and data products belong",
    minutes: 16,
  },
  {
    slug: "refs-and-sources",
    title: "The DAG",
    blurb: "How source() and ref() resolve, and how they form the dependency graph",
    minutes: 7,
  },
  {
    slug: "model-naming",
    title: "The model taxonomy",
    blurb: "Read any model name and use its family to navigate the project",
    minutes: 7,
  },
  {
    slug: "finding-models",
    title: "Finding models",
    blurb: "Discover and reuse the project's accumulated domain knowledge",
    minutes: 12,
  },
  {
    slug: "planning-a-change",
    title: "Planning a change",
    blurb: "Turn a request into an agreed, testable change before writing SQL",
    minutes: 11,
  },
  {
    slug: "model-design",
    title: "Designing models",
    blurb: "Define concepts independently, then compose useful analytical models",
    minutes: 30,
  },
  {
    slug: "tests-and-docs",
    title: "Tests & documentation",
    blurb: "Make model contracts visible, testable and safe to reuse",
    minutes: 18,
  },
  {
    slug: "git-and-prs",
    title: "Git & pull requests",
    blurb: "Turn analytical changes into reviewable, tested team decisions",
    minutes: 17,
  },
  {
    slug: "merge-to-production",
    title: "From merge to production",
    blurb: "Targets, validation, deploys and the scheduled builds that keep models fresh",
    minutes: 11,
  },
  {
    slug: "observing-production",
    title: "Observing production",
    blurb: "Use Elementary run history to understand health, failures and impact",
    minutes: 13,
  },
];

export const PRACTICE: NavItem[] = [
  {
    slug: "setup",
    title: "Set up your development environment",
    blurb: "Prerequisites, setup commands and connection checks",
    minutes: 10,
  },
  {
    slug: "find-a-source",
    title: "Find your source",
    blurb: "Find the raw model or choose the right source route",
    minutes: 12,
  },
  {
    slug: "first-model",
    title: "Write a staging model",
    blurb: "The staging contract, template and quick checks",
    minutes: 7,
  },
  {
    slug: "yaml-and-tests",
    title: "Add the YAML",
    blurb: "Generate the file, then add the decisions that matter",
    minutes: 8,
  },
  {
    slug: "build-and-test",
    title: "Build & test locally",
    blurb: "Daily selectors and a failure triage guide",
    minutes: 8,
  },
  {
    slug: "open-a-pr",
    title: "Open your pull request",
    blurb: "The command sequence, PR template and CI recovery",
    minutes: 7,
  },
  {
    slug: "review-and-merge",
    title: "Review & merge",
    blurb: "Update the PR, merge, and sync your local checkout",
    minutes: 4,
  },
  {
    slug: "change-a-model",
    title: "Change an existing model",
    blurb: "Check the blast radius, classify the change, ship it safely",
    minutes: 8,
  },
  {
    slug: "undoing-changes",
    title: "Undoing things in git",
    blurb: "Wrong branch, unwanted commits, conflicts — what happened, and the way back",
    minutes: 14,
  },
];

export const ADVANCED: NavItem[] = [
  {
    slug: "dbt-extension",
    title: "The dbt extension",
    blurb: "Live error detection, rename-a-column-everywhere, lineage in the editor",
    minutes: 8,
  },
  {
    slug: "macros",
    title: "Macros",
    blurb: "Reusable SQL — define cleaning logic once, use it everywhere",
    minutes: 7,
  },
  {
    slug: "materialisations",
    title: "Materialisations",
    blurb: "Views, tables, incremental models and Snowflake dynamic tables",
    minutes: 11,
  },
  {
    slug: "clustering",
    title: "Clustering",
    blurb: "Choosing keys for how data is filtered and joined downstream",
    minutes: 7,
  },
  {
    slug: "project-config",
    title: "Project configuration",
    blurb: "dbt_project.yml — where the defaults you've been relying on live",
    minutes: 9,
  },
  {
    slug: "snapshots",
    title: "Snapshots",
    blurb: "Capturing history when the source only keeps the present",
    minutes: 9,
  },
  {
    slug: "semantic-views",
    title: "Semantic views",
    blurb: "Declared keys, joins and metrics — so query tools stop guessing",
    minutes: 8,
  },
  {
    slug: "python-models",
    title: "Python models",
    blurb: "Python in the DAG, for the work SQL is bad at",
    minutes: 8,
  },
];

export type Section = "learn" | "practice" | "advanced";

const SECTIONS: { id: Section; list: NavItem[] }[] = [
  { id: "learn", list: LEARN },
  { id: "practice", list: PRACTICE },
  { id: "advanced", list: ADVANCED },
];

/** prev/next across the journey: learn → practice → going further → reference */
export function pager(section: Section, slug: string) {
  const flat = SECTIONS.flatMap((s) =>
    s.list.map((item) => ({ href: `/${s.id}/${item.slug}`, title: item.title })),
  );
  const i = flat.findIndex((f) => f.href === `/${section}/${slug}`);
  const prev = i > 0 ? flat[i - 1] : null;
  const next =
    i < flat.length - 1
      ? flat[i + 1]
      : { href: "/reference", title: "Command reference" };
  return { prev, next };
}
