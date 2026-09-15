import { cacheLife } from "next/cache";
import { DBT_DOCS_ORIGIN } from "@/lib/dbt-docs";

export type DocsBuild = { available: boolean; generatedAt?: string; dbtVersion?: string };

/** Build metadata from the published index.html. Server-only, unlike lib/dbt-docs. */
export async function getDocsBuild(): Promise<DocsBuild> {
  "use cache: remote";
  try {
    const response = await fetch(`${DBT_DOCS_ORIGIN}/index.html`, {
      signal: AbortSignal.timeout(8000),
    });
    const html = response.ok ? await response.text() : "";
    const available = html.includes("__DBT_DOCS__");
    // docs rebuild on each merge to main; check every 10 minutes, or every minute until published
    if (available) cacheLife({ revalidate: 600, expire: 86400 });
    else cacheLife("minutes");
    return {
      available,
      generatedAt: html.match(/"generated_at":"([^"]+)"/)?.[1],
      dbtVersion: html.match(/"dbt_version":"([^"]+)"/)?.[1],
    };
  } catch {
    cacheLife("minutes");
    return { available: false };
  }
}
