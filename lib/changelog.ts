import { cacheLife, cacheTag } from "next/cache";
import {
  type ChangelogAuthor,
  type ChangelogItem,
  currentMonthKey,
  monthKey,
  toHandbookItem,
  toWarehouseItem,
} from "@/lib/changelog-parse";

export type { ChangelogItem } from "@/lib/changelog-parse";
export {
  currentMonthKey,
  monthKey,
  monthLabel,
} from "@/lib/changelog-parse";

export type ChangelogData = {
  items: ChangelogItem[];
  error?: "missing_token" | "github";
};

export type ChangelogMonth = { month: string; items: ChangelogItem[]; error?: "github" };
export type HandbookData = { items: ChangelogItem[]; error?: "github" };

const OWNER = "wnl-icb-analytics";
const ANALYTICS_REPO = "dbt-analytics";
const ONBOARDING_REPO = "dbt-onboarding";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const HISTORY_START = "2025-08";
const COMMIT_PAGES = 8;
// merges expire this tag through /api/revalidate
const TAG = "changelog";

type GraphQlPullRequest = {
  number: number;
  title: string;
  body: string | null;
  url: string;
  mergedAt: string | null;
  author: { login: string; name?: string | null } | null;
  labels: { nodes: { name: string }[] };
  files?: { nodes: { path: string }[] };
};

type GraphQlCommit = {
  oid: string;
  message: string;
  committedDate: string;
  url: string;
  author: { name: string | null; user: { login: string; name: string | null } | null } | null;
};

export function hasChangelogToken(): boolean {
  return Boolean(githubToken());
}

/** Month keys from HISTORY_START to the current London month, newest first. */
export async function getChangelogMonths(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG);
  const end = currentMonthKey();
  const months: string[] = [];
  let [year, month] = HISTORY_START.split("-").map(Number);
  for (;;) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    months.push(key);
    if (key >= end) break;
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return months.reverse();
}

/**
 * One month of warehouse changes. The remote cache is shared by every server
 * instance, so GitHub is queried once per refresh rather than once per request.
 */
export async function getChangelogMonth(month: string): Promise<ChangelogMonth> {
  "use cache: remote";
  cacheTag(TAG);
  try {
    const result = await loadMonth(month);
    // past months only change when a PR is relabelled; merges expire the tag anyway
    if (month === currentMonthKey()) cacheLife("hours");
    else cacheLife("days");
    return result;
  } catch (error) {
    console.error(`Changelog GitHub fetch failed for ${month}`, error);
    // retry within minutes rather than keep the failure for hours
    cacheLife("minutes");
    return { month, items: [], error: "github" };
  }
}

/** Handbook commits, from the same shared cache. */
export async function getHandbookItems(): Promise<HandbookData> {
  "use cache: remote";
  cacheTag(TAG);
  try {
    const items = await loadHandbook();
    cacheLife("hours");
    return { items };
  } catch (error) {
    console.error("Changelog handbook fetch failed", error);
    cacheLife("minutes");
    return { items: [], error: "github" };
  }
}

/** Every month plus handbook updates, for the RSS feed. Shares the per-month caches. */
export async function getChangelog(): Promise<ChangelogData> {
  if (!githubToken()) {
    return { items: [], error: "missing_token" };
  }
  const months = await getChangelogMonths();
  const [monthData, handbook] = await Promise.all([
    Promise.all(months.map(getChangelogMonth)),
    getHandbookItems(),
  ]);
  if (monthData.every((entry) => entry.error)) {
    return { items: [], error: "github" };
  }
  const items = [...monthData.flatMap((entry) => entry.items), ...handbook.items].sort(newestFirst);
  return { items };
}

async function loadMonth(month: string): Promise<ChangelogMonth> {
  const token = requireToken();
  const pullRequests = await fetchMergedRange(token, searchRange(month));
  const items = pullRequests
    .map((pr) =>
      toWarehouseItem({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        url: pr.url,
        mergedAt: pr.mergedAt ?? "",
        labels: pr.labels.nodes.map((label) => label.name),
        paths: pr.files?.nodes.map((file) => file.path) ?? [],
        author: pr.author
          ? { login: pr.author.login, name: pr.author.name ?? undefined }
          : undefined,
      }),
    )
    .filter((item): item is ChangelogItem => item !== null)
    .filter((item) => monthKey(item.mergedAt) === month)
    .sort(newestFirst);
  return { month, items };
}

