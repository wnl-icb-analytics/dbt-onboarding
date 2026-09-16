export const CHANGELOG_TYPES = [
  "feat",
  "fix",
  "perf",
  "chore",
  "ci",
  "test",
  "refactor",
  "docs",
  "other",
] as const;

export type ChangelogType = (typeof CHANGELOG_TYPES)[number];
export type ChangelogSource = "warehouse" | "handbook";

export type ChangelogItem = {
  id: string;
  source: ChangelogSource;
  number?: number;
  summary: string;
  type: ChangelogType;
  typeLabel: string;
  domains: string[];
  domainLabels: string[];
  breaking: boolean;
  hidden: boolean;
  mergedAt: string;
  url: string;
  models: string[];
  author?: ChangelogAuthor;
};

export type ChangelogAuthor = { login?: string; name?: string };

const TITLE_RE =
  /^(feat|fix|perf|chore|ci|test|refactor|docs)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;
const BRANCH_TITLE_RE = /^(feat|fix|perf|chore|ci|test|refactor|docs)\/(.+)$/i;

export const TYPE_LABELS: Record<ChangelogType, string> = {
  feat: "Added",
  fix: "Fixed",
  perf: "Performance",
  chore: "Internal",
  ci: "Internal",
  test: "Internal",
  refactor: "Internal",
  docs: "Internal",
  other: "Other",
};

/** Specific labels for internal types when the Internal toggle shows them. */
export const INTERNAL_LABELS: Partial<Record<ChangelogType, string>> = {
  chore: "Maintenance",
  ci: "CI",
  test: "Tests",
  refactor: "Refactor",
  docs: "Docs",
};

const VISIBLE_TYPES = new Set<ChangelogType>(["feat", "fix", "perf", "other"]);

/** Handbook commits readers would notice; chores, CI and refactors stay out. */
export const HANDBOOK_LABELS: Partial<Record<ChangelogType, string>> = {
  docs: "Content",
  feat: "Added",
  fix: "Fixed",
};

/** The label shown on an entry's badge and in copied summaries. */
export function entryTypeLabel(item: ChangelogItem): string {
  if (item.source === "handbook") return HANDBOOK_LABELS[item.type] ?? "Content";
  if (item.breaking) return "Breaking";
  if (item.hidden) return INTERNAL_LABELS[item.type] ?? TYPE_LABELS[item.type];
  return TYPE_LABELS[item.type] ?? item.typeLabel;
}

export function authorName(item: ChangelogItem): string | undefined {
  return item.author?.name || item.author?.login;
}

const DOMAIN_LABELS: Record<string, string> = {
  olids: "GP data (OLIDS)",
  sus: "Hospital activity (SUS)",
  uec: "Urgent and emergency care",
  mhsds: "Mental health (MHSDS)",
  ers: "e-Referral Service",
  csds: "Community services (CSDS)",
  reference: "Reference data",
  semantic: "Semantic layer",
  "ltc-lcs": "Core20plus (LTC LCS)",
  sources: "Sources",
  "data-quality": "Data quality",
  "covid-flu": "COVID and flu",
  qof: "QOF",
  cltcs: "Community and long-term conditions",
  myria: "Myria",
  partner: "Partner data",
  population: "Population",
  "waiting-lists": "Waiting lists",
  slam: "SLAM",
  "resource-index": "Resource index",
  "gp-costs": "GP costs",
  organisation: "Organisation",
  demographics: "Demographics",
  sdl: "Shared data layer",
  medications: "Medications",
  "direct-care": "Direct care",
  published: "Published products",
  efi2: "Frailty (EFI2)",
  deaths: "Deaths",
  staging: "Staging",
  nice: "NICE indicators",
  "adult-social-care": "Adult social care",
  prescribing: "Prescribing",
  handbook: "Handbook",
  ci: "CI",
  fusion: "dbt Fusion",
};

const PATH_DOMAIN: Record<string, string> = {
  olids: "olids",
  sus: "sus",
  uec: "uec",
  mhsds: "mhsds",
  mental_health: "mhsds",
  mhcorl: "mhsds",
  csds: "csds",
  community: "csds",
  ers: "ers",
  reference: "reference",
  terminology: "reference",
  data_dictionary: "reference",
  semantic: "semantic",
  cltcs: "cltcs",
  myria: "myria",
  slam: "slam",
  sdl: "sdl",
  wl: "waiting-lists",
  waiting_lists: "waiting-lists",
  partner: "partner",
  direct_care: "direct-care",
  secondary_use: "published",
  qof: "qof",
  nice: "nice",
  population: "population",
  adult_social_care: "adult-social-care",
  asc_cld: "adult-social-care",
  epd: "prescribing",
  ltc_lcs: "ltc-lcs",
  "ltc-lcs": "ltc-lcs",
  covid: "covid-flu",
  flu: "covid-flu",
  data_quality: "data-quality",
};

const ANALYST_MODEL = /^models\/(reporting|published)\/.+\.sql$/;

export function normaliseScope(scope: string): string {
  return scope.trim().toLowerCase().replaceAll("_", "-");
}

export function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] ?? titleCase(domain.replaceAll("-", " "));
}

