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