async function loadHandbook(): Promise<ChangelogItem[]> {
  const commits = await fetchHandbookCommits(requireToken());
  return commits
    .map((commit) =>
      toHandbookItem({
        oid: commit.oid,
        message: commit.message,
        committedDate: commit.committedDate,
        url: commit.url,
        author: commitAuthor(commit),
      }),
    )
    .filter((item): item is ChangelogItem => item !== null)
    .sort(newestFirst);
}

function commitAuthor(commit: GraphQlCommit): ChangelogAuthor | undefined {
  if (!commit.author) return undefined;
  // prefer the GitHub profile name; git author names vary between machines
  return {
    login: commit.author.user?.login,
    name: commit.author.user?.name ?? commit.author.name ?? undefined,
  };
}

// GitHub search dates are UTC; start a day early so the first London hour of the month is caught.
function searchRange(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 0));
  const end = new Date(Date.UTC(year, m, 0));
  return `${start.toISOString().slice(0, 10)}..${end.toISOString().slice(0, 10)}`;
}

function newestFirst(a: ChangelogItem, b: ChangelogItem): number {
  return b.mergedAt.localeCompare(a.mergedAt);
}

function githubToken(): string | undefined {
  return process.env.GITHUB_CHANGELOG_TOKEN || process.env.GITHUB_TOKEN;
}

function requireToken(): string {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_CHANGELOG_TOKEN is not set");
  return token;
}

type SearchResponse = {
  search: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<GraphQlPullRequest | null>;
  };
};

type CommitConnection = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: GraphQlCommit[];
};

async function fetchMergedRange(token: string, range: string): Promise<GraphQlPullRequest[]> {
  const nodes: GraphQlPullRequest[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 5; page += 1) {
    const data: SearchResponse = await githubGraphql(token, SEARCH_PULL_REQUESTS_QUERY, {
      query: `repo:${OWNER}/${ANALYTICS_REPO} is:pr is:merged merged:${range}`,
      cursor,
    });
    for (const node of data.search.nodes) {
      if (node?.number) nodes.push(node);
    }
    if (!data.search.pageInfo.hasNextPage) break;
    cursor = data.search.pageInfo.endCursor;
  }
  return nodes;
}

async function fetchHandbookCommits(token: string): Promise<GraphQlCommit[]> {
  const nodes: GraphQlCommit[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < COMMIT_PAGES; page += 1) {
    const data: {
      repository: { defaultBranchRef: { target: { history: CommitConnection } } };
    } = await githubGraphql(token, HANDBOOK_COMMITS_QUERY, { cursor });
    nodes.push(...data.repository.defaultBranchRef.target.history.nodes);
    if (!data.repository.defaultBranchRef.target.history.pageInfo.hasNextPage) {
      break;
    }
    cursor = data.repository.defaultBranchRef.target.history.pageInfo.endCursor;
  }
  return nodes;
}

const SEARCH_PULL_REQUESTS_QUERY = `query ChangelogSearch($query: String!, $cursor: String) {
  search(query: $query, type: ISSUE, first: 100, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number
        title
        body
        url
        mergedAt
        author { login ... on User { name } }
        labels(first: 10) { nodes { name } }
        files(first: 80) { nodes { path } }
      }
    }
  }
}`;

const HANDBOOK_COMMITS_QUERY = `query HandbookCommits($cursor: String) {
  repository(owner: "${OWNER}", name: "${ONBOARDING_REPO}") {
    defaultBranchRef {
      target {
        ... on Commit {
          history(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes { oid message committedDate url author { name user { login name } } }
          }
        }
      }
    }
  }
}`;

async function githubGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "wnl-icb-analytics/dbt-onboarding",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub GraphQL HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.map((error) => error.message).join("; ") || "GitHub GraphQL error");
  }
  return payload.data;
}
