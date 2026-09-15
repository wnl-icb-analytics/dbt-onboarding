import { unstable_cache } from "next/cache";
import {
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
  weekKey,
  weekLabel,
} from "@/lib/changelog-parse";

export type ChangelogData = {
  generatedAt: string;
  items: ChangelogItem[];
  error?: "missing_token" | "github";
};

const OWNER = "wnl-icb-analytics";
const ANALYTICS_REPO = "dbt-analytics";
const ONBOARDING_REPO = "dbt-onboarding";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const HISTORY_START = "2025-08-01";
const COMMIT_PAGES = 8;
const RANGE_CONCURRENCY = 14;

type GraphQlPullRequest = {
  number: number;
  title: string;
  body: string | null;
  url: string;
  mergedAt: string | null;
  labels: { nodes: { name: string }[] };
  files?: { nodes: { path: string }[] };
};

type GraphQlCommit = {
  oid: string;
  message: string;
  committedDate: string;
  url: string;
};

export async function getChangelog(): Promise<ChangelogData> {
  if (!githubToken()) {
    return {
      generatedAt: new Date().toISOString(),
      items: [],
      error: "missing_token",
    };
  }
  try {
    return await getCachedChangelog();
  } catch (error) {
    console.error("Changelog GitHub fetch failed", error);
    return {
      generatedAt: new Date().toISOString(),
      items: [],
      error: "github",
    };
  }
}

const getCachedChangelog = unstable_cache(loadChangelog, ["changelog"], {
  revalidate: 86400,
  tags: ["changelog"],
});

async function loadChangelog(): Promise<ChangelogData> {
  const token = githubToken();
  if (!token) {
    throw new Error("GITHUB_CHANGELOG_TOKEN is not set");
  }
  const [pullRequests, commits] = await Promise.all([
    fetchMergedPullRequests(token),
    fetchHandbookCommits(token),
  ]);
  const items = [
    ...pullRequests
      .map((pr) =>
        toWarehouseItem({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          url: pr.url,
          mergedAt: pr.mergedAt ?? "",
          labels: pr.labels.nodes.map((label) => label.name),
          paths: pr.files?.nodes.map((file) => file.path) ?? [],
        }),
      )
      .filter((item): item is ChangelogItem => item !== null),
    ...commits
      .map((commit) =>
        toHandbookItem({
          oid: commit.oid,
          message: commit.message,
          committedDate: commit.committedDate,
          url: commit.url,
        }),
      )
      .filter((item): item is ChangelogItem => item !== null),
  ].sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));

  return { generatedAt: new Date().toISOString(), items };
}

export function monthsFrom(items: ChangelogItem[]): string[] {
  return [...new Set(items.map((item) => monthKey(item.mergedAt)))].sort(
    (a, b) => b.localeCompare(a),
  );
}

export function latestMonth(items: ChangelogItem[]): string {
  return monthsFrom(items)[0] ?? currentMonthKey();
}

export function itemsInMonth(items: ChangelogItem[], month: string): ChangelogItem[] {
  return items.filter((item) => monthKey(item.mergedAt) === month);
}

function githubToken(): string | undefined {
  return process.env.GITHUB_CHANGELOG_TOKEN || process.env.GITHUB_TOKEN;
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

async function fetchMergedPullRequests(token: string): Promise<GraphQlPullRequest[]> {
  const ranges = mergedRanges();
  const nodes: GraphQlPullRequest[] = [];
  for (const batch of chunk(ranges, RANGE_CONCURRENCY)) {
    const pages = await Promise.all(batch.map((range) => fetchMergedRange(token, range)));
    nodes.push(...pages.flat());
  }
  return nodes;
}

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

function mergedRanges(now = new Date()): string[] {
  const ranges: string[] = [];
  const [startYear, startMonth] = HISTORY_START.split("-").map(Number);
  let year = startYear;
  let month = startMonth;
  const endYear = now.getUTCFullYear();
  const endMonth = now.getUTCMonth() + 1;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const mm = String(month).padStart(2, "0");
    ranges.push(`${year}-${mm}-01..${year}-${mm}-${String(lastDay).padStart(2, "0")}`);
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return ranges;
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
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
            nodes { oid message committedDate url }
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
    cache: "no-store",
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