export function parseConventionalTitle(title: string): {
  type: ChangelogType;
  scope?: string;
  breaking: boolean;
  subject: string;
} {
  const cleaned = stripMarkers(title.replace(/\s*\(#\d+\)\s*$/, "").trim());
  const match = cleaned.match(TITLE_RE);
  if (!match) {
    // titles left as the branch name, e.g. "Feat/casting skpatientid"
    const branch = cleaned.match(BRANCH_TITLE_RE);
    if (branch) {
      return {
        type: branch[1].toLowerCase() as ChangelogType,
        breaking: false,
        subject: branch[2].replace(/[-_]+/g, " ").trim(),
      };
    }
    return { type: "other", breaking: false, subject: cleaned };
  }
  return {
    type: match[1].toLowerCase() as ChangelogType,
    scope: match[2] ? normaliseScope(match[2].split(",")[0]) : undefined,
    breaking: match[3] === "!",
    subject: stripMarkers(match[4].trim()),
  };
}

export function changelogOverride(body: string | null | undefined): string | undefined {
  if (!body) return undefined;
  const match = body.match(/^changelog:\s*(.+)$/im);
  const line = match?.[1]?.trim();
  return line ? stripMarkers(line) : undefined;
}

export function hasBreakingFooter(body: string | null | undefined): boolean {
  return Boolean(body && /^breaking change\b/im.test(body));
}

export function hasSkipChangelogLabel(labels: string[]): boolean {
  return labels.some((label) => label.toLowerCase().replaceAll(" ", "-") === "skip-changelog");
}

export function modelsFromPaths(paths: string[]): string[] {
  const names = new Set<string>();
  for (const path of paths) {
    if (!ANALYST_MODEL.test(path)) continue;
    const file = path.split("/").pop();
    if (!file) continue;
    names.add(file.replace(/\.sql$/i, ""));
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function domainsFromPaths(paths: string[]): string[] {
  const counts = new Map<string, number>();
  for (const path of paths) {
    for (const part of path.split("/")) {
      const domain = PATH_DOMAIN[part];
      if (!domain) continue;
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([domain]) => domain);
}

export function toWarehouseItem(pr: {
  number: number;
  title: string;
  body: string | null;
  url: string;
  mergedAt: string;
  labels: string[];
  paths: string[];
  author?: ChangelogAuthor;
}): ChangelogItem | null {
  if (hasSkipChangelogLabel(pr.labels) || !pr.mergedAt) return null;
  const parsed = parseConventionalTitle(pr.title);
  const summary = changelogOverride(pr.body) ?? parsed.subject;
  const breaking = parsed.breaking || hasBreakingFooter(pr.body);
  const type = parsed.type;
  const domains = resolveDomains(parsed.scope, pr.paths);
  const models = modelsFromPaths(pr.paths);
  return {
    id: `pr-${pr.number}`,
    source: "warehouse",
    number: pr.number,
    summary,
    type,
    typeLabel: TYPE_LABELS[type],
    domains,
    domainLabels: domains.map(domainLabel),
    breaking,
    hidden: !breaking && !VISIBLE_TYPES.has(type),
    mergedAt: pr.mergedAt,
    url: pr.url,
    models,
    author: pr.author,
  };
}

export function toHandbookItem(commit: {
  oid: string;
  message: string;
  committedDate: string;
  url: string;
  author?: ChangelogAuthor;
}): ChangelogItem | null {
  const headline = commit.message.split("\n")[0] ?? "";
  const parsed = parseConventionalTitle(headline);
  const typeLabel = HANDBOOK_LABELS[parsed.type];
  if (!typeLabel) return null;
  const summary = changelogOverride(commit.message) ?? parsed.subject;
  return {
    id: `sha-${commit.oid}`,
    source: "handbook",
    summary,
    type: parsed.type,
    typeLabel,
    domains: [],
    domainLabels: [],
    breaking: false,
    hidden: false,
    mergedAt: commit.committedDate,
    url: commit.url,
    models: [],
    author: commit.author,
  };
}

export function monthKey(iso: string): string {
  return londonDate(iso).slice(0, 7);
}

export function currentMonthKey(now = new Date()): string {
  return monthKey(now.toISOString());
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(Date.UTC(year, month - 1, 15)));
}

export function dayKey(iso: string): string {
  return londonDate(iso);
}

export function dayLabel(key: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseYmd(key));
}

export function dayParts(key: string): { weekday: string; date: string } {
  const date = parseYmd(key);
  return {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date),
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
  };
}

/** Capitalise the first character for display; the stored subject stays as parsed. */
export function capitaliseSummary(summary: string): string {
  if (!summary) return summary;
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}

function resolveDomains(scope: string | undefined, paths: string[]): string[] {
  const fromPaths = domainsFromPaths(paths);
  if (!scope) return fromPaths;
  return [scope, ...fromPaths.filter((domain) => domain !== scope)];
}

function stripMarkers(value: string): string {
  return value
    .replace(/\s*\[skip[- ]deploy\]/gi, "")
    .replace(/\s*\[skip[- ]changelog\]/gi, "")
    .trim();
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function londonDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function parseYmd(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12));
}
