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
    blurb: "How a SQL query becomes a shared, repeatable model",
    minutes: 8,
  },
  {
    slug: "analysts-and-dbt",
    title: "Analysts and dbt",
    blurb: "How you contribute safely, and who to ask about a decision",
    minutes: 10,
  },
  {
    slug: "git-and-prs",
    title: "Git & pull requests",
    blurb: "Why Git makes shared work possible, and the loop each change follows",
    minutes: 14,
  },
  {
    slug: "the-data",
    title: "The data we model",
    blurb: "Source families, people, identifiers and the limits of linkage",
    minutes: 10,
  },
  {
    slug: "analytical-tables",
    title: "Understanding analytical tables",
    blurb: "What a row means, and how keys, joins and nulls change it",
    minutes: 18,
  },
  {
    slug: "refs-and-sources",
    title: "How models depend on each other",
    blurb: "References, sources and the dependency graph",
    minutes: 7,
  },
  {
    slug: "data-layers",
    title: "Data layers",
    blurb: "Where source preparation, shared definitions and products belong",
    minutes: 24,
  },
  {
    slug: "model-naming",
    title: "Reading model names",
    blurb: "Use prefixes, subjects and suffixes to interpret a model",
    minutes: 7,
  },
  {
    slug: "finding-models",
    title: "Finding and reusing models",
    blurb:
      "Follow a question through candidate models, evidence and a decision",
    minutes: 12,
  },
  {
    slug: "model-design",
    title: "Designing models",
    blurb:
      "Decide which model owns each definition, and what it promises",
    minutes: 30,
  },
  {
    slug: "tests-and-docs",
    title: "Tests & documentation",
    blurb: "Write model promises and choose tests that can disprove them",
    minutes: 18,
  },
  {
    slug: "building-and-checking",
    title: "Building and checking a change",
    blurb: "Run the right commands and reconcile the analytical result",
    minutes: 13,
  },
  {
    slug: "merge-to-production",
    title: "From merge to production",
    blurb:
      "What happens after you merge, and how to check it worked",
    minutes: 15,
  },
  {
    slug: "observing-production",
    title: "Observing production",
    blurb: "Investigate a failure, judge its impact and confirm the fix",
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
    blurb: "Check what depends on it, then ship the change safely",
    minutes: 8,
  },
  {
    slug: "undoing-changes",
    title: "Undoing things in git",
    blurb:
      "Wrong branch, unwanted commits or conflicts, and the way back",
    minutes: 14,
  },
];

export const ADVANCED: NavItem[] = [
  {
    slug: "git-in-depth",
    title: "Git in more depth",
    blurb: "Commits, branches and origin/main, sizing a change, review and history",
    minutes: 12,
  },
  {
    slug: "dbt-extension",
    title: "The dbt extension",
    blurb:
      "Errors as you type, project-wide renames and lineage in the editor",
    minutes: 8,
  },
  {
    slug: "macros",
    title: "Macros",
    blurb: "Write cleaning logic once and reuse it across models",
    minutes: 6,
  },
  {
    slug: "materialisations",
    title: "Materialisations",
    blurb: "Views, tables, incremental models and Snowflake dynamic tables",
    minutes: 12,
  },
  {
    slug: "clustering",
    title: "Clustering",
    blurb: "Choosing keys for how data is filtered and joined downstream",
    minutes: 14,
  },
  {
    slug: "project-config",
    title: "Project configuration",
    blurb: "The dbt_project.yml file, where the defaults you rely on are set",
    minutes: 8,
  },
  {
    slug: "snapshots",
    title: "Snapshots",
    blurb: "Capturing history when the source only keeps the present",
    minutes: 16,
  },
  {
    slug: "semantic-views",
    title: "Semantic views",
    blurb: "Declare keys, joins and metrics so query tools stop guessing",
    minutes: 10,
  },
  {
    slug: "python-models",
    title: "Python models",
    blurb: "Python in the DAG, for work SQL handles badly",
    minutes: 8,
  },
];

export type Section = "learn" | "practice" | "advanced";

const SECTIONS: { id: Section; list: NavItem[] }[] = [
  { id: "learn", list: LEARN },
  { id: "practice", list: PRACTICE },
  { id: "advanced", list: ADVANCED },
];

/** prev/next across the guide: learn, walkthroughs, going further, then reference */
export function pager(section: Section, slug: string) {
  const flat = SECTIONS.flatMap((s) =>
    s.list.map((item) => ({
      href: `/${s.id}/${item.slug}`,
      title: item.title,
    })),
  );
  const i = flat.findIndex((f) => f.href === `/${section}/${slug}`);
  const prev = i > 0 ? flat[i - 1] : null;
  const next =
    i < flat.length - 1
      ? flat[i + 1]
      : { href: "/reference", title: "Command reference" };
  return { prev, next };
}
