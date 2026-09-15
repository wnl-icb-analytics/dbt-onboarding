/** Static dbt docs v2 site built from dbt-analytics main by its dbt-docs workflow. */
export const DBT_DOCS_ORIGIN = (
  process.env.DBT_DOCS_ORIGIN ?? "https://wnl-icb-analytics.github.io/dbt-analytics"
).replace(/\/$/, "");

export const DBT_PROJECT = "wnl_analytics";

/** Framed entry point. index.html, not the directory, so relative asset paths resolve under /dbt-docs/. */
export const DBT_DOCS_ENTRY = "/dbt-docs/index.html";

export function modelDocsRoute(model: string): string {
  const id = model.includes(".") ? model : `model.${DBT_PROJECT}.${model}`;
  return `/details/${encodeURIComponent(id)}/`;
}

export function modelDocsHref(model: string): string {
  return `/models?path=${encodeURIComponent(modelDocsRoute(model))}`;
}

export type DocsBuild = { available: boolean; generatedAt?: string; dbtVersion?: string };

/** Reads build metadata from the published index.html; refreshed every 10 minutes. */
export async function getDocsBuild(): Promise<DocsBuild> {
  try {
    const response = await fetch(`${DBT_DOCS_ORIGIN}/index.html`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { available: false };
    const html = await response.text();
    const generatedAt = html.match(/"generated_at":"([^"]+)"/)?.[1];
    const dbtVersion = html.match(/"dbt_version":"([^"]+)"/)?.[1];
    return { available: html.includes("__DBT_DOCS__"), generatedAt, dbtVersion };
  } catch {
    return { available: false };
  }
}
