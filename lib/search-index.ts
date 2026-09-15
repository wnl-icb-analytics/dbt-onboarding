import { ADVANCED, LEARN, PRACTICE } from "@/lib/curriculum";

export type SearchHit = {
  href: string;
  title: string;
  group: string;
  blurb: string;
};

// kept literal: lib/courses pulls lesson content into the client bundle
const COURSES: SearchHit[] = [
  {
    href: "/courses/git-essentials",
    title: "Git essentials",
    group: "Course",
    blurb: "Version control from zero",
  },
  {
    href: "/courses/understanding-dbt",
    title: "Understanding dbt",
    group: "Course",
    blurb: "What dbt is, in pictures, before you run it",
  },
  {
    href: "/courses/first-pr",
    title: "Your first PR",
    group: "Course",
    blurb: "From a blank machine to a merged staging model",
  },
];

const REFERENCE: SearchHit[] = [
  {
    href: "/models",
    title: "Model docs",
    group: "Models",
    blurb: "Every model, source, column and test, with lineage",
  },
  {
    href: "/changelog",
    title: "Changelog",
    group: "Changelog",
    blurb: "Warehouse pull requests that reached production",
  },
  {
    href: "/reference",
    title: "Command reference",
    group: "Reference",
    blurb: "dbt and git commands, searchable and copy-paste ready",
  },
  {
    href: "/reference/datasets",
    title: "Dataset directory",
    group: "Reference",
    blurb: "Source families and analyst-facing models",
  },
  {
    href: "/reference/operations",
    title: "Production reference",
    group: "Reference",
    blurb: "Schedules, workflows and how production runs",
  },
];

function pages(
  items: { slug: string; title: string; blurb: string }[],
  base: string,
  group: string,
): SearchHit[] {
  return items.map((item) => ({
    href: `/${base}/${item.slug}`,
    title: item.title,
    group,
    blurb: item.blurb,
  }));
}

export const SEARCH_PAGES: SearchHit[] = [
  ...pages(LEARN, "learn", "Learn"),
  ...pages(PRACTICE, "practice", "Field guide"),
  ...pages(ADVANCED, "advanced", "Going further"),
  ...COURSES,
  ...REFERENCE,
];

export function searchPages(query: string): SearchHit[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [...REFERENCE.slice(0, 2), ...SEARCH_PAGES.slice(0, 6)];
  return SEARCH_PAGES.filter((hit) => {
    const haystack = `${hit.title} ${hit.blurb} ${hit.href} ${hit.group}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  }).slice(0, 10);
}
